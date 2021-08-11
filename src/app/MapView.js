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
import React from "react";
import ReactDOM from "react-dom";
import CollapseButton from "./CustomCollapsibleButton";
import SideBar from "./Sidebar";
import { connect } from "react-redux";
import {
  setCyElements,
  setSubgraphCyElements,
} from "../features/evio/evioSlice";
import { appViews, nodeStates } from "./Shared";
import { setCurrentView } from "../features/view/viewSlice";
import GoogleMapReact from "google-map-react";

class MapView extends React.Component {
  constructor(props) {
    super(props);
    this.intervalId = null;
    this.timeoutId = null;
    this.autoRefresh = this.props.autoUpdate;
    this.state = {
      show: false,
    };
  }

  /**
   * Polling function on GET Topology data - runs untill autoUpdate is disabled
   * @param {String} overlayId
   * @param {String} intervalId
   */
  async apiQueryTopology(overlayId, intervalId) {
    var url = "/topology?overlayid=" + overlayId + "&interval=" + intervalId;
    var resp = await fetch(url).then((res) => {
      return res.json();
    });
    console.log("apiQueryTopology: ", resp);
    return resp;
  }

  queryTopology() {
    if (this.autoRefresh)
      this.apiQueryTopology(this.props.currentOverlayId, this.intervalId)
        .then((res) => {
          if (this.autoRefresh) {
            this.props.setCyElements(this.buildCyElements(res[0].Topology));
            this.intervalId = res[0]._id;
            //this.renderMapContent()
            this.queryTopology();
          }
        })
        .catch((err) => {
          console.warn("query topology failed ", err);
          if (this.autoRefresh) {
            this.timeoutId = setTimeout(this.queryTopology.bind(this), 30000);
          }
        });
  }

  buildCyElements = (topologies) => {
    var elements = [];
    var nodeDetails = {};

    if (topologies.length < 1) return elements;
    var topology = topologies[0];

    for (var nid in topology.Nodes) {
      var node = topology.Nodes[nid];
      var nodeData = {
        group: "nodes",
        data: {
          id: node.NodeId,
        },
      };
      if (node.hasOwnProperty("NodeName"))
        nodeData["data"]["label"] = node.NodeName;
      else nodeData["data"]["label"] = node.NodeId.slice(0, 12);
      if (node.hasOwnProperty("Version"))
        nodeData["data"]["version"] = node.Version;
      else nodeData["data"]["version"] = "0.0.0";
      if (node.hasOwnProperty("GeoCoordinates"))
        nodeData["data"]["coords"] = node.GeoCoordinates;
      else nodeData["data"]["coords"] = "0,0";
      if (node.hasOwnProperty("Edges")) {
        nodeData["data"]["edges"] = node.Edges;
        if (node.Edges.length === 0) {
          nodeData["data"]["state"] = nodeStates.noTunnels;
          nodeData["data"]["color"] = "#F2BE22";
        } else {
          nodeData["data"]["state"] = nodeStates.connected;
          nodeData["data"]["color"] = "#8AA626";
        }
      } else {
        nodeData["data"]["state"] = nodeStates.notReporting;
        nodeData["data"]["color"] = "#ADD8E6";
      }
      nodeDetails[node.NodeId] = nodeData;
    }
    for (var edgeId in topology.Edges) {
      var edge = topology.Edges[edgeId];
      if (edge["Descriptor"].length > 2) {
        console.error(
          "Too many edge descriptors reported ",
          JSON.stringify(edge["Descriptor"])
        );
      }
      var edgeData = {
        group: "edges",
        data: {},
      };
      edgeData["data"]["id"] = edge.EdgeId;
      edgeData["data"]["descriptor"] = edge["Descriptor"];
      edgeData["data"]["label"] = edge.EdgeId.slice(0, 12);
      edgeData["data"]["source"] = edge["Descriptor"][0].Source;
      edgeData["data"]["target"] = edge["Descriptor"][0].Target;
      edgeData["data"]["color"] = this.getLinkColor(edge["Descriptor"][0].Type);
      edgeData["data"]["style"] = this.getLinkStyle(
        edge["Descriptor"][0].State
      );
      if (
        edge["Descriptor"].length === 2 &&
        edge["Descriptor"][0].Source > edge["Descriptor"][1].Source
      ) {
        edgeData["data"]["source"] = edge["Descriptor"][1].Source;
        edgeData["data"]["target"] = edge["Descriptor"][1].Target;
        edgeData["data"]["color"] = this.getLinkColor(
          edge["Descriptor"][1].Type
        );
        edgeData["data"]["style"] = this.getLinkStyle(
          edge["Descriptor"][1].State
        );
      }
      elements.push(edgeData);
    }
    var nodes = Object.keys(nodeDetails).sort();
    nodes.forEach((nodeId) => elements.push(nodeDetails[nodeId]));

    return elements;
  };

