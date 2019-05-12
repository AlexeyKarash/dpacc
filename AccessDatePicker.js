function datepicker(data) {
    this.$target = $('#' + data.target); // div or text box that will receive the selected date string and focus (if modal)
    this.lang = data.lang;
    this.lngArr = $.pioDatePickerLanguages[data.lang];
    this.dayNames = this.lngArr['day-names'];
    this.monthNames = this.lngArr['month-name'];
    this.dayShortNames = this.lngArr['day-short-names'];

    this.baseGrid();

    this.$id = $('#' + data.id); // element to attach widget to
    this.$monthObj = this.$id.find('#month');
    this.$prev = this.$id.find('#bn_prev');
    this.$next = this.$id.find('#bn_next');
    this.$grid = this.$id.find('#cal');
    
    //    console.log();


    this.bModal = data.modal; // true if datepicker should appear in a modal dialog box.
    this.disableWeekend = data.disableWeekend;
    this.startFromToday = data.startFromToday;
    this.disabledDates = data.disabledDates ? data.disabledDates : [];
    this.range = data.range ? data.range : false;
    //if (data.disabledDates) {
    //    this.disabledDates = data.disabledDates;
    //} else {
    //    this.disabledDates = [];
    //}
    //this.monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
    
    //this.dayNames = ['יום א', 'יום ב', 'יום ג', 'יום ד', 'יום ה', 'יום ו', 'שבת'];
    

    this.dateObj = new Date();

    this.curYear = this.dateObj.getFullYear();
    this.year = this.curYear;

    this.curMonth = this.dateObj.getMonth();
    this.month = this.curMonth;
    this.currentDate = true;
    this.oldDate = false;

    this.date = this.dateObj.getDate();
    this.firstDate = {
        day: null,
        month: null,
        year: null,
        full: ''
    };
    this.secondDate = {
        day: null,
        month: null,
        year: null,
        full: ''
    };

    this.keys = {
        tab: 9,
        enter: 13,
        esc: 27,
        space: 32,
        pageup: 33,
        pagedown: 34,
        end: 35,
        home: 36,
        left: $('body').hasClass('rtl') ? 39 : 37,
        up: 38,
        right: $('body').hasClass('rtl') ? 37 : 39,
        down: 40
    };

    // display the current month
    this.$monthObj.html(this.monthNames[this.month] + ' ' + this.year);

    // populate the calendar grid
    this.popGrid();

    // update the table's activedescdendant to point to the current day
    this.$grid.attr('aria-activedescendant', this.$grid.find('.today').attr('id'));

    this.bindHandlers();

    // hide dialog if in modal mode
    if (this.bModal == true) {
        this.$id.attr('aria-hidden', 'true');
    }
}
datepicker.prototype.baseGrid = function () {

    var baseGrid = '\n<button class="select-date pio-access-datepicker-toggle" id="bn_date">'+this.lngArr["select-date"]+'</button>\n' +
		'<div id="dp1" class="datepicker" aria-hidden="true" dir='+this.lngArr["direction"]+'>\n' +
		'<div id="month-wrap">\n\t<div id="bn_prev" role="button" aria-labelledby="bn_prev-label" tabindex="0"></div>\n\t' +
		'<div id="month" role="heading" aria-live="assertive" aria-atomic="true">February 2011</div>\n\t' +
		'<div id="bn_next" role="button" aria-labelledby="bn_next-label" tabindex="0"></div>\n\r</div>' +
		'<table id="cal" role="grid" aria-activedescendant="errMsg" aria-labelledby="month" tabindex="0">\n\t' +
		'<thead>\n\t<tr id="weekdays">\n\t<th id="Sunday"><abbr title="'+this.dayNames[0]+'">'+this.dayShortNames[0]+'</abbr></th>\n<th id="Monday"><abbr title="'+this.dayNames[1]+'">'+this.dayShortNames[1]+'</abbr></th>\n' +
		'<th id="Tuesday"><abbr title="'+this.dayNames[2]+'">'+this.dayShortNames[2]+'</abbr></th>\n<th id="Wednesday"><abbr title="'+this.dayNames[3]+'">'+this.dayShortNames[3]+'</abbr></th>\n<th id="Thursday"><abbr title="'+this.dayNames[4]+'">'+this.dayShortNames[4]+'</abbr></th>\n' +
		'<th id="Friday"><abbr title="' + this.dayNames[5] + '">' + this.dayShortNames[5] + '</abbr></th>\n<th id="Saturday"><abbr title="' + this.dayNames[6] + '">' + this.dayShortNames[6] + '</abbr></th>\n\r</tr>\n\r</thead>\n<tbody>\n\t' +
		'<tr>\n\t<td id="errMsg" colspan="7">Javascript must be enabled</td>\n\r</tr>\n\r</tbody>\n\r</table>\n' +
		'<div id="bn_prev-label" class="offscreen">' + this.lngArr["prev-month"] + '</div>\n<div id="bn_next-label" class="offscreen">' + this.lngArr["next-month"] + '</div>\n\r</div>';

    this.$target.wrap('<div class="date-select"></div>');
    this.$target.closest('.date-select').append(baseGrid);
}
//
// popGrid() is a member function to populate the datepicker grid with calendar days
// representing the current month
//
// @return N/A
//
datepicker.prototype.popGrid = function () {
console.log(this.date);
    var numDays = this.calcNumDays(this.year, this.month);
    var startWeekday = this.calcStartWeekday(this.year, this.month);
    var weekday = 0;
    var curDay = 1;
    var rowCount = 1;
    var $tbody = this.$grid.find('tbody');

    var gridCells = '\t<tr id="row1">\n';
    //	var weekdayClass;
    //	var oldDateClass;
    var isDisabledDate = false;
    // clear the grid
    $tbody.empty();
    $('#msg').empty();

    // Insert the leading empty cells
    for (weekday = 0; weekday < startWeekday; weekday++) {

        gridCells += '\t\t<td class="empty">&nbsp;</td>\n';
    }

    // insert the days of the month.
    for (curDay = 1; curDay <= numDays; curDay++) {
        var curDate = new Date(this.year + "/" + (this.month + 1) + "/" + curDay);
        var isDisabledDate = false;
        if (curDay == this.date && this.currentDate == true) {

            gridCells += '\t\t<td id="day' + curDay + '" class="today' + ((weekday > 4) ? ' weekend' : '') +
				(((weekday > 4 && this.disableWeekend) || DisableSpecificDates(curDate, this.disabledDates)) ? ' disabled' : '') + '" headers="row' +
				rowCount + ' ' + this.dayNames[weekday] + '" role="gridcell" aria-selected="false" ' +
				(((weekday > 4 && this.disableWeekend) || DisableSpecificDates(curDate, this.disabledDates)) ? ' aria-disabled="true"' : '') + '>' + curDay + '</td>';

        }
        else {
            if (this.oldDate == true) {
                isDisabledDate = true;
            } else {
                if (curDay < this.date && this.currentDate == true) {
                    isDisabledDate = true;
                }
            }
            gridCells += '\t\t<td id="day' + curDay + '" class="' + ((weekday > 4) ? ' weekend' : '') +
				(((weekday > 4 && this.disableWeekend) || DisableSpecificDates(curDate, this.disabledDates)) ? ' disabled' : '') +
				((isDisabledDate && this.startFromToday) ? ' old-date disabled' : '') + '" headers="row' +
				rowCount + ' ' + this.dayNames[weekday] + '" role="gridcell" aria-selected="false" ' +
				(((isDisabledDate && this.startFromToday) || weekday > 4 && this.disableWeekend || DisableSpecificDates(curDate, this.disabledDates)) ? 'aria-disabled="true"' : '') +
				'>' + curDay + '</td>';
        }


        if (weekday == 6 && curDay < numDays) {
            // This was the last day of the week, close it out
            // and begin a new one
            gridCells += '\t</tr>\n\t<tr id="row' + rowCount + '">\n';
            rowCount++;
            weekday = 0;
        }
        else {
            weekday++;
        }
    }

    // Insert any trailing empty cells
    for (weekday; weekday < 7; weekday++) {

        gridCells += '\t\t<td class="empty">&nbsp;</td>\n';
    }

    gridCells += '\t</tr>';

    $tbody.append(gridCells);
}

