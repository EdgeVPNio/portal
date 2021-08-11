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
 */
import React from "react";
import { connect } from "react-redux";
import { slide as Slidebar } from "react-burger-menu";
import evio_logo from "../images/icons/evio.svg";
import Navbar from "./Navbar";
import { Typeahead } from "react-bootstrap-typeahead";
import { appViews } from "./Shared";
import ReactDOM from "react-dom";

class Sidebar extends React.Component {
  renderTypeahead() {
    if (this.props.typeahead !== null) {
      return this.props.typeahead;
    }
    return <Typeahead placeholder={"..."} />;
    //return <null />;
  }

  renderDetails() {
    if (
      (this.props.currentView === appViews.TopologyView ||
        this.props.currentView === appViews.SubgraphView) &&
      this.props.selectedElementType === "ElementTypeNone"
    ) {
      ReactDOM.render(
        <div>
          <div title="Select Node or Tunnel to see details"> Details: </div>
        </div>,
        document.getElementById("sideBarContent")
      );
    }
    if(this.props.currentView === appViews.OverlaysView){
      return this.props.sidebarDetails
    }
  }

  componentDidUpdate() {}

  componentDidMount() {}

  componentWillUnmount() {}

  render() {
    return (
      // Pass on our props
      <Slidebar
        right
        isOpen={true}
        customBurgerIcon={<img src={evio_logo} alt=" " />}
        width={410}
        disableAutoFocus
      >
        <div
          id="evioLabel"
          style={{ textAlign: "center", top: "8px", fontSize: "medium" }}
        >
          <label id="evioTitle"> Evio Platform Visualizer </label>
        </div>
        <div id="navBar">
          <Navbar />
        </div>
        <div id="searchBar" style={{ margin: "20px 0" }}>
          {this.renderTypeahead()}
        </div>
        <div id="sideBarContent" style={{ padding: "8px" }}>
          {this.renderDetails()}
        </div>
      </Slidebar>
    );
  }
}

const mapStateToProps = (state) => ({
  currentView: state.view.current,
  selectedView: state.view.selected,
  selectedElementType: state.evio.selectedElementType,
});

export default connect(mapStateToProps)(Sidebar);
