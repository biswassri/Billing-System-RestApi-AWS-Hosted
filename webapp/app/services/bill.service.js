
const { uuid } = require('uuidv4');
const SDC = require('statsd-client'), sdc = new SDC({host:'localhost', port: 8125});


const createbill = async (db, data) => {
  const now = new Date();
  const temp = data.categories.toString();
  const createduid = uuid();
  var timer = new Date();
  await db.query(`insert into bill(id, created_ts, updated_ts, owner_id, vendor, bill_date, due_date,amount_due,categories, paymentStatus) 
    values(?,?,?,?,?,?,?,?,?,?)`, [
    createduid,
    now,
    now,
    data.ownerId,
    data.vendor,
    data.bill_date,
    data.due_date,
    data.amount_due,
    temp,
    data.paymentStatus,
  ]);
  sdc.timing('Create Bill', timer);
  return db.query(`select * from bill where id=?`, [createduid]);
}

const getbillbyid = async (db,id) => db.query(`select * from bill where id=?`, [id]);

const getduebill = async(db,duedate, id) => db.query(`SELECT id FROM bill WHERE due_date <= ? AND paymentStatus = 'due' AND owner_id = ?`, [duedate, id]);


const updatebill = (db, data, id) => {
  const now = new Date();
  const temp = data.categories.toString(); 
  
  return db.query(`UPDATE bill SET vendor=?,  bill_date=?, due_date= ?, amount_due=?, categories=?, paymentStatus=? WHERE id=?`,
    [
   
    data.vendor,
    data.bill_date,
    data.due_date,
    data.amount_due,
    temp,
    data.paymentStatus,
    id

    ]);
}

//Deleting the bill by id 
const deletebill = (db, id) => {
  var timer1 = new Date();
  db.query(`DELETE FROM bill WHERE id=?`,[id]);
  sdc.timing('Delete Bill', timer1);
  return db.query(`select * from bill where id =?`, [id])
}

// Adding Bill Attachement

const attachfile = (db, file, id, attach_name) => {
  const now = new Date();
  const createuuid = uuid();
  var timer2 = new Date();
   db.query(`insert into files(id, filename, url, upload_date, bill_id, size, md5) 
    values(?,?,?,?,?,?,?)`, [
    createuuid,
    attach_name,
    file.name,
    now,
    id,
    file.size,
    file.md5
  ]);
  sdc.timing('Create File', timer2);
  return db.query(`select * from files where id =?`, [createuuid]);
}

const getfile = async(db, fileid) => db.query(`select * from files where id =?`, [fileid]);
const getfilebybill = async(db, billid) => db.query(`select * from files where bill_id =?`, [billid]);


const deletefile = (db, deleteid) => {

  return db.query(`DELETE FROM files WHERE id=?`,[deleteid]);
}


//Upload File

module.exports = {

  createbill,
  getbillbyid,
  updatebill,
  deletebill,
  attachfile,
  getfile,
  getfilebybill,
  deletefile,
  getduebill
  
};