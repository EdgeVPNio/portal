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
                this.db = new InfluxDB({ host: 'influxdb', database: dbname });
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
                                        replication: 1
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
                        "fields": overlaysData
                };
                dataTobeWritten.push(overlaysWritePoint);
                for (var num in transformedData[1]) {
                        var topologyData = {
                                _id: timestamp,
                                Topology: JSON.stringify(transformedData[1][num])
                        }
                        var topologyWritePoint = {
                                "measurement": "Topology",
                                "tags": [topologyData._id, transformedData[1][num]['OverlayId']],
                                "time": topologyData._id,
                                "OverlayId": transformedData[1][num]['OverlayId'],
                                "fields": topologyData
                        };
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
                        return this.db.query(`select Overlays from ${tableName} WHERE _id > ${intervalId} ORDER BY time ASC LIMIT 1`)
                                .then(jsonStr => JSON.parse(jsonStr))
                                .catch(error => console.log("Error while querying InfluxDB:", error));
                }
                //Most recent entry - intervalId not passed
                return this.db.query(`select Overlays from ${tableName} ORDER BY time DESC LIMIT 1`)
                        .then(jsonStr => JSON.parse(jsonStr))
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
                        return this.db.query(`select Toplogy from ${tableName} WHERE _id > ${intervalId} AND OverlayId=${overlayId} ORDER BY time ASC LIMIT 1`)
                                .then(jsonStr => JSON.parse(jsonStr))
                                .catch(error => console.log("Error while querying InfluxDB:", error));
                }
                //Most recent entry - intervalId not passed
                return this.db.query(`select Topology from ${tableName} WHERE OverlayId=${overlayId} ORDER BY time DESC LIMIT 1`)
                        .then(jsonStr => JSON.parse(jsonStr))
                        .catch(error => console.log("Error while querying InfluxDB:", error));
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
                                                topologyData = that.db.query('select _id from ${tableName} WHERE _id > ${intervalId} AND OverlayId=${overlayId} ORDER BY time DESC LIMIT 1')
                                                        .then(intervalId => {
                                                                if (intervalId) {
                                                                        return that.db.query('select _id from ${tableName} WHERE OverlayId=${overlayId} ORDER BY time DESC LIMIT 1');
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
                                if (Object.keys(data).length === 0) {
                                        console.log("No data found, setting data to null.")
                                        topologyData = null;
                                        //setinterval to check the topology table for new entry every 3 sec
                                        //querying only for intervalId

                                } else {
                                        //console.log("Got data from DB not waitng. Data:", data);
                                        topologyData = data;
                                }
                        })
                var newData = await streamReady(tableName, overlayId)
                        .then(data => {
                                //console.log("Inside stream Ready ", data);
                                return data;
                        });
                //console.log("End of topology DB call with ", newData, topologyData)
                return topologyData;
        }
}
module.exports = { InfluxDBImpl }
