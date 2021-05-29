/**
 *
 * @param {{title:string;message:string;placeholder:string;oklabel:string;cancellabel:string}} options
 * @returns {Promise<{out?:string}>}
 */
const prompt = (options) => {
  return new Promise((resolve, reject) => {
    const promptEl = document.getElementById("prompt");
    /** @type {HTMLInputElement} */
    const inputEl = document.getElementById("input");
    const buttonCancelEL = document.getElementById("input-cancel");
    const buttonOkEl = document.getElementById("input-ok");

    const msgEl = document.getElementById("input-msg");
    const headEl = document.getElementById("input-head");

    const overlayEl = document.getElementById("overlay");

    promptEl.removeAttribute("hidden");
    overlayEl.removeAttribute("hidden");

    msgEl.innerText = options.message;
    headEl.innerText = options.title;

    inputEl.setAttribute("placeholder", options.placeholder);
    inputEl.value = "";

    const okClickListener = () => {
      resolve({ out: inputEl.value });
      cleanUp();
    };

    const cancelClickListener = () => {
      resolve({});
      cleanUp();
    };

    buttonCancelEL.addEventListener("click", cancelClickListener);
    buttonOkEl.addEventListener("click", okClickListener);

    buttonCancelEL.innerText = options.cancellabel;
    buttonOkEl.innerText = options.oklabel;

    const cleanUp = () => {
      promptEl.setAttribute("hidden", "");
      overlayEl.setAttribute("hidden", "");
      buttonCancelEL.removeEventListener("click", cancelClickListener);
      buttonOkEl.removeEventListener("click", okClickListener);
    };
  });
};

module.exports = prompt;
