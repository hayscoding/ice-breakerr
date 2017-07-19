import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity, 
  Dimensions,
} from 'react-native';

const {height, width} = Dimensions.get('window');

export default class Profile extends React.Component {

  startChat(profile) {
    this.props.navigation.navigate('Chat', {profile: this.props.navigation.state.params.profile, user: this.props.navigation.state.params.user})
  }

  render() {
    const profile = this.props.navigation.state.params.profile
    const fbImageUrl = `https://graph.facebook.com/${profile.id}/picture?height=${height}`

    console.log(fbImageUrl)

    return(
      <View style={{flex: 1}}>
        <View style={styles.container}>  
          <Image 
            resizeMode='cover'
            source={{uri: fbImageUrl}}
            style={{width:width, height:height/2}} />
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.bio}>Profile bio goes here...{'\n'}</Text>
          <View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center',}}>
            <TouchableOpacity onPress={() => {this.startChat(profile)}} >
              <Text style={styles.chatButton} >Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }
}
        

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height:height,
    width:width,
    backgroundColor:'white',
    },
  text: {
    color: '#2B2B2B',
    fontSize: 48,
    textAlign: 'center'
  },
  name: {
    color: '#2B2B2B',
    fontSize: 20,
    marginTop: 5,
    marginBottom: 2,
    textAlign: 'center'
  },
  bio: {
    fontSize:14,
    color:'black',
    textAlign: 'center'
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
    // shadowColor: '#000000', 
    // shadowOffset: {width: 0, height: 0}, 
    // shadowRadius: 10, 
    // shadowOpacity: 0.5,
  }
});
