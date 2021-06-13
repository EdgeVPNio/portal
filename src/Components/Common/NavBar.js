import React from "react";
import { connect } from "react-redux";
import { SiGraphql } from "react-icons/si";
import { BiNetworkChart } from "react-icons/bi";
import { GrMapLocation } from "react-icons/gr";
import { setView } from "../../redux/viewSlice";

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      buttonStates: [true, true, true],
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.selectedOverlayId !== prevProps.selectedOverlayId) {
      if (this.props.selectedOverlayId.length > 0) {
        this.setState({ buttonStates: [false, true, true] });
      } else {
        this.setState({ buttonStates: [true, true, true] });
      }
    }
  }

  handleViewSelector(view) {
    if (this.props.selectedOverlayId.length > 0) {
      this.props.setView(view);
    }
  }

  render() {
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
  selectedView: state.view.current,
  selectedOverlayId: state.overlayId.current,
});

const mapDispatchToProps = {
  setView,
};

export default connect(mapStateToProps, mapDispatchToProps)(NavBar);
