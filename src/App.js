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
import "react-tippy/dist/tippy.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import { connect } from "react-redux";
import { Spinner } from "react-bootstrap";
import { setSelectedView } from "./features/view/viewSlice";
import OverlaysView from "./app/OverlaysView";
import TopologyView from "./app/TopologyView";
import Toolbar from "./app/Toolbar";
import MapView from "./app/MapView";
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
      case "SubgraphView":
        return <TopologyView />;
      case "MapView":
        return <MapView />;
      default:
        return <Spinner id="loading" animation="border" variant="info" />;
    }
  }
  componentDidMount() {
    this.props.setSelectedView("OverlaysView");
  }

  componentDidUpdate() {}

  componentWillUnmount() {}

  render() {
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
