import React from "react";
import { slide as Menu } from "react-burger-menu";
import evio_logo from "../../Images/Icons/evio.svg";
import NavBar from './NavBar'
import { Typeahead } from "react-bootstrap-typeahead";
import { setView } from "../../redux/viewSlice";
import { useDispatch, useSelector, connect } from "react-redux";

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      // Pass on our props
      <Menu
        right
        isOpen={true}
        customBurgerIcon={<img src={evio_logo} alt=" " />}
        width={410}
        disableAutoFocus
      >
        <div id="evioLabel" style={{ textAlign: "center", top: "8px", fontSize: "medium"}}>
          {/* <img
            src={evio_logo}
            alt={"Evio Logo"}
            width={"25px"}
            height={"25px"}
          /> */}
          <label id="evioTitle"> Evio Platform Visualizer </label>
        </div>
        <div id="navBar">
          <NavBar />
        </div>
        <div id="searchBar" style={{ margin: "20px 0" }}>
          <Typeahead placeholder={"Search by identifier"} />
        </div>
        <div id="sideBarContent" style={{ padding: "8px" }}>
          {this.props.sideBarContent}
        </div>
      </Menu>
    );
  }
}

const mapStateToProps = (state) => ({
  selectedView: state.view.current,
});

const mapDispatchToProps = {
  setView,
};

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
