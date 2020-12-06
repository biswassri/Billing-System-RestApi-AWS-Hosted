const bcrypt = require('bcrypt');
const { getUserByEmail } = require('../services/user.service')
const { db } = require('../utils/db.js');
const basicAuthMiddleware = async (request, response, next) => {
  const { headers } = request;
  const { authorization } = headers

  if (!authorization || authorization.indexOf('Basic ') === -1) {
    return response.status(401).json({ message: 'Missing Authorization Header' });
  }

  const base64Credentials = authorization.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [email, password] = credentials.split(':');

  const users = await getUserByEmail(db, email)
  const rows = users[0];


  if (!rows) {
    return response.status(401).json({ message: 'User not found please register first' });
  }

  // change the getUsers by email query to only return a single user by using count
  
  const user = rows[0];

  if (!bcrypt.compareSync(password, user.password)) {
    return response.status(401).json({ message: 'InvalidPassword' });
  }

  request.credentials = { authenticated: true, email, id: user.id }

  next();
}

module.exports = {
  basicAuthMiddleware
}