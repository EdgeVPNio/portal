import React from "react";
import ReactDOM from "react-dom";
import CollapseButton from "./CustomCollapsibleButton";
import cytoscapeStyle from "./cytoscapeStyle.js";
import { Typeahead } from "react-bootstrap-typeahead";
import SideBar from "./Sidebar";
import { connect } from "react-redux";
import { setCyElements } from "../features/evio/evioSlice";
import { setRedrawGraph } from "../features/evio/evioSlice";
import { setCurrentView } from "../features/view/viewSlice";
import { setZoomValue } from "../features/tools/toolsSlice";
import CytoscapeComponent from "react-cytoscapejs";

const nodeStates = {
  connected: "Connected",
  noTunnels: "No Tunnels",
  notReporting: "Not Reporting",
};

class TopologyView extends React.Component {
  constructor(props) {
    super(props);
    this.isSwapToggle = false;
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

  getNotReportingNodeDetails(cyNode) {
    var nodeContent = (
      <CollapseButton title={cyNode.data().label}>
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
      </CollapseButton>
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
      <CollapseButton
        title={cyNode.data().label}
        expanded={true}
        description={
          <div>
            <div id="DetailsLabel">Node ID</div>
            <label id="valueLabel">{cyNode.data().id}</label>
            <div className="DetailsLabel">State</div>
            <label id="valueLabel">{cyNode.data().state}</label>
            <div className="DetailsLabel">Location</div>
            <label id="valueLabel">{cyNode.data().location}</label>
            <hr style={{ backgroundColor: "#486186" }} />
            <div id="connectedNode" style={{ overflow: "auto" }}></div>
          </div>
        }
      >
        {sidebarNodeslist.map((connectedNode) => {
          try {
            var [connectedlinkDetail, tunnelId] = this.getConnectedLinkDetails(
              cyNode,
              connectedNode,
              connectedEdges
            );
            var connectedNodeBtn = (
              <CollapseButton title={connectedNode.label}>
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
              </CollapseButton>
            );
            return connectedNodeBtn;
          } catch (e) {
            console.log(e);
            return false;
          }
        })}
        <br />
      </CollapseButton>
    );
    return nodeContent;
  }

  getNotConnectedNodeDetails(cyNode) {
    var nodeContent = (
      //No tunnels node
      <CollapseButton title={cyNode.data().label} expanded={true}>
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
      </CollapseButton>
    );
    return nodeContent;
  }

  renderNodeDetails = (cyNode, adj) => {
    var connectedNodes = adj.nodes();
    var connectedEdges = adj.edges();
    var nodeDetails = null;
    if (cyNode.data().hasOwnProperty("location")) {
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
    } else {
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
    }
  };

  getConnectedLinkDetails(source, tgt, connectedEdges) {
    for (var edge of connectedEdges) {
      if (
        (source.data().id === edge._private.data.source &&
          tgt.id === edge._private.data.target) ||
        (source.data().id === edge._private.data.target &&
          tgt.id === edge._private.data.source)
      ) {
        for (var descriptorItem of edge._private.data.descriptor) {
          if (
            source.data().id === descriptorItem.Source &&
            tgt.id === descriptorItem.Target
          ) {
            return [descriptorItem, edge._private.data.id];
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
    if (this.isSwapToggle === false) {
      return [sourceNodeLinkDetails, srcNode, tgtNode];
    } else {
      //if swapbutton toggled then swap source and node details
      if (selectedTunnel.descriptor.length === 1)
        return [sourceNodeLinkDetails, tgtNode, srcNode];
      return [targetNodeLinkDetails, tgtNode, srcNode];
    }
  }

  getTunnelWithBothReportingNodes(selectedTunnel, adj) {
    var LocalEndpointInternal;
    var [sourceNodeLinkDetails, srcNode, tgtNode] =
      this.getSourceAndTargetDetails(selectedTunnel);
    if (sourceNodeLinkDetails.LocalEndpoint.Internal === ":0") {
      LocalEndpointInternal = "NA";
    } else {
      LocalEndpointInternal = sourceNodeLinkDetails.LocalEndpoint.Internal;
    }

    var linkContent = (
      <CollapseButton title={sourceNodeLinkDetails.TapName} expanded={true}>
        <div>
          <div className="row">
            <div className="col-10" style={{ paddingRight: "0" }}>
              <CollapseButton title={srcNode.label}>
                <div className="DetailsLabel">Node ID</div>
                <label id="valueLabel">{srcNode.id.slice(0, 7)}</label>
                <div className="DetailsLabel">State</div>
                <label id="valueLabel">{srcNode.state}</label>
                <div className="DetailsLabel">Location</div>
                <label id="valueLabel">{srcNode.location}</label>
              </CollapseButton>

              <CollapseButton title={tgtNode.label}>
                <div className="DetailsLabel">Node ID</div>
                <label id="valueLabel">{tgtNode.id.slice(0, 7)}</label>
                <div className="DetailsLabel">State</div>
                <label id="valueLabel">{tgtNode.state}</label>
                <div className="DetailsLabel">Location</div>
                <label id="valueLabel">{tgtNode.location}</label>
              </CollapseButton>
            </div>
            <div
              className="col"
              style={{ margin: "auto", padding: "0", textAlign: "center" }}
            >
              <button
                onClick={this.handleSwitch.bind(this, selectedTunnel, adj)}
                id="switchBtn"
              />
            </div>
          </div>
          <hr style={{ backgroundColor: "#486186" }} />
          <div className="DetailsLabel">Tunnel ID</div>
          <label id="valueLabel">{selectedTunnel.data().id}</label>
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
      </CollapseButton>
    );
    return linkContent;
  }

  getTunnelWithEitherOneReportingNodes(selectedTunnel, adj) {
    var LocalEndpointInternal;
    var [sourceNodeLinkDetails, srcNode, tgtNode] =
      this.getSourceAndTargetDetails(selectedTunnel);
    if (sourceNodeLinkDetails.LocalEndpoint.Internal === ":0") {
      LocalEndpointInternal = "NA";
    } else {
      LocalEndpointInternal = sourceNodeLinkDetails.LocalEndpoint.Internal;
    }
    var linkContent = (
      <CollapseButton title={sourceNodeLinkDetails.TapName} expanded={true}>
        <div>
          <div className="row">
            <div className="col-10" style={{ paddingRight: "0" }}>
              <CollapseButton title={srcNode.label}>
                <div className="DetailsLabel">Node ID</div>
                <label id="valueLabel">{srcNode.id.slice(0, 7)}</label>
                <div className="DetailsLabel">State</div>
                <label id="valueLabel">{srcNode.state}</label>
                <div className="DetailsLabel">Location</div>
                <label id="valueLabel">{srcNode.location}</label>
              </CollapseButton>

              <CollapseButton title={tgtNode.label}>
                <div className="DetailsLabel">Node ID</div>
                <label id="valueLabel">{tgtNode.id.slice(0, 7)}</label>
                <div className="DetailsLabel">State</div>
                <label id="valueLabel">{tgtNode.state}</label>
                <div className="DetailsLabel">Location</div>
                <label id="valueLabel">{tgtNode.location}</label>
              </CollapseButton>
            </div>
            <div
              className="col"
              style={{ margin: "auto", padding: "0", textAlign: "center" }}
            >
              <button
                onClick={this.handleSwitch.bind(this, selectedTunnel, adj)}
                id="switchBtn"
              />
            </div>
          </div>
          <hr style={{ backgroundColor: "#486186" }} />
          <div className="DetailsLabel">Tunnel ID</div>
          <label id="valueLabel">{selectedTunnel.data().id}</label>
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
      </CollapseButton>
    );
    return linkContent;
  }

  getTunnelWithNoReportingNodes() {
    var linkContentNR = (
      <CollapseButton title={"Details"} expanded={true}>
        <div>
          <label id="valueLabel">{"Data not available"}</label>
        </div>
      </CollapseButton>
    );
    return linkContentNR;
  }

  renderTunnelDetails = (cyEdge, adj) => {
    var tunnelDetails;
    var selectedTunnelNodesDetails = [];
    try {
      for (var node of adj) {
        if (node._private.group === "nodes") {
          selectedTunnelNodesDetails.push(node.data());
        }
      }
      if (
        selectedTunnelNodesDetails[0].state === nodeStates.connected &&
        selectedTunnelNodesDetails[1].state === nodeStates.connected
      ) {
        tunnelDetails = this.getTunnelWithBothReportingNodes(cyEdge, adj);
      } else if (
        (selectedTunnelNodesDetails[0].state === nodeStates.connected &&
          selectedTunnelNodesDetails[1].state === nodeStates.notReporting) ||
        (selectedTunnelNodesDetails[0].state === nodeStates.notReporting &&
          selectedTunnelNodesDetails[1].state === nodeStates.connected)
      ) {
        tunnelDetails = this.getTunnelWithEitherOneReportingNodes(cyEdge, adj);
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

  handleSwitch = (selectedTunnel, adj) => {
    this.isSwapToggle = !this.isSwapToggle;
    this.renderTunnelDetails(selectedTunnel, adj);
  };

  handleWheel(e) {
    this.props.setZoomValue(this.cy.zoom());
  }

  handleCytoClick(event) {
    var cyEle = event.target[0];
    try {
      if (event.target === this.cy) {
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
      this.cy.zoom({ level: this.props.zoomValue });
    }
    if (this.props.zoomMin !== prevProps.zoomMin) {
      this.cy.minZoom(this.props.zoomMin);
    }
    if (this.props.zoomMax !== prevProps.zoomMax) {
      this.cy.maxZoom(this.props.zoomMax);
    }
    if (this.props.redrawGraph !== prevProps.redrawGraph) {
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
    this.props.setCyElements([]);
  }

  renderTopologyContent() {
    const topologyContent = (
      <CytoscapeComponent
        id="cy"
        cy={(cy) => {
          this.cy = cy;
          this.cy
            .layout({
              name: "circle",
              clockwise: true,
            })
            .run();
          this.cy.on("click", this.handleCytoClick.bind(this));
          this.cy.maxZoom(this.props.zoomMax);
          this.cy.minZoom(this.props.zoomMin);
          this.cy.zoom({ level: this.props.zoomValue }); // has to be set after the other operations or it gets reset
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
  setRedrawGraph,
};

export default connect(mapStateToProps, mapDispatchToProps)(TopologyView);
