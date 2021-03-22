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
 * Function to retrieve all topology information from the database, given intervalId and overlayId
 */ 
exports.findTopology = (req, res, dbInstance) => {
    
    const overlayId = req.query.overlayid;
    const intervalId = parseFloat(req.query.interval);
    var send = false;
    dbInstance.getTopology(topologyModel, intervalId, overlayId)
      .then(data => {
      send = true;
      if (Object.keys(data).length == 0) {
        send = false;
        const pipeline = [{'$match': {'operationType': 'insert'}}]; //watch for insert operation
        const topologyChangeStream = dbInstance.getDb().db('Evio').collection('Topology').watch(pipeline);

        topologyChangeStream.on('change', newData => {
          //console.log(newData);
          data = [newData.fullDocument];
          send = true;
        });
      }
      //Logic to check every 1 second for insert on db
      var topologyIntervalId = setInterval(function(){
        if (send) {
          res.send(data); //data found and sent to client, clearing interval time
          clearInterval(topologyIntervalId);
        }
      }, 1000);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving topology."
      });
    });
};
