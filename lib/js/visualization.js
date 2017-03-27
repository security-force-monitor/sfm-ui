// 8< ---[visualization.js]---
/**
  * The visualization module defines classes that allow to easily
  * transform data into visual elements by mapping DOM/SVG nodes to individual
  * data elements.
  * 
*/
// START:VANILLA_PREAMBLE
var visualization=typeof(extend)!='undefined' ? extend.module('visualization') : (typeof(visualization)!='undefined' ? visualization : {});
(function(visualization){
var __module__=visualization;
// END:VANILLA_PREAMBLE

visualization.__VERSION__='0.4.3';
visualization.LICENSE = "http://ffctn.com/doc/licenses/proprietary";
visualization.$ = (((typeof(jQuery) != "undefined") && jQuery) || extend.modules.select);
visualization.NAMESPACES = {"svg":"http://www.w3.org/2000/svg", "xlink":"http://www.w3.org/1999/xlink", "html":null, "xhtml":"http://www.w3.org/1999/xhtml", "xml":"http://www.w3.org/XML/1998/namespace", "xmlns":"http://www.w3.org/2000/xmlns/"};
/**
  * An object that stores the rendering context for visulization
  * objects/functions. Note that the context is not thread-safe as it's mutated
  * at each iteration.
  * 
*/
visualization.Context = extend.Class({
	name  :'visualization.Context',
	parent: undefined,
	shared: {
		COUNT: 0
	},
	properties: {
		id:undefined,
		all:undefined,
		node:undefined,
		parentContext:undefined,
		keys:undefined,
		datum:undefined,
		index:undefined,
		mark:undefined,
		viz:undefined
	},
	initialize: function( ui ){
		var self = this;
		// Default initialization of property `id`
		if (typeof(self.id)=='undefined') {self.id = -1;};
		// Default initialization of property `all`
		if (typeof(self.all)=='undefined') {self.all = {};};
		// Default initialization of property `node`
		if (typeof(self.node)=='undefined') {self.node = undefined;};
		// Default initialization of property `parentContext`
		if (typeof(self.parentContext)=='undefined') {self.parentContext = undefined;};
		// Default initialization of property `keys`
		if (typeof(self.keys)=='undefined') {self.keys = undefined;};
		// Default initialization of property `datum`
		if (typeof(self.datum)=='undefined') {self.datum = undefined;};
		// Default initialization of property `index`
		if (typeof(self.index)=='undefined') {self.index = undefined;};
		// Default initialization of property `mark`
		if (typeof(self.mark)=='undefined') {self.mark = undefined;};
		// Default initialization of property `viz`
		if (typeof(self.viz)=='undefined') {self.viz = undefined;};
		self.id = self.getClass().COUNT;
		self.getClass().COUNT = (self.getClass().COUNT + 1);
		self.node = ui;
	},
	methods: {
		copy: function() {
			var self = this;
			var res = new __module__.Context();
			res.all = self.all;
			res.keys = self.keys;
			res.datum = self.datum;
			res.index = self.index;
			res.mark = self.mark;
			res.viz = self.viz;
		}
	}
})
/**
  * Visualizations allow to aggregate marks together while also providing an
  * optional scope and options to be used by the marks.
  * 
  * ```
  * new Visualization (node) mark {
  * ...
  * } mark {
  * } render (data)
  * ```
  * 
  * The visualization offers event hooks that can be called to udpate the
  * visualization and its data at strategic moments:
  * 
  * - `relayout` when the visualization is relaid out, which is usually triggered
  * explicitely when the screen/page size changes
  * - `prerender` which is called just before the marks are rendered
  * - `render` which is called after the marks are rendered
  * 
  * The role of the visualization is to hold the contexts/options/parameters
  * that will be accessed by the marks when rendering. Visualization defines
  * the following attributes:
  * 
  * - `options` -- a map of options that parameter the visualization
  * - `data` -- a map of data elements that can be accessed by marks
  * - `scales` -- allows to store scales
  * - `cache` -- allows to store cache data (usually pre-processed data)
  * - `uis` -- allows to store DOM/SVG nodes
  * - `size` -- the current size of the visualization (in pixels)
  * 
  * - `ui` -- the DOM/SVG node to which the visualization is bound
  * - `marks` -- the list of marks that will be rendered when this
  * visualization is rendered.
  * 
*/
visualization.Visualization = extend.Class({
	name  :'visualization.Visualization',
	parent: undefined,
	shared: {
		COUNT: 0
	},
	properties: {
		id:undefined,
		ui:undefined,
		uis:undefined,
		options:undefined,
		data:undefined,
		cache:undefined,
		scales:undefined,
		size:undefined,
		children:undefined,
		on:undefined
	},
	initialize: function( ui ){
		var self = this;
		// Default initialization of property `uis`
		if (typeof(self.uis)=='undefined') {self.uis = {"canvas":null};};
		// Default initialization of property `options`
		if (typeof(self.options)=='undefined') {self.options = {};};
		// Default initialization of property `data`
		if (typeof(self.data)=='undefined') {self.data = null;};
		// Default initialization of property `cache`
		if (typeof(self.cache)=='undefined') {self.cache = {};};
		// Default initialization of property `scales`
		if (typeof(self.scales)=='undefined') {self.scales = {};};
		// Default initialization of property `size`
		if (typeof(self.size)=='undefined') {self.size = undefined;};
		// Default initialization of property `children`
		if (typeof(self.children)=='undefined') {self.children = [];};
		// Default initialization of property `on`
		if (typeof(self.on)=='undefined') {self.on = events.create(["relayout", "prerender", "render"]);;};
		self.id = ("V" + self.getClass().COUNT);
		self.getClass().COUNT = (self.getClass().COUNT + 1);
		self.options = (self.options || {});
		if (ui) {
			self.ui = __module__.$(ui);
			!((self.ui.length > 0)) && extend.assert(false, "visualization.Visualization.__init__:", "Visualization: empty ui node given at constructor", "(failed `(self.ui.length > 0)`)");
		} else {
			self.ui = null;
		}
	},
	methods: {
		relayout: function() {
			var self = this;
			if (!extend.isDefined(self.size)) {
				self.size = [0, 0];
			}
			if (self.ui) {
				self.size[0] = self.ui.width();
				self.size[1] = self.ui.height();
			}
			self.on.relayout.trigger(self);
			return self;
		},
		
		render: function(data) {
			var self = this;
			if (data === undefined) {data=self.data}
			self.data = data;
			self.on.prerender.trigger(data, self);
			if (!extend.isDefined(self.size)) {
				self.relayout();
			}
			if (data) {
				// Iterates over `self.children`. This works on array,objects and null/undefined
				var __i=self.children;
				var __j=__i instanceof Array ? __i : Object.getOwnPropertyNames(__i||{});
				var __l=__j.length;
				for (var __k=0;__k<__l;__k++){
					var i=(__j===__i)?__k:__j[__k];
					var __m=__i[i];
					// This is the body of the iteration with (value=__m, key/index=i) in __i
					(function(mark){mark.render(data, (mark.ui || self.ui));}(__m))
				}
				self.on.render.trigger(data, self);
				return true;
			} else {
				return false;
			}
		},
		
		/**
		  * Adds the given mark(s) to this visualization
		  * 
		*/
		add: function(marks) {
			var self = this;
			marks = extend.sliceArguments(arguments,0)
			// Iterates over `marks`. This works on array,objects and null/undefined
			var __o=marks;
			var __n=__o instanceof Array ? __o : Object.getOwnPropertyNames(__o||{});
			var __q=__n.length;
			for (var __p=0;__p<__q;__p++){
				var i=(__n===__o)?__p:__n[__p];
				var m=__o[i];
				// This is the body of the iteration with (value=m, key/index=i) in __o
				if (!extend.isDefined(m)) {
					extend.error(("Visualization.add: got undefined mark #" + i));
				} else {
					if (!__module__.Mark.hasInstance(m)) {
						m = new __module__.Mark(m);
					}
					self.children.push(m);
				};
			}
			return self;
		},
		
		getMark: function(name) {
			var self = this;
			return extend.firstLike(marks, function(_) {
				return (_.name == name);
			});
		},
		
		/**
		  * An alias to setUIS
		  * 
		*/
		setUI: function(name, value) {
			var self = this;
			self.setUIS(name, value);
		},
		
		setUIS: function(name, value) {
			var self = this;
			if (extend.isString(name)) {
				self.uis[name] = value;
			} else if (extend.isMap(name)) {
				// Iterates over `name`. This works on array,objects and null/undefined
				var __r=name;
				var __s=__r instanceof Array ? __r : Object.getOwnPropertyNames(__r||{});
				var __u=__s.length;
				for (var __t=0;__t<__u;__t++){
					var k=(__s===__r)?__t:__s[__t];
					var v=__r[k];
					// This is the body of the iteration with (value=v, key/index=k) in __r
					self.setUI(k, v);
				}
			} else {
				extend.error(("Visualization.setUI: key type should be string: " + name));
			}
			return self;
		},
		
		set: function(name, value) {
			var self = this;
			if (extend.isString(name)) {
				self.options[name] = value;
			} else if (extend.isMap(name)) {
				// Iterates over `name`. This works on array,objects and null/undefined
				var __v=name;
				var __w=__v instanceof Array ? __v : Object.getOwnPropertyNames(__v||{});
				var __y=__w.length;
				for (var __x=0;__x<__y;__x++){
					var k=(__w===__v)?__x:__w[__x];
					var v=__v[k];
					// This is the body of the iteration with (value=v, key/index=k) in __v
					self.set(k, v);
				}
			} else {
				extend.error(("Visualization.set: key type should be string: " + name));
			}
			return self;
		},
		
		get: function(name) {
			var self = this;
			if (extend.isString(name)) {
				return self.options[name];
			} else if (extend.isMap(name)) {
				return extend.map(name, function(v, k) {
					return self.get(k);
				});
			} else {
				extend.error(("Visualization.set: key type should be string: " + name));
			}
		}
	}
})
/**
  * A mark describes how a particular element of data will be rendered as
  * a DOM/SVG node. Marks allow to define attributes & style properties.
  * 
  * ```
  * new Mark {
  * scope   : root
  * element : "rect.day"
  * attr    : {
  * x      : {d,i|return x (d[0])}
  * y      : 0
  * width  : x (new Date (2008,0,2))
  * height : size[1] - 20
  * }
  * style  : {
  * fill : {_|var c = color (_[1]) ; return d3 rgb (c,c,c) toString ()}
  * }
  * } render (data)
  * ```
  * 
  * You can specify operations depending on the phase (`create`, `update` or `remove`)
  * by assigning the corresponding properties.
  * 
  * Each value of `attr`, `style`, `html`, `text` and `each` can take:
  * 
  * - a _litteral value_
  * - a functor taking `(datum, index, node, context)` as parameters
  * - a map definining the transition of the property (see below)
  * 
  * A transition is defined as follow:
  * ```
  * {
  * from:     0              # From value/functor (optional, current value by default)
  * to:       10             # Destination value/functor
  * duration: 0.25           # Duration in seconds
  * easing:   "expoInOut"    # Name or easing function (see `animation.Easing`)
  * animator: Undefined      # Animator to be sued (optional)
  * }
  * ```
  * 
*/
visualization.Mark = extend.Class({
	name  :'visualization.Mark',
	parent: undefined,
	shared: {
		COUNT: 0,
		/**
		  * A dictionary of all marks that have a name
		  * 
		*/
		ALL: {},
		TYPE_CHILD: 1,
		TYPE_CHAIN: 0,
		RE_NAME: new RegExp("^(\\w+:)?(\\w[\\d\\w\\-]*)((\\.[\\w\\d_\\-]+)+)?$"),
		DEFAULT_NAMESPACE: __module__.NAMESPACES.svg,
		PROPERTIES: {"html":undefined, "text":undefined, "attr":undefined, "style":undefined, "each":undefined}
	},
	properties: {
		id:undefined,
		name:undefined,
		selector:undefined,
		_selector:undefined,
		namespace:undefined,
		ui:undefined,
		on:undefined,
		phases:undefined,
		children:undefined,
		data:undefined,
		processor:undefined,
		frame:undefined
	},
	initialize: function( options ){
		var self = this;
		// Default initialization of property `id`
		if (typeof(self.id)=='undefined') {self.id = undefined;};
		// Default initialization of property `name`
		if (typeof(self.name)=='undefined') {self.name = undefined;};
		// Default initialization of property `selector`
		if (typeof(self.selector)=='undefined') {self.selector = null;};
		// Default initialization of property `_selector`
		if (typeof(self._selector)=='undefined') {self._selector = null;};
		// Default initialization of property `namespace`
		if (typeof(self.namespace)=='undefined') {self.namespace = null;};
		// Default initialization of property `ui`
		if (typeof(self.ui)=='undefined') {self.ui = null;};
		// Default initialization of property `on`
		if (typeof(self.on)=='undefined') {self.on = {};};
		// Default initialization of property `phases`
		if (typeof(self.phases)=='undefined') {self.phases = {"all":extend.copy(self.getClass().PROPERTIES), "create":extend.copy(self.getClass().PROPERTIES), "update":extend.copy(self.getClass().PROPERTIES), "remove":extend.copy(self.getClass().PROPERTIES)};};
		// Default initialization of property `children`
		if (typeof(self.children)=='undefined') {self.children = [];};
		// Default initialization of property `data`
		if (typeof(self.data)=='undefined') {self.data = {"raw":undefined, "processed":undefined};};
		// Default initialization of property `processor`
		if (typeof(self.processor)=='undefined') {self.processor = null;};
		// Default initialization of property `frame`
		if (typeof(self.frame)=='undefined') {self.frame = 0;};
		self.id = ("M" + self.getClass().COUNT);
		self.getClass().COUNT = (self.getClass().COUNT + 1);
		options = (options || {});
		self.applyOptions(options);
	},
	methods: {
		/**
		  * Updates the mark's status based on the given options. You might
		  * accordingly.
		  * 
		*/
		applyOptions: function(options) {
			var self = this;
			!((options.element || options.select)) && extend.assert(false, "visualization.Mark.applyOptions:", "Mark: `element` or `select` option required", "(failed `(options.element || options.select)`)");
			self.selector = (options.element || options.select);
			self._selector = self._parseSelector(self.selector);
			self.ui = options.scope;
			self.processor = options.data;
			if (options.id) {
				self.id = options.id;
			}
			if (options.name) {
				self.name = options.name;
				self.getClass().ALL[self.name] = self;
			}
			if (options.handlers) {
				extend.merge(self.phases.all.handlers, options.handlers, true);
			}
			if (extend.isMap(options.children)) {
				self.add(options.children);
			} else {
				// Iterates over `options.children`. This works on array,objects and null/undefined
				var __a=options.children;
				var __b=__a instanceof Array ? __a : Object.getOwnPropertyNames(__a||{});
				var __d=__b.length;
				for (var __c=0;__c<__d;__c++){
					var __z=(__b===__a)?__c:__b[__c];
					var _=__a[__z];
					// This is the body of the iteration with (value=_, key/index=__z) in __a
					self.add(_);
				}
			}
			if (extend.isMap(options.chain)) {
				self.chain(options.chain);
			} else {
				// Iterates over `options.chain`. This works on array,objects and null/undefined
				var __f=options.chain;
				var __g=__f instanceof Array ? __f : Object.getOwnPropertyNames(__f||{});
				var __ij=__g.length;
				for (var __h=0;__h<__ij;__h++){
					var __e=(__g===__f)?__h:__g[__h];
					var _=__f[__e];
					// This is the body of the iteration with (value=_, key/index=__e) in __f
					self.chain(_);
				}
			}
			if (options.siblings) {
				extend.error("Mark.options.siblings: Deprecated in favor of options.chain");
				// Iterates over `options.siblings`. This works on array,objects and null/undefined
				var __kj=options.siblings;
				var __lj=__kj instanceof Array ? __kj : Object.getOwnPropertyNames(__kj||{});
				var __oj=__lj.length;
				for (var __mj=0;__mj<__oj;__mj++){
					var __jj=(__lj===__kj)?__mj:__lj[__mj];
					var _=__kj[__jj];
					// This is the body of the iteration with (value=_, key/index=__jj) in __kj
					self.chain(_);
				}
			}
			self._mergeOptionsWithPhases(options);
			return self;
		},
		
		/**
		  * Resets this mark, removing any existing configuration previously
		  * done.
		  * 
		*/
		reset: function() {
			var self = this;
			if (self.name) {
				self.getClass().ALL[self.name] = undefined;
			}
			self.on = {};
			self.ui = undefined;
			self.phases = extend.map(self.phases, function() {
				return extend.copy(self.getClass().PROPERTIES);
			});
			siblings = [];
			self.children = [];
			self.data.raw = undefined;
			self.data.processed = undefined;
			self.selector = undefined;
			self.name = undefined;
			self.id = undefined;
			self.namespace = undefined;
			self.processor = null;
			return self;
		},
		
		/**
		  * An alias for doing `reset  () ; setOptions (options)`
		  * 
		*/
		setOptions: function(options) {
			var self = this;
			self.reset();
			return self.setOptions();
		},
		
		/**
		  * Iterates over the different phases and extracts the
		  * corresponding elements from the given options, poulating
		  * the `phases` map.
		  * 
		*/
		_mergeOptionsWithPhases: function(options) {
			var self = this;
			// Iterates over `extend.keys(self.phases)`. This works on array,objects and null/undefined
			var __pj=extend.keys(self.phases);
			var __qj=__pj instanceof Array ? __pj : Object.getOwnPropertyNames(__pj||{});
			var __sj=__qj.length;
			for (var __rj=0;__rj<__sj;__rj++){
				var __nj=(__qj===__pj)?__rj:__qj[__rj];
				var phase=__pj[__nj];
				// This is the body of the iteration with (value=phase, key/index=__nj) in __pj
				// Iterates over `self.phases[phase]`. This works on array,objects and null/undefined
				var __tj=self.phases[phase];
				var __uj=__tj instanceof Array ? __tj : Object.getOwnPropertyNames(__tj||{});
				var __wj=__uj.length;
				for (var __vj=0;__vj<__wj;__vj++){
					var key=(__uj===__tj)?__vj:__uj[__vj];
					var _=__tj[key];
					// This is the body of the iteration with (value=_, key/index=key) in __tj
					var o = options;;
					if (phase != "all") {
						o = options[phase];
					};
					if (o && extend.isDefined(o[key])) {
						var v = o[key];
						if (key == "attr") {
							v = self._normalizeAttr(v);
						}
						self.phases[phase][key] = v;
					};
				};
			}
			return self;
		},
		
		/**
		  * Returns a couple `[attr, attrNS]` splitting the map of attributes depending
		  * on wether they define a namespace or not.
		  * 
		*/
		_normalizeAttr: function(attributes) {
			var self = this;
			var res = {};
			// Iterates over `attributes`. This works on array,objects and null/undefined
			var __xj=attributes;
			var __yj=__xj instanceof Array ? __xj : Object.getOwnPropertyNames(__xj||{});
			var __aj=__yj.length;
			for (var __zj=0;__zj<__aj;__zj++){
				var k=(__yj===__xj)?__zj:__yj[__zj];
				var v=__xj[k];
				// This is the body of the iteration with (value=v, key/index=k) in __xj
				var ns_name = k.split(":");;
				if ((extend.len(ns_name) == 1) || (!__module__.NAMESPACES[na_name[0]])) {
					res[k] = [k, v];
				} else {
					res[k] = [__module__.NAMESPACES[ns_name[0]], na_name[1], v];
				};
			}
			return res;
		},
		
		/**
		  * Parses the selector and returns:
		  * 
		  * ```
		  * {
		  * namespace : <namespace>
		  * name      : <name>
		  * classes   : [<class>,...]
		  * creator   : None
		  * }
		  * ```
		  * 
		  * If the selector is not a a string or does not match the `RE_NAME`
		  * regexp this return None.
		  * 
		*/
		_parseSelector: function(selector) {
			var self = this;
			if (extend.isString(selector)) {
				var res = {"namespace":undefined, "name":undefined, "classes":undefined};
				var match = self.getClass().RE_NAME.exec((selector || ""));
				if (match) {
					if (match[1]) {
						res.namespace = extend.slice(match[1],0,-1);
					}
					if (match[2]) {
						res.name = match[2];
					}
					if (match[3]) {
						res.classes = extend.slice(match[3].split("."),1,undefined);
					}
				}
				return res;
			} else {
				return null;
			}
		},
		
		/**
		  * Chains the given mark(s) as siblings. The marks will be rendered with the
		  * same _data_ as this mark, but with the corresponding datum's node
		  * as scope.
		  * 
		  * Returns the current mark.
		  * 
		*/
		chain: function(marks) {
			var self = this;
			marks = extend.sliceArguments(arguments,0)
			var res = self;
			// Iterates over `marks`. This works on array,objects and null/undefined
			var __cj=marks;
			var __dj=__cj instanceof Array ? __cj : Object.getOwnPropertyNames(__cj||{});
			var __fj=__dj.length;
			for (var __ej=0;__ej<__fj;__ej++){
				var __bj=(__dj===__cj)?__ej:__dj[__ej];
				var m=__cj[__bj];
				// This is the body of the iteration with (value=m, key/index=__bj) in __cj
				if (!__module__.Mark.hasInstance(m)) {
					m = new __module__.Mark(m);
				};
				self.children.push([self.getClass().TYPE_CHAIN, m]);
				res = m;
			}
			return self;
		},
		
		/**
		  * Adds the given mark(s) as children. The marks will be rendered with the
		  * same _datum_ as this mark, and corresponding node as scope.
		  * 
		  * Returns the current mark.
		  * 
		*/
		add: function(marks) {
			var self = this;
			marks = extend.sliceArguments(arguments,0)
			var res = self;
			// Iterates over `marks`. This works on array,objects and null/undefined
			var __hj=marks;
			var __ik=__hj instanceof Array ? __hj : Object.getOwnPropertyNames(__hj||{});
			var __kk=__ik.length;
			for (var __jk=0;__jk<__kk;__jk++){
				var __gj=(__ik===__hj)?__jk:__ik[__jk];
				var m=__hj[__gj];
				// This is the body of the iteration with (value=m, key/index=__gj) in __hj
				if (!__module__.Mark.hasInstance(m)) {
					m = new __module__.Mark(m);
				};
				self.children.push([self.getClass().TYPE_CHILD, m]);
				res = m;
			}
			return self;
		},
		
		/**
		  * Iterates on the elements with `callback(datum,index,element,context)`
		  * 
		*/
		iterate: function(callback) {
			var self = this;
			var context = self.getContext(self.ui, self.id);
			// Iterates over `context.all`. This works on array,objects and null/undefined
			var __lk=context.all;
			var __mk=__lk instanceof Array ? __lk : Object.getOwnPropertyNames(__lk||{});
			var __nk=__mk.length;
			for (var __ok=0;__ok<__nk;__ok++){
				var i=(__mk===__lk)?__ok:__mk[__ok];
				var e=__lk[i];
				// This is the body of the iteration with (value=e, key/index=i) in __lk
				var d = context.data[i];;
				callback(d, i, e, context);
			}
			return self;
		},
		
		/**
		  * Returns the elements rendered by this mark
		  * 
		*/
		getElements: function() {
			var self = this;
			return self.getContext(self.ui, self.id).all;
		},
		
		/**
		  * Retrieves the datum matching the given element in the mark's scope
		  * context.
		  * 
		*/
		getDatum: function(element) {
			var self = this;
			var res = self.getDatumAndKey(element);
			if (res) {
				return res.datum;
			} else {
				return null;
			}
		},
		
		/**
		  * Retrieves the `{datum,key}` matching the given element in the mark's scope
		  * context.
		  * 
		*/
		getDatumAndKey: function(element) {
			var self = this;
			var context = self.getContext(self.ui, self.id);
			var datum = undefined;
			!(element) && extend.assert(false, "visualization.Mark.getDatumAndKey:", "Mark.getDatum: no element given", "(failed `element`)");
			// Iterates over `context.all`. This works on array,objects and null/undefined
			var __pk=context.all;
			var __qk=__pk instanceof Array ? __pk : Object.getOwnPropertyNames(__pk||{});
			var __sk=__qk.length;
			for (var __rk=0;__rk<__sk;__rk++){
				var key=(__qk===__pk)?__rk:__qk[__rk];
				var value=__pk[key];
				// This is the body of the iteration with (value=value, key/index=key) in __pk
				if (value == element) {
					datum = {"datum":context.data[key], "key":key};
					break
				};
			}
			return datum;
		},
		
		/**
		  * Renders the given data, with the given scope and index (all optional).
		  * The given data will be assigned to the mark's data
		  * 
		*/
		render: function(data, ui, index, parentContext) {
			var self = this;
			if (data === undefined) {data=self.data.raw}
			if (ui === undefined) {ui=self.ui}
			if (index === undefined) {index=undefined}
			if (parentContext === undefined) {parentContext=undefined}
			!(ui) && extend.assert(false, "visualization.Mark.render:", (("Mark#" + (self.name || self.getSelector())) + " render(): no scope/ui given"), "(failed `ui`)");
			if (ui && ui.jquery) {
				!((ui.length > 0)) && extend.assert(false, "visualization.Mark.render:", (("Mark#" + (self.name || self.getSelector())) + " render(): scope is empty"), "(failed `(ui.length > 0)`)");
			}
			var context = self.getContext(ui, self.id);
			if (!context) {
				return extend.error((("Mark#" + (self.name || self.getSelector())) + " render(): context is undefined, aborting render."));
			}
			context.ui = ui;
			context.data = data;
			context.mark = self;
			context.datum = data;
			context.chainedIndex = index;
			context.parentContext = parentContext;
			self.data.raw = data;
			self.data.processed = self._onProcessData(context);
			context.data = self.data.processed;
			if (self.data.raw != self.data.processed) {
				index = undefined;
			}
			visualization.map(context, self.data.processed, self.getMethod('_onCreateElement') , self.getMethod('_onUpdateElement') , self.getMethod('_onRemoveElement') , index);
		},
		
		getContext: function(ui) {
			var self = this;
			if (ui === undefined) {ui=self.ui}
			return visualization.getContext(ui, self.id);
		},
		
		/**
		  * Called by `render` to process the data. Returns the processed data (
		  * which is the data itself by default)
		  * 
		*/
		_onProcessData: function(context) {
			var self = this;
			if (self.processor) {
				return self._eval(self.processor, null, context);
			} else {
				return context.datum;
			}
		},
		
		/**
		  * Called by `render` when there is no element mapped to the datum.
		  * 
		*/
		_onCreateElement: function(context, datum, index, tui) {
			var self = this;
			if (tui === undefined) {tui=undefined}
			var parent_element = context.ui;
			if (__module__.Visualization.hasInstance(parent_element) || __module__.Mark.hasInstance(parent_element)) {
				parent_element = parent_element.ui;
			}
			if (parent_element && parent_element.jquery) {
				if (parent_element.length == 0) {
					extend.error("Mark._onCreateElement: UI does not match any element");
				} else if (parent_element.length == 1) {
					parent_element = parent_element[0];
				} else {
					extend.error("Mark._onCreateElement: UI does match too many elements");
				}
			}
			!(parent_element) && extend.assert(false, "visualization.Mark._onCreateElement:", "Mark._onCreateElement: ui element is null", "(failed `parent_element`)");
			!(parent_element.nodeName) && extend.assert(false, "visualization.Mark._onCreateElement:", "Mark._onCreateElement: ui element is not a DOM or SVG node", "(failed `parent_element.nodeName`)");
			context.element = self._createElement(context, datum, index, self.getNodeName(), self.getNodeClasses(), self.getNodeNamespace(context.node));
			parent_element.appendChild(context.element);
			self._bindHandlers(context, datum, index);
			return self._onCreateOrUpdateElement(context, datum, index, undefined);
		},
		
		/**
		  * Called by `render` when there is already element mapped to the datum.
		  * 
		*/
		_onUpdateElement: function(context, datum, index, tui) {
			var self = this;
			if (tui === undefined) {tui=undefined}
			return self._onCreateOrUpdateElement(context, datum, index, context.element);
		},
		
		/**
		  * Called by `render` when the element needs to be removed.
		  * 
		*/
		_onRemoveElement: function(context, index, tui) {
			var self = this;
			self._apply(self.phases.remove, undefined, tui, context);
			self._unbindHandlers(context, index);
			if (!self.phases.remove.keep) {
				self._removeElement(tui);
			}
		},
		
		/**
		  * Called by `_onCreateElement` and `_onUpdateElement`.
		  * 
		*/
		_onCreateOrUpdateElement: function(context, datum, index, tui) {
			var self = this;
			if (!extend.isDefined(tui)) {
				tui = context.element;
				self._apply(self.phases.create, self.phases.all, tui, context);
			} else {
				self._apply(self.phases.update, self.phases.all, tui, context);
			}
			var element = context.element;
			// Iterates over `self.children`. This works on array,objects and null/undefined
			var __tk=self.children;
			var __uk=__tk instanceof Array ? __tk : Object.getOwnPropertyNames(__tk||{});
			var __wk=__uk.length;
			for (var __vk=0;__vk<__wk;__vk++){
				var i=(__uk===__tk)?__vk:__uk[__vk];
				var c=__tk[i];
				// This is the body of the iteration with (value=c, key/index=i) in __tk
				var m = c[1];;
				if (c[0] == self.getClass().TYPE_CHAIN) {
					m.render([datum], (m.ui || element), index, context);
				} else {
					m.render(datum, (m.ui || element), undefined, context);
				};
			}
			return tui;
		},
		
		/**
		  * Applies the given property updaters to the given element
		  * with the given context.
		  * 
		  * This will execute the following operations:
		  * 
		  * - set the node content/children
		  * - set the node text content
		  * - apply the `each` callback
		  * - set attributes
		  * - set style
		  * 
		  * If `pa` and `pb` are given, the for each operation, `pb`'s
		  * operation will be applied first, then `pa`'s (so as to allow
		  * overrides).
		  * 
		*/
		_apply: function(pa, pb, element, context) {
			var self = this;
			if (!pa) {
				return false;
			}
			if (!pb) {
				pb = self.getClass().PROPERTIES;
			}
			if (pb.html) {
				self._applyHTML(pb.html, element, context);
			}
			if (pa.html) {
				self._applyHTML(pa.html, element, context);
			}
			if (pb.text) {
				self._applyText(pb.text, element, context);
			}
			if (pa.text) {
				self._applyText(pa.text, element, context);
			}
			if (pb.attr) {
				self._applyAttributes(pb.attr, element, context);
			}
			if (pa.attr) {
				self._applyAttributes(pa.attr, element, context);
			}
			if (pb.style) {
				self._applyStyle(pb.style, element, context);
			}
			if (pa.style) {
				self._applyStyle(pa.style, element, context);
			}
			if (pb.each) {
				self._applyEach(pb.each, element, context);
			}
			if (pa.each) {
				self._applyEach(pa.each, element, context);
			}
		},
		
		_applyHTML: function(value, element, context) {
			var self = this;
			while ((element.childNodes.length > 0)) {
				element.removeChild(element.childNodes[0]);
			}
			var v = self._eval(value, element, context);
			if (extend.isList(v)) {
				// Iterates over `v`. This works on array,objects and null/undefined
				var __yk=v;
				var __zk=__yk instanceof Array ? __yk : Object.getOwnPropertyNames(__yk||{});
				var __bk=__zk.length;
				for (var __ak=0;__ak<__bk;__ak++){
					var __xk=(__zk===__yk)?__ak:__zk[__ak];
					var _=__yk[__xk];
					// This is the body of the iteration with (value=_, key/index=__xk) in __yk
					element.appendChild(_);
				}
			} else {
				element.appendChild(v);
			}
		},
		
		_applyText: function(value, element, context) {
			var self = this;
			var v = self._eval(value, element, context);
			element.textContent = v;
		},
		
		_applyAttributes: function(value, element, context) {
			var self = this;
			// Iterates over `value`. This works on array,objects and null/undefined
			var __ck=value;
			var __dk=__ck instanceof Array ? __ck : Object.getOwnPropertyNames(__ck||{});
			var __fk=__dk.length;
			for (var __ek=0;__ek<__fk;__ek++){
				var k=(__dk===__ck)?__ek:__dk[__ek];
				var v=__ck[k];
				// This is the body of the iteration with (value=v, key/index=k) in __ck
				if (v.length == 2) {
					if (k == "class") {
						self._applyClass(v[1], element, context);
					} else {
						var res = self._eval(v[1], element, context);
						if (extend.isDefined(res)) {
							element.setAttribute(v[0], res);
						}
					}
				} else {
					var res = self._eval(v[2], element, context);
					if (extend.isDefined(res)) {
						element.setAttributeNS(v[0], v[1], res);
					}
				};
			}
		},
		
		_applyClass: function(value, element, context) {
			var self = this;
			var class_value = self._eval(value, element, context);
			var current_class = "";
			// Iterates over `self.getNodeClasses()`. This works on array,objects and null/undefined
			var __hk=self.getNodeClasses();
			var __il=__hk instanceof Array ? __hk : Object.getOwnPropertyNames(__hk||{});
			var __kl=__il.length;
			for (var __jl=0;__jl<__kl;__jl++){
				var __gk=(__il===__hk)?__jl:__il[__jl];
				var c=__hk[__gk];
				// This is the body of the iteration with (value=c, key/index=__gk) in __hk
				if (current_class.indexOf(c) == -1) {
					current_class = (current_class + (" " + c));
				};
			}
			if (class_value) {
				current_class = (current_class + (" " + class_value));
			}
			element.setAttribute("class", current_class);
		},
		
		_applyStyle: function(value, element, context) {
			var self = this;
			// Iterates over `value`. This works on array,objects and null/undefined
			var __ll=value;
			var __ml=__ll instanceof Array ? __ll : Object.getOwnPropertyNames(__ll||{});
			var __nl=__ml.length;
			for (var __ol=0;__ol<__nl;__ol++){
				var k=(__ml===__ll)?__ol:__ml[__ol];
				var v=__ll[k];
				// This is the body of the iteration with (value=v, key/index=k) in __ll
				var evaluated = self._eval(v, element, context);;
				if (extend.isNumber(evaluated)) {
					evaluated = (evaluated + "px");
				} else {
					evaluated = ("" + evaluated);
				};
				element.style[k] = evaluated;
			}
		},
		
		_applyEach: function(value, element, context) {
			var self = this;
			self._eval(value, element, context);
		},
		
		_bindHandlers: function(context, datum, value) {
			var self = this;
			// Iterates over `self.getHandlers()`. This works on array,objects and null/undefined
			var __ql=self.getHandlers();
			var __rl=__ql instanceof Array ? __ql : Object.getOwnPropertyNames(__ql||{});
			var __tl=__rl.length;
			for (var __sl=0;__sl<__tl;__sl++){
				var __pl=(__rl===__ql)?__sl:__rl[__sl];
				var h=__ql[__pl];
				// This is the body of the iteration with (value=h, key/index=__pl) in __ql
				h.bind(context.element);
			}
		},
		
		_unbindHandlers: function(context, value) {
			var self = this;
			// Iterates over `self.getHandlers()`. This works on array,objects and null/undefined
			var __vl=self.getHandlers();
			var __wl=__vl instanceof Array ? __vl : Object.getOwnPropertyNames(__vl||{});
			var __yl=__wl.length;
			for (var __xl=0;__xl<__yl;__xl++){
				var __ul=(__wl===__vl)?__xl:__wl[__xl];
				var h=__vl[__ul];
				// This is the body of the iteration with (value=h, key/index=__ul) in __vl
				h.unbind(context.element);
			}
		},
		
		getHandlers: function() {
			var self = this;
			if (self.phases.all.handlers && (!extend.isList(self.phases.all.handlers))) {
				return [self.phases.all.handlers];
			} else {
				return self.phases.all.handlers;
			}
		},
		
		/**
		  * Evaluates the given value. If it's a litteral, will return the value
		  * itself, otherwise it's a function and it will be evaluated with
		  * the (datum, index, element, context) arguments.
		  * 
		*/
		_eval: function(value, element, context) {
			var self = this;
			if (extend.isFunction(value)) {
				return value(context.datum, context.index, element, context);
			} else {
				return value;
			}
		},
		
		/**
		  * Returns the namespace for the nodes created by this mark. In case a
		  * parentElement is given, its namespace URI will be inherited.
		  * 
		*/
		getNodeNamespace: function(parentElement) {
			var self = this;
			if (parentElement === undefined) {parentElement=undefined}
			if (self._selector && self._selector.namespace) {
				return self._selector.namespace;
			} else if (parentElement) {
				return parentElement.namespaceURI;
			} else {
				return null;
			}
		},
		
		/**
		  * Returns the name of the nodes created by this mark
		  * 
		*/
		getNodeName: function() {
			var self = this;
			return (self._selector && self._selector.name);
		},
		
		/**
		  * Returns the classes boudn to the nodes created by this mark
		  * 
		*/
		getNodeClasses: function() {
			var self = this;
			return (self._selector && self._selector.classes);
		},
		
		getSelector: function(normalized) {
			var self = this;
			if (normalized === undefined) {normalized=false}
			if (!normalized) {
				return self.selector;
			} else if (self._selector) {
				var res = self._selector.name;
				if (self._selector.namespace) {
					res = ((self._selector.namespace + ":") + res);
				}
				if (self._selector.classes) {
					res = ((res + ".") + self._selector.classes.join("."));
				}
				return res;
			} else {
				return null;
			}
		},
		
		/**
		  * Creates an element with the  given `name`, `classes` and `namespace`
		  * 
		*/
		_createElement: function(context, datum, index, name, classes, namespace) {
			var self = this;
			if (name === undefined) {name=self.getNodeName();}
			if (classes === undefined) {classes=self.getNodeClasses();}
			if (namespace === undefined) {namespace=self.getNodeNamespace();}
			if (extend.isFunction(self.selector)) {
				return self.selector(datum, index, context, self);
			} else {
				var nui = null;
				if (namespace && (namespace != "html")) {
					if (__module__.NAMESPACES[namespace]) {
						namespace = __module__.NAMESPACES[namespace];
					}
					nui = document.createElementNS(namespace, name);
				} else {
					nui = document.createElement(name);
				}
				if (classes) {
					if (extend.isList(classes)) {
						classes = classes.join(" ");
					}
					nui.setAttribute("class", classes);
				}
				return nui;
			}
		},
		
		/**
		  * Removes the given element from its parent
		  * 
		*/
		_removeElement: function(element) {
			var self = this;
			element.parentNode.removeChild(element);
			return element;
		}
	}
})
/**
  * An alias to `new Visualization(ui, options)`
  * 
*/
visualization.viz = function(ui, options){
	var self = visualization;
	if (options === undefined) {options=undefined}
	return new __module__.Visualization(ui, options);
}
/**
  * An alias to `new Mark(options)`
  * 
*/
visualization.mark = function(options){
	var self = visualization;
	return new __module__.Mark(options);
}
/**
  * Retrieves the context for the given scope. The scope can be
  * a DOM node, a jQuery selection, a Mark or an arbitrary object.
  * 
*/
visualization.getContext = function(value, key){
	var self = visualization;
	if (key === undefined) {key=0}
	if (__module__.Context.hasInstance(value)) {
		return value;
	} else if (__module__.Visualization.hasInstance(value)) {
		var res = __module__.getContext(value.ui, value.id);
		res.viz = value;
		return res;
	} else if (__module__.Mark.hasInstance(value)) {
		var res = __module__.getContext(value.ui, value.id);
		res.mark = res;
		return res;
	} else if (value && value.jquery) {
		if (value.length == 0) {
			return null;
		} else if (value.length == 1) {
			return __module__.getContext(value[0], key);
		} else {
			return extend.map(value, function(v) {
				return __module__.getContext(v, key);
			});
		}
	} else if (value && value.nodeName) {
		if (!extend.isDefined(value.__viz__)) {
			value.__viz__ = {};
		}
		if (!extend.isDefined(value.__viz__[key])) {
			value.__viz__[key] = new __module__.Context(value);
		}
		return value.__viz__[key];
	} else {
		extend.error(((("getContext: Unsupported value " + value) + ":") + typeof(value)));
	}
}
/**
  * Iterates on the given data, calling onCreate if the data was not there before,
  * onUpdate if the data was already there or onRemove if the data was removed.
  * 
  * `onCreate` takes (`context`, `data element`, `key`),
  * `onUpdate` takes (`context`, `data element`, `key`, `interface element`)
  * `onRemove` takes (`context`, `key`, `interface element`)
  * where `onCreate` returns the `interface element`.
  * 
  * This process is similar to D3's select/enter/update/exit process.
  * 
*/
visualization.map = function(context, data, onCreate, onUpdate, onRemove, indexOverride){
	var self = visualization;
	if (onUpdate === undefined) {onUpdate=undefined}
	if (onRemove === undefined) {onRemove=undefined}
	if (indexOverride === undefined) {indexOverride=undefined}
	context = __module__.getContext((context || new __module__.Context()));
	var rendered = {};
	onUpdate = (onUpdate || onCreate);
	var viz_cache = undefined;
	if (!extend.isDefined(context.all)) {
		context.all = {};
		context.keys = [];
	}
	viz_cache = context.all;
	var result = [];
	var count = 0;
	var keys = [];
	var keyToIndex = {};
	context.data = data;
	if (extend.isList(data)) {
		context.count = extend.len(data);
	} else {
		context.count = undefined;
	}
	// Iterates over `data`. This works on array,objects and null/undefined
	var __zl=data;
	var __al=__zl instanceof Array ? __zl : Object.getOwnPropertyNames(__zl||{});
	var __cl=__al.length;
	for (var __bl=0;__bl<__cl;__bl++){
		var key=(__al===__zl)?__bl:__al[__bl];
		var datum=__zl[key];
		// This is the body of the iteration with (value=datum, key/index=key) in __zl
		var nui = viz_cache[key];;
		var local_key = key;;
		context.key = key;
		context.datum = datum;
		context.element = nui;
		context.index = count;
		if (extend.isDefined(indexOverride)) {
			local_key = indexOverride;
		};
		if (!extend.isDefined(nui)) {
			nui = onCreate(context, datum, local_key, undefined, count);
			!(extend.isDefined(nui)) && extend.assert(false, "visualization.map:", "visualize: create callback returned empty value", "(failed `extend.isDefined(nui)`)");
			viz_cache[key] = nui;
			rendered[key] = 0;
		} else {
			onUpdate(context, datum, local_key, nui, count);
			rendered[key] = 1;
		};
		result.push(nui);
		keys.push(key);
		keyToIndex[key] = count;
		count = (count + 1);
	}
	context.count = count;
	context.keys = keys;
	context.keyToIndex = keyToIndex;
	// Iterates over `viz_cache`. This works on array,objects and null/undefined
	var __dl=viz_cache;
	var __el=__dl instanceof Array ? __dl : Object.getOwnPropertyNames(__dl||{});
	var __gl=__el.length;
	for (var __fl=0;__fl<__gl;__fl++){
		var key=(__el===__dl)?__fl:__el[__fl];
		var nui=__dl[key];
		// This is the body of the iteration with (value=nui, key/index=key) in __dl
		if (!extend.isDefined(rendered[key])) {
			if (onRemove) {
				viz_cache[key] = onRemove(context, key, nui);
			} else if (nui) {
				viz_cache[key] = undefined;
				// Iterates over `nui`. This works on array,objects and null/undefined
				var __im=nui;
				var __jm=__im instanceof Array ? __im : Object.getOwnPropertyNames(__im||{});
				var __lm=__jm.length;
				for (var __km=0;__km<__lm;__km++){
					var __hl=(__jm===__im)?__km:__jm[__km];
					var ui=__im[__hl];
					// This is the body of the iteration with (value=ui, key/index=__hl) in __im
					__module__.$(ui).remove();
				}
			}
			if (!extend.isDefined(viz_cache[key])) {
				delete viz_cache[key];
				
			}
		};
	}
	return context;
}
visualization.init = function(){
	var self = visualization;
}
if (typeof(visualization.init)!="undefined") {visualization.init();}

// START:VANILLA_POSTAMBLE
return visualization;})(visualization);
// END:VANILLA_POSTAMBLE
