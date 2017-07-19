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
} from 'react-native';

import { MonoText } from '../components/StyledText';

import * as FirebaseAPI from '../modules/firebaseAPI'

const {height, width} = Dimensions.get('window');

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Your Chats',
  };

  componentWillMount() {
      this.state = {
        user: this.props.navigation.state.params.user, 
        profiles: []
      }

      FirebaseAPI.watchProfilesInChatsWithKey(this.state.user.uid, (profiles) => {
        this.setState({profiles: profiles})
      })
  }

  openChat(profile) {
    this.props.navigation.navigate('Chat', {profile: profile, user: this.state.user})
  }


  render() {
    return(
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <ScrollView style={styles.recentUpdates}>
          {
            this.state.profiles.map((profile) => {
              return (
                <TouchableOpacity onPress={() => {this.openChat(profile)}}
                key={profile.uid+"-touchable"} >
                  <View style={styles.match}  key={profile.uid+"-container"}>
                    <Text style={styles.name} key={profile.uid+'-name'}>{profile.name}</Text>
                  </View>
                </TouchableOpacity>
              )
            })
          }
      </ScrollView>
        </View>
      </View>
    )
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  name: {
    color: '#2B2B2B',
    fontSize: 15,
    marginTop: 5,
    marginBottom: 2,
    textAlign: 'center'
  },
  match: {
    justifyContent: 'center', 
    alignItems: 'center',
    height: 50,
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
    backgroundColor:'white',
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
  underline: {
    color: '#2B2B2B',
    fontSize: 20,
    marginTop: 5,
    marginBottom: 1,
    textAlign: 'center',
  },
  recentUpdates: {
    flex: 1,
    width: width,
  },
  update: {
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 10,
    marginLeft: 10,
    backgroundColor: '#EDEDED',
    borderRadius: 25,
    overflow: 'hidden',
  },
  badUpdate: {
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 10,
    marginLeft: 10,
    backgroundColor: 'pink',
    borderRadius: 25,
    overflow: 'hidden',
  },
  goodUpdate: {
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 10,
    marginLeft: 10,
    backgroundColor: 'lightgreen',
    borderRadius: 25,
    overflow: 'hidden',
  },
  partyUpdate: {
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 10,
    marginLeft: 10,
    backgroundColor: '#D7B5FF',
    borderRadius: 25,
    overflow: 'hidden',
  },
});
