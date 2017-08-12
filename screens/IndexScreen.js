import React from 'react';
import Swiper from 'react-native-swiper'
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Image, Dimensions, InteractionManager, } from 'react-native';
import { ExpoLinksView } from '@expo/samples';

import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import BioScreen from '../screens/BioScreen';

import * as FirebaseAPI from '../modules/firebaseAPI'

const {height, width} = Dimensions.get('window');

export default class IndexScreen extends React.Component {
  static navigationOptions = {
    title: 'Ice Breaker',
    headerLeft: null,
    gesturesEnabled: false,
    timer: {},
  };

  componentWillMount() {
      this.state = {
        user: this.props.screenProps.user, 
      }
  }

  viewStyle() {
    return {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }
  }


  render() {
    return(
      <Swiper
          horizontal={true}
          loop={false}
          showsPagination={false}
          index={1}>
          <View style={this.viewStyle()}>
            <BioScreen screenProps={this.props.screenProps} navigation={this.props.navigation}/>
          </View>
          <View style={this.viewStyle()}>
            <HomeScreen screenProps={this.props.screenProps} navigation={this.props.navigation}/>
          </View>
          <View style={this.viewStyle()}>
            <SettingsScreen screenProps={this.props.screenProps} navigation={this.props.navigation}/>
          </View>
      </Swiper>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
