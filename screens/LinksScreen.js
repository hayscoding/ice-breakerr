import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Image, Dimensions } from 'react-native';
import { ExpoLinksView } from '@expo/samples';

import * as FirebaseAPI from '../modules/firebaseAPI'

const {height, width} = Dimensions.get('window');
const size = width/10*7.5;

export default class LinksScreen extends React.Component {
  static navigationOptions = {
    title: 'People Near You',
    headerLeft: null,
    gesturesEnabled: false,
  };

  componentWillMount() {
      this.state = {
        user: this.props.screenProps.user, 
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
      <View style={styles.container}>
        <ScrollView>
        {
          this.state.profiles.map((profile) => {
            return (
              <TouchableOpacity onPress={() => {this.showProfile(profile)}}
              key={profile.uid+"-touchable"} >
                <View style={styles.match}  key={profile.uid+"-container"}>
                  <View style={styles.shadow} key={profile.uid+"-shadow"}>
                    <Image
                      resizeMode='cover'
                      source={{uri: this.getFbImageUrl(profile)}}
                      style={styles.image}/>
                  </View>
                </View>
              </TouchableOpacity>
            )
          })
        }
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    color: '#2B2B2B',
    fontSize: 18,
    marginTop: 15,
    textAlign: 'left',
  },
  match: {
    width: width,
    justifyContent: 'center', 
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  shadow: {
    shadowColor: '#000000', 
    shadowOffset: {width: 0, height: 0}, 
    shadowRadius: 7, 
    shadowOpacity: 0.3,
    borderRadius: size/5,
  },
  image: {
    width: size, 
    height: size,
    borderRadius: size/5,
  }
});
