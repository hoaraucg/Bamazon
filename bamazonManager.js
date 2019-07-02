// Installing required NPM Packages
var inquirer = require("inquirer");
var mysql = require("mysql");
var console_Table = require("console.table");

// Creating variable for database Connection
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
    password: "",
	database: "bamazon_db"
});

// Connecting to the database and performing our beginning Function
connection.connect(function(err){
	if (err) throw err;
	console.log("Bamazon Manager!\n");
	start();
});

// Function that begins with Manager Input
function start() {

    // Inquirer setting up our Inputs
	inquirer.prompt([
		 {
		 	name: "action",
		 	type: "list",
		 	choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", 
		 		"Add New Product", "Exit"],
		 	message: "Please select what you would like to do."
		 }
	]).then(function(answer) {
		if (answer.action === "View Products for Sale") {
			viewProducts();
		} else if (answer.action === "View Low Inventory") {
			viewLowInventory();
		} else if (answer.action === "Add to Inventory") {
			addToInventory();
		} else if (answer.action === "Add New Product") {
			addNewProduct();
		} else if (answer.action === "Exit") {
			exit();
		}
	})
}

// Function allowing Manager to view all items
function viewProducts() {

	// SQL Query grabbing all products from the products table
    var query = "SELECT * FROM products";
    
	// Querying the Database
	connection.query(query, function(err, res) {

		if (err) throw err;

        // Setting up the results in the console.table NPM
		consoleTable("\nAll Products For Sale", res);

        // Bringing the Manager back to the start Inputs
		start();
	});
}

// Function to view any inventory with a stock less than 5
function viewLowInventory() {

    // SQL Query grabbing only products with a quantity below 5
	var query = "SELECT * FROM products WHERE stock_quantity<5";

    // Querying the Database
	connection.query(query, function(err, res) {

		if (err) throw err;

        // Setting up our results in the console.table NPM
		consoleTable("\nLow Product Inventory Data", res);

        // Bringing the Manager back to the start Inputs
		start();
	});
}

// Function allowing Manager to add to Inventory
function addToInventory() {
	// Querying the Database
	connection.query("SELECT * FROM products", function (err, res) {

		if (err) throw err;
        
        // Setting up our results in the console.table NPM
        consoleTable("\nCurrent Inventory Data", res);
        
		// Inquirer asking Manager to select ID of the item they wish to add Inventory of
		inquirer.prompt([
			{
				name: "id",
				message: "Input the item ID to increase inventory on.",
				validate: function(value) {
					if (isNaN(value) === false && value > 0 && value <= res.length) {
						return true;
					}
					return false;
				}
			},
			{
				name: "amount",
				message: "Input the amount to increase inventory by.",
				validate: function(value) {
					if (isNaN(value) === false && value > 0) {
						return true;
					}
					return false;
				}
			}
		]).then(function(answer) {

			var itemQty;

			for (var i = 0; i < res.length; i++) {
				if (parseInt(answer.id) === res[i].item_id) {
					itemQty = res[i].stock_quantity;
				}
			}
			// Call the function to Increase the Quantity with the Parameters needed
			increaseQty(answer.id, itemQty, answer.amount);
		});
	});
}

// Function that will Increase our Inventory
function increaseQty(item, stockQty, addQty) {

    // Updating the products in the database with the new Stock Quantity
	connection.query(
		"UPDATE products SET ? WHERE ?", 
		[
			{
				stock_quantity: stockQty + parseInt(addQty)
			}, 
			{
				item_id: parseInt(item)
			}
		], 
		function(err, res) {
			if (err) throw err;
			console.log("\nInventory successfully increased.\n");
			start();
	});
}

// Function that will add a New Product
function addNewProduct() {

    // Querying the Database
	connection.query("SELECT * FROM departments", function (err, res) {
        
        // Inquirer requesting Information on new item to add
		inquirer.prompt([
			{
				name: "item",
				message: "Input new item to add."
			},
			{
				name: "department",
				type: "list",
				choices: function() {
                    
                    // Array to be populated
					var deptArray = [];
					// Populating the array with the Department Names
					for (var i = 0; i < res.length; i++) {
						deptArray.push(res[i].department_name);
					}
					// Returns the newly filled array
					return deptArray;
				},
				message: "Which department does this item belong in?"
			},
			{
				name: "price",
				message: "How much does this item cost?",
				validate: function(value) {
					if (value >= 0 && isNaN(value) === false) {
						return true;
					}
					return false;
				}
			},
			{
				name: "inventory",
				message: "How much inventory do we have?",
				validate: function(value) {
					if (value > 0 && isNaN(value) === false) {
						return true;
					}
					return false;
				}			
			}
		]).then(function(newItem) {
			// Function call to complete the database Insert
			addItemToDb(newItem.item, newItem.department, 
				parseFloat(newItem.price), parseInt(newItem.inventory));
		});
	});
}

// Adding the Newly created items to the database
function addItemToDb(item, department, price, quantity) {
    
    // Querying the Database 
	connection.query(
        // Adding the new Item to the Database
		"INSERT INTO products SET ?", 
		{
			product_name: item,
			department_name: department,
			price: price,
			stock_quantity: quantity
		},
		function(err, res) {
			if (err) throw err;
			console.log("\nNew product successfully added.\n");
			start();
	});
}

// Setting up the console.table
function consoleTable(title, res) {

	var values = [];

	for (var i = 0; i < res.length; i++) {

		var resultObject = {
			ID: res[i].item_id,
			Item: res[i].product_name,
			Price: "$" + res[i].price,
            Inventory: res[i].stock_quantity,
            Department: res[i].department_name
		};

		values.push(resultObject);
	}
	// create table titled prod inv data with data in values array
	console.table(title, values);
}

// exit function, says goodbye, ends db connection
function exit() {
	connection.end();
}