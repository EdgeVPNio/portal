export default class Topology {

    constructor(response) {
        var res = response;
        console.log("response:" + response);
        var topology = [];
        var nodes = [];
        var nodeDetails = {};
        var edgeDetails = {};
        var nodeSet = new Set();
        var notConnectedSet = new Set();

        var nodesData = response[0].Topology[0].Nodes;
        console.log("Nodes Data is:" + nodesData);
        for (var idx in nodesData) {
            var node = nodesData[idx];
            var nodeData = {
                group: "nodes",
                data: {
                    id: node.NodeId,
                    label: node.NodeName,
                    state: "",
                    type: "",
                    coordinate: node.GeoCoordinates
                }
            }
            console.log("Node data is:" + nodeData);
            nodes.push(nodeData);
            var nodeDetail = {
                "name": node.NodeName,
                "id": node.NodeId,
                "state": '-',
                "raw_data": node
            }
            nodeDetails[node.NodeId] = nodeDetail;
            console.log("Node raw data is :" + node);
            var edgesData = node.Edges;
            console.log("Edges data is:" + edgesData);
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
                
                console.log("Edgedetail done:", edgeDetail);
                if (!edgeDetails[edge.EdgeId]) {
                    edgeDetails[edge.EdgeId] = {};
                }
                edgeDetails[edge.EdgeId][node.NodeId] = edgeDetail;
            }
        }
	console.log("Node set", nodeSet);
        for (var nodeId of nodeSet) {
	    console.log("NodeId in set is ", nodeId);
            if (!nodeDetails[nodeId]) {
                //not reported nodes
                var nodeDetail = {
                    "name": ' ',
                    "id": nodeId,
                    "state": '-',
                    "raw_data": ' '
                }
                nodeDetails[nodeId] = nodeDetail;
                var nodeData = {
                    group: "nodes",
                    data: {
                        id: nodeId,
                        label: nodeId.slice(nodeId.length - 6),
                        state: "",
                        type: "",
                        coordinate: ""
                    }
                }
                nodes.push(nodeData);
                notConnectedSet.add(nodeId);
            }
        }
        console.log("topology:", topology);
        console.log("nodeDetails:", nodeDetails);
        console.log("edgeDetails: ", edgeDetails);
        nodes.sort(function(a, b) {
            return a.data['id'].localeCompare(b.data['id']);
        })
        nodes.forEach(node => topology.push(node))

        // this.addNodeElement = (id) => {
        //     const nodeDetails = this.getNodeDetails(id)
        //     topology.push(JSON.parse(`{"group":"nodes","data": {"id": "${nodeDetails.id}","label": "${nodeDetails.name}","state":"","type":"","coordinate":"${this.getCoordinate(id)}"}}`));
        // }

        // this.getCoordinate = (id) => {
        //     try {
        //         const lat = raw_nodes[id].geo_coordinate.split(',')[0]
        //         const lng = raw_nodes[id].geo_coordinate.split(',')[1]
        //         return [lat, lng]
        //     } catch (e) {
        //         return '-'
        //     }
        // }

        // this.addLinkElement = (src, id) => {
        //     const linkDetails = this.getLinkDetails(src, id)

        //     var linkColor
        //     switch (linkDetails.type) {
        //         case 'CETypeILongDistance':
        //             linkColor = '#5E4FA2'
        //             break
        //         case 'CETypeLongDistance':
        //             linkColor = '#5E4FA2'
        //             break
        //         case 'CETypePredecessor':
        //             linkColor = '#01665E'
        //             break
        //         case 'CETypeSuccessor':
        //             linkColor = '#01665E'
        //             break
        //         default: break
        //     }
        //     topology.push(JSON.parse(`{"group":"edges","data": { "id":"${linkDetails.id}" ,"label":"${linkDetails.name}","source": "${linkDetails.source}","target": "${linkDetails.target}","state":"","type":"${linkDetails.type}","color":"${linkColor}"}}`));
        // }

        this.getAlltopology = () => {
            return topology
        }

        this.getNodeDetails = (id) => {

            //     var nodeDetails = {
            //         // "name": raw_nodes[id].NodeName,
            //         "name": raw_nodes[id].node_name,
            //         "id": id,
            //         "state": '-',
            //         "raw_data": raw_nodes
            //     }

            return nodeDetails[id];
        }

        this.getLinkDetails = (src, id) => {
            //     var linkDetails = {
            //         // "name": raw_links[src][id].InterfaceName,
            //         "name": res['Topology']['Nodes'][src][id].tap_name,
            //         "id": id,
            //         // "MAC": raw_links[src][id].MAC,
            //         "MAC": raw_links[src][id].mac,
            //         // "state": raw_links[src][id].State,
            //         "state": raw_links[src][id].state,
            //         // "type": raw_links[src][id].Type,
            //         "type": raw_links[src][id].edge_type,
            //         // "ICEConnectionType": '-',
            //         // "ICERole": '-',
            //         "role": '-',
            //         // "remoteAddress": '-',
            //         // "remoteAddress": raw_links[src][id].ChannelProperties.IceProperties.remote_addr,
            //         // "localAddress": '-',
            //         // "localAddress": raw_links[src][id].ChannelProperties.IceProperties.local_addr,
            //         // "latency": '-',
            //         // "latency": raw_links[src][id].ChannelProperties.IceProperties.latency,
            //         // "stats": raw_links[src][id].Stats,
            //         "stats": raw_links[src][id].ChannelProperties,
            //         // "source":raw_links[src][id]['SrcNodeId'],
            //         "source": raw_links[src][id]['SrcNodeID'],
            //         // "target":raw_links[src][id]['TgtNodeId'],
            //         "target": raw_links[src][id]['TgtNodeID'],
            //         "raw_data": raw_links
            //     }

            return edgeDetails[id][src];
        }

        this.getConnectedNodeDetails = (src, tgt) => {
            var connectedNodeDetails

            //     Object.keys(raw_links[src]).forEach(link => {
            //         // if (raw_links[src][link].TgtNodeId === tgt) {
            //         if (raw_links[src][link].TgtNodeID === tgt) {
            //             connectedNodeDetails = this.getLinkDetails(src, link)
            //         }
            //     });
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
