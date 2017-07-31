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

    FirebaseAPI.getUserCb(this.props.navigation.state.params.profile.uid, (profile) => { 
      InteractionManager.runAfterInteractions(() => {
        if(this._mounted)
          this.setState({profile: profile}) 
      })
    })

    this._mounted = false
  }

  componentDidMount() {
    //Set this true so no warning appears if component unmounts during process
    this._mounted = true

    if(this.state.user != this.state.profile)
      FirebaseAPI.checkForChat(this.state.user.uid, this.state.profile.uid, (outcome) => {
        if(this._mounted)
          this.setState({hasChat: outcome})
      })
    else if(this._mounted)
      this.setState({hasChat: true})  //set true so user cannot chat themself and others in chat
  }

  componentWillUpdate() {
    
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  sendMessageTouchable(profile) {
    return(
      <View style={{flex: 1, justifyContent: 'flex-end', alignItems: 'center',}}>
        <TouchableOpacity onPress={() => {this.startChat(profile)}} >
          <Text style={styles.chatButton}>Send Message</Text>
        </TouchableOpacity>
      </View>
    )
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEventThrottle={10} pagingEnabled>      
            {
              // this.state.profile.photoUrls.map((url) => {
              //   return <Image 
              //     resizeMode='cover'
              //     source={{uri: url}}
              //     style={{width:width, height:height/2}} 
              //     key={profile.uid+"-"+url} />
              // })
            }
          </ScrollView>
          <View style={styles.headerContainer}>
            <Text style={styles.name}>{profile.name.split(' ')[0]}</Text>
            <Text style={styles.age}>23 years old</Text>
            <Text style={styles.subtitle}>Work info goes here...</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>About {profile.name.split(' ')[0]}</Text>
          </View>
          <View style={styles.bioContainer}>
            <Text style={styles.bio}>{profile.bio}</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{profile.name.split(' ')[0]}{"\'"}s Favorite Emojis</Text>
          </View>
          <View style={styles.bioContainer}>
            <Text style={styles.bio}>{profile.emojis}</Text>
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{profile.name.split(' ')[0]}{"\'"}s Top Interests</Text>
          </View>
          <View style={styles.bioContainer}>
            <Text style={styles.bio}>{profile.interests}</Text>
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
    backgroundColor: '#FAFAFA',
  },  
  headerContainer: {
    paddingTop: 5,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor:'white',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  titleContainer: {
    backgroundColor:'#FAFAFA',
  },
  bioContainer: {
    flex: 1,
    width: width,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  bio: {
    flex: 1,
    width: width,
    alignSelf: 'flex-start',
    paddingTop: 10,
    paddingBottom: 40,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize:18,
    color: '#565656',
    textAlign: 'left',
    backgroundColor: 'white',
  },
  text: {
    color: '#565656',
    fontSize: 48,
    textAlign: 'left'
  },
  name: {
    color: '#2B2B2B',
    fontSize: 24,
    marginTop: 5,
    marginBottom: 1,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  age: {
    color: '#2B2B2B',
    textAlign: 'left',
    fontSize: 16,
    marginTop: 2,
    marginBottom: 3,
    color: 'gray',
  },
  title: {
    fontSize:16,
    color: 'black',
    textAlign: 'left',
    fontWeight: 'bold',
    paddingTop: 15,
    paddingBottom: 5,
    paddingLeft: 20,
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
