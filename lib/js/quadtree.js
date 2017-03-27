// 8< ---[quadtree.js]---
/**
  * A [quadtree](https://en.wikipedia.org/wiki/Quadtree) implementation
  * 
*/
// START:VANILLA_PREAMBLE
var quadtree=typeof(extend)!='undefined' ? extend.module('quadtree') : (typeof(quadtree)!='undefined' ? quadtree : {});
(function(quadtree){
var __module__=quadtree;
// END:VANILLA_PREAMBLE

quadtree.__VERSION__='0.4.0';
/**
  * An implementation of the quad-tree where regions can points, but will
  * be subdivided until a given threshold is reached.
  * 
*/
quadtree.Region = extend.Class({
	name  :'quadtree.Region',
	parent: undefined,
	shared: {
		/**
		  * Defines the minimum width or height that a region needs to have
		  * to be subdivided. This guards against creating too many sub-regions
		  * and potential infinite (or too deep) recursion when using floats.
		  * 
		*/
		SUBDIVIDE_THRESHOLD: (1 / 1000),
		DEPTH_THRESHOLD: 5
	},
	properties: {
		bounds:undefined,
		points:undefined,
		depth:undefined,
		nw:undefined,
		ne:undefined,
		se:undefined,
		sw:undefined
	},
	/**
	  * Creates a region with the given width and height (1x1 by default)
	  * 
	*/
	initialize: function( w, h, x, y ){
		var self = this;
		if (w === undefined) {w=1}
		if (h === undefined) {h=1}
		if (x === undefined) {x=0}
		if (y === undefined) {y=0}
		// Default initialization of property `bounds`
		if (typeof(self.bounds)=='undefined') {self.bounds = undefined;};
		// Default initialization of property `points`
		if (typeof(self.points)=='undefined') {self.points = undefined;};
		// Default initialization of property `depth`
		if (typeof(self.depth)=='undefined') {self.depth = 0;};
		// Default initialization of property `nw`
		if (typeof(self.nw)=='undefined') {self.nw = undefined;};
		// Default initialization of property `ne`
		if (typeof(self.ne)=='undefined') {self.ne = undefined;};
		// Default initialization of property `se`
		if (typeof(self.se)=='undefined') {self.se = undefined;};
		// Default initialization of property `sw`
		if (typeof(self.sw)=='undefined') {self.sw = undefined;};
		self.bounds = geom.Rect.Create2D(x, y, w, h);
	},
	methods: {
		/**
		  * Tells if the given point is within the region's bounds
		  * 
		*/
		within: function(point) {
			var self = this;
			if (extend.isMap(point)) {
				point = point.point;
			}
			return geom.Rect.Contains(self.bounds, point);
		},
		
		/**
		  * CLears the points contained in this region
		  * 
		*/
		clear: function() {
			var self = this;
			self.nw = undefined;
			self.ne = undefined;
			self.se = undefined;
			self.sw = undefined;
			self.points = undefined;
			return self;
		},
		
		/**
		  * Inserts the point in this region, subdividing if necessary. Point is
		  * `[x,y]` (within bounds) and value is anything.
		  * 
		*/
		add: function(point, value) {
			var self = this;
			if (value === undefined) {value=null}
			if (!self.within(point)) {
				return false;
			} else if (self.isEmpty()) {
				if (!extend.isDefined(self.points)) {
					self.points = [];
				}
				if (extend.isMap(point)) {
					self.points.push(point);
				} else {
					self.points.push({"point":point, "value":value});
				}
				return true;
			} else {
				if (self._subdivide()) {
					return (((self.nw.add(point, value) || self.ne.add(point, value)) || self.se.add(point, value)) || self.sw.add(point, value));
				} else {
					if (!extend.isDefined(self.points)) {
						self.points = [];
					}
					if (extend.isMap(point)) {
						self.points.push(point);
					} else {
						self.points.push({"point":point, "value":value});
					}
				}
				return true;
			}
		},
		
		/**
		  * Returns the list of points within distance of the given point
		  * 
		*/
		getNear: function(p, distance) {
			var self = this;
			return self.getWithin([p[0], p[1], distance, distance]);
		},
		
		/**
		  * Queries the given area within this region, returning the list of
		  * points that match.
		  * 
		*/
		getWithin: function(r, y, w, h, result) {
			var self = this;
			if (y === undefined) {y=undefined}
			if (w === undefined) {w=undefined}
			if (h === undefined) {h=undefined}
			if (result === undefined) {result=[]}
			if (extend.isDefined(y)) {
				r = geom.Rect.Create2D(r, y, w, h);
			}
			if (geom.Rect.IntersectsRect(self.bounds, r)) {
				if (!self.isSubdivided()) {
					// Iterates over `self.points`. This works on array,objects and null/undefined
					var __j=self.points;
					var __k=__j instanceof Array ? __j : Object.getOwnPropertyNames(__j||{});
					var __m=__k.length;
					for (var __l=0;__l<__m;__l++){
						var __i=(__k===__j)?__l:__k[__l];
						var _=__j[__i];
						// This is the body of the iteration with (value=_, key/index=__i) in __j
						if (_.point && geom.Rect.Contains(r, _.point)) {
							result.push(_);
						};
					}
				} else {
					self.nw.getWithin(r, undefined, undefined, undefined, result);
					self.ne.getWithin(r, undefined, undefined, undefined, result);
					self.se.getWithin(r, undefined, undefined, undefined, result);
					self.sw.getWithin(r, undefined, undefined, undefined, result);
				}
			}
			return result;
		},
		
		/**
		  * Tells if this region is subdivided -- when it is subdivided, it contains
		  * points, either directly or indirectly.
		  * 
		*/
		isSubdivided: function() {
			var self = this;
			return extend.isDefined(self.nw);
		},
		
		/**
		  * Tells if this region is empty or not. An empty region has
		  * no subdivision and no point added.
		  * 
		*/
		isEmpty: function() {
			var self = this;
			return ((!self.isSubdivided()) && ((!extend.isDefined(self.points)) || (extend.len(self.points) == 0)));
		},
		
		/**
		  * Tells if this region directly contains any point, this does not query
		  * subdivisions.
		  * 
		*/
		hasPoints: function() {
			var self = this;
			return (extend.isDefined(self.points) && (extend.len(self.points) > 0));
		},
		
		/**
		  * Subdivides the tree. This is the main thing with the
		  * 
		*/
		_subdivide: function() {
			var self = this;
			if (self.isSubdivided()) {
				return self;
			}
			if ((self.bounds[geom.Rect.W] == 0) || (self.bounds[geom.Rect.H] == 0)) {
				return false;
			}
			var x = self.bounds[geom.Rect.X];
			var y = self.bounds[geom.Rect.Y];
			var h_w = (self.bounds[geom.Rect.W] / 2);
			var h_h = (self.bounds[geom.Rect.H] / 2);
			if ((h_w <= self.getClass().SUBDIVIDE_THRESHOLD) || (h_h <= self.getClass().SUBDIVIDE_THRESHOLD)) {
				return false;
			}
			if (self.depth >= self.getClass().DEPTH_THRESHOLD) {
				return false;
			}
			self.nw = new __module__.Region(h_w, h_h, x, y);
			self.ne = new __module__.Region(h_w, h_h, (x + h_w), y);
			self.se = new __module__.Region(h_w, h_h, (x + h_w), (y + h_h));
			self.sw = new __module__.Region(h_w, h_h, x, (y + h_h));
			self.nw.depth = (self.depth + 1);
			self.ne.depth = (self.depth + 1);
			self.sw.depth = (self.depth + 1);
			self.se.depth = (self.depth + 1);
			if (extend.isDefined(self.points)) {
				var p = self.points;
				self.points = undefined;
				// Iterates over `p`. This works on array,objects and null/undefined
				var __n=p;
				var __p=__n instanceof Array ? __n : Object.getOwnPropertyNames(__n||{});
				var __r=__p.length;
				for (var __q=0;__q<__r;__q++){
					var __o=(__p===__n)?__q:__p[__q];
					var _=__n[__o];
					// This is the body of the iteration with (value=_, key/index=__o) in __n
					self.add(_);
				}
			}
			return self;
		},
		
		/**
		  * Iterates on the region in NW, NE, SE, SW order.
		  * 
		*/
		iterate: function(callback) {
			var self = this;
			callback(self);
			if (self.isSubdivided()) {
				self.nw.iterate(callback);
				self.ne.iterate(callback);
				self.se.iterate(callback);
				self.sw.iterate(callback);
			}
			return self;
		},
		
		/**
		  * Alias to `getPoints`
		  * 
		*/
		list: function() {
			var self = this;
			return self.getPoints();
		},
		
		/**
		  * Returns a list of all the points found in this region and its sub-regions
		  * in nw-ne-se-sw traversal oder.
		  * 
		*/
		getPoints: function() {
			var self = this;
			if (self.isSubdivided()) {
				return self.nw.getPoints().concat(self.ne.getPoints()).concat(self.se.getPoints()).concat(self.sw.getPoints());
			} else if (self.hasPoints()) {
				return self.points;
			} else {
				return [];
			}
		},
		
		/**
		  * Returns the count region and sub-regions, this region included.
		  * 
		*/
		countRegions: function() {
			var self = this;
			var counter = {"value":0};
			self.iterate(function() {
				counter.value = (counter.value + 1);
			});
			return counter.value;
		}
	}
})
quadtree.init = function(){
	var self = quadtree;
}
if (typeof(quadtree.init)!="undefined") {quadtree.init();}

// START:VANILLA_POSTAMBLE
return quadtree;})(quadtree);
// END:VANILLA_POSTAMBLE
