const main = document.getElementById("main");

const electronStore = require("electron-store");
const electron = require("electron").remote;

const store = new electronStore({ name: "buttons" });
const currentWindow = electron.getCurrentWindow();

let buttons = [];

const genInner = (p) => {
  if (typeof p == "string") {
    if (p.match(/[\/\\]/g)) {
      const l = p.match(/([\/\\][^\/\\]+)/g);
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
  console.log("Buttons", buttons);
  main.innerHTML = "";
  buttons.forEach((link) => {
    const newElParent = document.createElement("div");
    const newEl = document.createElement("button");
    newEl.innerText = genInner(link);
    newEl.setAttribute("link", link);

    newEl.addEventListener("click", onButtonClick);
    newEl.classList.add("button-inner");
    newElParent.appendChild(newEl);
    newElParent.classList.add("button-outer");
    const newElRemove = document.createElement("button");
    newElRemove.innerHTML = "&times;";
    newElRemove.setAttribute("link", link);
    newElRemove.addEventListener("click", onButtonClickRemove);
    newElRemove.classList.add("button-remove");
    newElParent.appendChild(newElRemove);
    main.appendChild(newElParent);
  });
};

const init = () => {
  if (store.has("buttons")) buttons = [...buttons, ...store.get("buttons")];

  document.getElementById("add").addEventListener("click", () => {
    currentWindow.hide();
    electron.dialog
      .showOpenDialog(undefined, {
        properties: ["openDirectory"],
        title: "Ordner hinzufügen",
      })
      .then((val) => {
        if (val.filePaths.length > 0) {
          let newButtons = [...buttons, val.filePaths[0]];
          store.set("buttons", newButtons);
          console.log({ newButtons });
          buttons = newButtons;
          reRenderButtons();
        }
        currentWindow.show();
      });
  });
  reRenderButtons();
};

function onButtonClick() {
  const link = this.getAttribute("link");
  electron.shell.openExternal(link);
}

function onButtonClickRemove() {
  const link = this.getAttribute("link");
  console.log("Remove", link);

  let newButtons = buttons.filter((e) => e != link);
  store.set("buttons", newButtons);
  console.log({ newButtons });
  buttons = newButtons;
  reRenderButtons();
}

init();
