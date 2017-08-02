import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  Dimensions, 
  InteractionManager,
  Image, 
  View,
  } from 'react-native';
import { ExpoConfigView } from '@expo/samples';
import * as FirebaseAPI from '../modules/firebaseAPI'

const {height, width} = Dimensions.get('window');
const size = 225;

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Settings',
  };

  componentWillMount() {
    this.state = {
      user: this.props.screenProps.user, 
    }
  }


  showProfile(profile) {
    this.props.navigation.navigate('Profile', {profile: profile, user: this.state.user})
  }

  logout() {
    FirebaseAPI.logoutUser().then(
      () => console.log('signout successful'),
      () => console.log('signout not successful'))
  }

  updateUser(user) {
  }

  editProfile() {
    this.props.navigation.navigate('Edit', 
      {user: this.state.user, cb: (user) => { this.setState({user}) }})
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={() => {this.showProfile(this.state.user)}} >
            <Image
              resizeMode='cover'
              source={{uri: `https://graph.facebook.com/${this.state.user.id}/picture?height=${height}`}}
              style={[{width: size, height: size, borderRadius: size/2}]}/> 
          </TouchableOpacity>
          <Text style={styles.name}>{this.state.user.name}</Text>
        </View> 
        <TouchableOpacity style={styles.optionContainer} onPress={() => {this.editProfile()}}>
          <Text style={styles.option}>EDIT PROFILE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionContainer} onPress={() => {}}>
          <Text style={styles.option}>CONTACT SUPPORT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.optionContainer} onPress={() => {this.logout()}}>
          <Text style={styles.option}>LOGOUT</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  option: {
    marginTop: 15, 
    marginBottom: 15, 
    fontSize: 15, 
    color: '#2B2B2B',
  },
  optionContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: width,
    borderTopWidth: 1,
    borderColor: 'lightgrey',
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'flex-start', 
    alignItems: 'center',
    backgroundColor:'white',
    paddingTop: 25,
    paddingBottom: 10,
  },
  name: {
    color: '#2B2B2B',
    fontSize: 26,
    marginTop: 10,
    marginBottom: 2,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
