// 8< ---[interaction.js]---
/**
  * The goal of the `interaction` module is to provide a consistent way of
  * interacting with devices (mouse, touch, etc), allowing to handle
  * each devices specific events (down, up, touch, press, etc) as well as
  * combinations of events (aka "gestures") such as click, drag or swipe that
  * may even involve multiple devices.
  * 
  * Gestures abstract devices away, but still allow to implement device-specific
  * interactions depending on the device used.
  * 
*/
// START:VANILLA_PREAMBLE
var interaction=typeof(extend)!='undefined' ? extend.module('interaction') : (typeof(interaction)!='undefined' ? interaction : {});
(function(interaction){
var __module__=interaction;
// END:VANILLA_PREAMBLE

interaction.__VERSION__='1.7.3';
interaction.$ = (((typeof(jQuery) != "undefined") && jQuery) || extend.modules.select);
interaction.LICENSE = "http://ffctn.com/doc/licenses/bsd";
interaction.LAST_INTERACTION = undefined;
interaction.GESTURES = {};
interaction.KEYS = {"BACKSPACE":8, "TAB":9, "ENTER":13, "ESC":27, "LEFT":37, "UP":38, "RIGHT":39, "DOWN":40};
interaction.isSelection = function(scope){
	var self = interaction;
	return (scope && (scope.jquery || scope.isSelection));
}
interaction.asNode = function(scope){
	var self = interaction;
	if (__module__.isSelection(scope)) {
		return scope.eq(0);
	} else {
		return scope;
	}
}
/**
  * A handler aggregates one or more event handlers that can be bound to one or
  * more DOM/SVG elements.
  * 
*/
interaction.Handler = extend.Class({
	name  :'interaction.Handler',
	parent: undefined,
	shared: {
		COUNT: 0
	},
	properties: {
		id:undefined,
		on:undefined,
		_handlers:undefined,
		data:undefined
	},
	initialize: function( devices ){
		var self = this;
		// Default initialization of property `id`
		if (typeof(self.id)=='undefined') {self.id = -1;};
		// Default initialization of property `on`
		if (typeof(self.on)=='undefined') {self.on = {};};
		// Default initialization of property `_handlers`
		if (typeof(self._handlers)=='undefined') {self._handlers = {};};
		// Default initialization of property `data`
		if (typeof(self.data)=='undefined') {self.data = {};};
		self.id = self.getClass().COUNT;
		self.getClass().COUNT = (self.getClass().COUNT + 1);
		self.listen(devices);
	},
	methods: {
		/**
		  * Adds the given `{<DEVICE>:{<EVENT>:<CALLBACK|[CALLBACK]>}}` mapping to
		  * this handler.
		  * 
		  * Note that if you call `listen` after having called `bind`, then you will
		  * have to call `bind` again on the scopes for all the events to be registered.
		  * 
		  * Ex:
		  * ```
		  * handler listen {
		  * mouse : {
		  * wheel : ...
		  * }
		  * key   : {
		  * press : ...
		  * }
		  * }
		  * ```
		  * 
		*/
		listen: function(devices) {
			var self = this;
			// Iterates over `devices`. This works on array,objects and null/undefined
			var __i=devices;
			var __j=__i instanceof Array ? __i : Object.getOwnPropertyNames(__i||{});
			var __l=__j.length;
			for (var __k=0;__k<__l;__k++){
				var device=(__j===__i)?__k:__j[__k];
				var events=__i[device];
				// This is the body of the iteration with (value=events, key/index=device) in __i
				if (!self.on[device]) {
					self.on[device] = {};
				};
				var device_class = __module__.Source.Get(device);;
				!(device_class) && extend.assert(false, "interaction.Handler.listen:", ("No device or gesture found:" + device), "(failed `device_class`)");
				if (extend.isFunction(events)) {
					events = extend.createMapFromItems([device,events]);
				};
				// Iterates over `events`. This works on array,objects and null/undefined
				var __m=events;
				var __o=__m instanceof Array ? __m : Object.getOwnPropertyNames(__m||{});
				var __p=__o.length;
				for (var __n=0;__n<__p;__n++){
					var eventName=(__o===__m)?__n:__o[__n];
					var callbacks=__m[eventName];
					// This is the body of the iteration with (value=callbacks, key/index=eventName) in __m
					if (device_class) {
						!(device_class.HasEvent(eventName)) && extend.assert(false, "interaction.Handler.listen:", (((("Device/Gesture does not declare event: " + device) + ".") + eventName) + " available events are "), device_class.ListEvents(), "(failed `device_class.HasEvent(eventName)`)");
						if (!extend.isList(callbacks)) {
							callbacks = [callbacks];
						}
						self.on[device][eventName] = callbacks;
					};
				};
			}
			return self;
		},
		
		/**
		  * Ensures that there's a given handler for the given event
		  * 
		*/
		_ensureHandler: function(device, name) {
			var self = this;
			if (!self._handlers[device]) {
				self._handlers[device] = {};
			}
			if (!self._handlers[device][name]) {
				self._handlers[device][name] = function(event, source) {
				if (window.animation) {
					__module__.LAST_INTERACTION = animation.now();
				} else {
					__module__.LAST_INTERACTION = new Date().getTime();
				}
				return self._trigger(device, name, self._normalizeEvent(device, name, event), (source || self));
			};
			}
			return self._handlers[device][name];
		},
		
		/**
		  * Triggers the event from the given device, with the given name and event data.
		  * This wraps the `interaction.trigger` function.
		  * 
		*/
		_trigger: function(device, name, event, source) {
			var self = this;
			return interaction.trigger(self.on[device], name, event, source);
		},
		
		/**
		  * Binds the handler to the given scope. This will look for all the devices
		  * registered in the handler and bind the corresponding events.
		  * 
		*/
		bind: function(scope, capture) {
			var self = this;
			if (capture === undefined) {capture=true}
			if (__module__.isSelection(scope) || extend.isList(scope)) {
				// Iterates over `scope`. This works on array,objects and null/undefined
				var __r=scope;
				var __s=__r instanceof Array ? __r : Object.getOwnPropertyNames(__r||{});
				var __u=__s.length;
				for (var __t=0;__t<__u;__t++){
					var __q=(__s===__r)?__t:__s[__t];
					var _=__r[__q];
					// This is the body of the iteration with (value=_, key/index=__q) in __r
					self.bind(_, capture);
				}
			} else {
				if (!extend.isDefined(scope._interactionHandlers)) {
					scope._interactionHandlers = {};
				}
				// Iterates over `self.on`. This works on array,objects and null/undefined
				var __v=self.on;
				var __w=__v instanceof Array ? __v : Object.getOwnPropertyNames(__v||{});
				var __y=__w.length;
				for (var __x=0;__x<__y;__x++){
					var device=(__w===__v)?__x:__w[__x];
					var handlers=__v[device];
					// This is the body of the iteration with (value=handlers, key/index=device) in __v
					var device_class = __module__.Source.Get(device);;
					if (device_class.isSubclassOf(__module__.Device)) {
						// Iterates over `handlers`. This works on array,objects and null/undefined
						var __z=handlers;
						var __a=__z instanceof Array ? __z : Object.getOwnPropertyNames(__z||{});
						var __c=__a.length;
						for (var __b=0;__b<__c;__b++){
							var name=(__a===__z)?__b:__a[__b];
							var callbacks=__z[name];
							// This is the body of the iteration with (value=callbacks, key/index=name) in __z
							device_class.Bind(name, scope, self._ensureHandler(device, name), capture);
						}
					} else {
						device_class.Bind(scope, self, capture);
					};
				}
			}
			return self;
		},
		
		/**
		  * Unbinds the handler to the given scope. This will look for all the devices
		  * registered in the handler and unbind the corresponding events.
		  * 
		*/
		unbind: function(scope, capture) {
			var self = this;
			if (capture === undefined) {capture=true}
			if (__module__.isSelection(scope) || extend.isList(scope)) {
				// Iterates over `scope`. This works on array,objects and null/undefined
				var __e=scope;
				var __f=__e instanceof Array ? __e : Object.getOwnPropertyNames(__e||{});
				var __h=__f.length;
				for (var __g=0;__g<__h;__g++){
					var __d=(__f===__e)?__g:__f[__g];
					var _=__e[__d];
					// This is the body of the iteration with (value=_, key/index=__d) in __e
					self.unbind(_, capture);
				}
			} else {
				// Iterates over `self.on`. This works on array,objects and null/undefined
				var __ij=self.on;
				var __jj=__ij instanceof Array ? __ij : Object.getOwnPropertyNames(__ij||{});
				var __lj=__jj.length;
				for (var __kj=0;__kj<__lj;__kj++){
					var device=(__jj===__ij)?__kj:__jj[__kj];
					var handlers=__ij[device];
					// This is the body of the iteration with (value=handlers, key/index=device) in __ij
					var device_class = __module__.Source.Get(device);;
					if (device_class.isSubclassOf(__module__.Device)) {
						// Iterates over `handlers`. This works on array,objects and null/undefined
						var __mj=handlers;
						var __oj=__mj instanceof Array ? __mj : Object.getOwnPropertyNames(__mj||{});
						var __pj=__oj.length;
						for (var __nj=0;__nj<__pj;__nj++){
							var name=(__oj===__mj)?__nj:__oj[__nj];
							var callbacks=__mj[name];
							// This is the body of the iteration with (value=callbacks, key/index=name) in __mj
							device_class.Unbind(name, scope, self._ensureHandler(device, name), capture);
						}
					} else {
						device_class.Unbind(scope, self, capture);
					};
				}
			}
			return self;
		},
		
		_normalizeEvent: function(device, name, event) {
			var self = this;
			return __module__.Source.Get(device).NormalizeEvent(event, name);
		}
	},
	operations:{
		/**
		  * Merge the given handlers so that they are all with the
		  * for {<device|gesture>:([callback],{<event>:[callback]})}
		  * 
		*/
		Merge: function( a, b ){
			var self = this;
			// Iterates over `b`. This works on array,objects and null/undefined
			var __qj=b;
			var __rj=__qj instanceof Array ? __qj : Object.getOwnPropertyNames(__qj||{});
			var __tj=__rj.length;
			for (var __sj=0;__sj<__tj;__sj++){
				var device=(__rj===__qj)?__sj:__rj[__sj];
				var handlers=__qj[device];
				// This is the body of the iteration with (value=handlers, key/index=device) in __qj
				if ((!extend.isMap(handlers)) && (!extend.isList(handlers))) {
					handlers = [handlers];
				};
				if (!a[device]) {
					a[device] = handlers;
				} else {
					if (extend.isList(handlers)) {
						if (extend.isList(a[device])) {
							a[device] = a[device].concat(handlers);
						} else {
							extend.error((("Handler.Merge: Incompatible type a[" + device) + "]="), a[device], (("!= b[" + k) + "]="), handlers);
						}
					} else {
						// Iterates over `handlers`. This works on array,objects and null/undefined
						var __uj=handlers;
						var __vj=__uj instanceof Array ? __uj : Object.getOwnPropertyNames(__uj||{});
						var __xj=__vj.length;
						for (var __wj=0;__wj<__xj;__wj++){
							var event=(__vj===__uj)?__wj:__vj[__wj];
							var callbacks=__uj[event];
							// This is the body of the iteration with (value=callbacks, key/index=event) in __uj
							if (!extend.isList(callbacks)) {
								callbacks = [callbacks];
							};
							if (!a[device][event]) {
								a[device][event] = callbacks;
							} else {
								a[device][event] = a[device][event].concat(callbacks);
							};
						}
					}
				};
			}
			return a;
		}
	}
})
/**
  * The event class abstracts touch and mouse events, storing additional
  * information such as delta, distance and speed that is useful to implement
  * complex handlers and gestures.
  * 
  * The event class uses the flyweight pattern to allow recycling of events,
  * preventing the creation of too many objects at the cost of some extra memory.
  * 
*/
interaction.Event = extend.Class({
	name  :'interaction.Event',
	parent: undefined,
	shared: {
		COUNT: 0,
		STACK: [],
		STACK_LIMIT: 100
	},
	properties: {
		id:undefined,
		deviceID:undefined,
		type:undefined,
		index:undefined,
		gesture:undefined,
		position:undefined,
		delta:undefined,
		distance:undefined,
		time:undefined,
		target:undefined,
		velocity:undefined,
		origin:undefined,
		started:undefined,
		ended:undefined,
		duration:undefined,
		original:undefined,
		isInteractionEvent:undefined,
		last:undefined
	},
	initialize: function(  ){
		var self = this;
		// Default initialization of property `id`
		if (typeof(self.id)=='undefined') {self.id = -1;};
		// Default initialization of property `deviceID`
		if (typeof(self.deviceID)=='undefined') {self.deviceID = null;};
		// Default initialization of property `type`
		if (typeof(self.type)=='undefined') {self.type = null;};
		// Default initialization of property `index`
		if (typeof(self.index)=='undefined') {self.index = 0;};
		// Default initialization of property `gesture`
		if (typeof(self.gesture)=='undefined') {self.gesture = null;};
		// Default initialization of property `position`
		if (typeof(self.position)=='undefined') {self.position = [0, 0];};
		// Default initialization of property `delta`
		if (typeof(self.delta)=='undefined') {self.delta = [0, 0];};
		// Default initialization of property `distance`
		if (typeof(self.distance)=='undefined') {self.distance = 0;};
		// Default initialization of property `time`
		if (typeof(self.time)=='undefined') {self.time = 0;};
		// Default initialization of property `target`
		if (typeof(self.target)=='undefined') {self.target = undefined;};
		// Default initialization of property `velocity`
		if (typeof(self.velocity)=='undefined') {self.velocity = 0;};
		// Default initialization of property `origin`
		if (typeof(self.origin)=='undefined') {self.origin = [0, 0];};
		// Default initialization of property `started`
		if (typeof(self.started)=='undefined') {self.started = 0;};
		// Default initialization of property `ended`
		if (typeof(self.ended)=='undefined') {self.ended = 0;};
		// Default initialization of property `duration`
		if (typeof(self.duration)=='undefined') {self.duration = 0;};
		// Default initialization of property `original`
		if (typeof(self.original)=='undefined') {self.original = undefined;};
		// Default initialization of property `isInteractionEvent`
		if (typeof(self.isInteractionEvent)=='undefined') {self.isInteractionEvent = true;};
		// Default initialization of property `last`
		if (typeof(self.last)=='undefined') {self.last = {"position":null, "delta":null, "time":0, "distance":0, "velocity":0};};
		self.id = self.getClass().COUNT;
		self.getClass().COUNT = (self.getClass().COUNT + 1);
	},
	methods: {
		reset: function() {
			var self = this;
			self.id = self.getClass().COUNT;
			self.getClass().COUNT = (self.getClass().COUNT + 1);
			self.type = null;
			self.gesture = null;
			self.index = 0;
			self.position[0] = 0;
			self.position[1] = 0;
			self.delta[0] = 0;
			self.delta[1] = 0;
			self.distance = 0;
			self.time = 0;
			self.velocity = 0;
			self.origin[0] = 0;
			self.origin[1] = 0;
			self.started = 0;
			self.ended = 0;
			self.duration = 0;
			self.target = undefined;
			self.last.position = null;
			self.last.delta = null;
			self.last.time = 0;
			self.last.distance = 0;
			self.last.velocity = 0;
			self.original = undefined;
			return self;
		},
		
		recycle: function() {
			var self = this;
			self.reset();
			if (self.getClass().STACK.length < self.getClass().STACK_LIMIT) {
				self.getClass().STACK.push(self);
			}
			return self;
		},
		
		/**
		  * Copies the relevant data from the given mouse event into the
		  * given gesture event.
		  * 
		*/
		copyMouseEvent: function(mouseEvent, isOrigin) {
			var self = this;
			if (isOrigin === undefined) {isOrigin=false}
			self.original = mouseEvent;
			self.type = "mouse";
			self.target = mouseEvent.target;
			self._prepareEvent(isOrigin);
			self.position[0] = mouseEvent.pageX;
			self.position[1] = mouseEvent.pageY;
			self._updateEvent(isOrigin);
			return self;
		},
		
		copyTouchEvent: function(touchEvent, touch, isOrigin) {
			var self = this;
			if (isOrigin === undefined) {isOrigin=false}
			self.type = "touch";
			touch = touch;
			self.id = touch.identifier;
			self.deviceID = ((self.type + ":") + self.id);
			self.original = touchEvent;
			self.target = touchEvent.target;
			self._prepareEvent(isOrigin);
			self.position[0] = touch.pageX;
			self.position[1] = touch.pageY;
			return self._updateEvent(isOrigin);
		},
		
		/**
		  * Prepares the given gesture event by copying the last position and
		  * time if not origin, and initializing the last position and delta
		  * if necessary.
		  * 
		*/
		_prepareEvent: function(isOrigin) {
			var self = this;
			if (isOrigin === undefined) {isOrigin=false}
			if (!isOrigin) {
				if (!self.last.position) {
					self.last.position = [0, 0];
					self.last.delta = [0, 0];
				}
				self.last.position[0] = self.position[0];
				self.last.position[1] = self.position[1];
				self.last.ended = self.ended;
				self.last.duration = (self.last.started - self.ended);
			}
			return self;
		},
		
		/**
		  * Updates event properties based on its position, origin, started and
		  * ended properties. This gives global and local delta, distance and
		  * velocity.
		  * 
		*/
		_updateEvent: function(isOrigin) {
			var self = this;
			if (isOrigin === undefined) {isOrigin=false}
			if (isOrigin) {
				self.origin[0] = self.position[0];
				self.origin[1] = self.position[1];
				self.started = new Date().getTime();
			}
			self.ended = new Date().getTime();
			self.delta[0] = (self.position[0] - self.origin[0]);
			self.delta[1] = (self.position[1] - self.origin[1]);
			self.distance = Math.sqrt(((self.delta[0] * self.delta[0]) + (self.delta[1] * self.delta[1])));
			self.duration = (self.ended - self.started);
			self.velocity = (self.distance / self.duration);
			if (!isOrigin) {
				self.last.delta[0] = (self.position[0] - self.last.position[0]);
				self.last.delta[1] = (self.position[1] - self.last.position[1]);
				self.last.distance = Math.sqrt(((self.last.delta[0] * self.last.delta[0]) + (self.last.delta[1] * self.last.delta[1])));
				self.last.duration = (self.last.ended - self.started);
				self.last.velocity = (self.last.distance / self.last.duration);
			}
			return self;
		}
	},
	operations:{
		FromMouse: function( event, isOrigin ){
			var self = this;
			if (isOrigin === undefined) {isOrigin=false}
			return self.Get().copyMouseEvent(event, isOrigin);
		},
		/**
		  * Extracts the unique device ID that identifies the source for
		  * this event.
		  * 
		*/
		GetDeviceID: function( event ){
			var self = this;
			if (event.isInteractionEvent) {
				return self.deviceID;
			} else if (extend.isDefined(event.changedTouches)) {
				return ("touch:" + event.changedTouches[0]);
			} else if (extend.isDefined(event.keycode)) {
				return "keyboard:0";
			} else {
				return "mouse:0";
			}
		},
		FromTouch: function( event, touch, isOrigin ){
			var self = this;
			if (isOrigin === undefined) {isOrigin=false}
			return self.Get().copyTouchEvent(event, touch, isOrigin);
		},
		/**
		  * Returns the first element (or parent element) that
		  * contains the given class
		  * 
		*/
		TargetWithClass: function( event, className, limit ){
			var self = this;
			if (limit === undefined) {limit=undefined}
			if (limit) {
				limit = widgets.asElement(limit);
			}
			var t = null;
			if (event.nodeName) {
				t = event;
			} else {
				t = event.target;
			}
			if (!className) {
				return t;
			} else {
				while (((t && (t != limit)) && ((!t.classList) || (!t.classList.contains(className))))) {
					t = t.parentNode;
					if (t == limit) {
						if (t.classList && t.classList.contains(className)) {
							return t;
						} else {
							return null;
						}
					}
				}
			}
			if (t == document) {
				return null;
			}
			return t;
		},
		Get: function(  ){
			var self = this;
			if (self.STACK.length == 0) {
				return new __module__.Event();
			} else {
				return self.STACK.pop();
			}
		}
	}
})
/**
  * The interaction source abstracts devices & gestures.
  * 
*/
interaction.Source = extend.Class({
	name  :'interaction.Source',
	parent: undefined,
	shared: {
		CACHE: {},
		NAME: null,
		EVENTS: {}
	},
	initialize: function(){
		var self = this;
	},
	operations:{
		/**
		  * Unbinds the given event from the given scope
		  * 
		*/
		Unbind: function( event, scope, callback, capture ){
			var self = this;
			if (capture === undefined) {capture=true}
			if (__module__.isSelection(scope)) {
				// Iterates over `scope`. This works on array,objects and null/undefined
				var __zj=scope;
				var __aj=__zj instanceof Array ? __zj : Object.getOwnPropertyNames(__zj||{});
				var __cj=__aj.length;
				for (var __bj=0;__bj<__cj;__bj++){
					var __yj=(__aj===__zj)?__bj:__aj[__bj];
					var _=__zj[__yj];
					// This is the body of the iteration with (value=_, key/index=__yj) in __zj
					self.Unbind(event, _, callback, capture);
				}
			} else {
				self._Unbind(event, scope, callback, capture);
			}
			return self;
		},
		/**
		  * Returns the device class with the given name, or `Undefined` if none exists.
		  * 
		*/
		Get: function( name ){
			var self = this;
			if (!self.CACHE[name]) {
				self.CACHE[name] = extend.first(extend.getChildrenOf(self), function(_) {
					return (_.NAME == name);
				});
			}
			return self.CACHE[name];
		},
		/**
		  * Binds the given event to the given scope
		  * 
		*/
		Bind: function( event, scope, callback, capture ){
			var self = this;
			if (capture === undefined) {capture=true}
			if (__module__.isSelection(scope)) {
				// Iterates over `scope`. This works on array,objects and null/undefined
				var __ej=scope;
				var __fj=__ej instanceof Array ? __ej : Object.getOwnPropertyNames(__ej||{});
				var __hj=__fj.length;
				for (var __gj=0;__gj<__hj;__gj++){
					var __dj=(__fj===__ej)?__gj:__fj[__gj];
					var _=__ej[__dj];
					// This is the body of the iteration with (value=_, key/index=__dj) in __ej
					self.Bind(event, _, callback, capture);
				}
			} else {
				self._Bind(event, scope, callback, capture);
			}
			return self;
		},
		/**
		  * Inits the device class. Does nothing by default.
		  * 
		*/
		Init: function(  ){
			var self = this;
			/* pass */
		},
		/**
		  * Binds the given event to the given scope
		  * 
		*/
		_Bind: function( event, scope, callback, capture ){
			var self = this;
			if (capture === undefined) {capture=true}
		},
		/**
		  * Tells wether this device offers the event with the given name or not
		  * 
		*/
		HasEvent: function( event ){
			var self = this;
			var events = self.EVENTS;
			if (extend.isMap(events)) {
				return ((events[event] && true) || false);
			} else {
				return ((extend.first(events, function(_) {
					return (_ == event);
				}) && true) || false);
			}
		},
		/**
		  * Returns a list of the events defined by this class
		  * 
		*/
		ListEvents: function(  ){
			var self = this;
			return self.EVENTS;
		},
		/**
		  * Unbinds the given event from the given scope
		  * 
		*/
		_Unbind: function( event, scope, callback, capture ){
			var self = this;
			if (capture === undefined) {capture=true}
		}
	}
})
/**
  * A device abstracts a source of events to which a handler can bind. Devices
  * can have one or more instances and are automatically registered in the
  * as available to handlers.
  * 
*/
interaction.Device = extend.Class({
	name  :'interaction.Device',
	parent: __module__.Source,
	shared: {
		IsEnabled: true
	},
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Device.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	operations:{
		/**
		  * Cancels the given event (this works with normalized and raw events)
		  * 
		*/
		Cancel: function( event ){
			var self = this;
			if (event._originalEvent) {
				event = event._originalEvent;
			}
			event.stopPropagation();
			event.preventDefault();
			event.stopImmediatePropagation();
			return false;
		},
		/**
		  * Unbinds the given event from the given scope. If the callback has
		  * a `_callbackWrappers` list, this list will be unbound as well.
		  * 
		*/
		_Unbind: function( event, scope, callback, capture ){
			var self = this;
			if (capture === undefined) {capture=true}
			if (callback && callback._callbackWrappers) {
				// Iterates over `callback._callbackWrappers`. This works on array,objects and null/undefined
				var __jk=callback._callbackWrappers;
				var __kk=__jk instanceof Array ? __jk : Object.getOwnPropertyNames(__jk||{});
				var __mk=__kk.length;
				for (var __lk=0;__lk<__mk;__lk++){
					var __ik=(__kk===__jk)?__lk:__kk[__lk];
					var _=__jk[__ik];
					// This is the body of the iteration with (value=_, key/index=__ik) in __jk
					self._Unbind(event, scope, _, capture);
				}
			} else {
				scope.removeEventListener(self.NormalizeEventName(event), callback, capture);
			}
		},
		/**
		  * Normalizes the name of this event.
		  * 
		*/
		NormalizeEventName: function( name ){
			var self = this;
			var events = self.EVENTS;
			if (extend.isMap(events)) {
				return events[name];
			} else {
				return name;
			}
		},
		/**
		  * Normalizes the given event.
		  * 
		*/
		NormalizeEvent: function( event, name ){
			var self = this;
			if (name === undefined) {name=undefined}
			return event;
		},
		/**
		  * Binds the given event to the given scope
		  * 
		*/
		_Bind: function( event, scope, callback, capture ){
			var self = this;
			if (capture === undefined) {capture=true}
			scope.addEventListener((self.NormalizeEventName(event) || event), callback, capture);
		}
	}
})
/**
  * The mouse device supports the following events:
  * 
  * - move
  * - down
  * - up
  * - click
  * - wheel
  * - move
  * - in
  * - out
  * 
*/
interaction.Mouse = extend.Class({
	name  :'interaction.Mouse',
	parent: __module__.Device,
	shared: {
		/**
		  * This value is the number of pixels per line (font-size) of the container
		  * element.
		  * TODO: We should actually manually get this value from the scope
		  * 
		*/
		PX_LINE_RATIO: 15,
		NAME: "mouse",
		EVENTS: {"move":"mousemove", "down":"mousedown", "up":"mouseup", "wheel":"wheel", "move":"mousemove", "in":"mouseover", "out":"mouseout", "click":"click", "doubleClick":"dblclick"}
	},
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Mouse.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	operations:{
		NormalizeWheelEvent: function( original ){
			var self = this;
			if (original._isNormalized) {
				return original;
			}
			var delta = original.delta;
			var delta_x = original.deltaX;
			var delta_y = original.deltaY;
			if (extend.isDefined(original.deltaMode) && (original.deltaMode == 1)) {
				var px_line = parseFloat(getComputedStyle(original.target, "").fontSize);
				delta_y = (delta_y * px_line);
				delta_x = (delta_x * px_line);
			}
			if (extend.isDefined(original.detail)) {
				delta = (original.detail / 3);
			}
			
			var event = extend.copy(original);
			event._originalEvent = original;
			event._isNormalized = true;
			event.delta = delta;
			event.deltaX = delta_x;
			event.deltaY = delta_y;
			return event;
		},
		Init: function(  ){
			var self = this;
			if (!extend.isDefined(document.documentElement.onwheel)) {
				self.EVENTS.wheel = "mousewheel";
			}
		},
		/**
		  * Normalizes the given event.
		  * 
		*/
		NormalizeEvent: function( event, name ){
			var self = this;
			if (name === undefined) {name=undefined}
			if (name == "wheel") {
				return self.NormalizeWheelEvent(event);
			} else {
				return event;
			}
		}
	}
})

interaction.Touch = extend.Class({
	name  :'interaction.Touch',
	parent: __module__.Device,
	shared: {
		NAME: "touch",
		EVENTS: {"start":"touchstart", "end":"touchend", "move":"touchmove", "enter":"touchenter", "cancel":"touchcancel", "leave":"touchleave"}
	},
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Touch.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	operations:{
		GetChangedTargets: function( event, touches ){
			var self = this;
			return self.GetTargets(event, event.changedTouches);
		},
		GetTargets: function( event, touches ){
			var self = this;
			if (touches === undefined) {touches=event.touches}
			var targets = [];
			// Iterates over `touches`. This works on array,objects and null/undefined
			var __nk=touches;
			var __pk=__nk instanceof Array ? __nk : Object.getOwnPropertyNames(__nk||{});
			var __rk=__pk.length;
			for (var __qk=0;__qk<__rk;__qk++){
				var __ok=(__pk===__nk)?__qk:__pk[__qk];
				var touch=__nk[__ok];
				// This is the body of the iteration with (value=touch, key/index=__ok) in __nk
				if (!((extend.isIn(touch.target,targets)))) {
					targets.push(touch.target);
				};
			}
			return targets;
		}
	}
})

interaction.Keyboard = extend.Class({
	name  :'interaction.Keyboard',
	parent: __module__.Device,
	shared: {
		EVENTS: {"down":"keydown", "up":"keyup", "press":"keypress"},
		RIGHT: 39,
		NAME: "keyboard",
		LEFT: 37
	},
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Keyboard.getParent());__super__.initialize.apply(__super__, arguments);}
	}
})

