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
const size = height/11.5;
const matchBarGifSize = height/9;

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
      initialMatches: [],
      loaded: false,
      messagePreviews: [],
    }
  }

  componentDidMount() {
    this.watchChatsAndProfiles()
    this.watchUserForNewRejections()

    this._navigating = false
    console.log('DID MOUNT homescreen')
  }

  componentDidUpdate() {
    this.removeMatchesInChat()

    if(this.state.profiles.length > 0){
      this.listenLastMessages(this.state.profiles)
    }
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
      const oldProfiles = this.state.profiles

      if(profiles.map((profile) => {return profile.uid}).sort().join(',') != oldProfiles.map((profile) => {return profile.uid}).sort().join(',')){ 
        FirebaseAPI.getUserCb(this.state.user.uid, (updatedUser) => {
          this.setState({profiles: profiles.filter((profile) => {
              return (profile != undefined && updatedUser.rejections != undefined) ? !Object.keys(updatedUser.rejections).some((uid) => { return uid == profile.uid }) : true
            }),
            loaded: true,
          })
        })
      }
    })
  }

  removeMatchesInChat() {
    this.state.initialMatches.forEach((match) => {
      if(this.state.profiles.some((profile) => { return match.uid == profile.uid })) {
        const index = this.state.initialMatches.findIndex((match) => { 
          return this.state.profiles.some((profile) => { return profile.uid == match.uid})
        })
        const updatedMatches = this.state.initialMatches

        updatedMatches.splice(index, 1)

        InteractionManager.runAfterInteractions(() => {
          this.setState({initialMatches: updatedMatches})
        })
      }
    })
  }

  getMatchProfiles(updatedMatches) {
    const profiles = []

    if(updatedMatches.length != 0)
      updatedMatches.forEach((match) => {
          FirebaseAPI.getUserCb(match, (profile) => {
            profiles.push(profile)

            InteractionManager.runAfterInteractions(() => {
              this.setState({initialMatches: profiles})
            })
        })
      })
    else
      InteractionManager.runAfterInteractions(() => {
        this.setState({initialMatches: []})
      })
  }

  getMatches(updatedUser) {
      const matches = "matches" in updatedUser ? Object.keys(updatedUser.matches).filter((match) => { 
        return "rejections" in updatedUser ? !Object.keys(updatedUser.rejections).some((uid) => { return uid == match }) : true
      }).filter((match) => {
        return !this.state.profiles.some((user) => { return user.uid == match })
      }) : []

      this.getMatchProfiles(matches)
  }

  watchUserForNewRejections() {
      FirebaseAPI.watchUser(this.state.user.uid, (updatedUser) => {
        InteractionManager.runAfterInteractions(() => {
          this.setState({user: updatedUser})
        })

        const updatedMatchKeys = "matches" in updatedUser ? Object.keys(updatedUser.matches).filter((match) => { 
          return "rejections" in updatedUser ? !Object.keys(updatedUser.rejections).some((uid) => { return uid == match }) : true
        }).filter((match) => {
            return !this.state.profiles.some((user) => { return user.uid == match })
        }) : []
        const currentMatchKeys = this.state.initialMatches.map((match) => {return match.uid})
        
        this.getMatches(updatedUser)
        

        if(this.getNewRejection(updatedUser) != null) {
          const newRejectionUid = this.getNewRejection(updatedUser)
          const newRejectedProfile = this.state.profiles.find((profile) => {
             return profile.uid == newRejectionUid
          })

          const profilesIndex = this.state.profiles.indexOf(newRejectedProfile)

          // console.log('mypenileindex is huge', index)
          if(profilesIndex != -1) {
            let updatedProfiles = this.state.profiles
            updatedProfiles.splice(profilesIndex, 1)

            if(updatedProfiles.map((profile) => {return profile.uid}).sort() != this.state.profiles.map((profile) => {return profile.uid}).sort()) {
              InteractionManager.runAfterInteractions(() => {
                this.setState({profiles: updatedProfiles})
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

  listenLastMessages(profiles) {
    profiles.forEach((profile) => {
      const uidArray = [profile.uid, this.state.user.uid]
      uidArray.sort()
      const chatID = uidArray[0]+'-'+uidArray[1]

      firebase.database().ref().child('messages').child(chatID)
        .orderByChild('createdAt')
        .off()

      firebase.database().ref().child('messages').child(chatID)
        .orderByChild('createdAt')
        .on('value', (snap) => {
          let messages = []

          snap.forEach((child) => {
            const date = child.val().createdAt
            messages.push({
              otherUser: profile.uid,
              text: child.val().text,
              _id: child.key,
              createdAt: date,
              read: child.val().read,
              user: {
                _id: child.val().sender,
                name: child.val().name
              }
            })
          });

          messages.reverse()

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

          let updatedMessages = this.state.messagePreviews
          let updatedProfiles = this.state.profiles

          console.log('updatedMessages', updatedMessages, this.state.messagePreviews)

          if(!this.state.messagePreviews.some((msg) => { return msg.otherUser == profile.uid })) {
            const profileIndex = updatedProfiles.findIndex((profile) => { return profile.uid == messages[0].otherUser })
            const shiftingProfile = updatedProfiles[profileIndex]

            updatedProfiles.splice(profileIndex, 1)
            updatedProfiles.unshift(shiftingProfile)

            updatedMessages.unshift(messages[0])

            InteractionManager.runAfterInteractions(() => {
              this.setState({profiles: updatedProfiles, messagePreviews: updatedMessages})
            })
          }

          if(this.state.messagePreview != [] &&
            this.state.messagePreviews.some((msg) => { return msg.otherUser == profile.uid }) &&
            this.state.messagePreviews.find((msg) => { return msg.otherUser == profile.uid })._id != messages[0]._id) {
            const msgIndex = updatedMessages.findIndex((msg) => {return msg.otherUser == messages[0].otherUser})
            const profileIndex = updatedProfiles.findIndex((profile) => { return profile.uid == messages[0].otherUser })
            const shiftingProfile = updatedProfiles[profileIndex]

            updatedProfiles.splice(profileIndex, 1)
            updatedProfiles.unshift(shiftingProfile)

            updatedMessages.splice(msgIndex, 1)
            updatedMessages.unshift(messages[0])

            InteractionManager.runAfterInteractions(() => {
              this.setState({profiles: updatedProfiles, messagePreviews: updatedMessages})
            })
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
    console.log('RENDERING HOME SCREEN')
    // console.log('initialMatches', this.state.initialMatches)
    // console.log('false', this.state.loaded)
    // console.log(this.state.messagePreviews)
    console.log("renderProfiles", this.state.profiles)
    const profiles = this.state.profiles

    if(this.state.loaded && this.state.profiles.length > 0 && this.state.profiles.length == this.state.messagePreviews.length) {
      profiles.sort((a, b) => {
        const aMsg = this.state.messagePreviews.find((msg) => {
          return msg.otherUser == a.uid
        })
        const bMsg = this.state.messagePreviews.find((msg) => {
          return msg.otherUser == b.uid
        })

        console.log(new Date(aMsg.createdAt) - new Date(bMsg.createdAt))

        return new Date(aMsg.createdAt) - new Date(bMsg.createdAt)
      }).reverse()

      return(
        <View style={styles.container}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{height: height/7, borderBottomWidth: 1, borderColor: 'lightgrey',}}> 
            <View style={styles.newMatches}>
            {
              this.state.initialMatches.map((match) => {
                if(typeof match === 'object')
                  return(
                    <TouchableOpacity onPress={() => {this.openChat(match)}}
                      key={match.uid+"-touchable"} >
                      <View style={{width: matchBarGifSize+20, justifyContent: 'flex-start', paddingLeft: 10, paddingRight: 10}} key={match.uid+'init-match-container'}>
                        <Image
                        resizeMode='cover'
                        source={{uri: match.gifUrl}}
                        style={{width: matchBarGifSize, height: matchBarGifSize, borderRadius: matchBarGifSize/2,}}
                        key={match.uid+'gif-preview'}/> 
                      </View>
                    </TouchableOpacity>
                  )
              })
            }
            </View>
          </ScrollView>
          <ScrollView style={styles.recentUpdates}>
            <View style={{width: width, height: height/8*7}}>
            {
              profiles.map((profile) => {
                const fbPhotoUrl = this.state.photoUrls.find((urlObj) => { return urlObj.uid == profile.uid }) != undefined ? this.state.photoUrls.find((urlObj) => { return urlObj.uid == profile.uid }).url : ' '
                const message = this.state.messagePreviews.find((msg) => { 
                  return msg.otherUser == profile.uid 
                })
                const hasRead = message.user._id != this.state.user.uid ? message.read : true
                const name = !hasRead ? (profile.name.split(' ')[0]+' *') : profile.name.split(' ')[0]

                return (
                  <TouchableOpacity onPress={() => {this.openChat(profile)}}
                  key={profile.uid+"-touchable"} >
                      <View style={styles.match}  key={profile.uid+"-container"}>
                        <Image
                          resizeMode='cover'
                          source={{uri: fbPhotoUrl}}
                          style={[{width: size, height: size, borderRadius: size/4, alignSelf: 'center'}]}/>  
                        <View>   
                          <Text style={styles.name} key={profile.uid+'-name'}>{name}</Text>
                          <Text style={styles.messagePreview} key={profile.uid+'-preview'}>{message.text}</Text>
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
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{height: height/7, borderBottomWidth: 1, borderColor: 'lightgrey',}}> 
            <View style={styles.newMatches}>
              <TouchableOpacity onPress={() => {}}
                key={'fake'+"-touchable"} >
                <View style={{width: matchBarGifSize+20, justifyContent: 'flex-start', paddingLeft: 10, paddingRight: 10}} key={'fake'+'init-match-container'}>
                  <Image
                  resizeMode='cover'
                  source={{uri: 'http://i.imgur.com/HNfWmVu.jpg'}}
                  style={{width: matchBarGifSize, height: matchBarGifSize, borderRadius: matchBarGifSize/2,}}
                  key={'fake'+'gif-preview'}/> 
                </View>
              </TouchableOpacity>
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
    height: height/7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  name: {
    color: '#2B2B2B',
    fontSize: 14,
    paddingLeft: 15,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  messagePreview: {
    width: (width/1.4),
    height: 26,
    lineHeight: 12,
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
    paddingLeft: 20,
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
    height: height/7*5,
    width: width,
  },
});
