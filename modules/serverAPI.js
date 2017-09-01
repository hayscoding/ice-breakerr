import * as FirebaseAPI from '../modules/firebaseAPI'

export const postMessageNotificationToUid = (senderKey, receiverKey, msg) => {
	getUserPushToken(receiverKey, (pushToken) => {
		fetch('https://ice-breaker-server.herokuapp.com/notify-message', {
		  method: 'POST',
		  headers: {
		    'Accept': 'application/json',
		    'Content-Type': 'application/json',
		  },
		  body: JSON.stringify({
		  	senderUid: senderKey,
		    receiverUid: receiverKey,
		    pushToken: pushToken,
		    message: msg,
		  })
		})
	})
}

export const getUserPushToken = (key, func) => {
	FirebaseAPI.getUserCb(key, (user) => {
		func(user.pushToken)
	})
}