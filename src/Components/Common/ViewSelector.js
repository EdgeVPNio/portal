import React from 'react'

class ViewSelector extends React.Component {
  render () {
    return <select>
      <option value="Topology">Topology</option>
      <option value="Subgraph">Subgraph</option>
      <option value="Map">Map</option>
      <option value="Log">Log</option>
      <option value="NetworkFlow">NetworkFlow</option>
      <option value="TunnelUtilization">TunnelUtilization</option>
    </select>
  }
}

export default ViewSelector
