

export default class Topology {

    constructor(response) {
        var topology = [];
        var nodeDetails = {};
        var edgeDetails = {};
        var nodeSet = new Set(); //all nodeIds reported and inferred
        var notReportingNodes = new Set(); //nodeIds of not reporting nodes
        

        if (!response)
            return {
                "graph": topology,
                "nodeDetails": nodeDetails,
                "edgeDetails": edgeDetails,
                "notReportingNodes": notReportingNodes
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
                        color: '#f2be22'
                    }
                }
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
                    color: '#8AA626'
                }
            }
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
                        style: this.getLinkStyle(edge.State)
                    }
                }
                topology.push(edgeData);

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
                        color: "#ADD8E6"
                    }
                }
                nodeDetails[nodeId] = nodeDataNR;
                notReportingNodes.add(nodeId);
            }
        }
        //console.log("topology:", topology);
        //console.log("nodeDetails:", nodeDetails);
        //console.log("edgeDetails: ", edgeDetails);
        //Logic to display in sorted cyclic order on cytoscape ringObject.keys(o).sort()
        var nodes = Object.keys(nodeDetails).sort();
        nodes.forEach(nodeId => topology.push(nodeDetails[nodeId]))

        this.getAlltopology = () => {
            return topology;
        }

        this.getNodeDetails = (id) => {
            return nodeDetails[id].data;
        }

        this.getLinkDetails = (src, id) => {
            return edgeDetails[id][src].data;
        }

        this.getNeighborDetails = (src, tgt) => {
            var srcEdgeData;

            Object.keys(edgeDetails).forEach(edgeId => {
                //check for reporting src connected to tgt node
                if (!notReportingNodes.has(src) && edgeDetails[edgeId][src].target === tgt) {
                    srcEdgeData = edgeDetails[edgeId][src];
                }
            })
            return srcEdgeData;
        }

        this.getState = () => {
            return {
                "graph": topology,
                "nodeDetails": nodeDetails,
                "edgeDetails": edgeDetails,
                "notReportingNodes": notReportingNodes
            };
        }
    
        this.setState = (topoState) => {
            topology = topoState["graph"];
            nodeDetails = topoState["nodeDetails"];
            edgeDetails = topoState["edgeDetails"];
            notReportingNodes = topoState["notReportingNodes"];
        }

    }

}
