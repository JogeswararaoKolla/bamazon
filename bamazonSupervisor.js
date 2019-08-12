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
                "Create New Department",
                "Remove a Department",
                "Exit App"
            ]
        }])
        .then(function (answers) {
            console.log(answers);
            switch (answers.options) {
                case "View Product Sales by Department": SalesByDepartment(); break;
                case "Create New Department": createNewDepartment(); break;
                case "Remove a Department": removeDepartment(); break;
                case 'Exit App': exit(); break;
            }
        });
}

function exit() {
    console.log("Exiting the BAMAZON App..");
    disconnectDatabase();
  }

function removeDepartment(){
    inquirer
    .prompt([
        {
            type: 'input',
            name: 'department_id',
            message: 'Please enter department_id to be Deleted?',
            validate: function (value) {
                if (value.length < 1) {
                    return "Please enter text!!"
                }
                return true;
            }
        }
    ])
    .then(function(answers){

      connection.query("delete from departments where ?",{department_id:answers.department_id},function(errors,results,fields){
       if(errors) throw errors;
        console.log(`Department ${answers.department_id} got deleted sucessfully!`);
        disconnectDatabase();
      });
       
    });

}


function SalesByDepartment() {
    console.log("View Sales By Department");
    connection.query("select a.department_id,a.department_name,a.over_head_costs,sum(IFNULL(b.totalprice,0)) as product_sales ," +
        "IFNULL(sum(b.totalprice) -  a.over_head_costs,0) as total_profit from   departments a left outer join orders b  on " +
        "a.department_id=b.department_id  group by a.department_id,a.department_name,a.over_head_costs " +
        "order by a.department_id,a.department_name,a.over_head_costs;",
        function (err, results, fields) {
            results.forEach((value, index, arr) => {
                tableRow.cell("DepartmentID", value.department_id)
                tableRow.cell("DepartmentName", value.department_name)
                tableRow.cell("OverheadCosts", value.over_head_costs.toFixed(2))
                tableRow.cell("ProductSales", value.product_sales.toFixed(2))
                tableRow.cell("TotalProfit", value.total_profit.toFixed(2))
                tableRow.newRow()
            });
            console.log(tableRow.toString());

        });
    disconnectDatabase();
}
function createNewDepartment() {
    console.log("create New Department");
    inquirer.prompt([
        {
            type: 'input',
            name: 'department_id',
            message: 'Value of the department_id?',
            validate: function (value) {
                if (value.length < 1) {
                    return "Please enter a department_id!!"
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'department_name',
            message: 'Value of the department_name?',
            validate: function (value) {
                if (value.length < 1) {
                    return "Please enter a department_name!!"
                }
                return true;
            }
        }
        ,
        {
            type: 'number',
            name: 'over_head_costs',
            message: 'Value of the over_head_costs?',
            validate: function (value) {
                if (!parseInt(value)) {
                    return "Please enter a valid number for over_head_costs!!"
                }
                return true;
            }
        }
    ])
        .then(function (answers) {
            console.log(answers);
            const query = connection.query("INSERT INTO departments SET ?;",
                {
                    department_id: answers.department_id,
                    department_name: answers.department_name,
                    over_head_costs: answers.over_head_costs
                },
                function (err, res, fields) {
                    if (err) throw err;
                    console.log(query.sql);
                    disconnectDatabase();
                });

        });
}

function disconnectDatabase() {
    connection.end(function (err, res) {
        if (err) throw err;
        // console.log(chalk.red("Database Disconnected!"));
    });
}

connection.connect(function (err, res) {
    if (err) throw err;
    // console.log(chalk.blue("Database Connected!"));
    mainSupervisorList();
});
