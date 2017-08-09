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
          <Text style={styles.name}>{this.state.user.name.split(' ')[0]}</Text>
        </View> 
        <View style={styles.columnContainer}>
          <View style={styles.leftColumn}>
             <TouchableOpacity style={styles.optionContainer} onPress={() => {}}>
              <Text style={styles.option}>CONTACT SUPPORT</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rightColumn}>
            <TouchableOpacity style={styles.optionContainer} onPress={() => {this.editProfile()}}>
              <Text style={styles.option}>EDIT PROFILE</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.bottomOptionContainer} onPress={() => {this.logout()}}>
          <Text style={styles.logout}>LOGOUT</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fbff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  columnContainer: {
    flex: 1,
    height: width/3,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftColumn: {
    flex: 1,
    width: width/4,
    height: width/4,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  rightColumn: {
    flex: 1,
    width: width/4,
    height: width/4,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderColor: 'lightgrey',
  },
  option: {
    marginTop: 15, 
    marginBottom: 15, 
    fontSize: 20, 
    color: '#2B2B2B',
    alignSelf: 'center',
    textAlign: 'center',
    color: 'gray',
  },
  optionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width/4,
    height: width/4,
    // backgroundColor: 'white',
    // borderWidth: 1,
    // borderColor: 'lightgrey',
    // borderRadius: 360,
    // shadowColor: '#000000', 
    // shadowOffset: {width: 0, height: 0}, 
    // shadowRadius: 5, 
    // shadowOpacity: 0.1,
  },
  profileContainer: {
    flex: 1,
    justifyContent: 'flex-start', 
    alignItems: 'center',
    paddingTop: 25,
  },
  name: {
    color: '#2B2B2B',
    fontSize: 26,
    marginTop: 10,
    marginBottom: 2,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  logout: {
    fontSize: 20, 
    color: '#2B2B2B',
    alignSelf: 'center',
    textAlign: 'center',
  },
  bottomOptionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: 'lightgrey',
    paddingBottom: 15,
    paddingTop: 15,
    shadowColor: '#000000', 
    shadowOffset: {width: 0, height: 0}, 
    shadowRadius: 5, 
    shadowOpacity: 0.1,
  },
});
