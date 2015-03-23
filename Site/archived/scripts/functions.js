if (!_key) { var _key = supports_html5_storage() ? localStorage['CT_key'] : readRemember('CT_key'); }

var userID = supports_html5_storage() ? localStorage['CTuserID'] : readRemember('CTuserID');
if (!data) { var data; }
$.support.cors = true;
$.ajaxSetup({ contentType: 'application/json; charset=utf-8', data: data, error: function () { hideProgress(); alertError("Error contacting the server."); }, statusCode: { 400: function (msg) { hideProgress(); alertError("Oops... Something went wrong!"); console.log(msg); }, 404: function (msg) { if (msg.responseJSON == "validation failed") { hideProgress(); alertError("Validation failed. Please login again."); window.location.href = "login.html"; } else { hideProgress(); alertError("Oops - there was an error..."); /*window.location.href = "login.html";*/ } }, 500: function () { hideProgress(); alertError("AJAX FAIL: 500 Internal Server Error"); } } });
// TODO: how to handle 500/AJAX fail errors?

$(function(){
    $.when( pageLabel() ).then(function () {
        if ($('body').hasClass('login')) {
            loginControls();
        } else {
            var u = localStorage['CTuser'], p = localStorage['CTpass'];
            $.when(refreshKey(u, p)).then(function () {
                logoutControls();
                if ($('#changeFarm').length) loadFarmsDDL(userID);
                userNameFill();
                $('body > footer').load('footer.html', function () { $('body > footer').addClass(supports_html5_storage() ? localStorage['CTuserRole'] : readRemember('CTuserRole')) });
            });
        }
    });
});

function loginControls() {
    rememberCheck();
    var passbox = $('#password'), userbox = $('#username');
    $(passbox, userbox).unbind().focus(function(){ $(passbox, userbox).removeAttr('style'); });
    // LOGIN / KEY CHECK
    // Cookie is created to keep user/pass filled until browser is closed OR permanently if the checkbox is checked.
    // User Roles are added as classes to the BODY tag; elements are hidden appropriately through CSS.
    $('#submitLogin').unbind().click(function(e) {
        e.preventDefault();
        var username = $(userbox).val(), password = $(passbox).val(), dto = { "UserName": username, "Password": password }, data = JSON.stringify(dto);
        if(username=='' || password==''){
            if(username == '') { $(userbox).css('border-color', '#b32c31'); errorMsg += '<p>Username cannot be empty</p>'; }
            if(password == '') { $(passbox).css('border-color', '#b32c31'); errorMsg += '<p>Password cannot be empty</p>'; }
            if(errorMsg != '') alertError(errorMsg);
        } else {
            showProgress('#main_content > form', 'login');
            $.ajax('../api/Login/ValidateLogin', {
                type: 'POST', data: data,
                statusCode: {
                    200: function (msg) {
                        $('#username, #password').val(""); startTimer(msg.Key); localStorage['CT_key'] = msg.Key; var userRoles = "", userID = msg.UserID, companyID = msg.CompanyId; for (var i = 0; i < msg.UserRoles.length; i++) { userRoles += msg.UserRoles[i].RoleDescription + " "; } if (supports_html5_storage()) { localStorage['CTuser'] = username; localStorage['CTpass'] = password; localStorage['CTuserRole'] = userRoles; localStorage['CTuserID'] = userID; localStorage['CTcompanyID'] = companyID; if ($('#rememberMe').is(':checked')) { localStorage['CTremember'] = true } else { localStorage['CTremember'] = false; } } else { createRemember('CTuser', username); createRemember('CTpass', password); createRemember('CTuserRole', userRoles); createRemember('CTuserID', userID); createRemember('CT_key', _key); createRemember('CT_company', companyID); }
                        if (userRoles.indexOf('Admin') > -1) {
                            window.location.href = "admin-setup.html";
                        } else if (userRoles.indexOf('SGAdmin') > -1) {
                            window.location.href = "admin-setup.html";
                        } else if (userRoles.length < 1) {
                            alertError("Your user permissions are not defined. Please contact your manager.");
                        } else {
                            alertError("Your user permissions are not properly defined. Please contact your manager.");
                        }
                        //hideProgress('login');
                    }, 404: function () {
                        $.when(hideProgress('login')).then(function () { alertError("Invalid login credentials: " + username + ":" + password + ". Please enter your information again."); });
                    }, 405: function () {
                    }, 500: function (msg) {
                        hideProgress('login'); if (supports_html5_storage()) { localStorage['CTuser'] = username; localStorage['CTpass'] = password; } else { createRemember('CTuser', username); createRemember('CTpass', password); } alertError("Server error. Please notify support. (" + msg.responseJSON.ExceptionMessage + ")"); console.log(msg);
                    }
                }
            });
        }
    });
}

