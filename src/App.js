import React from 'react'
import 'react-tippy/dist/tippy.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { CurrentView } from './Components/Common/CurrentView'
import "./CSS/Main.css";
import SideBar from "./Components/Common/Sidebar";
import { Typeahead } from 'react-bootstrap-typeahead';

class ParentView extends React.Component {
				constructor(props) {
								super(props)
								this.state = {
								}
				}

				render() {
								return (
												<div id="container" className="container-fluid" style={{ padding: '0' }} >
													<div id="mainContent" className="row" style={{ backgroundColor: '#101B2B', color: 'white', margin: 'auto' }}>
															<CurrentView />
															<div id="SidePanel">
																<SideBar> 
																	<Typeahead placeholder={'Search by identifier'} />
																</SideBar>
															</div>
													</div>
												</div>);
				}
}

export default ParentView;


