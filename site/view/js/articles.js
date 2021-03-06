$(document).ready(function() {

	// Buttonize
	$("#submit-comment, .submit-reply, .cancel-reply").button();

	
	$(".cancel-reply").click(function(e) {
		e.preventDefault();
		var commentId = this.id.replace("cancel-reply-", "");
		$("#comment-reply-" + commentId).slideToggle("slow");
	});
	
	// Show flag on hover.
	$('.comment').hover(function() {
		var commentId = this.id.replace('comment-', '');
		$('#comment-flag-' + commentId).stop(true, true).show();
	}, function() {
		var commentId = this.id.replace('comment-', '');
		$('#comment-flag-' + commentId).stop(true, true).hide();
	});
	
	// Flag comment.
	$('.comment-flag').click(function() {
		var commentId = this.id.replace('comment-flag-', '');
		$.ajax({
			type:       "POST",
			url:        HTTP_SERVER + 'articles',
			datatype:   'json',
			data:       'appRequest=' + encodeURIComponent(JSON.stringify({
				type      : 'article',
				action    : 'flagComment',
				commentId : commentId,
				csrfToken : $("#formkey-" + commentId).val()
			})),
			success:     function(data, textStatus, jqXHR) {
				response = JSON.parse(data);
				// Change the flag status
				if(response.flagged) {
					$("#comment-flag-" + response.commentId).html("You have flagged this comment.");
				} else if(response.removeFlagged) {
					$("#comment-flag-" + response.commentId).html("Flag");
				}
			}
		});
	});

	// Likes
	$(".comment-likeit").click(function() {
		var commentId = this.id.replace("comment-like-", "");
		$.ajax({
			type:       "POST",
			url:        HTTP_SERVER + "articles",
			datatype:   'json',
			data:       "appRequest=" + encodeURIComponent(JSON.stringify({
				type      : "article",
				action    : "likeComment",
				commentId : commentId,
				csrfToken : $("#formkey-" + commentId).val()
			})),
			success:    function(data, textStatus, jqXHR) {
				response = JSON.parse(data);
				// Update the number of likes field with correct number of likes.
				if(response.numOfLikes == 1) {
					$("#comment-likes-" + response.commentId).html(response.numOfLikes + " person liked this.");
				} else if(response.numOfLikes > 1) {
					$("#comment-likes-" + response.commentId).html(response.numOfLikes + " people liked this.");
				} else {
					$("#comment-likes-" + response.commentId).html("");
				}
				// Change the like option to liked or vice versa.
				if(response.liked) {
					$("#comment-like-" + response.commentId).html("Liked");
					$('#comment-thumbup-' + response.commentId).toggle();
				} else if(response.removeLiked) {
					$("#comment-like-" + response.commentId).html("Like");
					$("#comment-thumbup-" + response.commentId).toggle();
				}
			}
		});
	});
	
	// Build comment reply dialog
	$("#reply-dialog").dialog({
		autoOpen: false,
		width: 565,
		height: 550,
		bgiframe: true,
		modal: true,
		draggable: true,
		resizable: true,
		open: function() {

		},
		close : function() {

		},
		buttons: [
			{
				id: "submit-reply",
				class: "rb-btn blue-btn",
				name: "submitReply",
				text: "Submit Reply",
				type: "submit",
				click: function() {
					$("#reply-form").submit();
				}
			},
			
			{
				id: "cancel-reply",
				class: "rb-btn light-gray-btn",
				text: "Cancel",
				class: "rb-btn light-gray-btn",
				click: function(e) {
					e.preventDefault(); 
					$(this).dialog("close");
				}
			}
		]
	});
	
	// Replies
	$('.comment-reply').click(function() {
		var commentId = this.id.replace('comment-replyto-', '');
		$("#reply-comment-id").val(commentId);
		$("#reply-author").text($("#comment-author-" + commentId).val());
		
		$("#reply-dialog").dialog("option", "title", "Comment Reply");
		
		$("#reply-dialog").dialog("open");
	});
	
	$('.reply-cancel').click(function() {
		var commentId = this.id.replace('reply-cancel-', '');
		$("#reply-dialog").dialog("close");
	});

	
	// Load more entries click.
	$("#load-more-entries").on("click", function(e) {
		e.preventDefault();
		
		var trimText;
		
		// Check if there are more entries to load if so send an ajax call to the server and append the next set.
		if(offset < totalNumOfEntries) {
			$.ajax({
				type: "POST",
				url: HTTP_SERVER,
				datatype: "json",
				data: "appRequest=" + encodeURIComponent(JSON.stringify({
					type               : "article",
					action             : "load-articles",
					limit              : limit,
					offset             : offset,
					category           : 'news',
					trimText           : trimText,
					csrfToken          : $("#csrf-token").val()
				})),
				success: function(data, textStatus, jqXHR) {
					var response = JSON.parse(data);
					
					var article, articleBtm, datePosted, dateParts, scrollPos, x;
					
					// Iterate through the set of articles and append them.
					// The bottom of portion of the articles is appended afterwards after determiing whether or not comments have been disabled.
					
					scrollPos = $(window).scrollTop();
					
					for(x = 0; x < response.articles.length; x++) {
						
						article = $(
							'<div class="index-tertiary-article index-articles">' +
								'<div class="inner">' +
									'<div class="article-image">' +
										'<a href="#">' +
											'<img src="' + HTTP_IMAGE + 'articles/' + response.articles[x].image + '" alt="' + response.articles[x].image_alt + '" />' +
										'</a>' +
									'</div>' +
									'<div class="article clearfix">' +
										'<div class="article-title">' +
											'<h2>' +
												'<a href="' + HTTP_SERVER + 'article/' + response.articles[x].alias + '">' +
													response.articles[x].title +
												'</a>' +
											'</h2>' +
										'</div>' +
										'<div class="article-author">' +
											'<p>Written By: ' + response.articles[x].article_username + ' | ' + response.articles[x].month + ' ' + response.articles[x].day + ', ' + response.articles[x].year + '</p>' +
										'</div>' +
										'<div class="content">' +
											response.articles[x].summary +
										'</div>' +
										'<div id="article-bottom-' + response.articles[x].id + '" class="article-bottom">' +

										'</div>' +
									'</div>' +
								'</div>' +
							'</div>'
						).hide().delay(300 * x).fadeIn(2000);
						
						if(response.articles[x].allow_comments == 1) {
							articleBtm = $(
								'<div class="bottom_comment_number">' +
									'<a href="' + HTTP_SERVER + "article/" + response.articles[x].alias + '#comments">' +
										'Comments (' + response.articles[x].num_of_comments + ')' +
									'</a>' +
									'<span class="bottom-separator"> | </span>' +
									'<span>' +
										'<a title="Leave a Comment" href="' + HTTP_SERVER + "article/" + response.articles[x].alias + '#leave-a-comment">' +
											'Leave a Comment' +
										'</a>' +
									'</span>' +
								'</div>'
							).hide().fadeIn(2000);
						} else if(!response.articles[x].allow_comments) {
							articleBtm = $(
								'<div>' +
									'<p class="comments-disabled">Comments Disabled</p>' +
								'</div>'
							).hide().fadeIn(2000);
						}
						
						$("#article-main").append(article);
						$("#article-bottom-" + response.articles[x].id).append(articleBtm);

						
						// Maintains our scroll position on load, only works with a micro timeout so keep this if don't want the page to scroll.
						window.setTimeout(function() {
							$(window).scrollTop(scrollPos);
						}, 30);
					}
					// Increment the offset.
					offset = offset + limit;
					
					if(totalNumOfEntries < offset) {
						$("#load-more-entries").fadeOut(1000);
					}
				}
			});
		}
	});
});
