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

    this.watchChats()
  }

  componentDidUpdate() {
    // this.watchChats()  
  }

  componentWillUnmount() {
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

  watchChats() {
    FirebaseAPI.watchProfilesInChatsWithKey(this.state.user.uid, (profiles) => {
      this.setState({profiles: profiles.filter((profile) => {
        return profile != undefined
      })})

      console.log('Profile Keys: ', this.state.profiles, ', ', profiles)

      if(this.state.profiles != profiles)
        this.state.profiles.forEach((profile) => {
          const uidArray = [profile.uid, this.state.user.uid]
          uidArray.sort()
          const chatID = uidArray[0]+'-'+uidArray[1]

          FirebaseAPI.getChatCb(chatID, (chat) => {
            const msgCount = Object.values(chat).filter((message) => {
              return message.sender == profile.uid
            }).length

            if(msgCount >= 5) 
              this.setState({photoUrls: [...this.state.photoUrls, {uid: profile.uid, url: `https://graph.facebook.com/${profile.id}/picture?height=${height}`}], loaded: true})
            else
              this.setState({photoUrls: [...this.state.photoUrls, {uid: profile.uid, url: ' '}], loaded: true})
          })
        })
    })
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

  openChat(profile) {
    this.props.navigation.navigate('Chat', {profile: profile, user: this.state.user})
  }

  render() {
    if(this.state.loaded) {
      return(
        <View style={styles.container}>
          <ScrollView style={styles.recentUpdates}>
            {
              this.state.profiles.map((profile) => {
                const fbPhotoUrl = this.state.photoUrls.some((urlObj) => { return urlObj.uid == profile.uid }) ? this.state.photoUrls.find((urlObj) => { return urlObj.uid == profile.uid }).url : ' '
                
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
          </ScrollView>
        </View>
      )
    } else
      return(<View></View>)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fbff',
    alignItems: 'center',
  },
  name: {
    color: '#2B2B2B',
    fontSize: 14,
    paddingLeft: 15,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  messagePreview: {
    color: 'gray',
    fontSize: 12,
    paddingLeft: 15,
    paddingTop: 2,
    textAlign: 'left',
  },
  match: {
    flex: 1,
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
    flex: 1,
    width: width,
  },
});
