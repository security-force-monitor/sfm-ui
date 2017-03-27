// 8< ---[animation.js]---
// START:VANILLA_PREAMBLE
var animation=typeof(extend)!='undefined' ? extend.module('animation') : (typeof(animation)!='undefined' ? animation : {});
(function(animation){
var __module__=animation;
// END:VANILLA_PREAMBLE

animation.__VERSION__='1.6.2';
animation.LICENSE = "http://ffctn.com/doc/licenses/bsd";
animation.$ = (((typeof(jQuery) != "undefined") && jQuery) || extend.modules.select);
animation.UNITS = {"p":1.0};
animation.parseValue = function(value, includeType){
	var self = animation;
	if (includeType === undefined) {includeType=false}
	var res = null;
	var type = null;
	if (extend.isNumber(value)) {
		res = value;
	} else if (extend.access(value,-1) == "%") {
		res = parseFloat(extend.slice(value,0,-1));
		type = "%";
	} else if ((extend.access(value,-2) == "e") && (extend.access(value,-1) == "m")) {
		res = parseFloat(extend.slice(value,0,-2));
		type = "em";
	} else if ((extend.access(value,-2) == "p") && (extend.access(value,-1) == "x")) {
		res = parseFloat(extend.slice(value,0,-2));
		type = "px";
	} else if (extend.access(value,-1) == "p") {
		res = parseFloat(extend.slice(value,0,-1));
		type = "p";
	} else {
		res = parseFloat(value);
		type = "px";
	}
	if (includeType) {
		return [res, type];
	} else {
		return res;
	}
}
/**
  * Formats the given value using the given unit.
  * 
*/
animation.toUnit = function(value, unit){
	var self = animation;
	if (unit === undefined) {unit=undefined}
	if (!(unit || (unit == "px"))) {
		return value;
	} else if (extend.isDefined(__module__.UNITS[unit])) {
		return (value * __module__.UNITS[unit]);
	} else {
		return (("" + value) + (unit || ""));
	}
}
animation.parseTime = function(time, timeOffset){
	var self = animation;
	if (timeOffset === undefined) {timeOffset=0}
	if (extend.isNumber(time)) {
		return time;
	} else {
		if (time[0] == "+") {
			return (timeOffset + __module__.parseTime(extend.slice(time,1,undefined)));
		} else if ((extend.access(time,-2) == "m") && (extend.access(time,-1) == "s")) {
			return parseFloat(extend.slice(time,0,-2));
		} else if (extend.access(time,-1) == "s") {
			return (parseFloat(extend.slice(time,0,-1)) * 1000);
		} else if (extend.access(time,-1) == "m") {
			return ((parseFloat(extend.slice(time,0,-1)) * 1000) * 60);
		} else {
			return parseFloat(time);
		}
	}
}
/**
  * A shorthand for `parseTime`
  * 
*/
animation.time = function(value){
	var self = animation;
	return __module__.parseTime(value);
}
/**
  * Returns `now` in milliseconds. The origin of the milliseconds can vary.
  * 
*/
animation.now = function(){
	var self = animation;
	if (window.performance && window.performance.now) {
		return window.performance.now();
	} else {
		return new Date().getTime();
	}
}
animation.nowInSeconds = function(){
	var self = animation;
	return (__module__.now() / 1000);
}
/**
  * This will trigger the given callback on next frame.
  * 
*/
animation.onNextFrame = function(callback){
	var self = animation;
	if (extend.isDefined(window.requestAnimationFrame)) {
		window.requestAnimationFrame(callback);
	} else if (extend.isDefined(window.webkitRequestAnimationFrame)) {
		window.webkitRequestAnimationFrame(callback);
	} else if (extend.isDefined(window.mozRequestAnimationFrame)) {
		window.mozRequestAnimationFrame(callback);
	} else if (extend.isDefined(window.oRequestAnimationFrame)) {
		window.oRequestAnimationFrame(callback);
	} else if (extend.isDefined(window.msRequestAnimationFrame)) {
		window.msRequestAnimationFrame(callback);
	} else {
		setTimeout(callback, 17);
	}
}
/**
  * Returns a timer that will execute in delay milliseconds.
  * 
*/
animation.after = function(delay, callback){
	var self = animation;
	if (callback === undefined) {callback=null}
	if (!callback) {
		__module__.onNextFrame(delay);
	} else {
		return __module__.Timers.Get().delayed(callback, delay);
	}
}
/**
  * Returns a timer that wil execute every period milieseconds
  * 
*/
animation.every = function(period, callback, count){
	var self = animation;
	if (count === undefined) {count=-1}
	return __module__.Timers.Get().periodic(callback, period, count);
}
/**
  * Returns a timer that wil execute every period miliseconds
  * 
*/
animation.iterate = function(items, delay, callback){
	var self = animation;
	var c = function(timer) {
		return callback(items[timer.iteration], timer.iteration);
	};
	return __module__.Timers.Get().periodic(c, delay, extend.len(items));
}
/**
  * A simple  wrapper around the `Tween` class
  * 
*/
animation.tween = function(fromValue, toValue, duration){
	var self = animation;
	return new __module__.Tween().setSource(fromValue).to(toValue, duration).start();
}
/**
  * Convenience wrapper around `Sequence`
  * 
*/
animation.sequence = function(frames, uis){
	var self = animation;
	return new __module__.Sequence(frames, uis);
}
/**
  * Groups updates together and apply them at once so as to minimize layout
  * thrashing. You should not instantiate it directly, but rather
  * use `Updates.Get()` and then `update.add(...)` and finally `update.apply()`
  * 
*/
animation.Updates = extend.Class({
	name  :'animation.Updates',
	parent: undefined,
	shared: {
		PREFIX: null,
		STACK: [],
		PREFIXED: {"blur":true, "transform":true}
	},
	properties: {
		updates:undefined
	},
	initialize: function(  ){
		var self = this;
		// Default initialization of property `updates`
		if (typeof(self.updates)=='undefined') {self.updates = [];};
		self.EnsurePrefix();
	},
	methods: {
		add: function(ui, property, value, unit) {
			var self = this;
			if (unit === undefined) {unit=null}
			if (unit) {
				value = ((value + "") + unit);
			}
			if (extend.isNumber(value)) {
				value = (value + "px");
			}
			property = self.getClass().getOperation('StylePrefix')(property);
			if (ui.jquery) {
				// Iterates over `ui`. This works on array,objects and null/undefined
				var __j=ui;
				var __k=__j instanceof Array ? __j : Object.getOwnPropertyNames(__j||{});
				var __m=__k.length;
				for (var __l=0;__l<__m;__l++){
					var __i=(__k===__j)?__l:__k[__l];
					var _=__j[__i];
					// This is the body of the iteration with (value=_, key/index=__i) in __j
					self.add(_, property, value);
				}
			} else {
				self.updates.push([ui, property, value]);
			}
			return self;
		},
		
		apply: function() {
			var self = this;
			var recycle = (self.updates.length > 0);
			while ((self.updates.length > 0)) {
				var u = self.updates.pop();
				u[0].style[u[1]] = u[2];
			}
			if (recycle) {
				self.getClass().STACK.push(self);
			}
			return self;
		}
	},
	operations:{
		CSSPrefix: function( name ){
			var self = this;
			if (self.PREFIXED[name]) {
				return (self.PREFIX[0] + name);
			} else {
				return name;
			}
		},
		StylePrefix: function( name ){
			var self = this;
			if (self.PREFIXED[name]) {
				return (self.PREFIX[0] + name);
			} else {
				return name;
			}
		},
		EnsurePrefix: function(  ){
			var self = this;
			if ((!self.PREFIX) && window.useragent) {
				self.PREFIX = useragent.get().browser.prefixes;
			}
		},
		Get: function(  ){
			var self = this;
			if (extend.len(self.STACK) == 0) {
				return new __module__.Updates();
			} else {
				return self.STACK.pop();
			}
		}
	}
})
/**
  * Timers allows to store references to periodic and delayed callbacks.
  * It is basically a wrapper for
  * `window.setTimeout`, but it allows to aggregate all callbacks into one
  * object and cancel, pause, resume and restart them at once if necessary.
  * 
  * A typical use case for a timer would be to manage an animation that
  * could be stopped at anytime. When you stop the animation, you don't want
  * the already registered callbacks to be triggered once the animation has
  * stopped.
  * 
*/
animation.Timers = extend.Class({
	name  :'animation.Timers',
	parent: undefined,
	shared: {
		Instance: undefined
	},
	properties: {
		lastID:undefined,
		all:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `lastID`
		if (typeof(self.lastID)=='undefined') {self.lastID = 0;};
		// Default value for property `all`
		if (typeof(self.all)=='undefined') {self.all = {};};
	},
	methods: {
		/**
		  * Alias to periodic, but with the same syntax as animation
		  * 
		*/
		every: function(delay, callback, count) {
			var self = this;
			if (count === undefined) {count=-1}
			return self.periodic(callback, delay, count);
		},
		
		/**
		  * Creates a periodic timer for the given callback that will be executed
		  * `count` times after waiting `delay` milliseconds. This returns a timer object
		  * that can be used with methods of the `Timers` class.
		  * 
		*/
		periodic: function(callback, delay, count) {
			var self = this;
			if (count === undefined) {count=-1}
			self.lastID = (self.lastID + 1);
			var timer = {"id":self.lastID, "timeout":undefined, "completed":false, "iteration":0, "repeat":count, "delay":__module__.parseTime(delay)};
			timer.stop = function() {
				return self.stop(timer);
			};
			timer.cancel = function() {
				return self.cancel(timer);
			};
			self.all[timer.id] = timer;
			timer.step = function() {
				if ((!timer.completed) && (timer.repeat != 0)) {
					callback(timer);
					timer.iteration = (timer.iteration + 1);
					timer.repeat = Math.max(-1, (timer.repeat - 1));
					timer.timeout = window.setTimeout(timer.step, timer.delay);
				} else {
					timer.completed = true;
				}
			};
			timer.step();
			return timer;
		},
		
		/**
		  * Alias to `delayed` following animation's API
		  * 
		*/
		after: function(delay, callback) {
			var self = this;
			return self.delayed(callback, delay);
		},
		
		/**
		  * Registers the given callback to be called after the given `delay`. This
		  * will return a `timer` value that you can use to cancel the timer
		  * if necessary.
		  * 
		*/
		delayed: function(callback, delay) {
			var self = this;
			self.lastID = (self.lastID + 1);
			var timer = {"timeout":undefined, "completed":false, "id":self.lastID};
			self.all[timer.id] = timer;
			timer.timeout = window.setTimeout(function() {
				callback(timer);
				timer.completed = true;
				return self.remove(timer);
			}, __module__.parseTime(delay));
			return timer;
		},
		
		stop: function(timer) {
			var self = this;
			if (timer === undefined) {timer=undefined}
			return self.cancel(timer);
		},
		
		cancel: function(timer) {
			var self = this;
			if (timer === undefined) {timer=undefined}
			if (!extend.isDefined(timer)) {
				// Iterates over `extend.values(self.all)`. This works on array,objects and null/undefined
				var __p=extend.values(self.all);
				var __q=__p instanceof Array ? __p : Object.getOwnPropertyNames(__p||{});
				var __s=__q.length;
				for (var __r=0;__r<__s;__r++){
					var __n=(__q===__p)?__r:__q[__r];
					var __o=__p[__n];
					// This is the body of the iteration with (value=__o, key/index=__n) in __p
					self.getMethod('cancel') (__o, __n, __p)
				}
				self.lastID = 0;
				return true;
			} else {
				timer.completed = true;
				return self.remove(timer);
			}
		},
		
		pause: function(timer) {
			var self = this;
		},
		
		resume: function(timer) {
			var self = this;
		},
		
		reset: function(timer) {
			var self = this;
		},
		
		/**
		  * Remove the given timer from this timer collection
		  * 
		*/
		remove: function(timer) {
			var self = this;
			if (!timer) {
				return false;
			}
			if (extend.isDefined(timer.timeout)) {
				window.clearTimeout(timer.timeout);
				timer.timeout = undefined;
			}
			timer.completed = true;
			delete self.all[timer.id];
			
		},
		
		/**
		  * Cancels all the registerd timers
		  * 
		*/
		clear: function() {
			var self = this;
			// Iterates over `extend.values(self.all)`. This works on array,objects and null/undefined
			var __v=extend.values(self.all);
			var __w=__v instanceof Array ? __v : Object.getOwnPropertyNames(__v||{});
			var __y=__w.length;
			for (var __x=0;__x<__y;__x++){
				var __u=(__w===__v)?__x:__w[__x];
				var __t=__v[__u];
				// This is the body of the iteration with (value=__t, key/index=__u) in __v
				self.getMethod('cancel') (__t, __u, __v)
			}
			self.lastID = 0;
			return self;
		}
	},
	operations:{
		/**
		  * Gets the default timers collection
		  * 
		*/
		Get: function(  ){
			var self = this;
			if (!self.Instance) {
				self.Instance = new __module__.Timers();
			}
			return self.Instance;
		}
	}
})
/**
  * Animator will take care of calling the `step()` method of all registered
  * objects on every frame. When an animated element's step returns `False`, the
  * animated element will be removed from the animator.
  * 
  * Once the animator has no more elements, it will stop running until a new
  * animatable object is added.
  * 
  * You can get a singleton animator by using `Animator.Ensure()`, or create
  * more than one instance.
  * 
*/
animation.Animator = extend.Class({
	name  :'animation.Animator',
	parent: undefined,
	shared: {
		DEFAULT: undefined
	},
	properties: {
		name:undefined,
		fps:undefined,
		frame:undefined,
		limit:undefined,
		lastFrame:undefined,
		started:undefined,
		stopped:undefined,
		elapsed:undefined,
		frameDuration:undefined,
		isRunning:undefined,
		animated:undefined,
		onStep:undefined
	},
	initialize: function( name ){
		var self = this;
		// Default initialization of property `name`
		if (typeof(self.name)=='undefined') {self.name = undefined;};
		// Default initialization of property `fps`
		if (typeof(self.fps)=='undefined') {self.fps = undefined;};
		// Default initialization of property `frame`
		if (typeof(self.frame)=='undefined') {self.frame = 0;};
		// Default initialization of property `limit`
		if (typeof(self.limit)=='undefined') {self.limit = undefined;};
		// Default initialization of property `lastFrame`
		if (typeof(self.lastFrame)=='undefined') {self.lastFrame = undefined;};
		// Default initialization of property `started`
		if (typeof(self.started)=='undefined') {self.started = __module__.now();;};
		// Default initialization of property `stopped`
		if (typeof(self.stopped)=='undefined') {self.stopped = 0;};
		// Default initialization of property `elapsed`
		if (typeof(self.elapsed)=='undefined') {self.elapsed = 0;};
		// Default initialization of property `frameDuration`
		if (typeof(self.frameDuration)=='undefined') {self.frameDuration = 0;};
		// Default initialization of property `isRunning`
		if (typeof(self.isRunning)=='undefined') {self.isRunning = false;};
		// Default initialization of property `animated`
		if (typeof(self.animated)=='undefined') {self.animated = [];};
		// Default initialization of property `onStep`
		if (typeof(self.onStep)=='undefined') {self.onStep = undefined;};
		self.name = name;
	},
	methods: {
		setFPS: function(fps) {
			var self = this;
			self.fps = fps;
			return self;
		},
		
		start: function(limit) {
			var self = this;
			if (limit === undefined) {limit=undefined}
			if (!self.isRunning) {
				if (extend.isDefined(limit)) {
					self.limit = (self.frame + limit);
				} else {
					self.limit = undefined;
				}
				self.isRunning = true;
				self.started = __module__.now();
				self.lastFrame = self.started;
				window.setTimeout(self.getMethod('step') , 0);
			} else {
				var pass = true;
			}
			return self;
		},
		
		stop: function() {
			var self = this;
			if (self.isRunning) {
				self.stopped = __module__.now();
			}
			self.isRunning = false;
			return self;
		},
		
		resume: function() {
			var self = this;
			if (!self.isRunning) {
				var stop_duration = __module__.now();
				self.started = (self.started + stop_duration);
				self.lastFrame = (self.lastFrame + stop_duration);
				self.isRunning = true;
				window.setTimeout(self.getMethod('step') , 0);
			}
		},
		
		toggle: function() {
			var self = this;
			if (self.isRunning) {
				self.stop();
			} else {
				self.resume();
			}
		},
		
		add: function(element) {
			var self = this;
			self.animated.push(element);
			return self;
		},
		
		remove: function(element) {
			var self = this;
			var new_animated = [];
			// Iterates over `self.animated`. This works on array,objects and null/undefined
			var __a=self.animated;
			var __b=__a instanceof Array ? __a : Object.getOwnPropertyNames(__a||{});
			var __d=__b.length;
			for (var __c=0;__c<__d;__c++){
				var __z=(__b===__a)?__c:__b[__c];
				var e=__a[__z];
				// This is the body of the iteration with (value=e, key/index=__z) in __a
				if (e != element) {
					new_animated.push(e);
				};
			}
			self.animated = new_animated;
		},
		
		step: function() {
			var self = this;
			var i = 0;
			var frame_started = __module__.now();
			var current_animated = self.animated;
			self.frameDuration = (frame_started - (self.lastFrame || frame_started));
			self.animated = [];
			self.elapsed = (frame_started - (self.started || frame_started));
			while ((i < current_animated.length)) {
				var callback = current_animated[i];
				if (!extend.isFunction(callback)) {
					if (extend.isFunction(callback.getMethod)) {
						callback = callback.getMethod("step");
					} else {
						callback = callback.step;
					}
				}
				if (callback(self) != false) {
					self.animated.push(current_animated[i]);
				}
				i = (i + 1);
			}
			var frame_prepared = (__module__.now() - (self.started || frame_started));
			var frame_duration = (1000.0 / Math.max((self.fps || 1)));
			var this_frame = (Math.floor((self.elapsed / frame_duration)) * frame_duration);
			var next_frame = (this_frame + frame_duration);
			var should_wait = (next_frame - frame_prepared);
			if (!(self.fps || (self.fps < 0))) {
				should_wait = 0;
			}
			if (self.onStep) {
				self.onStep();
			}
			self.lastFrame = frame_started;
			self.frame = (self.frame + 1);
			if (self.isRunning) {
				if ((self.animated.length > 0) && ((!extend.isDefined(self.limit)) || (self.frame < self.limit))) {
					if (should_wait > 0) {
						window.setTimeout(self.getMethod('step') , should_wait);
					} else {
						__module__.onNextFrame(self.getMethod('step') );
					}
				} else {
					self.stop();
				}
			}
			return self;
		}
	},
	operations:{
		/**
		  * An alias for `Ensure`
		  * 
		*/
		Default: function(  ){
			var self = this;
			return self.Ensure();
		},
		Ensure: function(  ){
			var self = this;
			if (!self.DEFAULT) {
				self.DEFAULT = new __module__.Animator();
			}
			return self.DEFAULT;
		},
		Get: function(  ){
			var self = this;
			return self.Ensure();
		}
	}
})
/**
  * Sequences allow to control a time-based animation of objects by definining
  * frames and transitions of properties. Each frame starts at a given offset
  * in time and contains properties updates and transitions for specific objects.
  * 
  * ANIMATION = [
  * [1000, {
  * diagram: [{top: 0}, 1000]
  * diagramTitle: [{top: 0}, 1000]
  * }]
  * [2500, {
  * focusDiagramPart: [{opacity: 1}, 1000]
  * focusStatement: [{opacity: 1}, 1000]
  * focusList: [{opacity: 1}, 1000]
  * }]
  * [3500, {
  * improvementDiagramPart: [{opacity: 1}, 1000]
  * improvementStatement: [{opacity: 1}, 1000]
  * improvementList: [{opacity: 1}, 1000]
  * }]
  * [4500, {
  * supportDiagramPart: [{opacity: 1}, 1000]
  * supportStatement: [{opacity: 1}, 1000]
  * supportList: [{opacity: 1}, 1000]
  * }]
  * ]
  * 
*/
animation.Sequence = extend.Class({
	name  :'animation.Sequence',
	parent: undefined,
	properties: {
		options:undefined,
		frames:undefined,
		timers:undefined,
		animator:undefined,
		isRunning:undefined,
		on:undefined,
		uis:undefined,
		tweens:undefined,
		commands:undefined,
		cache:undefined
	},
	initialize: function( frames, uis, options ){
		var self = this;
		if (options === undefined) {options=null}
		// Default initialization of property `options`
		if (typeof(self.options)=='undefined') {self.options = {"speed":1.0};};
		// Default initialization of property `frames`
		if (typeof(self.frames)=='undefined') {self.frames = undefined;};
		// Default initialization of property `timers`
		if (typeof(self.timers)=='undefined') {self.timers = new __module__.Timers();};
		// Default initialization of property `animator`
		if (typeof(self.animator)=='undefined') {self.animator = undefined;};
		// Default initialization of property `isRunning`
		if (typeof(self.isRunning)=='undefined') {self.isRunning = false;};
		// Default initialization of property `on`
		if (typeof(self.on)=='undefined') {self.on = events.create(["start", "stop", "reset", "end", "frame"]);;};
		// Default initialization of property `uis`
		if (typeof(self.uis)=='undefined') {self.uis = {};};
		// Default initialization of property `tweens`
		if (typeof(self.tweens)=='undefined') {self.tweens = [];};
		// Default initialization of property `commands`
		if (typeof(self.commands)=='undefined') {self.commands = {};};
		// Default initialization of property `cache`
		if (typeof(self.cache)=='undefined') {self.cache = {"timeouts":[], "started":null};};
		self.setFrames(frames);
		self.uis = uis;
		// Iterates over `options`. This works on array,objects and null/undefined
		var __e=options;
		var __f=__e instanceof Array ? __e : Object.getOwnPropertyNames(__e||{});
		var __h=__f.length;
		for (var __g=0;__g<__h;__g++){
			var k=(__f===__e)?__g:__f[__g];
			var v=__e[k];
			// This is the body of the iteration with (value=v, key/index=k) in __e
			self.options[k] = v;
		}
		self.setCommand("loop", self.getMethod('loopCommand') );
	},
	methods: {
		/**
		  * Returns a normalized list of the given frames.
		  * 
		*/
		NormalizeFrames: function(frames) {
			var self = this;
			var cache = {};
			return extend.sorted(extend.map(frames, function(frame, step) {
				var o = self.GetFrameStart(frames, step, cache);
				frame = extend.copy(frame);
				frame[0] = o;
				return frame;
			}), function(a, b) {
				return extend.cmp(a[0], b[0]);
			});
		},
		
		/**
		  * Merges the original frames with the updated frames. Note that this does
		  * not alter the original lists of frames.
		  * 
		*/
		MergeFrames: function(original, update) {
			var self = this;
			original = self.NormalizeFrames(original);
			update = self.NormalizeFrames(update);
			// Iterates over `update`. This works on array,objects and null/undefined
			var __ij=update;
			var __jj=__ij instanceof Array ? __ij : Object.getOwnPropertyNames(__ij||{});
			var __lj=__jj.length;
			for (var __kj=0;__kj<__lj;__kj++){
				var step=(__jj===__ij)?__kj:__jj[__kj];
				var frame=__ij[step];
				// This is the body of the iteration with (value=frame, key/index=step) in __ij
				var index = extend.findLike(original, (function(frame){return (function(_) {
					return (_[0] >= frame[0]);
				})}(frame)));;
				var found = original[index];;
				if (found[0] == frame[0]) {
					// Iterates over `extend.slice(frame,1,undefined)`. This works on array,objects and null/undefined
					var __oj=extend.slice(frame,1,undefined);
					var __nj=__oj instanceof Array ? __oj : Object.getOwnPropertyNames(__oj||{});
					var __qj=__nj.length;
					for (var __pj=0;__pj<__qj;__pj++){
						var __mj=(__nj===__oj)?__pj:__nj[__pj];
						var _=__oj[__mj];
						// This is the body of the iteration with (value=_, key/index=__mj) in __oj
						found.push(_);
					}
				} else {
					original.splice(index, 0, frame);
				};
			}
			return original;
		},
		
		/**
		  * Returns the offset (in ms) where the frame starts.
		  * 
		*/
		GetFrameStart: function(frames, step, frameCache) {
			var self = this;
			if (frameCache === undefined) {frameCache={}}
			if (!frames) {
				extend.error("Sequence.GetFrameStart: No frames given");
			}
			if (step < 0) {
				return 0;
			} else {
				frame = frames[step];
				if (extend.isNumber(frame[0])) {
					return frame[0];
				} else if (extend.isString(frame[0])) {
					var time = frame[0].trim();
					var frame_duration = undefined;
					var frame_start = undefined;
					var frame_cache = frameCache[(step - 1)];
					if (frame_cache) {
						frame_start = frame_cache.start;
						frame_duration = frame_cache.duration;
					}
					if (time[0] == ">") {
						if (!extend.isDefined(frame_start)) {
							frame_start = self.GetFrameStart(frames, (step - 1), frameCache);
						}
						if (!extend.isDefined(frame_duration)) {
							frame_duration = self.GetFrameDuration(frames, (step - 1));
						}
						if (!extend.isDefined(frame_cache)) {
							frameCache[(step - 1)] = {"duration":frame_duration, "start":frame_start};
						} else {
							frame_cache.duration = frame_duration;
							frame_cache.start = frame_start;
						}
						if (extend.len(time) == 1) {
							return (frame_start + frame_duration);
						} else {
							return ((__module__.parseTime(extend.slice(time,1,undefined)) + frame_start) + frame_duration);
						}
					} else if (time[0] == "+") {
						if (!extend.isDefined(frame_start)) {
							frame_start = self.GetFrameStart(frames, (step - 1), frameCache);
						}
						if (!extend.isDefined(frame_cache)) {
							frameCache[(step - 1)] = {"start":frame_start};
						} else {
							frame_cache.start = frame_start;
						}
						return __module__.parseTime(time, frame_start);
					} else {
						return __module__.parseTime(time);
					}
				} else {
					extend.error("Sequence: Unsupported time offset:", frame[0]);
				}
			}
		},
		
		/**
		  * Returns the duration (in ms) of the frame:
		  * 
		*/
		GetFrameDuration: function(frames, step) {
			var self = this;
			if ((step < 0) || (step > (extend.len(frames) - 1))) {
				return 0;
			} else {
				var duration = 0;
				// Iterates over `frames[step]`. This works on array,objects and null/undefined
				var __rj=frames[step];
				var __sj=__rj instanceof Array ? __rj : Object.getOwnPropertyNames(__rj||{});
				var __uj=__sj.length;
				for (var __tj=0;__tj<__uj;__tj++){
					var i=(__sj===__rj)?__tj:__sj[__tj];
					var operations=__rj[i];
					// This is the body of the iteration with (value=operations, key/index=i) in __rj
					if (i > 0) {
						// Iterates over `operations`. This works on array,objects and null/undefined
						var __vj=operations;
						var __wj=__vj instanceof Array ? __vj : Object.getOwnPropertyNames(__vj||{});
						var __yj=__wj.length;
						for (var __xj=0;__xj<__yj;__xj++){
							var ui_name=(__wj===__vj)?__xj:__wj[__xj];
							var operation=__vj[ui_name];
							// This is the body of the iteration with (value=operation, key/index=ui_name) in __vj
							duration = Math.max(duration, self.GetOperationDuration(operation));
						}
					};
				}
				return duration;
			}
		},
		
		/**
		  * Extracts the duration defined in the given operation
		  * 
		*/
		GetOperationDuration: function(operation) {
			var self = this;
			if (extend.isList(operation)) {
				if (extend.len(operation) >= 2) {
					return (__module__.parseTime(operation[1]) || 0);
				}
			} else {
				return 0;
			}
		},
		
		/**
		  * Sets the given frames in this sequence.
		  * 
		*/
		setFrames: function(frames) {
			var self = this;
			self.cache.frameCache = {};
			self.frames = self.NormalizeFrames(frames);
			return self;
		},
		
		/**
		  * Merges the given frames in this sequence.
		  * 
		*/
		mergeFrames: function(frames) {
			var self = this;
			self.cache.frameCache = {};
			self.frames = self.MergeFrames(self.frames, frames);
			return self;
		},
		
		/**
		  * An alias to start
		  * 
		*/
		run: function() {
			var self = this;
			self.start();
		},
		
		start: function(step) {
			var self = this;
			if (step === undefined) {step=0}
			if (!self.isRunning) {
				self.isRunning = true;
				self.cache.started = __module__.now();
				self.on.start.trigger(self);
				self.animate(step);
			}
			return self;
		},
		
		stop: function() {
			var self = this;
			if (self.isRunning) {
				self.isRunning = false;
				self.timers.clear();
				// Iterates over `self.tweens`. This works on array,objects and null/undefined
				var __aj=self.tweens;
				var __bj=__aj instanceof Array ? __aj : Object.getOwnPropertyNames(__aj||{});
				var __dj=__bj.length;
				for (var __cj=0;__cj<__dj;__cj++){
					var __zj=(__bj===__aj)?__cj:__bj[__cj];
					var _=__aj[__zj];
					// This is the body of the iteration with (value=_, key/index=__zj) in __aj
					_.stop();
				}
				self.on.stop.trigger(self);
			}
			return self;
		},
		
		restart: function() {
			var self = this;
			self.reset();
			self.timers.delayed(function() {
				return self.start(1);
			}, 1);
			return self;
		},
		
		reset: function() {
			var self = this;
			self.stop();
			self._applyFrame(self.getResetFrame(), 0);
			self.on.reset.trigger(self);
			return self;
		},
		
		apply: function(step) {
			var self = this;
			self._applyFrame(self.frames[step], step);
			return self;
		},
		
		setCommand: function(name, callback) {
			var self = this;
			self.commands[name] = callback;
		},
		
		getResetFrame: function() {
			var self = this;
			if (self.frames[0] && (self.frames[0][0] == 0)) {
				var operations = {};
				// Iterates over `self.frames[0][1]`. This works on array,objects and null/undefined
				var __ej=self.frames[0][1];
				var __fj=__ej instanceof Array ? __ej : Object.getOwnPropertyNames(__ej||{});
				var __hj=__fj.length;
				for (var __gj=0;__gj<__hj;__gj++){
					var k=(__fj===__ej)?__gj:__fj[__gj];
					var v=__ej[k];
					// This is the body of the iteration with (value=v, key/index=k) in __ej
					var transition = extend.copy(self.frames[0][1][k]);;
					transition[(extend.len(transition) - 1)] = 0;
					operations[k] = transition;
				}
				return [0, operations];
			} else {
				return [0, []];
			}
		},
		
		/**
		  * Returns the offset (in ms) where the frame starts.
		  * 
		*/
		getFrameStart: function(step, frameCache) {
			var self = this;
			if (frameCache === undefined) {frameCache={}}
			return self.GetFrameStart(self.frames, step, frameCache);
		},
		
		/**
		  * Returns the duration (in ms) of the frame:
		  * 
		*/
		getFrameDuration: function(step) {
			var self = this;
			return self.GetFrameDuration(self.frames, step);
		},
		
		loopCommand: function(step) {
			var self = this;
			if (step < 0) {
				step = (self.cache.currentStep + step);
			}
			self.stop();
			animation.after(0, function() {
				return self.start(step);
			});
			return self;
		},
		
		/**
		  * The main function that processes the animation description data structure.
		  * By default, the sequence `frames` and `cache.started` values will be used
		  * but you can specify them to change the timing of the given animation.
		  * 
		*/
		animate: function(step, frames, start, previousMoment) {
			var self = this;
			if (step === undefined) {step=0}
			if (frames === undefined) {frames=self.frames}
			if (start === undefined) {start=self.cache.started}
			if (previousMoment === undefined) {previousMoment=self.cache.previousMoment}
			if (step >= frames.length) {
				return false;
			}
			if (step < 0) {
				return self.timers.delayed(function() {
					return self.animate((step + 1), frames, start, previousMoment);
				});
			}
			if (step == 0) {
				self.cache.currentDuration = 0;
			}
			var frame = frames[step];
			var elapsed = (__module__.now() - start);
			var moment = self.getFrameStart(step);
			var delay = (moment / self.options.speed);
			self.cache.previousMoment = elapsed;
			self.cache.currentStep = step;
			if ((elapsed < delay) && (Math.abs((delay - elapsed)) > 0)) {
				self.timers.delayed(function() {
					return self.animate(step, frames, start);
				}, (delay - elapsed));
			} else {
				self.cache.currentDuration = self.getFrameDuration(frame);
				self._applyFrame(frame, step);
				step = (step + 1);
				if (step < frames.length) {
					self.animate(step, frames, start, moment);
				} else {
					self.timers.delayed(self.getMethod('_onAnimationEnd') , self.cache.currentDuration);
				}
			}
		},
		
		_onAnimationEnd: function() {
			var self = this;
			self.on.end.trigger(self);
			self.isRunning = false;
		},
		
		/**
		  * Applies the given frame of animation. This parses an animation frame
		  * composed of `[0:MOMENT, 1:INSTRUCTIONS...]`.
		  * 
		*/
		_applyFrame: function(frame, step) {
			var self = this;
			if (step === undefined) {step=undefined}
			self.on.frame.trigger({"step":step, "frame":frame});
			var i = 1;
			while ((i < frame.length)) {
				var instructions = frame[i];
				if (extend.isFunction(instructions)) {
					instructions(frame, i, self);
				} else if (extend.isMap(instructions)) {
					self._applyFrameByName(instructions, frame);
				} else {
					self._applyFrameByReference(instructions, frame);
				}
				i = (i + 1);
			}
		},
		
		_applyFrameByName: function(instructions, frame) {
			var self = this;
			if (frame === undefined) {frame=undefined}
			// Iterates over `instructions`. This works on array,objects and null/undefined
			var __ik=instructions;
			var __jk=__ik instanceof Array ? __ik : Object.getOwnPropertyNames(__ik||{});
			var __lk=__jk.length;
			for (var __kk=0;__kk<__lk;__kk++){
				var ui_name=(__jk===__ik)?__kk:__jk[__kk];
				var anim_data=__ik[ui_name];
				// This is the body of the iteration with (value=anim_data, key/index=ui_name) in __ik
				if (extend.isDefined(self.uis[ui_name])) {
					var sui = self.uis[ui_name];
					self._applyTransition(sui, anim_data);
				} else if (extend.isDefined(self.commands[ui_name]) && extend.isFunction(self.commands[ui_name])) {
					var m = self.commands[ui_name];
					m.apply(self, anim_data);
				} else if (extend.isDefined(self[ui_name]) && extend.isFunction(self[ui_name])) {
					var m = self.getMethod(ui_name);
					m.apply(self, anim_data);
				} else {
					extend.error(((("Sequence: no ui or method " + ui_name) + " defined in ") + self.getClass().getName()));
				};
			}
		},
		
		_applyFrameByReference: function(instructions, frame) {
			var self = this;
			if (frame === undefined) {frame=undefined}
			// Iterates over `instructions`. This works on array,objects and null/undefined
			var __ok=instructions;
			var __nk=__ok instanceof Array ? __ok : Object.getOwnPropertyNames(__ok||{});
			var __qk=__nk.length;
			for (var __pk=0;__pk<__qk;__pk++){
				var __mk=(__nk===__ok)?__pk:__nk[__pk];
				var ui_anim_data=__ok[__mk];
				// This is the body of the iteration with (value=ui_anim_data, key/index=__mk) in __ok
				var sui = ui_anim_data[0];;
				if (!extend.isDefined(sui)) {
					extend.error(((("Sequence: reference not found in frame " + frame[0]) + " defined in ") + self.getClass().getName()));
				} else {
					self._applyTransition(sui, extend.slice(ui_anim_data,1,undefined));
				};
			}
		},
		
		/**
		  * A helper function used by animate which applies the  animation data
		  * given as `animData` to the given `ui`.
		  * 
		  * The `animData` is describes the properties to animate, or refers to
		  * specific animation commands registered in the sequence.
		  * 
		  * ```
		  * [{<property>:<destination>...}, duration]      # Property tweening
		  * [<command:string>, arguments...]               # Specific animation command
		  * ```
		  * 
		*/
		_applyTransition: function(sui, animData) {
			var self = this;
			var command = animData[0];
			if (extend.isString(command)) {
				var method = self.commands[command];
				!(extend.isDefined(method)) && extend.assert(false, "animation.Sequence._applyTransition:", (("Sequence: Command does not exist: `" + name) + "`"), "(failed `extend.isDefined(method)`)");
				var args = [sui].concat(extend.slice(animData,1,undefined));
				return method.apply(self, args);
			} else {
				var duration = (__module__.parseTime(animData[1]) / self.options.speed);
				// Iterates over `animData[0]`. This works on array,objects and null/undefined
				var __rk=animData[0];
				var __sk=__rk instanceof Array ? __rk : Object.getOwnPropertyNames(__rk||{});
				var __uk=__sk.length;
				for (var __tk=0;__tk<__uk;__tk++){
					var name=(__sk===__rk)?__tk:__sk[__tk];
					var value=__rk[name];
					// This is the body of the iteration with (value=value, key/index=name) in __rk
					self._applyPropertyTransition(sui, name, value, duration);
				}
			}
		},
		
		/**
		  * A helper method used by _applyTransition. This creates/gets
		  * the tween for the given property, and sets its destination value
		  * 
		*/
		_applyPropertyTransition: function(sui, name, value, duration) {
			var self = this;
			if (sui.jquery && (sui.length > 1)) {
				// Iterates over `sui`. This works on array,objects and null/undefined
				var __wk=sui;
				var __xk=__wk instanceof Array ? __wk : Object.getOwnPropertyNames(__wk||{});
				var __zk=__xk.length;
				for (var __yk=0;__yk<__zk;__yk++){
					var __vk=(__xk===__wk)?__yk:__xk[__yk];
					var _=__wk[__vk];
					// This is the body of the iteration with (value=_, key/index=__vk) in __wk
					self._applyPropertyTransition(_, name, value, duration);
				}
				return self;
			}
			var tween = __module__.Tween.Get(sui, name);
			var value_unit = __module__.parseValue(value, true);
			if (!tween) {
				tween = __module__.Tween.Ensure(sui, name);
				tween.setAnimator(self.getAnimator());
				self.tweens.push(tween);
				tween.unit = value_unit[1];
				sui = __module__.$(sui);
				if (extend.isFunction(sui[name])) {
					tween.getter = function(_) {
						return sui[name]();
					};
					tween.setter = function(v) {
						return sui[name](__module__.toUnit(v, tween.unit));
					};
				} else {
					tween.getter = function(_) {
						return (__module__.parseValue(sui.css(name)) || 0);
					};
					tween.setter = function(v) {
						return sui.css(name, __module__.toUnit(v, tween.unit));
					};
				}
				tween.to(value_unit[0], duration).start();
				
			} else {
				tween.unit = value_unit[1];
				tween.update(value_unit[0], duration);
			}
		},
		
		setAnimator: function(animator) {
			var self = this;
			if (animator != self.animator) {
				if (self.animator) {
					self.animator.remove(self);
				}
				self.animator = animator;
			}
			return self;
		},
		
		/**
		  * Returns the animator instance for this specific page
		  * 
		*/
		getAnimator: function() {
			var self = this;
			if (!self.animator) {
				self.animator = __module__.Animator.Ensure();
			}
			return self.animator;
		}
	}
})
/**
  * Easing is a collection fo functions that take the following parameters:
  * SEE: http://easings.net/
  * 
*/
animation.Easing = extend.Class({
	name  :'animation.Easing',
	parent: undefined,
	shared: {
		Linear: {"In":function(k) {
			return k;
		}, "Out":function(k) {
			return __module__.Easing.Linear.In(k);
		}, "InOut":function(k) {
			return __module__.Easing.Linear.In(k);
		}},
		Quartic: {"In":function(k) {
			return (((k * k) * k) * k);
		}, "Out":function(k) {
			k = (k - 1);
			return (1 - (((k * k) * k) * k));
		}, "InOut":function(k) {
			k = (k * 2);
			if (k < 1) {
				return ((((0.5 * k) * k) * k) * k);
			} else {
				k = (k - 2);
				return (-0.5 * ((((k * k) * k) * k) - 2));
			}
		}},
		Cubic: {"In":function(k) {
			return k;
		}, "Out":function(k) {
			return k;
		}, "InOut":function(k) {
			return k;
		}},
		Exponential: {"In":function(k) {
			if (k == 0) {
				return 0;
			} else {
				return Math.pow(1024, (k - 1));
			}
		}, "Out":function(k) {
			if (k == 1) {
				return 1;
			} else {
				return (1 - Math.pow(2, (-10 * k)));
			}
		}, "InOut":function(k) {
			if (k == 0) {
				return 0;
			} else if (k == 1) {
				return 1;
			} else if (k < 2) {
				k = (k * 2);
				return (0.5 * Math.pow(1024, (k - 1)));
			} else {
				return (0.5 - ((0 - Math.pow(2, (-10 * (k - 1)))) + 2));
			}
		}},
		Back: {"In":function(k) {
			return k;
		}, "Out":function(k) {
			return k;
		}, "InOut":function(k) {
			return k;
		}},
		Bounce: {"In":function(k) {
			return (1 - __module__.Easing.Bounce.Out((1 - k)));
		}, "Out":function(k) {
			if (k < (1 / 2.75)) {
				return ((7.5625 * k) * k);
			} else if (k < (2 / 2.75)) {
				k = (k - (1.5 / 2.75));
				return (((7.5625 * k) * k) + 0.75);
			} else if (k < (2.5 / 2.75)) {
				k = (k - (2.25 / 2.75));
				return (((7.5625 * k) * k) + 0.9375);
			} else {
				k = (k - (2.625 / 2.75));
				return (((7.5625 * k) * k) + 0.984375);
			}
		}, "InOut":function(k) {
			if (k < 0.5) {
				return (__module__.Easing.Bounce.In((k * 2)) * 0.5);
			} else {
				return ((__module__.Easing.Bounce.Out(((k * 2) - 1)) * 0.5) + 0.5);
			}
		}},
		Quintic: {"In":function(k) {
			return k;
		}, "Out":function(k) {
			return k;
		}, "InOut":function(k) {
			return k;
		}},
		Quadratic: {"In":function(k) {
			return (k * k);
		}, "Out":function(k) {
			return (k * (2 - k));
		}, "InOut":function(k) {
			k = (k * 2);
			if (k < 1) {
				return ((0.5 * k) * k);
			} else {
				k = (k - 1);
				return (-0.5 * ((k * (k - 2)) - 1));
			}
		}},
		Elastic: {"In":function(k) {
			return k;
		}, "Out":function(k) {
			return k;
		}, "InOut":function(k) {
			return k;
		}},
		Circular: {"In":function(k) {
			return k;
		}, "Out":function(k) {
			return k;
		}, "InOut":function(k) {
			return k;
		}},
		Sinusoidal: {"In":function(k) {
			return k;
		}, "Out":function(k) {
			return k;
		}, "InOut":function(k) {
			return k;
		}}
	},
	initialize: function(){
		var self = this;
	},
	operations:{
		Get: function( string ){
			var self = this;
			var type_subtype = string.split(":");
			var type = string;
			var subtype = "Out";
			if (extend.len(type) >= 2) {
				subtype = ({"in":"In", "out":"Out", "inout":"InOut"}[(type[1] || "").toLowerCase()] || "Out");
				type = type_subtype[0];
			}
			type = (type[0].toUpperCase() + extend.slice(type,1,undefined).toLowerCase());
			!(__module__.Easing[type]) && extend.assert(false, "animation.Easing.Get:", (("animation.Easing[" + type) + "] is undefined"), "(failed `__module__.Easing[type]`)");
			!(__module__.Easing[type][subtype]) && extend.assert(false, "animation.Easing.Get:", (((("animation.Easing[" + type) + "][") + subtype) + "] is undefined"), "(failed `__module__.Easing[type][subtype]`)");
			return __module__.Easing[type][subtype];
		}
	}
})
/**
  * Tweens allow to generate an interpolated value (between two other values)
  * over a given period of time.
  * 
  * Tweens are animatable objects that can be registered in an animator to
  * be updated for each frame.
  * 
*/
animation.Tween = extend.Class({
	name  :'animation.Tween',
	parent: undefined,
	shared: {
		COUNT: 0
	},
	properties: {
		id:undefined,
		name:undefined,
		isActive:undefined,
		easing:undefined,
		interpolator:undefined,
		animator:undefined,
		started:undefined,
		elapsed:undefined,
		enabled:undefined,
		currentValue:undefined,
		data:undefined,
		_scope:undefined,
		_source:undefined,
		_destination:undefined,
		_duration:undefined,
		_timer:undefined,
		getter:undefined,
		setter:undefined,
		_onStart:undefined,
		_onStep:undefined,
		_onEnd:undefined
	},
	/**
	  * Creates a new tween from the given `source` value to the given `destination`
	  * value, over the given `duration` (in ms).
	  * to update the value.
	  * 
	*/
	initialize: function( source, destination, duration ){
		var self = this;
		if (source === undefined) {source=undefined}
		if (destination === undefined) {destination=undefined}
		if (duration === undefined) {duration=1.0}
		// Default initialization of property `id`
		if (typeof(self.id)=='undefined') {self.id = 0;};
		// Default initialization of property `name`
		if (typeof(self.name)=='undefined') {self.name = null;};
		// Default initialization of property `isActive`
		if (typeof(self.isActive)=='undefined') {self.isActive = false;};
		// Default initialization of property `easing`
		if (typeof(self.easing)=='undefined') {self.easing = __module__.Easing.Exponential.Out;};
		// Default initialization of property `interpolator`
		if (typeof(self.interpolator)=='undefined') {self.interpolator = undefined;};
		// Default initialization of property `animator`
		if (typeof(self.animator)=='undefined') {self.animator = undefined;};
		// Default initialization of property `started`
		if (typeof(self.started)=='undefined') {self.started = undefined;};
		// Default initialization of property `elapsed`
		if (typeof(self.elapsed)=='undefined') {self.elapsed = undefined;};
		// Default initialization of property `enabled`
		if (typeof(self.enabled)=='undefined') {self.enabled = true;};
		// Default initialization of property `currentValue`
		if (typeof(self.currentValue)=='undefined') {self.currentValue = undefined;};
		// Default initialization of property `data`
		if (typeof(self.data)=='undefined') {self.data = {};};
		// Default initialization of property `_scope`
		if (typeof(self._scope)=='undefined') {self._scope = undefined;};
		// Default initialization of property `_source`
		if (typeof(self._source)=='undefined') {self._source = undefined;};
		// Default initialization of property `_destination`
		if (typeof(self._destination)=='undefined') {self._destination = undefined;};
		// Default initialization of property `_duration`
		if (typeof(self._duration)=='undefined') {self._duration = 1000;};
		// Default initialization of property `_timer`
		if (typeof(self._timer)=='undefined') {self._timer = undefined;};
		// Default initialization of property `getter`
		if (typeof(self.getter)=='undefined') {self.getter = undefined;};
		// Default initialization of property `setter`
		if (typeof(self.setter)=='undefined') {self.setter = undefined;};
		// Default initialization of property `_onStart`
		if (typeof(self._onStart)=='undefined') {self._onStart = undefined;};
		// Default initialization of property `_onStep`
		if (typeof(self._onStep)=='undefined') {self._onStep = undefined;};
		// Default initialization of property `_onEnd`
		if (typeof(self._onEnd)=='undefined') {self._onEnd = {"once":undefined, "always":undefined};};
		self.id = self.getClass().COUNT;
		self.getClass().COUNT = (self.getClass().COUNT + 1);
		self.name = ("Tween#" + self.id);
		self.setSource(source);
		self.setDestination(destination);
		self.setDuration(duration);
	},
	methods: {
		/**
		  * Binds the this tween to the given animator -- if no animator is given,
		  * the tween module will look for the `animation` module and get the
		  * default animator (`animation.Animator.Default()`)
		  * 
		  * This will also start the tween, unless `start` is set to false.
		  * 
		*/
		bind: function(animator, start) {
			var self = this;
			if (animator === undefined) {animator=undefined}
			if (start === undefined) {start=true}
			if (!animator) {
				!(animation) && extend.assert(false, "animation.Tween.bind:", "Tweeen.bind: animation module is required if you do not provide an animator", "(failed `animation`)");
				animator = animation.Animator.Default();
			}
			self.animator = animator;
			if (start) {
				self.start();
			}
			animator.add(self);
			return self;
		},
		
		/**
		  * Will start the given tween once this tween has finished. The given
		  * tween will only be called once. This is the same as calling `onEndOnce`
		  * with the tween `start` method.
		  * 
		*/
		chain: function(tween) {
			var self = this;
			self.onEndOnce(tween.getMethod("start"));
		},
		
		/**
		  * Sets the animator to be used by this tween. Will automatically
		  * remove the tween from the previous animator.
		  * 
		*/
		setAnimator: function(animator) {
			var self = this;
			if (self.animator != animator) {
				if (self.animator) {
					self.animator.remove(self);
				}
				self.animator = animator;
			}
			return self;
		},
		
		/**
		  * Sets the source and current value for this tween.
		  * Note that this won't trigger the setter.
		  * 
		*/
		set: function(source) {
			var self = this;
			self.setSource(source);
			self.setValue(source);
			return self;
		},
		
		/**
		  * Sets the source to be the given value. The source should be of the same
		  * type as the scope and destination.
		  * 
		*/
		setSource: function(source) {
			var self = this;
			self._source = source;
			self.currentValue = extend.copy(source);
			return self;
		},
		
		/**
		  * Gets the source. If the source has not been set yet, it will invoke the
		  * `getter` function and retrive the initial state, as a copy.
		  * 
		*/
		getSource: function() {
			var self = this;
			if (self._source === undefined) {
				if (self.getter) {
					self._source = extend.copy(self.getter());
				} else if (self._scope) {
					self._source = extend.copy(self._scope);
				} else {
					self._source = extend.copy(self.currentValue);
				}
			} else {
				return self._source;
			}
		},
		
		/**
		  * Sets the current tween destination to the given value. This will update
		  * the getters if a `scope` is defined.
		  * 
		*/
		setDestination: function(value) {
			var self = this;
			if (value === undefined) {value=self.getSource();}
			if (!((value === null) || (value === undefined))) {
				if (self._scope) {
					if (extend.isMap(value)) {
						!(extend.isMap(self._scope)) && extend.assert(false, "animation.Tween.setDestination:", "Tween.setDestination(map) requires the scope be an object", "(failed `extend.isMap(self._scope)`)");
						var res = {};
						self.getter = function() {
							// Iterates over `value`. This works on array,objects and null/undefined
							var __ak=value;
							var __bk=__ak instanceof Array ? __ak : Object.getOwnPropertyNames(__ak||{});
							var __dk=__bk.length;
							for (var __ck=0;__ck<__dk;__ck++){
								var k=(__bk===__ak)?__ck:__bk[__ck];
								var v=__ak[k];
								// This is the body of the iteration with (value=v, key/index=k) in __ak
								res[k] = self._scope[k];
							}
							return res;
						};
					} else if (extend.isList(value)) {
						!(((!self._scope) || extend.isList(self._scope))) && extend.assert(false, "animation.Tween.setDestination:", "Tween.setDestination(list) requires the scope be a list", "(failed `((!self._scope) || extend.isList(self._scope))`)");
						if (self._scope) {
							self.getter = function() {
								return self._scope;
							};
						}
					} else if (extend.isNumber(value)) {
						!(((!self._scope) || extend.isNumber(self._scope))) && extend.assert(false, "animation.Tween.setDestination:", "Tween.setDestination(number) requires the scope be a number", "(failed `((!self._scope) || extend.isNumber(self._scope))`)");
						if (self._scope) {
							self.getter = function() {
								return self._scope;
							};
						}
					} else {
						extend.error(("Tween.setDestination: type not supported " + value));
					}
				}
			}
			self._destination = value;
			return self;
		},
		
		/**
		  * Returns this tween's destination
		  * 
		*/
		getDestination: function() {
			var self = this;
			return self._destination;
		},
		
		/**
		  * The scope is the value that will be updated on each step. You would
		  * use `setScope` if you would like the tween to mutate a property/value
		  * of an existing object, instead of having to define a `setter`.
		  * 
		  * Note that the scope will be mutated on each step if it's mutable (lists, maps, objects)
		  * and that the `_source` attribute will be unset.
		  * 
		  * If there is no scope defined, then you'll need to set a `setter` for
		  * the tween to have any effect.
		  * 
		*/
		setScope: function(value) {
			var self = this;
			self._scope = value;
			self.getter = null;
			self.setter = null;
			if ((extend.isMap(value) || extend.isList(value)) || extend.isObject(value)) {
				self.setter = function(values) {
					// Iterates over `values`. This works on array,objects and null/undefined
					var __ek=values;
					var __fk=__ek instanceof Array ? __ek : Object.getOwnPropertyNames(__ek||{});
					var __hk=__fk.length;
					for (var __gk=0;__gk<__hk;__gk++){
						var k=(__fk===__ek)?__gk:__fk[__gk];
						var v=__ek[k];
						// This is the body of the iteration with (value=v, key/index=k) in __ek
						self._scope[k] = v;
					}
				};
			} else {
				extend.warning("Tween.setScope: Passing non list/map/object value.");
				self.setter = function(values) {
					self._scope = value;
				};
			}
			self.setDestination(self._destination);
			return self;
		},
		
		/**
		  * Returns this tween's scope
		  * 
		*/
		getScope: function() {
			var self = this;
			return self._scope;
		},
		
		setName: function(name) {
			var self = this;
			self.name = name;
		},
		
		/**
		  * Sets the duration for this tween (in milliseconds)
		  * 
		*/
		setDuration: function(duration) {
			var self = this;
			if (extend.isDefined(duration)) {
				self._duration = __module__.parseTime(duration);
			}
			return self;
		},
		
		/**
		  * Gets the duration (in milliseconds)
		  * 
		*/
		getDuration: function() {
			var self = this;
			return self._duration;
		},
		
		/**
		  * Sets the easing function
		  * 
		*/
		setEasing: function(easing) {
			var self = this;
			if (extend.isString(easing)) {
				easing = __module__.Easing.Get(easing);
			}
			self.easing = easing;
			return self;
		},
		
		onSet: function(callback) {
			var self = this;
			self.setter = callback;
			return self;
		},
		
		onGet: function(callback) {
			var self = this;
			self.getter = callback;
			return self;
		},
		
		/**
		  * Updates the `destination` of the tween, optionally updating the `duration`
		  * of the  tween to `newDuration`.
		  * 
		  * The difference between `to` and `setDestination` is that `to`
		  * will set the source to be the current value, and will restart the tween
		  * from there.
		  * 
		  * Note that this will clear the `onEndOnce` callback. If the tween
		  * is not started, it will be started as well
		  * 
		*/
		to: function(newDestination, duration, start) {
			var self = this;
			if (duration === undefined) {duration=undefined}
			if (start === undefined) {start=true}
			self.setSource(extend.copy(self.getValue()));
			self.setDuration(duration);
			self.setDestination(newDestination);
			self.started = __module__.now();
			self._onEnd.once = undefined;
			if (start) {
				self.start();
			}
			return self;
		},
		
		/**
		  * Sets this tween's destination with the given duration. If the tween
		  * is already started, this will update its destination, if it was not
		  * started, it will start it.
		  * 
		  * The difference between `update` and `setDestination` is that the
		  * tween will be automatically started (if not already running).
		  * 
		  * The difference between `update` and `to` is that the tween wont'
		  * be restarted, and that the `onEndOnce` callbacks won't be
		  * removed.
		  * 
		  * If called without parameters, the destination will be updated to
		  * the current value.
		  * 
		*/
		update: function(destination, duration, start) {
			var self = this;
			if (destination === undefined) {destination=self.currentValue}
			if (duration === undefined) {duration=undefined}
			if (start === undefined) {start=true}
			if (self.isActive) {
				self.stop();
			}
			self.setSource(self.getValue());
			self.setDestination(destination);
			self.setDuration(duration);
			if (!extend.isDefined(self.started)) {
				if (start) {
					self.start();
				}
			}
			return self;
		},
		
		/**
		  * Reverses the tween, setting the current value as its source and the original source
		  * as destination.
		  * 
		*/
		reverse: function() {
			var self = this;
			var new_destination = self.getSource();
			self.setSource(extend.copy(self.currentValue));
			self.setDestination(new_destination);
			return self;
		},
		
		/**
		  * Starts the tween if it was not already started. This will set its `started`
		  * property to the current time and add the Tween to the `animator`. If the tween
		  * has not been bound to an animator already, it will be bind itself to the default
		  * animator.
		  * 
		*/
		start: function(delay) {
			var self = this;
			if (delay === undefined) {delay=0}
			if (!self.isActive) {
				if (delay == 0) {
					if (!extend.isDefined(self.started)) {
						self.started = __module__.now();
					}
					self.isActive = true;
					if (!self.animator) {
						self.animator = __module__.Animator.Default();
					}
					self.animator.add(self).start();
				} else {
					animation.after(delay, function() {
						return self.start();
					});
				}
			}
			return self;
		},
		
		/**
		  * Stops the tween. This will call the `onEnd` and `onEndOnce` callbacks.
		  * 
		*/
		stop: function() {
			var self = this;
			self.elapsed = (__module__.now() - self.started);
			self.started = undefined;
			self.isActive = false;
			if (extend.isDefined(self._onEnd.once)) {
				var i = 0;
				var on_end_once = self._onEnd.once;
				while ((i < on_end_once.length)) {
					on_end_once[i](self);
					i = (i + 1);
				}
				self._onEnd.once = undefined;
			}
			if (extend.isDefined(self._onEnd.always)) {
				var i = 0;
				while ((i < self._onEnd.always.length)) {
					self._onEnd.always[i](self);
					i = (i + 1);
				}
			}
			return self;
		},
		
		/**
		  * Cancels the tween if active and starts it again
		  * 
		*/
		restart: function() {
			var self = this;
			if (self.isActive) {
				self.cancel();
			}
			return self.start();
		},
		
		resume: function() {
			var self = this;
			if (!self.isActive) {
				self.started = (__module__.now() - self.elapsed);
				self.isActive = true;
				if (!self.animator) {
					self.animator = __module__.Animator.Default();
				}
				self.animator.add(self).start();
			}
			return self;
		},
		
		/**
		  * Like stop, but does not call the `onEnd` callbacks
		  * 
		*/
		cancel: function(newSource) {
			var self = this;
			if (newSource === undefined) {newSource=undefined}
			self.started = undefined;
			self.isActive = false;
			self._onEnd.once = undefined;
			if (extend.isDefined(newSource)) {
				self.setSource(newSource);
			}
			return self;
		},
		
		toggle: function() {
			var self = this;
			if (self.isActive) {
				self.stop();
			} else {
				self.resume();
			}
			return self;
		},
		
		/**
		  * Tells if this tween has finished or not
		  * 
		*/
		hasFinished: function() {
			var self = this;
			if (extend.isDefined(self.started)) {
				return ((__module__.now() - self.started) > self._duration);
			} else {
				return true;
			}
		},
		
		/**
		  * Forces the current value. Note that this will only affect
		  * the `currentValue`, which will be overridden on next `step()` or `getValue()`.
		  * 
		*/
		setValue: function(value) {
			var self = this;
			self.currentValue = value;
		},
		
		/**
		  * Returns the current (interpolated) value for this tween, at the give
		  * time (now by default).
		  * 
		*/
		getValue: function(now) {
			var self = this;
			if (now === undefined) {now=animation.now();}
			if (extend.isDefined(self.started)) {
				var elapsed = (now - self.started);
				self.currentValue = self.interpolate(self.getSource(), self.getDestination(), elapsed, self._duration, self.currentValue);
				return self.currentValue;
			} else if (extend.isDefined(self.currentValue)) {
				return self.currentValue;
			} else {
				return self.getSource();
			}
		},
		
		/**
		  * Registers a callback to be invoked every time the tween is stepped
		  * 
		*/
		onStep: function(callback) {
			var self = this;
			if (!extend.isDefined(self._onStep)) {
				self._onStep = [callback];
			} else {
				self._onStep.push(callback);
			}
			return self;
		},
		
		/**
		  * An alias for `onStep`
		  * 
		*/
		onUpdate: function(callback) {
			var self = this;
			return self.onStep(callback);
		},
		
		/**
		  * Registers a callback to be invoked once the tween has ended (won't
		  * be triggered and will be discarded on `cancel` or `update`).
		  * 
		*/
		onEndOnce: function(callback) {
			var self = this;
			if (!extend.isDefined(self._onEnd.once)) {
				self._onEnd.once = [callback];
			} else {
				self._onEnd.once.push(callback);
			}
			return self;
		},
		
		/**
		  * Registers a callback to be invoked once the tween has ended (won't
		  * be triggered on `cancel` or `update`).
		  * 
		*/
		onEnd: function(callback) {
			var self = this;
			if (!extend.isDefined(self._onEnd.always)) {
				self._onEnd.always = [callback];
			} else {
				self._onEnd.always.push(callback);
			}
			return self;
		},
		
		/**
		  * The step animation that is called by the animator. When the tweeen
		  * is finished, this function will return `False`, thus unregistering
		  * the tween from the animator.
		  * 
		*/
		step: function() {
			var self = this;
			if (extend.isDefined(self.started)) {
				self.elapsed = (__module__.now() - self.started);
				var updated_value = self.getValue();
				if (!self.hasFinished()) {
					if (self.setter) {
						self.setter(updated_value, self);
					}
					// Iterates over `self._onStep`. This works on array,objects and null/undefined
					var __jl=self._onStep;
					var __kl=__jl instanceof Array ? __jl : Object.getOwnPropertyNames(__jl||{});
					var __ml=__kl.length;
					for (var __ll=0;__ll<__ml;__ll++){
						var __il=(__kl===__jl)?__ll:__kl[__ll];
						var _=__jl[__il];
						// This is the body of the iteration with (value=_, key/index=__il) in __jl
						_(updated_value, self);
					}
					return true;
				} else {
					self.currentValue = self._destination;
					if (self.setter) {
						self.setter(self._destination, self);
					}
					self.stop();
					// Iterates over `self._onStep`. This works on array,objects and null/undefined
					var __nl=self._onStep;
					var __pl=__nl instanceof Array ? __nl : Object.getOwnPropertyNames(__nl||{});
					var __rl=__pl.length;
					for (var __ql=0;__ql<__rl;__ql++){
						var __ol=(__pl===__nl)?__ql:__pl[__ql];
						var _=__nl[__ol];
						// This is the body of the iteration with (value=_, key/index=__ol) in __nl
						_(self._destination, self);
					}
					self.setSource(updated_value);
					return false;
				}
			} else {
				// Iterates over `self._onStep`. This works on array,objects and null/undefined
				var __tl=self._onStep;
				var __ul=__tl instanceof Array ? __tl : Object.getOwnPropertyNames(__tl||{});
				var __wl=__ul.length;
				for (var __vl=0;__vl<__wl;__vl++){
					var __sl=(__ul===__tl)?__vl:__ul[__vl];
					var _=__tl[__sl];
					// This is the body of the iteration with (value=_, key/index=__sl) in __tl
					_(self.getValue(), self);
				}
				return false;
			}
		},
		
		/**
		  * A wrapper to interpolate between `src` and `dst`, with the given `ela`psed time and
		  * `dur`ation. This uses the easing function registered in the tween. If the `src` is a map or a list
		  * and `value` is provided (it is expected to be either a map or a list
		  * as well) then the `value` will be mutated instead of new value to be
		  * created. This is especially useful when creating tweens that have to
		  * update an object property.
		  * 
		*/
		interpolate: function(src, dst, ela, dur, value) {
			var self = this;
			if (src === undefined) {src=self._source}
			if (dst === undefined) {dst=self._destination}
			if (ela === undefined) {ela=self.elapsed}
			if (dur === undefined) {dur=undefined}
			if (value === undefined) {value=undefined}
			var eased_value = undefined;
			var k = ela;
			if (extend.isDefined(dur)) {
				k = self.easing((ela / dur));
			}
			if (extend.isList(src)) {
				eased_value = (value || []);
				var i = 0;
				while ((i < dst.length)) {
					var v = self.interpolate(src[i], dst[i], k);
					if (eased_value.length > i) {
						eased_value[i] = v;
					} else {
						eased_value.push(v);
					}
					i = (i + 1);
				}
			} else if (extend.isMap(src)) {
				eased_value = (value || {});
				for (var key in dst) {
				   if (extend.isNumber(dst[key])) {
					eased_value[key] = self.interpolate(src[key], dst[key], k)
				   } else {
					eased_value[key] = dst[key];
				   }
				}
				
			} else {
				eased_value = self._interpolator(src, dst, k);
			}
			return eased_value;
		},
		
		_interpolator: function(src, dst, k) {
			var self = this;
			return (src + ((dst - src) * k));
		}
	},
	operations:{
		/**
		  * Returns  ll the tweens in the given object
		  * 
		*/
		All: function( object, name ){
			var self = this;
			if (object && object.jQuery) {
				object = object[0];
			}
			var tweens = object.tweens;
			if (extend.isDefined(tweens)) {
				return tweens;
			} else {
				return null;
			}
		},
		/**
		  * Sets the given tween to the given object under the given name
		  * 
		*/
		Set: function( object, name, tween ){
			var self = this;
			if (object && object.jquery) {
				object = object[0];
			}
			var tweens = self.Init(object);
			if (extend.isDefined(tweens[name])) {
				tweens[name].cancel();
			}
			tweens[name] = tween;
			return tween;
		},
		/**
		  * Returns the tween with the given name in the given object
		  * 
		*/
		Get: function( object, name ){
			var self = this;
			if (object && object.jquery) {
				object = object[0];
			}
			var tweens = object.tweens;
			if (extend.isDefined(tweens)) {
				return tweens[name];
			} else {
				return null;
			}
		},
		/**
		  * Initializes the given object to be ready to accept tweens. This will
		  * basically create a `tweens` property with a dictionary if it doesn't
		  * exist already.
		  * 
		*/
		Init: function( object ){
			var self = this;
			if (object && object.jquery) {
				object = object[0];
			}
			if (!extend.isDefined(object.tweens)) {
				object.tweens = {};
			}
			return object.tweens;
		},
		Ensure: function( object, name, callback ){
			var self = this;
			if (callback === undefined) {callback=null}
			__module__.Tween.Init(object);
			var t = __module__.Tween.Get(object, name);
			if (!t) {
				t = new __module__.Tween();
				t.setName(name);
				if (callback) {
					callback(t, object, name);
				}
				return __module__.Tween.Set(object, name, t);
			} else {
				return t;
			}
		},
		Cancel: function( object, name ){
			var self = this;
			if (name === undefined) {name=null}
			if (object && object.jquery) {
				object = object[0];
			}
			if (!(object || (!object.tweens))) {
				return null;
			}
			if (name) {
				__module__.tween = object.tweens[name];
				if (__module__.tween && __module__.tween.isActive) {
					__module__.tween.cancel();
				}
			} else {
				// Iterates over `object.tweens`. This works on array,objects and null/undefined
				var __yl=object.tweens;
				var __zl=__yl instanceof Array ? __yl : Object.getOwnPropertyNames(__yl||{});
				var __bl=__zl.length;
				for (var __al=0;__al<__bl;__al++){
					var __xl=(__zl===__yl)?__al:__zl[__al];
					var __cl=__yl[__xl];
					// This is the body of the iteration with (value=__cl, key/index=__xl) in __yl
					(function(tween){if (tween.isActive) {
						tween.cancel();
					};}(__cl))
				}
			}
		}
	}
})
animation.init = function(){
	var self = animation;
	__module__.Updates.EnsurePrefix();
}
if (typeof(animation.init)!="undefined") {animation.init();}

// START:VANILLA_POSTAMBLE
return animation;})(animation);
// END:VANILLA_POSTAMBLE
