import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { ExpoLinksView } from '@expo/samples';

import * as FirebaseAPI from '../modules/firebaseAPI'

export default class LinksScreen extends React.Component {
  static navigationOptions = {
    title: 'Members',
  };

  componentWillMount() {
      this.state = { 
        profiles: [],
      }

      FirebaseAPI.getAllUsers((users) => {
        // console.log('users')
        // console.log(users)
        this.setState({profiles: users})
      })
  }

  showProfile(profile) {
    this.props.navigation.navigate('Profile', {profile: profile})
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
});
