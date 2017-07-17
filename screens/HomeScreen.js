import React from 'react';
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';

import { MonoText } from '../components/StyledText';

const {height, width} = Dimensions.get('window');

export default class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Ice Breaker',
  };

  render() {
    return(
      <View style={styles.container}>
        <View style={styles.topContainer}>
          <View style={styles.mainTitle}>
            <Text style={styles.underline}>Recent Updates</Text>
          </View>
          <ScrollView style={styles.recentUpdates}>
            <View style={styles.partyUpdate}>
              <Text style={styles.name}>10:33pm: PARTY IN COMMONS!!</Text>
            </View>
            <View style={styles.update}>
              <Text style={styles.name}>12:14pm: Need people for LCU labor</Text>
            </View>
            <View style={styles.goodUpdate}>
              <Text style={styles.name}>11:32am: Food is currently in the kitchen</Text>
            </View>
            <View style={styles.badUpdate}>
              <Text style={styles.name}>9:00am: You have labor hours today</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    )
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 2,
    borderColor: 'lightgrey',
  },
  name: {
    color: '#2B2B2B',
    fontSize: 15,
    marginTop: 5,
    marginBottom: 2,
    textAlign: 'center'
  },
  match: {
    justifyContent: 'center', 
    alignItems: 'center',
    height: 50,
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
    backgroundColor:'white',
  },
  mainTitle: {
    height: height/20,
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor:'white',
    width: width/6*5,
    borderBottomWidth: 1,
    borderColor: 'lightgrey',
  },
  underline: {
    color: '#2B2B2B',
    fontSize: 20,
    marginTop: 5,
    marginBottom: 1,
    textAlign: 'center',
  },
  recentUpdates: {
    flex: 1,
    width: width/6*5,
  },
  update: {
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 10,
    marginLeft: 10,
    backgroundColor: '#EDEDED',
    borderRadius: 25,
    overflow: 'hidden',
  },
  badUpdate: {
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 10,
    marginLeft: 10,
    backgroundColor: 'pink',
    borderRadius: 25,
    overflow: 'hidden',
  },
  goodUpdate: {
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 10,
    marginLeft: 10,
    backgroundColor: 'lightgreen',
    borderRadius: 25,
    overflow: 'hidden',
  },
  partyUpdate: {
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 5,
    marginBottom: 5,
    marginRight: 10,
    marginLeft: 10,
    backgroundColor: '#D7B5FF',
    borderRadius: 25,
    overflow: 'hidden',
  },
});