//logout
function logoutControls() { $('#logoutButton').unbind().click(function () { if (supports_html5_storage()) { if (localStorage['CTremember']=="false") { localStorage['CTuser'] = ""; localStorage['CTpass'] = ""; } } _key = ""; if (supports_html5_storage()) { localStorage['CTuserRole'] = ""; localStorage['CTuserID'] = ""; localStorage['CT_key'] = _key; } else { createRemember('CTuserRole', ""); createRemember('CTuserID', ""); createRemember('CT_key', _key); } window.location.href = "login.html"; }); }

// Fill in username on nav area
function userNameFill() { var userName = supports_html5_storage() ? localStorage['CTuser'] : readRemember('CTuser'); $('#userName').text(userName); }




function numberCommas(x) { return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

function alertError(errorMsg) { $('#alertMessage').html(errorMsg); $('body').append('<div id="lightboxBG" class="modal"></div>'); $('#alertBox, #lightboxBG').fadeIn('100', function(){ centerModal('#alertBox'); }); $('#closeAlert').unbind().click(function(e){ errorMsg = ""; $('#alertMessage').empty(); $('#alertBox, #lightboxBG').fadeOut('100'); $('#lightboxBG').remove(); }); }

// Key check for security/validation
function checkKey() { if (!_key) { alertError("Session key is undefined; please log in."); window.location.href = "login.html"; } }

var countdown;
function startTimer(newKeyValue) { if (countdown) clearTimeout(countdown); /* set in milliseconds */ var setTimer = 900000; _key = newKeyValue; countdown = setTimeout(function () { var pageName = location.pathname.substring(location.pathname.lastIndexOf("/") + 1); if (pageName != "login.html") { alertError("Your session has timed out. Please log in again."); window.location.href = "login.html"; } }, setTimer) }

function refreshKey(username, password) { dto = { "UserName": username, "Password": password }, data = JSON.stringify(dto); $.ajax('../api/Login/ValidateLogin', { type: 'POST', data: data, statusCode: { 200: function (msg) { _key = msg.Key; localStorage['CT_key'] = msg.Key; var userRoles = "", userID = msg.UserID; for (var i = 0; i < msg.UserRoles.length; i++) { userRoles += msg.UserRoles[i].RoleDescription; } if (!supports_html5_storage()) { createRemember('CT_key', _key); } hideProgress(); startTimer(_key); } }, 404: function () { hideProgress(); alertError('Your user credentials are not recognized. Please login again.'); window.location.href = "login.html"; }, 500: function (msg) { $.when(hideProgress()).then(function () { alertError("Server error. Please notify support. (" + msg.responseJSON.ExceptionMessage + ")"); window.location.href = "login.html"; console.log(msg); }); } }); }

// Cookie check (for 'remember me' box)
function rememberCheck() { var u = supports_html5_storage() ? localStorage['CTuser'] : readRemember('CTuser'), p = supports_html5_storage() ? localStorage['CTpass'] : readRemember('CTpass'); if (u && p) { $('#username').val(u); $('#password').val(p); $('#rememberMe').attr('checked', true); } }

// COOKIES - SET AND READ; for temp or (if "remember me" is checked) permanent memory of login info)
// Only use cookies if browser doesn't support localStorage
function supports_html5_storage() { try { return 'localStorage' in window && window['localStorage'] !== null; } catch (e) { return false; } }

function createRemember(name, value) { var expires = ";expires=0"; if ($('#rememberMe').is(':checked')) { var date = new Date(); date.setTime(date.getTime() + (31 * 24 * 60 * 60 * 1000)); var expires = ";expires=" + date.toGMTString(); } document.cookie = name + "=" + value + expires; }

function readRemember(name) { var nameEQ = name + "=", ca = document.cookie.split(';'); for(var i=0;i < ca.length;i++) { var c = ca[i]; while (c.charAt(0)==' ') c = c.substring(1,c.length); if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length); } return null; }

