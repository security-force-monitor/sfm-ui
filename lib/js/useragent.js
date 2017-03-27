// 8< ---[useragent.js]---
// START:VANILLA_PREAMBLE
var useragent=typeof(extend)!='undefined' ? extend.module('useragent') : (typeof(useragent)!='undefined' ? useragent : {});
(function(useragent){
var __module__=useragent;
// END:VANILLA_PREAMBLE

useragent.__VERSION__='0.4.1';
useragent.HAS = null;
useragent.BROWSERS = {"firefox":[1, new RegExp("Firefox/((\\d+\\.)*\\d+)")], "chrome":[1, new RegExp("Chrome/((\\d+\\.)*\\d+)")], "chromium":[1, new RegExp("Chromium/((\\d+\\.)*\\d+)")], "safari":[1, new RegExp("Safari/((\\d+\\.)*\\d+)")], "opera":[2, new RegExp("(OPR|Opera)/((\\d+\\.)*\\d+)")], "ie":[1, new RegExp("; MSIE ((\\d+\\.)*\\d+);")]};
useragent.PREFIXES = {"arora":["-webkit-", "webkit"], "chrome":["-webkit-", "webkit"], "epiphany":["-webkit-", "webkit"], "firefox":["-moz-", "moz"], "ie":["-msie-", "msie"], "midori":["-webkit-", "webkit"], "opera":["-webkit-", "webkit"], "safari":["-webkit-", "webkit"]};
useragent.FEATURES = {"mobile":{"android":"Android", "blackberry":"BlackBerry", "ios":"iPhone|iPad|iPod", "operamini":"Opera Mini", "iemobile":"IEMobile", "webos":"webOS"}, "browser":{"arora":"Arora", "chrome":"Chrome", "epiphany":"Epiphany", "firefox":"Firefox", "ie":"MSIE", "midori":"Midori", "opera":"Opera", "safari":"Safari", "name":undefined, "version":undefined}, "feature":{"webgl":function() {
	try      {return !!window.WebGLRenderingContext && !!(document.createElement('canvas').getContext('webgl') || document.createElement('canvas').getContext('experimental-webgl'));}
	catch(e) {return false;}
	
}, "phone":function(f) {
	return (f.feature.mobile && (screen.width == 360));
}, "tablet":function(f) {
	return (f.feature.mobile && (screen.width > 360));
}}};
useragent.getUserAgent = function(){
	var self = useragent;
	return navigator.userAgent;
}
useragent.getVersion = function(){
	var self = useragent;
	var r = null;
	var a = __module__.getUserAgent();
	// Iterates over `__module__.BROWSERS`. This works on array,objects and null/undefined
	var __i=__module__.BROWSERS;
	var __j=__i instanceof Array ? __i : Object.getOwnPropertyNames(__i||{});
	var __l=__j.length;
	for (var __k=0;__k<__l;__k++){
		var k=(__j===__i)?__k:__j[__k];
		var v=__i[k];
		// This is the body of the iteration with (value=v, key/index=k) in __i
		var m = a.match(v[1]);;
		if (m) {
			r = m[v[0]].split(".");
			break
		};
	}
	if (r) {
		return parseFloat(extend.slice(r,0,2).join("."));
	} else {
		return -1;
	}
}
useragent.getBrowser = function(features){
	var self = useragent;
	if (features === undefined) {features=__module__.getFeatures();}
	var r = null;
	// Iterates over `features.browser`. This works on array,objects and null/undefined
	var __m=features.browser;
	var __o=__m instanceof Array ? __m : Object.getOwnPropertyNames(__m||{});
	var __p=__o.length;
	for (var __n=0;__n<__p;__n++){
		var k=(__o===__m)?__n:__o[__n];
		var v=__m[k];
		// This is the body of the iteration with (value=v, key/index=k) in __m
		if (v) {
			r = k;
			break
		};
	}
	return r;
}
/**
  * Tells if the user agent is mobile
  * 
*/
useragent.isMobile = function(){
	var self = useragent;
	return __module__.has().feature.mobile;
}
/**
  * Returns the features
  * 
*/
useragent.getFeatures = function(){
	var self = useragent;
	var result = {};
	var user_agent = __module__.getUserAgent();
	var predicates = {};
	// Iterates over `__module__.FEATURES`. This works on array,objects and null/undefined
	var __q=__module__.FEATURES;
	var __r=__q instanceof Array ? __q : Object.getOwnPropertyNames(__q||{});
	var __t=__r.length;
	for (var __s=0;__s<__t;__s++){
		var category=(__r===__q)?__s:__r[__s];
		var values=__q[category];
		// This is the body of the iteration with (value=values, key/index=category) in __q
		var r = {};;
		// Iterates over `values`. This works on array,objects and null/undefined
		var __u=values;
		var __v=__u instanceof Array ? __u : Object.getOwnPropertyNames(__u||{});
		var __x=__v.length;
		for (var __w=0;__w<__x;__w++){
			var k=(__v===__u)?__w:__v[__w];
			var v=__u[k];
			// This is the body of the iteration with (value=v, key/index=k) in __u
			var value = undefined;;
			if (extend.isString(v)) {
				v = new RegExp(v, "ig");
				value = ((user_agent.match(v) && true) || false);
			} else if (extend.isFunction(v)) {
				if (!predicates[category]) {
					predicates[category] = {};
				}
				predicates[category][k] = v;
			} else if (extend.isDefined(v)) {
				extend.error("Feature type not supported");
			};
			r[k] = value;
		};
		result[category] = r;
	}
	var is_mobile = false;
	// Iterates over `result.mobile`. This works on array,objects and null/undefined
	var __z=result.mobile;
	var __a=__z instanceof Array ? __z : Object.getOwnPropertyNames(__z||{});
	var __c=__a.length;
	for (var __b=0;__b<__c;__b++){
		var __y=(__a===__z)?__b:__a[__b];
		var v=__z[__y];
		// This is the body of the iteration with (value=v, key/index=__y) in __z
		if (v) {
			is_mobile = true;
			break
		};
	}
	result.browser.name = __module__.getBrowser(result);
	result.browser.version = __module__.getVersion(result);
	result.browser.prefixes = __module__.PREFIXES[result.browser.name];
	result.feature.mobile = is_mobile;
	// Iterates over `predicates`. This works on array,objects and null/undefined
	var __d=predicates;
	var __e=__d instanceof Array ? __d : Object.getOwnPropertyNames(__d||{});
	var __g=__e.length;
	for (var __f=0;__f<__g;__f++){
		var category=(__e===__d)?__f:__e[__f];
		var c=__d[category];
		// This is the body of the iteration with (value=c, key/index=category) in __d
		// Iterates over `c`. This works on array,objects and null/undefined
		var __h=c;
		var __ij=__h instanceof Array ? __h : Object.getOwnPropertyNames(__h||{});
		var __kj=__ij.length;
		for (var __jj=0;__jj<__kj;__jj++){
			var k=(__ij===__h)?__jj:__ij[__jj];
			var v=__h[k];
			// This is the body of the iteration with (value=v, key/index=k) in __h
			result[category][k] = v(result, user_agent);
		};
	}
	return result;
}
/**
  * Returns the list of all features
  * 
*/
useragent.get = function(){
	var self = useragent;
	return __module__.has();
}
/**
  * Returns the list of all features
  * 
*/
useragent.has = function(){
	var self = useragent;
	if (!__module__.HAS) {
		__module__.HAS = __module__.getFeatures();
	}
	return __module__.HAS;
}
useragent.init = function(){
	var self = useragent;
}
if (typeof(useragent.init)!="undefined") {useragent.init();}

// START:VANILLA_POSTAMBLE
return useragent;})(useragent);
// END:VANILLA_POSTAMBLE
