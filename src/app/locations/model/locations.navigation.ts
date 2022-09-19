import {NavigationTab} from '../../utils/navigation/models/navigationTab';
import {NavigationButton} from '../../utils/navigation/models/navigationButton';
import {NavigationAcceptedIconsEnum} from '../../utils/navigation/models/navigation.types';
import {NavButtonsIdsEnum} from '../../utils/navigation/models/navButtonsIds.enum';


export const LocationNav = new NavigationTab('locations', 'Lokace', ['locations'], 'paper-plane-outline');

export const LocationListButton = new NavigationButton(NavButtonsIdsEnum.locations_list, 'seznam lokací', {name: 'list-outline', iconType: NavigationAcceptedIconsEnum.eva}, ['/locations'])
LocationListButton.routerLinkActiveExactOptions = true;
export const LocationCreateNewButton = new NavigationButton(NavButtonsIdsEnum.locations_create_new, 'nová lokace', {name: 'plus-outline', iconType: NavigationAcceptedIconsEnum.eva}, ['/locations/new'])

