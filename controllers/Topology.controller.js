const {overlayModel, topologyModel} = require('../db/Model');
/**
 * Function to retrieve all topology information from the database, given intervalId and overlayId
 */ 
exports.findTopology = (req, res, dbInstance) => {
    
    const overlayId = req.query.overlayid;
    const intervalId = parseFloat(req.query.interval);

    dbInstance.getTopology(topologyModel, intervalId, overlayId)
      .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
};