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
      picsShown: false,
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
                  InteractionManager.runAfterInteractions(() => {
                    this.setState({profile: profile, photoUrls: profile.photoUrls, picsShown: true})
                  })            
                else if(this._mounted)
                  InteractionManager.runAfterInteractions(() => {
                    console.log('KNAWLEDGE', profile)
                    this.setState({profile: profile, photoUrls: null})
                  })            
              }
            })
          else if(this._mounted)
            InteractionManager.runAfterInteractions(() => {
              this.setState({profile: profile, photoUrls: profile.photoUrls, picsShown: true})
            })            
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
    const backAction = NavigationActions.back({
            key: null
        });

    Alert.alert(
      ('Delete '+profile.name.split(' ')[0]+'?'),
      'You will not be able to view their profile or messages again.',
      [
        {text: 'OK', onPress: () => {
          FirebaseAPI.rejectProfileFromUser(this.state.user.uid, profile.uid)

          InteractionManager.runAfterInteractions(() => {
            FirebaseAPI.getUserCb(this.state.user.uid, (user) => {
              this.setState({user: user})
            })
          })

          InteractionManager.runAfterInteractions(() => {
            this.props.navigation.dispatch(backAction);
            InteractionManager.runAfterInteractions(() => {
              this.props.navigation.dispatch(backAction);
            })
          })
        }},
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
      ],
      { cancelable: false }
    )
  }

  reportProfile(profile) {
    const backAction = NavigationActions.back({
            key: null
        });

    Alert.alert(
      ('Report '+profile.name.split(' ')[0]+'?'),
      'The Ice Breakerr team will review their profile and you will not be able to view their profile or messages again.',
      [
        {text: 'OK', onPress: () => {
          FirebaseAPI.reportProfileFromUser(this.state.user.uid, profile.uid)
          FirebaseAPI.rejectProfileFromUser(this.state.user.uid, profile.uid)

          FirebaseAPI.getUserCb(this.state.user.uid, (user) => {
            InteractionManager.runAfterInteractions(() => {
              this.setState({user: user})
            })
          })

          if('cb' in this.props.navigation.state.params)
            this.props.navigation.state.params.cb(profile)

          InteractionManager.runAfterInteractions(() => {
            this.props.navigation.dispatch(backAction);
            InteractionManager.runAfterInteractions(() => {
              this.props.navigation.dispatch(backAction);
            })
          })
        }},
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
      ],
      { cancelable: false }
    )
  }

  sendMessageTouchable(profile) {
    if(!(this.state.hasChat || ("matches" in this.state.user && Object.keys(this.state.user.matches).some((uid) => { return uid == profile.uid})))
      && this._mounted)
      return(
        <View style={{height: height/10}}>
          <View style={styles.chatButtonContainer}>
            <TouchableOpacity onPress={() => {this.startChat(profile)}} >
              <Text style={styles.chatButton}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    else
      return null
  }

  buyPicturesTouchable(profile) {
    if(this.state.user.uid != this.state.profile.uid && !this.state.picsShown && this._mounted)
      return(
        <TouchableOpacity onPress={() => {this.props.navigation.navigate('BuyPictures', {profile: this.state.profile, user: this.state.user})}}>
          <View style={styles.chatButtonContainer}>
              <Text style={styles.buyButton}>Buy Pictures</Text>
          </View>
        </TouchableOpacity>
      )
  }

  unmatchTouchable(profile) {
    if(this.state.user.uid != this.state.profile.uid && 
      (this.state.hasChat || ("likes" in this.state.user && Object.keys(this.state.user.likes).some((uid) => { return uid == profile.uid}))) 
      && this._mounted)
      return(
        <TouchableOpacity onPress={() => {this.rejectProfile(profile)}} >
          <View style={styles.chatButtonContainer}>
              <Text style={styles.unmatchButton}>Unmatch</Text>
          </View>
        </TouchableOpacity>
      )
    else
      return null
  }

  reportTouchable(profile) {
    if(this.state.user.uid != this.state.profile.uid && this._mounted)
      return(
        <TouchableOpacity onPress={() => {this.reportProfile(profile)}} >
          <View style={styles.chatButtonContainer}>
            <Text style={styles.reportButton}>Report</Text>
          </View>
        </TouchableOpacity>
      )
    else
      return null
  }

  startChat(profile) {
    this.props.navigation.navigate('Chat', {profile: this.state.profile, 
      user: this.state.user, 
      newChat: true,
      cb: (hasChat) => {
          Alert.alert(
            ('Thanks for starting a chat with '+this.state.profile.name.split(' ')[0]+'.'),
            'You will be able to view their pictures after they send you 5 messages.'+'\n\n'+'Same goes for them with you.')

        this.setState({hasChat: hasChat})
      }})
  }

  render() {    
    const profile = this.state.profile
    let milesAway = ' '

    if(this.state.distance != ' ') {
      milesAway = this.state.distance

      milesAway = milesAway != 1 ? (milesAway+' miles away') : (milesAway+' mile away') //Keep proper grammer for 1 mile away
    }
    else
      milesAway = 'Finding location...'
    
    return(
      <View style={styles.container}>  
        <ScrollView style={{flex: 1}}>
          <View style={{flex: 1, marginBottom: height/5*1.2}}>
            <ScrollView horizontal indicatorStyle={'white'} scrollEventThrottle={10} pagingEnabled> 
              {
                this.state.photoUrls != null ? this.state.photoUrls.map((url) => {
                  return <Image 
                    resizeMode='cover'
                    source={{uri: url}}
                    style={{width:width, height:width}} 
                    key={profile.uid+"-"+url} />
                }) : null
              }
              {
                (() => {
                  if(this.state.profile.gifUrl != "")
                    return <Image 
                      resizeMode='cover'
                      source={{uri: this.state.profile.gifUrl}}
                      style={{width:width, height:width}} 
                      key={profile.uid+"-gifUrl"} />
                })()
              }
            </ScrollView>
            <View style={styles.headerContainer}>
              <Text style={styles.name}>{profile.name.split(' ')[0]}</Text>
              <Text style={styles.age}>{this.getAge(profile.birthday)} years old</Text>
              <Text style={styles.gender}>{"gender" in profile ? profile.gender[0].toUpperCase() + profile.gender.slice(1, profile.gender.length+1) : 'NaN gender'}</Text>
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
          { this.buyPicturesTouchable(profile) }
          { this.reportTouchable(profile) }
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
    flex: 1,
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
  buyButton: {
    width: width,
    paddingTop: 15,
    paddingBottom: 15,
    justifyContent: 'center',
    textAlign: 'center', 
    color:'white', 
    fontSize:24, 
    backgroundColor: '#00d8ff',
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
  reportButton: {
    width: width,
    marginTop: 100,
    paddingTop: 15,
    paddingBottom: 15,
    justifyContent: 'center',
    textAlign: 'center', 
    color:'white', 
    fontSize:24, 
    backgroundColor: 'lightgrey',
    borderColor: 'lightgrey', 
    borderTopWidth: 3, 
  },
});