interaction.Window = extend.Class({
	name  :'interaction.Window',
	parent: __module__.Device,
	shared: {
		UNLOAD_EVENTS: null,
		NAME: "window",
		EVENTS: {"unload":"beforeunload", "scroll":"scroll"}
	},
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Window.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	operations:{
		/**
		  * This helper operation allows to ensures that there is a list of
		  * callbacks registered for the window unload event, and that the
		  * callback is not overriden.
		  * 
		*/
		_EnsureUnload: function(  ){
			var self = this;
			if (self.UNLOAD_EVENTS === null) {
				self.UNLOAD_EVENTS = [];
				window.onbeforeunload = function(event) {
					var res = undefined;
					// Iterates over `__module__.Window.UNLOAD_EVENTS`. This works on array,objects and null/undefined
					var __tk=__module__.Window.UNLOAD_EVENTS;
					var __uk=__tk instanceof Array ? __tk : Object.getOwnPropertyNames(__tk||{});
					var __wk=__uk.length;
					for (var __vk=0;__vk<__wk;__vk++){
						var __sk=(__uk===__tk)?__vk:__uk[__vk];
						var c=__tk[__sk];
						// This is the body of the iteration with (value=c, key/index=__sk) in __tk
						var r = c(event);;
						if (r === false) {
							self.Cancel(event);
							break
						} else if (extend.isString(r)) {
							res = r;
						};
					}
					return res;
				};
			}
		},
		/**
		  * Binds the given event to the given scope. This is a specialized
		  * implementation that handles the `unload` event.
		  * 
		*/
		_Unbind: function( event, scope, callback, capture ){
			var self = this;
			if (capture === undefined) {capture=true}
			if (event == "unload") {
				__module__.Window.UNLOAD_EVENTS = extend.filter(__module__.Window.UNLOAD_EVENTS, function(_) {
					return (_ != callback);
				});
			} else {
				__module__.Device._Unbind(event, window, callback, capture);
			}
		},
		/**
		  * Binds the given event to the given scope. This is a specialized
		  * implementation that handles the `unload` event.
		  * 
		*/
		_Bind: function( event, scope, callback, capture ){
			var self = this;
			if (capture === undefined) {capture=true}
			if (event == "unload") {
				self._EnsureUnload();
				__module__.Window.UNLOAD_EVENTS.push(callback);
			} else {
				__module__.Device._Bind(event, window, callback, capture);
			}
		}
	}
})

