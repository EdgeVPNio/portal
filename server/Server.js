/* EdgeVPNio
* Copyright 2021, University of Florida
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
const path = require('path')
const bodyParser = require('body-parser');
const {MongoDBImpl} = require('../db/MongoDBImpl')
const overlays = require("../controllers/Overlays.controller.js");
const topology = require("../controllers/Topology.controller.js");
const dotenv = require('dotenv')
const {InfluxDBImpl} = require('../db/InfluxDBImpl')

const app = express()

// parse requests of content-type - application/json
app.use(bodyParser.json({type: ['application/gzip', 'application/json'], inflate: true}))

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

dotenv.config()

var API_PORT = 5000; //default

// PORT taken from the .env file
if(process.env.PORT) {
  API_PORT = process.env.PORT;
}

var Data = {}
//As the object dbInstance is built, Evio db is connected from constructor, check for the type of database.
if (process.env.DB == "mongo") {
  var dbInstance = new MongoDBImpl('mongodb://' + process.env.DB_URI + ':27017/Evio', 'Evio');
} else if (process.env.DB == "influx") {
  var dbInstance = new InfluxDBImpl('Evio');
}

app.set('views', path.join(__dirname, '../build'));
app.engine('html', require('ejs').renderFile);

app.use(
  '/static',
  express.static(path.join(__dirname, '../build/static')),
);

app.get('/', (req, res) => {
  res.render('index.html', { API_PORT });
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
    //console.log("Data in PUT is:", dataCopy);
    if (!Object.keys(dataCopy).length == 0) {
      dbInstance.insertInto(dataCopy, timeStamp);
    }
}, 30000)

// Start of the webservice
app.listen(API_PORT, () => {
  console.log(`Evio Visualizer app listening at http://localhost:${API_PORT}`)
})
