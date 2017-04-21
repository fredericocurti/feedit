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
var userSettingsnotLoaded = true;
var limit = 0;
var userimg = "img/default-icon-user.png";


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
  var ref = this.database.ref(currentUser.uid);
  ref.once("value", function(snap) {
    currentUser.count = snap.numChildren();
    console.log("INITIAL DATA COUNT:", currentUser.count);
    console.log("Setting limit to: "+currentUser.count);
    limit = currentUser.count;

    if(currentUser.count == 0){
      $("#maindata").append(
        "<h5 class='center' style='padding-top:50px;'> Não existem dados para esse usuário. Configure o dispositivo de feedback corretamente. </h5>");
    }

    feedit.getData();
  });
}

Feedit.prototype.onDataLoaded = function(){
  $("#slide-button").css("display","block");
  $('.collapsible').collapsible();
  console.log("Initial collapsible started");
  fixheaders();

  $("#data-counter").html("Você possui "+currentUser.count+" avaliações no total. Mostrando as últimas "+limit);
  // $('.scrollbar-outer').scrollbar();

  $('#usersettingsbutton').click(function(){
    feedit.userSettings();
    $('#user-modal').modal('open');
  });

  $('#sidenav-usersettingsbutton').click(function(){
    $('.button-collapse').sideNav('hide');
    feedit.userSettings();
    $('#user-modal').modal('open');
  });




  // $(localid_header).click(function(){
  //   $(localid_header).attr('hasflag',0);
  //   $(localid_header).attr('counter',0);
  //   $(this).children().eq(2).remove();
  // });
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
    '<a id="notifications-button" status="on" class="fixed-action-btn toprightcorner btn-floating btn-large waves-effect waves-light red darken-4 tooltip" data-tooltip-content="#tooltip_content"><img id="notifications-button-img" src="img/bell.png" width="28px"></a>'+

    '<div class="tooltip_templates">'+
    '<span id="tooltip_content">'+
        'No new notifications'+
    '</span>'+
    '</div>'+

    '<div class="data-container">'+
    '<div class="row">'+
      '<div class="col s12 m12">'+
      "<div id='maindata' class='Site-content'></div>"+
      '</div>'+
      // '<div class="col s6 m6">'+
      // '<h4>HUEAHUEA</h4>'+
      // '</div>'+
    '</div'+
    '</div>'
  );

  // Deals with the notification button state = on/off
    $("#notifications-button").click(function(){
      if ($("#notifications-button").attr("status") == 'on'){
        $("#notifications-button").attr('status','off');
        $("#notifications-button").removeClass('red darken-4');
        $("#notifications-button").addClass('grey');
        $("#notifications-button-img").attr('src','img/bell_crossed.png');
      } else {
        $("#notifications-button").attr("status",'on');
        $("#notifications-button").removeClass('grey');
        $("#notifications-button").addClass('red darken-4');
        $("#notifications-button-img").attr('src','img/bell.png');
      }
    });
    //   $(localid_header).attr('counter',0);
    //   $(this).children().eq(2).remove();
    // });

    loading = document.getElementById("loadingbar");
    $("#maindata").append(loading);
    // $("#navbar").css("background-color","rgb(187,41,41)");
    $('.tooltip').tooltipster({
      animation : 'grow',
      content: $("#tooltip_content"),
      theme: 'tooltipster-shadow',
      side: 'top',
      trigger : 'custom',
      timer : 2000,
      contentAsHTML: true,
      contentCloning: true
    });
    // Draws container for key values
    $("#maindata").append(
      '<div>'+
      '<h5 style="color:gray">Visão Geral</h5>'+
      '<div class="divider"></div>'+
      '<h6 id="data-counter" style="padding:10px;"></h6>'+
      '</div>'+
      '<div id="data-wrapper" class="row">'+
      // '<ul id="main-values" class="collapsible" data-collapsible="expandable">'+
      '</ul>'+
      '</div>');
}



