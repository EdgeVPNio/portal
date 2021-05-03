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
                                        //data not available yet, returning null
                                        if (typeof jsonStr[0] === 'undefined') {
                                                //console.log("data not found at findOverlays,start polling");
                                                return null;
                                        } else {
                                                //constructing Overlays object to render to client
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
                                //data not available yet, returning null
                                if (typeof jsonStr[0] === 'undefined') {
                                        //console.log("data not found at findOverlays,start polling");
                                        return null;
                                } else {
                                        //constructing Overlays object to render to client
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
                if (intervalId) {
                        //Find the next available interval, greater than the previous one from client
                        return this.db.query(`select * from ` + tableName + ` WHERE (_id > ` + intervalId + ` AND OverlayId = \'` + overlayId + `\') ORDER BY time ASC LIMIT 1`)
                                .then(jsonStr => {
                                        //data not available yet, returning null
                                        if (typeof jsonStr[0] === 'undefined') {
                                                //console.log("data not found at findTopology,start polling");
                                                return null;
                                        } else {
                                                //constructing Topology object to render to client
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
                                //data not available yet, returning null
                                if (typeof jsonStr[0] === 'undefined') {
                                        //console.log("data not found at findTopology,start polling");
                                        return null;
                                } else {
                                        //constructing Topology object to render to client
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
        * Function to query Overlays collection, watch the collection for insert op every 1 second
        * @param {String} tableName 
        * @param {Float} intervalId 
        * @param {String} overlayId 
        * @returns inserted data to topology collection
        */
        async getOverlays(tableName, intervalId) {
                var that = this;
                var overlaysData = null;
                async function streamReady() {
                        //database call to get Overlays data
                        var res = await that.findOverlays(tableName, intervalId)
                                .then(data => {
                                        //data not available yet
                                        if (data === null || Object.keys(data).length === 0) {
                                                //console.log("No data found, setting data to null.")
                                                overlaysData = null;
                                        } else {
                                                //Initializing data to exit setInterval timer loop
                                                //console.log("Got data from DB, not waiting. Data:", data);
                                                overlaysData = data;
                                        }
                                })

                        return new Promise(ok => {
                                //Start timer to poll DB every 1 sec for data
                                var overlaysInterval = setInterval(function () {
                                        if (overlaysData) {
                                                //data found, interval reset to exit function
                                                clearInterval(overlaysInterval)
                                                return ok();
                                        } else {
                                                //Query to get the latest available interval from db
                                                that.db.query('select _id from ' + tableName + ' WHERE _id > ' + intervalId + ' ORDER BY time DESC LIMIT 1')
                                                        .then(intervalIdData => {
                                                                //Check if Overlays data is available 
                                                                if (intervalIdData['groupRows'].length > 0) {
                                                                        overlaysData = that.db.query('select * from ' + tableName + ' ORDER BY time DESC LIMIT 1')
                                                                                .then(jsonStr => {
                                                                                        //Overlays object construction
                                                                                        var overlaysObj = {
                                                                                                _id: jsonStr[0]['_id'],
                                                                                                Overlays: JSON.parse(jsonStr[0]['Overlays'])
                                                                                        }
                                                                                        return [overlaysObj];
                                                                                });
                                                                } else {
                                                                        //data not available yet, checking after 1 sec for insert OP
                                                                        return null;
                                                                }
                                                        });
                                        }
                                }, 1000);
                        });
                }
                //Method to call GET Overlays, loop through timer every 1 sec if latest data not inserted to db
                var newData = await streamReady()
                        .then(data => {
                                return data;
                        });
                //Return data on successful poll to client
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
                        //database call to get Topology data
                        var res = await that.findTopology(tableName, intervalId, overlayId)
                        .then(data => {
                                if (data === null || Object.keys(data).length === 0) {
                                        //console.log("No data found, setting data to null.")
                                        //interval reset to exit function
                                        topologyData = null;

                                } else {
                                        //Initializing data to exit setInterval timer loop
                                        //console.log("Got data from DB, not waiting. Data:", data);
                                        topologyData = data;
                                }
                        })

                        //Start timer to poll DB every 1 sec for data
                        return new Promise(ok => {
                                var topologyInterval = setInterval(function () {
                                        if (topologyData) {
                                                //data found, interval reset to exit function
                                                clearInterval(topologyInterval)
                                                return ok();
                                        } else {
                                                //Query to get the latest available interval from db
                                                that.db.query('select _id from ' + tableName + ' WHERE (_id > ' + intervalId + ' AND OverlayId = \'' + overlayId + '\') ORDER BY time DESC LIMIT 1')
                                                        .then(intervalIdData => {
                                                                //Check if Topology data is available
                                                                if (intervalIdData['groupRows'].length > 0) {
                                                                        topologyData = that.db.query('select * from ' + tableName + ' WHERE OverlayId = \'' + overlayId + '\' ORDER BY time DESC LIMIT 1')
                                                                                .then(jsonStr => {
                                                                                        //Topology object contruction
                                                                                        var topoObj = {
                                                                                                _id: jsonStr[0]['_id'],
                                                                                                Topology: [JSON.parse(jsonStr[0]['Topology'])]
                                                                                        }
                                                                                        return [topoObj];
                                                                                });
                                                                } else {
                                                                        //data not available yet, checking after 1 sec for insert OP
                                                                        return null;
                                                                }
                                                        });
                                        }
                                }, 1000);
                        });
                }

                var newData = await streamReady()
                        .then(data => {
                                return data;
                        });
                //Return data on successful poll to client
                return topologyData;
        }
}
module.exports = { InfluxDBImpl }

