'use strict';
const mysql = require('mysql');
const Table = require('easy-table');
const chalk = require('chalk');
const inquirer = require('inquirer');
const moment = require('moment');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: 'bamazon'
  });

  let tableRow = new Table;

function mainSupervisorList() {
    inquirer
        .prompt([{
            type: 'rawlist',
            name: 'options',
            message: 'Welcome to BAMAZON Store SupervisorView!',
            choices: [
                "View Product Sales by Department",
                "Create New Department"
            ]
        }])
        .then(function (answers) {
            console.log(answers);
            switch (answers.options) {
                case "View Product Sales by Department": viewSalesByDepartment(); break;
                case "Create New Department": createNewDepartment(); break;
            }
        });
}

function viewSalesByDepartment() {
    console.log("View Sales By Department");
    connection.query("select a.department_id,b.department_name,b.over_head_costs,sum(a.totalprice) as product_sales ," + 
    "sum(a.totalprice) -  b.over_head_costs as total_profit from orders a inner join departments b on " +
    "a.department_id=b.department_id  group by a.department_id,b.department_name,b.over_head_costs " +
    "order by a.department_id,b.department_name,b.over_head_costs;",function(err,results,fields){
    results.forEach((value,index,arr)=>{
        tableRow.cell("DepartmentID",value.department_id)
        tableRow.cell("DepartmentName",value.department_name)
        tableRow.cell("OverheadCosts",value.over_head_costs.toFixed(2))
        tableRow.cell("ProductSales",value.product_sales.toFixed(2))
        tableRow.cell("TotalProfit",value.total_profit.toFixed(2))
        tableRow.newRow()
    });
     console.log(tableRow.toString());

    });
    disconnectDatabase();
}
function createNewDepartment(){
    console.log("create New Department");
}

function disconnectDatabase() {
    connection.end(function (err, res) {
      if (err) throw err;
      console.log(chalk.red("Database Disconnected!"));
    });
  }

connection.connect(function(err,res){
 if(err) throw err;
 console.log(chalk.blue("Database Connected!"));
 mainSupervisorList();
});
