import React, { PureComponent } from 'react';
import propTypes from 'prop-types';

export default class SceneView extends PureComponent {
  static childContextTypes = {
    navigation: propTypes.object.isRequired
  };

  getChildContext() {
    return {
      navigation: this.props.navigation
    };
  }

  render() {
    const { screenProps, navigation, component: Component } = this.props;

    return <Component screenProps={screenProps} navigation={navigation} />;
  }
}