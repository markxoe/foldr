const App = require("spectron").Application;
const electronPath = require("electron");
const path = require("path");

const app = new App({ path: electronPath, args: [path.join(__dirname, "..")] });

const chaiAsPromised = require("chai-as-promised");
const chai = require("chai");

chai.use(chaiAsPromised);
chai.should();

describe("Basic Tests", function () {
  this.timeout(10000);

  before(function () {
    return app.start();
  });
  after(function () {
    if (app && app.isRunning()) {
      return app.stop();
    }
  });

  it("Open window", function () {
    return app.client.waitUntilWindowLoaded().should.eventually.fulfilled;
  });
  it("Window count", function () {
    return app.client.getWindowCount().should.eventually.equal(1);
  });
  it("Window title", function () {
    return app.client.getTitle().should.eventually.equal("Foldr");
  });
  it("Accessibility", function () {
    return app.client
      .auditAccessibility({})
      .then((i) => {
        if (i.failed) {
          throw Error(i.message);
        } else {
          return true;
        }
      })
      .should.eventually.equal(true);
  });
});
