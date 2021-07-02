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
    var topologies = {};
    var overlays = {};
    var topologyArray = [];
    var overlaysArray = [];
    for (var timeStampId in data) {
      var visData = data[timeStampId]["VizData"];
      var nodeId = data[timeStampId]["NodeId"];
      for (var overlayId in visData) {
        var topoData;
        var overlaySummary;
        if (topologies.hasOwnProperty(overlayId)) {
          topoData = topologies[overlayId];
        } else {
          topoData = {
            OverlayId: overlayId,
            Nodes: {},
            Edges: {},
          };
          topologies[overlayId] = topoData;
        }
        if (overlays.hasOwnProperty(overlayId)) {
          overlaySummary = overlays[overlayId];
        } else {
          overlaySummary = {
            OverlayId: overlayId,
            Nodes: new Set(),
            Edges: new Set(),
          };
          overlays[overlayId] = overlaySummary;
        }
        var nodeObject = {}; 
        if (topoData["Nodes"].hasOwnProperty(nodeId)){
          nodeObject = topoData["Nodes"][nodeId]
        }
        nodeObject["NodeId"] = nodeId
        nodeObject["NodeName"] = data[timeStampId]["NodeName"];
        nodeObject["Version"] = data[timeStampId]["Version"];
        nodeObject["GeoCoordinates"] = data[timeStampId]["GeoCoordinate"];
        nodeObject["Edges"] = [];
        overlaySummary["Nodes"].add(nodeObject.NodeId);
        topoData["Nodes"][nodeObject.NodeId] = nodeObject;
        
        var edges = visData[overlayId]["Tunnels"];
        for (var edgeId in edges) {
          nodeObject["Edges"].push(edgeId);
          var edgeData = edges[edgeId];
          var edgeObject = {"Descriptor": []};
          if (topoData["Edges"].hasOwnProperty(edgeId)) {
            edgeObject = topoData["Edges"][edgeId];
          }
          edgeObject["EdgeId"] = edgeId;
          edgeObject["Descriptor"].push({
            Source: nodeId,
            Target: edgeData["PeerId"],
            CreatedTime: edgeData["CreatedTime"],
            ConnectedTime: edgeData["ConnectedTime"],
            State: edgeData["State"],
            Type: edgeData["Type"],
            TapName: edgeData["TapName"],
            MAC: edgeData["MAC"],
          });

          overlaySummary["Nodes"].add(edgeData["PeerId"]); //add data about the edge's target
          if (!topoData["Nodes"].hasOwnProperty(edgeData["PeerId"])) {
            topoData["Nodes"][edgeData["PeerId"]] = {
              NodeId: edgeData["PeerId"],
            };
          } // only add topo data about the edge's target node is it has not yet been reported

          overlaySummary["Edges"].add(edgeId);
          topoData["Edges"][edgeObject.EdgeId] = edgeObject;
        }
      }
    }
    Object.keys(topologies).forEach(function (olid) {
      topologyArray.push(topologies[olid]);
    });
    Object.keys(overlays).forEach(function (olid) {
      var overlayObject = {
        OverlayId: overlays[olid]["OverlayId"],
        NumNodes: overlays[olid]["Nodes"].size,
        NumEdges: overlays[olid]["Edges"].size,
      };
      overlaysArray.push(overlayObject);
    });
    return [overlaysArray, topologyArray];
  }
}

module.exports = { DataTransformer };
