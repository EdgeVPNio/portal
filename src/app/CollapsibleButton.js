import React from "react";
import Card from "react-bootstrap/Card";
import "bootstrap/dist/css/bootstrap.min.css";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import DownArrow from "../images/icons/down-arrow-ic.svg";
import UpArrow from "../images/icons/up-arrow-ic.svg";
import { connect } from "react-redux";

class CollapsibleButton extends React.Component {
  constructor(props) {
    super(props);
    this.isToggle = false;
    this.accordionStyle = this.props.isOpen ? "block" : "none";
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.selectedOverlayId !== prevProps.selectedOverlayId) {
      if (this.props.selectedOverlayId.length > 0) {
        this.handleOnClick();
      }
    }
  }

  componentDidMount() {}

  componentWillUnmount() {}

  handleOnClick(){
    this.isToggle = !this.isToggle;
    this.accordionStyle = this.isToggle ?  "block" : "none";
  }

  render() {
    return (
      <Accordion
        id={this.props.id}
        className={this.props.className}
        style={this.props.style}
      >
        <Accordion.Toggle
          onClick={this.handleOnClick.bind(this)}
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
              {this.props.isToggle ? (
                <img className="arrow" src={UpArrow} alt="up-arrow" />
               ) : (
                <img className="arrow" src={DownArrow} alt="down-arrow" />
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
            display: this.props.selectedOverlayId === this.props.name ? "block" : this.props.accordionStyle,
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
  selectedOverlayId: state.evio.selectedOverlayId,
});

export default connect(mapStateToProps)(CollapsibleButton);