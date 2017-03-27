// 8< ---[stats.js]---
// START:VANILLA_PREAMBLE
var stats=typeof(extend)!='undefined' ? extend.module('stats') : (typeof(stats)!='undefined' ? stats : {});
(function(stats){
var __module__=stats;
// END:VANILLA_PREAMBLE

stats.__VERSION__='1.1.6';
stats.CACHE = {};
stats.NORMAL_RANGE = [0.0, 1.0];
stats.NA = extend.Nothing;
stats.reduce = extend.reduce;
stats.values = extend.values;
stats.cmp = extend.cmp;
stats.RE_KEY = new RegExp("([^A-Za-z0-9]|[_])+", "g");
stats.RE_SPACES = new RegExp("\\s+", "g");
stats.like = function(a, b){
	var self = stats;
	if (extend.isList(a) && extend.isList(b)) {
		return ((__module__.len(a) == __module__.len(b)) && (extend.findLike(a, function(v, i) {
			return (b[i] != v);
		}) == -1));
	} else if ((extend.isMap(a) && extend.isMap(b)) || (extend.isObject(a) && extend.isObject(b))) {
		return ((extend.findLike(a, function(v, i) {
			return (b[i] != v);
		}) == -1) && (extend.findLike(b, function(v, i) {
			return (a[i] != v);
		}) == -1));
	} else {
		return (a == b);
	}
}
stats.filter = function(value, predicate){
	var self = stats;
	if (extend.isString(predicate)) {
		predicate = __module__.parseOperation(predicate);
	}
	return extend.filter(value, predicate);
}
/**
  * Returns a comparator based on the given predicate
  * 
*/
stats.comparator = function(predicate){
	var self = stats;
	if (extend.isNumber(predicate)) {
		predicate = function(_) {
		return _[predicate];
	};
	}
	return function(a, b) {
		return extend.cmp(predicate(a), predicate(b));
	};
}
stats.sorted = function(value, comparator, descending){
	var self = stats;
	if (descending === undefined) {descending=false}
	if (extend.isString(comparator)) {
		var extractor = __module__.parseOperation(comparator);
		comparator = function(a, b) {
			a = extractor(a);
			b = extractor(b);
			return extend.cmp(a, b);
		};
	}
	return extend.sorted(value, comparator, descending);
}
stats.map = function(value, extractor){
	var self = stats;
	if (extend.isString(extractor)) {
		extractor = __module__.parseOperation(extractor);
	}
	if (extend.isNumber(extractor)) {
		var n = extractor;
		extractor = function(_) {
			return _[n];
		};
	}
	return extend.map(value, extractor);
}
stats.map0 = function(value, extractor){
	var self = stats;
	if (extend.isString(extractor)) {
		extractor = __module__.parseOperation(extractor);
	}
	return stats.map(value, function(_) {
		return extractor(_);
	});
}
stats.map1 = function(value, extractor){
	var self = stats;
	if (extend.isString(extractor)) {
		extractor = __module__.parseOperation(extractor);
	}
	return stats.map(value, function(_, _1) {
		return extractor(_, _1);
	});
}
stats.setdefault = function(scope, keys){
	var self = stats;
	keys = extend.sliceArguments(arguments,1)
	var o = scope;
	var value = extend.access(keys,-1);
	var last_key = extend.access(keys,-2);
	keys = extend.slice(keys,0,(keys.length - 2));
	// Iterates over `keys`. This works on array,objects and null/undefined
	var __j=keys;
	var __k=__j instanceof Array ? __j : Object.getOwnPropertyNames(__j||{});
	var __m=__k.length;
	for (var __l=0;__l<__m;__l++){
		var __i=(__k===__j)?__l:__k[__l];
		var k=__j[__i];
		// This is the body of the iteration with (value=k, key/index=__i) in __j
		if (!extend.isDefined(scope[k])) {
			scope[k] = {};
		};
		scope = scope[k];
	}
	scope[last_key] = value;
	return o;
}
stats.get = function(value, key){
	var self = stats;
	if (extend.isList(value)) {
		var i = parseInt(key);
		if (i < 0) {
			i = (i + __module__.len(value));
		}
		if (extend.isNumber(key) || isNaN(i)) {
			return value[i];
		} else {
			return extend.map(value, function(_) {
				return __module__.get(_, key);
			});
		}
	} else if (value) {
		return value[key];
	} else {
		return null;
	}
}
stats.keys = function(v, processor){
	var self = stats;
	if (processor === undefined) {processor=undefined}
	if (extend.isDefined(processor)) {
		if (iString(processor)) {
			processor = __module__.parseOperation(processor);
		}
		res = {};
		// Iterates over `v`. This works on array,objects and null/undefined
		var __o=v;
		var __n=__o instanceof Array ? __o : Object.getOwnPropertyNames(__o||{});
		var __q=__n.length;
		for (var __p=0;__p<__q;__p++){
			var k=(__n===__o)?__p:__n[__p];
			var __r=__o[k];
			// This is the body of the iteration with (value=__r, key/index=k) in __o
			(function(v){res[processor(v)] = v;}(__r))
		}
		return res;
	} else {
		var res = [];
		if (v) {for (var k in v) {res.push(k);}}
		
		return res;
	}
}
stats.items = function(v, predicate, asArray){
	var self = stats;
	if (predicate === undefined) {predicate=undefined}
	if (asArray === undefined) {asArray=true}
	var res = [];
	if(asArray){
	  for (var k in v) {
	    if (!predicate || predicate(v,k)) {res.push([k,v[k]]);}
	  }
	} else {
	  for (var k in v) {
	    if (!predicate || predicate(v,k)) {res.push({key:k,value:v[k]});}
	  }
	}
	
	return res;
}
stats.itemsForKeys = function(v, keys, skipUndefined){
	var self = stats;
	if (skipUndefined === undefined) {skipUndefined=false}
	var res = [];
	// Iterates over `keys`. This works on array,objects and null/undefined
	var __t=keys;
	var __u=__t instanceof Array ? __t : Object.getOwnPropertyNames(__t||{});
	var __w=__u.length;
	for (var __v=0;__v<__w;__v++){
		var __s=(__u===__t)?__v:__u[__v];
		var _=__t[__s];
		// This is the body of the iteration with (value=_, key/index=__s) in __t
		if ((!skipUndefined) || extend.isDefined(v[_])) {
			res.push([_, v[_]]);
		};
	}
	return res;
}
/**
  * Extracts a subset of the list or map that corresponds to the given keys.
  * 
*/
stats.subset = function(v, keys, skipUndefined){
	var self = stats;
	if (skipUndefined === undefined) {skipUndefined=false}
	if (extend.isMap(v)) {
		var res = {};
		// Iterates over `keys`. This works on array,objects and null/undefined
		var __y=keys;
		var __z=__y instanceof Array ? __y : Object.getOwnPropertyNames(__y||{});
		var __b=__z.length;
		for (var __a=0;__a<__b;__a++){
			var __x=(__z===__y)?__a:__z[__a];
			var _=__y[__x];
			// This is the body of the iteration with (value=_, key/index=__x) in __y
			if ((!skipUndefined) || extend.isDefined(v[_])) {
				res[_] = v[_];
			};
		}
		return res;
	} else if (extend.isList(v)) {
		var res = [];
		// Iterates over `keys`. This works on array,objects and null/undefined
		var __d=keys;
		var __e=__d instanceof Array ? __d : Object.getOwnPropertyNames(__d||{});
		var __g=__e.length;
		for (var __f=0;__f<__g;__f++){
			var __c=(__e===__d)?__f:__e[__f];
			var _=__d[__c];
			// This is the body of the iteration with (value=_, key/index=__c) in __d
			if ((!skipUndefined) || extend.isDefined(v[_])) {
				res.push(v[_]);
			};
		}
		return res;
	} else {
		extend.error(("stats.subset: Unsupported type " + v));
	}
}
stats.itemsA = function(v, predicate){
	var self = stats;
	if (predicate === undefined) {predicate=undefined}
	return __module__.items(v, predicate, true);
}
stats.itemsM = function(v, predicate){
	var self = stats;
	if (predicate === undefined) {predicate=undefined}
	return __module__.items(v, predicate, false);
}
stats.len = function(v){
	var self = stats;
	if (extend.isList(v)) {
		return v.length;
	} else if (extend.isMap(v)) {
		var c = 0;
		// Iterates over `v`. This works on array,objects and null/undefined
		var __jj=v;
		var __kj=__jj instanceof Array ? __jj : Object.getOwnPropertyNames(__jj||{});
		var __mj=__kj.length;
		for (var __lj=0;__lj<__mj;__lj++){
			var __ij=(__kj===__jj)?__lj:__kj[__lj];
			var __h=__jj[__ij];
			// This is the body of the iteration with (value=__h, key/index=__ij) in __jj
			c = (c + 1);
		}
		return c;
	} else {
		return undefined;
	}
}
stats.hasValue = function(value){
	var self = stats;
	return ((value && true) || false);
}
/**
  * Returns a map with the elements of array and the number of occurence of
  * each element in the array
  * 
*/
stats.occurences = function(array){
	var self = stats;
	var res = {};
	// Iterates over `array`. This works on array,objects and null/undefined
	var __nj=array;
	var __pj=__nj instanceof Array ? __nj : Object.getOwnPropertyNames(__nj||{});
	var __rj=__pj.length;
	for (var __qj=0;__qj<__rj;__qj++){
		var __oj=(__pj===__nj)?__qj:__pj[__qj];
		var _=__nj[__oj];
		// This is the body of the iteration with (value=_, key/index=__oj) in __nj
		if (extend.isDefined(res[_])) {
			res[_] = (res[_] + 1);
		} else {
			res[_] = 1;
		};
	}
	return res;
}
stats.head = function(v){
	var self = stats;
	if (extend.isList(v)) {
		return v[0];
	} else {
		return v;
	}
}
stats.tail = function(v){
	var self = stats;
	if (extend.isList(v)) {
		return extend.access(v,-1);
	} else {
		return v;
	}
}
/**
  * A predicate that tells if the given value is not null
  * 
*/
stats.isNotNull = function(value){
	var self = stats;
	return (((!value) && true) || false);
}
/**
  * Tells if the given value is empty or not
  * 
*/
stats.isNotEmpty = function(value){
	var self = stats;
	if (extend.isList(value) || extend.isString(value)) {
		return (((value && (value.length > 0)) && true) || false);
	} else {
		return ((value && true) || false);
	}
}
stats.isPositive = function(value){
	var self = stats;
	return (value > 0);
}
stats.updateKeys = function(value, updater){
	var self = stats;
	var res = {};
	// Iterates over `value`. This works on array,objects and null/undefined
	var __sj=value;
	var __tj=__sj instanceof Array ? __sj : Object.getOwnPropertyNames(__sj||{});
	var __vj=__tj.length;
	for (var __uj=0;__uj<__vj;__uj++){
		var k=(__tj===__sj)?__uj:__tj[__uj];
		var v=__sj[k];
		// This is the body of the iteration with (value=v, key/index=k) in __sj
		res[updater(k)] = v;
	}
	return res;
}
stats.reverse = function(array){
	var self = stats;
	var copy = [].concat(array);
	copy.reverse();
	return copy;
}
/**
  * An alias to groupBy
  * 
*/
stats.group = function(values, extractor, useList){
	var self = stats;
	if (useList === undefined) {useList=true}
	return __module__.groupBy(values, extractor, useList);
}
/**
  * Returns a map where all the given values are bound to a key extracted
  * using the given `extractor` function.
  * 
  * The `useList` parameter allows to force the creation of lists in the
  * result map even if there is only one element associated with
  * the extracted key.
  * 
*/
stats.groupBy = function(values, extractor, useList){
	var self = stats;
	if (extractor === undefined) {extractor=function(_) {
		return _;
	}}
	if (useList === undefined) {useList=true}
	var result = null;
	if (extend.isNumber(extractor)) {
		var res = [];
		var i = 0;
		var l = null;
		var is_list = extend.isList(values);
		// Iterates over `values`. This works on array,objects and null/undefined
		var __wj=values;
		var __xj=__wj instanceof Array ? __wj : Object.getOwnPropertyNames(__wj||{});
		var __zj=__xj.length;
		for (var __yj=0;__yj<__zj;__yj++){
			var k=(__xj===__wj)?__yj:__xj[__yj];
			var v=__wj[k];
			// This is the body of the iteration with (value=v, key/index=k) in __wj
			if ((i == 0) || (i == extractor)) {
				i = 0;
				if (is_list) {
					l = [];
				} else {
					l = {};
				}
				res.push(l);
			};
			if (is_list) {
				l.push(v);
			} else {
				l[k] = v;
			};
			i = (i + 1);
		}
		return res;
	} else if (extend.isList(extractor)) {
		result = values;
		// Iterates over `extractor`. This works on array,objects and null/undefined
		var __aj=extractor;
		var __bj=__aj instanceof Array ? __aj : Object.getOwnPropertyNames(__aj||{});
		var __dj=__bj.length;
		for (var __cj=0;__cj<__dj;__cj++){
			var i=(__bj===__aj)?__cj:__bj[__cj];
			var e=__aj[i];
			// This is the body of the iteration with (value=e, key/index=i) in __aj
			var use_list = true;;
			if (i == 0) {
				result = __module__.groupBy(values, e);
			} else {
				if ((!useList) && (i == (__module__.len(extractor) - 1))) {
					use_list = false;
				}
				e = __module__.parseOperation(e);
				result = extend.map(result, (function(e){return (function(_) {
					return __module__.groupBy(_, e);
				})}(e)));
			};
		}
	} else {
		result = {};
		if (extend.isString(extractor)) {
			extractor = __module__.parseOperation(extractor);
		}
		// Iterates over `values`. This works on array,objects and null/undefined
		var __ej=values;
		var __fj=__ej instanceof Array ? __ej : Object.getOwnPropertyNames(__ej||{});
		var __hj=__fj.length;
		for (var __gj=0;__gj<__hj;__gj++){
			var k=(__fj===__ej)?__gj:__fj[__gj];
			var v=__ej[k];
			// This is the body of the iteration with (value=v, key/index=k) in __ej
			var k_l = extractor(v, k);;
			if (!(extend.isList(k_l) || extend.isMap(k_l))) {
				k_l = [k_l];
			};
			// Iterates over `k_l`. This works on array,objects and null/undefined
			var __jk=k_l;
			var __kk=__jk instanceof Array ? __jk : Object.getOwnPropertyNames(__jk||{});
			var __mk=__kk.length;
			for (var __lk=0;__lk<__mk;__lk++){
				var __ik=(__kk===__jk)?__lk:__kk[__lk];
				var __ok=__jk[__ik];
				// This is the body of the iteration with (value=__ok, key/index=__ik) in __jk
				(function(k){if (extend.isDefined(result[k])) {
					if (extend.isList(result[k])) {
						result[k].push(v);
					} else {
						result[k] = [result[k], v];
					}
				} else {
					if (useList) {
						result[k] = [v];
					} else {
						result[k] = v;
					}
				};}(__ok))
			};
		}
	}
	return result;
}
/**
  * Flattens lists and maps. For maps, the the result will be returned as
  * a `(key, value)` list.
  * 
*/
stats.flatten = function(values, depth, key){
	var self = stats;
	if (depth === undefined) {depth=-1}
	if (key === undefined) {key=undefined}
	if (depth != 0) {
		if (extend.isMap(values)) {
			var res = [];
			// Iterates over `values`. This works on array,objects and null/undefined
			var __nk=values;
			var __pk=__nk instanceof Array ? __nk : Object.getOwnPropertyNames(__nk||{});
			var __rk=__pk.length;
			for (var __qk=0;__qk<__rk;__qk++){
				var k=(__pk===__nk)?__qk:__pk[__qk];
				var v=__nk[k];
				// This is the body of the iteration with (value=v, key/index=k) in __nk
				var local_key = (key || []).concat([k]);;
				if ((depth != 1) && (extend.isList(v) || extend.isMap(v))) {
					// Iterates over `__module__.flatten(v, (depth - 1), local_key)`. This works on array,objects and null/undefined
					var __tk=__module__.flatten(v, (depth - 1), local_key);
					var __uk=__tk instanceof Array ? __tk : Object.getOwnPropertyNames(__tk||{});
					var __wk=__uk.length;
					for (var __vk=0;__vk<__wk;__vk++){
						var __sk=(__uk===__tk)?__vk:__uk[__vk];
						var r=__tk[__sk];
						// This is the body of the iteration with (value=r, key/index=__sk) in __tk
						if (extend.isList(r) && (__module__.len(r) == 2)) {
							res.push([r[0], r[1]]);
						} else {
							res.push(r);
						};
					}
				} else {
					res.push([local_key, v]);
				};
			}
			return res;
		} else if (extend.isList(values)) {
			var res = [];
			// Iterates over `values`. This works on array,objects and null/undefined
			var __yk=values;
			var __zk=__yk instanceof Array ? __yk : Object.getOwnPropertyNames(__yk||{});
			var __bk=__zk.length;
			for (var __ak=0;__ak<__bk;__ak++){
				var __xk=(__zk===__yk)?__ak:__zk[__ak];
				var element=__yk[__xk];
				// This is the body of the iteration with (value=element, key/index=__xk) in __yk
				var v = __module__.flatten(element, (depth - 1));;
				if (extend.isList(v)) {
					res = res.concat(v);
				} else {
					res.push(v);
				};
			}
			return res;
		} else {
			return values;
		}
	} else {
		return values;
	}
}
/**
  * Returns the unique
  * 
*/
stats.unique = function(array, criteria){
	var self = stats;
	if (criteria === undefined) {criteria=null}
	if (extend.isString(criteria)) {
		var criteria_key = criteria;
		criteria = function(v) {
			return v[criteria_key];
		};
	}
	var found = {};
	return __module__.filter(array, function(v, k) {
		var found_key = v;
		if (criteria) {
			found_key = criteria(v, k);
		}
		if (!found[found_key]) {
			found[found_key] = true;
			return true;
		} else {
			return false;
		}
	});
}
stats.merge = function(a, b){
	var self = stats;
	if (extend.isMap(a)) {
		var res = {};
		// Iterates over `a`. This works on array,objects and null/undefined
		var __ck=a;
		var __dk=__ck instanceof Array ? __ck : Object.getOwnPropertyNames(__ck||{});
		var __fk=__dk.length;
		for (var __ek=0;__ek<__fk;__ek++){
			var k=(__dk===__ck)?__ek:__dk[__ek];
			var v=__ck[k];
			// This is the body of the iteration with (value=v, key/index=k) in __ck
			res[k] = v;
		}
		// Iterates over `b`. This works on array,objects and null/undefined
		var __gk=b;
		var __hk=__gk instanceof Array ? __gk : Object.getOwnPropertyNames(__gk||{});
		var __jl=__hk.length;
		for (var __il=0;__il<__jl;__il++){
			var k=(__hk===__gk)?__il:__hk[__il];
			var v=__gk[k];
			// This is the body of the iteration with (value=v, key/index=k) in __gk
			if (!extend.isDefined(res[k])) {
				res[k] = v;
			};
		}
		return res;
	} else {
		extend.error("Type not supported");
	}
}
stats.random = function(a, b){
	var self = stats;
	if (a === undefined) {a=undefined}
	if (b === undefined) {b=undefined}
	if (!extend.isDefined(a)) {
		return Math.random();
	} else if (extend.isNumber(a)) {
		if (extend.isNumber(b)) {
			return stats.scale(__module__.random(), 1, [a, b]);
		} else {
			return (__module__.random() * a);
		}
	} else if (extend.isList(a)) {
		return a[parseInt(__module__.random(__module__.len(a)))];
	} else {
		extend.error("Not implemented");
	}
}
/**
  * Rounds the given number by the `roundBy` number. For instance :
  * 
  * round(2,5) == 0
  * round(3,5) == 5
  * round(6,5) == 5
  * round(8,5) == 10
  * round(0.39, 0.05) == 0.040
  * 
  * The `bound` parameter will using `floor` (<0), `round` (=0) and  `ceil` (>0)
  * to for the initial rouding.
  * 
  * round(1993,5,0)  == 1995
  * round(1993,5,-1) == 1990
  * round(1993,5, 1) == 1995
  * round(1992,5,0)  == 1990
  * round(1992,5,-1) == 1990
  * round(1992,5, 1) == 1995
  * 
*/
stats.round = function(number, roundBy, bound){
	var self = stats;
	if (roundBy === undefined) {roundBy=1}
	if (bound === undefined) {bound=0}
	var v = (number / roundBy);
	if (bound < 0) {
		v = Math.floor(v);
	} else if (bound > 0) {
		v = Math.ceil(v);
	} else {
		v = Math.round(v);
	}
	return (parseInt(v) * roundBy);
}
stats.shuffle = function(array){
	var self = stats;
	// Iterates over `extend.range(0,(array.length))`. This works on array,objects and null/undefined
	var __ll=extend.range(0,(array.length));
	var __ml=__ll instanceof Array ? __ll : Object.getOwnPropertyNames(__ll||{});
	var __nl=__ml.length;
	for (var __ol=0;__ol<__nl;__ol++){
		var __kl=(__ml===__ll)?__ol:__ml[__ol];
		var i=__ll[__kl];
		// This is the body of the iteration with (value=i, key/index=__kl) in __ll
		var j = Math.min((array.length - 1), Math.floor((Math.random() * array.length)));;
		var a = array[i];;
		var b = array[j];;
		array[i] = b;
		array[j] = a;
	}
	return array;
}
/**
  * Combines the two arrays into a single array, filling with `fill` if
  * on array is greater that the other:
  * 
*/
stats.zip = function(arrayA, arrayB, fill){
	var self = stats;
	if (fill === undefined) {fill=null}
	var la = __module__.len(arrayA);
	var lb = __module__.len(arrayB);
	var l = __module__.max(la, lb);
	var i = 0;
	var res = [];
	while ((i < l)) {
		if ((i < la) && (i < lb)) {
			res.push([arrayA[i], arrayB[i]]);
		} else if ((i < la) && (i >= lb)) {
			res.push([arrayA[i], fill]);
		} else if ((i >= la) && (i < lb)) {
			res.push([fill, fill]);
		} else {
			extend.error("stats.zip: Should never arrive here");
		}
		i = (i + 1);
	}
	return res;
}
stats.pick = function(array){
	var self = stats;
	if (extend.isList(array)) {
		var index = Math.round((Math.random() * (array.length - 1)));
		return array[index];
	} else {
		!(false) && extend.assert(false, "stats.pick:", "stats.pick expects array", "(failed `false`)");
	}
}
/**
  * Randomizes the values from the given array, with a lower value of
  * 'min' and a maximum value of 'max' (inclusive bounds).
  * 
*/
stats.randomize = function(array, min, max){
	var self = stats;
	if (min === undefined) {min=-1}
	if (max === undefined) {max=1}
	// Iterates over `array`. This works on array,objects and null/undefined
	var __pl=array;
	var __ql=__pl instanceof Array ? __pl : Object.getOwnPropertyNames(__pl||{});
	var __sl=__ql.length;
	for (var __rl=0;__rl<__sl;__rl++){
		var i=(__ql===__pl)?__rl:__ql[__rl];
		var data=__pl[i];
		// This is the body of the iteration with (value=data, key/index=i) in __pl
		array[i] = ((Math.random() * (max - min)) + min);
	}
	return array;
}
stats.cumulated = function(array){
	var self = stats;
	var res = [];
	var t = 0;
	// Iterates over `array`. This works on array,objects and null/undefined
	var __ul=array;
	var __vl=__ul instanceof Array ? __ul : Object.getOwnPropertyNames(__ul||{});
	var __xl=__vl.length;
	for (var __wl=0;__wl<__xl;__wl++){
		var __tl=(__vl===__ul)?__wl:__vl[__wl];
		var v=__ul[__tl];
		// This is the body of the iteration with (value=v, key/index=__tl) in __ul
		t = (t + v);
		res.push(t);
	}
	return res;
}
stats.blank = function(array){
	var self = stats;
	if (arguments.length == 0) {
		return 0;
	} else {
		// Iterates over `array`. This works on array,objects and null/undefined
		var __yl=array;
		var __zl=__yl instanceof Array ? __yl : Object.getOwnPropertyNames(__yl||{});
		var __bl=__zl.length;
		for (var __al=0;__al<__bl;__al++){
			var i=(__zl===__yl)?__al:__zl[__al];
			var e=__yl[i];
			// This is the body of the iteration with (value=e, key/index=i) in __yl
			array[i] = 0;
		}
	}
}
/**
  * Excludes the given `excludedValues` from the list of `fromValues`. Excluded values
  * can be a list, a map (in which case only the values will be kept) or a string or number.
  * From values should be a list or a map, in which case the iteration will happen
  * on the values.
  * 
*/
stats.exclude = function(excludedValues, fromValues){
	var self = stats;
	if (extend.isList(fromValues)) {
		if (extend.isMap(excludedValues)) {
			excludedValues = __module__.values(excludedValues);
		}
		var res = [];
		if (extend.isList(excludedValues)) {
			// Iterates over `fromValues`. This works on array,objects and null/undefined
			var __dl=fromValues;
			var __el=__dl instanceof Array ? __dl : Object.getOwnPropertyNames(__dl||{});
			var __gl=__el.length;
			for (var __fl=0;__fl<__gl;__fl++){
				var __cl=(__el===__dl)?__fl:__el[__fl];
				var v=__dl[__cl];
				// This is the body of the iteration with (value=v, key/index=__cl) in __dl
				if (extend.find(excludedValues, v) == -1) {
					res.push(v);
				};
			}
		} else {
			// Iterates over `fromValues`. This works on array,objects and null/undefined
			var __im=fromValues;
			var __jm=__im instanceof Array ? __im : Object.getOwnPropertyNames(__im||{});
			var __lm=__jm.length;
			for (var __km=0;__km<__lm;__km++){
				var __hl=(__jm===__im)?__km:__jm[__km];
				var v=__im[__hl];
				// This is the body of the iteration with (value=v, key/index=__hl) in __im
				if (v != excludedValues) {
					res.push(v);
				};
			}
		}
		return res;
	} else if (extend.isMap(fromValues)) {
		return __module__.exclude(excludedValues, __module__.values(fromValues));
	} else {
		return null;
	}
}
/**
  * Extracts the values attached to the given key of the values in the given
  * list/map.
  * 
*/
stats.extract = function(values, key, unique){
	var self = stats;
	if (unique === undefined) {unique=false}
	return extend.map(values, function(v, k) {
		if (extend.isList(v) || extend.isMap(v)) {
			return v[key];
		} else {
			return v;
		}
	});
}
stats.difference = function(a, b){
	var self = stats;
	return extend.filter(a, function(_) {
		return (!((extend.isIn(_,b))));
	});
}
stats.min = function(a, b){
	var self = stats;
	if (a === undefined) {
		return b;
	} else if (b === undefined) {
		if (extend.isList(a)) {
			return extend.reduce(a, __module__.min);
		} else if (extend.isMap(a)) {
			return __module__.min(__module__.values(a));
		} else {
			return a;
		}
	} else {
		if (extend.cmp(a, b) > 0) {
			return b;
		} else {
			return a;
		}
	}
}
/**
  * Ensures that the given value is within the `[minval, maxval]` interval.
  * 
*/
stats.clamp = function(value, minval, maxval){
	var self = stats;
	if (extend.isList(minval)) {
		return __module__.clamp(value, minval[0], minval[1]);
	} else {
		return __module__.max(__module__.min(value, maxval), minval);
	}
}
stats.max = function(a, b){
	var self = stats;
	if (a === undefined) {
		return b;
	} else if (b === undefined) {
		if (extend.isList(a)) {
			return extend.reduce(a, __module__.max);
		} else {
			return a;
		}
	} else {
		if (extend.cmp(a, b) < 0) {
			return b;
		} else {
			return a;
		}
	}
}
stats.minmax = function(a, b){
	var self = stats;
	if (a === undefined) {
		return b;
	} else if ((b === undefined) || extend.isFunction(b)) {
		if (extend.isList(a)) {
			var extractor = b;
			return extend.reduce(a, function(v1, v2, i) {
				if (extractor) {
					v2 = extractor(v2, i);
				}
				if (v1.length == 2) {
					v1[0] = __module__.min(v1[0], v2);
					v1[1] = __module__.max(v1[1], v2);
				} else {
					v1.push(v2);
					v1.push(v2);
				}
				return v1;
			}, []);
		} else {
			return a;
		}
	} else {
		if (extend.isList(b)) {
			if (extend.isList(a)) {
				return [__module__.min(a[0], b[0]), __module__.max(a[1], b[1])];
			} else {
				return [__module__.min(a, b[0]), __module__.max(a, b[1])];
			}
		} else {
			return [__module__.min(a, b), __module__.max(a, b)];
		}
	}
}
/**
  * Returns True if the value is within the range
  * 
*/
stats.within = function(value, minval, maxval){
	var self = stats;
	return (__module__.clamp(value, minval, maxval) == value);
}
/**
  * Sums the given array (or sum a + b). If `b` is a function, it will be
  * used to extract the values from a. If `b` is a string, the string
  * will be parsed using `parseOperation` to return the extractor.
  * 
*/
stats.sum = function(a, b){
	var self = stats;
	if (b === undefined) {b=null}
	!((typeof(a) == typeof(b))) && extend.assert(false, "stats.sum:", ((("stats.sum:Trying to sum values of different type " + typeof(a)) + ", ") + typeof(b)), "(failed `(typeof(a) == typeof(b))`)");
	if (((b === null) || extend.isFunction(b)) || extend.isString(b)) {
		var t = 0;
		var extractor = null;
		if (extend.isFunction(b)) {
			extractor = b;
		} else if (extend.isString(b)) {
			extractor = __module__.parseOperation(b);
		}
		// Iterates over `a`. This works on array,objects and null/undefined
		var __mm=a;
		var __om=__mm instanceof Array ? __mm : Object.getOwnPropertyNames(__mm||{});
		var __pm=__om.length;
		for (var __nm=0;__nm<__pm;__nm++){
			var k=(__om===__mm)?__nm:__om[__nm];
			var v=__mm[k];
			// This is the body of the iteration with (value=v, key/index=k) in __mm
			if (extractor) {
				v = (extractor(v, k) || 0);
			};
			t = (t + v);
		}
		return t;
	} else {
		var res = null;
		if (extend.isList(a)) {
			res = [];
			l = __module__.max(a.length, b.length);
			// Iterates over `extend.range(0,(l))`. This works on array,objects and null/undefined
			var __rm=extend.range(0,(l));
			var __sm=__rm instanceof Array ? __rm : Object.getOwnPropertyNames(__rm||{});
			var __um=__sm.length;
			for (var __tm=0;__tm<__um;__tm++){
				var __qm=(__sm===__rm)?__tm:__sm[__tm];
				var i=__rm[__qm];
				// This is the body of the iteration with (value=i, key/index=__qm) in __rm
				res.push(0);
				if (i < a.length) {
					res[i] = __module__.sum(res[i], a[i]);
				};
				if (i < b.length) {
					res[i] = __module__.sum(res[i], b[i]);
				};
			}
		} else if (extend.isMap(a)) {
			var res = {};
			// Iterates over `b`. This works on array,objects and null/undefined
			var __vm=b;
			var __wm=__vm instanceof Array ? __vm : Object.getOwnPropertyNames(__vm||{});
			var __ym=__wm.length;
			for (var __xm=0;__xm<__ym;__xm++){
				var k=(__wm===__vm)?__xm:__wm[__xm];
				var v=__vm[k];
				// This is the body of the iteration with (value=v, key/index=k) in __vm
				if (extend.isDefined(res[k])) {
					res[k] = __module__.sum(res[k], b);
				} else {
					res[k] = b;
				};
			}
		} else if (String(a)) {
			res = __module__.sum(extend.createMapFromItems([a,1],[b,1]));
		} else if (Number(a)) {
			res = (a + b);
		} else {
			extend.error(("Type not supported yet:" + a));
		}
		return res;
	}
}
stats.mean = function(value){
	var self = stats;
	return (__module__.sum(value) / __module__.len(value));
}
stats.median = function(values, sort){
	var self = stats;
	if (sort === undefined) {sort=true}
	return __module__.percentile(values, 50, sort);
}
/**
  * Partitions the given set of values in the set that matches the given
  * criteria and the set that does'n
  * 
*/
stats.partition = function(values, criteria){
	var self = stats;
	if (extend.isList(values)) {
		var matches = [];
		var nomatch = [];
		// Iterates over `values`. This works on array,objects and null/undefined
		var __zm=values;
		var __am=__zm instanceof Array ? __zm : Object.getOwnPropertyNames(__zm||{});
		var __cm=__am.length;
		for (var __bm=0;__bm<__cm;__bm++){
			var k=(__am===__zm)?__bm:__am[__bm];
			var v=__zm[k];
			// This is the body of the iteration with (value=v, key/index=k) in __zm
			if (criteria(v)) {
				matches.push(v);
			} else {
				nomatch.push(v);
			};
		}
		return [matches, nomatch];
	} else if (extend.isMap(values)) {
		var matches = {};
		var nomatch = {};
		// Iterates over `values`. This works on array,objects and null/undefined
		var __dm=values;
		var __em=__dm instanceof Array ? __dm : Object.getOwnPropertyNames(__dm||{});
		var __gm=__em.length;
		for (var __fm=0;__fm<__gm;__fm++){
			var k=(__em===__dm)?__fm:__em[__fm];
			var v=__dm[k];
			// This is the body of the iteration with (value=v, key/index=k) in __dm
			if (criteria(v)) {
				matches[k] = v;
			} else {
				nomatch[k] = v;
			};
		}
		return [matches, nomatch];
	} else {
		extend.error("stats.partition: Type not supported", values);
	}
}
/**
  * Returns the `index` percentile(s) of the given set of values.
  * Index can be either a number (the percentile number 0-100), or
  * an array of indexes (0-100)
  * 
*/
stats.percentile = function(values, index, sort){
	var self = stats;
	if (sort === undefined) {sort=true}
	if (sort) {
		values = stats.sorted(values);
	}
	if (extend.isNumber(index)) {
		var l = (__module__.len(values) - 1);
		var i = (l * (index / 100));
		var i_lo = parseInt(Math.floor(i));
		if (i_lo == i) {
			return values[i_lo];
		} else {
			return (values[i_lo] + ((values[(i_lo + 1)] - values[i_lo]) / 2));
		}
	} else {
		return __module__.map(index, function(_) {
			return __module__.percentile(values, _, false);
		});
	}
}
/**
  * Returns `quantity` groups of approximatively the same number of elements
  * from the given list of values.
  * 
*/
stats.quantiles = function(values, quantity){
	var self = stats;
	var count = __module__.len(values);
	var group_size = (count / quantity);
	var res = [];
	var bucket = 0;
	while ((quantity > 0)) {
		var o = (bucket * group_size);
		var start_o = Math.floor(o);
		var end_o = Math.floor((o + group_size));
		if (quantity == 1) {
			res.push(extend.slice(values,start_o,undefined));
		} else {
			res.push(extend.slice(values,start_o,end_o));
		}
		bucket = (bucket + 1);
		quantity = (quantity - 1);
	}
	return res;
}
/**
  * Returns the closest number being a multiple of step that is above value
  * 
*/
stats.pad = function(value, step){
	var self = stats;
	if (step === undefined) {step=10}
	return (Math.ceil((value / step)) * step);
}
stats.interpolate = function(a, b, r){
	var self = stats;
	if (r === undefined) {r=0.5}
	if (extend.isList(a)) {
		return extend.map(extend.keys(a), function(_) {
			return __module__.interpolate(a[_], b[_], r);
		});
	} else {
		return (a + ((b - a) * r));
	}
}
/**
  * Returns a map corresponding to the grouping/distribution of
  * the given values into buckets. Predicates can be given
  * as a map:
  * 
  * ```
  * stats buckets ([1,2,3,4,5,6], {
  * even : {_|return _ % 2 == 0}
  * odd  : {_|return _ % 2 == 1}
  * })
  * --
  * {
  * even : [2,4,6]
  * odd  : [1,3,5]
  * }
  * ```
  * 
  * You can also give the a list of functions instead
  * 
  * ```
  * stats buckets ([1,2,3,4,5,6], [
  * {_|return _ % 2 == 0}
  * {_|return _ % 2 == 1}
  * ]
  * --
  * {
  * 0 : [2,4,6]
  * 1 : [1,3,5]
  * }
  * ```
  * 
  * And specify a the bucket name by using `(<name>, <predicate>)` couples:
  * 
  * ```
  * stats buckets ([1,2,3,4,5,6], [
  * ["even", {_|return _ % 2 == 0}]
  * ["odd,   {_|return _ % 2 == 1}]
  * ]
  * --
  * {
  * even : [2,4,6]
  * odd  : [1,3,5]
  * }
  * ```
  * 
*/
stats.buckets = function(values, predicates, exclusive){
	var self = stats;
	if (exclusive === undefined) {exclusive=false}
	var res = {};
	// Iterates over `values`. This works on array,objects and null/undefined
	var __io=values;
	var __jo=__io instanceof Array ? __io : Object.getOwnPropertyNames(__io||{});
	var __lo=__jo.length;
	for (var __ko=0;__ko<__lo;__ko++){
		var __hm=(__jo===__io)?__ko:__jo[__ko];
		var _=__io[__hm];
		// This is the body of the iteration with (value=_, key/index=__hm) in __io
		var matched = false;;
		// Iterates over `predicates`. This works on array,objects and null/undefined
		var __mo=predicates;
		var __oo=__mo instanceof Array ? __mo : Object.getOwnPropertyNames(__mo||{});
		var __po=__oo.length;
		for (var __no=0;__no<__po;__no++){
			var bucket=(__oo===__mo)?__no:__oo[__no];
			var predicate=__mo[bucket];
			// This is the body of the iteration with (value=predicate, key/index=bucket) in __mo
			if (extend.isList(predicate)) {
				bucket = predicate[0];
				predicate = predicate[1];
			};
			if ((!(exclusive && matched)) && predicate(_)) {
				res[bucket] = (res[bucket] || []);
				res[bucket].push(_);
				matched = true;
			};
		};
	}
	return res;
}
/**
  * Converts the given value to the index in the discrete scale between minValue and maxValue (included)
  * with the given number of steps. For instance:
  * 
  * >     discretize (8.50, 0, 10, 10)
  * >     discretize (10,   0, 10, 10)
  * >     discretize (10,   0, 11, 11)
  * 
*/
stats.discretize = function(value, minValue, maxValue, steps, select){
	var self = stats;
	if (select === undefined) {select=SELECT_LOWER}
	var step = ((value - minValue) / ((maxValue - minValue) / steps));
	if (select == SELECT_LOWER) {
		step = Math.floor(step);
	} else if (select == SELECT_UPPER) {
		step = Math.ceil(step);
	} else {
		step = Math.round(step);
	}
	return Math.max(0, Math.min(step, (steps - 1)));
}
stats.log10 = function(value){
	var self = stats;
	return (Math.log(value) / Math.LN10);
}
/**
  * Returns the nth-step of the range defined by `minValue`-`maxValue`
  * divided in `totalSteps`.
  * 
  * >    $ steps (0,100,10)
  * >    [0,10,20,30,40,50,60,70,80,90,100]
  * >    $ steps (50,100,10)
  * >    [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]
  * 
  * >    $ steps (0,100,Undefined,10)
  * >    [0,10,20,30,40,50,60,70,80,90,100]
  * >    $ steps (50,100,Undefined,10)
  * >    [50, 60, 70, 80, 90, 100]
  * 
  * >    $ step (0,100,10,1)
  * >    10
  * >    $ step (50,100,10,1)
  * >    55
  * >    $ step (50,100,10,2)
  * >    60
  * 
  * The optional `padding` element allows to make sure that each step
  * is separated by the value `padding`.
  * 
  * >    $ step (0,100,10,1,5)
  * 
  * >    $ step (0,100,10,1,5)
  * 
  * 
*/
stats.steps = function(minValue, maxValue, totalSteps, step, padding){
	var self = stats;
	if (totalSteps === undefined) {totalSteps=undefined}
	if (step === undefined) {step=undefined}
	if (padding === undefined) {padding=0}
	if (extend.isList(minValue) && (!extend.isDefined(maxValue))) {
		return __module__.steps(minValue[0], minValue[1], totalSteps, step, padding);
	}
	if (!extend.isDefined(step)) {
		if (!extend.isDefined(totalSteps)) {
			var l = (__module__.log10(Math.round(Math.abs((minValue - maxValue)))) - 1);
			if (l > 0) {
				step = Math.round(Math.pow(10, l));
			} else {
				step = (1 / Math.round(Math.pow(10, (0 - l))));
			}
		} else {
			step = ((maxValue - minValue) / totalSteps);
		}
		var r = [];
		var v = minValue;
		while ((v <= maxValue)) {
			r.push(v);
			v = (v + step);
		}
		return r;
	} else if (!extend.isDefined(totalSteps)) {
		var r = [];
		var v = minValue;
		while ((v <= maxValue)) {
			r.push(v);
			v = (v + step);
		}
		return r;
	} else {
		var delta = ((1.0 * (maxValue - minValue)) / totalSteps);
		return (minValue + (step * delta));
	}
}
stats.linear = function(a, b, steps){
	var self = stats;
	if (steps > 2) {
		res = [];
		r = 0;
		s = (1.0 / (steps - 1));
		while ((r <= 1.0)) {
			res.push(__module__.interpolate(a, b, r));
			r = (r + s);
		}
		return res;
	} else {
		return [a, b];
	}
}
stats.between = function(v, a, b){
	var self = stats;
	if ((a === undefined) || (b === undefined)) {
		return undefined;
	} else {
		return ((v >= a) && (v <= b));
	}
}
/**
  * Snaps the given value to a pixel value (does a simple parseInt)
  * 
*/
stats.pixel = function(value){
	var self = stats;
	if (value > 0) {
		return parseInt(Math.max(1, value));
	} else if (value < 0) {
		return parseInt(Math.min(1, value));
	} else {
		return 0;
	}
}
/**
  * Returns the closest multiple of `multiple` to the given `value`.
  * 
*/
stats.closest = function(value, multiple, bound){
	var self = stats;
	if (multiple === undefined) {multiple=10}
	if (bound === undefined) {bound=1}
	if (extend.isList(value)) {
		return extend.map(value, function(_) {
			return __module__.closest(_, multiple, bound);
		});
	}
	if (bound > 0) {
		return (Math.ceil((value / multiple)) * multiple);
	} else if (bound < 0) {
		return (Math.floor((value / multiple)) * multiple);
	} else {
		return (Math.round((value / multiple)) * multiple);
	}
}
/**
  * Returns a "nice" human-friendly, integer value close to the given value. Nice
  * will find the closest power of 10 to the given value, divide it by `steps`
  * and round value to the closest multiple of the result.
  * 
  * This works well for numerical values. Usually, if you have a range of values,
  * you would do:
  * 
  * `stats nice (stats max (values) * 1.25)`
  * 
  * The `1.25` factor allows to leave some space above the value.
  * 
*/
stats.nice = function(value, steps, bound){
	var self = stats;
	if (steps === undefined) {steps=10}
	if (bound === undefined) {bound=1}
	if (extend.isList(value)) {
		return extend.map(value, function(_) {
			return __module__.nice(_, steps, bound);
		});
	}
	if (value < 0) {
		return (0 - __module__.nice(Math.abs(value), steps, bound));
	}
	var scale = 0;
	while ((Math.pow(10, scale) < value)) {
		scale = (scale + 1);
	}
	var divider = (Math.pow(10, scale) / steps);
	return __module__.closest(value, divider, bound);
}
/**
  * Transforms the given `value` that is supposed to be contained within
  * `fromRange` into the domain where `fromRange` corresponds to `toRange`.
  * 
  * Ex: scale(5, [0,10],  [0,100])  == 50
  * Ex: scale(5, [100,0], [0,100]) == 90
  * 
*/
stats.scale = function(value, fromRange, toRange){
	var self = stats;
	if (toRange === undefined) {toRange=undefined}
	if (!extend.isDefined(toRange)) {
		toRange = fromRange;
		fromRange = [0, 1.0];
	}
	if (extend.isNumber(fromRange)) {
		fromRange = [0, fromRange];
	}
	if (extend.isNumber(toRange)) {
		toRange = [0, toRange];
	}
	var o = ((value - fromRange[0]) / (extend.access(fromRange,-1) - fromRange[0]));
	return (toRange[0] + (o * (extend.access(toRange,-1) - toRange[0])));
}
/**
  * The classic smoothstep interpolator
  * <https://en.wikipedia.org/wiki/Smoothstep>
  * 
*/
stats.smoothstep = function(v){
	var self = stats;
	var vv = (v * v);
	return ((3 * vv) - ((2 * v) * vv));
}
/**
  * Deforms the given scale with the given function.
  * 
*/
stats.deform = function(value, deformRange, easing){
	var self = stats;
	if (easing === undefined) {easing=__module__.smoothstep}
	if (!__module__.within(value, deformRange)) {
		return value;
	} else {
		var t = __module__.normalize(value, deformRange);
		return __module__.denormalize(easing(t), deformRange);
	}
}
/**
  * Returns the radius of the circle, where `valueRange` is the values's domain
  * and `radiusRange` is the range's domain.
  * 
  * For instance:
  * 
  * ```
  * scaleRadius ([0,100], [0,10], 5)
  * ```
  * 
  * means the values are within `0-100`, and the resulting radius should be
  * within `0-10` and the value you'd like to get the radius for is `5`.
  * 
*/
stats.radius = function(value, valueRange, radiusRange){
	var self = stats;
	if (extend.isNumber(valueRange)) {
		valueRange = [0, valueRange];
	}
	if (extend.isNumber(radiusRange)) {
		radiusRange = [0, radiusRange];
	}
	var r_range = [(radiusRange[0] * radiusRange[0]), (radiusRange[1] * radiusRange[1])];
	var area = __module__.scale(value, valueRange, r_range);
	return Math.sqrt(area);
}
/**
  * Returns the normalized value of `value` within `valueRange`. This is the
  * opposite of scale.
  * 
*/
stats.normalize = function(value, valueRange){
	var self = stats;
	if (valueRange === undefined) {valueRange=undefined}
	if (extend.isDefined(valueRange)) {
		return __module__.scale(value, valueRange, __module__.NORMAL_RANGE);
	} else {
		if (value == 0) {
			return value;
		} else if (value > 0) {
			return 1;
		} else {
			return -1;
		}
	}
}
stats.denormalize = function(value, valueRange){
	var self = stats;
	return __module__.scale(value, __module__.NORMAL_RANGE, valueRange);
}
/**
  * Describes the given array of numbers, returning a dictionary with the
  * following keys:
  * 
  * - min
  * - max
  * - median
  * - average
  * - deviation
  * - deviation-over
  * - deviation-within
  * - deviation-under
  * - total
  * - count
  * 
*/
stats.describe = function(array){
	var self = stats;
	var v_min = null;
	var v_max = null;
	var v_average = null;
	var v_total = 0;
	var v_count = 0;
	// Iterates over `array`. This works on array,objects and null/undefined
	var __ro=array;
	var __so=__ro instanceof Array ? __ro : Object.getOwnPropertyNames(__ro||{});
	var __uo=__so.length;
	for (var __to=0;__to<__uo;__to++){
		var __qo=(__so===__ro)?__to:__so[__to];
		var e=__ro[__qo];
		// This is the body of the iteration with (value=e, key/index=__qo) in __ro
		if (v_min === null) {
			v_min = e;
		};
		if (v_max === null) {
			v_max = e;
		};
		v_min = __module__.min(v_min, e);
		v_max = __module__.max(v_max, e);
		v_total = (v_total + e);
		v_count = (v_count + 1);
	}
	var v_median = array[parseInt((v_count / 2))];
	var v_average = (v_total / v_count);
	var variance_t = 0;
	// Iterates over `array`. This works on array,objects and null/undefined
	var __wo=array;
	var __xo=__wo instanceof Array ? __wo : Object.getOwnPropertyNames(__wo||{});
	var __zo=__xo.length;
	for (var __yo=0;__yo<__zo;__yo++){
		var __vo=(__xo===__wo)?__yo:__xo[__yo];
		var e=__wo[__vo];
		// This is the body of the iteration with (value=e, key/index=__vo) in __wo
		variance_t = (variance_t + Math.abs((v_average - e)));
	}
	var v_deviation = (variance_t / v_count);
	var in_deviation = 0;
	var over_deviation = 0;
	var under_deviation = 0;
	// Iterates over `array`. This works on array,objects and null/undefined
	var __bo=array;
	var __co=__bo instanceof Array ? __bo : Object.getOwnPropertyNames(__bo||{});
	var __eo=__co.length;
	for (var __do=0;__do<__eo;__do++){
		var __ao=(__co===__bo)?__do:__co[__do];
		var e=__bo[__ao];
		// This is the body of the iteration with (value=e, key/index=__ao) in __bo
		var d = (e - v_average);;
		if (d > v_deviation) {
			over_deviation = (over_deviation + 1);
		} else if (d < (0 - v_deviation)) {
			under_deviation = (under_deviation + 1);
		} else {
			in_deviation = (in_deviation + 1);
		};
	}
	return {"min":v_min, "max":v_max, "average":v_average, "median":v_median, "deviation":v_deviation, "deviation-within":in_deviation, "deviation-over":over_deviation, "deviation-under":under_deviation, "total":v_total, "count":v_count};
}
stats.identity = function(value){
	var self = stats;
	return value;
}
/**
  * Returns the given value as Undefined
  * 
*/
stats.asUndefined = function(){
	var self = stats;
	return undefined;
}
/**
  * Returns the given value as a key
  * 
*/
stats.asKey = function(value){
	var self = stats;
	return ("" + value).replace(__module__.RE_KEY, "").replace(__module__.RE_SPACES, "_").toLowerCase().trim();
}
stats.asIs = function(value){
	var self = stats;
	return value;
}
stats.asInteger = function(value){
	var self = stats;
	return parseInt(value);
}
stats.asMap = function(values, extractor){
	var self = stats;
	if (extractor === undefined) {extractor=null}
	var r = {};
	if (extend.isFunction(extractor)) {
		// Iterates over `values`. This works on array,objects and null/undefined
		var __go=values;
		var __ho=__go instanceof Array ? __go : Object.getOwnPropertyNames(__go||{});
		var __jn=__ho.length;
		for (var __in=0;__in<__jn;__in++){
			var __fo=(__ho===__go)?__in:__ho[__in];
			var v=__go[__fo];
			// This is the body of the iteration with (value=v, key/index=__fo) in __go
			var e = extractor(v);;
			if (extend.isList(e) && (__module__.len(e) == 2)) {
				r[e[0]] = e[1];
			} else if (extend.isString(e) || extend.isNumber(e)) {
				r[e] = true;
			} else {
				extend.error(("Unsupported extracted value: " + e));
			};
		}
	} else {
		// Iterates over `values`. This works on array,objects and null/undefined
		var __ln=values;
		var __mn=__ln instanceof Array ? __ln : Object.getOwnPropertyNames(__ln||{});
		var __nn=__mn.length;
		for (var __on=0;__on<__nn;__on++){
			var __kn=(__mn===__ln)?__on:__mn[__on];
			var v=__ln[__kn];
			// This is the body of the iteration with (value=v, key/index=__kn) in __ln
			if (extend.isString(v) || extend.isNumber(v)) {
				r[v] = extractor;
			} else {
				extend.error(("Unsupported value: " + e));
			};
		}
	}
	return r;
}
stats.zero = function(){
	var self = stats;
	return 0;
}
/**
  * Creates an array from the given length, initialized with values produced
  * by the given 'init' function.
  * 
*/
stats.array = function(length, init){
	var self = stats;
	if (init === undefined) {init=function(_) {
		return 0;
	}}
	var res = [];
	var i = 0;
	while ((length > 0)) {
		var value = init;
		if (extend.isFunction(init)) {
			value = init(i);
		}
		res.push(value);
		i = (i + 1);
		length = (length - 1);
	}
	return res;
}
stats.matrix = function(width, height, init){
	var self = stats;
	if (init === undefined) {init=function(_) {
		return 0;
	}}
	var res = [];
	// Iterates over `extend.range(0,(height))`. This works on array,objects and null/undefined
	var __qn=extend.range(0,(height));
	var __rn=__qn instanceof Array ? __qn : Object.getOwnPropertyNames(__qn||{});
	var __tn=__rn.length;
	for (var __sn=0;__sn<__tn;__sn++){
		var __pn=(__rn===__qn)?__sn:__rn[__sn];
		var y=__qn[__pn];
		// This is the body of the iteration with (value=y, key/index=__pn) in __qn
		var line = [];;
		// Iterates over `extend.range(0,(width))`. This works on array,objects and null/undefined
		var __vn=extend.range(0,(width));
		var __wn=__vn instanceof Array ? __vn : Object.getOwnPropertyNames(__vn||{});
		var __yn=__wn.length;
		for (var __xn=0;__xn<__yn;__xn++){
			var __un=(__wn===__vn)?__xn:__wn[__xn];
			var x=__vn[__un];
			// This is the body of the iteration with (value=x, key/index=__un) in __vn
			line.push(init(x, y));
		};
		res.push(line);
	}
	return res;
}
stats.cache = function(name, value){
	var self = stats;
	if (value === undefined) {value=undefined}
	if (extend.isDefined(value)) {
		__module__.CACHE[name] = value;
		return value;
	} else {
		return __module__.CACHE[name];
	}
}
stats.log = function(value, message){
	var self = stats;
	if (message === undefined) {message="stats.log:"}
	console.log((("[ ] " + message) + value));
	return value;
}
/**
  * Parses the operation in `stats` domain-specific operation language
  * and returns the operation.
  * 
  * The syntax is :
  * 
  * >	NAME:ARGUMENT,...
  * 
  * for example:
  * 
  * >	get:name -> {_|return get(_, "name")}
  * 
*/
stats.parseOperation = function(operation, asFunction){
	var self = stats;
	if (asFunction === undefined) {asFunction=true}
	var words = operation.split(":");
	var operation = words[0];
	var args = extend.slice(words,1,undefined);
	!(stats[operation]) && extend.assert(false, "stats.parseOperation:", ("Unknown stats operation: " + operation), "(failed `stats[operation]`)");
	var f = stats[operation];
	if (asFunction) {
		return function(v) {
			return f.apply(f, [v].concat(args));
		};
	} else {
		words[0] = f;
		return words;
	}
}
/**
  * A wrapper around `pipe` that parses the expression which is like
  * 
  * >    operation:arg1,arg2,arg3|operation...
  * 
  * 
*/
stats.process = function(value, expression){
	var self = stats;
	var pipeline = [];
	// Iterates over `expression.split("|")`. This works on array,objects and null/undefined
	var __an=expression.split("|");
	var __bn=__an instanceof Array ? __an : Object.getOwnPropertyNames(__an||{});
	var __dn=__bn.length;
	for (var __cn=0;__cn<__dn;__cn++){
		var __zn=(__bn===__an)?__cn:__bn[__cn];
		var step=__an[__zn];
		// This is the body of the iteration with (value=step, key/index=__zn) in __an
		pipeline.push(__module__.parseOperation(step, false));
	}
	return __module__.pipe(pipeline, value);
}
/**
  * Allows to create a processing pipe, where the result of one function is passed
  * as the last argument of the previous. The `functors` list is a list of
  * functions or `stats` module function names as string.
  * Ex: S pipe [S min, [S exclude, -1], [S get, "low"]] (data[0] stock))
  * 
*/
stats.pipe = function(functors, value){
	var self = stats;
	if (value === undefined) {value=undefined}
	var p = function(v) {
		var i = 0;
		var m = i;
		var res = v;
		while ((i < functors.length)) {
			var operation = functors[i];
			var f = undefined;
			var args = undefined;
			if (extend.isList(operation)) {
				f = operation[0];
				args = extend.slice(operation,1,undefined);
			} else {
				f = operation;
				args = [];
			}
			if (extend.isString(f)) {
				f = stats[f];
			}
			args = [res].concat(args);
			res = f.apply(f, args);
			i = (i + 1);
		}
		return res;
	};
	if (extend.isDefined(value)) {
		return p(value);
	} else {
		return p;
	}
}
/**
  * Simple modulo, not remainder, % in javascript is remainder not mod !
  * 
*/
stats.mod = function(num, mod){
	var self = stats;
	var remain = (num % mod);
	if (remain >= 0) {
		return remain;
	} else {
		return Math.floor((remain + mod));
	}
}
stats.init = function(){
	var self = stats;
}
if (typeof(stats.init)!="undefined") {stats.init();}

// START:VANILLA_POSTAMBLE
return stats;})(stats);
// END:VANILLA_POSTAMBLE
