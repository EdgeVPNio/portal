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
import static_ic from "../images/icons/static_ic.svg";
import ondemand_ic from "../images/icons/ondemand_ic.svg";
import connected_ic from "../images/icons/connected_ic.svg";
import no_tunnel_ic from "../images/icons/no_tunnel_ic.svg";
import successor_ic from "../images/icons/successor_ic.svg";
import longdistance_ic from "../images/icons/longdistance_ic.svg";
import not_reporting_ic from "../images/icons/not_reporting_ic.svg";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { connect } from "react-redux";
import {
  configureZoomRange,
  setZoomValue,
  toggleAutoUpdate,
} from "../features/tools/toolsSlice";
import { appViews } from "./Shared";

class Toolbar extends React.Component {
  constructor(props) {
    super(props);
    this.zoomIncrement = 0.1;
    if (this.props.zoomIncrement === null) {
      this.zoomIncrement = this.props.zoomIncrement;
    }
    this.state = {
      buttonStates: [true, true, true, true, true], //[zoomIn, zoomOut, refresh, config, legend]
    };
  }

  zoomIn = () => {
    var zoomTo = this.props.zoomValue + this.zoomIncrement;
    if (zoomTo > this.props.zoomMaximum) {
      zoomTo = this.props.zoomMaximum;
    }
    this.props.setZoomValue(zoomTo);
  };

  zoomOut = () => {
    var zoomTo = this.props.zoomValue - this.zoomIncrement;
    if (zoomTo < this.props.zoomMinimum) {
      zoomTo = this.props.zoomMinimum;
    }
    this.props.setZoomValue(zoomTo);
  };

  setMinZoom = (e) => {
    this.props.configureZoomRange({
      zoomMinimum: e.target.value,
      zoomMaximum: this.props.zoomMaximum,
    });
  };

  setMaxZoom = (e) => {
    this.props.configureZoomRange({
      zoomMinimum: this.props.zoomMinimum,
      zoomMaximum: e.target.value,
    });
  };

  toggleAutoUpdate = () => {
    this.props.toggleAutoUpdate();
  };

  renderZoomInButton() {
    return (
      <button
        onClick={this.zoomIn}
        id="zoomInBtn"
        disabled={this.state.buttonStates[0]}
        className={
          this.state.buttonStates[0] ? "zoomInBtnDisabled" : "zoomInBtn"
        }
      ></button>
    );
  }

  renderZoomOutButton() {
    return (
      <button
        onClick={this.zoomOut}
        id="zoomOutBtn"
        disabled={this.state.buttonStates[1]}
        className={
          this.state.buttonStates[1] ? "zoomOutBtnDisabled" : "zoomOutBtn"
        }
      ></button>
    );
  }

  renderRefreshButton() {
    return (
      <button
        onClick={this.toggleAutoUpdate}
        id="refreshBtn"
        className={
          this.state.buttonStates[2] ? "refreshBtnDisabled" : "refreshBtn"
        }
        title="Disable/Enable Auto Updates"
        disabled={this.state.buttonStates[2]}
      ></button>
    );
  }

  componentDidMount() {}

  componentDidUpdate(prevProps, prevState) {
    if (this.props.currentView !== prevProps.currentView) {
      if (this.props.currentView === appViews.OverlaysView) {
        this.setState({ buttonStates: [true, true, false, true, true] });
        //[zoomIn, zoomOut, refresh, config, legend]
      } else if (this.props.currentView === appViews.TopologyView) {
        this.setState({ buttonStates: [false, false, false, false, false] });
        //[zoomIn, zoomOut, refresh, config, legend]
      } else if (this.props.currentView === appViews.SubgraphView) {
        this.setState({ buttonStates: [false, false, true, false, false] });
      }
    }
  }

  componentWillUnmount() {}

