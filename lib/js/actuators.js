// 8< ---[actuators.js]---
// START:VANILLA_PREAMBLE
var actuators=typeof(extend)!='undefined' ? extend.module('actuators') : (typeof(actuators)!='undefined' ? actuators : {});
(function(actuators){
var $ = widgets.$;
var Widget = widgets.Widget;
var Control = widgets.Control;
var __module__=actuators;
// END:VANILLA_PREAMBLE

actuators.__VERSION__='0.3.2';
actuators.LICENSE = "http://ffctn.com/doc/licenses/bsd";
/**
  * The base class for a numveric actuator.
  * 
*/
actuators.Numeric = extend.Class({
	name  :'actuators.Numeric',
	parent: widgets.Widget,
	shared: {
		STATES: {"edit":[false, true]},
		UIS: {"value":".content .value", "handle":".drag-handle", "bar":".bar", "barFill":".bar .fill"},
		SEPARATOR: ".",
		NUMBERS: "1234567890",
		SIGNS: "-+",
		OPTIONS: {"min":undefined, "max":undefined, "step":1, "steps":undefined, "precision":2, "handlefactor":0.01, "wheelfactor":0.5, "value":0, "wrap":false, "resizeInput":true}
	},
	properties: {
		callbacks:undefined,
		handlers:undefined,
		on:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `callbacks`
		if (typeof(self.callbacks)=='undefined') {self.callbacks = [];};
		// Default value for property `handlers`
		if (typeof(self.handlers)=='undefined') {self.handlers = {"ui":{"mouse":{"wheel":self.getMethod('onWheel') }}, "value":{"keyboard":{"down":self.getMethod('onKeyDown') }, "mouse":{"doubleClick":self.getMethod('onDoubleClick') }}, "input":{"keyboard":{"down":self.getMethod('onInputKeyDown') , "up":self.getMethod('onInputKeyUp') }}, "handle":{"drag":{"start":self.getMethod('onHandleDragStart') , "drag":self.getMethod('onHandleDrag') , "end":self.getMethod('onHandleDragStop') }}, "bar":{"mouse":{"click":self.getMethod('onBarClick') }, "drag":{"start":self.getMethod('onBarDragStart') , "drag":self.getMethod('onBarDrag') , "end":self.getMethod('onBarDragStop') }}};};
		// Default value for property `on`
		if (typeof(self.on)=='undefined') {self.on = events.create(["edit", "change", "interact"]);};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Numeric.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.Numeric.getParent()).bindUI();
			if (self.options.precision) {
				self.cache.format = (("%0." + self.options.precision) + "f");
			} else {
				self.cache.format = "%d";
			}
			self.uis.overlay = widgets.$(html.div({"style":"display:none;position:fixed;top:0px;bottom:0px;left:0px;right:0px;z-index:100;user-select:none;"}));
			self.ui.append(self.uis.overlay);
			self.handlers.ui.bind(self.ui);
			self.handlers.value.bind(self.uis.value);
			self.handlers.input.bind(self.inputs.value);
			self.handlers.handle.bind(self.uis.handle);
			self.handlers.bar.bind(self.uis.bar);
			self.inputs.value.val(self.options.value);
			if (extend.len(self.uis.bar) != 0) {
				!((extend.isDefined(self.options.min) && extend.isDefined(self.options.max))) && extend.assert(false, "actuators.Numeric.bindUI:", "Actuator: bar requires min and max set", "(failed `(extend.isDefined(self.options.min) && extend.isDefined(self.options.max))`)");
				if (!extend.isDefined(self.options.min)) {
					self.options.min = 0;
				}
				if (!extend.isDefined(self.options.max)) {
					self.options.max = 100;
				}
			}
			self.setValue(self.options.value);
		},
		
		bind: function(callback) {
			var self = this;
			self.callbacks.push(callback);
			return self;
		},
		
		unbind: function(callback) {
			var self = this;
			self.callbacks = extend.filter(callback, function(_) {
				return (_ != callback);
			});
			return self;
		},
		
		setState: function(name, value) {
			var self = this;
			var res = self.getSuper(__module__.Numeric.getParent()).setState(name, value);
			if ((name == "edit") && ((value == "true") || (value === true))) {
				self.on.edit.trigger(self);
				if (self.options.resizeInput) {
					self.inputs.value.css("width", dimension.width(self.ui));
				}
			}
			return res;
		},
		
		getValue: function() {
			var self = this;
			return self.cache.value;
		},
		
		setValue: function(value) {
			var self = this;
			value = self._normalize(value);
			self.set("value", self._format(value));
			if (value != self.cache.value) {
				if (self.uis.barFill && (self.uis.barFill.length > 0)) {
					self.uis.barFill.css("width", (((100 * (value - self.options.min)) / (self.options.max - self.options.min)) + "%"));
				}
				// Iterates over `self.callbacks`. This works on array,objects and null/undefined
				var __j=self.callbacks;
				var __k=__j instanceof Array ? __j : Object.getOwnPropertyNames(__j||{});
				var __m=__k.length;
				for (var __l=0;__l<__m;__l++){
					var __i=(__k===__j)?__l:__k[__l];
					var _=__j[__i];
					// This is the body of the iteration with (value=_, key/index=__i) in __j
					_(value, self);
				}
				self.on.change.trigger(value, self);
			}
			self.cache.value = value;
			return self;
		},
		
		/**
		  * Applies the input value to the output value.
		  * 
		*/
		_applyInputValue: function() {
			var self = this;
			var v = parseFloat(self.get("value"));
			if (extend.isDefined(self.options.max)) {
				v = Math.min(v, self.options.max);
			}
			if (extend.isDefined(self.options.min)) {
				v = Math.max(v, self.options.min);
			}
			self.setValue(v);
		},
		
		/**
		  * Returns the given value increased by the step. This does not
		  * mutate any state.
		  * 
		*/
		_increase: function(value) {
			var self = this;
			if (value === undefined) {value=self.get("value");}
			var step = self.options.step;
			if (extend.isString(value)) {
				value = parseFloat(value);
			}
			return self._normalize((value + step));
		},
		
		/**
		  * Returns the given value decreased by the step. This does not mutate
		  * any state.
		  * 
		*/
		_decrease: function(value) {
			var self = this;
			if (value === undefined) {value=self.get("value");}
			var step = self.options.step;
			if (extend.isString(value)) {
				value = parseFloat(value);
			}
			return self._normalize((value - step));
		},
		
		/**
		  * Formats the value
		  * 
		*/
		_format: function(value) {
			var self = this;
			return extend.sprintf(self.cache.format, parseFloat(value));
		},
		
		/**
		  * Normalizes the value, making sure it meets the requirements. This applies
		  * the min/max and precision constratins. This returns the value as a number.
		  * 
		*/
		_normalize: function(value) {
			var self = this;
			var v = extend.sprintf(self.cache.format, parseFloat(value));
			if (isNaN(v)) {
				v = extend.sprintf(self.cache.format, parseFloat(self.options._LF_default));
			}
			if (self.options.precision == 0) {
				v = parseInt(v);
			} else {
				v = parseFloat(v);
			}
			if (self.options.wrap) {
				var min = (self.options.min || 0);
				var max = ((self.options.max || 0) + 1);
				v = (min + Math.abs(((v - min) % (max - min))));
			} else {
				if (extend.isDefined(self.options.min)) {
					v = Math.max(self.options.min, v);
				}
				if (extend.isDefined(self.options.max)) {
					v = Math.min(self.options.max, v);
				}
			}
			return parseFloat(v);
		},
		
		onWheel: function(event) {
			var self = this;
			if (event.deltaY < 0) {
				self.setValue((self.cache.value + (self.options.step * self.options.wheelfactor)));
			} else {
				self.setValue((self.cache.value - (self.options.step * self.options.wheelfactor)));
			}
			self.on.interact.trigger(event);
			return interaction.cancel(event);
		},
		
		onDoubleClick: function(event) {
			var self = this;
			if (self.getState("edit") == "true") {
				self._applyInputValue();
				self.toggleState("edit");
			} else {
				self.toggleState("edit");
				animation.after(function() {
					return self.inputs.value.val(self.outputs.value.text()).select().focus();
				});
			}
			self.on.interact.trigger(event);
		},
		
		onKeyDown: function(event) {
			var self = this;
			self.on.interact.trigger(event);
		},
		
		onBarClick: function(event, gesture) {
			var self = this;
			var b = dimension.boundsA(self.uis.bar);
			var x = (event.clientX - b[0]);
			var p = (x / b[2]);
			var v = (self.options.min + ((self.options.max - self.options.min) * p));
			self.setValue(v);
			self.on.interact.trigger(event);
		},
		
		onBarDragStart: function(event, gesture) {
			var self = this;
			self.uis.overlay.css({"display":"block", "cursor":"ew-resize"});
		},
		
		onBarDrag: function(event, gesture) {
			var self = this;
			self.onBarClick(event.original);
			self.on.interact.trigger(event);
		},
		
		onBarDragStop: function() {
			var self = this;
			self.uis.overlay.css("display", "none");
			self.on.interact.trigger(event);
		},
		
		onHandleDragStart: function(event, gesture) {
			var self = this;
			self.setState("edit", "false");
			var handle = interaction.target(event, "drag-handle");
			if (handle && handle.getAttribute) {
				self.cache.handleConstraint = handle.getAttribute("data-constraint");
				self.cache.handleOrigin = [parseFloat((self.uis.handle.css("left") || 0)), parseFloat((self.uis.handle.css("top") || 0))];
			}
			self.cache.handleValue = self.getValue();
			var cursor = "all-scroll";
			if (self.cache.handleConstraint == "y") {
				cursor = "ns-resize";
			} else if (self.cache.handleConstraint == "x") {
				cursor = "ew-resize";
			}
			self.uis.overlay.css({"display":"block", "cursor":cursor});
		},
		
		onHandleDrag: function(event, gesture) {
			var self = this;
			var delta = 0;
			if (self.cache.handleConstraint == "y") {
				delta = (0 - ((event.delta[1] * self.options.step) * self.options.handlefactor));
				self.uis.handle.css("top", (self.cache.handleOrigin[1] + event.delta[1]));
			} else if (self.cache.handleConstraint == "x") {
				delta = ((event.delta[0] * self.options.step) * self.options.handlefactor);
				self.uis.handle.css("left", (self.cache.handleOrigin[0] + event.delta[0]));
			} else {
				delta = ((event.delta[0] * self.options.step) * self.options.handlefactor);
				delta = (delta - ((event.delta[1] * self.options.step) * self.options.handlefactor));
			}
			self.setValue((self.cache.handleValue + delta));
			self.on.interact.trigger(event);
		},
		
		onHandleDragStop: function(event, gesture) {
			var self = this;
			self.uis.handle.css("top", 0);
			self.uis.handle.css("left", 0);
			self.uis.overlay.css({"display":"none", "cursor":null});
			self.on.interact.trigger(event);
		},
		
		onInputKeyUp: function(event) {
			var self = this;
			var v = self.inputs.value.val();
			var p = v.split(".")[1];
			if (p && (extend.len(p) > self.options.precision)) {
				var n = self._normalize(self.inputs.value.val());
				if (v != n) {
					self.inputs.value.val(n);
				}
			}
			self.on.interact.trigger(event);
		},
		
		onInputKeyDown: function(event) {
			var self = this;
			var result = undefined;
			if (self.getClass().NUMBERS.indexOf(event.key) >= 0) {
				res = true;
			} else if (self.getClass().SEPARATOR.indexOf(event.key) >= 0) {
				if (self.get("value").indexOf(event.key) == -1) {
					res = true;
				} else {
					return interaction.cancel(event);
				}
			} else if (self.getClass().SIGNS.indexOf(event.key) >= 0) {
				var v = parseFloat(self.get("value"));
				if (event.key == "-") {
					v = (0 - v);
				} else {
					v = Math.abs(v);
				}
				self.inputs.value.val(self._format(v));
				res = interaction.cancel(event);
			} else if (event.keyCode == interaction.KEYS.LEFT) {
				res = true;
			} else if (event.keyCode == interaction.KEYS.RIGHT) {
				res = true;
			} else if (event.keyCode == interaction.KEYS.UP) {
				self.inputs.value.val(self._format(self._increase(self.get("value"))));
			} else if (event.keyCode == interaction.KEYS.DOWN) {
				self.inputs.value.val(self._format(self._decrease(self.get("value"))));
			} else if (event.keyCode == interaction.KEYS.ESC) {
				self.setState("edit", false);
				res = true;
			} else if (event.keyCode == interaction.KEYS.ENTER) {
				self._applyInputValue();
				self.setState("edit", false);
				res = true;
			} else if (event.keyCode == interaction.KEYS.BACKSPACE) {
				res = true;
			} else {
				interaction.cancel(event);
				res = false;
			}
			self.on.interact.trigger(event);
			return res;
		}
	}
})

