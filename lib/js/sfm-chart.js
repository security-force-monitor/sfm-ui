// 8< ---[sfm.js]---
// START:VANILLA_PREAMBLE
var sfm=typeof(extend)!='undefined' ? extend.module('sfm') : (typeof(sfm)!='undefined' ? sfm : {});
(function(sfm){
var Widget = widgets.Widget;
var Element = widgets.Element;
var T = widgets.T;
var $ = widgets.$;
var Application = app.Application;
var URL = app.URL;
var APP = app.APP;
var ON = app.ON;
var Date = dates.Date;
var __module__=sfm;
// END:VANILLA_PREAMBLE


sfm.Node = extend.Class({
	name  :'sfm.Node',
	parent: widgets.Element,
	properties: {
		graph:undefined,
		size:undefined,
		position:undefined,
		edges:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `size`
		if (typeof(self.size)=='undefined') {self.size = [0, 0];};
		// Default value for property `position`
		if (typeof(self.position)=='undefined') {self.position = [0, 0];};
		// Default value for property `edges`
		if (typeof(self.edges)=='undefined') {self.edges = [];};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Node.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.Node.getParent()).bindUI();
			self._update();
		},
		
		getChildren: function() {
			var self = this;
			return extend.filter(self.edges, function(e) {
				return (e.source.data.id == self.data.id);
			});
		},
		
		countChildren: function() {
			var self = this;
			return extend.len(self.getChildren());
		},
		
		hasChildren: function() {
			var self = this;
			return (extend.len(self.getChildren()) > 0);
		},
		
		isCollapsed: function() {
			var self = this;
			return self.ui.hasClass("collapsed");
		},
		
		isVisible: function() {
			var self = this;
			return (!self.ui.hasClass("hidden"));
		},
		
		countDescendants: function() {
			var self = this;
			var count = 0;
			// Iterates over `self.getChildren()`. This works on array,objects and null/undefined
			var __j=self.getChildren();
			var __k=__j instanceof Array ? __j : Object.getOwnPropertyNames(__j||{});
			var __m=__k.length;
			for (var __l=0;__l<__m;__l++){
				var __i=(__k===__j)?__l:__k[__l];
				var _=__j[__i];
				// This is the body of the iteration with (value=_, key/index=__i) in __j
				count = (count + 1);
				count = (count + _.destination.countDescendants());
			}
			return count;
		},
		
		getParent: function() {
			var self = this;
			var parents = [];
			// Iterates over `self.edges`. This works on array,objects and null/undefined
			var __n=self.edges;
			var __p=__n instanceof Array ? __n : Object.getOwnPropertyNames(__n||{});
			var __r=__p.length;
			for (var __q=0;__q<__r;__q++){
				var __o=(__p===__n)?__q:__p[__q];
				var e=__n[__o];
				// This is the body of the iteration with (value=e, key/index=__o) in __n
				if (e.destination && (e.destination.data.id == self.data.id)) {
					parents.push(e.source);
				};
			}
			if (extend.len(parents) > 1) {
				console.warn((("Node.getParent:found " + extend.len(parents)) + " parents for node"), self);
			}
			return parents[0];
		},
		
		getParentID: function() {
			var self = this;
			var parent = self.getParent();
			if (!parent) {
				return null;
			}
			return parent.data.id;
		},
		
		/**
		  * Walks the sub-tree, stopping at collapsed nodes if `collapsed` is `False`
		  * (default), executing the `callback` with (Node, Edge).
		  * 
		*/
		walk: function(callback, collapsed) {
			var self = this;
			if (collapsed === undefined) {collapsed=false}
			if (collapsed || (!self.isCollapsed())) {
				// Iterates over `self.getChildren()`. This works on array,objects and null/undefined
				var __t=self.getChildren();
				var __u=__t instanceof Array ? __t : Object.getOwnPropertyNames(__t||{});
				var __w=__u.length;
				for (var __v=0;__v<__w;__v++){
					var __s=(__u===__t)?__v:__u[__v];
					var _=__t[__s];
					// This is the body of the iteration with (value=_, key/index=__s) in __t
					if (callback) {
						callback(_.destination, _);
					};
					_.destination.walk(callback);
				}
			}
		},
		
		walkParents: function(callback) {
			var self = this;
			var node = self;
			var parent = self.getParent();
			while (parent) {
				var edge = parent.getEdgeTo(node);
				callback(edge, parent);
				node = parent;
				parent = parent.getParent();
			}
		},
		
		collapse: function() {
			var self = this;
			self.walk(function(_, e) {
				_.hide();
				return e.render();
			});
			var c = self.countDescendants();
			self.set("descendants", c);
			self.ui.attr("data-descendants", ("" + c));
			self.ui.addClass("collapsed");
			self._update();
		},
		
		expand: function(doWalk) {
			var self = this;
			if (doWalk === undefined) {doWalk=true}
			self.ui.removeClass("collapsed");
			self.show();
			if (doWalk) {
				self.walk(function(_, e) {
					_.show();
					return e.render();
				});
			}
			self._update();
		},
		
		resetEdges: function() {
			var self = this;
			self.edges = [];
			return self;
		},
		
		addEdge: function(edge) {
			var self = this;
			self.edges.push(edge);
			return self;
		},
		
		getEdgeTo: function(node) {
			var self = this;
			return extend.first(self.edges, function(_) {
				return (_.destination == node);
			});
		},
		
		setGraph: function(graph) {
			var self = this;
			self.graph = graph;
			return self;
		},
		
		setData: function(data) {
			var self = this;
			self.getSuper(__module__.Node.getParent()).setData(data);
			var commander = (data.commander_present || data.current_commander);
			var has_commander = (!extend.len(commander));
			self.ui.toggleClass("no-commander", has_commander);
			self.set(data);
			self._update();
			return self;
		},
		
		setPosition: function(x, y) {
			var self = this;
			self.ui.css({"left":x, "top":y});
			self.position[0] = x;
			self.position[1] = y;
			return self;
		},
		
		getPosition: function(rx, ry) {
			var self = this;
			if (rx === undefined) {rx=0}
			if (ry === undefined) {ry=0}
			return [(self.position[0] + (self.size[0] * rx)), (self.position[1] + (self.size[1] * ry))];
		},
		
		_update: function() {
			var self = this;
			self.size = dimension.sizeA(self.ui);
		}
	}
})

