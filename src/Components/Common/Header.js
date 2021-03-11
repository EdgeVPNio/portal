import React from 'react'
import ipop_ic from '../../Images/Icons/ipop_ic.svg'
import evio_logo from '../../Images/Icons/evio-logo-g1.png'

class Header extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isToggle: true
    }
  }

  // toggle right panel
  handleRightPanelToggle = () => {
    var rightPanelEvent = new Promise((resolve, reject) => {
      try {
        this.setState(prevState => {
          return { isToggle: !prevState.isToggle }
        })
        resolve()
      } catch (e) {
        console.log(e)
      }
    })

    rightPanelEvent.then(() => {
      if (this.state.isToggle) {
        document.getElementById('rightPanel').hidden = false
      } else {
        document.getElementById('rightPanel').hidden = true
      }
    })
  }

  render() {
    return <header id='header' className='row' style={{ padding: '0.2%', margin: '0' }}>
      <div id='ipopTitle' className='col-2' style={{ margin: '0' }}>
        <img id='ipopLogo' src={evio_logo} alt='evio_logo' width="40" height="32" />
        <label id='ipopTitle' style={{ marginTop: '0.5rem', color: 'white' }}>
          EVIO NETWORK VISUALIZER
      </label>
      </div>

      <div id='viewBar' className='col-5'>

      </div>

      <div id='searchBar' className='col-2' style={{ padding: 0, margin: 0 }}>
        {this.props.children}
      </div>

      <button onClick={this.handleRightPanelToggle} id="rightPanelBtn" />

    </header>
  }
}

export default Header