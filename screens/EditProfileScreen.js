import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity, 
  Dimensions,
  InteractionManager,
  Icon,
  ScrollView,
  TextInput,
  findNodeHandle,
} from 'react-native';

import * as FirebaseAPI from '../modules/firebaseAPI'

const {height, width} = Dimensions.get('window');

export default class EditProfileScreen extends React.Component {
  componentWillMount() {
    this.state = {
      user: this.props.navigation.state.params.user, 
    }

    this._mounted = false
  }

  componentDidMount() {
    //Set this true so no warning appears if component unmounts during process
    this._mounted = true
  }

  componentWillUnmount() {
    this._mounted = false
  }

  setBio(bio) {
    FirebaseAPI.updateUser(this.state.user.uid, 'bio', bio)

    const updatedUser = this.state.user
    updatedUser.bio = bio

    this.setState({user: updatedUser})
    this.props.navigation.state.params.cb(updatedUser)
  }

  setEmojis(emojis) {
    FirebaseAPI.updateUser(this.state.user.uid, 'emojis', emojis)

    const updatedUser = this.state.user
    updatedUser.emojis = emojis

    this.setState({user: updatedUser})
    this.props.navigation.state.params.cb(updatedUser)
  }

  setInterests(interests) {
    FirebaseAPI.updateUser(this.state.user.uid, 'interests', interests)

    const updatedUser = this.state.user
    updatedUser.interests = interests

    this.setState({user: updatedUser})
    this.props.navigation.state.params.cb(updatedUser)
  }


  // Scroll a component into view. Just pass the component ref string.
  textInputFocused(refName) {
    setTimeout(() => {
      let scrollResponder = this.refs.scrollView.getScrollResponder();
      scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
        findNodeHandle(this.refs[refName]),
        200, //additionalOffset
        true
      );
    }, 50);
  }

  getPhotos() {
    if(this.state.user.photoUrls != undefined)
      return this.state.user.photoUrls.map((url) => {
        return <Image 
          resizeMode='cover'
          source={{uri: url}}
          style={{width:width, height:height/2}} 
          key={this.state.user.uid+"-"+url} />
      })
    else
      return null
  }

  render() {
    const user = this.state.user

    return(
      <View style={styles.container}>  
        <ScrollView ref='scrollView'>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEventThrottle={10} pagingEnabled>      
            { this.getPhotos() }
          </ScrollView>
          <View style={styles.headerContainer}>
            <Text style={styles.name}>{user.name.split(' ')[0]}</Text>
            <Text style={styles.age}>23 years old</Text>
            <Text style={styles.subtitle}>Work info goes here...{'\n'}</Text>
          </View>
          <Text style={styles.title}>Express Who You Are</Text>
          <View style={styles.bioContainer}>
            <TextInput ref='bio'
              style={styles.bio} 
              multiline={true}
              blurOnSubmit={false}
              onChangeText={(text) => this.setBio(text)}
              onFocus={this.textInputFocused.bind(this, 'bio')}
              value={this.state.user.bio} />
          </View>
          <Text style={styles.title}>Enter Your Favorite Emojis</Text>
          <View style={styles.bioContainer}>
            <TextInput ref='emojis'
              style={styles.bio} 
              returnKeyType='done'
              multiline={true}
              blurOnSubmit={true}
              onChangeText={(text) => this.setEmojis(text)}
              onFocus={this.textInputFocused.bind(this, 'emojis')}
              value={this.state.user.emojis} />
          </View>
          <Text style={styles.title}>List Your Top Interests</Text>
          <View style={styles.bioContainer}>
            <TextInput ref='interests'
              style={styles.bio} 
              returnKeyType='done'
              multiline={true}
              blurOnSubmit={true}
              onChangeText={(text) => this.setInterests(text)}
              onFocus={this.textInputFocused.bind(this, 'interests')}
              value={this.state.user.interests} />
          </View>
        </ScrollView>
      </View>
    )
  }
}
        

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height:height,
    width:width,
    backgroundColor: '#f7fbff',
  },  
  headerContainer: {
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor:'white',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  bioContainer: {
    flex: 1,
    width: width,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: 'lightgrey',
  },
  bio: {
    flex: 1,
    width: width,
    alignSelf: 'flex-start',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize:18,
    color: '#565656',
    textAlign: 'left',
    backgroundColor: 'white',
  },
  text: {
    color: '#565656',
    fontSize: 48,
    textAlign: 'left'
  },
  name: {
    color: '#2B2B2B',
    fontSize: 24,
    marginTop: 5,
    marginBottom: 2,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  title: {
    fontSize:16,
    color: 'black',
    textAlign: 'left',
    fontWeight: 'bold',
    paddingTop: 20,
    paddingBottom: 5,
    paddingLeft: 20,
  },
  age: {
    color: '#2B2B2B',
    textAlign: 'left',
    fontSize: 16,
    marginTop: 2,
    marginBottom: 3,
    color: 'gray',
  },
  subtitle: {
    fontSize:14,
    color: 'gray',
    textAlign: 'left'
  },
  chatButton: {
    width: width,
    paddingTop: 15,
    paddingBottom: 15,
    justifyContent: 'center',
    textAlign: 'center', 
    color:'white', 
    fontSize:24, 
    backgroundColor: 'green',
    borderColor: 'lightgrey', 
    borderTopWidth: 3, 
  }
});
