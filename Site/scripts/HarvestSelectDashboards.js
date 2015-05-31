﻿if (!_key) { var _key = supports_html5_storage() ? localStorage['CT_key'] : readRemember('CT_key'); }

var userID = supports_html5_storage() ? localStorage['CTuserID'] : readRemember('CTuserID');
if (!data) { var data; }
$.support.cors = true;
$.ajaxSetup({ contentType: 'application/json; charset=utf-8', data: data,  statusCode: { 400: function (msg) { hideProgress(); alert("Oops... Something went wrong!"); }, 404: function (msg) { if (msg.responseJSON == "validation failed") { hideProgress(); alert("Validation failed or your session expired. Please login again."); window.location.href = "login.html"; } else { hideProgress(); alert("Oops - there was an error..."); /*window.location.href = "login.html";*/ } }, 500: function () { hideProgress(); alert("AJAX FAIL: 500 Internal Server Error"); } } });
// TODO: how to handle 500/AJAX fail errors?


$(function () {
    logoutControls();
    var currentPage = $(location).attr('href');
    if (currentPage.indexOf("login") > -1) { login(); } else { checkKey(); }
    if ($('.farm-yields').length > 0) { showProgress(); farmYields(); }
    if ($('.shift-end').length > 0) { showProgress(); shiftEnd(); }
    if ($('.live-sample').length > 0) { showProgress(); liveSample(); }
});

/* Login page */
function login() {
    if (!rememberCheck()) {
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
				    $('#username, #password').val(""); startTimer(msg.Key); localStorage['CT_key'] = msg.Key; var userRoles = "", userID = msg.UserID, companyID = msg.CompanyId; for (var i = 0; i < msg.UserRoles.length; i++) { userRoles += msg.UserRoles[i].RoleDescription + " "; } if (supports_html5_storage()) { localStorage['CTuser'] = username; localStorage['CTpass'] = password; localStorage['CTuserRole'] = userRoles; localStorage['CTuserID'] = userID; localStorage['CTcompanyID'] = companyID; if ($('#remember input').is(':checked')) { localStorage['CTremember'] = true } else { localStorage.removeItem('CTremember'); } } else { createRemember('CTuser', username); createRemember('CTpass', password); createRemember('CTuserRole', userRoles); createRemember('CTuserID', userID); createRemember('CT_key', _key); createRemember('CT_company', companyID); }
					window.location.href = "index.html";
				}, 404: function () {
					$.when(hideProgress()).then(function () { alert("Invalid login credentials: " + username + ":" + password + ". Please enter your information again."); });
				}, 405: function () {
				}, 500: function (msg) {
					hideProgress('login'); if (supports_html5_storage()) { localStorage['CTuser'] = username; localStorage['CTpass'] = password; } else { createRemember('CTuser', username); createRemember('CTpass', password); } alert("Server error. Please notify support. (" + msg.responseJSON.ExceptionMessage + ")"); 
				}
			}
		});
    });
}

//logout
function logoutControls() {
    $('#logout').unbind().click(function (e) {
        e.preventDefault();_key = "";
        if (supports_html5_storage()) {
            if (localStorage['CTremember'] == "false" || typeof localStorage['CTremember'] == 'undefined') {
                localStorage.removeItem('CTuser'); localStorage.removeItem('CTpass');
            }
            localStorage.removeItem('CTuserRole'); localStorage.removeItem('CTcompanyID'); localStorage.removeItem('CTuserID'); localStorage.removeItem('CT_key');
        } else {
            createRemember('CTuserRole', ""); createRemember('CTuserID', ""); createRemember('CT_key', _key);
        }
        window.location.href = "login.html";
    });
}

// COOKIES - SET AND READ; for temp or (if "remember me" is checked) permanent memory of login info)
// Only use cookies if browser doesn't support localStorage
function supports_html5_storage() { try { return 'localStorage' in window && window['localStorage'] !== null; } catch (e) { return false; } }

