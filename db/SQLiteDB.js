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

async function getOrders(userID) {
  const db = await connect();
  const query = await db.prepare(
    `SELECT o.id, m.meal_name, m.description, m.price, o.quantity, pt.type
     FROM Orders AS o
     JOIN Meal AS m
     ON o.meal_id = m.id
     JOIN Pickup_Type AS pt
     ON o.pickup_id = pt.id
     WHERE o.customer_id=:userID AND o.pickup_time IS NULL`);

  query.bind({
    ":userID": userID,
  })
  return await query.all();
}

async function getOrderByID(userID, orderID) {
  const db = await connect();
  const query = await db.prepare(
    `SELECT o.id AS order_id, o.quantity,
            m.id AS meal_id, m.meal_name, m.description,
            pt.id AS pickup_id, pt.type
     FROM Orders AS o
     JOIN Meal AS m
     ON o.meal_id = m.id
     JOIN Pickup_Type AS pt
     ON o.pickup_id = pt.id
     WHERE o.customer_id=:userID AND o.id=:orderID AND pickup_time IS NULL`);

  query.bind({
    ":userID": userID,
    ":orderID": orderID,
  });
  console.log(`user id is ${userID}`);
  console.log(`order id is ${orderID}`);
  return await query.get();
}

async function updateOrder(orderID, quantity, pickupID, userID) {
  const db = await connect();
  const query = await db.prepare(
    `UPDATE Orders
     SET pickup_id=:pickupID,
         quantity=:quantity
     WHERE id=:orderID AND customer_id=:userID`);

  query.bind({
    ":pickupID": pickupID,
    ":quantity": quantity,
    ":orderID": orderID,
    ":userID": userID,
  });
  console.log(`user id is ${userID}`);
  console.log(`order id is ${orderID}`);
  return await query.get();
}

async function deleteOrder(orderToDelete) {
  const db = await connect();

  const query = await db.prepare(
    `DELETE FROM
    Orders
    WHERE id = :theIDToDelete
    `);

  query.bind({
    ":theIDToDelete": orderToDelete,
  });
  return await query.run();
}

//to be used in index.ejs
async function getMealsBy(brandID) {
  const db = await connect();
  const query = await db.prepare("SELECT * FROM Meal WHERE brand_id=:brandID");
  query.bind({":brandID": brandID});
  return await query.all();
}

//to be used in order.ejs
async function getMeal(mealID) {
  const db = await connect();
  const query = await db.prepare("SELECT * FROM Meal WHERE id=:mealID");
  query.bind({":mealID": mealID});
  return await query.get();
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
  const order_time = new Date(Date.now());

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
  };

  console.log("will write these values for order:");
  console.log(vals);

  query.bind(vals);

  return await query.run();
                    //^^ run when a query doesn't return anything
}

async function getUser(userId) {
  const db = await connect();
  const query = await db.prepare("SELECT * FROM Customer WHERE id=:userId");

  query.bind({":userId": userId})
  return await query.get()
}

async function createMeal(newMeal, brandID){
  const db = await connect();
  const query = await db.prepare(`INSERT INTO
  Meal(meal_name, description, calories, price, brand_id)
  VALUES (:meal_name, :description, :calories, :price, :brand_id)
`);
  query.bind({
    ":meal_name": newMeal.meal_name,
    ":description": newMeal.description,
    ":calories": newMeal.calories,
    ":price": newMeal.price,
    ":brand_id": brandID,
});
  return await query.run();
}

module.exports = {
  getMealsBy,
  getUser,
  getBrands,
  getMeal,
  getPickup,
  getLocations,
  createOrder,
  getOrders,
  deleteOrder,
  getOrderByID,
  updateOrder,
};