// Add class for CSS and navigation based on URL
function pageLabel() { var pathname = window.location.href, url = pathname.split("/"), filePosition = url.length, file = url[filePosition-1].split("."), fileName = file[0], classes=fileName.split("-"); for(var i = 0; i < classes.length; i++) { $('body').addClass(classes[i]); } $('nav a[href="'+url[filePosition-1]+'"]').each(function(){ $(this).parent().addClass('activePage') }) }

// CONTROLS THE 'progress' BALL ANIMATION
function showProgress(targetElement, classIdentifier) { var bgElement = "#lightboxBG." + classIdentifier, layer = '<div class="windows8" id="progressBar"><div class="wBall" id="wBall_1"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_2"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_3"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_4"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_5"><div class="wInnerBall"></div></div></div><div class="modal ' + classIdentifier + '" id="lightboxBG"></div>'; $(targetElement).css('position', 'relative').prepend(layer); centerProgress(targetElement); $('#progressBar').fadeIn(50); $(bgElement).fadeIn(50); }

function hideProgress(classIdentifier) { var bgElement = "#lightboxBG." + classIdentifier; $(bgElement).fadeOut(100); $('#progressBar').fadeOut(100, function () { $('#progressBar').remove(); $(bgElement).remove(); }); }

function centerProgress(container) { if (container == 'body') { container = window }; var containerHeight = $(container).innerHeight(), containerWidth = $(container).innerWidth(), modalHeight = $('#progressBar').innerHeight(), modalWidth = $('#progressBar').innerWidth(); var modalTop = (containerHeight - modalHeight) / 2, modalLeft = (containerWidth - modalWidth) / 2; $('#progressBar').css({ 'top': modalTop, 'left': modalLeft }); }

// OPENS AND CENTERS MODALS ON WINDOW
function openModal(modalId) { $("#lightboxBG").fadeIn(250); centerModalX(modalId); $(modalId).fadeIn(250); $(".modal-cancel").click(function(e) { e.preventDefault(); closeModal(); }); $(document).keyup(function(e) { if (e.keyCode == 27) { closeModal() } }); }

function centerModal(modalId) { var windowHeight = window.innerHeight, windowWidth = window.innerWidth, modalHeight = $(modalId).innerHeight(), modalWidth = $(modalId).innerWidth(); var modalTop = (windowHeight - modalHeight) / 2, modalLeft = (windowWidth - modalWidth) / 2; $(modalId).css({ 'top': modalTop, 'left': modalLeft }); }

function centerModalX(modalId) { var windowWidth = window.innerWidth, modalWidth = $(modalId).innerWidth(); var modalLeft = (windowWidth - modalWidth) / 2; $(modalId).css({ 'top': '50px', 'left': modalLeft }); }

function closeModal() { $('.modal').fadeOut(250); }

function getDate(adjustmentTime) {
    if (!adjustmentTime) adjustmentTime = 0;
    var today = new Date(), yyyy = today.getFullYear(), dd = today.getDate() - adjustmentTime, mm = today.getMonth() + 1, hh = today.getHours(); //January is 0!

    if (dd < 10) { dd = '0' + dd }
    if (mm < 10) { mm = '0' + mm }
    var today = mm + '/' + dd + '/' + yyyy;
    return today;
}

function cleanDate(dirtyDate) {
    var cleanMe = new Date(dirtyDate), yyyy = cleanMe.getFullYear(), dd = cleanMe.getDate(), mm = cleanMe.getMonth() + 1, hh = cleanMe.getHours(); //January is 0!
    if (dd < 10) { dd = '0' + dd }
    if (mm < 10) { mm = '0' + mm }
    var cleanDate = yyyy + '-' + mm + '-' + dd;
    return cleanDate;
}

