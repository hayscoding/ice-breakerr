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

export default class BioScreen extends React.Component {
  static navigationOptions = {
    title: 'Ice Breakerr',
    headerLeft: null,
    gesturesEnabled: false,
  };

  componentWillMount() {
      this.state = {
        user: this.props.screenProps.user, 
        profiles: [],
        distances: [],
        timing: false,
        locationEnabled: false,
        likeTimerDone: true,
        nearbyProfiles: [],
        geoQueryRegistration: {}, //Used to turn the geoQuery listener off
      }

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

    this.getNearbyUsers()
    this.updateProfilesIfZero()
    this.watchUserForUpdates()
  }

  componentDidUpdate() {
    if(this.state.profiles.length == 0)
      this.updateProfilesIfZero()
  }

  componentWillUnmount() {
    this._mounted = false
    this.stopWatchingUsers()
    this.state.geoQueryRegistration.cancel() //turn of geoFire listener
    FirebaseAPI.removeWatchUser(this.state.user.uid)
  }

  getNearbyUsers() {
    const firebaseRef = firebase.database().ref()
    const geoFire = new GeoFire(firebaseRef.child('geoData/'))

    geoFire.get(this.state.user.uid).then(location => {    
      const geoQuery = geoFire.query({
        center: location,
        radius: 80 //80 km is about 50 miles
      })

      const geoQueryRegistration = geoQuery.on("key_entered", (key) => {
        this.setState({nearbyProfiles: [...this.state.nearbyProfiles, key]})
      })

      this.setState({geoQueryRegistration: geoQueryRegistration})
    }) 
  }

  updateProfilesIfZero() {
    if(this.state.profiles.length == 0 && !this.state.isTiming) { //Keeps recursion in check to prevent accelerating recalls
      this.getProfiles()

      InteractionManager.runAfterInteractions(() => {
        if(this.state.profiles.length == 0) {
          this.setState({isTiming: true})

          setTimeout(() => { //Search for new profiles every 15 secs
            this.updateProfilesIfZero()
            this.setState({isTiming: false})
          }, 4000)
        }
      }) 
    }
  }

  watchProfiles() {
    InteractionManager.runAfterInteractions(() => {
        this.state.profiles.forEach((profile) => { 
          FirebaseAPI.removeWatchUser(profile.uid)

          FirebaseAPI.watchUser(profile.uid, (updatedProfile) => {
            // console.log('WATCH PROFILES')
            const index = this.state.profiles.findIndex((user) => { return user.uid == updatedProfile.uid })
            const updatedProfiles = this.state.profiles

            updatedProfiles[index] = updatedProfile

            InteractionManager.runAfterInteractions(() => {
              this.setState({profiles: updatedProfiles})
            })

            InteractionManager.runAfterInteractions(() => {
              // console.log('updatedProfile', updatedProfile)
              const didRejectUser = 'rejections' in updatedProfile ? Object.keys(updatedProfile.rejections).some((uid) => {
                  return uid == this.state.user.uid
                }) : false

              if(didRejectUser) {
                FirebaseAPI.getUserCb(this.state.user.uid, (user) => {
                  this.setState({user: user})
                })
                
                this.removeProfile(updatedProfile)
              }
            })
          })

          FirebaseAPI.watchForNewChat(this.state.user.uid, profile.uid, (hasChat) => {
            if(hasChat && this.state.profiles.some((user) => { return user.uid == profile.uid})) {
              this.removeProfile(profile)
            }
          })
        })
      })
  }

  stopWatchingUsers() {
    this.state.profiles.forEach((profile) => { 
      FirebaseAPI.removeWatchUser(profile.uid)
    })

    // FirebaseAPI.removeWatchForChat()
  }

  watchUserForUpdates() {
    FirebaseAPI.watchUser(this.state.user.uid, (updatedUser) => {
      InteractionManager.runAfterInteractions(() => {
          this.setState({user: updatedUser})
      })
    })
  }

