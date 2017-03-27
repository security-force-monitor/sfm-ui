// 8< ---[forms.js]---
// START:VANILLA_PREAMBLE
var forms=typeof(extend)!='undefined' ? extend.module('forms') : (typeof(forms)!='undefined' ? forms : {});
(function(forms){
var Widget = widgets.Widget;
var __module__=forms;
// END:VANILLA_PREAMBLE


forms.Slider = extend.Class({
	name  :'forms.Slider',
	parent: widgets.Widget,
	shared: {
		UIS: {"handle":".handle", "cursor":".cursor", "rail":".rail"}
	},
	properties: {
		on:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `on`
		if (typeof(self.on)=='undefined') {self.on = events.create(["change"]);};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Slider.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.Slider.getParent()).bindUI();
			self.handlers.handle = interaction.handle({"drag":{"start":self.getMethod('onHandleDragStart') , "drag":self.getMethod('onHandleDrag') , "stop":self.getMethod('onHandleDragStop') }});
			self.handlers.rail = interaction.handle({"press":self.getMethod('onRailPressed') });
			self.handlers.handle.bind(self.uis.handle);
			self.handlers.rail.bind(self.uis.rail);
			self.setValue((parseFloat(self.ui.attr("data-value")) || 0));
		},
		
		getState: function() {
			var self = this;
			var v = {"value":(parseFloat(self.ui.attr("data-value")) || 0), "min":(parseFloat(self.ui.attr("data-min")) || 0), "max":(parseFloat(self.ui.attr("data-max")) || 100)};
			v.range = (v.max - v.min);
			return v;
		},
		
		onHandleDragStart: function(event) {
			var self = this;
			self.cache.cursorWidth = dimension.width(self.uis.cursor);
			self.cache.railWidth = dimension.width(self.ui);
			self.cache.state = self.getState();
		},
		
		onHandleDrag: function(event) {
			var self = this;
			var delta = event.delta[0];
			var width = (self.cache.cursorWidth + delta);
			width = Math.min(Math.max(0, width), self.cache.railWidth);
			var o = (width / self.cache.railWidth);
			var value = (self.cache.state.min + (self.cache.state.range * o));
			self.uis.cursor.css("width", width);
			self.setValue(value, self.cache.state);
		},
		
		onHandleDragStop: function(event) {
			var self = this;
			self.cache.state = self.getState();
			var o = (dimension.width(self.uis.cursor) / self.cache.railWidth);
			var value = (self.cache.state.min + (self.cache.state.range * o));
			self.setValue(value, self.cache.state);
			return value;
		},
		
		onRailPressed: function(event) {
			var self = this;
			self.cache.state = self.getState();
			var b = dimension.bounds(self.uis.rail);
			var x = (event.clientX - b.x);
			var o = (x / (dimension.width(self.uis.rail) || 1));
			self.uis.cursor.css("width", x);
			var value = (self.cache.state.min + (self.cache.state.range * o));
			self.setValue(value, self.cache.state);
		},
		
		setValue: function(value, state) {
			var self = this;
			if (state === undefined) {state=self.getState();}
			self.ui.attr("data-value", value);
			self.set("value", self.formatValue(value));
			var p = (value / (state.max - state.min));
			var w = (dimension.width(self.uis.rail) * p);
			self.uis.cursor.css("width", w);
			if (self.cache.value != value) {
				self.on.change.trigger(value, self);
				self.cache.value = value;
			}
		},
		
		formatValue: function(value) {
			var self = this;
			return extend.sprintf("%0.2f", value);
		},
		
		getValue: function() {
			var self = this;
			return self.cache.value;
		}
	}
})
/**
  * Implements a basic distribution graph that can be updated
  * live.
  * 
*/
forms.Distribution = extend.Class({
	name  :'forms.Distribution',
	parent: widgets.Widget,
	shared: {
		UIS: {"groupTmpl":".group.template"}
	},
	properties: {
		on:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `on`
		if (typeof(self.on)=='undefined') {self.on = events.create(["change"]);};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Distribution.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.Distribution.getParent()).bindUI();
			self.handlers.handle = interaction.handle({"drag":{"start":self.getMethod('onHandleDragStart') , "drag":self.getMethod('onHandleDrag') , "stop":self.getMethod('onHandleDragStop') }});
			self.updateUI();
			self.render(self.getState());
		},
		
		/**
		  * Updates the uis in `viz variables` corresponding to the given
		  * list of variables
		  * 
		*/
		updateUI: function(variables) {
			var self = this;
			if (variables === undefined) {variables=self.ui.attr("data-variables");}
			if (extend.isString(variables)) {
				variables = variables.split(",");
			}
			self.visualize("variables", variables, function(context, datum, index, element) {
				if (!element) {
					var nui = self.cloneTemplate(self.uis.groupTmpl);
					self.uis.groupTmpl.before(nui);
					self.handlers.handle.bind(nui.find(".handle"));
					element = new widgets.Element(nui);
				}
				element.setData(datum);
				element.set("name", datum);
				element.set("percentage", 0.0);
				element.ui.attr("data-index", ("" + index));
				element.ui.attr("data-name", ("" + datum));
				return element;
			});
			return self.uis.viz.all;
		},
		
		getState: function() {
			var self = this;
			var res = self.getWidths();
			var total = stats.sum(res);
			return extend.map(res, function(_) {
				return (_ / total);
			});
		},
		
		getValues: function() {
			var self = this;
			var res = {};
			var s = self.getState();
			// Iterates over `self.uis.viz.variables.all`. This works on array,objects and null/undefined
			var __i=self.uis.viz.variables.all;
			var __j=__i instanceof Array ? __i : Object.getOwnPropertyNames(__i||{});
			var __l=__j.length;
			for (var __k=0;__k<__l;__k++){
				var i=(__j===__i)?__k:__j[__k];
				var v=__i[i];
				// This is the body of the iteration with (value=v, key/index=i) in __i
				res[v.data] = s[i];
			}
			return res;
		},
		
		getWidths: function() {
			var self = this;
			return extend.map(self.uis.viz.variables.all, function(_) {
				return dimension.width(_.ui);
			});
		},
		
		onHandleDragStart: function(event) {
			var self = this;
			self.cache.widths = self.getWidths();
			var group = interaction.target(event.dragged, "group");
			self.cache.index = parseInt(group.getAttribute("data-index"));
		},
		
		onHandleDrag: function(event) {
			var self = this;
			var state = extend.copy(self.cache.widths);
			var delta = event.delta[0];
			var index = self.cache.index;
			if (delta < 0) {
				var d = (0 - delta);
				if (index > 0) {
					d = stats.min((state[(index - 1)] - 5), d);
				}
				state[index] = (state[index] + d);
				state[(index - 1)] = (state[(index - 1)] - d);
			} else if (delta > 0) {
				var d = delta;
				d = stats.min((state[index] - 5), d);
				state[index] = (state[index] - d);
				if (index < extend.len(self.uis.group)) {
					state[(index + 1)] = (state[(index + 1)] + d);
				} else {
					state[(index - 1)] = (state[(index - 1)] + d);
				}
			}
			self.setState(state);
		},
		
		onHandleDragStop: function(event) {
			var self = this;
			self.cache.index = undefined;
		},
		
		setState: function(state) {
			var self = this;
			self.render(state);
			return self;
		},
		
		render: function(state) {
			var self = this;
			var total = stats.sum(state);
			var res = [];
			// Iterates over `state`. This works on array,objects and null/undefined
			var __m=state;
			var __o=__m instanceof Array ? __m : Object.getOwnPropertyNames(__m||{});
			var __p=__o.length;
			for (var __n=0;__n<__p;__n++){
				var i=(__o===__m)?__n:__o[__n];
				var v=__m[i];
				// This is the body of the iteration with (value=v, key/index=i) in __m
				var p = (v / total);;
				var e = self.uis.viz.variables.all[i];;
				e.ui.css("width", ((100.0 * p) + "%"));
				e.set("percentage", p);
				res.push(p);
			}
			self.on.change.trigger(res, self);
		}
	}
})
forms.init = function(){
	var self = forms;
}
if (typeof(forms.init)!="undefined") {forms.init();}

// START:VANILLA_POSTAMBLE
return forms;})(forms);
// END:VANILLA_POSTAMBLE
