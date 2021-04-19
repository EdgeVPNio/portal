import React from 'react'
import evio_logo from '../../Images/Icons/evio.svg'

class Header extends React.Component {

  constructor(props) {
    super(props);
  }

  // toggle right panel
  handleRightPanelToggle = () => {
    if (document.getElementById('rightPanel').hidden === true) {
      document.getElementById('rightPanel').hidden = false
    } else {
      document.getElementById('rightPanel').hidden = true
    }
  }

  render() {
    return <header id='header' className='row' style={{ padding: '0.2%', margin: '0' }}>
      <div id='ipopTitle' className='col-2' style={{ margin: '0' }}>
        <img id='ipopLogo' src={evio_logo} alt='evio_logo' width="150" height="130" />
        <label id='ipopTitle' style={{ marginTop: '0.5rem', color: 'white' }}>
          EdgeVPN.io Visualizer
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
