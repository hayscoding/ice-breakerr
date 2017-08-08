import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Text, Image, Dimensions } from 'react-native';
import { ExpoLinksView } from '@expo/samples';

import * as FirebaseAPI from '../modules/firebaseAPI'

const {height, width} = Dimensions.get('window');

export default class BioScreen extends React.Component {
  static navigationOptions = {
    title: 'People Near You',
    headerLeft: null,
    gesturesEnabled: false,
    timer: {},
  };

  componentWillMount() {
      this.state = {
        user: this.props.screenProps.user, 
        profiles: [],
      }

      FirebaseAPI.getAllUsers((users) => {
        FirebaseAPI.getProfilesInChatsWithKey(this.state.user.uid, (chattedProfiles) => {
          //Filter out the current user from the other individuals
          this.setState({profiles: users.filter((user) => {
            return user.uid != this.state.user.uid 
          }).filter((user) => { //Filter profiles already in chat with user
            return !(chattedProfiles.some((profile) => {
              return profile.uid == user.uid
            }))
          })})
        })
      })

      this._mounted = false
  }

  componentDidMount() {
    this._mounted = true
  }

  componentWillUpdate() {
    this._mounted = false
  }

  componentDidUpdate() {
    this.updateProfilesTimer()
  }

  updateProfilesTimer() {
    const timer = setTimeout(() => {
      if(this._mounted)
        FirebaseAPI.getAllUsers((users) => {
          //Filter out the current user from the other individuals
          this.setState({profiles: users.filter((user) => {
            return user.uid != this.state.user.uid 
            }),
          })

        this._mounted = true
      })
    }, 500)
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
    this.props.navigation.navigate('Profile', {profile: profile, user: this.state.user})
  }

  getFbImageUrl(profile) {
    const fbImageUrl = `https://graph.facebook.com/${profile.id}/picture?height=${height}`
    return fbImageUrl
  }

  render() {
    if(this.state.profiles.length > 0)
      return (
        <View style={styles.container}>
          <ScrollView>
          {
            this.state.profiles.map((profile) => {
              return (
                <View style={styles.match}  key={profile.uid+"-container"}>
                  <View style={styles.shadow} key={profile.uid+"-shadow"}>
                    <TouchableOpacity onPress={() => {this.showProfile(profile)}}
                    key={profile.uid+"-touchable"} >
                      <View style={styles.headerContainer}>
                        <Text style={styles.name}>{profile.name.split(' ')[0]}</Text>
                        <Text style={styles.age}>{this.getAge(profile.birthday)} years old</Text>
                        <Text style={styles.gender}>{profile.gender[0].toUpperCase() + profile.gender.slice(1, profile.gender.length+1)}</Text>
                      </View>
                      <Text style={styles.bio}>{profile.bio}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            })
          }
          </ScrollView>
        </View>
      );
    else
      return <View></View>
  }
}

const matchHeight = height/3*1.15

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    backgroundColor: '#f7fbff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    color: '#2B2B2B',
    fontSize: 18,
    marginTop: 15,
    textAlign: 'left',
  },
  match: {
    width: width,
    height: matchHeight, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingBottom: 20,
  },
  shadow: {
    shadowColor: '#000000', 
    shadowOffset: {width: 0, height: 0}, 
    shadowRadius: 7, 
    shadowOpacity: 0.3,
    borderWidth: 1,
    borderColor: 'lightgrey'
  },
  bio: {
    flex: 1,
    width: width,
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
  headerContainer: {
    paddingTop: 5,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor:'white',
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  name: {
    color: '#2B2B2B',
    fontSize: 24,
    marginTop: 5,
    marginBottom: 1,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  age: {
    color: '#2B2B2B',
    textAlign: 'left',
    fontSize: 16,
    marginTop: 2,
    marginBottom: 1,
    color: 'gray',
  },
  gender: {
    color: '#2B2B2B',
    textAlign: 'left',
    fontSize: 17,
    marginTop: 2,
    marginBottom: 2,
    color: 'gray',
  },
});
