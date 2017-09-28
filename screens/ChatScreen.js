 import React, {Component} from 'react';
import {
  Animated,
  Alert,
  StyleSheet,
  View,
  Image,
  Button, 
  Text,
  TouchableOpacity, 
  Dimensions,
  InteractionManager,
  ActivityIndicator
} from 'react-native'

import moment from 'moment'

import { GiftedChat } from 'react-native-gifted-chat'

import * as firebase from 'firebase'
import * as FirebaseAPI from '../modules/firebaseAPI'

import * as ServerAPI from '../modules/serverAPI'

const {height, width} = Dimensions.get('window');
const size = 50;

export default class ChatScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    //Sort uid concatenation in order of greatness so every user links to the same chat
    if('newChat' in navigation.state.params && navigation.state.params.newChat == true)
      return({
        title: `${navigation.state.params.profile.name.split(' ')[0]}`,
        headerRight: null,
      })
    else
      return({
        title: `${navigation.state.params.profile.name.split(' ')[0]}`,
        headerRight: (<Button title='Info'
            onPress={() => {
              if(!this._navigating) {
                this._navigating = true

                navigation.navigate('Profile', {profile: navigation.state.params.profile, user: navigation.state.params.user})

                setTimeout(() => {
                  this._navigating = false
                }, 1000)
              }
        }} />)
      })
  };


  componentWillMount() {
    this.state = { 
      messages: [],
      user: this.props.navigation.state.params.user,
      profile: this.props.navigation.state.params.profile,
    }
  }

  componentDidMount() {
    // if(this.state.messages.length == 1)
    //   Alert.alert(
    //     ('Here\'s your chat with '+this.state.profile.name.split(' ')[0]+'.'),
    //     'You will be able to view their pictures after they send you 5 messages.'+'\n\n'+'Same goes for them with you.')
    InteractionManager.runAfterInteractions(() => {
      const profileUid = this.props.navigation.state.params.profile.uid
      const uid = this.props.navigation.state.params.user.uid

      //Sort uid concatenation in order of greatness so every user links to the same chat
      const uidArray = [uid, profileUid]
      uidArray.sort()
      this.chatID = uidArray[0]+'-'+uidArray[1]

      this.watchChat()
    })
  }

  componentWillUnmount() {
    firebase.database().ref().child('messages').child(this.chatID)
      .orderByChild('createdAt')
      .off()

    if(this.state.messages.length >= 1 && 'cb' in this.props.navigation.state.params) {
      this.props.navigation.state.params.cb(true)
    }
  }

  watchChat() {
    if(this.chatID != undefined) {
      firebase.database().ref().child('messages').child(this.chatID)
        .orderByChild('createdAt')
        .off()

      firebase.database().ref().child('messages').child(this.chatID)
        .orderByChild('createdAt')
        .on('value', (snap) => {
            let precountMsgs = [] //Needs to count messages beforehand so avatar will show on initial loads
            snap.forEach((child) => {
              const date = moment(child.val().createdAt).format()
              precountMsgs.push({
                user: {
                  _id: child.val().sender,
                }
              })
            });

            const canShowAvatar = precountMsgs.filter((msg) => {
                    return msg.user._id == this.state.profile.uid
                  }).length >= 3 ? true : false
            const avatarUrl = canShowAvatar ? this.state.profile.photoUrls[0] : null

            let messages = []
            snap.forEach((child) => {
              const date = moment(child.val().createdAt).format()
              messages.push({
                text: child.val().text,
                _id: child.key,
                createdAt: date,
                user: {
                  _id: child.val().sender,
                  name: child.val().name,
                  avatar: avatarUrl,
                }
              })
            });
            messages.reverse()


            if(messages.map((msg) => {return msg._id}).join(',') != this.state.messages.map((msg) => {return msg._id}).join(',')) {
              InteractionManager.runAfterInteractions(() => {
                this.setState({messages: messages})
                FirebaseAPI.setReceivedMessagesReadTrue(this.chatID, this.state.user.uid)
              })
            }
      })
    }
  }

  showProfile() {
    if(!this._navigating) {
      this._navigating = true

      this.props.navigation.navigate('Profile', {profile: this.state.profile, user: this.state.user})

      setTimeout(() => {
        this._navigating = false
      }, 1000)
    }
  }

  onSend(message) {
    firebase.database().ref().child('messages').child(this.chatID)
      .push({
        text: message[0].text,
        createdAt: new Date().getTime(),
        sender: message[0].user._id,
        name: this.state.user.name,
        read: false,
      })

    const pushToken = 'pushToken' in this.state.profile ? this.state.profile.pushToken : 'No push token'

    ServerAPI.postMessageNotificationToUid(this.state.user.name.split(' ')[0], pushToken, message[0].text)
  }

  render() {
    const {
      user,
      profile
    } = this.state

  	return(
  		<View style={{flex: 1}}>
  		  <View style={styles.container}>
  		  	<View style={{flex:1, borderBottomWidth: 1, borderColor: 'gray'}} >
            <GiftedChat
              messages={this.state.messages}
              onSend={(m) => this.onSend(m)}
              onPressAvatar={() => {this.showProfile()}}
              renderTime={() => {}}
              user={{
                _id: this.state.user.uid,
              }} />
          </View>
  		  </View>
  		</View>
  	)
	}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'white',
  },
  name: {
    backgroundColor:'white',
    fontSize: 20,   
    textAlign: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
});