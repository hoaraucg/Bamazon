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
	console.log("Welcome to Bamazon!\n");
	start();
});

// Function that begins with User Input
function start() {

    // Inquirer setting up our Inputs
	inquirer.prompt([
		{
			name: "input",
			type: "list",
			choices: ["View all items for sale", "Exit Bamazon"],
			message: "Please select what you would like to do."
		}
	]).then(function(answer) {
		if (answer.input === "View all items for sale") {
			viewItems();
		} else if (answer.input === "Exit Bamazon") {
			exit();
		}
	});
}

// Function when user selects to View all products
function viewItems() {

    // SQL Query grabbing all products from the products table
    var query = "SELECT * FROM products";
    
    //Querying the Database
	connection.query(query, function(err, res) {

		if (err) throw err;

        // Setting up the results in the console.table NPM
		consoleTable(res);

        // Asking the user to select their item for purchase
		inquirer.prompt([
			{
				name: "id",
				message: "Please enter the ID of the item that you would like to purchase.",

				validate: function(value) {
					if (value > 0 && isNaN(value) === false && value <= res.length) {
						return true;
					}
					return false;
				}
			},
			{
                // Asking the user to select the quantity they would like
				name: "qty",
				message: "How many would you like to purchase?",
				validate: function(value) {
					if (value > 0 && isNaN(value) === false) {
						return true;
					}
					return false;
				}
			}
		]).then(function(transaction) {

			var itemQty;
			var itemPrice;
			var itemName;
			var productSales;

			for (var j = 0; j < res.length; j++) {
				if (parseInt(transaction.id) === res[j].item_id) {
					itemQty = res[j].stock_quantity;
					itemPrice = res[j].price;
					itemName = res[j].product_name;
					productSales = res[j].product_sales;
				}
			}
            // Checking to see if there is enough stock to perform the order
			if (parseInt(transaction.qty) > itemQty) {
				console.log("\nWe don't have enough stock for that order. We have " 
					+ itemQty + " in stock. Try again.\n");
				start();
			} 
            // If quantity is under stock, perform the transaction
			else if (parseInt(transaction.qty) <= itemQty) {
				console.log("\nYou successfully purchased " + transaction.qty 
					+ " of " + itemName + ".");
				lowerQty(transaction.id, transaction.qty, itemQty, itemPrice);
				salesRevenue(transaction.id, transaction.qty, productSales, itemPrice);
			}
		});
	});
}

// Setting up the Table
function consoleTable(res) {

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

	console.table("\nItems for Sale", values);
}

// Updating the database with the new amount of the item purchased
function lowerQty(item, purchaseQty, stockQty) {

	connection.query(
		"UPDATE products SET ? WHERE ?", 
		[
			{
				stock_quantity: stockQty - parseInt(purchaseQty)
			},
			{
				item_id: parseInt(item)
			}
		],

		function(err, res) {
			if (err) throw err;
	});
}

// Updating Sales for the items purchased
function salesRevenue(item, purchaseQty, productSales, price) {
	var customerCost = parseInt(purchaseQty) * price;

	connection.query(
		"UPDATE products SET ? WHERE ?", 
		[
			{
				product_sales: productSales + customerCost
			}, 
			{
				item_id: parseInt(item)
			}
		], 
		function(err, res) {
			if (err) throw err;

			console.log("The total price is $" + customerCost + "\n");
			start();
	});
}

// Exit back to terminal CLI
function exit() {
	connection.end();
}