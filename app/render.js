const main = document.getElementById("main");
const crypto = require("crypto");

const electron = require("electron").remote;
const ipcRender = require("electron").ipcRenderer;

const prompt = require("./prompt");

const currentWindow = electron.getCurrentWindow();

const tabs = require("./data");

const i18n = require("./i18n");

let currentLang = i18n.getLang(tabs.langId);

//#region Rendering functions
const reRenderButtons = () => {
  main.innerHTML = "";
  tabs.getButtonsFromTab().forEach((link) => {
    // Generate Background and text color
    const colors = getTextAndBackgroundColor(link);

    // Generate root element
    const rootEl = document.createElement("div");
    rootEl.classList.add("button-outer");

    // Generate inner button element
    const buttonEl = document.createElement("button");
    buttonEl.classList.add("button-inner");
    // Set innerText to rewritten link and attribute "link" to link
    buttonEl.innerText = genInner(link);
    buttonEl.setAttribute("link", link);
    // Add event listener for onClick event
    buttonEl.addEventListener("click", function () {
      const link = this.getAttribute("link"); // Get Link and open
      electron.shell.openExternal(link);
    });

    // Generate inner remove button element
    const buttonRemoveEl = document.createElement("button");
    buttonRemoveEl.classList.add("button-remove");
    buttonRemoveEl.innerHTML = "&times;"; // Inner text to x-like symbol
    buttonRemoveEl.setAttribute("link", link); // Set attribute "link" to link
    // Adding Event Listener
    buttonRemoveEl.addEventListener("click", function () {
      const link = this.getAttribute("link"); // Get link
      tabs.removeButtonFromTab(link); // Remove it
    });

    // Set Styling
    rootEl.style.backgroundColor = colors.background;
    buttonEl.style.color = colors.textcolor;
    buttonRemoveEl.style.color = colors.textcolor;

    // Add inner elements to root
    rootEl.appendChild(buttonEl);
    rootEl.appendChild(buttonRemoveEl);
    // Add root element to DOM
    main.appendChild(rootEl);
  });
};

const renderCurrentTabName = () => {
  const currentTabName = document.getElementById("current-tab-name");
  currentTabName.innerText = tabs.getCurrentTab().name;
};
//#endregion

/**
 * Function to show "Open Directory" window
 */
const addItemDialog = () => {
  currentWindow.hide();
  electron.dialog
    .showOpenDialog(undefined, {
      properties: ["openDirectory"],
      title: "Ordner hinzufügen",
    })
    .then((val) => {
      if (val.filePaths.length > 0) {
        tabs.addButtonToTab(val.filePaths[0]);
      }
      currentWindow.show();
    });
};

//#region Helper functions

const refreshCurrentLang = () => {
  currentLang = i18n.getLang(tabs.langId);
};

const genInner = (p) => {
  if (typeof p == "string") {
    if (p.match(/([\/\\][^\/\\]*)/g) && p.length > 10) {
      const l = p.match(/([\/\\][^\/\\]*)/g);
      let out = "...";
      if (l.length >= 2) out += l[l.length - 2];
      if (l.length >= 1) out += l[l.length - 1];
      return out;
    } else {
      return p;
    }
  } else {
    return p;
  }
};

/**
 * Open an electron message box
 * @param {"info"|"warning"} type
 * @param {string} title Title
 * @param {string} message Message
 * @param {string} more Details
 * @returns {Promise}
 */
const openMessageBox = (type, title, message, more) => {
  return electron.dialog.showMessageBox(null, {
    message,
    title,
    detail: more,
    type,
  });
};

//#region Helper functions Coloring
function getTextAndBackgroundColor(link) {
  let background = "";
  let textcolor = "";

  const shade =
    "#" + crypto.createHash("md5").update(link).digest("hex").substring(0, 6);

  background = shade;
  textcolor = getTextColor(shade);

  return { background: background, textcolor: textcolor };
}

function getRGB(c) {
  return parseInt(c, 16) || c;
}

function getsRGB(c) {
  return getRGB(c) / 255 <= 0.03928
    ? getRGB(c) / 255 / 12.92
    : Math.pow((getRGB(c) / 255 + 0.055) / 1.055, 2.4);
}

function getLuminance(hexColor) {
  return (
    0.2126 * getsRGB(hexColor.substr(1, 2)) +
    0.7152 * getsRGB(hexColor.substr(3, 2)) +
    0.0722 * getsRGB(hexColor.substr(-2))
  );
}

function getContrast(f, b) {
  const L1 = getLuminance(f);
  const L2 = getLuminance(b);
  return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
}

function getTextColor(bgColor) {
  const whiteContrast = getContrast(bgColor, "#ffffff");
  const blackContrast = getContrast(bgColor, "#000000");

  return whiteContrast > blackContrast ? "#ffffff" : "#000000";
}
//#endregion

//#endregion

