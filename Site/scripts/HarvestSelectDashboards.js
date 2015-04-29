if (!_key) { var _key = supports_html5_storage() ? localStorage['CT_key'] : readRemember('CT_key'); }

var userID = supports_html5_storage() ? localStorage['CTuserID'] : readRemember('CTuserID');
if (!data) { var data; }
$.support.cors = true;
$.ajaxSetup({ contentType: 'application/json; charset=utf-8', data: data, error: function () { hideProgress(); alert("Error contacting the server."); }, statusCode: { 400: function (msg) { hideProgress(); alert("Oops... Something went wrong!"); console.log(msg); }, 404: function (msg) { if (msg.responseJSON == "validation failed") { hideProgress(); alert("Validation failed. Please login again."); window.location.href = "login.html"; } else { hideProgress(); alert("Oops - there was an error..."); /*window.location.href = "login.html";*/ } }, 500: function () { hideProgress(); alert("AJAX FAIL: 500 Internal Server Error"); } } });
// TODO: how to handle 500/AJAX fail errors?


$(function(){
    var currentPage = $(location).attr('href');
    if (currentPage.indexOf("login") > -1) { login(); } else { checkKey(); }
    if ($('.farm-yields').length > 0) { showProgress(); farmYields(); }
    if ($('.shift-end').length > 0) { showProgress(); shiftEnd(); }
});

/* Login page */
function login() {
    if (!rememberCheck()) {
        $('.login form div, .login form button').hide();
        $('.login form #user').fadeIn(250);
        $('#user input').unbind().focus(function(){
            $('#user').removeClass('has-success, has-error');
            $('#user .help-block').hide();
        });
        $('#user input').unbind().focusout(function(){
            if($(this).val() != '') {
                $('#pass').css('opacity', 1);
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
                $('#remember, #login').css('opacity', 1);
                $('#pass').addClass('has-success');
            } else {
                $('#pass').addClass('has-error');
                $('#pass .help-block').show();
            }
        });
    } else {
        $('#pass, #remember, #login').css('opacity', 1);
    }
	
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
					$('#username, #password').val(""); startTimer(msg.Key);  localStorage['CT_key'] = msg.Key; var userRoles = "", userID = msg.UserID, companyID = msg.CompanyId; for (var i = 0; i < msg.UserRoles.length; i++) { userRoles += msg.UserRoles[i].RoleDescription + " "; } if (supports_html5_storage()) { localStorage['CTuser'] = username; localStorage['CTpass'] = password; localStorage['CTuserRole'] = userRoles; localStorage['CTuserID'] = userID; localStorage['CTcompanyID'] = companyID; if ($('#rememberMe').is(':checked')) { localStorage['CTremember'] = true } else { localStorage['CTremember'] = false; } } else { createRemember('CTuser', username); createRemember('CTpass', password); createRemember('CTuserRole', userRoles); createRemember('CTuserID', userID); createRemember('CT_key', _key); createRemember('CT_company', companyID); }
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

var countdown;
function startTimer(newKeyValue) { if (countdown) clearTimeout(countdown); /* set in milliseconds */ var setTimer = 900000; _key = newKeyValue; countdown = setTimeout(function () { var pageName = location.pathname.substring(location.pathname.lastIndexOf("/") + 1); if (pageName != "login.html") { alertError("Your session has timed out. Please log in again."); window.location.href = "login.html"; } }, setTimer) }

function refreshKey(username, password) { dto = { "UserName": username, "Password": password }, data = JSON.stringify(dto); $.ajax('../api/Login/ValidateLogin', { type: 'POST', data: data, statusCode: { 200: function (msg) { _key = msg.Key; localStorage['CT_key'] = msg.Key; var userRoles = "", userID = msg.UserID; for (var i = 0; i < msg.UserRoles.length; i++) { userRoles += msg.UserRoles[i].RoleDescription; } if (!supports_html5_storage()) { createRemember('CT_key', _key); } hideProgress(); startTimer(msg.Key);  } }, 404: function () { hideProgress(); alert('Your user credentials are not recognized. Please login again.'); window.location.href = "login.html"; }, 500: function (msg) { $.when(hideProgress()).then(function () { alert("Server error. Please notify support. (" + msg.responseJSON.ExceptionMessage + ")"); window.location.href = "login.html"; console.log(msg); }); } }); }

// Cookie check (for 'remember me' box)
function rememberCheck() { var u = supports_html5_storage() ? localStorage['CTuser'] : readRemember('CTuser'), p = supports_html5_storage() ? localStorage['CTpass'] : readRemember('CTpass'); if (u && p) { $('#username').val(u); $('#password').val(p); $('#remember input').attr('checked', true); return true; } }

function createRemember(name, value) { var expires = ";expires=0"; if ($('#rememberMe').is(':checked')) { var date = new Date(); date.setTime(date.getTime() + (31 * 24 * 60 * 60 * 1000)); var expires = ";expires=" + date.toGMTString(); } document.cookie = name + "=" + value + expires; }

function readRemember(name) { var nameEQ = name + "=", ca = document.cookie.split(';'); for(var i=0;i < ca.length;i++) { var c = ca[i]; while (c.charAt(0)==' ') c = c.substring(1,c.length); if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length); } return null; }

