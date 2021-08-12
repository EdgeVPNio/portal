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
import DownArrow from "../images/icons/down-arrow-ic.svg";
import UpArrow from "../images/icons/up-arrow-ic.svg";

class CustomCollapsibleButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
    if(this.props.hasOwnProperty("expanded")){
        this.state.open = this.props.expanded;
    }
    this.togglePanel = this.togglePanel.bind(this);
  }
  componentDidUpdate() {}

  componentDidMount() {}

  componentWillUnmount() {}

  togglePanel(e) {
    this.setState({ open: !this.state.open });
  }
  render() {
    return (
      <>
      <br/>
      <div className="collapse-wrapper">
        <div onClick={(e) => this.togglePanel(e)} className="collapse-header">
          <div className="row">
            <div className="col">{this.props.title}</div>
            <div className="col" style={{ textAlign: "right" }}>
              {this.state.open ? (
                <img className="arrow" src={UpArrow} alt="up-arrow" />
              ) : (
                <img className="arrow" src={DownArrow} alt="down-arrow" />
              )}
            </div>
          </div>
        </div>
        {this.state.open ? (
          <div className="collapse-content">
            {this.props.description}
            <div> Connected Nodes ({this.props.length})</div>

            {this.props.children}
          </div>
        ) : null}
      </div>
      </>
    );
  }
}
export default CustomCollapsibleButton;
