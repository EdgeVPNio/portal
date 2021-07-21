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
            {this.props.children}
          </div>
        ) : null}
      </div>
      </>
    );
  }
}
export default CustomCollapsibleButton;