sfm.Edge = extend.Class({
	name  :'sfm.Edge',
	parent: widgets.Element,
	properties: {
		lineType:undefined,
		source:undefined,
		destination:undefined,
		_source:undefined,
		_destination:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `lineType`
		if (typeof(self.lineType)=='undefined') {self.lineType = "line";};
		// Default value for property `_source`
		if (typeof(self._source)=='undefined') {self._source = null;};
		// Default value for property `_destination`
		if (typeof(self._destination)=='undefined') {self._destination = null;};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Edge.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		setSource: function(node) {
			var self = this;
			self.source = node;
			if (self.source) {
				var c = stats.asKey(self.source.data.classification);
				self.ui.attr("data-classification", c);
				if (c == "unofficial") {
					self.lineType = "spline";
				} else {
					self.lineType = "line";
				}
			}
			return self;
		},
		
		setDestination: function(node) {
			var self = this;
			self.destination = node;
			return self;
		},
		
		relayout: function() {
			var self = this;
			var ss = self.source.size;
			var ds = self.destination.size;
			var sp = [(self.source.position[0] + (ss[0] / 2)), (self.source.position[1] + ss[1])];
			var dp = [(self.destination.position[0] + (ds[0] / 2)), self.destination.position[1]];
			self._source = sp;
			self._destination = dp;
		},
		
		isVisible: function() {
			var self = this;
			return ((self.source.isVisible() && self.destination.isVisible()) && (!self.source.isCollapsed()));
		},
		
		render: function() {
			var self = this;
			self.ui.toggleClass("hidden", (!self.isVisible()));
			if (self.isVisible()) {
				if (!self._source) {
					self.relayout();
				}
				var path = graphing.Path.Get();
				path.move(self._source[0], self._source[1]);
				if (self.lineType == "spline") {
					path.curve(self._source[0], self._destination[1], self._destination[0], self._source[1], self._destination[0], self._destination[1]);
				} else {
					path.line(self._source[0], (self._source[1] + 10));
					path.line(self._destination[0], (self._destination[1] - 10));
					path.line(self._destination[0], self._destination[1]);
				}
				path.apply(self.ui[0]);
			}
		}
	}
})

