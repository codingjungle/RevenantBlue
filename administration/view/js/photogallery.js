$(document).ready(function() {
	var adminObj, jsonStr, response, x, orderFields, buttons, getOrder
	  , noAlbumAlert = "No albums selected, please select an album from the table below and try again."
	  , noImageAlert = "No image selected, please select an image below and try again.";

	// jqueryUI sortable for the album overview.
	if($('#album-overview').length != 0) {
		getOrder = getURLParameter("order");
		searchParam = getURLParameter("search");
		publishParam = getURLParameter("state");
		featureParam = getURLParameter("featured");
		// Only enable table drag and drop if the default ordering is used.
		if(getOrder === null) {
			$('#album-overview').tableDnD({
				onDragClass : 'tableDnD-drag',
				onDrop : function(table, row) {
					orderFields = document.getElementsByName('orderNumber');
					for(x = 0; x < orderFields.length; x++ ) {
						orderFields[x].value = (x + 1);
					}
					adminObj = {
						type      : 'album',
						action    : 'reorder',
						csrfToken : $("#csrf-token").val()
					};
					adminObj.order = $.tableDnD.serialize();
					jsonStr = JSON.stringify(adminObj);
					$.ajax({
						url   : HTTP_ADMIN + 'photogallery',
						type  : "post",
						datatype : 'json',
						data  : "adminRequest=" + encodeURIComponent(jsonStr),
						error: function (xmlHttpRequest, textStatus, errorThrown) {
							if(xmlHttpRequest.readyState == 0 || xmlHttpRequest.status == 0) {
								return;
							} else {
								return;
							}
						}
					});
				},
			});
		}
	}
	
	//Initialize the date/timepicker
	if($('#date-posted').length != 0) {
		$('#date-posted').datetimepicker({
				showOn: "both",
				buttonImage: HTTP_IMAGE + "icons/admin/calendar_icon2.png",
				buttonImageOnly: true,
				ampm: true,
				dateFormat: 'yy-mm-dd',
				timeFormat: 'hh:mm TT'
		});
	}
	// jqueryUI sortable image div for the album images.
	if($('#album-images-sortable').length != 0) {
		$("#album-images-sortable").sortable({
			handle : '.handle',
			start: function(e,ui){
				ui.placeholder.height(ui.item.height());
			},
			update : function () {
				adminObj = {
					type      : "album-image",
					action    : "reorder",
					csrfToken : $("#csrf-token").val()
				};
				adminObj.order = $('#album-images-sortable').sortable('serialize');
				jsonStr = JSON.stringify(adminObj);
				$.ajax ({
					url: HTTP_ADMIN + 'photogallery',
					type: "post",
					data: "adminRequest=" + encodeURIComponent(jsonStr),
					error: function() {
				    	if(xmlHttpRequest.readyState === 0 || xmlHttpRequest.status === 0) {
					    	return;
					 	} else {
							return;
						}
					},
				});
			},
			placeholder : 'profile-placeholder',
		});

	}
	// jqueryUI modal window for the multifile uploader.
	if($('#upload-photos').length !== 0) {
		$("#upload-photos-form").dialog({
			autoOpen    : false,
			height      : 700,
			width       : 900,
			modal       : true,
			dialogClass : "popup",
			buttons     : {
				"Submit Changes" : function() {
					showMenus();
				},
				close: function() {
					$(this).dialog("close");
				}
			},
			open: function() {
				hideMenus(true);
			},
			close: function() {
				showMenus();
			}

		});
		// Setup modal submit button
		$(":button:contains('Submit Changes')").prop("disabled", true).addClass("ui-state-disabled").click(function() {
			$("#submitImageUploads").prop("value", "1");
			$("#photo-upload").submit();
		});


		$("#toolbar-upload").click(function() {
			$("#upload-photos-form").dialog("open");
		});

		// Handle toggling of file details in the media overview.
		$(document).on("click", ".details-toggle", function() {
			var fileId = this.parentNode.id.replace("file-", "");
			//$("#media-body-" + fileId).toggle();
			//$("#media-meta-" + fileId).toggle();
			$("#media-profile-" + fileId).toggle();

			if($('#media-body-' + fileId).is(':visible')) {
				$(this).html('Hide');
			} else {
				$(this).html('Show');
			}
		});

		// JqueryUi button for uploader
		$("#plupload-browser-button").button().unbind('focus');

		// Submit upload changes.
		$("#submitImageUploads").click(function(e) {
			$("#gallery-action").val("submit-image-uploads");
			$("#photo-upload").submit();
		});
	}
	// jquery effects for the image slideshow.
	if($("#navleft").length != 0) {
		$("#navleft").hover(function() {
			$(this).addClass("icon-40-navleft").removeClass("icon-40-navleft-inactive");
		}, function() {
			$(this).addClass("icon-40-navleft-inactive").removeClass("icon-40-navleft");
		});
	}
	if($("#navright").length != 0) {
		$("#navright").hover(function() {
			$(this).addClass("icon-40-navright").removeClass("icon-40-navright-inactive");
		}, function() {
			$(this).addClass("icon-40-navright-inactive").removeClass("icon-40-navright");
		});
	}
	//Initialize the tabs for the template selector.
	if($("#templates-tabs").length != 0) {
		$("#templates-tabs").tabs();
	}
	if($("#template-adder").length != 0) {
		$(".new-template-panel").hide();
		$('#template-add-toggle').click(function() {
			$(".new-template-panel").slideToggle();
		});
	}

	// Add template toggle.
	if($("#add-template").length != 0) {
		$("#add-template").click(function() {
			$("#add-template-form").slideToggle();
		});
	}

	//Initialize the portlet jqueryui feature for the panels.
	if($("#overview").length != 0) {
		$(".panel").sortable({
			connectWith: ".panel",
			handle: $(".element-top"),
			start: function(e,ui){
				ui.placeholder.height(ui.item.height());
			}
		});
		$( ".panel-column" ).addClass("ui-widget ui-widget-content ui-helper-clearfix ui-corner-all")
			.find(".element-top")
				.addClass("ui-widget-header ui-corner-all")
				.prepend("<span class='ui-icon ui-icon-minusthick'></span>")
				.end()
			.find(".element-top")
				.end()
			.find(".element-body").show();

		$(".element-top .ui-icon").click(function() {
			$(this).toggleClass("ui-icon-minusthick").toggleClass("ui-icon-minusthick");
			$(this).parents(".panel-column:first").find(".element-body").toggle();
		});
		$(".element-top").disableSelection();
	}

	// New template ajax request
	$("#add-new-template").click(function(e) {
		e.preventDefault();

		$.ajax ({
			url: HTTP_ADMIN + "photogallery",
			type: "POST",
			datatype: "json",
			data: "adminRequest=" + encodeURIComponent(JSON.stringify({
				type         : "gallery",
				action       : "new-template",
				templateName : $("#new-template-name").val(),
				thumbWidth   : $("#new-thumb-width").val(),
				thumbHeight  : $("#new-thumb-height").val(),
				imageWidth   : $("#new-image-width").val(),
				imageHeight  : $("#new-image-height").val(),
				templateType : $("#template-type").val(),
				csrfToken    : $("#csrf-token").val()
			})),
			success: function(data, textStatus, jqXHR) {
				response = JSON.parse(data);
				newId = response.id;
				lastRowClass = $("tr:last", "#template-list").prop("class");
				lastRowClass = lastRowClass.replace("overview-row", "");
				if(lastRowClass == "1") {
					newRowClass = "2";
				} else {
					newRowClass = "1";
				}
				$("#template-list > tbody:last").append(
					'<tr id="template-' + newId +'" class="overview-row' + newRowClass + '">' +
						'<td class="left">' + response.templateName + '</td>' +
						'<td>' +
							'<input type="text" id="thumb-width-' + newId + '" size="5" value="' + response.thumbWidth + '"/>' +
						'</td>' +
						'<td>' +
							'<input type="text" id="thumb-height-' + newId + '" size="5" value="' + response.thumbHeight + '"/>' +
						'</td>' +
						'<td>' +
							'<input type="text" id="image-width-' + newId + '" size="5" value="' + response.imageWidth + '"/>' +
						'</td>' +
						'<td>' +
							'<input type="text" id="image-height-' + newId + '" size="5" value="' + response.imageHeight + '"/>' +
						'</td>' +
						'<td>' +
							'<select id="template-type-' + newId + '">' +
								'<option selected="selected" value="' + response.templateType + '">' + response.templateType + '</option>' +
								'<option value="exact">exact</option><option value="portrait">portrait</option>' +
								'<option value="landscape">landscape</option><option value="crop">crop</option>' +
								'<option value="auto">auto</option>' +
							'</select>' +
						'</td>' +
						'<td>' +
							'<p>' +
								'<a id="save-template-' + newId + '" class="save-template" href="#">Save</a>' +
								'<span> | </span>' +
								'<a id="delete-template-' + newId + '" class="delete-template" href="#">Delete</a>' +
							'</p>' +
						'</td>' +
					'</tr>'
				);
				$("#template-" + response.id).effect("highlight", '#F0EB00', 3000);
			 }
		});
	});

	// Update template ajax request
	$("#template-list").on("click", ".save-template", function(e) {

		e.preventDefault();

		var id = $(this).prop('id').replace("save-template-", "");

		$.ajax ({
			url: HTTP_ADMIN + "photogallery",
			type: "POST",
			datetype: "json",
			data: "adminRequest=" + encodeURIComponent(JSON.stringify({
				type         : "gallery",
				action       : "save-template",
				id           : id,
				thumbWidth   : $("#thumb-width-" + id).val(),
				thumbHeight  : $("#thumb-height-" + id).val(),
				imageWidth   : $("#image-width-" + id).val(),
				imageHeight  : $("#image-height-" + id).val(),
				templateType : $("#template-type-" + id).val(),
				csrfToken    : $("#csrf-token").val()
			})),
			success: function(data, textStatus, jqXHR) {
				response = JSON.parse(data);
				$("#thumb-width-" + id).val(response.thumbWidth);
				$("#thumb-height-" + id).val(response.thumbHeight);
				$("#image-width-" + id).val(response.imageWidth);
				$("#image-height-" + id).val(response.imageHeight);
				$("#template-type-" + id).val(response.templateType);
				$("#template-" + response.id).effect("highlight", "#F0EB00", 3000);
			}
		});
	});
	// Delete template ajax request
	$("#template-list").on("click", ".delete-template", function(e) {
		var id = $(this).prop("id").replace("delete-template-", "");
		$.ajax ({
			url: HTTP_ADMIN + "photogallery",
			type: "POST",
			datetype: "json",
			data: "adminRequest=" + encodeURIComponent(JSON.stringify({
				type         : "gallery",
				action       : "delete-template",
				id           : id,
				csrfToken    : $("#csrf-token").val()
			})),
			success: function(data, textStatus, jqXHR) {
				response = JSON.parse(data);
				$("#template-" + response.id).fadeOut("slow", function() {
					$("#template-" + response.id).remove();
				});
			}
		});
	});
	$("#action-new-album").click(function(e) {
		selectNavItem("#new-album-link", "#galleries-link");
	});
	// Edit album clicks.
	$("#toolbar-edit-album, #action-edit-album").click(function() {
		if(typeof(boxesChecked) === "undefined" || boxesChecked == 0) {
			alert(noAlbumAlert);
		} else {
			selectNavItem("#new-album-link", "#galleries-link");
			CMS.submitButton('gallery-album', 'edit');
		}
	});
	// Publish album clicks.
	$("#toolbar-publish-album, #action-publish-album").click(function() {
		if(typeof(boxesChecked) === "undefined" || boxesChecked == 0) {
			alert(noAlbumAlert);
		} else {
			CMS.submitButton('gallery-album', 'publish');
		}
	});
	// Unpublish album clicks.
	$("#toolbar-unpublish-album, #action-unpublish-album").click(function() {
		if(typeof(boxesChecked) === "undefined" || boxesChecked == 0) {
			alert(noAlbumAlert);
		} else {
			CMS.submitButton('gallery-album', 'unpublish');
		}
	});
	// Feature album clicks.
	$("#toolbar-feature-album, #action-feature-album").click(function() {
		if(typeof(boxesChecked) === "undefined" || boxesChecked == 0) {
			alert(noAlbumAlert);
		} else {
			CMS.submitButton('gallery-album', 'featured');
		}
	});
	// Remove feature album clicks.
	$("#toolbar-nofeature-album, #action-nofeature-album").click(function() {
		if(typeof(boxesChecked) === "undefined" || boxesChecked == 0) {
			alert(noAlbumAlert);
		} else {
			CMS.submitButton('gallery-album', 'remove-featured');
		}
	});
	// Delete album clicks.
	$("#toolbar-delete-album, #action-delete-album").click(function() {
		if(typeof(boxesChecked) === "undefined" || boxesChecked == 0) {
			alert(noAlbumAlert);
		} else {
			CMS.submitButton('gallery-album', 'delete');
		}
	});
	// Publish album button clicks.
	$(".publish-album-content").click(function() {
		$("#album-state").val(1);
		CMS.submitButton("gallery-album", "save-close");
	});
	// Save album clicks
	$("#toolbar-save-album, #action-save-album").click(function() {
		CMS.submitButton("gallery-album", "save");
	});
	// Save and new album clicks
	$("#toolbar-save-new-album, #action-save-new-album").click(function() {
		CMS.submitButton("gallery-album", "save-new");
	});
	// Save and close album clicks
	$("#toolbar-save-close-album, #action-save-close-album").click(function() {
		selectNavItem("#galleries-link", "#new-album-link");
		CMS.submitButton("gallery-album", "save-close");
	});
	// Close the album editor clicks
	$("#toolbar-close-album, #action-close-album").click(function() {
		selectNavItem("#galleries-link", "#new-album-link");
		window.location.href = HTTP_ADMIN + "photogallery";
	});
	// Edit image clicks.
	$("#toolbar-edit, #action-edit-image").click(function() {
		if(typeof(boxesChecked) === "undefined" || boxesChecked == 0) {
			alert(noAlbumAlert);
		} else {
			selectNavItem("#new-album-link", "#galleries-link");
			CMS.submitButton('gallery-image', 'edit');
		}
	});
	// Publish image clicks.
	$("#toolbar-publish-image, #action-publish-image").click(function() {
		if(typeof(boxesChecked) === "undefined" || boxesChecked == 0) {
			alert(noImageAlert);
		} else {
			CMS.submitButton('gallery-image', 'publish');
		}
	});
	// Unpublish image clicks.
	$("#toolbar-unpublish-image, #action-unpublish-image").click(function() {
		if(typeof(boxesChecked) === "undefined" || boxesChecked == 0) {
			alert(noImageAlert);
		} else {
			CMS.submitButton('gallery-image', 'unpublish');
		}
	});
	// Feature image clicks.
	$("#toolbar-feature-image, #action-feature-image").click(function() {
		if(typeof(boxesChecked) === "undefined" || boxesChecked == 0) {
			alert(noImageAlert);
		} else {
			CMS.submitButton('gallery-image', 'featured');
		}
	});
	// Remove feature image clicks.
    $("#toolbar-nofeature-image, #action-nofeature-image").click(function() {
		if(typeof(boxesChecked) === "undefined" || boxesChecked == 0) {
			alert(noImageAlert);
		} else {
			CMS.submitButton('gallery-image', 'remove-featured');
		}
	});
	// Delete image clicks.
	$(document).on("click", "#toolbar-delete-album-image, #action-delete-image", function(e) {
		if(typeof(boxesChecked) === "undefined" || boxesChecked == 0) {
			alert(noImageAlert);
		} else {
			CMS.submitButton('gallery-image', 'delete');
		}
	});
	// Publish image button clicks.
	$(".publish-image-content").click(function() {
		$("#image-state").val(1);
		CMS.submitButton("gallery-image", "save-close");
	});
	// Save image clicks
	$("#toolbar-save-image, #action-save-image").click(function() {
		CMS.submitButton("gallery-image", "save");
	});
	// Close the image editor clicks
	$("#toolbar-close-image, #action-close-image").click(function() {
		selectNavItem("#galleries-link", "#new-album-link");
		window.location.href = HTTP_ADMIN + "photogallery";
	});

	// Delete album image
	if($("#delete-album-img").length !== 0) {

		// Disable image delete if no image present.
		if($("#album-image").children().length === 0) {
			$("#delete-album-img").button("disable");
		}

		// Delete image button clicks
		$("#delete-album-img").click(function(e) {
			e.preventDefault();
			$.ajax({
				type     : "POST",
				url      : HTTP_ADMIN + "photogallery",
				datatype : "json",
				data     : "adminRequest=" + encodeURIComponent(JSON.stringify({
					type               : "gallery",
					action             : "delete-album-image",
					id                 : $("#id").val(),
					image              : $("#image").val(),
					imagePath          : $("#album-img-path").val(),
					csrfToken          : $("#csrf-token").val()
				})),
				success: function(data, textStatus, jqXHR) {
					var response = JSON.parse(data);
					if(typeof(response.success) !== "undefined" && response.success) {
						$("#image").val("");
						$("#image-path").val("");
						$("#image-alt").val("");
						$("#album-image").text("No Image Uploaded");
						$("#delete-album-img").button("disable");
					}
				}
			});
		});
	}

	// Image uploader
	if($("#upload-album-img").length !== 0) {
		// Window load function for the plupload uploader. Will throw an error if loaded in the document.ready function.
		$(window).load(function() {

			var lastUploadedImg; // Keep track of the last image uploaded. Will delete it on following uploads.

			// Plupload for image
			uploader = new plupload.Uploader({
				runtimes : 'html5,flash,silverlight,browserplus,html4',
				browse_button : 'upload-album-img',
				url : HTTP_ADMIN + 'photogallery?adminRequest={"type":"gallery","action":"upload-album-image"}&csrfToken=' + $('#csrf-token').val(),
				flash_swf_url : HTTP_ADMIN_DIR + 'view/js/plupload/js/plupload.flash.swf',
				silverlight_xap_url : HTTP_ADMIN_DIR + 'view/js/plupload/js/plupload.silverlight.xap',
				filters : [
					{title : "Image files", extensions : "jpg,jpeg,gif,png"}
				]
			});

			uploader.bind('Init', function(up, params) {
				$("#upload-img-info").html("");
			});

			uploader.init();

			uploader.bind('FilesAdded', function(up, files) {

				adminReq = {
					type       : "gallery",
					action     : "upload-album-image",
					id         : $("#id").val(),
					template   : $("#template").val(),
					image      : $("#image").val(),
					imagePath  : $("#album-img-path").val(),
					width      : $("#album-img-width").val(),
					height     : $("#album-img-height").val(),
					lastUpload : lastUploadedImg
				}

				if($("#id").length !== 0) {
					adminReq.id = $("#id").val();
				}

				adminReq = JSON.stringify(adminReq);

				// Set the URL of the controller and build the adminReqObj for parsing by the backend.
				up.settings.url = HTTP_ADMIN + 'photogallery?adminRequest=' + adminReq + '&csrfToken=' + $('#csrf-token').val(),
				$.each(files, function(i, file) {
					$('#upload-img-info').append(
						'<div id="' + file.id + '">' +
							file.name + ' (' + plupload.formatSize(file.size) + ') <strong></strong>' +
						'</div>');
				});

				uploader.start();

				up.refresh(); // Reposition Flash/Silverlight
			});

			uploader.bind('UploadProgress', function(up, file) {
				$('#' + file.id + " strong").html(file.percent + "%");
			});

			uploader.bind('Error', function(up, err) {
				$('#upload-img-info').append(
					'<div class="error">' +
						'Error: ' + err.message +
					'</div>'
				);

				up.refresh(); // Reposition Flash/Silverlight
			});

			uploader.bind('FileUploaded', function(up, file, info) {
				var response = JSON.parse(info.response);

				// Show 100% completion
				$("#" + file.id + " strong").html("100%");

				window.setTimeout(function() {
					$("#" + file.id).fadeOut(5000, function() {
						$(this).remove();
					});
				}, 15000);

				// Set the URL for the last uploaded image. Will be sent to the server on following uploads for deletion.
				if(typeof(response.imageURL) !== "undefined") {
					// Update image
					window.setTimeout(function() {
						$("#album-image").html(
							'<a href="' + response.imageURL + '" target="_blank">' +
								'<img id="album-image" class="profile-image" src="' + response.imageURL + '" alt="Uploaded Album Image" target="_blank" />' +
							'</a>'
						);
					}, 10);
				}

				$("#album-img").val(response.fileName);
				$("#album-img-path").val(response.imagePath);

				lastUploadedImg = response.imagePath;
				// Clear out the width and height
				// Enable image delete button.
				$("#delete-album-img").button("enable");

				//console.log(file);
			});
		});
	}

	// Uploading image to an album.
	if($("#plupload-browser-button").length !== 0) {
		$(function() {
			var uploader = new plupload.Uploader({
				runtimes            : 'html5,gears,flash,silverlight,browserplus,html4',
				container           : 'plupload-container',
				browse_button       : 'plupload-browser-button',
				max_file_size       : '1000mb',
				url                 : HTTP_ADMIN + 'photogallery',
				flash_swf_url       : HTTP_ADMIN_DIR + 'view/js/plupload/js/plupload.flash.swf',
				silverlight_xap_url : HTTP_ADMIN_DIR + 'view/js/plupload/js/plupload.silverlight.xap',
				drop_element        : 'drag-drop-area',
				chunk_size          : '8mb',
				filters             : [
					{
						title : "Allowed Extensions",
						extensions : "jpg,jpeg,png,gif"
					}
				],
			});

			uploader.bind('Init', function(up, params) {
				//$('#filelist').html("<div>Current runtime: " + params.runtime + "</div>");
			});

			uploader.init();

			uploader.bind('FilesAdded', function(up, files) {

				var adminReq = JSON.stringify({
					type       : 'gallery',
					action     : 'upload-images',
					albumId    : $("#album-id").val(),
					albumAlias : $("#album-alias").val()
				});


				up.settings.url = HTTP_ADMIN + 'photogallery?adminRequest=' + adminReq + '&csrfToken=' + $('#csrf-token').val();

				$.each(files, function(i, file) {
					var ext = getFileExtension(file.name);
					file.extensionIcon = getExtensionIcon(ext, 32);
					$('#media-uploads').append(
						'<div id="' + file.id + '" class="media-upload">' +
							'<div id="icon-' + file.id + '" class="' + file.extensionIcon + ' media-file-icon media-file-spacing"></div>' +
							'<div class="media-upload-file">' + file.name + ' (' + plupload.formatSize(file.size) + ') <b></b></div>' +
							'<div id="progressbar-' + file.id + '" class="progressbar"></div>' +
						'</div>' +
						'<table id="media-profile-' + file.id + '" class="media-profile media-details" style="display: none;">' +
							'<thead>' +
								'<tr>' +
									'<td id="media-data-' + file.id + '" colspan="2"></td>' +
								'</tr>' +
							'</thead>' +
							'<tbody id="media-body-' + file.id + '" style="display: none;">' +

							'</tbody>' +
						'</table>');
					uploader.start();
				});
				up.refresh(); // Reposition Flash/Silverlight
			});

			uploader.bind('BeforeUpload', function (up, file) {
				if(!$("#media-uploads").is(":visible")) {
					$("#media-uploads").show();
				}
			});

			uploader.bind('UploadProgress', function(up, file) {
				$(function() {
					$( "#progressbar-" + file.id ).progressbar({
						value: file.percent
					}).children('.ui-progressbar-value')
					  .html('<div class="progressbar-value">' + file.percent.toPrecision(3) + '%</div>')
					  .css("display", "block")
				});
				$('#' + file.id).addClass('media-upload');
				$('#progressbar-' + file.id).append('<div>' + file.percent + '%</div>');
			});

			uploader.bind('Error', function(up, err) {
				$('#media-uploads').append(
					'<div class="media-upload errors">' +
						'<div class="media-upload-file">' +
							'<span class="ui-icon ui-icon-alert fltlft"></span>' +
							'<span class="media-error-txt">Error: ' + err.message  + (err.file ? " File: " + err.file.name : "") + '</span>' +
						'</div>' +
					'</div>'
				);
				if(!$("#media-uploads").is(":visible")) {
					$("#media-uploads").show();
				}
			});

			uploader.bind('FileUploaded', function(up, file, info) {
				var response, ext = getFileExtension(file.name);
				response = JSON.parse(info.response);
				if(response.image !== false) {
					// Make the extension icon the thumbnail using maxWidth an maxHeight to resize.
					$('#icon-' + file.id).removeClass(file.extensionIcon).removeClass('media-file-icon').append(
						'<img src="' + HTTP_GALLERY + response.fileName + '" class="smallnail" />'
					);
					previewIcon = '';
				}
				$('#' + file.id).addClass('media-upload');
				function addDetails() {
					$('#progressbar-' + file.id).remove();
					$('#' + file.id).append(
						'<a id="toggle-' + response.id + '" class="details-toggle">Show</a>'
					);
					//
					// Switch the file id to the main id, hackish but fuck it.
					$("#media-body-" + file.id).prop("id", "media-body-" + response.id);
					$("#media-profile-" + file.id).prop("id", "media-profile-" + response.id);
					$("#media-attribs-" + file.id).prop("id", "media-attribs-" + response.id);
					$("#" + file.id).prop("id", "file-" + response.id);
					//

					$('#media-body-' + response.id).append(
						'<tr id="media-properties-' + response.id + '" class="media-properties">' +
							'<td id="preview-thumb-container-' + response.id + '" class="media-attribs preview-thumb-container">' +
								'<p class="media-details-icon ' + previewIcon + '"></p>' +
							'</td>' +
							'<td id="media-attribs-' + response.id + '" class="media-attribs media-attribs-container">' +
								'<p><strong>File name:</strong> ' + file.name + '</p>' +
								'<p><strong>Mime type:</strong> ' + response.imageType + '</p>' +
								'<p><strong>Upload date:</strong>' + response.uploadDate + '</p>' +
							'</td>' +
						'</tr>' +
						'<tr>' +
							'<td colspan="2">&nbsp;</td>' +
						'</tr>'
					);
					$("#media-profile-" + response.id).after(
						'<table id="media-meta-' + response.id + '" class="media-meta media-details" style="display: none;">' +
							'<tr id="media-title-' + response.id + '">' +
									'<th>' +
										'<label for="uploads[][title]">Title</label>' +
									'</th>' +
									'<td class="media-inputs">' +
										'<input type="hidden" name="uploads[' + response.id + '][id]" value="' + response.id + '" />' +
										'<input type="text" id="uploads[' + response.id + '][title]" class="media-field" name="uploads[' + response.id + '][title]" value="' + response.imageTitle + '" />' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<th>' +
										'<label for="uploads[' + response.id + '][caption]">Caption</label>' +
									'</th>' +
									'<td class="media-inputs">' +
										'<input type="text" id="uploads[' + response.id + '][caption]" class="media-field" name="uploads[' + response.id + '][caption]" />' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<th>' +
										'<label for="uploads[' + response.id + '][description]">Description</label>' +
									'</th>' +
									'<td class="media-inputs">' +
										'<textarea id="uploads[' + response.id + '][description]" class="media-field" name="uploads[' + response.id + '][description]"></textarea>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<th>' +
										'<label for="uploads[' + response.id + '][url]">Location</label>' +
									'</th>' +
									'<td class="media-inputs">' +
										'<input type="text" id="uploads[' + response.id + '][url]" class="media-field" name="uploads[' + response.id + '][url]" readonly="readonly" value="' + response.imageUrl + '" />' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td></td>' +
									'<td>' +
										'<a id="delete-' + response.id + '" class="delete-media" href="#">Delete</a>' +
									'</td>' +
								'</tr>' +
							'</table>'
					);
					$('#media-attribs-' + response.id).append(
						'<p><strong>Dimensions:</strong>' + response.imageSize + '</p>'
					);
					$('#preview-thumb-container-' + response.id).empty().append('<img id="preview-thumb-' + response.id + '" src="' + response.thumbUrl +'" class="media-image-icon" />');
					$('#media-title-' + response.id).after(
						'<tr>' +
							'<th>' +
								'<label for="uploads[' + response.id + '][alt]">Alternate text</label>' +
							'</th>' +
							'<td>' +
								'<input type="text" id="uploads[' + response.id + '][alt]" class="media-field" name="uploads[' + response.id + '][alt]" />' +
							'</td>' +
						'</tr>'
					);
					$("#album-images-sortable").append(
						'<li id="photoList_' + response.id + '">' +
							'<a href="' + HTTP_GALLERY + response.fileName + '">' +
								'<img alt="" src="' + HTTP_GALLERY + 'admin-thumb-' + response.fileName + '" class="handle photo_thumbs">' +
							'</a>' +
							'<input type="checkbox" class="overview-check fltlft" value="' + response.id + '" name="imageCheck[]" id="cb-' + response.order + '" class="fltlft">' +
							'<span id="state' + response.id + '" class="fltlft icon-20-spacing">' +
								'<span id="state-' + response.id + '" class="icon-20-check icon-20-spacing fltlft"> </span>' +
							'</span>' +
							'<span id="featured-' + response.id + '" class="fltlft icon-20-spacing">' +
								'<span class="icon-20-gray-disabled icon-20-spacing fltlft"> </span>' +
							'</span>' +
						'</li>'
					);

					$(".save-image").button({ disabled: true });
				}
				window.setTimeout(addDetails, 1000);
			});
			uploader.bind('UploadComplete', function(up, file, info) {
				$(":button:contains('Submit Changes')").removeProp("disabled").prop('name', 'submitImageUploads').removeClass("ui-state-disabled");
			});
		});
	}
});


