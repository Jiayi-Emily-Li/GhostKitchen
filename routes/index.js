let express = require("express");
let router = express.Router();

const myDB = require("../db/SQLiteDB.js");

/* GET home page. */
router.get("/", async function (req, res, next) {
  console.log("Got request for /");

  const meals = await myDB.getMeals();

  console.log("got meals", meals);
  //render the _index_ template with the meals attribute as meals (from DB)
  res.render("index", { meals: meals });
});

/* GET delete page. */
router.get("/delete", function (req, res, next) {
  //render the _index_ template with the title attribute as Express
  res.render("index", { title: "DELETE" });
});

module.exports = router;
