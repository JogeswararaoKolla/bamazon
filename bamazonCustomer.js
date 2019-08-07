const mysql=require('mysql');
const  Table = require('easy-table');
const  Rownew = new Table;
const connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'bootcamp123',
    database:'bamazon'
});

connection.connect(function(err,res){
    if(err) throw err; 
    console.log("Database connected!");
});

connection.query("SELECT * from bamazon.products",function(err,res){
    if(err)  throw err;
    console.log(res);

    res.forEach(function(resObj) {
        Rownew.cell('Item Id', resObj.item_id)
        Rownew.cell('Product Name', resObj.product_name)
        Rownew.cell('Price', resObj.price,Table.number(2))
        Rownew.cell('Quantity',resObj.stock_quantity)
        Rownew.cell('Department Name',resObj.department_name)
        Rownew.cell('Created Time',resObj.created_timestamp)
        Rownew.newRow()
      });
console.log(Rownew.toString());


})

connection.end(function(err,res){
    if(err) throw err; 
    console.log("Database Disconnected!");
});