Feedit.prototype.displayData = function(data){
  Key = data;

    if(places.includes(Key.local) == true){ // PREPENDS TO THE LATEST ITEM LIST
      // console.log("locale "+Key.local+" already exists. Appending to the correct place")
      var localid = '#'+Key.local;
      var localchild_data = '#data-'+Key.local+'>:nth-child(1)';
      var localchild_dataref = '#data-'+Key.local
      var localid_content = '#content-'+Key.local;
      var localid_counter_ref = '#counter-'+Key.local;
      var localchild_id = '#'+Key.local+'>:nth-child(2)';
      // $("#biblioteca>:nth-child(2)").before("<div>inserted div</div>");
      // $(localchild_id).before(
      // '  <div class="collapsible-body" style="padding:4px;"><span style="padding-left:5%;">'+ Key.nota +' | ' + Key.date + ' | ' + Key.time +'</span></div>'
      // );
      if(initialislodaded == false){
        $(localchild_data).before(
        '<div class="collapsible-body row datarow" id="'+datacounter+'">'+
        '   <span class="col s4 left-align">'+ Key.nota.capitalize() +'</span><span class="col s4 center-align">' + Key.hora + '</span><span class="col s4 right-align">' + Key.data +'</span>'+
        '</div>'
        );
        colorString(datacounter);

      }
      else if(initialislodaded == true){
        datacounter_id = "#"+datacounter
        $(localchild_data).before(
        '<div class="collapsible-body row datarow" id="'+datacounter+'" style="background-color:#b0e0e2;">'+
        '   <span class="col s4 left-align">'+ Key.nota.capitalize() +'</span><span class="col s4 center-align">' + Key.hora + '</span><span class="col s4 right-align">' + Key.data +'</span>'+
        '</div>'
        );
        // $(datacounter_id).animate({opacity:'1'}, 2000);
        $(datacounter_id).animate({backgroundColor: '#F7F7F7'}, 2000);
        $("#data-counter").html("Você possui "+datacounter+" avaliações");
        colorString(datacounter);
      }

      // $(localid_test).append(
      // '<div class="collapsible-body"><span>'+ Key.nota +' | ' + Key.date + ' | ' + Key.time +'</span></div>'
      // );
      $(localid_counter_ref).html($(localchild_dataref)[0].childElementCount);

    } else {  // APPENDS FOR THE FIRST TIME, CREATING THE HEADER
      var localid = '#'+Key.local;
      var localid_header = '#header-'+Key.local;
      $("#data-wrapper").append(
        '<div class="col m6 s12">'+
            '<ul class="collapsible raw" data-collapsible="expandable">'+
                '<li id="'+Key.local+'"">'+ //style="max-height:300px;overflow-y:auto;
                    '<div class="collapsible-header waves-effect" hasflag="0" id="header-'+Key.local+'"><i class="material-icons">label_outline</i><span id="counter-'+Key.local+'"class="badge">'+1+'</span>'+ Key.local.capitalize() + '</div>'+
                    '<div id="data-'+Key.local+'" class="collapsible-body" style="padding:0px;overflow-y:auto;max-height:300px;">'+ // DIV CONTAINING KEYS
                        '<div class="collapsible-body row datarow" id="'+datacounter+'">'+
                            '<span class="col s4 left-align">'+ Key.nota.capitalize() +'</span><span class="col s4 center-align">' + Key.hora + '</span><span class="col s4 right-align">' + Key.data +'</span>'+
                        '</div>'+
                    '</div>'+
                '</li>'+
            '</ul>'+
        '</div>'
      );
      // $(localid).click();
      colorString(datacounter);
    }

//  THIS PORTION WILL ONLY RUN ON NEW VALUES ARE ADDED TO THE DB WHILE THE APP IS RUNNING
    if (initialislodaded == true){ // adds and counts new badges only if it added after initload is complete
      newBadge = '<span id="badge-'+Key.local+'" class="new badge green" data-badge-caption="Nova"></span>'
      var localid_header = '#header-'+Key.local;
      var localid_badge = '#badge-'+Key.local;
      var flag = $(localid_header).attr('hasflag');
      $(localid_header).attr('counter',parseInt($(localid_header).attr('counter'))+1);
      $(localid_badge).html(parseInt($(localid_header).attr('counter')));
      $(localid_badge).attr("data-badge-caption","Novas");

      if(flag == "0"){ // adds badge for the first time
        $(localid_header).append(newBadge);
        $(localid_header).attr('hasflag','1');
        $(localid_header).attr('counter','1');

        // adds click listener
        $(localid_header).click(function(){
          $(localid_header).attr('hasflag',0);
          $(localid_header).attr('counter',0);
          $(this).children().eq(2).remove();
          // $(this).children().eq(2).fadeOut(2000, function(){
          //   $(this).children().eq(2).remove();
          // });

        });
      }

      placesdeduped = places.removeDuplicates();
      var mustopen = [];

      // Checks for the cards that are open
      for(i=0;i<placesdeduped.length;i++){
        var currentplace = "#"+placesdeduped[i];
        if ($(currentplace).attr("class") == 'active'){
          mustopen.push(i);
        }
      }

      $('.collapsible').collapsible(); // reloads collapsible, closes all

      // opens the ones that should stay open
      for(j=0;j<mustopen.length;j++){
        $('.collapsible').collapsible('open',mustopen[j]);
      }

    } // CLOSES INITIALISLODADED = TRUE

    places.push(Key.local);
    $("#loadingbar").remove();

}

