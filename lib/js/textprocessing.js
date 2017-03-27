// 8< ---[textprocessing.js]---
// START:VANILLA_PREAMBLE
var textprocessing=typeof(extend)!='undefined' ? extend.module('textprocessing') : (typeof(textprocessing)!='undefined' ? textprocessing : {});
(function(textprocessing){
var __module__=textprocessing;
// END:VANILLA_PREAMBLE


textprocessing.Range = extend.Class({
	name  :'textprocessing.Range',
	parent: undefined,
	shared: {
		COUNT: 0
	},
	properties: {
		start:undefined,
		length:undefined,
		id:undefined,
		marks:undefined,
		deleted:undefined
	},
	initialize: function( start, length ){
		var self = this;
		// Default initialization of property `marks`
		if (typeof(self.marks)=='undefined') {self.marks = {};};
		// Default initialization of property `deleted`
		if (typeof(self.deleted)=='undefined') {self.deleted = false;};
		self.start = start;
		self.length = length;
		self.id = self.getClass().COUNT;
		self.getClass().COUNT = (self.getClass().COUNT + 1);
	},
	methods: {
		addMark: function(mark) {
			var self = this;
			self.marks[mark.id] = mark;
			return self;
		},
		
		addMarks: function(marks) {
			var self = this;
			// Iterates over `marks`. This works on array,objects and null/undefined
			var __j=marks;
			var __k=__j instanceof Array ? __j : Object.getOwnPropertyNames(__j||{});
			var __m=__k.length;
			for (var __l=0;__l<__m;__l++){
				var __i=(__k===__j)?__l:__k[__l];
				var m=__j[__i];
				// This is the body of the iteration with (value=m, key/index=__i) in __j
				self.addMark(m);
			}
			return self;
		},
		
		removeMark: function(mark) {
			var self = this;
			Delete(self.marks, mark.id);
			return self;
		},
		
		removeMarks: function(marks) {
			var self = this;
			// Iterates over `marks`. This works on array,objects and null/undefined
			var __n=marks;
			var __p=__n instanceof Array ? __n : Object.getOwnPropertyNames(__n||{});
			var __r=__p.length;
			for (var __q=0;__q<__r;__q++){
				var __o=(__p===__n)?__q:__p[__q];
				var m=__n[__o];
				// This is the body of the iteration with (value=m, key/index=__o) in __n
				self.removeMark(m);
			}
			return self;
		},
		
		end: function() {
			var self = this;
			return (self.start + self.length);
		}
	}
})
/**
  * A mark wraps a subset of a text node as a `<span>` element.
  * 
  * Wrapping a text node works as follows (we want to wrap `hn Do` within `John Doe`
  * 
  * ```
  * #John Doe
  * ```
  * 
  * becomes
  * 
  * ```
  * #Jo
  * <span.mark:hn Do>
  * #e
  * ```
  * 
  * The reverse operation is `unwrap`
  * 
*/
textprocessing.Mark = extend.Class({
	name  :'textprocessing.Mark',
	parent: undefined,
	shared: {
		COUNT: 0
	},
	properties: {
		id:undefined,
		start:undefined,
		end:undefined,
		textNode:undefined,
		markNode:undefined,
		isWrapped:undefined,
		_LF_class:undefined
	},
	/**
	  * node is of format {node:node, start:int, end:int}
	  * 
	*/
	initialize: function( node, _LF_class ){
		var self = this;
		if (_LF_class === undefined) {_LF_class=null}
		// Default initialization of property `id`
		if (typeof(self.id)=='undefined') {self.id = null;};
		// Default initialization of property `start`
		if (typeof(self.start)=='undefined') {self.start = null;};
		// Default initialization of property `end`
		if (typeof(self.end)=='undefined') {self.end = null;};
		// Default initialization of property `textNode`
		if (typeof(self.textNode)=='undefined') {self.textNode = null;};
		// Default initialization of property `markNode`
		if (typeof(self.markNode)=='undefined') {self.markNode = null;};
		// Default initialization of property `isWrapped`
		if (typeof(self.isWrapped)=='undefined') {self.isWrapped = false;};
		// Default initialization of property `_LF_class`
		if (typeof(self._LF_class)=='undefined') {self._LF_class = null;};
		self.start = node.start;
		self.end = node.end;
		self._LF_class = _LF_class;
		self.id = self.getClass().COUNT;
		self.getClass().COUNT = (self.getClass().COUNT + 1);
		self.textNode = node.node;
		self.wrap();
	},
	methods: {
		wrap: function(node, start, end) {
			var self = this;
			if (node === undefined) {node=self.textNode}
			if (start === undefined) {start=self.start}
			if (end === undefined) {end=self.end}
			if (self.isWrapped) {
				extend.error("textprocessing:Wrap cannot wrap Mark that is already wrapped");
				return null;
			}
			self.isWrapped = true;
			self.textNode = node;
			self.start = start;
			self.end = end;
			var head = null;
			var text = null;
			var tail = null;
			var headNode = null;
			var tailNode = null;
			if (start && end) {
				head = node.textContent.substring(0, start);
				text = node.textContent.substring(start, end);
				tail = node.textContent.substring(end, node.textContent.length);
			} else if (start) {
				head = node.textContent.substring(0, start);
				text = node.textContent.substring(start, node.textContent.length);
			} else if (end) {
				text = node.textContent.substring(0, end);
				tail = node.textContent.substring(end, node.textContent.length);
			} else {
				text = node.textContent;
			}
			self.markNode = html.span(text);
			self.markNode.classList.add("mark");
			self.markNode.setAttribute("data-mark", self.id);
			if (self._LF_class) {
				self.markNode.classList.add(self._LF_class);
			}
			if (head) {
				headNode = document.createTextNode(head);
				node.parentElement.insertBefore(headNode, node);
			}
			node.parentElement.insertBefore(self.markNode, node);
			if (tail) {
				tailNode = document.createTextNode(tail);
				node.parentElement.insertBefore(tailNode, node);
			}
			node.parentElement.removeChild(node);
			return self;
		},
		
		remove: function() {
			var self = this;
			self.unwrap();
			return self;
		},
		
		unwrap: function() {
			var self = this;
			if (!self.isWrapped) {
				extend.error("textprocessing:Wrap cannot unwrap Mark that is already unwrapped");
				return self;
			}
			self.isWrapped = false;
			if (!self.markNode.parentElement) {
				return self;
			}
			var children = self.markNode.childNodes;
			while ((children.length > 0)) {
				var new_node = document.createTextNode("");
				if (children[0].nodeType == 3) {
					if ((self.markNode.previousSibling != null) && (self.markNode.previousSibling.nodeType == 3)) {
						new_node.textContent = (new_node.textContent + self.markNode.previousSibling.textContent);
						self.markNode.parentElement.removeChild(self.markNode.previousSibling);
					}
					new_node.textContent = (new_node.textContent + children[0].textContent);
					if (children.length == 1) {
						if ((self.markNode.nextSibling != null) && (self.markNode.nextSibling.nodeType == 3)) {
							new_node.textContent = (new_node.textContent + self.markNode.nextSibling.textContent);
							self.markNode.parentElement.removeChild(self.markNode.nextSibling);
						}
					}
					children[0].remove();
					self.markNode.parentElement.insertBefore(new_node, self.markNode);
				} else {
					self.markNode.parentElement.insertBefore(children[0], self.markNode);
				}
			}
			self.markNode.parentElement.removeChild(self.markNode);
			self.markNode = null;
			return self;
		},
		
		update: function() {
			var self = this;
			return self;
		}
	}
})
/**
  * Wraps a node, allows to search its text, extract ranges and manage marks
  * 
*/
textprocessing.Text = extend.Class({
	name  :'textprocessing.Text',
	parent: undefined,
	shared: {
		_diffText: new diff_match_patch()
	},
	properties: {
		root:undefined,
		content:undefined,
		isDirty:undefined,
		ranges:undefined
	},
	initialize: function( root ){
		var self = this;
		// Default initialization of property `isDirty`
		if (typeof(self.isDirty)=='undefined') {self.isDirty = true;};
		// Default initialization of property `ranges`
		if (typeof(self.ranges)=='undefined') {self.ranges = {};};
		if (!root.jquery) {
			root = $(root);
		}
		self.root = root;
	},
	methods: {
		getText: function(whitespace) {
			var self = this;
			if (whitespace === undefined) {whitespace=true}
			self.content = self.getClass().getOperation('GetText')(self.root, whitespace);
			return self.content;
		},
		
		/**
		  * Creates or returns a range of the start and length
		  * the range is cached in text
		  * 
		*/
		createRange: function(start, length) {
			var self = this;
			var range = null;
			// Iterates over `self.ranges`. This works on array,objects and null/undefined
			var __t=self.ranges;
			var __u=__t instanceof Array ? __t : Object.getOwnPropertyNames(__t||{});
			var __w=__u.length;
			for (var __v=0;__v<__w;__v++){
				var __s=(__u===__t)?__v:__u[__v];
				var r=__t[__s];
				// This is the body of the iteration with (value=r, key/index=__s) in __t
				if ((r.start == start) && (r.length == length)) {
					range = r;
				};
			}
			if (range) {
				return range;
			} else {
				range = new __module__.Range(start, length);
				self.ranges[range.id] = range;
				return range;
			}
		},
		
		deleteRange: function(range) {
			var self = this;
			range.deleted = true;
			delete self.ranges[range.id];
			
			return self;
		},
		
		deleteRanges: function(ranges) {
			var self = this;
			if (ranges === undefined) {ranges=self.ranges}
			// Iterates over `ranges`. This works on array,objects and null/undefined
			var __y=ranges;
			var __z=__y instanceof Array ? __y : Object.getOwnPropertyNames(__y||{});
			var __b=__z.length;
			for (var __a=0;__a<__b;__a++){
				var __x=(__z===__y)?__a:__z[__a];
				var range=__y[__x];
				// This is the body of the iteration with (value=range, key/index=__x) in __y
				self.deleteRange(range);
			}
			return self;
		},
		
		/**
		  * Creates marks that cover the given range within the document
		  * and append them to the text
		  * 
		*/
		createMarks: function(range, className) {
			var self = this;
			if (className === undefined) {className=null}
			if (extend.len(self.findMarks(range.id)) > 0) {
				return [];
			}
			var range = self.createRange(range.start, range.length);
			var nodes = self.getClass().getOperation('GetNodesWithinRange')(range, self.root);
			var marks = extend.map(nodes, function(n) {
				var mark = self._createMark(n, className);
				range.addMark(mark);
				return mark;
			});
			self.ranges[range.id] = range;
			return marks;
		},
		
		/**
		  * node format {node:node, start:int/None, end:int/None}
		  * 
		*/
		_createMark: function(node, className) {
			var self = this;
			if (className === undefined) {className=null}
			var mark = new __module__.Mark(node, className);
			return mark;
		},
		
		/**
		  * find all marks with a common rangeId or range
		  * rangeId may be an id:int or a range object
		  * 
		*/
		findMarks: function(range) {
			var self = this;
			if (!range.id) {
				range = self.ranges[range];
			}
			if (!self.ranges) {
				extend.error("Range does not exist");
			}
			return self.ranges.marks;
		},
		
		/**
		  * Remove marks from the text
		  * 
		*/
		removeMarks: function(range) {
			var self = this;
			// Iterates over `range.marks`. This works on array,objects and null/undefined
			var __d=range.marks;
			var __e=__d instanceof Array ? __d : Object.getOwnPropertyNames(__d||{});
			var __g=__e.length;
			for (var __f=0;__f<__g;__f++){
				var __c=(__e===__d)?__f:__e[__f];
				var m=__d[__c];
				// This is the body of the iteration with (value=m, key/index=__c) in __d
				self._removeMark(range, m);
			}
			return self;
		},
		
		/**
		  * Remove a mark from the text
		  * markId can be a mark or a mark id
		  * 
		*/
		_removeMark: function(range, markId) {
			var self = this;
			if (typeof(markId) == "object") {
				markId = markId.id;
			}
			if (!range.marks[markId]) {
				extend.error(((("mark " + markId) + " not in range ") + rangeId));
				return null;
			}
			if (range.marks[markId].isWrapped) {
				range.marks[markId].unwrap();
			}
			delete range.marks[markId];
			
			return self;
		},
		
		length: function() {
			var self = this;
			if (self.root.jquery) {
				self.root = self.root[0];
			}
			return self.root.textContent.length;
		},
		
		/**
		  * finds matches in text and returns an array of ranges
		  * expression can be a string or regular expression
		  * 
		*/
		search: function(expression) {
			var self = this;
			var ranges = [];
			var text = self.getClass().getOperation('GetText')(self.root);
			if (typeof(expression) == "string") {
				var expression = new RegExp(extend.filter(expression.split(" "), extend.strip).join("\\s+"), "gi");
				var match = 1;
				while ((match != null)) {
					match = expression.exec(text);
					if (match != null) {
						ranges.push(self.createRange(match.index, match[0].length));
					}
				}
			}
			return ranges;
		},
		
		/**
		  * finds the differences between string a and string b and returns
		  * a normalized array of changes {start:int, length:int, type:int(-1|1), text:string, offset:int}
		  * last changes has an isLast property set to true
		  * 
		*/
		_diff: function(a, b) {
			var self = this;
			var changes = self.getClass()._diffText.diff_main(a, b);
			var norm_changes = [];
			var index = 0;
			var index_offset = 0;
			// Iterates over `changes`. This works on array,objects and null/undefined
			var __ij=changes;
			var __jj=__ij instanceof Array ? __ij : Object.getOwnPropertyNames(__ij||{});
			var __lj=__jj.length;
			for (var __kj=0;__kj<__lj;__kj++){
				var __h=(__jj===__ij)?__kj:__jj[__kj];
				var c=__ij[__h];
				// This is the body of the iteration with (value=c, key/index=__h) in __ij
				if (c[0] == 0) {
					index = (index + c[1].length);
				} else if (c[0] == 1) {
					index_offset = (index_offset + c[1].length);
					norm_changes.push({"start":index, "end":(index + c[1].length), "length":c[1].length, "type":c[0], "text":c[1], "offset":index_offset});
				} else if (c[0] == -1) {
					index_offset = (index_offset - c[1].length);
					norm_changes.push({"start":index, "end":(index + c[1].length), "length":c[1].length, "type":c[0], "text":c[1], "offset":index_offset});
					index = (index + c[1].length);
				};
			}
			if (norm_changes.length > 0) {
				norm_changes[(norm_changes.length - 1)].isLast = true;
			}
			return norm_changes;
		},
		
		_update: function() {
			var self = this;
			var changes = self._diff((self.content || self.getText()), self.getText());
			self._updateRanges(changes);
			self.isDirty = false;
		},
		
		/**
		  * Updates the range start and end and recalculates marks to correspond with changes made within the document
		  * 
		*/
		_updateRanges: function(changes, ranges) {
			var self = this;
			if (ranges === undefined) {ranges=self.ranges}
			var prev_c = {};
			var offset = {};
			var length = {};
			// Iterates over `ranges`. This works on array,objects and null/undefined
			var __oj=ranges;
			var __nj=__oj instanceof Array ? __oj : Object.getOwnPropertyNames(__oj||{});
			var __qj=__nj.length;
			for (var __pj=0;__pj<__qj;__pj++){
				var __mj=(__nj===__oj)?__pj:__nj[__pj];
				var r=__oj[__mj];
				// This is the body of the iteration with (value=r, key/index=__mj) in __oj
				offset[r.id] = 0;
				length[r.id] = r.length;
			}
			// Iterates over `changes`. This works on array,objects and null/undefined
			var __sj=changes;
			var __tj=__sj instanceof Array ? __sj : Object.getOwnPropertyNames(__sj||{});
			var __vj=__tj.length;
			for (var __uj=0;__uj<__vj;__uj++){
				var __rj=(__tj===__sj)?__uj:__tj[__uj];
				var c=__sj[__rj];
				// This is the body of the iteration with (value=c, key/index=__rj) in __sj
				// Iterates over `ranges`. This works on array,objects and null/undefined
				var __xj=ranges;
				var __yj=__xj instanceof Array ? __xj : Object.getOwnPropertyNames(__xj||{});
				var __aj=__yj.length;
				for (var __zj=0;__zj<__aj;__zj++){
					var __wj=(__yj===__xj)?__zj:__yj[__zj];
					var r=__xj[__wj];
					// This is the body of the iteration with (value=r, key/index=__wj) in __xj
					if (((c.type == -1) && (c.start <= r.start)) && (c.end >= r.end())) {
						r.deleted = true;
						delete ranges[r.id];
						
						self._debug(r.id, "is contained in ", c.text);
					} else if (((c.type == -1) && (c.start >= r.start)) && (c.end <= r.end())) {
						length[r.id] = (length[r.id] - c.length);
						self._debug(r.id, "contains ", c.text);
					} else if ((((c.type == -1) && (r.start > c.start)) && (r.start < c.end)) && (r.end() > c.end)) {
						offset[r.id] = ((prev_c.offset || 0) - (r.start - c.start));
						length[r.id] = (length[r.id] - (c.end - r.start));
						self._debug(r.id, "is affected at the beginning ", c.text);
					} else if ((((c.type == -1) && (r.end() > c.start)) && (r.end() < c.end)) && (r.start < c.start)) {
						offset[r.id] = (prev_c.offset || 0);
						length[r.id] = (length[r.id] - (r.end() - c.start));
						self._debug(r.id, "is affected at the end ", c.text);
					} else if (((c.type == 1) && (c.start > r.start)) && (c.start <= r.end())) {
						length[r.id] = (length[r.id] + c.length);
						self._debug(r.id, "contains ", c.text);
					} else if (prev_c.start && ((c.start > r.end()) && (prev_c.start < r.end()))) {
						offset[r.id] = c.offset;
						self._debug(r.id, "has been passed by ", c.text);
					} else if (c.isLast && (c.start <= r.start)) {
						offset[r.id] = c.offset;
						self._debug(r.id, "has been passed by last change ", c.text);
					};
				};
				prev_c = c;
			}
			// Iterates over `ranges`. This works on array,objects and null/undefined
			var __cj=ranges;
			var __dj=__cj instanceof Array ? __cj : Object.getOwnPropertyNames(__cj||{});
			var __fj=__dj.length;
			for (var __ej=0;__ej<__fj;__ej++){
				var __bj=(__dj===__cj)?__ej:__dj[__ej];
				var r=__cj[__bj];
				// This is the body of the iteration with (value=r, key/index=__bj) in __cj
				r.start = (r.start + (offset[r.id] || 0));
				r.length = (length[r.id] || r.length);
				var _LF_class = null;;
				// Iterates over `r.marks`. This works on array,objects and null/undefined
				var __hj=r.marks;
				var __ik=__hj instanceof Array ? __hj : Object.getOwnPropertyNames(__hj||{});
				var __kk=__ik.length;
				for (var __jk=0;__jk<__kk;__jk++){
					var __gj=(__ik===__hj)?__jk:__ik[__jk];
					var m=__hj[__gj];
					// This is the body of the iteration with (value=m, key/index=__gj) in __hj
					_LF_class = m._LF_class;
					m.unwrap();
				};
				r.marks = {};
				self.createMarks(r, _LF_class);
			}
		},
		
		_debug: function(id, reason, changeText) {
			var self = this;
		}
	},
	operations:{
		/**
		  * Returns a list of the nodes that are covered (even partially) by
		  * the given range, within the given root node.
		  * also returns that starting point in the first node
		  * node format {node:node, start:int/None, end:int/None}
		  * 
		*/
		GetNodesWithinRange: function( range, root, context ){
			var self = this;
			if (context === undefined) {context={"nodes":[], "count":0}}
			if (root.jquery) {
				root = root[0];
			}
			return self._FindNodes(range, root, context);
		},
		_FindAllNodes: function( root, whitespace, nodes ){
			var self = this;
			if (whitespace === undefined) {whitespace=true}
			if (nodes === undefined) {nodes=[]}
			if ((root.childNodes.length == 0) && (whitespace || (extend.strip(root.textContent).length > 0))) {
				nodes.push(root);
			} else {
				// Iterates over `root.childNodes`. This works on array,objects and null/undefined
				var __mk=root.childNodes;
				var __ok=__mk instanceof Array ? __mk : Object.getOwnPropertyNames(__mk||{});
				var __pk=__ok.length;
				for (var __nk=0;__nk<__pk;__nk++){
					var __lk=(__ok===__mk)?__nk:__ok[__nk];
					var _=__mk[__lk];
					// This is the body of the iteration with (value=_, key/index=__lk) in __mk
					self._FindAllNodes(_, whitespace, nodes);
				}
			}
			return nodes;
		},
		/**
		  * Find the offset of characters form the start of the parentNode to the child
		  * 
		*/
		_findRelativeTextOffset: function( childNode, parentNode, _text ){
			var self = this;
			if (_text === undefined) {_text=""}
			if (childNode != parentNode) {
				while (childNode.previousSibling) {
					_text = (childNode.previousSibling.textContent + _text);
					childNode = childNode.previousSibling;
				}
				return self._findRelativeTextOffset(childNode.parentElement, parentNode, _text);
			}
			return _text;
		},
		/**
		  * Returns the text as string, with whitespace nodes removed
		  * 
		*/
		GetText: function( root, whitespace ){
			var self = this;
			if (whitespace === undefined) {whitespace=true}
			if (root.jquery) {
				root = root[0];
			}
			if (whitespace) {
				return root.textContent;
			} else {
				var nodes = self._FindAllNodes(root, whitespace);
				var nodes_text = extend.map(nodes, function(n) {
					return n.textContent;
				});
				return extend.foldl(nodes_text, "", function(p, n) {
					return (p + n);
				});
			}
		},
		/**
		  * Returns a list of nodes
		  * node format {node:node, start:int/None, end:int/None}
		  * 
		*/
		_FindNodes: function( range, root, context, whitespace ){
			var self = this;
			if (whitespace === undefined) {whitespace=true}
			var ctx = context;
			if (ctx.count >= (range.start + range.length)) {
			
			} else {
				if (root.childNodes.length == 0) {
					if (whitespace || (extend.strip(root.textContent).length > 0)) {
						ctx.count = (ctx.count + root.textContent.length);
						if (ctx.count > range.start) {
							var node = {"node":root, "start":null, "end":null};
							if (range.start >= (ctx.count - root.textContent.length)) {
								node.start = (range.start - (ctx.count - root.textContent.length));
							}
							if ((range.start + range.length) <= ctx.count) {
								node.end = ((range.start + range.length) - (ctx.count - root.textContent.length));
							}
							ctx.nodes.push(node);
						}
					}
				} else {
					// Iterates over `root.childNodes`. This works on array,objects and null/undefined
					var __rk=root.childNodes;
					var __sk=__rk instanceof Array ? __rk : Object.getOwnPropertyNames(__rk||{});
					var __uk=__sk.length;
					for (var __tk=0;__tk<__uk;__tk++){
						var __qk=(__sk===__rk)?__tk:__sk[__tk];
						var _=__rk[__qk];
						// This is the body of the iteration with (value=_, key/index=__qk) in __rk
						self._FindNodes(range, _, ctx, whitespace);
					}
				}
			}
			return context.nodes;
		}
	}
})

textprocessing.Tag = extend.Class({
	name  :'textprocessing.Tag',
	parent: undefined,
	shared: {
		COUNT: 0
	},
	properties: {
		id:undefined,
		range:undefined,
		taxon:undefined,
		Timestamp:undefined
	},
	initialize: function( range, taxon ){
		var self = this;
		if (range === undefined) {range=null}
		if (taxon === undefined) {taxon=null}
		// Default initialization of property `id`
		if (typeof(self.id)=='undefined') {self.id = null;};
		// Default initialization of property `range`
		if (typeof(self.range)=='undefined') {self.range = null;};
		// Default initialization of property `taxon`
		if (typeof(self.taxon)=='undefined') {self.taxon = null;};
		self.id = self.getClass().COUNT;
		self.getClass().COUNT = (self.getClass().COUNT + 1);
		self.range = range;
		self.taxon = taxon;
		self.Timestamp = new Date();
	}
})

textprocessing.Document = extend.Class({
	name  :'textprocessing.Document',
	parent: undefined,
	properties: {
		text:undefined,
		tags:undefined
	},
	/**
	  * text can be a text object or a jquery object or a regular domElement
	  * 
	*/
	initialize: function( text ){
		var self = this;
		// Default initialization of property `tags`
		if (typeof(self.tags)=='undefined') {self.tags = {};};
		if (!(text.isInstance && text.isInstance(__module__.Text))) {
			text = new __module__.Text(text);
		}
		self.text = text;
		text.root.on("keyup paste DOMNodeInserted", function(e) {
			if (e.target.classList.contains("mark") || (e.originalEvent.target.nodeType == 3)) {
				return null;
			}
			return self.onContentChanged();
		});
	},
	methods: {
		search: function(expression) {
			var self = this;
			return self.text.search(expression);
		},
		
		createTag: function(range, taxon) {
			var self = this;
			var tag = new __module__.Tag(range, taxon);
			self.tags[tag.id] = tag;
			return tag;
		},
		
		deleteTag: function(tag) {
			var self = this;
			if (!isNaN(parseInt(tag))) {
				tag = self.tags[tag];
			}
			self.removeMarks(tag);
			self.text.deleteRange(tag.range);
			delete self.tags[tag.id];
			
			return self;
		},
		
		deleteTags: function(tags) {
			var self = this;
			if (tags === undefined) {tags=self.tags}
			// Iterates over `tags`. This works on array,objects and null/undefined
			var __wk=tags;
			var __xk=__wk instanceof Array ? __wk : Object.getOwnPropertyNames(__wk||{});
			var __zk=__xk.length;
			for (var __yk=0;__yk<__zk;__yk++){
				var __vk=(__xk===__wk)?__yk:__xk[__yk];
				var tag=__wk[__vk];
				// This is the body of the iteration with (value=tag, key/index=__vk) in __wk
				self.deleteTag(tag);
			}
			return self;
		},
		
		/**
		  * Create the marks that will make the tags visible in the document
		  * tags can be an array or a single tag
		  * 
		*/
		showTags: function(tags, color) {
			var self = this;
			if (!Array.isArray(tags)) {
				tags = [tags];
			}
			// Iterates over `tags`. This works on array,objects and null/undefined
			var __bk=tags;
			var __ck=__bk instanceof Array ? __bk : Object.getOwnPropertyNames(__bk||{});
			var __ek=__ck.length;
			for (var __dk=0;__dk<__ek;__dk++){
				var __ak=(__ck===__bk)?__dk:__ck[__dk];
				var t=__bk[__ak];
				// This is the body of the iteration with (value=t, key/index=__ak) in __bk
				var marks = self.text.createMarks(t.range, t.taxon);;
				// Iterates over `marks`. This works on array,objects and null/undefined
				var __gk=marks;
				var __hk=__gk instanceof Array ? __gk : Object.getOwnPropertyNames(__gk||{});
				var __jl=__hk.length;
				for (var __il=0;__il<__jl;__il++){
					var __fk=(__hk===__gk)?__il:__hk[__il];
					var mark=__gk[__fk];
					// This is the body of the iteration with (value=mark, key/index=__fk) in __gk
					mark.markNode.setAttribute("data-tag", t.id);
					mark.markNode.setAttribute("data-color", color);
				};
			}
			return self;
		},
		
		/**
		  * Remove the tags from the document's content
		  * 
		*/
		removeMarks: function(tags) {
			var self = this;
			if (tags === undefined) {tags=self.tags}
			if (!extend.isIterable(tags)) {
				tags = [tags];
			}
			// Iterates over `tags`. This works on array,objects and null/undefined
			var __ll=tags;
			var __ml=__ll instanceof Array ? __ll : Object.getOwnPropertyNames(__ll||{});
			var __nl=__ml.length;
			for (var __ol=0;__ol<__nl;__ol++){
				var __kl=(__ml===__ll)?__ol:__ml[__ol];
				var t=__ll[__kl];
				// This is the body of the iteration with (value=t, key/index=__kl) in __ll
				self.text.removeMarks(t.range);
			}
			return self;
		},
		
		/**
		  * This method should be called when the content of the Document has been changed
		  * 
		*/
		newContent: function(text) {
			var self = this;
			if (text === undefined) {text=self.terxt}
			self.deleteTags();
			return self;
		},
		
		onContentChanged: function() {
			var self = this;
			self.text.isDirty = true;
		}
	}
})
textprocessing.init = function(){
	var self = textprocessing;
}
if (typeof(textprocessing.init)!="undefined") {textprocessing.init();}

// START:VANILLA_POSTAMBLE
return textprocessing;})(textprocessing);
// END:VANILLA_POSTAMBLE