// CONTROLS THE 'progress' BALL ANIMATION
function showProgress(targetElement, classIdentifier) { var bgElement = "#lightboxBG." + classIdentifier, layer = '<div class="windows8" id="progressBar"><div class="wBall" id="wBall_1"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_2"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_3"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_4"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_5"><div class="wInnerBall"></div></div></div><div class="modal ' + classIdentifier + '" id="lightboxBG"></div>'; $(targetElement).css('position', 'relative').prepend(layer); centerProgress(targetElement); $('#progressBar').fadeIn(50); $(bgElement).fadeIn(50); }

function hideProgress(classIdentifier) { var bgElement = "#lightboxBG." + classIdentifier; $(bgElement).fadeOut(100); $('#progressBar').fadeOut(100, function () { $('#progressBar').remove(); $(bgElement).remove(); }); }

function centerProgress(container) { if (container == 'body') { container = window }; var containerHeight = $(container).innerHeight(), containerWidth = $(container).innerWidth(), modalHeight = $('#progressBar').innerHeight(), modalWidth = $('#progressBar').innerWidth(); var modalTop = (containerHeight - modalHeight) / 2, modalLeft = (containerWidth - modalWidth) / 2; $('#progressBar').css({ 'top': modalTop, 'left': modalLeft }); }

