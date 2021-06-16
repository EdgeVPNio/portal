import React from "react";
import { connect } from "react-redux";
import { SiGraphql } from "react-icons/si";
import { BiNetworkChart } from "react-icons/bi";
import { GrMapLocation } from "react-icons/gr";
import { setView } from "../../redux/viewSlice";


class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonStates: [true, true, true],
    };
  }

  handleViewSelector(view) {
    if (this.props.selectedOverlayId.length > 0) {
      this.props.setView({ current: this.props.currentView, selected: view });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("componentDidUpdate: NavBar");
    if (this.props.selectedOverlayId !== prevProps.selectedOverlayId) {
      if (this.props.selectedOverlayId.length > 0) {
        this.setState({ buttonStates: [false, true, true] });
      } else {
        this.setState({ buttonStates: [true, true, true] });
      }
    }
  }

  componentDidMount() {
    console.log("componentDidMount: NavBar");
  }

  componentWillUnmount() {
    console.log("componentWillUnmount: NavBar");
  }

  render() {
    console.log("render: NavBar");

    console.log("selectedOverlayId: ", this.props.selectedOverlayId);

    return (
      <div class="navBarRow">
        <button
          title="Topology"
          class="navBarBtn"
          disabled={this.state.buttonStates[0]}
          onClick={this.handleViewSelector.bind(this, "TopologyView")}
        >
          {" "}
          <SiGraphql fontSize="1.5em" />{" "}
        </button>
        <button
          title="SubGraph"
          class="navBarBtn"
          disabled={this.state.buttonStates[1]}
          onClick={this.handleViewSelector.bind(this, "SubgraphView")}
        >
          {" "}
          <BiNetworkChart fontSize="1.5em" />{" "}
        </button>
        <button
          title="Map"
          class="navBarBtn"
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
  //selectedView: state.view.selected,
  selectedOverlayId: state.overlayId.current,
});

const mapDispatchToProps = {
  setView,
};

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
