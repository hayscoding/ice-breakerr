import * as FirebaseAPI from '../modules/firebaseAPI'

var env = process.env.NODE_ENV || 'development';
// var env = 'production'
var config = require('../config')[env];
 
export const postMessageNotificationToUid = (senderFirstName, receiverPushToken, msg) => {
	fetch((config.server.baseUrl+'notify-message'), {
	  method: 'POST',
	  headers: {
	    Accept: 'application/json',
	    'Content-Type': 'application/json',
	  },
	  body: JSON.stringify({
	  	senderFirstName: senderFirstName,
	    receiverPushToken: receiverPushToken,
	    message: msg,
	  })
	})
}

export const postMatchNotificationToUid = (senderFirstName, receiverPushToken) => {
	fetch((config.server.baseUrl+'notify-match'), {
	  method: 'POST',
	  headers: {
	    Accept: 'application/json',
	    'Content-Type': 'application/json',
	  },
	  body: JSON.stringify({
	  	senderFirstName: senderFirstName,
	    receiverPushToken: receiverPushToken,
	  })
	})
}