
const auth = firebase.auth();

auth.onAuthStateChanged(function(user) {
  if (user) {
    console.log(user);
    $('#account').hide();
    $('#signOut').show();
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
      auth.signInWithEmailAndPassword(email, password).catch(function(error) {
        hadError = true;
        var errorCode = error.code;
        var errorMessage = error.message;
        $('#login-error').text(errorMessage);
      });
      if(!hadError){
        $('#loginModal').modal('hide');
      }
    }
});

$('#signUpButton').click(function(){
    var email = $('#emailForm').val();
    var password = $('#passwordForm').val();
    var name = $('#nameForm').val();
    var hadError = false;
    if(email != "" && password != ""){
      auth.createUserWithEmailAndPassword(email, password).catch(function(error) {
        hadError = true;
        var errorCode = error.code;
        var errorMessage = error.message;
        $('#signin-error').text(errorMessage);
      });
      if(!hadError){
        $('#loginModal').modal('hide');
      }
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
