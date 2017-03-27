// 8< ---[testing.js]---
/**
  * The testing module implements a simple stateful test engine that allows to
  * quickly setup and run tests.
  * 
  * NOTE _________________________________________________________________________
  * This engine is designed to be used mainly with the JavaScript backend, and was
  * written so that it does not depend on the sugar runtime libraries.
  * 
*/
// START:VANILLA_PREAMBLE
var testing=typeof(extend)!='undefined' ? extend.module('testing') : (typeof(testing)!='undefined' ? testing : {});
(function(testing){
var __module__=testing;
// END:VANILLA_PREAMBLE

testing.__VERSION__='0.6.3';
testing.DEFAULT_TEST_TIMEOUT = (5 * 1000);
testing.DEFAULT_TESTCASE_TIMEOUT = (10 * 1000);
testing.TestCount = 0;
testing.CaseCount = 0;
testing.CurrentTest = undefined;
testing.PredicateStack = [];
testing.Results = [];
testing.Callbacks = {"OnCaseStart":undefined, "OnCaseEnd":undefined, "OnTestStart":undefined, "OnTestEnd":undefined, "OnFailure":undefined, "OnSuccess":undefined, "OnNote":undefined, "OnLog":undefined};
testing.OPTIONS = {"PRECISION":0.0001, "FORMAT_PRECISION":4, "ExceptionOnFailure":false};
testing.option = function(name, value){
	var self = testing;
	__module__.OPTIONS[name] = value;
	return testing;
}
testing.enable = function(option){
	var self = testing;
	__module__.OPTIONS[option] = true;
	return testing;
}
testing.disable = function(option){
	var self = testing;
	__module__.OPTIONS[option] = false;
	return testing;
}
testing.setPRECISION = function(precision){
	var self = testing;
	__module__.OPTIONS.PRECISION = precision;
}
/**
  * Creates a new test case with the given name, and returns the identifier of the
  * test case.
  * 
*/
testing.testCase = function(name, timeout){
	var self = testing;
	if (timeout === undefined) {timeout=__module__.DEFAULT_TESTCASE_TIMEOUT}
	if (extend.isDefined(window)) {
		__module__.HTMLReporter.Install();
	}
	var case_id = __module__.CaseCount;
	if (__module__.CaseCount > 0) {
		__module__.endCase((case_id - 1));
	}
	if (__module__.Callbacks.OnCaseStart) {
		__module__.Callbacks.OnCaseStart(case_id, name);
	}
	CurrentCase = name;
	return testing;
}
/**
  * Notifies the end of the give test case
  * 
*/
testing.endCase = function(caseID){
	var self = testing;
	if (caseID === undefined) {caseID=(__module__.CaseCount - 1)}
	__module__.endTest();
	if (__module__.Callbacks.OnCaseEnd) {
		__module__.Callbacks.OnCaseEnd(caseID);
	}
	return testing;
}
/**
  * Notifies that a new test has begun. The given 'name' will be the
  * test description. This returns an identifier (as an int) that will allow to
  * access the test.
  * 
  * If there is a previous test, and it was not ended, this will also end the
  * previous test.
  * 
*/
testing.test = function(name, timeout){
	var self = testing;
	if (timeout === undefined) {timeout=__module__.DEFAULT_TEST_TIMEOUT}
	var test_id = __module__.TestCount;
	if (__module__.TestCount > 0) {
		__module__.end((test_id - 1));
	}
	if (__module__.Callbacks.OnTestStart) {
		__module__.Callbacks.OnTestStart(test_id, name);
	}
	__module__.CurrentTest = name;
	__module__.Results.push({"tid":test_id, "cid":__module__.CaseCount, "status":"S", "name":name, "start":new Date().getTime(), "tests":[]});
	__module__.TestCount = (__module__.TestCount + 1);
	return testing;
}
testing.currentTest = function(){
	var self = testing;
	return (__module__.TestCount - 1);
}
testing.endTest = function(testID){
	var self = testing;
	if (testID === undefined) {testID=undefined}
	return __module__.end(testID);
}
/**
  * Ends the test with the given 'testID' (or the last test if no ID was given).
  * Note that a test can only be ended once.
  * 
*/
testing.end = function(testID){
	var self = testing;
	if (testID === undefined) {testID=undefined}
	if (testID === undefined) {
		testID = (__module__.TestCount - 1);
	}
	var test = __module__.Results[testID];
	if (test.ended) {
		return true;
	}
	test.end = new Date().getTime();
	test.run = (test.end - test.start);
	test.ended = true;
	if (__module__.Callbacks.OnTestEnd) {
		__module__.Callbacks.OnTestEnd(testID, test);
	}
	__module__.endCase();
	return testing;
}
/**
  * Fails the current test with the given reason
  * 
*/
testing.fail = function(reason, label){
	var self = testing;
	if (__module__.PredicateStack.length == 0) {
		var test_id = (__module__.TestCount - 1);
		__module__.Results[test_id].tests.push({"result":"F", "reason":reason, "label":label});
		__module__.Results[test_id].status = "F";
		if (__module__.Callbacks.OnFailure) {
			__module__.Callbacks.OnFailure(test_id, (__module__.Results[test_id].tests.length - 1), reason, label);
		}
		if (__module__.OPTIONS.ExceptionOnFailure) {
			__module__.note("Test interrupted by exception (see OPTIONS ExceptionOnFailure)");
			throw reason;
		}
		return false;
	} else {
		return reason;
	}
}
/**
  * Success the current test
  * 
*/
testing.succeed = function(){
	var self = testing;
	if (__module__.PredicateStack.length == 0) {
		var test_id = (__module__.TestCount - 1);
		__module__.Results[test_id].tests.push({"result":"S"});
		if (__module__.Callbacks.OnSuccess) {
			__module__.Callbacks.OnSuccess(test_id, (__module__.Results[test_id].tests.length - 1));
		}
	}
	return true;
}
testing.note = function(message){
	var self = testing;
	if (__module__.Callbacks.OnNote) {
		__module__.Callbacks.OnNote(message);
	}
}
testing.log = function(args){
	var self = testing;
	args = extend.sliceArguments(arguments,0)
	if (__module__.Callbacks.OnLog) {
		__module__.Callbacks.OnLog(args.join(" "));
	}
}
/**
  * Runs the given callback function in a 'try...' catch clause. Exceptions
  * will be absorbed and not propagated back in the containing code.
  * 
  * Ex: 'testing run { ... }'
  * 
*/
testing.run = function(callback){
	var self = testing;
	try {
		callback()
	} catch(e) {
		__module__.fail(("Test failed with exception: " + e))
	}
	return testing;
}
/**
  * Expects an exception being raised when executing the given callback
  * 
  * Ex: 'testing expectException { ... }'
  * 
*/
testing.expectException = function(callback){
	var self = testing;
	try {
		callback()
		__module__.fail()
	} catch(e) {
		__module__.succeed()
	}
	return testing;
}
testing.expectFailure = function(callback, args){
	var self = testing;
	args = extend.sliceArguments(arguments,1)
	__module__.PredicateStack.push(__module__.expectFailure);
	var result = callback.apply(self, args);
	__module__.PredicateStack.pop();
	if (result === true) {
		return __module__.fail("A failure was expected");
	} else {
		return __module__.succeed();
	}
}
testing.PREDICATES = {"ensure":__module__.ensure, "asTrue":__module__.asTrue, "asFalse":__module__.asFalse, "asNull":__module__.asNull, "asUndefined":__module__.asUndefined, "asDefined":__module__.asDefined, "asUndefined":__module__.asUndefined, "unlike":__module__.unlike, "same":__module__.same, "almost":__module__.almost, "value":__module__.value};
/**
  * Really just an alias for 'asTrue'
  * 
*/
testing.ensure = function(val, message){
	var self = testing;
	if (message === undefined) {message=undefined}
	if (extend.isList(val)) {
		if (val.length > 0) {
			return __module__.succeed();
		} else {
			return __module__.fail((message || ("Value should not be empty: " + __module__.format(val))));
		}
	} else if (extend.isObject(val) && extend.isDefined(val.length)) {
		if (val.length > 0) {
			return __module__.succeed();
		} else {
			return __module__.fail((message || ("Value should not have length=0: " + __module__.format(val))));
		}
	} else if (val) {
		return __module__.succeed();
	} else {
		return __module__.fail((message || ("Value should be true, non-null, got: " + __module__.format(val))));
	}
}
/**
  * Alias for 'value(val, True)'
  * 
*/
testing.asTrue = function(val, message){
	var self = testing;
	if (message === undefined) {message=undefined}
	if (!(val === true)) {
		return __module__.fail((message || ("Value should be 'true', got " + __module__.format(val))));
	} else {
		return __module__.succeed();
	}
}
/**
  * Alias for 'value(val, False)'
  * 
*/
testing.asFalse = function(val, message){
	var self = testing;
	if (message === undefined) {message=undefined}
	if (!(val === false)) {
		return __module__.fail((message || ("Value should be 'false', got " + __module__.format(val))));
	} else {
		return __module__.succeed();
	}
}
testing.asNull = function(val, message){
	var self = testing;
	if (message === undefined) {message=undefined}
	if (!(val === null)) {
		return __module__.fail((message || ("Value should be 'null', got " + __module__.format(val))));
	} else {
		return __module__.succeed();
	}
}
/**
  * Alias for 'value(val==Undefined, True)'
  * 
*/
testing.asUndefined = function(val, message){
	var self = testing;
	if (message === undefined) {message=undefined}
	if (!(val === undefined)) {
		return __module__.fail((message || ("Value should be 'undefined', got " + __module__.format(val))));
	} else {
		return __module__.succeed();
	}
}
/**
  * Alias for 'value(val==Undefined, False)'
  * 
*/
testing.asDefined = function(val, message){
	var self = testing;
	if (message === undefined) {message=undefined}
	if (!extend.isDefined(val)) {
		return __module__.fail((message || ("Value should be defined, got " + __module__.format(val))));
	} else {
		return __module__.succeed();
	}
}
/**
  * Unsures that the given 'value' is different from the 'other' value
  * 
*/
testing.unlike = function(value, other, message){
	var self = testing;
	if (message === undefined) {message=undefined}
	if (value == other) {
		return __module__.fail((message || (((("Values are expected to be different '" + value) + "' vs '") + other) + "'")));
	} else {
		return __module__.succeed();
	}
}
/**
  * Same is a better version of 'value' that will introspect dictionaries and
  * lists to check that the keys and items are the same.
  * 
*/
testing.same = function(val, expected, message){
	var self = testing;
	var result = true;
	__module__.PredicateStack.push(__module__.same);
	if (extend.isList(expected)) {
		if (extend.isList(val)) {
			// Iterates over `expected`. This works on array,objects and null/undefined
			var __i=expected;
			var __j=__i instanceof Array ? __i : Object.getOwnPropertyNames(__i||{});
			var __l=__j.length;
			for (var __k=0;__k<__l;__k++){
				var i=(__j===__i)?__k:__j[__k];
				var v=__i[i];
				// This is the body of the iteration with (value=v, key/index=i) in __i
				if ((i >= val.length) || (__module__.same(val[i], v) != true)) {
					result = false;
				};
			}
			if (result != true) {
				result = "The lists are different";
			}
		} else {
			result = "A list is expected";
		}
	} else if (extend.isMap(expected)) {
		if (extend.isMap(val)) {
			// Iterates over `expected`. This works on array,objects and null/undefined
			var __m=expected;
			var __o=__m instanceof Array ? __m : Object.getOwnPropertyNames(__m||{});
			var __p=__o.length;
			for (var __n=0;__n<__p;__n++){
				var i=(__o===__m)?__n:__o[__n];
				var v=__m[i];
				// This is the body of the iteration with (value=v, key/index=i) in __m
				if (__module__.same(val[i], v) != true) {
					result = false;
				};
			}
			if (!result) {
				result = "The maps are different";
			}
		} else {
			result = "A map was expected";
		}
	} else {
		result = __module__.value(val, expected);
	}
	__module__.PredicateStack.pop();
	if (result === true) {
		return __module__.succeed();
	} else {
		return __module__.fail((message || result));
	}
}
testing.almost = function(value, expected, label){
	var self = testing;
	if (label === undefined) {label=undefined}
	if (extend.isNumber(value) && extend.isNumber(value)) {
		var delta = Math.abs((value - expected));
		if (delta < __module__.OPTIONS.PRECISION) {
			return __module__.succeed();
		} else {
			return __module__.fail(((((("almost: '" + __module__.format(value)) + "' != '") + __module__.format(expected)) + "' precision=") + __module__.OPTIONS.PRECISION), label);
		}
	} else {
		return __module__.equals(value, expected);
	}
}
testing.equals = function(value, expected){
	var self = testing;
	if (extend.cmp(value, expected) == 0) {
		return __module__.succeed();
	} else {
		return __module__.fail((((("equals: '" + __module__.format(value)) + "' != '") + __module__.format(expected)) + "'"));
	}
}
testing.format = function(value){
	var self = testing;
	console.log(value, extend.isList(value));
	if (extend.isString(value)) {
		return value;
	} else if (extend.isNumber(value)) {
		var v = ("" + value).split(".");
		var d = v[0];
		var p = v[1];
		if (p) {
			return ((d + ".") + extend.slice(p,0,__module__.OPTIONS.FORMAT_PRECISION));
		} else {
			return d;
		}
	} else if (extend.isList(value)) {
		return JSON.stringify(extend.map(value, function(_) {
			return _;
		}));
	} else if (extend.isObject(value)) {
		return JSON.stringify(value);
	} else {
		return ("" + value);
	}
}
/**
  * Succeeds if the given value is non-null or if the given value equals the other
  * expected value.
  * 
*/
testing.value = function(value, expected){
	var self = testing;
	if (expected != undefined) {
		if (value != expected) {
			return __module__.fail((((("value: Expected value to be '" + __module__.format(expected)) + "', got '") + __module__.format(value)) + "'"));
		} else {
			return __module__.succeed();
		}
	} else {
		if (value === expected) {
			return __module__.succeed();
		} else if (value === undefined) {
			return __module__.fail("value: Value expected to be defined");
		} else if (!value) {
			return __module__.fail("value: Value expected to be non-null");
		} else {
			return __module__.succeed();
		}
	}
}
testing._getPredicateCaller = function(level){
	var self = testing;
	if (level === undefined) {level=2}
	var called_function = getCaller;
	while ((level > 0)) {
		called_function = called_function.caller;
		level = (level - 1);
	}
	return called_function;
}
/**
  * A test case is a collection of tests units
  * 
*/
testing.TestCase = extend.Class({
	name  :'testing.TestCase',
	parent: undefined,
	properties: {
		name:undefined,
		tests:undefined
	},
	/**
	  * Creates a test case with the given name (which is the class name by
	  * default).
	  * 
	*/
	initialize: function( name ){
		var self = this;
		if (name === undefined) {name=self.getClass().getName();}
		// Default initialization of property `tests`
		if (typeof(self.tests)=='undefined') {self.tests = [];};
		self.name = name;
	},
	methods: {
		/**
		  * Adds the given tests to this test case tests list
		  * 
		*/
		add: function(tests) {
			var self = this;
			tests = extend.sliceArguments(arguments,0)
			// Iterates over `tests`. This works on array,objects and null/undefined
			var __r=tests;
			var __s=__r instanceof Array ? __r : Object.getOwnPropertyNames(__r||{});
			var __u=__s.length;
			for (var __t=0;__t<__u;__t++){
				var __q=(__s===__r)?__t:__s[__t];
				var t=__r[__q];
				// This is the body of the iteration with (value=t, key/index=__q) in __r
				self.tests.push(t);
			}
		},
		
		/**
		  * Run all the tests registered in this test case.
		  * 
		*/
		run: function() {
			var self = this;
			__module__.testCase(self.name);
			// Iterates over `self.tests`. This works on array,objects and null/undefined
			var __w=self.tests;
			var __x=__w instanceof Array ? __w : Object.getOwnPropertyNames(__w||{});
			var __z=__x.length;
			for (var __y=0;__y<__z;__y++){
				var __v=(__x===__w)?__y:__x[__y];
				var t=__w[__v];
				// This is the body of the iteration with (value=t, key/index=__v) in __w
				t.run();
			}
			__module__.endCase();
		}
	}
})
/**
  * A test unit is a collection of individual tests exercising one or a
  * set of strongly related components.
  * 
*/
testing.TestUnit = extend.Class({
	name  :'testing.TestUnit',
	parent: undefined,
	shared: {
		ensure: testing
	},
	properties: {
		name:undefined
	},
	initialize: function( name ){
		var self = this;
		if (name === undefined) {name=self.getClass().getName();}
		self.name = name;
	},
	methods: {
		run: function() {
			var self = this;
			// Iterates over `self.getClass().listMethods()`. This works on array,objects and null/undefined
			var __a=self.getClass().listMethods();
			var __b=__a instanceof Array ? __a : Object.getOwnPropertyNames(__a||{});
			var __d=__b.length;
			for (var __c=0;__c<__d;__c++){
				var n=(__b===__a)?__c:__b[__c];
				var m=__a[n];
				// This is the body of the iteration with (value=m, key/index=n) in __a
				if (n.indexOf("test") == 0) {
					self.runTest(m, n);
				};
			}
		},
		
		runTest: function(testFunction, name) {
			var self = this;
			__module__.test(name);
			testFunction();
			__module__.end();
		}
	}
})

testing.HTMLReporter = extend.Class({
	name  :'testing.HTMLReporter',
	parent: undefined,
	shared: {
		Instance: undefined
	},
	properties: {
		selector:undefined,
		selector_table:undefined,
		callbacks:undefined
	},
	initialize: function( selector ){
		var self = this;
		if (selector === undefined) {selector="#testing-results"}
		self.selector = $(selector);
		self.ensureUI();
		self.callbacks = {"OnCaseStart":self.getMethod('onCaseStart') , "OnCaseEnd":self.getMethod('onCaseEnd') , "OnTestStart":self.getMethod('onTestStart') , "OnTestEnd":self.getMethod('onTestEnd') , "OnSuccess":self.getMethod('onSuccess') , "OnFailure":self.getMethod('onFailure') , "OnNote":self.getMethod('onNote') , "OnLog":self.getMethod('onLog') };
	},
	methods: {
		/**
		  * Ensures that there is the proper HTML node in the document to add the
		  * results, otherwise creates it.
		  * 
		*/
		ensureUI: function() {
			var self = this;
			if ($(self.selector).length == 0) {
				$("body").append("<div id='testing-results'>  </div>");
			}
			self.selector = $(self.selector);
			if ($("table", self.selector).length == 0) {
				$(self.selector).append(html.table());
			}
			self.selector_table = $("table", self.selector);
			$(self.selector).addClass("TestResults");
			$(self.selector_table).attr({"cellpadding":"0", "cellspacing":"0"});
		},
		
		onCaseStart: function(caseID, name) {
			var self = this;
			var test_row = html.tr({"id":("testcase_" + caseID), "class":"testcase"}, html.td({"class":"testcase-name", "colspan":"3"}, ("" + name)));
			$(self.selector_table).append(test_row);
		},
		
		onCaseEnd: function() {
			var self = this;
		},
		
		onNote: function(message) {
			var self = this;
			var test_row = $(("#test_" + __module__.currentTest()));
			$(".notes", test_row).append(html.li(message)).removeClass("empty");
		},
		
		onLog: function(message) {
			var self = this;
			var test_row = $(("#test_" + __module__.currentTest()));
			var text = (($(".log pre", test_row).text() + message) + "\n");
			$(".log pre", test_row).text(text).removeClass("empty");
		},
		
		onTestStart: function(testID, testName) {
			var self = this;
			var test_row = html.tr({"id":("test_" + testID), "class":"test test-running"}, html.td({"class":"test-id"}, ("#" + testID)), html.td({"class":"test-name"}, ("" + testName), html.div(html.ul({"class":"assertions empty"})), html.div(html.ul({"class":"notes empty"})), html.div({"class":"log empty"}, html.pre())), html.td({"class":"test-time"}, "running..."));
			$(self.selector_table).append(test_row);
		},
		
		onTestEnd: function(testID, test) {
			var self = this;
			var test_row = $(("#test_" + testID));
			$(test_row).removeClass("test-running");
			if (test.status == "S") {
				$(test_row).addClass("test-succeeded");
			} else {
				$(test_row).addClass("test-failed");
			}
			$(".test-time", test_row).html((test.run + "ms"));
		},
		
		onSuccess: function() {
			var self = this;
		},
		
		onFailure: function(testID, num, reason, label) {
			var self = this;
			$((("#test_" + testID) + " .assertions")).removeClass("empty");
			$((("#test_" + testID) + " .assertions")).append(html.li({"class":"assertion assertion-failed"}, (((("Assertion #" + (num + 1)) + ((label && ((" [" + label) + "]")) || "")) + " failed: ") + reason)));
		}
	},
	operations:{
		/**
		  * Installs a new 'HTMLReporter' in the testing module. This returns the
		  * newly installed instance
		  * 
		*/
		Install: function( context ){
			var self = this;
			if (context === undefined) {context=undefined}
			if (!self.Instance) {
				self.Instance = new __module__.HTMLReporter(context);
			}
			testing.Callbacks = self.Instance.callbacks;
			return self.Install;
		}
	}
})
testing.init = function(){
	var self = testing;
}
if (typeof(testing.init)!="undefined") {testing.init();}

// START:VANILLA_POSTAMBLE
return testing;})(testing);
// END:VANILLA_POSTAMBLE
