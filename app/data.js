const electronStore = require("electron-store");

class AllData {
  alldata = [
    { name: "Tab 0", buttons: ["C:/Users/marko"] },
    { name: "Tab 4", buttons: ["C:/"] },
  ];
  currentTabId = 0;
  store = new electronStore();

  constructor(storeName) {
    this.store = new electronStore({ name: storeName });
    this.load();
  }

  load() {
    if (this.store.has("tabs")) this.alldata = this.store.get("tabs");
    if (this.store.has("currentTab"))
      this.currentTabId = this.store.get("currentTab");
  }

  save() {
    this.store.set("tabs", this.alldata);
    this.store.set("currentTab", this.currentTabId);
  }

  /**
   * Add empty Tab to Store
   * @param {string} name Name of the Tab
   */
  addTab(name) {
    this.alldata.push({ name, buttons: [] });
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
  }

  /**
   * Remove Tab and all Buttons in it
   * @param {number} index Tab ID
   * @returns {boolean} success
   */
  removeTab(index) {
    if (index < this.alldata.length && this.alldata.length > 1) {
      this.alldata = this.alldata.filter((val, i) => i != index);
      console.log("Removed tab", index, this.alldata);
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
  }

  setCurrentTabIdtoLast() {
    this.currentTabId = this.alldata.length - 1;
  }
}

const data = new AllData("tabs-n-stuff");

module.exports = data;
