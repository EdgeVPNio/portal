export default class Topology {

    constructor(response) {
        var res = response;
        var topology = [];
        var nodes = [];
        var nodeDetails = {};
        var edgeDetails = {};
        var nodeSet = new Set();
        var notConnectedSet = new Set();

        var nodesData = response[0].Topology[0].Nodes;
        for (var idx in nodesData) {
            var node = nodesData[idx];
            if(node.Edges.length == 0) {
                //No tunnels node
                var nodeData = {
                    group: "nodes",
                    data: {
                        id: node.NodeId,
                        label: node.NodeName,
                        state: "Connected",
                        type: "",
                        coordinate: node.GeoCoordinates,
                        color: '#f2be22'
                    }
                }
                nodes.push(nodeData);
                var nodeDetail = {
                    "name": node.NodeName,
                    "id": node.NodeId,
                    "state": "Connected",
                    "raw_data": node
                }
                nodeDetails[node.NodeId] = nodeDetail;
                continue;
            }
            var nodeData = {
                group: "nodes",
                data: {
                    id: node.NodeId,
                    label: node.NodeName,
                    state: "Connected",
                    type: "",
                    coordinate: node.GeoCoordinates,
		    color: '#8AA626'
                }
            }
            nodes.push(nodeData);
            var nodeDetail = {
                "name": node.NodeName,
                "id": node.NodeId,
                "state": "Connected",
                "raw_data": node
            }
            nodeDetails[node.NodeId] = nodeDetail;
            var edgesData = node.Edges;
            for (var edgeidx in edgesData) {
                var edge = edgesData[edgeidx];
                nodeSet.add(edge.PeerId);
                var edgeData = {
                    group: "edges",
                    data: {
                        id: edge.EdgeId,
                        label: edge.TapName,
                        source: node.NodeId,
                        target: edge.PeerId,
                        state: edge.State,
                        type: edge.Type,
                        color: this.getLinkColor(edge.Type)
                    }
                }
                topology.push(edgeData);
                var edgeDetail = {
                    name: edge.TapName,
                    id: edge.EdgeId,
                    MAC: edge.MAC,
                    state: edge.State,
                    type: edge.Type,
                    stats: "",
                    source: node.NodeId,
                    target: edge.PeerId,
                    raw_data: edge
                }
                
                if (!edgeDetails[edge.EdgeId]) {
                    edgeDetails[edge.EdgeId] = {};
                }
                edgeDetails[edge.EdgeId][node.NodeId] = edgeDetail;
            }
        }

        for (var nodeId of nodeSet) {
            if (!nodeDetails[nodeId]) {
                //not reported nodes
                var nodeDetail = {
                    "name": ' ',
                    "id": nodeId,
                    "state": "Not Reporting",
                    "raw_data": ' '
                }
                nodeDetails[nodeId] = nodeDetail;
                var nodeData = {
                    group: "nodes",
                    data: {
                        id: nodeId,
                        label: nodeId.slice(nodeId.length - 6),
                        state: "Not Reporting",
                        type: "",
                        coordinate: "",
			color: "#ADD8E6"
                    }
                }
                nodes.push(nodeData);
                notConnectedSet.add(nodeId);
            }
        }
        //console.log("topology:", topology);
        //console.log("nodeDetails:", nodeDetails);
        //console.log("edgeDetails: ", edgeDetails);
        nodes.sort(function(a, b) {
            return a.data['id'].localeCompare(b.data['id']);
        })
        nodes.forEach(node => topology.push(node))

        this.getAlltopology = () => {
            return topology
        }

        this.getNodeDetails = (id) => {

            return nodeDetails[id];
        }

        this.getLinkDetails = (src, id) => {
            return edgeDetails[id][src];
        }

        this.getConnectedNodeDetails = (src, tgt) => {
            var connectedNodeDetails

            Object.keys(edgeDetails).forEach(edgeId => {
                Object.keys(edgeDetails[edgeId]).forEach(nodeId => {
                    if (!notConnectedSet.has(nodeId) && nodeId == src && edgeDetails[edgeId][nodeId].target == tgt) {
                        connectedNodeDetails = edgeDetails[edgeId][nodeId];
                    }
                })
            })

            return connectedNodeDetails
        }

    }

    getLinkColor(type) {
        var linkColor;
        switch (type) {
            case 'CETypeILongDistance':
                linkColor = '#5E4FA2'
                break
            case 'CETypeLongDistance':
                linkColor = '#5E4FA2'
                break
            case 'CETypePredecessor':
                linkColor = '#01665E'
                break
            case 'CETypeSuccessor':
                linkColor = '#01665E'
                break
            default: break
        }
        return linkColor;
    }

}
