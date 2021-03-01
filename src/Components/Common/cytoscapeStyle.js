var cytoscapeStyle = [{
  selector: 'node',
  style: {
    width: '60%',
    height: '60%',
    label: 'data(label)',
    'text-valign': 'center',
    'background-color': '#8AA626',
    'font-weight': 'bold',
    'overlay-opacity': '0'
  }
}, {
  selector: 'node:selected',
  style: {
    'border-width': '30%',
    'border-opacity': '0.3',
    'border-color': '#8AA626'
    // 'background-color': 'data(color)'
  }
}, {
  selector: 'node.transparent',
  style: {
    'background-color': 'grey',
    'z-index': '0',
    'opacity': '0.3'

  }
}, {
  selector: 'node.subgraph',
  style: {
    display: 'none'
  }
}, {
  selector: 'edge',
  style: {
    'line-color': 'data(color)',
    width: '5%',
    'z-index': '3',
    'overlay-opacity': '0',
    'border':'2px solid red'
  }
}, {
  selector: 'edge.transparent',
  style: {
    'line-color': 'grey',
    'z-index': '0',
    opacity: '0.3'
  }
}, {
  selector: 'edge.subgraph',
  style: {
    display: 'none'
  }
}, {
  selector: 'edge:selected',
  style: {
    'z-index': '3'
  }
}, {
  selector: 'node.notReporting',
  style: {
    'background-color': '#A0C3D9'
  }
}, {
  selector: 'node.noTunnel',
  style: {
    'background-color': '#F2BE22'
  }
}, {
  selector: 'node.noTunnel:selected',
  style: {
    'border-width': '30%',
    'border-opacity': '0.3',
    'border-color': '#F2BE22'
  }
}, {
  selector: 'edge.static',
  style: {
    'line-color': '#F27405'
  }
}, {
  selector: 'edge.onDemand',
  style: {
    'line-color': '#F2D680'
  }
}]

export default cytoscapeStyle
