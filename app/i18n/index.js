//@ts-check

const path = require("path");

/** @type {{[key:string]:{meta:{name:string},"settings":string,"tabs":string,"add-tab":string,"delete-tab":string,"rename-tab":string,"delete-all-empty-tabs":string,"add-folder":string,"close":string,"new-tab-name":string,"delete-everything-and-close":string}}} */
let langs = {
  de: {
    meta: {
      name: "Deutsch",
    },
    settings: "Einstellungen",
    tabs: "Tabs",
    "add-tab": "Tab hinzufügen",
    "delete-tab": "Tab löschen",
    "rename-tab": "Tab umbenennen",
    "delete-all-empty-tabs": "Alle leeren Tabs löschen",
    "add-folder": "Ordner hinzufügen",
    close: "Schließen",
    "new-tab-name": "Bitte gib einen neuen Namen für den Tab ein",
    "delete-everything-and-close": "Lösche alles und schließe App",
  },
  en: {
    meta: {
      name: "English",
    },
    settings: "Settings",
    "add-folder": "Add folder",
    "add-tab": "Add tab",
    "delete-all-empty-tabs": "Delete all empty Tabs",
    "delete-tab": "Delete tab",
    "rename-tab": "Rename tab",
    close: "Close",
    tabs: "Tab",
    "new-tab-name": "Please enter a new tab name",
    "delete-everything-and-close": "Delete everything and exit",
  },
};

// Default Language ID
const defaultLangId = "en";

/**
 *
 * @param {string} langid Language ID
 *
 */
const getLangById = (langid) => {
  let out = langs[defaultLangId];

  if (langid in langs) {
    out = langs[langid];
  }
  return out;
};

const getLangIdsAndNames = () => {
  return Object.keys(langs).map((i) => ({ id: i, name: langs[i].meta.name }));
};

module.exports = {
  getLang: getLangById,
  getLangs: getLangIdsAndNames,
  defaultLangId,
};
