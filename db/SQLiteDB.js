const sqlite3 = require("sqlite3");

const { open } = require("sqlite");
const { query } = require("express");

async function connect() {
  return open({
    filename: "./db/ghost_kitchen.db",
    //IMPORTANT: cached keyword to avoid opening db multople times
    //otherwies SQL_BUSY error
    //see https://github.com/mapbox/node-sqlite3/wiki/Caching
    driver: sqlite3.Database,
  });
}

async function getBrands() {
  let db;
  try{
    db = await connect();
    return await db.all("SELECT * FROM Virtual_Brand");
  } finally {
    db.close();
  }
  
}

async function getOrders(userID) {
  let db, query;
  try{
    db = await connect();
    query = await db.prepare(
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
  }finally {
    await query.finalize();
    await db.close();
  }
  
}

async function getOrderByID(userID, orderID) {
  let db, query;
  try{
    db = await connect();
    query = await db.prepare(
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
  }finally {
    await query.finalize();
    await db.close();
  }
  
}

async function updateOrder(orderID, quantity, pickupID, userID) {
  let db, query;
  try{
    db = await connect();
    query = await db.prepare(
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
  } finally {
    await query.finalize();
    await db.close();
  }
  
}

async function deleteOrder(orderToDelete) {
  let db, query;
  try{
    db = await connect();

    query = await db.prepare(
    `DELETE FROM
    Orders
    WHERE id = :theIDToDelete
    `);

    query.bind({
      ":theIDToDelete": orderToDelete,
    });
    return await query.run();
    }  finally {
      await query.finalize();
      await db.close();
    }
  
}

//to be used in index.ejs
async function getMealsBy(brandID) {
  let db, query;
  try{
    db = await connect();
    query = await db.prepare("SELECT * FROM Meal WHERE brand_id=:brandID");
    query.bind({":brandID": brandID});
    return await query.all();
  } finally {
    await query.finalize();
    await db.close();
  }
  
}

//to be used in order.ejs
async function getMeal(mealID) {
  let db, query;
  try{
    db = await connect();
    query = await db.prepare("SELECT * FROM Meal WHERE id=:mealID");
    query.bind({":mealID": mealID});
    return await query.get();
  } finally {
    await query.finalize();
    await db.close();
  }
  
}

async function getPickup() {
  let db;
  try{
    db = await connect();
    return await db.all("SELECT * FROM Pickup_Type");
  } finally {
    db.close();
  }
  
}

async function getLocations() {
  let db;
  try{
    db = await connect();
    return await db.all("SELECT * FROM Location");
  } finally {
    db.close();
  }
  
}

async function createOrder(order, userID) {
  let db, query;
  try{
    db = await connect();
    const order_time = new Date(Date.now());

    query = await db.prepare(`
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
  } finally {
    await query.finalize();
    await db.close();
  }
  
}

async function getUser(userId) {
  let db, query;
  try{
    db = await connect();
    query = await db.prepare("SELECT * FROM Customer WHERE id=:userId");

    query.bind({":userId": userId})
    return await query.get();
  } finally {
    await query.finalize();
    await db.close();
  }
  
}

/* ------Jiayi------ */
async function createMeal(newMeal, brandID){
  //let db, query;
  //try{
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
    // } finally {
    //   //query.finalize();
    //   db.close();
    // }
  
}

async function getBrandsBy(brandID) {
  let db, query;
  try{
    db = await connect();
    query = await db.prepare("SELECT * FROM Virtual_Brand WHERE id=:brandID");
    query.bind({":brandID": brandID});
    return await query.get();
  } finally {
    await query.finalize();
    await db.close();
  }
  
}

async function updateMeal(mealID, brandID, meal_name, description, calories, price) {
  let db, query;
  try{
    db = await connect();
    query = await db.prepare(
      `UPDATE Meal
      SET meal_name=:meal_name,
          description=:description,
          calories=:calories,
          price=:price
      WHERE id=:mealID AND brand_id=:brandID`);
      
    const vals = {
      "mealID": mealID,
      "brandID": brandID,
      "meal_name": meal_name,
      "description": description,
      "calories": calories,
      "price": price
    };
    console.log("will update these values for meal:");
    console.log(vals);
    query.bind(vals);

    return await query.get();
  } finally {
    await query.finalize();
    await db.close();
  }
  
}

async function deleteMeal(mealToDelete) {
  let db, query;
  try{
    db = await connect();

    query = await db.prepare(
      `DELETE FROM
      Meal
      WHERE id = :theIDToDelete
      `);

    query.bind({
      ":theIDToDelete": mealToDelete.id,
    });
    return await query.run();
  } finally {
    query.finalize();
    await db.close();
  }
  
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
  createMeal,
  getBrandsBy,
  updateMeal,
  deleteMeal
};
