const electronStore = require("electron-store");
const defaultLangId = require("./i18n").defaultLangId;
class AllData {
  alldata = [{ name: "Tab 0", buttons: ["C:/Users/"] }];
  currentTabId = 0;
  store = new electronStore();
  onChangeListener = [];
  langId = defaultLangId;

  constructor(storeName) {
    this.store = new electronStore({ name: storeName });
    this.load();
    this.addOnChangeListener(() => this.save());
  }

  load() {
    if (this.store.has("tabs")) this.alldata = this.store.get("tabs");
    if (this.store.has("currentTab"))
      this.currentTabId = Number(this.store.get("currentTab"));
    if (this.store.has("lang")) this.langId = this.store.get("lang");
  }

  save() {
    this.store.set("tabs", this.alldata);
    this.store.set("currentTab", this.currentTabId);
    this.store.set("lang", this.langId);
  }

  /**
   * Add Listener
   * @param {()=>void} func Listener
   */
  addOnChangeListener(func) {
    this.onChangeListener = this.onChangeListener.concat(func);
  }

  /**
   * Internal function for Triggering onChange listeners
   */
  triggerOnChange() {
    for (let i of this.onChangeListener) i();
  }

  /**
   * Add empty Tab to Store
   * @param {string} name Name of the Tab
   */
  addTab(name) {
    this.alldata.push({ name, buttons: [] });
    this.triggerOnChange();
  }

  /**
   * Get a Tab from Store
   * @param {number} index Index in the Tabs
   */
  getTab(index) {
    return index < this.alldata.length ? this.alldata[index] : undefined;
  }

  /**
   * Get Current Tab data
   */
  getCurrentTab() {
    return this.alldata[this.currentTabId];
  }

  /**
   * Add Button to current Tab
   * @param {string} link Button Link
   * @returns {boolean} success
   */
  addButtonToTab(link) {
    this.alldata[this.currentTabId].buttons =
      this.alldata[this.currentTabId].buttons.concat(link);
    this.triggerOnChange();
  }

  /**
   * Remove Button from current Tab
   * @param {string} link Button Link
   * @returns {boolean} success
   */
  removeButtonFromTab(link) {
    this.alldata[this.currentTabId].buttons = this.alldata[
      this.currentTabId
    ].buttons.filter((i) => i != link);
    this.triggerOnChange();
  }

  /**
   * Remove Tab and all Buttons in it
   * @param {number} index Tab ID
   * @returns {boolean} success
   */
  removeTab(index) {
    if (index < this.alldata.length && this.alldata.length > 1) {
      this.alldata = this.alldata.filter((val, i) => i != index);
      if (index == this.currentTabId) {
        tabs.setCurrentTabIdtoLast();
      }
      this.triggerOnChange();
      return true;
    } else return false;
  }

  removeCurrentTab() {
    if (this.alldata.length > 1) {
      this.alldata = this.alldata.filter((val, i) => i != this.currentTabId);

      tabs.setCurrentTabIdtoLast();

      this.triggerOnChange();
      return true;
    } else return false;
  }

  /**
   * Get all Tab Names
   */
  getTabNames() {
    return this.alldata.map((i) => i.name);
  }
  /**
   * Get all Tab Names with indexes
   */
  getTabNamesAndIndexes() {
    return this.alldata.map((i, index) => ({ name: i.name, id: index }));
  }

  /**
   * Get Buttons from Current Tab
   */
  getButtonsFromTab() {
    return this.alldata[this.currentTabId].buttons;
  }

  length() {
    return this.alldata.length;
  }

  /**
   * Set Current Tab ID
   * @param {number} id Tab ID
   */
  setCurrentTabId(id) {
    this.currentTabId = id;
    this.triggerOnChange();
  }

  setCurrentTabIdtoLast() {
    this.currentTabId = this.alldata.length - 1;
    this.triggerOnChange();
  }

  /**
   * Rename current tab
   * @param {string} newName New Tab name
   */
  renameCurrentTab(newName) {
    this.alldata[this.currentTabId].name = newName;
    this.triggerOnChange();
  }

  deleteAllEmptyTabs() {
    this.alldata = this.alldata.filter((i) => i.buttons.length > 0);
    if (this.alldata.length == 0) {
      this.alldata = [{ name: "Tab 0", buttons: [] }];
    }
    tabs.setCurrentTabIdtoLast();

    this.triggerOnChange();
  }

  setLangId(id) {
    this.langId = id;

    this.triggerOnChange();
  }
}

const data = new AllData("tabs-n-stuff");

module.exports = data;
