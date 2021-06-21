import React from "react";
import Card from "react-bootstrap/Card";
import "bootstrap/dist/css/bootstrap.min.css";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import DowmArrow from "../images/icons/down-arrow-ic.svg";
import UpArrow from "../images/icons/up-arrow-ic.svg";
import { connect } from "react-redux";

class CollapsibleButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isToggle: this.props.isOpen,
      accordionStyle: this.props.isOpen ? "block" : "none",
    };
  }
  componentDidUpdate(prevProps, prevState) {
    console.log("componentDidUpdate: collapsiblebutton");
    if (this.props.selectedOverlayId !== prevProps.selectedOverlayId) {
      if (this.props.selectedOverlayId.length > 0) {
        this.handleOnClick();
      }
    }
  }

  componentDidMount() {
    console.log("componentDidMount: collapsiblebutton");
  }

  componentWillUnmount() {
    console.log("componentWillUnmount: collapsiblebutton");
  }

  handleOnClick = () => {
    this.setState((prevState) => {
      return {
        isToggle: !prevState.isToggle,
        accordionStyle: prevState.accordionStyle === "block" ? "none" : "block",
      };
    });
  };

  render() {
    return (
      <Accordion
        id={this.props.id}
        className={this.props.className}
        style={this.props.style}
      >
        <Accordion.Toggle
          onClick={this.handleOnClick}
          as={Button}
          style={{
            color: "white",
            background: "transparent",
            border: "transparent",
            outline: "none",
          }}
          eventKey={this.props.name}
        >
          <div className="row">
            <div className="col">{this.props.name}</div>
            <div className="col" style={{ textAlign: "right" }}>
              {this.state.isToggle ? (
                <img className="arrow" src={UpArrow} alt="up-arrow" />
              ) : (
                <img className="arrow" src={DowmArrow} alt="down-arrow" />
              )}
            </div>
          </div>
        </Accordion.Toggle>
        <Accordion.Collapse
          as={Card.Body}
          eventKey={this.props.name}
          style={{
            backgroundColor: "#213758",
            padding: "1%",
            display: this.state.accordionStyle,
            overflowWrap: "break-word",
          }}
        >
          <div className="collapseContent"> {this.props.children} </div>
        </Accordion.Collapse>
      </Accordion>
    );
  }
}

const mapStateToProps = (state) => ({
  selectedOverlayId: state.evio.overlayId,
});

export default connect(mapStateToProps)(CollapsibleButton);

//export default CollapsibleButton;
