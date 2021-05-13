const { ipcRenderer } = require("electron");

const cancelButton = document.getElementById("cancel");
const okButton = document.getElementById("ok");
const inputThing = document.getElementById("data");
const titleEl = document.getElementById("title");
const messageEl = document.getElementById("message");

const submit = () => {
  ipcRenderer.sendSync("prompt-result", inputThing.value);
};

const cancel = () => {
  ipcRenderer.sendSync("prompt-cancel");
};

/**
 *
 * @param {{title:string;message:string;placeholder:string}} options
 */
const gotData = (options) => {
  console.log(options);
  inputThing.placeholder = options.placeholder;
  titleEl.innerText = options.title;
  messageEl.innerText = options.message;
};

okButton.addEventListener("click", () => submit());
cancelButton.addEventListener("click", () => cancel());

gotData(JSON.parse(ipcRenderer.sendSync("prompt-get-data")));
