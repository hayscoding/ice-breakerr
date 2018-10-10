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
  Alert,
  Platform,
} from 'react-native';

import * as FirebaseAPI from '../modules/firebaseAPI'

const {height, width} = Dimensions.get('window');

const size = width/8

export default class EditProfileScreen extends React.Component {
  static navigationOptions = {
    title: 'Edit Profile',
  };

  state = {
    user: this.props.navigation.state.params.user, 
  }

  componentWillMount() {
    this._mounted = false
    this._navigating = false

    FirebaseAPI.getUserCb(this.state.user.uid, (user) => {
      if(this.state.user != user) {
        InteractionManager.runAfterInteractions(() => {
          this.setState({user: user})
        })
      }
    })
  }

  componentDidMount() {
    //Set this true so no warning appears if component unmounts during process
    this._mounted = true
  }

  componentWillUnmount() {
    this._mounted = false
  }

  addPhoto() {
    if('photoUrls' in this.state.user && this.state.user.photoUrls.length >= 6)
      Alert.alert('You cannot add more than 6 pictures to your profile.')
    else
      InteractionManager.runAfterInteractions(() => {
        if(!this._navigating) {
          this._navigating = true

          this.props.navigation.navigate('AddPhoto', {user: this.state.user, cb: (user) => { this.setState({user}) }} )

          setTimeout(() => {
            this._navigating = false
          }, 1000)
        }

      })
  }

  removePhoto(url) {
    if(this.state.user.photoUrls.length > 1)
      Alert.alert(
          ('Remove this picture from your public profile?'),
          'It will no longer be shown in your photo collection.',
          [
            {text: 'OK', onPress: () => {
              const updatedPhotoUrls = this.state.user.photoUrls
              const index = updatedPhotoUrls.indexOf(url)

              updatedPhotoUrls.splice(index, 1)

              InteractionManager.runAfterInteractions(() => {
                FirebaseAPI.updateUser(this.state.user.uid, 'photoUrls', updatedPhotoUrls)

                FirebaseAPI.getUserCb(this.state.user.uid, (user) => {
                  InteractionManager.runAfterInteractions(() => {
                      this.setState({user: user})
                  })
                })
              })
            }},
            {text: 'Cancel', onPress: () => {}, style: 'cancel'},
          ],
          { cancelable: false }
        )
    else
      Alert.alert('You must have at least 1 photo in your profile.')
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
      const px = Platform.OS === 'android' ? height/1.5 : 200
      let scrollResponder = this.refs.scrollView.getScrollResponder();
      scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
        findNodeHandle(this.refs[refName]),
        px, //additionalOffset
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
              <TouchableOpacity onPress={() => { this.removePhoto(url) }}
              key={url+"-touchable"} style={{flex: 1, width:size+34, height: size, position: 'absolute', alignSelf: 'flex-end', marginTop: (width-size*1.5)}}>
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
    // console.log(dateString)
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
          <ScrollView horizontal indicatorStyle={'white'} scrollEventThrottle={10} pagingEnabled>      
            { this.getPhotos() }
          </ScrollView>
          <View style={styles.content} >
            <View style={styles.headerContainer}>
              <View style={styles.leftColumn}>
                <Text style={styles.name}>{user.name.split(' ')[0]} {user.emojis}</Text>
                <Text style={styles.age}>{this.getAge(user.birthday)} years old</Text>
                <Text style={styles.gender}>{user.gender[0].toUpperCase() + user.gender.slice(1, user.gender.length+1)}</Text>
              </View>
              <View style={styles.rightColumn}>
                <TouchableOpacity onPress={() => {this.addPhoto()}} style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7fbff', borderRadius: 7, paddingLeft: 6, paddingRight: 6}}>
                  <Text style={{fontSize: 20, color: 'lightgrey', textAlign: 'center', backgroundColor: 'transparent'}}>ADD{'\n'}PHOTO</Text>
                </TouchableOpacity>
              </View>
            </View>
          <Text style={styles.title}>Enter A Profile Headline (Hint: Use Emojis)</Text>
          <View style={styles.emojiContainer}>
            <TextInput ref='emojis'
              maxLength={12}
              underlineColorAndroid='transparent'
              style={styles.emojis} 
              multiline={true}
              blurOnSubmit={false}
              onChangeText={(text) => this.setEmojis(text)}
              onFocus={this.textInputFocused.bind(this, 'emojis')}
              value={this.state.user.emojis} />
          </View>
          <Text style={styles.title}>Express Who You Are</Text>
          <View style={styles.bioContainer}>
            <TextInput ref='bio'
              underlineColorAndroid='transparent'
              style={styles.bio} 
              multiline={true}
              blurOnSubmit={false}
              onChangeText={(text) => this.setBio(text)}
              onFocus={this.textInputFocused.bind(this, 'bio')}
              value={this.state.user.bio} />
          </View>
          <Text style={styles.title}>List Your Top Interests</Text>
          <View style={styles.bioContainer}>
            <TextInput ref='interests'
              underlineColorAndroid='transparent'
              style={styles.bio} 
              multiline={true}
              blurOnSubmit={false}
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
    flexGrow: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width:width,
    backgroundColor: '#f7fbff',
  },
  content: {
    flexGrow: 1,
    height:height+height/2.5,
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
    height: height/5,
    width: width,
    alignSelf: 'center',
    justifyContent: 'flex-start',
  },
  emojiContainer: {
    height: 50,
    width: width,
    alignSelf: 'center',
    justifyContent: 'flex-start',
  },
  bio: {
    height: height/5,
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
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: 'lightgrey',
  },
  emojis: {
    height: 50,
    width: width,
    alignSelf: 'flex-start',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize:18,
    lineHeight: 20,
    color: '#565656',
    textAlign: 'left',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: 'lightgrey',
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
