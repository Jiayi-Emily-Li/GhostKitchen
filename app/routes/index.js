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
/* GET admin page. */
router.get("/admin", async function (req, res, next) {
  res.render("admin");
});

/* GET admin (orders) page. */
router.get("/admin/orders", async function (req, res, next) {
  const orders = await myDB.getAllCurrentOrders();
  console.log("got orders", orders);
  res.render("adminOrders", {orders: orders});
});

/* POST admin (orders) page. */
router.post("/admin/orders/:orderID/update", async function (req, res, next) {

  const orderID = req.body.orderID;

  await myDB.updatePickupTime(orderID);

  console.log("pickup time updated");
  res.redirect("/admin/orders");
});



/* GET Admin (brands) page. */
router.get("/admin/brands", async function (req, res, next){

  console.log("Got GET request for brands");

  const brands = await myDB.getBrands();

  console.log("got brands", brands);

  //render the _adminBrands_ template with the brands attribute as brands (from DB)
  res.render("adminBrands", { brands: brands });
});

/*GET Admin (meals) page. */
router.get("/admin/brands/:brandID/meals", async function (req, res, next) {
  //params come with GET, brandID is in params
  console.log("Got request for meals page.");

  const brandID = req.params.brandID;
  console.log(`brandId is ${brandID}`);


  const meals = await myDB.getMealsBy(brandID);
  const brands = await myDB.getBrandsBy(brandID);

  //render the _adminMeals_ template with the meals attribute as meals (from DB)
  res.render("adminMeals", { meals: meals, brands: brands});
});


/*POST create meals. */
router.post("/admin/meals/create", async function (req, res, next) {
  console.log("Got post create/meal");

  const meal = req.body;
  const brandID = req.body.brandID;
  console.log(`expect${brandID}`);
  console.log("got create meal", meal);

  await myDB.createMeal(meal, brandID);

  console.log("Meal created");


  res.redirect(`/admin/brands/${brandID}/meals`);
});

/* POST delete meal. */
router.post("/admin/meals/delete", async function (req, res) {
  console.log("Got post delete meal");

  const brandIDtoDelete = req.body.brandID;
  const mealIDtoDelete = req.body.mealID;

  console.log(`will delete brandID: ${brandIDtoDelete}`);
  console.log(`will delete mealID: ${mealIDtoDelete}`);


  await myDB.deleteMeal(brandIDtoDelete, mealIDtoDelete);

  console.log("Meal deleted");

  res.redirect(`/admin/brands/${brandIDtoDelete}/meals`);
});


/* GET update adminMeals page. */
router.get("/admin/meals/:mealID", async function (req, res, next) {
  console.log("Got adminMeals update");

  const mealID = req.params.mealID;
  const brandID = req.body.brandID;

  console.log("got meal details", mealID);

  const mealDetails = await myDB.getMeal(mealID);

  console.log("meal details", mealDetails);
  res.render("mealUpdate", {
    mealDetails: mealDetails, brandID: brandID
  });
});

/* POST update adminMeals page. */
router.post("/admin/meals/:mealID", async function (req, res, next) {
  console.log("got update POST request");
  console.log(req.body);

  const mealID = req.body.mealID;

  const brandID = req.body.brandID;
  const meal_name = req.body.meal_name;
  const description = req.body.description;
  const calories = req.body.calories;
  const price = req.body.price;

  await myDB.updateMeal(mealID, brandID, meal_name, description, calories, price);

  console.log(`Meal updated`);
  res.redirect(`/admin/brands/${brandID}/meals`);
});
/* -------Jiayi-------*/


/* GET brands page. */
router.get("/user/brands", async function (req, res, next) {

  const brands = await myDB.getBrands();

  console.log("got brands", brands);

  //render the _index_ template with the meals attribute as meals (from DB)
  res.render("brands", { brands: brands });
});


/* GET menu page. */
router.get("/user/brands/:brandID/menu/", async function (req, res, next) {

  console.log("Got GET request for menu");
  const brand_ID = req.params.brandID;
  console.log(`brandId is ${brand_ID}`);

  const meals = await myDB.getMealsBy(brand_ID);

  //render the _index_ template with the meals attribute as meals (from DB)
  res.render("menu", { meals: meals, brandID: brand_ID});
});


/* GET order page. */
router.get("/user/brands/:brandID/menu/:mealID/order/", async function (req, res, next) {
  console.log(`meal_id is ${req.params.mealID}`)
  console.log(`user_id is ${req.user.id}`)

  const brandID = req.params.brandID;
  const meal = await myDB.getMeal(req.params.mealID);
  const pickups = await myDB.getPickup();
  const locations = await myDB.getLocations();

  console.log("got meal", meal);
  //render the order template with the meal attribute (created by getMeal)
  res.render("order", { meal: meal, pickups: pickups, locations: locations, brandID: brandID});
                      //^ var to be used in order.ejs
});

/* POST order page. */
router.post("/user/brands/:brandID/menu/:mealID/order/create", async function (req, res, next) {
  const userID = req.user.id;
  const order = req.body;
  console.log("got create order", order);

  await myDB.createOrder(order, userID);
  console.log(`Order created`);

  res.redirect("/user/confirmation");

});

/* GET confirmation page. */
router.get("/user/confirmation", async function (req, res, next) {
  res.render("confirmation");
});


/* GET orders page. */
router.get("/user/orders", async function (req, res, next) {
  const user = req.user;
  const orders = await myDB.getOrdersBy(user.id)
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
  console.log("got update request");
  console.log(req.body);

  const userID = req.user.id;
  const orderID = req.body.orderID;
  const quantity = req.body.quantity;
  const pickupID = req.body.pickup;

  await myDB.updateOrder(orderID, quantity, pickupID, userID);

  console.log(`Order updated`);
  res.redirect("/user/orders");
});

module.exports = router;