Feedit.prototype.showNotification = function(key){
  var nota = key.nota;
  var nota_img = '<img style="padding-top:10px;display: block;margin: 0 auto;" src="img/'+nota+'.png">'
  var notification_text = "<div class='row center' style='padding-top:4px;'>Nova avaliação<br><b>"+nota.capitalize()+"</b> no local <b>"+key.local.capitalize()+"</b></div>";
  $('.tooltip').tooltipster('content',nota_img+notification_text);
  $('.tooltip').tooltipster('open');

}

// Fetches and calls displayData of the data
Feedit.prototype.getData = function(){
  var ref = this.database.ref(currentUser.uid);

  // Attach an asynchronous callback to read data as soon as it is added to the database
  ref.limitToLast(limit).on("child_added", function(snapshot) {
    this.key = snapshot.val();

    db[datacounter] = (this.key);
    datacounter++;

    // displays data as soon as it is obtained
    feedit.displayData(this.key);

    if( initialislodaded == true && $("#notifications-button").attr("status") == 'on'){
      feedit.showNotification(this.key);
    }

    // Check if initial data has been loaded fully;
    if(datacounter === limit){
      console.log("Initial data loading complete - launching initialislodaded as True");
      initialislodaded = true;

      feedit.onDataLoaded();
      // Materialize.showStaggeredList('#main-data');// run display animation;
    }

  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
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

Feedit.prototype.userSettings = function(){
  if (userSettingsnotLoaded == true){
    $("#mainshow").append(
      '<div id="user-modal" class="modal bottom-sheet">'+
          '<div class="modal-content">'+
          '<div class="container">'+
          '<div class="row">'+
              '<h4 style="color:grey">Configurações da Conta</h4>'+
              '<h6 style="color:grey" class="left-align"><b>ID :</b> '+currentUser.uid+'</h6>'+
          '</div>'+
            '<div class="row center">'+
            '<form id="form1" runat="server">'+
                '<div class="image-upload">'+
                '<label for="file-input">'+
                '<img id="blah" height="100px" width="100px" class="circle" src="'+userimg+'">'+
                '</label>'+
                '<input id="file-input" type="file">'+
                '</div>'+
            '</form>'+
            // '<a href="#!user"><img class="circle" width="100px" src="img/default-icon-user.png"></a>'+
            '</div>'+
            // '<div id="slider">'+
            // 	'<form action="#">'+
            //       '<p class="range-field">'+
            //           '<input type="range" min="50" max="'+currentUser.count+'" step="5" />'+
            //       '</p>'+
            //   '</form>'+
            // '</div>'+
                    '<div class="row">'+
                        '<div class="input-field col s6">'+
                            '<input disabled placeholder="" id="username" type="text" class="validate">'+
                            '<label class="active" for="username">Nome do usuário/empresa</label>'+
                        '</div>'+
                        '<div class="input-field col s6">'+
                            '<input disabled placeholder="" id="email" type="text" class="validate">'+
                            '<label class="active" for="email">Email</label>'+
                        '</div>'+
                    '</div>'+
                    '<div class="row center">'+
                        '<div class="col m4 s12">'+
                          '<a class="userbt center waves-effect waves-light btn blue lighten-2"><i class="material-icons left">mode_edit</i>Editar</a>'+
                        '</div>'+
                        '<div class="col m4 s12">'+
                          '<a class="userbt center waves-effect waves-light btn green lighten-2"><i class="material-icons left">play_for_work</i>Baixar dados</a>'+
                        '</div>'+
                        '<div class="col m4 s12">'+
                          '<a class="userbt center waves-effect waves-light btn red lighten-2"><i class="material-icons left">lock</i>Redefinir senha</a>'+
                        '</div>'+

                    '</div>'+

                                    // '<div class="row">'+
                    // 		'<div class="input-field col s6">'+
                    // 				'<input id="password" type="password" class="validate">'+
                    // 				'<label for="password">Password</label>'+
                    // 		'</div>'+
                    // '</div>'+
                    // '<div class="row">'+
                    // 		'<div class="input-field col s12">'+
                    // 				'<input id="email" type="email" class="validate">'+
                    // 				'<label class="active" for="email">Email</label>'+
                    // 		'</div>'+
                    // '</div>'+
                    // '<div class="row">'+
                    // 		'<div class="col s12">'+
                    // 				'This is an inline input field:'+
                    // 				'<div class="input-field inline">'+
                    // 						'<input id="email" type="email" class="validate">'+
                    // 						'<label class="active" for="email" data-error="wrong" data-success="right">Email</label>'+
                    // 				'</div>'+
                    // 		'</div>'+
                    // '</div>'+
                '</form>'+
          '</div>'+
        '</div>'+
          '<div class="modal-footer">'+
              '<a href="#!" class="modal-action modal-close waves-effect waves-green btn-flat">Fechar</a>'+
          '</div>'+
      '</div>'
    );

  userSettingsnotLoaded = false;

  }

  $("#file-input").change(function(){
      readURL(this);
  });



  $("#username").attr("placeholder",currentUser.displayName);
  $("#email").attr("placeholder",currentUser.email);
  $('.modal').modal();
}

Feedit.prototype.onAuthStateChanged = function(user) {
  console.log("Current user auth-state:");
  console.log(user);
  currentUser = user;

  if (user) { // User is signed in!
    console.log("User is signed in");
    $("#newUID").html(" ID: "+currentUser.uid);
    $('#modal1').modal('close');
    $("#topuserdisplay-off").remove();
    $('#topuserdisplay').css("display","block");
    document.getElementById("topuserdisplay").innerHTML = user.email;
    document.getElementById("nameshow").innerHTML = user.email;
    document.getElementById("user-email").innerHTML = user.email;

    if (initialstate == 0){
      feedit.displayGui(initialstate);
      feedit.startHandler(initialstate);
    }

    initialstate=1
    Materialize.toast("Usuário autenticado com sucesso!",4000);

    if (user.photoURL != null){
      console.log("User has a profile pic.");
      userimg = user.photoURL;
      $("#sidebar-thumb").attr("src",user.photoURL);
    } else {
      console.log("User doesnt have a profile pic. Setting default");
    }


    // Começa o display da GUI de usuário:

  } else { // User is signed out!
    // $("#topuserdisplay-off").css("visibility","visible");
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
  if ($("#"+counter).children()[0].innerHTML == "Excelente"){
    $("#"+counter).children()[0].outerHTML = '<span class="col s4 left-align nota-excelente">Excelente</span>'
  }
  else if ($("#"+counter).children()[0].innerHTML == "Bom"){
    $("#"+counter).children()[0].outerHTML = '<span class="col s4 left-align nota-bom">Bom</span>'
  }
  else if ($("#"+counter).children()[0].innerHTML == "Ruim"){
    $("#"+counter).children()[0].outerHTML = '<span class="col s4 left-align nota-ruim">Ruim</span>'
  }

}


function fixheaders(){
  for(i=0;i < places.removeDuplicates().length;i++){
      place = places.removeDuplicates()[i];
      $("#header-"+place).click();
      $(".collapsible").collapsible('close',i);
  }
  // for(i=0;i < places.removeDuplicates().length;i++){
  //     place = places.removeDuplicates()[i];
  //     $("#header-"+place).click();
  // }
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

function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#blah').attr('src', e.target.result);
            currentUser.updateProfile({
            photoURL: e.target.result
            }).then(function() {
            // Materialize.toast("Imagem do usuário atualizada com sucesso",1000);
            $("#sidebar-thumb").attr("src",currentUser.photoURL);

          }, function(error) {
            Materialize.toast("Ocorreu um erro");
            });
        }


        reader.readAsDataURL(input.files[0]);
    }
}