  getProfiles() {
    let profileSlots = 5

    FirebaseAPI.getProfilesInChatsWithKey(this.state.user.uid, (chattedProfiles) => {
      // console.log('nearby profiles', this.state.nearbyProfiles)
      FirebaseAPI.getSomeUsersCb(this.state.nearbyProfiles, (newProfiles) => {
            if(newProfiles != null) {
              newProfiles.sort((a, b) => { 
                const aMsg = 'lastActive' in a ? a.lastActive : '0'
                const bMsg = 'lastActive' in b ? b.lastActive : '0'

                return new Date(aMsg.createdAt) - new Date(bMsg.createdAt)
              }).length = 10

              const currentProfiles = newProfiles.filter((user) => { //Filter profiles already in current state
                if(this.state.profiles.length != 0)
                  return !this.state.profiles.some((profile) => { return profile.uid == user.uid })
                else
                  return true
              }).filter((user) => { //Filter profiles already in chat with user
                return !(chattedProfiles.some((profile) => {
                  return profile.uid == user.uid
                  }))
              }).filter((profile) => { //Filter the current profile from the other individuals
                return profile.uid != this.state.user.uid 
              }).filter((profile) => { //Filter  profiles rejected by profile
                if(this.state.user.rejections != undefined)
                  return !Object.keys(this.state.user.rejections).some((uid) => {
                    return uid == profile.uid
                  })
                else
                  return true
              }).filter((profile) => { //Filter profiles liked by user
                if(this.state.user.likes != undefined)
                  return !Object.keys(this.state.user.likes).some((uid) => {
                    return uid == profile.uid
                  })
                else
                  return true
              }).filter((profile) => { //Filter undiscoverable profiles
                  return profile.discoverable
              }).slice(0, profileSlots - this.state.profiles.length)


              // console.log('newProfiles Length', currentProfiles.length)

              const updatedProfiles = this.state.profiles.concat(currentProfiles)

              if(updatedProfiles != this.state.profiles)
                InteractionManager.runAfterInteractions(() => {            
                  this.setState({profiles: updatedProfiles, distances: []}) //only show the assigned number of profiles

                  InteractionManager.runAfterInteractions(() => {
                    this.getDistancesFromUser()
                  })
                })

              this.watchProfiles()
            }
    })
      // FirebaseAPI.getUsers((users) => {
      //   const newProfiles = users.filter((user) => { //Filter the current user from the other individuals
      //     return user.uid != this.state.user.uid 
      //     }).filter((user) => { //Filter profiles already in current state
      //       if(this.state.profiles.length != 0)
      //         return !this.state.profiles.some((profile) => { return profile.uid == user.uid })
      //       else
      //         return true
      //     }).filter((user) => { //Filter profiles already in chat with user
      //       return !(chattedProfiles.some((profile) => {
      //         return profile.uid == user.uid
      //         }))
      //     }).filter((profile) => { //Filter the current profile from the other individuals
      //       return profile.uid != this.state.user.uid 
      //     }).filter((profile) => { //Filter  profiles rejected by profile
      //       if(this.state.user.rejections != undefined)
      //         return !Object.keys(this.state.user.rejections).some((uid) => {
      //           return uid == profile.uid
      //         })
      //       else
      //         return true
      //     }).filter((profile) => { //Filter profiles liked by user
      //       if(this.state.user.likes != undefined)
      //         return !Object.keys(this.state.user.likes).some((uid) => {
      //           return uid == profile.uid
      //         })
      //       else
      //         return true
      //     }).filter((profile) => { //Filter undiscoverable profiles
      //         return profile.discoverable
      //     }).slice(0, profileSlots - this.state.profiles.length)
    })
  }

