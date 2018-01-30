<?php
header('Access-Control-Allow-Origin: *');


error_reporting(E_ALL | E_STRICT); 
// echo phpinfo();

$target_path = "uploads/";
var_dump($_FILES);
$target_path = $target_path . basename( $_FILES['file']['name']);
 
$source_path = basename( $_FILES['file']['tmp_name']);
echo $target_path;
echo $source_path;

// ... PHP 7 doesn't use any of the standard error reporting that has been a mainstay of the previous versions and XAMPP ui...
// Try Catch blocks now.
try {
    if (move_uploaded_file($_FILES['file']['tmp_name'], $target_path)) {
        echo "\n\nUpload and move success";
    } else {
        echo $target_path;
        echo "\n\nThere was an error uploading the file, please try again!";
    }

} 
catch( Error $e) {
   $trace = $e->getTrace();
   echo $e->getMessage().' in '.$e->getFile().' on line '.$e->getLine().' called from '.$trace[0]['file'].' on line '.$trace[0]['line'];
}

?>