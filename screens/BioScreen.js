import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Image, Dimensions, InteractionManager, Alert, } from 'react-native';
import { ExpoLinksView } from '@expo/samples';

import TimerMixin from 'react-timer-mixin';

import * as FirebaseAPI from '../modules/firebaseAPI'

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
      }

      this._mounted = false
      this._navigating = false

      InteractionManager.runAfterInteractions(() => {
        InteractionManager.runAfterInteractions(() => {
          if(!this.state.locationEnabled) {
            const gotLocation = FirebaseAPI.getLocationAsync(this.state.user.uid)

            InteractionManager.runAfterInteractions(() => {
              this.setState({ locationEnabled: gotLocation})
            })
          }
        })
      })
  }

  componentDidMount() {
    this._mounted = true
    this._navigating = false
    
    this.updateProfilesIfZero()
    this.watchUserForUpdates()
  }

  componentDidUpdate() {
    InteractionManager.runAfterInteractions(() => {
        this.getDistancesFromUser()
    })

    this.updateProfilesIfZero()
  }

  componentWillUnmount() {
    this._mounted = false
    console.log('UNMOUNTEDDDD')
    this.stopWatchingUsers()
    FirebaseAPI.removeWatchUser(this.state.user.uid)
  }

  updateProfilesIfZero() {
    if(this.state.profiles.length == 0) {
      if(!this.state.isTiming) {  //Keeps recursion in check to prevent accelerating recalls
        this.getProfiles()

        InteractionManager.runAfterInteractions(() => {
          this.setState({isTiming: true})
        })

        InteractionManager.runAfterInteractions(() => {
          if(this.state.profiles.length == 0)
            setTimeout(() => { //Search for new profiles every 15 secs
              this.updateProfilesIfZero()
              InteractionManager.runAfterInteractions(() => {
                this.setState({isTiming: false})
              })
            }, 7000)
        }) 
      }
    }
  }

  watchProfiles() {
    InteractionManager.runAfterInteractions(() => {
        this.state.profiles.forEach((profile) => { 
          FirebaseAPI.removeWatchUser(profile.uid)

          FirebaseAPI.watchUser(profile.uid, (updatedProfile) => {
            const index = this.state.profiles.findIndex((user) => { return user.uid == updatedProfile.uid })
            const updatedProfiles = this.state.profiles

            updatedProfiles[index] = updatedProfile

            InteractionManager.runAfterInteractions(() => {
              this.setState({profiles: updatedProfiles})
            })

            InteractionManager.runAfterInteractions(() => {
              console.log('updatedProfile', updatedProfile)
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

    FirebaseAPI.removeWatchForChat()
  }

  watchUserForUpdates() {
    FirebaseAPI.watchUser(this.state.user.uid, (updatedUser) => {
      InteractionManager.runAfterInteractions(() => {
          this.setState({user: updatedUser})
      })
    })
  }

  getProfiles() {
    let profileSlots = 3

    if('referrals' in this.state.user && 
      this.state.user.referrals.some((referralObj) => { return referralObj.confirmed}))
        profileSlots = 4

    FirebaseAPI.getProfilesInChatsWithKey(this.state.user.uid, (chattedProfiles) => {
      FirebaseAPI.getAllUsers((users) => {
        FirebaseAPI.getProfilesInChatsWithKey(this.state.user.uid, (chattedProfiles) => {
          const newProfiles = users.filter((user) => { //Filter the current user from the other individuals
            return user.uid != this.state.user.uid 
            }).filter((user) => { //Filter profiles already in current state
              if(this.state.profiles.length != 0)
                return !this.state.profiles.some((profile) => { return profile.uid == user.uid })
              else
                return true
            }).filter((user) => { //Filter profiles already in chat with user
              return !(chattedProfiles.some((profile) => {
                return profile.uid == user.uid
                }))
            }).filter((user) => { //Filter  profiles rejected by user
              if(this.state.user.rejections != undefined)
                return !Object.keys(this.state.user.rejections).some((uid) => {
                  return uid == user.uid
                })
              else
                return true
            }).slice(0, profileSlots - this.state.profiles.length)

          const updatedProfiles = this.state.profiles.concat(newProfiles)

          if(updatedProfiles != this.state.profiles)
            InteractionManager.runAfterInteractions(() => {
              this.setState({profiles: updatedProfiles}) //only show the assigned number of profiles
            })

          this.watchProfiles()
        })
      })
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

  showProfile(profile) {
    if(!this._navigating) {
      this._navigating = true
      this.props.navigation.navigate('Profile', {profile: profile, user: this.state.user, cb: (profile) => {
        FirebaseAPI.getUserCb(this.state.user.uid, (user) => {
          this.setState({user: user})
        })

        InteractionManager.runAfterInteractions(() => {
          this.removeProfile(profile)
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
    const index = this.state.profiles.findIndex((user) => { return user.uid == profile.uid })
    const updatedProfiles = this.state.profiles

    FirebaseAPI.removeWatchUser(profile.uid)

    updatedProfiles.splice(index, 1)

    InteractionManager.runAfterInteractions(() => {
      this.setState({profiles: updatedProfiles})
      this.getProfiles()                
    })
  }

  rejectProfile(profile) {
    Alert.alert(
      ('Delete '+profile.name.split(' ')[0]+'?'),
      'You will not be able to view their profile or messages again.',
      [
        {text: 'OK', onPress: () => {
          FirebaseAPI.rejectProfileFromUser(this.state.user.uid, profile.uid)
          FirebaseAPI.getUserCb(this.state.user.uid, (user) => {
            this.setState({user: user})
          })

          InteractionManager.runAfterInteractions(() => {
            this.removeProfile(profile)
          })
        }},
        {text: 'Cancel', onPress: () => {}, style: 'cancel'},
      ],
      { cancelable: false })
  }

  render() {
    console.log('RENDNDFKNLKFJEFKJLKEJFLKFJEKJFLKEJFKLJFLKEJFKFJEK')
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
                                  style={[{alignSelf: 'flex-start', width: size, height: size, borderRadius: size/2}]}/> 
                              </View>
                              <View>
                                <Text style={styles.name}>{profile.name.split(' ')[0]}</Text>
                                <Text style={styles.age}>{this.getAge(profile.birthday)} years old</Text>
                                <Text style={styles.gender}>{milesAway}</Text>
                              </View>
                            </View>
                            <View style={styles.rightColumn}>
                              <TouchableOpacity onPress={() => {this.rejectProfile(profile)}}
                              key={profile.uid+"-remove"} >
                                <Text style={{fontSize: 24, color: '#c9e9ff'}}>X</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          <View style={styles.bioContainer}>
                            <Text style={styles.bio}>{profile.bio}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                )
              })
            }
            </View>
          </ScrollView>
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
                        <Text style={styles.gender}>Wait here, or check back later.</Text>
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
        </View>
      );
  }
}

const matchHeight = height/3*1.05
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
    shadowColor: '#000000', 
    shadowOffset: {width: 0, height: 0}, 
    shadowRadius: 7, 
    shadowOpacity: 0.3,
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
    flex: 1,
    alignSelf: 'flex-start',
    paddingTop: 10,
    paddingBottom: 30,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize:18,
    color: '#565656',
    textAlign: 'left',
    backgroundColor: 'white',
    //The following limits the shown portion of bio
    //to a max of 4 lines
    lineHeight: (matchHeight/10*6)/5,
  },
  bioContainer: {
    flex: 1,
    borderRadius: 10,
    paddingBottom: 10,
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
    flexDirection: 'row',
    alignSelf: 'flex-start',
    width: matchWidth/2,
  },
  rightColumn: {
    width: matchWidth/3,
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
    fontSize: 16,
    marginTop: 2,
    marginBottom: 1,
    color: 'gray',
    borderRadius: 10,
  },
  gender: {
    color: '#2B2B2B',
    textAlign: 'left',
    fontSize: 17,
    marginTop: 2,
    marginBottom: 2,
    color: 'gray',
    borderRadius: 10,
  },
});
