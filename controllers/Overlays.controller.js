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

const {overlayModel} = require('../db/Model');
/**
 * Function to retrieve all Intervals from the database
 */
exports.findAllIntervals = (req, res, dbInstance) => {
    var tableName = null;
    if (process.env.DB === 'mongo') {
      tableName = overlayModel;
    } else if (process.env.DB === 'influx') {
      tableName = 'Overlays'
    }
    dbInstance.getIntervals(tableName)
      .then(data => {
          //console.log("Interval data:", data);
          res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "An error occurred while retrieving intervals."
        });
      });
};

/**
 *  Function to retrieve all Overlays present at a particular interval
 */ 
 exports.findOverlays = (req, res, dbInstance) => {

  const intervalId = parseFloat(req.query.interval);
  var tableName = null;
    if (process.env.DB === 'mongo') {
      tableName = overlayModel;
    } else if (process.env.DB === 'influx') {
      tableName = 'Overlays'
    }
  dbInstance.getOverlays(tableName, intervalId)
    .then(data => {
          //console.log("Overlay data:", JSON.stringify(data));
          res.send(data);
    })
    .catch(err => {
    res.status(502).send({
      message:
        err.message || "An error occurred while retrieving overlays."
    });
  });
};

