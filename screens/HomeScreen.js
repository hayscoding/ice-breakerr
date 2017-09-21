import React from 'react';
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  InteractionManager,
} from 'react-native';

import { MonoText } from '../components/StyledText';

import moment from 'moment'

import firebase from 'firebase'
import * as FirebaseAPI from '../modules/firebaseAPI'

const {height, width} = Dimensions.get('window');
const size = 50;

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Your Chats',
    headerLeft: null,
    gesturesEnabled: false,
  };

  componentWillMount() {
    this.state = {
      user: this.props.screenProps.user, 
      profiles: [],
      photoUrls: [],
      loaded: false,
    }
  }

  componentDidMount() {
    this.watchChatsAndProfiles()
      this.watchUserForNewRejections()

    this._navigating = false
    console.log('DID MOUNT homescreen')
  }

  componentWillUnmount() {
    console.log('unmounting homescreen')
    FirebaseAPI.turnOffChatListener()

    if(this.state.profiles.length > 0)
      this.state.profiles.map((profile) => {
        const uidArray = [profile.uid, this.state.user.uid]
        uidArray.sort()
        const chatID = uidArray[0]+'-'+uidArray[1]

        firebase.database().ref().child('messages').child(chatID)
          .orderByChild('createdAt')
          .off()
      })
  }

  watchChatsAndProfiles() {
    FirebaseAPI.watchChatsWithProfilesInKey(this.state.user.uid, (profiles) => {
      console.log('UPDATEING PROFILES')
      FirebaseAPI.getUserCb(this.state.user.uid, (updatedUser) => {
        this.setState({profiles: profiles.filter((profile) => {
        return (profile != undefined && updatedUser.rejections != undefined) ? !Object.keys(updatedUser.rejections).some((uid) => { return uid == profile.uid }) : true
        }), 
        loaded: true })

        InteractionManager.runAfterInteractions(() => {
          this.listenProfileUrls()
        })
      })
    })

  }

  watchUserForNewRejections() {
      FirebaseAPI.watchUser(this.state.user.uid, (updatedUser) => {
        console.log('IS THIS EVEN GETTING CALLED')
        if(this.getNewRejection(updatedUser) != null) {
          const newRejectionUid = this.getNewRejection(updatedUser)
          const newRejectedProfile = this.state.profiles.find((profile) => {
             return profile.uid == newRejectionUid
          })

          const index = this.state.profiles.indexOf(newRejectedProfile)
          // console.log('mypenileindex is huge', index)
          if(index != -1) {
            const updatedProfiles = this.state.profiles
            updatedProfiles.splice(index, 1)

            if(updatedProfiles.map((profile) => {return profile.uid}).sort() != this.state.profiles.map((profile) => {return profile.uid}).sort()) {
              InteractionManager.runAfterInteractions(() => {
                this.setState({profiles: updatedProfiles, user: updatedUser})
              })
            }
          }
        }
      })
  }

  getNewRejection(updatedUser) {
    if(updatedUser != undefined 
      && 'rejections' in updatedUser 
      && this.state.user.rejection != Object.keys(updatedUser.rejections)) {
      return Object.keys(updatedUser.rejections).filter((newUid) => {
        if(this.state.user.rejections != undefined)
          return !Object.keys(this.state.user.rejections).some((pastUid) => { return pastUid == newUid})
        else
          return newUid
      })[0]
    }
  }

  listenLastMessage(profile) {
    const uidArray = [profile.uid, this.state.user.uid]
    uidArray.sort()
    const chatID = uidArray[0]+'-'+uidArray[1]

    let recentMessage = ''

    firebase.database().ref().child('messages').child(chatID)
      .orderByChild('createdAt')
      .on('value', (snap) => {
        let messages = []

        snap.forEach((child) => {
          const date = moment(child.val().createdAt).format()
          messages.push({
            text: child.val().text,
            _id: child.key,
            createdAt: date,
            user: {
              _id: child.val().sender,
              name: child.val().name
            }
          })
        });

        messages.reverse()

        recentMessage = messages[0]
    })

    return recentMessage.text != undefined ? recentMessage.text : ' '
  }

  listenProfileUrls() {
      this.state.profiles.forEach((profile) => {
        const uidArray = [profile.uid, this.state.user.uid]
        uidArray.sort()
        const chatID = uidArray[0]+'-'+uidArray[1]

        firebase.database().ref().child('messages').child(chatID)
          .orderByChild('createdAt')
          .on('value', (snap) => {
            let messages = []

            snap.forEach((child) => {
              const date = moment(child.val().createdAt).format()
              messages.push({
                text: child.val().text,
                _id: child.key,
                createdAt: date,
                user: {
                  _id: child.val().sender,
                  name: child.val().name
                }
              })
            });

            const msgCount = messages.filter((msg) => {
              return msg.user._id == profile.uid
            }).length
            // console.log(profile.name, msgCount)

            if(this.state.profilesUrls != [] && this.state.photoUrls.some((urlObj) => {
              return urlObj.uid == profile.uid
            })) {
              const profileUrlObj = this.state.photoUrls.find((urlObj) => {
                return urlObj.uid == profile.uid
              })
              const index = this.state.photoUrls.indexOf(profileUrlObj)
              const updatedPhotoUrls = this.state.photoUrls

              if(msgCount >= 5) {
                const newUrl = 'photoUrls' in profile ? profile.photoUrls[0] : ' '

                updatedPhotoUrls[index].url = newUrl

                if(updatedPhotoUrls[index] != profileUrlObj)
                  InteractionManager.runAfterInteractions(() => {
                    this.setState({photoUrls: updatedPhotoUrls})
                  })
              } else {
                const newUrl = ' '

                updatedPhotoUrls[index].url = newUrl

                if(updatedPhotoUrls[index] != profileUrlObj)
                  InteractionManager.runAfterInteractions(() => {
                    this.setState({photoUrls: updatedPhotoUrls})
                  })
              } 
            } else {
              if(msgCount >= 5) {
                const newUrl = 'photoUrls' in profile ? profile.photoUrls[0] : ' '

                InteractionManager.runAfterInteractions(() => {
                  this.setState({photoUrls: [...this.state.photoUrls, {uid: profile.uid, url: newUrl}]})
                })
              } else {
                const newUrl =  ' '

                InteractionManager.runAfterInteractions(() => {
                  this.setState({photoUrls: [...this.state.photoUrls, {uid: profile.uid, url: newUrl}]})
                })
              } 
            }
        })
    })
  }

  openChat(profile) {
    InteractionManager.runAfterInteractions(() => {
      if(!this._navigating) {
        this._navigating = true

        this.props.navigation.navigate('Chat', {profile: profile, user: this.state.user})
      }
    })

    setTimeout(() => {
      this._navigating = false
    }, 1000)
  }

  render() {
    // console.log(this.state.loaded, this.state.profiles.length)
    if(this.state.loaded && this.state.profiles.length > 0) {
      return(
        <View style={styles.container}>
          <ScrollView horizontal> 
            <View style={styles.newMatches}>
            </View>
          </ScrollView>
          <ScrollView style={styles.recentUpdates}>
            <View style={{width: width, height: height/8*7}}>
            {
              this.state.profiles.map((profile) => {
                const fbPhotoUrl = this.state.photoUrls.find((urlObj) => { return urlObj.uid == profile.uid }) != undefined ? this.state.photoUrls.find((urlObj) => { return urlObj.uid == profile.uid }).url : ' '
                
                return (
                  <TouchableOpacity onPress={() => {this.openChat(profile)}}
                  key={profile.uid+"-touchable"} >
                      <View style={styles.match}  key={profile.uid+"-container"}>
                        <Image
                          resizeMode='cover'
                          source={{uri: fbPhotoUrl}}
                          style={[{width: size, height: size, borderRadius: size/4}]}/>  
                        <View>   
                          <Text style={styles.name} key={profile.uid+'-name'}>{profile.name.split(' ')[0]}</Text>
                          <Text style={styles.messagePreview} key={profile.uid+'-preview'}>{this.listenLastMessage(profile)}</Text>
                        </View>
                      </View>
                  </TouchableOpacity>
                )
              })
            }
            </View>
          </ScrollView>
          <View style={{height: width/7, width: width, alignSelf: 'flex-end', backgroundColor: '#efefef',}}></View>
        </View>
      )
    } else {
      return(
        <View style={styles.container}>
          <ScrollView horizontal> 
            <View style={styles.newMatches}>
            </View>
          </ScrollView>
          <ScrollView style={styles.recentUpdates}>
            <View style={{width: width, height: height/8*7}}>
              <View style={styles.match}>
                <Image
                  resizeMode='cover'
                  source={{uri: ' '}}
                  style={[{width: size, height: size, borderRadius: size/4}]}/>  
                <View>   
                  <Text style={styles.name}>Send someone a message!</Text>
                  <Text style={styles.messagePreview}>Your chats will appear here.</Text>
                </View>
              </View>
            </View>
          </ScrollView>
          <View style={{height: width/7, width: width, alignSelf: 'flex-end', backgroundColor: '#efefef',}}></View>
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fbff',
    justifyContent: 'flex-start',
  },
  newMatches: {
    width: width,
    height: height/7,
    backgroundColor: 'white',
  },
  name: {
    color: '#2B2B2B',
    fontSize: 14,
    paddingLeft: 15,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  messagePreview: {
    flex: 1,
    width: (width/1.5)+30,
    height: 28,
    color: 'gray',
    fontSize: 12,
    paddingLeft: 15,
    marginRight: 15,
    paddingTop: 2,
    textAlign: 'left',
  },
  match: {
    height: height/9,
    width: width,
    flexDirection: 'row',
    justifyContent: 'flex-start', 
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
    backgroundColor:'white',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 30,
    shadowColor: '#000000', 
    shadowOffset: {width: 0, height: 0}, 
    shadowRadius: 7, 
    shadowOpacity: 0.1,
  },
  mainTitle: {
    height: height/20,
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor:'white',
    width: width/6*5,
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  recentUpdates: {
    height: height/7*6,
    width: width,
    borderTopWidth: 1,
    borderTopColor: 'lightgrey',
  },
});