// Key check for security/validation
function checkKey() { if (!_key) { alert("Session key is undefined; please log in."); window.location.href = "login.html"; } }

var countdown;
function startTimer(newKeyValue) { if (countdown) clearTimeout(countdown); /* set in milliseconds */ var setTimer = 900000; _key = newKeyValue; countdown = setTimeout(function () { var pageName = location.pathname.substring(location.pathname.lastIndexOf("/") + 1); if (pageName != "login.html") { alert("Your session has timed out. Please log in again."); window.location.href = "login.html"; } }, setTimer) }

function refreshKey(username, password) { dto = { "UserName": username, "Password": password }, data = JSON.stringify(dto); $.ajax('../api/Login/ValidateLogin', { type: 'POST', data: data, statusCode: { 200: function (msg) { _key = msg.Key; localStorage['CT_key'] = msg.Key; var userRoles = "", userID = msg.UserID; for (var i = 0; i < msg.UserRoles.length; i++) { userRoles += msg.UserRoles[i].RoleDescription; } if (!supports_html5_storage()) { createRemember('CT_key', _key); } hideProgress(); startTimer(msg.Key);  } }, 404: function () { hideProgress(); alert('Your user credentials are not recognized. Please login again.'); window.location.href = "login.html"; }, 500: function (msg) { $.when(hideProgress()).then(function () { alert("Server error. Please notify support. (" + msg.responseJSON.ExceptionMessage + ")"); window.location.href = "login.html"; }); } }); }

// Cookie check (for 'remember me' box)
function rememberCheck() { var u = supports_html5_storage() ? localStorage['CTuser'] : readRemember('CTuser'), p = supports_html5_storage() ? localStorage['CTpass'] : readRemember('CTpass'); if (u && p) { $('#username').val(u); $('#password').val(p); $('#remember input').attr('checked', true); return true; } }

function createRemember(name, value) { var expires = ";expires=0"; if ($('#rememberMe').is(':checked')) { var date = new Date(); date.setTime(date.getTime() + (31 * 24 * 60 * 60 * 1000)); var expires = ";expires=" + date.toGMTString(); } document.cookie = name + "=" + value + expires; }

function readRemember(name) { var nameEQ = name + "=", ca = document.cookie.split(';'); for(var i=0;i < ca.length;i++) { var c = ca[i]; while (c.charAt(0)==' ') c = c.substring(1,c.length); if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length); } return null; }

// CONTROLS THE 'progress' BALL ANIMATION
function showProgress(targetElement, classIdentifier) { var bgElement = "#lightboxBG." + classIdentifier, layer = '<div class="windows8" id="progressBar"><div class="wBall" id="wBall_1"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_2"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_3"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_4"><div class="wInnerBall"></div></div><div class="wBall" id="wBall_5"><div class="wInnerBall"></div></div></div><div class="modal ' + classIdentifier + '" id="lightboxBG"></div>'; $(targetElement).css('position', 'relative').prepend(layer); centerProgress(targetElement); $('#progressBar').fadeIn(50); $(bgElement).fadeIn(50); }

function hideProgress(classIdentifier) { var bgElement = "#lightboxBG." + classIdentifier; $(bgElement).fadeOut(100); $('#progressBar').fadeOut(100, function () { $('#progressBar').remove(); $(bgElement).remove(); }); }

function centerProgress(container) { if (container == 'body') { container = window }; var containerHeight = $(container).innerHeight(), containerWidth = $(container).innerWidth(), modalHeight = $('#progressBar').innerHeight(), modalWidth = $('#progressBar').innerWidth(); var modalTop = (containerHeight - modalHeight) / 2, modalLeft = (containerWidth - modalWidth) / 2; $('#progressBar').css({ 'top': modalTop, 'left': modalLeft }); }

function getTodaysMonth() {
    $('.row.buttons').hide();
    var today = new Date(), todaysMonth = today.getMonth() + 1, todaysYear = today.getFullYear();
    if (todaysMonth < 10) todaysMonth = "0" + todaysMonth;
    var tdate = new Object();
    tdate.month = todaysMonth;
    tdate.year = todaysYear;
    return tdate;
}