//
// calcNumDays() is a member function to calculate the number of days in a given month
//
// @return (integer) number of days
//
datepicker.prototype.calcNumDays = function (year, month) {

    return 32 - new Date(year, month, 32).getDate();
}

//
// calcstartWeekday() is a member function to calculate the day of the week the first day of a
// month lands on
//
// @return (integer) number representing the day of the week (0=Sunday....6=Saturday)
//
datepicker.prototype.calcStartWeekday = function (year, month) {

    return new Date(year, month, 1).getDay();

} // end calcStartWeekday()

//
// showPrevMonth() is a member function to show the previous month
//
// @param (offset int) offset may be used to specify an offset for setting
//                      focus on a day the specified number of days from
//                      the end of the month.
// @return N/A
//
datepicker.prototype.showPrevMonth = function (offset) {
    // show the previous month
    if (this.month == 0) {
        this.month = 11;
        this.year--;
    }
    else {
        this.month--;
    }

    if (this.month != this.curMonth || this.year != this.curYear) {
        if (this.year < this.curYear) {
            this.oldDate = true;
        } else if (this.year == this.curYear && this.month < this.curMonth) {
            this.oldDate = true;
        } else {
            this.oldDate = false;
        }
        this.currentDate = false;
    }
    else {
        this.currentDate = true;
        this.oldDate = false;
    }

    // populate the calendar grid
    this.popGrid();

    this.$monthObj.html(this.monthNames[this.month] + ' ' + this.year);

    // if offset was specified, set focus on the last day - specified offset
    if (offset != null) {
        var numDays = this.calcNumDays(this.year, this.month);
        var day = 'day' + (numDays - offset);

        this.$grid.attr('aria-activedescendant', day);
        $('#' + day).addClass('focus').attr('aria-selected', 'true');
    }

} // end showPrevMonth()

