var config = {
	development: {
	    //url to be used in link generation
	    url: 'http://www.icebreakerr.com',
	    //mongodb connection settings
	    database: {
			firebaseApiKey: "",
			firebaseAuthDomain: "ice-breakerr-development.firebaseapp.com",
			databaseURL: "https://ice-breakerr-development.firebaseio.com",
 		},
	    //server details
	    server: {
	        baseUrl: 'https://ice-breaker-server.herokuapp.com/'
	    },
	    //facebook api details
	    facebook: {
	    	appId: 'not available'
	    },
	},
	production: {
	    //url to be used in link generation
	    url: 'http://www.icebreakerr.com',
	    //mongodb connection settings
	    database: {
			firebaseApiKey: "",
			firebaseAuthDomain: "ice-breakerr.firebaseapp.com",
			databaseURL: "https://ice-breakerr.firebaseio.com"
	 	}, 
	    //server details
	    server: {
	        baseUrl: 'https://ice-breaker-server.herokuapp.com/'
	    },
	    //facebook api details
	    facebook: {
	    	appId: 'not available'
	    },
	}
};
module.exports = config;