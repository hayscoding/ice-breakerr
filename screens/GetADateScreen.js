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

export default class GetADateScreen extends React.Component {
  static navigationOptions = {
    title: 'Get A Date',
  };

  state = {
    user: this.props.navigation.state.params.user, 
    coffeeDateInfo: {phoneNumber: '', submitDate: '', confirmed: false},
  }
  

  componentWillMount() {
    FirebaseAPI.getUserCb(this.state.user.uid, (user) => {
      if(this.state.user != user) {
        InteractionManager.runAfterInteractions(() => {
          this.setState({user: user})
        })
      }
    })
  }

  setPhoneNumber(text) {
    InteractionManager.runAfterInteractions(() => {
      this.setState({coffeeDateInfo: {phoneNumber: text, confirmed: false, submitDate: ''}})
    })
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

  submitInfo() {
    const backAction = NavigationActions.back({
            key: null
        });

    if(this.validatePhoneNumber(this.state.coffeeDateInfo.phoneNumber)) {
      const coffeeDateInfo = this.state.coffeeDateInfo
      const now = new Date()

      coffeeDateInfo.submitDate = now

      const updatedUser = this.state.user
      updatedUser.coffeeDateInfo = coffeeDateInfo

      FirebaseAPI.updateUser(this.state.user.uid, 'coffeeDateInfo', coffeeDateInfo)

      this.props.navigation.state.params.cb(updatedUser)

      Alert.alert("Thank you for showing interest in getting a coffee date.", 
        "We'll send you an invite soon. You'll be able to get a coffee date within a few months.")

      InteractionManager.runAfterInteractions(() => {
        this.props.navigation.dispatch(backAction);
      }) 
    } else
      Alert.alert("Please enter a valid phone number.")
  }

  submitTouchable() {
      return(
        <View style={styles.chatButtonContainer}>
          <TouchableOpacity onPress={() => {this.submitInfo()}} >
            <Text style={styles.chatButton}>Submit </Text>
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
                <Text style={styles.name}>Get a Coffee Date</Text>
                <Text style={styles.age}>You'll get a mutual, hand-matched, guaranteed coffee date within a few months.{'\n'}{'\n'}
                We will match you with someone doing the same thing, and schedule the time and place.{'\n'}{'\n'}
                We'll text you when we have a match.</Text>
              </View>
            </View>
          <Text style={styles.title}>Enter Your Phone Number</Text>
          <View style={styles.bioContainer}>
            <TextInput ref='phoneNumber'
              style={styles.bio} 
              keyboardType={'numeric'}
              multiline={true}
              blurOnSubmit={false}
              onChangeText={(text) => this.setPhoneNumber(text)}
              onFocus={this.textInputFocused.bind(this, 'phoneNumber')}
              value={this.state.coffeeDateInfo.phoneNumber} />
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
    paddingRight: 10,
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
