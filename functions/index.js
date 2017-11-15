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




var intrests = ["Sports", "Music", "Travel", "Food", "Dating"];


// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.sendMessage = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  const original = req.query.text;


intrests.forEach(function (intrest) {



    var usersArr = findUsers(intrest);

    var date = getDateNow("/");
    var dateNoDilim = getDateNow("");

    var event = {
    	"group": intrest,
    	"time": date,
    	"members": usersArr,
    };

    var obj = {
        [dateNoDilim]: event
    };

    admin.database().ref('/events').push(obj).then(snapshot =>{
    	console.log("create event: "+ event);
    });



    var mailingList = '';
    for(var i = 0, len = usersArr.length; i < len; i++){
    	mailingList = mailingList + usersArr[i] + ','; 
    }

    if(mailingList.length >0){
    	mailingList = mailingList.substring(0,mailingList.length-1);
    	  const mailOptions = {
    		to: mailingList,
    		subject: 'Testing upspark3'+ intrest,
    		html: '<p>Come grab your coffee with Uptakers!</p><p>Time : '+ date +'</p>'
  		  };

  		    mailTransport.sendMail(mailOptions).then(() => {
    		 console.log('Mail sent to: '+ mailingList);
  		   });

    }


})
  
  return;

});

function findUsers(intrest){
	return ["c.jerry.virgo@uptake.com","srijay.sunil@uptake.com"];
}

function getDateNow(dilim){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
    	dd = '0'+dd
	} 

	if(mm<10) {
    	mm = '0'+mm
	} 

	today = mm + dilim + dd + dilim + yyyy;

	return today;
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