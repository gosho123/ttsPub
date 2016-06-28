    // common variables
var iBytesUploaded = 0;
var iBytesTotal = 0;
var iPreviousBytesLoaded = 0;
var iMaxFilesize = 1048576 * 200;//1048576; // 1MB
var oTimer = 0;
var sResultFileSize = '';
var weHaveData = false;

var userID;
var taskID;
var messageID;
var projectID;

var fileURL = "";
var fileType = "";
var fileName = "";
var data_URI =  "";

//UI Setup

function setUpUi(){
    changeUI('backToMessages', 'display', 'none');
    changeUI('progress_info', 'display', 'none');
    changeUI('uploadComplete', 'display', 'none');
    changeUI('introMessage', 'display', 'block');
    changeUI('messageText', 'display', 'block');
    changeUI('uploadFileTrigger', 'display', 'block');
    changeUI('uploadFileTrigger', 'class', 'btn-primary twelve btn-disabled');
    changeUI('preview', 'display', 'none');
    changeUI('uploadVideoButton', 'display', 'block');
    changeUI('uploadPhotoButton', 'display', 'block');
    changeUI('uploadVideoButtonAndroid', 'display', 'block');
    changeUI('selectPhotoButton', 'display', 'block');
    changeUI('selectFileTrigger', 'display', 'block');
    changeUI('removeMedia', 'display', 'none');
    document.getElementById('error').style.display = 'none';
    document.getElementById('error2').style.display = 'none';
    document.getElementById('abort').style.display = 'none';
    document.getElementById('warnsize').style.display = 'none';
    if (weHaveData == false){
        document.getElementById('preview').src = "";
        changeUI('uploadPhotoButton', 'display', 'block');
        changeUI('uploadVideoButtonAndroid', 'display', 'block');
        changeUI('selectPhotoButton', 'display', 'block');
        changeUI('uploadVideoButton', 'display', 'block');
        changeUI('selectFileTrigger', 'display', 'block');
    } else {
        changeUI('uploadPhotoButton', 'display', 'none');
        changeUI('uploadVideoButtonAndroid', 'display', 'none');
        changeUI('selectPhotoButton', 'display', 'none');
        changeUI('uploadVideoButton', 'display', 'none');
        changeUI('uploadFileTrigger', 'class', 'btn-primary twelve btn-disabled');
        changeUI('selectFileTrigger', 'display', 'none');
        changeUI('preview', 'display', 'block');
        changeUI('uploadFileTrigger', 'class', 'btn-primary twelve btn-disabled');
        changeUI('removeMedia', 'display', 'block');

    }

}

var debugString = ""
var debugNum = 0;

function logit(string){

    debugNum ++;
    debugString = debugString + "<br>" + debugNum + ": " + string;
    jQuery('#debug').html(debugString)
    console.log("log: " + debugString);
}


setUpUi();

function changeUI(element, state, value){
    if (state == "display"){
        document.getElementById(element).style.display = value;
    }
    if (state == "opacity"){
        document.getElementById(element).style.opacity = value;
    }
    if (state == "html"){
        document.getElementById(element).innerHTML = value;
    }
    if (state == "class"){
        document.getElementById(element).className = value;
    }
    if (state == "width"){
        document.getElementById(element).style.width = value;
    }
    
}

function secondsToTime(secs) { // we will use this function to convert seconds in normal time format
    var hr = Math.floor(secs / 3600);
    var min = Math.floor((secs - (hr * 3600))/60);
    var sec = Math.floor(secs - (hr * 3600) -  (min * 60));

    if (hr < 10) {hr = "0" + hr; }
    if (min < 10) {min = "0" + min;}
    if (sec < 10) {sec = "0" + sec;}
    if (hr) {hr = "00";}
    return hr + ':' + min + ':' + sec;
};