//
// showNextMonth() is a member function to show the next month
//
// @param (offset int) offset may be used to specify an offset for setting
//                      focus on a day the specified number of days from
//                      the beginning of the month.
// @return N/A
//
datepicker.prototype.showNextMonth = function (offset) {

    // show the next month
    if (this.month == 11) {
        this.month = 0;
        this.year++;
    }
    else {
        this.month++;
    }

    if (this.month != this.curMonth || this.year != this.curYear) {
        if (this.year < this.curYear) {
            this.oldDate = true;
        } else if (this.year == this.curYear && this.month < this.curMonth) {
            this.oldDate = true;
        } else {
            this.oldDate = false;
        }
        this.currentDate = false;
    }
    else {
        this.currentDate = true;
        this.oldDate = false;
    }

    // populate the calendar grid
    this.popGrid();

    this.$monthObj.html(this.monthNames[this.month] + ' ' + this.year);

    // if offset was specified, set focus on the first day + specified offset
    if (offset != null) {
        var day = 'day' + offset;

        this.$grid.attr('aria-activedescendant', day);
        $('#' + day).addClass('focus').attr('aria-selected', 'true');
    }

} // end showNextMonth()

//
// showPrevYear() is a member function to show the previous year
//
// @return N/A
//
datepicker.prototype.showPrevYear = function () {

    // decrement the year
    this.year--;

    if (this.month != this.curMonth || this.year != this.curYear) {
        this.currentDate = false;
    }
    else {
        this.currentDate = true;
    }

    // populate the calendar grid
    this.popGrid();

    this.$monthObj.html(this.monthNames[this.month] + ' ' + this.year);

} // end showPrevYear()

//
// showNextYear() is a member function to show the next year
//
// @return N/A
//
datepicker.prototype.showNextYear = function () {

    // increment the year
    this.year++;

    if (this.month != this.curMonth || this.year != this.curYear) {
        this.currentDate = false;
    }
    else {
        this.currentDate = true;
    }

    // populate the calendar grid
    this.popGrid();

    this.$monthObj.html(this.monthNames[this.month] + ' ' + this.year);

} // end showNextYear()

//
// bindHandlers() is a member function to bind event handlers for the widget
//
// @return N/A
//
datepicker.prototype.bindHandlers = function () {

    var thisObj = this;

    ////////////////////// bind button handlers //////////////////////////////////
    this.$prev.click(function (e) {
        return thisObj.handlePrevClick(e);
    });

    this.$next.click(function (e) {
        return thisObj.handleNextClick(e);
    });

    this.$prev.keydown(function (e) {
        return thisObj.handlePrevKeyDown(e);
    });

    this.$next.keydown(function (e) {
        return thisObj.handleNextKeyDown(e);
    });

    ///////////// bind grid handlers //////////////

    this.$grid.keydown(function (e) {
        return thisObj.handleGridKeyDown(e);
    });

    this.$grid.keypress(function (e) {
        return thisObj.handleGridKeyPress(e);
    });

    this.$grid.focus(function (e) {
        return thisObj.handleGridFocus(e);
    });

    this.$grid.blur(function (e) {
        return thisObj.handleGridBlur(e);
    });

    this.$grid.delegate('td', 'click', function (e) {
        return thisObj.handleGridClick(this, e);
    });

} // end bindHandlers();

