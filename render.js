const main = document.getElementById("main");
const crypto = require("crypto");

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

const init = () => {
  if (store.has("buttons")) buttons = [...buttons, ...store.get("buttons")];

  document
    .getElementById("close")
    .addEventListener("click", () => currentWindow.close());
  document
    .getElementById("min")
    .addEventListener("click", () => currentWindow.minimize());

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
