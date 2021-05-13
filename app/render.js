const main = document.getElementById("main");
const crypto = require("crypto");

const electron = require("electron").remote;
const ipcRender = require("electron").ipcRenderer;

const currentWindow = electron.getCurrentWindow();

const tabs = require("./data");

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

    // Add inner elements to root
    rootEl.appendChild(buttonEl);
    rootEl.appendChild(buttonRemoveEl);
    // Add root element to DOM
    main.appendChild(rootEl);
  });
};

const renderTabSelector = () => {
  const tabselect = document.getElementById("tabselect");
  // Empty
  tabselect.innerHTML = "";
  // Add Buttons
  for (let tab of tabs.getTabNamesAndIndexes()) {
    const _tempEl = document.createElement("option");
    _tempEl.innerText = tab.name;
    _tempEl.value = tab.id;
    _tempEl.selected = tab.id == tabs.currentTabId;
    tabselect.append(_tempEl);
  }
};

const renderCurrentTabName = () => {
  const currentTabName = document.getElementById("current-tab-name");
  currentTabName.innerText = tabs.getCurrentTab().name;
};
//#endregion

/**
 * Function to initialize the Tab Selector TODO: May remove it...
 */
const initTabSelector = () => {
  const tabselect = document.getElementById("tabselect");
  // Add change listener
  tabselect.addEventListener("change", function (ev) {
    tabs.setCurrentTabId(this.value);
  });
};

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

const genInner = (p) => {
  if (typeof p == "string") {
    if (p.match(/[\/\\]/g)) {
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
    mainMenu.append(
      new electron.MenuItem({
        label: "Einstellungen",
        submenu: subMenuSettings,
      })
    );

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
        label: "Tab Hinzufügen",
        click: () => {
          tabs.addTab("Tab " + tabs.length());
        },
      })
    );
    subMenuTabs.append(
      new electron.MenuItem({
        label: "Tab löschen",
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

    mainMenu.append(
      new electron.MenuItem({
        label: "Tabs",
        submenu: subMenuTabs,
      })
    );

    mainMenu.append(
      new electron.MenuItem({
        label: "Ordner hinzufügen",
        click: () => addItemDialog(),
      })
    );
    mainMenu.popup();
  });

  // Add Listener for the add button
  document.getElementById("add").addEventListener("click", () => {
    addItemDialog();
  });

  initTabSelector();

  // Add data listeners
  tabs.addOnChangeListener(reRenderButtons);
  tabs.addOnChangeListener(renderTabSelector);
  tabs.addOnChangeListener(renderCurrentTabName);
  tabs.triggerOnChange();
};

init();
