import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Dimensions,
  Image,
  InteractionManager,
} from 'react-native';


import Exponent from 'expo'
import * as FirebaseAPI from '../modules/firebaseAPI'
import firebase from 'firebase'

var env = process.env.NODE_ENV || 'development';
// var env = 'production'
var config = require('../config')[env];

const APP_ID = config.facebook.appId;

const {height, width} = Dimensions.get('window');
const size = width*1.45

export default class Login extends React.Component {
	static navigationOptions = {
	    title: 'Ice Breakerr',
	    headerLeft: null,
	    gesturesEnabled: false,
	  };

	state = {

	}

	displayError(messsage) {
	    Alert.alert(
	      'Error: ',
	      messsage,
	      [
	        {text: 'Ok', onPress: () => console.log('accepted error')},
	      ]
	    )
	 }

	watchForAuth() {
		firebase.auth().onAuthStateChanged((auth) => {
	 		console.log('before dat if')

	        if (auth) {     // user is signed in and is found in db
        	console.log('IN DAT AUTH FUNCUNADASDAF!!fjlkasjdflasjkld')
	          this.firebaseRef.child(auth.uid).on('value', snap => {
	            const user = snap.val()

	            console.log('HERE IS THE USER INFO: ', user)
	            if (user != null) {
	              InteractionManager.runAfterInteractions(() => {
	                this.props.navigation.goBack()
	              })  
	            }
	          }) 
	        }
	      })
	}

	login = async() => {
		FirebaseAPI.createUser()
		this.watchForAuth()
	}

	componentWillUnmount() {
    //Stops listening to onAuthStateChanged() so unmounted updates do not occur
		// if(this.state.unsubscribe != '')
		//   InteractionManager.runAfterInteractions(() => {
		//     this.state.unsubscribe()
		//   })  
  	}


	// fbLogin = async() => {
	//  	const { type, token } = await Exponent.Facebook.logInWithReadPermissionsAsync(
	// 	    APP_ID, {
	// 	      permissions: ['public_profile', 'user_photos', 'user_birthday', 'email'],
	// 	    });
	// 	if (type === 'success') {
	//         // facebook user data request
	//         const response = await fetch(`https://graph.facebook.com/me?fields=email,birthday,gender,name&access_token=${token}`)
	//         const user = await FirebaseAPI.loginUser(token)

	//         FirebaseAPI.mergeUser(await user.uid, await token, await response.json())
	//         	.then(() => console.log('merge success'), () => this.showError('Could not add you to database'))
	// 	} else {
	// 		this.displayError('Facebook login failed')
	// 	}
 //    }
    
    render() {
	    return (
	      <View style={styles.container}>
	      	<View style={{flex: 1, justifyContent: 'flex-start',}}>
				<Image 
				resizeMode='cover'
				source={require("../assets/images/ice-breaker-logo.png")}
				style={{width:size, height:size,}} />
	      	</View>
	      	<View style={{flex: 1, width: width/3*2.5, justifyContent: 'flex-end', alignItems: 'center', paddingLeft: 25, paddingRight: 25, paddingBottom: 40, }}>
		      	<TouchableOpacity style={styles.loginTouchable} onPress={this.login}>
		      		<Text style={styles.login}>Log in with Facebook</Text>
		      	</TouchableOpacity>
      		</View>
	      </View>
	    );
  	}
}

const styles = StyleSheet.create({
  container: {
  	flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F4973',
  },
  loginTouchable: {
  	width: width/3*2.5,
  	paddingTop: 25,
  	paddingBottom: 25,
  	justifyContent: 'center',
  	borderRadius: 15,
  	backgroundColor: '#011f33',
  	shadowColor: '#000000', 
  	shadowOffset: {width: 0, height: 0}, 
  	shadowRadius: 10, 
  	shadowOpacity: 0.3,
  },
  login: {
  	fontSize:28, 
  	textAlign: 'center', 
  	color:'white', 
  }
});