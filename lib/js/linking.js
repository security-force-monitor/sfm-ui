// 8< ---[linking.js]---
/**
  * Linking allows to to store a state (a key->value map where values are numbers
  * or strings) and be notified when the state is notified or change.
  * 
  * The `State` class provides the implementation for such a mechanism, and the
  * `URLState` class provides a specific implementation that will store the
  * state in the URL hash, providing deep-linking.
  * 
*/
// START:VANILLA_PREAMBLE
var linking=typeof(extend)!='undefined' ? extend.module('linking') : (typeof(linking)!='undefined' ? linking : {});
(function(linking){
var EventSource = events.EventSource;
var __module__=linking;
// END:VANILLA_PREAMBLE

linking.__VERSION__='1.5.5';
linking.LICENSE = "http://ffctn.com/doc/licenses/bsd";
linking.PATH_KEY = "__path__";
linking.$ = (((typeof(jQuery) != "undefined") && jQuery) || extend.modules.select);

linking.State = extend.Class({
	name  :'linking.State',
	parent: undefined,
	shared: {
		INTERNAL: "internal",
		EXTERNAL: "external",
		OPTIONS: {"asString":null, "fromString":null}
	},
	properties: {
		onStateChanged:undefined,
		onStateUpdated:undefined,
		onPreUpdate:undefined,
		previousState:undefined,
		currentState:undefined,
		lastUpdate:undefined,
		_delayedUpdate:undefined,
		_isApplying:undefined,
		options:undefined,
		defaults:undefined
	},
	initialize: function( options ){
		var self = this;
		if (options === undefined) {options=null}
		// Default initialization of property `onStateChanged`
		if (typeof(self.onStateChanged)=='undefined') {self.onStateChanged = new events.EventSource("state.changed");};
		// Default initialization of property `onStateUpdated`
		if (typeof(self.onStateUpdated)=='undefined') {self.onStateUpdated = new events.EventSource("state.updated");};
		// Default initialization of property `onPreUpdate`
		if (typeof(self.onPreUpdate)=='undefined') {self.onPreUpdate = new events.EventSource("state.update");};
		// Default initialization of property `previousState`
		if (typeof(self.previousState)=='undefined') {self.previousState = null;};
		// Default initialization of property `currentState`
		if (typeof(self.currentState)=='undefined') {self.currentState = {};};
		// Default initialization of property `lastUpdate`
		if (typeof(self.lastUpdate)=='undefined') {self.lastUpdate = null;};
		// Default initialization of property `_delayedUpdate`
		if (typeof(self._delayedUpdate)=='undefined') {self._delayedUpdate = null;};
		// Default initialization of property `_isApplying`
		if (typeof(self._isApplying)=='undefined') {self._isApplying = false;};
		// Default initialization of property `options`
		if (typeof(self.options)=='undefined') {self.options = {};};
		// Default initialization of property `defaults`
		if (typeof(self.defaults)=='undefined') {self.defaults = null;};
		// Iterates over `self.getClass().OPTIONS`. This works on array,objects and null/undefined
		var __i=self.getClass().OPTIONS;
		var __j=__i instanceof Array ? __i : Object.getOwnPropertyNames(__i||{});
		var __l=__j.length;
		for (var __k=0;__k<__l;__k++){
			var k=(__j===__i)?__k:__j[__k];
			var v=__i[k];
			// This is the body of the iteration with (value=v, key/index=k) in __i
			self.options[k] = v;
		}
		// Iterates over `options`. This works on array,objects and null/undefined
		var __m=options;
		var __o=__m instanceof Array ? __m : Object.getOwnPropertyNames(__m||{});
		var __p=__o.length;
		for (var __n=0;__n<__p;__n++){
			var k=(__o===__m)?__n:__o[__n];
			var v=__m[k];
			// This is the body of the iteration with (value=v, key/index=k) in __m
			self.options[k] = v;
		}
	},
	methods: {
		/**
		  * Binds the given changedCallback and (optional) updatedCallback and
		  * calls `changedCallback` with the initial event.
		  * 
		*/
		bind: function(changedCallback, updatedCallback) {
			var self = this;
			if (updatedCallback === undefined) {updatedCallback=null}
			self.onStateChanged.bind(changedCallback);
			if (updatedCallback) {
				self.onStateUpdated.bind(updatedCallback);
			}
			changedCallback(self.getInitialEvent());
			return self;
		},
		
		unbind: function(changedCallback, updatedCallback) {
			var self = this;
			if (updatedCallback === undefined) {updatedCallback=null}
			self.onStateChanged.unbind(changedCallback);
			if (updatedCallback) {
				self.onStateUpdated.unbind(updatedCallback);
			}
			return self;
		},
		
		bindLink: function(lui) {
			var self = this;
			linking.bindLink(self, lui);
		},
		
		bindLinks: function(ui) {
			var self = this;
			linking.bindLinks(self, ui);
		},
		
		/**
		  * A callback used by `bindLinks` -- it is defined so as not to create
		  * too many loose functions.
		  * 
		*/
		_bindLinkCallback: function(event) {
			var self = this;
			var t = event.target;
			while ((t && (t.nodeName != "A"))) {
				t = t.parentNode;
			}
			if (linking._onLinkClicked(t, self) === false) {
				event.preventDefault();
				return false;
			}
		},
		
		_bindLinkHandler: function() {
			var self = this;
			if (window.interaction) {
				if (!self.cachedBindLinkHandler) {
					self.cachedBindLinkHandler = interaction.handle({"press":{"press":self.getMethod('_bindLinkCallback') }});
				}
				return self.cachedBindLinkHandler;
			} else {
				return null;
			}
		},
		
		/**
		  * An alias for `State.get()`
		  * 
		*/
		getValues: function() {
			var self = this;
			return self.get();
		},
		
		getPath: function(index) {
			var self = this;
			if (index === undefined) {index=undefined}
			if (!extend.isDefined(index)) {
				return self.get(__module__.PATH_KEY);
			} else {
				return (self.get(__module__.PATH_KEY) || "").split("/")[index];
			}
		},
		
		/**
		  * Sets the `__path__` of the current state. This does not set the whole
		  * state but simply updates it.
		  * 
		*/
		setPath: function(value, source) {
			var self = this;
			if (source === undefined) {source=self.getClass().INTERNAL}
			return self.update(__module__.PATH_KEY, value, source);
		},
		
		parsePath: function(index) {
			var self = this;
			if (index === undefined) {index=undefined}
			if (extend.isDefined(index)) {
				return self.parsePath()[index];
			} else {
				return (self.get("__path__") || "").split("/");
			}
		},
		
		pathIs: function(value) {
			var self = this;
			return (self.get("__path__") == value);
		},
		
		pathMatch: function(values) {
			var self = this;
			values = extend.sliceArguments(arguments,0)
			var path = self.parsePath();
			if (extend.len(values) == extend.len(path)) {
				return self.pathLike(value);
			} else {
				return false;
			}
		},
		
		pathLike: function(values) {
			var self = this;
			values = extend.sliceArguments(arguments,0)
			var path = self.parsePath();
			var like = true;
			// Iterates over `values`. This works on array,objects and null/undefined
			var __q=values;
			var __r=__q instanceof Array ? __q : Object.getOwnPropertyNames(__q||{});
			var __t=__r.length;
			for (var __s=0;__s<__t;__s++){
				var i=(__r===__q)?__s:__r[__s];
				var value=__q[i];
				// This is the body of the iteration with (value=value, key/index=i) in __q
				if ((value && (path[i] != value)) || (!extend.isDefined(path[i]))) {
					like = false;
					break
				};
			}
			return like;
		},
		
		/**
		  * Creates a new path based on the given arbuments. `Undefined` values
		  * will be replaced by their current value.
		  * 
		*/
		createPath: function(path) {
			var self = this;
			path = extend.sliceArguments(arguments,0)
			if (extend.isList(path[0]) && (extend.len(path) == 1)) {
				path = path[0];
			}
			if (extend.len(path) == 1) {
				path = path[0];
			} else {
				var ex = self.parsePath();
				path = extend.map(path, function(v, i) {
					if (!extend.isDefined(v)) {
						return ex[i];
					} else {
						return v;
					}
				}).join("/");
			}
			return path;
		},
		
		/**
		  * Updates the path with the given list of arguments. Any `undefined`
		  * value will be relaced by its current value, if any.
		  * 
		*/
		updatePath: function(path) {
			var self = this;
			path = extend.sliceArguments(arguments,0)
			return self.update(__module__.PATH_KEY, self.createPath(path), self.getClass().INTERNAL);
		},
		
		setDefaults: function(defaults) {
			var self = this;
			// Iterates over `defaults`. This works on array,objects and null/undefined
			var __u=defaults;
			var __v=__u instanceof Array ? __u : Object.getOwnPropertyNames(__u||{});
			var __x=__v.length;
			for (var __w=0;__w<__x;__w++){
				var k=(__v===__u)?__w:__v[__w];
				var v=__u[k];
				// This is the body of the iteration with (value=v, key/index=k) in __u
				if (!extend.isDefined(self.currentState[k])) {
					self.currentState[k] = v;
				};
			}
			self.defaults = defaults;
			return self;
		},
		
		remove: function(keys, source) {
			var self = this;
			if (source === undefined) {source=self.getClass().INTERNAL}
			self.previousState = extend.copy(self.currentState);
			var result = {};
			var removed = [];
			var count = 0;
			if (extend.isString(keys)) {
				keys = extend.createMapFromItems([keys,true]);
			} else if (extend.isList(keys)) {
				var k = {};
				// Iterates over `keys`. This works on array,objects and null/undefined
				var __z=keys;
				var __a=__z instanceof Array ? __z : Object.getOwnPropertyNames(__z||{});
				var __c=__a.length;
				for (var __b=0;__b<__c;__b++){
					var __y=(__a===__z)?__b:__a[__b];
					var _=__z[__y];
					// This is the body of the iteration with (value=_, key/index=__y) in __z
					k[_] = true;
				}
				keys = k;
			}
			// Iterates over `self.currentState`. This works on array,objects and null/undefined
			var __d=self.currentState;
			var __e=__d instanceof Array ? __d : Object.getOwnPropertyNames(__d||{});
			var __g=__e.length;
			for (var __f=0;__f<__g;__f++){
				var k=(__e===__d)?__f:__e[__f];
				var v=__d[k];
				// This is the body of the iteration with (value=v, key/index=k) in __d
				if (extend.isDefined(keys[k])) {
					removed.push(k);
				} else {
					result[k] = ("" + v);
					count = (count + 1);
				};
			}
			self.currentState = result;
			return self._applyStateUpdate({"values":self.currentState, "added":[], "removed":removed, "updated":[], "count":count, "source":source});
		},
		
		toggle: function(values, source) {
			var self = this;
			if (source === undefined) {source=self.getClass().INTERNAL}
			self.previousState = extend.copy(self.currentState);
			if (extend.isString(values)) {
				values = extend.createMapFromItems([values,true]);
			} else if (extend.isList(values)) {
				var v = {};
				// Iterates over `values`. This works on array,objects and null/undefined
				var __ij=values;
				var __jj=__ij instanceof Array ? __ij : Object.getOwnPropertyNames(__ij||{});
				var __lj=__jj.length;
				for (var __kj=0;__kj<__lj;__kj++){
					var __h=(__jj===__ij)?__kj:__jj[__kj];
					var _=__ij[__h];
					// This is the body of the iteration with (value=_, key/index=__h) in __ij
					v[_] = true;
				}
				values = v;
			}
			var added = [];
			var removed = [];
			var updated = [];
			var count = 0;
			// Iterates over `values`. This works on array,objects and null/undefined
			var __mj=values;
			var __oj=__mj instanceof Array ? __mj : Object.getOwnPropertyNames(__mj||{});
			var __pj=__oj.length;
			for (var __nj=0;__nj<__pj;__nj++){
				var k=(__oj===__mj)?__nj:__oj[__nj];
				var v=__mj[k];
				// This is the body of the iteration with (value=v, key/index=k) in __mj
				if (extend.isDefined(self.currentState[k])) {
					if (self.currentState[k] == v) {
						delete self.currentState[k];
						
						removed.push(k);
					} else {
						self.currentState[k] = v;
						updated.push(k);
					}
				} else {
					self.currentState[k] = v;
					added.push(k);
				};
				count = (count + 1);
			}
			return self._applyStateUpdate({"values":self.currentState, "added":added, "removed":removed, "updated":updated, "count":count, "source":source});
		},
		
		/**
		  * Updates the given values in the state
		  * 
		*/
		update: function(values, v, source) {
			var self = this;
			if (v === undefined) {v=""}
			if (source === undefined) {source=self.getClass().INTERNAL}
			if (extend.isString(values)) {
				return self.update(extend.createMapFromItems([values,v]));
			}
			var updated = [];
			var added = [];
			var existing = [];
			var count = 0;
			var removed = [];
			self.previousState = extend.copy(self.currentState);
			// Iterates over `self.currentState`. This works on array,objects and null/undefined
			var __qj=self.currentState;
			var __rj=__qj instanceof Array ? __qj : Object.getOwnPropertyNames(__qj||{});
			var __tj=__rj.length;
			for (var __sj=0;__sj<__tj;__sj++){
				var k=(__rj===__qj)?__sj:__rj[__sj];
				var __uj=__qj[k];
				// This is the body of the iteration with (value=__uj, key/index=k) in __qj
				(function(v){existing.push(k);
				count = (count + 1);}(__uj))
			}
			// Iterates over `values`. This works on array,objects and null/undefined
			var __vj=values;
			var __wj=__vj instanceof Array ? __vj : Object.getOwnPropertyNames(__vj||{});
			var __yj=__wj.length;
			for (var __xj=0;__xj<__yj;__xj++){
				var k=(__wj===__vj)?__xj:__wj[__xj];
				var __zj=__vj[k];
				// This is the body of the iteration with (value=__zj, key/index=k) in __vj
				(function(v){var index = extend.find(existing, k);;
				if (existing == -1) {
					if (extend.isDefined(v)) {
						added.push(k);
						self.currentState[k] = ("" + v);
						count = (count + 1);
					}
				} else {
					if (extend.isDefined(values[k])) {
						if (values[k] != self.currentState[k]) {
							self.currentState[k] = values[k];
							updated.push(k);
						}
					} else {
						if (extend.isDefined(self.currentState[k])) {
							delete self.currentState[k];
							
							removed.push(k);
						}
					}
				};}(__zj))
			}
			return self._applyStateUpdate({"values":self.currentState, "added":added, "removed":removed, "updated":updated, "count":count, "source":source});
		},
		
		/**
		  * Sets the current state to be exactly the given values
		  * 
		*/
		set: function(values, v, source) {
			var self = this;
			if (source === undefined) {source=self.getClass().INTERNAL}
			if (extend.isString(values)) {
				if (extend.isDefined(v)) {
					return self.set(extend.createMapFromItems([values,v]));
				} else {
					return self.setPath(values);
				}
			}
			var added = [];
			var updated = [];
			var new_state = {};
			var existing = [];
			var count = 0;
			self.previousState = extend.copy(self.currentState);
			// Iterates over `self.currentState`. This works on array,objects and null/undefined
			var __aj=self.currentState;
			var __bj=__aj instanceof Array ? __aj : Object.getOwnPropertyNames(__aj||{});
			var __dj=__bj.length;
			for (var __cj=0;__cj<__dj;__cj++){
				var k=(__bj===__aj)?__cj:__bj[__cj];
				var __ej=__aj[k];
				// This is the body of the iteration with (value=__ej, key/index=k) in __aj
				(function(v){existing.push(k);}(__ej))
			}
			// Iterates over `values`. This works on array,objects and null/undefined
			var __fj=values;
			var __gj=__fj instanceof Array ? __fj : Object.getOwnPropertyNames(__fj||{});
			var __ik=__gj.length;
			for (var __hj=0;__hj<__ik;__hj++){
				var k=(__gj===__fj)?__hj:__gj[__hj];
				var __jk=__fj[k];
				// This is the body of the iteration with (value=__jk, key/index=k) in __fj
				(function(v){var index = extend.find(existing, k);;
				if (existing == -1) {
					if (extend.isDefined(v)) {
						added.push(k);
						new_state[k] = ("" + v);
					}
				} else {
					if (values[k] != self.currentState[k]) {
						updated.push(k);
					}
					if (extend.isDefined(values[k])) {
						new_state[k] = values[k];
					}
					existing.splice(index, 1);
				};
				count = (count + 1);}(__jk))
			}
			self.currentState = new_state;
			return self._applyStateUpdate({"values":new_state, "added":added, "removed":existing, "updated":updated, "count":count, "source":source});
		},
		
		/**
		  * Updates the state with the given value
		  * 
		*/
		add: function(value, source) {
			var self = this;
			if (source === undefined) {source=self.getClass().INTERNAL}
			if (extend.isString(value) || extend.isNumber(value)) {
				self.update(value, "", source);
			} else if (extend.isNumber(value)) {
				self.update(("" + value), "", source);
			} else if (extend.isList(value)) {
				var r = {};
				// Iterates over `value`. This works on array,objects and null/undefined
				var __lk=value;
				var __mk=__lk instanceof Array ? __lk : Object.getOwnPropertyNames(__lk||{});
				var __nk=__mk.length;
				for (var __ok=0;__ok<__nk;__ok++){
					var __kk=(__mk===__lk)?__ok:__mk[__ok];
					var v=__lk[__kk];
					// This is the body of the iteration with (value=v, key/index=__kk) in __lk
					r[v] = "";
				}
				self.update(r, undefined, source);
			} else {
				extend.error("linking.State.add: Value should be either string or list");
			}
		},
		
		get: function(name) {
			var self = this;
			if (name === undefined) {name=undefined}
			if (!extend.isDefined(name)) {
				return self.currentState;
			} else {
				return self.currentState[name];
			}
		},
		
		hasValue: function(name) {
			var self = this;
			return self.has(name);
		},
		
		has: function(name) {
			var self = this;
			return extend.isDefined(self.currentState[name]);
		},
		
		back: function() {
			var self = this;
			if (!self.previousState) {
				return false;
			}
			var delta = extend.copy(self.previousState);
			// Iterates over `self.currentState`. This works on array,objects and null/undefined
			var __pk=self.currentState;
			var __qk=__pk instanceof Array ? __pk : Object.getOwnPropertyNames(__pk||{});
			var __sk=__qk.length;
			for (var __rk=0;__rk<__sk;__rk++){
				var k=(__qk===__pk)?__rk:__qk[__rk];
				var v=__pk[k];
				// This is the body of the iteration with (value=v, key/index=k) in __pk
				if (!extend.isDefined(self.previousState[k])) {
					delta[k] = undefined;
				};
			}
			return self.set(delta);
		},
		
		getInitialEvent: function() {
			var self = this;
			var values = {};
			var added = [];
			// Iterates over `self.currentState`. This works on array,objects and null/undefined
			var __tk=self.currentState;
			var __uk=__tk instanceof Array ? __tk : Object.getOwnPropertyNames(__tk||{});
			var __wk=__uk.length;
			for (var __vk=0;__vk<__wk;__vk++){
				var k=(__uk===__tk)?__vk:__uk[__vk];
				var v=__tk[k];
				// This is the body of the iteration with (value=v, key/index=k) in __tk
				values[k] = v;
				added.push(k);
			}
			var event = self._applyStateUpdate({"values":values, "added":added, "removed":[], "updated":[], "count":added.length, "source":self.getClass().EXTERNAL}, false);
			if (event) {
				event.isInitial = true;
				return event;
			} else {
				return {"isInitial":true, "source":self.getClass().INTERNAL, "added":[], "removed":[], "updated":[], "values":{}};
			}
		},
		
		/**
		  * Delays the updating of this state until the applyUpdate is called
		  * 
		*/
		delayUpdate: function() {
			var self = this;
			self._delayedUpdate = (self._delayedUpdate || {"values":{}, "added":[], "updated":[], "removed":[], "count":0, "source":self.getClass().INTERNAL});
		},
		
		/**
		  * Removes the delayed update data
		  * 
		*/
		clearDelayedUpdate: function() {
			var self = this;
			self._delayedUpdate = undefined;
		},
		
		/**
		  * Applies the accumuluated delayed update
		  * 
		*/
		applyUpdate: function() {
			var self = this;
			if (self._delayedUpdate) {
				self._applyStateUpdate(self._delayedUpdate);
			}
			self._delayedUpdate = undefined;
		},
		
		/**
		  * Applies the state update.
		  * 
		*/
		_applyStateUpdate: function(update, trigger) {
			var self = this;
			if (trigger === undefined) {trigger=true}
			if (!self.lastUpdate) {
				update.isInitial = true;
			} else {
				update.isInitial = false;
			}
			self.onPreUpdate.trigger(update);
			if (self._isApplying) {
				return window.setTimeout(function() {
					return self._applyStateUpdate(update, trigger);
				}, 0);
			} else if (((update.added.length + update.updated.length) + update.removed.length) > 0) {
				self._isApplying = true;
				var has_changed = (((update.added.length + update.removed.length) + update.updated.length) != 0);
				var added_dict = {};
				var updated_dict = {};
				var removed_dict = {};
				var changed_dict = {};
				// Iterates over `update.added`. This works on array,objects and null/undefined
				var __yk=update.added;
				var __zk=__yk instanceof Array ? __yk : Object.getOwnPropertyNames(__yk||{});
				var __bk=__zk.length;
				for (var __ak=0;__ak<__bk;__ak++){
					var __xk=(__zk===__yk)?__ak:__zk[__ak];
					var _=__yk[__xk];
					// This is the body of the iteration with (value=_, key/index=__xk) in __yk
					added_dict[_] = true;
					changed_dict[_] = true;
				}
				// Iterates over `update.updated`. This works on array,objects and null/undefined
				var __dk=update.updated;
				var __ek=__dk instanceof Array ? __dk : Object.getOwnPropertyNames(__dk||{});
				var __gk=__ek.length;
				for (var __fk=0;__fk<__gk;__fk++){
					var __ck=(__ek===__dk)?__fk:__ek[__fk];
					var _=__dk[__ck];
					// This is the body of the iteration with (value=_, key/index=__ck) in __dk
					updated_dict[_] = true;
					changed_dict[_] = true;
				}
				// Iterates over `update.removed`. This works on array,objects and null/undefined
				var __il=update.removed;
				var __jl=__il instanceof Array ? __il : Object.getOwnPropertyNames(__il||{});
				var __ll=__jl.length;
				for (var __kl=0;__kl<__ll;__kl++){
					var __hk=(__jl===__il)?__kl:__jl[__kl];
					var _=__il[__hk];
					// This is the body of the iteration with (value=_, key/index=__hk) in __il
					removed_dict[_] = true;
					changed_dict[_] = true;
				}
				update.added = added_dict;
				update.updated = updated_dict;
				update.changed = changed_dict;
				update.removed = removed_dict;
				if (trigger) {
					self.delayUpdate();
					self.onStateUpdated.trigger(update, self);
					if (has_changed) {
						self.onStateChanged.trigger(update, self);
						self.lastUpdate = update;
					}
				}
				self._isApplying = false;
				if (trigger) {
					self.applyUpdate();
				}
				return update;
			} else {
				return false;
			}
		},
		
		/**
		  * Parses the given text string. If `useCustom` is true the `options fromString`
		  * URL parser will be used to do the parsing, otherwise the default `FromString`
		  * will be used.
		  * 
		*/
		fromString: function(text, useCustom) {
			var self = this;
			if (useCustom === undefined) {useCustom=true}
			if (useCustom && self.options.fromString) {
				return self.options.fromString(text, self);
			} else {
				return self.getClass().getOperation('FromString')(text);
			}
		},
		
		asString: function(state) {
			var self = this;
			if (state === undefined) {state=self.currentState}
			if (self.options.asString) {
				return self.options.asString(state, self);
			} else {
				return self.getClass().getOperation('AsString')(state);
			}
		},
		
		previousAsString: function() {
			var self = this;
			return self.asString(self.previousState);
		}
	},
	operations:{
		FromString: function( url, pathSep, itemSep, valueSep ){
			var self = this;
			if (pathSep === undefined) {pathSep="!"}
			if (itemSep === undefined) {itemSep="&"}
			if (valueSep === undefined) {valueSep="="}
			res = {};
			var url = (url || "");
			var path_sep_i = url.indexOf(pathSep);
			var value_sep_i = url.indexOf(valueSep);
			if ((path_sep_i == -1) && (value_sep_i == -1)) {
				res[__module__.PATH_KEY] = url;
			} else {
				if (path_sep_i >= 0) {
					res[__module__.PATH_KEY] = extend.slice(url,0,path_sep_i);
					url = extend.slice(url,(path_sep_i + 1),undefined);
				}
				// Iterates over `url.split(itemSep)`. This works on array,objects and null/undefined
				var __ol=url.split(itemSep);
				var __nl=__ol instanceof Array ? __ol : Object.getOwnPropertyNames(__ol||{});
				var __ql=__nl.length;
				for (var __pl=0;__pl<__ql;__pl++){
					var __ml=(__nl===__ol)?__pl:__nl[__pl];
					var key_value=__ol[__ml];
					// This is the body of the iteration with (value=key_value, key/index=__ml) in __ol
					var equal = key_value.indexOf(valueSep);;
					if (equal != -1) {
						var key = decodeURIComponent(extend.slice(key_value,0,equal));
						var value = decodeURIComponent(extend.slice(key_value,(equal + 1),undefined));
						if (value == "true") {
							value = true;
						} else if (value == "false") {
							value = false;
						}
						res[key] = value;
					} else {
						var key = decodeURIComponent(key_value);
						res[key] = "";
					};
				}
			}
			return res;
		},
		AsString: function( values, pathSep, itemSep, valueSep ){
			var self = this;
			if (pathSep === undefined) {pathSep="!"}
			if (itemSep === undefined) {itemSep="&"}
			if (valueSep === undefined) {valueSep="="}
			var result = undefined;
			var path = "";
			var rest = [];
			// Iterates over `values`. This works on array,objects and null/undefined
			var __rl=values;
			var __sl=__rl instanceof Array ? __rl : Object.getOwnPropertyNames(__rl||{});
			var __ul=__sl.length;
			for (var __tl=0;__tl<__ul;__tl++){
				var key=(__sl===__rl)?__tl:__sl[__tl];
				var value=__rl[key];
				// This is the body of the iteration with (value=value, key/index=key) in __rl
				if (key == __module__.PATH_KEY) {
					path = value;
				} else {
					if (extend.isDefined(value)) {
						var r = encodeURIComponent(key);
						r = (r + (valueSep + encodeURIComponent(value)));
						rest.push(r);
					}
				};
			}
			rest = rest.join(itemSep);
			if ((path.length > 0) && (rest.length > 0)) {
				return ((path + pathSep) + rest);
			} else if ((path.length == 0) && (rest.length > 0)) {
				return (pathSep + rest);
			} else if ((path.length > 0) && (rest.length == 0)) {
				return path;
			} else {
				return "";
			}
		}
	}
})
/**
  * A state store that serializes and deserializes the state in the
  * `window.location.hash` property, allowing to do lightweight deep-linking
  * 
  * NOTE: For now, this class requires `jQuery.address` to be present.
  * 
*/
linking.URLState = extend.Class({
	name  :'linking.URLState',
	parent: __module__.State,
	shared: {
		Instance: null,
		MODE_HTML5_HISTORY: "html5-history",
		MODE_HASHCHANGE: "hashchange",
		OPTIONS: {"prefix":"/"}
	},
	properties: {
		mode:undefined,
		_cachedURL:undefined
	},
	initialize: function( options ){
		var self = this;
		if (options === undefined) {options=null}
		self.getSuper(__module__.URLState.getParent())(options);
		self.onStateChanged.bind(self.getMethod('_doStateChanged') );
		if (extend.isDefined(window.history) && extend.isDefined(window.history.pushState)) {
			self.mode = self.getClass().MODE_HTML5_HISTORY;
			window.addEventListener("popstate", function(event) {
				return self._onURLHashChanged(event);
			});
		} else {
			self.mode = self.getClass().MODE_HASHCHANGE;
			window.addEventListener("hashchange", function(event) {
				return self._onURLHashChanged(event);
			});
		}
		if ((!options) || options.init) {
			self.init();
		}
	},
	methods: {
		init: function() {
			var self = this;
			self._onURLHashChanged();
		},
		
		_onURLHashChanged: function(event) {
			var self = this;
			var part = ((document.location.pathname + document.location.search) + document.location.hash);
			if (part.indexOf(self.options.prefix) == 0) {
				part = extend.slice(part,self.options.prefix.length,undefined);
			}
			self.set(self.fromString(part), undefined, self.getClass().EXTERNAL);
		},
		
		setPath: function(value) {
			var self = this;
			var res = self.update(__module__.PATH_KEY, value);
			return res;
		},
		
		setDefaults: function(defaults) {
			var self = this;
			self.getSuper(__module__.URLState.getParent()).setDefaults(defaults);
			self._doStateChanged();
		},
		
		getLocation: function() {
			var self = this;
			return document.location;
		},
		
		_doStateChanged: function(event) {
			var self = this;
			if (self.mode == self.getClass().MODE_HTML5_HISTORY) {
				var url = self.getURL();
				if (self._cachedURL != url) {
					_cacheURL = url;
					window.history.pushState(self.get(), "Update", url);
				}
			} else {
				var current_href = self.getLocation().href;
				var new_href = self.getURL();
				if (current_href != new_href) {
					self.getLocation().href = new_href;
				}
			}
		},
		
		getURL: function() {
			var self = this;
			var res = self.asString();
			if (self.options.prefix) {
				if ((res.length > 0) && (res.indexOf(self.options.prefix) != 0)) {
					res = (self.options.prefix + res);
				}
			}
			return res;
		}
	},
	operations:{
		Set: function( value ){
			var self = this;
			return self.Install().set(value);
		},
		Install: function( options ){
			var self = this;
			if (options === undefined) {options={"init":true}}
			if (!self.Instance) {
				self.Instance = new self(options);
			}
			return self.Instance;
		}
	}
})

linking.URLHashState = extend.Class({
	name  :'linking.URLHashState',
	parent: __module__.URLState,
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.URLHashState.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		/**
		  * Invoked when the hash has changed (usually, by manual edit)
		  * 
		*/
		_onURLHashChanged: function(event) {
			var self = this;
			var hash = document.location.hash;
			var query = hash.indexOf("?");
			if (query != -1) {
				hash = extend.slice(hash,0,query);
			}
			if (hash && (hash[0] == "#")) {
				hash = extend.slice(hash,1,undefined);
			}
			self.set(self.fromString(hash), undefined, self.getClass().EXTERNAL);
		},
		
		/**
		  * Invoked when the (internal) state has changed. The state changed
		  * can be triggered by the URL hash change or by directly manipulating
		  * the state through its set/update/remove methods.
		  * 
		*/
		_doStateChanged: function(event) {
			var self = this;
			if (self.mode == self.getClass().MODE_HTML5_HISTORY) {
				var url = self.getURL();
				if (self._cachedURL != url) {
					_cacheURL = url;
					window.history.pushState(self.get(), "Update", url);
				}
			} else {
				var current_href = self.getLocation().href;
				var new_href = self.getURL();
				if (current_href != new_href) {
					self.getLocation().href = new_href;
				}
			}
		},
		
		getURL: function() {
			var self = this;
			var hash = self.asString();
			var href = self.getLocation().href;
			var res = href;
			if (hash.length > 0) {
				var i = href.indexOf("#");
				if (i > 0) {
					res = ((extend.slice(href,0,i) + "#") + hash);
				} else {
					res = ((href + "#") + hash);
				}
			} else {
				var i = href.indexOf("#");
				if (i > 0) {
					if (self.mode == self.getClass().MODE_HTML5_HISTORY) {
						res = extend.slice(href,0,(i + 0));
					} else {
						res = extend.slice(href,0,(i + 1));
					}
				}
			}
			return res;
		}
	}
})
/**
  * A state store that serializes and deserializes the state in a cookie
  * property.
  * 
*/
linking.CookieState = extend.Class({
	name  :'linking.CookieState',
	parent: __module__.State,
	shared: {
		Instance: null,
		OPTIONS: {"cookie":"state"}
	},
	initialize: function( options ){
		var self = this;
		if (options === undefined) {options=null}
		if (extend.isString(options)) {
			options = {"cookie":options};
		}
		self.getSuper(__module__.CookieState.getParent())(options);
		self.updateFromCookie();
		self.onStateChanged.bind(self.getMethod('_doStateChanged') );
	},
	methods: {
		updateFromCookie: function(cookie) {
			var self = this;
			if (cookie === undefined) {cookie=self.options.cookie}
			var value = self.getClass().getOperation('GetCookie')(cookie);
			return self.set(__module__.State.FromString(value));
		},
		
		_doStateChanged: function(event) {
			var self = this;
			var value = __module__.State.AsString(event.values);
			self.getClass().getOperation('SetCookie')(self.options.cookie, value);
		}
	},
	operations:{
		Cookies: function(  ){
			var self = this;
			 var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
			 for (var nIdx = 0; nIdx < aKeys.length; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
			return aKeys;
			
		},
		HasCookie: function( name ){
			var self = this;
			var sKey = name;
			return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
			
		},
		GetCookie: function( name ){
			var self = this;
			if (name === undefined) {name=self.options.cookie}
			var sKey = name;
			return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
			
		},
		Clear: function(  ){
			var self = this;
			// Iterates over `self.Cookies()`. This works on array,objects and null/undefined
			var __wl=self.Cookies();
			var __xl=__wl instanceof Array ? __wl : Object.getOwnPropertyNames(__wl||{});
			var __zl=__xl.length;
			for (var __yl=0;__yl<__zl;__yl++){
				var __vl=(__xl===__wl)?__yl:__xl[__yl];
				var key=__wl[__vl];
				// This is the body of the iteration with (value=key, key/index=__vl) in __wl
				self.RemoveCookie(key);
			}
		},
		Get: function( name ){
			var self = this;
			return new __module__.CookieState(name);
		},
		Set: function( value ){
			var self = this;
			return Install().set(value);
		},
		RemoveCookie: function( name, path, domain ){
			var self = this;
			if (path === undefined) {path=null}
			if (domain === undefined) {domain=null}
			var sKey = name;
			var sPath = path;
			var sDomain = domain;
			if (!sKey || !self.HasCookie(sKey)) { return false; }
			document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + ( sDomain ? "; domain=" + sDomain : "") + ( sPath ? "; path=" + sPath : "");
			
			return self;
		},
		SetCookie: function( name, value, date, path, domain, isSecure ){
			var self = this;
			if (date === undefined) {date=Infinity}
			if (path === undefined) {path=null}
			if (domain === undefined) {domain=null}
			if (isSecure === undefined) {isSecure=false}
			var sKey = name;
			var sValue = value;
			var vEnd = date;
			var sPath = path;
			var sDomain = domain;
			var bSecure = isSecure;
			if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
			var sExpires = "";
			if (vEnd) {
			  switch (vEnd.constructor) {
				case Number:
				  sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
				  break;
				case String:
				  sExpires = "; expires=" + vEnd;
				  break;
				case Date:
				  sExpires = "; expires=" + vEnd.toUTCString();
				  break;
			  }
			}
			var cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
			document.cookie = cookie;
			
			return value;
		}
	}
})
/**
  * Changes the link behaviour so that the "href" is interpreted like this:
  * - if it starts with a `+`, the string after the `+` will be parsed and merged
  * in the current URL state
  * - if it starts with a `-`, the string after the `-` will be parsed and removed
  * from the current URL state
  * - otherwise the content of the `href` will replace the current URL state
  * 
*/
linking._onLinkClicked = function(link, state, force){
	var self = linking;
	if (force === undefined) {force=false}
	link = __module__.$(link);
	var href = (link.attr("href") || "");
	var t = link.attr("target");
	if ((href.indexOf("http://") == 0) || (href.indexOf("https://") == 0)) {
		window.open(href, (t || "_blank"));
		window.focus();
		return false;
	} else if (href && (href[0] == "#")) {
		if (href == "#<") {
			state.back();
		} else if ((href.length > 1) && (href[1] == "+")) {
			state.update(state.fromString(extend.slice(href,2,undefined)));
		} else if ((href.length > 1) && (href[1] == "-")) {
			state.remove(state.fromString(extend.slice(href,2,undefined)));
		} else if ((href.length > 1) && (href[1] == "~")) {
			state.toggle(state.fromString(extend.slice(href,2,undefined)));
		} else if ((href.length > 1) && (href[1] == "=")) {
			state.set(state.fromString(extend.slice(href,2,undefined)));
		} else {
			var values = state.fromString(extend.slice(href,1,undefined));
			state.set(values);
		}
		return false;
	} else {
		return true;
	}
}
/**
  * An alias to bindLinks
  * 
*/
linking.bindLink = function(state, lui){
	var self = linking;
	return __module__.bindLinks(state, lui);
}
/**
  * Updates the links behaviour so that you can add/remove/update parts of the
  * given URL `state` with the links href attributes.
  * 
*/
linking.bindLinks = function(state, context, matching){
	var self = linking;
	if (context === undefined) {context=null}
	if (matching === undefined) {matching="a.internal"}
	!(((state && state.isInstance) && state.isInstance(__module__.State))) && extend.assert(false, "linking.bindLinks:", "State must be an instance of linking.State", "(failed `((state && state.isInstance) && state.isInstance(__module__.State))`)");
	var callback = state.getMethod("_bindLinkCallback");
	var scope = null;
	if ((context && context.jquery) && context.is("a")) {
		scope = __module__.$(context);
	} else if (context && __module__.$(context).is(matching)) {
		scope = __module__.$(context);
	} else {
		scope = __module__.$(matching, context);
	}
	if (window.interaction) {
		state._bindLinkHandler().bind(scope);
	} else if (window.widgets) {
		widgets.click(context, callback);
	} else {
		__module__.$(context).click(callback);
	}
	return scope.length;
}
linking.init = function(){
	var self = linking;
}
if (typeof(linking.init)!="undefined") {linking.init();}

// START:VANILLA_POSTAMBLE
return linking;})(linking);
// END:VANILLA_POSTAMBLE