  getLinkColor(type) {
    var linkColor;
    switch (type) {
      case "CETypeILongDistance":
        linkColor = "#5E4FA2";
        break;
      case "CETypeLongDistance":
        linkColor = "#5E4FA2";
        break;
      case "CETypePredecessor":
        linkColor = "#01665E";
        break;
      case "CETypeSuccessor":
        linkColor = "#01665E";
        break;
      default:
        break;
    }
    return linkColor;
  }

  getLinkStyle(state) {
    var linkStyle;
    switch (state) {
      case "CEStateInitialized":
      case "CEStatePreAuth":
      case "CEStateAuthorized":
      case "CEStateCreated":
        linkStyle = "dotted";
        break;
      case "CEStateConnected":
        linkStyle = "solid";
        break;
      case "CEStateDisconnected":
      case "CEStateDeleting":
        linkStyle = "dashed";
        break;
      default:
        break;
    }
    return linkStyle;
  }
  getUniqueCoords(nodeCoords) {
    var tempArray = [];
    var distinctCoords = nodeCoords;
    var nodesWithSameCoords = [];
    for (var i = 0; i < nodeCoords.length; i++) {
      if (tempArray.length > 0) {
        for (var j = 0; j < tempArray.length; j++) {
          if (
            tempArray[j].coords[0] === nodeCoords[i].coords[0] &&
            tempArray[j].coords[1] === nodeCoords[i].coords[1]
          ) {
            nodesWithSameCoords.push(nodeCoords[i]);
            nodesWithSameCoords.push(tempArray[j]);
          }
        }
        tempArray.push(nodeCoords[i]);
      } else {
        tempArray.push(nodeCoords[i]);
      }
    }
    for (var i = 0; i < distinctCoords.length; i++) {
      for (var j = i + 1; j < distinctCoords.length; j++) {
        if (
          distinctCoords[j].coords[0] === distinctCoords[i].coords[0] &&
          distinctCoords[j].coords[1] === distinctCoords[i].coords[1]
        ) {
          distinctCoords.splice(j, 1);
        }
      }
    }
    return nodesWithSameCoords;
  }
  createCollapsibleNodeDetails(cyNodes) {
    var nodeContent = (
      <>
        {cyNodes.map((node) => {
          try {
            var nodeBtn = (
              <CollapseButton title={node.label}>
                <div className="DetailsLabel">Node ID</div>
                <label id="valueLabel">{node.id}</label>
                <div className="DetailsLabel">State</div>
                <label id="valueLabel">{node.state}</label>
                <div className="DetailsLabel">Version</div>
                <label id="valueLabel">{node.version}</label>
                <div className="DetailsLabel">Location Coordinates</div>
                <label id="valueLabel">{node.coords}</label>
              </CollapseButton>
            );
            return nodeBtn;
          } catch (e) {
            console.log(e);
            return false;
          }
        })}
      </>
    );
    return nodeContent;
  }
  getNodesWithSelectedMarker(lat, lng, filteredEles) {
    var nodes = [];
    var sidebarNodes = [];
    for (var cyEle of filteredEles) {
      if (
        cyEle.group === "nodes" &&
        cyEle.data.state === nodeStates.connected
      ) {
        nodes.push(cyEle.data);
      }
    }
    for (var j = 0; j < nodes.length; j++) {
      if (
        nodes[j].coords.split(",")[0] === lat &&
        nodes[j].coords.split(",")[1] === lng
      ) {
        sidebarNodes.push(nodes[j]);
      }
    }
    ReactDOM.render(
      <div>
        <div>Selected Nodes</div>
        <div> {this.createCollapsibleNodeDetails(sidebarNodes)} </div>
      </div>,
      document.getElementById("sideBarContent")
    );
  }
  setSidebarDetails(node, filteredEles) {
    this.getNodesWithSelectedMarker(
      node.coords[0],
      node.coords[1],
      filteredEles
    );
  }
  getMapComponent(filteredEles) {
    var nodeCoords = [];
    var sameCoordinateLabels = [];
    for (var cyEle of filteredEles) {
      if (
        cyEle.group === "nodes" &&
        cyEle.data.state === nodeStates.connected
      ) {
        nodeCoords.push({
          label: cyEle.data.label,
          coords: cyEle.data.coords.split(","),
        });
      }
    }
    var nodesWithSameCoords = this.getUniqueCoords(nodeCoords);
    for (var nSC of nodesWithSameCoords) {
      sameCoordinateLabels.push(nSC.label);
    }
    return (
      <GoogleMapReact
        bootstrapURLKeys={{ key: "AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs" }} //GoogleMap api-key to replace/encrypt
        defaultCenter={{
          lat: parseFloat(29.65723243360335),
          lng: parseFloat(-82.29323614110713),
        }}
        defaultZoom={2}
      >
        {nodeCoords.map((node) => {
          return (
            <button
              key={node.label + "Marker"}
              id={node.label + "Marker"}
              className={
                sameCoordinateLabels.includes(node.label)
                  ? "nodeMarker cluster"
                  : "nodeMarker selected"
              }
              lat={parseFloat(node.coords[0])}
              lng={parseFloat(node.coords[1])}
              onClick={(e) => this.setSidebarDetails(node, filteredEles)}
            >
              <label className="markerLabel">
                {sameCoordinateLabels.includes(node.label)
                  ? "cluster"
                  : node.label}
              </label>
            </button>
          );
        })}
      </GoogleMapReact>
    );
  }
  renderMapContent() {
    if (this.props.subgraphCyElements.length > 0) {
      var subGraphCyEles = [];
      var elements = {};
      for (var neigh of this.props.subgraphCyElements) {
        if (neigh._private.group === "nodes") {
          var nodeData = {};
          nodeData["group"] = neigh._private.group;
          nodeData["data"] = neigh._private.data;
          elements[neigh._private.data.id] = nodeData;
        }
      }
      var nodeIds = Object.keys(elements);
      nodeIds.forEach((nodeId) => subGraphCyEles.push(elements[nodeId]));
      return this.getMapComponent(subGraphCyEles);//passing subgraphcyelements if request from subgraphview
    } else {
      return this.getMapComponent(this.props.cyElements);//passing all cyelements if request from topologyview
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.autoUpdate !== prevProps.autoUpdate) {
      this.autoRefresh = this.props.autoUapdate;
      if (this.autoRefresh && this.props.subgraphCyElements.length === 0) {
        this.queryTopology();
      }
    }
  }
  componentDidMount(prevProps, prevState) {
    this.props.setCurrentView(appViews.MapView);
    this.autoRefresh = this.props.autoUpdate;
    if (this.autoRefresh && this.props.subgraphCyElements.length === 0) {
      this.queryTopology();
    }
  }
  componentWillUnmount() {
    this.autoRefresh = false;
    clearTimeout(this.timeoutId);
    this.props.setSubgraphCyElements([]);
  }

  render() {
    return (
      <>
        <section style={{ width: "100vw", height: "100vh" }}>
          <div id="mapArea" style={{ width: "100vw", height: "100vh" }}>
            {this.renderMapContent()}
          </div>
        </section>
        <div id="SidePanel">
          <SideBar />
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  currentOverlayId: state.evio.selectedOverlayId,
  cyElements: state.evio.cyElements,
  subgraphCyElements: state.evio.subgraphCyElements,
  currentView: state.view.current,
  selectedView: state.view.selected,
  autoUpdate: state.tools.autoUpdate,
});

const mapDispatchToProps = {
  setCurrentView,
  setCyElements,
  setSubgraphCyElements,
};

export default connect(mapStateToProps, mapDispatchToProps)(MapView);
