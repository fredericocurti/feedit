// Initialize Firebase
var config = {
  apiKey: "AIzaSyBcFce_uWpOt8QHJKnU7fBBaPmOSMEbiTo",
  authDomain: "febee-2b942.firebaseapp.com",
  databaseURL: "https://febee-2b942.firebaseio.com",
  storageBucket: "febee-2b942.appspot.com",
  messagingSenderId: "301542026521"
};
var places = [];
var updatecounter = 0;
var initialstate = 0;
var newEval = null;
var datacounter = 0;
var db = {};
var initialislodaded = false;

function Feedit() {
  this.signInButton = document.getElementById('submitbt');
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
  var ref = this.database.ref(currentUser.uid);
  ref.once("value", function(snap) {
    currentUser.count = snap.numChildren();
    console.log("INITIAL DATA COUNT:", currentUser.count);

    if(currentUser.count == 0){
      $("#maindata").append(
        "<h5 class='center' style='padding-top:50px;'> Não existem dados para esse usuário. Configure o dispositivo de feedback corretamente. </h5>");
    }

    feedit.getData();
  });
}

Feedit.prototype.onDataLoaded = function(){
  // change badge counter
  // $(".badge").attr("class","badge");
}

// Initialize mainapp
Feedit.prototype.displayGui = function(){
  $("#loadingbar").attr("style","");
  $("#loadingbar").center();
  $("#header").remove();
  $("#iconsection").remove();
  $("#mainshow").removeClass("mainbg");
  $( "#main-content" ).append(
  "<div class='center'><h5><b>Painel de Controle</b></h5><h6 style='color:grey;'>" + currentUser.email + " | ID: " + currentUser.uid +  "</h6>" +
  "<div class='divider'></div></div>"+
  "<div id='maindata' class='Site-content'></div>");
  loading = document.getElementById("loadingbar");
  $("#maindata").append(loading);
  $("#navbar").css("background-color","rgb(187,41,41)");

  // Draws container for key values
  $("#maindata").append(
    '<div class="container">'+
    '<h5 style="color:gray">Seus locais</h5>'+
    '<ul id="main-values" class="collapsible" data-collapsible="expandable" >'+
    '</ul>'+
    '</div>');
}

Feedit.prototype.displayData2 = function(data){
  Key = data;

    if(places.includes(Key.local) == true){ // PREPENDS TO THE LATEST ITEM LIST
      console.log("locale "+Key.local+" already exists. Appending to the correct place")
      var localid = '#'+Key.local;
      var localid_counter_ref = '#counter-'+Key.local;
      var localchild_id = '#'+Key.local+'>:nth-child(2)';
      // $("#biblioteca>:nth-child(2)").before("<div>inserted div</div>");
      $(localchild_id).before(
      '  <div class="collapsible-body"><span style="padding-left:5%">'+ Key.nota +' | ' + Key.date + ' | ' + Key.time +'</span></div>'
      );
      $(localid_counter_ref).html($(localid)[0].childElementCount-1);

    } else {  // APPENDS FOR THE FIRST TIME, CREATING THE HEADER
      $("#main-values").append(
        '<li id="'+Key.local+'">'+
        '  <div class="collapsible-header" hasflag="0" id="header-'+Key.local+'"><i class="material-icons">label_outline</i><span id="counter-'+Key.local+'"class="badge">'+1+'</span>'+ Key.local.capitalize() + '</div>'+
          '  <div class="collapsible-body" id="last-'+Key.local+'"><span style="padding-left:5%">'+ Key.nota +' | ' + Key.date + ' | ' + Key.time +'</span></div>'+
        '</li>');
    }

    if (initialislodaded == true){ // adds and counts new label
      newBadge = '<span id="badge-'+Key.local+'" class="new badge green" data-badge-caption="Nova"></span>'
      var localid_header = '#header-'+Key.local;
      var localid_badge = '#badge-'+Key.local;
      var flag = $(localid_header).attr('hasflag');
      $(localid_header).attr('counter',parseInt($(localid_header).attr('counter'))+1);
      $(localid_badge).html(parseInt($(localid_header).attr('counter')));

      console.log(flag);

      if(flag == "0"){
        $(localid_header).append(newBadge);
        $(localid_header).attr('hasflag','1');
        $(localid_header).attr('counter','1');
      }
    }

    places.push(Key.local);
    $("#loadingbar").remove();
    $('.collapsible').collapsible();
    //Adds aditional data loaded in realtime
    for(i=0;i<places.removeDuplicates().length;i++){
        $('.collapsible').collapsible('open',i);
    }
}