/* FARM YIELDS */
function farmYields() {
    var date, i, tdate = getTodaysMonth(), startDateMonth = tdate.month, startDateYear = tdate.year;
    $('#shiftDate').unbind().click(function () {
        // TO DO: limit calendar call to current month
        // TO DO: bind next and previous buttons on calendar to month calls
        showProgress('body');
        loadCalendar(startDateMonth, startDateYear);
    });

    function loadCalendar() {
        var searchQuery = { "Key": _key, "StartDateMonth": startDateMonth, "StartDateYear": startDateYear }, data = JSON.stringify(searchQuery), yieldEnds = [];
        $.when($.ajax('../api/FarmYield/FarmYieldList', {
            type: 'POST',
            data: data,
            success: function (msg) {
                localStorage['CT_key'] = msg['Key'];
                startTimer(msg.Key);
                yieldList = msg['ReturnData'];
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
            },
            error: function (msg) {
                alert("Could not fetch the data.");
                console.log(msg);
            }
        })).then(function () {
            hideProgress();
            $('#calendarModal').modal();
            $('#calendarModal .modal-body').fullCalendar('destroy');
            $('#calendarModal .modal-body').fullCalendar({
                events: 
                    function (start, end, timezone, refetchEvents) {
                        var results = getCalData(); //yieldEnds;
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
                dayClick: function () {
                    $('#rowContainer').empty();
                    $('.plantpounds').css('opacity', 1);
                    date = $(this).data('date');

                    var newRowHtml = '<section class="row row0 data" data-rownum="0" data-yieldid="-1"><div class="col-xs-2"><select id="farms0" class="farmDDL"></select></div><div class="col-xs-2"><select id="ponds0" class="pondsDDL"><option>(Pond)</option></select></div><div class="col-xs-6"><input placeholder="(Pond Weight)" id="pounds0" class="pounds table-numbers" type="text"><input placeholder="(Headed Weight)" id="headedpounds0" class="headedpounds table-numbers" type="text"><input placeholder="(% Yield1)" id="pctyield1_0" class="pctyield1 table-numbers" type="text"><input placeholder="(% Yield2)" id="pctyield2_0" class="pctyield2 table-numbers" type="text"></div><div class="col-xs-2"><a href="#" class="add-row"><img src="img/plus.png"></a><a href="#" class="delete-row"><img src="img/close.png"></a></div></section>';

                    $.when($('#rowContainer').append(newRowHtml)).then(function () {
                        loadFarmsDDL(0);
                        $('.row.buttons').show();
                    });
                    i = 1;
                    bindYieldButtons();
                    $('.date-select h3').remove();
                    $('.date-select').append("<h3><strong>" + date + "</strong></h3>");
                    $('#calendarModal').modal('hide');
                },
                eventClick: function (calEvent) {
                    var chosenDate = calEvent.start._i;
                    $.when(loadEditFarmYields(chosenDate)).then(function () {
                        $('#calendarModal').modal('hide');
                    });

                    // adjust buttons to take edits instead of new
                    bindYieldButtons();
                }
            });
            $('.fc-button-prev span').click(function () {
                alert('prev is clicked, do something');
            });

            $('.fc-button-next span').click(function () {
                alert('nextis clicked, do something');
            });
        });
    }

    function getCalData() {
        var searchQuery = { "Key": _key, "StartDateMonth": startDateMonth, "StartDateYear": startDateYear }, data = JSON.stringify(searchQuery), yieldEnds = [{}];
        $.ajax('../api/FarmYield/FarmYieldList', {
            type: 'POST',
            data: data,
            success: function (msg) {
                console.log(startDateMonth);
                localStorage['CT_key'] = msg['Key'];
                startTimer(msg.Key);
                yieldList = msg['ReturnData'];
                console.log(yieldList.length);
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
                };
                var view = $('#calendarModal .modal-body').fullCalendar('getView');
                // calendar view actually starts days before the month you're viewing
                // to account for calendar view including those days!
                startDateMonth = view.start._d.getMonth() + 2; // adding one for see above, one for javascript month rep
                stateDateYear = view.start._d.getFullYear();
                console.log(view.start._d + "/" + startDateMonth );
                return yieldEnds;
            }
        })
    }

function loadEditFarmYields(date) {
    $('#rowContainer').empty();
    $('.date-select h3, .date-select div').remove();
    $('#plantpounds').val();
    $('#plantPoundsID').val("-1");
    $('#weighbacks').val();
    var searchQuery = { "Key": _key, "YieldDate": date }, data = JSON.stringify(searchQuery);
    $.ajax('../api/FarmYieldHeader/FarmYieldHeaderList', {
        type: 'POST',
        data: data,
        success: function (msg) {
            localStorage['CT_key'] = msg['Key'];
            startTimer(msg.Key);
            plantPoundsData = msg['ReturnData'];
            $('#plantpounds').val(plantPoundsData[0].PlantWeight);
            $('#plantPoundsID').val(plantPoundsData[0].FarmYieldHeaderID);
            $('#weighbacks').val(plantPoundsData[0].WeighBacks);
        }
    });
    $.ajax('../api/FarmYield/FarmYieldList', {
        type: 'POST',
        data: data,
        success: function (msg) {
            localStorage['CT_key'] = msg['Key'];
            startTimer(msg.Key);
            farmYieldData = msg['ReturnData'];
            $('#rowContainer').empty();
            $('.date-select h3').remove();
            $('.date-select').append("<h3><strong>" + farmYieldData[0].YieldDate + "</strong></h3>");
            for (var i = 0; i < farmYieldData.length; i++) {
                var newRowHtml = '<section class="row row' + farmYieldData[i].YieldId + ' data" data-rownum="' + farmYieldData[i].YieldId + '" data-yieldid="' + farmYieldData[i].YieldId + '"><div class="col-xs-2"><select id="farms' + farmYieldData[i].YieldId + '" class="farmDDL"></select></div><div class="col-xs-2"><select id="ponds' + farmYieldData[i].YieldId + '" class="pondsDDL"><option>(Pond)</option></select></div><div class="col-xs-6"><input placeholder="(Pond Weight)" id="pounds' + farmYieldData[i].YieldId + '" class="pounds table-numbers" type="text" value="' + farmYieldData[i].PoundsYielded + '"><input placeholder="(Headed Weight)" id="headedpounds' + farmYieldData[i].YieldId + '" class="headedpounds table-numbers" type="text" value="' + farmYieldData[i].PoundsHeaded + '"><input placeholder="(% Yield1)" id="pctyield1_' + farmYieldData[i].YieldId + '" class="pctyield1 table-numbers" type="text" value="' + farmYieldData[i].PercentYield + '"><input placeholder="(% Yield2)" id="pctyield2_' + farmYieldData[i].YieldId + '" class="pctyield2 table-numbers" type="text" value="' + farmYieldData[i].PercentYield2 + '"></div><div class="col-xs-2"><a href="#" class="add-row"><img src="img/plus.png"></a><a href="#" class="delete-row"><img src="img/close.png"></a></div></section>';
                $.when($('#rowContainer').append(newRowHtml)).then(function () {
                    loadFarmsDDL(farmYieldData[i].YieldId, farmYieldData[i].FarmID);
                    loadPondsDDL(farmYieldData[i].YieldId, farmYieldData[i].FarmID, farmYieldData[i].PondID);
                    $('.ponds, .pounds, .plantpounds, .headedpounds, .pctyield1, .pctyield2, .add-row, .delete-row').css('opacity', 1);
                });
            }
            var newRowHtml = '<section class="row row0 data" data-rownum="0" data-yieldid="-1"><div class="col-xs-2"><select id="farms0" class="farmDDL"></select></div><div class="col-xs-2"><select id="ponds0" class="pondsDDL"><option>(Pond)</option></select></div><div class="col-xs-6"><input placeholder="(Pond Weight)" id="pounds0" class="pounds table-numbers" type="text"><input placeholder="(Headed Weight)" id="headedpounds0" class="headedpounds table-numbers" type="text"><input placeholder="(% Yield1)" id="pctyield1_0" class="pctyield1 table-numbers" type="text"><input placeholder="(% Yield2)" id="pctyield2_0" class="pctyield2 table-numbers" type="text"></div><div class="col-xs-2"><a href="#" class="add-row"><img src="img/plus.png"></a><a href="#" class="delete-row"><img src="img/close.png"></a></div></section>';

            $.when($('#rowContainer').append(newRowHtml)).then(function () {
                loadFarmsDDL(0);
                $('.row.buttons').show();
            });
            i = 1;
            bindYieldButtons();
        }
    });
}

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

    $('#plantLbsSave').unbind().click(function (e) {
        showProgress('body');
        e.preventDefault();
        var date = $('.date-select h3 strong').text(), weighBacks = $('#weighbacks').val(), plantPounds = $('#plantpounds').val(), plantPoundsID = $('#plantPoundsID').val(), searchQuery = { "Key": _key, "YieldDate": date, "PlantWeight": plantPounds, "FarmYieldHeaderID": plantPoundsID, "WeighBacks": weighBacks }, data = JSON.stringify(searchQuery);
        $.ajax('../api/FarmYieldHeader/FarmYieldHeaderAddOrEdit', {
            type: 'PUT',
            data: data,
            success: function (msg) {
                hideProgress();
                localStorage['CT_key'] = msg['Key'];
                startTimer(msg.Key);
                $('.date-select').append("<div>Plant Weight Saved.</div>");
            }
        })
    });

    $('.data .add-row').unbind().click(function (e) {
        e.preventDefault();
        var remove = "0", date = $('.date-select h3 strong').text(), yieldID = $(this).parent().parent().data('yieldid'), pondID = $(this).parent().parent().find('.pondsDDL').val(), pondYield = $(this).parent().parent().find('.pounds').val(), headPounds = $(this).parent().parent().find('.headedpounds').val(), pctYield = $(this).parent().parent().find('.pctyield1').val(), pctYield2 = $(this).parent().parent().find('.pctyield2').val(),  searchQuery = { "Key": _key, "YieldDate": date, "YieldID": yieldID, "PondID": pondID, "PoundsYielded": pondYield, "PercentYield": pctYield, "PercentYield2": pctYield2, "PoundsHeaded": headPounds, "Remove": remove }, data = JSON.stringify(searchQuery);
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
				$(this).parent().parent().addClass('complete');
				$(justadded).attr('data-yieldid', yieldID);
				if (yieldID != -1) { loadEditFarmYields(date); }
                // ?? What's this? Or - is it necessary?
				addOrEdit = yieldID;
			}
		})).then(function () {
			if (yieldID == -1) {
			    newRowHtml = '<section class="row row' + i + ' data" data-rownum="' + i + '" data-yieldid="-1"><div class="col-xs-2"><select id="farms' + i + '" class="farmDDL"></select></div><div class="col-xs-2"><select id="ponds' + i + '" class="pondsDDL"><option>(Pond)</option></select></div><div class="col-xs-6"><input placeholder="(Pond Weight)" id="pounds' + i + '" class="pounds table-numbers" type="text"><input placeholder="(Headed Weight)" id="headedpounds' + i + '" class="headedpounds table-numbers" type="text"><input placeholder="(% Yield1)" id="pctyield1_' + i + '" class="pctyield table-numbers" type="text"><input placeholder="(% Yield2)" id="pctyield2_' + i + '" class="pctyield2 table-numbers" type="text"></div><div class="col-xs-2"><a href="#" class="add-row"><img src="img/plus.png"></a><a href="#" class="delete-row"><img src="img/close.png"></a></div></section>';

			    $.when($('#rowContainer').append(newRowHtml)).then(function () { loadFarmsDDL(i); });
			    bindYieldButtons();
			}
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
                var newRowHtml = '<section class="row row0 data" data-rownum="0" data-yieldid="-1"><div class="col-xs-2"><select id="farms0" class="farmDDL"></select></div><div class="col-xs-2"><select id="ponds0" class="pondsDDL"><option>(Pond)</option></select></div><div class="col-xs-6"><input placeholder="(Pond Weight)" id="pounds0" class="pounds table-numbers" type="text"><input placeholder="(Headed Weight)" id="headedpounds0" class="headedpounds table-numbers" type="text"><input placeholder="(% Yield1)" id="pctyield!_0" class="pctyield table-numbers" type="text"><input placeholder="(% Yield2)" id="pctyield2_0" class="pctyield2 table-numbers" type="text"></div><div class="col-xs-2"><a href="#" class="add-row"><img src="img/plus.png"></a><a href="#" class="delete-row"><img src="img/close.png"></a></div></section>';

                $.when($('#rowContainer').append(newRowHtml)).then(function () { loadFarmsDDL(0); });
                i = 1;
                bindYieldButtons();
            }
        });
    })
}

