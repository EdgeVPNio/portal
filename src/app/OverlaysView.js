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
import { setOverlayId } from "../features/evio/evioSlice";
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
    console.log("apiQueryOverlays: ", resp);
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
          console.log("query overlays failed ", err);
          if (this.autoRefresh) {
            this.timeoutId = setTimeout(this.queryOverlays.bind(this), 30000);
          }
        });
  }

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
              onClick={this.selectOverlay.bind(this, overlayId)}
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
          try {
            this.selectOverlay(selected[0]);
          } catch {
            console.log("No such item exists.");
          }
        }}
        options={
          this.state.overlays !== null
            ? this.state.overlays.getOverlayNames()
            : []
        }
        selected={this.state.selected}
        selectHintOnEnter
        placeholder="Search overlay"
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
    const overlayBtn = this.state.overlays.getOverlayNames().map((overlay) => {
      return (
        <CollapsibleButton
          key={overlay + "Btn"}
          id={overlay + "Btn"}
          name={overlay}
          className="overlayBtn"
        >
          <div>
            Number of nodes : {this.state.overlays.getNumberOfNodes(overlay)}
            <br />
            Number of links : {this.state.overlays.getNumberOfLinks(overlay)}
          </div>
        </CollapsibleButton>
      );
    });
    return (
      <div>
        <div> Overlays ({this.state.overlays.getOverlayList().length}) </div>
        <div> {overlayBtn} </div>
      </div>
    );
  }

  selectOverlay = (overlayId) => {
    this.props.setOverlayId(overlayId);
  };

  componentDidMount() {
    console.log("componentDidMount: OverlayView");
    this.props.setCurrentView("OverlaysView");
    this.queryOverlays();
    this.autoRefresh = this.props.autoUpdate;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("componentDidUpdate: OverlayView");
    if (this.props.autoUpdate !== prevProps.autoUpdate) {
      this.autoRefresh = this.props.autoUpdate;
      if (this.props.autoUpdate) {
        this.queryOverlays();
      }
    }
  }

  componentWillUnmount() {
    console.log("componentWillUnmount: OverlayView");
    this.autoRefresh = false;
    clearTimeout(this.timeoutId);
  }

  render() {
    console.log("render: OverlayView");
    return (
      <>
        <div id="overlaysArea">{this.renderOverlaysContent()} </div>
        <div id="SidePanel">
          <SideBar
            typeahead={this.renderTypeahead()}
            sidebarDetails={this.renderSidebarDetails()}
          />
          {/* <div id="bottomTools">
            <Toolbar />
          </div> */}
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  selectedView: state.view.selected,
  autoUpdate: state.tools.autoUpdate,
});

const mapDispatchToProps = {
  setCurrentView,
  setOverlayId,
};

export default connect(mapStateToProps, mapDispatchToProps)(OverlaysView);

// buttonSelected = (selectedButton) => (ev) => {
//   this.setState({ selectedButton });
// };

// render() {
//   return (
//     <div>
//       {["A", "B", "C"].map((key) => (
//         <button
//           className={key === this.state.selectedButton ? "selected" : ""}
//           type="button"
//           style={{ width: "25%", border: "none" }}
//           key={key}
//           onClick={this.buttonSelected(key)}
//         >
//           {key}
//         </button>
//       ))}
//     </div>
//   );
// }