interaction.Screen = extend.Class({
	name  :'interaction.Screen',
	parent: __module__.Device,
	shared: {
		Callbacks: null,
		Cache: {"mode":null, "width":null, "height":null},
		NAME: "screen",
		EVENTS: {"orientation":"deviceorientation", "mode":true, "size":true}
	},
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Screen.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	operations:{
		/**
		  * Guesses the zoom ratio based on the
		  * 
		*/
		GuessPixelRatio: function(  ){
			var self = this;
			if (window.devicePixelRatio) {
				return window.devicePixelRatio;
			} else if (__module__.Screen.IsMobile()) {
				if (__module__.Screen.HasDPI(300)) {
					return 2;
				} else if (__module__.Screen.HasDPI(250)) {
					return 1.5;
				} else if (__module__.Screen.HasDPI(160)) {
					return 1;
				} else if (__module__.Screen.HasDPI(133)) {
					return 0.75;
				} else {
					return 0.5;
				}
			} else {
				if (__module__.Screen.HasDPI(250)) {
					return 1.5;
				} else {
					return 1;
				}
			}
		},
		IsLandscape: function(  ){
			var self = this;
			return self.Query("(orientation: landscape)");
		},
		EnsureCallbacks: function(  ){
			var self = this;
			if (!__module__.Device.Callbacks) {
				__module__.Device.Callbacks = extend.map(self.EVENTS, function() {
					return [];
				});
				window.addEventListener("orientationchange", self.OnOrientationChange, true);
				window.addEventListener("deviceorientation", self.OnOrientationChange, true);
				window.addEventListener("resize", self.OnWindowResized);
			}
			return __module__.Device.Callbacks;
		},
		GuessDPI: function( steps ){
			var self = this;
			if (steps === undefined) {steps=10}
			var bounds = [0, 600];
			while (((steps > 0) && (!self.HasDPI(bounds[1])))) {
				var delta = (bounds[1] - bounds[0]);
				var guess = parseInt((bounds[0] + (delta / 2)));
				if (__module__.Screen.HasDPI(guess)) {
					bounds[0] = guess;
				} else {
					bounds[1] = guess;
				}
				steps = (steps - 1);
			}
			var result = bounds[0];
			if (result == 0) {
				if (navigator.userAgent.indexOf("iPhone") != -1) {
					result = 326;
				}
			}
			return result;
		},
		/**
		  * Binds the given event to the given scope
		  * 
		*/
		_Bind: function( event, scope, callback, capture ){
			var self = this;
			if (capture === undefined) {capture=true}
			var c = self.EnsureCallbacks();
			!(extend.isDefined(c[event])) && extend.assert(false, "interaction.Screen._Bind:", ("Screen: No event defined " + event), "(failed `extend.isDefined(c[event])`)");
			c[event].push(callback);
		},
		OnWindowResized: function( event ){
			var self = this;
			var width = window.innerWidth;
			var height = window.innerHeight;
			var ratio = (width / height);
			var size = [width, height];
			var mode = (((width > height) && "landscape") || "portrait");
			var event = {"type":null, "width":width, "height":height, "ratio":ratio, "mode":mode};
			if (mode != __module__.Screen.Cache.mode) {
				var e = extend.merge({"type":"mode", "value":mode, "previous":__module__.Screen.Cache.mode}, event);
				// Iterates over `__module__.Device.Callbacks.mode`. This works on array,objects and null/undefined
				var __yk=__module__.Device.Callbacks.mode;
				var __zk=__yk instanceof Array ? __yk : Object.getOwnPropertyNames(__yk||{});
				var __bk=__zk.length;
				for (var __ak=0;__ak<__bk;__ak++){
					var __xk=(__zk===__yk)?__ak:__zk[__ak];
					var c=__yk[__xk];
					// This is the body of the iteration with (value=c, key/index=__xk) in __yk
					c(e);
				}
			}
			if ((width != __module__.Screen.Cache.width) || (height != __module__.Screen.Cache.height)) {
				var e = extend.merge({"type":"size", "value":size, "previous":__module__.Screen.Cache.size}, event);
				// Iterates over `__module__.Device.Callbacks.size`. This works on array,objects and null/undefined
				var __dk=__module__.Device.Callbacks.size;
				var __ek=__dk instanceof Array ? __dk : Object.getOwnPropertyNames(__dk||{});
				var __gk=__ek.length;
				for (var __fk=0;__fk<__gk;__fk++){
					var __ck=(__ek===__dk)?__fk:__ek[__fk];
					var c=__dk[__ck];
					// This is the body of the iteration with (value=c, key/index=__ck) in __dk
					c(e);
				}
			}
			__module__.Screen.Cache.mode = mode;
			__module__.Screen.Cache.width = width;
			__module__.Screen.Cache.size = size;
			__module__.Screen.Cache.height = height;
		},
		IsPortrait: function(  ){
			var self = this;
			return self.Query("(orientation: portrait)");
		},
		HasDensity: function( dppx ){
			var self = this;
			return self.Query((("(min-resolution: " + dppx) + "dppx)"));
		},
		HasDPI: function( dpi ){
			var self = this;
			return self.Query((("(min-resolution: " + dpi) + "dpi)"));
		},
		GuessDPX: function( steps ){
			var self = this;
			if (steps === undefined) {steps=10}
			return (self.GuessDPI() / 96.0);
		},
		/**
		  * Does a media query and returns True if it matches
		  * See: http://dev.w3.org/csswg/cssom-view/#the-mediaquerylist-interface
		  * 
		*/
		Query: function( query ){
			var self = this;
			if (extend.isDefined(window.matchMedia)) {
				return window.matchMedia(query).matches;
			} else {
				return false;
			}
		},
		OnOrientationChange: function( event ){
			var self = this;
			// Iterates over `__module__.Device.Callbacks.orientation`. This works on array,objects and null/undefined
			var __il=__module__.Device.Callbacks.orientation;
			var __jl=__il instanceof Array ? __il : Object.getOwnPropertyNames(__il||{});
			var __ll=__jl.length;
			for (var __kl=0;__kl<__ll;__kl++){
				var __hk=(__jl===__il)?__kl:__jl[__kl];
				var c=__il[__hk];
				// This is the body of the iteration with (value=c, key/index=__hk) in __il
				c(event);
			}
		},
		IsMobile: function(  ){
			var self = this;
			return self.Query("handheld");
		}
	}
})
/**
  * A gesture abstracts a sequence of interaction originating from one or
  * more devices. Gestures are a little bit more trickly than devices, as
  * they can be instanciated and configured with different options, and
  * then bound to one or more elements.
  * 
  * As a result, gestures all provide a default, lazily created gesture with
  * default options, that is usable through the `Handlers` class or `handle()` function
  * just like a regular input device. If you would like
  * to have specific options, you can directly instanciate a gesture
  * and bind it handlers.
  * 
  * For example, you can use the `drag` gesture in different ways:
  * 
  * ```sugar
  * # By using the `handle` method (identical to `new Handler {}`)
  * interaction handle {
  * drag : {
  * start : {event,gesture| ... }
  * drag  : {event,gesture| ... }
  * end   : {event,gesture| ... }
  * }
  * } h bind (element)
  * 
  * # By instanciating and binding to a gesture
  * new interaction Gesture (options) g bind (element, {
  * start : {event,gesture| ... }
  * drag  : {event,gesture| ... }
  * end   : {event,gesture| ... }
  * })
  * ```
  * 
*/
interaction.Gesture = extend.Class({
	name  :'interaction.Gesture',
	parent: __module__.Source,
	shared: {
		COUNT: 0,
		/**
		  * The name of the property in the bound node's context in which
		  * this gesture's handlers will be stored.
		  * 
		*/
		HANDLERS_KEY: null,
		/**
		  * The context key is where interaction contexts are stored
		  * 
		*/
		CONTEXT_KEY: "_interactionContexts",
		STATES: {"bound":"bound"},
		Instance: undefined,
		INITIAL_STATE: "bound",
		OPTIONS: {}
	},
	properties: {
		id:undefined,
		options:undefined,
		handler:undefined,
		defaultHandlers:undefined,
		_isEnabled:undefined
	},
	initialize: function( options ){
		var self = this;
		// Default initialization of property `id`
		if (typeof(self.id)=='undefined') {self.id = -1;};
		// Default initialization of property `options`
		if (typeof(self.options)=='undefined') {self.options = {};};
		// Default initialization of property `handler`
		if (typeof(self.handler)=='undefined') {self.handler = null;};
		// Default initialization of property `defaultHandlers`
		if (typeof(self.defaultHandlers)=='undefined') {self.defaultHandlers = null;};
		// Default initialization of property `_isEnabled`
		if (typeof(self._isEnabled)=='undefined') {self._isEnabled = true;};
		if (!self.getClass().HANDLERS_KEY) {
			self.getClass().HANDLERS_KEY = (self.getClass().NAME + "Handlers");
		}
		self.id = __module__.Gesture.COUNT;
		__module__.Gesture.COUNT = (__module__.Gesture.COUNT + 1);
		// Iterates over `self.getClass().OPTIONS`. This works on array,objects and null/undefined
		var __ml=self.getClass().OPTIONS;
		var __ol=__ml instanceof Array ? __ml : Object.getOwnPropertyNames(__ml||{});
		var __pl=__ol.length;
		for (var __nl=0;__nl<__pl;__nl++){
			var k=(__ol===__ml)?__nl:__ol[__nl];
			var v=__ml[k];
			// This is the body of the iteration with (value=v, key/index=k) in __ml
			if (!extend.isDefined(self.options[k])) {
				self.options[k] = v;
			};
		}
		// Iterates over `options`. This works on array,objects and null/undefined
		var __ql=options;
		var __rl=__ql instanceof Array ? __ql : Object.getOwnPropertyNames(__ql||{});
		var __tl=__rl.length;
		for (var __sl=0;__sl<__tl;__sl++){
			var k=(__rl===__ql)?__sl:__rl[__sl];
			var v=__ql[k];
			// This is the body of the iteration with (value=v, key/index=k) in __ql
			self.options[k] = v;
		}
		self.getSuper(__module__.Gesture.getParent())();
	},
	methods: {
		/**
		  * Tells if the given gesture is globally enabled, or enabled for the
		  * given target.
		  * 
		*/
		isEnabled: function(eventOrNode) {
			var self = this;
			if (eventOrNode === undefined) {eventOrNode=null}
			if (!eventOrNode) {
				return self._isEnabled;
			} else {
				if (!extend.isDefined(eventOrNode.nodeName)) {
					eventOrNode = eventOrNode.target;
				}
				var c = self.getContext(self.findContextElement(eventOrNode));
				if ((self._isEnabled && c) && (c.isEnabled != false)) {
					return true;
				} else {
					return false;
				}
			}
		},
		
		enable: function(node) {
			var self = this;
			if (node === undefined) {node=null}
			if (node) {
				self.set(self.findContextElement(node), "isEnabled", true);
			} else {
				self._isEnabled = true;
			}
		},
		
		disable: function(node) {
			var self = this;
			if (node) {
				self.set(self.findContextElement(node), "isEnabled", false);
			} else {
				self._isEnabled = false;
			}
		},
		
		/**
		  * Sets the hanlders that will be used by default when binding a node
		  * to this gesture.
		  * 
		*/
		setHandlers: function(handlers) {
			var self = this;
			self.defaultHandlers = handlers;
			return self;
		},
		
		/**
		  * Binds the given handlers to the gestures' events generated from the
		  * given element. This will set the `gesture=id`, `state=INITIAL_STATE`
		  * and `<NAME>Handlers=handlers` properties in the element's context
		  * and call the `_bind()` method for further configuration.
		  * 
		*/
		bind: function(element, handlers) {
			var self = this;
			if (handlers === undefined) {handlers=self.defaultHandlers}
			if (__module__.isSelection(element)) {
				!((extend.len(element) > 0)) && extend.assert(false, "interaction.Gesture.bind:", ((self.getClass().getName() + ".bind: Empty selection ") + element.selector), "(failed `(extend.len(element) > 0)`)");
				// Iterates over `element`. This works on array,objects and null/undefined
				var __vl=element;
				var __wl=__vl instanceof Array ? __vl : Object.getOwnPropertyNames(__vl||{});
				var __yl=__wl.length;
				for (var __xl=0;__xl<__yl;__xl++){
					var __ul=(__wl===__vl)?__xl:__wl[__xl];
					var _=__vl[__ul];
					// This is the body of the iteration with (value=_, key/index=__ul) in __vl
					self.bind(_, handlers);
				}
			} else {
				if (__module__.Handler.hasInstance(handlers)) {
					handlers = handlers.on[self.getClass().NAME];
				}
				var context = extend.merge(self.get(element), extend.createMapFromItems(["gesture",self.id],["state",self.getClass().INITIAL_STATE],[self.getClass().HANDLERS_KEY,{}]));
				context[self.getClass().HANDLERS_KEY] = __module__.Handler.Merge(context[self.getClass().HANDLERS_KEY], handlers);
				self.set(element, context);
				if (self.handler) {
					self.handler.bind(element);
				}
				self._bind(element, handlers);
			}
			return self;
		},
		
		/**
		  * Clears the context for the given element and calls `_unbind()`.
		  * 
		*/
		unbind: function(element) {
			var self = this;
			self.clear(element);
			if (self.handler) {
				self.handler.unbind(element);
			}
			self._unbind(element);
		},
		
		_bind: function(element, handlers) {
			var self = this;
		},
		
		_unbind: function(element) {
			var self = this;
		},
		
		/**
		  * Sets the given values (or key/value pair) in the gesture's context
		  * bound to the given element.
		  * 
		  * You can use it the following ways
		  * 
		  * ```
		  * g set (element, "key", 1.0)              # key/value
		  * g set (element, {key:1.0, key2:"hello"}) # map
		  * ```
		  * 
		  * The gesture's context for the element will be returned in both cases.
		  * 
		*/
		set: function(element, values, value) {
			var self = this;
			if (value === undefined) {value=undefined}
			var context = self.getContext(element);
			if (extend.isString(values)) {
				context[values] = value;
			} else {
				// Iterates over `values`. This works on array,objects and null/undefined
				var __zl=values;
				var __al=__zl instanceof Array ? __zl : Object.getOwnPropertyNames(__zl||{});
				var __cl=__al.length;
				for (var __bl=0;__bl<__cl;__bl++){
					var k=(__al===__zl)?__bl:__al[__bl];
					var v=__zl[k];
					// This is the body of the iteration with (value=v, key/index=k) in __zl
					context[k] = v;
				}
			}
			return context;
		},
		
		/**
		  * Sets the given values from the gesture's context
		  * bound to the given element.
		  * 
		  * You can use it the following ways
		  * 
		  * ```
		  * g get (element, "key")                   # returns the value bound to key
		  * g set (element, ["key", "key1"]          # returns the values bound to the keys as a map
		  * g set ()                                 # returns the whole context
		  * ```
		  * 
		  * The gesture's context for the element will be returned in both cases.
		  * 
		*/
		get: function(element, value, _LF_default) {
			var self = this;
			if (_LF_default === undefined) {_LF_default=undefined}
			var context = self.getContext(element);
			if (!context) {
				return null;
			} else if (extend.isString(value)) {
				if (extend.isDefined(context[value])) {
					return context[value];
				} else {
					return _LF_default;
				}
			} else if (!extend.isDefined(value)) {
				return context;
			} else {
				extend.error("Not implemented");
			}
		},
		
		getHandlers: function(element) {
			var self = this;
			return self.get(element, self.getClass().HANDLERS_KEY);
		},
		
		/**
		  * Clears the gesture's context bound to the given element
		  * 
		*/
		clear: function(element) {
			var self = this;
			if (!element) {
				return null;
			}
			element = __module__.asNode(element);
			!(element.nodeName) && extend.assert(false, "interaction.Gesture.clear:", "Gesture.clear: Needs a DOM or SVG element", "(failed `element.nodeName`)");
			var context = element[self.getClass().CONTEXT_KEY];
			if (context) {
				context[self.getContextID()] = undefined;
			}
			return element;
		},
		
		/**
		  * Get the gesture's context bound to the given element
		  * 
		*/
		getContext: function(element) {
			var self = this;
			if (!element) {
				return null;
			}
			element = __module__.asNode(element);
			!(element.nodeName) && extend.assert(false, "interaction.Gesture.getContext:", "Gesture.getContext: Needs a DOM or SVG element", "(failed `element.nodeName`)");
			var context = element[self.getClass().CONTEXT_KEY];
			if (!context) {
				context = {};
				element[self.getClass().CONTEXT_KEY] = context;
			}
			var cid = self.getContextID();
			if (!context[cid]) {
				context[cid] = {};
			}
			return context[cid];
		},
		
		hasContext: function(element) {
			var self = this;
			return ((element && extend.isDefined(element[self.getClass().CONTEXT_KEY])) && extend.isDefined(element[self.getClass().CONTEXT_KEY][self.getContextID()]));
		},
		
		/**
		  * Finds the context element for this object in the current element or one
		  * of its parents.
		  * 
		*/
		findContextElement: function(element) {
			var self = this;
			if (element) {
				if (self.hasContext(element)) {
					return element;
				} else {
					return self.findContextElement(element.parentNode);
				}
			} else {
				return null;
			}
		},
		
		getContextNodes: function(elements) {
			var self = this;
			return extend.map(elements, function(_) {
				return self.findContextElement(_);
			});
		},
		
		/**
		  * Get the instance-specific id used to retrieve this gesture's context
		  * in elements.
		  * 
		*/
		getContextID: function() {
			var self = this;
			return ((self.getClass().getName() + ":") + self.id);
		},
		
		/**
		  * Same as `targetWithContext` except that it takes a list of touches. This
		  * method is useful for touch gesture handlers.
		  * 
		  * ```sugar
		  * # Returns all the touches that started within and element (or its
		  * # descendents) to which the gesture was bound.
		  * var active_touches = touchesWithContext (event touches)
		  * ```
		  * 
		*/
		touchesWithContext: function(touches) {
			var self = this;
			return extend.filter(touches, function(_) {
				return (self.findContextElement(_.target) != null);
			});
		},
		
		/**
		  * Filters the given list of targets, returning only the ones that have (
		  * or have a parent that has) a context defined for the current gesture.
		  * 
		*/
		targetsWithContext: function(targets) {
			var self = this;
			return extend.filter(targets, function(_) {
				return (self.findContextElement(_) != null);
			});
		},
		
		/**
		  * Filters the given list of targets, returning those who have or have
		  * a context element that has the given property with the given value.
		  * 
		*/
		targetsWithProperty: function(targets, name, value) {
			var self = this;
			return extend.filter(targets, function(_) {
				return (self.get(self.findContextElement(_), name) == value);
			});
		},
		
		/**
		  * Finds the first target that has (or has a context element) that
		  * defines the given propery and value
		  * 
		*/
		targetWithProperty: function(targets, name, value) {
			var self = this;
			return extend.first(targets, function(_) {
				return (self.get(self.findContextElement(_), name) == value);
			});
		}
	},
	operations:{
		/**
		  * Binds the gesture from the given scope
		  * 
		*/
		_Unbind: function( element ){
			var self = this;
			self.Ensure().unbind(element);
		},
		/**
		  * Returns the default instance for this gesture, lazily creating it.
		  * 
		*/
		Ensure: function(  ){
			var self = this;
			if (!self.Instance) {
				self.Instance = new self();
			}
			return self.Instance;
		},
		/**
		  * Binds the given handler to the given element
		  * 
		*/
		_Bind: function( element, handler, capture ){
			var self = this;
			if (capture === undefined) {capture=true}
			self.Ensure().bind(element, handler, capture);
		}
	}
})
/**
  * Drag events will yield `Event` instances, with the following extra
  * properties:
  * 
  * - `dragged`: the element being dragged
  * - `context`: the gesture's interaction context (useful for debugging)
  * 
*/
interaction.Drag = extend.Class({
	name  :'interaction.Drag',
	parent: __module__.Gesture,
	shared: {
		DRAG_INITIATED: "initiated",
		NAME: "drag",
		EVENTS: {"start":true, "drag":true, "end":true},
		DRAG_BOUND: "bound",
		DRAG_ENDED: "ended",
		DRAG_STARTED: "started",
		OPTIONS: {"touch":true, "mouse":true, "threshold":5, "endOnWindowExit":true, "mouseOutDelay":1000, "mouseButton":0}
	},
	properties: {
		handler:undefined,
		dragHandler:undefined,
		lastMouseOut:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `handler`
		if (typeof(self.handler)=='undefined') {self.handler = interaction.handle({"mouse":{"down":self.getMethod('onMouseDown') }, "touch":{"start":self.getMethod('onTouchStart') , "move":self.getMethod('onTouchMove') , "cancel":self.getMethod('onTouchEnd') , "end":self.getMethod('onTouchEnd') }});};
		// Default value for property `dragHandler`
		if (typeof(self.dragHandler)=='undefined') {self.dragHandler = interaction.handle({"mouse":{"move":self.getMethod('onMouseMove') , "out":self.getMethod('onMouseOut') , "up":self.getMethod('onMouseUp') }});};
		// Default value for property `lastMouseOut`
		if (typeof(self.lastMouseOut)=='undefined') {self.lastMouseOut = undefined;};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Drag.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		/**
		  * Called when the dragging is initiated. This takes an interaction event
		  * as a parameter. The context is the interaction body.
		  * 
		*/
		_onInitiate: function(event, context, dragged) {
			var self = this;
			event.context = context;
			event.dragged = dragged;
			context.dragState = self.getClass().DRAG_INITIATED;
			context.dragElement = dragged;
			context.dragTarget = event.target;
			context.dragEvent = event;
			context.dragHandlers = self.get(dragged, self.getClass().HANDLERS_KEY);
		},
		
		/**
		  * Called when the dragging starts. This takes an interaction event
		  * as parameter. The context's `dragState` value will be updated.
		  * 
		*/
		_onStart: function(event, context) {
			var self = this;
			event.dragged = context.dragElement;
			context.dragState = self.getClass().DRAG_STARTED;
			interaction.trigger(context.dragHandlers, "start", event, self);
		},
		
		/**
		  * Called when dragging. This takes an interaction event
		  * as parameter. The context's `dragState` value will be updated.
		  * 
		*/
		_onDrag: function(event, context) {
			var self = this;
			event.context = context;
			event.dragged = event.context.dragElement;
			interaction.trigger(event.context.dragHandlers, "drag", event, self);
		},
		
		/**
		  * Called when the dragging ends. This takes an interaction event
		  * as parameter. The context's `dragState` value will be updated.
		  * 
		*/
		_onEnd: function(event, context) {
			var self = this;
			event.context = context;
			event.dragged = event.context.dragElement;
			event.context.dragState = self.getClass().DRAG_ENDED;
			interaction.trigger(event.context.dragHandlers, "end", event, self);
		},
		
		onMouseDown: function(event) {
			var self = this;
			if (!self.options.mouse) {
				return true;
			}
			if (event.button != self.options.mouseButton) {
				return true;
			}
			var context = self.get(document.body);
			var device_id = __module__.Event.GetDeviceID(event);
			var dragged_element = self.findContextElement(event.target);
			if (!extend.isDefined(context[device_id])) {
				context[device_id] = {};
			}
			self.dragHandler.bind(document);
			self._onInitiate(__module__.Event.FromMouse(event, true), context[device_id], dragged_element);
		},
		
		onMouseMove: function(event) {
			var self = this;
			if (!self.options.mouse) {
				return true;
			}
			if (event.button != self.options.mouseButton) {
				return true;
			}
			var context = self.get(document.body)[__module__.Event.GetDeviceID(event)];
			var state = (context.dragState || self.getClass().DRAG_INITIATED);
			var e = context.dragEvent.copyMouseEvent(event);
			if (state == self.getClass().DRAG_INITIATED) {
				if (e.distance > self.options.threshold) {
					self._onStart(e, context);
				}
			} else if (state == self.getClass().DRAG_STARTED) {
				if (event.buttons == 0) {
					self.onMouseUp(event);
				} else {
					self._onDrag(e, context);
				}
			}
		},
		
		onMouseUp: function(event) {
			var self = this;
			if (!self.options.mouse) {
				return true;
			}
			if (event.button != self.options.mouseButton) {
				return true;
			}
			var context = self.get(document.body)[__module__.Event.GetDeviceID(event)];
			var state = (context.dragState || self.getClass().DRAG_INITIATED);
			var e = context.dragEvent.copyMouseEvent(event);
			if (state == self.getClass().DRAG_STARTED) {
				self._onEnd(e, context);
			}
			context.dragState = self.getClass().DRAG_ENDED;
			self.dragHandler.unbind(document);
		},
		
		/**
		  * Intercepts the mouse out event. Will tolerate the mouse out of the
		  * window for `options.mouseOutDelay` milliseconds, and then will
		  * end the drag.
		  * 
		*/
		onMouseOut: function(event) {
			var self = this;
			if (!self.options.mouse) {
				return true;
			}
			var source = (event.relatedTarget || event.toElement);
			if (!self.options.endOnWindowExit) {
				return true;
			} else if (!(source || (source && (source.nodeName == "HTML")))) {
				var now = new Date().getTime();
				if (!extend.isDefined(self.lastMouseOut)) {
					self.lastMouseOut = now;
				} else if ((now - self.lastMouseOut) > self.options.mouseOutDelay) {
					return self.onMouseUp(event);
				}
			} else {
				self.lastMouseOut = undefined;
			}
		},
		
		onTouchStart: function(event) {
			var self = this;
			if (!self.options.touch) {
				return true;
			}
			var changed = self.touchesWithContext(event.changedTouches);
			// Iterates over `changed`. This works on array,objects and null/undefined
			var __el=changed;
			var __fl=__el instanceof Array ? __el : Object.getOwnPropertyNames(__el||{});
			var __hl=__fl.length;
			for (var __gl=0;__gl<__hl;__gl++){
				var __dl=(__fl===__el)?__gl:__fl[__gl];
				var touch=__el[__dl];
				// This is the body of the iteration with (value=touch, key/index=__dl) in __el
				var dragged_element = self.findContextElement(touch.target);;
				var device_id = ("touch:" + touch.identifier);;
				var context = self.get(document.body);;
				var e = __module__.Event.FromTouch(event, touch, true);;
				if (!extend.isDefined(context[device_id])) {
					context[device_id] = {};
				};
				self._onInitiate(e, context[device_id], dragged_element);
			}
			return (changed.length == 0);
		},
		
		onTouchMove: function(event) {
			var self = this;
			if (!self.options.touch) {
				return true;
			}
			var changed = self.touchesWithContext(event.changedTouches);
			var count = 0;
			// Iterates over `changed`. This works on array,objects and null/undefined
			var __jm=changed;
			var __km=__jm instanceof Array ? __jm : Object.getOwnPropertyNames(__jm||{});
			var __mm=__km.length;
			for (var __lm=0;__lm<__mm;__lm++){
				var __im=(__km===__jm)?__lm:__km[__lm];
				var touch=__jm[__im];
				// This is the body of the iteration with (value=touch, key/index=__im) in __jm
				var device_id = ("touch:" + touch.identifier);;
				var context = self.get(document.body)[device_id];;
				var state = (context.dragState || self.getClass().DRAG_INITIATED);;
				var e = context.dragEvent.copyTouchEvent(event, touch);;
				if (state == self.getClass().DRAG_INITIATED) {
					if (e.distance > self.options.threshold) {
						self._onStart(e, context);
					}
				} else if (state == self.getClass().DRAG_STARTED) {
					self._onDrag(e, context);
				};
				count = (count + 1);
			}
			if (count > 0) {
				event.preventDefault();
				return false;
			} else {
				return true;
			}
		},
		
		onTouchEnd: function(event) {
			var self = this;
			if (!self.options.touch) {
				return true;
			}
			var changed = self.touchesWithContext(event.changedTouches);
			var count = 0;
			// Iterates over `changed`. This works on array,objects and null/undefined
			var __nm=changed;
			var __pm=__nm instanceof Array ? __nm : Object.getOwnPropertyNames(__nm||{});
			var __rm=__pm.length;
			for (var __qm=0;__qm<__rm;__qm++){
				var __om=(__pm===__nm)?__qm:__pm[__qm];
				var touch=__nm[__om];
				// This is the body of the iteration with (value=touch, key/index=__om) in __nm
				var device_id = ("touch:" + touch.identifier);;
				var context = self.get(document.body)[device_id];;
				var state = context.dragState;;
				var e = context.dragEvent.copyTouchEvent(event, touch);;
				if (state == self.getClass().DRAG_STARTED) {
					self._onEnd(e, context);
				};
				context.dragState = self.getClass().DRAG_ENDED;
				count = (count + 1);
			}
			if (count > 0) {
				event.preventDefault();
				return false;
			} else {
				return true;
			}
		}
	}
})