//
// handlePrevClick() is a member function to process click events for the prev month button
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handlePrevClick = function (e) {

    var active = this.$grid.attr('aria-activedescendant');

    if (e.ctrlKey) {
        this.showPrevYear();
    }
    else {
        this.showPrevMonth();
    }

    if (this.currentDate == false) {
        this.$grid.attr('aria-activedescendant', 'day1');
    }
    else {
        this.$grid.attr('aria-activedescendant', active);
    }

    e.stopPropagation();
    return false;

} // end handlePrevClick()

//
// handleNextClick() is a member function to process click events for the next month button
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handleNextClick = function (e) {

    var active = this.$grid.attr('aria-activedescendant');

    if (e.ctrlKey) {
        this.showNextYear();
    }
    else {
        this.showNextMonth();
    }

    if (this.currentDate == false) {
        this.$grid.attr('aria-activedescendant', 'day1');
    }
    else {
        this.$grid.attr('aria-activedescendant', active);
    }

    e.stopPropagation();
    return false;

} // end handleNextClick()

//
// handlePrevKeyDown() is a member function to process keydown events for the prev month button
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handlePrevKeyDown = function (e) {

    if (e.altKey) {
        return true;
    }

    switch (e.keyCode) {
        case this.keys.tab: {
            if (this.bModal == false || !e.shiftKey || e.ctrlKey) {
                return true;
            }

            this.$grid.focus();
            e.stopPropagation();
            return false;
        }
        case this.keys.enter:
        case this.keys.space: {
            if (e.shiftKey) {
                return true;
            }

            if (e.ctrlKey) {
                this.showPrevYear();
            }
            else {
                this.showPrevMonth();
            }

            e.stopPropagation();
            return false;
        }
    }

    return true;

} // end handlePrevKeyDown()

//
// handleNextKeyDown() is a member function to process keydown events for the next month button
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handleNextKeyDown = function (e) {

    if (e.altKey) {
        return true;
    }

    switch (e.keyCode) {
        case this.keys.enter:
        case this.keys.space: {

            if (e.ctrlKey) {
                this.showNextYear();
            }
            else {
                this.showNextMonth();
            }

            e.stopPropagation();
            return false;
        }
    }

    return true;

} // end handleNextKeyDown()

