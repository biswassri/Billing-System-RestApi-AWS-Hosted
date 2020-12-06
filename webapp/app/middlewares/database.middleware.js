const mysql = require('mysql-promise')();


const registerDbConnection = async(request, response, next) => {

  mysql.configure({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.MYSQL_DB,
  })
  
  await mysql.query( `CREATE TABLE IF NOT EXISTS user (
    id varchar(50) NOT NULL,
    first_name varchar(45) NOT NULL,
    last_name varchar(45) NOT NULL,
    password varchar(200) DEFAULT NULL,
    email_address varchar(45) NOT NULL,
    account_created datetime NOT NULL,
    account_updated datetime NOT NULL,
    UNIQUE KEY email_address (email_address)
  )
  `);
  await mysql.query(`CREATE TABLE IF NOT EXISTS bill (
    id varchar(45) NOT NULL,
    created_ts datetime NOT NULL,
    updated_ts datetime NOT NULL,
    owner_id varchar(45) NOT NULL,
    vendor varchar(45) NOT NULL,
    bill_date date NOT NULL,
    due_date date NOT NULL,
    amount_due double NOT NULL,
    categories varchar(45) NOT NULL,
    paymentStatus enum('paid','due') DEFAULT NULL,
    CONSTRAINT CK_MyTable_Col CHECK ((amount_due >= 0.01))
  )`);
  
  await mysql.query(`CREATE TABLE IF NOT EXISTS files(
    id varchar(75) NOT NULL,
    filename varchar(45) NOT NULL,
    url varchar(45) NOT NULL,
    upload_date date NOT NULL,
    bill_id varchar(45) NOT NULL,
    size int NOT NULL,
    md5 varchar(45) NOT NULL,
    UNIQUE KEY id (id),
    UNIQUE KEY filename (filename),
    UNIQUE KEY filename_2 (filename)
  )
  `);

  request.db = mysql
  
  
  next();

}

module.exports = {
  registerDbConnection
}