/* FARM YIELDS */
function farmYields() {
    var date, i;

    $('.row.buttons').hide();
    $('#shiftDate').click(function () {
        var searchQuery = { "Key": _key }, data = JSON.stringify(searchQuery), yieldEnds = [];
        $.when($.ajax('../api/FarmYield/FarmYieldList', {
            type: 'POST',
            data: data,
            success: function (msg) {
                localStorage['CT_key'] = msg['Key'];
                startTimer(msg.Key); 
                yieldList = msg['ReturnData'];
                console.log(yieldList);
                var lastdate = yieldList[0].YieldDate.split(" ")[0];
                for (var i = 0; i < yieldList.length; i++) {
                    var shiftDate = yieldList[i].YieldDate.split(" ")[0];
                    if (i == 0) {
                        yieldEnds.push(shiftDate);
                    }
                   else if (shiftDate != lastdate) {
                       yieldEnds.push(shiftDate);
                        lastdate = shiftDate;
                    }
                }
                console.log(yieldEnds);
            }
        })).then(function() {
            $('#calendarModal').modal();
            $('#calendarModal .modal-body').fullCalendar({
                events: function(start, end, timezone, refetchEvents) {
                    var results = yieldEnds;
                    var events = [];
                    for (var event in results) {
                        var obj = {
                            title: "EDIT",
                            start: results[event],
                            end: results[event],
                            allDay: true
                        };
                        events.push(obj);
                    }
                    refetchEvents(events);
                },
                dayClick: function() {
                    $('#rowContainer').empty();
                    date = $(this).data('date');
                    
                    var newRowHtml = '<section class="row row0 data" data-rownum="0" data-yieldid="-1"><div class="col-xs-4"><select id="farms0" class="farmDDL"></select></div><div class="col-xs-3"><select id="ponds0" class="pondsDDL"><option>(Pond)</option></select></div><div class="col-xs-3"><input placeholder="(Pond Weight)" id="pounds0" class="pounds table-numbers" type="text"><input placeholder="(Plant Weight)" id="plantpounds0" class="plantpounds table-numbers" type="text"><input placeholder="(Headed Weight)" id="headedpounds0" class="headedpounds table-numbers" type="text"><input placeholder="(% Yield)" id="pctyield0" class="pctyield table-numbers" type="text"></div><div class="col-xs-1"><a href="#" class="delete-row"><img src="img/close.png"></a></div><div class="col-xs-1"><a href="#" class="add-row"><img src="img/plus.png"></a></div></section>';

                    $.when($('#rowContainer').append(newRowHtml)).then(function() {
                        loadFarmsDDL(0);
                        $('.row.buttons').show();
                    });
                    i = 1;
                    bindYieldButtons();
                    $('.date-select h3').remove();
                    $('.date-select').append("<h3><strong>" + date + "</strong></h3>");
                    $('#calendarModal').modal('hide');
                },
                eventClick: function(calEvent) {
                    $('#rowContainer').empty();
                    console.log(calEvent)
                    var searchQuery = { "Key": _key, "ShiftDate": calEvent.start._i }, data = JSON.stringify(searchQuery);
                    $.when($.ajax('../api/FarmYield/FarmYieldList', {
                        type: 'POST',
                        data: data,
                        success: function (msg) {
                            localStorage['CT_key'] = msg['Key'];
                            startTimer(msg.Key);
                            farmYieldData = msg['ReturnData'];
                            console.log(farmYieldData);
                            $('#rowContainer').empty();
                            $('.date-select h3').remove();
                            $('.date-select').append("<h3><strong>" + farmYieldData.Date + "</strong></h3>");
                            for (var i = 0; i < farmYieldData.Yields.length; i++) {
                                var newRowHtml = '<section class="row row' + farmYieldData.Yield[i].farmYieldID + ' data" data-rownum="' + farmYieldData.Yield[i].farmYieldID + '" data-yieldid="' + farmYieldData.Yield[i].farmYieldID + '"><div class="col-xs-4"><select id="farms' + farmYieldData.Yield[i].farmYieldID + '" class="farmDDL"></select></div><div class="col-xs-3"><select id="ponds' + farmYieldData.Yield[i].farmYieldID + '" class="pondsDDL"><option>(Pond)</option></select></div><div class="col-xs-3"><input placeholder="(Pond Weight)" id="pounds' + farmYieldData.Yield[i].farmYieldID + '" class="pounds table-numbers" type="text" value="' + farmYieldData.Yield[i].Pounds + '"><input placeholder="(Plant Weight)" id="plantpounds' + farmYieldData.Yield[i].farmYieldID + '" class="plantpounds table-numbers" type="text" value="' + farmYieldData.Yield[i].PlantPounds + '"><input placeholder="(Headed Weight)" id="headedpounds' + farmYieldData.Yield[i].farmYieldID + '" class="headedpounds table-numbers" type="text" value="' + farmYieldData.Yield[i].HeadedPounds + '"><input placeholder="(% Yield)" id="pctyield' + farmYieldData.Yield[i].farmYieldID + '" class="pctyield table-numbers" type="text" value="' + farmYieldData.Yield[i].PctYield + '"></div><div class="col-xs-1"><a href="#" class="delete-row"><img src="img/close.png"></a></div><div class="col-xs-1"><a href="#" class="add-row"><img src="img/plus.png"></a></div></section>';
                                $.when($('#rowContainer').append(newRowHtml)).then(function () {
                                    loadFarmsDDL(farmYieldData.Yield[i].farmYieldID, farmYieldData.Yield[i].farmID);
                                    loadPondsDDL(farmYieldData.Yield[i].farmYieldID, farmYieldData.Yield[i].farmID, farmYieldData.Yield[i].pondID);
                                });
                            }
                            var newRowHtml = '<section class="row row0 data" data-rownum="0" data-yieldid="-1"><div class="col-xs-4"><select id="farms0" class="farmDDL"></select></div><div class="col-xs-3"><select id="ponds0" class="pondsDDL"><option>(Pond)</option></select></div><div class="col-xs-3"><input placeholder="(Pond Weight)" id="pounds0" class="pounds table-numbers" type="text"><input placeholder="(Plant Weight)" id="plantpounds0" class="plantpounds table-numbers" type="text"><input placeholder="(Headed Weight)" id="headedpounds0" class="headedpounds table-numbers" type="text"><input placeholder="(% Yield)" id="pctyield0" class="pctyield table-numbers" type="text"></div><div class="col-xs-1"><a href="#" class="delete-row"><img src="img/close.png"></a></div><div class="col-xs-1"><a href="#" class="add-row"><img src="img/plus.png"></a></div></section>';

                            $.when($('#rowContainer').append(newRowHtml)).then(function () {
                                loadFarmsDDL(0);
                                $('.row.buttons').show();
                            });
                            i = 1;
                            bindYieldButtons();
                        }
                    })).then(function () {
                        $('#calendarModal').modal('hide');
                    });

                    // adjust buttons to take edits instead of new
                    bindYieldButtons();
                }
            });
        });
    });

    function bindYieldButtons() {
        $('.farmDDL').unbind().change(function () {
            var rowID = $(this).attr('id').replace('farms', ''), farmID = $(this).val();
            loadPondsDDL(rowID, farmID);
        });

        $('.pondsDDL').unbind().change(function () {
            $(this).parent().next().find('input').css('opacity', 1);
        });

        $('.pounds').unbind().focusout(function () {
            if (!$(this).val() == "") {
                $(this).parent().parent().find('.add-row').css('opacity', 1);
            }
        });

        $('.data .add-row').unbind().click(function (e) {
            e.preventDefault();
            var remove = "0", yieldID = $(this).parent().parent().data('yieldid'), pondID = $(this).parent().parent().find('.pondsDDL').val(), pondYield = $(this).parent().parent().find('.pounds').val(), plantPounds = $(this).parent().parent().find('.plantpounds').val(), headPounds = $(this).parent().parent().find('.headedpounds').val(), pctYield = $(this).parent().parent().find('.pctyield').val(), searchQuery = { "Key": _key, "YieldDate": date, "YieldID": yieldID, "PondID": pondID, "PoundsYielded": pondYield, "PercentYield": pctYield, "PoundsHeaded": headPounds, "PoundsPlant": plantPounds, "Remove": remove }, data = JSON.stringify(searchQuery);
            $(this).parent().parent().find('.add-row').css('opacity', 0);
            $(this).parent().parent().find('.delete-row').css('opacity', 1);
            i = parseInt($(this).parent().parent().attr('data-rownum')) + 1;
            var justadded = ".row" + (i - 1);
            $.when($.ajax('../api/FarmYield/FarmYieldAddOrEdit', {
				type: 'PUT',
				data: data,
				success: function (msg) {
					localStorage['CT_key'] = msg['Key'];
					startTimer(msg.Key); 
					yieldID = msg['YieldID'];
					console.log(yieldList);
					$(this).parent().parent().addClass('complete');
					$(justadded).attr('data-yieldid', yieldID);
                    // ?? What's this? Or - is it necessary?
					addOrEdit = yieldID;
				}
			})).then(function () {
			    newRowHtml = '<section class="row row' + i + ' data" data-rownum="' + i + '" data-yieldid="-1"><div class="col-xs-4"><select id="farms' + i + '" class="farmDDL"></select></div><div class="col-xs-3"><select id="ponds' + i + '" class="pondsDDL"><option>(Pond)</option></select></div><div class="col-xs-3"><input placeholder="(Pond Weight)" id="pounds' + i + '" class="pounds table-numbers" type="text"><input placeholder="(Plant Weight)" id="plantpounds' + i + '" class="plantpounds table-numbers" type="text"><input placeholder="(Headed Weight)" id="headedpounds' + i + '" class="headedpounds table-numbers" type="text"><input placeholder="(% Yield)" id="pctyield' + i + '" class="pctyield table-numbers" type="text"></div><div class="col-xs-1"><a href="#" class="delete-row"><img src="img/close.png"></a></div><div class="col-xs-1"><a href="#" class="add-row"><img src="img/plus.png"></a></div></section>';

				$.when($('#rowContainer').append(newRowHtml)).then(function () { loadFarmsDDL(i); });
				
				bindYieldButtons();
			});
            
        });

        $('.data .delete-row').unbind().click(function (e) {
            e.preventDefault();
            // TO DO: prevent removing sole empty row or replace with empty row
            var remove = "1", searchQuery = { "Key": _key, "YieldID": $(this).parent().parent().attr('data-yieldid'), "Remove": remove }, data = JSON.stringify(searchQuery);
            $(this).parent().parent().remove();
            $.when($.ajax('../api/FarmYield/FarmYieldAddOrEdit', {
                type: 'PUT',
                data: data,
                success: function (msg) {
                    localStorage['CT_key'] = msg['Key'];
                    startTimer(msg.Key); 
                    yieldList = msg['ReturnData'];
                }
            })).then(function () {
                if (!$('.data').length > 0) {
                    var newRowHtml = '<section class="row row0 data" data-rownum="0" data-yieldid="-1"><div class="col-xs-4"><select id="farms0" class="farmDDL"></select></div><div class="col-xs-3"><select id="ponds0" class="pondsDDL"><option>(Pond)</option></select></div><div class="col-xs-3"><input placeholder="(Pond Weight)" id="pounds0" class="pounds table-numbers" type="text"><input placeholder="(Plant Weight)" id="plantpounds0" class="plantpounds table-numbers" type="text"><input placeholder="(Headed Weight)" id="headedpounds0" class="headedpounds table-numbers" type="text"><input placeholder="(% Yield)" id="pctyield0" class="pctyield table-numbers" type="text"></div><div class="col-xs-1"><a href="#" class="delete-row"><img src="img/close.png"></a></div><div class="col-xs-1"><a href="#" class="add-row"><img src="img/plus.png"></a></div></section>';

                    $.when($('#rowContainer').append(newRowHtml)).then(function () { loadFarmsDDL(0); });
                    i = 1;
                    bindYieldButtons();
                }
            });
        })
    }

    function loadFarmsDDL(rowID, farmID) { var ddlHtml = '<option value="">Select Farm</option>', searchQuery = { "Key": _key, "userID": userID }; data = JSON.stringify(searchQuery); $.when($.ajax('../api/Farm/FarmList', { type: 'POST', data: data, success: function (msg) { localStorage['CT_key'] = msg['Key']; startTimer(msg.Key);  farmList = msg['ReturnData']; for (var i = 0; i < farmList.length; ++i) { if (farmList[i].StatusId == "1") { if (typeof farmID !== "undefined" && farmList[i].FarmId == farmID) { ddlHtml += '<option value="' + farmList[i].FarmId + '" selected>' + farmList[i].FarmName + '</option>'; } else { ddlHtml += '<option value="' + farmList[i].FarmId + '">' + farmList[i].FarmName + '</option>'; } } } } })).then(function () { $('#farms' + rowID).empty().html(ddlHtml); }); }

    function loadPondsDDL(rowID, farmID, pondID) { var ddlHtml = '<option value="">Select Pond</option>', searchQuery = { "Key": _key, "userID": userID, "FarmId": farmID }; data = JSON.stringify(searchQuery); $.when($.ajax('../api/Pond/PondList', { type: 'POST', data: data, success: function (msg) { localStorage['CT_key'] = msg['Key']; startTimer(msg.Key);  pondList = msg['ReturnData']; for (var i = 0; i < pondList.length; ++i) { if (pondList[i].StatusId == "1") { if (typeof pondID !== "undefined" && pondList[i].PondId == pondID) { ddlHtml += '<option value="' + pondList[i].PondId + '" selected>' + pondList[i].PondName + '</option>'; } else { ddlHtml += '<option value="' + pondList[i].PondId + '">' + pondList[i].PondName + '</option>'; } } } } })).then(function () { $('#ponds' + rowID).empty().html(ddlHtml).css('opacity', 1); }); }
}

