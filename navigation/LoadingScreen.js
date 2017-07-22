import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  InteractionManager,
} from 'react-native';
import { StackNavigator, NavigationActions } from 'react-navigation';

import * as firebase from 'firebase'
import * as FirebaseAPI from '../modules/firebaseAPI'

import RootStackNavigator from './RootNavigation'

import LoginScreen from './LoginScreen'

export default class LoadingScreen extends React.Component {
  componentWillMount() {
    this.state = {
      hasUser: false,
    }

    this.firebaseRef = firebase.database().ref('users')
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(fbAuth => {
      if (fbAuth) {     // user is signed in and is found in db
        this.firebaseRef.child(fbAuth.uid).on('value', snap => {
          const user = snap.val()
          if (user != null) {
            this.firebaseRef.child(fbAuth.uid).off('value')
            this.setState({hasUser: true})
            InteractionManager.runAfterInteractions(() => {
              this.props.navigation.goBack()
            })
          }
        }) 
      } else {                         // no user is signed in
        this.setState({hasUser: false})
        InteractionManager.runAfterInteractions(() => {
          this.props.navigation.navigate('Login')
        })
      }
    })
  }

  render() {
    return (
      <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
        <ActivityIndicator size="small"/>
      </View>
    );
  }
}