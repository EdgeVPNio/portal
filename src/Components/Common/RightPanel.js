import React from 'react'

class RightPanel extends React.Component {
  render () {
    return <section id="rightPanel">
      <h6>{this.props.rightPanelTopic}</h6>
      <div id="rightPanelContent">{this.props.children}</div>
    </section>
  }
}

export default RightPanel
