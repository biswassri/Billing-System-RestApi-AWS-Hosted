
const billService = require("../services/bill.service");
//const { isValidEmail, isValidPassword } = require('../utils/user.utils')
const userService = require("../services/user.service");
const fs = require('fs');
const aws = require('aws-sdk');
const SDC = require('statsd-client'), 
sdc = new SDC({host: 'localhost', port: 8125});
const { db } = require('../utils/db.js');



//DELETE BILL

const deletebyid = async (req, res) => {
  sdc.increment('Delete BILL');
  const { body, credentials } = req;
  bill_id = req.params.id;
  const dbresults = await billService.getbillbyid(db, bill_id);
  const rows = dbresults[0];
  const user = rows[0];
  

  if(credentials.id != user.owner_id){
    return res.status(401).json({
      message: 'Unauthorized : Cannot Read other user data'
    });
  }
  try {
    
    const deleteid = req.params.id;
    billService.deletebill(db , deleteid);
    //Removing File From S3
    const files = await billService.getfilebybill(db, deleteid);
    const filerow = files[0];
    console.log(filerow);
    const object = deleteid+filerow[0].url;
    const objecttemp = deleteid+filerow[0].url;
    console.log(object);
    const s3 = new aws.S3();
    var params = {
      Bucket: process.env.BUCKET_NAME,
      Key: object,
    };
    sdc.increment('DELETE FILE');
    s3.deleteObject(params, function (perr, pres) {
    if (perr) {
        console.log("Error Deleteing data: ", perr);
    } else {
        console.log("Deleted data");
    }
  }); 
    
    return res.status(204).end();
  } catch (err) {
    return res.status(404).json({
      message: err.message
    })
  }
}

//CREATE BILL

const createbill = async (req, res) => {
  sdc.increment('POST CREATE BILL');
  const { body,credentials } = req;
  const billData =  {
    ...body,
    ownerId: credentials.id
  }

  try {
    const createresult = await billService.createbill(db, billData);
    var catergoriesList = (createresult[0])[0].categories;
    console.log(catergoriesList)
    const stringlist = catergoriesList.split(",");
    const output = createresult[0].map((row) => ({
      id: row.id,
      created_ts: row.created_ts,
      updated_ts: row.updated_ts,
      owner_id:row.owner_id,
      vendor: row.vendor,
      bill_date : row.bill_date,
      due_date : row.due_date,
      amount_due: row.amount_due,
      categories: stringlist,
      paymentStatus:row.paymentStatus
    }))
    return res.status(200).json(output);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: err.message
    });
  }
}

//GET BILLS BY ID
const getbillbyid = async (req, res) => {
  sdc.increment('GET BILL ID');
  const { body, credentials } = req;
  const getid = req.params.id;
  const dbresults = await billService.getbillbyid(db, getid);
  const rows = dbresults[0];
  const user = rows[0];

  if(credentials.id != user.owner_id){
    return res.status(403).json({
      message: 'Cannot update infromation of another user'
    });
  }
  try {
    const dbresults = await billService.getbillbyid(db, getid);
    var catergoriesList = (dbresults[0])[0].categories;
    const stringlist = catergoriesList.split(",");
    const user = dbresults[0].map((row) => ({
      id: row.id,
      created_ts: row.created_ts,
      updated_ts: row.updated_ts,
      owner_id:row.owner_id,
      vendor: row.vendor,
      bill_date : row.bill_date,
      due_date : row.due_date,
      amount_due: row.amount_due,
      categories: stringlist,
      paymentStatus:row.paymentStatus
    }));
    return res.json(user);
  } catch (err) {
    return res.status(500).json({
      message: err.message
    })
  }
}
//UPDATE BILL

const updatebill = async (req, res) => {
  sdc.increment('PUT UPDATE BILL');
  const { body, credentials } = req;

  bill_id = req.params.id;
  
  const dbresults = await billService.getbillbyid(db, bill_id);
  const rows = dbresults[0];
  const user = rows[0];
  

  if(credentials.id != user.owner_id){
    return res.status(403).json({
      message: 'Cannot update infromation of another user'
    });
  }
  try {
    await billService.updatebill(db, body,bill_id);
    const dbresults = await billService.getbillbyid(db, getid);
    var catergoriesList = (dbresults[0])[0].categories;
    const stringlist = catergoriesList.split(",");
    const user = dbresults[0].map((row) => ({
      id: row.id,
      created_ts: row.created_ts,
      updated_ts: row.updated_ts,
      owner_id:row.owner_id,
      vendor: row.vendor,
      bill_date : row.bill_date,
      due_date : row.due_date,
      amount_due: row.amount_due,
      categories: stringlist,
      paymentStatus:row.paymentStatus
    }));
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({
      message: err.message
    })
  }
  
}

