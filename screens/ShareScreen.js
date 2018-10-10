import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Image, Dimensions, InteractionManager, Alert, } from 'react-native';
import { ExpoLinksView } from '@expo/samples';

import TimerMixin from 'react-timer-mixin';

import * as firebase from 'firebase'
import GeoFire from 'geofire'

import * as FirebaseAPI from '../modules/firebaseAPI'
import * as ServerAPI from '../modules/serverAPI'

const {height, width} = Dimensions.get('window');
const size = width/5.4

export default class ShareScreen extends React.Component {
  static navigationOptions = {
    title: 'Ice Breakerr',
    headerLeft: null,
    gesturesEnabled: false,
  };

  state = {
    user: this.props.screenProps.user, 
    statuses: exampleStatuses,
    timing: false,
    locationEnabled: false,
    likeTimerDone: true,
    nearbyProfiles: [],
    geoQueryRegistration: {}, //Used to turn the geoQuery listener off
  }
  

  componentWillMount() {
    const exampleStatuses = [{
      _id: "uid-1",
      username: "Haysss",
      location: "5 miles away",
      text: "Locally obliterated oysters near fisherman's wharf",
      upvotes: 10,
      downvotes: 5,
    },
    {
      _id: "uid-2",
      username: "Jueseaf",
      location: "7 miles away",
      text: "Penile penis reen weenis's wharf",
      upvotes: 10,
      downvotes: 5,
    },
    {
      _id: "uid-3",
      username: "Haysss",
      location: "5 miles away",
      text: "a;;kfajdfjlkasdjflkajdslfkjksald",
      upvotes: 10,
      downvotes: 5,
    }]

      this._mounted = false
      this._navigating = false

      InteractionManager.runAfterInteractions(() => {
        InteractionManager.runAfterInteractions(() => {
          if(!this.state.locationEnabled) {
            const gotLocation = FirebaseAPI.getLocationAsync(this.state.user.uid)

            InteractionManager.runAfterInteractions(() => {
              this.setState({locationEnabled: gotLocation})
            })
          }
        })
      })
  }

  componentDidMount() {
    this._mounted = true
    this._navigating = false
  }

  componentDidUpdate() {
  }

  componentWillUnmount() {
    this._mounted = false
    this.state.geoQueryRegistration.cancel() //turn of geoFire listener
    FirebaseAPI.removeWatchUser(this.state.user.uid)
  }

  showProfile(profile) {
    if(!this._navigating) {
      this._navigating = true
      this.props.navigation.navigate('Profile', {profile: profile, user: this.state.user, cb: (profile) => {
        console.log('called')
        FirebaseAPI.getUserCb(this.state.user.uid, (user) => {
          this.setState({user: user})
        })
      }})

      setTimeout(() => {
        this._navigating = false
      }, 500)
    }
  }

  askToEnableLocation() {
    InteractionManager.runAfterInteractions(() => {
      InteractionManager.runAfterInteractions(() => {
        FirebaseAPI.alertIfRemoteNotificationsDisabledAsync((bool) => {
          this.setState({ locationEnabled: bool })
        })
      }) 
    })
  }

  render() {
    // console.log('RENDNDFKNLKFJEFKJLKEJFLKFJEKJFLKEJFKLJFLKEJFKFJEK')
    // console.log('Distances', this.state.distances, 
    //             'Timing', this.state.timing, 
    //             'locationEnabled', this.state.locationEnabled, 
    //             'likeTimerDone',this.state.likeTimerDone)

    if(this.state.locationEnabled) {
      return (
        <View style={styles.container}>
          <ScrollView style={{flex: 1}}>
            <View style={styles.profileList}>
            {
              this.state.statuses.map((status) => {
                return (
                    <View style={styles.match} key={status._id+"-container"}>
                        <View style={styles.content} >
                          <View style={styles.headerContainer}>
                            <View style={styles.leftColumn}>
                              <View style={{flex: 1, justifyContent: 'space-around', alignItems: 'flex-start'}}>
                              </View>
                              <View style={{flex: 3, justifyContent: 'flex-start'}}>
                                <Text style={styles.name}>{status.username}</Text>
                                <Text style={styles.gender}>{status.location}</Text>
                              </View>
                            </View>
                          </View>
                          <View style={styles.bioContainer}>
                            <Text style={styles.bio}>{status.text}</Text>
                          </View>
                          <View style={styles.decisionContainer}>
                            <View style={styles.votesContainer}>
                              <Text style={styles.votes}>{status.upvotes - status.downvotes}</Text>
                            </View>
                            <TouchableOpacity onPress={() => {}}>
                              <View style={styles.leftButton}>
                                  <Text style={styles.decisionButton}>&#x25B2;</Text>
                              </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {}}>
                              <View style={styles.rightButton}>
                                  <Text style={styles.decisionButton}>&#x25BC;</Text>
                              </View>
                            </TouchableOpacity>
                          </View>
                        </View>
                    </View>
                )
              })
            }
            </View>
          </ScrollView>
          <View style={{height: width/7, width: width, alignSelf: 'flex-end', backgroundColor: '#efefef',}}></View>
        </View>
      );
    } else if(!this.state.locationEnabled) {
      return (
        <View style={styles.container}>
          <ScrollView style={{flex: 1}}>
            <View style={styles.profileList}>
              <View style={styles.match}>
                <TouchableOpacity onPress={() => { this.askToEnableLocation() }}>
                  <View style={styles.content} >
                    <View style={styles.headerContainer}>
                      <View style={styles.leftColumn}>
                        <Text style={styles.name}>Enable Location Services.</Text>
                        <Text style={styles.gender}>You'll be able to connect with people afterwards.</Text>
                      </View>
                      <View style={styles.rightColumn}>
                      </View>
                    </View>
                    <View style={styles.bioContainer}>
                      <Text style={styles.bio}>We can't find people near you if location services aren't enabled.</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          <View style={{height: width/7, width: width, alignSelf: 'flex-end', backgroundColor: '#efefef',}}></View>
        </View>
      );
    } else
      return (
        <View style={styles.container}>
          <ScrollView style={{flex: 1}}>
            <View style={styles.profileList}>
              <View style={styles.match}>
                <TouchableOpacity onPress={() => {}}>
                  <View style={styles.content} >
                    <View style={styles.headerContainer}>
                      <View style={styles.leftColumn}>
                        <Text style={styles.name}>Getting Statuses From People Nearby...</Text>
                      </View>
                      <View style={styles.rightColumn}>
                      </View>
                    </View>
                    <View style={styles.bioContainer}>
                      <Text style={styles.bio}>You'll see what people are sharing soon!</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          <View style={{height: width/7, width: width, alignSelf: 'flex-end', backgroundColor: '#efefef',}}></View>
        </View>
      );
  }
}

