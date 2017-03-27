// 8< ---[colors.js]---
// START:VANILLA_PREAMBLE
var colors=typeof(extend)!='undefined' ? extend.module('colors') : (typeof(colors)!='undefined' ? colors : {});
(function(colors){
var __module__=colors;
// END:VANILLA_PREAMBLE

colors.__VERSION__='0.0.0';
colors.LICENSE = "http://ffctn.com/doc/licenses/bsd";

colors.Color = extend.Class({
	name  :'colors.Color',
	parent: undefined,
	properties: {
		value:undefined
	},
	initialize: function( value ){
		var self = this;
		if (value === undefined) {value=[0, 0, 0]}
		// Default initialization of property `value`
		if (typeof(self.value)=='undefined') {self.value = null;};
		self.value = value;
	},
	methods: {
		fromHex: function(value) {
			var self = this;
			self.value = self.getClass().getOperation('FromHex')(value);
		},
		
		toHex: function() {
			var self = this;
			return self.getClass().getOperation('ToHex')(self.value);
		}
	},
	operations:{
		/**
		  * Interpolates the given color model, which is an array of
		  * `[step, [R, G, B]]`, where step is in increasing order.
		  * 
		  * For instance:
		  * 
		  * >    interpolate [ [0, [255,255,255]], [3, [0,0,0]]]
		  * 
		  * 
		  * Will create a gradient of 4 colors from white to black.
		  * 
		*/
		Gradient: function( model ){
			var self = this;
			var values = [{"isKey":true, "color":model[0][1]}];
			extend.reduce(model, function(a, b) {
				var interpolation_steps = (b[0] - a[0]);
				var interpolation_step = (1 / interpolation_steps);
				var i = 0;
				if (interpolation_steps > 0) {
					while ((i < interpolation_steps)) {
						var t = (interpolation_step * i);
						if (i > 0) {
							var v = stats.interpolate(a[1], b[1], t);
							values.push({"isKey":false, "color":v});
						}
						i = (i + 1);
					}
				}
				values.push({"isKey":true, "color":b[1]});
				return b;
			});
			return values;
		},
		FromHex: function( value ){
			var self = this;
			if (!value) {
				return null;
			}
			if (value[0] == "#") {
				value = extend.slice(value,1,undefined);
			}
			var r = extend.slice(value,0,2);
			r = parseInt(r, 16);
			var g = extend.slice(value,2,4);
			g = parseInt(g, 16);
			var b = extend.slice(value,4,6);
			b = parseInt(b, 16);
			return [r, g, b];
		},
		Pad: function( text, length, pad ){
			var self = this;
			if (length === undefined) {length=2}
			if (pad === undefined) {pad="0"}
			while ((text.length < length)) {
				text = (pad + text);
			}
			return text;
		},
		ToHex: function( value ){
			var self = this;
			var res = ("#" + self.Pad(parseInt(value[0]).toString(16), 2));
			res = (res + self.Pad(parseInt(value[1]).toString(16), 2));
			res = (res + self.Pad(parseInt(value[2]).toString(16), 2));
			res = res.toUpperCase();
			return res;
		}
	}
})
colors.fromhex = function(c){
	var self = colors;
	return __module__.Color.FromHex(c);
}
colors.hex = function(c){
	var self = colors;
	return __module__.Color.ToHex(c);
}
colors.gradient = function(g){
	var self = colors;
	return __module__.Color.Gradient(g);
}
colors.init = function(){
	var self = colors;
}
if (typeof(colors.init)!="undefined") {colors.init();}

// START:VANILLA_POSTAMBLE
return colors;})(colors);
// END:VANILLA_POSTAMBLE
