CREATE TABLE "Customer" (
	"id"	INTEGER NOT NULL,
	"first_name"	TEXT NOT NULL,
	"last_name"	TEXT NOT NULL,
	"address"	TEXT NOT NULL,
	"phone_number"	TEXT NOT NULL,
	"age"	INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT)
);


CREATE TABLE "Location" (
    "id"	INTEGER NOT NULL,
    "address"	TEXT NOT NULL,
    "state"	TEXT NOT NULL,
    "phone_number"	TEXT NOT NULL,
    PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "Meal" (
    "id"	INTEGER NOT NULL,
    "meal_name"	TEXT NOT NULL,
    "description"	TEXT,
    "calories"	NUMBER,
    "price"	INTEGER NOT NULL,
    "brand_id"	INTEGER NOT NULL,
    FOREIGN KEY("brand_id") REFERENCES "Virtual_Brand"("id"),
    PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "Virtual_Brand" (
	"id"	INTEGER NOT NULL,
	"brand_name"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "Orders" (
	"id"	INTEGER NOT NULL,
	"location_id"	INTEGER NOT NULL,
	"customer_id"	INTEGER NOT NULL,
	"meal_id"	INTEGER NOT NULL,
	"order_time"	TEXT NOT NULL,
	"pickup_time"	TEXT NOT NULL,
	"quantity"	INTEGER NOT NULL DEFAULT 1,
	"pickup_id"	INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("meal_id") REFERENCES "Meal"("id"),
	FOREIGN KEY("pickup_id") REFERENCES "Pickup_Type"("id"),
	FOREIGN KEY("customer_id") REFERENCES "Customer"("id"),
	FOREIGN KEY("location_id") REFERENCES "Location"("id")
);

CREATE TABLE "Pickup_Type" (
	"id"	INTEGER NOT NULL,
	"type"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);

CREATE TABLE "Rating" (
	"id"	INTEGER NOT NULL,
	"meal_id"	INTEGER,
	"customer_id"	INTEGER,
	"rating"	INTEGER NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("customer_id") REFERENCES "Customer"("id"),
	FOREIGN KEY("meal_id") REFERENCES "Meal"("id")
);