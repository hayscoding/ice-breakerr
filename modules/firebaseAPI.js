import * as firebase from 'firebase';
import GeoFire from 'geofire'
import * as _ from 'lodash'
import Exponent from 'expo';

export const loginUser = (accessToken) => {
    const provider = firebase.auth.FacebookAuthProvider //declare fb provider
    const credential = provider.credential(accessToken) //generate fb credential
    return firebase.auth().signInWithCredential(credential) // signin to firebase using facebook credential
}

export const logoutUser = () => {
  return firebase.auth().signOut()
}

export const updateUser = (uid, key, value) => {
  firebase.database().ref().child('users').child(uid)
    .update({[key]:value})
}

export const getQuestions = (func) => {
  firebase.database().ref().child('questions').once('value', (snap) => {
    if (snap.val()) {
      const questions = snap.val().slice(0, 4)
      func(questions)
    }})  
}

export const getQuestion = (idString, func) => {
  firebase.database().ref().child('questions').child(idString).once('value', 
    (snap) => { 
      if(snap.val())
        func(snap.val())
    })
}

export const mergeUser = (uid, newData) => {
  console.log('newData', newData)
  watchUserLocationDemo(uid)
  const firebaseRefAtUID = firebase.database().ref().child('users/'+uid)
  return firebaseRefAtUID.once("value").then((snap) => {
    const defaults = {
        maxDistance: 5,
        ageRange: [18,24],
        uid: uid,
        birthday: "01/01/1992",
        isSearchingForGame: false,
    }
    const current = snap.val()
    const mergedUser = {...defaults, ...current, ...newData}
    firebaseRefAtUID.update(mergedUser)
  })  
}

export const unlikeProfile = (userUid, profileUid) => {
  firebase.database().ref().child('relationships').child(userUid).child('liked')
  .child(profileUid).set(false)
}

export const matchProfile = (userUid, profileUid) => {
  firebase.database().ref().child('relationships').child(userUid).child('matches')
    .child(profileUid).set(true)
  firebase.database().ref().child('relationships').child(profileUid).child('matches')
    .child(userUid).set(true)
}

export const getMatches = (key, func) => {
  firebase.database().ref().child('relationships/'+key).child('matches').once('value')
    .then((snap) => {
      if(snap.val() != null)
          getUsersCb(Object.keys(snap.val()), (profiles) => {
            if(profiles != null)
              func(profiles)
          })
      else
        func(null)
    })
}

export const getUser = (key) => {
  return firebase.database().ref().child('users').child(key).once('value')
    .then((snap) => snap.val())
}

export const getUserCb = (key, func) => {
  firebase.database().ref().child('users').child(key).once('value')
    .then((snap) => func(snap.val()))
}

export const getUsersCb = (keyArray, func) => {
  firebase.database().ref().child('users').once('value')
    .then((snap) => {
      if(snap.val() != null) {
        const users = []

        keyArray.forEach((key) => {
          users.push(snap.val()[key])
        })

        func(users)
      }
    })
}

export const getChat = (key) => {
  return firebase.database().ref().child('messages').child(key).once('value')
    .then((snap) => snap.val())
}

export const getProfilesInChatsWithKey = (key, func) => {
  return firebase.database().ref().child('messages').once('value')
    .then((snap) => {
    if(snap.val() != null) {
        const profileUids = []

        Object.keys(snap.val()).forEach((chatID) => {
          if(chatID.split('-').some((uid) => {return uid == key}))
            profileUids.push(chatID.split('-').filter((uid) => {return uid != key}))
        })

        getUsersCb(profileUids, (profiles) => {func(profiles)})
      }
    })
}

export const watchProfilesInChatsWithKey = (key, func) => {
  return firebase.database().ref().child('messages').on('value', (snap) => {
    if(snap.val() != null) {
        const profileUids = []

        Object.keys(snap.val()).forEach((chatID) => {
          if(chatID.split('-').some((uid) => {return uid == key}))
            profileUids.push(chatID.split('-').filter((uid) => {return uid != key}))
        })

        getUsersCb(profileUids, (profiles) => {func(profiles)})
      }
    })
}


export const getAllUsers = (func) => {
  firebase.database().ref().child('users').once('value')
    .then((snap) => {
      if(snap.val() != null) {
        if(snap.val() != null)
          getUsersCb(Object.keys(snap.val()), (profiles) => {
            if(profiles != null)
              func(profiles)
          })
        else
          func(null)
      }
    })
}

export const watchUser = (key, func) => {
  firebase.database().ref().child('users/'+key).on('value', (snap) => {
    func(snap.val())
  })
}

export const removeWatchUser = (key) => {
  firebase.database().ref().child('users/'+key).off()
}

export const watchMatches = (key, func) => {
  firebase.database().ref().child('relationships/'+key).child('matches').on('value', (snap) => {
    func(snap.val())
  })
}

export const checkMatches = (key, func) => {
  firebase.database().ref().child('relationships/'+key).child('matches').once('value', (snap) => {
    if(snap.val() != undefined)
      func(snap.val())
    else
      func(null)})
}

export const removeMatchesWatcher = (key) => {
  firebase.database().ref().child('relationships/'+key).child('matches').off()
}

export const watchUserLocation = (key) => {
  const firebaseRef = firebase.database().ref()
  const geoFire = new GeoFire(firebaseRef.child('geoData/'))
  const options ={
    enableHighAccuracy:false,
    timeInterval:100000,
    distanceInterval: 3000
  }
  Exponent.Location.watchPositionAsync(options,(pos)=>{
    const {latitude,longitude} = pos.coords
    geoFire.set(key, [latitude,longitude]).then(() => {
        // console.log("Key has been added to GeoFire");
      }, (error) => {
        // console.log("Error: " + error);
      })
  })
}
export const watchUserLocationDemo = (key) => {
  const firebaseRef = firebase.database().ref()
  const geoFire = new GeoFire(firebaseRef.child('geoData/'))
  const lat = -26.2041028
  const lon = 28.0473051
  geoFire.set(key, [lat, lon]).then(() => {
      // console.log("Key has been added to GeoFire");
    }, (error) => {
      // console.log("Error: " + error);
    })
}

export const findProfiles = (user, func) => {
  const firebaseRef = firebase.database().ref()
  const geoFire = new GeoFire(firebaseRef.child('geoData/'))
  geoFire.get(user.uid).then(location => {    
    const geoQuery = geoFire.query({
      center: location,
      radius: user.maxDistance
    })
    geoQuery.on("ready", (res) => { // loaded geodata
      geoQuery.cancel()
    })

    let profiles = []
    let timeOutSet = false

    geoQuery.on("key_entered", (key, location, distance) => {
      // console.log(key + " entered query at " + location + " (" + distance + " km from center)");

      if(!timeOutSet) {
            timeOutSet = true
            // console.log('settingTimer')
            setTimeout(() => {
              // console.log('timedOut')
              geoQuery.cancel()

              if(filter.filterWithPreferences(profiles, user).length >= 2) {
                func(shuffleArray(filter.filterWithPreferences(profiles, user)))
              } else if(filter.filterWithPreferences(profiles, user).length < 2)
                func('timedOut')

              geoQuery.cancel()
            }, 4000) 
        }

      getUser(key).then((entry) => {
        if(entry != null) {
          filter.filterProfile(entry, user, (profile) => {
            if(profile != false)
              profiles.push(profile)
          }) 
        }   
      })
    }) 
  }) 
}

const shuffleArray = (array) => {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array
}