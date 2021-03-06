<?php
namespace RevenantBlue\Site;
use \stdClass;

// Config
require_once __DIR__ . '/../config.php';
// Database
require_once DIR_SYSTEM . 'database/db.php';
require_once DIR_SYSTEM . 'engine/dependencies.php';
// Redis Datastore
require_once DIR_SYSTEM . 'database/redis.php';
// Configuration settings
require_once DIR_APPLICATION . 'model/config/config-main.php';
// Startup
require_once DIR_APPLICATION . 'startup.php';
// Session
require_once DIR_SYSTEM . 'engine/session.php';
// ACL
require_once DIR_SYSTEM . 'engine/acl.php';
// Pagination
require_once DIR_SYSTEM . 'library/paginate.php';

// Deny access to banned ip addresses
if(REDIS === TRUE) {
	$rdh = $redis->loadRedisHandler();
	$isBanned = $rdh->sismember(PREFIX . 'bannedIps', $_SERVER['REMOTE_ADDR']);
	if($isBanned) {
		header('HTTP/1.1 403 Forbidden');
		echo "Your IP address has been banned on this site.";
		exit;
	}
} else {
	if($config->getBannedIp($_SERVER['REMOTE_ADDR'])) {
		header('HTTP/1.1 403 Forbidden');
		echo "Your IP address has been banned on this site.";
		exit;
	}
}

// Front Controller
if(isset($_GET['controller'])) {
	$pageToDisplay = $_GET['controller'];
} else {
	$pageToDisplay = 'index';
}

if($pageToDisplay === 'index') {
	$rbURL = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
	$rbURL .= $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
	
	$rbParsedURL = parse_url($rbURL);
	$rbSubdomain = explode('.', $rbParsedURL['host']);

	if(!empty($rbSubdomain[1])) {
		$hostTest = $rbSubdomain[0] . '.' . $rbSubdomain[1];
	} elseif(!empty($rbSubdomain[0])) {
		$hostTest = $rbSubdomain[0];
	} else {
		$hostTest = '';
	}
	
	if($rbSubdomain[0] !== $_SERVER['HTTP_HOST'] && $hostTest !== $_SERVER['HTTP_HOST'] && $rbSubdomain[0] !== 'www' && !filter_var($_SERVER['HTTP_HOST'], FILTER_VALIDATE_IP)) {
		require_once DIR_APPLICATION . 'model/pages/pages-main.php';
		//Instantiate the pages model
		$pages = new Pages;
		$pageToLoad = $pages->loadPage($rbSubdomain[0]);
		if((int)$pageToLoad['subdomain'] === 1) {
			include_once DIR_APPLICATION . 'view/template/page-templates/' . $pageToLoad['template_alias'] . '.php';
		} else {
			include_once DIR_SITE_ROOT . '404.php';
		}
	} else {
		include_once DIR_TEMPLATE . $pageToDisplay . '.php';
	}
} elseif(empty($pageToDisplay)) {
	include_once DIR_TEMPLATE .'index.php';
} elseif(is_file(DIR_TEMPLATE . $pageToDisplay . '.php')) {
	include_once DIR_TEMPLATE . $pageToDisplay . '.php';
} else {
	require_once DIR_APPLICATION . 'model/pages/pages-main.php';
	//Instantiate the pages model
	$pages = new Pages;
	$pageToLoad = $pages->loadPage($pageToDisplay);
	if(empty($pageToLoad) || empty($pageToLoad['template_alias'])) {
		include_once DIR_SITE_ROOT . '404.php';
	} elseif(!empty($pageToLoad['template_alias'])) {
		include_once DIR_APPLICATION . 'view/template/page-templates/' . $pageToLoad['template_alias'] . '.php';
	}
}
