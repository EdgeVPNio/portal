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
   
    dbInstance.getOverlays(overlayModel, intervalId)
    .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving overlays."
        });
      });
};
