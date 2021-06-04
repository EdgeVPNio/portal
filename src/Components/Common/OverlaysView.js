import React from 'react'
import ReactDOM from 'react-dom'
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
import { useDispatch, useSelector, connect } from 'react-redux';
import { setOverlayId } from '../../redux/overlaySlice'
import { setView } from '../../redux/viewSlice';

class OverlaysView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      overlays: null,
      currentMenu: 'slide'
    }
    this.doOverlayUpdate = true; //flag to monitor GET Overlays polling
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

  renderOverlaysContent = () => {
    const overlays = this.state.overlays.getOverlayName().map((overlay) => {
      return <Tooltip className='overlayTooltips' key={overlay} duration='500' animation='scale' interactive position='bottom' arrow={true} open={true}
        html={(<div>{overlay}</div>)}>
        <button onClick={this.selectOverlay.bind(this, overlay)} id={overlay} className='overlay' />
      </Tooltip>
    })
    ReactDOM.render(<>
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
    </>, document.getElementById('searchBar'));
    ReactDOM.render(<>
      <div>
        <div> Overlays ({this.state.overlays.getOverlayList().length}) </div>
        <div> {this.renderSidebarPanel()} </div>
      </div>
    </>, document.getElementById('sideBarContent'));
    return <>
      <div id="overlayList">{overlays}</div>
    </>
  }

  renderSidebarPanel = () => {
    const overlayBtn = this.state.overlays.getOverlayName().map((overlay) => {
      return <CollapsibleButton onClick="s" key={overlay + 'Btn'} id={overlay + 'Btn'} name={overlay} className='overlayBtn'>
        <div>Number of nodes : {this.state.overlays.getNumberOfNodes(overlay)}<br />Number of links : {this.state.overlays.getNumberOfLinks(overlay)}</div>
      </CollapsibleButton>
    })
    return overlayBtn
  }

  selectOverlay = (overlayId) => {
    this.props.setOverlayId(overlayId);
    this.props.setView('TopologyView');
    this.doOverlayUpdate = false;
  }

  render() {
    if (this.state.overlays !== null) {
      return this.renderOverlaysContent()
    }
    return <Spinner id='loading' animation='border' variant='info' />
  }
}

const mapStateToProps = state => ({
  currentOverlayId: state.overlayId.current,
});

const mapDispatchToProps = {
  setView,
  setOverlayId
};

export default connect(mapStateToProps, mapDispatchToProps)(OverlaysView);
