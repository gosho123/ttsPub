<?php

    echo "v21";

$debug = $_GET['debug'];


$link = mysql_connect("localhost", "root", "moosheensql")  or die ('Error in connection: ' . mysql_error());;

mysql_select_db("TTS", $link);
$query = "INSERT INTO media (ID,
error) 
VALUES(
'NULL',
'" .$debug ."')";

mysql_query($query, $link) or die ('Error: Updating Database' . mysql_error());

mysql_close($link);


?>



