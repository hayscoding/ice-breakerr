import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Alert,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';


import Exponent from 'expo'
import * as FirebaseAPI from '../modules/firebaseAPI'
import firebase from 'firebase'

const APP_ID = '1897933140424590';

const {height, width} = Dimensions.get('window');
const size = width*1.45

export default class Login extends React.Component {
	static navigationOptions = {
	    title: 'Ice Breaker',
	    headerLeft: null,
	    gesturesEnabled: false,
	  };

	displayError(messsage) {
	    Alert.alert(
	      'Error: ',
	      messsage,
	      [
	        {text: 'Ok', onPress: () => console.log('accepted error')},
	      ]
	    )
	 }

	fbLogin = async() => {
	 	const { type, token } = await Exponent.Facebook.logInWithReadPermissionsAsync(
		    APP_ID, {
		      permissions: ['public_profile', 'user_photos', 'user_birthday', 'email'],
		    });
		if (type === 'success') {
	        const fields = ['email', 'name', 'gender']
	        // facebook user data request
	        const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`)
	        const user = await FirebaseAPI.loginUser(token)

	        FirebaseAPI.mergeUser(await user.uid, await token, await response.json())
	        	.then(() => console.log('merge success'), () => this.showError('Could not add you to database'))
			
		} else {
			this.displayError('Facebook login failed')
		}
    }

    render() {
	    return (
	      <View style={styles.container}>
	      	<View style={{flex: 1, justifyContent: 'flex-start'}}>
				<Image 
				resizeMode='cover'
				source={require( "../assets/images/ice-breaker-logo.png")}
				style={{width:size, height:size}} />
	      	</View>
	      	<View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingLeft: 25, paddingRight: 25, paddingBottom: 40}}>
		      	<TouchableOpacity onPress={this.fbLogin}>
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
  login: {
  	width: width/3*2.5,
  	paddingTop: 25,
  	paddingBottom: 25,
  	justifyContent: 'center',
  	textAlign: 'center', 
  	color:'white', 
  	fontSize:28, 
  	backgroundColor: '#011f33',
  	color: '#d6efff',
  	shadowColor: '#000000', 
  	shadowOffset: {width: 0, height: 0}, 
  	shadowRadius: 20, 
  	shadowOpacity: 0.65,
  }
});