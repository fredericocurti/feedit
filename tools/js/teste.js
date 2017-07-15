// Initialize Firebase
var config = {
  apiKey: "AIzaSyBcFce_uWpOt8QHJKnU7fBBaPmOSMEbiTo",
  authDomain: "febee-2b942.firebaseapp.com",
  databaseURL: "https://febee-2b942.firebaseio.com",
  storageBucket: "febee-2b942.appspot.com",
  messagingSenderId: "301542026521"
};

var locales = {};
var places = [];
var updatecounter = 0;
var initialstate = 0;
var newEval = null;
var datacounter = 0;
var db = {};
var initialisloaded = false;
var limit = 0;
var userimg = "img/default-icon-user.png";
var notification_sound = new Audio('assets/pop.mp3');
var counterMemory = {}
var notificationslist = [];
var newDataStack = [];
var userIsWatching = true;

function dataBlock(value){
  this.data = {};
  this.hiddenIDs = [];
  this.place = value.local;
  this.counters = {}
  this.counters["total"] = 0;
  this.counters["ruim"] = 0;
  this.counters["bom"] = 0;
  this.counters["excelente"] = 0;
  this.increaseCounter = function(counter){
    this.counters[counter] ++;
    general.counters[counter] ++;
  }
}

function generalBlock(){
  this.counters = {};
  this.counters["ruim"] = 0;
  this.counters["bom"] = 0;
  this.counters["excelente"] = 0;
  this.counters["total"] = 0;
}

general = new generalBlock()


