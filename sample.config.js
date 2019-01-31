var config = {
	development: {
	    //url to be used in link generation
	    url: '',
	    //mongodb connection settings
	    database: {
			firebaseApiKey: "",
			firebaseAuthDomain: "",
			databaseURL: "",
 		},
	    //server details
	    server: {
	        baseUrl: ''
	    },
	    //facebook api details
	    facebook: {
	    	appId: 'not available'
	    },
	},
	production: {
	    //url to be used in link generation
	    url: '',
	    //mongodb connection settings
	    database: {
			firebaseApiKey: "",
			firebaseAuthDomain: "",
			databaseURL: ""
	 	}, 
	    //server details
	    server: {
	        baseUrl: ''
	    },
	    //facebook api details
	    facebook: {
	    	appId: 'not available'
	    },
	}
};
module.exports = config;