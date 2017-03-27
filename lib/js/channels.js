// 8< ---[channels.js]---
/**
  * The channels module defines objects that make JavaScript client-side HTTP
  * communication easier by providing the 'Future' and 'Channel' abstractions
  * well known from some concurrent programming languages and frameworks.
  * 
*/
// START:VANILLA_PREAMBLE
var channels=typeof(extend)!='undefined' ? extend.module('channels') : (typeof(channels)!='undefined' ? channels : {});
(function(channels){
var __module__=channels;
// END:VANILLA_PREAMBLE

channels.__VERSION__='1.7.3';
channels.LICENSE = "http://ffctn.com/doc/licenses/bsd";
channels.IS_IE = (navigator.userAgent.indexOf("MSIE") >= 0);
channels.HTTP = null;
channels.SHTTP = null;
channels.JSONP = null;
channels.ExceptionHandler = function(e) {
	extend.print(("channels.ExceptionHandler: " + e));
	throw e;
};
/**
  * A rendez-vous allows to set a callback that will be invoked when an
  * expected number of participant is reached. This is similar to the Semaphore
  * construct, excepted that it is "inversed".
  * 
*/
channels.RendezVous = extend.Class({
	name  :'channels.RendezVous',
	parent: undefined,
	shared: {
		TIMEOUT: 5000
	},
	properties: {
		expected:undefined,
		joined:undefined,
		participants:undefined,
		meetCallbacks:undefined,
		joinCallbacks:undefined,
		failCallbacks:undefined,
		data:undefined,
		_timeout:undefined
	},
	/**
	  * Creates a new rendez-vous with the 'expected' number of participants
	  * 
	*/
	initialize: function( expected ){
		var self = this;
		if (expected === undefined) {expected=0}
		// Default initialization of property `expected`
		if (typeof(self.expected)=='undefined') {self.expected = 0;};
		// Default initialization of property `joined`
		if (typeof(self.joined)=='undefined') {self.joined = 0;};
		// Default initialization of property `participants`
		if (typeof(self.participants)=='undefined') {self.participants = [];};
		// Default initialization of property `meetCallbacks`
		if (typeof(self.meetCallbacks)=='undefined') {self.meetCallbacks = [];};
		// Default initialization of property `joinCallbacks`
		if (typeof(self.joinCallbacks)=='undefined') {self.joinCallbacks = [];};
		// Default initialization of property `failCallbacks`
		if (typeof(self.failCallbacks)=='undefined') {self.failCallbacks = [];};
		// Default initialization of property `data`
		if (typeof(self.data)=='undefined') {self.data = {};};
		// Default initialization of property `_timeout`
		if (typeof(self._timeout)=='undefined') {self._timeout = undefined;};
		self.expected = expected;
	},
	methods: {
		/**
		  * Transparently registers the future. If `name` is given, the future's
		  * result will be stored as the given name in the RendezVous data map.
		  * 
		*/
		register: function(future, name) {
			var self = this;
			if (name === undefined) {name=undefined}
			self.increaseExpected();
			!(__module__.Future.hasInstance(future)) && extend.assert(false, "channels.RendezVous.register:", "RendezVous.register(): Expected Future instance, got:", future, "(failed `__module__.Future.hasInstance(future)`)");
			future.onSucceed(function(v) {
				if (extend.isDefined(name)) {
					self.data[name] = v;
				}
				return self.join(future);
			});
			return future;
		},
		
		/**
		  * Set the expected 'value'. This will trigger the callbacks registered with the
		  * 'onMeet' method.
		  * 
		*/
		setExpected: function(value) {
			var self = this;
			self.expected = value;
			self.trigger();
		},
		
		increaseExpected: function() {
			var self = this;
			self.setExpected((self.expected + 1));
		},
		
		/**
		  * Called by a participant when it joins the rendez-vous. The given 'participant'
		  * value will be added to the list of participants.
		  * 
		*/
		join: function(participants) {
			var self = this;
			participants = extend.sliceArguments(arguments,0)
			if (extend.len(participants) == 0) {
				participants = [true];
			}
			// Iterates over `participants`. This works on array,objects and null/undefined
			var __j=participants;
			var __k=__j instanceof Array ? __j : Object.getOwnPropertyNames(__j||{});
			var __m=__k.length;
			for (var __l=0;__l<__m;__l++){
				var __i=(__k===__j)?__l:__k[__l];
				var participant=__j[__i];
				// This is the body of the iteration with (value=participant, key/index=__i) in __j
				self.participants.push(participant);
				self.joined = (self.joined + 1);
				// Iterates over `self.joinCallbacks`. This works on array,objects and null/undefined
				var __n=self.joinCallbacks;
				var __p=__n instanceof Array ? __n : Object.getOwnPropertyNames(__n||{});
				var __r=__p.length;
				for (var __q=0;__q<__r;__q++){
					var __o=(__p===__n)?__q:__p[__q];
					var c=__n[__o];
					// This is the body of the iteration with (value=c, key/index=__o) in __n
					c(participant, self);
				};
			}
			self.trigger();
		},
		
		/**
		  * An alias to 'onMeet' added for 'events.EventSource' compatibility
		  * 
		*/
		bind: function(callback) {
			var self = this;
			return self.onMeet(callback);
		},
		
		/**
		  * Registers a callback that will be invoked with this rendez-vous when it
		  * is met. If the rendez-vous is already met, the callback will be invoked
		  * directly.
		  * 
		*/
		onMeet: function(callback) {
			var self = this;
			if (callback) {
				self.meetCallbacks.push(callback);
				if (self.isMet()) {
					callback(self);
				}
			}
			return self;
		},
		
		/**
		  * Registers a callback that will be invoked with this rendez-vous when it
		  * is met. If the rendez-vous is already met, the callback will be invoked
		  * directly.
		  * 
		*/
		onJoin: function(callback) {
			var self = this;
			if (callback) {
				self.joinCallbacks.push(callback);
			}
			return self;
		},
		
		/**
		  * An alias for `onJoin` callback
		  * 
		*/
		onPartial: function(callback) {
			var self = this;
			return self.onJoin(callback);
		},
		
		/**
		  * An alias for onMeet, so RDV can be used like a future
		  * 
		*/
		onSucceed: function(callback) {
			var self = this;
			return self.onMeet(callback);
		},
		
		onFail: function(callback) {
			var self = this;
			if (callback) {
				self.failCallbacks.push(callback);
			}
			return self;
		},
		
		fail: function() {
			var self = this;
			self._cancelTimeout();
			// Iterates over `self.failCallbacks`. This works on array,objects and null/undefined
			var __t=self.failCallbacks;
			var __u=__t instanceof Array ? __t : Object.getOwnPropertyNames(__t||{});
			var __w=__u.length;
			for (var __v=0;__v<__w;__v++){
				var __s=(__u===__t)?__v:__u[__v];
				var _=__t[__s];
				// This is the body of the iteration with (value=_, key/index=__s) in __t
				_(self);
			}
		},
		
		/**
		  * Sets the failure timeout
		  * 
		*/
		setTimeout: function(timeout) {
			var self = this;
			if (timeout === undefined) {timeout=self.getClass().TIMEOUT}
			self._cancelTimeout();
			self._timeout = window.setTimeout(self.getMethod('fail') , timeout);
			return self;
		},
		
		/**
		  * Cancels the failure timeout
		  * 
		*/
		_cancelTimeout: function() {
			var self = this;
			if (self._timeout) {
				window.clearTimeout(self._timeout);
			}
			self._timeout = undefined;
			return self;
		},
		
		/**
		  * Invokes the 'onMeet' callbacks when the number of participants is greater
		  * or equal to the expected number of partipiants.
		  * 
		*/
		trigger: function() {
			var self = this;
			if (self.isMet()) {
				self._cancelTimeout();
				// Iterates over `self.meetCallbacks`. This works on array,objects and null/undefined
				var __y=self.meetCallbacks;
				var __z=__y instanceof Array ? __y : Object.getOwnPropertyNames(__y||{});
				var __b=__z.length;
				for (var __a=0;__a<__b;__a++){
					var __x=(__z===__y)?__a:__z[__a];
					var c=__y[__x];
					// This is the body of the iteration with (value=c, key/index=__x) in __y
					c(self);
				}
			}
		},
		
		getProgress: function() {
			var self = this;
			return ((1.0 * self.participants.length) / self.expected);
		},
		
		/**
		  * Tells if the rendez-vous has been met or not
		  * 
		*/
		isMet: function() {
			var self = this;
			return (self.participants.length >= self.expected);
		},
		
		count: function() {
			var self = this;
			return self.participants.length;
		}
	}
})
/**
  * A Future represents the promise of a future value returned by an invocation
  * that started an asynchronous process. In other words, a future is a value that
  * ''wraps the future value'' that will be later returned by a process that is
  * not able to give the value directly.
  * 
  * The typical use of Futures is when you are doing networking, such as
  * asynchronous HTTP GETs on a web client: you won't have the response directly
  * (because the HTTP GET is synchronous) but you may want to do things in the
  * meantime.
  * 
  * Futures provide an interesting abstraction to deal with these situations.
  * This implementation of Futures was inspired from the Oz programming language.
  * 
*/
channels.Future = extend.Class({
	name  :'channels.Future',
	parent: undefined,
	shared: {
		STATES: {"WAITING":1, "SET":2, "FAILED":3, "CANCELLED":4},
		FAILURES: {"GENERAL":"FAILURE", "TIMEOUT":"TIMEOUT", "EXCEPTION":"EXCEPTION"},
		COUNT: 0
	},
	properties: {
		id:undefined,
		url:undefined,
		retries:undefined,
		_value:undefined,
		_rawValue:undefined,
		_failureStatus:undefined,
		_failureReason:undefined,
		_failureContext:undefined,
		_processors:undefined,
		_onSet:undefined,
		_onPartial:undefined,
		_onFail:undefined,
		_onException:undefined,
		_onCancel:undefined,
		_onRedo:undefined,
		_origin:undefined,
		state:undefined
	},
	initialize: function(  ){
		var self = this;
		// Default initialization of property `id`
		if (typeof(self.id)=='undefined') {self.id = 0;};
		// Default initialization of property `url`
		if (typeof(self.url)=='undefined') {self.url = undefined;};
		// Default initialization of property `retries`
		if (typeof(self.retries)=='undefined') {self.retries = 0;};
		// Default initialization of property `_processors`
		if (typeof(self._processors)=='undefined') {self._processors = [];};
		// Default initialization of property `_onSet`
		if (typeof(self._onSet)=='undefined') {self._onSet = [];};
		// Default initialization of property `_onPartial`
		if (typeof(self._onPartial)=='undefined') {self._onPartial = [];};
		// Default initialization of property `_onFail`
		if (typeof(self._onFail)=='undefined') {self._onFail = [];};
		// Default initialization of property `_onException`
		if (typeof(self._onException)=='undefined') {self._onException = [];};
		// Default initialization of property `_onCancel`
		if (typeof(self._onCancel)=='undefined') {self._onCancel = [];};
		self.state = self.getClass().STATES.WAITING;
		self.id = self.getClass().COUNT;
		self.getClass().COUNT = (self.getClass().COUNT + 1);
	},
	methods: {
		join: function(future) {
			var self = this;
			future.onSucceed(function(_) {
				return self.set(_);
			}).onFail(function(s, r, c) {
				return self.fail(s, r, c);
			});
			return self;
		},
		
		/**
		  * Sets the value for this future. This function can be given as a callback
		  * for an underlying asynchronous system (such as MochiKit Defered).
		  * 
		*/
		set: function(value) {
			var self = this;
			if (self.state == self.getClass().STATES.FAILED) {
				return extend.error((("Future #" + self.id) + " has already failed, cannot set value. You might need to increase the timeout value."));
			} else if (self.state == self.getClass().STATES.SET) {
				if (value != self._value) {
					return extend.error((("Future #" + self.id) + " has already been set, cannot re-set with different value."));
				} else {
					return self;
				}
			}
			self._rawValue = value;
			self._value = value;
			self.state = self.getClass().STATES.SET;
			// Iterates over `self._processors`. This works on array,objects and null/undefined
			var __d=self._processors;
			var __e=__d instanceof Array ? __d : Object.getOwnPropertyNames(__d||{});
			var __g=__e.length;
			for (var __f=0;__f<__g;__f++){
				var __c=(__e===__d)?__f:__e[__f];
				var p=__d[__c];
				// This is the body of the iteration with (value=p, key/index=__c) in __d
				if (self.state == self.getClass().STATES.SET) {
					try {
						self._value = p(self._value, self)
					} catch(e) {
						self._handleException(e)
					}
				};
			}
			if (self.state == self.getClass().STATES.SET) {
				// Iterates over `self._onSet`. This works on array,objects and null/undefined
				var __ij=self._onSet;
				var __jj=__ij instanceof Array ? __ij : Object.getOwnPropertyNames(__ij||{});
				var __lj=__jj.length;
				for (var __kj=0;__kj<__lj;__kj++){
					var __h=(__jj===__ij)?__kj:__jj[__kj];
					var c=__ij[__h];
					// This is the body of the iteration with (value=c, key/index=__h) in __ij
					try {
						c(self._value, self)
					} catch(e) {
						self._handleException(e)
					};
				}
			}
			return self;
		},
		
		/**
		  * Some future values may be updated sequentially, this happens when you do a
		  * request to a streaming HTTP service (also known as Comet).
		  * 
		*/
		setPartial: function(value) {
			var self = this;
			self._rawValue = value;
			self._value = value;
			// Iterates over `self._onPartial`. This works on array,objects and null/undefined
			var __oj=self._onPartial;
			var __nj=__oj instanceof Array ? __oj : Object.getOwnPropertyNames(__oj||{});
			var __qj=__nj.length;
			for (var __pj=0;__pj<__qj;__pj++){
				var __mj=(__nj===__oj)?__pj:__nj[__pj];
				var c=__oj[__mj];
				// This is the body of the iteration with (value=c, key/index=__mj) in __oj
				try {
					c(self._value, self)
				} catch(e) {
					self._handleException(e)
				};
			}
			return self;
		},
		
		/**
		  * This is an alias for 'value'
		  * 
		*/
		get: function() {
			var self = this;
			return self.value();
		},
		
		/**
		  * Cancels the retrieval of the value. This will invoke the onCancel callbacks, only
		  * if the Future state is WAITING.
		  * 
		*/
		cancel: function() {
			var self = this;
			if (self.state == self.getClass().STATES.WAITING) {
				self.state = self.getClass().STATES.CANCELLED;
				// Iterates over `self._onCancel`. This works on array,objects and null/undefined
				var __sj=self._onCancel;
				var __tj=__sj instanceof Array ? __sj : Object.getOwnPropertyNames(__sj||{});
				var __vj=__tj.length;
				for (var __uj=0;__uj<__vj;__uj++){
					var __rj=(__tj===__sj)?__uj:__tj[__uj];
					var c=__sj[__rj];
					// This is the body of the iteration with (value=c, key/index=__rj) in __sj
					try {
						c(self._value, self)
					} catch(e) {
						self._handleException(e)
					};
				}
			}
		},
		
		/**
		  * Returns the value for this future. This will return 'Undefined' until the
		  * value is set. If you want to know if the value is set you can query the
		  * 'state' property of the future or invoke the 'isSet' method.
		  * 
		*/
		value: function() {
			var self = this;
			return self._value;
		},
		
		/**
		  * Returns the raw (unprocessed) value, which might be the same as value
		  * in case the value was unprocessed.
		  * 
		*/
		rawValue: function() {
			var self = this;
			return self._rawValue;
		},
		
		/**
		  * Fails this future with the given (optional) 'status' (machine-readbale
		  * code), 'reason' (human-readable string) and context (the value that
		  * originated the failure).
		  * 
		  * >   future fail ( f FAILURES TIMEOUT,  "Timeout of 2000ms exceeded")
		  * 
		  * Could mean to the application that the future failed because the timeout
		  * value of 2000 was reached.
		  * 
		*/
		fail: function(status, reason, context) {
			var self = this;
			if (status === undefined) {status=self.getClass().FAILURES.GENERAL}
			if (reason === undefined) {reason=undefined}
			if (context === undefined) {context=undefined}
			self.state = self.getClass().STATES.FAILED;
			self._failureStatus = status;
			self._failureReason = reason;
			self._failureContext = context;
			// Iterates over `self._onFail`. This works on array,objects and null/undefined
			var __xj=self._onFail;
			var __yj=__xj instanceof Array ? __xj : Object.getOwnPropertyNames(__xj||{});
			var __aj=__yj.length;
			for (var __zj=0;__zj<__aj;__zj++){
				var __wj=(__yj===__xj)?__zj:__yj[__zj];
				var c=__xj[__wj];
				// This is the body of the iteration with (value=c, key/index=__wj) in __xj
				try {
					c(status, reason, context, self)
				} catch(e) {
					self._handleException(e)
				};
			}
			return self;
		},
		
		/**
		  * Tells if this future value was set or not.
		  * 
		*/
		isSet: function() {
			var self = this;
			return (self.state === self.getClass().STATES.SET);
		},
		
		/**
		  * Tells if this future value was cancelled
		  * 
		*/
		isCancelled: function() {
			var self = this;
			return (self.state == self.getClass().STATES.CANCELLED);
		},
		
		/**
		  * Tells if this future has failed or not
		  * 
		*/
		hasFailed: function() {
			var self = this;
			return (self.state === self.getClass().STATES.FAILED);
		},
		
		/**
		  * Tells if this future has succeeded or not (this is an alias for 'isSet')
		  * 
		*/
		hasSucceeded: function() {
			var self = this;
			return self.isSet();
		},
		
		/**
		  * Registers the given callback to be invoked when this future value is set.
		  * The callback will take the value as first argument and the future as
		  * second argument.
		  * 
		  * >    future onSet {v,f| print ("Received value", v, "from future", f)}
		  * 
		*/
		onSet: function(callback) {
			var self = this;
			if (__module__.Future.hasInstance(callback)) {
				callback = callback.getMethod("set");
				!(callback) && extend.assert(false, "channels.Future.onSet:", "", "(failed `callback`)");
			}
			self._onSet.push(callback);
			if (self.hasSucceeded()) {
				try {
					callback(self._value, self)
				} catch(e) {
					self._handleException(e)
				}
			}
			return self;
		},
		
		/**
		  * Registers the given callback to be invoked when this future value is
		  * partially set. Some values (especially those coming from streaming sources)
		  * may be received in success "packets". Callbacks will be invoked with the
		  * partial value and this future as argument.
		  * 
		  * Note that the value will not be processed, as it is partial.
		  * 
		*/
		onPartial: function(callback) {
			var self = this;
			self._onPartial.push(callback);
			return self;
		},
		
		/**
		  * This is just an alias for 'onSet', as if you use 'onFail' often,
		  * you'll be tempted to use 'onSucceed' as well.
		  * 
		*/
		onSucceed: function(callback) {
			var self = this;
			return self.onSet(callback);
		},
		
		/**
		  * Registers the given callback to be invoked when this future fails.
		  * The callback takes the following arguments:
		  * 
		  * - the 'status' for the failure (ie. machine-readable description of the error)
		  * - the 'reason' for the failure (ie. human-readable description of the error)
		  * - the 'context' for the exception, so that clients have the opportunity
		  * - the 'future' in which the failure happened
		  * 
		  * Example:
		  * 
		  * >    # s = status, r = reason, c = context, f = future
		  * >    future onFail {s,r,c,f| print ("Future", f, "failed: with code", s, " reason is ", r, "in context", c)}
		  * 
		  * 
		  * NOTE: failures and exceptions are different things, a failure means that the
		  * future won't have its value set (because something happened in the pipe), while
		  * an exception means that the code broke at some point.
		  * 
		*/
		onFail: function(callback) {
			var self = this;
			if (__module__.Future.hasInstance(callback)) {
				callback = callback.getMethod("fail");
			}
			self._onFail.push(callback);
			if (self.hasFailed()) {
				try {
					callback(self._value, self)
				} catch(e) {
					self._handleException(e)
				}
			}
			return self;
		},
		
		/**
		  * Registers a callback to handle exceptions that may happen when executing the
		  * onFail or onSucceed callbacks. Exception callbacks are added LIFO and are chained:
		  * each callback takes the exception 'e' and the future 'f' as parameters, and will
		  * block propagation to the next by returning 'False'.
		  * 
		*/
		onException: function(callback) {
			var self = this;
			self._onException.splice(0, 0, callback);
			return self;
		},
		
		/**
		  * Registers the given callback to be executed when the future is cancelled. Usually, it is the
		  * process that creates the Future that will register an 'onCancel' callback first. For instance,
		  * an Future returned by an HTTP Request would have an onCancel callback that would just close the
		  * associated HTTP request.
		  * 
		*/
		onCancel: function(callback) {
			var self = this;
			self._onCancel.splice(0, 0, callback);
			return self;
		},
		
		/**
		  * Returns the status for the error. The status is a machine-readable code.
		  * 
		*/
		getFailureStatus: function() {
			var self = this;
			return self._failureStatus;
		},
		
		/**
		  * Returns the reason for the error. The reason is a human-readable string.
		  * 
		*/
		getFailureReason: function() {
			var self = this;
			return self._failureReason;
		},
		
		/**
		  * Returns the context in which the failure happened. For HTTP channels, this
		  * will be the reference to the HTTP request that failed.
		  * 
		*/
		getFailureContext: function() {
			var self = this;
			return self._failureContext;
		},
		
		/**
		  * Sets the object that originate this future. HTTP channels will set the
		  * XMLHttpRequest object as the origin of the future.
		  * 
		*/
		setOrigin: function(origin) {
			var self = this;
			self._origin = origin;
			return self;
		},
		
		getOrigin: function() {
			var self = this;
			return self._origin;
		},
		
		/**
		  * Invoked when a future had and exception. This invokes every callback registered
		  * in the 'onException' list (which were previously registered using the
		  * 'onFail' method).
		  * 
		*/
		_handleException: function(e) {
			var self = this;
			var i = 0;
			var r = true;
			while ((i < self._onException.length)) {
				if (self._onException[i](e, this) == false) {
					i = (exceptionCallbacks.length + 1);
					r = false;
				}
				i = (i + 1);
			}
			if (i == 0) {
				__module__.ExceptionHandler(e);
			}
			return r;
		},
		
		/**
		  * Redoing a future will basically invoke the 'redo' callback set
		  * with the 'onRedo' function. Typical use of 'redo' is to take an
		  * existing future and to bind the function that created the value as
		  * 'redo', so that getting a "fresher" value can simply be done
		  * by calling 'redo'.
		  * 
		  * Example:
		  * 
		  * >    var c = new channels SyncChannel ()
		  * >    var f = c get "this/url"
		  * >
		  * >    # We bind a redo function
		  * >    f onRedo {c get ("this/url", f)}
		  * >
		  * >    # We bind success callbacks
		  * >    f onSucceed {d|print ("Received:",d}
		  * >
		  * >    # We should see that the data was received
		  * >    # and if we redo, we should see the
		  * >    # 'Reveived:...' text again
		  * >    f redo ()
		  * >
		  * >    # And we can call redo multiple times
		  * >    f redo ()
		  * 
		  * It's particularly useful to use 'redo' along with 'process',
		  * especially when you're querying URLs frequently.
		  * 
		*/
		redo: function() {
			var self = this;
			self.state = self.getClass().STATES.WAITING;
			if (self._onRedo) {
				self._onRedo(self);
			}
			return self;
		},
		
		canRetry: function(maxRetry) {
			var self = this;
			if (maxRetry === undefined) {maxRetry=5}
			return (self.retries < maxRetry);
		},
		
		/**
		  * Retries the Future (which means that you should set an
		  * 'onRedo' callback). If the number of 'retries' for this
		  * future is less than 'maxRetry', then the redo will be made
		  * and 'True' will be returned. Otherwise 'False' is returned.
		  * 
		*/
		retry: function(maxRetry, delay) {
			var self = this;
			if (maxRetry === undefined) {maxRetry=5}
			if (delay === undefined) {delay=0}
			if (self.retries < maxRetry) {
				self.retries = (self.retries + 1);
				if (delay > 0) {
					window.setTimeout(self.getMethod('redo') , delay);
				} else {
					self.redo();
				}
				return true;
			} else {
				return false;
			}
		},
		
		/**
		  * Sets the callback that will be invoked with this future as argument
		  * when the 'redo' method is invoked. There can be only one redo
		  * callback per future, which means that the previous redo function
		  * will be replaced by the newly given callback.
		  * 
		  * See 'redo' for an example.
		  * 
		*/
		onRedo: function(callback) {
			var self = this;
			self._onRedo = callback;
			return self;
		},
		
		/**
		  * Adds a callback that will process the value of this future, returning
		  * the newly processed value. Processing callback will be chained, and
		  * will work even if the future value is already set.
		  * 
		  * Processors are typically used to process the value obtained from a
		  * future.
		  * 
		  * >    var future = getFutureResult()
		  * >    future process { v | v toLowerCase() }
		  * >    future onSet   { v | print ("Lowercase value: " + v) }
		  * 
		  * It is a good idea to use processors along with the 'redo' option,
		  * so that you can easily set up a chain of processing the future value.
		  * 
		*/
		process: function(callback) {
			var self = this;
			self._processors.push(callback);
			if (self.isSet()) {
				self._value = callback(self._value);
			}
			return self;
		}
	}
})
/**
  * Channels are specific objects that allow communication operations to happen
  * in a shared context. The modus operandi is as follows:
  * 
  * - You initialize a channel with specific properties (for HTTP, this would
  * be a prefix for the URLs, wether you want to evaluate the JSON that may
  * be contained in responses, etc).
  * - You send something into the channel (typically an HTTP request)
  * - You get a 'Future' as a promise for a future result.
  * - When the result arrives, the future is set with the resulting value.
  * 
  * Synchronous channels will typically set the result directly, while for
  * asynchronous channels, the result will only be available later.
  * 
  * NOTE: The current implementation of 'Channels' is very much HTTP-oriented. At
  * a later point, the Channels class will be more generic, and will provide
  * separate specific aspects for the HTTP protocol.
  * 
*/
channels.Channel = extend.Class({
	name  :'channels.Channel',
	parent: undefined,
	properties: {
		options:undefined,
		transport:undefined,
		failureCallbacks:undefined,
		exceptionCallbacks:undefined
	},
	initialize: function( options ){
		var self = this;
		if (options === undefined) {options={}}
		// Default initialization of property `options`
		if (typeof(self.options)=='undefined') {self.options = {"prefix":"", "evalJSON":true, "evalXML":true, "forceJSON":false, "forceXML":false, "JSONP":false};};
		// Default initialization of property `transport`
		if (typeof(self.transport)=='undefined') {self.transport = __module__.HTTPTransport.Get();;};
		// Default initialization of property `failureCallbacks`
		if (typeof(self.failureCallbacks)=='undefined') {self.failureCallbacks = [];};
		// Default initialization of property `exceptionCallbacks`
		if (typeof(self.exceptionCallbacks)=='undefined') {self.exceptionCallbacks = [];};
		if (extend.isString(options)) {
			self.options.prefix = options;
		} else {
			// Iterates over `options`. This works on array,objects and null/undefined
			var __bj=options;
			var __cj=__bj instanceof Array ? __bj : Object.getOwnPropertyNames(__bj||{});
			var __ej=__cj.length;
			for (var __dj=0;__dj<__ej;__dj++){
				var k=(__cj===__bj)?__dj:__cj[__dj];
				var v=__bj[k];
				// This is the body of the iteration with (value=v, key/index=k) in __bj
				self.options[k] = v;
			}
		}
		if (options.JSONP) {
			self.transport = __module__.JSONPTransport.Get();
		}
	},
	methods: {
		isAsynchronous: function() {
			var self = this;
			return undefined;
		},
		
		isSynchronous: function() {
			var self = this;
			return undefined;
		},
		
		/**
		  * Invokes a 'GET' to the given url (prefixed by the optional 'prefix' set in
		  * this channel options) and returns a 'Future'.
		  * 
		  * The future is already bound with a 'redo' callback that will do the
		  * request again.
		  * 
		  * GET means retrieve whatever data is identified by the URI, so where the
		  * URI refers to a data-producing process, or a script which can be run by
		  * such a process, it is this data which will be returned, and not the source
		  * text of the script or process. Also used for searches .
		  * 
		*/
		get: function(url, body, headers, future) {
			var self = this;
			if (body === undefined) {body=null}
			if (headers === undefined) {headers=[]}
			if (future === undefined) {future=undefined}
			return self.request("GET", url, body, headers, future);
		},
		
		head: function(url, body, headers, future) {
			var self = this;
			if (body === undefined) {body=null}
			if (headers === undefined) {headers=[]}
			if (future === undefined) {future=undefined}
			return self.request("HEAD", url, body, headers, future);
		},
		
		/**
		  * Invokes a 'POST' to the give url (prefixed by the optional 'prefix' set in
		  * this channel options), using the given 'body' as request body, and
		  * returning a 'Future' instance.
		  * 
		  * The future is already bound with a 'redo' callback that will do the
		  * request again.
		  * 
		  * POST xreates a new object linked to the specified object. The message-id
		  * field of the new object may be set by the client or else will be given by
		  * the server. A URL will be allocated by the server and returned to the
		  * client. The new document is the data part of the request. It is considered
		  * to be subordinate to the specified object, in the way that a file is
		  * subordinate to a directory containing it, or a news article is subordinate
		  * to a newsgroup to which it is posted.
		  * 
		*/
		post: function(url, body, headers, future) {
			var self = this;
			if (body === undefined) {body=null}
			if (headers === undefined) {headers=[]}
			if (future === undefined) {future=undefined}
			return self.request("POST", url, body, headers, future);
		},
		
		/**
		  * Specifies that the data in the body section is to be stored under the
		  * supplied URL. The URL must already exist. The new contenst of the document
		  * are the data part of the request. POST and REPLY should be used for
		  * creating new documents.
		  * 
		*/
		put: function(url, body, headers, future) {
			var self = this;
			if (body === undefined) {body=null}
			if (headers === undefined) {headers=[]}
			if (future === undefined) {future=undefined}
			return self.request("PUT", url, body, headers, future);
		},
		
		update: function(url, body, headers, future) {
			var self = this;
			if (body === undefined) {body=null}
			if (headers === undefined) {headers=[]}
			if (future === undefined) {future=undefined}
			return self.request("UPDATE", url, body, headers, future);
		},
		
		delete: function(url, body, headers, future) {
			var self = this;
			if (body === undefined) {body=null}
			if (headers === undefined) {headers=[]}
			if (future === undefined) {future=undefined}
			return self.request("DELETE", url, body, headers, future);
		},
		
		trace: function(url, body, headers, future) {
			var self = this;
			if (body === undefined) {body=null}
			if (headers === undefined) {headers=[]}
			if (future === undefined) {future=undefined}
			return self.request("TRACE", url, body, headers, future);
		},
		
		/**
		  * Generic function to create an HTTP request with the given parameters
		  * 
		*/
		request: function(method, url, body, headers, future) {
			var self = this;
			if (body === undefined) {body=null}
			if (headers === undefined) {headers=[]}
			if (future === undefined) {future=undefined}
			var request_url = (self.options.prefix + url);
			var request_body = body;
			if (method.toUpperCase() == "POST") {
				if (body) {
					request_body = self.getClass().getOperation('NormalizeBody')(body, self.options.skipNone);
					if (body != request_body) {
						headers = [["Content-Type", "application/x-www-form-urlencoded"], ["Content-Length", request_body.length]].concat(headers);
					}
				}
			} else {
				if (body) {
					request_url = self.getClass().getOperation('AddParameters')(request_url, body);
					request_body = null;
				}
			}
			future = self.transport.request(self.isAsynchronous(), method, request_url, request_body, headers, (future || self._createFuture()), self.options);
			future.onRedo(function(f) {
				return self.transport.request(self.isAsynchronous(), method, request_url, request_body, headers, f, self.options);
			});
			return future;
		},
		
		/**
		  * Sets a callback that will be invoked when a future created in this channel
		  * fails. The given 'callback' takes the _reason_, _details_ and _future_ as
		  * argument, where reason and details are application-specific information
		  * (for HTTP, reason is usually a number, detail is the response text)
		  * 
		*/
		onFail: function(callback) {
			var self = this;
			self.failureCallbacks.push(callback);
		},
		
		/**
		  * Sets a callback that will be invoked when a future created in this channel
		  * raises an exception. The given 'callback' takes the _exceptoin_ and _future_ as
		  * arguments. Callbacks are inserted in LIFO style, if a callback returns 'False',
		  * propagation of the exception will stop.
		  * 
		*/
		onException: function(callback) {
			var self = this;
			self.exceptionCallbacks.splice(0, 0, callback);
		},
		
		/**
		  * Returns a new future, properly initialized for this channel
		  * 
		*/
		_createFuture: function() {
			var self = this;
			var future = new __module__.Future();
			future.onFail(self.getMethod('_futureHasFailed') );
			future.onException(self.getMethod('_futureHadException') );
			future.process(self.getMethod('_processHTTPResponse') );
			future.getException = function() {
				return eval((("(" + future.getFailureContext().getResponseHeader("X-Exception")) + ")"));
			};
			return future;
		},
		
		/**
		  * Invoked when a future has failed. This invokes every callback registered
		  * in the 'failureCallbacks' list (which were previously registered using the
		  * 'onFail' method).
		  * 
		*/
		_futureHasFailed: function(reason, details, future) {
			var self = this;
			// Iterates over `self.failureCallbacks`. This works on array,objects and null/undefined
			var __gj=self.failureCallbacks;
			var __hj=__gj instanceof Array ? __gj : Object.getOwnPropertyNames(__gj||{});
			var __jk=__hj.length;
			for (var __ik=0;__ik<__jk;__ik++){
				var __fj=(__hj===__gj)?__ik:__hj[__ik];
				var c=__gj[__fj];
				// This is the body of the iteration with (value=c, key/index=__fj) in __gj
				c(reason, details, future);
			}
		},
		
		/**
		  * Invoked when a future had and exception. This invokes every callback registered
		  * in the 'exceptionCallbacks' list (which were previously registered using the
		  * 'onFail' method).
		  * 
		*/
		_futureHadException: function(e, future) {
			var self = this;
			var i = 0;
			var r = true;
			while ((i < self.exceptionCallbacks.length)) {
				if (self.exceptionCallbacks[i](e, future) == false) {
					i = (self.exceptionCallbacks.length + 1);
					r = false;
				}
				i = (i + 1);
			}
			if (i == 0) {
				__module__.ExceptionHandler(e);
			}
			return r;
		},
		
		_processHTTPResponse: function(response) {
			var self = this;
			if (self.options.JSONP) {
				return response;
			} else if ((self.options.forceJSON && self.options.evalJSON) || (self.options.evalJSON && __module__.Channel.ResponseIsJSON(response))) {
				var res = undefined;
				try {
					res = __module__.Channel.ParseJSON(response.responseText)
				} catch(e) {
					extend.exception(e, "channels.HTTPTransport._processHTTPResponse: Invalid JSON", response.responseText)
					res = null
				}
				return res;
			} else if ((self.options.forceXML && self.options.evalXML) || (self.options.evalXML && __module__.Channel.ResponseIsXML(response))) {
				return response.responseXML;
			} else {
				return response.responseText;
			}
		}
	},
	operations:{
		AddParameters: function( url, parameters ){
			var self = this;
			var query_index = url.indexOf("?");
			var has_params = (query_index != -1);
			if (!extend.isString(parameters)) {
				var p = [];
				// Iterates over `parameters`. This works on array,objects and null/undefined
				var __kk=parameters;
				var __lk=__kk instanceof Array ? __kk : Object.getOwnPropertyNames(__kk||{});
				var __ok=__lk.length;
				for (var __mk=0;__mk<__ok;__mk++){
					var k=(__lk===__kk)?__mk:__lk[__mk];
					var v=__kk[k];
					// This is the body of the iteration with (value=v, key/index=k) in __kk
					p.push(((k + "=") + self.EncodeURI(v)));
				}
				parameters = p.join("&");
			}
			if (has_params) {
				if (query_index == (url.length - 1)) {
					return (url + parameters);
				} else {
					return ((url + "&") + parameters);
				}
			} else {
				if (parameters) {
					return ((url + "?") + parameters);
				} else {
					return url;
				}
			}
		},
		ResponseIsXML: function( response ){
			var self = this;
			var content_type = (response.getResponseHeader("Content-Type") || "").split(";")[0];
			if (content_type.indexOf("xml") >= 0) {
				return true;
			} else {
				return false;
			}
		},
		ParseJSON: function( json ){
			var self = this;
			return function() {
				return eval((("(" + json) + ")"));
			}();
		},
		NormalizeBody: function( body, skipNone ){
			var self = this;
			if (skipNone === undefined) {skipNone=false}
			if (extend.isString(body)) {
				return body;
			} else if (extend.isNumber(body)) {
				return ("" + body);
			} else if (extend.isObject(body) || extend.isList(body)) {
				if (extend.isDefined(FormData) && (body.constructor == FormData)) {
					return body;
				} else {
					var new_body = "";
					var values = [];
					// Iterates over `body`. This works on array,objects and null/undefined
					var __nk=body;
					var __pk=__nk instanceof Array ? __nk : Object.getOwnPropertyNames(__nk||{});
					var __rk=__pk.length;
					for (var __qk=0;__qk<__rk;__qk++){
						var k=(__pk===__nk)?__qk:__pk[__qk];
						var v=__nk[k];
						// This is the body of the iteration with (value=v, key/index=k) in __nk
						if (v || (!skipNone)) {
							values.push(((k + "=") + self.EncodeURI(v)));
						};
					}
					body = values.join("&");
					return body;
				}
			} else if (body || (!skipNone)) {
				return ((body || "") + "");
			} else {
				return "";
			}
		},
		/**
		  * Encodes the given value as form data, following the Rails/Grails convention
		  * 
		*/
		ToFormData: function( value, prefix, result ){
			var self = this;
			if (prefix === undefined) {prefix=""}
			if (result === undefined) {result=undefined}
			if (!extend.isDefined(result)) {
				return self.ToFormData(value, "", []).join("&\n");
			} else {
				var sep = (((prefix.length > 0) && ".") || "");
				if (extend.isMap(value)) {
					// Iterates over `value`. This works on array,objects and null/undefined
					var __sk=value;
					var __tk=__sk instanceof Array ? __sk : Object.getOwnPropertyNames(__sk||{});
					var __vk=__tk.length;
					for (var __uk=0;__uk<__vk;__uk++){
						var k=(__tk===__sk)?__uk:__tk[__uk];
						var v=__sk[k];
						// This is the body of the iteration with (value=v, key/index=k) in __sk
						self.ToFormData(v, ((prefix + sep) + k), result);
					}
				} else if (extend.isList(value)) {
					// Iterates over `value`. This works on array,objects and null/undefined
					var __wk=value;
					var __xk=__wk instanceof Array ? __wk : Object.getOwnPropertyNames(__wk||{});
					var __zk=__xk.length;
					for (var __yk=0;__yk<__zk;__yk++){
						var i=(__xk===__wk)?__yk:__xk[__yk];
						var v=__wk[i];
						// This is the body of the iteration with (value=v, key/index=i) in __wk
						self.ToFormData(v, ((prefix + sep) + i), result);
					}
				} else {
					result.push((((prefix || "value") + "=") + encodeURIComponent(value)));
				}
				return result;
			}
		},
		ResponseIsJSON: function( response ){
			var self = this;
			var content_type = (response.getResponseHeader("Content-Type") || "").split(";")[0];
			if (((content_type === "text/javascript") || (content_type === "text/x-json")) || (content_type === "application/json")) {
				return true;
			} else {
				return false;
			}
		},
		EncodeURI: function( value, depth ){
			var self = this;
			if (depth === undefined) {depth=0}
			if (extend.isList(value)) {
				var res = [];
				if (depth > 0) {
					res.push("[");
				}
				// Iterates over `value`. This works on array,objects and null/undefined
				var __ak=value;
				var __bk=__ak instanceof Array ? __ak : Object.getOwnPropertyNames(__ak||{});
				var __dk=__bk.length;
				for (var __ck=0;__ck<__dk;__ck++){
					var k=(__bk===__ak)?__ck:__bk[__ck];
					var v=__ak[k];
					// This is the body of the iteration with (value=v, key/index=k) in __ak
					res.push(self.EncodeURI(v, (depth + 1)));
				}
				if (depth > 0) {
					res.push("]");
				}
				return res.join(",");
			} else if (extend.isMap(value) || extend.isObject(value)) {
				var res = [];
				if (depth > 0) {
					res.push("{");
				}
				// Iterates over `value`. This works on array,objects and null/undefined
				var __ek=value;
				var __fk=__ek instanceof Array ? __ek : Object.getOwnPropertyNames(__ek||{});
				var __hk=__fk.length;
				for (var __gk=0;__gk<__hk;__gk++){
					var k=(__fk===__ek)?__gk:__fk[__gk];
					var v=__ek[k];
					// This is the body of the iteration with (value=v, key/index=k) in __ek
					res.push(((self.EncodeURI(k, (depth + 1)) + encodeURIComponent("=")) + self.EncodeURI(v, (depth + 1))));
				}
				if (depth > 0) {
					res.push("}");
				}
				return res.join(",");
			} else {
				return encodeURIComponent(value);
			}
		}
	}
})
/**
  * The SyncChannel will use the synchronous methods from the HTTP transport
  * object to do the communication.
  * 
*/
channels.SyncChannel = extend.Class({
	name  :'channels.SyncChannel',
	parent: __module__.Channel,
	initialize: function( options ){
		var self = this;
		self.getSuper(__module__.SyncChannel.getParent())(options);
	},
	methods: {
		isAsynchronous: function() {
			var self = this;
			return false;
		},
		
		isSynchronous: function() {
			var self = this;
			return true;
		}
	}
})
/**
  * The AsyncChannel will use the asynchronous methods from the HTTP transport
  * object to do the communication.
  * 
*/
channels.AsyncChannel = extend.Class({
	name  :'channels.AsyncChannel',
	parent: __module__.Channel,
	initialize: function( options ){
		var self = this;
		self.getSuper(__module__.AsyncChannel.getParent())(options);
	},
	methods: {
		isAsynchronous: function() {
			var self = this;
			return true;
		},
		
		isSynchronous: function() {
			var self = this;
			return false;
		}
	}
})
/**
  * The BurstChannel is a specific type of AsyncChannel that is capable of
  * tunneling HTTP requests in HTTP.
  * 
*/
channels.BurstChannel = extend.Class({
	name  :'channels.BurstChannel',
	parent: __module__.AsyncChannel,
	properties: {
		channelURL:undefined,
		onPushCallbacks:undefined,
		requestsQueue:undefined
	},
	initialize: function( url, options ){
		var self = this;
		// Default initialization of property `channelURL`
		if (typeof(self.channelURL)=='undefined') {self.channelURL = undefined;};
		// Default initialization of property `onPushCallbacks`
		if (typeof(self.onPushCallbacks)=='undefined') {self.onPushCallbacks = [];};
		// Default initialization of property `requestsQueue`
		if (typeof(self.requestsQueue)=='undefined') {self.requestsQueue = [];};
		self.getSuper(__module__.BurstChannel.getParent())(options);
		self.channelURL = (url || "/channels:burst");
	},
	methods: {
		/**
		  * Registers a callback that will be called when something is 'pushed' into
		  * the channel (a GET, POST, etc). The callback can query the channel status
		  * and decide to explicitly flush the 'requestsQueue', or just do nothing.
		  * 
		  * FIXME: WHAT ARGUMENTS ?
		  * 
		*/
		onPush: function(callback) {
			var self = this;
			self.onPushCallbacks.push(callback);
		},
		
		_pushRequest: function(request) {
			var self = this;
			self.requestsQueue.push(request);
		},
		
		_sendRequests: function(requests) {
			var self = this;
			var boundary = "8<-----BURST-CHANNEL-REQUEST-------";
			var headers = [["X-Channel-Boundary", boundary], ["X-Channel-Type", "burst"], ["X-Channel-Requests", ("" + requests.length)]];
			var request_as_text = [];
			var futures = [];
			// Iterates over `requests`. This works on array,objects and null/undefined
			var __jl=requests;
			var __kl=__jl instanceof Array ? __jl : Object.getOwnPropertyNames(__jl||{});
			var __ml=__kl.length;
			for (var __ll=0;__ll<__ml;__ll++){
				var __il=(__kl===__jl)?__ll:__kl[__ll];
				var r=__jl[__il];
				// This is the body of the iteration with (value=r, key/index=__il) in __jl
				var t = (((r.method + " ") + r.url) + "\r\n");;
				// Iterates over `r.headers`. This works on array,objects and null/undefined
				var __nl=r.headers;
				var __pl=__nl instanceof Array ? __nl : Object.getOwnPropertyNames(__nl||{});
				var __rl=__pl.length;
				for (var __ql=0;__ql<__rl;__ql++){
					var __ol=(__pl===__nl)?__ql:__pl[__ql];
					var h=__nl[__ol];
					// This is the body of the iteration with (value=h, key/index=__ol) in __nl
					t = (t + (((h[0] + ": ") + h[1]) + "\n"));
				};
				t = (t + "\r\n");
				t = (t + r.body);
				request_as_text.push(t);
				futures.push(r.future);
			}
			var body = request_as_text.join((boundary + "\n"));
			var f = self.transport.request(true, "POST", self.channelURL, body, headers);
			f.onSet(function(v) {
				return self._processResponses(v, futures);
			});
			f.onFail(function(s, r, c, f) {
				// Iterates over `futures`. This works on array,objects and null/undefined
				var __tl=futures;
				var __ul=__tl instanceof Array ? __tl : Object.getOwnPropertyNames(__tl||{});
				var __wl=__ul.length;
				for (var __vl=0;__vl<__wl;__vl++){
					var __sl=(__ul===__tl)?__vl:__ul[__vl];
					var __xl=__tl[__sl];
					// This is the body of the iteration with (value=__xl, key/index=__sl) in __tl
					(function(f){f.fail(s, r, c);}(__xl))
				}
			});
		},
		
		/**
		  * This is the callback attached to composite methods
		  * 
		*/
		_processResponses: function(response, futures) {
			var self = this;
			var text = response.responseText;
			var boundary = response.getResponseHeader("X-Channel-Boundary");
			if (!boundary) {
				// Iterates over `futures`. This works on array,objects and null/undefined
				var __zl=futures;
				var __al=__zl instanceof Array ? __zl : Object.getOwnPropertyNames(__zl||{});
				var __cl=__al.length;
				for (var __bl=0;__bl<__cl;__bl++){
					var __yl=(__al===__zl)?__bl:__al[__bl];
					var f=__zl[__yl];
					// This is the body of the iteration with (value=f, key/index=__yl) in __zl
					f.fail("Server did not provide X-Channel-Boundary header");
				}
			} else {
				var i = 0;
				// Iterates over `text.split(boundary)`. This works on array,objects and null/undefined
				var __el=text.split(boundary);
				var __fl=__el instanceof Array ? __el : Object.getOwnPropertyNames(__el||{});
				var __hl=__fl.length;
				for (var __gl=0;__gl<__hl;__gl++){
					var __dl=(__fl===__el)?__gl:__fl[__gl];
					var r=__el[__dl];
					// This is the body of the iteration with (value=r, key/index=__dl) in __el
					r = (function(r){return (function() {
						return eval((("(" + r) + ")"));
					})}(r))();
					r.responseText = r.body;
					r.getHeader = function(h) {
						h = h.toLowerCase();
						result = undefined;
						// Iterates over `r.headers`. This works on array,objects and null/undefined
						var __jm=r.headers;
						var __km=__jm instanceof Array ? __jm : Object.getOwnPropertyNames(__jm||{});
						var __mm=__km.length;
						for (var __lm=0;__lm<__mm;__lm++){
							var __im=(__km===__jm)?__lm:__km[__lm];
							var header=__jm[__im];
							// This is the body of the iteration with (value=header, key/index=__im) in __jm
							if (header[0].toLowerCase() == h) {
								result = header[1];
							};
						}
						return result;
					};
					r.getResponseHeader = (function(r){return (function(h) {
						return (r.getHeader(h) || response.getResponseHeader(h));
					})}(r));
					futures[i].set(r);
					i = (i + 1);
				}
			}
		},
		
		/**
		  * Flushes the 'requestsQueue', using the given 'filter' function. For every request in
		  * 'requestsQueue', if 'filter(r)' is 'True', then the request is sent to the server
		  * in a composite request.
		  * 
		*/
		flush: function(filter) {
			var self = this;
			if (filter === undefined) {filter=function() {
				return true;
			}}
			var remaining = [];
			var flushed = [];
			// Iterates over `self.requestsQueue`. This works on array,objects and null/undefined
			var __nm=self.requestsQueue;
			var __pm=__nm instanceof Array ? __nm : Object.getOwnPropertyNames(__nm||{});
			var __rm=__pm.length;
			for (var __qm=0;__qm<__rm;__qm++){
				var __om=(__pm===__nm)?__qm:__pm[__qm];
				var r=__nm[__om];
				// This is the body of the iteration with (value=r, key/index=__om) in __nm
				if (filter(r)) {
					flushed.push(r);
				} else {
					remaining.push(r);
				};
			}
			self.requestsQueue = remaining;
			self._sendRequests(flushed);
		},
		
		/**
		  * Invokes a 'GET' to the given url (prefixed by the optional 'prefix' set in
		  * this channel options) and returns a 'Future'.
		  * 
		  * The future is already bound with a 'redo' callback that will do the
		  * request again.
		  * 
		*/
		get: function(url, body, future) {
			var self = this;
			if (body === undefined) {body=null}
			if (future === undefined) {future=undefined}
			var request = {"method":"GET", "url":url, "body":body, "future":(future || self._createFuture())};
			self._pushRequest(request);
			return request.future;
		},
		
		/**
		  * Invokes a 'POST' to the give url (prefixed by the optional 'prefix' set in
		  * this channel options), using the given 'body' as request body, and
		  * returning a 'Future' instance.
		  * 
		  * The future is already bound with a 'redo' callback that will do the
		  * request again.
		  * 
		*/
		post: function(url, body, future) {
			var self = this;
			if (body === undefined) {body=null}
			if (future === undefined) {future=undefined}
			var request = {"method":"POST", "url":url, "body":body, "future":(future || self._createFuture())};
			self._pushRequest(request);
			return request.future;
		}
	}
})
/**
  * The 'HTTPTransport' is the low-level class used by channels to do HTTP
  * communication. This class really acts as a wrapper for platform-specific HTTP
  * communication implementations, taking care of returning 'Futures' instances to
  * be used by the channels.
  * 
  * All the futures returned by the HTTPTransport will give the HTTP request object
  * as-is. Particularly, the 'Channels'
  * 
  * In case the transports fails to complete the request, the future 'fail' method
  * will be invoked with the follwing arguments:
  * 
  * - 'request status' as status for the failure (ie.
  * machine-readable description of the error)
  * - 'request responseText' as the reason for the failure (ie.
  * human-readable description of the error)
  * - 'request' as the context for the exception, so that clients have the opportunity
  * to get more information from the reques itself, like headers.
  * 
*/
channels.HTTPTransport = extend.Class({
	name  :'channels.HTTPTransport',
	parent: undefined,
	shared: {
		DEFAULT: undefined
	},
	initialize: function(  ){
		var self = this;
		if (!self.getClass().DEFAULT) {
			self.getClass().DEFAULT = self;
		}
	},
	methods: {
		request: function(async, method, url, body, headers, future, options) {
			var self = this;
			if (body === undefined) {body=null}
			if (headers === undefined) {headers=[]}
			if (future === undefined) {future=new __module__.Future()}
			if (options === undefined) {options={}}
			var request = self._createRequest();
			future.url = url;
			future.setOrigin(request);
			future.onCancel(function() {
				return request.abort();
			});
			var response = self._processRequest(request, {"method":method, "body":body, "url":url, "headers":headers, "asynchronous":async, "timestamp":options.timestamp, "success":function(v) {
				return future.set(v);
			}, "failure":function(v) {
				return future.fail(v.status, v.responseText, v);
			}, "loading":function(v) {
				var response = "";
				try {
					response = v.responseText
				} catch(e) {
					response = ""
				}
				return future.setPartial(response);
			}});
			return future;
		},
		
		_createRequest: function() {
			var self = this;
			// If IE is used, create a wrapper for the XMLHttpRequest object
			if ( typeof(XMLHttpRequest) == "undefined" )
			{
				XMLHttpRequest = function(){return new ActiveXObject(
					navigator.userAgent.indexOf("MSIE 5") >= 0 ?
					"Microsoft.XMLHTTP" : "Msxml2.XMLHTTP"
				)}
			}
			return new XMLHttpRequest()
			
		},
		
		/**
		  * Processes the given HTTP request, taking into account the following
		  * 'options':
		  * 
		  * - 'method', the HTTP method ('GET', 'POST', in uppercase)
		  * - 'url', the requested url
		  * - 'asynchronous' (default 'False'), to indicate wether the request should
		  * be made in synchronous or asynchronous mode
		  * - 'body' (default is '""') the optional request body
		  * - 'headers' is a dictionary of headers to add to the request
		  * - 'success', the callback that will be invoked on success, with the
		  * request as argument
		  * - 'loading', the callback that will be invoked when the request is
		  * loading, with the request as argument.
		  * - 'failure', the callback that will be invoked on failure, with the
		  * request as argument.
		  * - 'timestamp', if 'True' will add an additional 'timestamp' parameter to
		  * the request, with the current time. This can prevent some browsers
		  * (notably IE) to cache a response that you don't want to cache (even if you
		  * specify no-cache, or things like this in the response).
		  * 
		*/
		_processRequest: function(request, options) {
			var self = this;
			var callback_was_executed = false;
			var on_request_loading = function(state) {
				if (options.loading) {
					options.loading(request);
				}
			};
			var on_request_complete = function(state) {
				callback_was_executed = true;
				if ((request.readyState == 3) && options.loading) {
					options.loading(request);
				} else if (request.readyState == 4) {
					if ((request.status >= 200) && (request.status < 300)) {
						options.success(request);
					} else {
						options.failure(request);
					}
				}
			};
			var asynchronous = (options.asynchronous || false);
			if (((options.method == "GET") || (options.method == "HEAD")) && (options.timestamp || __module__.IS_IE)) {
				if (options.url.indexOf("?") == -1) {
					options.url = (options.url + ("?t" + new Date().getTime()));
				} else {
					options.url = (options.url + ("&t" + new Date().getTime()));
				}
			}
			if (asynchronous) {
				request.onreadystatechange = on_request_complete;
			}
			if (extend.isDefined(request.upload)) {
				request.upload.addEventListener("progress", on_request_loading, false);
			}
			request.open((options.method || "GET"), options.url, (options.asynchronous || false));
			// Iterates over `options.headers`. This works on array,objects and null/undefined
			var __sm=options.headers;
			var __tm=__sm instanceof Array ? __sm : Object.getOwnPropertyNames(__sm||{});
			var __vm=__tm.length;
			for (var __um=0;__um<__vm;__um++){
				var k=(__tm===__sm)?__um:__tm[__um];
				var v=__sm[k];
				// This is the body of the iteration with (value=v, key/index=k) in __sm
				if (extend.isMap(options.headers)) {
					request.setRequestHeader(k, v);
				} else {
					request.setRequestHeader(v[0], v[1]);
				};
			}
			try {
				request.send((options.body || ""))
			} catch(e) {
				options.failure(request, e)
			}
			if ((!callback_was_executed) && (!asynchronous)) {
				on_request_complete();
			}
		}
	},
	operations:{
		Get: function(  ){
			var self = this;
			if (!self.DEFAULT) {
				self.DEFAULT = new __module__.HTTPTransport();
			}
			return self.DEFAULT;
		}
	}
})

channels.JSONPTransport = extend.Class({
	name  :'channels.JSONPTransport',
	parent: undefined,
	shared: {
		DEFAULT: undefined,
		CALLBACKS: {},
		IDS: 0,
		TIMEOUT: 2500
	},
	properties: {
		head:undefined,
		timeout:undefined
	},
	initialize: function(  ){
		var self = this;
		// Default initialization of property `timeout`
		if (typeof(self.timeout)=='undefined') {self.timeout = self.getClass().TIMEOUT;};
		self.head = document.getElementsByTagName("head")[0];
		if (!self.getClass().DEFAULT) {
			self.getClass().DEFAULT = self;
		}
	},
	methods: {
		setTimeout: function(timeout) {
			var self = this;
			self.timeout = timeout;
			return self;
		},
		
		request: function(async, method, url, body, headers, future, options) {
			var self = this;
			if (body === undefined) {body=null}
			if (headers === undefined) {headers=[]}
			if (future === undefined) {future=new __module__.Future()}
			if (options === undefined) {options={}}
			!((!body)) && extend.assert(false, "channels.JSONPTransport.request:", "channels.JSONPTransport does not support body mode", "(failed `(!body)`)");
			future.url = url;
			var script = document.createElement("script");
			var t = (options.timeout || self.timeout);
			var timeout = window.setTimeout(function() {
				return future.fail(__module__.Future.FAILURES.TIMEOUT, t);
			}, t);
			var cid = self.getClass().getOperation('CreateCallback')(function(value) {
				window.clearTimeout(timeout);
				future.set(value);
				return self.head.removeChild(script);
			});
			var target_url = ((url + "&callback=channels.JSONPTransport.CALLBACKS.") + cid);
			script.src = target_url;
			script.async = async;
			script.onload = function(_) {
				return window.setTimeout(function() {
					if (self.getClass().CALLBACKS[cid]) {
						future.fail(__module__.Future.FAILURES.TIMEOUT);
					}
				}, 100);
			};
			script.onreadystatechange = function(_) {
			};
			self.head.appendChild(script);
			return future;
		}
	},
	operations:{
		CreateCallback: function( callback ){
			var self = this;
			var id = ("C" + (self.IDS % 10000));
			self.IDS = (self.IDS + 1);
			var c = function(value) {
				self.CALLBACKS[id] = undefined;
				// Unable to embed the following code
				// delete channels.JSONPTransport.CALLBACKS[id];
				// 
				if (extend.isDefined(callback)) {
					callback(value, this.id);
				}
			};
			self.CALLBACKS[id] = c;
			return id;
		},
		Get: function(  ){
			var self = this;
			if (!self.DEFAULT) {
				self.DEFAULT = new __module__.JSONPTransport();
			}
			return self.DEFAULT;
		}
	}
})
/**
  * Joins the given future, returns a future with an array of results
  * preserving the order of the futures. The `future.rdv` property will
  * be assigned the created RendezVous.
  * 
*/
channels.join = function(futures){
	var self = channels;
	futures = extend.sliceArguments(arguments,0)
	var rdv = new __module__.RendezVous();
	var res = new __module__.Future();
	if ((extend.len(futures) == 1) && (!__module__.Future.hasInstance(futures[0]))) {
		futures = futures[0];
	}
	// Iterates over `futures`. This works on array,objects and null/undefined
	var __wm=futures;
	var __xm=__wm instanceof Array ? __wm : Object.getOwnPropertyNames(__wm||{});
	var __zm=__xm.length;
	for (var __ym=0;__ym<__zm;__ym++){
		var i=(__xm===__wm)?__ym:__xm[__ym];
		var f=__wm[i];
		// This is the body of the iteration with (value=f, key/index=i) in __wm
		rdv.register(f, i);
	}
	rdv.onSucceed(function() {
		return res.set(rdv.data);
	}).onFail(res.getMethod("fail"));
	res.rdv = rdv;
	return res;
}
channels.encode = function(data, skipNone){
	var self = channels;
	if (skipNone === undefined) {skipNone=false}
	var result = undefined;
	if (extend.isMap(data)) {
		// Iterates over `data`. This works on array,objects and null/undefined
		var __am=data;
		var __bm=__am instanceof Array ? __am : Object.getOwnPropertyNames(__am||{});
		var __dm=__bm.length;
		for (var __cm=0;__cm<__dm;__cm++){
			var key=(__bm===__am)?__cm:__bm[__cm];
			var value=__am[key];
			// This is the body of the iteration with (value=value, key/index=key) in __am
			if (value || (!skipNone)) {
				var r = ((encodeURIComponent(key) + "=") + encodeURIComponent(value));
				if (result === undefined) {
					result = r;
				} else {
					result = (result + ("&" + r));
				}
			};
		}
	} else {
		result = encodeURIComponent(("" + data));
	}
	return result;
}
channels.stringToXML = function(s){
	var self = channels;
	if (window.ActiveXObject) {
		var a = new ActiveXObject("Microsoft.XMLDOM");
		a.async = "false";
		a.loadXML(b);
	} else {
		var c = new DOMParser();
		var a = c.parseFromString(b, "text/xml");
	}
	return a;
}
channels.init = function(){
	var self = channels;
	__module__.HTTP = new __module__.AsyncChannel({"evalJSON":true});
	__module__.SHTTP = new __module__.SyncChannel({"evalJSON":true});
	__module__.JSONP = new __module__.AsyncChannel({"JSONP":true});
}
if (typeof(channels.init)!="undefined") {channels.init();}

// START:VANILLA_POSTAMBLE
return channels;})(channels);
// END:VANILLA_POSTAMBLE
