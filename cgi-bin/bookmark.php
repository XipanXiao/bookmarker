<?php
include_once 'connection.php';

$response = null;
$medoo = get_medoo();

function get_db_error() {
	global $medoo;

  $errors = $medoo->error();
  return empty($errors) ? '' : $errors[2];
}

function getBookMarks($userId) {
  global $medoo;
  
  $medoo->select("bookmarks", "*", ["user_id" => $userId]);
}

function updateBookmark($bookmark) {
  global $medoo;

  $where = ["AND" => 
      ["user_id" => $bookmark["user_id"], "url" => $bookmark["url"]]];
  $medoo->delete("bookmarks", $where);
  return $medoo->insert("bookmarks", $bookmark, $where);
}

function deleteBookmark($id) {
  global $medoo;

  return $medoo->delete("bookmarks", ["id" => $id]);
}

if ($_SERVER ["REQUEST_METHOD"] == "GET") {
  $response = getBookMarks($_GET["user_id"]);
} else if ($_SERVER ["REQUEST_METHOD"] == "POST") {
  $response = ["updated" => updateBookmark($_POST)];
} elseif ($_SERVER ["REQUEST_METHOD"] == "DELETE") {
  $response = ["deleted" => deleteBookmark($_REQUEST["id"])];
}

if ($response) {
  if (is_array($response) && isset($response["updated"]) &&
      intval($response["updated"]) == 0) {
    $response["error"] = get_db_error();
  }

  echo json_encode($response);
}
?>