const init = () => {
  // Add Listeners for the menu
  document
    .getElementById("close")
    .addEventListener("click", () => currentWindow.close());
  document
    .getElementById("min")
    .addEventListener("click", () => currentWindow.minimize());

  document.getElementById("more").addEventListener("click", () => {
    const mainMenu = new electron.Menu();
    //#region Menu Settings
    const subMenuSettings = new electron.Menu();
    subMenuSettings.append(
      new electron.MenuItem({
        type: "checkbox",
        label: "Sticky",
        checked: ipcRender.sendSync("getSticky"),
        click: (item) => {
          ipcRender.send("setSticky", item.checked);
          currentWindow.setAlwaysOnTop(item.checked);
        },
      })
    );

    //#region Menu Lang
    const subSubMenuLang = new electron.Menu();
    i18n.getLangs().forEach((i) => {
      console.log({ t: tabs.langId, i: i.id }, tabs.langId == i.id);
      subSubMenuLang.append(
        new electron.MenuItem({
          label: i.name,
          checked: tabs.langId == i.id,
          click: () => {
            tabs.setLangId(i.id);
          },
          type: "checkbox",
        })
      );
    });

    subMenuSettings.append(
      new electron.MenuItem({ label: "Language", submenu: subSubMenuLang })
    );
    //#endregion

    //#region Zoom
    subMenuSettings.append(
      new electron.MenuItem({
        type: "separator",
      })
    );
    subMenuSettings.append(
      new electron.MenuItem({
        label: "Zoom +",
        role: "zoomIn",
      })
    );
    subMenuSettings.append(
      new electron.MenuItem({
        label: "Zoom -",
        role: "zoomOut",
      })
    );
    subMenuSettings.append(
      new electron.MenuItem({
        label: "Zoom 100%",
        role: "resetZoom",
      })
    );
    //#endregion

    //#region Delete Everything
    subMenuSettings.append(
      new electron.MenuItem({
        type: "separator",
      })
    );
    subMenuSettings.append(
      new electron.MenuItem({
        label: currentLang["delete-everything-and-close"],
        click: () => {
          tabs.deleteAndQuit(() => currentWindow.close());
        },
      })
    );
    //#endregion

    mainMenu.append(
      new electron.MenuItem({
        label: currentLang.settings,
        submenu: subMenuSettings,
      })
    );

    //#endregion

    //#region Menu Tabs
    const subMenuTabs = new electron.Menu();

    for (let tab of tabs.getTabNamesAndIndexes()) {
      const subsubMenu = new electron.Menu();
      subMenuTabs.append(
        new electron.MenuItem({
          label: tab.name,
          type: "checkbox",
          checked: tab.id == tabs.currentTabId,
          click: (item) => tabs.setCurrentTabId(tab.id),
        })
      );
    }
    subMenuTabs.append(
      new electron.MenuItem({
        type: "separator",
      })
    );
    subMenuTabs.append(
      new electron.MenuItem({
        label: currentLang["add-tab"],
        click: () => {
          prompt({
            title: currentLang["add-tab"],
            message: currentLang["new-tab-name"],
            placeholder: "Tab 12",
          })
            .then((v) => {
              tabs.addTab(v.length ? v : "Tab 3");
            })
            .catch(() => {});
        },
      })
    );
    subMenuTabs.append(
      new electron.MenuItem({
        label: currentLang["rename-tab"],
        click: () => {
          prompt({
            title: currentLang["rename-tab"],
            message: currentLang["new-tab-name"],
            placeholder: tabs.getCurrentTab().name,
          })
            .then((v) => {
              tabs.renameCurrentTab(v.length ? v : "Tab 3");
            })
            .catch(() => {});
        },
      })
    );
    subMenuTabs.append(
      new electron.MenuItem({
        label: currentLang["delete-tab"],
        click: () => {
          if (!tabs.removeCurrentTab())
            openMessageBox(
              "warning",
              "Nicht löschbar",
              "Diesen Tab kannst du nicht löschen",
              "Es muss mindestens ein Tab existieren, deshalb kannst du diesen nicht löschen"
            );
        },
      })
    );
    subMenuTabs.append(
      new electron.MenuItem({
        type: "separator",
      })
    );
    subMenuTabs.append(
      new electron.MenuItem({
        label: currentLang["delete-all-empty-tabs"],
        click: () => {
          tabs.deleteAllEmptyTabs();
        },
      })
    );

    mainMenu.append(
      new electron.MenuItem({
        label: "Tabs",
        submenu: subMenuTabs,
      })
    );
    //#endregion

    mainMenu.append(
      new electron.MenuItem({
        label: currentLang["add-folder"],
        click: () => addItemDialog(),
      })
    );
    mainMenu.append(
      new electron.MenuItem({
        role: "quit",
        label: currentLang.close,
      })
    );
    mainMenu.popup();
  });

  // Add Listener for the add button
  document.getElementById("add").addEventListener("click", () => {
    addItemDialog();
  });

  // Add data listeners
  tabs.addOnChangeListener(reRenderButtons);
  tabs.addOnChangeListener(renderCurrentTabName);
  tabs.addOnChangeListener(refreshCurrentLang);
  tabs.triggerOnChange();
};

init();
