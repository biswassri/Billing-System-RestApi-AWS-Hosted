
require("dotenv").config();
const express = require("express");
const restapi = express();
const userRouter = require("./app/routes/user.router");
const billRouter = require("./app/routes/bill.router");

const bodyparser = require("body-parser");
restapi.use(bodyparser.urlencoded({ extended: false }));
restapi.use(bodyparser.json());

console.log(process.env.BUCKET_NAME);


//restapi.use(express.json());

restapi.use('/v1/user', userRouter);
restapi.use('/v1/bills', billRouter);


restapi.use(function (err, req, res, next){
  console.log("HERE");
  req.db.end();

  });
//const port = process.env.PORT || 3000;
restapi.listen(3010, () => {
  console.log("server up and running on PORT :", 3010);
});
restapi.get('/', function (req, res) {
  return res.json({
    message: 'server up and running on PORT : 3010'
  });
});
