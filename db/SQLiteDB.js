const sqlite3 = require("sqlite3");

const { open } = require("sqlite");

async function connect() {
  return open({
    filename: "./db/ghost_kitchen.db",
    //IMPORTANT: cached keyword to avoid opening db multople times
    //otherwies SQL_BUSY error
    //see https://github.com/mapbox/node-sqlite3/wiki/Caching
    driver: sqlite3.cached.Database,
  });
}

async function getBrands() {
  const db = await connect();
  return await db.all("SELECT * FROM Virtual_Brand");
}

//to be used in index.ejs
async function getMealsBy(brandID) {
  const db = await connect();
  const query = await db.prepare("SELECT * FROM Meal WHERE brand_id=:brandID");
  query.bind({":brandID": brandID})
  return await query.all()
}

//to be used in order.ejs
async function getMeal(mealID) {
  const db = await connect();
  const query = await db.prepare("SELECT * FROM Meal WHERE id=:mealID");
  query.bind({":mealID": mealID})
  return await query.get()
}

async function getPickup() {
  const db = await connect();
  return await db.all("SELECT * FROM Pickup_Type");
}

async function getLocations() {
  const db = await connect();
  return await db.all("SELECT * FROM Location");
}

async function createOrder(order, userID) {
  const db = await connect();
  const order_time = new Date(Date.now())

  const query = await db.prepare(`
  INSERT INTO
    Orders(order_time, quantity, location_id, customer_id, meal_id, pickup_id)
    VALUES (:orderTime, :quantity, :location_id, :customer_id, :meal_id, :pickup_id);
  `);
  const vals = {
    ":orderTime": order_time.toLocaleString(),
    ":quantity": order.quantity,
    ":location_id": order.location,
    ":customer_id": userID,
    ":meal_id": order.mealID,
    ":pickup_id": order.pickup
  }

  console.log("will write these values for order:");
  console.log(vals);

  query.bind(vals);

  return await query.run();
}

async function createPickupType(type) {
  const db = await connect();

  const query = await db.prepare(`
  INSERT INTO
    Pickup_Type(type)
    VALUES (:type);
  `);
  const vals = {
    ":type": type,
  }

  console.log(vals);
  query.bind(vals);

  return await query.run();
}

async function getUser(userId) {
  const db = await connect();
  const query = await db.prepare("SELECT * FROM Customer WHERE id=:userId");

  query.bind({":userId": userId})
  return await query.get()
}

module.exports = {
  getMealsBy,
  getUser,
  getBrands,
  getMeal,
  getPickup,
  getLocations,
  createOrder,
  createPickupType,
};