//GET ALL BILLS
const allbills = async (req, res) => {
  console.log("HEREEEEEE");
  const { credentials } = req;
  const allid = credentials.id;
  console.log(credentials.id);
  try {
    const dbresults = await billService.getbillbyid(db, allid);
    const rows = dbresults[0];
    return res.status(200).json(dbresults);
  } catch (err) {
    return res.status(500).json({
      message: err.message
    })
  }
}


//CREATE FILE

const attachfile = async(req, res)=>{
  sdc.increment('POST CREATE FILE');
  const{ body, credentials} =req;
  billid = req.params.id;
  
  attach_name = Object.keys(req.files)[0];
  const file = req.files[attach_name];
  const name = billid+file.name;
  try {
    if(!file.name || file.name.match(/\.(jpg|jpeg|png|pdf)$/i))
    {
      try {
        const attachresult = await billService.attachfile(db, file, billid, attach_name);
        const fileattach= attachresult[0];
        console.log(attach_name);
        console.log(name);
        const attachn = billid+attach_name;
        const s3 = new aws.S3();
        //Uploading File to S3 Bucket 
        var params = {
          Bucket: process.env.BUCKET_NAME,
          Key: name,
          Body: attachn
      };

      s3.putObject(params, function (perr, pres) {
          if (perr) {
              console.log("Error uploading data: ", perr);
          } else {
              console.log("Successfully uploaded data ");
          }
        });
        
        return res.status(201).json(fileattach);
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        message: err.message
        });
  
      }
    }
    else {return res.status(500).json({ message: "Incorrect Format"})}
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: err.message
    });

  }
  
}

//GET DETAILS OF FILES

const getfile = async(req, res) => {
  sdc.increment('GET FILE');
  const{ body, credentials} =req;
  const billid = req.params.id;
  const fileid = req.params.fileid;
  const dbresults = await billService.getbillbyid(db, billid);
  const rows = dbresults[0];
  const user = rows[0];
  

  if(credentials.id != user.owner_id){
    return res.status(403).json({
      message: 'Cannot view infromation of another user'
    });
  }
  try {
    const dbresults = await billService.getfile(db, fileid);
  
    const rows = dbresults[0];
    const c = rows[0].filename;
     if(!c.length){
      return res.status(404).json({
        message: "File not found "
      });
     }
    else {
    const user = dbresults[0].map((row) => ({
      
      file_name: row.filename,
      id: row.id,
      url: row.url,
      upload_date:row.upload_date

    }))
    return res.status(200).json(user);  
  }   
  } catch (err) {
    return res.status(500).json({
      message: err.message
    })

}
}

// DELETE FILE

const deletefile = async(req, res) => {
  sdc.increment('DELETE FILE');
  const{ body, credentials} =req;
  const billid = req.params.id;
  const deleteid = req.params.fileid;
  const dbresults = await billService.getbillbyid(db, billid);
  const rows = dbresults[0];
  const user = rows[0];
  

  if(credentials.id != user.owner_id){
    return res.status(403).json({
      message: 'Cannot view infromation of another user'
    });
  }
  else{
  try {
    const dbresults = await billService.getfile(db, deleteid);
    const r = dbresults[0];
    console.log(r[0].url);
    const rs = r[0].filename;
    console.log(rs);
     if(!rs.length){
      return res.status(404).json({
        message: "File not found "
      });
     }
     else{
    billService.deletefile(db , deleteid);
    //fs.unlinkSync('./uploads/'+r[0].url);
    const name = billid+r[0].url;
    const s3 = new aws.S3();
        //Uploading File to S3 Bucket 
        var params = {
          Bucket: process.env.BUCKET_NAME,
          Key: name,
          Body: attach_name
      };

      s3.deleteObject(params, function (perr, pres) {
          if (perr) {
              console.log("Error Deleteing data: ", perr);
          } else {
              console.log("Deleted data");
          }
        });

    return res.status(204).end();
     }
  } catch (err) {
    return res.status(500).json({
      message: err.message
    })
  }
}

}

//S3 Uploading function 





//EXPORT

module.exports = {
    createbill,
    deletebyid,
    getbillbyid,
    updatebill, 
    attachfile,
    getfile,
    deletefile,
    allbills 
};