// Initialize Firebase

//finds the room we're in by looping through all the rooms added until it
//reaches the one most recently added, then sets the currRooms text to that room
// function findRooms(s) {
//   console.log(s);
//   for (x in s) {
//     console.log(x);
//     currRooms.innerText = JSON.stringify(x).substring(1, JSON.stringify(x).length - 1);
//   }
// }

// function currRoom(){
//   alert(user.uid);
// }
// var dbRef = firebase.database().ref().child('rooms');
//everytime the pave loads, this calls findRooms
// dbRef.once('value', function(snapshot) {
//   findRooms(snapshot.val());
// });
