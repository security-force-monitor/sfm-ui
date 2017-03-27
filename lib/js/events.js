// 8< ---[events.js]---
// START:VANILLA_PREAMBLE
var events=typeof(extend)!='undefined' ? extend.module('events') : (typeof(events)!='undefined' ? events : {});
(function(events){
var __module__=events;
// END:VANILLA_PREAMBLE

events.__VERSION__='1.6.1';
events.LICENSE = "http://ffctn.com/doc/licenses/bsd";
events.ExceptionHandler = function(e) {
	extend.exception(e);
	throw e;
};

events.Event = extend.Class({
	name  :'events.Event',
	parent: undefined,
	properties: {
		name:undefined,
		data:undefined,
		source:undefined
	},
	initialize: function( name, data, source ){
		var self = this;
		if (source === undefined) {source=undefined}
		// Default initialization of property `name`
		if (typeof(self.name)=='undefined') {self.name = undefined;};
		// Default initialization of property `data`
		if (typeof(self.data)=='undefined') {self.data = undefined;};
		// Default initialization of property `source`
		if (typeof(self.source)=='undefined') {self.source = undefined;};
		self.name = name;
		self.data = data;
		self.source = source;
	},
	methods: {
		clone: function(data) {
			var self = this;
			return new __module__.Event(self.name, data, self.source);
		}
	}
})

events.Delayed = extend.Class({
	name  :'events.Delayed',
	parent: undefined,
	shared: {
		SCHEDULED: "scheduled",
		FINISHED: "finished"
	},
	properties: {
		status:undefined,
		timeout:undefined,
		delay:undefined,
		started:undefined,
		callback:undefined,
		_isRunning:undefined
	},
	initialize: function( callback, delay, trigger ){
		var self = this;
		if (callback === undefined) {callback=null}
		if (delay === undefined) {delay=undefined}
		if (trigger === undefined) {trigger=false}
		// Default initialization of property `status`
		if (typeof(self.status)=='undefined') {self.status = undefined;};
		// Default initialization of property `timeout`
		if (typeof(self.timeout)=='undefined') {self.timeout = undefined;};
		// Default initialization of property `delay`
		if (typeof(self.delay)=='undefined') {self.delay = 0;};
		// Default initialization of property `started`
		if (typeof(self.started)=='undefined') {self.started = undefined;};
		// Default initialization of property `callback`
		if (typeof(self.callback)=='undefined') {self.callback = undefined;};
		// Default initialization of property `_isRunning`
		if (typeof(self._isRunning)=='undefined') {self._isRunning = false;};
		if (callback) {
			self.set(callback, delay, trigger);
		}
		if (extend.isDefined(delay)) {
			delay = delay;
		}
	},
	methods: {
		cancel: function() {
			var self = this;
			if (extend.isDefined(self.timeout)) {
				window.clearTimeout(self.timeout);
				self.timeout = undefined;
				self.started = undefined;
			}
			return self;
		},
		
		/**
		  * Triggers the delayed, which will run in delay seconds. If the delayed
		  * has already been triggered, it will wait `delay` more seconds before
		  * running the callback.
		  * 
		*/
		trigger: function(delay) {
			var self = this;
			if (delay === undefined) {delay=0}
			self.cancel();
			self.started = new Date().getTime();
			self.delay = delay;
			if (delay == 0) {
				self._run();
			} else {
				self.timeout = window.setTimeout(self.getMethod("_run"), delay);
			}
		},
		
		/**
		  * Tells if the given delayed is triggered or not
		  * 
		*/
		isTriggered: function() {
			var self = this;
			return extend.isDefined(self.timeout);
		},
		
		/**
		  * Sets the callback to be executed after `delay` seconds.
		  * If there's already a callback trigger, it will be canceled
		  * and this new callback and delay will repalce the current one.
		  * 
		*/
		set: function(callback, delay, trigger) {
			var self = this;
			if (callback === undefined) {callback=undefined}
			if (delay === undefined) {delay=undefined}
			if (trigger === undefined) {trigger=true}
			self.cancel();
			if (extend.isDefined(callback)) {
				self.callback = callback;
			}
			if (extend.isDefined(delay)) {
				self.delay = delay;
			}
			if (trigger) {
				self.trigger();
			}
		},
		
		/**
		  * Returns the number of elasped milliseconds since the start of the
		  * the delayed.
		  * 
		*/
		elapsed: function() {
			var self = this;
			if (extend.isDefined(self.started)) {
				return (new Date().getTime() - self.started);
			} else {
				return 0;
			}
		},
		
		remaining: function() {
			var self = this;
			return (self.delay - self.elapsed());
		},
		
		/**
		  * Pushes the callback of `delay` milliseconds.
		  * 
		*/
		push: function(delay) {
			var self = this;
			if (delay === undefined) {delay=self.delay}
			self.trigger(delay);
		},
		
		/**
		  * Runs the delayed. This should not ba called directly, but should only be
		  * called internally.
		  * 
		*/
		_run: function() {
			var self = this;
			if (self._isRunning) {
				return false;
			}
			self._isRunning = true;
			self.callback();
			self._isRunning = false;
			self.timeout = undefined;
			self.started = undefined;
		}
	}
})
/**
  * An event throttle absorbs multiple triggers within a specific duration and is
  * then triggered after the duration.
  * 
*/
events.Throttle = extend.Class({
	name  :'events.Throttle',
	parent: undefined,
	shared: {
		OPTIONS: {"duration":10}
	},
	properties: {
		options:undefined,
		callback:undefined,
		lastTrigger:undefined,
		_delayed:undefined,
		_events:undefined,
		_callbacks:undefined
	},
	initialize: function( options ){
		var self = this;
		if (options === undefined) {options=undefined}
		// Default initialization of property `options`
		if (typeof(self.options)=='undefined') {self.options = {};};
		// Default initialization of property `callback`
		if (typeof(self.callback)=='undefined') {self.callback = null;};
		// Default initialization of property `lastTrigger`
		if (typeof(self.lastTrigger)=='undefined') {self.lastTrigger = 0;};
		// Default initialization of property `_delayed`
		if (typeof(self._delayed)=='undefined') {self._delayed = undefined;};
		// Default initialization of property `_events`
		if (typeof(self._events)=='undefined') {self._events = [];};
		// Default initialization of property `_callbacks`
		if (typeof(self._callbacks)=='undefined') {self._callbacks = [];};
		if (extend.isNumber(options)) {
			options = {"duration":options};
		}
		self.options = extend.merge(self.options, self.getClass().OPTIONS);
		self.options = extend.merge(self.options, (options || {}));
		self.callback = self.getMethod("trigger");
	},
	methods: {
		/**
		  * Registers a callback `c(Event, [Event], Throttle)` that will
		  * be executed once the throttle is triggered.
		  * 
		*/
		bind: function(callback) {
			var self = this;
			self._callbacks.push(callback);
			return callback;
		},
		
		/**
		  * Triggers the throttle with the given event. This will either push the
		  * 
		*/
		trigger: function(event) {
			var self = this;
			var delta = (__module__.now() - self.lastTrigger);
			if (delta < self.options.duration) {
				!(extend.isDefined(self._delayed)) && extend.assert(false, "events.Throttle.trigger:", "events.Throttle: delayed trigger should have a scheduled _trigger", "(failed `extend.isDefined(self._delayed)`)");
				if (event) {
					self._events.push(event);
				}
			} else {
				!((!extend.isDefined(self._delayed))) && extend.assert(false, "events.Throttle.trigger:", "events.Throttle: delayed trigger callback still assigned, should be undefined.", "(failed `(!extend.isDefined(self._delayed))`)");
				self._cancelDelayed();
				window.setTimeout(self.getMethod('_trigger') , self.options.duration);
			}
		},
		
		_trigger: function() {
			var self = this;
			if (!extend.isDefined(self._delayed)) {
				// Iterates over `self._callbacks`. This works on array,objects and null/undefined
				var __j=self._callbacks;
				var __k=__j instanceof Array ? __j : Object.getOwnPropertyNames(__j||{});
				var __m=__k.length;
				for (var __l=0;__l<__m;__l++){
					var __i=(__k===__j)?__l:__k[__l];
					var c=__j[__i];
					// This is the body of the iteration with (value=c, key/index=__i) in __j
					c(self._events[0], self._events, self);
				}
				self._delayed = undefined;
				self._events = [];
				self.lastTrigger = __module__.now();
			} else {
				extend.error("events.Throttle: Trying to trigger the sink twice");
			}
		},
		
		_cancelDelayed: function() {
			var self = this;
			if (extend.isDefined(self._delayed)) {
				window.clearTimeout(self._delayed);
				self._delayed = undefined;
				return true;
			} else {
				return false;
			}
		},
		
		cancel: function() {
			var self = this;
			self._cancelDelayed();
			self._events = [];
			return self;
		}
	}
})
/**
  * An event source produces events, you can bind to the event source to be
  * called back when an event happens.
  * 
*/
events.EventSource = extend.Class({
	name  :'events.EventSource',
	parent: undefined,
	properties: {
		name:undefined,
		handlers:undefined,
		lastEvent:undefined,
		triggerCount:undefined,
		_isTriggering:undefined,
		_toUnbind:undefined
	},
	initialize: function( name ){
		var self = this;
		if (name === undefined) {name=undefined}
		// Default initialization of property `handlers`
		if (typeof(self.handlers)=='undefined') {self.handlers = undefined;};
		// Default initialization of property `lastEvent`
		if (typeof(self.lastEvent)=='undefined') {self.lastEvent = undefined;};
		// Default initialization of property `triggerCount`
		if (typeof(self.triggerCount)=='undefined') {self.triggerCount = 0;};
		// Default initialization of property `_isTriggering`
		if (typeof(self._isTriggering)=='undefined') {self._isTriggering = false;};
		// Default initialization of property `_toUnbind`
		if (typeof(self._toUnbind)=='undefined') {self._toUnbind = [];};
		self.name = name;
	},
	methods: {
		getTriggerCount: function() {
			var self = this;
			return self.triggerCount;
		},
		
		/**
		  * Bidns the given callback and triggers it with the last event if any.
		  * This is usefull for events that are only triggered once (application
		  * load, etc).
		  * 
		*/
		bindWithLastEvent: function(callback, order) {
			var self = this;
			if (order === undefined) {order=-1}
			var res = self.bind(callback, order);
			if (self.triggerCount > 0) {
				try {
					callback(self.lastEvent.data, self.lastEvent, self)
				} catch(e) {
					__module__.ExceptionHandler(e)
				}
			}
			return res;
		},
		
		/**
		  * Binds a callback to be executed when the given event happens. By default
		  * the callback is appended at the end of the callbacks (first callback bound
		  * is first called), unless the given order is given. Any callback present
		  * at the given order index will be shifted. This method guards against
		  * adding the same callback twice.
		  * 
		*/
		bind: function(callback, order) {
			var self = this;
			if (order === undefined) {order=-1}
			if (!self.handlers) {
				self.handlers = [];
			}
			if ((extend.isIn(callback,self.handlers))) {
				return false;
			}
			while ((self.handlers.length < (order + 1))) {
				self.handlers.push(undefined);
			}
			if (order == -1) {
				self.handlers.push(callback);
			} else {
				if (extend.isDefined(self.handlers[order])) {
					self.handlers.splice(order, 0, callback);
				} else {
					self.handlers[order] = callback;
				}
			}
			return callback;
		},
		
		/**
		  * Binds a callback to be executed only once when the given event happens
		  * 
		*/
		bindOnce: function(callback, order) {
			var self = this;
			if (order === undefined) {order=-1}
			var callback_wrapper = function(data, event, eventSource, callbackWrapper) {
				var res = callback(data, event, eventSource, callback);
				eventSource.unbind(callbackWrapper);
				return res;
			};
			return self.bind(callback_wrapper, order);
		},
		
		/**
		  * Bidns the given callback and triggers it with the last event if any.
		  * This is usefull for events that are only triggered once (application
		  * load, etc).
		  * 
		*/
		bindOnceWithLastEvent: function(callback, order) {
			var self = this;
			if (order === undefined) {order=-1}
			if (self.triggerCount > 0) {
				try {
					callback(self.lastEvent.data, self.lastEvent, self)
				} catch(e) {
					__module__.ExceptionHandler(e)
				}
			} else {
				self.bindOnce(callback, order);
			}
			return res;
		},
		
		/**
		  * Binds the given `source` to this source.
		  * 
		*/
		forwardTo: function(source, order) {
			var self = this;
			if (order === undefined) {order=-1}
			return self.bind(source.getMethod("_forwardCallback"), order);
		},
		
		/**
		  * Clears all the callbacks bound to this event
		  * 
		*/
		clear: function() {
			var self = this;
			self.handlers = undefined;
			return self;
		},
		
		/**
		  * Unbinds the given callback form this event source
		  * 
		*/
		unbind: function(callback) {
			var self = this;
			if (self._isTriggering) {
				self._toUnbind.push(callback);
			} else {
				if (self.handlers) {
					var l = extend.len(self.handlers);
					self.handlers = extend.filter(self.handlers, function(c) {
						return (c != callback);
					});
					!(((l - extend.len(self.handlers)) > 0)) && extend.assert(false, "events.EventSource.unbind:", "EventSource: unbind callback not found in event source", callback, "(failed `((l - extend.len(self.handlers)) > 0)`)");
				}
			}
		},
		
		trigger: function(data, source) {
			var self = this;
			if (source === undefined) {source=undefined}
			return self.triggerWithEvent(new __module__.Event(self.name, data, source));
		},
		
		/**
		  * A method that can be used as a callback to bind the event source to
		  * another event source. In essence, this simply adapts the
		  * `triggerWithEvent` method to be compatible with the callback interface.
		  * 
		*/
		_forwardCallback: function(eventData, event, source, handler) {
			var self = this;
			return self.triggerWithEvent(event);
		},
		
		triggerWithEvent: function(event) {
			var self = this;
			if (!self._isTriggering) {
				self._isTriggering = true;
				self.lastEvent = event;
				!(((self.name == "*") || (event.name == self.name))) && extend.assert(false, "events.EventSource.triggerWithEvent:", ((("EventSource.name and given Event.name do not match: " + self.name) + " != ") + event.name), "(failed `((self.name == \"*\") || (event.name == self.name))`)");
				var data = event.data;
				// Iterates over `self.handlers`. This works on array,objects and null/undefined
				var __n=self.handlers;
				var __p=__n instanceof Array ? __n : Object.getOwnPropertyNames(__n||{});
				var __r=__p.length;
				for (var __q=0;__q<__r;__q++){
					var __o=(__p===__n)?__q:__p[__q];
					var h=__n[__o];
					// This is the body of the iteration with (value=h, key/index=__o) in __n
					if (extend.isDefined(h)) {
						try {
							h(event.data, event, self, h)
						} catch(e) {
							__module__.ExceptionHandler(e)
						}
					};
				}
				self._isTriggering = false;
				while ((self._toUnbind.length > 0)) {
					self.unbind(self._toUnbind.pop());
				}
				self.triggerCount = (self.triggerCount + 1);
			}
		}
	}
})
/**
  * Returns `now` in milliseconds. The origin of the milliseconds can vary.
  * 
*/
events.now = function(){
	var self = events;
	if (window.performance && window.performance.now) {
		return window.performance.now();
	} else {
		return new Date().getTime();
	}
}
/**
  * Creates event sources from the given list of sources names.
  * 
*/
events.create = function(sourcesList, sources){
	var self = events;
	if (sources === undefined) {sources={}}
	// Iterates over `sourcesList`. This works on array,objects and null/undefined
	var __t=sourcesList;
	var __u=__t instanceof Array ? __t : Object.getOwnPropertyNames(__t||{});
	var __w=__u.length;
	for (var __v=0;__v<__w;__v++){
		var __s=(__u===__t)?__v:__u[__v];
		var source=__t[__s];
		// This is the body of the iteration with (value=source, key/index=__s) in __t
		sources[source] = new __module__.EventSource(source);
	}
	return sources;
}
/**
  * Throttles the given callback my delay ms.
  * 
*/
events.throttle = function(callback, delay){
	var self = events;
	if (delay === undefined) {delay=250}
	var t = new __module__.Throttle(delay);
	t.bind(callback);
	return t.getMethod("trigger");
}
events.init = function(){
	var self = events;
}
if (typeof(events.init)!="undefined") {events.init();}

// START:VANILLA_POSTAMBLE
return events;})(events);
// END:VANILLA_POSTAMBLE
