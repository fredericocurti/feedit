var script = document.createElement('script');
script.src = 'http://code.jquery.com/jquery-2.1.1.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

// Initialize Firebase
var config = {
  apiKey: "AIzaSyBcFce_uWpOt8QHJKnU7fBBaPmOSMEbiTo",
  authDomain: "febee-2b942.firebaseapp.com",
  databaseURL: "https://febee-2b942.firebaseio.com",
  storageBucket: "febee-2b942.appspot.com",
  messagingSenderId: "301542026521"
};


function writeUserData(userId, name, email) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
  });
}

function retrieve(){
  $("#submitbt").hide();
  $("#loadingbar").show();
  return firebase.database().ref('/').once('value').then(function(snapshot) {
    var username = snapshot.val();
    console.log(username)
    // document.write(username)
    // ...
  });
}
