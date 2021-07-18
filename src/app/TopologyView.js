import React from "react";
import ReactDOM from "react-dom";
//import cytoscape from "cytoscape";
import Cytoscape from "react-cytoscapejs";
//import CytoscapeComponent from "react-cytoscapejs";
import CollapsibleButton from "./CollapsibleButton";
import cytoscapeStyle from "./cytoscapeStyle.js";
import { Typeahead } from "react-bootstrap-typeahead";
//import { Spinner } from "react-bootstrap";
import SideBar from "./Sidebar";
import { connect } from "react-redux";
import { setCyElements } from "../features/evio/evioSlice";
import {
  //setSelectedElement,
  //clearSelectedElement,
  //elementTypes,
  setRedrawGraph,
} from "../features/evio/evioSlice";
import { setCurrentView } from "../features/view/viewSlice";
import { setZoomValue } from "../features/tools/toolsSlice";

const nodeStates = {
  connected: "Connected",
  noTunnels: "No Tunnels",
  notReporting: "Not Reporting",
};

class TopologyView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSwapToggle: false,
    };
    this.intervalId = null;
    this.timeoutId = null;
    this.autoRefresh = this.props.autoUpdate;
    this.cy = null;
    this._typeahead = null;
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
            //console.log("cyElements:", this.props.cyElements);
            this.intervalId = res[0]._id;
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

  partitionElements(selectedElement) {
    var neighborhood;
    var excluded;
    if (selectedElement.isNode()) {
      neighborhood = selectedElement
        .outgoers()
        .union(selectedElement.incomers())
        .union(selectedElement);
      excluded = this.cy
        .elements()
        .difference(
          selectedElement.outgoers().union(selectedElement.incomers())
        )
        .not(selectedElement);
      let adj = selectedElement.neighborhood();
      let abscomp = adj.absoluteComplement();
      // console.log("nei", neighborhood, "adj", adj);
      // console.log("excluded", excluded, "abscomp", abscomp);
    } else if (selectedElement.isEdge()) {
      neighborhood = selectedElement.connectedNodes().union(selectedElement);
      excluded = this.cy
        .elements()
        .difference(selectedElement.connectedNodes())
        .not(selectedElement);
    }
    return { neighborhood, excluded };
  }

  async queryGeoCoordinates(coordinates) {
    coordinates = coordinates.split(",");
    if (coordinates.length < 2) return "Unknown";
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates[0]},${coordinates[1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`
      );
      var data = await res.json();
      var nodeLocation =
        data.results[data.results.length - 1].formatted_address;
      console.log("formatted_address", nodeLocation);
      return nodeLocation.slice(7, nodeLocation.length);
    } catch (err) {
      return "Unknown";
    }
  }

  renderTypeahead() {
    return (
      <Typeahead
        id="searchTopology"
        onChange={(selected) => {
          if (selected.length > 0) {
            let selectedEle = this.cy
              //.elements()
              .getElementById(selected[0].data.id);
            this.cy.elements().unselect();
            selectedEle.select();
            let part = this.partitionElements(selectedEle);
            part.neighborhood.removeClass("transparent");
            part.excluded.addClass("transparent");
          }
        }}
        ref={(ref) => (this._typeahead = ref)}
        options={this.props.cyElements}
        placeholder={"search by node or tunnel ID"}
        labelKey={(option) => {
          return `${option.data.label}`;
        }}
        renderMenuItemChildren={(option) => {
          return (
            <div className="searchResult">
              <div className="resultLabel">
                <b>{option.data.label}</b>
              </div>
              <small className="resultLabel">{`ID : ${option.data.id}`}</small>
              <br />
            </div>
          );
        }}
      ></Typeahead>
    );
  }

  getNotReportingNodeDetails(notReportingNode) {
    var nodeContent = (
      <CollapsibleButton
        id={notReportingNode.data().id + "Btn"}
        className="detailsNodeBtn"
        key={notReportingNode.data().id + "Btn"}
        name={notReportingNode.data().label}
        isOpen
      >
        <div>
          <h5>{notReportingNode.data().label}</h5>
          <div className="DetailsLabel">Node ID</div>
          <label id="valueLabel">{notReportingNode.data().id}</label>
          <div className="DetailsLabel">State</div>
          <label id="valueLabel">{notReportingNode.data().state}</label>
          <div className="DetailsLabel">Location</div>
          <label id="valueLabel">{"Unknown"}</label>
          <hr style={{ backgroundColor: "#486186" }} />
        </div>
      </CollapsibleButton>
    );
    return nodeContent;
  }

  getConnectedNodeDetails(cyNode, connectedNodes, connectedEdges) {
    var sidebarNodeslist = [];
    for (var el of connectedNodes) {
      if (cyNode.data() !== el.data()) {
        sidebarNodeslist.push(el.data());
      }
    }
    var nodeContent = (
      <CollapsibleButton
        id={cyNode.data().label + "Btn"}
        className="detailsNodeBtn"
        key={cyNode.data().label + "Btn"}
        name={cyNode.data().label}
      >
        <div>
          <h5>{cyNode.data().label}</h5>
          <div id="DetailsLabel">Node ID</div>
          <label id="valueLabel">{cyNode.data().id}</label>
          <div className="DetailsLabel">State</div>
          <label id="valueLabel">{cyNode.data().state}</label>
          <div className="DetailsLabel">Location</div>
          <label id="valueLabel">{cyNode.data().location}</label>
          <hr style={{ backgroundColor: "#486186" }} />
          <div id="connectedNode" style={{ overflow: "auto" }}>
            {sidebarNodeslist.map((connectedNode) => {
              try {
                let [connectedlinkDetail, tunnelId] =
                  this.getConnectedLinkDetails(
                    cyNode,
                    connectedNode,
                    connectedEdges
                  );
                var connectedNodeBtn = (
                  <CollapsibleButton
                    id={connectedNode.label + "Btn"}
                    className="connectedNodeBtn"
                    key={connectedNode.label + "Btn"}
                    eventKey={connectedNode.label}
                    name={connectedNode.label}
                  >
                    <div className="DetailsLabel">Node ID</div>
                    <label id="valueLabel">{connectedNode.id}</label>
                    <div className="DetailsLabel">Tunnel ID</div>
                    <label id="valueLabel">{tunnelId}</label>
                    <div className="DetailsLabel">Interface Name</div>
                    <label id="valueLabel">{connectedlinkDetail.TapName}</label>
                    <div className="DetailsLabel">MAC</div>
                    <label id="valueLabel">{connectedlinkDetail.MAC}</label>
                    <div className="DetailsLabel">State</div>
                    <label id="valueLabel">
                      {connectedlinkDetail.State.slice(
                        7,
                        connectedlinkDetail.State.length
                      )}
                    </label>
                    <div className="DetailsLabel">Tunnel Type</div>
                    <label id="valueLabel">
                      {connectedlinkDetail.Type.slice(
                        6,
                        connectedlinkDetail.Type.length
                      )}
                    </label>
                  </CollapsibleButton>
                );

                return connectedNodeBtn;
              } catch (e) {
                console.log(e);
                return false;
              }
            })}
          </div>
        </div>
      </CollapsibleButton>
    );
    return nodeContent;
  }

  getNotConnectedNodeDetails(cyNode) {
    var nodeContent = (
      //No tunnels node
      <CollapsibleButton
        id={cyNode.data().id + "Btn"}
        className="detailsNodeBtn"
        key={cyNode.data().id + "Btn"}
        name={cyNode.data().label}
        isOpen
      >
        <div>
          <h5>{cyNode.data().label}</h5>
          <div className="DetailsLabel">Node ID</div>
          <label id="valueLabel">{cyNode.data().id}</label>
          <div className="DetailsLabel">State</div>
          <label id="valueLabel">{cyNode.data().state}</label>
          <div className="DetailsLabel">Location</div>
          <label id="valueLabel">{cyNode.data().location}</label>
          <hr style={{ backgroundColor: "#486186" }} />
        </div>
      </CollapsibleButton>
    );
    return nodeContent;
  }

  renderNodeDetails = (cyNode, adj) => {
    var connectedNodes = adj.nodes();
    var connectedEdges = adj.edges();
    var nodeDetails = null;
    this.queryGeoCoordinates(cyNode.data("coords"))
      .then((loc) => {
        cyNode.data("location", loc);
        if (cyNode.data("state") === nodeStates.notReporting) {
          nodeDetails = this.getNotReportingNodeDetails(cyNode);
        } else if (cyNode.data("state") === nodeStates.connected) {
          nodeDetails = this.getConnectedNodeDetails(
            cyNode,
            connectedNodes,
            connectedEdges
          );
        } else if (cyNode.data("state") === nodeStates.noTunnels) {
          nodeDetails = this.getNotConnectedNodeDetails(cyNode);
        }
        ReactDOM.render(
          <div>
            <div> Node Details </div>
            <div> {nodeDetails} </div>
          </div>,
          document.getElementById("sideBarContent")
        );
      })
      .catch((err) => {
        console.warn(err);
      });
  };

  getConnectedLinkDetails(source, tgt, connectedEdges) {
    for (var edge of connectedEdges) {
      if (
        (source.data().id === edge.data("source") &&
          tgt.id === edge.data("target")) ||
        (source.data().id === edge.data.target &&
          tgt.id === edge.data("source"))
      ) {
        for (var descriptorItem of edge.data("descriptor")) {
          if (
            source.data().id === descriptorItem.Source &&
            tgt.id === descriptorItem.Target
          ) {
            return [descriptorItem, edge.data("id")];
          }
        }
      }
    }
  }

  getSourceAndTargetDetails(cyEdge) {
    var sourceNodeLinkDetails;
    var targetNodeLinkDetails;
    var srcNode;
    var tgtNode;
    var selectedTunnel = cyEdge.data();
    for (var descriptor of selectedTunnel.descriptor) {
      if (
        descriptor.Source === selectedTunnel.source &&
        descriptor.Target === selectedTunnel.target
      ) {
        sourceNodeLinkDetails = descriptor;
        srcNode = this.cy.getElementById(sourceNodeLinkDetails.Source).data();
        if (selectedTunnel.descriptor.length === 1) {
          tgtNode = this.cy.getElementById(sourceNodeLinkDetails.Target).data();
        }
      } else if (
        descriptor.Target === selectedTunnel.source &&
        descriptor.Source === selectedTunnel.target
      ) {
        targetNodeLinkDetails = descriptor;
        tgtNode = this.cy.getElementById(targetNodeLinkDetails.Source)._private
          .data;
      }
    }
    if (this.state.isSwapToggle === false) {
      return [sourceNodeLinkDetails, srcNode, tgtNode];
    } else {
      //if swapbutton toggled then swap source and node details
      if (selectedTunnel.descriptor.length === 1)
        return [sourceNodeLinkDetails, tgtNode, srcNode];
      return [targetNodeLinkDetails, tgtNode, srcNode];
    }
  }

  getTunnelWithBothReportingNodes(selectedTunnel) {
    var LocalEndpointInternal;
    var [sourceNodeLinkDetails, srcNode, tgtNode] =
      this.getSourceAndTargetDetails(selectedTunnel);
    if (sourceNodeLinkDetails.LocalEndpoint.Internal === ":0") {
      LocalEndpointInternal = "NA";
    } else {
      LocalEndpointInternal = sourceNodeLinkDetails.LocalEndpoint.Internal;
    }

    var linkContent = (
      <CollapsibleButton
        id={sourceNodeLinkDetails.TapName + "Btn"}
        className="detailsLinkBtn"
        key={selectedTunnel.id + "Btn"}
        name={sourceNodeLinkDetails.TapName}
        isOpen={true}
      >
        <div>
          <h5>{sourceNodeLinkDetails.TapName}</h5>
          <div className="row">
            <div className="col-10" style={{ paddingRight: "0" }}>
              <CollapsibleButton
                id={srcNode.label + "Btn"}
                className="sourceNodeBtn"
                key={srcNode.label + "Btn"}
                eventKey={srcNode.label + "Btn"}
                name={srcNode.label}
                style={{
                  marginBottom: "2.5%",
                  backgroundColor: "#8aa626",
                  border: `solid #8aa626`,
                }}
              >
                <div className="DetailsLabel">Node ID</div>
                <label id="valueLabel">{srcNode.id.slice(0, 7)}</label>
                <div className="DetailsLabel">State</div>
                <label id="valueLabel">{srcNode.state}</label>
                <div className="DetailsLabel">Location</div>
                {/* <label id="valueLabel">{sourceLocation.slice(7, sourceLocation.length)}</label> */}
                <label id="valueLabel">{"Unknown"}</label>
              </CollapsibleButton>

              <CollapsibleButton
                id={tgtNode.label + "Btn"}
                className="targetNodeBtn"
                key={tgtNode.label + "Btn"}
                eventKey={tgtNode.label + "Btn"}
                name={tgtNode.label}
                style={{
                  marginBottom: "2.5%",
                  backgroundColor: "#8aa626",
                  border: `solid #8aa626`,
                }}
              >
                <div className="DetailsLabel">Node ID</div>
                <label id="valueLabel">{tgtNode.id.slice(0, 7)}</label>
                <div className="DetailsLabel">State</div>
                <label id="valueLabel">{tgtNode.state}</label>
                <div className="DetailsLabel">Location</div>
                {/* <label id="valueLabel">{targetLocation.slice(7, targetLocation.length)}</label> */}
                <label id="valueLabel">{"Unknown"}</label>
              </CollapsibleButton>
            </div>
            <div
              className="col"
              style={{ margin: "auto", padding: "0", textAlign: "center" }}
            >
              <button onClick={this.handleSwitch} id="switchBtn" />
            </div>
          </div>
          <hr style={{ backgroundColor: "#486186" }} />
          <div className="DetailsLabel">Tunnel ID</div>
          <label id="valueLabel">{selectedTunnel.id}</label>
          <div className="DetailsLabel">Interface Name</div>
          <label id="valueLabel">{sourceNodeLinkDetails.TapName}</label>
          <div className="DetailsLabel">MAC</div>
          <label id="valueLabel">{sourceNodeLinkDetails.MAC}</label>
          <div className="DetailsLabel">State</div>
          <label id="valueLabel">
            {sourceNodeLinkDetails.State.slice(
              7,
              sourceNodeLinkDetails.State.length
            )}
          </label>
          <div className="DetailsLabel">Tunnel Type</div>
          <label id="valueLabel">
            {sourceNodeLinkDetails.Type.slice(
              6,
              sourceNodeLinkDetails.Type.length
            )}
          </label>
          <div className="DetailsLabel">LocalEndpoint</div>
          <label id="valueLabel" style={{ fontSize: "16px" }}>
            {sourceNodeLinkDetails.LocalEndpoint.Proto}
            {`://`}
            {sourceNodeLinkDetails.LocalEndpoint.External}
            {"<>"}
            {LocalEndpointInternal}
          </label>
          <div className="DetailsLabel">RemoteEndpoint</div>
          <label id="valueLabel" style={{ fontSize: "16px" }}>
            {sourceNodeLinkDetails.RemoteEndpoint.Proto}
            {`://`}
            {sourceNodeLinkDetails.RemoteEndpoint.External}
          </label>
        </div>
      </CollapsibleButton>
    );
    return linkContent;
  }

  getTunnelWithEitherOneReportingNodes(selectedTunnel) {
    var LocalEndpointInternal;
    var [sourceNodeLinkDetails, srcNode, tgtNode] =
      this.getSourceAndTargetDetails(selectedTunnel);
    if (sourceNodeLinkDetails.LocalEndpoint.Internal === ":0") {
      LocalEndpointInternal = "NA";
    } else {
      LocalEndpointInternal = sourceNodeLinkDetails.LocalEndpoint.Internal;
    }
    var linkContent = (
      <CollapsibleButton
        id={sourceNodeLinkDetails.TapName + "Btn"}
        className="detailsLinkBtn"
        key={sourceNodeLinkDetails.TapName + "Btn"}
        name={sourceNodeLinkDetails.TapName}
        isOpen
      >
        <div>
          <h5>{sourceNodeLinkDetails.TapName}</h5>
          <div className="row">
            <div className="col-10" style={{ paddingRight: "0" }}>
              <CollapsibleButton
                id={srcNode.label + "Btn"}
                className="sourceNodeBtn"
                key={srcNode.label + "Btn"}
                eventKey={srcNode.label + "Btn"}
                name={srcNode.label}
                style={{
                  marginBottom: "2.5%",
                  backgroundColor: "#8aa626",
                  border: `solid #8aa626`,
                }}
              >
                <div className="DetailsLabel">Node ID</div>
                <label id="valueLabel">{srcNode.id.slice(0, 7)}</label>
                <div className="DetailsLabel">State</div>
                <label id="valueLabel">{srcNode.state}</label>
                <div className="DetailsLabel">Location</div>
                {/* <label id="valueLabel">{sourceLocation.slice(7, sourceLocation.length)}</label> */}
                <label id="valueLabel">{"Unknown"}</label>
              </CollapsibleButton>

              <CollapsibleButton
                id={tgtNode.label + "Btn"}
                className="targetNodeBtn"
                key={tgtNode.label + "Btn"}
                eventKey={tgtNode.label + "Btn"}
                name={tgtNode.label}
                style={{
                  marginBottom: "2.5%",
                  backgroundColor: "#8aa626",
                  border: `solid #8aa626`,
                }}
              >
                <div className="DetailsLabel">Node ID</div>
                <label id="valueLabel">{tgtNode.id.slice(0, 7)}</label>
                <div className="DetailsLabel">State</div>
                <label id="valueLabel">{tgtNode.state}</label>
                <div className="DetailsLabel">Location</div>
                {/* <label id="valueLabel">{sourceLocation.slice(7, sourceLocation.length)}</label> */}
                <label id="valueLabel">{"Unknown"}</label>
              </CollapsibleButton>
            </div>
            <div
              className="col"
              style={{ margin: "auto", padding: "0", textAlign: "center" }}
            >
              <button onClick={this.handleSwitch} id="switchBtn" />
            </div>
          </div>
          <hr style={{ backgroundColor: "#486186" }} />
          <div className="DetailsLabel">Tunnel ID</div>
          <label id="valueLabel">{selectedTunnel.id}</label>
          <div className="DetailsLabel">Interface Name</div>
          <label id="valueLabel">{sourceNodeLinkDetails.TapName}</label>
          <div className="DetailsLabel">MAC</div>
          <label id="valueLabel">{sourceNodeLinkDetails.MAC}</label>
          <div className="DetailsLabel">State</div>
          <label id="valueLabel">
            {sourceNodeLinkDetails.State.slice(
              7,
              sourceNodeLinkDetails.State.length
            )}
          </label>
          <div className="DetailsLabel">Tunnel Type</div>
          <label id="valueLabel">
            {sourceNodeLinkDetails.Type.slice(
              6,
              sourceNodeLinkDetails.Type.length
            )}
          </label>
          <div className="DetailsLabel">LocalEndpoint</div>
          <label id="valueLabel" style={{ fontSize: "16px" }}>
            {sourceNodeLinkDetails.LocalEndpoint.Proto}
            {`://`}
            {sourceNodeLinkDetails.LocalEndpoint.External}
            {"<>"}
            {LocalEndpointInternal}
          </label>
          <div className="DetailsLabel">RemoteEndpoint</div>
          <label id="valueLabel" style={{ fontSize: "16px" }}>
            {sourceNodeLinkDetails.RemoteEndpoint.Proto}
            {`://`}
            {sourceNodeLinkDetails.RemoteEndpoint.External}
          </label>
        </div>
      </CollapsibleButton>
    );
    return linkContent;
  }

  getTunnelWithNoReportingNodes() {
    var linkContentNR = (
      <CollapsibleButton
        id={"notReportingBtn"}
        className="detailsLinkBtn"
        key={"notReportingBtn"}
        name={"Details"}
      >
        <div>
          <label id="valueLabel">{"Data not available"}</label>
        </div>
      </CollapsibleButton>
    );
    return linkContentNR;
  }

  renderTunnelDetails = (cyEdge) => {
    var tunnelDetails;
    var selectedTunnelNodesDetails = [];
    try {
      var partitionElements = this.partitionElements(cyEdge);
      for (var node of partitionElements.neighborhood) {
        if (node._private.group === "nodes") {
          selectedTunnelNodesDetails.push(node.data());
        }
      }
      if (
        selectedTunnelNodesDetails[0].state === nodeStates.connected &&
        selectedTunnelNodesDetails[1].state === nodeStates.connected
      ) {
        tunnelDetails = this.getTunnelWithBothReportingNodes(cyEdge);
      } else if (
        (selectedTunnelNodesDetails[0].state === nodeStates.connected &&
          selectedTunnelNodesDetails[1].state === nodeStates.notReporting) ||
        (selectedTunnelNodesDetails[0].state === nodeStates.notReporting &&
          selectedTunnelNodesDetails[1].state === nodeStates.connected)
      ) {
        tunnelDetails = this.getTunnelWithEitherOneReportingNodes(cyEdge);
      } else if (
        selectedTunnelNodesDetails[0].state === nodeStates.notReporting &&
        selectedTunnelNodesDetails[1].state === nodeStates.notReporting
      ) {
        tunnelDetails = this.getTunnelWithNoReportingNodes();
      }
      ReactDOM.render(
        <div>
          <div> Tunnel Details </div>
          <div> {tunnelDetails} </div>
        </div>,
        document.getElementById("sideBarContent")
      );
    } catch (err) {
      console.warn(err);
    }
  };

  handleSwitch = () => {
    this.setState({ isSwapToggle: !this.state.isSwapToggle });
  };

  handleWheel(e) {
    this.props.setZoomValue(this.cy.zoom());
  }

  handleCytoClick(event) {
    var cyEle = event.target[0];
    try {
      if (event.target === this.cy) {
        //this.props.clearSelectedElement();
        this.cy.elements().removeClass("transparent");
        this._typeahead.clear();
        return;
      }
      var part = this.partitionElements(cyEle);
      part.neighborhood.removeClass("transparent");
      part.excluded.addClass("transparent");
      if (cyEle.isNode()) {
        this.renderNodeDetails(cyEle, cyEle.neighborhood());
      } else if (cyEle.isEdge()) {
        this.renderTunnelDetails(cyEle, part.neighborhood);
      }
    } catch (error) {
      //this.props.clearSelectedElement();
      this.cy.elements().removeClass("transparent");
      console.warn(error);
    }
  }

  componentDidMount() {
    this.props.setCurrentView("TopologyView");
    this.autoRefresh = this.props.autoUpdate;
    if (this.autoRefresh) {
      this.queryTopology();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.zoomValue !== prevProps.zoomValue) {
      this.cy.zoom(this.props.zoomValue);
    }
    if (this.props.zoomMin !== prevProps.zoomMin) {
      this.cy.minZoom(this.props.zoomMin);
    }
    if (this.props.zoomMax !== prevProps.zoomMax) {
      this.cy.maxZoom(this.props.zoomMax);
    }
    if (this.props.redrawGraph !== prevState.redrawGraph) {
      this.cy.center();
    }
    if (this.props.autoUpdate !== prevProps.autoUpdate) {
      this.autoRefresh = this.props.autoUpdate;
      if (this.autoRefresh) {
        this.queryTopology();
      }
    }
  }

  componentWillUnmount() {
    this.autoRefresh = false;
    clearTimeout(this.timeoutId);
    //this.props.clearSelectedElement();
    this.props.setCyElements([]);
  }

  renderTopologyContent() {
    const topologyContent = (
      <Cytoscape
        id="cy"
        cy={(cy) => {
          this.cy = cy;
          this.cy
            .layout({
              name: "circle",
              clockwise: true,
              animate: true,
              animationDuration: 400,
            })
            .run();
          this.cy.on("click", this.handleCytoClick.bind(this));
          this.cy.maxZoom(this.props.zoomMax);
          this.cy.minZoom(this.props.zoomMin);
          this.cy.zoom(this.props.zoomValue); // has to be set after the other operations or it gets reset
          //this.cy.center();
        }}
        wheelSensitivity={0.1}
        elements={JSON.parse(JSON.stringify(this.props.cyElements))} //props.cyElements are frozen
        stylesheet={cytoscapeStyle}
        style={{ width: window.innerWidth, height: window.innerHeight }}
      />
    );

    return topologyContent;
  }

  render() {
    return (
      <>
        <section
          onWheel={this.handleWheel.bind(this)}
          style={{ width: "100vw", height: "100vh" }}
        >
          <div id="cyArea">{this.renderTopologyContent()}</div>
        </section>
        <div id="SidePanel">
          <SideBar typeahead={this.renderTypeahead()} />
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  currentOverlayId: state.evio.selectedOverlayId,
  //selectedElementType: state.evio.selectedElementType,
  //selectedCyElementData: state.evio.selectedCyElementData,
  cyElements: state.evio.cyElements,
  currentView: state.view.current,
  selectedView: state.view.selected,
  zoomValue: state.tools.zoomValue,
  zoomMin: state.tools.zoomMinimum,
  zoomMax: state.tools.zoomMaximum,
  autoUpdate: state.tools.autoUpdate,
  redrawGraph: state.evio.redrawGraph,
});

const mapDispatchToProps = {
  setCurrentView,
  setZoomValue,
  setCyElements,
  //setSelectedElement,
  //clearSelectedElement,
  setRedrawGraph,
};

export default connect(mapStateToProps, mapDispatchToProps)(TopologyView);
