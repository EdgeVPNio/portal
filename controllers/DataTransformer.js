
/**
 * Class to hold the data transform functionality.
 */
class DataTransformer {
    /**
     * Function to transform the raw data into data required to be stored in the DB.
     * Refer to the design document for more details on the data format.
     * 
     * @param {JSON} data Json raw aggregated data.
     */
    transformData(data) {
        var topologyDict = {};
        var overlayDict = {}
        var topologyArray = [];
        var overlaysArray = []
        for (var timeStampId in data) {
            var visData = data[timeStampId]['VizData'];
            for (var overlayId in visData) {
                if (topologyDict.hasOwnProperty(overlayId)) {
                    var overlayData = topologyDict[overlayId]
                }
                else {
                    var overlayData = {
                        OverlayId:overlayId,
                        Nodes:[]
                    }
                    topologyDict[overlayId] = overlayData;
                }
                if (overlayDict.hasOwnProperty(overlayId)) {
                    var highLevelOverlayData = overlayDict[overlayId]
                }
                else {
                    var highLevelOverlayData = {
                        OverlayId:overlayId,
                        Nodes:[],
                        Edges:[]
                    }
                }
                overlayData['OverlayId'] = overlayId;
                var linkManagerData = visData[overlayId]['LinkManager'];
                var topologyData = visData[overlayId]['Topology'];
                var nodeObject = {
                    NodeId:data[timeStampId]['NodeName'],
                    NodeName:data[timeStampId]['NodeName'],
                    Version:data[timeStampId]['Version'],
                    Edges:[]
                };
                for (var nodeId in linkManagerData) {
                    if(!highLevelOverlayData['Nodes'].includes(nodeId)) {
                        highLevelOverlayData['Nodes'].push(nodeId);
                    }
                    nodeObject['NodeId'] = nodeId;
                    var edgeData = linkManagerData[nodeId]
                    for (var edgeId in edgeData) {
                        if(!highLevelOverlayData['Edges'].includes(edgeId)) {
                            highLevelOverlayData['Edges'].push(edgeId);
                        }
                        var edgeObject = {
                            EdgeId:edgeId,
                            PeerId:topologyData[edgeId]['PeerId'],
                            CreatedTime:topologyData[edgeId]['CreatedTime'],
                            ConnectedTime:topologyData[edgeId]['ConnectedTime'],
                            State:topologyData[edgeId]['ConnectedTime'],
                            Type:topologyData[edgeId]['Type'],
                            TapName:linkManagerData[nodeId][edgeId]['TapName'],
                            MAC:linkManagerData[nodeId][edgeId]['MAC']
                        }
                        nodeObject['Edges'].push(edgeObject);
                    }
                    overlayData['Nodes'].push(nodeObject);
                }
                topologyDict[overlayId] = overlayData;
                overlayDict[overlayId] = highLevelOverlayData;
            }    
        }
        Object.keys(topologyDict).forEach(function (item) {
            topologyArray.push(topologyDict[item]);
        });
        Object.keys(overlayDict).forEach(function (item) {
            var overlayObject = {
                OverlayId:overlayDict[item]['OverlayId'],
                NumNodes:overlayDict[item]['Nodes'].length,
                NumEdges:overlayDict[item]['Edges'].length
            }
            overlaysArray.push(overlayObject);
        });
        return [overlaysArray, topologyArray];
    }
}

module.exports = { DataTransformer }