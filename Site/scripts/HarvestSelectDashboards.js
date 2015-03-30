﻿if (!_key) { var _key = supports_html5_storage() ? localStorage['CT_key'] : readRemember('CT_key'); }

var userID = supports_html5_storage() ? localStorage['CTuserID'] : readRemember('CTuserID');
if (!data) { var data; }
$.support.cors = true;
$.ajaxSetup({ contentType: 'application/json; charset=utf-8', data: data, error: function () { hideProgress(); alert("Error contacting the server."); }, statusCode: { 400: function (msg) { hideProgress(); alert("Oops... Something went wrong!"); console.log(msg); }, 404: function (msg) { if (msg.responseJSON == "validation failed") { hideProgress(); alert("Validation failed. Please login again."); window.location.href = "login.html"; } else { hideProgress(); alert("Oops - there was an error..."); /*window.location.href = "login.html";*/ } }, 500: function () { hideProgress(); alert("AJAX FAIL: 500 Internal Server Error"); } } });
// TODO: how to handle 500/AJAX fail errors?


$(function(){
	if($('.login').length>0) login();
	if($('.farm-yields').length>0) farmYields();
	if($('.shift-end').length>0) shiftEnd();
});

/* Login page */
function login() {
	$('.login form div, .login form button').hide();
	$('.login form #user').fadeIn(250);
	$('#user input').unbind().focus(function(){
		$('#user').removeClass('has-success, has-error');
		$('#user .help-block').hide();
	});
	$('#user input').unbind().focusout(function(){
		if($(this).val() != '') {
			$('#pass').fadeIn(250);
			$('#user').addClass('has-success');
		} else {
			$('#user').addClass('has-error');
			$('#user .help-block').show();
		}
	});
	$('#pass input').unbind().focus(function(){
		$('#pass').removeClass('has-success, has-error');
		$('#pass .help-block').hide();
	});
	$('#pass input').unbind().focusout(function(){
		if($(this).val() != '') {
			$('#remember, #login').fadeIn(250);
			$('#pass').addClass('has-success');
		} else {
			$('#pass').addClass('has-error');
			$('#pass .help-block').show();
		}
	});
	
	rememberCheck();
    var passbox = $('#password'), userbox = $('#username');
    // LOGIN / KEY CHECK
    // Cookie is created to keep user/pass filled until browser is closed OR permanently if the checkbox is checked.
    // User Roles are added as classes to the BODY tag; elements are hidden appropriately through CSS.
    $('#login').unbind().click(function(e) {
        e.preventDefault();
        var username = $(userbox).val(), password = $(passbox).val(), dto = { "UserName": username, "Password": password }, data = JSON.stringify(dto);
		showProgress('body');
		$.ajax('../api/Login/ValidateLogin', {
			type: 'POST', data: data,
			statusCode: {
				200: function (msg) {
					$('#username, #password').val(""); /* startTimer(msg.Key); */ localStorage['CT_key'] = msg.Key; var userRoles = "", userID = msg.UserID, companyID = msg.CompanyId; for (var i = 0; i < msg.UserRoles.length; i++) { userRoles += msg.UserRoles[i].RoleDescription + " "; } if (supports_html5_storage()) { localStorage['CTuser'] = username; localStorage['CTpass'] = password; localStorage['CTuserRole'] = userRoles; localStorage['CTuserID'] = userID; localStorage['CTcompanyID'] = companyID; if ($('#rememberMe').is(':checked')) { localStorage['CTremember'] = true } else { localStorage['CTremember'] = false; } } else { createRemember('CTuser', username); createRemember('CTpass', password); createRemember('CTuserRole', userRoles); createRemember('CTuserID', userID); createRemember('CT_key', _key); createRemember('CT_company', companyID); }
					window.location.href = "index.html";
				}, 404: function () {
					$.when(hideProgress('login')).then(function () { alert("Invalid login credentials: " + username + ":" + password + ". Please enter your information again."); });
				}, 405: function () {
				}, 500: function (msg) {
					hideProgress('login'); if (supports_html5_storage()) { localStorage['CTuser'] = username; localStorage['CTpass'] = password; } else { createRemember('CTuser', username); createRemember('CTpass', password); } alert("Server error. Please notify support. (" + msg.responseJSON.ExceptionMessage + ")"); console.log(msg);
				}
			}
		});
    });
}

//logout
function logoutControls() { $('#logoutButton').unbind().click(function () { if (supports_html5_storage()) { if (localStorage['CTremember']=="false") { localStorage['CTuser'] = ""; localStorage['CTpass'] = ""; } } _key = ""; if (supports_html5_storage()) { localStorage['CTuserRole'] = ""; localStorage['CTuserID'] = ""; localStorage['CT_key'] = _key; } else { createRemember('CTuserRole', ""); createRemember('CTuserID', ""); createRemember('CT_key', _key); } window.location.href = "login.html"; }); }

// COOKIES - SET AND READ; for temp or (if "remember me" is checked) permanent memory of login info)
// Only use cookies if browser doesn't support localStorage
function supports_html5_storage() { try { return 'localStorage' in window && window['localStorage'] !== null; } catch (e) { return false; } }

// Key check for security/validation
function checkKey() { if (!_key) { alert("Session key is undefined; please log in."); window.location.href = "login.html"; } }

