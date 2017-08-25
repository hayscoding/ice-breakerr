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

    this._navigating = false
  }

  componentDidMount() {
    this.watchUserForChanges()
  }


  watchUserForChanges() {
    if(this.state.user != null)
      FirebaseAPI.watchUser(this.state.user.uid, (user) => {
        if(user != this.state.user)
          InteractionManager.runAfterInteractions(() => {
            this.setState({user})
          })
      })
  }

  showProfile(profile) {
    InteractionManager.runAfterInteractions(() => {
      if(!this._navigating) {
        this._navigating = true

        this.props.navigation.navigate('Profile', {profile: profile, user: this.state.user})
        
        setTimeout(() => {
          this._navigating = false
        }, 500)
      }
    })
  }

  referral() {
    if(!this._navigating) {
      this._navigating = true

      this.props.navigation.navigate('Referral', 
        {user: this.state.user, cb: (user) => { this.setState({user}) }})

      setTimeout(() => {
        this._navigating = false
      }, 500)
    }
  }

  logout() {
    FirebaseAPI.logoutUser().then(
      () => console.log('signout successful'),
      () => console.log('signout not successful'))
  }

  updateUser(user) {
  }

  editProfile() {
    if(!this._navigating) {
      this._navigating = true

      this.props.navigation.navigate('Edit', 
        {user: this.state.user, cb: (user) => { this.setState({user}) }})

      setTimeout(() => {
        this._navigating = false
      }, 500)
    }

  }

  render() {
    let editProfileStyle = styles.optionContainer

    if(this.state.user.bio == '' || 
      this.state.user.emojis == '' || 
      this.state.user.interests == '')
      editProfileStyle = styles.greenOptionContainer

    return (
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={() => {this.showProfile(this.state.user)}} >
            <Image
              resizeMode='cover'
              source={{uri: 'photoUrls' in this.state.user ? this.state.user.photoUrls[0] : ' '}}
              style={[{width: size, height: size, borderRadius: size/2}]}/> 
          </TouchableOpacity>
          <Text style={styles.name}>{this.state.user.name.split(' ')[0]}</Text>
        </View> 
        <View style={styles.columnContainer}>
          <View style={styles.leftColumn}>
             <TouchableOpacity style={styles.optionContainer} onPress={() => {}}>
              <Text style={styles.option}>GET A COFFEE DATE</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rightColumn}>
            <TouchableOpacity style={editProfileStyle} onPress={() => {this.editProfile()}}>
              <Text style={styles.option}>EDIT PROFILE</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={{flex: 1}} onPress={() => {this.referral()}}>
          <View style={styles.bottomOptionContainer}>
              <Text style={styles.logout}>Refer A Friend</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={{flex: 1}} onPress={() => {this.logout()}}>
          <View style={styles.bottomOptionContainer}>
              <Text style={styles.logout}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fbff',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  columnContainer: {
    width: width,
    height: (width/8)+50,
    marginBottom: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftColumn: {
    flex: 1,
    width: width/4,
    height: width/5,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  rightColumn: {
    flex: 1,
    width: width/4,
    height: width/5,
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
    height: width/5,
  },
  greenOptionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width/4,
    height: width/5,
    backgroundColor: 'lightgreen',
    borderRadius: 25,
  },
  profileContainer: {
    width: width,
    height: height/3*1.4,
    justifyContent: 'flex-start', 
    alignItems: 'center',
    paddingTop: 25,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
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
    fontSize: 24, 
    color: '#2B2B2B',
    alignSelf: 'center',
    textAlign: 'center',
  },
  bottomOptionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    paddingTop: width/14,
    paddingBottom: width/14,
    borderTopWidth: 1,
    borderColor: 'lightgrey',
    backgroundColor: 'white',
  },
});
