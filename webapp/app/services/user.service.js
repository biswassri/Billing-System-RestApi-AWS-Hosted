
const { uuid } = require('uuidv4');
const SDC = require('statsd-client'), sdc = new SDC({host:'localhost', port: 8125});

const create = async (db, data) => {

  const now = new Date();
  const createdUuid = uuid();
  console.log(createdUuid);
  var timer = new Date();
  await db.query(`insert into user(id, email_address, password, first_name, last_name, account_created, account_updated) 
    values(?,?,?,?,?,?,?)`, [
    createdUuid,
    data.email_address,
    data.password,
    data.first_name,
    data.last_name,
    now,
    now
  ]);
  sdc.timing('Create User', timer);
  console.log(createdUuid);

 return db.query(`select * from user where id=?`, [createdUuid]);
}

const getUserByEmail = (db, email) => db.query(`select * from user where email_address=?`, [email]);

const updateUser = (db, data) => {
  const now = new Date();

  return db.query(`UPDATE user SET first_name=?, last_name=?, password=?, account_updated=? WHERE email_address=?`,
    [
      data.first_name,
      data.last_name,
      data.password,
      now,
      data.email_address
     
    ]);
}



module.exports = {
  create,
  getUserByEmail,
  updateUser,
 
};