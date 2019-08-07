
drop database bamazon;
create database if not exists bamazon;

use bamazon;

create table bamazon.products(
item_id int not null AUTO_INCREMENT primary key,
product_name varchar(40) not null,
department_name varchar(30) not null,
price DECIMAL(10,2)  not null,
stock_quantity INT not null,
sellerUser varchar(30) not null,
created_timestamp DATETIME not null default current_timestamp,
lst_updt_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   constraint price_constraint_1 CHECK (price>=1)
);

alter table bamazon.products AUTO_INCREMENT=2201;

create table bamazon.orders(
orderid varchar(30) not null primary key ,
orderdate date not null,
order_create_timestamp DATETIME not null default CURRENT_TIMESTAMP,
item_id int not null,
product_name varchar(40) not null,
price DECIMAL(10,2)  not null
 );

 
