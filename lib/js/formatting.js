// 8< ---[formatting.js]---
// START:VANILLA_PREAMBLE
var formatting=typeof(extend)!='undefined' ? extend.module('formatting') : (typeof(formatting)!='undefined' ? formatting : {});
(function(formatting){
var __module__=formatting;
// END:VANILLA_PREAMBLE

formatting.__VERSION__='0.2.0';
formatting.LETTERS_UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
formatting.LICENSE = "http://ffctn.com/licenses/bsd";

formatting.Text = extend.Class({
	name  :'formatting.Text',
	parent: undefined,
	initialize: function(){
		var self = this;
	},
	operations:{
		/**
		  * Cuts the given text if it exceeds the `max` given characters. The returned string will always
		  * be less than `max` characters, including the appended `ellipsis`.
		  * 
		*/
		Cut: function( text, max, ellipsis ){
			var self = this;
			if (max === undefined) {max=150}
			if (ellipsis === undefined) {ellipsis="..."}
			if (text.length > max) {
				max = (max - ellipsis.length);
				if (text[max] == " ") {
					text = extend.slice(text,0,max);
				} else {
					text = extend.slice(text,0,max);
					var i = 0;
					var imax = Math.min(20, text.length);
					while (((i < imax) && (text[(max - i)] != " "))) {
						i = (i + 1);
					}
					if (text[i] == " ") {
						text = extend.slice(text,0,(max - i));
					}
				}
				text = (text + ellipsis);
			}
			return text;
		},
		Capitalize: function( text ){
			var self = this;
			var res = [];
			// Iterates over `text.split(" ")`. This works on array,objects and null/undefined
			var __j=text.split(" ");
			var __k=__j instanceof Array ? __j : Object.getOwnPropertyNames(__j||{});
			var __m=__k.length;
			for (var __l=0;__l<__m;__l++){
				var __i=(__k===__j)?__l:__k[__l];
				var word=__j[__i];
				// This is the body of the iteration with (value=word, key/index=__i) in __j
				word = word.toLowerCase();
				word = (word[0].toUpperCase() + extend.slice(word,1,undefined));
				res.push(word);
			}
			return res.join(" ");
		}
	}
})

formatting.Number = extend.Class({
	name  :'formatting.Number',
	parent: undefined,
	shared: {
		THOUSAND_SEPARATOR: ",",
		CURRENCY: "$",
		RE_NUMBER: new RegExp("(\\d+)(\\d{3})"),
		DECIMAL_PRECISION: 3,
		DECIMAL_SEPARATOR: "."
	},
	initialize: function(){
		var self = this;
	},
	operations:{
		/**
		  * Takes the given percentage as a an int (0-100)
		  * 
		*/
		PercentageInt: function( n, mode, dec ){
			var self = this;
			if (mode === undefined) {mode=""}
			if (dec === undefined) {dec=self.DECIMAL_SEPARATOR}
			var res = (self.Integer(n, 0, "", dec) + "%");
			if (mode == "+") {
				if (n > 0) {
					res = ("+" + res);
				}
			}
			return res;
		},
		MoneyUS: function( n, currency, mil, dec ){
			var self = this;
			if (currency === undefined) {currency=self.CURRENCY}
			if (mil === undefined) {mil=self.THOUSAND_SEPARATOR}
			if (dec === undefined) {dec=self.DECIMAL_SEPARATOR}
			return (currency + __module__.Number.Float(n, 2, mil, dec));
		},
		AsLetter: function( n ){
			var self = this;
			res = [];
			!((n < (26 * 26))) && extend.assert(false, "formatting.Number.AsLetter:", "", "(failed `(n < (26 * 26))`)");
			if (n >= 26) {
				var div = ((n / 26) - 1);
				var mod = (n % 26);
				return (__module__.LETTERS_UPPERCASE[div] + __module__.LETTERS_UPPERCASE[mod]);
			} else {
				return __module__.LETTERS_UPPERCASE[n];
			}
		},
		Money: function( n, currency, mil, dec ){
			var self = this;
			if (currency === undefined) {currency=self.CURRENCY}
			if (mil === undefined) {mil=self.THOUSAND_SEPARATOR}
			if (dec === undefined) {dec=self.DECIMAL_SEPARATOR}
			return (__module__.Number.Float(n, 2, mil, dec) + currency);
		},
		Float: function( n, precision, mil, dec ){
			var self = this;
			if (precision === undefined) {precision=self.DECIMAL_PRECISION}
			if (mil === undefined) {mil=self.THOUSAND_SEPARATOR}
			if (dec === undefined) {dec=self.DECIMAL_SEPARATOR}
			var base = formatting.Number.Integer(n, mil);
			return ((base + dec) + formatting.Number.Decimals(n, precision));
		},
		AsFileSize: function( bytes ){
			var self = this;
			if (bytes == 0) {
				return "0 B";
			}
			var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
			var i = parseInt(Math.floor((Math.log(bytes) / Math.log(1024))));
			return (((bytes / Math.pow(1024, i)).toFixed(1) + " ") + sizes[i]);
		},
		Letter: function( n ){
			var self = this;
			res = [];
			!((n < (26 * 26))) && extend.assert(false, "formatting.Number.Letter:", "", "(failed `(n < (26 * 26))`)");
			if (n >= 26) {
				var div = ((n / 26) - 1);
				var mod = (n % 26);
				return (__module__.LETTERS_UPPERCASE[div] + __module__.LETTERS_UPPERCASE[mod]);
			} else {
				return __module__.LETTERS_UPPERCASE[n];
			}
		},
		Year: function( n ){
			var self = this;
			return self.Integer(n, "");
		},
		Integer: function( n, sep ){
			var self = this;
			if (sep === undefined) {sep=self.THOUSAND_SEPARATOR}
			var neg = (n < 0);
			var n = Math.abs(n);
			var s = ("" + n).split(".")[0];
			var r = "";
			var i = 0;
			while ((i < s.length)) {
				var c = s[((s.length - 1) - i)];
				if (((i > 0) && (i < (s.length - 1))) && (((i + 1) % 3) == 0)) {
					r = ((sep + c) + r);
				} else {
					r = (c + r);
				}
				i = (i + 1);
			}
			if (neg) {
				r = ("-" + r);
			}
			return r;
		},
		/**
		  * Takes the given percentage as a float (0.0-1.0)
		  * 
		*/
		Percentage: function( n, precision, mode, dec ){
			var self = this;
			if (precision === undefined) {precision=self.DECIMAL_PRECISION}
			if (mode === undefined) {mode=""}
			if (dec === undefined) {dec=self.DECIMAL_SEPARATOR}
			var res = undefined;
			if (precision == 0) {
				res = (__module__.Number.Integer((n * 100), precision, "", dec) + "%");
			} else {
				res = (__module__.Number.Float((n * 100), precision, "", dec) + "%");
			}
			if (mode == "+") {
				if (n > 0) {
					res = ("+" + res);
				}
			}
			return res;
		},
		Decimals: function( n, precision ){
			var self = this;
			if (precision === undefined) {precision=self.DECIMAL_PRECISION}
			n = (n - Math.floor(n));
			n = (n * Math.pow(10, precision));
			n = ("" + parseInt(n));
			while ((n.length < precision)) {
				n = (n + "0");
			}
			return n;
		},
		Any: function( n, precision ){
			var self = this;
			if (precision === undefined) {precision=self.DECIMAL_PRECISION}
			if (parseInt(n) == n) {
				return __module__.Number.Integer(n);
			} else {
				return __module__.Number.Float(n, precision);
			}
		}
	}
})

formatting.Date = extend.Class({
	name  :'formatting.Date',
	parent: undefined,
	shared: {
		SHORT_MONTHS: [null, "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	},
	initialize: function(){
		var self = this;
	},
	methods: {
		/**
		  * Normalizes the date to UTC time (int)
		  * 
		*/
		normalize: function(date) {
			var self = this;
			return __module__.Date.UTC(date.getUTCYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
		},
		
		since: function(date, now) {
			var self = this;
			if (now === undefined) {now=new __module__.Date()}
			var delta = (self.normalize(now) - self.normalize(date));
			if (delta < __module__.Time.m(1)) {
				return ((Math.round(__module__.Time.to.s(delta)) + " ") + "seconds ago");
			} else if (delta < __module__.Time.h(1)) {
				return ((Math.round(__module__.Time.extract.m(delta)) + " ") + "minutes ago");
			} else if (delta < __module__.Time.d(1)) {
				return ((Math.round(__module__.Time.extract.h(delta)) + " ") + "hours ago");
			} else if (delta < __module__.Time.d(2)) {
				return "yesterday";
			} else if (delta < __module__.Time.w(1)) {
				return ((Math.round(__module__.Time.extract.d(delta)) + " ") + "days ago");
			} else if (delta < __module__.Time.y(1)) {
				return "Not implemented";
			} else {
				return "Not implemented";
			}
		}
	}
})

formatting.Time = extend.Class({
	name  :'formatting.Time',
	parent: undefined,
	shared: {
		extract: {"s":function(v) {
			return (v / parseFloat(__module__.Time.s(1)));
		}, "m":function(v) {
			return (v / parseFloat(__module__.Time.m(1)));
		}, "h":function(v) {
			return (v / parseFloat(__module__.Time.h(1)));
		}, "d":function(v) {
			return (v / parseFloat(__module__.Time.d(1)));
		}, "w":function(v) {
			return (v / parseFloat(__module__.Time.w(1)));
		}, "y":function(v) {
			return (v / parseFloat(__module__.Time.y(1)));
		}, "day":function(v) {
			return (v / parseFloat(__module__.Time.day(1)));
		}, "week":function(v) {
			return (v / parseFloat(__module__.Time.week(1)));
		}, "year":function(v) {
			return (v / parseFloat(__module__.Time.year(1)));
		}}
	},
	initialize: function(){
		var self = this;
	},
	operations:{
		week: function( value ){
			var self = this;
			return self.day((value * 7));
		},
		d: function( value ){
			var self = this;
			return self.day(value);
		},
		h: function( value ){
			var self = this;
			return self.m((value * 60));
		},
		AsDuration: function( seconds, unit ){
			var self = this;
			if (unit === undefined) {unit=true}
			var s = (seconds % 60);
			var m = (Math.floor((seconds / 60)) % 60);
			var h = Math.floor((m / 60));
			var r = null;
			var u = "";
			if (h > 0) {
				r = extend.sprintf("%02d:%02d:%02d", h, m, s);
			} else if (m > 0) {
				r = extend.sprintf("%02d:%02d", m, s);
				u = "min";
			} else {
				r = extend.sprintf("%d", s);
				u = "s";
			}
			if (unit) {
				r = (r + u);
			}
			return r;
		},
		m: function( value ){
			var self = this;
			return self.s((value * 60));
		},
		w: function( value ){
			var self = this;
			return self.week(value);
		},
		s: function( value ){
			var self = this;
			return self.ms((value * 1000));
		},
		ms: function( value ){
			var self = this;
			return value;
		},
		year: function( value ){
			var self = this;
			return self.week((value * 52));
		},
		y: function( value ){
			var self = this;
			return self.year(value);
		},
		day: function( value ){
			var self = this;
			return self.h((value * 24));
		},
		decompose: function( value ){
			var self = this;
			var res = {};
			// Iterates over `["ms", "s", "m", "h", "d", "w", "y"]`. This works on array,objects and null/undefined
			var __n=["ms", "s", "m", "h", "d", "w", "y"];
			var __p=__n instanceof Array ? __n : Object.getOwnPropertyNames(__n||{});
			var __r=__p.length;
			for (var __q=0;__q<__r;__q++){
				var __o=(__p===__n)?__q:__p[__q];
				var unit=__n[__o];
				// This is the body of the iteration with (value=unit, key/index=__o) in __n
				res[unit] = Math.floor(self.extract[unit](value));
			}
			return res;
		}
	}
})
formatting.plural = function(value, singular, plural){
	var self = formatting;
	if (plural === undefined) {plural=(singular + "s")}
	if ((Math.abs(value) > 1) || (extend.len(value) > 1)) {
		return plural;
	} else {
		return singular;
	}
}
formatting.init = function(){
	var self = formatting;
	if (typeof(widgets) != "undefined") {
		widgets.FORMATTERS.percentage = function(v) {
			return __module__.Number.Percentage(v);
		};
	}
}
if (typeof(formatting.init)!="undefined") {formatting.init();}

// START:VANILLA_POSTAMBLE
return formatting;})(formatting);
// END:VANILLA_POSTAMBLE
