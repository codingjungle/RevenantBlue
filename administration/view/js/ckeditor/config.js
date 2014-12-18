/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	
	//config.toolbarCanCollapse = true;
	config.extraPlugins = 'youtube';
	
	// Remove advanced tabs from image and link dialogs.
	config.removeDialogTabs = 'image:advanced;link:advanced';
	
	config.toolbar = [
		{ name: 'basicstyles', items: [ 'Bold', 'Italic', 'Underline', 'Strike', '-', 'Subscript', 'Superscript' ] },
		{ name: 'listsindents', items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote' ] },
		{ name: 'links', items: [ 'Link', 'Unlink' ] },
		{ name: 'images', items: [ 'Image', 'Youtube', 'Smiley' ] },
		{ name: 'tools', items: [ 'Maximize' ] },
		'/',
		{ name: 'font', items: [ 'Font', 'FontSize' ] },
		{ name: 'clipboard', items: [ 'Undo', 'Redo', '-', 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord' ] },
		{ name: 'alignment', items: [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight' ] }
	];
};
