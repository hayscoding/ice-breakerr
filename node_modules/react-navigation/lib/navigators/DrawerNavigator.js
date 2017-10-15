'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactNative = require('react-native');

var _createNavigator = require('./createNavigator');

var _createNavigator2 = _interopRequireDefault(_createNavigator);

var _createNavigationContainer = require('../createNavigationContainer');

var _createNavigationContainer2 = _interopRequireDefault(_createNavigationContainer);

var _TabRouter = require('../routers/TabRouter');

var _TabRouter2 = _interopRequireDefault(_TabRouter);

var _DrawerScreen = require('../views/Drawer/DrawerScreen');

var _DrawerScreen2 = _interopRequireDefault(_DrawerScreen);

var _DrawerView = require('../views/Drawer/DrawerView');

var _DrawerView2 = _interopRequireDefault(_DrawerView);

var _DrawerNavigatorItems = require('../views/Drawer/DrawerNavigatorItems');

var _DrawerNavigatorItems2 = _interopRequireDefault(_DrawerNavigatorItems);

var _NavigatorTypes = require('./NavigatorTypes');

var _NavigatorTypes2 = _interopRequireDefault(_NavigatorTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var DefaultDrawerConfig = {
  /*
   * Default drawer width is screen width - header width
   * https://material.io/guidelines/patterns/navigation-drawer.html
   */
  drawerWidth: _reactNative.Dimensions.get('window').width - (_reactNative.Platform.OS === 'android' ? 56 : 64),
  contentComponent: _DrawerNavigatorItems2.default,
  drawerPosition: 'left',
  useNativeAnimations: true
};

var DrawerNavigator = function DrawerNavigator(routeConfigs) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var mergedConfig = _extends({}, DefaultDrawerConfig, config);

  var containerConfig = mergedConfig.containerConfig,
      drawerWidth = mergedConfig.drawerWidth,
      drawerLockMode = mergedConfig.drawerLockMode,
      contentComponent = mergedConfig.contentComponent,
      contentOptions = mergedConfig.contentOptions,
      drawerPosition = mergedConfig.drawerPosition,
      useNativeAnimations = mergedConfig.useNativeAnimations,
      tabsConfig = _objectWithoutProperties(mergedConfig, ['containerConfig', 'drawerWidth', 'drawerLockMode', 'contentComponent', 'contentOptions', 'drawerPosition', 'useNativeAnimations']);

  var contentRouter = (0, _TabRouter2.default)(routeConfigs, tabsConfig);

  var drawerRouter = (0, _TabRouter2.default)({
    DrawerClose: {
      screen: (0, _createNavigator2.default)(contentRouter, routeConfigs, config, _NavigatorTypes2.default.DRAWER)(function (props) {
        return _react2.default.createElement(_DrawerScreen2.default, props);
      })
    },
    DrawerOpen: {
      screen: function screen() {
        return null;
      }
    },
    DrawerToggle: {
      screen: function screen() {
        return null;
      }
    }
  }, {
    initialRouteName: 'DrawerClose'
  });

  var navigator = (0, _createNavigator2.default)(drawerRouter, routeConfigs, config, _NavigatorTypes2.default.DRAWER)(function (props) {
    return _react2.default.createElement(_DrawerView2.default, _extends({}, props, {
      drawerLockMode: drawerLockMode,
      useNativeAnimations: useNativeAnimations,
      drawerWidth: drawerWidth,
      contentComponent: contentComponent,
      contentOptions: contentOptions,
      drawerPosition: drawerPosition
    }));
  });

  return (0, _createNavigationContainer2.default)(navigator);
};

exports.default = DrawerNavigator;