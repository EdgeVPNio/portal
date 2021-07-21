import React from "react";
import { connect } from "react-redux";
import { setSelectedView } from "../features/view/viewSlice";
import {
  setSelectedOverlayId,
  setRedrawGraph,
  elementTypes,
} from "../features/evio/evioSlice";

class Breadcrumb extends React.Component {
  componentDidMount() {}

  componentDidUpdate(prevProps, prevState) {}

  componentWillUnmount() {}

  handleBackToHome = () => {
    this.props.setSelectedView("OverlaysView");
    this.props.setSelectedOverlayId("");
    if (this.props.currentView === "OverlaysView") {
      var selectedOverlayBtnList = document
        .getElementById("overlaysArea")
        .getElementsByClassName("overlaySelected");
      for (var element of selectedOverlayBtnList) {
        element.classList.remove("overlaySelected");
      }
    }
  };

  homeButton() {
    return (
      <button
        onClick={this.handleBackToHome}
        id="homeBtn"
        className="breadcrumbHomeBtn"
      ></button>
    );
  }

  resetGraph = () => {
    if (this.props.currentView === "TopologyView") {
      this.props.setRedrawGraph(!this.props.redrawGraph);
    }
  };

  renderElementBreadcrumb() {
    var eleData = JSON.parse(this.props.selectedCyElementData);
    return (
      <button
        id="elementBreadcrumb"
        className="breadcrumbLabel"
        disabled={this.props.currentView !== "OverlaysView" ? false : true}
        title={
          this.props.currentView !== "OverlaysView"
            ? "Selecte a node or Edge!"
            : "None"
        }
      >
        <div className="breadcrumbLabel">
          {Object.keys(eleData).length > 0
            ? this.props.selectedElementType === elementTypes.eleNode
              ? "Node : " + eleData.label
              : "Tunnel : " + eleData.label.slice(0, 7)
            : "None."}
        </div>
      </button>
    );
  }

  renderOverlayBreadcrumb() {
    return (
      <button
        id="overlayBreadcrumb"
        className="breadcrumbLabel"
        disabled={this.props.currentView !== "OverlaysView" ? false : true}
        onClick={this.resetGraph}
        title="Selecte an Overlay!"
      >
        <div className="breadcrumbLabel">
          Overlay : {this.props.selectedOverlayId}
        </div>
      </button>
    );
  }

  render() {
    return (
      <>
        <div>{this.homeButton()}</div>
        <div>{this.renderOverlayBreadcrumb()}</div>
        <div>{this.renderElementBreadcrumb()}</div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  selectedCyElementData: state.evio.selectedCyElementData,
  redrawGraph: state.evio.redrawGraph,
  selectedOverlayId: state.evio.selectedOverlayId,
  currentView: state.view.current,
  selectedElementType: state.evio.selectedElementType,
});

const mapDispatchToProps = {
  setRedrawGraph,
  setSelectedView,
  setSelectedOverlayId,
};

export default connect(mapStateToProps, mapDispatchToProps)(Breadcrumb);
