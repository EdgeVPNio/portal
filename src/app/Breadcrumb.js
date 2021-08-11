
/* EdgeVPNio
 * Copyright 2021, University of Florida
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */import React from "react";
import { connect } from "react-redux";
import { setSelectedView } from "../features/view/viewSlice";
import {
  setSelectedOverlayId,
  setRedrawGraph,
} from "../features/evio/evioSlice";
import {elementTypes} from "./Shared";
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
