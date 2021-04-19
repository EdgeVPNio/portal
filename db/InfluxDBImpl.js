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

const {InfluxDB} = require('influx')
const { DataTransformer } = require('../controllers/DataTransformer')
const { DataBaseInterface } = require('./DatabaseInterface');

class InfluxDBImpl extends DataBaseInterface {
    // Stores the url and dbname and is available for every instance
    constructor(dbname) {
        super('');
        // Once an instance is created the db connection is kept until the instance is alive.
        this.db = new InfluxDB({host: 'influxdb', database: dbname});
        this.dbname = dbname;
        this.db.getDatabaseNames()
        .then(names=>{
                //console.log("Names", names);
                if(!names.includes(dbname)){
                        return this.db.createDatabase(dbname);
                }
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
                "measurement":"Overlays",
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
                        "measurement":"Topology",
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
}
module.exports = { InfluxDBImpl }