//
// handleGridKeyDown() is a member function to process keydown events for the datepicker grid
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handleGridKeyDown = function (e) {

    var $rows = this.$grid.find('tbody tr');
    var $curDay = $('#' + this.$grid.attr('aria-activedescendant'));
    var $days = this.$grid.find('td').not('.empty');
    var $curRow = $curDay.parent();

    if (e.altKey) {
        return true;
    }

    switch (e.keyCode) {
        case this.keys.tab: {

            if (this.bModal == true) {
                if (e.shiftKey) {
                    this.$next.focus();
                }
                else {
                    this.$prev.focus();
                }
                e.stopPropagation()
                return false;
            }
            break;
        }
        case this.keys.enter:
        case this.keys.space: {
            console.log($curDay.attr("class"));
            if (e.ctrlKey || $curDay.hasClass('disabled')) {
                return true;
            }

            // update the target box
            this.$target.val($curDay.html() + '/' + (this.month < 9 ? '0' : '') + (this.month + 1) + '/' + this.year);

            // fall through
        }
        case this.keys.esc: {
            // dismiss the dialog box
            this.hideDlg();

            e.stopPropagation();
            return false;
        }
        case this.keys.left: {

            if (e.ctrlKey || e.shiftKey) {
                return true;
            }

            var dayIndex = $days.index($curDay) - 1;
            var $prevDay = null;

            if (dayIndex >= 0) {
                $prevDay = $days.eq(dayIndex);

                $curDay.removeClass('focus').attr('aria-selected', 'false');
                $prevDay.addClass('focus').attr('aria-selected', 'true');

                this.$grid.attr('aria-activedescendant', $prevDay.attr('id'));
            }
            else {
                this.showPrevMonth(0);
            }

            e.stopPropagation();
            return false;
        }
        case this.keys.right: {

            if (e.ctrlKey || e.shiftKey) {
                return true;
            }

            var dayIndex = $days.index($curDay) + 1;
            var $nextDay = null;

            if (dayIndex < $days.length) {
                $nextDay = $days.eq(dayIndex);
                $curDay.removeClass('focus').attr('aria-selected', 'false');
                $nextDay.addClass('focus').attr('aria-selected', 'true');

                this.$grid.attr('aria-activedescendant', $nextDay.attr('id'));
            }
            else {
                // move to the next month
                this.showNextMonth(1);
            }

            e.stopPropagation();
            return false;
        }
        case this.keys.up: {

            if (e.ctrlKey || e.shiftKey) {
                return true;
            }

            var dayIndex = $days.index($curDay) - 7;
            var $prevDay = null;

            if (dayIndex >= 0) {
                $prevDay = $days.eq(dayIndex);

                $curDay.removeClass('focus').attr('aria-selected', 'false');
                $prevDay.addClass('focus').attr('aria-selected', 'true');

                this.$grid.attr('aria-activedescendant', $prevDay.attr('id'));
            }
            else {
                // move to appropriate day in previous month
                dayIndex = 6 - $days.index($curDay);

                this.showPrevMonth(dayIndex);
            }

            e.stopPropagation();
            return false;
        }
        case this.keys.down: {

            if (e.ctrlKey || e.shiftKey) {
                return true;
            }

            var dayIndex = $days.index($curDay) + 7;
            var $prevDay = null;

            if (dayIndex < $days.length) {
                $prevDay = $days.eq(dayIndex);

                $curDay.removeClass('focus').attr('aria-selected', 'false');
                $prevDay.addClass('focus').attr('aria-selected', 'true');

                this.$grid.attr('aria-activedescendant', $prevDay.attr('id'));
            }
            else {
                // move to appropriate day in next month
                dayIndex = 8 - ($days.length - $days.index($curDay));

                this.showNextMonth(dayIndex);
            }

            e.stopPropagation();
            return false;
        }
        case this.keys.pageup: {
            var active = this.$grid.attr('aria-activedescendant');


            if (e.shiftKey) {
                return true;
            }


            if (e.ctrlKey) {
                this.showPrevYear();
            }
            else {
                this.showPrevMonth();
            }

            if ($('#' + active).attr('id') == undefined) {
                var lastDay = 'day' + this.calcNumDays(this.year, this.month);
                $('#' + lastDay).addClass('focus').attr('aria-selected', 'true');
            }
            else {
                $('#' + active).addClass('focus').attr('aria-selected', 'true');
            }

            e.stopPropagation();
            return false;
        }
        case this.keys.pagedown: {
            var active = this.$grid.attr('aria-activedescendant');


            if (e.shiftKey) {
                return true;
            }

            if (e.ctrlKey) {
                this.showNextYear();
            }
            else {
                this.showNextMonth();
            }

            if ($('#' + active).attr('id') == undefined) {
                var lastDay = 'day' + this.calcNumDays(this.year, this.month);
                $('#' + lastDay).addClass('focus').attr('aria-selected', 'true');
            }
            else {
                $('#' + active).addClass('focus').attr('aria-selected', 'true');
            }

            e.stopPropagation();
            return false;
        }
        case this.keys.home: {

            if (e.ctrlKey || e.shiftKey) {
                return true;
            }

            $curDay.removeClass('focus').attr('aria-selected', 'false');

            $('#day1').addClass('focus').attr('aria-selected', 'true');

            this.$grid.attr('aria-activedescendant', 'day1');

            e.stopPropagation();
            return false;
        }
        case this.keys.end: {

            if (e.ctrlKey || e.shiftKey) {
                return true;
            }

            var lastDay = 'day' + this.calcNumDays(this.year, this.month);

            $curDay.removeClass('focus').attr('aria-selected', 'false');

            $('#' + lastDay).addClass('focus').attr('aria-selected', 'true');

            this.$grid.attr('aria-activedescendant', lastDay);

            e.stopPropagation();
            return false;
        }
    }

    return true;

} // end handleGridKeyDown()