function refreshKey(username, password) { dto = { "UserName": username, "Password": password }, data = JSON.stringify(dto); $.ajax('../api/Login/ValidateLogin', { type: 'POST', data: data, statusCode: { 200: function (msg) { _key = msg.Key; localStorage['CT_key'] = msg.Key; var userRoles = "", userID = msg.UserID; for (var i = 0; i < msg.UserRoles.length; i++) { userRoles += msg.UserRoles[i].RoleDescription; } if (!supports_html5_storage()) { createRemember('CT_key', _key); } hideProgress(); /* startTimer(_key); */ } }, 404: function () { hideProgress(); alert('Your user credentials are not recognized. Please login again.'); window.location.href = "login.html"; }, 500: function (msg) { $.when(hideProgress()).then(function () { alert("Server error. Please notify support. (" + msg.responseJSON.ExceptionMessage + ")"); window.location.href = "login.html"; console.log(msg); }); } }); }

// Cookie check (for 'remember me' box)
function rememberCheck() { var u = supports_html5_storage() ? localStorage['CTuser'] : readRemember('CTuser'), p = supports_html5_storage() ? localStorage['CTpass'] : readRemember('CTpass'); if (u && p) { $('#username').val(u); $('#password').val(p); $('#rememberMe').attr('checked', true); } }

function createRemember(name, value) { var expires = ";expires=0"; if ($('#rememberMe').is(':checked')) { var date = new Date(); date.setTime(date.getTime() + (31 * 24 * 60 * 60 * 1000)); var expires = ";expires=" + date.toGMTString(); } document.cookie = name + "=" + value + expires; }

function readRemember(name) { var nameEQ = name + "=", ca = document.cookie.split(';'); for(var i=0;i < ca.length;i++) { var c = ca[i]; while (c.charAt(0)==' ') c = c.substring(1,c.length); if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length); } return null; }

// CONTROLS THE 'progress' BALL ANIMATION
function showProgress(targetElement, classIdentifier) { var bgElement = "#lightboxBG." + classIdentifier, layer = '<div class="windows8" id="progressBar"><div class="wBall" id="wBall_1"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_2"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_3"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_4"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_5"><div class="wInnerBall"></div></div></div><div class="modal ' + classIdentifier + '" id="lightboxBG"></div>'; $(targetElement).css('position', 'relative').prepend(layer); centerProgress(targetElement); $('#progressBar').fadeIn(50); $(bgElement).fadeIn(50); }

function hideProgress(classIdentifier) { var bgElement = "#lightboxBG." + classIdentifier; $(bgElement).fadeOut(100); $('#progressBar').fadeOut(100, function () { $('#progressBar').remove(); $(bgElement).remove(); }); }

function centerProgress(container) { if (container == 'body') { container = window }; var containerHeight = $(container).innerHeight(), containerWidth = $(container).innerWidth(), modalHeight = $('#progressBar').innerHeight(), modalWidth = $('#progressBar').innerWidth(); var modalTop = (containerHeight - modalHeight) / 2, modalLeft = (containerWidth - modalWidth) / 2; $('#progressBar').css({ 'top': modalTop, 'left': modalLeft }); }

/* FARM YIELDS */
function farmYields() {
	var i=1;
	bindYieldButtons();
	
	function bindYieldButtons() {
		$('.data .add-row').unbind().click(function(e){
			e.preventDefault();
			// TO DO: add validation
			$(this).parent().parent().addClass('complete');
			
			var newRowHtml = '<section class="row row'+i+' data"><div class="col-xs-4"><select id="farms'+i+'"><option>(Farm)</option><option>Inverness</option></select></div><div class="col-xs-3"><select id="ponds'+i+'"><option>(Pond)</option><option>I-1</option></select></div><div class="col-xs-3"><input placeholder="(Pounds)" id="pounds'+i+'"></div><div class="col-xs-1"><a href="#" class="delete-row"><img src="img/close.png"></a></div><div class="col-xs-1"><a href="#" class="add-row"><img src="img/plus.png"></a></div></section>';
			
			$('#rowContainer').append(newRowHtml);
			i=i++;
			bindYieldButtons();
		});
	
		$('.data .delete-row').unbind().click(function(e){
			e.preventDefault();
			// TO DO: prevent removing sole empty row or replace with empty row
			$(this).parent().parent().remove();
			if(!$('.data').length>0) {
				// TO DO: need to call farmDDL, pondDDL and insert into code - before? After?
				var newRowHtml = '<section class="row row0 data"><div class="col-xs-4"><select id="farms0"><option>(Farm)</option><option>Inverness</option></select></div><div class="col-xs-3"><select id="ponds0"><option>(Pond)</option><option>I-1</option></select></div><div class="col-xs-3"><input placeholder="(Pounds)" id="pounds0"></div><div class="col-xs-1"><a href="#" class="delete-row"><img src="img/close.png"></a></div><div class="col-xs-1"><a href="#" class="add-row"><img src="img/plus.png"></a></div></section>';
			
				$('#rowContainer').append(newRowHtml);
				i = 1;
				bindYieldButtons();
			}
		})
	}
}

/* SHIFT END */
function shiftEnd() {
	
}