import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity, 
  Dimensions,
  InteractionManager,
  Icon,
  ScrollView,
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
      <View style={styles.container}>  
        <ScrollView>
          <Image 
            resizeMode='cover'
            source={{uri: fbImageUrl}}
            style={{width:width, height:height/2}} />
          <View style={styles.headerContainer}>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.subtitle}>Profile bio goes here...{'\n'}</Text>
          </View>
          <View style={styles.bioContainer}>
            <Text style={styles.bio}>I am the greatest human being on earth.</Text>
          </View>
        </ScrollView>
        { this.sendMessageTouchable(profile) } 
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
  headerContainer: {
    paddingTop: 10,
    paddingLeft: 30,
    paddingRight: 30,
  },
  bioContainer: {
    width: width,
    borderTopWidth: 1,
    borderColor: '#FAFAFA',
  },
  bio: {
    fontSize:16,
    color: 'black',
    textAlign: 'left',
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 10,
  },
  text: {
    color: '#2B2B2B',
    fontSize: 48,
    textAlign: 'left'
  },
  name: {
    color: '#2B2B2B',
    fontSize: 22,
    marginTop: 5,
    marginBottom: 2,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize:14,
    color: 'gray',
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
