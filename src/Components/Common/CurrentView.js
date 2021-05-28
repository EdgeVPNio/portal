import TopologyView from './TopologyView'
import { useDispatch, useSelector } from 'react-redux';
import OverlaysView from './OverlaysView'
import { Spinner } from 'react-bootstrap';

export const CurrentView = () => {
	const curView = useSelector((state) => state.view.current);
	const selectedOverlayId = useSelector((state) => state.overlayId.current);
	//const selectedNodeId = useSelector((state) => state.nodeId.current);
	//const selectedTunnelId = useSelector((state) => state.tunnelId.current);
	switch(curView) {
		case 'OverlaysView' : return <OverlaysView />;
		case 'TopologyView' : return <TopologyView overlayName={selectedOverlayId}/>;
		default : return <Spinner id='loading' animation='border' variant='info' />;
	}
}


