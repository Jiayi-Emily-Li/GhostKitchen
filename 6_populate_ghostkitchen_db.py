# created by Katerina Bosko

from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import sqlite3
import random

# ------------------------
# PART 1 - GENERATING DATA
# ------------------------

### GENERATING DATA FOR ORDER TABLE ####

# assumption - goal 50 orders/hour means
# 10 orders per hour per location * ~10 hours of operation * 5 locations = 500 orders
order_id = [i for i in range(1,501)]

# assumption - chain has 5 restaurants
location_id = np.random.randint(1, 6, size=500)

# assumption - every order was created by unique customer
customer_id = np.random.randint(1, 501, size=500)

# assumption - currently 3 meals to order - pizza, burger, chicken wings
meal_id = np.random.randint(1, 4, size=500)

# assumption - customer can order up to 3 items at same time
quantity = np.random.randint(1, 3, size=500)

# assumption - opening hours from 9:00 till 21:00, last order at 20:00
hours = np.random.randint(9, 22, size=500)
minutes = np.random.randint(0, 59, size=500)
seconds = np.random.randint(0, 59, size=500)

# assumption - create order time for 1 day
order_time = []
for hour, minute, second in zip(hours, minutes, seconds):
    order_time.append("2021-10-26 {:02d}:{:02d}:{:02d}".format(hour, minute, second))

#assumption - wait times depend on preparation time + or - 10 minutes
wait_time_mins = []
for meal in meal_id:
    # pizza
    if meal == 1:
        prep_time = 35
    # burger
    if meal == 2:
        prep_time = 25
    # chicken wings
    if meal == 3:
        prep_time = 20
    wait_time_mins.append(prep_time+random.randint(-10,10))

# assumption - pickup time = order time + wait time
pickup_time = []
for time, wait_time in zip(order_time, wait_time_mins):
    order_t = datetime.strptime(time, '%Y-%m-%d %H:%M:%S')
    pickup = order_t + timedelta(minutes=wait_time)
    pickup_time.append(pickup.strftime('%Y-%m-%d %H:%M:%S'))

# assumption - 3 platform apps (Uber Eats, Doordash, GrubHub) + takeout + drive through for a total of 6 pickup types
pickup_type = np.random.randint(1, 6, size=500)

orders_tmp = np.array([order_id, list(location_id),
                   list(customer_id), list(meal_id), order_time, pickup_time,
                   list(quantity), list(pickup_type)])

orders_tmp = orders_tmp.T
# Create the pandas DataFrame
orders = pd.DataFrame(orders_tmp, columns = ['order_id', 'location_id', 'customer_id', 'meal_id', 'order_time', 'pickup_time', 'quantity', 'pickup_type'])

### GENERATING DATA FOR CUSTOMER TABLE ####
# data was generated using the website https://www.mockaroo.com/
customers = pd.read_csv("customers_mock.csv")

# assumption - customers are from 16 to 60 years old
age = np.random.randint(16, 60, size=500)
customers['age'] = age


#### GENERATING RATING TABLE #####
# assumption - rating can be 1 to 5 stars;
# not every customer left a rating, let's say only 169 out of 300 customers did
rating_id = [i for i in range(1,170)]
meal_id_for_rating = np.random.randint(1, 4, size=169)
customer_id_for_rating = np.random.randint(1, 500, size=169)

rating = list(np.random.randint(1, 6, size=169))

rating_tmp = np.array([rating_id, list(meal_id_for_rating), list(customer_id_for_rating), list(rating)])
rating_tmp = rating_tmp.T

# Create the pandas DataFrame
rating = pd.DataFrame(rating_tmp, columns = ['rating_id', 'meal_id', 'customer_id', 'rating'])

# ------------------------
# PART 2 - POPULATING DATA
# ------------------------

conn = sqlite3.connect('ghost_kitchen.db')
cur = conn.cursor()

# Customer table
cur.execute("DROP TABLE IF EXISTS Customer")
cur.execute('''CREATE TABLE "Customer" (
	            "id"	INTEGER NOT NULL,
	            "first_name"	TEXT NOT NULL,
	            "last_name"	TEXT NOT NULL,
	            "address"	TEXT NOT NULL,
	            "phone_number"	TEXT NOT NULL,
	            "age"	INTEGER,
	            PRIMARY KEY("id" AUTOINCREMENT)
            );''')


for customer in customers.itertuples(index=True, name='Pandas'):
    cur.execute(f'''INSERT INTO Customer (id, first_name, last_name, address,
                    phone_number, age)
                    VALUES (?, ?, ?, ?, ?, ?);''',
                (int(customer[1]),
                 customer[2],
                 customer[3],
                 customer[4],
                 customer[5],
                int(customer[6])))

# Location table
cur.execute("DROP TABLE IF EXISTS Location")
cur.execute('''CREATE TABLE "Location" (
                "id"	INTEGER NOT NULL,
                "address"	TEXT NOT NULL,
                "state"	TEXT NOT NULL,
                "phone_number"	TEXT NOT NULL,
                PRIMARY KEY("id" AUTOINCREMENT)
            );''')