actuators.Date = extend.Class({
	name  :'actuators.Date',
	parent: widgets.Widget,
	shared: {
		UIS: {"year":".is-year.actuator", "month":".is-month.actuator", "day":".is-day.actuator"}
	},
	properties: {
		year:undefined,
		month:undefined,
		day:undefined,
		actuators:undefined,
		on:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `actuators`
		if (typeof(self.actuators)=='undefined') {self.actuators = [];};
		// Default value for property `on`
		if (typeof(self.on)=='undefined') {self.on = events.create(["change", "edit"]);};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Date.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.Date.getParent()).bindUI();
			self.year = widgets.ensure(self.uis.year, __module__.Numeric);
			self.month = widgets.ensure(self.uis.month, __module__.Numeric);
			self.day = widgets.ensure(self.uis.day, __module__.Numeric);
			if (self.year) {
				self.actuators.push(self.year);
			}
			if (self.month) {
				self.actuators.push(self.month);
			}
			if (self.day) {
				self.actuators.push(self.day);
			}
			// Iterates over `self.actuators`. This works on array,objects and null/undefined
			var __n=self.actuators;
			var __p=__n instanceof Array ? __n : Object.getOwnPropertyNames(__n||{});
			var __r=__p.length;
			for (var __q=0;__q<__r;__q++){
				var __o=(__p===__n)?__q:__p[__q];
				var _=__n[__o];
				// This is the body of the iteration with (value=_, key/index=__o) in __n
				_.on.edit.bind(self.getMethod('onEdit') );
				_.on.change.bind(self.getMethod('onChange') );
			}
			!(extend.modules.dates) && extend.assert(false, "actuators.Date.bindUI:", "actuator.Date: dates module is required", "(failed `extend.modules.dates`)");
			self.setValue(dates.Date.Now());
		},
		
		onEdit: function(actuator) {
			var self = this;
			// Iterates over `self.actuators`. This works on array,objects and null/undefined
			var __t=self.actuators;
			var __u=__t instanceof Array ? __t : Object.getOwnPropertyNames(__t||{});
			var __w=__u.length;
			for (var __v=0;__v<__w;__v++){
				var __s=(__u===__t)?__v:__u[__v];
				var _=__t[__s];
				// This is the body of the iteration with (value=_, key/index=__s) in __t
				if (_ != actuator) {
					_.setState("edit", "false");
				};
			}
			self.on.edit.trigger(actuator, self);
		},
		
		onChange: function() {
			var self = this;
			var value = self.getValue();
			self.ui.attr("data-value", self.getSerializedValue(value));
			self.on.change.trigger(value, self);
		},
		
		setValue: function(value) {
			var self = this;
			if (extend.isString(value)) {
				value = stats.map(value.split("-"), function(_) {
				return parseInt(_);
			});
			}
			if (self.year) {
				self.year.setValue(value[0]);
			}
			if (self.month) {
				self.month.setValue(value[1]);
			}
			if (self.day) {
				self.day.setValue(value[2]);
			}
		},
		
		getValue: function() {
			var self = this;
			var value = [undefined, undefined, undefined];
			if (self.year) {
				value[0] = self.year.getValue();
			}
			if (self.month) {
				value[1] = self.month.getValue();
			}
			if (self.day) {
				value[2] = self.day.getValue();
			}
			return value;
		},
		
		/**
		  * Returns the serialized value
		  * 
		*/
		getSerializedValue: function(value) {
			var self = this;
			if (value === undefined) {value=self.getValue();}
			if (value) {
				return widgets.FORMATTERS.isodate(value);
			} else {
				return value;
			}
		},
		
		/**
		  * Ensures the consistency of the different
		  * 
		*/
		ensureConsistency: function() {
			var self = this;
		}
	}
})

