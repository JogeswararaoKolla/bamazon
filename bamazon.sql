
drop database bamazon;
create database bamazon;
use bamazon;
drop table bamazon.departments;
create table bamazon.departments( department_id  varchar(10) not null primary key,
department_name varchar(50) not null, over_head_costs decimal(10) not null);

insert into bamazon.departments values ('01','Electronics',10000);
insert into bamazon.departments values ('02','Clothing',40000);
insert into bamazon.departments values ('03','Education',30000);
insert into bamazon.departments values ('04','Furniture',70000);

select * from bamazon.departments;

drop table bamazon.products;
create table bamazon.products(
item_id int not null AUTO_INCREMENT primary key,
product_name varchar(40) not null,
department_id  varchar(10),
price DECIMAL(10,2)  not null,
stock_quantity INT not null,
created_timestamp DATETIME not null DEFAULT current_timestamp,
lst_updt_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   CONSTRAINT price_constraint_1 CHECK (price>=1),
   FOREIGN KEY fk_constraint_1(department_id)
REFERENCES departments(department_id)
ON DELETE CASCADE
ON UPDATE CASCADE
);

alter table bamazon.products AUTO_INCREMENT=2201;

insert into bamazon.products (product_name,department_id,price,stock_quantity) values ('Iphone','01',850,25);

insert into bamazon.products (product_name,department_id,price,stock_quantity) values ('ComputerDesk','04',39.99,10);

insert into bamazon.products (product_name,department_id,price,stock_quantity) values ('Notebooks','03',19.50,10);

insert into bamazon.products (product_name,department_id,price,stock_quantity) values ('Laptop','01',1500,25);

SELECT * from bamazon.products LIMIT 5;

delete from bamazon.products where item_id=2201;

create table bamazon.orders(
orderid varchar(30) not null  ,
orderdate date not null,
order_create_timestamp DATETIME not null default CURRENT_TIMESTAMP,
item_id int not null,
department_id  varchar(10),
totalprice DECIMAL(10,2)  not null,
primary key(orderid,item_id)
 );

 

ALTER  TABLE bamazon.orders
ADD CONSTRAINT constraint_name_1
FOREIGN KEY fk_constraint_name_1(department_id)
REFERENCES departments(department_id)
ON DELETE NO ACTION
ON UPDATE CASCADE;

ALTER  TABLE bamazon.orders ADD order_qtny int not null;

select * from bamazon.orders;

delete from bamazon.orders where orderid in('BAMZN-ID-2203-1565428998','BAMZN-ID-2204-1565429090');

 
