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
var uid;
var tempRoom;
var dbRef = firebase.database().ref().child('rooms');

auth.onAuthStateChanged(function(user){
  if (user && user != null) {
    uid = user.uid;
    $('#currUser').text(user.email);
    currUser = user;
  }else{
    alert("no!");
  }
  findRoom();
});

//uses REST api to get the whole firebase database and make it an object, which is returned
function getJson(){
  var xhttp = new XMLHttpRequest();

  //TODO: IMPORTANT: before putting this on the website, change rules and put some
  //form of authentication in the url
  xhttp.open("GET","https://spies-dcdf2.firebaseio.com/.json?print=pretty", false);
  xhttp.send();
  var response = JSON.parse(xhttp.responseText);
  // alert(response.rooms.Test.hostuid);
  return response;
}

function findRoom(){
  all = getJson();
  console.log(all);
  console.log(all.rooms);
  for(i in all.rooms){
    // alert(i);
    for(x in all.rooms[i].players){
      // alert(currUser.uid+", "+x);
      if(currUser.uid == x){
        $('#currRoom').text(i);
      }
    }
  }

}




















// dbRef.once('value', function(snapshot) {
//   findRooms(snapshot.val());
// });
//
// function findRooms(s) {
//   console.log(currUser.uid);
//   for (x in s) {
//     tempRoom = x;
//     four = 5;
//     var playerRef = firebase.database().ref().child('rooms/'+x+'/players/');
//     alert("one");
//     listener(playerRef);
//     console.log(JSON.stringify(x).substring(1, JSON.stringify(x).length - 1));
//     alert("three");
//   }
// }
//
// function listener(p){
//   p.once('value',function(snapshot){
//     alert("two");
//     findPlayer(snapshot.val());
//   });
// }
//
// function findPlayer(snap){
//   console.log(tempRoom);
//   for(x in snap) {
//     if(x == currUser.uid){
//       $('#currRoom').text(tempRoom+", "+currUser.uid);
//     }
//   }
// }
