import React from "react";
//import { connect } from "react-redux";
import { slide as Menu } from "react-burger-menu";
import evio_logo from "../../Images/Icons/evio.svg";
import NavBar from "./NavBar";
// import { Typeahead } from "react-bootstrap-typeahead";
// import { setView } from "../../redux/viewSlice";
// import { setOverlayId } from "../../redux/overlaySlice";

class Sidebar extends React.Component {
  renderTypeahead() {
    if (this.props.typeahead !== null) {
      return this.props.typeahead;
    }
    //return <Typeahead placeholder={"Search by identifier"} />;
    return <null />;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("componentDidUpdate: SideBar");
  }

  componentDidMount() {
    console.log("componentDidMount: SideBar");
  }

  componentWillUnmount() {
    console.log("componentWillUnmount: SideBar");
  }

  render() {
    console.log("render: SideBar");
    return (
      // Pass on our props
      <Menu
        right
        isOpen={true}
        customBurgerIcon={<img src={evio_logo} alt=" " />}
        width={410}
        disableAutoFocus
      >
        <div
          id="evioLabel"
          style={{ textAlign: "center", top: "8px", fontSize: "medium" }}
        >
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
          {this.renderTypeahead()}
        </div>
        <div id="sideBarDetails" style={{ padding: "8px" }}>
          {this.props.sideBarDetails}
        </div>
      </Menu>
    );
  }
}

// const mapStateToProps = (state) => ({
//   currentView: state.view.current,
//   selectedView: state.view.selected,
//   currentOverlayId: state.overlayId.current,
// });

// const mapDispatchToProps = {
//   setView,
//   setOverlayId,
// };

//export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
export default Sidebar;
