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

const { InfluxDB } = require('influx')
const { DataTransformer } = require('../controllers/DataTransformer')
const { DataBaseInterface } = require('./DatabaseInterface');
const dotenv = require('dotenv')

class InfluxDBImpl extends DataBaseInterface {
        // Stores the dbname and is available for every instance
        constructor(dbname) {
                super('');
                // Once an instance is created the db connection is kept until the instance is alive.
                this.db = new InfluxDB({ host: process.env.DB_URI, database: dbname });
                this.dbname = dbname;
                this.db.getDatabaseNames()
                        .then(names => {
                                //console.log("Names", names);
                                if (!names.includes(dbname)) {
                                        return this.db.createDatabase(dbname);
                                }
                        })
                        .then(noResp => {
                                return this.db.createRetentionPolicy('EvioPolicy', {
                                        duration: process.env.expireTime,
                                        replication: 1,
                                        isDefault: true
                                })
                        });
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
                var dataTransformer = new DataTransformer();
                // The data is transformed to the required form and returned as an array of arrays.
                var transformedData = dataTransformer.transformData(data);
                var overlaysData = {
                        _id: timestamp,
                        Overlays: JSON.stringify(transformedData[0])
                }
                var dataTobeWritten = [];
                var overlaysWritePoint = {
                        "measurement": "Overlays",
                        "tags": overlaysData._id,
                        "time": overlaysData._id,
                        "_id": timestamp,
                        "fields": overlaysData
                };
                dataTobeWritten.push(overlaysWritePoint);
                for (var num in transformedData[1]) {
                        var topologyData = {
                                _id: timestamp,
                                OverlayId: transformedData[1][num]['OverlayId'],
                                Topology: JSON.stringify(transformedData[1][num])
                        }
                        var topologyWritePoint = {
                                "measurement": "Topology",
                                "tags": { '_id': topologyData._id },
                                "time": topologyData._id,
                                "_id": timestamp,
                                "OverlayId": transformedData[1][num]['OverlayId'],
                                "fields": topologyData
                        };
                        console.log("Topology write point:", topologyWritePoint);
                        dataTobeWritten.push(topologyWritePoint);
                }
                this.db.writePoints(dataTobeWritten)
                        .then(() => {
                                //console.log('FINISHED')
                        })
                        .catch(e => {
                                console.error(e)
                                console.log('\\nFinished ERROR')
                        });
        }

