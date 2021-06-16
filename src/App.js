import React, { Component } from "react";
import "react-tippy/dist/tippy.css";
import "bootstrap/dist/css/bootstrap.min.css";
//import { CurrentView } from "./Components/Common/CurrentView";
import "./CSS/Main.css";
import SideBar from "./Components/Common/Sidebar";
import NavBar from "./Components/Common/NavBar";
// import ViewSelector from "./Components/Common/ViewSelector";
import TopologyView from "./Components/Common/TopologyView";
import { connect } from "react-redux";
import OverlaysView from "./Components/Common/OverlaysView";
import { Spinner } from "react-bootstrap";
import { setView } from "./redux/viewSlice";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  currentView() {
    switch (this.props.selectedView) {
      case "OverlaysView":
        return <OverlaysView />;
      case "TopologyView":
        return <TopologyView />;
      default:
        return <Spinner id="loading" animation="border" variant="info" />;
    }
  }
  componentDidMount() {
    console.log("componentDidMount: AppView");
    this.props.setView({current: this.props.currentView, selected: "OverlaysView"})
  }

  componentDidUpdate() {
    console.log("componentDidUpdate: AppView");
  }

  componentWillUnmount() {
    console.log("componentWillUnmount: AppView");
  }

  render() {
    console.log("render: AppView");
    return (
      <div id="container" className="container-fluid" style={{ padding: "0" }}>
        <div
          id="mainContent"
          className="row"
          style={{ backgroundColor: "#101B2B", color: "white", margin: "auto" }}
        >
          {this.currentView()}
          {/* <div id="SidePanel">
            <SideBar />
          </div> */}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentOverlayId: state.overlayId.current,
  currentView: state.view.current,
  selectedView: state.view.selected,
});

const mapDispatchToProps = {
  setView,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
