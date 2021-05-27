import TopologyView from './TopologyView'
import { useSelector } from 'react-redux'
import OverlaysView from './OverlaysView'




export const CurrentView = (e) => {
	const curView = useSelector((state) => state.currentView);
	const selectedOverlayId = useSelector((state) => state.selectedOverlayId);
	if (curView === 'OverlaysView') {
		return <OverlaysView />;
	}
	else if (curView === 'TopologyView') {
		return <TopologyView overlayName={selectedOverlayId}/>;
	}
	else {
		return <OverlaysView />;
	}
}