// Function called to display data onload and every time a new key is pushed to the db
// Feedit.prototype.displayData = function(kind){
//   console.log("display data called | updatecounter:"+updatecounter);
//   if(kind==0){
//     keyplaces = []
//       for (key in initialdb) {
//         if (initialdb.hasOwnProperty(key)) {
//           // Check for keys that contain different locals;
//           Key = initialdb[key]
//           // console.log(Key);
//           if(keyplaces.includes(Key.local) == true){
//             console.log("locale "+Key.local+" already exists. Appending to the correct place")
//             var localid = '#'+Key.local
//             $(localid).append(
//               '  <div class="collapsible-body"><span>'+ Key.nota +' | ' + Key.date + ' | ' + Key.time +'</span></div>'
//               );
//             } else {
//               $("#main-values").append(
//                 '<li id="'+Key.local+'">'+
//                 '  <div class="collapsible-header"><i class="material-icons">label_outline</i>'+ Key.local.capitalize() + '</div>'+
//                 '  <div class="collapsible-body"><span>'+ Key.nota +' | ' + Key.date + ' | ' + Key.time +'</span></div>'+
//                 '</li>');
//             }
//             keyplaces.push(Key.local);
//         }
//     }
//     $("#loadingbar").remove();
//     console.log("Initial data written to UI successfully");
//     $('.collapsible').collapsible();
//     // Adds aditional data loaded in realtime
//   } else if (kind==1 && updatecounter>=1){
//     console.log("updatecounter >= 1!");
//     Key = newEval;
//     if(keyplaces.includes(Key.local) == true){
//       console.log("locale "+Key.local+" already exists. Appending to the correct place")
//       var localid = '#'+Key.local
//       $(localid).append(
//         '  <div class="collapsible-body"><span>'+ Key.nota +' | ' + Key.date + ' | ' + Key.time +'</span></div>'
//         );
//       } else {
//         $("#main-values").append(
//           '<li id="'+Key.local+'">'+
//           '  <div class="collapsible-header"><i class="material-icons">label_outline</i>'+ Key.local + '</div>'+
//           '  <div class="collapsible-body"><span>'+ Key.nota +' | ' + Key.date + ' | ' + Key.time +'</span></div>'+
//           '</li>');
//       }
//       keyplaces.push(Key.local);
//   }
//   $('.collapsible').collapsible();
//   keyplacesindex = keyplaces.removeDuplicates();
//
//   for(i=0;i<keyplacesindex.length;i++){
//       $('.collapsible').collapsible('open',i);
//   }
//
//
// }

// Fetches and calls displayData of the data
Feedit.prototype.getData = function(){
  var ref = this.database.ref(currentUser.uid);

  // Attach an asynchronous callback to read data as soon as it is added to the database
  ref.on("child_added", function(snapshot) {
    this.key = snapshot.val();

    db[datacounter] = (this.key);
    datacounter++;

    // displays data as soon as it is obtained
    feedit.displayData2(this.key);

    // Check if initial data has been loaded fully;
    if(datacounter === currentUser.count){
      console.log("Initial data loading complete - launching initialislodaded as True");
      initialislodaded = true;

      feedit.onDataLoaded();
      // Materialize.showStaggeredList('#main-data');// run display animation;
    }

  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });

}

// Feedit.prototype.updateData = function(){
//   console.log("updateData function ran | updatecounter:"+updatecounter);
//   var ref = this.database.ref(currentUser.uid);
//   ref.limitToLast(1).on("child_added", function(snapshot, prevChildKey) {
//     newEval = snapshot.val();
//     console.log("Last child recieved: ");
//     console.log(newEval);
//     // console.log("Previous child ID:" + prevChildKey);
//   // feedit.displayData(1);
//   updatecounter ++;
//
// });
// }

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

Feedit.prototype.onAuthStateChanged = function(user) {
  console.log("User auth state:");
  console.log(user);
  currentUser = user;
  if (user) { // User is signed in!
    console.log("User is signed in");
    $('#modal1').modal('close');
    $("#topuserdisplay-off").remove();
    $('#topuserdisplay').css("display","block");
    document.getElementById("topuserdisplay").innerHTML = user.email;
    document.getElementById("nameshow").innerHTML = user.email;

    feedit.displayGui();
    Materialize.toast("Usuário autenticado com sucesso!",4000);
    feedit.startHandler();

    // Começa o display da GUI de usuário:

  } else { // User is signed out!
    // $("#topuserdisplay-off").css("visibility","visible");
    $("#topuserdisplay-off").css("display","block");
    console.log("User has/is signed out!");
    initialstate = 0;
  }
};

// function retrieve(){
//   $("#submitbt").hide();
//   $("#loadingbar").show();
//   return firebase.database().ref('/').once('value').then(function(snapshot) {
//     var username = snapshot.val();
//     window.username = username;
//     // document.write(username)
//     // ...
//   });
// }

function login(){
  var valemail = $('#useremail').attr('class');
  var varpass = $("#userpassword").attr('class');


  if(valemail == "validate valid"){
    feedit.userName = $("#useremail").val();
    feedit.userPass = $("#userpassword").val();
    console.log("Logging in with credentials:" + feedit.userName + "|" + feedit.userPass);
    feedit.signIn();
    if(initialstate == 0){
      $("#submitbt").hide();
      $("#loadingbar").show();
    }

  } else {
    Materialize.toast("Por favor preencha os campos corretamente",2000);
  }
};

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

function expandAll(){
  $(".collapsible-header").addClass("active");
  $(".collapsible").collapsible({expandable: false});
}

function collapseAll(){
  $(".collapsible-header").removeClass(function(){
    return "active";
  });
  $(".collapsible").collapsible({accordion: true});
  $(".collapsible").collapsible({accordion: false});
}
// $('.dropdown-button').dropdown('open');
Array.prototype.removeDuplicates = function () {
    return this.filter(function (item, index, self) {
        return self.indexOf(item) == index;
    });
};
