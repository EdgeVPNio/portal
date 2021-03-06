import React from 'react'
import 'react-tippy/dist/tippy.css'
import { Spinner } from 'react-bootstrap'
import { Tooltip } from 'react-tippy'
import TopologyView from './TopologyView'
import 'bootstrap/dist/css/bootstrap.min.css'
import CollapsibleButton from './CollapsibleButton'
import { Typeahead } from 'react-bootstrap-typeahead'
import '../../CSS/Main.css'
import Overlays from './Overlays.js'
import "../../CSS/Main.css";
import SideBar from "./Sidebar";

class OverlaysView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      overlays: null,
      selectedOverlay: null,
      currentMenu: 'slide'
    }
    this.doOverlayUpdate = true; //flag to monitor GET Overlays polling
    this.selectOverlayFlag = false; //flag to switch views (OverlaysView <-> TopologyView)
  }

  /**
   * Polling function on GET Overlays data - runs untill doOverlayUpdate is disabled
   * @param {String} intervalId 
   */
  async getOverlaysData(intervalId) {

    var url = '/overlays?interval=' + intervalId
    //console.log(url);

    await fetch(url).then(res => {
      //console.log(res)
      return res.json()
    })
      .then(res => {
        //Got response, display the data
        //console.log("got response");
        this.setState({ overlays: new Overlays(res) });
        intervalId = res[0]._id;
        if (this.doOverlayUpdate) {
          //flag disabled when switched to TopologyView
          this.getOverlaysData(intervalId);
        }
      }).catch(err => {
        console.log('error has been occured on fetch overlay process.' + err);
      })
  }

  componentDidMount() {
    if (this.doOverlayUpdate) {
      this.getOverlaysData();
    }
  }

  renderMainContent = () => {
    if (this.state.overlays !== null) {
      if (this.state.selectedOverlay !== null) {
        if (this.selectOverlayFlag) {
          return this.renderGraphContent()
        }
      } else {
        return this.renderOverlaysContent()
      }
    } else {
      return <Spinner id='loading' animation='border' variant='info' />
    }
  }

  renderGraphContent = () => {
    return <TopologyView overlayName={this.state.selectedOverlay} />
  }

  renderOverlaysContent = () => {
    const overlays = this.state.overlays.getOverlayName().map((overlay) => {
      return <Tooltip className='overlayTooltips' key={overlay} duration='500' animation='scale' interactive position='bottom' arrow={true} open={true}
        html={(<div>{overlay}</div>)}>
        <button onClick={this.selectOverlay.bind(this, overlay)} id={overlay} className='overlay' />
      </Tooltip>
    })
    
    return <>
      <div id="overlayList">{overlays}</div>
	<div id ="App">
	<SideBar outerContainerId={"App"} sideBarContent=<div><div> Overlays ({this.state.overlays.getOverlayList().length}) </div> <div> {this.renderSidebarPanel()} </div></div> >
		<Typeahead
          id="searchOverlay"
          onChange={(selected) => {
            try {
              this.selectOverlay(selected[0])
            } catch {
              console.log('Error has been occured on select search result.')
            }
          }}
          options={this.state.overlays !== null ? this.state.overlays.getOverlayName() : []}
          selected={this.state.selected}
          selectHintOnEnter
          placeholder="Search overlay"
          renderMenuItemChildren={(option) => {
            return (
              <div className="searchResult">
                <div className="resultLabel">
                  {option}
                </div>
                <small className='resultLabel'>{`Number of nodes :  ${this.state.overlays.getNumberOfNodes(option)} Number of links : ${this.state.overlays.getNumberOfLinks(option)}`}</small><br />
              </div>
            )
          }}
        >
        </Typeahead>
        </SideBar>
	</div>
    </>
  }

  renderSidebarPanel = () => {
    return this.renderOverlayBtn()
  }

  renderOverlayBtn = () => {
    const overlayBtn = this.state.overlays.getOverlayName().map((overlay) => {
      return <CollapsibleButton onClick="s" key={overlay + 'Btn'} id={overlay + 'Btn'} name={overlay} className='overlayBtn'>
        <div>Number of nodes : {this.state.overlays.getNumberOfNodes(overlay)}<br />Number of links : {this.state.overlays.getNumberOfLinks(overlay)}</div>
      </CollapsibleButton>
    })
    return overlayBtn
  }


  selectOverlay = (overlayId) => {
    this.setState({ selectedOverlay: overlayId })
    this.doOverlayUpdate = false;
    this.selectOverlayFlag = true;
  }


  render() {
    return (<div id="container" className="container-fluid" style={{ padding: '0' }} >
      <div id="mainContent" className="row" style={{ backgroundColor: '#101B2B', color: 'white', margin: 'auto' }}>
        {this.renderMainContent()}
      </div>

 </div>)
  }
}

export default OverlaysView
