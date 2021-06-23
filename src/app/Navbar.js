import React from "react";
import { connect } from "react-redux";
import { SiGraphql } from "react-icons/si";
import { BiNetworkChart } from "react-icons/bi";
import { GrMapLocation } from "react-icons/gr";
import { setSelectedView } from "../features/view/viewSlice";


class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonStates: [true, true, true],
    };
  }

  handleViewSelector(view) {
    if (this.props.selectedOverlayId.length > 0) {
      this.props.setSelectedView(view);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("componentDidUpdate: Navbar");
    if (this.props.selectedOverlayId !== prevProps.selectedOverlayId) {
      if (this.props.selectedOverlayId.length > 0) {
        this.setState({ buttonStates: [false, true, true] });
      } else {
        this.setState({ buttonStates: [true, true, true] });
      }
    }
  }

  componentDidMount() {
    console.log("componentDidMount: Navbar");
  }

  componentWillUnmount() {
    console.log("componentWillUnmount: Navbar");
  }

  render() {
    console.log("render: Navbar");

    console.log("selectedOverlayId: ", this.props.selectedOverlayId);

    return (
      <div class="navBarRow">
        <button
          title="Topology"
          class={this.state.buttonStates[0] ? "navBarTopologyBtnDisabled": "navBarTopologyBtn"}
          disabled={this.state.buttonStates[0]}
          onClick={this.handleViewSelector.bind(this, "TopologyView")}
        >
          {" "}
          <SiGraphql fontSize="1.5em" />{" "}
        </button>
        <button
          title="SubGraph"
          class={this.state.buttonStates[1] ? "navBarSubGraphBtnDisabled": "navBarSubGraphBtn"}
          disabled={this.state.buttonStates[1]}
          onClick={this.handleViewSelector.bind(this, "SubgraphView")}
        >
          {" "}
          <BiNetworkChart fontSize="1.5em" />{" "}
        </button>
        <button
          title="Map"
          class={this.state.buttonStates[2] ? "navBarMapBtnDisabled": "navBarMapBtn"}
          disabled={this.state.buttonStates[2]}
          onClick={this.handleViewSelector.bind(this, "MapView")}
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
  selectedOverlayId: state.evio.selectedOverlayId,
});

const mapDispatchToProps = {
  setSelectedView,
};

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
