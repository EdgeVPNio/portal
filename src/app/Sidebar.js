import React from "react";
import { slide as Slidebar } from "react-burger-menu";
import evio_logo from "../images/icons/evio.svg";
import Navbar from "./Navbar";
import { Typeahead } from "react-bootstrap-typeahead";

class Sidebar extends React.Component {
  renderTypeahead() {
    if (this.props.typeahead !== null) {
      return this.props.typeahead;
    }
    return <Typeahead placeholder={"..."} />;
    //return <null />;
  }

  renderDetails() {
    if(this.props.sidebarDetails !== null) {
      return this.props.sidebarDetails;
    }
    return <null/>
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
      <Slidebar
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
          <Navbar />
        </div>
        <div id="searchBar" style={{ margin: "20px 0" }}>
          {this.renderTypeahead()}
        </div>
        <div id="sidebarDetails" style={{ padding: "8px" }}>
          {this.renderDetails()}
        </div>
      </Slidebar>
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
