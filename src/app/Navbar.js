import React from "react";
import { connect } from "react-redux";
import { SiGraphql } from "react-icons/si";
import { BiNetworkChart } from "react-icons/bi";
import { GrMapLocation } from "react-icons/gr";
import { setSelectedView } from "../features/view/viewSlice";
import {  appViews } from "../features/evio/evioSlice";

class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonStates: [true, true, true], // Topo, Sub, Map
    };
  }

  handleViewSelector(view) {
    if (this.props.selectedOverlayId.length > 0) {
      this.props.setSelectedView(view);
    }
    if (view === appViews.SubgraphView) {
      this.setState({ buttonStates: [false, false, true] });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.selectedOverlayId !== prevProps.selectedOverlayId) {
      if (this.props.selectedOverlayId.length > 0) {
        this.setState({ buttonStates: [false, true, true] });
      } else {
        this.setState({ buttonStates: [true, true, true] });
      }
    }
    if (this.props.selectedElementType !== prevProps.selectedElementType) {
      if (
        this.props.selectedView === appViews.TopologyView &&
        this.props.selectedElementType !== "ElementTypeNone"
      ) {
        this.setState({ buttonStates: [true, false, true] }); 
        // on Topologyview and any cyElement is selected - enable subgraph
      }
      if (
        this.props.selectedView === appViews.TopologyView &&
        this.props.selectedElementType === "ElementTypeNone"
      ) {
        this.setState({ buttonStates: [true, true, true] });
        // on Topologyview and any cyElement is deselected - disable subgraph
      }
    }
    if (this.props.currentView !== prevProps.currentView) {
      // Toggle the current state buttons
      if (
        this.props.selectedView === appViews.SubgraphView &&
        this.props.currentView === appViews.SubgraphView
      ) {
        this.setState({ buttonStates: [false, true, true] });
      }
      if (
        this.props.selectedView === appViews.TopologyView &&
        this.props.currentView === appViews.TopologyView
      ) {
        this.setState({ buttonStates: [true, true, true] });
      }
    }
  }

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return (
      <div class="navBarRow">
        <button
          title="Topology"
          class={
            this.state.buttonStates[0]
              ? "navBarTopologyBtnDisabled"
              : "navBarTopologyBtn"
          }
          disabled={this.state.buttonStates[0]}
          onClick={this.handleViewSelector.bind(
            this,
            appViews.TopologyView
          )}
        >
          {" "}
          <SiGraphql fontSize="1.5em" />{" "}
        </button>
        <button
          title="SubGraph"
          class={
            this.state.buttonStates[1]
              ? "navBarSubGraphBtnDisabled"
              : "navBarSubGraphBtn"
          }
          disabled={this.state.buttonStates[1]}
          onClick={this.handleViewSelector.bind(
            this,
            appViews.SubgraphView
          )}
        >
          {" "}
          <BiNetworkChart fontSize="1.5em" />{" "}
        </button>
        <button
          title="Map"
          class={
            this.state.buttonStates[2] ? "navBarMapBtnDisabled" : "navBarMapBtn"
          }
          disabled={this.state.buttonStates[2]}
          onClick={this.handleViewSelector.bind(this, appViews.MapView)}
        >
          {" "}
          <GrMapLocation fontSize="1.5em" />{" "}
        </button>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentView: state.view.current,
  selectedView: state.view.selected,
  selectedOverlayId: state.evio.selectedOverlayId,
  selectedElementType: state.evio.selectedElementType,
});

const mapDispatchToProps = {
  setSelectedView,
};

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
