import React, {Component} from 'react';
import { NavigationActions } from 'react-navigation'
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
} from 'react-native';

import * as FirebaseAPI from '../modules/firebaseAPI'

const {height, width} = Dimensions.get('window');

const size = width/8

export default class ReferralScreen extends React.Component {
  static navigationOptions = {
    title: 'Edit Profile',
  };

  componentWillMount() {
    this.state = {
      user: this.props.navigation.state.params.user, 
      referral: {phoneNumber: '', name: '', confirmed: false},
    }

    this._mounted = false

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
        this.props.navigation.navigate('AddPhoto', {user: this.state.user, cb: (user) => { this.setState({user}) }} )
      })
  }

  removePhoto(url) {
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
  }

  setPhoneNumber(text) {
    this.setState({referral: {phoneNumber: text, name: this.state.referral.name, confirmed: false}})
  }

  setName(text) {
    this.setState({referral: {phoneNumber: this.state.referral.phoneNumber, name: text, confirmed: false}})
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

  validatePhoneNumber(text) {
    var re = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/
    return re.test(text);
}

  submitReferral() {
    const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({ routeName: 'Main', params: {index: 0} }),
            ],
            key: null
        });

    if(this.validatePhoneNumber(this.state.referral.phoneNumber)) {
      const updatedReferrals = 'referrals' in this.state.user ? this.state.user.referrals : []
      updatedReferrals.push(this.state.referral)
      const updatedUser = this.state.user
      updatedUser.referrals = updatedReferrals

      FirebaseAPI.updateUser(this.state.user.uid, 'referrals', updatedReferrals)

      this.props.navigation.state.params.cb(updatedUser)

      Alert.alert("Thank you for referring Ice Breaker.", 
        "We'll send them an invite soon. Once they join, you'll be able to view an extra profile in the center screen.")

      InteractionManager.runAfterInteractions(() => {
        this.props.navigation.dispatch(resetAction);
      }) 
    } else
      Alert.alert("Please enter a valid phone number.")
  }

  submitTouchable() {
      return(
        <View style={styles.chatButtonContainer}>
          <TouchableOpacity onPress={() => {this.submitReferral()}} >
            <Text style={styles.chatButton}>Submit</Text>
          </TouchableOpacity>
        </View>
      )
  }

  render() {
    const user = this.state.user

    return(
      <View style={styles.container}>  
        <ScrollView ref='scrollView'>
          <View style={styles.content} >
            <View style={styles.headerContainer}>
              <View style={styles.leftColumn}>
                <Text style={styles.name}>Refer a Friend</Text>
                <Text style={styles.age}>You'll gain 1 more profile slot at center screen.{'\n'}Referral must accept offer.</Text>
              </View>
            </View>
          <Text style={styles.title}>Enter Their Phone Number</Text>
          <View style={styles.bioContainer}>
            <TextInput ref='phoneNumber'
              style={styles.bio} 
              keyboardType={'numeric'}
              multiline={true}
              blurOnSubmit={false}
              onChangeText={(text) => this.setPhoneNumber(text)}
              onFocus={this.textInputFocused.bind(this, 'phoneNumber')}
              value={this.state.referral.phoneNumber} />
          </View>
          <Text style={styles.title}>Enter Their Name (Optional)</Text>
          <View style={styles.bioContainer}>
            <TextInput ref='name'
              style={styles.bio} 
              multiline={true}
              blurOnSubmit={false}
              onChangeText={(text) => this.setName(text)}
              onFocus={this.textInputFocused.bind(this, 'name')}
              value={this.state.referral.name} />
          </View>
          <View style={styles.spacer}></View>
          </View>
        </ScrollView>
        { this.submitTouchable() }
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
    width: width,
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
  chatButtonContainer: {
    height: height/10, 
    justifyContent: 'flex-end', 
    alignItems: 'center'
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