interaction.Tap = extend.Class({
	name  :'interaction.Tap',
	parent: __module__.Gesture,
	shared: {
		NAME: "tap",
		TAP_ENDED: "ended",
		TAP_BOUND: "bound",
		TAP_INITIATED: "initiated",
		TAP_CANCELLED: "cancelled",
		EVENTS: {"start":true, "tap":true, "end":true},
		OPTIONS: {"count":1, "tolerance":10},
		TAP_REACHED: "reached"
	},
	properties: {
		tapHandler:undefined
	},
	initialize: function( options ){
		var self = this;
		// Default initialization of property `tapHandler`
		if (typeof(self.tapHandler)=='undefined') {self.tapHandler = null;};
		self.getSuper(__module__.Tap.getParent())(options);
		self.tapHandler = interaction.handle({"touch":{"start":self.getMethod('onTouchStart') , "cancel":self.getMethod('onTouchEnd') , "end":self.getMethod('onTouchEnd') }});
	},
	methods: {
		_bind: function(element, handlers) {
			var self = this;
			if (handlers === undefined) {handlers=self.getHandlers();}
			self.tapHandler.bind(element);
		},
		
		_unbind: function(element) {
			var self = this;
			self.tapHandler.unbind(element);
		},
		
		onTouchStart: function(event) {
			var self = this;
			var t = self.targetWithProperty(self.getContextNodes(__module__.Touch.GetChangedTargets(event)), "gesture", self.id);
			if (!t) {
				return null;
			}
			var state = self.get(t, "state");
			var handlers = self.get(t, self.getClass().HANDLERS_KEY);
			var count = self._countTouches(event.touches, self.getClass().HANDLERS_KEY, handlers);
			var result = true;
			var origins = (self.get(t, "touchOrigins") || {});
			// Iterates over `event.changedTouches`. This works on array,objects and null/undefined
			var __tm=event.changedTouches;
			var __um=__tm instanceof Array ? __tm : Object.getOwnPropertyNames(__tm||{});
			var __wm=__um.length;
			for (var __vm=0;__vm<__wm;__vm++){
				var __sm=(__um===__tm)?__vm:__um[__vm];
				var touch=__tm[__sm];
				// This is the body of the iteration with (value=touch, key/index=__sm) in __tm
				origins[touch.identifier] = [touch.clientX, touch.clientY];
			}
			self.set(t, "touchOrigins", origins);
			if (count >= self.options.count) {
				if (state != self.getClass().TAP_REACHED) {
					self.set(t, "state", self.getClass().TAP_REACHED);
					self._trigger(handlers, "start", event);
				}
			} else {
				self.set(t, "state", self.getClass().TAP_INITIATED);
			}
			return result;
		},
		
		onTouchEnd: function(event) {
			var self = this;
			var t = self.targetWithProperty(self.getContextNodes(__module__.Touch.GetChangedTargets(event)), "gesture", self.id);
			if (!t) {
				return null;
			}
			var state = self.get(t, "state");
			var handlers = self.get(t, self.getClass().HANDLERS_KEY);
			var count = self._countTouches(event.touches, self.getClass().HANDLERS_KEY, handlers);
			var result = true;
			var origins = (self.get(t, "touchOrigins") || {});
			var delta = self._getDelta(self.get(t, "touchOrigins"), event.changedTouches);
			if (count < self.options.count) {
				if (state == self.getClass().TAP_REACHED) {
					if (delta < (self.options.threshold || 5)) {
						event.preventDefault();
						self._trigger(handlers, "tap", event);
						self.set(t, "state", self.getClass().TAP_ENDED);
						result = false;
					} else {
						self.set(t, "state", self.getClass().TAP_CANCELLED);
					}
				}
				if (count > 0) {
					self.set(t, "state", self.getClass().TAP_INITIATED);
				} else if (count == 0) {
					self._trigger(handlers, "end", event);
					self.set(t, "state", self.getClass().TAP_BOUND);
				}
			}
			return result;
		},
		
		_getDelta: function(origins, touches) {
			var self = this;
			var d = 0;
			// Iterates over `touches`. This works on array,objects and null/undefined
			var __ym=touches;
			var __zm=__ym instanceof Array ? __ym : Object.getOwnPropertyNames(__ym||{});
			var __bm=__zm.length;
			for (var __am=0;__am<__bm;__am++){
				var __xm=(__zm===__ym)?__am:__zm[__am];
				var t=__ym[__xm];
				// This is the body of the iteration with (value=t, key/index=__xm) in __ym
				var o = origins[t.identifier];;
				var d_x = (o[0] - t.clientX);;
				var d_y = (o[1] - t.clientY);;
				d = Math.max(d, Math.sqrt(((d_x * d_x) + (d_y * d_y))));
			}
			return d;
		},
		
		/**
		  * Counts the touches that have a target which is within the scope of an element to
		  * which this gesture is bound.
		  * 
		*/
		_countTouches: function(touches, name, value) {
			var self = this;
			if (name === undefined) {name="tapHandler"}
			if (value === undefined) {value=self.id}
			var targets = extend.map(touches, function(_) {
				return _.target;
			});
			targets = self.targetsWithProperty(self.getContextNodes(targets), name, value);
			return extend.len(targets);
		},
		
		_trigger: function(handlers, name, event) {
			var self = this;
			interaction.trigger(handlers, name, event, self);
			return self;
		}
	}
})
/**
  * Press extends tap with mouse click support.
  * 
*/
interaction.Press = extend.Class({
	name  :'interaction.Press',
	parent: __module__.Tap,
	shared: {
		NAME: "press",
		EVENTS: {"press":true}
	},
	properties: {
		clickHandler:undefined
	},
	initialize: function( options ){
		var self = this;
		// Default initialization of property `clickHandler`
		if (typeof(self.clickHandler)=='undefined') {self.clickHandler = null;};
		self.getSuper(__module__.Press.getParent())(options);
		self.clickHandler = interaction.handle({"mouse":{"click":self.getMethod('onMouseClick') }});
	},
	methods: {
		_bind: function(element, handlers) {
			var self = this;
			if (handlers === undefined) {handlers=self.getHandlers();}
			self.getSuper(__module__.Press.getParent())._bind(element, handlers);
			self.clickHandler.bind(element);
		},
		
		_unbind: function(element) {
			var self = this;
			self.getSuper(__module__.Press.getParent())._unbind(element);
			self.clickHandler.unbind(element);
		},
		
		onMouseClick: function(event) {
			var self = this;
			var t = self.targetWithProperty(self.getContextNodes([event.target]), "gesture", self.id);
			var handlers = self.get(t, self.getClass().HANDLERS_KEY);
			self._trigger(handlers, "press", event);
		},
		
		_trigger: function(handlers, name, event) {
			var self = this;
			if ((name == "tap") || (name == "press")) {
				return self.getSuper(__module__.Press.getParent())._trigger(handlers, "press", event);
			} else {
				return self;
			}
		}
	}
})

