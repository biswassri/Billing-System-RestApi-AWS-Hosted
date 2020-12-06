const userService = require("../services/user.service");
const bcrypt = require("bcrypt");
const { isValidEmail, isValidPassword } = require('../utils/user.utils');
const SDC = require('statsd-client'), sdc = new SDC({host:'localhost', port: 8125});
const { db } = require('../utils/db.js');

const createUser = async (req, res) => {
  sdc.increment('POST CreateUser');
  const { body} = req;

  if (!body.password) {
    return res.status(400).json({
      message: "missing password"
    });
  }
  if (!isValidEmail(body.email_address)) {
    
    return res.status(400).json({
      message: "Invalid Email"
    });
}
  const salt = bcrypt.genSaltSync(10);
  body.password = bcrypt.hashSync(body.password, salt);
  try {
    const dbres = await userService.create(db, body);
    const rowsWithoutPassword = dbres[0].map((row) => ({
      firstName: row.first_name,
      lastName: row.last_name,
      emailAddress: row.email_address,
      accountCreated: row.account_created,
      accountUpdated: row.accountUpdated
    }))
    console.log(rowsWithoutPassword);
    return res.status(200).json(rowsWithoutPassword);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: err.message
    });
  }
}


const login = (req, res) => {
  const { body } = req;
  userService.getUserByUserEmail(body.email, (err, results) => {
    if (err) {
      console.log(err);
    }
    if (!results) {
      return res.json({
        success: 0,
        data: "Invalid email or password"
      });
    }
    const result = bcrypt.compareSync(body.password, results.password);
    if (result) {
      results.password = undefined;
      const jsontoken = sign({ result: results }, "qwe1234", {
        expiresIn: "1h"
      });
      return res.json({
        success: 1,
        message: "login successfully",
        token: jsontoken
      });
    } else {
      return res.json({
        success: 0,
        data: "Invalid email or password"
      });
    }
  });
}



const getUsers = async (req, res) => {
  sdc.increment('GET getUser');
  const { credentials } = req
  const { email } = credentials

  try {
    const dbresults = await userService.getUserByEmail(db, email);
    const rowsWithoutPassword = dbresults[0].map((row) => ({
      firstName: row.first_name,
      lastName: row.last_name,
      emailAddress: row.email_address,
      accountCreated: row.account_created,
      accountUpdated: row.accountUpdated
    }))
    return res.json(rowsWithoutPassword)
  } catch (err) {
    return res.status(500).json({
      message: err.message
    })
  }
}



const updateUsers = async (req, res) => {
  sdc.increment('PUT UpdateUser');
  const { body, db, credentials } = req;
  

  if (!isValidEmail(body.email_address)) {
    return res.status(400).json({
      message: "Invalid Email"
    });
  }

  if (body.email_address !== credentials.email) {
    return res.status(403).json({
      message: 'Cannot update infromation of another user'
    })
  }

  const salt = bcrypt.genSaltSync(10);
  body.password = bcrypt.hashSync(body.password, salt);

  try {
    await userService.updateUser(db, body);
    return res.status(200).end();
  } catch (err) {
    return res.status(500).json({
      message: err.message
    })
  }
}

module.exports = {
  createUser,
  login,
  getUsers,
  updateUsers
};