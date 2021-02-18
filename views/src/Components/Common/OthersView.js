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

class OthersView extends React.Component {
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
      // cytoscape: null,
      switchToggle: false,
      infoToggle: true,
      configToggle: true,
      nodeDetails: null,
      linkDetails: null,
      currentSelectedElement: null,
      currentView: null
    }
  }

  componentDidMount() {
    // document.getElementById('rightPanelBtn').click()
    this.renderGraph()
    //console.log(this.props.topology)

    var perpareSearchElement = new Promise((resolve, reject) => {
      try {
        var searchElement = this.props.topology.getAlltopology().map((element) => { return JSON.stringify(element) })
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
        // renderToken={(option) => { return JSON.parse(option).data.label }}
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
    })
  }

  renderNodeDetails = () => {

    var sourceNode = this.state.nodeDetails.sourceNode
    var connectedNodes = this.state.nodeDetails.connectedNodes
    var coordinate = sourceNode.raw_data[sourceNode.id].geo_coordinate.split(',')

    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinate[0]},${coordinate[1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`)
      .then(res => res.json()).then((data) => {
        // //console.log(data)
        try {
          return data.results[data.results.length - 1].formatted_address
        } catch{
          return '-'
        }
      }).then((location) => {
        var nodeContent = <div>

          <h5>{sourceNode.name}</h5>

          <div className="DetailsLabel">Node ID</div>
          {sourceNode.id}

          <div className="DetailsLabel">State</div>
          {sourceNode.state}

          <div className="DetailsLabel">City/State/Country</div>
          {location}
          <hr style={{ backgroundColor: '#486186' }} />
          <br /><br />

          <div id="connectedNode" style={{ overflow: 'auto' }}>
            {connectedNodes.map(connectedNode => {
              try {
                var connectedNodeDetail = this.props.topology.getConnectedNodeDetails(sourceNode.id, connectedNode.data().id)
                var connectedNodeBtn =
                  <CollapsibleButton
                    id={connectedNode.data().id + 'Btn'}
                    className='connectedNodeBtn'
                    key={connectedNode.data().id + 'Btn'}
                    eventKey={connectedNode.data().label}
                    name={connectedNode.data().label}
                  >
                    <div className="DetailsLabel">Node ID</div>
                    {connectedNode.data().id}
                    <div className="DetailsLabel">Tunnel ID</div>
                    {connectedNodeDetail.id}
                    <div className="DetailsLabel">Interface Name</div>
                    {connectedNodeDetail.name}
                    <div className="DetailsLabel">MAC</div>
                    {connectedNodeDetail.MAC}
                    <div className="DetailsLabel">State</div>
                    {connectedNodeDetail.state}
                    <div className="DetailsLabel">Tunnel Type</div>
                    {connectedNodeDetail.type}
                    {/* <div className="DetailsLabel">ICE Connection Type</div>
                    {connectedNodeDetail.ICEConnectionType} */}
                    <div className="DetailsLabel">ICE Role</div>
                    {connectedNodeDetail.stats.IceProperties.role}
                    <div className="DetailsLabel">Remote Address</div>
                    {connectedNodeDetail.remoteAddress}
                    <div className="DetailsLabel">Local Address</div>
                    {connectedNodeDetail.localAddress}
                    <div className="DetailsLabel">Latency</div>
                    {connectedNodeDetail.stats.IceProperties.latency}
                    <Card.Body className="transmissionCard" >
                      Sent
                      <div className="DetailsLabel">Byte Sent</div>
                      {connectedNodeDetail.stats.byte_sent}
                      <div className="DetailsLabel">Total Byte Sent</div>
                      {connectedNodeDetail.stats.total_byte_sent}
                    </Card.Body>

                    <Card.Body className="transmissionCard">
                      Received
                      <div className="DetailsLabel">Byte Received</div>
                      {connectedNodeDetail.stats.byte_receive}
                      <div className="DetailsLabel">Total Byte Received</div>
                      {connectedNodeDetail.stats.total_byte_receive}
                    </Card.Body>

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

    //console.log(linkDetails);
    //console.log(sourceNodeDetails);
    //console.log(targetNodeDetails);

    const srcCoordinate = sourceNodeDetails.raw_data[sourceNodeDetails.id].geo_coordinate.split(',')

    const tgtCoordinate = targetNodeDetails.raw_data[targetNodeDetails.id].geo_coordinate.split(',')

    fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${srcCoordinate[0]},${srcCoordinate[1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`)
      .then(res => res.json()).then(data => {
        try {
          return data.results[data.results.length - 1].formatted_address
        } catch{
          return '-'
        }
      }).then(sourceLocation => {
        fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${tgtCoordinate[0]},${tgtCoordinate[1]}&key=AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs&language=en`)
          .then(res => res.json()).then(data => {
            try {
              return data.results[data.results.length - 1].formatted_address
            } catch{
              return '-'
            }
          }).then(targetLocation => {
            let sourceNodeColor
            let targetNodeColor
            this.cy.elements('nodes').forEach((node) => {
              if (node.data().id == sourceNodeDetails.id) {
                sourceNodeColor = node.css('background-color')
              }
            })
            this.cy.elements('nodes').forEach((node) => {
              if (node.data().id == targetNodeDetails.id) {
                targetNodeColor = node.css('background-color')
              }
            })
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
                    style={{ marginBottom: '2.5%',backgroundColor:sourceNodeColor,border:`solid ${sourceNodeColor}` }}
                  >

                    <div className="DetailsLabel">Node ID</div>
                    {sourceNodeDetails.id}

                    <div className="DetailsLabel">State</div>
                    {sourceNodeDetails.state}

                    <div className="DetailsLabel">City/State/Country</div>
                    {sourceLocation}

                  </CollapsibleButton>

                  <CollapsibleButton
                    id={targetNodeDetails.id + 'Btn'}
                    className='targetNodeBtn'
                    key={targetNodeDetails.id + 'Btn'}
                    eventKey={targetNodeDetails.id + 'Btn'}
                    name={targetNodeDetails.name}
                    style={{ marginBottom: '2.5%',backgroundColor:targetNodeColor,border:`solid ${targetNodeColor}`}}
                  >

                    <div className="DetailsLabel">Node ID</div>
                    {targetNodeDetails.id}

                    <div className="DetailsLabel">State</div>
                    {targetNodeDetails.state}

                    <div className="DetailsLabel">City/Country</div>
                    {targetLocation}

                  </CollapsibleButton>

                </div>

                <div className="col" style={{ margin: 'auto', padding: '0', textAlign: 'center' }}>
                  <button onClick={this.handleSwitch} id="switchBtn" />
                </div>

              </div>
              <hr style={{ backgroundColor: '#486186' }} />
              <div className="DetailsLabel">Tunnel ID</div>
              {linkDetails.id}
              <div className="DetailsLabel">Interface Name</div>
              {linkDetails.name}
              <div className="DetailsLabel">MAC</div>
              {linkDetails.MAC}
              <div className="DetailsLabel">State</div>
              {linkDetails.State}
              <div className="DetailsLabel">Tunnel Type</div>
              {linkDetails.type}
              {/* <div className="DetailsLabel">ICE Connection Type</div>
              {linkDetails.ICEConnectionType} */}
              <div className="DetailsLabel">ICE Role</div>
              {linkDetails.stats.IceProperties.role}
              <div className="DetailsLabel">Remote Address</div>
              {linkDetails.stats.IceProperties.remote_addr}
              <div className="DetailsLabel">Local Address</div>
              {linkDetails.stats.IceProperties.local_addr}
              <div className="DetailsLabel">Latency</div>
              {linkDetails.stats.IceProperties.latency}
              <br /><br />

              <Card.Body className="transmissionCard">
                <div className="DetailsLabel">Byte Sent</div>
                {linkDetails.stats.byte_sent}
                <div className="DetailsLabel">Total Byte Sent</div>
                {linkDetails.stats.total_byte_sent}
              </Card.Body>

              <Card.Body className="transmissionCard">
                Received
                <div className="DetailsLabel">Byte Received</div>
                {linkDetails.stats.byte_receive}
                <div className="DetailsLabel">Total Byte Received</div>
                {linkDetails.stats.total_byte_receive}
              </Card.Body>

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
          linkDetails = that.props.topology.getLinkDetails(that.state.currentSelectedElement.data().target, that.state.currentSelectedElement.data().id)
        } else {
          linkDetails = that.props.topology.getLinkDetails(that.state.currentSelectedElement.data().source, that.state.currentSelectedElement.data().id)
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
    // //console.log("setting node ");
    var that = this
    var promise = new Promise(function (resolve, reject) {
      try {

        var sourceNode = that.props.topology.getNodeDetails(node.data().id)

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
        var linkDetails = that.props.topology.getLinkDetails(link.data().source, link.data().id)

        var sourceNode = link.data().source

        var targetNode = link.data().target

        var sourceNodeDetails = that.props.topology.getNodeDetails(link.data().source)

        var targetNodeDetails = that.props.topology.getNodeDetails(link.data().target)

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
            //    //console.log(this.state.currentSelectedElement)
            var relatedElement2 = this.state.currentSelectedElement.connectedNodes().union(this.state.currentSelectedElement)
            var notRelatedElement2 = this.cy.elements().difference(this.state.currentSelectedElement.connectedNodes()).not(this.state.currentSelectedElement)
            // var relatedElement2 = selectedElement.connectedNodes().union(selectedElement);
            // var notRelatedElement2 = that.cy.elements().difference(selectedElement.connectedNodes()).not(selectedElement);
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
            // //console.log(e.target[0]===this.cy);
            if (document.getElementById('rightPanel').hidden === true) {
              document.getElementById('overlayRightPanelBtn').click()
            }
            if (selectedElement.isNode()) {
              // //console.log(`selected from clicked : ${JSON.stringify(e.target.data())}`);
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
            // //console.log(e.target[0]===this.cy);
            if (e.target[0] === this.cy) {
              // document.getElementById('rightPanelBtn').click()
              ReactDOM.render(<></>, document.getElementById('rightPanelContent'))
              that.cy.elements().removeClass('transparent')
            }
          } finally {
            if (e.target[0] !== this.cy) {
              that.setState({ switchToggle: true, currentSelectedElement: e.target })
            } else {
              that.setState({ switchToggle: false, currentSelectedElement: null })
            }
          }
        })
      }}
      wheelSensitivity={0.1}

      elements={this.props.topology.getAlltopology()}

      stylesheet={cytoscapeStyle}

      style={{ width: window.innerWidth, height: window.innerHeight }}

      layout={{ name: 'circle' }}

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
    this.cy.zoom(0.8)
    document.getElementById('zoomSlider').value = this.cy.zoom()
    this.cy.center()
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
    if (window.confirm('Your current process will be loss. Are you sure to go back ?') === true) {
      window.location.reload(true)
    }
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
            //console.log(selectedElement)
            // console.log(relatedElement)
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
            // alert("You have to select a node.")
            // document.getElementById("viewSelector").value = this.state.currentView;
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
    if (this.cy != null && this.cy != undefined) {
      var nodes = this.cy.elements('nodes')
      nodes.toArray().forEach((node) => {
        if (node.incomers().length == 0 && node.outgoers().length == 0) {
          node.addClass('noTunnel')
        }
      })
    }

    if (this.state.currentView === 'Map') {
      document.getElementById('elementBreadcrumb').hidden = true
      document.getElementById('overlayBreadcrumb').hidden = true
      document.getElementById('homeBtn').hidden = true
      document.getElementById('refreshBtn').hidden = true
      document.getElementById('configBtn').hidden = true
      document.getElementById('infoBtn').hidden = true
      document.getElementById('plusBtn').hidden = true
      document.getElementById('minusBtn').hidden = true
      document.getElementById('zoomSlider').hidden = true
      var selectedElement = this.state.currentSelectedElement
      if (this.state.currentSelectedElement.isNode()) {
        try {
          var nodeRelatedElement = selectedElement.outgoers().union(selectedElement.incomers()).union(selectedElement).filter(element => {
            return element.isNode() && this.hasCoordinate(element)
          })
          //console.log(nodeRelatedElement)
          var nodeMap
          if (nodeRelatedElement.length !== 0) {

            nodeMap = <GoogleMapReact
              bootstrapURLKeys={{
                key: 'AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs',
                language: 'en'
              }}
              center={{ lat: parseFloat(selectedElement.data().coordinate.split(',')[0]), lng: parseFloat(selectedElement.data().coordinate.split(',')[1]) }}
              defaultZoom={8}
            >

              {nodeRelatedElement.map(node => {
                if (node.data().id === this.state.currentSelectedElement.data().id) {
                  return <button onClick={this.handleMakerClicked.bind(this, node)} key={node.data().id + 'Marker'} id={node.data().id + 'Marker'} className="nodeMarker selected" lat={parseFloat(node.data().coordinate.split(',')[0])} lng={parseFloat(node.data().coordinate.split(',')[1])}>
                    <label className="markerLabel">
                      {node.data().label}
                    </label>
                  </button>
                } else {
                  return <button onClick={this.handleMakerClicked.bind(this, node)} key={node.data().id + 'Marker'} id={node.data().id + 'Marker'} className="nodeMarker" lat={parseFloat(node.data().coordinate.split(',')[0])} lng={parseFloat(node.data().coordinate.split(',')[1])}>
                    <label className="markerLabel">
                      {node.data().label}
                    </label>
                  </button>
                }
              })}

            </GoogleMapReact>
          } else {
            nodeMap = <GoogleMapReact
              bootstrapURLKeys={{
                key: 'AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs',
                language: 'en'
              }}
              center={{ lat: parseFloat('15.8700'), lng: parseFloat('100.9925') }}
              defaultZoom={8}
            >
            </GoogleMapReact>
          }
          // alert('The visualizer can t find any coordinate of connected node.')
          ReactDOM.render(nodeMap, document.getElementById('midArea'))
        } catch (e) {
          //console.log(e)
          alert('You have to select a node.')
          document.getElementById('viewSelector').value = this.state.currentView
        }
      } else if (this.state.currentSelectedElement.isEdge()) {
        try {
          var edgeRelatedElement = selectedElement.connectedNodes().filter((element) => {
            return this.hasCoordinate(element)
          })
          var unmappedElement = selectedElement.connectedNodes().filter((element) => {
            return this.hasCoordinate(element) === false
          })
          //console.log(edgeRelatedElement)
          var centerPoint, edgeMap
          if (edgeRelatedElement.length !== 0) {

            centerPoint = this.midpoint(parseFloat(edgeRelatedElement[0].data().coordinate.split(',')[0]), parseFloat(edgeRelatedElement[0].data().coordinate.split(',')[1]), parseFloat(edgeRelatedElement[1].data().coordinate.split(',')[0]), parseFloat(edgeRelatedElement[1].data().coordinate.split(',')[1]))
            edgeMap = <GoogleMapReact
              bootstrapURLKeys={{
                key: 'AIzaSyBjkkk4UyMh4-ihU1B1RR7uGocXpKECJhs',
                language: 'en'
              }}
              center={{ lat: centerPoint[0], lng: centerPoint[1] }}
              defaultZoom={10}
            >

              {edgeRelatedElement.map(node => {
                return <button onClick={this.handleMakerClicked.bind(this, node)} key={node.data().id + 'Marker'} id={node.data().id + 'Marker'} className="nodeMarker selected" lat={parseFloat(node.data().coordinate.split(',')[0])} lng={parseFloat(node.data().coordinate.split(',')[1])}>
                  <label className="markerLabel">
                    {node.data().label}
                  </label>
                </button>
              })}

            </GoogleMapReact>
          } else {
            centerPoint = [parseFloat('15.8700'), parseFloat('100.9925')]
            edgeMap = <GoogleMapReact
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



            // alert('The visualizer can t find any coordinate of connected node.')
          }

          ReactDOM.render(edgeMap, document.getElementById('midArea'))
        } catch (e) {
          //console.log(e)
          // alert("You have to select a node.")
          // document.getElementById("viewSelector").value = this.state.currentView;
        }
      }
    }
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
          <button onClick={this.handleRefresh} id="refreshBtn" className="leftToolsBtn"></button>
        </div>
        <div>
          <OverlayTrigger rootClose={true} trigger="click" placement="right" overlay={
            <Popover>
              <Popover.Title as="h3">IPOP Network Visualizer : Legend</Popover.Title>
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
              <Popover.Title as="h3">IPOP Network Visualizer : Configure</Popover.Title>
              <Popover.Content id="configContent">
                <div className="row">
                  <div className="col">
                    <label>Minimun zoom</label>
                  </div>
                  <div className="col">
                    <select defaultValue={this.state.setMinZoom} onChange={this.handleSetMinZoom} id="minZoomSelector" value={this.state.minZoom}>
                      <option id="0.2">0.2</option>
                      <option id="1">1</option>
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

export default OthersView
