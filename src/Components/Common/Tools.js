import React from "react";
import static_ic from "../../Images/Icons/static_ic.svg";
import ondemand_ic from "../../Images/Icons/ondemand_ic.svg";
import connected_ic from "../../Images/Icons/connected_ic.svg";
import no_tunnel_ic from "../../Images/Icons/no_tunnel_ic.svg";
import successor_ic from "../../Images/Icons/successor_ic.svg";
import longdistance_ic from "../../Images/Icons/longdistance_ic.svg";
import not_reporting_ic from "../../Images/Icons/not_reporting_ic.svg";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import { connect } from "react-redux";
import { setTools } from "../../redux/toolsSlice";

class Tools extends React.Component {
  constructor(props) {
    super(props);
    this.zoomIncrement = 0.1;
    if (this.props.zoomIncrement === null) {
      this.zoomIncrement = this.props.zoomIncrement;
    }
    //this.autoUpdate = true; //flag to monitor autoUpdate onClick of refresh button
  }

  zoomIn = () => {
    var zoomTo = this.props.zoomValue + this.zoomIncrement;
    this.props.setTools({
      zoomValue: zoomTo,
      zoomMinimum: this.props.zoomMinimum,
      zoomMaximum: this.props.zoomMaximum,
      autoUpdate: this.props.autoUpdate,
    });
  };

  zoomOut = () => {
    var zoomTo = this.props.zoomValue - this.zoomIncrement;
    this.props.setTools({
      zoomValue: zoomTo,
      zoomMinimum: this.props.zoomMinimum,
      zoomMaximum: this.props.zoomMaximum,
      autoUpdate: this.props.autoUpdate,
    });
  };

  setMinZoom = (val) => {
    this.props.setTools({
      zoomValue: this.props.zoomValue,
      zoomMinimum: val,
      zoomMaximum: this.props.zoomMaximum,
      autoUpdate: this.props.autoUpdate,
    });
  };

  setMaxZoom = (val) => {
    this.props.setTools({
      zoomValue: this.props.zoomValue,
      zoomMinimum: this.props.zoomMinimum,
      zoomMaximum: val,
      autoUpdate: this.props.autoUpdate,
    });
  };

  toggleAutoUpdate = () => {
    this.props.setTools({
      zoomValue: this.props.zoomValue,
      zoomMinimum: this.props.zoomMinimum,
      zoomMaximum: this.props.zoomMaximum,
      autoUpdate: !this.props.autoUpdate,
    });
  };

  renderZoomInButton() {
    return (
      <button
        onClick={this.zoomIn}
        id="zoomInBtn"
        className="bottomToolsBtn"
      ></button>
    );
  }

  renderZoomOutButton() {
    return (
      <button
        onClick={this.zoomOut}
        id="zoomOutBtn"
        className="bottomToolsBtn"
      ></button>
    );
  }

  renderRefreshButton() {
    return (
      <button
        onClick={this.toggleAutoUpdate}
        id="refreshBtn"
        className="bottomToolsBtn"
        title="Disable/Enable Auto Updates"
        style={this.props.autoUpdate ? { opacity: 1 } : { opacity: 0.4 }}
      ></button>
    );
  }

  componentDidMount() {
    console.log("componentDidMount: Tools");
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("componentDidUpdate: Tools");
    // if (
    //   this.props.zoomValue !== prevProps.zoomValue ||
    //   this.props.zoomMinimum !== prevProps.zoomMinimum ||
    //   this.props.zoomMaximum !== prevProps.zoomMaximum ||
    //   this.props.autoUpdate !== prevProps.autoUpdate
    // ) {
    //   this.props.setTools({
    //     zoomValue: this.props.zoomValue,
    //     zoomMinimum: this.props.zoomMinimum,
    //     zoomMaximum: this.props.zoomMaximum,
    //     autoUpdate: this.props.autoUpdate,
    //   });
    // }
  }

  componentWillUnmount() {
    console.log("componentWillUnmount: Tools");
  }

  renderInfoButton() {
    console.log("render: Tools");
    return (
      <OverlayTrigger
        rootClose={true}
        trigger="click"
        placement="right"
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
          className="leftToolsBtn"
        ></button>
      </OverlayTrigger>
    );
  }

  renderConfigButton() {
    return (
      <OverlayTrigger
        rootClose={true}
        trigger="click"
        placement="right"
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
                    <option id="0.1">0.1</option>
                    <option id="0.3">0.3</option>
                    <option id="0.5">0.5</option>
                    <option id="0.9">0.9</option>
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
                    <option>2</option>
                    <option>3</option>
                    <option>5</option>
                    <option>10</option>
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
          className="bottomToolsBtn"
        ></button>
      </OverlayTrigger>
    );
  }

  render() {
    return (
      <div id="bottomTools">
        <div>{this.renderZoomInButton()}</div>
        <div>{this.renderZoomOutButton()}</div>
        <div>{this.renderRefreshButton()}</div>
        <div>{this.renderConfigButton()}</div>
        <div>{this.renderInfoButton()}</div>
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  zoomValue: state.tools.zoomValue,
  zoomMinimum: state.tools.zoomMinimum,
  zoomMaximum: state.tools.zoomMaximum,
  autoUpdate: state.tools.autoUpdate,
});

const mapDispatchToProps = {
  setTools,
};

export default connect(mapStateToProps, mapDispatchToProps)(Tools);
