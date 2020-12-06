const billService = require("../services/bill.service");
const userService = require("../services/user.service");
const aws = require('aws-sdk');
aws.config.update({region: 'us-east-1'});
const SDC = require('statsd-client'), 
sdc = new SDC({host: 'localhost', port: 8125});
const { db } = require('../utils/db.js');
//var sqs = new aws.SQS({apiVersion: '2012-11-05'});
var SQS = require('aws-sqs-promises'),options = {name:'myQueue', useIAMRole:true, region:'us-east-1'};
var myQueue =  new SQS(options);
var sns = new aws.SNS({});


const duebill = async (req, res) => {
  const { body, credentials } = req;
  due_date = req.params.x;
  const useremail = credentials.email;
  const userid = credentials.id;
  


  const today = new Date();
  var days = parseInt(due_date, 10);
  var duedate   =new Date().setDate(today.getDate()+days);
  //Getting the SQS-URL
  console.log(duedate);
  
  //Now fetch the bills and modifying them 

  const URL= await myQueue.getQueueUrl();

  const dbresults = await billService.getduebill(db, duedate, userid);
  const rows = dbresults[0];
  //creating Links 
  let concat = '';
  const user = rows[0];
  rows.forEach(rows => {			
    concat = concat + 'http://'+process.env.DOMAIN_NAME+'/v1/bills/'+rows.id;		
  });

  await myQueue.sendMessage(concat);
  console.log("Sent to SQS");
  
  var Message = await myQueue.receiveMessage();
  //await myQueue.removeMessage();
  console.log("Recieved from SQS");
  //console.log(Message);
  
  let topicParams = {Name: 'bills-due'};
                                    
  //var abc = JSON.stringify(concat);
  let sourceEmail = 'csye6225-no-reply@prod.srijonibiswas.me';
  let payload = {
    default: 'Hello World',
    data: {
        Email: useremail,
        link: Message,
        sourceE : sourceEmail,
    }
    };

    const S_topic = 'arn:aws:sns:us-east-1:'+process.env.SN_Topic+':bills-due';
    payload.data = JSON.stringify(payload.data);
    payload = JSON.stringify(payload);
    let param2 = {Message: payload, TopicArn:S_topic}
    sns.publish(param2, (err, data) => {
    if (err) console.log(err)
    else {
        console.log('published')

        res.status(201).json({
            "message": "Email Sent Successfully!",
            "data" : "trial"
        });
    }
    })
  return res.status(200).json(payload.data);
}

module.exports = {
    duebill
  };
