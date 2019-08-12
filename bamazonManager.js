'use strict';
const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('easy-table');
const chalk = require('chalk');
const moment = require('moment');
require('dotenv').config();
let tableRow = new Table;

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'bamazon'
});

connection.connect(function (err, res) {
    if (err) throw err;
    // console.log(chalk.blue("Database Connected!"));
    mainManagerList();
});

function mainManagerList() {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'options',
                message: 'Welcome to BAMAZON Store ManagerView!',
                choices: [
                    "View Products for Sale",
                    "View Low Inventory",
                    "Add to Inventory",
                    "Add New Product",
                    "Exit App"
                ]
            }

        ])
        .then(function (answers) {
            console.log(answers);
            switch (answers.options) {
                case "View Products for Sale": Products(); break;
                case "View Low Inventory": LowInventoryProducts(); break;
                case "Add to Inventory": AddtoInventory(); break;
                case "Add New Product": AddNewProduct(); break;
                case "Exit App": exit(); break;
            }
        });
}

function exit() {
    console.log("Exiting the BAMAZON App..");
    disconnectDatabase();
  }

function AddNewProduct() {
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'productName',
                message: 'Please enter the product name to add to Inventory?',
                validate: function (value) {
                    if (!value.length) {
                        return 'Please enter Valid text!';
                    }
                    return true;
                }

            },
            {
                type: 'input',
                name: 'departmentID',
                message: 'Please enter the Department ID of product to add to Inventory?',
                validate: function (value) {
                    if (!value.length) {
                        return 'Please enter Valid text!';
                    }
                    return true;
                }

            },
            {
                type: 'number',
                name: 'qnty',
                message: 'Please enter the product Qnty (default set to 1) to add to Inventory?',
                default: 1,
                validate: function (value) {
                    const valueCheck = parseInt(value);
                    if (!valueCheck) {
                        return 'Please enter Valid number!';
                    }
                    return true;
                }
            },
            {
                type: 'number',
                name: 'price',
                message: 'Please enter the product price (default set to 1) to add to Inventory?',
                default: 1,
                validate: function (value) {
                    const valueCheck = parseFloat(value);
                    if (!valueCheck) {
                        return 'Please enter Valid number!';
                    }
                    return true;
                }
            }

        ])
        .then(function (answers) {
            console.log(answers);
            // insert into bamazon.products (product_name,department_id,price,stock_quantity) values ('Iphone','01',850,25);
            let insertObj={};
            insertObj.product_name=answers.productName;
            insertObj.department_id=answers.departmentID;
            insertObj.price=answers.price;
            insertObj.stock_quantity=answers.qnty;
            console.log(insertObj);

            const query = connection.query("INSERT INTO products SET ?;",
                insertObj,
                function (err, res, fields) {
                    if (err) throw err;
                    console.log(query.sql);
                    disconnectDatabase();
                });
        });
}

function AddtoInventory() {

    inquirer
        .prompt([
            {
                type: 'number',
                name: 'productID',
                message: 'ID of the product they would like to Update?',
                validate: function (value) {
                    const valueCheck = parseInt(value);
                    if (!valueCheck) {
                        return 'Please enter Valid number!';
                    }
                    return true;
                }
            },
            {
                type: 'number',
                name: 'qnty',
                message: 'Units of the product would like to Update if needed otherwise press enter ?',
                default: 1,
                validate: function (value) {
                    const valueCheck = parseInt(value);
                    if (!valueCheck) {
                        return 'Please enter Valid number!';
                    }
                    return true;
                }
            },
            {
                type: 'number',
                name: 'price',
                message: 'Price of the product would like to Update if needed otherwise press enter ?',
                default: 1,
                validate: function (value) {
                    const valueCheck = parseFloat(value);
                    if (!valueCheck) {
                        return 'Please enter Valid number!';
                    }
                    return true;
                }
            }
        ])
        .then(function (answers) {
            console.log(answers);
            const query = "SELECT * FROM bamazon.products  WHERE item_id=?";
            connection.query(query, [answers.productID], function (errors, results, fields) {
                if (errors) throw errors;
                console.log(results);
                if (!results.length) {
                    console.log(`Not valid product ID :${answers.productID}`);
                    disconnectDatabase();
                }
                else {
                    let updateObj = {};
                    if (answers.qnty == 1 && answers.price == 1) {
                        console.log("Nothing to Update.. Please update atleast one field qnty or price");
                        disconnectDatabase();
                    }
                    else {
                        if (answers.qnty > 1) {
                            updateObj.stock_quantity = answers.qnty;
                        }
                        if (answers.price > 1) {
                            updateObj.price = answers.price;
                        }
                        console.log(updateObj);
                        connection.query("UPDATE products SET ? where ?", [updateObj, { item_id: answers.productID }], function (errors, results, fields) {
                            if (errors) throw errors;
                        });
                        disconnectDatabase();
                    }

                }
            });

        });
}

function Products() {
    connection.query("SELECT * from bamazon.products;", function (err, res) {
        if (err) throw err;
        res.forEach(function (resObj) {
            tableRow.cell('ItemId', resObj.item_id)
            tableRow.cell('ProductName', resObj.product_name)
            tableRow.cell('Price', resObj.price, Table.number(2))
            tableRow.cell('Quantity', resObj.stock_quantity)
            tableRow.cell('DepartmentName', resObj.department_id)
            tableRow.cell('DateTimeCreated', moment(resObj.created_timestamp).format('LLL'))
            tableRow.newRow()
        });
        console.log(tableRow.toString());
    });
    disconnectDatabase();
}


function LowInventoryProducts() {
    connection.query("SELECT * from bamazon.products where stock_quantity < 5;", function (err, res) {
        if (err) throw err;
        res.forEach(function (resObj) {
            tableRow.cell('ItemId', resObj.item_id)
            tableRow.cell('ProductName', resObj.product_name)
            tableRow.cell('Price', resObj.price, Table.number(2))
            tableRow.cell('Quantity', resObj.stock_quantity)
            tableRow.cell('DepartmentName', resObj.department_id)
            tableRow.cell('LstUpdtdTime', moment(resObj.lst_updt_timestamp).format('LLL'))
            tableRow.newRow()
        });
        console.log(tableRow.toString());
    });
    disconnectDatabase();
}

function disconnectDatabase() {
    connection.end(function (err, res) {
        if (err) throw err;
        // console.log(chalk.red("Database Disconnected!"));
    });
}

