/* EdgeVPNio
* Copyright 2020, University of Florida
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
*/

const express = require('express')
const path = __dirname +'/../build/'; //build contains the built react static content
const bodyParser = require('body-parser');
const {MongoDBImpl} = require('../db/MongoDBImpl')
const overlays = require("../controllers/Overlays.controller.js");
const topology = require("../controllers/Topology.controller.js");
const dotenv = require('dotenv')

const app = express()
app.use(express.static(path));
// parse requests of content-type - application/json
app.use(bodyParser.json({type: ['application/gzip', 'application/json'], inflate: true}))

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

dotenv.config()

var Data = {}
//As the object dbInstance is built, Evio db is connected from constructor, check for the type of database.
if (process.env.DB == "mongo") {
  var dbInstance = new MongoDBImpl('mongodb://' + process.env.DB_URI + ':27017/Evio', 'Evio')
}
app.get('/', (req, res) => {
  res.sendFile(path + "index.html");//loads the react UI
});

//routing logic for GET all intervals
//Syntax: http://localhost:3000/intervals
app.get('/Intervals', (req, res) => overlays.findAllIntervals(req, res, dbInstance));

//routing logic for GET overlay information given interval
//Syntax: http://localhost:3000/overlays?interval=intervalId 
app.get('/Overlays', (req, res) => overlays.findOverlays(req, res, dbInstance));

//routing logic for GET topology information given overlayid and interval
//Syntax: http://localhost:3000/topology?overlayid=overlayId&interval=intervalId
app.get('/Topology', (req, res) => topology.findTopology(req, res, dbInstance));

// routing logic for the PUT request to gather data from all Evio nodes. 
app.put('/EVIO/*', (req, res) => {
    Data[Date.now()] = req.body
    res.sendStatus(200)
})

setInterval(function(){
    var timeStamp = Date.now()
    var dataCopy = Data;
    Data = {}
    if (!Object.keys(dataCopy).length == 0) {
      dbInstance.insertInto(dataCopy, timeStamp);
    }
}, 30000)

// PORT taken from the .env file
var port = 5000; //default

if(process.env.PORT) {
  port = process.env.PORT;
}

// Start of the webservice
app.listen(port, () => {
  console.log(`Evio Visualizer app listening at http://localhost:${port}`)
})
