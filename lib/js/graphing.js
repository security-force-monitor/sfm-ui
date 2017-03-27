// 8< ---[graphing.js]---
/**
  * A collection of tools and functions to facilitate drawing charts in SVG.
  * 
*/
// START:VANILLA_PREAMBLE
var graphing=typeof(extend)!='undefined' ? extend.module('graphing') : (typeof(graphing)!='undefined' ? graphing : {});
(function(graphing){
var __module__=graphing;
// END:VANILLA_PREAMBLE

graphing.__VERSION__='0.1.0';
graphing.PRECISION = 1e-07;

graphing.Path = extend.Class({
	name  :'graphing.Path',
	parent: undefined,
	shared: {
		RECYCLING: []
	},
	properties: {
		path:undefined,
		length:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `path`
		if (typeof(self.path)=='undefined') {self.path = [];};
		// Default value for property `length`
		if (typeof(self.length)=='undefined') {self.length = 0;};
	},
	methods: {
		reset: function() {
			var self = this;
			self.path = [];
			self.length = 0;
		},
		
		dispose: function() {
			var self = this;
			self.reset();
			self.getClass().RECYCLING.push(self);
		},
		
		m: function(x, y) {
			var self = this;
			return self.move(x, y);
		},
		
		l: function(x, y) {
			var self = this;
			return self.line(x, y);
		},
		
		c: function(x, y) {
			var self = this;
			return self.curve(x, y);
		},
		
		z: function() {
			var self = this;
			return self.close();
		},
		
		move: function(x, y) {
			var self = this;
			self.path.push("M");
			self.length = (self.length + 1);
			return self._pushCoords(x, y);
		},
		
		line: function(x, y) {
			var self = this;
			if (self.length == 0) {
				self.path.push("M");
			} else {
				self.path.push(" L");
			}
			self.length = (self.length + 1);
			return self._pushCoords(x, y);
		},
		
		close: function() {
			var self = this;
			self.path.push(" Z");
			return self;
		},
		
		curve: function(cx1, cy1, cx2, cy2, dx, dy) {
			var self = this;
			self.path.push(" C");
			self.length = (self.length + 1);
			if (((!extend.isDefined(cy2)) && (!extend.isDefined(dx))) && (!extend.isDefined(dy))) {
				self._pushCoords(cx1);
				self.path.push(" ");
				self._pushCoords(cy1);
				self.path.push(" ");
				return self._pushCoords(cx2);
			} else {
				self._pushCoords(cx1, cy1);
				self.path.push(" ");
				self._pushCoords(cx2, cy2);
				self.path.push(" ");
				return self._pushCoords(dx, dy);
			}
		},
		
		_pushCoords: function(x, y) {
			var self = this;
			if ((!extend.isDefined(y)) && extend.isList(x)) {
				self.path.push(__module__.round(x[0]));
				self.path.push(",");
				self.path.push(__module__.round(x[1]));
			} else {
				self.path.push(__module__.round(x));
				self.path.push(",");
				self.path.push(__module__.round(y));
			}
			return self;
		},
		
		asString: function() {
			var self = this;
			return self.path.join("");
		},
		
		end: function() {
			var self = this;
			var r = self.asString();
			self.dispose();
			return r;
		},
		
		apply: function(path) {
			var self = this;
			path.setAttribute("d", self.end());
			return path;
		}
	},
	operations:{
		/**
		  * Creates a path from a series of [x,y] points
		  * 
		*/
		FromPoints: function( points ){
			var self = this;
			var p = self.Get();
			// Iterates over `points`. This works on array,objects and null/undefined
			var __j=points;
			var __k=__j instanceof Array ? __j : Object.getOwnPropertyNames(__j||{});
			var __m=__k.length;
			for (var __l=0;__l<__m;__l++){
				var __i=(__k===__j)?__l:__k[__l];
				var _=__j[__i];
				// This is the body of the iteration with (value=_, key/index=__i) in __j
				p.l(_[0], _[1]);
			}
			return p;
		},
		Get: function(  ){
			var self = this;
			if (extend.len(self.RECYCLING) == 0) {
				return new __module__.Path();
			} else {
				return self.RECYCLING.pop();
			}
		}
	}
})

graphing.SVG = extend.Class({
	name  :'graphing.SVG',
	parent: undefined,
	initialize: function(){
		var self = this;
	},
	operations:{
		Center: function( e, p ){
			var self = this;
			if (p === undefined) {p=[0, 0]}
			var s = dimension.sizeA(e);
			var x = (p[0] - (s[0] / 2));
			var y = (p[1] - (s[1] / 2));
			return self.Position(e, [x, y]);
		},
		/**
		  * Sets the path's dash-array so that only a subset of the path is drawn
		  * 
		*/
		PartialStroke: function( path, percent, reverse ){
			var self = this;
			if (reverse === undefined) {reverse=false}
			if (path.jquery) {
				// Iterates over `path`. This works on array,objects and null/undefined
				var __n=path;
				var __p=__n instanceof Array ? __n : Object.getOwnPropertyNames(__n||{});
				var __r=__p.length;
				for (var __q=0;__q<__r;__q++){
					var __o=(__p===__n)?__q:__p[__q];
					var _=__n[__o];
					// This is the body of the iteration with (value=_, key/index=__o) in __n
					self.PartialStroke(_, percent, reverse);
				}
			} else {
				if (extend.isNumber(percent)) {
					percent = [0, percent];
				}
				var length = self.PathLength(path);
				var stroke_start = Math.round((percent[0] * length));
				var stroke_end = Math.round((percent[1] * length));
				var stroke_length = (stroke_end - stroke_start);
				var skip_length = length;
				var stroke_offset = (0 - stroke_start);
				if (reverse) {
					stroke_offset = (stroke_offset + (stroke_length - length));
				}
				path.setAttribute("stroke-dasharray", ((stroke_length + " , ") + skip_length));
				path.setAttribute("stroke-dashoffset", ("" + stroke_offset));
			}
		},
		/**
		  * Splits the text so that it contains no more than N words per line
		  * 
		*/
		Text: function(  ){
			var self = this;
		},
		RemoveClass: function( e, name ){
			var self = this;
			return self.SetClass(e, name, false);
		},
		Pie: function( startAngle, endAngle, radius, center ){
			var self = this;
			var arc = __module__.SVG.Arc(startAngle, endAngle, radius, center);
			arc = ("L" + extend.slice(arc,1,undefined));
			return (((((("M " + center[0]) + " ") + center[1]) + " ") + arc) + " Z");
		},
		SetClass: function( e, name, value ){
			var self = this;
			if (value === undefined) {value=true}
			var c = (e.getAttribute("class") || "");
			if (value) {
				if (c.indexOf(name) == -1) {
					e.setAttribute("class", ((c + " ") + name));
				}
			} else {
				if (c.indexOf(name) != -1) {
					e.setAttribute("class", extend.filter(c.split(" "), function(_) {
						return (_ != name);
					}).join(" "));
				}
			}
			return e;
		},
		/**
		  * Creates a path data that draws a donut with the given properties. Angles
		  * are in degrees. Note that angles are in degrees
		  * 
		*/
		Donut: function( startAngle, endAngle, radius, width, center ){
			var self = this;
			var center = (center || [radius, radius]);
			startAngle = (startAngle - 90);
			endAngle = (endAngle - 90);
			var angle_delta = Math.abs((endAngle - startAngle));
			if (angle_delta == 360) {
				endAngle = (endAngle - 0.01);
			}
			var inner_radius = (radius - width);
			var sa = ((Math.PI * startAngle) / 180.0);
			var ea = ((Math.PI * endAngle) / 180.0);
			var a_x = (center[0] + (Math.cos(sa) * radius));
			var a_y = (center[1] + (Math.sin(sa) * radius));
			var b_x = (center[0] + (Math.cos(ea) * radius));
			var b_y = (center[1] + (Math.sin(ea) * radius));
			var c_x = (center[0] + (Math.cos(ea) * inner_radius));
			var c_y = (center[1] + (Math.sin(ea) * inner_radius));
			var d_x = (center[0] + (Math.cos(sa) * inner_radius));
			var d_y = (center[1] + (Math.sin(sa) * inner_radius));
			var a_span = (((angle_delta > 180) && 1) || 0);
			var outer_arc = ((((((((((((("M" + a_x) + ",") + a_y) + " A") + radius) + ",") + radius) + " 0 ") + a_span) + ",1 ") + b_x) + ",") + b_y);
			var inner_arc = ((((((((((((("L" + c_x) + ",") + c_y) + " A") + inner_radius) + ",") + inner_radius) + " 0 ") + a_span) + ",0 ") + d_x) + ",") + d_y);
			if (angle_delta == 360) {
				outer_arc = (outer_arc + (((" L" + a_x) + ",") + a_y));
				inner_arc = (inner_arc + (((" L" + c_x) + ",") + c_y));
			}
			if (width == 0) {
				return outer_arc;
			} else {
				return (((((("M" + center[0]) + ",") + center[1]) + outer_arc) + inner_arc) + " Z");
			}
		},
		Arc: function( startAngle, endAngle, radius, center ){
			var self = this;
			return __module__.SVG.Donut(startAngle, endAngle, radius, 0, center);
		},
		/**
		  * Returns the {x:float,y:float} position of the point at `percent` (from 0 to 1)
		  * percent of the given path (path or line element)
		  * 
		*/
		PointAt: function( node, percent, reverse ){
			var self = this;
			if (reverse === undefined) {reverse=false}
			if (!node) {
				return extend.error("graphing.getPointAt: No node");
			}
			if (node.jquery) {
				node = node[0];
			}
			if (percent < 0) {
				percent = (Math.abs((1.0 - percent)) % 1);
			}
			if (reverse) {
				percent = (1.0 - percent);
			}
			if (node.nodeName == "line") {
				var x1 = parseFloat(node.getAttribute("x1"));
				var y1 = parseFloat(node.getAttribute("y1"));
				var x2 = parseFloat(node.getAttribute("x2"));
				var y2 = parseFloat(node.getAttribute("y2"));
				return {"x":(x1 + ((x2 - x1) * percent)), "y":(y1 + ((y2 - y1) * percent))};
			} else {
				var offset = (node.getTotalLength() * percent);
				return node.getPointAtLength(offset);
			}
		},
		PathLength: function( path ){
			var self = this;
			if (path.nodeName == "line") {
				var x1 = parseFloat(path.getAttribute("x1"));
				var x2 = parseFloat(path.getAttribute("x2"));
				var y1 = parseFloat(path.getAttribute("y1"));
				var y2 = parseFloat(path.getAttribute("y2"));
				var dx = (x2 - x1);
				var dy = (y2 - y1);
				return Math.sqrt(((dx * dx) + (dy * dy)));
			} else if (path.nodeName == "path") {
				return path.getTotalLength();
			} else {
				extend.error("SVG.PathLength: only path or line supported");
				return undefined;
			}
		},
		Position: function( e, p ){
			var self = this;
			if (e.nodeName == "circle") {
				e.setAttribute("cx", __module__.round(p[0]));
				e.setAttribute("cy", __module__.round(p[1]));
			} else {
				e.setAttribute("x", __module__.round(p[0]));
				e.setAttribute("y", __module__.round(p[1]));
			}
			return e;
		},
		AddClass: function( e, name ){
			var self = this;
			return self.SetClass(e, name, true);
		}
	}
})

graphing.Layout = extend.Class({
	name  :'graphing.Layout',
	parent: undefined,
	initialize: function(){
		var self = this;
	},
	operations:{
		/**
		  * Returns the size/height of a grid that would contain `count` elements
		  * 
		*/
		Grid: function( count, wider ){
			var self = this;
			if (wider === undefined) {wider=true}
			var w = 0;
			var h = 0;
			if (wider) {
				w = Math.ceil(Math.sqrt(count));
				h = Math.floor(Math.sqrt(count));
			} else {
				w = Math.floor(Math.sqrt(count));
				h = Math.ceil(Math.sqrt(count));
			}
			if ((w * h) < count) {
				h = (h + 1);
			}
			!(((w * h) >= count)) && extend.assert(false, "graphing.Layout.Grid:", "Layout.Grid: number of cells does not cover count", "(failed `((w * h) >= count)`)");
			!((((w * h) - count) < w)) && extend.assert(false, "graphing.Layout.Grid:", "Layout.Grid: grid is too big", "(failed `(((w * h) - count) < w)`)");
			return [w, h];
		}
	}
})

graphing.Canvas = extend.Class({
	name  :'graphing.Canvas',
	parent: undefined,
	initialize: function(){
		var self = this;
	},
	operations:{
		Clear: function( canvas ){
			var self = this;
			canvas.context.clearRect(0, 0, canvas.width, canvas.height);
		},
		Get: function( canvas, width, height ){
			var self = this;
			if (width === undefined) {width=undefined}
			if (height === undefined) {height=undefined}
			if (extend.isString(canvas)) {
				canvas = $(canvas);
			}
			if (canvas.jquery) {
				canvas = canvas[0];
			}
			var size = dimension.sizeA(canvas);
			width = parseInt(((width || canvas.getAttribute("width")) || size[0]));
			height = parseInt(((height || canvas.getAttribute("height")) || size[1]));
			canvas.setAttribute("width", ("" + width));
			canvas.setAttribute("height", ("" + height));
			return {"context":canvas.getContext("2d"), "element":canvas, "width":width, "height":height};
		}
	}
})
/**
  * This allows to keep all the values within the same precision interval. This
  * is especially useful if you're mappint a position to SVG attributes, as the
  * "1.234e+10" notation is not supported by SVG.
  * 
*/
graphing.round = function(value, precision){
	var self = graphing;
	if (precision === undefined) {precision=__module__.PRECISION}
	if ((value > 0) && (value < precision)) {
		return 0;
	} else if ((value < 0) && ((0 - precision) < value)) {
		return 0;
	} else {
		return value;
	}
}
/**
  * Alias to `Path.Get()
  * 
*/
graphing.path = function(){
	var self = graphing;
	return __module__.Path.Get();
}
graphing.init = function(){
	var self = graphing;
}
if (typeof(graphing.init)!="undefined") {graphing.init();}

// START:VANILLA_POSTAMBLE
return graphing;})(graphing);
// END:VANILLA_POSTAMBLE
