'use strict';
const mysql = require('mysql');
const Table = require('easy-table');
const chalk = require('chalk');
const inquirer = require('inquirer');
require('dotenv').config();
//  const dotenv=require('dotenv');
//  const result=dotenv.config();
// if (result.error) {
//   throw result.error
//  }
//  console.log(result.parsed)

const Rownew = new Table;
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: 'bamazon'
});


inquirer
  .prompt([
    /* Pass your questions in here */
    {
      type: 'confirm',
      name: 'confirmToBuy',
      message: 'Would you like you to see products available to Buy?',
      default: false
    },
    {
      type: 'number',
      name: 'productID',
      message: 'ID of the product they would like to buy?'
    },
    {
      type: 'number',
      name: 'qnty',
      message: 'how many units of the product would like to buy ?',
      default: function(response) {
        console.log(response);
        return response.confirmToBuy ? 1 : 0;
      },
      validate: function(qnty) {
        const qtyCheck=parseInt(qnty);
        if (!qtyCheck) {
          return 'Please enter Valid number!!';
        }
        return true;
      }
  }
  ])
  .then(answers => {
    // Use user feedback for... whatever!!
    console.log(answers);

    if (answers.confirmToBuy) {
      connection.connect(function (err, res) {
        if (err) throw err;
        console.log(chalk.blue("Database connected!"));
      });

      connection.query("SELECT * from bamazon.products", function (err, res) {
        if (err) throw err;
        res.forEach(function (resObj) {
          Rownew.cell('Item Id', resObj.item_id)
          Rownew.cell('Product Name', resObj.product_name)
          Rownew.cell('Price', resObj.price, Table.number(2))
          Rownew.cell('Quantity', resObj.stock_quantity)
          Rownew.cell('Department Name', resObj.department_name)
          Rownew.cell('Created Time', resObj.created_timestamp)
          Rownew.newRow()
        });

        console.log(Rownew.toString());
      });

      connection.end(function (err, res) {
        if (err) throw err;
        console.log(chalk.red("Database Disconnected!"));
      });
    }

  });
