var express = require('express');
var router = express.Router();
var moment = require('moment')

/* 
HINT

Use moment library to manipulate datetime
https://momentjs.com/

*/

router.post('/oneSettlementPerWeek', function(req, res, next) {
    // use req.body to get JSON of start and end dates. We are only concerned with end dates.
    let endDate = moment(req.body['end'],'DD-MM-YYYY')
    
    //add changes below
    // Calculate paymentDate which is following Monday after the end date
    let paymentDate = endDate.day("Monday").add(1,"week")
    
    res.json({"paymentDate":paymentDate.format('DD-MM-YYYY')})
});
router.post('/twoSettlementPerWeek', function(req, res, next) {
    let endDate = moment(req.body['end'],'DD-MM-YYYY')

     //add changes below
     // Calculate paymentDate based on whether tickets were purchased btwn Mon - Wednesday or Thursday - Sunday
    let paymentDate;

    if(endDate.day() >= 1 && endDate.day() <= 3) {
        paymentDate = endDate.day("Thursday");
    } else {
        paymentDate  = endDate.day("Monday").add(1,"week");
    }

    res.json({"paymentDate":paymentDate.format('DD-MM-YYYY')})
});
router.post('/calculateSettlementAmount', function(req, res, next) {
    //add changes below
    let tickets = req.body;

    let total = 0;

    // Calculate total reimbursement after deducting fee
    tickets.forEach((ticket) => {
        let price = ticket.price;
        let mdr = ticket.MDR;
        total += price * (1 - (mdr/100));
    })

    // Round up total value to 2 decimal points
    total = Math.ceil(total * 100) / 100;

    res.json({"totalSum": total});
});



/*

Assignment 3

Create API to CRUD function for tickets
Use NPM sqlite3 save the tickets 
https://www.npmjs.com/package/sqlite3

Ticket

{
  "ticketId":"TES2312-32",
  "price" , "203.10",
  "MDR" : "2.0",
  "currency" : "SGD",
  "travelAgentName" : "SPLIT-TEST-AGENT01"
}


Provide a solution to restart the app instance if it crashes.



*/



/*
Assignment 4
Ensure the nodejs app process restart itself when it crash
*/

//Custom GET API that will crash the app
router.get('/crashApp', function(req, res, next) {
    let totalSum = []
    while(true){
        let temp = {"test": 123, "data": [1,2,4,56,23,23,]}
        totalSum.push(temp)
    }
    res.json({"message":"This will not be return as app will crash"})
});


module.exports = router;