//
// handleGridKeyPress() is a member function to consume keypress events for browsers that
// use keypress to scroll the screen and manipulate tabs
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handleGridKeyPress = function (e) {

    if (e.altKey) {
        return true;
    }

    switch (e.keyCode) {
        case this.keys.tab:
        case this.keys.enter:
        case this.keys.space:
        case this.keys.esc:
        case this.keys.left:
        case this.keys.right:
        case this.keys.up:
        case this.keys.down:
        case this.keys.pageup:
        case this.keys.pagedown:
        case this.keys.home:
        case this.keys.end: {
            e.stopPropagation();
            return false;
        }
    }

    return true;

} // end handleGridKeyPress()

//
// handleGridClick() is a member function to process mouse click events for the datepicker grid
//
// @input (id obj) e is the id of the object triggering the event
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) false if consuming event, true if propagating
//
datepicker.prototype.handleGridClick = function (id, e) {
    var $cell = $(id);

    if ($cell.is('.empty') || $cell.hasClass('disabled')) {
        return true;
    }

    this.$grid.attr('aria-activedescendant', $cell.attr('id'));

    var $curDay = $('#' + this.$grid.attr('aria-activedescendant'));

    // update the target box
    //this.$target.val((this.month < 9 ? '0' : '') + (this.month+1) + '/' + $curDay.html() + '/' + this.year);
    if(this.range){
        var activeCells = this.$grid.find('.focus');
        // if(activeCells.length > 1){
            
        // }else{
        //     //activeCells.removeClass('focus').attr('aria-selected', 'false');
        //     $cell.addClass('focus').attr('aria-selected', 'true');
        // }
        if(this.firstDate.date !== null && this.secondDate.date !== null) {
            this.firstDate.date = parseInt($curDay.html());
            this.firstDate.month = this.month;
            this.firstDate.year = this.year;
            this.firstDate.full = this.firstDate.date + '/' + (this.firstDate.month < 9 ? '0' : '') + (this.firstDate.month + 1) + '/' + this.firstDate.year;
            this.secondDate.date = null;
            this.secondDate.month = null;
            this.secondDate.year = null;
            this.secondDate.full = '';
            this.$target.val(this.firstDate.full);
            this.$grid.find('.range').removeClass('range').attr('aria-selected', 'false');
            activeCells.removeClass('focus').attr('aria-selected', 'false');
            $cell.addClass('focus').attr('aria-selected', 'true');
        } else if(this.firstDate.date !== null && this.secondDate.date === null){
            this.secondDate.date = parseInt($curDay.html());
            this.secondDate.month = this.month;
            this.secondDate.year = this.year;
            this.secondDate.full = this.secondDate.date + '/' + (this.secondDate.month < 9 ? '0' : '') + (this.secondDate.month + 1) + '/' + this.secondDate.year;

            var tempDate = {};
            if(this.secondDate.year < this.firstDate.year){
                tempDate = this.firstDate;
                this.firstDate = this.secondDate;
                this.secondDate = tempDate;
            }else if(this.secondDate.year === this.firstDate.year && this.secondDate.month < this.firstDate.month){
                tempDate = this.firstDate;
                this.firstDate = this.secondDate;
                this.secondDate = tempDate;
            }else if(this.secondDate.year === this.firstDate.year && this.secondDate.month === this.firstDate.month && this.secondDate.date < this.firstDate.date){
                tempDate = this.firstDate;
                this.firstDate = this.secondDate;
                this.secondDate = tempDate;
            }
            this.highLightRange(this.firstDate, this.secondDate);
            this.$target.val(this.firstDate.full + " - " + this.secondDate.full);
            $cell.addClass('focus').attr('aria-selected', 'true');
        }else{
            this.firstDate.date = parseInt($curDay.html());
            this.firstDate.month = this.month;
            this.firstDate.year = this.year;
            this.firstDate.full = this.firstDate.date + '/' + (this.firstDate.month < 9 ? '0' : '') + (this.firstDate.month + 1) + '/' + this.firstDate.year;
            this.$target.val(this.firstDate.full);
            //this.firstDate = this.$target.val();
            activeCells.removeClass('focus').attr('aria-selected', 'false');
            $cell.addClass('focus').attr('aria-selected', 'true');
        }
    }else{
        this.$grid.find('.focus').removeClass('focus').attr('aria-selected', 'false');
        $cell.addClass('focus').attr('aria-selected', 'true');
        this.$target.val($curDay.html() + '/' + (this.month < 9 ? '0' : '') + (this.month + 1) + '/' + this.year);
    }

    // dismiss the dialog box
    if(!this.range || (this.range && this.secondDate.date !== null))
        this.hideDlg();

    e.stopPropagation();
    return false;

} // end handleGridClick()

