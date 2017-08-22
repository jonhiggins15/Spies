
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



/*
var counter = 0;
function spy(value){
  $(document).ready(function(){
    var spy={
      name: "Spy",
      life: true,
      killer: true,
      icon: new Image()
    };
    counter++;
    spy.icon.src = "Images/waves.jpg";
    $('#test').html(spy.icon);
    $("#thing").html(counter);

        if(counter<3 || counter>7){
          $("#testing").html("True");
          $("#test").fadeTo("slow", 1);
          spy.life = true;
        }
        else{
          //$("#testing").html("The " + spy.name + " is dead");
          $("#test").fadeTo("slow", .5);
          spy.life = false;
        }
      });
}
*/
