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
var alias = "";
var currRoom;
var email;
var dbRef = firebase.database().ref().child('rooms');

auth.onAuthStateChanged(function(user){
  if (user && user != null) {
    uid = user.uid;
    email = user.email;
    $('#currUser').text(user.displayName);
    currUser = user;
  }else{
    alert("Please sign in first!");
    window.location.href='index.html';
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
  return response;
}

function setName(){
  var alias = $('#aliasInput').val();
  firebase.database().ref('rooms/'+currRoom+'/players/'+uid).update({
    name: alias
  });
  updateAlias();
}

function findRoom(){
  all = getJson();
  for(i in all.rooms){
    for(x in all.rooms[i].players){
      if(currUser.uid == x){
        currRoom = i;
        alias = all.rooms[i].players[currUser.uid].name;
        $('#currRoom').text("Welcome, "+alias+" you are in room "+i);
      }
    }
  }
  updateAlias();
}

//This function makes users pick an alias to identify them to other users
function updateAlias(){
  if (alias == email){
    $('#currRoom').hide();
    $('.nameInput').show();
  }else{
    $('.nameInput').hide();
    $('#currRoom').show();
  }
}


//TODO:this function is not working- sometimes returns undefined as a room even
//though a valid room exists
function findRoom(){
  all = getJson();
  for(i in all.rooms){
    for(x in all.rooms[i].players){
      alert(uid+", "+x);
      if(uid == x){
        return i;
      }
    }
  }
}

function makeUserList(){
  var all = getJson();
  var room = findRoom();
  alert(room);
  for(x in all.rooms[room].players){
    $('#playerList .list').append('<li>'+x.name+'</li>');
  }

}
makeUserList();

updateAlias();
