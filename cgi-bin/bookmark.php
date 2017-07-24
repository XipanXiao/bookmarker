<?php
include_once 'connection.php';

$response = null;
$medoo = get_medoo();

function get_db_error() {
	global $medoo;

  $errors = $medoo->error();
  return empty($errors) ? '' : $errors[2];
}

function getBookMarks() {
  global $medoo;
  
  $userId = $_SESSION["user_id"];
  if (!user_id) return [];

  return $medoo->select("bookmarks", "*", ["user_id" => $userId]);
}

function updateBookmark($bookmark) {
  global $medoo;

  $bookmark["user_id"] = $_SESSION["user_id"];
  $where = ["AND" => 
      ["user_id" => $bookmark["user_id"], "url" => $bookmark["url"]]];
  $medoo->delete("bookmarks", $where);
  return $medoo->insert("bookmarks", $bookmark);
}

function deleteBookmark($id) {
  global $medoo;

  return $medoo->delete("bookmarks", ["id" => $id]);
}

if ($_SERVER ["REQUEST_METHOD"] == "GET") {
  $response = getBookMarks();
} else if ($_SERVER ["REQUEST_METHOD"] == "POST") {
  $response = ["updated" => intval(updateBookmark($_POST))];
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
