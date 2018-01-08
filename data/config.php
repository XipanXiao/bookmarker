{ "nothing" : "<?php /* This makes the following content invisible for web access",
  "localhost": {
    "servername": "127.0.0.1",
    "username": "root",
    "password": "2345678901",
    "dbname": "bookmarker"
  },
  "bookmarker-bicw.rhcloud.com": {
    "servername": "${OPENSHIFT_MYSQL_DB_HOST}",
    "username": "${OPENSHIFT_MYSQL_DB_USERNAME}",
    "password": "${OPENSHIFT_MYSQL_DB_PASSWORD}",
    "dbname": "bookmarker",
    "session_path": "${OPENSHIFT_TMP_DIR}"
  },
  "sutra-sutra.1d35.starter-us-east-1.openshiftapps.com": {
    "servername": "${MYSQL_SERVICE_HOST}",
    "username": "${MYSQL_USER}",
    "password": "${MYSQL_PASSWORD}",
    "dbname": "bookmarker"
  },
  "closing": "*/?>"
}
