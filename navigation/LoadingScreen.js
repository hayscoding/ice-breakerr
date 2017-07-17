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
import HomeScreen from '../screens/HomeScreen';

export default class Loading extends Component {
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
            this.props.navigation.navigate('Home')
            //this.props.navigator.push(Router.getRoute('menu', {user}))
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