<?php
include_once 'connection.php';

$response = null;
$medoo = get_medoo();

function get_db_error() {
  global $medoo;

  $errors = $medoo->error();
  return empty($errors) ? '' : $errors[2];
}

function get_categories() {
	global $medoo;
	
	return keyed_by_id($medoo->select("categories", "*"));
}

function get_sutra_list($source) {
  global $medoo;
  
  return $medoo->select("sutra", "*", ["source" => $source]);
}

function keyed_by_id($results, $id_field = "id") {
  $data = [];
  foreach ($results as $result) {
    $id = $result[$id_field] = intval($result[$id_field]);
    $data[$id] = $result;
  }
  return $data;
}

function get_progress() {
  global $medoo;

  $user_id = $_SESSION["user_id"];
  if (!$user_id) return [];

  return $medoo->select("progress", "*", ["user_id" => $user_id]);
}

function update_progress($book_id, $finished) {
  global $medoo;
  
  $user_id = $_SESSION["user_id"];
  if (!$user_id) return [];

  $data = ["book_id" => $book_id, "user_id" => $user_id];
  $medoo->delete("progress", ["AND" => $data]);
  if (!intval($finished)) return 1;

  return $medoo->insert("progress", array_merge($data, 
      ["finished" => $finished]));
}

function get_sutra_sources() {
  global $medoo;

  return keyed_by_id($medoo->select("sutra_sources", "*"));
}

function get_recents() {
  global $medoo;

  $user_id = $_SESSION["user_id"];
  if (!$user_id) return [];

  return $medoo->select("recents", "*",
      ["user_id" => $user_id, "ORDER" => "ts"]);
}

function update_recents($book_id, $source) {
  global $medoo;

  $user_id = $_SESSION["user_id"];
  if (!$user_id) return [];

  $sql = sprintf("INSERT INTO recents
  		(user_id, sequence, sub_index, book_id, source)
   select
      %d,
      (coalesce(max(sequence), -1) + 1),
  		(coalesce(max(sequence), -1) + 1) mod 20,
      %d,
  		%d
   from recents
      where user_id = %d
      on duplicate key update
  		   sequence = values(sequence), 
         book_id = %d,
  		   ts = NOW()", $user_id, $book_id, $source, $user_id, $book_id);
  return $medoo->query($sql);
}

if ($_SERVER ["REQUEST_METHOD"] == "GET") {
  $res_id = $_GET["rid"];
  if ($res_id == "categories") {
  	$response = get_categories();
  } elseif ($res_id == "sutra") {
    $response = get_sutra_list($_GET["source"]);
  } elseif ($res_id == "progress") {
    $response = get_progress();
  } elseif ($res_id == "sources") {
    $response = get_sutra_sources();
  } elseif ($res_id == "recents") {
    $response = get_recents();
  }
} else if ($_SERVER ["REQUEST_METHOD"] == "POST") {
  $res_id = $_POST["rid"];
  if ($res_id == "progress") {
    $book_id = $_POST["book_id"];
    $finished = $_POST["finished"];
    $response = ["updated" => 
        intval(update_progress($book_id, $finished))];
  } elseif ($res_id == "recents") {
    $response = ["updated" => intval(update_recents(intval($_POST["book_id"]),
        intval($_POST["source"])))];
  }
}

if ($response) {
  if (is_array($response) && isset($response["updated"]) &&
      intval($response["updated"]) == 0) {
    $response["error"] = get_db_error();
  }

  echo json_encode($response);
}
?>
