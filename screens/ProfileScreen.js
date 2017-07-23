import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity, 
  Dimensions,
} from 'react-native';

import * as FirebaseAPI from '../modules/firebaseAPI'

const {height, width} = Dimensions.get('window');

export default class ProfileScreen extends React.Component {
  componentWillMount() {
    this.state = {
      user: this.props.navigation.state.params.user, 
      profile: this.props.navigation.state.params.profile,
      hasChat: false,
    }

    if(this.state.user != this.state.profile)
      FirebaseAPI.checkForChat(this.state.user.uid, this.state.profile.uid, (outcome) => {
        this.setState({hasChat: outcome})
      })
    else
      this.setState({hasChat: true})  //set true so user cannot chat themself
  }

  sendMessageTouchable(profile) {
    if(!this.state.hasChat)
      return(
        <View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center',}}>
          <TouchableOpacity onPress={() => {this.startChat(profile)}} >
            <Text style={styles.chatButton} >Send Message</Text>
          </TouchableOpacity>
        </View>
      )
    else
      return null
  }

  startChat(profile) {
    this.props.navigation.navigate('Chat', {profile: this.props.navigation.state.params.profile, user: this.props.navigation.state.params.user})
  }

  render() {
    const profile = this.props.navigation.state.params.profile
    const fbImageUrl = `https://graph.facebook.com/${profile.id}/picture?height=${height}`

    return(
      <View style={{flex: 1}}>
        <View style={styles.container}>  
          <Image 
            resizeMode='cover'
            source={{uri: fbImageUrl}}
            style={{width:width, height:height/2}} />
          <View style={styles.body}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.bio}>Profile bio goes here...{'\n'}</Text>
          </View>
          { this.sendMessageTouchable(profile) } 
        </View>
      </View>
    )
  }
}
        

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height:height,
    width:width,
    backgroundColor:'white',
  },  
  body: {
    paddingTop: 10,
    paddingLeft: 30,
  },
  text: {
    color: '#2B2B2B',
    fontSize: 48,
    textAlign: 'left'
  },
  name: {
    color: '#2B2B2B',
    fontSize: 24,
    marginTop: 5,
    marginBottom: 2,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  bio: {
    fontSize:14,
    color:'black',
    textAlign: 'left'
  },
  chatButton: {
    width: width,
    paddingTop: 15,
    paddingBottom: 15,
    justifyContent: 'center',
    textAlign: 'center', 
    color:'white', 
    fontSize:24, 
    backgroundColor: 'green',
    borderColor: 'lightgrey', 
    borderTopWidth: 3, 
  }
});
