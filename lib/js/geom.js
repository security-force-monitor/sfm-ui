// 8< ---[geom.js]---
/**
  * A geometry module. Geometry elements are represented as arrays of floats and
  * the classes implement operations on them.
  * 
  * Here are the main data types
  * 
  * Point2D = (x:float, y:float)
  * Point3D = (x:float, y:float, z:float)
  * Vector  = (a:Point, b:Point)
  * 
*/
// START:VANILLA_PREAMBLE
var geom=typeof(extend)!='undefined' ? extend.module('geom') : (typeof(geom)!='undefined' ? geom : {});
(function(geom){
var __module__=geom;
// END:VANILLA_PREAMBLE

geom.__VERSION__='0.6.0';
geom.LICENSE = "http://ffctn.com/doc/licenses/bsd";
/**
  * Createas a float buffer of the given size
  * 
*/
geom.buffer = function(size){
	var self = geom;
	if (typeof(Float64Array) != "undefined") {
		return new Float64Array(size);
	} else if (typeof(Array) != "undefined") {
		return new Array(size);
	} else {
		var r = [];
		while ((size > 0)) {
			r.push(0.0);
			size = (size - 1);
		}
		return r;
	}
}
/**
  * An alias to Point Create2D/Create3D
  * 
*/
geom.point = function(x, y, z){
	var self = geom;
	if (z === undefined) {z=undefined}
	if (extend.isDefined(z)) {
		return __module__.Point.Create2D(x, y);
	} else {
		return __module__.Point.Create3D(x, y, z);
	}
}
/**
  * A series of operations that maniuplate a 2D or 3D array of floats representing
  * a point in 2D or 3D space.
  * 
*/
geom.Point = extend.Class({
	name  :'geom.Point',
	parent: undefined,
	shared: {
		Y: 1,
		X: 0,
		Z: 2,
		ORIGIN: [0, 0, 0]
	},
	initialize: function(){
		var self = this;
	},
	operations:{
		Min: function( point, value ){
			var self = this;
			point[0] = Math.min(point[0], value[0]);
			point[1] = Math.min(point[1], value[1]);
			if ((extend.len(point) > 2) && (extend.len(value) > 2)) {
				point[2] = Math.min(point[2], value[2]);
			}
			return point;
		},
		Invert: function( point ){
			var self = this;
			point[0] = (0 - point[0]);
			point[1] = (0 - point[1]);
			if (extend.len(point) > 2) {
				point[2] = (0 - point[2]);
			}
			return point;
		},
		Create2D: function( x, y ){
			var self = this;
			if (x === undefined) {x=0}
			if (y === undefined) {y=0}
			var p = __module__.buffer(2);
			p[0] = x;
			p[1] = y;
			return p;
		},
		Repr: function( p ){
			var self = this;
			if (extend.len(p) == 2) {
				return extend.sprintf("point( x=%0.2f, y=%0.2f )", p[self.X], p[self.Y]);
			} else {
				return extend.sprintf("point( x=%0.2f, y=%0.2f, z=%0.2f )", p[self.X], p[self.Y], p[self.Z]);
			}
		},
		Add: function( point, value ){
			var self = this;
			if (extend.isNumber(value)) {
				point[0] = (value + point[0]);
				point[1] = (value + point[1]);
				if (point.length == 3) {
					point[2] = (value + point[2]);
				}
			} else {
				point[0] = (value[0] + point[0]);
				point[1] = (value[1] + point[1]);
				if ((point.length >= 3) && (extend.len(value) >= 3)) {
					point[2] = (value[2] + point[2]);
				}
			}
			return point;
		},
		FromObject: function( a ){
			var self = this;
			if (extend.isDefined(a.z)) {
				return __module__.Point.New3D(a.x, a.y, a.z);
			} else {
				return __module__.Point.New3D(a.x, a.y);
			}
		},
		Max: function( point, value ){
			var self = this;
			point[0] = Math.max(point[0], value[0]);
			point[1] = Math.max(point[1], value[1]);
			if ((extend.len(point) > 2) && (extend.len(value) > 2)) {
				point[2] = Math.max(point[2], value[2]);
			}
			return point;
		},
		FromPolar: function( alpha, r, correct ){
			var self = this;
			if (correct === undefined) {correct=(0 - (Math.PI / 2))}
			return self.Create2D((Math.cos((alpha + correct)) * r), (Math.sin((alpha + correct)) * r));
		},
		/**
		  * Returns a new point that represents the delta between A and B
		  * 
		*/
		Delta: function( vectorA, vectorB, result ){
			var self = this;
			if (result === undefined) {result=undefined}
			if (vectorA.length == 2) {
				result = (result || __module__.Vector.Create2D());
				result[0] = (vectorB[0] - vectorA[0]);
				result[1] = (vectorB[1] - vectorA[1]);
				return result;
			} else {
				result = (result || __module__.Vector.Create2D());
				result[0] = (vectorB[0] - vectorA[0]);
				result[1] = (vectorB[1] - vectorA[1]);
				result[2] = (vectorB[2] - vectorA[2]);
				return result;
			}
		},
		Multiply: function( point, value ){
			var self = this;
			if (extend.isNumber(value)) {
				point[0] = (point[0] * value);
				point[1] = (point[1] * value);
				if (point.length == 3) {
					point[2] = (point[2] * value);
				}
			} else {
				point[0] = (point[0] * value[0]);
				point[1] = (point[1] * value[1]);
				if ((point.length >= 3) && (extend.len(value) >= 3)) {
					point[2] = (point[2] * value[2]);
				}
			}
			return point;
		},
		Copy: function( point, destination ){
			var self = this;
			if (destination === undefined) {destination=undefined}
			if (!extend.isDefined(destination)) {
				if (point.length == 2) {
					return __module__.Vector.Create2D(point[0], point[1]);
				} else if (point.length == 3) {
					return __module__.Vector.Create3D(point[0], point[1], point[2]);
				} else {
					extend.fail("Vector can only be 2D or 3D");
				}
			} else {
				if (point.length == 2) {
					destination[0] = point[0];
					destination[1] = point[1];
				} else if ((point.length == 3) && (destination.length >= 3)) {
					destination[0] = point[0];
					destination[1] = point[1];
					destination[2] = point[2];
				}
				return point;
			}
		},
		Reset: function( p ){
			var self = this;
			p[0] = 0;
			p[1] = 0;
			if (p.length >= 3) {
				p[2] = 0;
			}
			return p;
		},
		Distance: function( vectorAOrDelta, vectorB ){
			var self = this;
			if (vectorB === undefined) {vectorB=undefined}
			if (!(vectorB === undefined)) {
				vectorAOrDelta = self.Delta(vectorAOrDelta, vectorB);
			}
			var delta = vectorAOrDelta;
			var xy_dist = Math.sqrt(((delta[0] * delta[0]) + (delta[1] * delta[1])));
			if (delta.length == 3) {
				var xyz_dist = Math.sqrt(((xy_dist * xy_dist) + (delta[2] * delta[2])));
				return xyz_dist;
			} else {
				return xy_dist;
			}
		},
		FromValue: function( v ){
			var self = this;
			if (extend.isList(v)) {
				return self.FromArray(v);
			} else {
				return self.FromObject(v);
			}
		},
		/**
		  * Returns the translation vector do center A into B
		  * 
		*/
		Center: function( a, b ){
			var self = this;
			if (extend.len(a) == 2) {
				return __module__.Point.Create2D(((b[0] - a[0]) / 2), ((b[1] - a[1]) / 2));
			} else {
				return __module__.Point.Create3D(((b[0] - a[0]) / 2), ((b[1] - a[1]) / 2), ((b[2] - a[2]) / 2));
			}
		},
		Create3D: function( x, y, z ){
			var self = this;
			if (x === undefined) {x=0}
			if (y === undefined) {y=0}
			if (z === undefined) {z=0}
			var p = __module__.buffer(3);
			p[0] = x;
			p[1] = y;
			p[2] = z;
			return p;
		},
		FromSVG: function( node ){
			var self = this;
			if (node.getAttribute) {
				return __module__.Point.Create2D(parseFloat(node.getAttribute("cx")), parseFloat(node.getAttribute("cy")));
			} else {
				return __module__.Point.Create2D(node.x, node.y);
			}
		},
		/**
		  * Removes the value from the given point, mutating it.
		  * 
		*/
		Remove: function( point, value ){
			var self = this;
			if (extend.isNumber(value)) {
				point[0] = (point[0] - value);
				point[1] = (point[1] - value);
				if (point.length == 3) {
					point[2] = (point[2] - value);
				}
			} else {
				point[0] = (point[0] - value[0]);
				point[1] = (point[1] - value[1]);
				if ((point.length >= 3) && (extend.len(value) >= 3)) {
					point[2] = (point[2] - value[2]);
				}
			}
			return point;
		},
		Ensure: function( x, y ){
			var self = this;
			if (y === undefined) {y=undefined}
			if ((!extend.isDefined(y)) && __module__.Point.Is(x)) {
				return x;
			} else {
				return self.Create2D(x, y);
			}
		},
		Set: function( point, value, y ){
			var self = this;
			if (y === undefined) {y=undefined}
			if (!point) {
				return self.Copy(value);
			} else if (extend.isDefined(y)) {
				point[0] = value;
				point[1] = y;
			} else if (extend.isNumber(value)) {
				point[0] = value;
				point[1] = value;
				if (extend.len(point) > 2) {
					point[2] = value;
				}
			} else if (value.length == 2) {
				point[0] = value[0];
				point[1] = value[1];
			} else if ((value.length == 3) && (point.length >= 3)) {
				point[0] = value[0];
				point[1] = value[1];
				point[2] = value[2];
			}
			return point;
		},
		Divide: function( point, value ){
			var self = this;
			if (extend.isNumber(value)) {
				point[0] = (point[0] / value);
				point[1] = (point[1] / value);
				if (point.length == 3) {
					point[2] = (point[2] / value);
				}
			} else {
				point[0] = (point[0] / value[0]);
				point[1] = (point[1] / value[1]);
				if ((point.length >= 3) && (extend.len(value) >= 3)) {
					point[2] = (point[2] / value[2]);
				}
			}
			return point;
		},
		Is: function( value ){
			var self = this;
			return (extend.isList(value) && (extend.len(value) >= 2));
		},
		FromArray: function( a ){
			var self = this;
			if (a.length >= 3) {
				return [a[0], a[1], a[2]];
			} else if (a.length >= 2) {
				return [a[0], a[1]];
			} else {
				return null;
			}
		}
	}
})

geom.Vector = extend.Class({
	name  :'geom.Vector',
	parent: __module__.Point,
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Vector.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	operations:{
		Normalize: function( vector ){
			var self = this;
			var l = (self.Length(vector) || 1);
			return self.Multiply(vector, (1 / l));
		},
		Update: function( a, b ){
			var self = this;
			a[0] = b[0];
			a[1] = b[1];
			if (b.length == 3) {
				if (a.length == 2) {
					a.push(b[2]);
				} else {
					a = b[2];
				}
			}
			return a;
		},
		Value: function( vector ){
			var self = this;
			return vector;
		},
		FromDegrees: function( angle, length ){
			var self = this;
			if (length === undefined) {length=1}
			var x = (Math.cos(((angle * Math.PI) / 180)) * length);
			var y = (Math.sin(((angle * Math.PI) / 180)) * length);
			return __module__.Vector.Create2D(x, y);
		},
		Length: function( vector ){
			var self = this;
			var x = vector[0];
			var y = vector[1];
			return Math.sqrt(((x * x) + (y * y)));
		},
		DotProduct: function( a, b ){
			var self = this;
			if (extend.len(a) >= 3) {
				return (((a[0] * b[0]) + (a[1] * b[1])) + (a[2] * b[2]));
			} else {
				return ((a[0] * b[0]) + (a[1] * b[1]));
			}
		}
	}
})

geom.Rect = extend.Class({
	name  :'geom.Rect',
	parent: undefined,
	shared: {
		D: 5,
		H: 3,
		HEIGHT: 3,
		WIDTH: 2,
		DEPTH: 5,
		W: 2,
		Y: 1,
		X: 0,
		Z: 4
	},
	initialize: function(){
		var self = this;
	},
	operations:{
		FromPoint: function( p ){
			var self = this;
			return self.Create2D(0, 0, p[0], p[1]);
		},
		/**
		  * Scales this rectangle so that it fits within the given width/height.
		  * If `ratio` is different from 1.0 it will shrink the bounding width/height
		  * by the corresponding ratio.
		  * 
		*/
		Fit: function( r, width, height, ratio ){
			var self = this;
			if (height === undefined) {height=undefined}
			if (ratio === undefined) {ratio=1.0}
			return self.Scale(r, self.FitFactor(r, width, height, ratio));
		},
		Area: function( rect ){
			var self = this;
			return (rect[2] * rect[3]);
		},
		Contains: function( r, point ){
			var self = this;
			var x = point[__module__.Point.X];
			var y = point[__module__.Point.Y];
			var z = (point[__module__.Point.Z] || 0);
			var rx = r[__module__.Rect.X];
			var ry = r[__module__.Rect.Y];
			var rz = (r[__module__.Rect.Z] || 0);
			var rw = r[__module__.Rect.WIDTH];
			var rh = r[__module__.Rect.HEIGHT];
			var rd = (r[__module__.Rect.DEPTH] || 0);
			if ((((((rx <= x) && (x <= (rx + rw))) && (ry <= y)) && (y <= (ry + rh))) && (rz <= z)) && (z <= (rz + rd))) {
				return true;
			} else {
				return false;
			}
		},
		Create2D: function( x, y, width, height ){
			var self = this;
			if (x === undefined) {x=0}
			if (y === undefined) {y=0}
			if (width === undefined) {width=0}
			if (height === undefined) {height=0}
			var r = __module__.buffer(4);
			r[self.X] = x;
			r[self.Y] = y;
			r[self.WIDTH] = width;
			r[self.HEIGHT] = height;
			return r;
		},
		Scale: function( r, zx, zy, center ){
			var self = this;
			if (zy === undefined) {zy=zx}
			if (center === undefined) {center=true}
			if (center) {
				var c_x = (r[self.X] + (r[self.WIDTH] / 2));
				var c_y = (r[self.Y] + (r[self.HEIGHT] / 2));
				r[self.WIDTH] = (r[self.WIDTH] * zx);
				r[self.HEIGHT] = (r[self.HEIGHT] * zy);
				r[self.X] = (c_x - (r[self.WIDTH] / 2));
				r[self.Y] = (c_y - (r[self.HEIGHT] / 2));
			} else {
				r[self.X] = (r[self.X] * zx);
				r[self.Y] = (r[self.Y] * zy);
				r[self.WIDTH] = (r[self.WIDTH] * zx);
				r[self.HEIGHT] = (r[self.HEIGHT] * zy);
			}
			return r;
		},
		IntersectsRect: function( a, b ){
			var self = this;
			var w = a;
			var e = b;
			var n = a;
			var s = b;
			if (b[self.X] < a[self.X]) {
				w = b;
				e = a;
			}
			if (b[self.Y] < a[self.Y]) {
				n = b;
				s = a;
			}
			if (((w[self.X] + w[self.WIDTH]) >= e[self.X]) && ((n[self.Y] + n[self.HEIGHT]) >= s[self.Y])) {
				return true;
			} else {
				return false;
			}
		},
		Shrink: function( rect, value ){
			var self = this;
			return [(rect[0] + value), (rect[1] + value), (rect[2] - (value * 2)), (rect[3] - (value * 2))];
		},
		FromObject: function( a ){
			var self = this;
			if (extend.isDefined(a.z) || extend.isDefined(a.depth)) {
				return __module__.Rect.Create3D(a.x, a.y, a.z, a.width, a.height, a.depth);
			} else {
				return __module__.Rect.Create2D(a.x, a.y, a.width, a.height);
			}
		},
		Repr: function( r ){
			var self = this;
			return extend.sprintf("rect( x=%0.2f, y=%0.2f w=%0.2f h=%0.2f )", r[self.X], r[self.Y], r[self.WIDTH], r[self.HEIGHT]);
		},
		GetNW: function( r ){
			var self = this;
			return __module__.Point.Create2D(r[self.X], r[self.Y]);
		},
		/**
		  * Multiplies the coordinates of this rectangle by `f`.
		  * 
		*/
		Multiply: function( r, f ){
			var self = this;
			if (extend.isNumber(f)) {
				r[self.X] = (r[self.X] * f);
				r[self.Y] = (r[self.Y] * f);
				r[self.WIDTH] = (r[self.WIDTH] * f);
				r[self.HEIGHT] = (r[self.HEIGHT] * f);
			} else if (extend.len(f) >= 4) {
				r[self.X] = (r[self.X] * f[self.WIDTH]);
				r[self.Y] = (r[self.Y] * f[self.HEIGHT]);
				r[self.WIDTH] = (r[self.WIDTH] * f[self.WIDTH]);
				r[self.HEIGHT] = (r[self.HEIGHT] * f[self.HEIGHT]);
			} else if (extend.len(f) >= 2) {
				r[self.X] = (r[self.X] * f[0]);
				r[self.Y] = (r[self.Y] * f[1]);
				r[self.WIDTH] = (r[self.WIDTH] * f[0]);
				r[self.HEIGHT] = (r[self.HEIGHT] * f[1]);
			}
			return r;
		},
		Copy: function( r ){
			var self = this;
			return self.Create2D(r[self.X], r[self.Y], r[self.WIDTH], r[self.HEIGHT]);
		},
		GetSE: function( r ){
			var self = this;
			return __module__.Point.Create2D((r[self.X] + r[self.WIDTH]), (r[self.Y] + r[self.HEIGHT]));
		},
		/**
		  * Expands the boundaries of this rectangle so that it includes the given point
		  * 
		*/
		ExpandToPoint: function( r, point ){
			var self = this;
			var px = point[__module__.Point.X];
			var py = point[__module__.Point.Y];
			if (px < r[self.X]) {
				r[self.X] = px;
			} else if (px > (r[self.X] + r[self.WIDTH])) {
				r[self.WIDTH] = (px - r[self.X]);
			}
			if (py < r[self.Y]) {
				r[self.Y] = py;
			} else if (py > (r[self.Y] + r[self.HEIGHT])) {
				r[self.HEIGHT] = (py - r[self.Y]);
			}
			return r;
		},
		Create3D: function( x, y, z, width, height, depth ){
			var self = this;
			if (x === undefined) {x=0}
			if (y === undefined) {y=0}
			if (z === undefined) {z=0}
			if (width === undefined) {width=0}
			if (height === undefined) {height=0}
			if (depth === undefined) {depth=0}
			var r = __module__.buffer(6);
			r[self.X] = x;
			r[self.Y] = y;
			r[self.Z] = z;
			r[self.WIDTH] = width;
			r[self.HEIGHT] = height;
			r[self.DEPTH] = depth;
			return r;
		},
		FromSVG: function( node ){
			var self = this;
			return __module__.Rect.Create2D(parseFloat(node.getAttribute("x")), parseFloat(node.getAttribute("y")), parseFloat(node.getAttribute("width")), parseFloat(node.getAttribute("height")));
		},
		Project: function( r, projection ){
			var self = this;
			var p1 = projection.projectXY(r[self.X], r[self.Y]);
			var p2 = projection.projectXY((r[self.X] + r[self.WIDTH]), (r[self.Y] + r[self.HEIGHT]));
			r[self.X] = p1[0];
			r[self.Y] = p1[1];
			r[self.WIDTH] = (p2[0] - p1[0]);
			r[self.HEIGHT] = (p2[1] - p1[1]);
			return r;
		},
		/**
		  * Makes the given rectangle relative to the other rectangle, ie
		  * all coordinates are expressed in 0..1 ratios of the container'S
		  * WIDTH, HEIGHT with the container's X,Y as origin.
		  * 
		*/
		MakeRelative: function( r, container, scale ){
			var self = this;
			if (scale === undefined) {scale=true}
			r[self.X] = (r[self.X] - container[self.X]);
			r[self.Y] = (r[self.Y] - container[self.Y]);
			if (scale) {
				r[self.X] = (r[self.X] / container[self.WIDTH]);
				r[self.Y] = (r[self.Y] / container[self.HEIGHT]);
				r[self.WIDTH] = (r[self.WIDTH] / container[self.WIDTH]);
				r[self.HEIGHT] = (r[self.HEIGHT] / container[self.HEIGHT]);
			}
			return r;
		},
		FromPoints: function( p1, p2 ){
			var self = this;
			if (p2 === undefined) {p2=undefined}
			if (!extend.isDefined(p2)) {
				p2 = p1[1];
				p1 = p1[0];
			}
			var x_min = Math.min(p1[0], p2[0]);
			var x_max = Math.max(p1[0], p2[0]);
			var y_min = Math.min(p1[1], p2[1]);
			var y_max = Math.max(p1[1], p2[1]);
			var w = (x_max - x_min);
			var h = (y_max - y_min);
			return self.Create2D(x_min, y_min, w, h);
		},
		/**
		  * Divides the coordinates of this rectangle by `f`.
		  * 
		*/
		Divide: function( r, f ){
			var self = this;
			if (extend.isNumber(f)) {
				r[self.X] = (r[self.X] / f);
				r[self.Y] = (r[self.Y] / f);
				r[self.WIDTH] = (r[self.WIDTH] / f);
				r[self.HEIGHT] = (r[self.HEIGHT] / f);
			} else if (extend.len(f) >= 4) {
				r[self.X] = (r[self.X] / f[self.WIDTH]);
				r[self.Y] = (r[self.Y] / f[self.HEIGHT]);
				r[self.WIDTH] = (r[self.WIDTH] / f[self.WIDTH]);
				r[self.HEIGHT] = (r[self.HEIGHT] / f[self.HEIGHT]);
			} else if (extend.len(f) >= 2) {
				r[self.X] = (r[self.X] / f[0]);
				r[self.Y] = (r[self.Y] / f[1]);
				r[self.WIDTH] = (r[self.WIDTH] / f[0]);
				r[self.HEIGHT] = (r[self.HEIGHT] / f[1]);
			}
			return r;
		},
		Move: function( r, x, y ){
			var self = this;
			if (y === undefined) {y=undefined}
			if (!extend.isDefined(y)) {
				var p = x;
				r[self.X] = p[0];
				r[self.Y] = p[1];
			} else {
				r[self.X] = x;
				r[self.Y] = y;
			}
			return r;
		},
		GetCenter: function( r ){
			var self = this;
			return __module__.Point.Create2D((r[self.X] + (r[self.WIDTH] / 2)), (r[self.Y] + (r[self.HEIGHT] / 2)));
		},
		ToSquare: function( r, center ){
			var self = this;
			if (center === undefined) {center=true}
			var w = r[self.WIDTH];
			var h = r[self.HEIGHT];
			if (h < w) {
				r[self.HEIGHT] = w;
				if (center) {
					r[self.Y] = (r[self.Y] - ((w - h) / 2));
				}
			} else if (w < h) {
				r[self.WIDTH] = h;
				if (center) {
					r[self.X] = (r[self.X] - ((h - w) / 2));
				}
			}
			return r;
		},
		/**
		  * Returns the zoom factor for this rectangle to fit within the given
		  * width/height.
		  * 
		*/
		FitFactor: function( r, width, height, ratio ){
			var self = this;
			if (height === undefined) {height=undefined}
			if (ratio === undefined) {ratio=1.0}
			var zoom = 1.0;
			if (extend.isList(width)) {
				ratio = (height || ratio);
				height = width[1];
				width = width[0];
			}
			if (r[self.WIDTH] > r[self.HEIGHT]) {
				zoom = (width / ((r[self.WIDTH] / ratio) || 1));
			} else {
				zoom = (height / ((r[self.HEIGHT] / ratio) || 1));
			}
			return zoom;
		},
		Size: function( r ){
			var self = this;
			return __module__.Vector.Create2D(r[self.WIDTH], r[self.HEIGHT]);
		}
	}
})

geom.Circle = extend.Class({
	name  :'geom.Circle',
	parent: undefined,
	shared: {
		Y: 1,
		X: 0,
		R: 3,
		Z: 2
	},
	initialize: function(){
		var self = this;
	},
	operations:{
		Contains: function( circle, point ){
			var self = this;
			return (__module__.Vector.Distance(point, circle) <= circle[self.R]);
		},
		IntersectsCircle: function( a, b, tolerance ){
			var self = this;
			if (tolerance === undefined) {tolerance=0.0}
			var dx = (b[self.X] - a[self.X]);
			var dy = (b[self.Y] - a[self.Y]);
			var dr = (a[self.R] + b[self.R]);
			var dx2 = (dx * dx);
			var dy2 = (dy * dy);
			var dr2 = (dr * dr);
			return ((0.999 * dr2) > (dx2 + dy2));
		},
		Create2D: function( x, y, r ){
			var self = this;
			if (x === undefined) {x=0}
			if (y === undefined) {y=0}
			if (r === undefined) {r=0}
			var c = __module__.buffer(4);
			c[self.X] = x;
			c[self.Y] = y;
			c[self.Z] = 0;
			c[self.R] = r;
			return c;
		}
	}
})

geom.Trigonometry = extend.Class({
	name  :'geom.Trigonometry',
	parent: undefined,
	shared: {
		DEG_90: (Math.PI / 2)
	},
	initialize: function(){
		var self = this;
	},
	operations:{
		/**
		  * Returns the angle (in radians) between the given points, using @pointA
		  * as the center and @pointB as the point on the circle.
		  * 
		  * The @invert parameter should be use if the points are screen coordinates,
		  * as in screen the Y axis is inverted.
		  * 
		*/
		Angle: function( pointA, pointB, invert ){
			var self = this;
			if (pointB === undefined) {pointB=__module__.Point.ORIGIN}
			if (invert === undefined) {invert=false}
			var x = (pointA[0] - pointB[0]);
			var y = (0 - (pointA[1] - pointB[1]));
			var theta = Math.atan2(y, x);
			if (theta < 0) {
				theta = ((2 * Math.PI) + theta);
			}
			if (invert) {
				theta = ((2 * Math.PI) - theta);
			}
			return theta;
		},
		RadToDeg: function( value ){
			var self = this;
			return ((value / (Math.PI * 2)) * 360);
		},
		Radial: function( alpha, radius, origin, point ){
			var self = this;
			if (radius === undefined) {radius=1.0}
			if (origin === undefined) {origin=__module__.Point.ORIGIN}
			if (point === undefined) {point=undefined}
			if (!extend.isDefined(point)) {
				point = __module__.Point.Create2D();
			}
			point[0] = ((Math.cos(alpha) * radius) + origin[0]);
			point[1] = ((0 - (Math.sin(alpha) * radius)) + origin[1]);
			return point;
		},
		DegToRad: function( value ){
			var self = this;
			return (((value / 360) * Math.PI) * 2);
		},
		/**
		  * Returns the opposite angle to the angle beween @pointA and @pointB.
		  * Here is a schema of what happens:
		  * 
		  * >    .............A..........
		  * >                  \)<-- Opposite angle
		  * >                   \
		  * >                    \
		  * >                     \
		  * >           Angle  --( B..........
		  * >                    (   )
		  * 
		*/
		OppositeAngle: function( pointA, pointB, invert ){
			var self = this;
			if (invert === undefined) {invert=false}
			var alpha = self.Angle(pointA, pointB, invert);
			if (pointB[1] > pointA[1]) {
				if (invert) {
					alpha = (alpha + Math.PI);
				} else {
					alpha = (alpha - Math.PI);
				}
			} else {
				if (invert) {
					alpha = (alpha - Math.PI);
				} else {
					alpha = (alpha + Math.PI);
				}
			}
			return alpha;
		},
		/**
		  * Returns the radians version of the given degrees value
		  * starting from PI/2 and growing clockwise -- which is what you
		  * want to do in data visualization.
		  * 
		*/
		Nice: function( degrees ){
			var self = this;
			return ((Math.PI * (90 - degrees)) / 180.0);
		}
	}
})
/**
  * An abstract class that defined the common methods for transforming a
  * 2D or 3D point.
  * 
*/
geom.Transformation = extend.Class({
	name  :'geom.Transformation',
	parent: undefined,
	initialize: function(){
		var self = this;
	},
	methods: {
		project: function(point) {
			var self = this;
			if (extend.len(point) >= 3) {
				return self.project3D(point);
			} else if (extend.len(point) >= 2) {
				return self.project2D(point);
			} else {
				return self.project1D(point);
			}
		},
		
		unproject: function(point) {
			var self = this;
			if (extend.len(point) >= 3) {
				return self.unproject3D(point);
			} else if (extend.len(point) >= 2) {
				return self.unproject2D(point);
			} else {
				return self.unproject1D(point);
			}
		},
		
		projectX: function(x) {
			var self = this;
			return self.project2D(__module__.Point.Create2D(x, 0))[0];
		},
		
		unprojectX: function(x) {
			var self = this;
			return self.unproject2D(__module__.Point.Create2D(x, 0))[0];
		},
		
		projectY: function(y) {
			var self = this;
			return self.project2D(__module__.Point.Create2D(0, y))[1];
		},
		
		unprojectY: function(y) {
			var self = this;
			return self.unproject2D(__module__.Point.Create2D(0, y))[1];
		},
		
		projectZ: function(z) {
			var self = this;
			return self.project3D(__module__.Point.Create3D(0, 0, z))[2];
		},
		
		unprojectZ: function(z) {
			var self = this;
			return self.unproject3D(__module__.Point.Create3D(0, 0, z))[2];
		},
		
		projectXY: function(x, y) {
			var self = this;
			var p = __module__.Point.Create2D(x, y);
			return self.project2D(p);
		},
		
		unprojectXY: function(x, y) {
			var self = this;
			var p = __module__.Point.Create2D(x, y);
			return self.unproject2D(p);
		},
		
		projectXYZ: function(x, y, z) {
			var self = this;
			var p = __module__.Point.Create3D(x, y, z);
			return self.project3D(p);
		},
		
		unprojectXYZ: function(x, y, z) {
			var self = this;
			var p = __module__.Point.Create3D(x, y, z);
			return self.unproject3D(p);
		},
		
		project1D: function(p) {
			var self = this;
			return p;
		},
		
		unproject1D: function(p) {
			var self = this;
			return p;
		},
		
		project2D: function(p) {
			var self = this;
			return p;
		},
		
		unproject2D: function(p) {
			var self = this;
			return p;
		},
		
		project3D: function(p) {
			var self = this;
			return p;
		},
		
		unproject3D: function(p) {
			var self = this;
			return p;
		}
	}
})

geom.Translate = extend.Class({
	name  :'geom.Translate',
	parent: __module__.Transformation,
	properties: {
		vector:undefined
	},
	initialize: function( x, y, z ){
		var self = this;
		if (x === undefined) {x=0}
		if (y === undefined) {y=x}
		if (z === undefined) {z=x}
		// Default initialization of property `vector`
		if (typeof(self.vector)=='undefined') {self.vector = null;};
		if (extend.isList(x)) {
			self.vector = x;
		} else {
			self.vector = __module__.Point.Create3D(x, y, z);
		}
	},
	methods: {
		set: function(x, y) {
			var self = this;
			if (y === undefined) {y=undefined}
			if (extend.isDefined(y)) {
				self.vector = geom.Vector.Set(self.vector, x, y);
			} else {
				self.vector = geom.Vector.Set(self.vector, x);
			}
			return self;
		},
		
		project1D: function(p) {
			var self = this;
			return p;
		},
		
		unproject1D: function(p) {
			var self = this;
			return p;
		},
		
		project2D: function(p) {
			var self = this;
			return __module__.Point.Add(p, self.vector);
		},
		
		unproject2D: function(p) {
			var self = this;
			return __module__.Point.Remove(p, self.vector);
		},
		
		project3D: function(p) {
			var self = this;
			return __module__.Point.Add(p, self.vector);
		},
		
		unproject3D: function(p) {
			var self = this;
			return __module__.Point.Remove(p, self.vector);
		},
		
		_asTransform: function() {
			var self = this;
			return ["translate", self.vector[0], self.vector[1]];
		},
		
		asCSSTransform: function() {
			var self = this;
			return (((("translate(" + self.vector[0]) + "px,") + self.vector[1]) + "px)");
		}
	}
})

geom.Scale = extend.Class({
	name  :'geom.Scale',
	parent: __module__.Transformation,
	properties: {
		vector:undefined
	},
	initialize: function( x, y, z ){
		var self = this;
		if (x === undefined) {x=0}
		if (y === undefined) {y=x}
		if (z === undefined) {z=x}
		// Default initialization of property `vector`
		if (typeof(self.vector)=='undefined') {self.vector = null;};
		if (extend.isList(x)) {
			self.vector = x;
		} else {
			self.vector = __module__.Point.Create3D(x, y, z);
		}
	},
	methods: {
		set: function(x, y) {
			var self = this;
			if (y === undefined) {y=undefined}
			if (extend.isDefined(y)) {
				self.vector = geom.Vector.Set(self.vector, x, y);
			} else {
				self.vector = geom.Vector.Set(self.vector, x);
			}
			return self;
		},
		
		project1D: function(p) {
			var self = this;
			return (p * self.vector[0]);
		},
		
		unproject1D: function(p) {
			var self = this;
			return (p / self.vector[0]);
		},
		
		project2D: function(p) {
			var self = this;
			return __module__.Point.Multiply(p, self.vector);
		},
		
		unproject2D: function(p) {
			var self = this;
			return __module__.Point.Divide(p, self.vector);
		},
		
		project3D: function(p) {
			var self = this;
			return __module__.Point.Multiply(p, self.vector);
		},
		
		unproject3D: function(p) {
			var self = this;
			return __module__.Point.Divide(p, self.vector);
		},
		
		_asTransform: function() {
			var self = this;
			return ["scale", self.vector[0], self.vector[1]];
		},
		
		asCSSTransform: function() {
			var self = this;
			return (((("scale(" + self.vector[0]) + ",") + self.vector[1]) + ")");
		}
	}
})

geom.Invert = extend.Class({
	name  :'geom.Invert',
	parent: __module__.Transformation,
	properties: {
		vector:undefined
	},
	initialize: function( x, y, z ){
		var self = this;
		if (x === undefined) {x=0}
		if (y === undefined) {y=x}
		if (z === undefined) {z=x}
		// Default initialization of property `vector`
		if (typeof(self.vector)=='undefined') {self.vector = null;};
		if (extend.isList(x)) {
			self.vector = x;
		} else {
			self.vector = __module__.Point.Create3D([x, y, z]);
		}
	},
	methods: {
		project2D: function(p) {
			var self = this;
			if (self.vector[0]) {
				p[0] = (self.vector[0] - p[0]);
			}
			if (self.vector[1]) {
				p[1] = (self.vector[1] - p[1]);
			}
			return p;
		},
		
		unproject2D: function(p) {
			var self = this;
			if (self.vector[0]) {
				p[0] = (0 - (p[0] - self.vector[0]));
			}
			if (self.vector[1]) {
				p[1] = (0 - (p[1] - self.vector[1]));
			}
			return p;
		},
		
		project3D: function(p) {
			var self = this;
			if (self.vector[0]) {
				p[0] = (self.vector[0] - p[0]);
			}
			if (self.vector[1]) {
				p[1] = (self.vector[1] - p[1]);
			}
			if (self.vector[2]) {
				p[2] = (self.vector[2] - p[2]);
			}
			return p;
		},
		
		unproject3D: function(p) {
			var self = this;
			if (self.vector[0]) {
				p[0] = (0 - (p[0] - self.vector[0]));
			}
			if (self.vector[1]) {
				p[1] = (0 - (p[1] - self.vector[1]));
			}
			if (self.vector[2]) {
				p[2] = (0 - (p[2] - self.vector[2]));
			}
			return p;
		},
		
		_asTransform: function() {
			var self = this;
			return ["scale", 0, -1];
		},
		
		_asCSSTransform: function() {
			var self = this;
			return "scale(0,-100%)";
		}
	}
})

geom.PixelSnap = extend.Class({
	name  :'geom.PixelSnap',
	parent: __module__.Transformation,
	initialize: function( x, y, z ){
		var self = this;
		if (x === undefined) {x=0}
		if (y === undefined) {y=x}
		if (z === undefined) {z=x}
		if (extend.isList(x)) {
			vector = x;
		} else {
			vector = __module__.Point.Create3D([x, y, z]);
		}
	},
	methods: {
		project1D: function(p) {
			var self = this;
			return Math.round(p);
		},
		
		unproject1D: function(p) {
			var self = this;
			return p;
		},
		
		project2D: function(p) {
			var self = this;
			p[0] = Math.round(p[0]);
			p[1] = Math.round(p[1]);
			return p;
		},
		
		unproject2D: function(p) {
			var self = this;
			return p;
		},
		
		project3D: function(p) {
			var self = this;
			p[0] = Math.round(p[0]);
			p[1] = Math.round(p[1]);
			p[2] = Math.round(p[2]);
			return p;
		},
		
		unproject3D: function(p) {
			var self = this;
			return p;
		},
		
		asCSSTransform: function() {
			var self = this;
			return "";
		}
	}
})
/**
  * A projection applies a series of transformations to a Point, mutating the
  * point for each applied transformation.
  * 
*/
geom.Projection = extend.Class({
	name  :'geom.Projection',
	parent: __module__.Transformation,
	properties: {
		stack:undefined
	},
	initialize: function(  ){
		var self = this;
		// Default initialization of property `stack`
		if (typeof(self.stack)=='undefined') {self.stack = [];};
	},
	methods: {
		reset: function() {
			var self = this;
			self.stack = [];
			return self;
		},
		
		add: function(transform) {
			var self = this;
			self.stack.push(transform);
			return self;
		},
		
		translate: function(x, y, z) {
			var self = this;
			if (x === undefined) {x=0}
			if (y === undefined) {y=0}
			if (z === undefined) {z=0}
			self.stack.push(new __module__.Translate(x, y, z));
			return self;
		},
		
		/**
		  * Returns a new projection based on the current projection that scales
		  * according to the given points.
		  * 
		*/
		scale: function(x, y, z) {
			var self = this;
			if (x === undefined) {x=0}
			if (y === undefined) {y=x}
			if (z === undefined) {z=x}
			self.stack.push(new __module__.Scale(x, y, z));
			return self;
		},
		
		/**
		  * Returns a new projection into scree coordinates with the given height
		  * 
		*/
		screen: function(height) {
			var self = this;
			if (height === undefined) {height=0}
			self.stack.push(new __module__.Invert(0, height));
			return self;
		},
		
		/**
		  * Returns a new projection into scree coordinates with the given height
		  * 
		*/
		pixel: function() {
			var self = this;
			self.stack.push(new __module__.PixelSnap());
			return self;
		},
		
		project2D: function(p) {
			var self = this;
			var i = 0;
			while ((i < self.stack.length)) {
				p = self.stack[i].project2D(p);
				i = (i + 1);
			}
			return p;
		},
		
		project3D: function(p) {
			var self = this;
			var i = 0;
			while ((i < self.stack.length)) {
				p = self.stack[i].project2D(p);
				i = (i + 1);
			}
			return p;
		},
		
		unproject2D: function(p) {
			var self = this;
			var i = (self.stack.length - 1);
			while ((i >= 0)) {
				p = self.stack[i].unproject2D(p);
				i = (i - 1);
			}
			return p;
		},
		
		_asTransform: function() {
			var self = this;
			var res = {};
			var order = [];
			// Iterates over `self.stack`. This works on array,objects and null/undefined
			var __j=self.stack;
			var __k=__j instanceof Array ? __j : Object.getOwnPropertyNames(__j||{});
			var __m=__k.length;
			for (var __l=0;__l<__m;__l++){
				var __i=(__k===__j)?__l:__k[__l];
				var t=__j[__i];
				// This is the body of the iteration with (value=t, key/index=__i) in __j
				var name_args = t._asTransform();;
				var name = name_args[0];;
				var args = extend.slice(name_args,1,undefined);;
				order.push(name);
				if (res[name]) {
					if (name == "translate") {
						res[name][0] = (res[name][0] + args[0]);
						res[name][1] = (res[name][1] + args[1]);
					} else if (name == "scale") {
						res[name][0] = (res[name][0] + args[0]);
						res[name][1] = (res[name][1] + args[1]);
					}
				} else {
					res[name] = args;
				};
			}
			order = stats.unique(order);
			return res;
		},
		
		asCSSTransform: function() {
			var self = this;
			var r = self._asTransform();
		}
	}
})
geom.init = function(){
	var self = geom;
}
if (typeof(geom.init)!="undefined") {geom.init();}

// START:VANILLA_POSTAMBLE
return geom;})(geom);
// END:VANILLA_POSTAMBLE
