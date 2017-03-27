// 8< ---[layouts.js]---
// START:VANILLA_PREAMBLE
var layouts=typeof(extend)!='undefined' ? extend.module('layouts') : (typeof(layouts)!='undefined' ? layouts : {});
(function(layouts){
var __module__=layouts;
// END:VANILLA_PREAMBLE

layouts.__VERSION__='0.2.0';
layouts.LICENSE = "http://ffctn.com/doc/licenses/bsd";

layouts.Grid = extend.Class({
	name  :'layouts.Grid',
	parent: undefined,
	properties: {
		size:undefined,
		elementSize:undefined,
		dimension:undefined,
		elements:undefined
	},
	initialize: function(  ){
		var self = this;
		// Default initialization of property `size`
		if (typeof(self.size)=='undefined') {self.size = [1.0, undefined];};
		// Default initialization of property `elementSize`
		if (typeof(self.elementSize)=='undefined') {self.elementSize = [undefined, undefined];};
		// Default initialization of property `dimension`
		if (typeof(self.dimension)=='undefined') {self.dimension = [-1, undefined];};
		// Default initialization of property `elements`
		if (typeof(self.elements)=='undefined') {self.elements = [];};
	},
	methods: {
		setColumns: function(value) {
			var self = this;
			self.dimension[0] = value;
			return self;
		},
		
		place: function(element) {
			var self = this;
			var position = [0, 0, 0, 0];
			var count = extend.len(self.elements);
			if (self.dimension[0] > 0) {
				!((!self.elementSize[0])) && extend.assert(false, "layouts.Grid.place:", "layout.Grid: columns constraint is incompatible with element size constraint", "(failed `(!self.elementSize[0])`)");
				var row = parseInt((count / self.dimension[0]));
				var col = (count % self.dimension[0]);
				var width = (self.size[0] / self.dimension[0]);
				var height = width;
				if (self.elementSize[1]) {
					height = self.elementSize[1];
				}
				position[0] = ((col * width) + (width / 2));
				position[1] = ((row * height) + (height / 2));
				position[2] = width;
				position[3] = height;
			} else {
				extend.error("layout.Grid:Not supporter");
			}
			self.elements.push({"element":element, "position":position});
			return position;
		}
	}
})

layouts.Layout = extend.Class({
	name  :'layouts.Layout',
	parent: undefined,
	shared: {
		OPTIONS: {}
	},
	properties: {
		options:undefined,
		cache:undefined,
		elements:undefined
	},
	initialize: function( options ){
		var self = this;
		// Default initialization of property `options`
		if (typeof(self.options)=='undefined') {self.options = {};};
		// Default initialization of property `cache`
		if (typeof(self.cache)=='undefined') {self.cache = {};};
		// Default initialization of property `elements`
		if (typeof(self.elements)=='undefined') {self.elements = null;};
		self.options = extend.merge(options, __module__.Layout.OPTIONS);
		self.options = extend.merge(self.options, self.getClass().OPTIONS);
	},
	methods: {
		setElements: function(elements) {
			var self = this;
			self.elements = elements;
			return self;
		},
		
		addElement: function(element, key) {
			var self = this;
			if (key === undefined) {key=undefined}
			if (extend.isDefined(key)) {
				if (!self.elements) {
					self.elements = {};
				}
				self.elements[key] = element;
			} else {
				if (!self.elements) {
					self.elements = [];
				}
				self.elemetns.push(key);
			}
			return self;
		},
		
		removeElement: function(element) {
			var self = this;
			self.elements = extend.filter(self.elements, function(_) {
				return (_ != element);
			});
			return self;
		},
		
		layout: function() {
			var self = this;
		},
		
		run: function() {
			var self = this;
			return self.layout();
		}
	}
})

layouts.Radial = extend.Class({
	name  :'layouts.Radial',
	parent: __module__.Layout,
	shared: {
		OPTIONS: {"center":[0, 0], "radius":100, "start":0}
	},
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Radial.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		center: function(x, y) {
			var self = this;
			if (y === undefined) {y=undefined}
			if (extend.isDefined(y)) {
				self.options.center[0] = x;
				self.options.center[1] = y;
			} else {
				self.options.center = geom.Point.Set(self.options.center, x);
			}
			return self;
		},
		
		layout: function(center, radius) {
			var self = this;
			if (center === undefined) {center=self.options.center}
			if (radius === undefined) {radius=self.options.radius}
			var count = extend.len(self.elements);
			var step = ((Math.PI * 2) / count);
			var i = 0;
			var angle = self.options.start;
			// Iterates over `self.elements`. This works on array,objects and null/undefined
			var __j=self.elements;
			var __k=__j instanceof Array ? __j : Object.getOwnPropertyNames(__j||{});
			var __m=__k.length;
			for (var __l=0;__l<__m;__l++){
				var __i=(__k===__j)?__l:__k[__l];
				var element=__j[__i];
				// This is the body of the iteration with (value=element, key/index=__i) in __j
				var new_position = geom.Trigonometry.Radial(angle, radius, center);;
				self.options.setter(element, new_position);
				angle = (angle + step);
				i = (i + 1);
			}
			return self;
		}
	}
})
/**
  * Organizes elements (nodes) in a hierarchical way in a 2D space.
  * 
  * Options:
  * 
  * - `padding` the padding between laid out elements
  * - `origin` the origin where the layout starts (`[0, 0]`)
  * 
  * Accessors/mutators:
  * 
  * - `getParentID` returns the parent id of an element (default `.parent`)
  * - `getID` returns the id of an element (default `.id`)
  * - `getSize` returns the size of an element (default `.size`), to be returned as a couple `[x,y]`
  * - `setPosition`  callback to set an element position, defaults to `.setPosition(x,y)`
  * - `isCollapsed`  callable to see if an element is collapsed (ie. its children will not be laid out)
  * - `isVisible`    callable to see if an element is visible   (ie. its children will not be laid out)
  * 
  * How to use:
  * 
  * 1) Instanciate the layout
  * 2) Configure the options/accessors/mutators (see above) to fir your data model
  * 3) Add elements using `setElements` or `addElement`
  * 4) Call prepare (just call it once, unless you add/removeelements)
  * 5) Call run as many times as you want. This will re-adapt itself to changes
  * in options or size of the displayed elements, but will keep the
  * structure intact (until you call `prepare` again)
  * 
*/
layouts.Hierarchy = extend.Class({
	name  :'layouts.Hierarchy',
	parent: __module__.Layout,
	shared: {
		OPTIONS: {"padding":[10, 100], "origin":[0, 0], "getParentID":function(_) {
			return _.parent;
		}, "getID":function(_) {
			return _.id;
		}, "getSize":function(_) {
			return _.size;
		}, "setPosition":function(_, x, y) {
			return _.setPosition(x, y);
		}, "isCollapsed":function(_) {
			return _.isCollapsed();
		}, "isVisible":function(_) {
			return _.isVisible();
		}}
	},
	properties: {
		traversal:undefined,
		breadth:undefined,
		depth:undefined,
		count:undefined,
		_rowSizes:undefined,
		_rowY:undefined,
		_sizeByID:undefined,
		_centroidByID:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `traversal`
		if (typeof(self.traversal)=='undefined') {self.traversal = null;};
		// Default value for property `breadth`
		if (typeof(self.breadth)=='undefined') {self.breadth = null;};
		// Default value for property `depth`
		if (typeof(self.depth)=='undefined') {self.depth = null;};
		// Default value for property `count`
		if (typeof(self.count)=='undefined') {self.count = null;};
		// Default value for property `_rowSizes`
		if (typeof(self._rowSizes)=='undefined') {self._rowSizes = [];};
		// Default value for property `_rowY`
		if (typeof(self._rowY)=='undefined') {self._rowY = [];};
		// Default value for property `_sizeByID`
		if (typeof(self._sizeByID)=='undefined') {self._sizeByID = {};};
		// Default value for property `_centroidByID`
		if (typeof(self._centroidByID)=='undefined') {self._centroidByID = {};};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Hierarchy.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		/**
		  * Creates a breadth-first list of all the elements registerd in the
		  * hierachy.
		  * 
		*/
		prepare: function() {
			var self = this;
			var roots = [];
			var node_by_id = {};
			var node_by_parent_id = {};
			// Iterates over `self.elements`. This works on array,objects and null/undefined
			var __n=self.elements;
			var __p=__n instanceof Array ? __n : Object.getOwnPropertyNames(__n||{});
			var __r=__p.length;
			for (var __q=0;__q<__r;__q++){
				var __o=(__p===__n)?__q:__p[__q];
				var e=__n[__o];
				// This is the body of the iteration with (value=e, key/index=__o) in __n
				var nid = self.options.getID(e);;
				var pid = self.options.getParentID(e);;
				node_by_id[nid] = e;
				if ((!extend.isDefined(pid)) || (pid === null)) {
					roots.push(nid);
				} else {
					if (!node_by_parent_id[pid]) {
						node_by_parent_id[pid] = [];
					}
					node_by_parent_id[pid].push(nid);
				};
			}
			var res = self._traverse(roots, node_by_id, node_by_parent_id);
			self.traversal = extend.map(res, function(_) {
				return extend.map(_, function(i) {
					return node_by_id[i];
				});
			});
			return self.traversal;
		},
		
		/**
		  * Traverses the tree, returning the traversal list and updating
		  * the `breadth`, `depth` and `count` properties as side-effects. The
		  * traversal list is a list of rows of node, where nodes with the
		  * same parent are consecutive
		  * 
		  * ```
		  * [
		  * [Node], // Level 0
		  * [Node], // Level 1
		  * ...
		  * ]
		  * ```
		  * 
		*/
		_traverse: function(roots, node_by_id, node_by_parent_id) {
			var self = this;
			self.breadth = 0;
			self.depth = 0;
			self.count = 0;
			var result = [[].concat(roots)];
			var new_roots = roots;
			var visited = {};
			while ((extend.len(new_roots) > 0)) {
				roots = new_roots;
				var row = [];
				// Iterates over `roots`. This works on array,objects and null/undefined
				var __t=roots;
				var __u=__t instanceof Array ? __t : Object.getOwnPropertyNames(__t||{});
				var __w=__u.length;
				for (var __v=0;__v<__w;__v++){
					var __s=(__u===__t)?__v:__u[__v];
					var rid=__t[__s];
					// This is the body of the iteration with (value=rid, key/index=__s) in __t
					var node = node_by_id[rid];;
					if (self.options.isVisible(node) && (!self.options.isCollapsed(node))) {
						// Iterates over `node_by_parent_id[rid]`. This works on array,objects and null/undefined
						var __y=node_by_parent_id[rid];
						var __z=__y instanceof Array ? __y : Object.getOwnPropertyNames(__y||{});
						var __b=__z.length;
						for (var __a=0;__a<__b;__a++){
							var __x=(__z===__y)?__a:__z[__a];
							var cid=__y[__x];
							// This is the body of the iteration with (value=cid, key/index=__x) in __y
							if (!visited[cid]) {
								visited[cid] = 1;
								row.push(cid);
								self.count = (self.count + 1);
							} else {
								extend.warning(self.getClass().getName(), "._traverse: Already visited node", cid, "with parent", rid);
							};
						}
					};
				}
				if (extend.len(row) > 0) {
					result.push(row);
					self.breadth = Math.max(self.breadth, extend.len(row));
					self.depth = (self.depth + 1);
				}
				new_roots = row;
			}
			return result;
		},
		
		run: function() {
			var self = this;
			self._rowSizes = [];
			self._rowY = [];
			self._sizeByID = {};
			var row_sizes = self._rowSizes;
			var row_y = self._rowY;
			var size_by_id = self._sizeByID;
			var width = 0;
			var height = self.options.padding[1];
			var longest_row = 0;
			var y = self.options.padding[1];
			// Iterates over `self.traversal`. This works on array,objects and null/undefined
			var __c=self.traversal;
			var __d=__c instanceof Array ? __c : Object.getOwnPropertyNames(__c||{});
			var __f=__d.length;
			for (var __e=0;__e<__f;__e++){
				var i=(__d===__c)?__e:__d[__e];
				var row=__c[i];
				// This is the body of the iteration with (value=row, key/index=i) in __c
				var row_width = self.options.padding[0];;
				var row_height = 0;;
				// Iterates over `row`. This works on array,objects and null/undefined
				var __h=row;
				var __ij=__h instanceof Array ? __h : Object.getOwnPropertyNames(__h||{});
				var __kj=__ij.length;
				for (var __jj=0;__jj<__kj;__jj++){
					var __g=(__ij===__h)?__jj:__ij[__jj];
					var node=__h[__g];
					// This is the body of the iteration with (value=node, key/index=__g) in __h
					var size = self.options.getSize(node);;
					size_by_id[self.options.getID(node)] = size;
					row_width = (row_width + (size[0] + self.options.padding[0]));
					row_height = Math.max(row_height, size[1]);
				};
				row_height = (row_height + self.options.padding[1]);
				if (row_width > width) {
					longest_row = i;
					width = row_width;
				};
				height = (height + row_height);
				row_sizes.push([row_width, row_height]);
				row_y.push(y);
				y = (y + row_height);
			}
			var r = longest_row;
			var centroid_by_id = {};
			var longest_row_groups = self._groupNodesByParent(self.traversal[r]);
			self._layoutRow(longest_row_groups, width, self._rowY[r], centroid_by_id);
			var r = (longest_row + 1);
			while ((r < extend.len(self.traversal))) {
				var rg = self._groupNodesByParent(self.traversal[r]);
				self._layoutRow(rg, width, self._rowY[r], centroid_by_id);
				r = (r + 1);
			}
			var r = (longest_row - 1);
			while ((r >= 0)) {
				var rg = self._groupNodesByParent(self.traversal[r]);
				self._layoutRow(rg, width, self._rowY[r], centroid_by_id);
				r = (r - 1);
			}
			self._centroidByID = centroid_by_id;
			return [width, height];
		},
		
		/**
		  * Groups the nodes with the same parent in lists
		  * NOTE: We assume that the rows have nodes with same parent
		  * already grouped together.
		  * ```
		  * N                                         N = node
		  * N---N                                   --- = padding
		  * [N---N---N---][N]                         * = longest row
		  * [N---N---][N---N---][N---N]             []  = same parent group
		  * [N---][N---N---N---N---N---N] *
		  * [N---][N---][N---N---N---N]
		  * [N---][N]
		  * [N---N---][N]
		  * ```
		  * 
		*/
		_groupNodesByParent: function(row) {
			var self = this;
			var current_group = [];
			var current_parent = null;
			var groups = [current_group];
			// Iterates over `row`. This works on array,objects and null/undefined
			var __lj=row;
			var __mj=__lj instanceof Array ? __lj : Object.getOwnPropertyNames(__lj||{});
			var __nj=__mj.length;
			for (var __oj=0;__oj<__nj;__oj++){
				var i=(__mj===__lj)?__oj:__mj[__oj];
				var node=__lj[i];
				// This is the body of the iteration with (value=node, key/index=i) in __lj
				var parent_id = self.options.getParentID(node);;
				if (i == 0) {
					current_parent = parent_id;
					current_group.push(node);
				} else if (parent_id == current_parent) {
					current_group.push(node);
				} else {
					current_parent = parent_id;
					current_group = [node];
					groups.push(current_group);
				};
			}
			return groups;
		},
		
		/**
		  * Lays out a row (as a list of list of nodes with the same parent)
		  * within the given `width` at `y` offset using the given `centroids:[String=Int]`
		  * mapping node id to an `x` offset.
		  * 
		  * The layout algorithm will to a horizontal layout of the nodes within
		  * the groups, trying to center them on the centroid (if any), fitting within
		  * the `width` space.
		  * 
		  * This relies of the `_sizeByID:[String=(Int,Int)]` map.
		  * 
		*/
		_layoutRow: function(groups, width, y, centroids) {
			var self = this;
			var row_width = self.options.padding[0];
			var group_width = extend.map(groups, function(_) {
				return extend.reduce(_, function(r, n) {
					var w = (self._sizeByID[self.options.getID(n)][0] + self.options.padding[0]);
					row_width = (row_width + w);
					return (r + w);
				}, 0);
			});
			var free_space = (width - row_width);
			var x = self.options.padding[0];
			// Iterates over `groups`. This works on array,objects and null/undefined
			var __pj=groups;
			var __qj=__pj instanceof Array ? __pj : Object.getOwnPropertyNames(__pj||{});
			var __sj=__qj.length;
			for (var __rj=0;__rj<__sj;__rj++){
				var i=(__qj===__pj)?__rj:__qj[__rj];
				var group=__pj[i];
				// This is the body of the iteration with (value=group, key/index=i) in __pj
				var parent_id = self.options.getParentID(group[0]);;
				var parent_centroid = centroids[parent_id];;
				if (!parent_id) {
					parent_centroid = (width / 2);
				};
				if ((free_space > 0) && parent_centroid) {
					var w = group_width[i];
					var c = (x + (w / 2));
					var delta = (parent_centroid - c);
					var adjust = Math.max(0, Math.min(delta, free_space));
					x = (x + adjust);
					free_space = (free_space - adjust);
				};
				var group_start = x;;
				// Iterates over `group`. This works on array,objects and null/undefined
				var __tj=group;
				var __uj=__tj instanceof Array ? __tj : Object.getOwnPropertyNames(__tj||{});
				var __wj=__uj.length;
				for (var __vj=0;__vj<__wj;__vj++){
					var j=(__uj===__tj)?__vj:__uj[__vj];
					var node=__tj[j];
					// This is the body of the iteration with (value=node, key/index=j) in __tj
					var node_id = self.options.getID(node);;
					var node_size = self._sizeByID[node_id];;
					var node_centroid = centroids[node_id];;
					if (node_centroid) {
						var delta = (node_centroid - x);
						var adjust = Math.max(0, Math.min(delta, free_space));
						x = (x + adjust);
						free_space = (free_space - adjust);
					};
					self.options.setPosition(node, x, y);
					centroids[node_id] = (x + (node_size[0] / 2));
					x = (x + (node_size[0] + self.options.padding[0]));
				};
				if (parent_id && (!centroids[parent_id])) {
					centroids[parent_id] = (group_start + ((x - group_start) / 2));
				};
			}
		}
	}
})
layouts.init = function(){
	var self = layouts;
}
if (typeof(layouts.init)!="undefined") {layouts.init();}

// START:VANILLA_POSTAMBLE
return layouts;})(layouts);
// END:VANILLA_POSTAMBLE