    getDistancesFromUser() {
      if(this._mounted)
        this.state.profiles.map((profile) => {
          FirebaseAPI.getDistanceFromUser(profile.uid, this.state.user.uid, (distanceKilometers) => {
            const distanceMiles = Math.round(distanceKilometers * 0.621371) + 1

            if(!this.state.distances.some((distObj) => { return distObj.uid == profile.uid }))
              InteractionManager.runAfterInteractions(() => {
                this.setState({distances: [...this.state.distances, {uid: profile.uid, distance: distanceMiles}]})
              })
          })
        })
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

  getFbImageUrl(profile) {
    const fbImageUrl = `https://graph.facebook.com/${profile.id}/picture?height=${height}`
    return fbImageUrl
  }

  removeProfile(profile) {
    const profileIndex = this.state.profiles.findIndex((user) => { return user.uid == profile.uid })
    const updatedProfiles = this.state.profiles

    FirebaseAPI.removeWatchUser(profile.uid)

    updatedProfiles.splice(profileIndex, 1)

    InteractionManager.runAfterInteractions(() => {
      if(this.state.profiles.map((profile) => {return profile.uid}).join(',') != updatedProfiles.map((profile) => {return profile.uid}).join(','))
        this.setState({profiles: updatedProfiles})
    })
  }

  rejectProfile(profile) {
    Alert.alert(
      ('Pass on this profile?'),
      'You will not be able to view their profile or messages again.',
      [
        {text: 'OK', onPress: () => {
          FirebaseAPI.rejectProfileFromUser(this.state.user.uid, profile.uid)
          FirebaseAPI.getUserCb(this.state.user.uid, (user) => {
              InteractionManager.runAfterInteractions(() => {
                this.setState({user: user})
                this.removeProfile(profile)
              })
          })
        }},
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
      ],
      { cancelable: false })
  }

  alertIfMatch(profile) {
    const profileLikes = profile.likes != undefined ? Object.keys(profile.likes) : []
    const hasMatch = profileLikes.some((profileLike) => {
        return this.state.user.uid == profileLike
    })

    if(hasMatch) {
      const pushToken = 'pushToken' in profile ? profile.pushToken : 'No push token'

      FirebaseAPI.setMatchWithProfiles(this.state.user.uid, profile.uid)
      ServerAPI.postMatchNotificationToUid(this.state.user.name.split(' ')[0], pushToken)

      Alert.alert("They like you too!", "A chat has been started for both of you.")
    }
  }

  likeProfile(profile) {
    if(this.state.likeTimerDone) {
      FirebaseAPI.likeProfileFromUser(this.state.user.uid, profile.uid)

      InteractionManager.runAfterInteractions(() => {
        this.setState({likeTimerDone: false})

        setTimeout(() => {
          this.setState({likeTimerDone: true})
        }, 100)
      })

      FirebaseAPI.getUserCb(this.state.user.uid, (user) => {
        InteractionManager.runAfterInteractions(() => {
          this.setState({user: user})
          this.removeProfile(profile)
        })
      })

      this.alertIfMatch(profile)
    }
  }

  render() {
    // console.log('RENDNDFKNLKFJEFKJLKEJFLKFJEKJFLKEJFKLJFLKEJFKFJEK')
    // console.log('Distances', this.state.distances, 
    //             'Timing', this.state.timing, 
    //             'locationEnabled', this.state.locationEnabled, 
    //             'likeTimerDone',this.state.likeTimerDone)

    if(this.state.profiles.length > 0 && this.state.locationEnabled) {
      return (
        <View style={styles.container}>
          <ScrollView style={{flex: 1}}>
            <View style={styles.profileList}>
            {
              this.state.profiles.map((profile) => {
                let milesAway = ' '

                if(this.state.distances.some((disObj) => { return disObj.uid == profile.uid })) {
                  milesAway = this.state.distances.find((disObj) => { return disObj.uid == profile.uid }).distance

                  milesAway = milesAway != 1 ? (milesAway+' miles away') : (milesAway+' mile away') //Keep proper grammer for 1 mile away
                }
                else
                  milesAway = 'Finding location...'
              
                const onlineIndicator = profile.appState == 'active' ? 'online now' : 'offline'

                return (
                    <View style={styles.match} key={profile.uid+"-container"}>
                      <TouchableOpacity onPress={() => {this.showProfile(profile)}}
                      key={profile.uid+"-touchable"} >
                        <View style={styles.content} >
                          <View style={styles.headerContainer}>
                            <View style={styles.leftColumn}>
                              <View style={{flex: 1, justifyContent: 'space-around', alignItems: 'flex-start'}}>
                                <Image
                                  resizeMode='cover'
                                  source={{uri: profile.gifUrl != "" ? profile.gifUrl : ' '}}
                                  style={[{alignSelf: 'flex-start', width: size, height: size, borderRadius: size/2, overlayColor: 'white',}]}/> 
                              </View>
                              <View style={{flex: 3, justifyContent: 'flex-start'}}>
                                <Text style={styles.name}>{profile.emojis != '' ? profile.emojis.slice(0,12) : ' '}</Text>
                                <Text style={styles.onlineIndicator}>{onlineIndicator}</Text>
                                <Text style={styles.age}>{this.getAge(profile.birthday)} years old</Text>
                                <Text style={styles.gender}>{milesAway}</Text>
                              </View>
                            </View>
                          </View>
                          <View style={styles.bioContainer}>
                            <Text style={styles.bio}>{profile.bio}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                      {
                        (() => {
                          if(this.state.profiles.indexOf(profile) == 0)
                            return (
                              <View style={styles.decisionContainer}>
                                <TouchableOpacity onPress={() => {this.likeProfile(profile)}}>
                                  <View style={styles.leftButton}>
                                      <Text style={styles.decisionButton}>Like</Text>
                                  </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => {this.rejectProfile(profile)}}>
                                  <View style={styles.rightButton}>
                                      <Text style={styles.decisionButton}>Pass</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>
                            )
                        })()
                      }
                      {
                        (() => {
                          if(this.state.profiles.indexOf(profile) == 0)
                            return (
                              <View style={styles.decisionLine}></View>
                            )
                        })()
                      }
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
                        <Text style={styles.gender}>We'll find you profiles afterwards.</Text>
                      </View>
                      <View style={styles.rightColumn}>
                      </View>
                    </View>
                    <View style={styles.bioContainer}>
                      <Text style={styles.bio}>We can't find new profiles near you if location services aren't enabled.</Text>
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
                        <Text style={styles.name}>Finding People Near You...</Text>
                      </View>
                      <View style={styles.rightColumn}>
                      </View>
                    </View>
                    <View style={styles.bioContainer}>
                      <Text style={styles.bio}>You'll get new people to connect with soon!</Text>
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
    fontSize: 18,
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
  leftButton: {
    width: matchWidth/2.1,
    height: height/3/4.2,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: 'green',
    overflow: 'hidden',
  },
  rightButton: {
    width: matchWidth/2.1,
    height: height/3/4.2,
    alignSelf: 'flex-end',
    justifyContent: 'center',
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
    fontSize: 11,
    marginTop: 2,
    color: 'gray',
  },
});
