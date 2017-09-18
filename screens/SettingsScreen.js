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
import * as FirebaseAPI from '../modules/firebaseAPI'

import * as ServerAPI from '../modules/serverAPI'

const {height, width} = Dimensions.get('window');
const size = 225;

export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    title: 'Settings',
    headerLeft: null,
    gesturesEnabled: false,
  };

  componentWillMount() {
    this.state = {
      user: this.props.screenProps.user, 
    }

    this._navigating = false
  }

  componentDidMount() {
    this._navigating = false

    this.watchUserForChanges()
  }

  componentWillUnmount() {
    FirebaseAPI.removeWatchUser(this.state.user.uid)
  }

  watchUserForChanges() {
    if(this.state.user != null)
      FirebaseAPI.watchUser(this.state.user.uid, (user) => {
        if(user != this.state.user)
          InteractionManager.runAfterInteractions(() => {
            this.setState({user: user})
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
        }, 1000)
      }
    })
  }

  showGetADate() {
    InteractionManager.runAfterInteractions(() => {
      if(!this._navigating) {
        this._navigating = true

        this.props.navigation.navigate('GetADate', {user: this.state.user, cb: (user) => { this.setState({user})} })
        
        setTimeout(() => {
          this._navigating = false
        }, 1000)
      }
    })
  }

  referral() {
    if(!this._navigating) {
      this._navigating = true

      this.props.navigation.navigate('Referral', 
        {user: this.state.user, cb: (user) => { this.setState({user})} })

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

  changeGif() {
    if(!this._navigating) {
      this._navigating = true

      this.props.navigation.navigate('AddGif', 
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
              source={{uri: this.state.user.gifUrl != "" ? this.state.user.gifUrl : 'photoUrls' in this.state.user ? this.state.user.photoUrls[0] : ' '}}
              style={[{width: size, height: size, borderRadius: size/2}]}/> 
          </TouchableOpacity>
          <Text style={styles.name}>{this.state.user.name.split(' ')[0]}</Text>
        </View> 
        <View style={styles.columnContainer}>
          <View style={styles.leftColumn}>
             <TouchableOpacity style={styles.optionContainer} onPress={() => {this.showGetADate()}}>
              <Text style={styles.option}>GET A COFFEE DATE</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.centerColumn}>
             <TouchableOpacity style={styles.optionContainer} onPress={() => {this.changeGif()}}>
              <Text style={styles.option}>CHANGE GIF</Text>
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
        <View style={styles.spacer}></View>
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
    height: (width/6)+70, 
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftColumn: {
    flex: 1,
    width: width/4,
    height: width/6,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  centerColumn: {
    flex: 1,
    width: width/4,
    height: width/6,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderColor: 'lightgrey',
  },
  rightColumn: {
    flex: 1,
    width: width/4,
    height: width/6,
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
    height: width/6,
  },
  greenOptionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width/4,
    height: width/6,
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
    height:width/7,
    borderTopWidth: 1,
    borderColor: 'lightgrey',
    backgroundColor: 'white',
  },
  spacer: {
    flex: 1,
    height: 10,
    backgroundColor: 'lightgrey',
  },
});
