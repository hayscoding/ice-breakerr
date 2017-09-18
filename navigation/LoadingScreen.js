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
      needsLogin: false,
      unsubscribe: '',  //Used to make sure the listener doesn't update unmount
    }

    this.firebaseRef = firebase.database().ref('users')
  }

  componentDidUpdate() {
    if(this.state.needsLogin)
        this.props.navigation.navigate('Login')
  }

  componentDidMount() {
    //set unsubscribe as the output of the function so listener can be destroyed later
    this.setState({unsubscribe: firebase.auth().onAuthStateChanged(fbAuth => {
        if (fbAuth) {     // user is signed in and is found in db
          this.firebaseRef.child(fbAuth.uid).on('value', snap => {
            const user = snap.val()
            if (user != null) {
              InteractionManager.runAfterInteractions(() => {
                this.props.navigation.goBack()
              })  
            }
          }) 
        } else {                         // no user is signed in
          InteractionManager.runAfterInteractions(() => {
            this.setState({needsLogin: true})
          })  
        }
      })
    })
  }

  componentWillUnmount() {
    //Stops listening to onAuthStateChanged() so unmounted updates do not occur
    if(this.state.unsubscribe != '')
      InteractionManager.runAfterInteractions(() => {
        this.state.unsubscribe()
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