        /**
         * Database call to get the intervals stored.
         * 
         * @param {String} tableName Model Name to use to find the intervals.
         */
        async getIntervals(tableName) {
                return this.db.query(`select _id from ${tableName}`)
                        .catch(error => console.log("Error while querying InfluxDB:", error));
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
                        return this.db.query(`select * from ${tableName} WHERE _id > ${intervalId} ORDER BY time ASC LIMIT 1`)
                                .then(jsonStr => {
                                        //console.log("JSON string is:", jsonStr);
                                        if (typeof jsonStr[0] === 'undefined') {
                                                //console.log("data not found,start polling");
                                                return null;
                                        } else {
                                                var overlaysObj = {
                                                        _id: jsonStr[0]['_id'],
                                                        Overlays: JSON.parse(jsonStr[0]['Overlays'])
                                                }
                                                return [overlaysObj];
                                        }
                                })
                                .catch(error => console.log("Error while querying InfluxDB:", error));
                }
                //Most recent entry - intervalId not passed
                return this.db.query(`select * from ${tableName} ORDER BY time DESC LIMIT 1`)
                        .then(jsonStr => {
                                //console.log("JSON string is:", jsonStr);
                                if (typeof jsonStr[0] === 'undefined') {
                                        //console.log("data not found,start polling");
                                        return null;
                                } else {
                                        var overlaysObj = {
                                                _id: jsonStr[0]['_id'],
                                                Overlays: JSON.parse(jsonStr[0]['Overlays'])
                                        }
                                        return [overlaysObj];
                                }
                        })
                        .catch(error => console.log("Error while querying InfluxDB:", error));
        }

        /**
             * Database call to get the detailed topology information.
             * 
             * @param {String} tableName 
             * @param {Float} intervalId 
             * @param {String} overlayId 
             */
        async findTopology(tableName, intervalId, overlayId) {
                //console.log("Querying table:", tableName, overlayId);
                if (intervalId) {
                        //Find the next available interval, greater than the previous one from client
                        return this.db.query(`select * from ` + tableName + ` WHERE (_id > ` + intervalId + ` AND OverlayId = \'` + overlayId + `\') ORDER BY time ASC LIMIT 1`)
                                .then(jsonStr => {
                                        //console.log("jsonStr: Topology with id", jsonStr);
                                        if (typeof jsonStr[0] === 'undefined') {
                                                return null;
                                        } else {
                                                var topoObj = {
                                                        _id: jsonStr[0]['_id'],
                                                        Topology: [JSON.parse(jsonStr[0]['Topology'])]
                                                }
                                                return [topoObj];
                                        }
                                })
                                .catch(error => console.log("Error while querying InfluxDB:", error));
                }
                //Most recent entry - intervalId not passed
                return this.db.query(`select * from ` + tableName + ` WHERE OverlayId = \'` + overlayId + `\' ORDER BY time DESC LIMIT 1`)
                        .then(jsonStr => {
                                //console.log("jsonStr: Topology without id", jsonStr);
                                if (typeof jsonStr[0] === 'undefined') {
                                        return null;
                                } else {
                                        var topoObj = {
                                                _id: jsonStr[0]['_id'],
                                                Topology: [JSON.parse(jsonStr[0]['Topology'])]
                                        }
                                        return [topoObj];
                                }
                        })
                        .catch(error => console.log("Error while querying InfluxDB:", error));
        }

        /**
        * Function to query Topology collection, watch the collection for insert op every 1 second
        * @param {String} tableName 
        * @param {Float} intervalId 
        * @param {String} overlayId 
        * @returns inserted data to topology collection
        */
        async getOverlays(tableName, intervalId) {
                var that = this;
                var overlaysData = null;
                async function streamReady() {
                        return new Promise(ok => {
                                var overlaysInterval = setInterval(function () {
                                        //console.log("Data at setInterval is ", overlaysData);
                                        if (overlaysData) {
                                                clearInterval(overlaysInterval)
                                                //console.log("data set,exiting poll");
                                                return ok();
                                        } else {
                                                that.db.query('select _id from ' + tableName + ' WHERE _id > ' + intervalId + ' ORDER BY time DESC LIMIT 1')
                                                        .then(intervalIdData => {
                                                                //console.log("Got interval id inside stream ready as:", intervalIdData, intervalIdData['groupRows']);
                                                                if (intervalIdData['groupRows'].length > 0) {
                                                                        overlaysData = that.db.query('select * from ' + tableName + ' ORDER BY time DESC LIMIT 1')
                                                                                .then(jsonStr => {
                                                                                        var overlaysObj = {
                                                                                                _id: jsonStr[0]['_id'],
                                                                                                Overlays: JSON.parse(jsonStr[0]['Overlays'])
                                                                                        }
                                                                                        return [overlaysObj];
                                                                                });
                                                                } else {
                                                                        return null;
                                                                }
                                                        });
                                        }
                                }, 1000);
                        });
                }
                this.findOverlays(tableName, intervalId)
                        .then(data => {
                                if (data === null || Object.keys(data).length === 0) {
                                        //console.log("No data found, setting data to null.")
                                        overlaysData = null;
                                } else {
                                        //console.log("Got data from DB not waitng. Data:", data);
                                        overlaysData = data;
                                }
                        })
                var newData = await streamReady()
                        .then(data => {
                                //console.log("Inside stream Ready ", data);
                                return data;
                        });
                //console.log("End of overlay DB call with ", newData, overlaysData)
                return overlaysData;
        }

        /**
        * Function to query Topology collection, watch the collection for insert op every 1 second
        * @param {String} tableName 
        * @param {Float} intervalId 
        * @param {String} overlayId 
        * @returns inserted data to topology collection
        */
        async getTopology(tableName, intervalId, overlayId) {
                var that = this;
                var topologyData = null;
                async function streamReady() {
                        return new Promise(ok => {
                                var topologyInterval = setInterval(function () {
                                        //console.log("Data at setInterval is ", topologyData);
                                        if (topologyData) {
                                                clearInterval(topologyInterval)
                                                return ok();
                                        } else {
                                                that.db.query('select _id from ' + tableName + ' WHERE (_id > ' + intervalId + ' AND OverlayId = \'' + overlayId + '\') ORDER BY time DESC LIMIT 1')
                                                        .then(intervalIdData => {
                                                                //console.log("intervalIdData: ", intervalIdData);
                                                                if (intervalIdData['groupRows'].length > 0) {
                                                                        //console.log("Got interval data");
                                                                        topologyData = that.db.query('select * from ' + tableName + ' WHERE OverlayId = \'' + overlayId + '\' ORDER BY time DESC LIMIT 1')
                                                                                .then(jsonStr => {
                                                                                        //console.log("Got topology data in setInterval", jsonStr);
                                                                                        var topoObj = {
                                                                                                _id: jsonStr[0]['_id'],
                                                                                                Topology: [JSON.parse(jsonStr[0]['Topology'])]
                                                                                        }
                                                                                        return [topoObj];
                                                                                });
                                                                } else {
                                                                        return null;
                                                                }
                                                        });
                                        }
                                }, 1000);
                        });
                }
                this.findTopology(tableName, intervalId, overlayId)
                        .then(data => {
                                //console.log("Data got from find is:", data);
                                if (data === null || Object.keys(data).length === 0) {
                                        //console.log("No data found, setting data to null.")
                                        topologyData = null;

                                } else {
                                        //console.log("Got data from DB not waitng. Data:", data);
                                        topologyData = data;
                                }
                        })
                var newData = await streamReady()
                        .then(data => {
                                //console.log("Inside stream Ready ", data);
                                return data;
                        });
                //console.log("End of topology DB call with ", newData, topologyData)
                return topologyData;
        }
}
module.exports = { InfluxDBImpl }

