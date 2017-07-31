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
		      	<View style={{width:width, height:height, shadowColor: '#000000', shadowOffset: {width: 0, height: 0}, shadowRadius: 3, shadowOpacity: 0.5,}}>
					<Image 
					resizeMode='cover'
					source={require( "../assets/images/21st_image_outdoor.jpg")}
					style={{width:width, height:height}} />
		      	</View>
	      	</View>
	      	<View style={{flex: 1, justifyContent: 'flex-start', width: width}}>
	      		<Text style={{textAlign: 'center', paddingTop: 10, paddingBottom: 10, fontSize: 32}}>
	      			Welcome to Ice Breaker
	      		</Text>
	      	</View>
	      	<View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center',}}>
		      	<TouchableOpacity onPress={this.fbLogin}>
		      		<Text style={styles.login}>Login with Facebook</Text>
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
  },
  login: {
  	width: width,
  	paddingTop: 15,
  	paddingBottom: 15,
  	justifyContent: 'center',
  	textAlign: 'center', 
  	color:'white', 
  	fontSize:24, 
  	backgroundColor: 'navy',
  	borderColor: 'darkblue', 
  	borderWidth: 3, 
  	// shadowColor: '#000000', 
  	// shadowOffset: {width: 0, height: 0}, 
  	// shadowRadius: 10, 
  	// shadowOpacity: 0.5,
  }
});