interaction.Swipe = extend.Class({
	name  :'interaction.Swipe',
	parent: __module__.Gesture,
	shared: {
		SWIPE_ENDED: "ended",
		SWIPE_INITIATED: "initiated",
		SWIPE_BOUND: "bound",
		NAME: "swipe",
		EVENTS: {"start":true, "move":true, "end":true}
	},
	properties: {
		handler:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `handler`
		if (typeof(self.handler)=='undefined') {self.handler = interaction.handle({"touch":{"start":self.getMethod('onTouchStart') , "move":self.getMethod('onTouchMove') , "cancel":self.getMethod('onTouchEnd') , "end":self.getMethod('onTouchEnd') }});};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Swipe.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		onTouchStart: function(event) {
			var self = this;
			if (!self.isEnabled(event.changedTouches[0].target)) {
				return true;
			}
			var c = self._extractContext(event);
			if (c.changedCount > 0) {
				if ((c.state == self.getClass().SWIPE_BOUND) && (c.activeCount >= 1)) {
					event.preventDefault();
					c.state = self.getClass().SWIPE_INITIATED;
					if (!c.event) {
						c.event = __module__.Event.Get();
					} else {
						c.event = c.event.reset();
					}
					c.event.copyTouchEvent(event, c.touch, true);
					__module__.trigger(c[self.getClass().HANDLERS_KEY], "start", c.event);
					return false;
				}
			}
		},
		
		onTouchMove: function(event) {
			var self = this;
			if (!self.isEnabled(event.changedTouches[0].target)) {
				return true;
			}
			var c = self._extractContext(event);
			if (c.changedCount > 0) {
				if ((c.state == self.getClass().SWIPE_INITIATED) && (c.activeCount >= 1)) {
					event.preventDefault();
					c.event.copyTouchEvent(event, c.touch, false);
					__module__.trigger(c[self.getClass().HANDLERS_KEY], "move", c.event);
					return false;
				}
			}
		},
		
		onTouchEnd: function(event) {
			var self = this;
			if (!self.isEnabled(event.changedTouches[0].target)) {
				return true;
			}
			var c = self._extractContext(event);
			if (c.changedCount > 0) {
				if ((c.state == self.getClass().SWIPE_INITIATED) && (c.activeCount == 0)) {
					c.state = self.getClass().SWIPE_ENDED;
					c.event.copyTouchEvent(event, c.touch, false);
					__module__.trigger(c[self.getClass().HANDLERS_KEY], "end", c.event);
					c.state = self.getClass().SWIPE_BOUND;
				}
			}
		},
		
		_extractContext: function(event) {
			var self = this;
			var changed_touches = self.touchesWithContext(event.changedTouches);
			var active_touches = self.touchesWithContext(event.touches);
			var t = self.findContextElement(changed_touches[0].target);
			var c = self.get(t);
			c.touch = changed_touches[0];
			c.target = t;
			c.changedCount = extend.len(changed_touches);
			c.activeCount = extend.len(active_touches);
			c.changed = changed_touches;
			c.active = active_touches;
			return c;
		}
	}
})
/**
  * A shorthand to `new Handler(...)`
  * 
*/
interaction.handle = function(callbacks){
	var self = interaction;
	return new __module__.Handler(callbacks);
}
/**
  * A utility function that triggers the callbacks for the given event.
  * 
*/
interaction.trigger = function(callbacks, name, event, source){
	var self = interaction;
	if (!callbacks) {
		return false;
	}
	var v = callbacks[name];
	var res = undefined;
	if (extend.isFunction(v)) {
		res = v(event, source);
	} else {
		// Iterates over `v`. This works on array,objects and null/undefined
		var __dm=v;
		var __em=__dm instanceof Array ? __dm : Object.getOwnPropertyNames(__dm||{});
		var __gm=__em.length;
		for (var __fm=0;__fm<__gm;__fm++){
			var __cm=(__em===__dm)?__fm:__em[__fm];
			var _=__dm[__cm];
			// This is the body of the iteration with (value=_, key/index=__cm) in __dm
			try {
				res = _(event, source)
			} catch(e) {
				res = undefined
				extend.exception(e, (("interaction.trigger(" + name) + ")"))
			};
			if (res === false) {
				if (source && source.cancel) {
					source.cancel(event);
				}
				break
			};
		}
	}
	return res;
}
interaction.cancel = function(event){
	var self = interaction;
	__module__.Device.Cancel(event);
	return false;
}
/**
  * An alias to Event TargetWithClass
  * 
*/
interaction.target = function(event, withClass, limit){
	var self = interaction;
	if (limit === undefined) {limit=undefined}
	return __module__.Event.TargetWithClass(event, withClass, limit);
}
interaction.init = function(){
	var self = interaction;
	// Iterates over `extend.getChildrenOf(__module__.Source)`. This works on array,objects and null/undefined
	var __io=extend.getChildrenOf(__module__.Source);
	var __jo=__io instanceof Array ? __io : Object.getOwnPropertyNames(__io||{});
	var __lo=__jo.length;
	for (var __ko=0;__ko<__lo;__ko++){
		var __hm=(__jo===__io)?__ko:__jo[__ko];
		var _=__io[__hm];
		// This is the body of the iteration with (value=_, key/index=__hm) in __io
		_.Init();
	}
}
if (typeof(interaction.init)!="undefined") {interaction.init();}

// START:VANILLA_POSTAMBLE
return interaction;})(interaction);
// END:VANILLA_POSTAMBLE