function loadFarmsDDL(rowID, farmID) {
    var ddlHtml = '<option value="">Select Farm</option>', searchQuery = { "Key": _key, "userID": userID }; data = JSON.stringify(searchQuery); $.when($.ajax('../api/Farm/FarmList', {
        type: 'POST', data: data, success: function (msg) { localStorage['CT_key'] = msg['Key']; startTimer(msg.Key);  farmList = msg['ReturnData']; for (var i = 0; i < farmList.length; ++i) { if (farmList[i].StatusId == "1") { if (typeof farmID !== "undefined" && farmList[i].FarmId == farmID) { ddlHtml += '<option value="' + farmList[i].FarmId + '" selected>' + farmList[i].FarmName + '</option>'; } else { ddlHtml += '<option value="' + farmList[i].FarmId + '">' + farmList[i].FarmName + '</option>'; } } } } })).then(function () { $('#farms' + rowID).empty().html(ddlHtml); }); }

function loadPondsDDL(rowID, farmID, pondID) { var ddlHtml = '<option value="">Select Pond</option>', searchQuery = { "Key": _key, "userID": userID, "FarmId": farmID }; data = JSON.stringify(searchQuery); $.when($.ajax('../api/Pond/PondList', { type: 'POST', data: data, success: function (msg) { localStorage['CT_key'] = msg['Key']; startTimer(msg.Key);  pondList = msg['ReturnData']; for (var i = 0; i < pondList.length; ++i) { if (pondList[i].StatusId == "1") { if (typeof pondID !== "undefined" && pondList[i].PondId == pondID) { ddlHtml += '<option value="' + pondList[i].PondId + '" selected>' + pondList[i].PondName + '</option>'; } else { ddlHtml += '<option value="' + pondList[i].PondId + '">' + pondList[i].PondName + '</option>'; } } } } })).then(function () { $('#ponds' + rowID).empty().html(ddlHtml).css('opacity', 1); }); }
}

