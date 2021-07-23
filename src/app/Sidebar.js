import React from "react";
import { connect } from "react-redux";
import { slide as Slidebar } from "react-burger-menu";
import evio_logo from "../images/icons/evio.svg";
import Navbar from "./Navbar";
import { Typeahead } from "react-bootstrap-typeahead";
import { appViews } from "../features/evio/evioSlice";
import ReactDOM from "react-dom";

class Sidebar extends React.Component {
  renderTypeahead() {
    if (this.props.typeahead !== null) {
      return this.props.typeahead;
    }
    return <Typeahead placeholder={"..."} />;
    //return <null />;
  }

  renderDetails() {
    if (
      (this.props.currentView === appViews.TopologyView ||
        this.props.currentView === appViews.SubgraphView) &&
      this.props.selectedElementType === "ElementTypeNone"
    ) {
      ReactDOM.render(
        <div>
          <div title="Select Node or Tunnel to see details"> Details: </div>
        </div>,
        document.getElementById("sideBarContent")
      );
    }
  }

  componentDidUpdate() {}

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
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
          <label id="evioTitle"> Evio Platform Visualizer </label>
        </div>
        <div id="navBar">
          <Navbar />
        </div>
        <div id="searchBar" style={{ margin: "20px 0" }}>
          {this.renderTypeahead()}
        </div>
        <div id="sideBarContent" style={{ padding: "8px" }}>
          {this.renderDetails()}
        </div>
      </Slidebar>
    );
  }
}

const mapStateToProps = (state) => ({
  currentView: state.view.current,
  selectedView: state.view.selected,
  selectedElementType: state.evio.selectedElementType,
});

export default connect(mapStateToProps)(Sidebar);
