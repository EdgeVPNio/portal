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

const mongoose = require("mongoose");
const { DataBaseInterface } = require("./DatabaseInterface");
const { overlayModel, topologyModel } = require("./Model");
const { DataTransformer } = require("../controllers/DataTransformer");

class MongoDBImpl extends DataBaseInterface {
  // Stores the url and dbname and is available for every instance
  constructor(url, dbname) {
    super(url);
    // Once an instance is created the db connection is kept until the instance is alive.
    this.connection = mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
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
    try {
      // The data is transformed to the required form and returned as an array of arrays.
      var transformedData = dataTrasformer.transformData(data);
      //console.log("transformedData: ", JSON.stringify(transformedData));
      var overlaySaveData = new overlayModel({
        _id: timestamp,
        Overlays: transformedData[0], // Overlays array
      });
      // Overlay data is put into the db with the below call.
      overlaySaveData.save(function (err) {
        if (err) {
          console.log(err.stack);
        }
        //console.log("Saved Overlay data for timestamp: " + timestamp);
      });
      var topologySaveData = new topologyModel({
        _id: timestamp,
        Topology: transformedData[1], // Topology Array
      });
      // Topology data is put into the db with the below call.
      topologySaveData.save(function (err) {
        if (err) {
          console.log(err.stack);
        }
        //console.log("Saved Topology data for timestamp:" + timestamp);
      });
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * Database call to get the intervals stored.
   *
   * @param {String} tableName Model Name to use to find the intervals.
   */
  async getIntervals(tableName) {
    return tableName.find({}, { Overlays: 0 });
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
      return tableName
        .find({ _id: { $gt: intervalId } })
        .sort({ _id: 1 })
        .limit(1);
    }
    //Most recent entry - intervalId not passed
    return tableName.find().sort({ _id: -1 }).limit(1);
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
      return tableName
        .find(
          {
            Topology: { $elemMatch: { OverlayId: overlayId } },
            _id: { $gt: intervalId },
          },
          { "Topology.$": 1 }
        )
        .sort({ _id: 1 })
        .limit(1);
    }
    //Most recent entry - intervalId not passed
    return tableName
      .find(
        { Topology: { $elemMatch: { OverlayId: overlayId } } },
        { "Topology.$": 1 }
      )
      .sort({ _id: -1 })
      .limit(1);
  }

  async getOverlays(tableName, intervalId) {
    var overlayData = await this.findOverlays(tableName, intervalId);
    if (Object.keys(overlayData).length === 0) {
      const pipeline = [{ $match: { operationType: "insert" } }]; //watch for insert operation
      const overlayChangeStream = this.db
        .db("Evio")
        .collection("Overlays")
        .watch(pipeline);
      await Promise.resolve(overlayChangeStream.hasNext());
      let newData = await Promise.resolve(overlayChangeStream.next());
      overlayData = [newData.fullDocument];
      overlayChangeStream.close();
    }
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
    var topologyData = await this.findTopology(
      tableName,
      intervalId,
      overlayId
    );
    if (Object.keys(topologyData).length === 0) {
      const pipeline = [{ $match: { operationType: "insert" } }];
      const topologyChangeStream = this.db
        .db("Evio")
        .collection("Topology")
        .watch(pipeline);
      await Promise.resolve(topologyChangeStream.hasNext());
      topologyChangeStream.close();
      topologyData = await this.findTopology(tableName, intervalId, overlayId);
    }
    return topologyData;
  }
}
module.exports = { MongoDBImpl };
