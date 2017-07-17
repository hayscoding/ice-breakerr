 import React, {Component} from 'react';
import {
  Animated,
  Alert,
  StyleSheet,
  View,
  Image,
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
export default class Match extends Component {
  static navigationOptions = {
    title: 'Chat',
  };

  componentWillMount() {
    this.state = { 
      messages: [],
      user: this.props.navigation.state.params.user,
      profile: this.props.navigation.state.params.profile, 
      reachedMax: false,
      reachedMax: false, 
      interactionsComplete: false,
    }


    const profileUid = this.props.navigation.state.params.uid
    const uid = this.props.navigation.state.params.user.uid

    //Sort uid concatenation in order of greatness so every user links to the same chat
    const uidArray = [uid, profileUid]
    uidArray.sort()
    this.chatID = uidArray[0]+'-'+uidArray[1]

    this.watchChat()
  }
  
  componentWillUnmount() {
    firebase.database().ref().off()
    firebase.database().ref().child('messages').child(this.chatID).off()
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({interactionsComplete: true});
    });
  }
  nextProfileIndex() {
    this.setState({
      profileIndex:this.state.profileIndex+1
    })
  }

   watchChat() {
    firebase.database().ref().child('messages').child(this.chatID)
      .orderByChild('createdAt')
      .on('value', (snap) => {
      if(this.state.chatLoaded)
        this.setState({chatLoaded: false})

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
        <View>
          	<Text style={styles.name}>{profile.name}</Text>
        </View>
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
  		    <TouchableOpacity style={{justifyContent: 'flex-start', alignItems:'center'}} onPress={() => {}}>
  		      <Text style={{marginTop: 10, marginBottom: 20, fontSize: 40}}></Text>
  		    </TouchableOpacity>
  		  </View>
  		</View>
  	)
	}
}

const styles = StyleSheet.create({
  container: {
    flex: 13,
    borderTopWidth: 2,
    borderColor: 'lightgrey',
    backgroundColor:'white',
  },
  promptText: {
    marginTop: 10, 
    marginBottom: 20,
    margin: 10, 
    fontSize: 28,
    textAlign: 'center'
  },
  promptTouchable: {
    justifyContent: 'flex-start',
    alignItems:'center', 
    height: height/7,
    borderBottomWidth: 2, 
    borderColor: 'gray'
  },
  containerTop: {
    flex: 1,
    marginTop: 5,
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray'
  },
  containerBottom: {
    flex: 1,
    marginTop: 5,
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'gray'
  },
  nameHeader: {
    width: width,
    alignSelf: 'center',
    borderBottomWidth:  1,
    borderColor: 'lightgrey'
  },
  nameHeaderPipe: {
    width: width/5,
    alignSelf: 'center',
  },
  name: {
    color: '#2B2B2B',
    fontSize: 20,   
    textAlign: 'center',
  },
});