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
import { Spinner } from "react-bootstrap";
import { Tooltip } from "react-tippy";
import "bootstrap/dist/css/bootstrap.min.css";
import CollapsibleButton from "./CollapsibleButton";
import { Typeahead } from "react-bootstrap-typeahead";
import "../index.css";
import Overlays from "./Overlays.js";
import SideBar from "./Sidebar";
import { connect } from "react-redux";
import {
  setSelectedOverlayId,
  clearSelectedElement,
} from "../features/evio/evioSlice";
import {appViews} from "./Shared";
import { setCurrentView } from "../features/view/viewSlice";

class OverlaysView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      overlays: new Overlays([]),
    };
    this.intervalId = null;
    this.timeoutId = null;
    //this.autoRefresh = true; //flag to monitor autoRefresh onClick of refresh button
    this.autoRefresh = this.props.autoUpdate;
  }

  /**
   * Polling function on GET Overlays data - runs untill autoUpdate is disabled
   * @param {String} intervalId
   */
  async apiQueryOverlays(intervalId) {
    var url = "/overlays?interval=" + intervalId;
    var resp = await fetch(url).then((res) => {
      return res.json();
    });
    return resp;
  }

  queryOverlays() {
    if (this.autoRefresh)
      this.apiQueryOverlays(this.intervalId)
        .then((resp) => {
          if (this.autoRefresh) {
            this.setState({ overlays: new Overlays(resp) });
            this.intervalId = resp[0]._id;
            this.queryOverlays();
          }
        })
        .catch((err) => {
          console.warn("query overlays failed ", err);
          if (this.autoRefresh) {
            this.timeoutId = setTimeout(this.queryOverlays.bind(this), 30000);
          }
        });
  }

  toggleOverlayBtn = (overlayId, btnElements, selectedElement) => {
    for (var element of btnElements) {
      element.classList.remove("overlaySelected");
    }
    let olId = this.props.selectedOverlayId;
    this.props.setSelectedOverlayId("");
    if (olId !== overlayId) {
      this.props.setSelectedOverlayId(overlayId);
      selectedElement.classList.add("overlaySelected");
    }
  };

  onTypeheadChange = (overlayId) => {
    var selectedOverlayBtnList = document
      .getElementById("overlaysArea")
      .getElementsByClassName("overlaySelected");
    this.toggleOverlayBtn(
      overlayId,
      selectedOverlayBtnList,
      document.getElementById(overlayId)
    );
  };
  onOverlayClick = (overlayId, e) => {
    var selectedOverlayBtnList = document
      .getElementById("overlaysArea")
      .getElementsByClassName("overlaySelected");
    this.toggleOverlayBtn(overlayId, selectedOverlayBtnList, e.target);
  };

  renderOverlaysContent = () => {
    if (this.state.overlays.getOverlayList().length === 0) {
      return <Spinner id="loading" animation="border" variant="info" />;
    }
    const overlaysContent = this.state.overlays
      .getOverlayNames()
      .map((overlayId) => {
        return (
          <Tooltip
            className="overlayTooltips"
            key={overlayId}
            duration="500"
            animation="scale"
            interactive
            position="bottom"
            arrow={true}
            open={true}
            html={<div>{overlayId}</div>}
          >
            <button
              onClick={(e) => {
                this.onOverlayClick(overlayId, e);
              }}
              id={overlayId}
              className="overlay"
            />
          </Tooltip>
        );
      });
    return <>{overlaysContent}</>;
  };

  renderTypeahead() {
    return (
      <Typeahead
        id="searchOverlay"
        onChange={(selected) => {
          if (selected.length > 0) {
            this.onTypeheadChange(selected[0]);
          }
        }}
        options={
          this.state.overlays !== null
            ? this.state.overlays.getOverlayNames()
            : []
        }
        selected={this.state.selected}
        selectHintOnEnter
        placeholder="Search by overlay ID"
        renderMenuItemChildren={(option) => {
          return (
            <div className="searchResult">
              <div className="resultLabel">{option}</div>
              <small className="resultLabel">{`Number of nodes :  ${this.state.overlays.getNumberOfNodes(
                option
              )} Number of links : ${this.state.overlays.getNumberOfLinks(
                option
              )}`}</small>
              <br />
            </div>
          );
        }}
      ></Typeahead>
    );
  }
  renderSidebarDetails() {
    const overlayFoldouts = this.state.overlays
      .getOverlayNames()
      .map((overlayName) => {
        return (
          <CollapsibleButton
            key={overlayName + "Btn"}
            id={overlayName + "Btn"}
            name={overlayName}
            className="overlayBtn"
          >
            <div>
              Number of nodes :{" "}
              {this.state.overlays.getNumberOfNodes(overlayName)}
              <br />
              Number of links :{" "}
              {this.state.overlays.getNumberOfLinks(overlayName)}
            </div>
          </CollapsibleButton>
        );
      });
    return (
      <div>
        <div> Overlays ({this.state.overlays.getOverlayList().length}) </div>
        <div> {overlayFoldouts} </div>
      </div>
    );
  }

  selectOverlay = (overlayId) => {
    this.props.setSelectedOverlayId(overlayId);
  };

  componentDidMount() {
    this.props.setCurrentView(appViews.OverlaysView);
    this.queryOverlays();
    this.autoRefresh = this.props.autoUpdate;
    this.props.clearSelectedElement();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.autoUpdate !== prevProps.autoUpdate) {
      this.autoRefresh = this.props.autoUpdate;
      if (this.props.autoUpdate) {
        this.queryOverlays();
      }
    }
  }

  componentWillUnmount() {
    this.autoRefresh = false;
    clearTimeout(this.timeoutId);
  }

  render() {
    return (
      <>
        <div id="overlaysArea">{this.renderOverlaysContent()} </div>
        <div id="SidePanel">
          <SideBar
            typeahead={this.renderTypeahead()}
            sidebarDetails={this.renderSidebarDetails()}
          />
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  selectedView: state.view.selected,
  autoUpdate: state.tools.autoUpdate,
  selectedOverlayId: state.evio.selectedOverlayId,
  selectedElementType: state.selectedElementType,
  selectedCyElementData: state.evio.selectedCyElementData,
});

const mapDispatchToProps = {
  setCurrentView,
  setSelectedOverlayId,
  clearSelectedElement,
};

export default connect(mapStateToProps, mapDispatchToProps)(OverlaysView);