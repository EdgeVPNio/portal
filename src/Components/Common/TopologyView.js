import React from 'react'
import ReactDOM from 'react-dom'
import RightPanel from './RightPanel'
import Card from 'react-bootstrap/Card'
import Cytoscape from 'react-cytoscapejs'
import CollapsibleButton from './CollapsibleButton'
import Popover from 'react-bootstrap/Popover'
import cytoscapeStyle from './cytoscapeStyle.js'
import { Typeahead } from 'react-bootstrap-typeahead'
import static_ic from '../../Images/Icons/static_ic.svg'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import ondemand_ic from '../../Images/Icons/ondemand_ic.svg'
import connected_ic from '../../Images/Icons/connected_ic.svg'
import no_tunnel_ic from '../../Images/Icons/no_tunnel_ic.svg'
import successor_ic from '../../Images/Icons/successor_ic.svg'
import longdistance_ic from '../../Images/Icons/longdistance_ic.svg'
import not_reporting_ic from '../../Images/Icons/not_reporting_ic.svg'
import GoogleMapReact from 'google-map-react'
import Topology from './Topology'
import { Spinner } from 'react-bootstrap'

class TopologyView extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      initMinZoom: 0.2,
      initMaxZoom: 2,
      setMinZoom: 0.2,
      setMaxZoom: 2,
      graphElement: [],
      dataReady: false,
      refresh: false,
      switchToggle: false,
      infoToggle: true,
      configToggle: true,
      nodeDetails: null,
      linkDetails: null,
      currentSelectedElement: null,
      currentView: null,
      topology: null
    }
    this.autoRefresh = true; //flag to monitor autoRefresh onClick of refresh button
  }

  /**
   * Polling function on GET Topology data - runs untill autoRefresh is disabled
   * @param {String} overlayId 
   * @param {String} intervalId 
   */
  async getTopology(overlayId, intervalId) {
    var url = '/topology?overlayid=' + overlayId + '&interval=' + intervalId;
    //console.log("URL for topology:", url);

    await fetch(url)
      .then(res => {
        //console.log(res);
        return res.json()
      })
      .then(res => {
        if (this.autoRefresh) {
          this.setState({ topology: new Topology(res) });
          this.renderGraph();
          this.prepareSearch();
          intervalId = res[0]._id;
          this.getTopology(overlayId, intervalId);
        }
      })
      .catch(err => {
        console.log("Failed to fetch details due to ", err);
        this.getTopology(overlayId, intervalId)
      })
  }

  componentDidMount() {
    if (this.autoRefresh) {
      this.getTopology(this.props.overlayName);
    } else {
      this.renderGraph();
      this.prepareSearch();
    }
  }

  prepareSearch() {
    var perpareSearchElement = new Promise((resolve, reject) => {
      try {
        var searchElement = this.state.topology.getAlltopology().map((element) => { return JSON.stringify(element) })
        resolve(searchElement)
      } catch (e) {
        reject(e)
      }
    })

    perpareSearchElement.then((searchElement) => {
      ReactDOM.render(<Typeahead
        id='searchOverlay'
        onChange={(selected) => {
          try {
            this.cy.elements().getElementById(JSON.parse(selected).data.id).trigger('click')
            this.cy.elements().getElementById(JSON.parse(selected).data.id).select()
          } catch (e) {
            //console.log(e)
            this.cy.elements().removeClass('transparent')
            ReactDOM.render(<></>, document.getElementById('rightPanelContent'))
          }
        }}
        labelKey={(option) => { return (`${JSON.parse(option).data.label}`) }}
        options={searchElement}
        selected={this.state.selected}
        selectHintOnEnter
        placeholder={'select a node or tunnel'}
        renderMenuItemChildren={(option) => {
          return (
            <div className='searchResult'>
              <div className='resultLabel'>
                <b>{JSON.parse(option).data.label}</b>
              </div>
              <small className='resultLabel'>{`ID : ${JSON.parse(option).data.id}`}</small><br />
            </div>
          )
        }}
      >
      </Typeahead>, document.getElementById('searchBar'))
    });
  }

  renderNodeDetails = () => {
    var sourceNode = this.state.nodeDetails.sourceNode
    var connectedNodes = this.state.nodeDetails.connectedNodes
    if (sourceNode.raw_data === " ") {
      //Not reporting nodes
      var nodeContent = <div>

        <h5>{sourceNode.id.slice(sourceNode.id.length - 6)}</h5>

        <div className="DetailsLabel">Node ID</div>
        <label id="valueLabel">{sourceNode.id}</label>

        <div className="DetailsLabel">State</div>
        <label id="valueLabel">{sourceNode.state}</label>

        <div className="DetailsLabel">Location</div>
        <label id="valueLabel">{"Unknown"}</label>
        <hr style={{ backgroundColor: '#486186' }} />
        <br /><br />

      </div>


      ReactDOM.render(nodeContent, document.getElementById('rightPanelContent'))
      return;
    }

    var coordinate = sourceNode.raw_data['GeoCoordinates'].split(',')
    //GET location from coordinates passed from evio nodes through google API
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate[0]},${coordinate[1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`)
      .then(res => res.json()).then((data) => {
        // //console.log(data)
        try {
          return data.results[data.results.length - 1].formatted_address
        } catch {
          return '-'
        }
      }).then((location) => {
        var nodeContent = <div>

          <h5>{sourceNode.name}</h5>

          <div id="DetailsLabel">Node ID</div>
          <label id="valueLabel">{sourceNode.id}</label>

          <div className="DetailsLabel">State</div>
          <label id="valueLabel">{sourceNode.state}</label>

          <div className="DetailsLabel">Location</div>
          <label id="valueLabel">{location.slice(7, location.length)}</label>
          <hr style={{ backgroundColor: '#486186' }} />
          <br /><br />

          <div id="connectedNode" style={{ overflow: 'auto' }}>
            {connectedNodes.map(connectedNode => {
              try {
                var connectedNodeDetail = this.state.topology.getConnectedNodeDetails(sourceNode.id, connectedNode.data().id)
                var connectedNodeBtn =
                  <CollapsibleButton
                    id={connectedNode.data().id + 'Btn'}
                    className='connectedNodeBtn'
                    key={connectedNode.data().id + 'Btn'}
                    eventKey={connectedNode.data().label}
                    name={connectedNode.data().label}
                  >
                    <div className="DetailsLabel">Node ID</div>
                    <label id="valueLabel">{connectedNode.data().id}</label>
                    <div className="DetailsLabel">Tunnel ID</div>
                    <label id="valueLabel">{connectedNodeDetail.id}</label>
                    <div className="DetailsLabel">Interface Name</div>
                    <label id="valueLabel">{connectedNodeDetail.name}</label>
                    <div className="DetailsLabel">MAC</div>
                    <label id="valueLabel">{connectedNodeDetail.MAC}</label>
                    <div className="DetailsLabel">State</div>
                    <label id="valueLabel">{connectedNodeDetail.state.slice(7, connectedNodeDetail.state.length)}</label>
                    <div className="DetailsLabel">Tunnel Type</div>
                    <label id="valueLabel">{connectedNodeDetail.type.slice(6, connectedNodeDetail.type.length)}</label>

                  </CollapsibleButton>

                return connectedNodeBtn
              } catch (e) {
                //console.log(e)
                return false
              }
            })}
          </div>

        </div>
        ReactDOM.render(nodeContent, document.getElementById('rightPanelContent'))
      })
  }

  renderLinkDetails = () => {
    var linkDetails = this.state.linkDetails.linkDetails
    var sourceNodeDetails = this.state.linkDetails.sourceNodeDetails
    var targetNodeDetails = this.state.linkDetails.targetNodeDetails

    if (sourceNodeDetails.raw_data === " " && targetNodeDetails.raw_data === " ") {
      //both nodes of the edge are not reporting - NR
      var linkContentNR = <div>
        <label id="valueLabel">{"Data not available"}</label>
      </div>
      ReactDOM.render(linkContentNR, document.getElementById('rightPanelContent'))
      return;
    }

    if (sourceNodeDetails.raw_data === " " || targetNodeDetails.raw_data === " ") {
      //if either of nodes is not reporting
      var linkContent = <div>
        <h5>{linkDetails.name}</h5>

        <div className="row">

          <div className="col-10" style={{ paddingRight: '0' }}>

            <CollapsibleButton
              id={sourceNodeDetails.id + 'Btn'}
              className='sourceNodeBtn'
              key={sourceNodeDetails.id + 'Btn'}
              eventKey={sourceNodeDetails.id + 'Btn'}
              name={sourceNodeDetails.name}
              style={{ marginBottom: '2.5%', backgroundColor: '#8aa626', border: `solid #8aa626` }}
            >

              <div className="DetailsLabel">Node ID</div>
              <label id="valueLabel">{sourceNodeDetails.id}</label>

            </CollapsibleButton>

            <CollapsibleButton
              id={targetNodeDetails.id + 'Btn'}
              className='targetNodeBtn'
              key={targetNodeDetails.id + 'Btn'}
              eventKey={targetNodeDetails.id + 'Btn'}
              name={targetNodeDetails.name}
              style={{ marginBottom: '2.5%', backgroundColor: '#8aa626', border: `solid #8aa626` }}
            >

              <div className="DetailsLabel">Node ID</div>
              <label id="valueLabel">{targetNodeDetails.id}</label>

            </CollapsibleButton>

          </div>

          <div className="col" style={{ margin: 'auto', padding: '0', textAlign: 'center' }}>
            <button onClick={this.handleSwitch} id="switchBtn" />
          </div>

        </div>
        <hr style={{ backgroundColor: '#486186' }} />
        <div className="DetailsLabel">Tunnel ID</div>
        <label id="valueLabel">{linkDetails.id}</label>
        <div className="DetailsLabel">Interface Name</div>
        <label id="valueLabel">{linkDetails.name}</label>
        <div className="DetailsLabel">MAC</div>
        <label id="valueLabel">{linkDetails.MAC}</label>
        <div className="DetailsLabel">State</div>
        <label id="valueLabel">{linkDetails.state.slice(7, linkDetails.state.length)}</label>
        <div className="DetailsLabel">Tunnel Type</div>
        <label id="valueLabel">{linkDetails.type.slice(6, linkDetails.type.length)}</label>

      </div >
      ReactDOM.render(linkContent, document.getElementById('rightPanelContent'))
    }

    const srcCoordinate = sourceNodeDetails.raw_data['GeoCoordinates'].split(',')

    const tgtCoordinate = targetNodeDetails.raw_data['GeoCoordinates'].split(',')
    //GET location from coordinates passed for source evio node through google API
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${srcCoordinate[0]},${srcCoordinate[1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`)
      .then(res => res.json()).then(data => {
        try {
          return data.results[data.results.length - 1].formatted_address
        } catch {
          return '-'
        }
      }).then(sourceLocation => {
        //GET location from coordinates passed for target evio node through google API
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${tgtCoordinate[0]},${tgtCoordinate[1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`)
          .then(res => res.json()).then(data => {
            try {
              return data.results[data.results.length - 1].formatted_address
            } catch {
              return '-'
            }
          }).then(targetLocation => {
            var linkContent = <div>
              <h5>{linkDetails.name}</h5>

              <div className="row">

                <div className="col-10" style={{ paddingRight: '0' }}>

                  <CollapsibleButton
                    id={sourceNodeDetails.id + 'Btn'}
                    className='sourceNodeBtn'
                    key={sourceNodeDetails.id + 'Btn'}
                    eventKey={sourceNodeDetails.id + 'Btn'}
                    name={sourceNodeDetails.name}
                    style={{ marginBottom: '2.5%', backgroundColor: '#8aa626', border: `solid #8aa626` }}
                  >

                    <div className="DetailsLabel">Node ID</div>
                    <label id="valueLabel">{sourceNodeDetails.id}</label>

                    <div className="DetailsLabel">State</div>
                    <label id="valueLabel">{sourceNodeDetails.state}</label>

                    <div className="DetailsLabel">Location</div>
                    <label id="valueLabel">{sourceLocation.slice(7, sourceLocation.length)}</label>

                  </CollapsibleButton>

                  <CollapsibleButton
                    id={targetNodeDetails.id + 'Btn'}
                    className='targetNodeBtn'
                    key={targetNodeDetails.id + 'Btn'}
                    eventKey={targetNodeDetails.id + 'Btn'}
                    name={targetNodeDetails.name}
                    style={{ marginBottom: '2.5%', backgroundColor: '#8aa626', border: `solid #8aa626` }}
                  >

                    <div className="DetailsLabel">Node ID</div>
                    <label id="valueLabel">{targetNodeDetails.id}</label>

                    <div className="DetailsLabel">State</div>
                    <label id="valueLabel">{targetNodeDetails.state}</label>

                    <div className="DetailsLabel">Location</div>
                    <label id="valueLabel">{targetLocation.slice(7, targetLocation.length)}</label>

                  </CollapsibleButton>

                </div>

                <div className="col" style={{ margin: 'auto', padding: '0', textAlign: 'center' }}>
                  <button onClick={this.handleSwitch} id="switchBtn" />
                </div>

              </div>
              <hr style={{ backgroundColor: '#486186' }} />
              <div className="DetailsLabel">Tunnel ID</div>
              <label id="valueLabel">{linkDetails.id}</label>
              <div className="DetailsLabel">Interface Name</div>
              <label id="valueLabel">{linkDetails.name}</label>
              <div className="DetailsLabel">MAC</div>
              <label id="valueLabel">{linkDetails.MAC}</label>
              <div className="DetailsLabel">State</div>
              <label id="valueLabel">{linkDetails.state.slice(7, linkDetails.state.length)}</label>
              <div className="DetailsLabel">Tunnel Type</div>
              <label id="valueLabel">{linkDetails.type.slice(6, linkDetails.type.length)}</label>

            </div >
            ReactDOM.render(linkContent, document.getElementById('rightPanelContent'))
          })
      })
  }

  handleSwitch = () => {
    var that = this
    var promise = new Promise(function (resolve, reject) {
      try {
        that.setState(prevState => {
          return { switchToggle: !prevState.switchToggle }
        })

        resolve(true)
      } catch (e) {
        reject(e)
      }
    })

    promise.then(function () {
      that.swap()
    }).catch(function (e) {

    })
  }

  swap = () => {
    var that = this
    var linkDetails
    var promise = new Promise(function (resolve, reject) {
      try {
        if (that.state.switchToggle) {
          linkDetails = that.state.topology.getLinkDetails(that.state.currentSelectedElement.data().target, that.state.currentSelectedElement.data().id)
        } else {
          linkDetails = that.state.topology.getLinkDetails(that.state.currentSelectedElement.data().source, that.state.currentSelectedElement.data().id)
        }
        resolve(linkDetails)
      } catch {
        reject(false)
      }
    })

    promise.then(function (linkDetails) {
      that.setState(prevState => {
        return { linkDetails: { linkDetails: linkDetails, sourceNodeDetails: prevState.linkDetails.targetNodeDetails, targetNodeDetails: prevState.linkDetails.sourceNodeDetails } }
      })
    }).then(function () {
      that.renderLinkDetails()
    }).catch(function (e) {

    })
  }

  setNodeDetails = (node) => {
    var that = this
    var promise = new Promise(function (resolve, reject) {
      try {

        var sourceNode = that.state.topology.getNodeDetails(node.data().id)

        var connectedNodes = that.cy.elements(node.incomers().union(node.outgoers())).filter((element) => {
          return element.isNode()
        })

        that.setState({ nodeDetails: { sourceNode: sourceNode, connectedNodes: connectedNodes } })

        resolve(true)
      } catch {
        reject(false)
      }
    })

    promise.then(function () {
      that.renderNodeDetails()
    }).catch(function () {

    })
  }

  setLinkDetails = (link) => {
    var that = this
    var promise = new Promise(function (resolve, reject) {
      try {
        var linkDetails = that.state.topology.getLinkDetails(link.data().source, link.data().id)

        var sourceNode = link.data().source

        var targetNode = link.data().target

        var sourceNodeDetails = that.state.topology.getNodeDetails(link.data().source)

        var targetNodeDetails = that.state.topology.getNodeDetails(link.data().target)

        that.setState({ linkDetails: { linkDetails: linkDetails, sourceNode: sourceNode, targetNode: targetNode, sourceNodeDetails: sourceNodeDetails, targetNodeDetails: targetNodeDetails } })

        resolve(true)
      } catch {
        reject(false)
      }
    })

    promise.then(function () {
      that.renderLinkDetails()
    }).catch(function () {

    })
  }

  renderGraph = () => {
    if (this.state.topology === null) {
      return <Spinner id='loading' animation='border' variant='info' />
    } else {
      this.setState({ currentView: 'Topology' })
      ReactDOM.render(<Cytoscape id="cy"
        cy={(cy) => {
          this.cy = cy

          this.setState({ cytoscape: cy })

          this.cy.maxZoom(this.state.initMaxZoom)
          this.cy.minZoom(this.state.initMinZoom)
          this.cy.zoom(0.8)
          this.cy.center()

          var that = this

          if (this.state.currentSelectedElement !== null) {
            if (this.state.currentSelectedElement.isNode()) {
              var selectedElement = this.cy.elements().filter(node => node.data().id === this.state.currentSelectedElement.data().id).filter(element => { return element.isNode() })
              var relatedElement = selectedElement.outgoers().union(selectedElement.incomers()).union(selectedElement)
              var notRelatedElement = this.cy.elements().difference(selectedElement.outgoers().union(selectedElement.incomers())).not(selectedElement)
              selectedElement.select()
              relatedElement.removeClass('transparent')
              notRelatedElement.addClass('transparent')
            } else if (this.state.currentSelectedElement.isEdge()) {
              var relatedElement2 = this.state.currentSelectedElement.connectedNodes().union(this.state.currentSelectedElement)
              var notRelatedElement2 = this.cy.elements().difference(this.state.currentSelectedElement.connectedNodes()).not(this.state.currentSelectedElement)
              this.state.currentSelectedElement.select()
              relatedElement2.removeClass('transparent')
              notRelatedElement2.addClass('transparent')
            }
          }

          this.cy.on('click', function (e) {
            var selectedElement = e.target[0]
            var relatedElement
            var notRelatedElement
            try {
              if (document.getElementById('rightPanel').hidden === true) {
                document.getElementById('overlayRightPanelBtn').click()
              }
              if (selectedElement.isNode()) {
                that.setNodeDetails(selectedElement)
                relatedElement = selectedElement.outgoers().union(selectedElement.incomers()).union(selectedElement)
                notRelatedElement = that.cy.elements().difference(selectedElement.outgoers().union(selectedElement.incomers())).not(selectedElement)
              } else if (selectedElement.isEdge()) {
                that.setLinkDetails(selectedElement)
                relatedElement = selectedElement.connectedNodes().union(selectedElement)
                notRelatedElement = that.cy.elements().difference(selectedElement.connectedNodes()).not(selectedElement)
              }

              if (document.getElementById('viewSelector').value !== 'Subgraph') {
                relatedElement.removeClass('transparent')
                notRelatedElement.addClass('transparent')
              }
            } catch {
              if (e.target[0] === this.cy) {
                ReactDOM.render(<></>, document.getElementById('rightPanelContent'))
                that.cy.elements().removeClass('transparent')
              }
            } finally {
              if (e.target[0] !== this.cy) {
                that.setState({ switchToggle: false, currentSelectedElement: e.target })
              } else {
                that.setState({ switchToggle: true, currentSelectedElement: null })
              }
            }
          })
        }}
        wheelSensitivity={0.1}

        elements={this.state.topology.getAlltopology()}

        stylesheet={cytoscapeStyle}

        style={{ width: window.innerWidth, height: window.innerHeight }}

        layout={{ name: 'circle', clockwise: true }}


      />, document.getElementById('midArea'))

      ReactDOM.render(<select defaultValue="Topology" onChange={this.handleViewSelector} id="viewSelector" className="custom-select">
        <option value="Topology">Topology</option>
        <option value="Subgraph">Subgraph</option>
        <option value="Map">Map</option>
        <option value="Log">Log</option>
        <option value="NetworkFlow">NetworkFlow</option>
        <option value="TunnelUtilization">TunnelUtilization</option>
      </select>, document.getElementById('viewBar'))
    }
  }

  elementFilter = (element, props) => {
    if (element.group === 'nodes') {
      return (element.data().label.toLowerCase().indexOf(props.text.toLowerCase()) !== -1 ||
        element.data().id.toLowerCase().indexOf(props.text.toLowerCase()) !== -1)
    } else {
      return (element.data().label.toLowerCase().indexOf(props.text.toLowerCase()) !== -1 ||
        element.data().id.toLowerCase().indexOf(props.text.toLowerCase()) !== -1)
    }
  }

  handleRefresh = () => {
    if (!this.autoRefresh) {
      // Setting auto refresh on
      document.getElementById('refreshBtn').style.opacity = '1';
      this.autoRefresh = true;
    } else {
      // Setting auto refresh off
      document.getElementById('refreshBtn').style.opacity = '0.4';
      this.autoRefresh = false;
    }
    console.log("Handled refresh, called update with refresh set to", this.autoRefresh);
    this.getTopology(this.props.overlayName);
  }

  zoomIn = () => {
    var currentZoom = this.cy.zoom()
    this.cy.zoom(currentZoom + 0.1)
    document.getElementById('zoomSlider').value = (this.cy.zoom())
  }

  zoomOut = () => {
    var currentZoom = this.cy.zoom()
    this.cy.zoom(currentZoom - 0.1)
    document.getElementById('zoomSlider').value = (this.cy.zoom())
  }

  handleZoomSlider = (e) => {
    this.cy.zoom(parseFloat(e.target.value))
  }

  handleWheel = (e) => {
    document.getElementById('zoomSlider').value = (this.cy.zoom())
  }

  handleSetMinZoom = (e) => {
    try {
      this.cy.minZoom(parseFloat(e.target.value))
      document.getElementById('zoomSlider').min = parseFloat(e.target.value)
    } finally {
      if (this.cy.zoom() < parseFloat(e.target.value)) {
        this.cy.zoom(parseFloat(e.target.value))
      }
      this.setState({ setMinZoom: e.target.value })
    }
  }

  handleSetMaxZoom = (e) => {
    try {
      this.cy.maxZoom(parseFloat(e.target.value))
      document.getElementById('zoomSlider').max = parseFloat(e.target.value)
    } finally {
      if (this.cy.zoom() > parseFloat(e.target.value)) {
        this.cy.zoom(parseFloat(e.target.value))
      }
      this.setState({ setMinZoom: e.target.value })
    }
  }

  handleBackToHome = () => {
    window.location.reload(true)
  }

  renderSubgraph = () => {
    var selectedElement = this.state.currentSelectedElement
    var notRelatedElement
    if (this.state.currentView !== 'Map') {

      try {
        if (selectedElement.isNode()) {
          notRelatedElement = this.cy.elements().difference(selectedElement.outgoers().union(selectedElement.incomers())).not(selectedElement)
        } else if (selectedElement.isEdge()) {
          notRelatedElement = this.cy.elements().difference(selectedElement.connectedNodes()).not(selectedElement)
        }
        notRelatedElement.addClass('subgraph')
        this.setState({ currentView: 'Subgraph' })
      } catch {
        alert('Please select node or tunnel.')
        document.getElementById('viewSelector').value = this.state.currentView
      }
    } else {
      alert('Map is not available for this view.')
      document.getElementById('viewSelector').value = this.state.currentView
    }
  }

  renderTopology = () => {
    document.getElementById('elementBreadcrumb').hidden = false
    document.getElementById('overlayBreadcrumb').hidden = false
    document.getElementById('homeBtn').hidden = false
    document.getElementById('refreshBtn').hidden = false
    document.getElementById('configBtn').hidden = false
    document.getElementById('infoBtn').hidden = false
    document.getElementById('plusBtn').hidden = false
    document.getElementById('minusBtn').hidden = false
    document.getElementById('zoomSlider').hidden = false
    if (this.state.currentView === 'Subgraph') {
      this.cy.elements().removeClass('subgraph')
    } else if (this.state.currentView === 'Map') {
      this.renderGraph()
    }
  }

  handleMakerClicked = (node) => {
    if (this.state.currentSelectedElement.isNode()) {
      node.trigger('click')
      document.getElementById(node.data().id + 'Marker').classList.add('selected')
      this.setState({ switchToggle: false, currentSelectedElement: node })
    }
  }

  midpoint = (lat1, lng1, lat2, lng2) => {
    lat1 = this.deg2rad(lat1)
    lng1 = this.deg2rad(lng1)
    lat2 = this.deg2rad(lat2)
    lng2 = this.deg2rad(lng2)

    var dlng = lng2 - lng1
    var Bx = Math.cos(lat2) * Math.cos(dlng)
    var By = Math.cos(lat2) * Math.sin(dlng)
    var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2),
      Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By))
    var lng3 = lng1 + Math.atan2(By, (Math.cos(lat1) + Bx))

    return [(lat3 * 180) / Math.PI, (lng3 * 180) / Math.PI]
  }

  deg2rad = (degrees) => {
    return degrees * Math.PI / 180
  };

  hasCoordinate = (node) => {
    if (node.data('coordinate').split(',')[1]) {
      return true;
    }
    return false;
  }

  renderMap = () => {
    var that = this
    if (this.state.currentSelectedElement !== null) {
      if (this.state.currentSelectedElement.isEdge()) {
        var createMapFromEdge = new Promise((resolve, reject) => {
          try {
            var selectedElement = this.state.currentSelectedElement
            var relatedElement = selectedElement.connectedNodes().filter((element) => {
              return that.hasCoordinate(element)
            })
            var unmappedElement = selectedElement.connectedNodes().filter((element) => {
              return that.hasCoordinate(element) === false
            })
            var centerPoint, map
            if (relatedElement.length !== 0) {
              centerPoint = this.midpoint(parseFloat(relatedElement[0].data().coordinate.split(',')[0]), parseFloat(relatedElement[0].data().coordinate.split(',')[1]), parseFloat(relatedElement[1].data().coordinate.split(',')[0]), parseFloat(relatedElement[1].data().coordinate.split(',')[1]))

              map = <GoogleMapReact
                bootstrapURLKeys={{
                  key: 'AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs',
                  language: 'en'
                }}
                center={{ lat: centerPoint[0], lng: centerPoint[1] }}
                defaultZoom={10}
              >

                {relatedElement.map(node => {

                  return <button onClick={this.handleMakerClicked.bind(this, node)} key={node.data().id + 'Marker'} id={node.data().id + 'Marker'} className="nodeMarker selected" lat={parseFloat(node.data().coordinate.split(',')[0])} lng={parseFloat(node.data().coordinate.split(',')[1])}>
                    <label className="markerLabel">
                      {node.data().label}
                    </label>
                  </button>
                })}

              </GoogleMapReact>

            } else {
              centerPoint = [parseFloat('15.8700'), parseFloat('100.9925')]
              map = <GoogleMapReact
                bootstrapURLKeys={{
                  key: 'AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs',
                  language: 'en'
                }}
                center={{ lat: centerPoint[0], lng: centerPoint[1] }}
                defaultZoom={10}
              >
                <Card id="non-coordinate-card">
                  <Card.Header>
                    Unmapped nodes.
                </Card.Header>
                  <Card.Body>
                    {unmappedElement.map(node => {
                      return <button onClick={this.handleMakerClicked.bind(this, node)} key={node.data().id + 'Marker'} id={node.data().id + 'Marker'} className="nodeMarker">
                        <label className="markerLabel">
                          {node.data().label}
                        </label>
                      </button>
                    })}
                  </Card.Body>
                </Card>
              </GoogleMapReact>

            }
            this.setState({ currentView: 'Map' })
            ReactDOM.render(map, document.getElementById('midArea'))
            resolve(true)
          } catch (e) {
            console.log(e)
            reject(false)
          }
        })

        createMapFromEdge.then(function () {
          if (that.state.currentSelectedElement !== null) {
            //console.log(document.getElementById(that.state.currentSelectedElement.data().id + 'Marker'))

            // document.getElementById(that.state.currentSelectedElement.data().source + "Marker").classList.add("selected");
            // document.getElementById(that.state.currentSelectedElement.data().target + "Marker").classList.add("selected");
          }
        })
      } else if (this.state.currentSelectedElement.isNode()) {
        var createMapFromNode = new Promise((resolve, reject) => {
          try {
            var selectedElement = this.state.currentSelectedElement
            var relatedElement = selectedElement.outgoers().union(selectedElement.incomers()).union(selectedElement).filter((element => {
              return element.isNode() && this.hasCoordinate(element)
            }))
            // //console.log(selectedElement.data().coordinate.split(',')[0])
            // //console.log(relatedElement)
            var map
            if (relatedElement.length !== 0) {

              map = <GoogleMapReact
                bootstrapURLKeys={{
                  key: 'AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs',
                  language: 'en'
                }}
                center={{ lat: parseFloat(selectedElement.data().coordinate.split(',')[0]), lng: parseFloat(selectedElement.data().coordinate.split(',')[1]) }}
                defaultZoom={10}
              >

                {relatedElement.map(node => {
                  return <button onClick={this.handleMakerClicked.bind(this, node)} key={node.data().id + 'Marker'} id={node.data().id + 'Marker'} className="nodeMarker" lat={parseFloat(node.data().coordinate.split(',')[0])} lng={parseFloat(node.data().coordinate.split(',')[1])}>
                    <label className="markerLabel">
                      {node.data().label}
                    </label>
                  </button>
                })}

              </GoogleMapReact>
            } else {
              map = <GoogleMapReact
                bootstrapURLKeys={{
                  key: 'AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs',
                  language: 'en'
                }}
                center={{ lat: parseFloat('15.8700'), lng: parseFloat('100.9925') }}
                defaultZoom={10}
              >
              </GoogleMapReact>
            }
            ReactDOM.render(map, document.getElementById('midArea'))
            this.setState({ currentView: 'Map' })
            resolve(true)
          } catch (e) {
            // alert("You have to select a node.")
            // document.getElementById("viewSelector").value = this.state.currentView;
            // console.log(e)
            reject(false)
          }
        })

        createMapFromNode.then(function () {
          if (that.state.currentSelectedElement !== null) {
            //console.log(document.getElementById(that.state.currentSelectedElement.data().id + 'Marker'))
            if (document.getElementById(that.state.currentSelectedElement.data().id + 'Marker') !== null) {
              document.getElementById(that.state.currentSelectedElement.data().id + 'Marker').classList.add('selected')
            }
          }
        })
      }
    } else {
      alert('Please select some node or tunnel.')
      document.getElementById('viewSelector').value = this.state.currentView
    }
  }

  componentDidUpdate() {
    
  }

  handleViewSelector = (e) => {
    switch (e.target.value) {
      case 'Subgraph': this.renderSubgraph(); break
      case 'Topology': this.renderTopology(); break
      case 'Map': this.renderMap(); break

      default: ;
    }
  }



  render() {
    return <>
      <div id="leftTools">
        <button id="elementBreadcrumb" className="leftToolsBtn">
          <div className="breadcrumbLabel">
            {this.state.currentSelectedElement !== null ? this.state.currentSelectedElement.isNode() ? 'Node : ' + this.state.currentSelectedElement.data().label : 'Tunnel : ' + this.state.currentSelectedElement.data().label : 'None.'}
          </div>
        </button>

        <button id="overlayBreadcrumb" className="leftToolsBtn">
          <div className="breadcrumbLabel">
            Overlay : {this.props.overlayName}
          </div>
        </button>

        <div>
          <button onClick={this.handleBackToHome} id="homeBtn" className="leftToolsBtn"></button>
        </div>
        <div>
          <button onClick={this.handleRefresh} id="refreshBtn" className="leftToolsBtn" title="Disable/Enable Auto Refresh"></button>
        </div>
        <div>
          <OverlayTrigger rootClose={true} trigger="click" placement="right" overlay={
            <Popover>
              <Popover.Title as="h3">EVIO Network Visualizer : Legend</Popover.Title>
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
                      <td style={{ width: '5%', margin: 'auto' }}><img className="node_img" src={connected_ic} alt="connected_node" /></td>
                      <td>Connected</td>
                      <td style={{ width: '15%' }}><img className="tunnel_img" src={longdistance_ic} alt="longdistance_tunnel" /></td>
                      <td>Long Distance</td>
                    </tr>
                    <tr>
                      <td style={{ width: '5%' }}><img className="node_img" src={not_reporting_ic} alt="not_reporting_node" /></td>
                      <td>Not Reporting</td>
                      <td style={{ width: '15%' }}><img className="tunnel_img" src={ondemand_ic} alt="ondemand_tunnel" /></td>
                      <td>On Demand</td>
                    </tr>
                    <tr>
                      <td style={{ width: '5%' }}><img className="node_img" src={no_tunnel_ic} alt="no_tunnel_node" /></td>
                      <td>No Tunnels</td>
                      <td style={{ width: '15%' }}><img className="tunnel_img" src={static_ic} alt="static_tunnel" /></td>
                      <td>Static</td>
                    </tr>
                    <tr>
                      <td ></td>
                      <td></td>
                      <td style={{ width: '15%' }}><img className="tunnel_img" src={successor_ic} alt="successor_tnnel" /></td>
                      <td>Successor</td>
                    </tr>
                  </tbody>
                </table>
                {/* </Card> */}
              </Popover.Content>
            </Popover>}>
            <button onClick={this.handleInfoToggle} id="infoBtn" className="leftToolsBtn"></button>
          </OverlayTrigger>
        </div>
        <div>
          <OverlayTrigger rootClose={true} trigger="click" placement="right" overlay={
            <Popover>
              <Popover.Title as="h3">EVIO Network Visualizer : Configure</Popover.Title>
              <Popover.Content id="configContent">
                <div className="row">
                  <div className="col">
                    <label>Minimum zoom</label>
                  </div>
                  <div className="col">
                    <select defaultValue={this.state.setMinZoom} onChange={this.handleSetMinZoom} id="minZoomSelector" value={this.state.minZoom}>
                      <option id="0.2">0.2</option>
                      <option id="1">1</option>
                      <option id="2">2</option>
                      <option id="3">3</option>
                      <option id="5">5</option>
                      <option id="10">10</option>
                    </select>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <label>Maximum zoom</label>
                  </div>
                  <div className="col">
                    <select defaultValue={this.state.setMaxZoom} onChange={this.handleSetMaxZoom} id="maxZoomSelector" value={this.state.maxZoom}>
                      <option>2</option>
                      <option>5</option>
                      <option>10</option>
                      <option>15</option>
                      <option>20</option>
                    </select>
                  </div>
                </div>
              </Popover.Content>
            </Popover>}>
            <button onClick={this.handleConfigToggle} id="configBtn" className="leftToolsBtn"></button>
          </OverlayTrigger>
        </div>
        <div>
          <button onClick={this.zoomIn} id="plusBtn" className="leftToolsBtn"></button>
        </div>
        <div>
          <input id="zoomSlider" onChange={this.handleZoomSlider} type="range" min={this.state.initMinZoom}
            max={this.state.initMaxZoom} step={0.1} defaultValue={0.8}></input>
        </div>
        <div>
          <button onClick={this.zoomOut} id="minusBtn" className="leftToolsBtn"></button>
        </div>
      </div>

      <section onWheel={this.handleWheel} style={{ width: '100vw', height: '100vh' }}>
        <div id="midArea">

        </div>
      </section>

      <RightPanel rightPanelTopic="Details"></RightPanel>

    </>
  }
}

export default TopologyView


