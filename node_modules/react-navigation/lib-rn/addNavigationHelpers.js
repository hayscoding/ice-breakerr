

import NavigationActions from './NavigationActions'; /**
                                                      * 
                                                      *
                                                      * Helpers for navigation.
                                                      */

export default function (navigation) {
  return {
    ...navigation,
    goBack: key => navigation.dispatch(NavigationActions.back({
      key: key === undefined ? navigation.state.key : key
    })),
    navigate: (routeName, params, action) => navigation.dispatch(NavigationActions.navigate({
      routeName,
      params,
      action
    })),
    /**
     * For updating current route params. For example the nav bar title and
     * buttons are based on the route params.
     * This means `setParams` can be used to update nav bar for example.
     */
    setParams: params => navigation.dispatch(NavigationActions.setParams({
      params,
      key: navigation.state.key
    }))
  };
}