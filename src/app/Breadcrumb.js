import React from "react";
import { connect } from "react-redux";
import { setSelectedView } from "../features/view/viewSlice";
import {
  setOverlayId,
  setBreadcrumbDetails,
  setRedrawGraph,
} from "../features/evio/evioSlice";

class Breadcrumb extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log("componentDidMount: Breadcrumb");
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("componentDidUpdate: Breadcrumb");
  }

  componentWillUnmount() {
    console.log("componentWillUnmount: Tools");
  }

  handleBackToHome = () => {
    this.props.setSelectedView("OverlaysView");
    this.props.setOverlayId("");
  };

  homeButton() {
    return (
      <button
        onClick={this.handleBackToHome}
        id="homeBtn"
        className="breadcrumbLabel"
      ></button>
    );
  }

  redrawGraph = () => {
    console.warn(
      "redrawGraph: ",
      this.props.redrawGraph,
      this.props.selectedElement,
      this.props.selectedElement.data().label
    );
    if (this.props.redrawGraph == false) {
      var flag = true;
    }
    this.props.setRedrawGraph(flag);
  };

  renderElementBreadcrumb() {
    return (
      <button id="elementBreadcrumb" className="breadcrumbLabel">
        <div className="breadcrumbLabel">
          {this.props.selectedElement !== null
            ? this.props.selectedElement.isNode()
              ? "Node : " + this.props.selectedElement.data().label
              : "Tunnel : " + this.props.selectedElement.data().label
            : "None."}
        </div>
      </button>
    );
  }

  renderOverlayBreadcrumb() {
    return (
      <button id="overlayBreadcrumb" className="breadcrumbLabel">
        <div className="breadcrumbLabel" onClick={this.redrawGraph}>
          Overlay : {this.props.overlayName}
        </div>
      </button>
    );
  }

  render() {
    return (
      <div id="breadcrumbPanelId">
        <div>{this.homeButton()}</div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  selectedElement: state.evio.selectedElement,
  redrawGraph: state.evio.redrawGraph,
});

const mapDispatchToProps = {
  setBreadcrumbDetails,
  setRedrawGraph,
  setSelectedView,
  setOverlayId,
};

export default connect(mapStateToProps, mapDispatchToProps)(Breadcrumb);
