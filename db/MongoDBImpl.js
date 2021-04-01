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

const mongoose = require('mongoose')
const Model = require('./Model')
const { DataBaseInterface } = require('./DatabaseInterface');
const mongo = require('mongodb');
const { overlayModel, topologyModel } = require('./Model');
const { DataTransformer } = require('../controllers/DataTransformer')

class MongoDBImpl extends DataBaseInterface {
    // Stores the url and dbname and is available for every instance
    constructor(url, dbname) {
        super(url);
        // Once an instance is created the db connection is kept until the instance is alive.
        this.connection = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
        this.dbname = dbname;
        this.db = mongoose.connection.client;
    }

    /**
     * Getter function for the db attribute
     */
    getDb() {
        return this.db;
    }

    /**
     * Function to insert the PUT data sent by the EVIO nodes into 
     * collections: 1) Overlays
     *              2) Topology
     * 
     * @param {Json} data Aggregated data Object
     * @param {Number} timestamp End timestamp at which object was taken.
     */
    async insertInto(data, timestamp) {
        var dataTrasformer = new DataTransformer();
        // The data is transformed to the required form and returned as an array of arrays.
        var transformedData = dataTrasformer.transformData(data);
        var overlaySaveData = new overlayModel({
            _id: timestamp,
            Overlays: transformedData[0] // Overlays array
        });
        // Overlay data is put into the db with the below call.
        overlaySaveData.save(function (err) {
            if (err) { console.log(err.stack); }
            //console.log("Saved Overlay data for timestamp: " + timestamp);
        });
        var topologySaveData = new topologyModel({
            _id: timestamp,
            Topology: transformedData[1] // Topology Array
        })
        // Topology data is put into the db with the below call.
        topologySaveData.save(function (err) {
            if (err) { console.log(err.stack); }
            //console.log("Saved Topology data for timestamp:" + timestamp);
        });
    }

    /**
     * Database call to get the intervals stored.
     * 
     * @param {String} tableName Model Name to use to find the intervals.
     */
    async getIntervals(tableName) {
        return tableName.find({}, { "Overlays": 0 });
    }

    /**
     * Database call to get the high level Overlay information.
     * 
     * @param {String} tableName Model to use to get the overlay.
     * @param {Float} intervalId Interval identifier to query.
     */
    async findOverlays(tableName, intervalId) {
        if (intervalId) {
            //Find the next available interval, greater than the previous one from client
            return tableName.find({ "_id": { $gt: intervalId } }).sort({ '_id': 1 }).limit(1);
        }
        //Most recent entry - intervalId not passed
        return tableName.find().sort({ '_id': -1 }).limit(1);
    }

    /**
     * Database call to get the detailed topology information.
     * 
     * @param {String} tableName 
     * @param {Float} intervalId 
     * @param {String} overlayId 
     */
    async findTopology(tableName, intervalId, overlayId) {
        if (intervalId) {
            //Find the next available interval, greater than the previous one from client
            return tableName.find({ "_id": { $gt: intervalId } }, { "Topology": { $elemMatch: { "OverlayId": overlayId } } }).sort({ '_id': 1 }).limit(1);
        }
        //Most recent entry - intervalId not passed
        return tableName.find({ "Topology": { $elemMatch: { "OverlayId": overlayId } } }, {"Topology.$": 1}).sort({ "_id": -1 }).limit(1);
    }

    /**
     * Function to query Overlays collection, watch the collection for insert op every 1 second
     * @param {string} tableName 
     * @param {Float} intervalId 
     * @returns inserted data to overlays collection
     */
    async getOverlays(tableName, intervalId) {
        var overlayData = null;
        this.findOverlays(tableName, intervalId)
            .then(data => {
                if (Object.keys(data).length === 0) {
                    console.log("No data found, setting data to null.")
                    overlayData = null;
                    const pipeline = [{ '$match': { 'operationType': 'insert' } }]; //watch for insert operation
                    const overlayChangeStream = this.db.db('Evio').collection('Overlays').watch(pipeline);
                    overlayChangeStream.on('change', changeData => {
                        //console.log("Found new data :", changeData);
                        overlayData = [changeData.fullDocument];
                        //console.log("Set data to ", data)
                    });
                } else {
		            //console.log("Got data from DB not waitng. Data:", data);
                    overlayData = data;
                }
            })
        async function streamReady() {
            return new Promise(ok => {
                var overlayInterval = setInterval(function () {
                    //console.log("Data at setInterval is ", overlayData);
                    if (overlayData) {
                        clearInterval(overlayInterval)
                        return ok();
                    }
                }, 1000);
            });
        }
        var newData = await streamReady()
        .then (data => {
            //console.log("Inside stream Ready ", data);
            return data;
        });
        //console.log("End of overlay DB call with ", newData, overlayData)
        return overlayData;
    }

    /**
     * Function to query Topology collection, watch the collection for insert op every 1 second
     * @param {String} tableName 
     * @param {Float} intervalId 
     * @param {String} overlayId 
     * @returns inserted data to topology collection
     */
    async getTopology(tableName, intervalId, overlayId) {
        var topologyData = null;
        this.findTopology(tableName, intervalId, overlayId)
            .then(data => {
                if (Object.keys(data).length === 0) {
                    //console.log("No data found, setting data to null.")
                    topologyData = null;
                    const pipeline = [{ '$match': { 'operationType': 'insert' } }]; //watch for insert operation
                    const topologyChangeStream = this.db.db('Evio').collection('Topology').watch(pipeline);
                    topologyChangeStream.on('change', changeData => {
                        //console.log("Found new data :", changeData);
                        topologyData = [changeData.fullDocument];
                        //console.log("Set data to ", data)
                    });
                } else {
		            //console.log("Got data from DB not waitng. Data:", data);
                    topologyData = data;
                }
            })
        async function streamReady() {
            return new Promise(ok => {
                var topologyInterval = setInterval(function () {
                    //console.log("Data at setInterval is ", topologyData);
                    if (topologyData) {
                        clearInterval(topologyInterval)
                        return ok();
                    }
                }, 1000);
            });
        }
        var newData = await streamReady()
        .then (data => {
            //console.log("Inside stream Ready ", data);
            return data;
        });
        //console.log("End of topology DB call with ", newData, topologyData)
        return topologyData;
    }
}

module.exports = { MongoDBImpl }

