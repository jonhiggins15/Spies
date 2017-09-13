var room;
var all;
const auth = firebase.auth();

auth.onAuthStateChanged(function(user) {
  if (user) {
    $('#account').hide();
    $('#signOut').show();
    console.log(user);

    all = getJson();
    room = all.users[user.uid].room;
    if(room != null){
      $('#gameModal').modal('show');
      $('#currentRoom').append('<button id="modalJoin" onclick="joinGame()"></button>');
      $('#modalJoin').text(room);
    }

  } else {
    $('#signOut').hide();
    $('#account').show();
  }
});

$('#signInButton').click(function(){
    var email = $('#email').val();
    var password = $('#password').val();
    var hadError = false;

    if(email != "" && password != ""){
      auth.signInWithEmailAndPassword(email, password).then((user) => {
        if(!hadError) success();
      }).catch(function(error){
        hadError = true;
        console.log(hadError);
        var errorCode = error.code;
        var errorMessage = error.message;
        $('#login-error').text(errorMessage);
    });
  }
});

function success(){
    $('#loginModal').modal('hide');
    $('#login-error').text("");
}

$('#signUpButton').click(function(){
    var email = $('#emailForm').val();
    var password = $('#passwordForm').val();
    var name = $('#nameForm').val();
    var hadError = false;

    if(email != "" && password != ""){
      auth.createUserWithEmailAndPassword(email, password).then((user) => {
        if(!hadError) success();
      }).catch(function(error){
        hadError = true;
        console.log(hadError);
        var errorCode = error.code;
        var errorMessage = error.message;
        $('#login-error').text(errorMessage);
    });
  }
});

$('#create-account-link').click(function(){
  $('#login-error').text("");
});

$('#login-link').click(function(){
  $('#signin-error').text("");
});

$('#signOut').click(function(){
    auth.signOut();
});

$('#signOut').click(function(){
  $('#loginModal').modal('show');
});
