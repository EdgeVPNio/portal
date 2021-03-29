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

const {overlayModel, topologyModel} = require('../db/Model');
/**
 * Function to retrieve all Intervals from the database
 */
exports.findAllIntervals = (req, res, dbInstance) => {
  
    dbInstance.getIntervals(overlayModel)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving intervals."
        });
      });
};

/**
 *  Function to retrieve all Overlays present at a particular interval
 */ 
 exports.findOverlays = (req, res, dbInstance) => {

  const intervalId = parseFloat(req.query.interval);
  dbInstance.checkOverlayUpdate(overlayModel, intervalId).then(data => {
      var overlaysInterval = setInterval(function() {
        if (data) {
          console.log("Response data being sent:", data);
          res.send(data)
          clearInterval(overlaysInterval);
        }
      }, 1000);
  })
  .catch(err => {
    res.status(502).send({
      message:
        err.message || "Some error occurred while retrieving overlays."
    });
  });
};

