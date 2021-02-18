export default class Topology {

    constructor(nodes, links) {
        var raw_nodes = nodes
        var raw_links = links
        var topology = [];

        this.addNodeElement = (id) => {
            const nodeDetails = this.getNodeDetails(id)
            topology.push(JSON.parse(`{"group":"nodes","data": {"id": "${nodeDetails.id}","label": "${nodeDetails.name}","state":"","type":"","coordinate":"${this.getCoordinate(id)}"}}`));
        }

        this.getCoordinate = (id) => {
            try {
                const lat = raw_nodes[id].geo_coordinate.split(',')[0]
                const lng = raw_nodes[id].geo_coordinate.split(',')[1]
                return [lat, lng]
            } catch (e) {
                return '-'
            }
        }

        this.addLinkElement = (src, id) => {
            const linkDetails = this.getLinkDetails(src, id)

            var linkColor
            switch (linkDetails.type) {
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
            topology.push(JSON.parse(`{"group":"edges","data": { "id":"${linkDetails.id}" ,"label":"${linkDetails.name}","source": "${linkDetails.source}","target": "${linkDetails.target}","state":"","type":"${linkDetails.type}","color":"${linkColor}"}}`));
        }

        this.getAlltopology = () => {
            return topology
        }

        this.getNodeDetails = (id) => {

            var nodeDetails = {
                // "name": raw_nodes[id].NodeName,
                "name": raw_nodes[id].node_name,
                "id": id,
                "state": '-',
                "raw_data": raw_nodes
            }

            return nodeDetails
        }

        this.getLinkDetails = (src, id) => {
            var linkDetails = {
                // "name": raw_links[src][id].InterfaceName,
                "name": raw_links[src][id].tap_name,
                "id": id,
                // "MAC": raw_links[src][id].MAC,
                "MAC": raw_links[src][id].mac,
                // "state": raw_links[src][id].State,
                "state": raw_links[src][id].state,
                // "type": raw_links[src][id].Type,
                "type": raw_links[src][id].edge_type,
                // "ICEConnectionType": '-',
                // "ICERole": '-',
                "role": '-',
                // "remoteAddress": '-',
                // "remoteAddress": raw_links[src][id].ChannelProperties.IceProperties.remote_addr,
                // "localAddress": '-',
                // "localAddress": raw_links[src][id].ChannelProperties.IceProperties.local_addr,
                // "latency": '-',
                // "latency": raw_links[src][id].ChannelProperties.IceProperties.latency,
                // "stats": raw_links[src][id].Stats,
                "stats": raw_links[src][id].ChannelProperties,
                // "source":raw_links[src][id]['SrcNodeId'],
                "source": raw_links[src][id]['SrcNodeID'],
                // "target":raw_links[src][id]['TgtNodeId'],
                "target": raw_links[src][id]['TgtNodeID'],
                "raw_data": raw_links
            }

            return linkDetails
        }

        this.getConnectedNodeDetails = (src, tgt) => {
            var connectedNodeDetails

            Object.keys(raw_links[src]).forEach(link => {
                // if (raw_links[src][link].TgtNodeId === tgt) {
                if (raw_links[src][link].TgtNodeID === tgt) {
                    connectedNodeDetails = this.getLinkDetails(src, link)
                }
            });

            return connectedNodeDetails
        }

    }
}