const matchHeight = height/3.5*1.05
const matchWidth =  width/20*19

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: '#f7fbff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileList: {
    flex: 1,
    marginBottom: matchHeight/3,
    backgroundColor: '#f7fbff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: matchWidth,
    height: matchHeight, 
    // shadowColor: '#000000', 
    // shadowOffset: {width: 0, height: 0}, 
    // shadowRadius: 7, 
    // shadowOpacity: 0.3,
    borderWidth: 1,
    borderColor: 'lightgrey',
    borderRadius: 10,
    marginTop: 10,
    backgroundColor: 'white'
  },
  name: {
    color: '#2B2B2B',
    fontSize: 13,
    marginTop: 15,
    textAlign: 'left',
  },
  match: {
    flex: 1,
    width: width,
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 10,
  },
  bio: {
    height: 78,
    alignSelf: 'flex-start',
    paddingTop: 10,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize:18,
    color: '#565656',
    textAlign: 'left',
    backgroundColor: 'white',
    lineHeight: 22,
  },
  bioContainer: {
    flex: 1,
    borderRadius: 10,
    paddingBottom: 10,
  },
  decisionContainer: {
    flex: 1,
    width: matchWidth,
    height: matchHeight/3.5,
    flexDirection: 'row',
    marginTop: 10,
    paddingBottom: 10,
    justifyContent: 'space-around',
  },
  decisionLine: {
    flex: 1,
    width: matchWidth,
    height: 10,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  votesContiainer: {
    height: height/3/4.5,
    width: matchWidth/3,
    justifyContent: 'space-around',
  },
  votes: {
    marginLeft: 40,
    justifyContent: 'center',
    textAlign: 'center',
    marginBottom: 5,
    fontSize: height/3/4.5-10,
    color: 'gray',
  },
  leftButton: {
    width: matchWidth/3,
    height: height/3/4.5,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    marginLeft: 30,
    borderRadius: 30,
    backgroundColor: 'green',
    overflow: 'hidden',
  },
  rightButton: {
    width: matchWidth/3,
    height: height/3/4.5,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    marginRight: 15,
    borderRadius: 30,
    backgroundColor: 'red',
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    paddingTop: 5,
    marginLeft: 20,
    marginRight: 20,
    paddingBottom: 10,
    backgroundColor:'white',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  onlineIndicator: {
    textAlign: 'left',
    fontSize: 10,
    marginTop: 2,
    marginBottom: 2,
    color: 'green',
  },
  decisionButton: {
    textAlign: 'center',
    alignSelf: 'center',
    fontSize: height/3/8,
    color: 'white',
  },
  leftColumn: {
    flex: 1,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    width: matchWidth,
  },
  rightColumn: {
    width: matchWidth/5,
    alignItems: 'flex-end',
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
  },
  name: {
    color: '#2B2B2B',
    fontSize: 24,
    marginTop: 5,
    marginBottom: 1,
    textAlign: 'left',
    fontWeight: 'bold',
    borderRadius: 10,
  },
  age: {
    color: '#2B2B2B',
    textAlign: 'left',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 1,
    color: 'gray',
    borderRadius: 10,
  },
  gender: {
    color: '#2B2B2B',
    textAlign: 'left',
    fontSize: 10,
    marginTop: 2,
    color: 'gray',
  },
});
