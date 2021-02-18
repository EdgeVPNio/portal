import React from 'react'
import Card from 'react-bootstrap/Card'
import 'bootstrap/dist/css/bootstrap.min.css'
import Accordion from 'react-bootstrap/Accordion'
import Button from 'react-bootstrap/Button'
import DowmArrow from '../../Images/Icons/down-arrow-ic.svg'
import UpArrow from '../../Images/Icons/up-arrow-ic.svg'
class CollapsibleButton extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      isToggle: false
    }
  }

  handleOnClick = () => {
    this.setState(prevState => {
      return { isToggle: !prevState.isToggle }
    })
  }

  render() {
    return (<Accordion id={this.props.id} className={this.props.className} style={this.props.style}>
      <Accordion.Toggle onClick={this.handleOnClick} as={Button} style={{ color: 'white', background: 'transparent', border: 'transparent', outline: 'none' }} eventKey={this.props.name}>
        <div className="row">
          <div className="col">
            {this.props.name}
          </div>
          <div className="col" style={{ textAlign: "right" }}>
            {this.state.isToggle?<img className="arrow" src={UpArrow} alt="up-arrow" />:<img className="arrow" src={DowmArrow} alt="down-arrow" />}
          </div>
        </div>
      </Accordion.Toggle>
      <Accordion.Collapse as={Card.Body} eventKey={this.props.name} style={{ backgroundColor: '#213758', padding: '1%' }}>
        <div className="collapseContent">{this.props.children}</div>
      </Accordion.Collapse>
    </Accordion>)
  }
}

export default CollapsibleButton
