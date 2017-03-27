// 8< ---[dates.js]---
// START:VANILLA_PREAMBLE
var dates=typeof(extend)!='undefined' ? extend.module('dates') : (typeof(dates)!='undefined' ? dates : {});
(function(dates){
var __module__=dates;
// END:VANILLA_PREAMBLE

dates.__VERSION__='0.7.1';
/**
  * Dates calculation that do not rely on platform-specific date library but instead
  * use an UTC, ISO date format and simple arithmetic calculations.
  * 
*/
dates.Date = extend.Class({
	name  :'dates.Date',
	parent: undefined,
	shared: {
		MONTHS_SHORT: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		SECONDS_PER_DAY: ((60 * 60) * 24),
		SECONDS_PER_HOUR: (60 * 60),
		SECONDS_PER_WEEK: (((60 * 60) * 24) * 7),
		PERIOD_MONTH: "M",
		PERIOD_WEEK: "W",
		MONTHS: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		SECONDS_PER_MINUTE: 60,
		DAYS: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
		PERIOD_WEEK_2: "W2",
		PERIOD_YEAR: "Y",
		PERIOD_OVERALL: "O",
		DAYS_SHORT: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
		PERIOD_MONTH_HALF: "MH"
	},
	initialize: function(){
		var self = this;
	},
	operations:{
		AddSeconds: function( date, delta ){
			var self = this;
			return self.Add(date, [0, 0, 0, 0, 0, delta]);
		},
		AddHours: function( date, delta ){
			var self = this;
			return self.Add(date, [0, 0, 0, delta]);
		},
		Min: function( a, b ){
			var self = this;
			if (self.Compare(a, b) < 0) {
				return a;
			} else {
				return b;
			}
		},
		/**
		  * Returns a date that corresponds to the start of the week of the
		  * given date.
		  * 
		*/
		AggregateToWeek: function( date ){
			var self = this;
			date = self.Ensure(date);
			var is_dst = date;
			var year = is_dst[0];
			var month = is_dst[1];
			var day = is_dst[2];
			var hour = is_dst[3];
			var minute = is_dst[4];
			var second = is_dst[5];
			var wday = is_dst[6];
			var yday = is_dst[7];
			is_dst = is_dst[8];
			var week_day = self.WeekDay(year, month, day);
			if (week_day > 0) {
				return self.AggregateToDay(self.AddDays(date, (0 - week_day)));
			} else {
				return self.AggregateToDay(date);
			}
		},
		DeltaInMonths: function( a, b ){
			var self = this;
			a = self.AggregateToMonth(a);
			b = self.AggregateToMonth(b);
			var am = ((a[0] * 12) + a[1]);
			var bm = ((b[0] * 12) + b[1]);
			return (bm - am);
		},
		Add: function( date, delta ){
			var self = this;
			date = self.Ensure(date);
			delta = self.Ensure(delta);
			// Iterates over `delta`. This works on array,objects and null/undefined
			var __i=delta;
			var __j=__i instanceof Array ? __i : Object.getOwnPropertyNames(__i||{});
			var __l=__j.length;
			for (var __k=0;__k<__l;__k++){
				var i=(__j===__i)?__k:__j[__k];
				var v=__i[i];
				// This is the body of the iteration with (value=v, key/index=i) in __i
				date[i] = (date[i] + v);
			}
			return self.FromGregorianDayNumber(self.GregorianDayNumber(date));
		},
		Between: function( date, a, b, strict ){
			var self = this;
			if (strict === undefined) {strict=false}
			if (self.Before(date, a)) {
				return false;
			} else if (self.After(date, b) || (strict && self.Equals(date, b))) {
				return false;
			} else {
				return true;
			}
		},
		DeltaInSeconds: function( a, b ){
			var self = this;
			a = self.EnsureTimestamp(a);
			b = self.EnsureTimestamp(b);
			return (b - a);
		},
		ThisYear: function( delta ){
			var self = this;
			if (delta === undefined) {delta=0}
			var today = self.AggregateToYear(self.Now());
			if (delta != 0) {
				today = self.AddYears(today, delta);
			}
			return today;
		},
		Today: function( delta ){
			var self = this;
			if (delta === undefined) {delta=0}
			var today = self.AggregateToDay(self.Now());
			if (delta != 0) {
				today = self.AddDays(today, delta);
			}
			return today;
		},
		/**
		  * Lists the months contained between the given two dates, where the first month
		  * will be the month of date a and the last month will be the month of date b,
		  * inclusively.
		  * 
		*/
		ListMonths: function( a, b ){
			var self = this;
			a = self.AggregateToMonth(a);
			d = self.DeltaInMonths(a, b);
			if (d == 0) {
				return [a];
			}
			var y = a[0];
			var m = a[1];
			var res = [a];
			while ((Math.abs(d) > 0)) {
				if (d < 0) {
					m = (m - 1);
					d = (d + 1);
				} else {
					m = (m + 1);
					d = (d - 1);
				}
				if (m == 0) {
					m = 12;
					y = (y - 1);
				} else if (m == 13) {
					m = 1;
					y = (y + 1);
				}
				res.push(self.Ensure([y, m, 1]));
			}
			return res;
		},
		/**
		  * Returns a '[y,m,d]' triple from the given YMD timestamp expressed
		  * in the format 'YYYY-MM-DD'
		  * 
		*/
		ParseTimestamp: function( ymd ){
			var self = this;
			ymd = ymd.split("-");
			var res = [];
			res.push(parseInt(ymd[0]));
			if (ymd[1][0] == "0") {
				res.push(parseInt(extend.slice(ymd[1],1,undefined)));
			} else {
				res.push(parseInt(ymd[1]));
			}
			if (ymd[2][0] == "0") {
				res.push(parseInt(extend.slice(ymd[2],1,undefined)));
			} else {
				res.push(parseInt(ymd[2]));
			}
			return res;
		},
		AddYear: function( date, delta ){
			var self = this;
			return self.Add(date, [delta, 0, 0]);
		},
		IsLeapYear: function( year ){
			var self = this;
			if ((year % 4) == 0) {
				if (((year % 100) == 0) && ((year % 400) != 0)) {
					return false;
				} else {
					return true;
				}
			} else {
				return false;
			}
		},
		Max: function( a, b ){
			var self = this;
			if (self.Compare(a, b) > 0) {
				return a;
			} else {
				return b;
			}
		},
		/**
		  * Returns a date that corresponds to the start of the day (0:00:00) of the
		  * given date.
		  * 
		*/
		AggregateToDay: function( date ){
			var self = this;
			date = self.Ensure(date);
			var is_dst = date;
			var year = is_dst[0];
			var month = is_dst[1];
			var day = is_dst[2];
			var hour = is_dst[3];
			var minute = is_dst[4];
			var second = is_dst[5];
			var wday = is_dst[6];
			var yday = is_dst[7];
			is_dst = is_dst[8];
			return [year, month, day, 0, 0, 0, undefined, undefined, undefined];
		},
		/**
		  * Does a strict comparison of the dates
		  * 
		*/
		After: function( a, b ){
			var self = this;
			return (self.Compare(a, b) > 0);
		},
		Equals: function( a, b ){
			var self = this;
			return (self.Compare(a, b) == 0);
		},
		AddYears: function( date, delta ){
			var self = this;
			date = self.Ensure(date);
			date[0] = (date[0] + delta);
			return date;
		},
		ToString: function( date ){
			var self = this;
			date = self.Copy(self.Ensure(date));
			while ((!extend.access(date,-1))) {
				date.pop();
			}
			return extend.map(date, function(_) {
				return ("" + (_ || 0));
			}).join("-");
		},
		ListPeriodsWithName: function( a, b, periodType, truncate ){
			var self = this;
			if (truncate === undefined) {truncate=true}
			var res = [];
			var start_date = self.Ensure(a);
			var end_date = self.Ensure(b);
			if (periodType == self.PERIOD_OVERALL) {
				res.push({"type":periodType, "startDate":start_date, "endDate":end_date, "duration":self.DeltaInDays(date, upUntil)});
			} else if (periodType == self.PERIOD_MONTH) {
				var months = self.ListMonths(start_date, end_date);
				// Iterates over `months`. This works on array,objects and null/undefined
				var __o=months;
				var __n=__o instanceof Array ? __o : Object.getOwnPropertyNames(__o||{});
				var __q=__n.length;
				for (var __p=0;__p<__q;__p++){
					var __m=(__n===__o)?__p:__n[__p];
					var date=__o[__m];
					// This is the body of the iteration with (value=date, key/index=__m) in __o
					var duration = self.DaysInMonth(date);;
					var rest = self.DeltaInDays(date, end_date);;
					var entire_end_date = self.AddDays(date, (duration - 1));;
					if (truncate && (rest < duration)) {
						var period_end_date = self.AddDays(date, rest);
						res.push({"type":periodType, "startDate":date, "endDate":period_end_date, "duration":(rest + 1), "entireEndDate":entire_end_date, "entireDuration":duration});
					} else {
						res.push({"type":periodType, "startDate":date, "endDate":entire_end_date, "duration":duration, "entireEndDate":entire_end_date, "entireDuration":duration});
					};
				}
			} else if (periodType == self.PERIOD_MONTH_HALF) {
				var dates = self.ListMonths(start_date, end_date);
				// Iterates over `dates`. This works on array,objects and null/undefined
				var __s=dates;
				var __t=__s instanceof Array ? __s : Object.getOwnPropertyNames(__s||{});
				var __v=__t.length;
				for (var __u=0;__u<__v;__u++){
					var __r=(__t===__s)?__u:__t[__u];
					var month_date=__s[__r];
					// This is the body of the iteration with (value=month_date, key/index=__r) in __s
					var first_half = month_date;;
					var second_half = self.AddDays(month_date, 15);;
					// Iterates over `[first_half, second_half]`. This works on array,objects and null/undefined
					var __x=[first_half, second_half];
					var __y=__x instanceof Array ? __x : Object.getOwnPropertyNames(__x||{});
					var __a=__y.length;
					for (var __z=0;__z<__a;__z++){
						var __w=(__y===__x)?__z:__y[__z];
						var date=__x[__w];
						// This is the body of the iteration with (value=date, key/index=__w) in __x
						var rest = self.DeltaInDays(date, end_date);;
						var duration = 15;;
						if (date[2] >= 15) {
							duration = (self.DaysInMonth(date) - 15);
						};
						if (rest >= 0) {
							var entire_end_date = self.AddDays(date, (duration - 1));
							if (trunc && (rest < duration)) {
								var period_end_date = self.AddDays(date, rest);
								res.push({"startDate":date, "duration":(rest + 1), "endDate":period_end_date, "entireDuration":duration, "entireEndDate":entire_end_date, "type":periodType});
							} else {
								res.push({"startDate":date, "endDate":entire_end_date, "duration":duration, "entireDuration":duration, "entireEndDate":entire_end_date, "type":periodType});
							}
						};
					};
				}
			} else if ((periodType == self.PERIOD_WEEK) || (periodType == self.PERIOD_WEEK_2)) {
				var duration = 7;
				if (periodType == self.PERIOD_WEEK_2) {
					duration = 14;
				}
				var dates = self.ListPeriods(start_date, end_date, duration);
				// Iterates over `dates`. This works on array,objects and null/undefined
				var __c=dates;
				var __d=__c instanceof Array ? __c : Object.getOwnPropertyNames(__c||{});
				var __f=__d.length;
				for (var __e=0;__e<__f;__e++){
					var __b=(__d===__c)?__e:__d[__e];
					var date=__c[__b];
					// This is the body of the iteration with (value=date, key/index=__b) in __c
					var rest = self.DeltaInDays(date, end_date);;
					var entire_end_date = self.AddDays(date, (duration - 1));;
					if (truncate && (rest < duration)) {
						var period_end_date = self.AddDays(date, rest);
						res.push({"type":periodType, "startDate":date, "duration":(rest + 1), "endDate":period_end_date, "entireDuration":duration, "entireEndDate":entire_end_date});
					} else {
						res.push({"type":periodType, "startDate":date, "endDate":entire_end_date, "duration":duration, "entireDuration":duration, "entireEndDate":entire_end_date});
					};
				}
			} else {
				extend.error(("Unexpected period type:" + periodType));
				return [];
			}
			res.sort();
			return res;
		},
		Now: function(  ){
			var self = this;
			return self.Ensure(new window.Date());
		},
		/**
		  * Returns a date that corresponds to last day of the month of the given
		  * given date.
		  * 
		*/
		AggregateToMonthEnd: function( date ){
			var self = this;
			date = self.Ensure(date);
			var is_dst = date;
			var year = is_dst[0];
			var month = is_dst[1];
			var day = is_dst[2];
			var hour = is_dst[3];
			var minute = is_dst[4];
			var second = is_dst[5];
			var wday = is_dst[6];
			var yday = is_dst[7];
			is_dst = is_dst[8];
			return [year, month, self.DaysInMonth(date), 0, 0, 0, undefined, undefined, undefined];
		},
		/**
		  * the ISO day number for this date 1==Monday, 7==Sunday
		  * 
		*/
		WeekDay: function( year, month, day ){
			var self = this;
			if (extend.isList(year)) {
				return self.WeekDay(year[0], year[1], year[2]);
			}
			!((year >= 1582)) && extend.assert(false, "dates.Date.WeekDay:", "Algorithm only valid for dates > 1582", "(failed `(year >= 1582)`)");
			!(((month >= 1) && (month <= 12))) && extend.assert(false, "dates.Date.WeekDay:", "Month must be between 1-12 inclusive", "(failed `((month >= 1) && (month <= 12))`)");
			if (month <= 2) {
				month = (month + 12);
				year = (year - 1);
			}
			var s = Math.floor((year / 100));
			var sday = (((((1720996.5 - s) + Math.floor((s / 4))) + Math.floor((365.25 * year))) + Math.floor((30.6001 * (month + 1)))) + day);
			sday = (sday - (Math.floor((sday / 7)) * 7));
			var wday = ((Math.floor(sday) + 1) % 7);
			return wday;
		},
		AddMinutes: function( date, delta ){
			var self = this;
			return self.Add(date, [0, 0, 0, 0, delta]);
		},
		/**
		  * This method is useful when you want to decompose a time lapse in periods
		  * with having the same duration (in days)
		  * 
		*/
		ListPeriodsWithDuration: function( a, b, duration ){
			var self = this;
			var start_day = self.GregorianDayNumber(a);
			var end_day = self.GregorianDayNumber(b);
			var days = (end_day - start_day);
			var res = [self.FromGregorianDayNumber(start_day)];
			while ((Math.abs(days) > 0)) {
				if (days > 0) {
					start_day = (start_day + duration);
					days = (days - duration);
					if (start_day < end_day) {
						res.push(self.FromGregorianDayNumber(start_day));
					} else {
						days = 0;
					}
				} else {
					start_day = (start_day - duration);
					days = (days + duration);
					if (start_day > end_day) {
						res.push(self.FromGregorianDayNumber(start_day));
					} else {
						days = 0;
					}
				}
			}
			return res;
		},
		/**
		  * A wrapper around `ListPeriodsWithName` and `ListPeriodsWithDuration` that
		  * will dispatch to one or the other depending on the type of `durationOrType` (number
		  * for `ListPeriodsWithDuration` and string for `ListPeriodsWithName`)
		  * 
		*/
		ListPeriods: function( a, b, durationOrType, truncate ){
			var self = this;
			if (truncate === undefined) {truncate=undefined}
			if (extend.isNumber(durationOrType)) {
				return self.ListPeriodsWithDuration(a, b, durationOrType);
			} else {
				return self.ListPeriodsWithName(a, b, durationOrType, truncate);
			}
		},
		AddWeeks: function( date, delta ){
			var self = this;
			return self.AddDays(date, (delta * 7));
		},
		/**
		  * Private function that returns the date as a JavaScript date
		  * 
		*/
		_EnsureJSDate: function( date ){
			var self = this;
			var date = self.Ensure(date);
			var is_dst = date;
			var year = is_dst[0];
			var month = is_dst[1];
			var day = is_dst[2];
			var hour = is_dst[3];
			var minute = is_dst[4];
			var second = is_dst[5];
			var wday = is_dst[6];
			var yday = is_dst[7];
			is_dst = is_dst[8];
			res = new window.Date();
			res.setUTCDate(1);
			res.setUTCFullYear(year);
			res.setUTCMonth((month - 1));
			res.setUTCDate(day);
			res.setUTCMinutes(minute);
			res.setUTCSeconds(second);
			return res;
		},
		Remove: function( date, delta ){
			var self = this;
			date = self.Ensure(date);
			delta = self.Ensure(delta);
			// Iterates over `delta`. This works on array,objects and null/undefined
			var __g=delta;
			var __h=__g instanceof Array ? __g : Object.getOwnPropertyNames(__g||{});
			var __jj=__h.length;
			for (var __ij=0;__ij<__jj;__ij++){
				var i=(__h===__g)?__ij:__h[__ij];
				var v=__g[i];
				// This is the body of the iteration with (value=v, key/index=i) in __g
				date[i] = (date[i] - v);
			}
			return self.FromGregorianDayNumber(self.GregorianDayNumber(date));
		},
		AddMonths: function( date, delta ){
			var self = this;
			var y = 0;
			var m = delta;
			if (delta > 12) {
				y = (1 * Math.floor((delta / 12)));
				m = (m % 12);
			}
			return self.Add(date, [y, m]);
		},
		FromString: function( date ){
			var self = this;
			return self.Ensure(extend.map(("" + date).split("-"), function(_) {
				return parseInt(_);
			}));
		},
		/**
		  * Returns the current date as a time tuple
		  * 
		*/
		Ensure: function( date ){
			var self = this;
			var res = date;
			if (extend.isList(date)) {
				date = date.concat();
				while ((date.length < (9 - 3))) {
					date.push(undefined);
				}
				while ((date.length < 9)) {
					date.push(undefined);
				}
				if ((date[1] <= 0) || (date[1] > 12)) {
					date[1] = undefined;
				}
				if (date[2] <= 0) {
					date[2] = undefined;
				}
				res = date;
			} else if (extend.isInstance(date, window.Date)) {
				return __module__.Date.Ensure([date.getUTCFullYear(), (date.getUTCMonth() + 1), date.getUTCDate(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCDay(), undefined, 0]);
			} else if (extend.isNumber(date)) {
				return self.GregorianDayNumber(date);
			} else {
				!(false) && extend.assert(false, "dates.Date.Ensure:", ("Unsupported date type:" + date.toSource()), "(failed `false`)");
			}
			return res;
		},
		/**
		  * Does a strict comparison of the dates
		  * 
		*/
		Before: function( a, b ){
			var self = this;
			return (self.Compare(a, b) < 0);
		},
		/**
		  * Returns a date that corresponds to first day of the year of the given
		  * given date.
		  * 
		*/
		AggregateToYear: function( date ){
			var self = this;
			date = self.Ensure(date);
			var is_dst = date;
			var year = is_dst[0];
			var month = is_dst[1];
			var day = is_dst[2];
			var hour = is_dst[3];
			var minute = is_dst[4];
			var second = is_dst[5];
			var wday = is_dst[6];
			var yday = is_dst[7];
			is_dst = is_dst[8];
			return [year, 1, 1, 0, 0, 0, undefined, undefined, undefined];
		},
		Compare: function( a, b ){
			var self = this;
			a = self.GregorianDayNumber(a);
			b = self.GregorianDayNumber(b);
			return (a - b);
		},
		/**
		  * Copies the given date object
		  * 
		*/
		Copy: function( date ){
			var self = this;
			return [].concat(self.Ensure(date));
		},
		DeltaInDays: function( a, b ){
			var self = this;
			a = self.AggregateToDay(a);
			b = self.AggregateToDay(b);
			return Math.floor((self.DeltaInSeconds(a, b) / self.SECONDS_PER_DAY));
		},
		AddDays: function( date, delta ){
			var self = this;
			return self.FromGregorianDayNumber((self.GregorianDayNumber(date) + delta));
		},
		/**
		  * Returns the current date in milliseconds
		  * 
		*/
		EnsureTimestamp: function( date ){
			var self = this;
			return (self._EnsureJSDate(date).getTime() / 1000.0);
		},
		ToTimestamp: function( date ){
			var self = this;
			date = self.Ensure(date);
			var yr = (date[0] * Math.pow(10, 12));
			var mo = ((date[1] || 1) * Math.pow(10, 10));
			var da = ((date[2] || 1) * Math.pow(10, 8));
			var ho = ((date[3] || 0) * Math.pow(10, 6));
			var mn = ((date[4] || 0) * Math.pow(10, 4));
			var se = ((date[5] || 0) * Math.pow(10, 2));
			var ms = ((date[6] || 0) * Math.pow(10, 0));
			return ("" + ((((((yr + mo) + da) + ho) + mn) + se) + ms));
		},
		DeltaInYears: function( a, b ){
			var self = this;
			a = self.AggregateToYear(a);
			b = self.AggregateToYear(b);
			return (b[0] - a[0]);
		},
		/**
		  * Returns a date that corresponds to first day of the month of the given
		  * given date.
		  * 
		*/
		AggregateToMonth: function( date ){
			var self = this;
			date = self.Ensure(date);
			var is_dst = date;
			var year = is_dst[0];
			var month = is_dst[1];
			var day = is_dst[2];
			var hour = is_dst[3];
			var minute = is_dst[4];
			var second = is_dst[5];
			var wday = is_dst[6];
			var yday = is_dst[7];
			is_dst = is_dst[8];
			return [year, month, 1, 0, 0, 0, undefined, undefined, undefined];
		},
		/**
		  * Returns the number of days in the given month
		  * 
		*/
		DaysInMonth: function( year, month ){
			var self = this;
			if (extend.isList(year)) {
				return self.DaysInMonth(year[0], year[1]);
			}
			if (month == 12) {
				return (self.GregorianDayNumber((year + 1), 1) - self.GregorianDayNumber(year, month));
			} else {
				return (self.GregorianDayNumber(year, (month + 1)) - self.GregorianDayNumber(year, month));
			}
		},
		/**
		  * Returns the number of the given day
		  * 
		*/
		GregorianDayNumber: function( y, m, d, h, mn, s ){
			var self = this;
			if (m === undefined) {m=1}
			if (d === undefined) {d=1}
			if (h === undefined) {h=0}
			if (mn === undefined) {mn=0}
			if (s === undefined) {s=0}
			if (extend.isList(y)) {
				y = self.Ensure(y);
				return self.GregorianDayNumber(y[0], y[1], y[2], y[3], y[4], y[5]);
			}
			if (m > 12) {
				y = (y + (1 * Math.floor((m / 12))));
				m = (m % 12);
			}
			d = Math.max(d, 1);
			var m = ((m + 9) % 12);
			var y = (y - Math.floor((m / 10)));
			var rest = (((((h * 60.0) + mn) * 60.0) + s) / self.SECONDS_PER_DAY);
			return (((((((365 * y) + Math.floor((y / 4))) - Math.floor((y / 100))) + Math.floor((y / 400))) + Math.floor((((m * 306) + 5) / 10))) + (d - 1)) + rest);
		},
		/**
		  * Returns the number of the period that starts on the given 'start' date, and lasts
		  * 'duration' days.
		  * 
		*/
		AggregateToPeriod: function( date, start, duration ){
			var self = this;
			date = self.Ensure(date);
			start = self.Ensure(start);
			var start_day = self.GregorianDayNumber(start);
			var date_day = self.GregorianDayNumber(date);
			var delta = (date_day - start_day);
			var padded_delta = (Math.floor((delta / duration)) * duration);
			return self.FromGregorianDayNumber((start_day + padded_delta));
		},
		/**
		  * Returns the date '[y,m,d]' for the given day number
		  * 
		*/
		FromGregorianDayNumber: function( g ){
			var self = this;
			var hms = (g - Math.floor(g));
			var g = Math.floor(g);
			var y = Math.floor((((10000 * g) + 14780) / 3652425));
			var ddd = (g - ((((365 * y) + Math.floor((y / 4))) - Math.floor((y / 100))) + Math.floor((y / 400))));
			if (ddd < 0) {
				y = (y - 1);
				ddd = (g - ((((365 * y) + Math.floor((y / 4))) - Math.floor((y / 100))) + Math.floor((y / 400))));
			}
			var mi = Math.floor((((100 * ddd) + 52) / 3060));
			var mm = (((mi + 2) % 12) + 1);
			var y = (y + Math.floor(((mi + 2) / 12)));
			var dd = ((ddd - Math.floor((((mi * 306) + 5) / 10))) + 1);
			var s = ((hms % 3600) % 60);
			var m = Math.floor(((hms % 3600) / 60));
			var h = Math.floor((hms / 3600));
			return [y, mm, dd, h, m, s];
		}
	}
})
dates.init = function(){
	var self = dates;
}
if (typeof(dates.init)!="undefined") {dates.init();}

// START:VANILLA_POSTAMBLE
return dates;})(dates);
// END:VANILLA_POSTAMBLE