/* SHIFT END */
function shiftEnd() {
    hideProgress();
    $('.row.fields, .row.buttons').hide();
    var date, addOrEdit;
    $('#shiftDate').unbind().click(function () {
        $('input').val("");
        $('.row.fields, .row.buttons').fadeIn(250);
        var searchQuery = { "Key": _key }, data = JSON.stringify(searchQuery), shiftEnds = [];
        
        $.when($.ajax('../api/ShiftEnd/ShiftEndList', {
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
        })).then(function () {
            $('#calendarModal .modal-body').fullCalendar('destroy');
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
                    date = event.start._i, searchQuery = { "Key": _key, "ShiftDate": date }, data = JSON.stringify(searchQuery);
                    $.when($.ajax('../api/ShiftEnd/ShiftEndList', {
                        type: 'POST',
                        data: data,
                        success: function (msg) {
                            localStorage['CT_key'] = msg['Key'];
                            startTimer(msg.Key);
                            shiftEndData = msg['ReturnData'][0];
                            $('#rowContainer').empty();
                            $('.date-select h3').remove();
                            $('.date-select').append("<h3><strong>" + date + "</strong></h3>");
                            $('#regEmpLate').val(shiftEndData.RegEmpLate);
                            $('#regEmpOut').val(shiftEndData.RegEmpOut);
                            $('#regEmpLeftEarly').val(shiftEndData.RegEmplLeftEarly);
                            $('#tempEmpOut').val(shiftEndData.TempEmpOut);
                            $('#inmateEmpLeftEarly').val(shiftEndData.InmateLeftEarly);
                            $('#empVacation').val(shiftEndData.EmployeesOnVacation);
                            $('#inLateOut').val(shiftEndData.InLateOut);
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
                    //searchQuery = { "Key": _key, "ShiftDate": date }, data = JSON.stringify(searchQuery), shiftEnds = [];

                    //$.ajax('../api/ShiftEnd/ShiftEndList', {
                    //    type: 'POST',
                    //    data: data,
                    //    success: function (msg) {
                    //        debugger;
                    //        localStorage['CT_key'] = msg['Key'];
                    //        startTimer(msg.Key); 
                    //        shiftEndList = msg['ReturnData'];
                    //        for (var i = 0; i < shiftEndList.length; i++) {
                    //            var shiftDate = shiftEndList[i].ShiftDate.split(" ")[0];
                    //            shiftEnds.push(shiftDate);
                    //        }
                    //    }
                    //});
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

        //var dayFreeze = $('#dayFreeze').val() == "" ? "00:00" : $('#dayFreeze').val(shiftEndData.DayFinishedFreezing), nightFreeze = $('#nightFreeze').val() == "" ? "00:00" : $('#nightFreeze').val(shiftEndData.NightFinishedFreezing);

        // Harper TODO - you need to add a column / call in API for "DoownTimeMinutes"
        var searchQuery = { "Key": _key, "userID": userID, "ShiftDate": date, "ShiftEndID": addOrEdit, "DayFinishedFreezing": $('#dayFreeze').val(), "DayShiftFroze": $('#dayFroze').val(), "FilletScaleReading": $('#filletScale').val(), "FinishedFillet": $('#finFillet').val(), "FinishedKill": $('#finKill').val(), "FinishedSkinning": $('#finSkinned').val(), "InmateLeftEarly": $('#inmateEmpLeftEarly').val(), "NightFinishedFreezing": $('#nightFreeze').val(), "NightShiftFroze": $('#nightFroze').val(), "RegEmpLate": $('#regEmpLate').val(), "RegEmpOut": $('#regEmpOut').val(), "InLateOut": $('#inLateOut').val(), "EmployeesOnVacation": $('#empVacation').val(), "RegEmplLeftEarly": $('#regEmpLeftEarly').val(), "TempEmpOut": $('#tempEmpOut').val(), "DowntimeMinutes": $('#downtimeMin').val() }, data = JSON.stringify(searchQuery);
        $.when($.ajax('../api/ShiftEnd/ShiftEndAddOrEdit', {
            type: 'PUT',
            data: data,
            success: function (msg) {
                localStorage['CT_key'] = msg['Key'];
                startTimer(msg.Key); 
                farmList = msg['ReturnData'];
                $('.date-select').append("<div>Information Saved!</div>");
            }
        })).then( function() { $('input').val(""); $('.row.fields, .row.buttons').hide(); });
    });
}

/* LIVE FISH SAMPLING */
function liveSample() {
    hideProgress();
    $('.row.fields, .row.buttons').hide();
    var date, addOrEdit;
    $('#shiftDate').unbind().click(function () {
        $('input').val("");
        $('.row.fields, .row.buttons').fadeIn(250);
        var searchQuery = { "Key": _key }, data = JSON.stringify(searchQuery), samplingDates = [];

        $.when($.ajax('../api/LiveFishSampling/LiveFishSamplingList', {
            type: 'POST',
            data: data,
            success: function (msg) {
                localStorage['CT_key'] = msg['Key'];
                startTimer(msg.Key);
                sampleList = msg['ReturnData'];
                for (var i = 0; i < sampleList.length; i++) {
                    var sampleDate = sampleList[i].SamplingDate.split(" ")[0];
                    samplingDates.push(sampleDate);
                }
            }
        })).then(function () {
            $('#calendarModal .modal-body').fullCalendar({
                events: function (start, end, timezone, refetchEvents) {
                    var results = samplingDates;
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
                eventClick: function (event) {
                    date = event.start._i, searchQuery = { "Key": _key, "SamplingDate": date }, data = JSON.stringify(searchQuery);
                    $.when($.ajax('../api/LiveFishSampling/LiveFishSamplingList', {
                        type: 'POST',
                        data: data,
                        success: function (msg) {
                            localStorage['CT_key'] = msg['Key'];
                            startTimer(msg.Key);
                            sampleData = msg['ReturnData'][0];
                            $('#rowContainer').empty();
                            $('.date-select h3').remove();
                            $('.date-select').append("<h3><strong>" + date + "</strong></h3>");
                            $('#Pct0_125').val(sampleData.Pct0_125);
                            $('#Avg0_125').val(sampleData.Avg0_125);
                            $('#Pct125_225').val(sampleData.Pct125_225);
                            $('#Avg125_225').val(sampleData.Avg125_225);
                            $('#Pct225_3').val(sampleData.Pct225_3);
                            $('#Avg225_3').val(sampleData.Avg225_3);
                            $('#Pct3_5').val(sampleData.Pct3_5);
                            $('#Avg3_5').val(sampleData.Avg3_5);
                            $('#Pct5_Up').val(sampleData.Pct5_Up);
                            $('#Avg5_Up').val(sampleData.Avg5_Up);
                            addOrEdit = sampleData.SamplingID;
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
                    searchQuery = { "Key": _key, "ShiftDate": date }, data = JSON.stringify(searchQuery), samplingDates = [];

                    $.ajax('../api/LiveFishSampling/LiveFishSamplingList', {
                        type: 'POST',
                        data: data,
                        success: function (msg) {
                            localStorage['CT_key'] = msg['Key'];
                            startTimer(msg.Key);
                            sampleList = msg['ReturnData'];
                            for (var i = 0; i < sampleList.length; i++) {
                                var sampleDate = sampleList[i].SamplingDate.split(" ")[0];
                                samplingDates.push(sampleDate);
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
        var searchQuery = { "Key": _key, "userID": userID, "SamplingDate": date, "SamplingID": addOrEdit, "Pct0_125": $('#Pct0_125').val(), "Avg0_125": $('#Avg0_125').val(), "Pct125_225": $('#Pct125_225').val(), "Avg125_225": $('#Avg125_225').val(), "Pct225_3": $('#Pct225_3').val(), "Avg225_3": $('#Avg225_3').val(), "Pct3_5": $('#Pct3_5').val(), "Avg3_5": $('#Avg3_5').val(), "Pct5_Up": $('#Pct5_Up').val(), "Avg5_Up": $('#Avg5_Up').val() }, data = JSON.stringify(searchQuery);
        $.when($.ajax('../api/LiveFishSampling/LiveFishSamplingAddOrEdit', {
            type: 'PUT',
            data: data,
            success: function (msg) {
                localStorage['CT_key'] = msg['Key'];
                startTimer(msg.Key);
                farmList = msg['ReturnData'];
                $('.date-select').append("<div>Information Saved!</div>");
            }
        })).then(function () { $('input').val(""); $('.row.fields, .row.buttons').hide(); });
    });
}