//
// handleGridFocus() is a member function to process focus events for the datepicker grid
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) true
//
datepicker.prototype.handleGridFocus = function (e) {
    var active = this.$grid.attr('aria-activedescendant');

    if ($('#' + active).attr('id') == undefined) {
        var lastDay = 'day' + this.calcNumDays(this.year, this.month);
        $('#' + lastDay).addClass('focus').attr('aria-selected', 'true');
    }
    else {
        $('#' + active).addClass('focus').attr('aria-selected', 'true');
    }

    return true;

} // end handleGridFocus()

//
// handleGridBlur() is a member function to process blur events for the datepicker grid
//
// @input (e obj) e is the event object associated with the event
//
// @return (boolean) true
//
datepicker.prototype.handleGridBlur = function (e) {
    $('#' + this.$grid.attr('aria-activedescendant')).removeClass('focus').attr('aria-selected', 'false');

    return true;

} // end handleGridBlur()

//
// showDlg() is a member function to show the datepicker and give it focus. This function is only called if
// the datepicker is used in modal dialog mode.
//
// @return N/A
//
datepicker.prototype.showDlg = function () {

    var thisObj = this;
    if (this.$id.attr('aria-hidden') == 'false') {

        this.hideDlg();

        return false;
    }
    // Bind an event listener to the document to capture all mouse events to make dialog modal
    $(document).bind('click mousedown mouseup mousemove mouseover', function (e) {

        //ensure focus remains on the dialog
        thisObj.$grid.focus();

        // Consume all mouse events and do nothing
        e.stopPropagation;
        return false;
    });

    // show the dialog
    this.$id.attr('aria-hidden', 'false');

    this.$grid.focus();

} // end showDlg()

//
// hideDlg() is a member function to hide the datepicker and remove focus. This function is only called if
// the datepicker is used in modal dialog mode.
//
// @return N/A
//
datepicker.prototype.hideDlg = function () {

    var thisObj = this;

    // unbind the modal event sinks
    $(document).unbind('click mousedown mouseup mousemove mouseover');

    // hide the dialog
    this.$id.attr('aria-hidden', 'true');

    // set focus on the focus target
    this.$target.focus();

} // end showDlg()


datepicker.prototype.highLightRange = function(firstDateObj, secondDateObj){
    if(firstDateObj.year === secondDateObj.year && firstDateObj.month === secondDateObj.month){
        for(var i = (firstDateObj.date+1); i < secondDateObj.date; i++){
            this.$grid.find("#day"+i).addClass('range').attr('aria-selected', 'true');
        }

    }

}

//
//Help Function
//detect if date is part dates string Array
//date must be js Date object
//string dates array in ISO format YYYY/MM/DD
//
function DisableSpecificDates(date, dateArray) {

    if (dateArray.length == 0) {
        return false;
    }

    var m = date.getMonth();
    var d = date.getDate();
    var y = date.getFullYear();

    if (d < 10) {
        d = "0" + d
    }
    if ((m + 1) < 10) {
        m = "0" + (m + 1)
    } else {
        m = m + 1;
    }

    // First convert the date in to the mm-dd-yyyy format 
    // Take note that we will increment the month count by 1 
    var currentdate = y + '-' + m + '-' + d;
    // We will now check if the date belongs to disableddates array 
    for (var i = 0; i < dateArray.length; i++) {
        // Now check if the current date is in disabled dates array. 
        if ($.inArray(currentdate, dateArray) != -1) {
            return true;
        }
    }
    return false;

}


$.pioDatePickerLanguages = {
    'he': 
    {
        'select-date': 'בחר תאריך...',
        'day-names': ['יום א', 'יום ב', 'יום ג', 'יום ד', 'יום ה', 'יום ו', 'שבת'],
        'day-short-names': ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'],
        'month-name': ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'],
        'prev-month': 'מעבר לחודש קודם',
        'next-month': 'מעבר לחודש הבא',
        'direction' : 'rtl'
    },
    'en':
    {
        'select-date': 'Select Date...',
        'day-names': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'day-short-names': ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        'month-name': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        'prev-month': 'Go to previous month',
        'next-month': 'Go to next month',
        'direction': 'ltr'
    }
}