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
    var overlayDict = {};
    var topologyArray = [];
    var overlaysArray = [];
    for (var timeStampId in data) {
      var visData = data[timeStampId]["VizData"];
      for (var overlayId in visData) {
        if (topologyDict.hasOwnProperty(overlayId)) {
          var overlayData = topologyDict[overlayId];
        } else {
          var overlayData = {
            OverlayId: overlayId,
            Nodes: {},
          };
          topologyDict[overlayId] = overlayData;
        }
        if (overlayDict.hasOwnProperty(overlayId)) {
          var highLevelOverlayData = overlayDict[overlayId];
        } else {
          var highLevelOverlayData = {
            OverlayId: overlayId,
            Nodes: new Set(),
            Edges: new Set(),
          };
        }
        overlayData["OverlayId"] = overlayId;
        var linkManagerData = visData[overlayId]["LinkManager"];
        var topologyData = visData[overlayId]["Topology"];
        var nodeObject = {
          NodeId: data[timeStampId]["NodeId"],
          NodeName: data[timeStampId]["NodeName"],
          Version: data[timeStampId]["Version"],
          GeoCoordinates: data[timeStampId]["GeoCoordinate"],
          Edges: [],
        };

        for (var nodeId in linkManagerData) {
          var edgeData = linkManagerData[nodeId];
          for (var edgeId in edgeData) {
            highLevelOverlayData["Edges"].add(edgeId);
            var edgeObject = {
              EdgeId: edgeId,
              PeerId: topologyData[edgeId]["PeerId"],
              CreatedTime: topologyData[edgeId]["CreatedTime"],
              ConnectedTime: topologyData[edgeId]["ConnectedTime"],
              State: topologyData[edgeId]["State"],
              Type: topologyData[edgeId]["Type"],
              TapName: linkManagerData[nodeId][edgeId]["TapName"],
              MAC: linkManagerData[nodeId][edgeId]["MAC"],
            };
            nodeObject["Edges"].push(edgeObject);
          }

          highLevelOverlayData["Nodes"].add(nodeObject.NodeId);
          overlayData["Nodes"][nodeObject.NodeId] = nodeObject;
          //console.log("overlayData: ", overlayData)
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
        OverlayId: overlayDict[item]["OverlayId"],
        NumNodes: overlayDict[item]["Nodes"].size,
        NumEdges: overlayDict[item]["Edges"].size,
      };
      overlaysArray.push(overlayObject);
    });
    return [overlaysArray, topologyArray];
  }
}

module.exports = { DataTransformer };