function Feedit() {
  // this.signInButton = document.getElementById('submitbt');
  // this.signInButton.addEventListener('click', this.signIn.bind(this));
  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
Feedit.prototype.initFirebase = function() {
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
  // Initiates Firebase auth and listen to auth state changes.
};

Feedit.prototype.startHandler = function(){
  $("#slide-button").css("display","block");
}
  
// Initialize mainapp
Feedit.prototype.displayGui = function(){
    $("#main-content").css("display","block");
    $("#loadingbar").attr("style","");
    $("#loadingbar").center();
    $("#header").remove();
    $("#iconsection").remove();
    $("#mainview").removeClass("mainbg");
    $( "#main-content" ).prepend(
    '<div class="data-container">'+
      '<div class="col s12 m12">'+
      "<div id='maindata' class='Site-content'></div>"+
      '</div>'+
    '</div>'
  );

  // Deals with the notification button state = on/off

    loading = document.getElementById("loadingbar");
    $("#maindata").append(loading);
    // $("#navbar").css("background-color","rgb(187,41,41)");

    // Draws container for key values
    $("#maindata").append(
      '<div class="row" style="padding-top:50px;">'+
          '<div id="data-wrapper" class="card col s12 m6 l6" style="containerStyle: null;">'+
              '<h5 style="color:gray;">Simulador de reviews</h5>'+
              '<label for="datadate" class="active">Data</label>'+
              '<input id="datadate" type="date" class="datepicker">'+
              '<label for="timepicker" class="active">Hora</label>'+
              '<input id="datatime" type="time" class="timepicker">'+
              '<label for="local">Nome da máquina</label>'+
              '<input id="local" type="text" class="validate">'+
              '<div class="input-field col s12">'+
                  '<select id="scoreselect">'+
                      '<option value="excelente">Excelente</option>'+
                      '<option value="bom">Bom</option>'+
                      '<option value="ruim">Ruim</option>'+
                  '</select>'+
                  '<label>Nota</label>'+
              '</div>'+
              '<a id="sendbutton" style="margin-top:350px;" class="btn-floating halfway-fab btn-large waves-effect waves-light blue darken-3"><i class="material-icons">send</i></a>'+
              '<a id="sendnowbutton" style="margin-left:350px !important; right: 100px;" class="btn-floating halfway-fab btn-large waves-effect waves-light blue lighten-3"><i class="material-icons">call_merge</i></a>'+
          '</div>'+
      '</div>');

    $('#textDefault').datePicker();
    $('.datepicker').pickadate({
      selectMonths: true, // Creates a dropdown to control month
      selectYears: 15 // Creates a dropdown of 15 years to control year
    });

    $('select').material_select();

    $('.timepicker').pickatime({
      default: 'now', // Set default time
      fromnow: 0,       // set default time to * milliseconds from now (using with default = 'now')
      twelvehour: false, // Use AM/PM or 24-hour format
      donetext: 'OK', // text for done-button
      cleartext: 'Clear', // text for clear-button
      canceltext: 'Cancel', // Text for cancel-button
      autoclose: false, // automatic close timepicker
      ampmclickable: true, // make AM PM clickable
      aftershow: function(){} //Function for after opening timepicker  
    });

    $('#sendbutton').click( () => {
      if ($("#local").val() != '' && $("#datatime").val() != '' && $("#datadate").val() != ''){
        console.log('valido')

        place = $('#local').val()
        score = $("#scoreselect").val()
        time = moment.duration($('#datatime').val()).valueOf()
        date = moment($('#datadate').val(),'DD MMMM, YYYY')

        console.log(moment(date.valueOf() + time).format('MMMM Do YYYY, h:mm:ss a'))

        feedit.database.ref('/users/' + currentUser.uid + '/data/machines/' + place.toLowerCase() + '/entries').push(
          {
            date: date.valueOf() + time,
            score : score 
          }
        ).then( () => { 
          console.log('Pushed score ' + score + ' to ' + place + ' at ' + date)
          Materialize.toast('Pushed score ' + score.toUpperCase() + ' to ' + place.toUpperCase() + ' at ' + moment(date.valueOf() + time).format('MMMM Do YYYY, h:mm:ss a'), 5000, 'rounded') // 'rounded' is the class I'm applying to the toast
        });
      } else {
        Materialize.toast('Please fill all fields to send a review',2000)
      }
    })

    $('#sendnowbutton').click( () => {
      if ($("#local").val() != ''){
        console.log('valido')

        place = $('#local').val()
        score = $("#scoreselect").val()

        feedit.database.ref('/users/' + currentUser.uid + '/data/machines/' + place.toLowerCase() + '/entries').push(
          {
            date: Date.now(),
            score : score 
          }
        ).then( () => { 
          Materialize.toast('Pushed score ' + score.toUpperCase() + ' to ' + place.toUpperCase() + ' at right now', 5000, 'rounded') // 'rounded' is the class I'm applying to the toast
        });
      } else {
        Materialize.toast('Please fill the place field to send a instant review',2000)
      }
    })
      
}



Feedit.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions.');
  } else if (config.storageBucket === '') {
    window.alert('Your Cloud Storage bucket has not been enabled. Sorry about that. This is ' +
        'actually a Firebase bug that occurs rarely. ' +
        'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
        'and make sure the storageBucket attribute is not empty. ' +
        'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
        'displayed there.');
  } else {
    console.log("Firebase SDK loaded properly")
  }
};

// Signs in
Feedit.prototype.signIn = function() {
  this.auth.signInWithEmailAndPassword(this.userName,this.userPass).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    if(errorCode == "auth/user-not-found" || errorCode == "auth/wrong-password"){
      console.log("Usuário ou senha inválidos!");
      Materialize.toast('Usuário ou senha incorretos, por favor tente novamente!', 4000,"bottom")
      $('#userpassword').val("");
      $("#loadingbar").hide();
      $("#submitbt").show();
    }
    // console.log(typeof errorCode);
  });
};

Feedit.prototype.signOut = function() {
  this.auth.signOut();
  location.reload();
};

Feedit.prototype.registerNewUser = function(){
  var valemail = $('#useremail').attr('class');
  var varpass = $("#userpassword").attr('class');

  if(valemail == "validate valid"){
    var email = $('#useremail').val();
    var password = $("#userpassword").val();
    this.auth.createUserWithEmailAndPassword(email,password).catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // ...
});
  Materialize.toast("NOVO USUÁRIO REGISTRADO COM SUCESSO!",3000);

  } else {
    Materialize.toast("Por favor preencha os campos corretamente",2000);
  }
}

