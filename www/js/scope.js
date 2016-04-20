//////////////////////////****  MY ACCOUNT CONTROLLER FUNCTIONS ***/////////////////////  

var app = angular.module('App', ['ngSanitize']);

var globalScope = globalScope || {};

app.controller('Ctrl', function($scope, $http, $document, $sce) {
    $scope.TheThinkingShedRoot = "http://explore2.thethinkingshed.com";
    //$scope.goShoRoot = "http://www.tts-app.com/media";
    $scope.goShoRoot = "http://www.gs0.co/tts/media";
    $scope.convertURL = "http://www.gs0.co/tts/convert.php";

    $scope.loggedIn = false;
    $scope.userID = "";
    $scope.projectID = "";
    $scope.taskID = "";
    $scope.messageID = "";
    $scope.pingData = "";

    $scope.liveScreen = liveScreen;

    $scope.screenArray = [$scope.liveScreen];

    $scope.taskLiskData = [];

    $scope.weHaveMedia = false;
    $scope.weHaveText = false;
    $scope.addMedia = false;

    $scope.messageText = "";
    $scope.mediaString  = "";
    $scope.mediaSuffix = "";
    $scope.mimeType = "";
    $scope.mid = "";
    $scope.errorMessage = "";

    $scope.username = "";
    $scope.password = "";

    // ng-hide/show defaults

    $scope.loggingIn = false;
    $scope.connectionError = false;
    $scope.loginError = false;
    $scope.loadingMessages = false;

    $scope.uploadError = false;

    $scope.viewImage = false;
    $scope.viewVideo = false;

    $scope.viewUserPanel = false;
    $scope.viewInfoPanel = false;
    $scope.showBack = false;

    $scope.unreadMessages = false;

    $scope.userData = "";
    $scope.user_userName = "";
    $scope.user_fullName = "";
    $scope.user_userProfile = "";

    $scope.project_name = "";
    $scope.project_description = "";
    $scope.project_intro = "";
    $scope.project_what = "";
    $scope.project_other = "";

    $scope.uploadMessage = "Reply to Message";

    $scope.tracer = "ready..."

    $scope.debugText = "";

    // HTML injectors

    $scope.deliberatelyTrustDangerousSnippet = function(txt) {
        return $sce.trustAsHtml(txt);
    };

    $scope.errorhtml = function(header, text) {

        return '<div class="errorMessage"><h2>'+header+'</h2><p>'+text+'</p><a><p>Tap here to close and try again.</p></a></div>';
    }

    $scope.renderError = function(header, text){

        return $sce.trustAsHtml($scope.errorhtml(header, text));
    };

    //////// LOGIN

    if(typeof(Storage) !== "undefined") {
        
        // Store

        $scope.username = getUser("user");
        $scope.password = getUser("pwd");
        
        // Retrieve

        if (($scope.username == "") || ($scope.username == undefined) | ($scope.username == null)){
            $scope.firstTimeUser = true;
        } else {
            $scope.firstTimeUser = false; // revert to false
        }
    }

    function lostPasswordLink (link){window.open(link, '_system', 'location=no');}

    $scope.appLogin = function(){

        if ($scope.loginError == true){
            $scope.closeError();
            $scope.loginError = false;
        }

        if ($scope.username == undefined || $scope.password == undefined || $scope.username == '' || $scope.password == ''){

            $scope.loginError = true;

        } else {

            $scope.loggingIn = true

            var pjq = jQuery.noConflict();   

            $scope.params = []
            $scope.params.push("username=" + $scope.username);
            $scope.params.push("password=" + $scope.password);

            pjq.ajax({

                url: $scope.TheThinkingShedRoot + "/appl",

                type: "POST",

                dataType: "json",

                crossDomain: true,

                xhrFields: { withCredentials: true },

                data: $scope.params.join("&"),

                success: function(data) {

                    var obj = data;
                    
                    if (obj.login == "success") {

                        $scope.userID = obj.id;
                        $scope.projectID = obj.pid;

                        storeUser($scope.username, $scope.password);

                        $scope.getTasks('forward');
                        $scope.getUserData();

                        loadcssfile($scope.projectID);

                        $scope.loggedIn = true;
                        $scope.allowPolling = true;

                        $scope.$apply();

                    } else {

                        $scope.loginError = true;
                        $scope.loggingIn = false;
                        
                        $scope.$apply();
                    }

                },

                complete: function (data) {

                },

                error: function(a,b,c) {

                    $scope.errorManager('appLogin', c);
                },

                timeout: 8000
            });
        };
    };

    /////////////////////////////////////////////////

    $scope.getUserData = function(){

        var pjq = jQuery.noConflict();

        pjq.ajax({
            url: $scope.TheThinkingShedRoot + "/en/appl/whoami",
            type: "GET",
            dataType: "json",
            crossDomain: true,
            xhrFields: { withCredentials: true },
            timeout: 10000,

            success: function(data) {

            },

            complete: function (data) {

                $scope.userData = JSON.parse(data.responseText);
                
                $scope.user_userName = $scope.userData.username;
                $scope.user_fullName = $scope.userData.fullname;
                $scope.user_userProfile = $scope.TheThinkingShedRoot + $scope.userData.image;

                $scope.getProjectData();

            },

            error: function(a,b,c) {

                //$scope.errorManager('getTasks', c);
            },
        });

    }

    /////////////////////////////////////////////////

    $scope.getProjectData = function(){

        var pjq = jQuery.noConflict();

        pjq.ajax({
            url: $scope.TheThinkingShedRoot + "/en/appl/project",
            type: "GET",
            dataType: "json",
            crossDomain: true,
            xhrFields: { withCredentials: true },
            timeout: 10000,

            success: function(data) {

            },

            complete: function (data) {

                $scope.projectData = JSON.parse(data.responseText);
                
                $scope.project_name = $scope.projectData.project;
                $scope.project_description = $scope.projectData.description;
                $scope.project_intro = $scope.projectData.about;
                $scope.project_what = $scope.projectData.tasks;
                $scope.project_other = $scope.projectData.other;

                $scope.$apply();
            },

            error: function(a,b,c) {

                //$scope.errorManager('getTasks', c);
            },
        });

    }

    $scope.getTasks = function(nav){

        if ($scope.connectionError == true){
            $scope.closeError();
            $scope.connectionError = false;
        }
        
        var pjq = jQuery.noConflict();

        pjq.ajax({
            url: $scope.TheThinkingShedRoot + "/en/tasks/indexApp",
            type: "GET",
            dataType: "json",
            crossDomain: true,
            xhrFields: { withCredentials: true },
            timeout: 10000,

            success: function(data) {

            },

            complete: function (data) {

                $scope.taskLiskData = JSON.parse(data.responseText);

                for (var i = 0; i < $scope.taskLiskData.tasks.length; i++) { 
                    $scope.taskLiskData.tasks[i].clicked = false;
                }

                console.log($scope.taskLiskData)

                $scope.$apply();

                if (nav != 'back'){ 

                    $scope.proceedApp('taskList');

                    if ($scope.firstTimeUser == true){
                        $scope.openInfoPanel();
                    }
                }

            },

            error: function(a,b,c) {

                $scope.errorManager('getTasks', c);
            },
        });

    }

    /////////////////////////////////////////////////

    function errorCallback(message){
        alert("error " + message);
    }

    $scope.loadMessages = function(index, taskid, navType, isenabled){

        if (isenabled != 0){
            $scope.gotoMessages(index, taskid, navType);
        }
    }

    $scope.gotoMessages = function(index, taskid, navType){

        for (var i = 0; i < $scope.taskLiskData.tasks.length; i++) { 
            $scope.taskLiskData.tasks[i].clicked = false;
            if ($scope.taskLiskData.tasks[i].taskid == taskid){
                $scope.taskLiskData.tasks[i].clicked = true;
            }
        }

        $scope.loadingMessages = true;

        if ($scope.connectionError == true){
            $scope.closeError();
            $scope.connectionError = false;
        }

        var pjq = jQuery.noConflict();

        pjq.ajax({
            url: $scope.TheThinkingShedRoot + "/en/tasks/taskApp/action?tid="+taskid,
            type: "GET",
            dataType: "json",
            crossDomain: true,
            xhrFields: { withCredentials: true },

            success: function(data) {
            },

            complete: function (data) {

                $scope.messageData = JSON.parse(data.responseText);
                
                if ($scope.messageData.length > 1){
                    $scope.mid = $scope.messageData[1].mid;
                } else {
                    $scope.mid = "0";
                }

                $scope.$apply();

                if (navType != 'backwards'){

                    $scope.proceedApp('messages');
                    $scope.taskID = taskid;
                }
                
            },

            error: function(a,b,c) {

                $scope.errorManager('gotoMessages', c);
                
                for (var i = 0; i < $scope.taskLiskData.tasks.length; i++) { 

                    if ($scope.taskLiskData.tasks[i].taskid == taskid){

                        setTimeout(function(){ 
                            $scope.taskLiskData.tasks[i].clicked = false;
                          }, 500);
                        
                    }
                }
            }
        });
    }

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    $scope.pollCount = 0;
    $scope.flash = "?flash=1";

    $scope.doPoll = function(){

        $scope.pollCount ++;

        $scope.pingData = "";

        $scope.pingDataDecode = [];

        if ($scope.allowPolling == true){

            var pjq = jQuery.noConflict();

            //$scope.submitParams = []
            //$scope.submitParams.push("max=" + $scope.mid);
            //$scope.submitParams.push("task=" + $scope.taskID);

            pjq.ajax({


                url: $scope.TheThinkingShedRoot + "/index.php/en/tasks/ping" + $scope.flash,
                type: "POST",
                dataType: "json",
                crossDomain: true,
                xhrFields: { withCredentials: true },
                //data: $scope.submitParams.join("&"),

                success: function(data) {
                },

                complete: function (data) {

                    $scope.pingData = JSON.parse(data.responseText);
                    console.log("- - - - - - - - - - - - - - - - - -   PING   - - - - - - - - - - - - - - - - - -");
                    console.log("pingData.monitor = " + $scope.pingData.monitor);

                    if ($scope.pingData.monitor.length >= 1){

                        for (var i = 0; i < $scope.taskLiskData.tasks.length; i++) { 

                            if(jQuery.inArray(parseInt($scope.taskLiskData.tasks[i].taskid), $scope.pingData.monitor) != -1){
                                $scope.taskLiskData.tasks[i].hasmodresp = true;
                            }
                        }
                       
                        $scope.unreadMessages = true;
                        $scope.$apply();

                    } else {

                        $scope.unreadMessages = false;
                        $scope.$apply();
                    }

                },

                error: function(a,b,c) {
                    $scope.errorManager('doPoll');
                },
            });

        }
          

          setTimeout($scope.doPoll, 5000);
      }

    $scope.doPoll();

    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

    $scope.randomId = function(mid){

        randomNum = mid.toString() + Math.floor((Math.random() * 999) + 100).toString();
        return randomNum;
    }

    $scope.submitMessage = function(){ // Submit button clicked

        if ($scope.weHaveMedia == true){

            $scope.messageID = $scope.randomId($scope.messageData.length + 1);

            $scope.mediaString = "TTS-" + $scope.userID +'_'+ $scope.taskID +'_'+ $scope.messageID;

            $scope.uploadMessage = "Uploading media... Please wait";

            startUploading($scope.userID, $scope.taskID, $scope.messageID, $scope.projectID);// external upload.js function

        } else if ($scope.weHaveMedia == false && $scope.weHaveText == true){
            $scope.submitDataToTTS();
        }
        
    }

    // Called from upload.js after file selected
    $scope.fileSelected = function(){
        $scope.weHaveMedia = true;
    }


    // text input check
    $scope.checkMessage = function(){

        if($scope.messageText != ""){
            jQuery('#uploadFileTrigger').removeClass('btn-disabled');
            $scope.weHaveText = true;
        } else {
            $scope.weHaveText = false;
        }

         if(($scope.messageText == "") && (weHaveData == false)){
            jQuery('#uploadFileTrigger').addClass('btn-disabled');

        }

    }

    // external upload has finished (from upload.js)
    $scope.uploadFinished = function(userID, taskID, messageID, src){ 

        $scope.mediaSuffix = $scope.getMediaType(src);
        $scope.mimeType = src;

        $scope.submitDataToTTS();
        $scope.goshoUpdate();
    }

    $scope.goshoUpdate = function(){

        var pjq = jQuery.noConflict();

        $scope.params = []

        $scope.params.push("mediaID=" + $scope.mediaString);
        $scope.params.push("format=" + $scope.mediaSuffix);

        pjq.ajax({
            url: $scope.convertURL,
            type: "GET",
            dataType: "json",
            crossDomain: true,
            xhrFields: { withCredentials: true },
            data: $scope.params.join("&"),

            success: function(data) {
            },

            complete: function (data) {
            },

            error: function(a,b,c) {
            },

            timeout: 8000
        });

    };

    $scope.submitDataToTTS = function(){

        var pjq = jQuery.noConflict();   

        $scope.submitParams = []
        $scope.submitParams.push("commentEntry=" + $scope.taskID);
        $scope.submitParams.push("commentData=" + $scope.messageText);

        if ($scope.weHaveMedia == true){
            $scope.submitParams.push("url=" + $scope.mediaString +'.'+ $scope.mediaSuffix);
            $scope.submitParams.push("media=" + $scope.mimeType);
        } else {
            $scope.submitParams.push("url=");
            $scope.submitParams.push("media=");
        }

        $scope.uploadMessage = "Finishing... Please wait"

        pjq.ajax({
            url: $scope.TheThinkingShedRoot + "/en/tasks",
            type: "POST",
            dataType: "json",
            crossDomain: true,
            xhrFields: { withCredentials: true },
            data: $scope.submitParams.join("&"),

            success: function(data) {
                var obj = data;

                $scope.messageText = "";
                $scope.mediaString  = "";
                $scope.mediaSuffix = "";
                $scope.mimeType = "";
                jQuery('#fileURL').html("");
                jQuery('#preview').attr("src", "");
                jQuery('#fileType').html("");
                jQuery('#fileName').html("");
                $scope.uploadError = false;
                $scope.weHaveMedia = false;
                $scope.weHaveText = false;
                

                $scope.uploadMessage = "Complete!"
                
                changeUI('progress_percent_text', 'html', 'Complete')
                changeUI('progress', 'width', '100%')

                changeUI('backToMessages', 'display', 'block');

                changeUI( "progress_info" , 'display', 'none');
                changeUI( "uploadComplete", 'display', 'block' );

                changeUI("progress", 'display', 'none');
                changeUI("preview", 'display', 'none');

                changeUI('uploadComplete', 'display', 'block');
                changeUI('uploadComplete', 'opacity', 1);

                changeUI('uploadFileTrigger', 'display', 'none');
                changeUI('messageText', 'display', 'none');
                changeUI('messageText', 'display', 'none');
                changeUI('removeMedia', 'display', 'none');

                changeUI('uploadPhotoButton', 'display', 'none');
                changeUI('selectPhotoButton', 'display', 'none');
                changeUI('uploadVideoButton', 'display', 'none');
                changeUI('selectFileTrigger', 'display', 'none');
                

                if (!$scope.$$phase) { // check if digest already in progress
                    $scope.$apply(); // launch digest;
                }

            },

            complete: function (data) {
            },

            error: function(a,b,c) {
                $scope.errorManager('submitDataToTTS', c);
            },

            timeout: 2000
        });

    }

    $scope.showMediaButton = function(){
        $scope.addMedia = !$scope.addMedia;
    }

    $scope.removeMedia = function(){

        $scope.weHaveMedia = false;
        weHaveData = false;
        $scope.mediaString  = "";
        $scope.mediaSuffix = "";
        $scope.mimeType = "";


        jQuery('#fileURL').html("");
        jQuery('#preview').attr("src", "");
        jQuery('#fileType').html("");
        jQuery('#fileName').html("");


        setUpUi();// uploader.js
        $scope.checkMessage();
    }

    $scope.uploadErrorHandler = function(){

        $scope.uploadMessage = "There was an error";
        $scope.uploadError = true;

        /// update $scope
        if (!$scope.$$phase) { // check if digest already in progress
            $scope.$apply(); // launch digest;
        }
    }

    $scope.retryUpload = function(){

        $scope.uploadMessage = "Reply to Message";
        $scope.uploadError = false;

        changeUI('uploadFileTrigger', 'display', 'block');
        changeUI('progress_info', 'display', 'none');
        changeUI('messageText', 'display', 'block');
        changeUI('preview', 'display', 'block');
        changeUI('removeMedia', 'display', 'block');
    }


    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////

      $scope.errorManager = function(query, msg){

        if (msg == 'Unauthorized'){

            $scope.loginReset();

        } else {

            switch (query) {

                case "appLogin":

                    $scope.displayError('There was an error logging in - 01', '89');
                    break;

                case "getTasks":

                    $scope.displayError('There was a connection error - 02', '89');
                    break;

                case "gotoMessages":

                    $scope.displayError('There was a connection error - 03', '128');
                    break;

                case "submitDataToTTS":

                    $scope.displayError('There was problem submitting your post - 04', '128');
                    break;

                case "doPoll":

                    //$scope.displayError('Please check your network connection - 05', '128');
                    break;

                 case "logout":

                    $scope.displayError('We could not log you out - 06', '128');
                    break;
               
            }
        }
    }

    $scope.displayError = function(message, topY){

        $scope.connectionError = true;
        $scope.errorMessage = message;
        $scope.loggingIn = false;

        if ($scope.liveScreen == 'login'){

            jQuery('.top-layer').animate({paddingTop: '95'}, 500);
            jQuery('.errorMessage').animate({top: '0'}, 500);

        } else {

            jQuery('.top-layer').animate({paddingTop: '145'}, 500);
            jQuery('.errorMessage').animate({top: '59'}, 500);
        }

        $scope.$apply();
    };

    $scope.closeError = function(){

        jQuery('.top-layer').animate({paddingTop: '55'}, 500);

        jQuery('.errorMessage').animate({top: '-90'},{

            duration: 500, complete: function(){

                $scope.$apply();
                $scope.connectionError = false;
                $scope.errorMessage = "";
            }

        });

    }

    $scope.getMediaType = function(src){// from oFile in upload.js

        test = src.split('/');// create mini array
        type = test[1];// get MIME type

        if (type == 'jpeg'){return 'jpg'};
        if (type == 'bmp'){return 'bmp'};
        if (type == 'gif'){return 'gif'};
        if (type == 'png'){return 'png'};
        if (type == 'tiff'){return 'tif'};

        if (type == 'mp4'){return 'mp4'};
        if (type == 'mov'){return 'mov'};
        if (type == 'quicktime'){return 'mov'};
        if (type == 'wm4'){return 'wm4'};
        if (type == 'wmv'){return 'wmv'};

    }

    $scope.isVideo = function(type){

        if ($scope.getMIMEType(type) == "video"){
            return true;
            
         }
    }

    $scope.messageLength = function(){
        if ($scope.messageData > 2){
            return true;
        } else {
            return false;
        }
    }
    /////////////////////////////////////////////////////////////////

    $scope.getMediaURL = function (isapp, url, type){// function to check which images or thumbs to use in messages

        if (isapp == 1){// from go sho app

            if ($scope.getMIMEType(type) == "video"){ //check for video

                return $scope.goShoRoot + "/thumbs/" + $scope.switchMediaSuffix(url, '.jpg');

            } else { // if not video return thumb link

                link = url.replace('http://www.gs0.co/tts/media/http://www.gs0.co/tts/media/', 'http://www.gs0.co/tts/media/');
                link2 = link.replace('http://www.gs0.co/tts/media/', '/media/');

                return $scope.goShoRoot + link2.replace('/media/', '/thumbs/');

            }

        } else { //not go sho app media files

            if (url != null){ // from TTS so use the thumb
                
                return  $scope.TheThinkingShedRoot + url.replace('?thumb=0', '?thumb=1');

            } 
        }

    }

    $scope.imageSource = "";
    $scope.vidSource = "";

    $scope.browser = "";

    $scope.launchVideo = function(src, type, isapp, host){

        mediaRoot = $scope.TheThinkingShedRoot;

        if (isapp == 1){

            if (host == "GS"){mediaRoot = $scope.goShoRoot};
            if (host == "TTS"){mediaRoot = $scope.TheThinkingShedRoot};
            
            $scope.viewVideo = true;

            vidSource = '<video id="videoPlayer" webkit-playsinline controls width="' + tts.width + '" height="auto" preload="metadata" ' + 
                            'poster="'+ mediaRoot + '/thumbs/' +  $scope.switchMediaSuffix(src, '.jpg') +'">' + 
                            //'<source src="'+ $scope.goShoRoot + '/' + $scope.switchMediaSuffix(src, '.ogg') +'" type="video/ogg">' + 
                            //'<source src="'+ $scope.goShoRoot + '/' + $scope.switchMediaSuffix(src, '.webm') +'" type="video/webm">'+
                            '<source src="'+ mediaRoot + '/' + $scope.switchMediaSuffix(src, '.mov') + '" type="video/quicktime">' +
                            '<source src="'+ mediaRoot + '/' + $scope.switchMediaSuffix(src, '.mp4') +'" type="video/mp4">' +
                            
                            '</video>';

            jQuery('#angularVideo').html(vidSource);
            
        } else {

                $scope.videoViewSource = src;
                $scope.viewLargeMedia = true;
                $scope.viewBigVideo = true;
            
        }
    }

    $scope.launchImage = function(src, type, isapp){

        if (isapp == 1){

                link = src.replace('http://www.gs0.co/tts/media/http://www.gs0.co/tts/media/', 'http://www.gs0.co/tts/media/');
                link2 = link.replace('http://www.gs0.co/tts/media/', '');

                $scope.imageSource = $scope.goShoRoot + '/' + link2;
                $scope.viewImage = true;

        } else {

                $scope.imageSource = $scope.TheThinkingShedRoot + src.replace('?thumb=1', '?thumb=0');
                $scope.viewImage = false;
        }
        
    }

    $scope.closeImageViewer = function(){
        
        $scope.viewImage = false;
        $scope.imageSource = "";

    }

    $scope.closeVideoViewer = function(){
        $scope.viewVideo = false;
        jQuery('#angularVideo').html('');  
    }

    $scope.getMIMEType = function(src){// get MIME type

        type = src.split('/')[0];// get MIME type
        if (type == 'video'){return 'video'};
        if (type == 'image'){return 'image'};


    }

    $scope.testVideo = $scope.goShoRoot + "/oggTest.ogg";

    $scope.switchMediaSuffix = function(url, newSuffix, type){

        if (type == 'video'){

            media = $scope.goShoRoot + "/" + url.replace("http://www.gs0.co/tts/media/", "").split('&')[0].split('.')[0] + newSuffix;
            return media

        } else if (type == 'thumb'){

            media = $scope.goShoRoot + "/thumbs/" + url.replace("http://www.gs0.co/tts/media/", "").split('&')[0].split('.')[0] + newSuffix;
            return media

        } else {

            media = url.replace("http://www.gs0.co/tts/media/", "").split('&')[0].split('.')[0] + newSuffix;
            return media;
        }

    }

    // handling introduction images or videos

    $scope.introMediaVideo = function(type){
        if (type){
            if ($scope.getMIMEType(type) == "video"){
                return true;
            }
        }
    }

    $scope.introMediaImage= function(type){
        if (type){
            if ($scope.getMIMEType(type) == "image"){
                return true;
            }
        }
    }

    /////////////////////////////////////////////////////////////////

    $scope.getUserType = function(user){
        if (user == 'moderator'){
            return "admin-msg";
        } else {
            return "user-msg";
        }
    }

    ///

    $scope.proceedApp = function(nextScreen){

        if ($scope.connectionError == true){
            $scope.closeError();
            $scope.connectionError = false;
        }

        if ($scope.screenArray[$scope.screenArray.length - 1] != nextScreen){
            $scope.screenArray.push(nextScreen);
            $scope.changeScreen(nextScreen, 'swipe-left');
        }
        
    }

    $scope.changeScreen = function(next, trans){

        if ($scope.connectionError == true){
            $scope.closeError();
            $scope.connectionError = false;
        }

        old = $scope.liveScreen;

        if (next != old){

            $scope.liveScreen = next;

            if ($scope.liveScreen == "login"){
                jQuery('.nav-top').hide();
                jQuery('.nav-bottom').hide();
            }

            if ((old == "login")){
                jQuery('.nav-top').show();
                jQuery('.nav-bottom').show();
            }

            // transition 
            jQuery('#screen-'+next).addClass('top-layer');

            jQuery('.top-layer').animate({scrollTop : 0},10);

            jQuery('#appContainer').animate({left: (0 - tts.width) * ($scope.screenArray.length - 1)},{

                    easing: 'easeOutSine', duration: 500, complete: function(){

                        jQuery('#screen-'+old).removeClass('top-layer');

                        if (old == "taskList" && (next != "login")){

                            for (var i = 0; i < $scope.taskLiskData.tasks.length; i++) { 
                                $scope.taskLiskData.tasks[i].clicked = false;
                                
                            }
                        }

                    }
            });

            // Screen functions
            if ($scope.liveScreen == "reply"){

                setUpUi();
                $scope.uploadMessage = "Reply to Message";
                $scope.uploadError = false;
            }

            // hide / show back button
            $scope.showBack = true;
            if (next == "taskList"){
                $scope.showBack = false;
            }

            /// update $scope
            if (!$scope.$$phase) { // check if digest already in progress
                $scope.$apply(); // launch digest;
            }

        }
    }

    $scope.goBack = function(){

        if ($scope.viewImage == true){

            $scope.viewImage = false;
            $scope.imageSource = "";

        } else if ($scope.viewVideo == true){

            $scope.viewVideo = false;
            jQuery('#angularVideo').html(''); 

        } else if ($scope.liveScreen == "reply"){

            $scope.backToMessages();

        } else if ($scope.liveScreen == "messages"){

            $scope.screenArray.pop();
            $scope.changeScreen($scope.screenArray[$scope.screenArray.length - 1], 'swipe-right');
            $scope.getTasks('back');
        
        } else {

            if ($scope.screenArray[$scope.screenArray.length - 2] != "login"){
                $scope.screenArray.pop();
                $scope.changeScreen($scope.screenArray[$scope.screenArray.length - 1], 'swipe-right');

            }
        }
    }

    $scope.backToMessages = function(){
        
        $scope.screenArray.pop();
        $scope.changeScreen($scope.screenArray[$scope.screenArray.length - 1], 'swipe-right');
        $scope.gotoMessages('null', $scope.taskID, 'backwards');
    }

    $scope.loginApp = function(nextScreen){
        $scope.changeScreen("taskList", 'swipe-left');
        $scope.screenArray.push(nextScreen);
    };


    $scope.logOut = function(){

        var pjq = jQuery.noConflict();

        params = []
        params.push("username=logout");
        params.push("password=logout");

        pjq.ajax({
            url: $scope.TheThinkingShedRoot + "/appl",
            type: "POST",
            data: params.join("&"),
            dataType: "text",// if error try json
            crossDomain: true,
            xhrFields: { withCredentials: true },

            success: function(data) {

            },

            complete: function (data) {

                var obj = JSON.parse(data.responseText);
            
                if (obj.logout == "success") {

                    $scope.loginReset();
                    
                } else {

                }

                
            },

            error: function(a,b,c) {
                $scope.errorManager('logout');
            }
        });


    }

    $scope.loginReset = function(){

        $scope.messageData = "";

        $scope.loggedIn = false;
        $scope.loggingIn = false;
        $scope.userID = "";
        $scope.projectID = "";
        $scope.taskID = "";
        $scope.messageID = "";

        $scope.taskLiskData = [];

        $scope.messageText = "";
        $scope.mediaString  = "";
        $scope.mediaSuffix = "";
        $scope.mimeType = "";
        $scope.mid = "";
        $scope.errorMessage = "";

        jQuery('#fileURL').html("");
        jQuery('#preview').attr("src", "");
        jQuery('#fileType').html("");
        jQuery('#fileName').html("");

        $scope.viewUserPanel = false;
        $scope.viewInfoPanel = false;

        $scope.viewImage = false;
        $scope.viewVideo = false;

        $scope.uploadError = false;

        $scope.allowPolling = false;

        $scope.$apply();

        $scope.screenArray = ["login"];
        $scope.changeScreen("login", 'swipe-right');

        jQuery("#remoteStyle").remove();

    }

    $scope.taskActive = function(isenabled){
        if (isenabled == 0){
            return "inActiveClass";
        }
    }
    
    $scope.getTaskIconClass = function(type){
        return "icon-" + type;
    }
    
    $scope.getTaskStatusClass = function(isenabled, hasmodresp, complete){

        if (isenabled == 0){

            return "icon-warning";

        } else if (complete != 1){

            return "icon-arrow";

        } else if (hasmodresp == 1){
            
            return "icon-bubbles2";
        
        } else {

            return "icon-checkmark";

        }
    };

    $scope.getFooterSectionClass = function(){
        if ($scope.unreadMessages == true){
            return 'four';
        } else {
            return 'six'; 
        }
    }

    $scope.openUserPanel = function(){

        $scope.viewUserPanel = !$scope.viewUserPanel;
    
    }

     $scope.openInfoPanel = function(){

        $scope.viewInfoPanel = !$scope.viewInfoPanel;
        if (!$scope.$$phase) { // check if digest already in progress
            $scope.$apply(); // launch digest;
        }
    }

    $scope.newMessageClick = function(){
        $scope.screenArray = ["login", "taskList"];
        $scope.changeScreen($scope.screenArray[$scope.screenArray.length - 1], 'swipe-left');
        $scope.getTasks('back');
        
    }

});

