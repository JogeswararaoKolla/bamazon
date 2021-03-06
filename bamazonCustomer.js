'use strict';
const mysql = require('mysql');
const Table = require('easy-table');
const chalk = require('chalk');
const inquirer = require('inquirer');
const moment = require('moment');
require('dotenv').config();
//  const dotenv=require('dotenv');
//  const result=dotenv.config();
// if (result.error) {
//   throw result.error
//  }
//  console.log(result.parsed)

let tableRow = new Table;
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'bamazon'
});

connection.connect(function (err, res) {
  if (err) throw err;
  // console.log(chalk.blue("Database connected!"));
  mainList();
});

function mainList() {
  inquirer
    .prompt([
      {
        name: "action",
        type: "rawlist",
        message: "Welcome to BAMAZON Store CustomerView!",
        choices: [
          "View Products for sale",
          "Buy Products",
          "Exit App"
        ]
      }
    ])
    .then(function (answers) {
      switch (answers.action) {
        case 'View Products for sale': viewProducts(); break;
        case 'Buy Products': buyProduct(); break;
        case 'Exit App': exit(); break;
      }
    });
}

function exit() {
  console.log("Exiting the BAMAZON App..");
  disconnectDatabase();
}

function viewProducts() {
  connection.query("SELECT * from bamazon.products", function (err, res) {
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

function buyProduct() {
  inquirer
    .prompt([
      {
        type: 'number',
        name: 'productID',
        message: 'ID of the product they would like to buy?',
        validate: function (value) {
          const valueCheck = parseInt(value);
          if (!valueCheck) {
            return 'Please enter Valid ProductID!';
          }
          return true;
        }
      },
      {
        type: 'number',
        name: 'qnty',
        message: 'how many units of the product would like to buy ?',
        default: 1,
        validate: function (qnty) {
          const qtyCheck = parseInt(qnty);
          if (!qtyCheck) {
            return 'Please enter Valid number!!';
          }
          return true;
        }
      }
    ])
    .then(function (answers) {
      const query = "SELECT price,department_id,product_name,stock_quantity FROM PRODUCTS WHERE item_id=? and stock_quantity>=?";
      connection.query(query, [answers.productID, answers.qnty], function (errors, results, fields) {
        if (errors) throw errors;
        if (!results.length) {
          console.log("Insufficient quantity!");
          disconnectDatabase();
        }
        results.forEach(function (element) {
          const remaningQtny = element.stock_quantity - answers.qnty;
          connection.query("UPDATE products SET ? where ?", [{ stock_quantity: remaningQtny }, { item_id: answers.productID }], function (errors, results, fields) {
            if (errors) throw errors;
            const orderID = 'BAMZN-ID-' + answers.productID + '-' + moment().format("X");
            const totalCost = (answers.qnty * element.price).toFixed(2);
            const query_2 = connection.query(
              "INSERT INTO orders SET ?",
              {
                orderid: orderID,
                orderdate: moment().format("YYYY-MM-DD"),
                item_id: answers.productID,
                order_qtny: answers.qnty,
                department_id: element.department_id,
                totalprice: totalCost
              },
              function (err, res) {
                if (err) throw err;
                console.log(res.affectedRows + " Order inserted!\n");
                tableRow.cell('OrderID', orderID);
                tableRow.cell('ProductName', element.product_name);
                tableRow.cell('Price', element.price);
                tableRow.cell('Qnty', answers.qnty);
                tableRow.cell('TotalCost', totalCost);
                tableRow.newRow();
                console.log("Your order placed successfully!");
                console.log(tableRow.toString());
                disconnectDatabase();
              }
            );
            // logs the actual query being run
            // console.log(query_2.sql);
          });

        });

      });

    });
}

function disconnectDatabase() {
  connection.end(function (err, res) {
    if (err) throw err;
    // console.log(chalk.red("Database Disconnected!"));
  });
}
