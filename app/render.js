const main = document.getElementById("main");
const crypto = require("crypto");

const electronStore = require("electron-store");
const electron = require("electron").remote;
const ipcRender = require("electron").ipcRenderer;

const store = new electronStore({ name: "buttons" });
const currentWindow = electron.getCurrentWindow();

let buttons = [];

const tabs = require("./data");

let currentTabId = 0;

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

const reRenderButtons = () => {
  main.innerHTML = "";
  tabs.getButtonsFromTab().forEach((link) => {
    const newElParent = document.createElement("div");
    const newEl = document.createElement("button");
    newEl.innerText = genInner(link);
    newEl.setAttribute("link", link);

    const colors = getTextAndBackgroundColor(link);

    newEl.addEventListener("click", onButtonClick);
    newEl.classList.add("button-inner");
    newElParent.appendChild(newEl);
    newElParent.classList.add("button-outer");
    const newElRemove = document.createElement("button");
    newElRemove.innerHTML = "&times;";
    newElRemove.setAttribute("link", link);
    newElRemove.addEventListener("click", onButtonClickRemove);
    newElRemove.classList.add("button-remove");

    newElParent.style.backgroundColor = colors.background;
    newEl.style.color = colors.textcolor;

    newElParent.appendChild(newElRemove);
    main.appendChild(newElParent);
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

const initTabSelector = () => {
  const tabselect = document.getElementById("tabselect");
  // Add change listener
  tabselect.addEventListener("change", function (ev) {
    tabs.setCurrentTabId(this.value);
  });
  // Render
  renderTabSelector();
};

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

const init = () => {
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
          currentWindow.minimize();
          electron.dialog
            .showMessageBox(null, {
              message: "Bitte starte die App neu",
              title: "App neu starten",
              detail:
                "Die Einstellung wurde übernommen. Nachdem sich die App automatisch geschlossen hat kannst du sie wieder öffnen",
              type: "info",
            })
            .then((val) => {
              ipcRender.send("setSticky", item.checked);
              currentWindow.destroy();
            });
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
      subsubMenu.append(
        new electron.MenuItem({
          label: "Löschen",
          click: () => {
            tabs.removeTab(tab.id);
            if (tab.id == tabs.currentTabId) {
              tabs.setCurrentTabIdtoLast();
            }
          },
        })
      );
      subsubMenu.append(
        new electron.MenuItem({
          label: "Auswählen",
          click: () => {
            tabs.setCurrentTabId(tab.id);
          },
        })
      );
      subMenuTabs.append(
        new electron.MenuItem({
          label: tab.name,
          submenu: subsubMenu,
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

  document.getElementById("add").addEventListener("click", () => {
    addItemDialog();
  });

  initTabSelector();
  reRenderButtons();

  // Add data listeners
  tabs.addOnChangeListener(reRenderButtons);
  tabs.addOnChangeListener(renderTabSelector);
};

function onButtonClick() {
  const link = this.getAttribute("link");
  electron.shell.openExternal(link);
}

function onButtonClickRemove() {
  const link = this.getAttribute("link");
  console.log("Remove", link);

  tabs.removeButtonFromTab(currentTabId, link);
}

init();

function getTextAndBackgroundColor(link) {
  let background = "";
  let textcolor = "";

  const shade =
    "#" + crypto.createHash("md5").update(link).digest("hex").substring(0, 6);

  background = shade;
  textcolor = getTextColor(shade);

  return { background: background, textcolor: textcolor };
}

// Geklauter Code:

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
