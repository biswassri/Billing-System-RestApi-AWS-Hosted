const routerbill = require("express").Router();
const {
    createbill,
    deletebyid,
    getbillbyid,
    updatebill, 
    attachfile,
    getfile,
    deletefile, 
    allbills
 
} = require("../controllers/bill.controller");
const { basicAuthMiddleware } = require('../middlewares/auth.middleware')
const {duebill} = require('../controllers/due');

const fileupload = require('express-fileupload');
routerbill.use(fileupload());

routerbill.post('/create', basicAuthMiddleware, createbill);
routerbill.put('/:id',basicAuthMiddleware, updatebill);
routerbill.get('/:id', basicAuthMiddleware, getbillbyid);
routerbill.delete('/:id', basicAuthMiddleware, deletebyid);
routerbill.get('/all',basicAuthMiddleware, allbills);

routerbill.get('/due/:x',basicAuthMiddleware, duebill);


//file upload routes
routerbill.post('/:id/file',basicAuthMiddleware, attachfile);
routerbill.get('/:id/file/:fileid',basicAuthMiddleware,getfile);
routerbill.delete('/:id/file/:fileid',basicAuthMiddleware,deletefile)

module.exports = routerbill;