actuators.Range = extend.Class({
	name  :'actuators.Range',
	parent: widgets.Widget,
	shared: {
		STATES: {"any":[false, true]},
		UIS: {"start":".is-start.actuator", "end":".is-end.actuator", "any":".is-any"},
		OPTIONS: {"min":undefined, "max":undefined, "any":"any"}
	},
	properties: {
		_start:undefined,
		_end:undefined,
		actuators:undefined,
		on:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `actuators`
		if (typeof(self.actuators)=='undefined') {self.actuators = [];};
		// Default value for property `on`
		if (typeof(self.on)=='undefined') {self.on = events.create(["change"]);};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Range.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.Range.getParent()).bindUI();
			// Iterates over `self.actuators`. This works on array,objects and null/undefined
			var __y=self.actuators;
			var __z=__y instanceof Array ? __y : Object.getOwnPropertyNames(__y||{});
			var __b=__z.length;
			for (var __a=0;__a<__b;__a++){
				var __x=(__z===__y)?__a:__z[__a];
				var _=__y[__x];
				// This is the body of the iteration with (value=_, key/index=__x) in __y
				if (extend.isDefined(self.options.min)) {
					_.options.min = self.options.min;
				};
				if (extend.isDefined(self.options.max)) {
					_.options.max = self.options.max;
				};
				_.on.edit.bind(self.getMethod('onEdit') );
				_.on.change.bind(self.getMethod('onChange') );
			}
			self.setState("any", (self.ui.attr("data-value") == self.options.any));
			self.cache.isInitialized = true;
		},
		
		bindUIS: function(uis) {
			var self = this;
			if (uis === undefined) {uis=self.getClass().UIS}
			self.getSuper(__module__.Range.getParent()).bindUIS(uis);
			self._start = widgets.ensure(self.uis.start);
			self._end = widgets.ensure(self.uis.end);
			if (self._start) {
				self.actuators.push(self._start);
			}
			if (self._end) {
				self.actuators.push(self._end);
			}
		},
		
		toggleAny: function() {
			var self = this;
			self.toggleState("any");
		},
		
		selectValue: function() {
			var self = this;
			self.setState("any", false);
		},
		
		/**
		  * Overrides the `setState` to detect a change in the `any` state and
		  * update the value accordingly.
		  * 
		*/
		setState: function(name, value) {
			var self = this;
			var has_changed = false;
			var update_value = false;
			var any_state = false;
			if ((name == "any") || (extend.isDefined(name.any) && self.cache.isInitialized)) {
				var v = value;
				if (!extend.isString(name)) {
					v = name.any;
				}
				if (v === true) {
					v = "true";
				}
				if (v === false) {
					v = "false";
				}
				update_value = true;
				any_state = (v == "true");
				has_changed = (v != self.getState("any"));
			}
			var res = self.getSuper(__module__.Range.getParent()).setState(name, value);
			if (self.cache.isInitialized) {
				if (update_value) {
					if (any_state) {
						self.ui.attr("data-value", self.options.any);
					} else {
						self.ui.attr("data-value", self.getSerializedValue());
					}
				}
				if (has_changed) {
					self.on.change.trigger(self.getValue(), self);
				}
			}
			return res;
		},
		
		/**
		  * When an range actuator is edited, all the other actuators edit ends.
		  * 
		*/
		onEdit: function(actuator) {
			var self = this;
			if (!self.cache.isInitialized) {
				return false;
			}
			// Iterates over `self.actuators`. This works on array,objects and null/undefined
			var __d=self.actuators;
			var __e=__d instanceof Array ? __d : Object.getOwnPropertyNames(__d||{});
			var __g=__e.length;
			for (var __f=0;__f<__g;__f++){
				var __c=(__e===__d)?__f:__e[__f];
				var _=__d[__c];
				// This is the body of the iteration with (value=_, key/index=__c) in __d
				if (_ != actuator) {
					_.setState("edit", "false");
				};
			}
		},
		
		/**
		  * When an range actuator changes, the `any` state is set to `False`.
		  * 
		*/
		onChange: function() {
			var self = this;
			if (!self.cache.isInitialized) {
				return false;
			}
			if (self.cache.onChange) {
				return null;
			}
			self.cache.onChange = true;
			if (!self.hasState("any")) {
				var v = self.ensureConsistency();
				if (v) {
					self.ui.attr("data-value", self.getSerializedValue(v));
				}
				self.on.change.trigger(v, self);
				self.cache.onChange = false;
				return v;
			} else {
				var v = self.ensureConsistency(self.getValue(true));
				self.cache.onChange = false;
				return self.options.any;
			}
		},
		
		/**
		  * Sets the range value
		  * 
		*/
		setValue: function(value) {
			var self = this;
			if (self.cache.isInitialized) {
				if ((!value) || (value == self.options.any)) {
					self.setState("any", "true");
				} else if (extend.isList(value)) {
					self._start.setValue(value[0]);
					self._end.setValue(value[1]);
				} else {
					extend.error((self.getClass().getName() + ".setValue: value should be a list of dates tuples, got:"), value);
				}
			}
			return value;
		},
		
		/**
		  * Ensures the consistency of the different
		  * 
		*/
		ensureConsistency: function(value) {
			var self = this;
			if (value === undefined) {value=self.getValue();}
			if (value) {
				if (extend.cmp(value[0], value[1]) > 0) {
					value = self.setValue([value[1], value[0]]);
				}
			}
			return value;
		},
		
		getValue: function(force) {
			var self = this;
			if (force === undefined) {force=false}
			if (self.hasState("any") && (!force)) {
				return null;
			} else if (self.cache.isInitialized || force) {
				return [self._start.getValue(), self._end.getValue()];
			} else {
				return null;
			}
		},
		
		/**
		  * Returns the serialized value
		  * 
		*/
		getSerializedValue: function(value) {
			var self = this;
			if (value === undefined) {value=self.getValue();}
			if (self.hasState("any")) {
				return self.options.any;
			} else if (value) {
				return ((value[0] + ",") + value[1]);
			} else {
				return value;
			}
		}
	}
})

actuators.DateRange = extend.Class({
	name  :'actuators.DateRange',
	parent: __module__.Range,
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.DateRange.getParent());__super__.initialize.apply(__super__, arguments);}
	}
})
actuators.init = function(){
	var self = actuators;
}
if (typeof(actuators.init)!="undefined") {actuators.init();}

// START:VANILLA_POSTAMBLE
return actuators;})(actuators);
// END:VANILLA_POSTAMBLE