Feedit.prototype.handleUserSettings = function(){
  $('#user-modal').modal("open");
  $("#file-input").change(function(){
      readURL(this);
  });

  $("#username").attr("placeholder",currentUser.displayName);
  $("#email").attr("placeholder",currentUser.email);
}


Feedit.prototype.onAuthStateChanged = function(user) {
  currentUser = user;
  $('#initloading').remove();

  if (user) { // User is signed in!
    console.log("User is signed in");
    $("#newUID").html(" ID: "+currentUser.uid);
    $('#modal1').modal('close');
    $("#topuserdisplay-off").remove();
    $('#topuserdisplay').css("display","block");
    $("#loadingbar").remove();

    if (user.photoURL != null){
      console.log("User has a profile pic.");
      userimg = currentUser.photoURL;
      $("#sidebar-thumb").attr("src",currentUser.photoURL);
    } else {
      console.log("User doesnt have a profile pic. Setting default");
    }

    document.getElementById("topuserdisplay").innerHTML = '<img style="margin-top:10px;" class="circle user-img" width="30px" height="30px" src="'+userimg+'">';
    $("#imgshow").html('<img style="margin-top:10px;" class="circle user-img" width="30px" height="30px" src="'+userimg+'">');

    document.getElementById("nameshow").innerHTML = currentUser.email;
    document.getElementById("user-email").innerHTML = currentUser.email;

    if (initialstate == 0){
      Materialize.toast("Usuário autenticado com sucesso!",4000);
      feedit.displayGui();
      feedit.startHandler();
    }

    initialstate=1


  } else { // User is signed out!
    $("#intro-content").css("display","block");
    $("#topuserdisplay-off").css("display","block");
    console.log("User has/is signed out!");
    initialstate = 0;
  }
};

function login(){
  var valemail = $('#useremail').attr('class');
  var varpass = $("#userpassword").attr('class');

  if(valemail == "validate valid"){
    feedit.userName = $("#useremail").val();
    feedit.userPass = $("#userpassword").val();
    console.log("Logging in to:" + feedit.userName);
    feedit.signIn();
    if(initialstate == 0){
      $("#submitbt").hide();
      $("#loadingbar").show();
    }

  } else {
    Materialize.toast("Por favor preencha os campos corretamente",2000);
  }
};

// ---------------------- AUX FUNCTIONS ----------------------------------------

window.onload = function(){
  window.feedit = new Feedit();
  $("#userpassword").keypress(function(e) {
      if(e.which == 13) {
        $("#submitbt").click();
      }
  });

}


$('.dropdown-button').dropdown({
    inDuration: 300,
    outDuration: 225,
    constrainWidth: false, // Does not change width of dropdown to that of the activator
    hover: true, // Activate on hover
    gutter: 0, // Spacing from edge
    belowOrigin: false, // Displays dropdown below the button
    alignment: 'left', // Displays dropdown with edge aligned to the left of button
    stopPropagation: false // Stops event propagation
  }
);


jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) +
                                                $(window).scrollTop()) + "px");
    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
                                                $(window).scrollLeft()) + "px");
    return this;
}

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function colorString(counter){
  if ($("#"+counter)[0].childNodes[0].innerHTML == "Excelente"){
    $("#"+counter)[0].childNodes[0].outerHTML = '<span class="col s4 left-align nota-excelente">Excelente</span>';
  }
  else if ($("#"+counter)[0].childNodes[0].innerHTML == "Bom"){
    $("#"+counter)[0].childNodes[0].outerHTML = '<span class="col s4 left-align nota-bom">Bom</span>';
  }
  else if ($("#"+counter)[0].childNodes[0].innerHTML == "Ruim"){
    $("#"+counter)[0].childNodes[0].outerHTML = '<span class="col s4 left-align nota-ruim">Ruim</span>';
  }
}


