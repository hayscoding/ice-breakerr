import * as FirebaseAPI from '../modules/firebaseAPI'

const baseUrl = 'https://ice-breaker-server.herokuapp.com/'
 
export const postMessageNotificationToUid = (senderFirstName, receiverPushToken, msg) => {
	fetch((baseUrl+'notify-message'), {
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
	fetch((baseUrl+'notify-match'), {
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