sfm.Chart = extend.Class({
	name  :'sfm.Chart',
	parent: widgets.Widget,
	shared: {
		STATES: {"organization":[true, false], "empty":[true, false], "perspective":["organizations", "commanders"]},
		UIS: {"graph":".graph", "content":".graph > .content", "edges":".graph .edges", "nodes":".graph .nodes", "nodeTmpl":".graph .node.template", "edgeTmpl":".graph .edge.template"},
		OPTIONS: {"minwidth":600, "minheight":600}
	},
	properties: {
		cache:undefined,
		handlers:undefined,
		layout:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `cache`
		if (typeof(self.cache)=='undefined') {self.cache = {"zoom":1};};
		// Default value for property `handlers`
		if (typeof(self.handlers)=='undefined') {self.handlers = {"content":{"drag":{"start":self.getMethod('onContentDragStart') , "drag":self.getMethod('onContentDrag') , "end":self.getMethod('onContentDragEnd') }, "mouse":{"wheel":self.getMethod('onChartWheel') }}, "node":{"mouse":{"in":self.getMethod('onNodeIn') , "out":self.getMethod('onNodeOut') }, "press":self.getMethod('onNodePressed') }};};
		// Default value for property `layout`
		if (typeof(self.layout)=='undefined') {self.layout = new extend.modules.layouts.Hierarchy({"getID":function(_) {
			return _.data.id;
		}, "getParentID":function(_) {
			var p_name = (_.getParent() && _.getParent().data.name);
			return _.getParentID();
		}});};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Chart.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.Chart.getParent()).bindUI();
			widgets.bindEvent(self.inputs.perspective, "change", self.getMethod('onPerspectiveChange') );
			widgets.bindEvent(self.inputs.filter, "change", self.getMethod('onFilterChange') );
			app.URL.bind(self.getMethod('onURLStateChanged') );
		},
		
		onURLStateChanged: function(event) {
			var self = this;
			var update_selection = false;
			if ((event.isInitial || event.changed.__path__) || event.changed.date) {
				var date = sfm.API.getCurrentDate();
				var org = sfm.API.getCurrentOrganization();
				var person = sfm.API.getCurrentPerson();
				var is_empty = ((!org) && (!self.cache.currentOrganization));
				self.setState("empty", is_empty);
				if ((extend.cmp(date, self.cache.currentDate) != 0) || (org != self.cache.currentOrganization)) {
					self.setOrganization(org, date);
				} else {
					self._updateSelectedNodes(true);
				}
			}
			if (event.changed.perspective) {
				self.set("perspective", event.values.perspective);
				self.setState("perspective", event.values.perspective);
				if (self.uis.viz.nodes) {
					// Iterates over `self.uis.viz.nodes.all`. This works on array,objects and null/undefined
					var __y=self.uis.viz.nodes.all;
					var __z=__y instanceof Array ? __y : Object.getOwnPropertyNames(__y||{});
					var __b=__z.length;
					for (var __a=0;__a<__b;__a++){
						var __x=(__z===__y)?__a:__z[__a];
						var _=__y[__x];
						// This is the body of the iteration with (value=_, key/index=__x) in __y
						_._update();
					}
					self.render();
					self._updateSelectedNodes(true);
				}
			}
		},
		
		/**
		  * Updates the current selection, focusing on the first selected
		  * node when `focus` is True.
		  * 
		*/
		_updateSelectedNodes: function(focus) {
			var self = this;
			if (focus === undefined) {focus=false}
			if (!self.uis.viz.nodes) {
				return false;
			}
			self.resetNodesState();
			var selected = [];
			if (self.getState("perspective") == "organizations") {
				var org = sfm.API.getCurrentOrganization();
				var node = self.uis.viz.nodes.byID[org];
				if (node) {
					selected.push(node);
				}
			} else {
				var person = sfm.API.getCurrentPerson();
				selected = self.uis.viz.nodes.byPersonID[person];
			}
			// Iterates over `selected`. This works on array,objects and null/undefined
			var __d=selected;
			var __e=__d instanceof Array ? __d : Object.getOwnPropertyNames(__d||{});
			var __g=__e.length;
			for (var __f=0;__f<__g;__f++){
				var __c=(__e===__d)?__f:__e[__f];
				var node=__d[__c];
				// This is the body of the iteration with (value=node, key/index=__c) in __d
				node.ui.addClass("selected");
				node.walkParents(function(e, n) {
					e.ui.addClass("selected");
					return n.ui.addClass("parent-selected");
				});
			}
			if (focus) {
				if (selected) {
					self.focusOnNode(selected[0], undefined, true);
				}
			}
		},
		
		onContentDragStart: function(event) {
			var self = this;
			self.cache.contentDragOrigin = [parseInt(self.uis.content.css("left")), parseInt(self.uis.content.css("top"))];
			self.ui.addClass("dragging");
		},
		
		onContentDrag: function(event) {
			var self = this;
			self.uis.content.css({"left":(self.cache.contentDragOrigin[0] + event.delta[0]), "top":(self.cache.contentDragOrigin[1] + event.delta[1])});
		},
		
		onContentDragEnd: function(event) {
			var self = this;
			self.ui.removeClass("dragging");
		},
		
		onChartWheel: function(event) {
			var self = this;
			var delta = stats.normalize(event.deltaY);
			if (delta > 0) {
				self.zoomOut();
			} else {
				self.zoomIn();
			}
		},
		
		onFilterChange: function(event) {
			var self = this;
		},
		
		onPerspectiveChange: function(event) {
			var self = this;
			var v = self.get("perspective");
			self.renderZoom(1);
			app.URL.update("perspective", v);
		},
		
		onNodePressed: function(event) {
			var self = this;
			var node = widgets.get(event.currentTarget);
			if (node.isCollapsed() && node.hasChildren()) {
				node.expand();
				self.render();
				self.focusOnNode(node, self.getNodeFocusPoint(node), true);
			}
			if (self.getState("perspective") == "organizations") {
				sfm.API.setCurrentOrganization(node.data.id);
			} else {
				if (node.data.commander) {
					sfm.API.setCurrentPerson(node.data.commander.id);
				}
			}
		},
		
		onNodeIn: function(event) {
			var self = this;
			var node = widgets.get(event.currentTarget);
			self.setNodeAsFocused(node);
		},
		
		onNodeOut: function(event) {
			var self = this;
			var node = widgets.get(event.currentTarget);
			self.setNodeAsUnfocused(node);
		},
		
		zoomIn: function() {
			var self = this;
			var zoom = self.cache.zoom;
			zoom = stats.clamp((zoom + 0.1), 0.5, 2);
			self.renderZoom(zoom);
		},
		
		zoomOut: function() {
			var self = this;
			var zoom = self.cache.zoom;
			zoom = stats.clamp((zoom - 0.1), 0.5, 2);
			self.renderZoom(zoom);
		},
		
		renderZoom: function(zoom) {
			var self = this;
			if (zoom === undefined) {zoom=self.cache.zoom}
			self.uis.content.css("transform", (("translateZ(0)scale(" + zoom) + ")"));
			self.cache.zoom = zoom;
		},
		
		setOrganization: function(organization, date) {
			var self = this;
			if (organization === undefined) {organization=self.cache.currentOrganization}
			if (date === undefined) {date=self.cache.currentDate}
			var has_different_date = (extend.cmp(date, self.cache.currentDate) != 0);
			var previous_node = self.ensureNode(self.cache.currentOrganization);
			self.cache.currentOrganization = organization;
			self.cache.currentDate = date;
			if (organization) {
				!(date) && extend.assert(false, "sfm.Chart.setOrganization:", "Chart.setOrganization: date is required, got nothing", "(failed `date`)");
				var organization_node = self.ensureNode(organization);
				if ((has_different_date || (!organization_node)) || (organization_node == self.getRoot())) {
					self.ui.addClass("loading");
					if (self.cache.getOrganizationChartFuture) {
						self.cache.getOrganizationChartFuture.cancel();
					}
					self.cache.getOrganizationChartFuture = sfm.API.getOrganizationChart(organization, {"date":date}).onSucceed(function(v) {
						self.ui.removeClass("loading");
						self.renderZoom(1);
						return self.setData(v);
					}).onFail(function() {
						return self.ui.removeClass("loading");
					});
				} else {
					self.renderZoom(1);
					self._updateSelectedNodes(true);
				}
				self.setState("organization", true);
			} else {
				self.ui.removeClass("loading");
				self.setState("organization", false);
			}
		},
		
		_flattenData: function(data) {
			var self = this;
			var all = [];
			all.push(data);
			var children = extend.reduce(data.children, function(seed, e) {
				var duplicate = extend.first(seed, function(_) {
					return (_.id == e.id);
				});
				if (!duplicate) {
					seed.push(e);
				}
				return seed;
			}, []);
			var children_dif = Math.abs((extend.len(children) - extend.len(data.children)));
			if (children_dif != 0) {
				console.warn(children_dif, "duplicate children found in node", data.id);
			}
			// Iterates over `children`. This works on array,objects and null/undefined
			var __ij=children;
			var __jj=__ij instanceof Array ? __ij : Object.getOwnPropertyNames(__ij||{});
			var __lj=__jj.length;
			for (var __kj=0;__kj<__lj;__kj++){
				var __h=(__jj===__ij)?__kj:__jj[__kj];
				var c=__ij[__h];
				// This is the body of the iteration with (value=c, key/index=__h) in __ij
				all.push(c);
			}
			var parents = extend.filter(data.parents, function(p) {
				return (p.child_id == data.id);
			});
			if (extend.len(parents) > 0) {
				all.push(parents[0]);
			}
			if (extend.len((parents > 1))) {
				console.warn("Chart._flattenData:many parents found for node", data);
			}
			return all;
		},
		
		setData: function(data) {
			var self = this;
			var by_id = {};
			data = extend.reduce(self._flattenData(data), function(r, _) {
				if (!by_id[_.id]) {
					var commander = (_.commander_present || _.current_commander);
					if (commander) {
						_.commander_name = (commander.name || null);
						_.commander_events_count = (commander.events_count || 0);
					} else {
						_.commander_name = null;
						_.commander_events_count = 0;
					}
					r.push(_);
					by_id[_.id] = _;
				} else {
				
				}
			}, []);
			var ids = stats.map1(data, "get:id");
			var pids = stats.map1(data, "get:parent_id");
			var unresolved = extend.filter(extend.difference(pids, ids), function(_) {
				return _;
			});
			!((extend.len(unresolved) == 0)) && extend.assert(false, "sfm.Chart.setData:", "Chart.setData: Unresolved parent_id", unresolved, "(failed `(extend.len(unresolved) == 0)`)");
			var unknown_parents = extend.filter(data, function(_) {
				return (!((extend.isIn(_.parent_id,unresolved))));
			});
			!((extend.len(data) == extend.len(unknown_parents))) && extend.assert(false, "sfm.Chart.setData:", "Chart: removed nodes with unknown parent: ", (extend.len(data) - extend.len(unknown_parents)), "(failed `(extend.len(data) == extend.len(unknown_parents))`)");
			self.getSuper(__module__.Chart.getParent()).setData(data);
			self.visualize("nodes", data, self.getMethod('_renderNode') );
			self.visualize("edges", self.uis.viz.nodes.edges, self.getMethod('_renderEdge') );
			// Iterates over `self.uis.viz.nodes.all`. This works on array,objects and null/undefined
			var __oj=self.uis.viz.nodes.all;
			var __nj=__oj instanceof Array ? __oj : Object.getOwnPropertyNames(__oj||{});
			var __qj=__nj.length;
			for (var __pj=0;__pj<__qj;__pj++){
				var __mj=(__nj===__oj)?__pj:__nj[__pj];
				var n=__oj[__mj];
				// This is the body of the iteration with (value=n, key/index=__mj) in __oj
				n.expand(false);
			}
			self.layout.setElements(self.uis.viz.nodes.all).prepare();
			// Iterates over `extend.slice(self.layout.traversal,3,undefined)`. This works on array,objects and null/undefined
			var __sj=extend.slice(self.layout.traversal,3,undefined);
			var __tj=__sj instanceof Array ? __sj : Object.getOwnPropertyNames(__sj||{});
			var __vj=__tj.length;
			for (var __uj=0;__uj<__vj;__uj++){
				var __rj=(__tj===__sj)?__uj:__tj[__uj];
				var row=__sj[__rj];
				// This is the body of the iteration with (value=row, key/index=__rj) in __sj
				// Iterates over `row`. This works on array,objects and null/undefined
				var __xj=row;
				var __yj=__xj instanceof Array ? __xj : Object.getOwnPropertyNames(__xj||{});
				var __aj=__yj.length;
				for (var __zj=0;__zj<__aj;__zj++){
					var __wj=(__yj===__xj)?__zj:__yj[__zj];
					var _=__xj[__wj];
					// This is the body of the iteration with (value=_, key/index=__wj) in __xj
					var node = self.ensureNode(_);;
					node.collapse();
				};
			}
			self.render();
			self._updateSelectedNodes(true);
			return self;
		},
		
		setSize: function(size) {
			var self = this;
			self.uis.content.css({"width":size[0], "height":size[1]});
			self.uis.edges.attr({"width":size[0], "height":size[1]});
			return size;
		},
		
		render: function() {
			var self = this;
			if (self.cache.isRendering) {
				return false;
			}
			self.cache.isRendering = true;
			self.layout.prepare();
			var size = self.setSize(self.layout.run());
			// Iterates over `self.uis.viz.edges.all`. This works on array,objects and null/undefined
			var __cj=self.uis.viz.edges.all;
			var __dj=__cj instanceof Array ? __cj : Object.getOwnPropertyNames(__cj||{});
			var __fj=__dj.length;
			for (var __ej=0;__ej<__fj;__ej++){
				var __bj=(__dj===__cj)?__ej:__dj[__ej];
				var _=__cj[__bj];
				// This is the body of the iteration with (value=_, key/index=__bj) in __cj
				_.relayout();
				_.render();
			}
			self.cache.isRendering = false;
		},
		
		getRoot: function() {
			var self = this;
			var root = self.uis.viz.nodes.all[0];
			var at_root = false;
			while ((!at_root)) {
				var parent = root.getParent();
				if (!parent) {
					at_root = true;
				} else {
					root = parent;
				}
			}
			return root;
		},
		
		getNodeFocusPoint: function(node) {
			var self = this;
			return [0.5, 0.5];
		},
		
		/**
		  * Clears `focused`, `parent-focused` and `selected` classes from all
		  * nodes & edges.
		  * 
		*/
		resetNodesState: function() {
			var self = this;
			self.getRoot().walk(function(n, e) {
				n.ui.removeClass("focused").removeClass("parent-focused").removeClass("selected").removeClass("parent-selected");
				return e.ui.removeClass("focused").removeClass("parent-focused").removeClass("selected").removeClass("parent-selected");
			});
		},
		
		setNodeAsFocused: function(node) {
			var self = this;
			node = self.ensureNode(node);
			if (node) {
				if (!node.ui.hasClass("focused")) {
					node.ui.addClass("focused");
					node.walkParents(function(e, n) {
						e.ui.addClass("focused");
						return n.ui.addClass("focused");
					});
				}
			}
			return node;
		},
		
		setNodeAsUnfocused: function(node) {
			var self = this;
			node = self.ensureNode(node);
			if (node.ui.hasClass("focused")) {
				node.ui.removeClass("focused");
				node.walkParents(function(e, n) {
					e.ui.removeClass("focused");
					return n.ui.removeClass("focused");
				});
			}
			return node;
		},
		
		focusOnNode: function(node, position, transition) {
			var self = this;
			if (position === undefined) {position=[0.5, 0.5]}
			if (transition === undefined) {transition=false}
			var node = self.ensureNode(node);
			if (node) {
				var center = node.getPosition(0.5, 0.5);
				var size = dimension.sizeA(self.ui);
				var look_at = geom.Point.Multiply(size, position);
				var offset = geom.Point.Remove(center, look_at);
				self.moveGraph(offset, transition);
			}
		},
		
		ensureNode: function(value) {
			var self = this;
			if ((!value) || (!self.uis.viz.nodes)) {
				return null;
			}
			return self.uis.viz.nodes.byID[self.ensureNodeID(value)];
		},
		
		ensureNodeID: function(value) {
			var self = this;
			if (!value) {
				return null;
			} else if (extend.isString(value)) {
				return value;
			} else if (__module__.Node.hasInstance(value)) {
				return value.data.id;
			} else {
				return value.id;
			}
		},
		
		moveGraph: function(offset, transition) {
			var self = this;
			if (transition === undefined) {transition=false}
			if (!self.tweens.moveGraph) {
				self.tweens.moveGraph = new animation.Tween().setDuration("0.5s").setEasing("Quadratic").setSource([0, 0]).setDestination([0, 0]).onStep(function(v) {
					return self.uis.content.css({"left":(0 - v[0]), "top":(0 - v[1])});
				});
			}
			if (transition) {
				var po = [(0 - parseInt((self.uis.content.css("left") || 0))), (0 - parseInt((self.uis.content.css("top") || 0)))];
				self.tweens.moveGraph.cancel().setSource(po).setDestination(offset).start();
			} else {
				self.tweens.moveGraph.cancel().setSource(offset).step();
			}
		},
		
		_renderNode: function(context, datum, index, element) {
			var self = this;
			if (index == 0) {
				context.edges = [];
				context.byID = {};
				context.byPersonID = {};
			}
			if (!element) {
				element = new __module__.Node(self.cloneTemplate(self.uis.nodeTmpl, self.uis.nodes)).setGraph(self);
				self.handlers.node.bind(element.ui);
			}
			context.byID[datum.id] = element;
			if (datum.commander_present) {
				var cid = datum.commander_present.id;
				context.byPersonID[cid] = (context.byPersonID[cid] || []);
				context.byPersonID[cid].push(element);
			}
			element.setData(datum).show();
			if (datum.child_id || datum.parent_id) {
				if (datum.parent_id) {
					context.edges.push([datum.parent_id, datum.id]);
				}
				if (datum.child_id) {
					context.edges.push([datum.id, datum.child_id]);
				}
			}
			element.resetEdges();
			return element;
		},
		
		_renderEdge: function(context, datum, index, element) {
			var self = this;
			if (!element) {
				var path = svg.path({"_":"edge"});
				element = new __module__.Edge(path);
				self.uis.edges.append(path);
			}
			var parent = self.uis.viz.nodes.byID[datum[0]];
			var child = self.uis.viz.nodes.byID[datum[1]];
			!(parent) && extend.assert(false, "sfm.Chart._renderEdge:", "Chart: parent node ", datum[0], "not found for edge", datum, "(failed `parent`)");
			!(child) && extend.assert(false, "sfm.Chart._renderEdge:", "Chart: child  node ", datum[0], "not found for edge", datum, "(failed `child`)");
			if (parent && child) {
				element.setSource(parent).setDestination(child).show();
				parent.addEdge(element);
				child.addEdge(element);
			}
			return element;
		}
	}
})
sfm.init = function(){
	var self = sfm;
}
if (typeof(sfm.init)!="undefined") {sfm.init();}

// START:VANILLA_POSTAMBLE
return sfm;})(sfm);
// END:VANILLA_POSTAMBLE
