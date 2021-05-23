const App = require("spectron").Application;
const electronPath = require("electron");
const path = require("path");

const app = new App({ path: electronPath, args: [path.join(__dirname, "..")] });

app
  .start()
  .then(function () {
    return app.browserWindow.isVisible();
  })
  .then(function (isVisible) {
    if (!isVisible) throw Error("Not Visible");
  })
  .then(function () {
    return app.client.getTitle();
  })
  .then(function (title) {
    if (title != "Foldr") throw Error("Wrong title ," + title);
  })
  .then(() => {
    return app.client.auditAccessibility({}).then((audit) => {
      if (audit.failed) {
        throw Error(
          audit.message + " " + (audit.results.length ? audit.results : "")
        );
      } else
        console.log(audit.message, audit.results.length ? audit.results : "");
    });
  })
  .catch(function (error) {
    console.error("Test failed:", error);
  })
  .then(function () {
    app.stop();
    console.log("Test successful");
  });
