import React, {Component} from 'react';
import { NavigationActions } from 'react-navigation'
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
  Alert,
} from 'react-native';

import * as FirebaseAPI from '../modules/firebaseAPI'

import firebase from 'firebase'

const {height, width} = Dimensions.get('window');

export default class ProfileScreen extends React.Component {
  componentWillMount() {
    this.state = {
      user: this.props.navigation.state.params.user, 
      profile: this.props.navigation.state.params.profile,
      distance: ' ',
      photoUrls: [],
      hasChat: false,
      startedChat: false,
    }

    FirebaseAPI.getUserCb(this.props.navigation.state.params.profile.uid, (profile) => { 

      InteractionManager.runAfterInteractions(() => {
        if(this._mounted) {
          const uidArray = [profile.uid, this.state.user.uid]
          uidArray.sort()
          const chatID = uidArray[0]+'-'+uidArray[1]

          if(this.state.profile.uid != this.state.user.uid)
            FirebaseAPI.getChatCb(chatID, (chat) => {
              if(chat != null) {
                const msgCount = Object.values(chat).filter((message) => {
                  return message.sender == profile.uid
                }).length

                if(msgCount >= 5 && this._mounted) 
                  this.setState({profile: profile, photoUrls: profile.photoUrls})
                else if(this._mounted)
                  this.setState({profile: profile, photoUrls: []})
              }
            })
          else if(this._mounted)
            this.setState({photoUrls: profile.photoUrls})
        }
      })
    })

    this._mounted = false
  }

  componentDidMount() {
    //Set this true so no warning appears if component unmounts during process
    this._mounted = true

    this.getDistanceFromUser()

    if(this.state.user != this.state.profile)
      FirebaseAPI.checkForChat(this.state.user.uid, this.state.profile.uid, (outcome) => {
        if(this._mounted)
          this.setState({hasChat: outcome})
      })
    else if(this._mounted)
      this.setState({hasChat: true})  //set true so user cannot chat themself and others in chat
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  getDistanceFromUser(profile) {
    FirebaseAPI.getDistanceFromUser(this.state.profile.uid, this.state.user.uid, (distanceKilometers) => {
      const distanceMiles = Math.round(distanceKilometers * 0.621371) + 1

      this.setState({distance: distanceMiles})
    })
  }

  getAge(dateString) {
    console.log(dateString)
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  }

  rejectProfile(profile) {
    const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'Main', params: {index: 2} }),
            ],
            key: null
        });

    Alert.alert(
      ('Delete '+profile.name.split(' ')[0]+'?'),
      'You will not be able to view their profile or messages again.',
      [
        {text: 'OK', onPress: () => {
          FirebaseAPI.rejectProfileFromUser(this.state.user.uid, profile.uid)
          FirebaseAPI.getUserCb(this.state.user.uid, (user) => {
            this.setState({user: user})
          })
          InteractionManager.runAfterInteractions(() => {
            this.props.navigation.dispatch(resetAction);
          })
        }},
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
      ],
      { cancelable: false }
    )
  }

  sendMessageTouchable(profile) {
    if(!this.state.hasChat && this._mounted)
      return(
        <View style={styles.chatButtonContainer}>
          <TouchableOpacity onPress={() => {this.startChat(profile)}} >
            <Text style={styles.chatButton}>Send Message</Text>
          </TouchableOpacity>
        </View>
      )
    else
      return null
  }

  unmatchTouchable(profile) {
    if(this.state.user != this.state.profile && this.state.hasChat && this._mounted)
      return(
        <View style={styles.chatButtonContainer}>
          <TouchableOpacity onPress={() => {this.rejectProfile(profile)}} >
            <Text style={styles.unmatchButton}>Unmatch</Text>
          </TouchableOpacity>
        </View>
      )
    else
      return null
  }

  startChat(profile) {
    FirebaseAPI.watchForNewChat(this.state.user.uid, this.state.profile.uid, (hasChat) => {
      if(this.state.hasChat != hasChat)
        InteractionManager.runAfterInteractions(() => {
          this.setState({hasChat: hasChat})
        })
    })

    this.props.navigation.navigate('Chat', {profile: this.state.profile, user: this.state.user, newChat: true})
  }

  render() {
    const profile = this.props.navigation.state.params.profile
    let milesAway = ' '

    if(this.state.distance != ' ') {
      milesAway = this.state.distance

      milesAway = milesAway != 1 ? (milesAway+' miles away') : (milesAway+' mile away') //Keep proper grammer for 1 mile away
    }
    else
      milesAway = 'Finding location...'
    
    return(
      <View style={styles.container}>  
        <ScrollView style={{flex: height/10*9}}>
          <View style={{flex: 1, marginBottom: height/5*1.2}}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEventThrottle={10} pagingEnabled>      
              {
                'photoUrls' in this.state.user ? this.state.photoUrls.map((url) => {
                  return <Image 
                    resizeMode='cover'
                    source={{uri: url}}
                    style={{width:width, height:width}} 
                    key={profile.uid+"-"+url} />
                }) : null
              }
            </ScrollView>
            <View style={styles.headerContainer}>
              <Text style={styles.name}>{profile.name.split(' ')[0]}</Text>
              <Text style={styles.age}>{this.getAge(profile.birthday)} years old</Text>
              <Text style={styles.gender}>{profile.gender[0].toUpperCase() + profile.gender.slice(1, profile.gender.length+1)}</Text>
              <Text style={styles.gender}>{milesAway}</Text>
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
          </View>
          { this.unmatchTouchable(profile) }
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
    backgroundColor: '#f7fbff',
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
    backgroundColor:'#f7fbff',
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
    fontSize:15,
    color: 'gray',
    textAlign: 'left'
  },
  gender: {
    fontSize:16,
    color: 'gray',
    textAlign: 'left',
    marginBottom: 5,
  },
  chatButtonContainer: {
    height: height/10, 
    justifyContent: 'flex-end', 
    alignItems: 'center'
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
  },
  unmatchButton: {
    width: width,
    marginTop: 100,
    paddingTop: 15,
    paddingBottom: 15,
    justifyContent: 'center',
    textAlign: 'center', 
    color:'white', 
    fontSize:24, 
    backgroundColor: 'gray',
    borderColor: 'lightgrey', 
    borderTopWidth: 3, 
  },
});
