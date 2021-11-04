const { render } = require("ejs");
let express = require("express");
let router = express.Router();

const myDB = require("../db/SQLiteDB.js");

/* Middleware for mock authentication */
router.use("*", async function(req, res, next) {
  // Mock authentication before every request
  const user = await myDB.getUser(12);
  req.user = user;
  next()
})

router.get("/", async function (req, res, next) {
  const userID = req.user.id;
  res.render("index", { userID: userID });
});

/* GET user page. */
router.get("/user", async function (req, res, next) {
  const user = req.user;
  res.render("user", { user: user });
});

/* ------Jiayi----- */
/* GET Admin (brands) page. */
router.get("/admin/brands", async function (req, res, next){

  const brands = await myDB.getBrands();

  console.log("got brands", brands);

  //render the _adminBrands_ template with the brands attribute as brands (from DB)
  res.render("adminBrands", { brands: brands });
});

/*GET Admin (meals) page. */
router.get("/admin/brands/:brandID/adminMeals", async function (req, res, next) {
  //params come with GET, brandID is in params
  console.log("Got request for meals page.");
  console.log(`brandId is ${req.params.brandID}`);

  const meals = await myDB.getMealsBy(req.params.brandID);
  const brandID = req.params.brandID;
  //const brandID = await myDB.getBrandIDBy(mealID);
  const brands = await myDB.getBrandsBy(brandID);
  console.log(brands);
  //render the _adminMeals_ template with the meals attribute as meals (from DB)
  res.render("adminMeals", { meals: meals, brandID: brandID, brands: brands});
});

/*POST create meals. */
router.post("/admin/brands/adminMeals/create", async function (req, res, next) {
  console.log("Got post create/meal");

  const meal = req.body;
  const brandID = req.body.brandID;
  console.log(`expect${brandID}`);
  console.log("got create meal", meal);

  await myDB.createMeal(meal, brandID);

  console.log("Meal created");
  

  res.redirect(`/admin/brands/${brandID}/adminMeals`);
});

/* POST delete meal. */
router.post("/admin/brands/adminMeals/delete", async function (req, res) {
  console.log("Got post delete meal");

  const brandIDtoDelete = req.body.brandID;
  const mealIDtoDelete = req.body.mealID;

  console.log(`will delete brandID: ${brandIDtoDelete}`);
  console.log(`will delete mealID: ${mealIDtoDelete}`);


  await myDB.deleteMeal(brandIDtoDelete, mealIDtoDelete);

  console.log("Meal deleted");

  res.redirect(`/admin/brands/${brandIDtoDelete}/adminMeals`);
});


/* GET update adminMeals page. */
router.get("/adminMeals/:mealID", async function (req, res, next) {
  console.log("Got adminMeals update");

  const mealID = req.params.mealID;
  const brandID = req.body.brandID;

  console.log("got meal details", mealID);

  const mealDetails = await myDB.getMeal(mealID);
  //const brandID = await myDB.getBrandIDBy(mealID);

  console.log("meal details", mealDetails);
  res.render("mealUpdate", {
    mealDetails: mealDetails, brandID: brandID
  });
});

/* POST update adminMeals page. */
router.post("/adminMeals/:mealID", async function (req, res, next) {
  console.log("got update POST request");
  console.log(req.body);

  const mealID = req.params.mealID;
  const brandID = req.body.brandID;
  const meal_name = req.body.meal_name;
  const description = req.body.description;
  const calories = req.body.calories;
  const price = req.body.price;
  //const brandID = await myDB.getBrandIDBy(mealID);
  console.log(`expect post ${brandID}`);
  await myDB.updateMeal(mealID, brandID, meal_name, description, calories, price);

  console.log(`Meal updated`);
  res.redirect(`/adminBrands/${brandID}/adminMeals`);
});
/* -------Jiayi-------*/

/* GET orders page. */
router.get("/user/orders", async function (req, res, next) {
  const user = req.user;
  const orders = await myDB.getOrders(user.id)
  console.log("got orders", orders);
  res.render("currentOrders", {orders: orders});
});

/* POST delete order. */
router.post("/user/orders/delete", async function (req, res) {
  console.log("Got post delete order");

  const order = req.body;

  console.log("got delete order", order);

  await myDB.deleteOrder(order.orderID);

  console.log("Order deleted");

  res.redirect(`/user/orders`);
});


/* GET update order page. */
router.get("/user/orders/:orderID", async function (req, res, next) {
  console.log("Got order update");

  const userID = req.user.id;
  const orderID = req.params.orderID;

  console.log("got order details", orderID);

  const orderDetails = await myDB.getOrderByID(userID, orderID);

  const pickups = await myDB.getPickup();

  console.log("order details", orderDetails);
  res.render("orderUpdate", {
    orderDetails: orderDetails,
    pickups: pickups,
  });
});

/* POST update order page. */
router.post("/user/orders/:orderID", async function (req, res, next) {
  console.log("got update request")
  console.log(req.body);

  const userID = req.user.id;
  const orderID = req.body.orderID;
  const quantity = req.body.quantity;
  const pickupID = req.body.pickup;

  await myDB.updateOrder(orderID, quantity, pickupID, userID);

  console.log(`Order updated`);
  res.redirect("/user/orders");
});

/* GET brands page. */
router.get("/brands", async function (req, res, next) {

  const brands = await myDB.getBrands();

  console.log("got brands", brands);

  //render the _index_ template with the meals attribute as meals (from DB)
  res.render("brands", { brands: brands });
});

/* GET menu page. */
router.get("/brands/:brandID/menu", async function (req, res, next) {
  //params come with GET, brandID is in params
  console.log(`brandId is ${req.params.brandID}`);

  const meals = await myDB.getMealsBy(req.params.brandID);

  //render the _index_ template with the meals attribute as meals (from DB)
  res.render("menu", { meals: meals });
});

/* GET order page. */
router.get("/meals/:mealID/order", async function (req, res, next) {
  console.log(`meal_id is ${req.params.mealID}`)
  console.log(`user_id is ${req.user.id}`)

  const meal = await myDB.getMeal(req.params.mealID);
  const pickups = await myDB.getPickup();
  const locations = await myDB.getLocations();

  console.log("got meal", meal);
  //render the order template with the meal attribute (created by getMeal)
  res.render("order", { meal: meal, pickups: pickups, locations: locations});
                      //^ var to be used in order.ejs
});

/* POST order page. */
router.post("/order", async function (req, res, next) {
  const userID = req.user.id;
  const order = req.body;
  console.log("got create order", order);

  await myDB.createOrder(order, userID);
  console.log(`Order created`);

  res.redirect("/confirmation");

});

/* GET confirmation page. */
router.get("/confirmation", async function (req, res, next) {

  //const payment = await myDB.getOrder(req.params.brandID);
  res.render("confirmation");

});

module.exports = router;
