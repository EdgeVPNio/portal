import React from "react";
import { connect } from "react-redux";
import { setSelectedView } from "../features/view/viewSlice";
import {
  setSelectedOverlayId,
  setRedrawGraph,
  elementTypes,
  clearSelectedElement,
} from "../features/evio/evioSlice";

class Breadcrumb extends React.Component {
  componentDidMount() {}

  componentDidUpdate(prevProps, prevState) {
    if (this.props.elementType !== prevProps.elementType) {
      if (this.props.elementType === elementTypes.eleNone) {
        this.props.clearSelectedElement();
      }
    }
  }

  componentWillUnmount() {}

  handleBackToHome = () => {
    this.props.setSelectedView("OverlaysView");
    this.props.setSelectedOverlayId("");
    var selectedOverlayBtnList =document.getElementById("overlaysArea").getElementsByClassName("overlaySelected");
    for (var element of selectedOverlayBtnList) {
      element.classList.remove("overlaySelected");
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

  reCenterGraph = () => {
    if (this.props.currentView === "TopologyView") {
      if (this.props.redrawGraph !== "true") {
        this.props.setRedrawGraph({
          redrawGraph: "true",
        });
      }
    }
    if (this.props.currentView === "OverlaysView") {
      this.props.setRedrawGraph({
        redrawGraph: "disable",
      });
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
            ? this.props.elementType === elementTypes.eleNode
              ? "Node : " + eleData.label
              : "Tunnel : " + eleData.label
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
        onClick={this.reCenterGraph}
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
      <div id="breadcrumbPanelId">
        <div>{this.homeButton()}</div>
        <div>{this.renderOverlayBreadcrumb()}</div>
        <div>{this.renderElementBreadcrumb()}</div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  selectedCyElementData: state.evio.selectedCyElementData,
  redrawGraph: state.evio.redrawGraph,
  selectedOverlayId: state.evio.selectedOverlayId,
  currentView: state.view.current,
  elementType: state.evio.selectedElementType,
});

const mapDispatchToProps = {
  clearSelectedElement,
  setRedrawGraph,
  setSelectedView,
  setSelectedOverlayId,
};

export default connect(mapStateToProps, mapDispatchToProps)(Breadcrumb);
