import { Notifications } from 'expo';
import React from 'react';
import { StackNavigator } from 'react-navigation';
import { View, ActivityIndicator, InteractionManager, Icon } from 'react-native'

import * as firebase from 'firebase'
import * as FirebaseAPI from '../modules/firebaseAPI'

import IndexScreen from '../screens/IndexScreen';
import LoginScreen from './LoginScreen'
import LoadingScreen from './LoadingScreen'
import ProfileScreen from '../screens/ProfileScreen'
import ChatScreen from '../screens/ChatScreen'
import EditProfileScreen from '../screens/EditProfileScreen'
import AddPhotoScreen from '../screens/AddPhotoScreen'
import ReferralScreen from '../screens/ReferralScreen'
import GetADateScreen from '../screens/GetADateScreen'
import AddGifScreen from '../screens/AddGifScreen'
import BuyPicturesScreen from '../screens/BuyPicturesScreen'

import registerForPushNotificationsAsync from '../api/registerForPushNotificationsAsync';

const RootStackNavigator = StackNavigator(
  {
    Main: {
      screen: IndexScreen,
    },
    Profile: {
      screen: ProfileScreen,
    },
    Chat: {
      screen: ChatScreen,
    },
    Edit: {
      screen: EditProfileScreen,
    },
    AddGif:{
      screen: AddGifScreen,
    },
    AddPhoto: {
      screen: AddPhotoScreen,
    },
    Referral: {
      screen: ReferralScreen,
    },
    GetADate: {
      screen: GetADateScreen,
    },
    BuyPictures: {
      screen: BuyPicturesScreen,
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
    navigationOptions: ({ onPress }) => ({
      headerTitleStyle: {
        fontWeight: 'normal',
        color: '#0099FF',
      },
      headerLeft: () => { return <Icon name={'chevron-left'} onPress={ () => { IntractionManager.runAfterInteractions(() => { onPress() }) } } />},
    }),
  }
);


export default class RootNavigator extends React.Component {
  state = {
      user: null,
      hasUser: false,
      waiting: true,
      registeredToken: false,
    }

  componentWillMount() {
    this.firebaseRef = firebase.database().ref('users')

    FirebaseAPI.login('hays@gmail.com', 'smokey28', (user) => {
      InteractionManager.runAfterInteractions(() => {
        this.setState({user: user, hasUser: true, waiting: false})
      })
    })
  }



  componentWillUnmount() {
    this._notificationSubscription && this._notificationSubscription.remove();
  }

  // checkForUser() {
  //   firebase.auth().onAuthStateChanged(auth => {
  //     if (auth) {     // user is signed in and is found in db
  //       this.firebaseRef.child(auth.uid).on('value', snap => {
  //         const user = snap.val()

  //         if(user != null) {
  //            this.firebaseRef.child(user.uid).once('value').then((snap) => {
  //               InteractionManager.runAfterInteractions(() => {
  //                 this.firebaseRef.child(auth.uid).off('value')
  //                 this.setState({user: snap.val(), hasUser: true, waiting: false})
  //               })
  //             })
  //         }
  //       }) 
  //     } else {                         // no user is signed in
  //       this.setState({user: {}, hasUser: false, waiting: false})
  //     }
  //   })
  // }

  render() {
    // if(this.state.waiting)
    //   return (
    //     <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
    //       <ActivityIndicator size="small"/>
    //     </View>
    //   )
    // else
    //   if(this.state.hasUser && this.state.registeredToken){
      console.log('RootNavigator:\nUser data:', this.state.user)
      if(this.state.user != null)
        return <RootStackNavigator screenProps={{user: this.state.user}}/>;
      else
        return <LoginNavigator />
      // }
      // else
      //   return <LoginNavigator />
  }

  _registerForPushNotifications() {
    // Send our push token over to our backend so we can receive notifications
    // You can comment the following line out if you want to stop receiving
    // a notification every time you open the app. Check out the source
    // for this function in api/registerForPushNotificationsAsync.js
    // registerForPushNotificationsAsync(this.state.user.uid);

    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );
  }

  _handleNotification = ({ origin, data }) => {
    console.log(
      `Push notification ${origin} with data: ${JSON.stringify(data.text)}`
    );
  };
}
