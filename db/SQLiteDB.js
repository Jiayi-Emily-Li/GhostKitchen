const sqlite3 = require("sqlite3");

const { open } = require("sqlite");

async function getMeals() {
  const db = await open({
    //needs 2 params
    filename: "./db/ghost_kitchen.db",
    driver: sqlite3.Database,
  });

  return await db.all("SELECT * FROM Meal");
}

module.exports.getMeals = getMeals;