cur.execute(f'''INSERT INTO Location (id, address, state, phone_number)
                    VALUES
                (1, "3650 Rosecrans Street, San Diego","CA", "450-345-8924"),
                (2, "5198 Commons Drive, Denver", "CO", "370-529-8023"),
                (3, "2521 Palomar Airport Rd, Los Angeles", "CA", "293-327-9275"),
                (4, "575 Market St, Seattle", "WA", "293-327-9275"),
                (5, "3410 Via Mercato, Portland", "OR", "331-672-5915")
            ;''')



# Meal table
cur.execute("DROP TABLE IF EXISTS Meal")
cur.execute('''CREATE TABLE "Meal" (
                "id"	INTEGER NOT NULL,
                "meal_name"	TEXT NOT NULL,
                "description"	TEXT,
                "calories"	NUMBER,
                "price"	INTEGER NOT NULL,
                "brand_id"	INTEGER NOT NULL,
                FOREIGN KEY("brand_id") REFERENCES "Virtual_Brand"("id"),
                PRIMARY KEY("id" AUTOINCREMENT)
            );''')



cur.execute(f'''INSERT INTO Meal (id, meal_name, description, calories, price, brand_id)
                    VALUES
                (1, "pizza", "Ground beef, tomato sauce, mozzarella cheese, green pepper", 650, 15.99, 1),
                (2, "burger", "Dill pickle, cheddar cheese, tomato, red onion, ground chuck", 500, 9.99, 3),
                (3, "chicken wings", "Chicken wings, ranch dressing, hot sauce, honey, butter", 700, 7.99, 4)
            ;''')

# Virtual Brand table
cur.execute("DROP TABLE IF EXISTS Virtual_Brand")
cur.execute('''CREATE TABLE "Virtual_Brand" (
                "id"	INTEGER NOT NULL,
                "brand_name"	TEXT NOT NULL,
                PRIMARY KEY("id" AUTOINCREMENT)
            );''')


cur.execute(f'''INSERT INTO Virtual_Brand (id, brand_name)
                    VALUES
                (1, "Romano"),
                (2, "OvenFresh"),
                (3, "Burgertoom"),
                (4, "PsychoWings"),
                (5, "Perltonbury"),
                (6, "Anatomy Kitchen")
            ;''')

# Order table -> couldn't insert into Order table (bc it's keyword), hence renamed into Orders
cur.execute("DROP TABLE IF EXISTS Orders")
cur.execute('''CREATE TABLE Orders (
                "id"	INTEGER NOT NULL,
                "location_id"	INTEGER NOT NULL,
                "customer_id"	INTEGER NOT NULL,
                "meal_id"	INTEGER NOT NULL,
                "order_time"	TEXT NOT NULL,
                "pickup_time"	TEXT NOT NULL,
                "quantity"	INTEGER NOT NULL DEFAULT 1,
                "pickup_id"	INTEGER NOT NULL,
                PRIMARY KEY("id" AUTOINCREMENT),
                FOREIGN KEY("location_id") REFERENCES "Location"("id"),
                FOREIGN KEY("customer_id") REFERENCES "Customer"("id"),
                FOREIGN KEY("meal_id") REFERENCES "Meal"("id"),
                FOREIGN KEY("pickup_id") REFERENCES "Pickup_Type"("id")
            );''')


for ord in orders.itertuples(index=True, name='Pandas'):
    cur.execute(f'''INSERT INTO Orders (id, location_id, customer_id, meal_id,
                    order_time, pickup_time, quantity, pickup_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?);''',
                   (ord[1], ord[2], ord[3],
                   ord[4], ord[5], ord[6], ord[7], ord[8]))


# Pickup_Type table
cur.execute("DROP TABLE IF EXISTS Pickup_Type")
cur.execute('''CREATE TABLE "Pickup_Type" (
                "id"	INTEGER NOT NULL,
                "type"	TEXT NOT NULL,
                PRIMARY KEY("id" AUTOINCREMENT)
            );''')

cur.execute(f'''INSERT INTO Pickup_Type (id, type)
                VALUES
                (1, "takeout"),
                (2, "drive_through"),
                (3, "Doordash"),
                (4, "UberEats"),
                (5, "GrubHub")
            ;''')

# Rating table
cur.execute("DROP TABLE IF EXISTS Rating")
cur.execute('''CREATE TABLE "Rating" (
                "id"	INTEGER NOT NULL,
                "meal_id"	INTEGER,
                "customer_id"	INTEGER,
                "rating"	INTEGER NOT NULL,
                PRIMARY KEY("id" AUTOINCREMENT),
                FOREIGN KEY("customer_id") REFERENCES "Customer"("id"),
                FOREIGN KEY("meal_id") REFERENCES "Meal"("id"))
            ;''')

for rating in rating.itertuples(index=True, name='Pandas'):
    cur.execute(f'''INSERT INTO Rating (id, meal_id, customer_id, rating)
                    VALUES (?, ?, ?, ?)''',
                   (rating[1], rating[2], rating[3], rating[4]))

conn.commit()
conn.close()
