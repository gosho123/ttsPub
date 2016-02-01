jQuery( document ).ready(function() {

    var width = jQuery(document).width();
    var height = jQuery(document).height();

    console.log(height);

    jQuery('.app-screen').each(function() { // loop through the screens
        jQuery(this).width(width);
        jQuery(this).height(height);
    });

    jQuery('#appContainer').width((width * 4) + 100);

    jQuery('.wrapper').css({opacity: 1})

});

document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    jQuery('#debug').html('DeviceReady');
}

///////////////

/*document.onclick = function (e) {
  e = e ||  window.event;
  var element = e.target || e.srcElement;

  if (element.tagName == 'A') {
    openInAppBrowser(element.href);
    return false; // prevent default action and stop event propagation
  }
};*/

function openInAppBrowser(){
    //var ref = cordova.InAppBrowser.open(url, '_blank', 'location=yes,presentationstyle=formsheet'); 

    cordova.InAppBrowser.open(encodeURI('http://www.google.com'), '_system', 'location=yes'); 


    jQuery('#debug').html('openInAppBrowser')
}

function openSystemBrowser(){
    //var ref = cordova.InAppBrowser.open(url, '_blank', 'location=yes,presentationstyle=formsheet');
    window.open("http://www.google.com", "_system"); 
    jQuery('#debug').html('openSystemBrowser')
}


////////////

var liveScreen = "login";

if (liveScreen == "login"){
    jQuery('.nav-top').hide();
    jQuery('.nav-bottom').hide();
}

var tts = tts || {};

tts.width = jQuery(window).width();
tts.height = jQuery(window).height();


jQuery('#screen-'+liveScreen).addClass('top-layer');

/////////////////////////////////////

tts.resizeHandler = function(){

    width = jQuery(document).width();
    height = jQuery(document).height();

    jQuery('.app-screen').each(function() { // loop through the screens
        jQuery(this).width(width);
        jQuery(this).height(height);
    });

    jQuery('#appContainer').width((width * 4) + 100);
}

//// local storage

function storeUser(u, p){
    localStorage.setItem("username", u);
    localStorage.setItem("password", p);
}

function getUser(x){
    if (x == 'user'){return localStorage.getItem("username");}
    if (x == 'pwd'){return localStorage.getItem("password");}
}

// Global call to return user idnentification, task and message id's from the scop to use outside of Angular

function getID(ref){
    if (ref == 'userID'){
        return angular.element(document.querySelector('[ng-controller="Ctrl"]')).scope().userID;
    } 
    if (ref == 'taskID'){
        return angular.element(document.querySelector('[ng-controller="Ctrl"]')).scope().taskID;
    } 
    if (ref == 'messageID'){
        return angular.element(document.querySelector('[ng-controller="Ctrl"]')).scope().messageID;
    }  

}

////////////////////////////////

function loadcssfile(filename){
    var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("id", "remoteStyle");
        fileref.setAttribute("href", "http://www.gs0.co/tts/css/" + filename);
        document.getElementsByTagName("head")[0].appendChild(fileref)
}


////dynamically load and add this .css file

//////////////////////////////////

jQuery( window ).resize(function() {
  tts.resizeHandler();
});