  renderInfoButton() {
    return (
      <OverlayTrigger
        rootClose={true}
        trigger="click"
        placement="top"
        overlay={
          <Popover>
            <Popover.Title as="h3">
              EVIO Network Visualizer : Legend
            </Popover.Title>
            {/* <Card id="infoContent"> */}
            <Popover.Content id="infoContent">
              <table>
                <thead>
                  <tr>
                    <th colSpan={2}>Node</th>
                    <th colSpan={2}>Tunnel</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ width: "5%", margin: "auto" }}>
                      <img
                        className="node_img"
                        src={connected_ic}
                        alt="connected_node"
                      />
                    </td>
                    <td>Connected</td>
                    <td style={{ width: "15%" }}>
                      <img
                        className="tunnel_img"
                        src={longdistance_ic}
                        alt="longdistance_tunnel"
                      />
                    </td>
                    <td>Long Distance</td>
                  </tr>
                  <tr>
                    <td style={{ width: "5%" }}>
                      <img
                        className="node_img"
                        src={not_reporting_ic}
                        alt="not_reporting_node"
                      />
                    </td>
                    <td>Not Reporting</td>
                    <td style={{ width: "15%" }}>
                      <img
                        className="tunnel_img"
                        src={ondemand_ic}
                        alt="ondemand_tunnel"
                      />
                    </td>
                    <td>On Demand</td>
                  </tr>
                  <tr>
                    <td style={{ width: "5%" }}>
                      <img
                        className="node_img"
                        src={no_tunnel_ic}
                        alt="no_tunnel_node"
                      />
                    </td>
                    <td>No Tunnels</td>
                    <td style={{ width: "15%" }}>
                      <img
                        className="tunnel_img"
                        src={static_ic}
                        alt="static_tunnel"
                      />
                    </td>
                    <td>Static</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td></td>
                    <td style={{ width: "15%" }}>
                      <img
                        className="tunnel_img"
                        src={successor_ic}
                        alt="successor_tnnel"
                      />
                    </td>
                    <td>Successor</td>
                  </tr>
                </tbody>
              </table>
              {/* </Card> */}
            </Popover.Content>
          </Popover>
        }
      >
        <button
          onClick={this.handleInfoToggle}
          id="infoBtn"
          disabled={this.state.buttonStates[4]}
          className={this.state.buttonStates[4] ? "infoBtnDisabled" : "infoBtn"}
        ></button>
      </OverlayTrigger>
    );
  }

  renderConfigButton() {
    return (
      <OverlayTrigger
        rootClose={true}
        trigger="click"
        placement="top"
        overlay={
          <Popover>
            <Popover.Title as="h3">
              EVIO Network Visualizer : Configure
            </Popover.Title>
            <Popover.Content id="configContent">
              <div className="row">
                <div className="col">
                  <label>Minimum zoom</label>
                </div>
                <div className="col">
                  <select
                    defaultValue={this.props.zoomMinimum}
                    onChange={this.setMinZoom}
                    id="minZoomSelector"
                    value={this.props.zoomMinimum}
                  >
                    <option value="0.05">0.05</option>
                    <option value="0.1">0.1</option>
                    <option value="0.25">0.25</option>
                    <option value="0.5">0.5</option>
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label>Maximum zoom</label>
                </div>
                <div className="col">
                  <select
                    defaultValue={this.props.zoomMaximum}
                    onChange={this.setMaxZoom}
                    id="maxZoomSelector"
                    value={this.props.zoomMaximum}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>
              </div>
            </Popover.Content>
          </Popover>
        }
      >
        <button
          onClick={this.handleConfigToggle}
          id="configBtn"
          disabled={this.state.buttonStates[3]}
          className={
            this.state.buttonStates[3] ? "configBtnDisabled" : "configBtn"
          }
        ></button>
      </OverlayTrigger>
    );
  }

  render() {
    return (
      <>
        <div>{this.renderZoomInButton()}</div>
        <div>{this.renderZoomOutButton()}</div>
        <div>{this.renderRefreshButton()}</div>
        <div>{this.renderConfigButton()}</div>
        <div>{this.renderInfoButton()}</div>
      </>
    );
  }
}
const mapStateToProps = (state) => ({
  zoomValue: state.tools.zoomValue,
  zoomMinimum: state.tools.zoomMinimum,
  zoomMaximum: state.tools.zoomMaximum,
  autoUpdate: state.tools.autoUpdate,
  currentView: state.view.current,
});

const mapDispatchToProps = {
  configureZoomRange,
  setZoomValue,
  toggleAutoUpdate,
};

export default connect(mapStateToProps, mapDispatchToProps)(Toolbar);
