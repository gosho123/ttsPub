<?php
///

$userID = $_GET['userID'];
$taskID = $_GET['taskID'];
$messageID = $_GET['messageID'];

$mediaID = "TTS-".$userID."_".$taskID."_".$messageID;

///

function bytesToSize1024($bytes, $precision = 2) {
    $unit = array('B','KB','MB');
    return @round($bytes / pow(1024, ($i = floor(log($bytes, 1024)))), $precision).' '.$unit[$i];
}

// Set local PHP vars from the POST vars sent from our form using the array
// of data that the $_FILES global variable contains for this uploaded file
$fileName = $_FILES["file1"]["name"]; // The file name
$fileTmpLoc = $_FILES["file1"]["tmp_name"]; // File in the PHP tmp folder
$fileType = $_FILES["file1"]["type"]; // The type of file it is
$fileSize = $_FILES["file1"]["size"]; // File size in bytes
$fileErrorMsg = $_FILES["file1"]["error"]; // 0 for false... and 1 for true

$fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);

// Specific Error Handling if you need to run error checking
if (!$fileTmpLoc) { // if file not chosen
    echo "ERROR: Please browse for a file before clicking the upload button.";
    //exit();
}

// Place it into your "uploads" folder mow using the move_uploaded_file() function
move_uploaded_file($fileTmpLoc, "media/$fileName");
rename("media/$fileName", "media/".$mediaID.".".$fileExtension);

// Check to make sure the uploaded file is in place where you want it
if (!file_exists("media/$mediaID.$fileExtension")) {

    echo "error";
    //exit();

} else {

    $link = mysql_connect("localhost", "root", "moosheensql")  or die ('Error in connection: ' . mysql_error());;

    mysql_select_db("TTS", $link);

    function clean($str) {
        $str = @trim($str);
        if(get_magic_quotes_gpc()) {
            $str = stripslashes($str);
        }
        return mysql_real_escape_string($str);
    }

    $query = "INSERT INTO media (ID,
        mediaId,
        mediaType,
        userId,
        taskId,
        messageId,
        converted) 
        VALUES(
        'NULL',
        '" . $mediaID . "',
        '" . $fileExtension . "',
        '" . $userID . "',
        '" . $taskID . "',
        '" . $messageID . "',
        'false')";

    mysql_query($query, $link) or die ('Error: Updating Database' . mysql_error());

    mysql_close($link);

    /////////////////////////////// FFMPEG

    if (($fileExtension == "mov") || ($fileExtension == "mp4")){

        include ("ffmpeg/ffmpeg.class.php");

        // instantiate ffmpeg ultimate class

        $ffmpegultimate = new FfmpegUltimate ();

        //thumb creation

        $input = "media/" . $mediaID . "." . $fileExtension;
        $time  = "1";
        $dimension = "480*272";
        $outputFolder = "media/thumbs/";
        $outputFile = $mediaID . ".jpg";
        //$outputFile2 = $vidID.".jpg";

        $output = $ffmpegultimate->previewThumb ($input, $outputFolder, $outputFile, $time, $dimension);
        //$output2 = $ffmpegultimate->previewThumb ($input, $outputFolder, $outputFile2, $time, $dimension);

        if (file_exists($outputFolder.$outputFile)) {
            
            echo "success";
            
        } else {
            
            echo "error";
        }
    } else if (($fileExtension == "jpg") || ($fileExtension == "gif") || ($fileExtension == "png")){

        $input = "media/" . $mediaID . "." . $fileExtension;
        $output = "media/thumbs/" . $mediaID . "." . $fileExtension;
        exec ( "ffmpeg -i $input -vf scale=250:-1 $output" );

        if (file_exists($output)) {
            
            echo "success";
            
        } else {
            
            echo "error";
        }

    }

}

?>



