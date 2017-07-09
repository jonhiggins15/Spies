// Initialize Firebase
var config = {
  apiKey: "AIzaSyBjxttr82927G5x1_C-MPvJRQMYKmQ4d3g",
  authDomain: "spies-dcdf2.firebaseapp.com",
  databaseURL: "https://spies-dcdf2.firebaseio.com",
  projectId: "spies-dcdf2",
  storageBucket: "spies-dcdf2.appspot.com",
  messagingSenderId: "989041921995"
};
firebase.initializeApp(config);
var allRooms = document.getElementById('allRooms');
var user = firebase.auth().currentUser;
//finds the room we're in by looping through all the rooms added until it
//reaches the one most recently added, then sets the currRooms text to that room
function findRooms(s) {
  console.log(s);
  for (x in s) {
    console.log(x);
    currRooms.innerText = JSON.stringify(x).substring(1, JSON.stringify(x).length - 1);
  }
}

function currRoom(){
  alert(user.uid);
}
var dbRef = firebase.database().ref().child('rooms');
//everytime the pave loads, this calls findRooms
dbRef.once('value', function(snapshot) {
  findRooms(snapshot.val());
});

currRoom();
