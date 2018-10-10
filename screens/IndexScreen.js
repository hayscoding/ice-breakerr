import React from 'react';
import Swiper from 'react-native-swiper'
import { AppState, ScrollView, StyleSheet, TouchableOpacity, View, Text, Image, Dimensions, InteractionManager, Alert } from 'react-native';
import { ExpoLinksView } from '@expo/samples';

import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ShareScreen from '../screens/ShareScreen';

import * as FirebaseAPI from '../modules/firebaseAPI'

const {height, width} = Dimensions.get('window');

export default class IndexScreen extends React.Component {
  static navigationOptions = {
    title: 'Ice Breakerr',
    headerLeft: null,
    gesturesEnabled: false,
  };

  state = {
    appState: AppState.currentState,
    user: this.props.screenProps.user, 
    scrollEnabled: true,
  }

  componentWillMount() {
      if(!('createdDate' in this.state.user)) {
          const now = new Date();

          InteractionManager.runAfterInteractions(() => {
            FirebaseAPI.updateUser(this.state.user.uid, 'createdDate', now)
          })

          InteractionManager.runAfterInteractions(() => {
            FirebaseAPI.getPhotoUrlsFromFbCb(this.state.user.id, this.state.user.fbAuthToken, (urls) => {
              FirebaseAPI.mergeUserPhotoUrls(this.state.user.uid, urls.slice(0,6))
            })
          })

          InteractionManager.runAfterInteractions(() => {
            FirebaseAPI.getUserCb(this.state.user.uid, (currentUser) => {
              InteractionManager.runAfterInteractions(() => {
                this.setState({user: currentUser})
              })
            })
          })
      }
  }

  // componentDidMount() {
  //   // setTimeout(() => {
  //   //     Alert.alert(
  //   //     ('Be sure to create an interesting profile before you message!'),
  //   //     'Edit your profile now?',
  //   //     [
  //   //       {text: 'OK', onPress: () => {
  //   //         InteractionManager.runAfterInteractions(() => {
  //   //            this.props.navigation.navigate('Edit', 
  //   //             {user: this.state.user, cb: (user) => { this.setState({user}) }})
  //   //         })
  //   //       }},
  //   //       {text: 'Cancel', onPress: () => {}, style: 'cancel'},
  //   //     ],
  //   //     { cancelable: false }
  //   //   )}, 4000)
  // }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    FirebaseAPI.updateUser(this.state.user.uid, 'appState', 'active')
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
    }

    const now = new Date();

    this.setState({appState: nextAppState});

    FirebaseAPI.updateUser(this.state.user.uid, 'appState', this.state.appState)
    FirebaseAPI.updateUser(this.state.user.uid, 'lastActive', now)
  }

  viewStyle() {
    return {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }
  }

  changeScrollBool(bool) {
    if(bool != this.state.scrollEnabled)
      this.setState({scrollEnabled: bool})
  }

  render() {
    let index = 0;
    if('navigation' in this.props 
      && 'state' in this.props.navigation 
      && 'params' in this.props.navigation.state 
      && 'index' in this.props.navigation.state.params)
      index = this.props.navigation.state.params.index;
    
    return(
      <View style={{flex: 1}}>
        <Swiper
            horizontal={true}
            loop={false}
            showsPagination={true}
            paginationStyle={{
              height: width/7,
              bottom: 0,
              backgroundColor: '#efefef',
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: 'lightgrey',
            }}
            index={index}
            scrollEnabled={this.state.scrollEnabled}>
            <View style={this.viewStyle()}>
              <SettingsScreen screenProps={this.state} navigation={this.props.navigation}/>
            </View>
            <View style={this.viewStyle()}>
              <ShareScreen screenProps={this.state} navigation={this.props.navigation}/>
            </View>
            <View style={this.viewStyle()}>
              <HomeScreen scrollBoolCb={(bool) => {this.changeScrollBool(bool)}} screenProps={this.state} navigation={this.props.navigation}/>
            </View>
        </Swiper>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
  view: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
