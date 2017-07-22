import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator
} from 'react-native';
import { StackNavigator, NavigationActions } from 'react-navigation';

import * as firebase from 'firebase'
import * as FirebaseAPI from '../modules/firebaseAPI'


import LoginScreen from './LoginScreen'

export default class LoadingScreen extends React.Component {
  componentWillMount() {
    this.firebaseRef = firebase.database().ref('users')
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(fbAuth => {
      if (fbAuth) {     // user is signed in and is found in db
        this.firebaseRef.child(fbAuth.uid).on('value', snap => {
          const user = snap.val()
          if (user != null) {
            this.firebaseRef.child(fbAuth.uid).off('value')
            this.props.navigation.dispatch(NavigationActions.reset({
              index: 0,
              actions: [
                NavigationActions.navigate({routeName: 'Home',  params: {user: user}})
              ]
            })); 
          }
        }) 
      } else {                         // no user is signed in
            this.props.navigation.navigate('Login')
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