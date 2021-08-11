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