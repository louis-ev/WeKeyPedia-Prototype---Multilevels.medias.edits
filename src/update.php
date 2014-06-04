<?php
$path = $_POST[path];
$data = json_encode($_POST[data]);
var_dump( $data );
file_put_contents ( $path, $data );
?>