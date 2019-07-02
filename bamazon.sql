DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;
USE bamazon_db;

-- Creating our table of Products
CREATE TABLE products (
  item_id INT AUTO_INCREMENT NOT NULL,
  product_name VARCHAR(100) NULL,
  department_name VARCHAR(100) NULL,
  price DECIMAL(10,2) NULL,
  stock_quantity INT NULL,
  product_sales DECIMAL(10,2) DEFAULT 0,
  PRIMARY KEY (item_id)
);

-- Pre-Populating our table with our available products
INSERT INTO products (product_name, department_name, price, stock_quantity, product_sales)
VALUES ("Romeo and Juliet", "Books", 19.99, 25, 5),
("Taming of the Shrew", "Books", 14.99, 25, 5),
("The Count of MonteCristo", "Books", 7.99, 25, 5),
("Playstation 4", "Gaming Systems", 299.99, 50, 5),
("Xbox One", "Gaming Systems", 349.99, 50, 5),
("Nintendo Switch", "Gaming Systems", 249.99, 40, 5),
("FireTV Cube", "Home Automation", 129.99, 100, 5),
("Google Home", "Home Automation", 147.99, 100, 5),
("Nest Thermostat", "Home Automation", 179.99, 75, 5),
("Jordan Retro 11's", "Sneakers", 139.99, 12, 5),
("Nike Dunk SB Low Paris", "Sneakers", 30000.00, 1, 0),
("Nike Air Max 270 SE Floral", "Sneakers", 159.99, 15, 5);

-- Creating Departments table
CREATE TABLE departments (
  department_id INT AUTO_INCREMENT NOT NULL,
  department_name VARCHAR(100) NULL,
  over_head_costs DECIMAL(10,2) NULL,
  PRIMARY KEY (department_id)
);

-- Setting Departments table defaults, over_head_costs set to a random number
INSERT INTO departments (department_name, over_head_costs)
VALUES ("Books", 2000), ("Gaming Systems", 10000), ("Home Automation", 10000), ("Sneakers", 50000);


