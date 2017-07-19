import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Image, Dimensions } from 'react-native';
import { ExpoLinksView } from '@expo/samples';

import * as FirebaseAPI from '../modules/firebaseAPI'

const {height, width} = Dimensions.get('window');
const size = 50;

export default class LinksScreen extends React.Component {
  static navigationOptions = {
    title: 'People Near You',
    headerLeft: null,
    gesturesEnabled: false,
  };

  componentWillMount() {
      this.state = {
        user: this.props.navigation.state.params.user, 
        profiles: [],
      }

      FirebaseAPI.getAllUsers((users) => {
        //Filter out the current user from the other individuals
        this.setState({profiles: users.filter((user) => {
          return user.uid != this.state.user.uid 
        })})
      })
  }

  showProfile(profile) {
    this.props.navigation.navigate('Profile', {profile: profile, user: this.state.user})
  }

  getFbImageUrl(profile) {
    const fbImageUrl = `https://graph.facebook.com/${profile.id}/picture?height=${height}`
    return fbImageUrl
  }

  render() {
    return (
      <ScrollView style={styles.container}>
      {
        this.state.profiles.map((profile) => {
          return (
            <TouchableOpacity onPress={() => {this.showProfile(profile)}}
            key={profile.uid+"-touchable"} >
              <View style={styles.match}  key={profile.uid+"-container"}>
                <Image
                  resizeMode='cover'
                  source={{uri: this.getFbImageUrl(profile)}}
                  style={[{width: size, height: size, borderRadius: size/2}]}/>
                <Text style={styles.name} key={profile.uid+'-name'}>{profile.name}</Text>
              </View>
            </TouchableOpacity>
          )
        })
      }
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  name: {
    color: '#2B2B2B',
    fontSize: 18,
    marginTop: 15,
    paddingLeft: 30,
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
  },
});
