let express = require("express");
let router = express.Router();

console.log("Setting up routes");

/* GET home page. */
router.get("/", function (req, res, next) {
  //render the _index_ template with the title attribute as Express
  res.render("index", { title: "Express" });
});

/* GET delete page. */
router.get("/delete", function (req, res, next) {
  //render the _index_ template with the title attribute as Express
  res.render("index", { title: "DELETE" });
});

module.exports = router;
