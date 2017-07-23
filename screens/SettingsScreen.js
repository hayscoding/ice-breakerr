import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Text, Dimensions, InteractionManager } from 'react-native';
import { ExpoConfigView } from '@expo/samples';
import * as FirebaseAPI from '../modules/firebaseAPI'

const {height, width} = Dimensions.get('window');

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Settings',
  };

  logout() {
    FirebaseAPI.logoutUser().then(
      () => console.log('signout successful'),
      () => console.log('signout not successful'))
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity style={styles.logout} onPress={() => this.logout()}>
          <Text style={{marginTop: 10, marginBottom: 20, fontSize: 40}}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logout: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    borderTopWidth: 2,
    borderColor: 'gray',
  },
});
