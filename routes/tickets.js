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

*/

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('tickets.db')

db.run("CREATE TABLE IF NOT EXISTS tickets (ticketId TEXT, price REAL, MDR REAL, currency TEXT, travelAgentName TEXT)", function(err) {
    if (err) {
        console.log("Error creating table tickets", err);
        return;
    }
    console.log("table tickets created successfully");
});


// 1. GET Endpoint
router.get('/', function(req,res,next) {
    db.all("SELECT * FROM tickets", function(err, data) {
        if(err) {
            res.status(500).send({
                error: "An error occured while trying to retrieve the tickets."
            });
        } else {
            res.json(data)
        }
    })
});

// 2. POST Endpoint
router.post('/', function(req,res,next) {
    let ticket = req.body;
    
    // Insert this ticket into database
    db.run("INSERT INTO tickets (ticketId, price, MDR, currency, travelAgentName) VALUES (?, ?, ?, ?, ?)", 
    [ticket.ticketId, ticket.price, ticket.MDR, ticket.currency, ticket.travelAgentName], function(err) {
        if (err) {
            res.status(500).send({error: err});
        } else {
            res.json({message: "Ticket has been created successfully.", ticket:ticket});
        }
    });
});

// 3. PUT Endpoint

router.put('/:ticketId', function(req, res, next) {
    let ticketId = req.params.ticketId;
    let ticket = req.body;

    // Find ticket in database based on ticketId and update it
    db.run("UPDATE tickets SET price = ?, MDR = ?, currency = ?, travelAgentName = ? WHERE ticketId = ?", 
    [ticket.price, ticket.MDR, ticket.currency, ticket.travelAgentName, ticketId], function(err) {
        if (err) {
            res.status(500).send({error: "An error occurred while trying to update the ticket."});
        } else {
            res.json({message: "Ticket has been updated successfully.", ticket: ticket});
        }
    });
});

// 4. DELETE Endpoint
router.delete('/:ticketId', function(req, res, next) {
    let ticketId = req.params.ticketId;

    // Delete ticket from database who matches target ticketId
    db.run("DELETE FROM tickets WHERE ticketId = ?", [ticketId], function(err) {
        if (err) {
            res.status(500).send({error: "An error occurred while trying to delete the ticket."});
        } else {
            res.json({message: "Ticket has been deleted successfully.", ticketId: ticketId});
        }
    });
});

// db.close()

/*
Provide a solution to restart the app instance if it crashes.



*/



/*
Assignment 4
Ensure the nodejs app process restart itself when it crash

We can use a process manager such as PM2.

1. Install PM2 globally by running npm i -g pm2
2. Start this app using `pm2 start node ./bin/www` 
3. To stop the process, run `pm2 stop node ./bin/www`

- We can verify that the app is running and is monitored by PM2, by using `pm2 list`
- Can check logs of app by using `pm2 logs`
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
