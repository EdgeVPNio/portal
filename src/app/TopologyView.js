import React from "react";
import ReactDOM from "react-dom";
//import cytoscape from "cytoscape";
import CytoscapeComponent from "react-cytoscapejs";
import CollapsibleButton from "./CollapsibleButton";
import cytoscapeStyle from "./cytoscapeStyle.js";
import { Typeahead } from "react-bootstrap-typeahead";
import { Spinner } from "react-bootstrap";
import SideBar from "./Sidebar";
import Tools from "./Toolbar";
import { connect } from "react-redux";
import { setCy } from "../features/evio/evioSlice";
import { setCurrentView } from "../features/view/viewSlice";

const nodeStates = {
  connected: "Connected",
  noTunnels: "No Tunnels",
  notReporting: "Not Reporting",
};

class TopologyView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      switchToggle: false,
      nodeDetails: null,
      linkDetails: null,
      currentSelectedElement: null,
    };
    this.intervalId = null;
    this.timeoutId = null;
    this.autoRefresh = this.props.autoUpdate;
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
            this.props.setCy(this.buildTopoRep(res));
            this.intervalId = res[0]._id;
            this.queryTopology();
          }
        })
        .catch((err) => {
          console.log("query topology failed ", err);
          if (this.autoRefresh) {
            this.timeoutId = setTimeout(this.queryTopology.bind(this), 30000);
          }
        });
  }

  renderTypeahead() {
    var perpareSearchElement = new Promise((resolve, reject) => {
      try {
        var searchElement = this.props.currentTopology.graph.map((element) => {
          return JSON.stringify(element);
        });
        resolve(searchElement);
      } catch (e) {
        reject(e);
      }
    });

    perpareSearchElement.then((searchElement) => {
      return (
        <Typeahead
          clearButton
          id="searchTopology"
          onChange={(selected) => {
            try {
              this.cy
                .elements()
                .getElementById(JSON.parse(selected).data.id)
                .trigger("click");
              this.cy
                .elements()
                .getElementById(JSON.parse(selected).data.id)
                .select();
            } catch (e) {
              //console.log(e)
              this.cy.elements().removeClass("transparent");
              ReactDOM.render(<></>, document.getElementById("sideBarContent"));
            }
          }}
          labelKey={(option) => {
            return `${JSON.parse(option).data.label}`;
          }}
          options={searchElement}
          selected={this.state.selected}
          selectHintOnEnter
          placeholder={"select a node or tunnel"}
          renderMenuItemChildren={(option) => {
            return (
              <div className="searchResult">
                <div className="resultLabel">
                  <b>{JSON.parse(option).data.label}</b>
                </div>
                <small className="resultLabel">{`ID : ${
                  JSON.parse(option).data.id
                }`}</small>
                <br />
              </div>
            );
          }}
        ></Typeahead>
      );
    });
  }

  renderSidebarDetails() {
    return <null />;
    var sourceNode = this.state.nodeDetails.sourceNode;
    var connectedNodes = this.state.nodeDetails.connectedNodes;
    if (sourceNode.state === nodeStates.notReporting) {
      //Not reporting nodes
      var nodeContent = (
        <CollapsibleButton
          id={sourceNode.id + "Btn"}
          className="detailsNodeBtn"
          key={sourceNode.id + "Btn"}
          name={"Details"}
          isOpen
        >
          <div>
            <h5>{sourceNode.label}</h5>

            <div className="DetailsLabel">Node ID</div>
            <label id="valueLabel">{sourceNode.id}</label>

            <div className="DetailsLabel">State</div>
            <label id="valueLabel">{sourceNode.state}</label>

            <div className="DetailsLabel">Location</div>
            <label id="valueLabel">{"Unknown"}</label>
            <hr style={{ backgroundColor: "#486186" }} />
            <br />
            <br />
          </div>
        </CollapsibleButton>
      );

      //ReactDOM.render(nodeContent, document.getElementById("sideBarContent"));
      return nodeContent;
    }

    var coordinate = sourceNode.coordinate.split(",");
    //GET location from coordinates passed from evio nodes through google API
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate[0]},${coordinate[1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`
    )
      .then((res) => res.json())
      .then((data) => {
        // //console.log(data)
        try {
          return data.results[data.results.length - 1].formatted_address;
        } catch {
          return "-";
        }
      })
      .then((location) => {
        var nodeContent = (
          <CollapsibleButton
            id={sourceNode.id + "Btn"}
            className="detailsNodeBtn"
            key={sourceNode.id + "Btn"}
            name={"Details"}
            isOpen
          >
            <div>
              <h5>{sourceNode.label}</h5>

              <div id="DetailsLabel">Node ID</div>
              <label id="valueLabel">{sourceNode.id}</label>

              <div className="DetailsLabel">State</div>
              <label id="valueLabel">{sourceNode.state}</label>

              <div className="DetailsLabel">Location</div>
              <label id="valueLabel">
                {location.slice(7, location.length)}
              </label>
              <hr style={{ backgroundColor: "#486186" }} />
              <br />
              <br />

              <div id="connectedNode" style={{ overflow: "auto" }}>
                {connectedNodes.map((connectedNode) => {
                  try {
                    var connectedNodeDetail =
                      this.props.currentTopology.getNeighborDetails(
                        this.props.currentTopology,
                        sourceNode.id,
                        connectedNode.data().id
                      );
                    var connectedNodeBtn = (
                      <CollapsibleButton
                        id={connectedNode.data().id + "Btn"}
                        className="connectedNodeBtn"
                        key={connectedNode.data().id + "Btn"}
                        eventKey={connectedNode.data().label}
                        name={connectedNode.data().label}
                      >
                        <div className="DetailsLabel">Node ID</div>
                        <label id="valueLabel">{connectedNode.data().id}</label>
                        <div className="DetailsLabel">Tunnel ID</div>
                        <label id="valueLabel">{connectedNodeDetail.id}</label>
                        <div className="DetailsLabel">Interface Name</div>
                        <label id="valueLabel">
                          {connectedNodeDetail.tapName}
                        </label>
                        <div className="DetailsLabel">MAC</div>
                        <label id="valueLabel">{connectedNodeDetail.mac}</label>
                        <div className="DetailsLabel">State</div>
                        <label id="valueLabel">
                          {connectedNodeDetail.state.slice(
                            7,
                            connectedNodeDetail.state.length
                          )}
                        </label>
                        <div className="DetailsLabel">Tunnel Type</div>
                        <label id="valueLabel">
                          {connectedNodeDetail.type.slice(
                            6,
                            connectedNodeDetail.type.length
                          )}
                        </label>
                      </CollapsibleButton>
                    );

                    return connectedNodeBtn;
                  } catch (e) {
                    //console.log(e)
                    return false;
                  }
                })}
              </div>
            </div>
          </CollapsibleButton>
        );
        ReactDOM.render(nodeContent, document.getElementById("sideBarContent"));
      });
  }

  renderLinkDetails = () => {
    var linkDetails = this.state.linkDetails.linkDetails;
    var sourceNodeDetails = this.state.linkDetails.sourceNodeDetails;
    var targetNodeDetails = this.state.linkDetails.targetNodeDetails;

    if (
      sourceNodeDetails.state === nodeStates.notReporting &&
      targetNodeDetails.state === nodeStates.notReporting
    ) {
      //both nodes of the edge are not reporting - NR
      var linkContentNR = (
        <CollapsibleButton
          id={"notReportingBtn"}
          className="detailsLinkBtn"
          key={"notReportingBtn"}
          name={"Details"}
          isOpen
        >
          <div>
            <label id="valueLabel">{"Data not available"}</label>
          </div>
        </CollapsibleButton>
      );
      ReactDOM.render(linkContentNR, document.getElementById("sideBarContent"));
      return;
    }

    if (
      sourceNodeDetails.state === nodeStates.notReporting ||
      targetNodeDetails.state === nodeStates.notReporting
    ) {
      //if either of nodes is not reporting
      var linkContent = (
        <CollapsibleButton
          id={linkDetails.name + "Btn"}
          className="detailsLinkBtn"
          key={linkDetails.name + "Btn"}
          name={"Details"}
        >
          <div>
            <h5>{linkDetails.name}</h5>

            <div className="row">
              <div className="col-10" style={{ paddingRight: "0" }}>
                <CollapsibleButton
                  id={sourceNodeDetails.id + "Btn"}
                  className="sourceNodeBtn"
                  key={sourceNodeDetails.id + "Btn"}
                  eventKey={sourceNodeDetails.id + "Btn"}
                  name={sourceNodeDetails.label}
                  style={{
                    marginBottom: "2.5%",
                    backgroundColor: "#8aa626",
                    border: `solid #8aa626`,
                  }}
                >
                  <div className="DetailsLabel">Node ID</div>
                  <label id="valueLabel">{sourceNodeDetails.id}</label>
                </CollapsibleButton>

                <CollapsibleButton
                  id={targetNodeDetails.id + "Btn"}
                  className="targetNodeBtn"
                  key={targetNodeDetails.id + "Btn"}
                  eventKey={targetNodeDetails.id + "Btn"}
                  name={targetNodeDetails.label}
                  style={{
                    marginBottom: "2.5%",
                    backgroundColor: "#8aa626",
                    border: `solid #8aa626`,
                  }}
                >
                  <div className="DetailsLabel">Node ID</div>
                  <label id="valueLabel">{targetNodeDetails.id}</label>
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
            <label id="valueLabel">{linkDetails.id}</label>
            <div className="DetailsLabel">Interface Name</div>
            <label id="valueLabel">{linkDetails.tapName}</label>
            <div className="DetailsLabel">MAC</div>
            <label id="valueLabel">{linkDetails.mac}</label>
            <div className="DetailsLabel">State</div>
            <label id="valueLabel">
              {linkDetails.state.slice(7, linkDetails.state.length)}
            </label>
            <div className="DetailsLabel">Tunnel Type</div>
            <label id="valueLabel">
              {linkDetails.type.slice(6, linkDetails.type.length)}
            </label>
          </div>
        </CollapsibleButton>
      );
      ReactDOM.render(linkContent, document.getElementById("sideBarContent"));
    }

    const srcCoordinate = sourceNodeDetails.coordinate.split(",");

    const tgtCoordinate = targetNodeDetails.coordinate.split(",");
    //GET location from coordinates passed for source evio node through google API
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${srcCoordinate[0]},${srcCoordinate[1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`
    )
      .then((res) => res.json())
      .then((data) => {
        try {
          return data.results[data.results.length - 1].formatted_address;
        } catch {
          return "-";
        }
      })
      .then((sourceLocation) => {
        //GET location from coordinates passed for target evio node through google API
        fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${tgtCoordinate[0]},${tgtCoordinate[1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`
        )
          .then((res) => res.json())
          .then((data) => {
            try {
              return data.results[data.results.length - 1].formatted_address;
            } catch {
              return "-";
            }
          })
          .then((targetLocation) => {
            var linkContent = (
              <CollapsibleButton
                id={linkDetails.name + "Btn"}
                className="detailsLinkBtn"
                key={linkDetails.name + "Btn"}
                name={"Details"}
                isOpen
              >
                <div>
                  <h5>{linkDetails.name}</h5>

                  <div className="row">
                    <div className="col-10" style={{ paddingRight: "0" }}>
                      <CollapsibleButton
                        id={sourceNodeDetails.id + "Btn"}
                        className="sourceNodeBtn"
                        key={sourceNodeDetails.id + "Btn"}
                        eventKey={sourceNodeDetails.id + "Btn"}
                        name={sourceNodeDetails.label}
                        style={{
                          marginBottom: "2.5%",
                          backgroundColor: "#8aa626",
                          border: `solid #8aa626`,
                        }}
                      >
                        <div className="DetailsLabel">Node ID</div>
                        <label id="valueLabel">{sourceNodeDetails.id}</label>

                        <div className="DetailsLabel">State</div>
                        <label id="valueLabel">{sourceNodeDetails.state}</label>

                        <div className="DetailsLabel">Location</div>
                        <label id="valueLabel">
                          {sourceLocation.slice(7, sourceLocation.length)}
                        </label>
                      </CollapsibleButton>

                      <CollapsibleButton
                        id={targetNodeDetails.id + "Btn"}
                        className="targetNodeBtn"
                        key={targetNodeDetails.id + "Btn"}
                        eventKey={targetNodeDetails.id + "Btn"}
                        name={targetNodeDetails.label}
                        style={{
                          marginBottom: "2.5%",
                          backgroundColor: "#8aa626",
                          border: `solid #8aa626`,
                        }}
                      >
                        <div className="DetailsLabel">Node ID</div>
                        <label id="valueLabel">{targetNodeDetails.id}</label>

                        <div className="DetailsLabel">State</div>
                        <label id="valueLabel">{targetNodeDetails.state}</label>

                        <div className="DetailsLabel">Location</div>
                        <label id="valueLabel">
                          {targetLocation.slice(7, targetLocation.length)}
                        </label>
                      </CollapsibleButton>
                    </div>

                    <div
                      className="col"
                      style={{
                        margin: "auto",
                        padding: "0",
                        textAlign: "center",
                      }}
                    >
                      <button onClick={this.handleSwitch} id="switchBtn" />
                    </div>
                  </div>
                  <hr style={{ backgroundColor: "#486186" }} />
                  <div className="DetailsLabel">Tunnel ID</div>
                  <label id="valueLabel">{linkDetails.id}</label>
                  <div className="DetailsLabel">Interface Name</div>
                  <label id="valueLabel">{linkDetails.tapName}</label>
                  <div className="DetailsLabel">MAC</div>
                  <label id="valueLabel">{linkDetails.mac}</label>
                  <div className="DetailsLabel">State</div>
                  <label id="valueLabel">
                    {linkDetails.state.slice(7, linkDetails.state.length)}
                  </label>
                  <div className="DetailsLabel">Tunnel Type</div>
                  <label id="valueLabel">
                    {linkDetails.type.slice(6, linkDetails.type.length)}
                  </label>
                </div>
              </CollapsibleButton>
            );
            ReactDOM.render(
              linkContent,
              document.getElementById("sideBarContent")
            );
          });
      });
  };

  handleSwitch = () => {
    var that = this;
    var promise = new Promise(function (resolve, reject) {
      try {
        that.setState((prevState) => {
          return { switchToggle: !prevState.switchToggle };
        });

        resolve(true);
      } catch (e) {
        reject(e);
      }
    });

    promise
      .then(function () {
        that.swap();
      })
      .catch(function (e) {});
  };

  swap = () => {
    var that = this;
    var linkDetails;
    var promise = new Promise(function (resolve, reject) {
      try {
        if (that.state.switchToggle) {
          linkDetails =
            that.props.currentTopology.edgeDetails[
              that.state.currentSelectedElement.data().target
            ][that.state.currentSelectedElement.data().id].data;
        } else {
          linkDetails =
            that.props.currentTopology.edgeDetails[
              that.state.currentSelectedElement.data().source
            ][that.state.currentSelectedElement.data().id].data;
        }
        resolve(linkDetails);
      } catch {
        reject(false);
      }
    });

    promise
      .then(function (linkDetails) {
        that.setState((prevState) => {
          return {
            linkDetails: {
              linkDetails: linkDetails,
              sourceNodeDetails: prevState.linkDetails.targetNodeDetails,
              targetNodeDetails: prevState.linkDetails.sourceNodeDetails,
            },
          };
        });
      })
      .then(function () {
        that.renderLinkDetails();
      })
      .catch(function (e) {});
  };

  setNodeDetails = (node) => {
    var that = this;
    var promise = new Promise(function (resolve, reject) {
      try {
        var sourceNode =
          that.props.currentTopology.nodeDetails[node.data().id].data;

        var connectedNodes = that.cy
          .elements(node.incomers().union(node.outgoers()))
          .filter((element) => {
            return element.isNode();
          });

        that.setState({
          nodeDetails: {
            sourceNode: sourceNode,
            connectedNodes: connectedNodes,
          },
        });

        resolve(true);
      } catch {
        reject(false);
      }
    });

    promise
      .then(function () {
        that.renderNodeDetails();
      })
      .catch(function () {});
  };

  setLinkDetails = (link) => {
    var that = this;
    var promise = new Promise(function (resolve, reject) {
      try {
        var linkDetails =
          that.props.currentTopology.edgeDetails[link.data().source][
            link.data().id
          ].data;

        var sourceNode = link.data().source;

        var targetNode = link.data().target;

        var sourceNodeDetails =
          that.props.currentTopology.nodeDetails[link.data().source].data;

        var targetNodeDetails =
          that.props.currentTopology.nodeDetails[link.data().target].data;

        that.setState({
          linkDetails: {
            linkDetails: linkDetails,
            sourceNode: sourceNode,
            targetNode: targetNode,
            sourceNodeDetails: sourceNodeDetails,
            targetNodeDetails: targetNodeDetails,
          },
        });

        resolve(true);
      } catch {
        reject(false);
      }
    });

    promise
      .then(function () {
        that.renderLinkDetails();
      })
      .catch(function () {});
  };

  renderTopologyContent() {
    //this.setState({ currentView: 'Topology' })
    if (Object.keys(this.props.currentTopology).length === 0) {
      return <Spinner id="loading" animation="border" variant="info" />;
    }
    const topologyContent = (
      <CytoscapeComponent
        id="cy"
        cy={(cy) => {
          this.cy = cy;
          this.cy.on("click", this.handleCytoClick.bind(this));
          this.cy.maxZoom(this.props.zoomMax);
          this.cy.minZoom(this.props.ZoomMin);
          this.cy.zoom(this.state.zoomValue);
          this.cy.center();
        }}
        wheelSensitivity={0.1}
        elements={JSON.parse(JSON.stringify(this.props.currentTopology.graph))} //deep clone of global topo graph
        stylesheet={cytoscapeStyle}
        style={{ width: window.innerWidth, height: window.innerHeight }}
        layout={{ name: "circle", clockwise: true }}
      />
    );
    return topologyContent;
  }

  elementFilter = (element, props) => {
    if (element.group === "nodes") {
      return (
        element.data().label.toLowerCase().indexOf(props.text.toLowerCase()) !==
          -1 ||
        element.data().id.toLowerCase().indexOf(props.text.toLowerCase()) !== -1
      );
    } else {
      return (
        element.data().label.toLowerCase().indexOf(props.text.toLowerCase()) !==
          -1 ||
        element.data().id.toLowerCase().indexOf(props.text.toLowerCase()) !== -1
      );
    }
  };

  handleWheel = (e) => {
    this.setState({ zoomValue: this.cy.zoom() });
  };

  renderTopology = () => {
    document.getElementById("elementBreadcrumb").hidden = false;
    document.getElementById("overlayBreadcrumb").hidden = false;
    document.getElementById("homeBtn").hidden = false;
    document.getElementById("refreshBtn").hidden = false;
    document.getElementById("configBtn").hidden = false;
    document.getElementById("infoBtn").hidden = false;
    document.getElementById("plusBtn").hidden = false;
    document.getElementById("minusBtn").hidden = false;
    if (this.state.currentView === "Subgraph") {
      this.cy.elements().removeClass("subgraph");
    } else if (this.state.currentView === "Map") {
      this.setState({ currentView: "Topology" });
      this.renderTopologyContent();
    }
  };

  // midpoint = (lat1, lng1, lat2, lng2) => {
  //   lat1 = this.deg2rad(lat1);
  //   lng1 = this.deg2rad(lng1);
  //   lat2 = this.deg2rad(lat2);
  //   lng2 = this.deg2rad(lng2);

  //   var dlng = lng2 - lng1;
  //   var Bx = Math.cos(lat2) * Math.cos(dlng);
  //   var By = Math.cos(lat2) * Math.sin(dlng);
  //   var lat3 = Math.atan2(
  //     Math.sin(lat1) + Math.sin(lat2),
  //     Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By)
  //   );
  //   var lng3 = lng1 + Math.atan2(By, Math.cos(lat1) + Bx);

  //   return [(lat3 * 180) / Math.PI, (lng3 * 180) / Math.PI];
  // };

  // deg2rad = (degrees) => {
  //   return (degrees * Math.PI) / 180;
  // };

  // hasCoordinate = (node) => {
  //   if (node.data("coordinate").split(",")[1]) {
  //     return true;
  //   }
  //   return false;
  // };

  buildTopoRep = (response) => {
    var graph = [];
    //var nodes = [];
    var nodeDetails = {};
    var edgeDetails = {};
    var nodeSet = new Set(); //all nodeIds reported and inferred
    var notReportingNodes = new Set(); //nodeIds of not reporting nodes

    if (!response)
      return {
        graph: graph,
        nodeDetails: nodeDetails,
        edgeDetails: edgeDetails,
        notReportingNodes: notReportingNodes,
      };

    var nodesData = response[0].Topology[0].Nodes;
    for (var idx in nodesData) {
      var node = nodesData[idx];
      if (node.Edges.length === 0) {
        //No tunnels node - NT
        var nodeDataNT = {
          group: "nodes",
          data: {
            id: node.NodeId,
            label: node.NodeName, //name
            state: nodeStates.noTunnels,
            coordinate: node.GeoCoordinates,
            color: "#f2be22",
          },
        };
        nodeDetails[node.NodeId] = nodeDataNT;
        continue;
      }
      //Connected nodes - CN
      var nodeDataCN = {
        group: "nodes",
        data: {
          id: node.NodeId,
          label: node.NodeName,
          state: nodeStates.connected,
          coordinate: node.GeoCoordinates,
          color: "#8AA626",
        },
      };
      nodeDetails[node.NodeId] = nodeDataCN;

      var edgesData = node.Edges;
      for (var edgeidx in edgesData) {
        //Processing edges for each connected node
        var edge = edgesData[edgeidx];
        nodeSet.add(edge.PeerId);
        var edgeData = {
          group: "edges",
          data: {
            id: edge.EdgeId,
            label: edge.EdgeId.slice(0, 7),
            tapName: edge.TapName,
            mac: edge.MAC,
            source: node.NodeId,
            target: edge.PeerId,
            state: edge.State,
            type: edge.Type,
            color: this.getLinkColor(edge.Type),
            style: this.getLinkStyle(edge.State),
          },
        };
        graph.push(edgeData);

        if (!edgeDetails[edge.EdgeId]) {
          edgeDetails[edge.EdgeId] = {};
        }
        edgeDetails[edge.EdgeId][node.NodeId] = edgeData;
      }
    }

    for (var nodeId of nodeSet) {
      if (!nodeDetails[nodeId]) {
        //not reported nodes -NR
        var nodeDataNR = {
          group: "nodes",
          data: {
            id: nodeId,
            label: nodeId.slice(0, 7),
            state: nodeStates.notReporting,
            coordinate: "",
            color: "#ADD8E6",
          },
        };
        nodeDetails[nodeId] = nodeDataNR;
        notReportingNodes.add(nodeId);
      }
    }
    //console.log("topology:", topology);
    //console.log("nodeDetails:", nodeDetails);
    //console.log("edgeDetails: ", edgeDetails);
    //Logic to display in sorted cyclic order on cytoscape ringObject.keys(o).sort()
    var nodes = Object.keys(nodeDetails).sort();
    nodes.forEach((nodeId) => graph.push(nodeDetails[nodeId]));

    return {
      graph: graph,
      nodeDetails: nodeDetails,
      edgeDetails: edgeDetails,
      notReportingNodes: notReportingNodes,

      // cy: cytoscape({
      //   // very commonly used options
      //   container: document.getElementById("cyArea"),
      //   elements: JSON.parse(JSON.stringify(graph)),
      //   style: { cytoscapeStyle },
      //   layout: { name: "circle", clockwise: true },
      //   data: {
      //     /* ... */
      //   },

      //   // initial viewport state:
      //   zoom: 1,
      //   pan: { x: 0, y: 0 },

      //   // interaction options:
      //   minZoom: 1e-50,
      //   maxZoom: 1e50,
      //   zoomingEnabled: true,
      //   userZoomingEnabled: true,
      //   panningEnabled: true,
      //   userPanningEnabled: true,
      //   boxSelectionEnabled: true,
      //   selectionType: "single",
      //   touchTapThreshold: 8,
      //   desktopTapThreshold: 4,
      //   autolock: false,
      //   autoungrabify: false,
      //   autounselectify: false,

      //   // rendering options:
      //   headless: false,
      //   styleEnabled: true,
      //   hideEdgesOnViewport: false,
      //   textureOnViewport: false,
      //   motionBlur: false,
      //   motionBlurOpacity: 0.2,
      //   wheelSensitivity: 1,
      //   pixelRatio: "auto",
      // }),
    };
  };

  getNeighborDetails = (topoState, src, tgt) => {
    var srcEdgeData;

    Object.keys(topoState.edgeDetails).forEach((edgeId) => {
      if (
        !topoState.notReportingNodes.has(src) &&
        topoState.edgeDetails[edgeId][src].target === tgt
      ) {
        srcEdgeData = topoState.edgeDetails[edgeId][src];
      }
    });
    return srcEdgeData;
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

  handleCytoClick(event) {
    var selectedElement = event.target[0];
    var adjacentElements;
    var nonAdjacentElements;
    if (selectedElement.isNode()) {
      this.setNodeDetails(selectedElement);
      adjacentElements = selectedElement
        .outgoers()
        .union(selectedElement.incomers())
        .union(selectedElement);
      nonAdjacentElements = this.cy
        .elements()
        .difference(
          selectedElement.outgoers().union(selectedElement.incomers())
        )
        .not(selectedElement);
    } else if (selectedElement.isEdge()) {
      this.setLinkDetails(selectedElement);
      adjacentElements = selectedElement
        .connectedNodes()
        .union(selectedElement);
      nonAdjacentElements = this.cy
        .elements()
        .difference(selectedElement.connectedNodes())
        .not(selectedElement);
    } else {
      console.log("the cytoscape background was clicked");
    }

    adjacentElements.removeClass("transparent");
    nonAdjacentElements.addClass("transparent");
  }

  componentDidMount() {
    console.log("componentDidMount: TopologyView");
    this.props.setCurrentView("TopologyView");
    this.queryTopology();
    this.autoRefresh = this.props.autoUpdate;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("componentDidUpdate: TopologyView");
    if (this.props.zoomValue !== prevProps.zoomValue) {
      this.cy.zoom(this.props.zoomValue);
    }
    if (this.props.autoUpdate !== prevProps.autoUpdate) {
      this.autoRefresh = this.props.autoUpdate;
      if (this.props.autoUpdate) {
        this.queryTopology();
      }
    }    
  }

  componentWillUnmount() {
    console.log("componentWillUnMount: TopologyView");
    this.autoRefresh = false;
    clearTimeout(this.timeoutId);
  }

  render() {
    console.log("render: TopologyView");

    return (
      <section
        onWheel={this.handleWheel}
        style={{ width: "100vw", height: "100vh" }}
      >
        <>
          <div id="cyArea">{this.renderTopologyContent()}</div>
          <div id="SidePanel">
            <SideBar
              typeahead={this.renderTypeahead()}
              sideBarDetails={this.renderSidebarDetails()}
            />
            <div id="bottomTools">
              <Tools />
            </div>
          </div>
        </>
      </section>
    );
  }
}

const mapStateToProps = (state) => ({
  currentOverlayId: state.evio.overlayId,
  currentTopology: state.evio.cy,
  currentView: state.view.current,
  zoomValue: state.tools.zoomValue,
  autoUpdate: state.tools.autoUpdate,
});

const mapDispatchToProps = {
  setCurrentView,
  setCy,
};

export default connect(mapStateToProps, mapDispatchToProps)(TopologyView);
