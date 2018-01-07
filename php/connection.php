<?php
   include_once 'config.php';
   include_once 'medoo.php';
 
  function get_medoo($charset = NULL) {
     global $config;
    
    return new medoo([
        // required
        'database_type' => 'mysql',
        'database_name' => $config->dbname,
        'server' => $config->servername,
        'username' => $config->username,
        'password' => $config->password,
        'charset' => $charset == NULL ? 'utf8' : $charset,
        
        // driver_option for connection, read more from http://www.php.net/manual/en/pdo.setattribute.php
        'option' => [
            PDO::ATTR_CASE => PDO::CASE_NATURAL
        ]
    ]);    
  }
?>
