<?php
namespace RevenantBlue;

class DependencyContainer {
	private $instances = array();
	private $params = array();

	public function __construct($params) {
		$this->params = $params;
	}

	public function createConnection() {
		$adminUser = !empty($params['adminUser']) ? $params['adminUser'] : FALSE;
		try {
			// If connecting with a user with admin privileges else use the standard access privileges.
			if($adminUser === TRUE) {
				if(DEVELOPMENT_ENVIRONMENT === TRUE) {
					$this->instances['dbh'] = new PDO(DB_CONN_LOCAL, DB_USER_ADMIN, DB_PASS_ADMIN, array(
							PDO::MYSQL_ATTR_FOUND_ROWS => TRUE // Allows PDO's rowCount() function to return true even if no rows were affected.
						)
					);
					$this->instances['dbh']->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
				} elseif(DEVELOPMENT_ENVIRONMENT === FALSE) {
					$this->instances['dbh'] = new PDO(DB_CONN, DB_USER_ADMIN, DB_PASS_ADMIN, array(
							PDO::MYSQL_ATTR_FOUND_ROWS => true
						)
					);
					$this->instances['dbh']->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
				}	
			} else {
				if(DEVELOPMENT_ENVIRONMENT === TRUE) {
					$this->instances['dbh'] = new PDO(DB_CONN_LOCAL, DB_USER, DB_PASS, array(
							PDO::MYSQL_ATTR_FOUND_ROWS => true // Allows PDO's rowCount() function to return true even if no rows were affected.
						)
					);
					$this->instances['dbh']->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
				} elseif(DEVELOPMENT_ENVIRONMENT === FALSE) {
					$this->instances['dbh'] = new PDO(DB_CONN, DB_USER, DB_PASS, array(PDO::MYSQL_ATTR_FOUND_ROWS => true));
					$this->instances['dbh']->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
				}
			}
			
			return $this->instances['dbh'];
		} catch(PDOException $e) {
			$this->errorLog($e);
			return $e;
		}
	}
	
	public function errorLog($msg = NULL) {
		
		if(empty($msg)) {
			return false;
		}
		
		$error =  "Date: " . date("m-d-Y H:i:s", time()) . "\n";
		$error .= "Error:  "  . $msg->getMessage() . "\n" . 
				  "File:  " . $msg->getFile() . "\n" . 
				  "Line:  " . $msg->getLine() . "\n" . 
				  "Code:  " . $msg->getCode() . "\n" . 
				  "Trace:  " . $msg->getTraceAsString() . "\n";
		if(isset($_SERVER['HTTP_HOST'])) {
			$error .= "Host: " . $_SERVER['HTTP_HOST'] . "\n";
			$error .= "Client: " . $_SERVER['HTTP_USER_AGENT'] . "\n";
			$error .= "Client IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
			$error .= "Request URI: " . $_SERVER['REQUEST_URI'];
		}
		$error .= "\n\n\n"; 
		error_log($error, 3, DIR_LOGS . "error.log");
		return $error;
	}
	
	private function __clone() {
		//Make __clone private to prevent cloning of the instance.
	}
}