/* SHIFT END */
function shiftEnd() {
    hideProgress();
    $('.row.fields, .row.buttons').hide();
    var date, addOrEdit;
    $('#shiftDate').click(function () {
        var searchQuery = { "Key": _key }, data = JSON.stringify(searchQuery), shiftEnds = [];
        
        $.when($.ajax('../api/ShiftEnd/ShiftEndList', {
            type: 'POST',
            data: data,
            success: function (msg) {
                localStorage['CT_key'] = msg['Key'];
                startTimer(msg.Key); 
                shiftEndList = msg['ReturnData'];
                console.log(shiftEndList);
                for (var i = 0; i < shiftEndList.length; i++) {
                    var shiftDate = shiftEndList[i].ShiftDate.split(" ")[0];
                    shiftEnds.push(shiftDate);
                }
            }
        })).then(function () {
            $('#calendarModal .modal-body').fullCalendar({
                events: function (start, end, timezone, refetchEvents) {
                    var results = shiftEnds;
                    var events = [];
                    for (var event in results) {
                        var obj = {
                            title: "EDIT",
                            start: results[event],
                            end: results[event],
                            allDay: true
                        };
                        events.push(obj);
                    }
                    refetchEvents(events);
                },
                eventClick: function(event) {
                    var searchQuery = { "Key": _key, "Shift Date": event.start._i}, data = JSON.stringify(searchQuery);
                    $.when($.ajax('../api/ShiftEnd/ShiftEndList', {
                        type: 'POST',
                        data: data,
                        success: function (msg) {
                            localStorage['CT_key'] = msg['Key'];
                            startTimer(msg.Key);
                            shiftEndData = msg['ReturnData'];
                            console.log(shiftEndData);
                            $('#rowContainer').empty();
                            $('.date-select h3').remove();
                            $('.date-select').append("<h3><strong>" + shiftEndData.ShiftDate + "</strong></h3>");
                            $('#regEmpLate').val(shiftEndData.RegEmpLate);
                            $('#regEmpOut').val(shiftEndData.RegEmpOut);
                            $('#regEmpLeftEarly').val(shiftEndData.RegEmplLeftEarly);
                            $('#tempEmpOut').val(shiftEndData.TempEmpOut);
                            $('#inmateEmpLeftEarly').val(shiftEndData.InmateLeftEarly);
                            $('#finKill').val(shiftEndData.FinishedKill);
                            $('#finFillet').val(shiftEndData.FinishedFillet);
                            $('#finSkinned').val(shiftEndData.FinishedSkinning);
                            $('#dayFreeze').val(shiftEndData.DayFinishedFreezing);
                            $('#nightFreeze').val(shiftEndData.NightFinishedFreezing);
                            $('#dayFroze').val(shiftEndData.DayShiftFroze);
                            $('#nightFroze').val(shiftEndData.NightShiftFroze);
                            $('#filletScale').val(shiftEndData.FilletScaleReading);
                            $('#downtimeMin').val(shiftEndData.DowntimeMinutes);
                            addOrEdit = shiftEndData.ShiftEndID;
                        }
                    })).then(function () {
                        $('#calendarModal').modal('hide');
                        $('.row.fields, .row.buttons').fadeIn(250);
                    });
                },
                dayClick: function () {
                    $('#rowContainer').empty();
                    date = $(this).data('date');
                    $('.date-select h3').remove();
                    $('.date-select').append("<h3><strong>" + date + "</strong></h3>");
                    // TODO: add edit function, detected by existing data in calendar
                    // this assumes new/add:
                    searchQuery = { "Key": _key, "ShiftDate": date }, data = JSON.stringify(searchQuery), shiftEnds = [];

                    $.ajax('../api/ShiftEnd/ShiftEndList', {
                        type: 'POST',
                        data: data,
                        success: function (msg) {
                            localStorage['CT_key'] = msg['Key'];
                            startTimer(msg.Key); 
                            shiftEndList = msg['ReturnData'];
                            for (var i = 0; i < shiftEndList.length; i++) {
                                var shiftDate = shiftEndList[i].ShiftDate.split(" ")[0];
                                shiftEnds.push(shiftDate);
                            }
                        }
                    });
                    addOrEdit = "-1";
                    $('#calendarModal').modal('hide');
                    $('.row.fields, .row.buttons').fadeIn(250);
                }
            });
        });
        
    });

    $('.buttons .reset').unbind().click(function (e) {
        e.preventDefault();
        if (window.confirm("This will permanently delete any information you have entered and not saved.")) {
            document.location.reload(true);
        }
    });

    $('.buttons .save').unbind().click(function (e) {
        e.preventDefault();
        // Harper TODO - you need to add a column / call in API for "DoownTimeMinutes"
        var searchQuery = { "Key": _key, "userID": userID, "ShiftDate": date, "ShiftEndID": addOrEdit, "DayFinishedFreezing": $('#dayFreeze').val(), "DayShiftFroze": $('#dayFroze').val(), "FilletScaleReading": $('#filletScale').val() , "FinishedFillet": $('#finFillet').val(), "FinishedKill": $('#finKill').val(), "FinishedSkinning": $('#finSkinned').val(), "InmateLeftEarly": $('#inmateEmpLeftEarly').val() , "NightFinishedFreezing": $('#nightFreeze').val(), "NightShiftFroze": $('#nightFroze').val(), "RegEmpLate": $('#regEmpLate').val(), "RegEmpOut": $('#regEmpOut').val() , "RegEmplLeftEarly": $('#regEmpLeftEarly').val(), "TempEmpOut": $('#tempEmpOut').val(), "DowntimeMinutes": $('#downtimeMin').val() }, data = JSON.stringify(searchQuery);
        $.when($.ajax('../api/ShiftEnd/ShiftEndAddOrEdit', {
            type: 'PUT',
            data: data,
            success: function (msg) {
                localStorage['CT_key'] = msg['Key'];
                startTimer(msg.Key); 
                farmList = msg['ReturnData'];
                $('.date-select').append("<div>Information Saved!</div>");
            }
        })).then(function () { $('#farms' + rowID).empty().html(ddlHtml); });
    });
}