/*! http://mths.be/placeholder v2.0.8 by @mathias */
; (function (window, document, $) {

    // Opera Mini v7 doesn�t support placeholder although its DOM seems to indicate so
    var isOperaMini = Object.prototype.toString.call(window.operamini) == '[object OperaMini]';
    var isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini;
    var isTextareaSupported = 'placeholder' in document.createElement('textarea') && !isOperaMini;
    var prototype = $.fn;
    var valHooks = $.valHooks;
    var propHooks = $.propHooks;
    var hooks;
    var placeholder;

    if (isInputSupported && isTextareaSupported) {

        placeholder = prototype.placeholder = function () {
            return this;
        };

        placeholder.input = placeholder.textarea = true;

    } else {

        placeholder = prototype.placeholder = function () {
            var $this = this;
            $this
				.filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
				.not('.placeholder')
				.bind({
				    'focus.placeholder': clearPlaceholder,
				    'blur.placeholder': setPlaceholder
				})
				.data('placeholder-enabled', true)
				.trigger('blur.placeholder');
            return $this;
        };

        placeholder.input = isInputSupported;
        placeholder.textarea = isTextareaSupported;

        hooks = {
            'get': function (element) {
                var $element = $(element);

                var $passwordInput = $element.data('placeholder-password');
                if ($passwordInput) {
                    return $passwordInput[0].value;
                }

                return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
            },
            'set': function (element, value) {
                var $element = $(element);

                var $passwordInput = $element.data('placeholder-password');
                if ($passwordInput) {
                    return $passwordInput[0].value = value;
                }

                if (!$element.data('placeholder-enabled')) {
                    return element.value = value;
                }
                if (value == '') {
                    element.value = value;
                    // Issue #56: Setting the placeholder causes problems if the element continues to have focus.
                    if (element != safeActiveElement()) {
                        // We can't use `triggerHandler` here because of dummy text/password inputs :(
                        setPlaceholder.call(element);
                    }
                } else if ($element.hasClass('placeholder')) {
                    clearPlaceholder.call(element, true, value) || (element.value = value);
                } else {
                    element.value = value;
                }
                // `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
                return $element;
            }
        };

        if (!isInputSupported) {
            valHooks.input = hooks;
            propHooks.value = hooks;
        }
        if (!isTextareaSupported) {
            valHooks.textarea = hooks;
            propHooks.value = hooks;
        }

        $(function () {
            // Look for forms
            $(document).delegate('form', 'submit.placeholder', function () {
                // Clear the placeholder values so they don't get submitted
                var $inputs = $('.placeholder', this).each(clearPlaceholder);
                setTimeout(function () {
                    $inputs.each(setPlaceholder);
                }, 10);
            });
        });

        // Clear placeholder values upon page reload
        $(window).bind('beforeunload.placeholder', function () {
            $('.placeholder').each(function () {
                this.value = '';
            });
        });

    }

    function args(elem) {
        // Return an object of element attributes
        var newAttrs = {};
        var rinlinejQuery = /^jQuery\d+$/;
        $.each(elem.attributes, function (i, attr) {
            if (attr.specified && !rinlinejQuery.test(attr.name)) {
                newAttrs[attr.name] = attr.value;
            }
        });
        return newAttrs;
    }

    function clearPlaceholder(event, value) {
        var input = this;
        var $input = $(input);
        if (input.value == $input.attr('placeholder') && $input.hasClass('placeholder')) {
            if ($input.data('placeholder-password')) {
                $input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id'));
                // If `clearPlaceholder` was called from `$.valHooks.input.set`
                if (event === true) {
                    return $input[0].value = value;
                }
                $input.focus();
            } else {
                input.value = '';
                $input.removeClass('placeholder');
                input == safeActiveElement() && input.select();
            }
        }
    }

    function setPlaceholder() {
        var $replacement;
        var input = this;
        var $input = $(input);
        var id = this.id;
        if (input.value == '') {
            if (input.type == 'password') {
                if (!$input.data('placeholder-textinput')) {
                    try {
                        $replacement = $input.clone().attr({ 'type': 'text' });
                    } catch (e) {
                        $replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
                    }
                    $replacement
						.removeAttr('name')
						.data({
						    'placeholder-password': $input,
						    'placeholder-id': id
						})
						.bind('focus.placeholder', clearPlaceholder);
                    $input
						.data({
						    'placeholder-textinput': $replacement,
						    'placeholder-id': id
						})
						.before($replacement);
                }
                $input = $input.removeAttr('id').hide().prev().attr('id', id).show();
                // Note: `$input[0] != input` now!
            }
            $input.addClass('placeholder');
            $input[0].value = $input.attr('placeholder');
        } else {
            $input.removeClass('placeholder');
        }
    }

    function safeActiveElement() {
        // Avoid IE9 `document.activeElement` of death
        // https://github.com/mathiasbynens/jquery-placeholder/pull/99
        try {
            return document.activeElement;
        } catch (exception) { }
    }

}(this, document, jQuery));

$('input, textarea').placeholder();