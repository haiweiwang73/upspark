const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const nodemailer = require('nodemailer');
const gmailEmail = encodeURIComponent(functions.config().gmail.email);
const gmailPassword = encodeURIComponent(functions.config().gmail.password);
const mailTransport = nodemailer.createTransport(`smtps://${gmailEmail}:${gmailPassword}@smtp.gmail.com`);




var intrests = ["Sports", "Music", "Traveling", "Food", "LGBT","Drinking"];


// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.sendMessage = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  var mainCandidateArr = [];
	intrests.forEach(function (intrest) {
		admin.database().ref('/userProfile').once('value').then( function(snapshot) {
	  		var users  = snapshot.val();
			var usersArr = [];
			var usersDetailsArr = [];
			users = shuffleArray(users);

	  		var headCount = 0;
	  		Object.keys(users).forEach(function(usersId){
	  			var userDetail = users[usersId];
	  			var email = userDetail.email;
	  			var intrestGroup = userDetail.interests;
	  			if(intrestGroup.indexOf(intrest.toLowerCase())!= -1 && mainCandidateArr.indexOf(email) == -1 && headCount<5){
	  				console.log(" push email : ",email);
	  				usersArr.push(email);
	  				usersDetailsArr.push(userDetail);
	  				mainCandidateArr.push(email);
					headCount++;
	  			}	

	  		});


	  		if(usersArr.length > 0 ){
				var date = new Date();
				date.setDate(date.getDate() + 7);
				date.setHours(9,0,0,0);

				var formattedDate = getDateNow(date);
			    var event = {
			    	"group": intrest,
			    	"time": date.valueOf(),
			    	"members": usersArr,
			    };

			    var id = date.valueOf();
			    var eventRef = admin.database().ref('/meetup').push(event);


			    var mailingList = '';
			    for(var i = 0, len = usersArr.length; i < len; i++){
			    	mailingList = mailingList + usersArr[i] + ','; 
			    }

			    if(mailingList.length >0){
			    	mailingList = mailingList.substring(0,mailingList.length-1);
			        var htmltext =  '<h1>Come grab your coffee with Uptakers!</h1><h2>Time : '+ formattedDate +' 9:00AM </h2> <p>Here is the list of your morning coffee companion :</p>';

			        for(var i = 0, len = usersDetailsArr.length; i < len; i++){
			        	htmltext = htmltext + "<li> "+usersDetailsArr[i].name+"  --- "+usersDetailsArr[i].about+"</li>"
			        }

			    	  const mailOptions = {
			    		to: mailingList,
			    		subject: 'Upspark invitation for coffee with Uptakers for '+ intrest + '@'+ formattedDate+' 9:00AM',
			    		html: htmltext
			  		  };

			  		    mailTransport.sendMail(mailOptions).then(() => {
			    		 console.log('Mail sent to: '+ mailingList);
			  		   });

			    }
			}
		});

	});
	  
	return res.sendStatus(200);

});

function getDateNow(today){
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
    	dd = '0'+dd
	} 

	if(mm<10) {
    	mm = '0'+mm
	} 

	today = mm + "-" + dd + "-" + yyyy;

	return today;
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}
// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
// exports.checkOnCreate = functions.auth.user().onCreate(event => {
//       // Grab the current value of what was written to the Realtime Database.
//        const original = event.data;
//       console.log('event ', original);
//       console.log('email ', original.email);

// 	var content = '{"client_id":"53118716183-8p7ufo3lfrujeai7ea6fcqmorm1en55p.apps.googleusercontent.com","project_id":"upspark-23fe6","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://accounts.google.com/o/oauth2/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_secret":"UjL3HUofuS2UNukosFoqaAOz","redirect_uris":["https://upspark-23fe6.firebaseapp.com/__/auth/handler"],"javascript_origins":["http://localhost","http://localhost:5000","https://upspark-23fe6.firebaseapp.com"]}';
// 	console.log('Json : ',content);
// 	authorize(JSON.parse(content), listEvents);


//   // admin.database().ref('/messages').push({original: original}).then(snapshot => {
//   //   // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
//   // });
// });