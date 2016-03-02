// common variables
var iBytesUploaded = 0;
var iBytesTotal = 0;
var iPreviousBytesLoaded = 0;
var iMaxFilesize = 1048576 * 200;//1048576; // 1MB
var oTimer = 0;
var sResultFileSize = '';
var weHaveData = false;

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
    document.getElementById('error').style.display = 'none';
    document.getElementById('error2').style.display = 'none';
    document.getElementById('abort').style.display = 'none';
    document.getElementById('warnsize').style.display = 'none';
    document.getElementById('preview').src = "#";
    if (weHaveData == false){
        changeUI('uploadPhotoButton', 'display', 'block');
        changeUI('uploadVideoButton', 'display', 'block');
    } else {
        changeUI('uploadPhotoButton', 'display', 'none');
        changeUI('uploadVideoButton', 'display', 'none');
        changeUI('preview', 'display', 'block');
    }

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

removeMediaFile = function(){
    document.getElementById('image_file').value = null;
}

// start video capture
function captureVideo(){
    navigator.device.capture.captureVideo(captureSuccess, captureError, {limit:1});
    //captureSuccess()
}

function captureImage(){
    navigator.device.capture.captureImage(captureSuccess, captureError, {limit:1});
    //captureSuccess()
}

// capture error callback
var captureError = function(error) {
    navigator.notification.alert('No media added: ' + error.code, null);
};

var fileURL = "";
var fileTypevar = "";
var fileName = ""

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function fileSelected() {

    // hide different warnings
    document.getElementById('error').style.display = 'none';
    document.getElementById('error2').style.display = 'none';
    document.getElementById('abort').style.display = 'none';
    document.getElementById('warnsize').style.display = 'none';

    // get selected file element
    var oFile = document.getElementById('image_file').files[0];

    // filter for files
    var rFilter = /^(image\/bmp|image\/gif|image\/jpeg|image\/png|image\/tiff)$/i;
    var vFilter = /^(video\/mp4|video\/mov|video\/wm4|video\/quicktime|video\/wmv)$/i;

    if (! rFilter.test(oFile.type)) {
        document.getElementById('error').style.display = 'block';

        if (vFilter.test(oFile.type)) {
            document.getElementById('error').style.display = 'none';
        }
        //return;
    }

    // little test for filesize
    if (oFile.size > iMaxFilesize) {
        document.getElementById('warnsize').style.display = 'block';
        return;
    }

    // get preview element
    var oImage = document.getElementById('preview');


    // prepare HTML5 FileReader
    var oReader = new FileReader();
        oReader.onload = function(e){

        // e.target.result contains the DataURL which we will use as a source of the image

        if (vFilter.test(oFile.type)) {
            oImage.src = "images/videoIcon.jpg";
        } else {
            oImage.src = e.target.result;
        }

        /*oImage.onload = function () { // binding onload event

            // we are going to display some custom image information here
            sResultFileSize = bytesToSize(oFile.size);
            document.getElementById('fileinfo').style.display = 'block';
            document.getElementById('filename').innerHTML = 'Name: ' + oFile.name;
            document.getElementById('filesize').innerHTML = 'Size: ' + sResultFileSize;
            document.getElementById('filetype').innerHTML = 'Type: ' + oFile.type;
            document.getElementById('filedim').innerHTML = 'Dimension: ' + oImage.naturalWidth + ' x ' + oImage.naturalHeight;
        };*/
    };

    // read selected file as DataURL
    oReader.readAsDataURL(oFile);

     var angularScope = angular.element(document.querySelector('#tts-app')).scope();

    angularScope.$apply(function(){
        angularScope.fileSelected(oFile.type);
    })

    readyToUpload();
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

removeMediaFile = function(){
    document.getElementById('image_file').value = null;
}

var captureSuccess = function(mediaFiles) {

    jQuery("#debug").html(mediaFiles);

    jQuery('#fileURL').html(mediaFiles[0].fullPath);

    if (mediaFiles[0].type == "image/jpeg"){
        jQuery('#preview').attr("src", mediaFiles[0].fullPath);
    } else {
        jQuery('#preview').attr("src", "images/videoIcon.jpg");
    }

    

    jQuery('#fileType').html(mediaFiles[0].type);
    jQuery('#fileName').html(mediaFiles[0].name);


    // hide different warnings
    document.getElementById('error').style.display = 'none';
    document.getElementById('error2').style.display = 'none';
    document.getElementById('abort').style.display = 'none';
    document.getElementById('warnsize').style.display = 'none';
    changeUI('uploadFileTrigger', 'display', 'block');
    changeUI('uploadFileTrigger', 'class', 'btn-primary twelve')
    changeUI('preview', 'display', 'block');

    changeUI('uploadPhotoButton', 'display', 'none');
    changeUI('uploadVideoButton', 'display', 'none');

    var angularScope = angular.element(document.querySelector('#tts-app')).scope();

    angularScope.$apply(function(){
        angularScope.fileSelected(mediaFiles[0].type);
    })

    weHaveData = true;
        
};

function startUploading(u, t, m, p) {

    var userID = u;
    var taskID = t;
    var messageID = m;
    var projectID = p;

    changeUI('uploadFileTrigger', 'display', 'none');
    changeUI('progress_info', 'display', 'block');
    changeUI('messageText', 'display', 'none');
    changeUI('preview', 'display', 'none');
    changeUI('removeMedia', 'display', 'none');
    changeUI('uploadVideoButton', 'display', 'none');
    changeUI('uploadPhotoButton', 'display', 'none');
    changeUI('progress', 'display', 'block');


    var fileURL = jQuery('#fileURL').html();
    var fileType = jQuery('#fileType').html();
    var fileName = jQuery('#fileName').html();


    var win = function () {
        
        // post data to TTS server
        var angularScope = angular.element(document.querySelector('#tts-app')).scope();

        angularScope.$apply(function(){
            angularScope.uploadFinished(userID, taskID, messageID);
        });

        weHaveData = false;

    }

    var fail = function (error) {
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

    options.chunkedMode = false;
    var ft = new FileTransfer();


    ft.upload(
        fileURL, 
        encodeURI("http://www.gs0.co/tts/upload.php?userID="+userID+"&taskID="+taskID+"&messageID="+messageID+"&projectID="+projectID), win, fail, options, true);
    
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
    
}

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