function bytesToSize(bytes) {
    var sizes = ['Bytes', 'KB', 'MB'];
    if (bytes == 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};


removeMediaFile = function(){
    document.getElementById('image_file').value = null;
}

/* Android Photo library
http://stackoverflow.com/questions/9891160/select-video-in-library

http://stackoverflow.com/questions/31338853/cordova-camera-plugin-obtain-full-image-path-from-gallery-android?rq=1
*/

// Android Capture

function androidVideoAlert(){

    document.getElementById("respondScreen" ).style.opacity = "0";
    jQuery( "#respondScreen" ).hide();

    jQuery( "#androidVideoAlert" ).fadeTo( "fast" , 1, function() {

    });
}

function cancelAndroidVideoAlert(){


    document.getElementById("androidVideoAlert" ).style.opacity = "0";
    jQuery( "#androidVideoAlert" ).hide();

    jQuery( "#respondScreen" ).fadeTo( "fast" , 1, function() {

    });
}

function capturePhoto(){
    // Retrieve image file location from specified source
    navigator.camera.getPicture(captureLibrarySuccess, captureError,{ quality: 80, 
        destinationType: navigator.camera.DestinationType.FILE_URI,
        sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY,
        mediaType: navigator.camera.MediaType.ALLMEDIA
    });
    logit("Android library")
}


// start video capture
function captureVideo(){
    navigator.device.capture.captureVideo(captureSuccess, captureError, {limit:1, quality: 1});
    //captureSuccess()
    logit("Android vid")
}

function captureImage(){
    navigator.device.capture.captureImage(captureSuccess, captureError, {limit:1});
    //captureSuccess()
    logit("Android img")
}

// capture error callback
var captureError = function(error) {
    logit("Android capture error");
    jQuery('#respondScreen').show();
    jQuery('#androidVideoAlert').hide();
};



/////////////////////////////////////////////////////////////////////////

function fileSelected_iOS() {

    logit("file ios")

    var oFile = document.getElementById('image_file').files[0];
    var rFilter = /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i;
    var vFilter = /^(video\/mp4|video\/mov|video\/wm4|video\/quicktime|video\/wmv)$/i;
    if (! rFilter.test(oFile.type)) {
        document.getElementById('error').style.display = 'block';
        if (vFilter.test(oFile.type)) {
            document.getElementById('error').style.display = 'none';
        }
    }

    //
   
    logit("fileSize: " + oFile.size);
    logit("fileType: " + oFile.type);

  
    if (oFile.size > 800000000 ){

        jQuery('#filesizeError').show();
   
    } else {

        // get preview element
        var oImage = document.getElementById('preview');
        // prepare HTML5 FileReader
        var oReader = new FileReader();
            oReader.onload = function(e){
            // e.target.result contains the DataURL which we will use as a source of the image

            if (vFilter.test(oFile.type)) {

                oImage.src = "images/videoIcon.jpg";
                displayFileSelectedUI(oFile.type, oFile.size, 'video');


            } else {

                oImage.src = e.target.result;
                displayFileSelectedUI(oFile.type, oFile.size, 'image');
            }
        };

        oReader.readAsDataURL(oFile);

        jQuery('#fileURL').html(oFile.fullPath);
        jQuery('#fileName').html(oFile.name);
        
    }

}

function captureLibrarySuccess(imageURI) { // ANDROID

    window.resolveLocalFileSystemURI(imageURI, function(fileEntry) {
        fileEntry.file(function(f) {

            logit("captureLibrarySuccess " + imageURI);

            logit("fileSize: " + f.size); //THIS IS MIME TYPE

            logit("fileType: " + f.type); //THIS IS MIME TYPE
            jQuery('#fileType').html(f.type);
            jQuery('#fileURL').html(imageURI);
            jQuery('#fileName').html(f.name);
            jQuery('#fileSize').html(f.size);
            jQuery('#preview').attr("src", imageURI);

            if (f.size > 800000000 ){

                jQuery('#filesizeError').show();
           
            } else {

                if (f.type == "image/jpeg"){

                    jQuery('#preview').attr("src", imageURI);
                    displayFileSelectedUI(f.type, f.size, 'image');

                } else {

                    displayFileSelectedUI(f.type, f.size, 'video');
                    
                }

                
            }

        }, function() {
            logit('error');
        });

    }, onError);
 
}

function onError() {
    logit('can not resolve file system');
}

captureSuccess = function(mediaFiles) { // ANDROID

    logit("captureSuccess " + mediaFiles);

    jQuery('#respondScreen').show();
    document.getElementById("respondScreen" ).style.opacity = "1";
    jQuery('#androidVideoAlert').hide();

    jQuery('#fileURL').html(mediaFiles[0].fullPath);
    jQuery('#fileType').html(mediaFiles[0].type);
    jQuery('#fileName').html(mediaFiles[0].name);
    jQuery('#fileSize').html(mediaFiles[0].size);

    

    logit("url="+mediaFiles[0].src);
    logit("type="+mediaFiles[0].type);
    logit("name="+mediaFiles[0].name);
    logit("size="+mediaFiles[0].size);

    
    if (mediaFiles[0].size > 800000000){ // 800Mb

        jQuery('#filesizeError').show();
    
    } else {

        if ((mediaFiles[0].type == "image/jpeg") || (mediaFiles[0].type == "image/png")){
            jQuery('#preview').attr("src", mediaFiles[0].fullPath);
            displayFileSelectedUI(mediaFiles[0].type, mediaFiles[0].size, 'image');
        } else {
            displayFileSelectedUI(mediaFiles[0].type, mediaFiles[0].size, 'video');
        }
        
        
    }
        
};

///////////////////////////////////////////////////////////////

function displayFileSelectedUI(file, size, type){

    logit("displayFile " + file)

    // hide different warnings
    document.getElementById('error').style.display = 'none';
    document.getElementById('error2').style.display = 'none';
    document.getElementById('abort').style.display = 'none';
    document.getElementById('warnsize').style.display = 'none';
    changeUI('uploadFileTrigger', 'display', 'block');
    changeUI('uploadFileTrigger', 'class', 'btn-primary twelve')
    

    changeUI('uploadPhotoButton', 'display', 'none');
    changeUI('uploadVideoButtonAndroid', 'display', 'none');
    changeUI('selectPhotoButton', 'display', 'none');
    changeUI('uploadVideoButton', 'display', 'none');
    changeUI('selectFileTrigger', 'display', 'none');
    changeUI('removeMedia', 'display', 'block');

    if (type == 'image'){
        changeUI('preview', 'display', 'block');
    }
    console.log("type " + type)
    if (size < 20000000){ //20Mb

        jQuery('#uploadMessage').hide();
        jQuery('#uploadMessageText').text("");
        if (type == 'video'){
            jQuery('#preview').attr("src", "images/videoIcon.jpg");
            changeUI('preview', 'display', 'block');
        }
    }

    if (size >= 20000000){ //20Mb

        jQuery('#uploadMessage').show();
        jQuery('#uploadMessageText').text("For best results upload over a fast internet connection");
    }

    if (size >= 100000000){ // 100Mb

        jQuery('#uploadMessage').show();
        jQuery('#uploadMessageText').text("Your video is large and may take a long time to upload.  We recommend uploading when you have a fast internet connection");
    }

    if (size >= 500000000){ // 100Mb

        jQuery('#uploadMessage').show();
        jQuery('#uploadMessageText').text("Your video is very large and may take a long time to upload.  We recommend uploading over a Wi-Fi connection.");
    }

    if (size > 800000000){ // 800Mb

        jQuery('#uploadMessage').hide();
        jQuery('#uploadMessageText').text("");
    }

    weHaveData = true;

    var angularScope = angular.element(document.querySelector('#tts-app')).scope();

    angularScope.$apply(function(){
        angularScope.fileSelected();
    })

}

function startUploading(u, t, m, p) {

    logit("uploading" + u + t + m + p);

    userID = u;
    taskID = t;
    messageID = m;
    projectID = p;

    changeUI('uploadFileTrigger', 'display', 'none');
    changeUI('progress_info', 'display', 'block');
    changeUI('messageText', 'display', 'none');
    changeUI('preview', 'display', 'none');
    changeUI('removeMedia', 'display', 'none');
    changeUI('uploadVideoButton', 'display', 'none');
    changeUI('selectFileTrigger', 'display', 'none');
    changeUI('uploadPhotoButton', 'display', 'none');
    changeUI('uploadVideoButtonAndroid', 'display', 'none');
    changeUI('selectPhotoButton', 'display', 'none');
    changeUI('progress', 'display', 'block');

    
    changeUI('uploadMessage', 'display', 'none');
    changeUI('filesizeError', 'display', 'none');


    fileURL = jQuery('#fileURL').html();
    fileType = jQuery('#fileType').html();
    fileName = jQuery('#fileName').html();
    data_URI =  jQuery("#debug").html();

    //if (thisDevice == "Android"){
    if (jQuery('#platform').html() == "Android"){

            var win = function (r) {

                logit("win: Response = " + r.response.toString()+"\n");

                var data = JSON.parse(r.response);

                logit("win: data = " + data);

                logit("win: fileType = " + data.fileType);

                //logit("upload complete - response " + JSON.parse(r.target.responseText))
                uploadComplete();

            }

            var fail = function (error) {
                logit("upload error " + error)
                uploadError();
            }

            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = fileName;
            options.mimeType = fileType;
            var params = {};
            options.params = params;
            options.headers = {
                Connection: "Close"
            };

            options.chunkedMode = true;
            var ft = new FileTransfer();

            ft.upload(
                fileURL, 
                encodeURI("http://www.gs0.co/tts/upload.php?userID="+userID+"&taskID="+taskID+"&messageID="+messageID+"&projectID="+projectID+"&device=Android&data_URI="+data_URI), win, fail, options, true);
            
            ft.onprogress = function(progressEvent) {


                if (progressEvent.lengthComputable) {

                    var iPercentComplete = Math.round(progressEvent.loaded * 100 / progressEvent.total);

                    document.getElementById('progress_percent_text').innerHTML = iPercentComplete.toString() + '%';
                    document.getElementById('progress').style.width = (iPercentComplete).toString() + '%';

                    if (iPercentComplete == 100){
                        document.getElementById('progress_percent_text').innerHTML = "OK"
                    }

                } else {
                  loadingStatus.increment();
                }
            };
    

    } else {

    //if (thisDevice == "iOS"){

    //if (jQuery('#platform').html() == "iOS"){

            var oProgress = document.getElementById('progress');
            oProgress.style.display = 'block';
            oProgress.style.width = '0px';

            // get form data for POSTing
            //var vFD = document.getElementById('upload_form').getFormData(); // for FF3
            var vFD = new FormData(document.getElementById('upload_form')); 

            // create XMLHttpRequest object, adding few event listeners, and POSTing our data
            var oXHR = new XMLHttpRequest();        
            oXHR.upload.addEventListener('progress', uploadProgress, false);
            oXHR.addEventListener('load', uploadComplete, false);
            oXHR.addEventListener('error', uploadError, false);
            oXHR.addEventListener('abort', uploadAbort, false);
            oXHR.open('POST', "http://www.gs0.co/tts/upload.php?userID="+userID+"&taskID="+taskID+"&messageID="+messageID+"&projectID="+projectID+"&device=iOS"+"&data_URI="+data_URI);
            oXHR.send(vFD);

            // set inner timer
            oTimer = setInterval(doInnerUpdates, 300);
    }
}

function uploadComplete(){

    // post data to TTS server
    var angularScope = angular.element(document.querySelector('#tts-app')).scope();

    angularScope.$apply(function(){
        angularScope.uploadFinished(userID, taskID, messageID, fileType);
    });

    weHaveData = false;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function doInnerUpdates() { // we will use this function to display upload speed
    var iCB = iBytesUploaded;
    var iDiff = iCB - iPreviousBytesLoaded;

    // if nothing new loaded - exit
    if (iDiff == 0)
        return;

    iPreviousBytesLoaded = iCB;
    iDiff = iDiff * 2;
    var iBytesRem = iBytesTotal - iPreviousBytesLoaded;
    var secondsRemaining = iBytesRem / iDiff;

    // update speed info
    var iSpeed = iDiff.toString() + 'B/s';
    if (iDiff > 1024 * 1024) {
        iSpeed = (Math.round(iDiff * 100/(1024*1024))/100).toString() + 'MB/s';
    } else if (iDiff > 1024) {
        iSpeed =  (Math.round(iDiff * 100/1024)/100).toString() + 'KB/s';
    }

    document.getElementById('speed').innerHTML = iSpeed;
    document.getElementById('remaining').innerHTML = '| ' + secondsToTime(secondsRemaining);        
}

function uploadProgress(e) { // upload process in progress
    if (e.lengthComputable) {
        iBytesUploaded = e.loaded;
        iBytesTotal = e.total;
        var iPercentComplete = Math.round(e.loaded * 100 / e.total);
        var iBytesTransfered = bytesToSize(iBytesUploaded);


        document.getElementById('progress_percent_text').innerHTML = iPercentComplete.toString() + '%';
        document.getElementById('progress').style.width = (iPercentComplete).toString() + '%';
        //document.getElementById('progress_percent').style.left = (iPercentComplete).toString() + '%';

        if (iPercentComplete == 100){
            document.getElementById('progress_percent_text').innerHTML = "OK"

        }
        
    } else {
        displayUploadError();
    }
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function uploadError() { // upload error
    document.getElementById('error2').style.display = 'block';
    clearInterval(oTimer);
    displayUploadError();
}  

function uploadAbort() { // upload abort
    document.getElementById('abort').style.display = 'block';
    clearInterval(oTimer);
    displayUploadError();
}

function displayUploadError(){
    // post data to TTS server
    var angularScope = angular.element(document.querySelector('#tts-app')).scope();

    angularScope.$apply(function(){
        angularScope.uploadErrorHandler();
    })
}


submitDebug = function(){

    jQuery('#debugButton').html("Wait..");

    var fileString = "fileURL: " + jQuery('#fileURL').html() + ", typfileType: " + jQuery('#fileType').html() + ", fileName: " + jQuery('#fileName').html() + ", debug: " + jQuery('#debug').html();
    console.log(fileString)
    var pjq = jQuery.noConflict();

    pjq.ajax({
        url: "http://www.gs0.co/tts/debug.php?debug=" +  fileString,
        type: "POST",
        dataType: "json",
        crossDomain: true,
        xhrFields: { withCredentials: true },
        //data: $scope.submitParams.join("&"),

        success: function(data) {
            jQuery('#debugButton').html("Debug sent");
            jQuery('#debugButton').addClass("btn-tertiary");
            jQuery('#debugButton').removeClass("btn-primary");
            jQuery('#debug').html(fileString)

        },

        complete: function (data) {
            jQuery('#debugButton').html("Debug sent");
            jQuery('#debugButton').addClass("btn-tertiary");
            jQuery('#debugButton').removeClass("btn-primary");
        },
    });
}
