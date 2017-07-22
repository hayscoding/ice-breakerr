import { Notifications } from 'expo';
import React from 'react';
import { StackNavigator } from 'react-navigation';
import { InteractionManager } from 'react-native'

import * as firebase from 'firebase'
import * as FirebaseAPI from '../modules/firebaseAPI'


import MainTabNavigator from './MainTabNavigator';
import LoginScreen from './LoginScreen'
import LoadingScreen from './LoadingScreen'
import ProfileScreen from '../screens/ProfileScreen'
import ChatScreen from '../screens/ChatScreen'

import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';

const RootStackNavigator = StackNavigator(
  {
    Main: {
      screen: MainTabNavigator,
    },
    Profile: {
      screen: ProfileScreen,
    },
    Chat: {
      screen: ChatScreen,
    },
  },
  {
    navigationOptions: () => ({
      headerTitleStyle: {
        fontWeight: 'normal',
        color: '#0099FF',
      },
    }),
  }
);

const LoginNavigator = StackNavigator(
  {
    Main: {
      screen: LoadingScreen,
    },
    Login: {
      screen: LoginScreen,
    },
  },
  {
    navigationOptions: () => ({
      headerTitleStyle: {
        fontWeight: 'normal',
        color: '#0099FF',
      },
    }),
  }
);


export default class RootNavigator extends React.Component {
  componentWillMount() {
    this.state = {
      user: {},
      hasUser: false,
    }

    this.firebaseRef = firebase.database().ref('users')
  }

  componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications();

    this.checkForUser()
  }

  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove();
  }

  checkForUser() {
    this.setState({hasUser: false})

    firebase.auth().onAuthStateChanged(fbAuth => {
      if (fbAuth) {     // user is signed in and is found in db
        this.firebaseRef.child(fbAuth.uid).on('value', snap => {
          const user = snap.val()
          if (user != null) {
            this.firebaseRef.child(fbAuth.uid).off('value')
            InteractionManager.runAfterInteractions(() => {
              this.setState({user: user, hasUser: true})
            })
          }
        }) 
      } else {                         // no user is signed in
            this.setState({hasUser: false})
      }
    })
  }

  render() {
    if(this.state.hasUser)
      return <RootStackNavigator screenProps={{user: this.state.user}}/>;
    else
      return <LoginNavigator />
  }

  _registerForPushNotifications() {
    // Send our push token over to our backend so we can receive notifications
    // You can comment the following line out if you want to stop receiving
    // a notification every time you open the app. Check out the source
    // for this function in api/registerForPushNotificationsAsync.js
    registerForPushNotificationsAsync();

    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );
  }

  _handleNotification = ({ origin, data }) => {
    console.log(
      `Push notification ${origin} with data: ${JSON.stringify(data)}`
    );
  };
}
