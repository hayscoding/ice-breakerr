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

    const profileUid = this.props.navigation.state.params.profile.uid
    const uid = this.props.navigation.state.params.user.uid

    //Sort uid concatenation in order of greatness so every user links to the same chat
    const uidArray = [uid, profileUid]
    uidArray.sort()
    this.chatID = uidArray[0]+'-'+uidArray[1]

    this.watchChat()
  }

  componentDidMount() {
    // if(this.state.messages.length == 1)
    //   Alert.alert(
    //     ('Here\'s your chat with '+this.state.profile.name.split(' ')[0]+'.'),
    //     'You will be able to view their pictures after they send you 5 messages.'+'\n\n'+'Same goes for them with you.')
  }

  componentDidUpdate() {
    if(this.state.messages.length == 1 && 'cb' in this.props.navigation.state.params) {
      this.props.navigation.state.params.cb(true)
    }
  }

  componentWillUnmount() {
    firebase.database().ref().child('messages').child(this.chatID).off()
  }
  
  watchChat() {
    firebase.database().ref().child('messages').child(this.chatID)
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

      if(messages != this.state.messages)
        this.setState({messages: messages})      
    })
  }

  onSend(message) {
    // if(!this.state.reachedMax) {
    firebase.database().ref().child('messages').child(this.chatID)
      .push({
        text: message[0].text,
        createdAt: new Date().getTime(),
        sender: message[0].user._id,
        name: this.state.user.name 
      })
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