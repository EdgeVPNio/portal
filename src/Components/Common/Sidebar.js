import React from "react";
import { slide as Menu } from "react-burger-menu";
import evio_logo from '../../Images/Icons/evio.svg'


class Sidebar extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
  return (
    // Pass on our props
    <Menu right isOpen= { true }customBurgerIcon={ <img src={evio_logo} alt=" " /> } width={380}>
     <div id='evioLabel' style={{ textAlign:"center", top: "0px"}}>
	<img src={evio_logo} alt={"Evio Logo"} width={"40px"} height={"25px"}/>
        <label id='evioTitle'>
          EdgeVPN.io Visualizer
      </label>
     </div>
     <div id='searchBar' style={{ padding: "8px", margin: 0 }}>
        {this.props.children}
      </div>
      <div id="sideBarContent" style={{ padding: "8px"}}>
	  {this.props.sideBarContent}
      </div>
    </Menu>
  );
  }
};

export default Sidebar;
