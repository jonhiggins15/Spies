//This file should be added to all HTML pages.  It initializes firebase, and finds the
//username and the room and sets them

//TODO: this could and should be drasticly simplified.  The whole temp thing is pretty sloppy

var config = {
  apiKey: "AIzaSyBjxttr82927G5x1_C-MPvJRQMYKmQ4d3g",
  authDomain: "spies-dcdf2.firebaseapp.com",
  databaseURL: "https://spies-dcdf2.firebaseio.com",
  projectId: "spies-dcdf2",
  storageBucket: "spies-dcdf2.appspot.com",
  messagingSenderId: "989041921995"
};
firebase.initializeApp(config);
const auth = firebase.auth();
var currUser;
var tempRoom;
var four = 4;
var dbRef = firebase.database().ref().child('rooms');

auth.onAuthStateChanged(function(user){
  if (user && user != null) {
    $('#currUser').text(user.email+", "+user.uid);
    currUser = user;
  }else{
    alert("no!");
  }
});

dbRef.once('value', function(snapshot) {
  findRooms(snapshot.val());
});

function findRooms(s) {
  console.log(currUser.uid);
  for (x in s) {
    tempRoom = x;
    four = 5;
    var playerRef = firebase.database().ref().child('rooms/'+x+'/players/');
    function(snapshot){
      findPlayer(snapshot.val());
    }
    console.log(JSON.stringify(x).substring(1, JSON.stringify(x).length - 1));
  }
}

function findPlayer(snap){
  console.log(tempRoom);
  for(x in snap) {
    if(x == currUser.uid){
      $('#currRoom').text(tempRoom+", "+currUser.uid);
    }
  }
}
