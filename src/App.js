import React from "react";
import "react-tippy/dist/tippy.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import { connect } from "react-redux";
import { Spinner } from "react-bootstrap";
import { setSelectedView } from "./features/view/viewSlice";
import OverlaysView from "./app/OverlaysView";
import TopologyView from "./app/TopologyView";
import Toolbar from "./app/Toolbar";
import Breadcrumb from "./app/Breadcrumb";

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
    this.props.setSelectedView("OverlaysView");
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
          <div id="toolsArea">
            <Toolbar />
          </div>
          {/* <div id="SidePanel">
            <SideBar />
          </div> */}
          <div id="breadcrumbPanelId">
            <Breadcrumb />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentOverlayId: state.evio.selectedOverlayId,
  currentView: state.view.current,
  selectedView: state.view.selected,
});

const mapDispatchToProps = {
  setSelectedView,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
