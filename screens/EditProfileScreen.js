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

const size = width/8

export default class EditProfileScreen extends React.Component {
  static navigationOptions = {
    title: 'Edit Profile',
  };

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

  addPhoto() {
    InteractionManager.runAfterInteractions(() => {
      this.props.navigation.navigate('AddPhoto', {user: this.state.user})
    })
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
        return (
          <View style={{flex: 1,}} key={url+"-container"}>
            <Image 
            resizeMode='cover'
            source={{uri: url}}
            style={{width:width, height:width}} 
            key={url} />
              <TouchableOpacity onPress={() => {}}
              key={url+"-touchable"} style={{flex: 1, width:size+47, height: size, position: 'absolute', alignSelf: 'flex-end', marginTop: (width-size*1.5)}}>
                <View style={{width: size, height: size, borderRadius: 100, position: 'absolute', backgroundColor: 'rgba(255, 255, 255, 0.25)'}}>
                  <View style={styles.removePhotoTouchable}>
                    <Text key={url+"-remove"} style={{fontSize: size*0.8, color: 'rgba(135, 207, 255, 0.35)', textAlign: 'center', backgroundColor: 'transparent'}}>X</Text>
                  </View>
                </View>
              </TouchableOpacity>

          </View>
        )
      })
    else
      return null
  }

  getAge(dateString) {
    console.log(dateString)
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  }

  render() {
    const user = this.state.user

    return(
      <View style={styles.container}>  
        <ScrollView ref='scrollView'>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEventThrottle={10} pagingEnabled>      
            { this.getPhotos() }
          </ScrollView>
          <View style={styles.content} >
            <View style={styles.headerContainer}>
              <View style={styles.leftColumn}>
                <Text style={styles.name}>{user.name.split(' ')[0]}</Text>
                <Text style={styles.age}>{this.getAge(user.birthday)} years old</Text>
                <Text style={styles.gender}>{user.gender[0].toUpperCase() + user.gender.slice(1, user.gender.length+1)}</Text>
              </View>
              <View style={styles.rightColumn}>
                <TouchableOpacity onPress={() => {this.addPhoto()}} style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#b1c7dd', borderRadius: 15, padding: 6}}>
                  <Text style={{fontSize: 20, color: '#edf6ff', textAlign: 'center', backgroundColor: 'transparent'}}>ADD{'\n'}PHOTO</Text>
                </TouchableOpacity>
              </View>
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
          <View style={styles.spacer}></View>
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
  content: {
    flex: 1,
    width: width,
    backgroundColor: '#f7fbff'
  },
  headerContainer: {
    flexDirection: 'row',
    paddingTop: 5,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 10,
    backgroundColor:'white',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
    borderRadius: 10,
  },
  leftColumn: {
    alignSelf: 'flex-start',
    width: width/2,
  },
  rightColumn: {
    width: width/3,
    alignItems: 'flex-end',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
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
    fontSize:15,
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
  },
  removePhotoTouchable: {
    alignSelf: 'flex-start',
    height: size, 
    width: size, 
    position: 'absolute',
    borderRadius: 200,
  },
  spacer: {
    height: 40,
  },
});
