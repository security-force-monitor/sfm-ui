// 8< ---[widgets.js]---
// START:VANILLA_PREAMBLE
var widgets=typeof(extend)!='undefined' ? extend.module('widgets') : (typeof(widgets)!='undefined' ? widgets : {});
(function(widgets){
var __module__=widgets;
// END:VANILLA_PREAMBLE

widgets.__VERSION__='3.3.4';
widgets.LICENSE = "http://ffctn.com/doc/licenses/bsd";
widgets.$ = (((typeof(jQuery) != "undefined") && jQuery) || extend.modules.select);
widgets.LOCALE = "en";
widgets.FALLBACK_LOCALE = "en";
widgets.TRANSLATIONS = {"FFunction's widgets library":{"fr":"Librairie de composants de FFunction"}};
widgets.CACHE = {};
widgets.HANDLERS = {};
widgets.COMPLETIONS = {};
widgets.NOTHING = {"NOTHING":true};
widgets.DEFAULT = {"DEFAULT":true};
widgets.EXTRACTORS = {};
widgets.FORMATTERS = {"access":function(_, e) {
	var property = e.getAttribute("data-access").split(":");
	var f = property[1];
	property = property[0];
	var v = _;
	if (_ && property) {
		_ = _[property];
	}
	if (f) {
		return widgets.FORMATTERS[f](_, e);
	} else {
		return _;
	}
}, "count":function(_) {
	if (extend.isNumber(_)) {
		return _;
	}
	else {
		return extend.len(_);
	}
}, "dataurl":function(_) {
	return ("data:image/jpeg;base64," + _);
}, "default":function(_, e) {
	return ((e && e.getAttribute("data-default")) || "N/A");
}, "empty":function(_, e) {
	__module__.$(e).toggleClass("empty", (extend.len(_) == 0));
	return __module__.NOTHING;
}, "href":function(_, e) {
	if (_) {
		__module__.$(e).attr("href", _);
	}
	return __module__.NOTHING;
}, "index":function(_) {
	return (_ + 1);
}, "isodate":function(_) {
	return extend.sprintf("%04d-%02d-%02d", _[0], (_[1] || 1), (_[2] || 1));
}, "i18n":function(_) {
	if (extend.isString(_)) {
		return _;
	} else {
		return (_[__module__.LOCALE] || _[__module__.FALLBACK_LOCALE]);
	}
}, "list":function(_, e) {
	e = __module__.$(e);
	if (extend.isMap(_)) {
		_ = extend.values(_);
	}
	if ((!_) || (extend.len(_) == 0)) {
		e.addClass("empty");
		return __module__.T((e.data("default") || ""));
	} else if (extend.isList(_)) {
		e.removeClass("empty");
		return _.join(", ");
	} else {
		e.removeClass("empty");
		return _;
	}
}, "cslist":function(_) {
	if (!_) {
		return "";
	} else if (extend.isString(_)) {
		return _;
	} else if (extend.isMap(_)) {
		return extend.values(_).join(",");
	} else if (extend.isList(_)) {
		return _.join(",");
	} else {
		return "";
	}
}, "na":function(_) {
	return (_ || "N/A");
}, "nothing":function(_) {
	return __module__.NOTHING;
}, "shorten":function(_) {
	if (extend.len(_) < 100) {
		return _;
	} else {
		return (extend.slice(_,0,100) + "...");
	}
}, "summary":function(v) {
	v = (v || "");
	var s = extend.slice(v.split(" "),0,120).join(" ");
	if (extend.len(s) >= (extend.len(v) - 3)) {
		return v;
	} else {
		return (s + "[...]");
	}
}, "T":function(_) {
	return __module__.FORMATTERS.i18n(__module__.TRANSLATIONS[_]);
}, "url":function(v, e) {
	e = __module__.$(e);
	v = extend.sprintf((e.attr("data-url") || "%s"), v);
	e.attr("href", v);
	return v;
}};
/**
  * A function that can be used to translate messages to the given locale.
  * 
*/
widgets.T = function(message, locale){
	var self = widgets;
	if (locale === undefined) {locale=__module__.LOCALE}
	var translation = __module__.TRANSLATIONS[message];
	if (extend.isDefined(translation)) {
		translation = (translation[locale] || translation[locale.toUpperCase()]);
		if (extend.isDefined(translation)) {
			return translation;
		} else {
			extend.warning((((("No translation in locale '" + locale) + "' found for message: '") + message) + "'"));
			return message;
		}
	} else {
		extend.warning((("No translation found for message: '" + message) + "'"));
		return message;
	}
}
widgets.mergeTranslations = function(translations){
	var self = widgets;
	// Iterates over `translations`. This works on array,objects and null/undefined
	var __i=translations;
	var __j=__i instanceof Array ? __i : Object.getOwnPropertyNames(__i||{});
	var __l=__j.length;
	for (var __k=0;__k<__l;__k++){
		var k=(__j===__i)?__k:__j[__k];
		var v=__i[k];
		// This is the body of the iteration with (value=v, key/index=k) in __i
		__module__.TRANSLATIONS[k] = v;
	}
}
widgets.translate = function(ui, locale){
	var self = widgets;
	if (locale === undefined) {locale=__module__.LOCALE}
	// Iterates over `__module__.$(ui).find(".T")`. This works on array,objects and null/undefined
	var __o=__module__.$(ui).find(".T");
	var __n=__o instanceof Array ? __o : Object.getOwnPropertyNames(__o||{});
	var __q=__n.length;
	for (var __p=0;__p<__q;__p++){
		var __m=(__n===__o)?__p:__n[__p];
		var _=__o[__m];
		// This is the body of the iteration with (value=_, key/index=__m) in __o
		_ = __module__.$(_);
		_.text(__module__.T(_.text()));
	}
}
widgets.mergeFormats = function(formats){
	var self = widgets;
	extend.merge(__module__.FORMATTERS, formats, true);
	return __module__.FORMATTERS;
}
widgets.format = function(value, formatter, field){
	var self = widgets;
	if (field === undefined) {field=undefined}
	if (extend.isFunction(formatter)) {
		return formatter(value, field);
	} else if (__module__.FORMATTERS[formatter]) {
		return __module__.FORMATTERS[formatter](value, field);
	} else {
		return value;
	}
}
widgets.mergeExtractors = function(extractors){
	var self = widgets;
	extend.merge(__module__.EXTRACTORS, extractors, true);
	return __module__.EXTRACTORS;
}
widgets.extract = function(value, extractor, field){
	var self = widgets;
	if (field === undefined) {field=undefined}
	if (extend.isFunction(extractor)) {
		return extractor(value, field);
	} else if (__module__.FORMATTERS[extractor]) {
		return __module__.FORMATTERS[extractor](value, field);
	} else {
		return value;
	}
}
/**
  * Tells if there is a widget associated with the given selector
  * 
*/
widgets.has = function(selector){
	var self = widgets;
	return __module__.Widget.Has(selector);
}
/**
  * Returns the widget associated with the given selector
  * 
*/
widgets.get = function(selector){
	var self = widgets;
	return __module__.Widget.Get(selector);
}
/**
  * Ensures that the widget exists
  * 
*/
widgets.ensure = function(selector, widgetClass){
	var self = widgets;
	if (widgetClass === undefined) {widgetClass=undefined}
	return __module__.Widget.Ensure(selector, widgetClass);
}
/**
  * Ensures the given selection/element is an element
  * 
*/
widgets.asNode = function(node, index){
	var self = widgets;
	if (index === undefined) {index=0}
	if (node && node.jquery) {
		node = node[index];
	}
	if (node && node.isSelection) {
		node = node[index];
	}
	return node;
}
/**
  * Ensures the given selection/element is an element
  * 
*/
widgets.asElement = function(element, index){
	var self = widgets;
	if (index === undefined) {index=0}
	if (element && element.jquery) {
		element = element[index];
	}
	if (element && element.isSelection) {
		element = element[index];
	}
	if (element && (element.nodeType == Node.TEXT_NODE)) {
		element = element.parentNode;
	}
	return element;
}
widgets.asElements = function(element, unwrap){
	var self = widgets;
	if (unwrap === undefined) {unwrap=false}
	var res = null;
	if (element && (element.jquery || element.isSelection)) {
		res = extend.map(element, function(_) {
			return _;
		});
	} else if (extend.isList(element)) {
		res = element;
	} else if (element) {
		if (unwrap) {
			return element;
		} else {
			return element;
		}
	} else {
		return null;
	}
	if (unwrap && (res.length == 1)) {
		return res[0];
	} else {
		return res;
	}
}
/**
  * Ensures that the given element is a selection
  * 
*/
widgets.asSelection = function(element){
	var self = widgets;
	return __module__.$(element);
}
/**
  * Tells if the given value is an element
  * 
*/
widgets.isElement = function(element){
	var self = widgets;
	if (!element) {
		return false;
	} else if (((element.nodeType == Node.ELEMENT_NODE) || element.jquery) || element.isSelection) {
		return true;
	} else {
		return false;
	}
}
/**
  * Tells if the given value is a node
  * 
*/
widgets.isNode = function(element){
	var self = widgets;
	if (!element) {
		return false;
	} else if ((element.nodeType || element.jquery) || element.isSelection) {
		return true;
	} else {
		return false;
	}
}
/**
  * Tells if the given value is iterable
  * 
*/
widgets.isIterable = function(element){
	var self = widgets;
	if (!element) {
		return false;
	} else if (((element.jquery || element.isSelection) || extend.isList(element)) || extend.isMap(element)) {
		return true;
	} else {
		return false;
	}
}
/**
  * Tells if the given value is iterable
  * 
*/
widgets.isSelection = function(value){
	var self = widgets;
	return (value && (value.jquery || value.isSelection));
}
/**
  * Binds the given `event` (either a string or a map of string -> callback)
  * to the given context.
  * 
*/
widgets.bindEvent = function(context, event, callback, capture){
	var self = widgets;
	if (callback === undefined) {callback=undefined}
	if (capture === undefined) {capture=false}
	if (!context) {
		return false;
	}
	if (__module__.isSelection(context)) {
		// Iterates over `context`. This works on array,objects and null/undefined
		var __s=context;
		var __t=__s instanceof Array ? __s : Object.getOwnPropertyNames(__s||{});
		var __v=__t.length;
		for (var __u=0;__u<__v;__u++){
			var __r=(__t===__s)?__u:__t[__u];
			var _=__s[__r];
			// This is the body of the iteration with (value=_, key/index=__r) in __s
			__module__.bindEvent(_, event, callback);
		}
		return true;
	} else {
		if (extend.isString(event)) {
			if (__module__.HANDLERS[event]) {
				__module__.HANDLERS[event].bind(context, callback, capture);
			} else if (__module__.Control.HasEvent(context, event)) {
				__module__.Control.BindEvent(context, event, callback);
			} else if (__module__.Widget.HasEvent(context, event)) {
				__module__.Widget.BindEvent(context, event, callback);
			} else {
				__module__.$(context).bind(event, callback);
			}
			return true;
		} else {
			// Iterates over `event`. This works on array,objects and null/undefined
			var __w=event;
			var __x=__w instanceof Array ? __w : Object.getOwnPropertyNames(__w||{});
			var __z=__x.length;
			for (var __y=0;__y<__z;__y++){
				var name=(__x===__w)?__y:__x[__y];
				var __a=__w[name];
				// This is the body of the iteration with (value=__a, key/index=name) in __w
				(function(callback){__module__.bindEvent(context, name, callback);}(__a))
			}
			return true;
		}
	}
	return true;
}
/**
  * Triggers the given `event` with the given value and source
  * 
*/
widgets.triggerEvent = function(context, event, value, source){
	var self = widgets;
	if (__module__.isSelection(context) || extend.isList(context)) {
		// Iterates over `context`. This works on array,objects and null/undefined
		var __c=context;
		var __d=__c instanceof Array ? __c : Object.getOwnPropertyNames(__c||{});
		var __f=__d.length;
		for (var __e=0;__e<__f;__e++){
			var __b=(__d===__c)?__e:__d[__e];
			var _=__c[__b];
			// This is the body of the iteration with (value=_, key/index=__b) in __c
			__module__.triggerEvent(_, event, value, source);
		}
		return true;
	} else {
		if (extend.isString(event)) {
			if (__module__.HANDLERS[event]) {
				__module__.HANDLERS[event].trigger(context, event, value, source);
			} else if (__module__.Control.HasEvent(context, event)) {
				__module__.Control.TriggerEvent(context, event, value, source);
			} else if (__module__.Widget.HasEvent(context, event)) {
				__module__.Widget.TriggerEvent(context, event, callback);
			} else {
				__module__.$(context).trigger(event);
			}
		}
	}
}
/**
  * Utility function to extract the selector from the given selection, if any.
  * 
*/
widgets._extractSelector = function(selector){
	var self = widgets;
	if (extend.isString(selector)) {
		return (selector || "");
	} else if (__module__.isSelection(selector)) {
		return (selector.selector || "<no selector>");
	} else {
		return (selector || "<no selector>");
	}
}
/**
  * Iterates on the given data, calling onCreate if the data was not there before,
  * onUpdate if the data was already there or onRemove if the data was removed.
  * `onCreate` takes (`context`, `data element`, `key`),
  * `onUpdate` takes (`context`, `data element`, `key`, `interface element`)
  * `onRemove` takes (`context`, `key`, `interface element`)
  * where `onCreate` returns the `interface element`.
  * 
  * This process is similar to D3's select/enter/update/exit process.
  * 
*/
widgets.visualize = function(context, data, onCreate, onUpdate, onRemove){
	var self = widgets;
	if (onUpdate === undefined) {onUpdate=undefined}
	if (onRemove === undefined) {onRemove=undefined}
	if (__module__.isSelection(context)) {
		context = context[0];
	}
	if (!context) {
		return extend.error("widgets.visualize: No or empty context given");
	}
	if (__module__.isNode(context)) {
		if (!extend.isDefined(context._widgets_visualize)) {
			context._widgets_visualize = {"element":context};
		}
		context = context._widgets_visualize;
	} else if (!extend.isMap(context)) {
		return extend.error("widgets.visualize: String, node or map expected for context, got", context);
	}
	var rendered = {};
	onUpdate = (onUpdate || onCreate);
	var viz_cache = undefined;
	if (!extend.isDefined(context.all)) {
		context.all = {};
		context.keys = [];
	}
	viz_cache = context.all;
	if (extend.isNumber(data)) {
		data = extend.range(data);
	}
	var result = [];
	var count = 0;
	var keys = [];
	context.data = data;
	context.keys = keys;
	context.count = extend.len(data);
	// Iterates over `data`. This works on array,objects and null/undefined
	var __g=data;
	var __h=__g instanceof Array ? __g : Object.getOwnPropertyNames(__g||{});
	var __jj=__h.length;
	for (var __ij=0;__ij<__jj;__ij++){
		var key=(__h===__g)?__ij:__h[__ij];
		var sub_data=__g[key];
		// This is the body of the iteration with (value=sub_data, key/index=key) in __g
		var nui = viz_cache[key];;
		if (!extend.isDefined(nui)) {
			nui = onCreate(context, sub_data, key, undefined, count);
			!(extend.isDefined(nui)) && extend.assert(false, "widgets.visualize:", "widgets.visualize: create callback returned empty value", "(failed `extend.isDefined(nui)`)");
			viz_cache[key] = nui;
			rendered[key] = 0;
		} else {
			onUpdate(context, sub_data, key, nui, count);
			rendered[key] = 1;
		};
		result.push(nui);
		keys.push(key);
		count = (count + 1);
	}
	context.count = count;
	// Iterates over `viz_cache`. This works on array,objects and null/undefined
	var __kj=viz_cache;
	var __lj=__kj instanceof Array ? __kj : Object.getOwnPropertyNames(__kj||{});
	var __oj=__lj.length;
	for (var __mj=0;__mj<__oj;__mj++){
		var key=(__lj===__kj)?__mj:__lj[__mj];
		var nui=__kj[key];
		// This is the body of the iteration with (value=nui, key/index=key) in __kj
		if (!extend.isDefined(rendered[key])) {
			if (onRemove) {
				viz_cache[key] = onRemove(context, key, nui);
			} else if (nui) {
				if (nui.remove) {
					nui.remove();
				} else if (nui.ui) {
					__module__.$(nui.ui).remove();
				} else {
					extend.error((self.getClass().getName() + ".visualize: Cannot remove ui"), nui);
				}
				viz_cache[key] = undefined;
			}
			if (!extend.isDefined(viz_cache[key])) {
				delete viz_cache[key];
				
			}
		};
	}
	return count;
}
/**
  * Elements are (generally) non-interactive data elements that are used throughout
  * the interface. Elements have fields where information can be gathered (input)
  * and/or displayed to the user (outputs).
  * 
*/
widgets.Element = extend.Class({
	name  :'widgets.Element',
	parent: undefined,
	shared: {
		COUNT: 0,
		STATES: {},
		SELECTOR: undefined
	},
	properties: {
		inputs:undefined,
		outputs:undefined,
		states:undefined,
		tweens:undefined,
		uis:undefined,
		id:undefined,
		data:undefined,
		ui:undefined
	},
	/**
	  * Creates a new 'Element' from the given 'selector'
	  * 
	*/
	initialize: function( selector ){
		var self = this;
		if (selector === undefined) {selector=null}
		// Default initialization of property `inputs`
		if (typeof(self.inputs)=='undefined') {self.inputs = {};};
		// Default initialization of property `outputs`
		if (typeof(self.outputs)=='undefined') {self.outputs = {};};
		// Default initialization of property `states`
		if (typeof(self.states)=='undefined') {self.states = {};};
		// Default initialization of property `tweens`
		if (typeof(self.tweens)=='undefined') {self.tweens = {};};
		// Default initialization of property `uis`
		if (typeof(self.uis)=='undefined') {self.uis = {};};
		// Default initialization of property `id`
		if (typeof(self.id)=='undefined') {self.id = undefined;};
		// Default initialization of property `data`
		if (typeof(self.data)=='undefined') {self.data = null;};
		selector = ((selector || self.getClass().SELECTOR) || self.getClass().SelectorName());
		self.ui = __module__.$(selector);
		if ((self.ui === undefined) || (self.ui.length == 0)) {
			return extend.error(self.getClass().getName(), "Cannot instanciate widget: selector empty ", __module__._extractSelector(selector));
		}
		if (__module__.Widget.Has(selector)) {
			return extend.error(self.getClass().getName(), "Cannot instanciate widget: selector already has widget ", __module__._extractSelector(selector));
		}
		if (!self.ui[0]._widget) {
			self.ui[0]._widget = self;
		}
		self.id = self.getClass().COUNT;
		self.getClass().COUNT = (self.getClass().COUNT + 1);
		self.bindUI();
	},
	methods: {
		remove: function(removeUI) {
			var self = this;
			if (removeUI === undefined) {removeUI=true}
			self.ui[0]._widget = undefined;
			if (removeUI) {
				self.ui.remove();
			}
			return self;
		},
		
		resetStates: function() {
			var self = this;
			// Iterates over `self.getClass().STATES`. This works on array,objects and null/undefined
			var __nj=self.getClass().STATES;
			var __pj=__nj instanceof Array ? __nj : Object.getOwnPropertyNames(__nj||{});
			var __rj=__pj.length;
			for (var __qj=0;__qj<__rj;__qj++){
				var s=(__pj===__nj)?__qj:__pj[__qj];
				var v=__nj[s];
				// This is the body of the iteration with (value=v, key/index=s) in __nj
				self.setState(s, v);
			}
		},
		
		/**
		  * Resets the fields to their default value
		  * 
		*/
		reset: function() {
			var self = this;
			// Iterates over `self.inputs`. This works on array,objects and null/undefined
			var __tj=self.inputs;
			var __uj=__tj instanceof Array ? __tj : Object.getOwnPropertyNames(__tj||{});
			var __wj=__uj.length;
			for (var __vj=0;__vj<__wj;__vj++){
				var __sj=(__uj===__tj)?__vj:__uj[__vj];
				var _=__tj[__sj];
				// This is the body of the iteration with (value=_, key/index=__sj) in __tj
				__module__.Element.ResetFieldValue(_);
			}
			// Iterates over `self.outputs`. This works on array,objects and null/undefined
			var __yj=self.outputs;
			var __zj=__yj instanceof Array ? __yj : Object.getOwnPropertyNames(__yj||{});
			var __bj=__zj.length;
			for (var __aj=0;__aj<__bj;__aj++){
				var __xj=(__zj===__yj)?__aj:__zj[__aj];
				var _=__yj[__xj];
				// This is the body of the iteration with (value=_, key/index=__xj) in __yj
				__module__.Element.ResetFieldValue(_);
			}
		},
		
		isSelectorInWidget: function(selector, anyWidget) {
			var self = this;
			if (anyWidget === undefined) {anyWidget=false}
			var source = __module__.$(selector);
			var parent = source.parent();
			while ((parent.length > 0)) {
				var is_this_widget = (parent[0] == self.ui[0]);
				if (is_this_widget) {
					return true;
				} else if (parent.hasClass("widget")) {
					return (anyWidget && true);
				} else {
					parent = parent.parent();
				}
			}
			return false;
		},
		
		isSelectorInTemplate: function(selector) {
			var self = this;
			return (__module__.$(selector).parents(".template:first").length > 0);
		},
		
		setData: function(data) {
			var self = this;
			self.data = data;
			return self;
		},
		
		getData: function() {
			var self = this;
			return self.data;
		},
		
		/**
		  * A method that can be redefined to do specific handling when the data is
		  * update. The given update should only be the new values (dictionary)
		  * 
		*/
		updateData: function(dataUpdate) {
			var self = this;
			if (!self.data) {
				self.data = {};
			}
			!((!((extend.isList(self.data) && (!extend.isString(self.data))) && (!extend.isNumber(self.data))))) && extend.assert(false, "widgets.Element.updateData:", ("updateData only works for maps, got " + self.data), "(failed `(!((extend.isList(self.data) && (!extend.isString(self.data))) && (!extend.isNumber(self.data))))`)");
			// Iterates over `dataUpdate`. This works on array,objects and null/undefined
			var __cj=dataUpdate;
			var __dj=__cj instanceof Array ? __cj : Object.getOwnPropertyNames(__cj||{});
			var __fj=__dj.length;
			for (var __ej=0;__ej<__fj;__ej++){
				var k=(__dj===__cj)?__ej:__dj[__ej];
				var v=__cj[k];
				// This is the body of the iteration with (value=v, key/index=k) in __cj
				self.data[k] = v;
			}
			return self.data;
		},
		
		/**
		  * A generic method that invokes all the events/ui bindings necessary to
		  * operate the widget.
		  * 
		*/
		bindUI: function() {
			var self = this;
			self.bindFields();
			self.bindStates();
			__module__.asElement(self.ui)._widget = self;
		},
		
		_bindField: function(fui, collection) {
			var self = this;
			var _ = __module__.$(fui);
			if (!self.isSelectorInTemplate(_)) {
				var name = (_.attr("data-field") || _.attr("name"));
				if (name) {
					if (!collection[name]) {
						collection[name] = [];
					}
					// Iterates over `_`. This works on array,objects and null/undefined
					var __hj=_;
					var __ik=__hj instanceof Array ? __hj : Object.getOwnPropertyNames(__hj||{});
					var __kk=__ik.length;
					for (var __jk=0;__jk<__kk;__jk++){
						var __gj=(__ik===__hj)?__jk:__ik[__jk];
						var sui=__hj[__gj];
						// This is the body of the iteration with (value=sui, key/index=__gj) in __hj
						__module__.bindField(sui);
						__module__.bindSelector(sui);
						__module__.bindList(sui);
						if (self.isSelectorInWidget(sui) || __module__.$(sui).hasClass("widget")) {
							collection[name].push(sui);
						};
					}
				} else {
					extend.warning((self.getClass().getName() + ": field has no name"), __module__.asElement(_));
				}
			}
			return _;
		},
		
		/**
		  * Binds the given fields to the 'inputs' and 'outputs' properties.
		  * 
		*/
		bindFields: function(ui, inputs, outputs) {
			var self = this;
			if (ui === undefined) {ui=self.ui}
			if (inputs === undefined) {inputs=self.inputs}
			if (outputs === undefined) {outputs=self.outputs}
			// Iterates over `ui.find(".in")`. This works on array,objects and null/undefined
			var __lk=ui.find(".in");
			var __mk=__lk instanceof Array ? __lk : Object.getOwnPropertyNames(__lk||{});
			var __nk=__mk.length;
			for (var __ok=0;__ok<__nk;__ok++){
				var i=(__mk===__lk)?__ok:__mk[__ok];
				var _=__lk[i];
				// This is the body of the iteration with (value=_, key/index=i) in __lk
				self._bindField(_, inputs);
			}
			// Iterates over `ui.find(".out")`. This works on array,objects and null/undefined
			var __pk=ui.find(".out");
			var __qk=__pk instanceof Array ? __pk : Object.getOwnPropertyNames(__pk||{});
			var __sk=__qk.length;
			for (var __rk=0;__rk<__sk;__rk++){
				var i=(__qk===__pk)?__rk:__qk[__rk];
				var _=__pk[i];
				// This is the body of the iteration with (value=_, key/index=i) in __pk
				self._bindField(_, outputs);
			}
			// Iterates over `inputs`. This works on array,objects and null/undefined
			var __tk=inputs;
			var __uk=__tk instanceof Array ? __tk : Object.getOwnPropertyNames(__tk||{});
			var __wk=__uk.length;
			for (var __vk=0;__vk<__wk;__vk++){
				var k=(__uk===__tk)?__vk:__uk[__vk];
				var v=__tk[k];
				// This is the body of the iteration with (value=v, key/index=k) in __tk
				inputs[k] = __module__.$(v);
			}
			// Iterates over `outputs`. This works on array,objects and null/undefined
			var __xk=outputs;
			var __yk=__xk instanceof Array ? __xk : Object.getOwnPropertyNames(__xk||{});
			var __ak=__yk.length;
			for (var __zk=0;__zk<__ak;__zk++){
				var k=(__yk===__xk)?__zk:__yk[__zk];
				var v=__xk[k];
				// This is the body of the iteration with (value=v, key/index=k) in __xk
				outputs[k] = __module__.$(v);
			}
			return {"inputs":inputs, "outputs":outputs};
		},
		
		bindStates: function(states, ui) {
			var self = this;
			if (states === undefined) {states=self.getClass().STATES}
			if (ui === undefined) {ui=self.ui}
			// Iterates over `ui.find(".when")`. This works on array,objects and null/undefined
			var __ck=ui.find(".when");
			var __dk=__ck instanceof Array ? __ck : Object.getOwnPropertyNames(__ck||{});
			var __fk=__dk.length;
			for (var __ek=0;__ek<__fk;__ek++){
				var __bk=(__dk===__ck)?__ek:__dk[__ek];
				var ui_when=__ck[__bk];
				// This is the body of the iteration with (value=ui_when, key/index=__bk) in __ck
				ui_when = __module__.$(ui_when);
				if (self.isSelectorInWidget(ui_when) && (!self.isSelectorInTemplate(ui_when))) {
					var state = ui_when.attr("data-state");
					var state_value = state.split(":");
					if (state_value.length == 1) {
						state_value.push("true");
					}
					var state = state_value[0].trim();
					var values = state_value[1].trim();
					// Iterates over `values.split("|")`. This works on array,objects and null/undefined
					var __hk=values.split("|");
					var __il=__hk instanceof Array ? __hk : Object.getOwnPropertyNames(__hk||{});
					var __kl=__il.length;
					for (var __jl=0;__jl<__kl;__jl++){
						var __gk=(__il===__hk)?__jl:__il[__jl];
						var value=__hk[__gk];
						// This is the body of the iteration with (value=value, key/index=__gk) in __hk
						if (value[0] == "!") {
							value = extend.slice(value,1,undefined);
						};
						if (extend.isDefined(states[state])) {
							if (value == "true") {
								!((extend.find(states[state], true) != -1)) && extend.assert(false, "widgets.Element.bindStates:", ((("No state value defined: " + state) + ".") + value), "(failed `(extend.find(states[state], true) != -1)`)");
							} else if (value == "false") {
								!((extend.find(states[state], false) != -1)) && extend.assert(false, "widgets.Element.bindStates:", ((("No state value defined: " + state) + ".") + value), "(failed `(extend.find(states[state], false) != -1)`)");
							} else {
								!((extend.find(states[state], value) != -1)) && extend.assert(false, "widgets.Element.bindStates:", ((("No state value defined: " + state) + ".") + value), "(failed `(extend.find(states[state], value) != -1)`)");
							}
							if (!self.states[state]) {
								self.states[state] = {};
							}
							if (!self.states[state][value]) {
								self.states[state][value] = [];
							}
							self.states[state][value].push(ui_when);
						} else {
							extend.warning((((self.getClass().getName() + ": no state ") + state) + ", but referenced by"), __module__.asElements(ui_when, true));
						};
					}
				};
			}
			// Iterates over `self.getClass().STATES`. This works on array,objects and null/undefined
			var __ll=self.getClass().STATES;
			var __ml=__ll instanceof Array ? __ll : Object.getOwnPropertyNames(__ll||{});
			var __nl=__ml.length;
			for (var __ol=0;__ol<__nl;__ol++){
				var state=(__ml===__ll)?__ol:__ml[__ol];
				var values=__ll[state];
				// This is the body of the iteration with (value=values, key/index=state) in __ll
				self.setState(state, values[0]);
			}
		},
		
		_getSingleField: function(fieldName, collections) {
			var self = this;
			if (collections === undefined) {collections=null}
			var res = undefined;
			// Iterates over `((collections && collections) || [self.inputs, self.outputs])`. This works on array,objects and null/undefined
			var __ql=((collections && collections) || [self.inputs, self.outputs]);
			var __rl=__ql instanceof Array ? __ql : Object.getOwnPropertyNames(__ql||{});
			var __tl=__rl.length;
			for (var __sl=0;__sl<__tl;__sl++){
				var __pl=(__rl===__ql)?__sl:__rl[__sl];
				var name_fields=__ql[__pl];
				// This is the body of the iteration with (value=name_fields, key/index=__pl) in __ql
				// Iterates over `name_fields[fieldName]`. This works on array,objects and null/undefined
				var __vl=name_fields[fieldName];
				var __wl=__vl instanceof Array ? __vl : Object.getOwnPropertyNames(__vl||{});
				var __yl=__wl.length;
				for (var __xl=0;__xl<__yl;__xl++){
					var __ul=(__wl===__vl)?__xl:__wl[__xl];
					var field=__vl[__ul];
					// This is the body of the iteration with (value=field, key/index=__ul) in __vl
					if (!extend.isDefined(res)) {
						res = self.getFieldValue(field);
						return res;
					};
				};
			}
			return res;
		},
		
		_getMultipleFieldValues: function(fieldNames, collections) {
			var self = this;
			if (collections === undefined) {collections=null}
			if (extend.isList(fieldNames)) {
				return extend.map(fieldNames, function(_) {
					return self._getSingleField(_, collections);
				});
			} else if (extend.isMap(fieldNames)) {
				return extend.map(fieldNames, function(v, _) {
					return self._getSingleField(_, collections);
				});
			}
		},
		
		/**
		  * Returns the value for the field with the given name in the given
		  * collection of fields, by default `[input, output]`
		  * 
		*/
		get: function(fieldName, collections) {
			var self = this;
			if (collections === undefined) {collections=null}
			var res = undefined;
			!((collections === null)) && extend.assert(false, "widgets.Element.get:", "Not supported", "(failed `(collections === null)`)");
			if (extend.isDefined(fieldName)) {
				if (extend.isString(fieldName)) {
					return self._getSingleField(fieldName, collections);
				} else {
					return self._getMultipleFieldValues(fieldName, collections);
				}
			} else {
				res = {};
				// Iterates over `((collections && collections) || [self.inputs, self.outputs])`. This works on array,objects and null/undefined
				var __al=((collections && collections) || [self.inputs, self.outputs]);
				var __bl=__al instanceof Array ? __al : Object.getOwnPropertyNames(__al||{});
				var __dl=__bl.length;
				for (var __cl=0;__cl<__dl;__cl++){
					var __zl=(__bl===__al)?__cl:__bl[__cl];
					var name_fields=__al[__zl];
					// This is the body of the iteration with (value=name_fields, key/index=__zl) in __al
					// Iterates over `name_fields`. This works on array,objects and null/undefined
					var __el=name_fields;
					var __fl=__el instanceof Array ? __el : Object.getOwnPropertyNames(__el||{});
					var __hl=__fl.length;
					for (var __gl=0;__gl<__hl;__gl++){
						var name=(__fl===__el)?__gl:__fl[__gl];
						var field=__el[name];
						// This is the body of the iteration with (value=field, key/index=name) in __el
						if (!extend.isDefined(res[name])) {
							res[name] = self.getFieldValue(field);
						};
					};
				}
			}
			return res;
		},
		
		/**
		  * Sets the value for the field with the given name
		  * 
		*/
		set: function(fieldName, value, eventSource) {
			var self = this;
			if (eventSource === undefined) {eventSource=undefined}
			if (extend.isMap(fieldName) && (!extend.isDefined(value))) {
				// Iterates over `fieldName`. This works on array,objects and null/undefined
				var __im=fieldName;
				var __jm=__im instanceof Array ? __im : Object.getOwnPropertyNames(__im||{});
				var __lm=__jm.length;
				for (var __km=0;__km<__lm;__km++){
					var k=(__jm===__im)?__km:__jm[__km];
					var v=__im[k];
					// This is the body of the iteration with (value=v, key/index=k) in __im
					self.set(k, v);
				}
			} else {
				// Iterates over `[self.outputs[fieldName], self.inputs[fieldName]]`. This works on array,objects and null/undefined
				var __om=[self.outputs[fieldName], self.inputs[fieldName]];
				var __nm=__om instanceof Array ? __om : Object.getOwnPropertyNames(__om||{});
				var __qm=__nm.length;
				for (var __pm=0;__pm<__qm;__pm++){
					var __mm=(__nm===__om)?__pm:__nm[__pm];
					var fields=__om[__mm];
					// This is the body of the iteration with (value=fields, key/index=__mm) in __om
					var previous = null;;
					// Iterates over `fields`. This works on array,objects and null/undefined
					var __rm=fields;
					var __sm=__rm instanceof Array ? __rm : Object.getOwnPropertyNames(__rm||{});
					var __um=__sm.length;
					for (var __tm=0;__tm<__um;__tm++){
						var i=(__sm===__rm)?__tm:__sm[__tm];
						var field=__rm[i];
						// This is the body of the iteration with (value=field, key/index=i) in __rm
						if (i == 0) {
							previous = self.getFieldValue(field);
						};
						res = self.setFieldValue(field, value);
					};
					if (eventSource && fields) {
						eventSource.trigger({"source":self, "previous":previous, "value":value});
					};
				}
			}
			return self;
		},
		
		/**
		  * Returns the value bound to the given 'field', coming from the
		  * 'inputs' or 'outputs' property.
		  * 
		*/
		getFieldValue: function(field) {
			var self = this;
			return self.getClass().getOperation('GetFieldValue')(field);
		},
		
		/**
		  * Sets the 'value' bound to the given 'field', coming from the
		  * 'inputs' or 'outputs' property.
		  * 
		*/
		setFieldValue: function(field, value) {
			var self = this;
			return __module__.Element.SetFieldValue(field, value);
		},
		
		/**
		  * Fill the given fields with the given values
		  * 
		*/
		fill: function(values) {
			var self = this;
			// Iterates over `values`. This works on array,objects and null/undefined
			var __vm=values;
			var __wm=__vm instanceof Array ? __vm : Object.getOwnPropertyNames(__vm||{});
			var __ym=__wm.length;
			for (var __xm=0;__xm<__ym;__xm++){
				var k=(__wm===__vm)?__xm:__wm[__xm];
				var v=__vm[k];
				// This is the body of the iteration with (value=v, key/index=k) in __vm
				self.setFieldValue(self.inputs[k], v);
				self.setFieldValue(self.outputs[k], v);
			}
		},
		
		exportData: function(fields, ignoreDefault) {
			var self = this;
			if (fields === undefined) {fields=self.inputs}
			if (ignoreDefault === undefined) {ignoreDefault=true}
			var res = {};
			// Iterates over `fields`. This works on array,objects and null/undefined
			var __zm=fields;
			var __am=__zm instanceof Array ? __zm : Object.getOwnPropertyNames(__zm||{});
			var __cm=__am.length;
			for (var __bm=0;__bm<__cm;__bm++){
				var name=(__am===__zm)?__bm:__am[__bm];
				var input=__zm[name];
				// This is the body of the iteration with (value=input, key/index=name) in __zm
				res[name] = self.getFieldValue(input);
			}
			return res;
		},
		
		importData: function(data, fields) {
			var self = this;
			if (fields === undefined) {fields=self.inputs}
			// Iterates over `data`. This works on array,objects and null/undefined
			var __dm=data;
			var __em=__dm instanceof Array ? __dm : Object.getOwnPropertyNames(__dm||{});
			var __gm=__em.length;
			for (var __fm=0;__fm<__gm;__fm++){
				var name=(__em===__dm)?__fm:__em[__fm];
				var value=__dm[name];
				// This is the body of the iteration with (value=value, key/index=name) in __dm
				if (fields[name]) {
					self.setFieldValue(fields[name], value);
				};
			}
		},
		
		syncInputsWithOutputs: function() {
			var self = this;
			self.importData(self.exportData(self.outputs, false), self.inputs);
		},
		
		syncOutputsWithInputs: function() {
			var self = this;
			self.importData(self.exportData(self.inputs), self.outputs);
		},
		
		/**
		  * An alias that prevents forgetting the scope=ui when calling jQuery.
		  * 
		*/
		getView: function(selector, scope) {
			var self = this;
			if (scope === undefined) {scope=self.ui}
			return __module__.$(selector, self.ui);
		},
		
		setState: function(state, value) {
			var self = this;
			if (value === undefined) {value=true}
			if (extend.isMap(state)) {
				// Iterates over `state`. This works on array,objects and null/undefined
				var __hm=state;
				var __io=__hm instanceof Array ? __hm : Object.getOwnPropertyNames(__hm||{});
				var __ko=__io.length;
				for (var __jo=0;__jo<__ko;__jo++){
					var k=(__io===__hm)?__jo:__io[__jo];
					var v=__hm[k];
					// This is the body of the iteration with (value=v, key/index=k) in __hm
					self.setState(k, v);
				}
			} else {
				!(extend.isDefined(self.getClass().STATES[state])) && extend.assert(false, "widgets.Element.setState:", ((((("State is not defined: " + state) + ":") + value) + " in ") + self.getClass().getName()), "(failed `extend.isDefined(self.getClass().STATES[state])`)");
				value = ("" + value);
				if (!extend.isDefined(self.states[state])) {
					self.states[state] = {};
				}
				self.states[state].__value = value;
				var key = ("data-" + state);
				self.ui.attr(key, ("" + value));
				var state_uis = [];
				// Iterates over `self.states[state]`. This works on array,objects and null/undefined
				var __lo=self.states[state];
				var __mo=__lo instanceof Array ? __lo : Object.getOwnPropertyNames(__lo||{});
				var __no=__mo.length;
				for (var __oo=0;__oo<__no;__oo++){
					var local_value=(__mo===__lo)?__oo:__mo[__oo];
					var __po=__lo[local_value];
					// This is the body of the iteration with (value=__po, key/index=local_value) in __lo
					(function(uis){if (local_value != "__value") {
						// Iterates over `uis`. This works on array,objects and null/undefined
						var __ro=uis;
						var __so=__ro instanceof Array ? __ro : Object.getOwnPropertyNames(__ro||{});
						var __uo=__so.length;
						for (var __to=0;__to<__uo;__to++){
							var __qo=(__so===__ro)?__to:__so[__to];
							var _=__ro[__qo];
							// This is the body of the iteration with (value=_, key/index=__qo) in __ro
							__module__.$(_).addClass("hidden");
							state_uis.push({"value":local_value, "ui":_});
						}
					};}(__po))
				}
				// Iterates over `self.states[state]`. This works on array,objects and null/undefined
				var __vo=self.states[state];
				var __wo=__vo instanceof Array ? __vo : Object.getOwnPropertyNames(__vo||{});
				var __yo=__wo.length;
				for (var __xo=0;__xo<__yo;__xo++){
					var local_value=(__wo===__vo)?__xo:__wo[__xo];
					var __zo=__vo[local_value];
					// This is the body of the iteration with (value=__zo, key/index=local_value) in __vo
					(function(uis){if (local_value != "__value") {
						// Iterates over `uis`. This works on array,objects and null/undefined
						var __bo=uis;
						var __co=__bo instanceof Array ? __bo : Object.getOwnPropertyNames(__bo||{});
						var __eo=__co.length;
						for (var __do=0;__do<__eo;__do++){
							var __ao=(__co===__bo)?__do:__co[__do];
							var _=__bo[__ao];
							// This is the body of the iteration with (value=_, key/index=__ao) in __bo
							var negation = (_.attr("data-state").split(":")[1][0] == "!");;
							if (((!negation) && (local_value == value)) || (negation && (local_value != value))) {
								__module__.$(_).removeClass("hidden");
							};
						}
					};}(__zo))
				}
				return value;
			}
		},
		
		toggleState: function(state) {
			var self = this;
			var value = self.getState(state);
			var values = extend.map(self.getClass().STATES[state], function(_) {
				return ("" + _);
			});
			var next_i = ((extend.find(values, value) + 1) % values.length);
			var next = values[next_i];
			return self.setState(state, next);
		},
		
		hasState: function(state, value) {
			var self = this;
			if (value === undefined) {value="true"}
			if (value === true) {
				value = "true";
			}
			if (value === false) {
				value = "false";
			}
			return (self.getState(state) == value);
		},
		
		getState: function(state) {
			var self = this;
			return (self.states[state] && self.states[state].__value);
		},
		
		/**
		  * An alias to jQuery, which scopes by default to this widget UI.
		  * You should use this one instead of jQuery.
		  * 
		*/
		query: function(selector, scope) {
			var self = this;
			if (scope === undefined) {scope=self.ui}
			return __module__.$(selector, scope);
		},
		
		/**
		  * Creates a new node from the given template, removing
		  * 'template' and 'hidden' classes, adding the 'actual' class.
		  * 
		*/
		cloneTemplate: function(selector, parent) {
			var self = this;
			if (parent === undefined) {parent=null}
			var t = self.query(selector);
			if (!selector) {
				extend.error((self.getClass().getName() + ".cloneTemplate(): No selector given"));
				return t.clone();
			} else if (t.length == 0) {
				extend.error(((self.getClass().getName() + ".cloneTemplate(): Empty selector given: ") + __module__._extractSelector(selector)));
				return t.clone();
			} else if (t.length > 1) {
				extend.error(((self.getClass().getName() + ".cloneTemplate(): Template must only match one element: ") + __module__._extractSelector(selector)));
				return t.clone();
			} else {
				var r = t.clone().removeClass("template").removeClass("hidden").addClass("actual");
				if (parent) {
					__module__.$(parent).append(r);
				}
				return r;
			}
		},
		
		show: function() {
			var self = this;
			self.ui.removeClass("hidden");
		},
		
		hide: function() {
			var self = this;
			self.ui.addClass("hidden");
		}
	},
	operations:{
		ResetFieldValue: function( field ){
			var self = this;
			if ((!field) || (__module__.$(field).length == 0)) {
				return undefined;
			}
			// Iterates over `__module__.$(field)`. This works on array,objects and null/undefined
			var __go=__module__.$(field);
			var __ho=__go instanceof Array ? __go : Object.getOwnPropertyNames(__go||{});
			var __jn=__ho.length;
			for (var __in=0;__in<__jn;__in++){
				var __fo=(__ho===__go)?__in:__ho[__in];
				var node=__go[__fo];
				// This is the body of the iteration with (value=node, key/index=__fo) in __go
				node = __module__.$(node);
				var node_name = node[0].nodeName.toLowerCase();;
				var default_value = node.data("default");;
				self.SetFieldValue(node, default_value, false);
			}
		},
		GetFieldValue: function( field, useExtractor ){
			var self = this;
			if (useExtractor === undefined) {useExtractor=true}
			if (!field) {
				return undefined;
			}
			field = __module__.$(field);
			if (field.length == 0) {
				return undefined;
			}
			var i = 0;
			while ((i < field.length)) {
				var node_name = field[i].nodeName.toLowerCase();
				var cui = __module__.$(field[i]);
				var result = __module__.NOTHING;
				if (((node_name == "input") || (node_name == "textarea")) || (node_name == "select")) {
					if (!cui.hasClass("is-placeholder")) {
						if (cui.attr("type") == "checkbox") {
							result = cui.attr("checked");
						} else {
							var value = cui.data("value");
							if (value) {
								result = value;
							} else {
								result = cui.val();
							}
						}
					}
				} else if (__module__.Control.Has(cui)) {
					result = __module__.Control.Get(cui).getValue();
				} else if (node_name == "img") {
					result = cui.attr("src");
				} else if (node_name == "a") {
					result = cui.attr("href");
				} else if (__module__.Widget.Has(cui)) {
					var w = __module__.Widget.Get(cui);
					if (w.getValue) {
						result = w.getValue();
					} else {
						result = w.getData();
					}
				} else {
					result = (cui.data("value") || cui.attr("value"));
				}
				if (result != __module__.NOTHING) {
					var extractor = cui.data("extract");
					if (useExtractor) {
						result = __module__.extract(result, extractor, field);
					}
					return result;
				}
				i = (i + 1);
			}
			return null;
		},
		Get: function( selector ){
			var self = this;
			var ui = __module__.asElement(selector);
			if (ui && ui._widget) {
				return ui._widget;
			} else {
				return null;
			}
		},
		/**
		  * Binds a new instance of this widget to the given selector, if it does
		  * not already have an associated widget, and returns the widget in case
		  * of success, or None in case of failure.
		  * 
		*/
		Bind: function( selector ){
			var self = this;
			var the_class = self;
			if (!__module__.Widget.Has(selector)) {
				return new the_class(selector);
			} else {
				return null;
			}
		},
		/**
		  * Returns a JSON object with the fields and their respective values.
		  * 
		*/
		Serialize: function( selector ){
			var self = this;
			var d = {};
			extend.error("Not implemented");
			return d;
		},
		/**
		  * Binds new instances of this widget to all the matching selectors that
		  * don't already have an associated widget
		  * 
		*/
		BindAll: function(  ){
			var self = this;
			var the_class = self;
			var the_selector = (self.SELECTOR || self.SelectorName());
			var count = 0;
			// Iterates over `__module__.$(the_selector)`. This works on array,objects and null/undefined
			var __ln=__module__.$(the_selector);
			var __mn=__ln instanceof Array ? __ln : Object.getOwnPropertyNames(__ln||{});
			var __nn=__mn.length;
			for (var __on=0;__on<__nn;__on++){
				var __kn=(__mn===__ln)?__on:__mn[__on];
				var s=__ln[__kn];
				// This is the body of the iteration with (value=s, key/index=__kn) in __ln
				if (!__module__.Widget.Has(s)) {
					new the_class(s)
					count = (count + 1);
				};
			}
			return count;
		},
		/**
		  * On of the core operations of the widgets module. This assigns the given
		  * value to the given field (a selection or node UI), optionally considering
		  * formatting option.
		  * 
		  * The field UI can have the following attributes/classes:
		  * 
		  * - `[data-format=<string>]` referring to one of the `FORMATTER` functions
		  * that will be applied to the given `value` when `useFormatter` is `true`
		  * - `[data-default=<string>]` the default value to be used when the (formatted)
		  * value is empty or `DEFAULT`
		  * - `.autohide` will toggle the `.hidden` class based on whether the field
		  * has a (formatted) value or not
		  * 
		  * 
		*/
		SetFieldValue: function( field, value, useFormatter ){
			var self = this;
			if (useFormatter === undefined) {useFormatter=true}
			if (((!field) || (__module__.$(field).length == 0)) || (!extend.isDefined(value))) {
				return undefined;
			}
			var res = undefined;
			// Iterates over `__module__.$(field)`. This works on array,objects and null/undefined
			var __qn=__module__.$(field);
			var __rn=__qn instanceof Array ? __qn : Object.getOwnPropertyNames(__qn||{});
			var __tn=__rn.length;
			for (var __sn=0;__sn<__tn;__sn++){
				var __pn=(__rn===__qn)?__sn:__rn[__sn];
				var node=__qn[__pn];
				// This is the body of the iteration with (value=node, key/index=__pn) in __qn
				node = __module__.$(node);
				var node_name = node[0].nodeName.toLowerCase();;
				var formatter = node.data("format");;
				var formatted_value = value;;
				var default_value = node.data("default");;
				if ((useFormatter && (!((value === __module__.DEFAULT) || (value === __module__.NOTHING)))) && formatter) {
					formatted_value = __module__.format(value, formatter, field);
				};
				if ((((!extend.isDefined(formatted_value)) || (formatted_value === null)) || (value === __module__.DEFAULT)) || (formatted_value === __module__.DEFAULT)) {
					formatted_value = default_value;
				};
				node.toggleClass("default", (formatted_value == default_value));
				var apply_empty = true;;
				if (formatted_value != __module__.NOTHING) {
					if (((node_name == "input") || (node_name == "textarea")) || (node_name == "select")) {
						if (node.attr("type") == "checkbox") {
							res = node.attr("checked", (formatted_value && true));
						} else {
							if (extend.isMap(value)) {
								var text = (value[(node.attr("lang") || "en")] || "");
								node.data("value", value);
								node.val(__module__.format(text, formatter, field));
							} else {
								res = node.val(formatted_value);
							}
							__module__.triggerEvent(node, "change");
						}
					} else if (node_name == "img") {
						res = node.attr("src", formatted_value);
					} else if (node_name == "a") {
						res = node.attr("href", formatted_value);
					} else if (__module__.Widget.Has(node)) {
						var w = __module__.Widget.Get(node);
						if (w.setValue) {
							w.setValue(value);
						} else {
							w.setData(value);
						}
					} else if (__module__.Control.Has(node)) {
						var control = __module__.Control.Get(node);
						control.setValue(value);
					} else if (__module__.Widget.Has(node)) {
						res.setData(value);
					} else if (extend.isDefined(node.data("value")) || extend.isDefined(node.attr("value"))) {
						node.data("value", value);
					} else {
						res = node.html(formatted_value);
					}
				} else {
					apply_empty = (formatted_value != __module__.NOTHING);
					formatted_value = value;
				};
				if ((extend.isList(value) || extend.isMap(value)) && (extend.len(value) == 0)) {
					value = null;
					formatted_value = null;
				};
				if (apply_empty) {
					var is_empty = ((formatted_value == default_value) || (!formatted_value));
					node.toggleClass("empty", is_empty);
				};
				if (node.hasClass("autohide")) {
					node.toggleClass("hidden", is_empty);
				};
			}
			return res;
		},
		Has: function( selector ){
			var self = this;
			selector = __module__.asSelection(selector);
			!((selector.length <= 1)) && extend.assert(false, "widgets.Element.Has:", "Given selector should match only 1 element", "(failed `(selector.length <= 1)`)");
			var ui = __module__.asElement(selector, 0);
			if (ui._widget) {
				return true;
			} else {
				return false;
			}
		},
		/**
		  * Returns a selector that's the name of the class prefixed by a '.e-'
		  * 
		  * >    <MyElement instance> SelectorName () -> '.myelement'
		  * 
		*/
		SelectorName: function(  ){
			var self = this;
			return ("." + extend.access(self.getName().split("."),-1).toLowerCase());
		}
	}
})

widgets.Widget = extend.Class({
	name  :'widgets.Widget',
	parent: __module__.Element,
	shared: {
		Instance: undefined,
		UIS: {},
		OPTIONS: {}
	},
	properties: {
		layouts:undefined,
		uis:undefined,
		options:undefined,
		actions:undefined,
		behaviors:undefined,
		handlers:undefined,
		children:undefined,
		cursors:undefined,
		cache:undefined,
		isEnabled:undefined,
		isActive:undefined
	},
	initialize: function( selector, options ){
		var self = this;
		if (selector === undefined) {selector=null}
		if (options === undefined) {options=null}
		// Default initialization of property `layouts`
		if (typeof(self.layouts)=='undefined') {self.layouts = null;};
		// Default initialization of property `uis`
		if (typeof(self.uis)=='undefined') {self.uis = {"viz":{}};};
		// Default initialization of property `options`
		if (typeof(self.options)=='undefined') {self.options = {};};
		// Default initialization of property `actions`
		if (typeof(self.actions)=='undefined') {self.actions = {};};
		// Default initialization of property `behaviors`
		if (typeof(self.behaviors)=='undefined') {self.behaviors = {};};
		// Default initialization of property `handlers`
		if (typeof(self.handlers)=='undefined') {self.handlers = {};};
		// Default initialization of property `children`
		if (typeof(self.children)=='undefined') {self.children = [];};
		// Default initialization of property `cursors`
		if (typeof(self.cursors)=='undefined') {self.cursors = {};};
		// Default initialization of property `cache`
		if (typeof(self.cache)=='undefined') {self.cache = {};};
		// Default initialization of property `isEnabled`
		if (typeof(self.isEnabled)=='undefined') {self.isEnabled = true;};
		// Default initialization of property `isActive`
		if (typeof(self.isActive)=='undefined') {self.isActive = true;};
		self.getClass().Instance = self;
		var data = __module__.$(selector).data();
		// Iterates over `extend.merge((options || {}), extend.merge(self.getClass().OPTIONS, self.getClass().getParent().OPTIONS))`. This works on array,objects and null/undefined
		var __un=extend.merge((options || {}), extend.merge(self.getClass().OPTIONS, self.getClass().getParent().OPTIONS));
		var __vn=__un instanceof Array ? __un : Object.getOwnPropertyNames(__un||{});
		var __xn=__vn.length;
		for (var __wn=0;__wn<__xn;__wn++){
			var name=(__vn===__un)?__wn:__vn[__wn];
			var value=__un[name];
			// This is the body of the iteration with (value=value, key/index=name) in __un
			if (!extend.isDefined(self.options[name])) {
				if (data && extend.isDefined(data[name])) {
					self.options[name] = data[name];
				} else {
					self.options[name] = value;
				}
			};
		}
		self.getSuper(__module__.Widget.getParent())(selector);
	},
	methods: {
		relayout: function() {
			var self = this;
			if (!self.ui.hasClass("hidden")) {
				var forward_relayout = function(_) {
					return _.relayout();
				};
				// Iterates over `self.layouts`. This works on array,objects and null/undefined
				var __an=self.layouts;
				var __bn=__an instanceof Array ? __an : Object.getOwnPropertyNames(__an||{});
				var __dn=__bn.length;
				for (var __cn=0;__cn<__dn;__cn++){
					var __zn=(__bn===__an)?__cn:__bn[__cn];
					var __yn=__an[__zn];
					// This is the body of the iteration with (value=__yn, key/index=__zn) in __an
					forward_relayout(__yn, __zn, __an)
				}
				// Iterates over `self.behaviors`. This works on array,objects and null/undefined
				var __gn=self.behaviors;
				var __hn=__gn instanceof Array ? __gn : Object.getOwnPropertyNames(__gn||{});
				var __jp=__hn.length;
				for (var __ip=0;__ip<__jp;__ip++){
					var __fn=(__hn===__gn)?__ip:__hn[__ip];
					var __en=__gn[__fn];
					// This is the body of the iteration with (value=__en, key/index=__fn) in __gn
					forward_relayout(__en, __fn, __gn)
				}
				// Iterates over `self.children`. This works on array,objects and null/undefined
				var __mp=self.children;
				var __op=__mp instanceof Array ? __mp : Object.getOwnPropertyNames(__mp||{});
				var __pp=__op.length;
				for (var __np=0;__np<__pp;__np++){
					var __lp=(__op===__mp)?__np:__op[__np];
					var __kp=__mp[__lp];
					// This is the body of the iteration with (value=__kp, key/index=__lp) in __mp
					forward_relayout(__kp, __lp, __mp)
				}
			}
		},
		
		setOptions: function(options) {
			var self = this;
			// Iterates over `options`. This works on array,objects and null/undefined
			var __qp=options;
			var __rp=__qp instanceof Array ? __qp : Object.getOwnPropertyNames(__qp||{});
			var __tp=__rp.length;
			for (var __sp=0;__sp<__tp;__sp++){
				var k=(__rp===__qp)?__sp:__rp[__sp];
				var v=__qp[k];
				// This is the body of the iteration with (value=v, key/index=k) in __qp
				if (extend.isDefined(self.getClass().OPTIONS[k]) || extend.isDefined(self.options[k])) {
					self.options[k] = v;
				};
			}
			return self;
		},
		
		sync: function() {
			var self = this;
			// Iterates over `self.inputs`. This works on array,objects and null/undefined
			var __up=self.inputs;
			var __vp=__up instanceof Array ? __up : Object.getOwnPropertyNames(__up||{});
			var __xp=__vp.length;
			for (var __wp=0;__wp<__xp;__wp++){
				var _=(__vp===__up)?__wp:__vp[__wp];
				var v=__up[_];
				// This is the body of the iteration with (value=v, key/index=_) in __up
				self.data[_] = self.get(_);
			}
			return self.data;
		},
		
		enable: function() {
			var self = this;
			self.isEnabled = true;
			return self;
		},
		
		disable: function() {
			var self = this;
			self.isEnabled = false;
			return self;
		},
		
		setActive: function() {
			var self = this;
			if (!self.isActive) {
				self.isActive = true;
				self.onActivate();
				return true;
			} else {
				return false;
			}
		},
		
		setInactive: function() {
			var self = this;
			if (self.isActive) {
				self.isActive = false;
				self.onDeactivate();
				return true;
			} else {
				return false;
			}
		},
		
		onActivate: function() {
			var self = this;
		},
		
		onDeactivate: function() {
			var self = this;
		},
		
		/**
		  * Binds pre-visualized elements (usually rendered on the server) so that
		  * they're ready for update with the next `visualize` call.
		  * 
		*/
		previsualize: function(context, elements, extractor) {
			var self = this;
			if (extractor === undefined) {extractor=function(_) {
				return _;
			}}
			if (extend.isString(context)) {
				var name = context;
				self.uis.viz = (self.uis.viz || {});
				context = (self.uis.viz[name] || {"all":{}, "keys":[]});
				self.uis.viz[name] = context;
			}
			context.all = (context.all || {});
			context.keys = (context.keys || []);
			var i = 0;
			// Iterates over `self.uis.imagesList`. This works on array,objects and null/undefined
			var __zp=self.uis.imagesList;
			var __ap=__zp instanceof Array ? __zp : Object.getOwnPropertyNames(__zp||{});
			var __cp=__ap.length;
			for (var __bp=0;__bp<__cp;__bp++){
				var __yp=(__ap===__zp)?__bp:__ap[__bp];
				var nui=__zp[__yp];
				// This is the body of the iteration with (value=nui, key/index=__yp) in __zp
				if (!((extend.isIn(i,context.keys)))) {
					context.keys.push(i);
					context.all[i] = extractor(nui);
				};
				i = (i + 1);
			}
			return context;
		},
		
		/**
		  * Iterates on the given data, calling onCreate if the data was not there before,
		  * onUpdate if the data was already there or onRemove if the data was removed.
		  * `onCreate` takes (`context`, `data element`, `key`),
		  * `onUpdate` takes (`context`, `data element`, `key`, `interface element`)
		  * `onRemove` takes (`context`, `key`, `interface element`)
		  * where `onCreate` returns the `interface element`.
		  * 
		  * This process is similar to D3's select/enter/update/exit process.
		  * 
		*/
		visualize: function(context, data, onCreate, onUpdate, onRemove) {
			var self = this;
			if (onUpdate === undefined) {onUpdate=undefined}
			if (onRemove === undefined) {onRemove=undefined}
			if (extend.isString(context)) {
				self.uis.viz = (self.uis.viz || {});
				self.uis.viz[context] = (self.uis.viz[context] || {});
				context = self.uis.viz[context];
			}
			return __module__.visualize(context, data, onCreate, onUpdate, onRemove);
		},
		
		/**
		  * Ensures that there is a cache entry for the given key, filling it
		  * with the given default value.
		  * 
		*/
		ensureCache: function(key, defaultValue) {
			var self = this;
			if (defaultValue === undefined) {defaultValue={}}
			if (!self.cache[key]) {
				self.cache[key] = defaultValue;
			}
			return self.cache[key];
		},
		
		bindUI: function() {
			var self = this;
			!(self.ui) && extend.assert(false, "widgets.Widget.bindUI:", "Widget.bindUI: ui is not defined", "(failed `self.ui`)");
			!((extend.len(self.ui) == 1)) && extend.assert(false, "widgets.Widget.bindUI:", ("Widget.bindUI: ui expects 1 node bound, got " + extend.len(self.ui)), "(failed `(extend.len(self.ui) == 1)`)");
			self.bindLayouts();
			self.bindActions();
			!(((!self.getClass().UIS) || extend.isMap(self.getClass().UIS))) && extend.assert(false, "widgets.Widget.bindUI:", "Widget.UIS must be empty or map", "(failed `((!self.getClass().UIS) || extend.isMap(self.getClass().UIS))`)");
			self.bindUIS(self.getClass().UIS);
			self.bindHandlers();
			self.getSuper(__module__.Widget.getParent()).bindUI();
		},
		
		/**
		  * Adds the given ui/widget as a child to this widget. This returns the
		  * widget instance, or `None` if it is does not exists.
		  * 
		*/
		addChild: function(cui) {
			var self = this;
			var w = __module__.Widget.Ensure(cui);
			if (__module__.Widget.hasInstance(w)) {
				if (!((extend.isIn(w,self.children)))) {
					self.children.push(w);
				}
				return w;
			} else {
				return null;
			}
		},
		
		bindHandlers: function(handlers) {
			var self = this;
			if (handlers === undefined) {handlers=self.handlers}
			if (window.interaction) {
				// Iterates over `handlers`. This works on array,objects and null/undefined
				var __dp=handlers;
				var __ep=__dp instanceof Array ? __dp : Object.getOwnPropertyNames(__dp||{});
				var __gp=__ep.length;
				for (var __fp=0;__fp<__gp;__fp++){
					var k=(__ep===__dp)?__fp:__ep[__fp];
					var v=__dp[k];
					// This is the body of the iteration with (value=v, key/index=k) in __dp
					if (!interaction.Handler.hasInstance(v)) {
						handlers[k] = interaction.handle(v);
						if (self.uis[k]) {
							handlers[k].bind(self.uis[k]);
						}
					};
				}
			}
			return self;
		},
		
		/**
		  * Binds the given widgets as children
		  * 
		*/
		bindChildren: function(childrenUIS) {
			var self = this;
			if (childrenUIS === undefined) {childrenUIS=self.ui.find(".widget");}
			// Iterates over `__module__.$(childrenUIS)`. This works on array,objects and null/undefined
			var __iq=__module__.$(childrenUIS);
			var __jq=__iq instanceof Array ? __iq : Object.getOwnPropertyNames(__iq||{});
			var __lq=__jq.length;
			for (var __kq=0;__kq<__lq;__kq++){
				var __hp=(__jq===__iq)?__kq:__jq[__kq];
				var child=__iq[__hp];
				// This is the body of the iteration with (value=child, key/index=__hp) in __iq
				child = __module__.$(child);
				if (child.parents(".widget:first")[0] == self.ui[0]) {
					self.children.push(__module__.Widget.Ensure(child));
				};
			}
			return self;
		},
		
		/**
		  * A placeholder method that can be implemented to update the ui elements
		  * once a change has been made (for instance, to the data)
		  * 
		*/
		updateUI: function() {
			var self = this;
		},
		
		bindLayouts: function() {
			var self = this;
			if (!self.layouts) {
				self.layouts = [];
			}
			if (self.ui.hasClass("layout")) {
				self.layouts.push(__module__.Layout.Ensure(self.ui));
			}
			// Iterates over `self.ui.find(".layout")`. This works on array,objects and null/undefined
			var __oq=self.ui.find(".layout");
			var __nq=__oq instanceof Array ? __oq : Object.getOwnPropertyNames(__oq||{});
			var __qq=__nq.length;
			for (var __pq=0;__pq<__qq;__pq++){
				var __mq=(__nq===__oq)?__pq:__nq[__pq];
				var _=__oq[__mq];
				// This is the body of the iteration with (value=_, key/index=__mq) in __oq
				if (self.isSelectorInWidget(_) && (!__module__.$(_).hasClass("widget"))) {
					self.layouts.push(__module__.Layout.Ensure(_));
				};
			}
		},
		
		bindActions: function(cui, selector) {
			var self = this;
			if (cui === undefined) {cui=self.ui}
			if (selector === undefined) {selector=".do"}
			// Iterates over `__module__.$(cui).find(selector)`. This works on array,objects and null/undefined
			var __sq=__module__.$(cui).find(selector);
			var __tq=__sq instanceof Array ? __sq : Object.getOwnPropertyNames(__sq||{});
			var __vq=__tq.length;
			for (var __uq=0;__uq<__vq;__uq++){
				var __rq=(__tq===__sq)?__uq:__tq[__uq];
				var _=__sq[__rq];
				// This is the body of the iteration with (value=_, key/index=__rq) in __sq
				var key = _.getAttribute("data-action");;
				if (self.isSelectorInWidget(_) && (!self.isSelectorInTemplate(_))) {
					if (!self.actions[key]) {
						self.actions[key] = [_];
					} else {
						self.actions[key].push(_);
					}
				};
			}
			// Iterates over `self.actions`. This works on array,objects and null/undefined
			var __wq=self.actions;
			var __xq=__wq instanceof Array ? __wq : Object.getOwnPropertyNames(__wq||{});
			var __zq=__xq.length;
			for (var __yq=0;__yq<__zq;__yq++){
				var k=(__xq===__wq)?__yq:__xq[__yq];
				var v=__wq[k];
				// This is the body of the iteration with (value=v, key/index=k) in __wq
				self.actions[k] = __module__.$(v);
				self.bindAction(k, cui);
			}
			return self;
		},
		
		bindAction: function(name, cui) {
			var self = this;
			if (cui === undefined) {cui=self.ui}
			if (!extend.isDefined(self[name])) {
				extend.warning((((self.getClass().getName() + ".") + name) + "() not defined, but referenced by"), __module__.asElements(self.actions[name], true));
			}
			var callback = function(event) {
				try {
					if (extend.isDefined(self[name])) {
						self[name](event);
					} else {
						extend.warning((((self.getClass().getName() + ".") + name) + "() not defined, but triggered with event"), event);
					}
				} catch(e) {
					extend.exception(e, ((("Exception in callback for action '" + self.getClass().getName()) + ".") + name))
					throw e;
				}
				return false;
			};
			// Iterates over `self.actions[name]`. This works on array,objects and null/undefined
			var __bq=self.actions[name];
			var __cq=__bq instanceof Array ? __bq : Object.getOwnPropertyNames(__bq||{});
			var __eq=__cq.length;
			for (var __dq=0;__dq<__eq;__dq++){
				var __aq=(__cq===__bq)?__dq:__cq[__dq];
				var action_target=__bq[__aq];
				// This is the body of the iteration with (value=action_target, key/index=__aq) in __bq
				if (action_target.nodeName.toLowerCase() == "form") {
					__module__.bindEvent(action_target, "submit", callback);
				} else {
					__module__.bindEvent(action_target, "click", callback);
				};
			}
			return self;
		},
		
		bindUIS: function(uis) {
			var self = this;
			if (uis === undefined) {uis=self.getClass().UIS}
			var prefixes = {};
			// Iterates over `uis`. This works on array,objects and null/undefined
			var __fq=uis;
			var __gq=__fq instanceof Array ? __fq : Object.getOwnPropertyNames(__fq||{});
			var __ir=__gq.length;
			for (var __hq=0;__hq<__ir;__hq++){
				var k=(__gq===__fq)?__hq:__gq[__hq];
				var selector=__fq[k];
				// This is the body of the iteration with (value=selector, key/index=k) in __fq
				var scope = prefixes;;
				var parts = selector.split(" ");;
				// Iterates over `parts`. This works on array,objects and null/undefined
				var __jr=parts;
				var __kr=__jr instanceof Array ? __jr : Object.getOwnPropertyNames(__jr||{});
				var __mr=__kr.length;
				for (var __lr=0;__lr<__mr;__lr++){
					var i=(__kr===__jr)?__lr:__kr[__lr];
					var v=__jr[i];
					// This is the body of the iteration with (value=v, key/index=i) in __jr
					if (!scope[v]) {
						scope[v] = {};
					};
					scope = scope[v];
				};
				if (!scope["__selector__"]) {
					scope["__selector__"] = [];
				};
				scope["__selector__"].push(k);
			}
			self._bindUIPrefixes(prefixes, self.ui);
		},
		
		/**
		  * Helper function used by bindUIS to allow to prevent doing multiple queries
		  * For elements that share the same prefix.
		  * 
		*/
		_bindUIPrefixes: function(prefixes, scope, prefix) {
			var self = this;
			if (prefix === undefined) {prefix=""}
			prefix = prefix.trim();
			if (prefix && (">!".indexOf(extend.access(prefix,-1)) == -1)) {
				var old_scope = scope;
				scope = scope.find(prefix);
				prefix = "";
			}
			if (extend.isDefined(prefixes.__selector__)) {
				if (prefix) {
					scope = scope.find(prefix);
					prefix = "";
				}
				// Iterates over `prefixes.__selector__`. This works on array,objects and null/undefined
				var __nr=prefixes.__selector__;
				var __pr=__nr instanceof Array ? __nr : Object.getOwnPropertyNames(__nr||{});
				var __rr=__pr.length;
				for (var __qr=0;__qr<__rr;__qr++){
					var __or=(__pr===__nr)?__qr:__pr[__qr];
					var name=__nr[__or];
					// This is the body of the iteration with (value=name, key/index=__or) in __nr
					self.uis[name] = scope;
				}
			}
			// Iterates over `prefixes`. This works on array,objects and null/undefined
			var __sr=prefixes;
			var __tr=__sr instanceof Array ? __sr : Object.getOwnPropertyNames(__sr||{});
			var __vr=__tr.length;
			for (var __ur=0;__ur<__vr;__ur++){
				var query=(__tr===__sr)?__ur:__tr[__ur];
				var sub_prefixes=__sr[query];
				// This is the body of the iteration with (value=sub_prefixes, key/index=query) in __sr
				if (query != "__selector__") {
					var full_query = query;
					if (prefix) {
						full_query = ((prefix + " ") + query);
					}
					if (sub_prefixes) {
						self._bindUIPrefixes(sub_prefixes, scope, full_query);
					}
				};
			}
		},
		
		/**
		  * Returns the first widget instance that is part of this widget UI, having the
		  * given Widget class or jQuery selector.
		  * 
		*/
		findWidget: function(classOrSelector) {
			var self = this;
			if (extend.isString(classOrSelector)) {
				var e = __module__.$(classOrSelector, self.ui);
				var i = 0;
				while ((i < e.length)) {
					if (__module__.Widget.Has(e[i])) {
						return __module__.Widget.Get(e[i]);
					}
					i = (i + 1);
				}
				return null;
			} else {
				return self.findWidget(classOrSelector.SelectorName());
			}
		},
		
		/**
		  * Returns the list of widget instances that are part of this widget UI, having the
		  * given Widget class or jQuery selector.
		  * 
		*/
		findWidgets: function(classOrSelector) {
			var self = this;
			var res = [];
			if (extend.isString(classOrSelector)) {
				// Iterates over `__module__.$(classOrSelector, self.ui)`. This works on array,objects and null/undefined
				var __xr=__module__.$(classOrSelector, self.ui);
				var __yr=__xr instanceof Array ? __xr : Object.getOwnPropertyNames(__xr||{});
				var __ar=__yr.length;
				for (var __zr=0;__zr<__ar;__zr++){
					var __wr=(__yr===__xr)?__zr:__yr[__zr];
					var s=__xr[__wr];
					// This is the body of the iteration with (value=s, key/index=__wr) in __xr
					if (__module__.Widget.Has(s)) {
						res.push(getWiget(s));
					};
				}
			} else {
				return self.findWidget(classOrSelector.SelectorName());
			}
			return res;
		}
	},
	operations:{
		UnbindEvent: function( element, name, callback ){
			var self = this;
			element = __module__.asElement(element);
			var w = __module__.Widget.Ensure(element);
			if ((w && w.on) && w.on[name]) {
				w.on[name].unbind(callback);
				return true;
			} else {
				return false;
			}
		},
		BindEvent: function( element, name, callback ){
			var self = this;
			element = __module__.asElement(element);
			var w = __module__.Widget.Ensure(element);
			if ((w && w.on) && w.on[name]) {
				w.on[name].bind(callback);
				return true;
			} else {
				return false;
			}
		},
		TriggerEvent: function( element, name, value, source ){
			var self = this;
			element = __module__.asElement(element);
			var w = __module__.Widget.Ensure(element);
			if ((w && w.on) && w.on[name]) {
				w.on[name].trigger(value, source);
				return true;
			} else {
				return false;
			}
		},
		/**
		  * Ensures that an instance of the given widget class is already bound to the given selector
		  * 
		*/
		Ensure: function( selector, widgetClass, strict ){
			var self = this;
			if (widgetClass === undefined) {widgetClass=undefined}
			if (strict === undefined) {strict=true}
			if (__module__.Widget.hasInstance(selector)) {
				return selector;
			}
			var nodes = __module__.asSelection(selector);
			!(extend.isDefined(selector)) && extend.assert(false, "widgets.Widget.Ensure:", "Widget.Ensure: No selector given", "(failed `extend.isDefined(selector)`)");
			var res = [];
			if (nodes.length > 0) {
				// Iterates over `nodes`. This works on array,objects and null/undefined
				var __br=nodes;
				var __cr=__br instanceof Array ? __br : Object.getOwnPropertyNames(__br||{});
				var __er=__cr.length;
				for (var __dr=0;__dr<__er;__dr++){
					var i=(__cr===__br)?__dr:__cr[__dr];
					var node=__br[i];
					// This is the body of the iteration with (value=node, key/index=i) in __br
					var the_class = (widgetClass || __module__.getUIWidgetClass(node));;
					if (__module__.Widget.Has(node)) {
						res.push(__module__.Widget.Get(node));
					} else if (the_class) {
						res.push(new the_class(node));
					} else if (strict) {
						extend.error("Widget.Ensure: Node has no data-widget attribute", node);
					};
				}
				if (res.length == 1) {
					return res[0];
				} else {
					return res;
				}
			} else {
				!(extend.isDefined(selector)) && extend.assert(false, "widgets.Widget.Ensure:", "Widgets.Ensure: Empty selector given", "(failed `extend.isDefined(selector)`)");
				return null;
			}
		},
		HasEvent: function( element, name ){
			var self = this;
			element = __module__.asElement(element);
			var w = __module__.Widget.Ensure(element, undefined, false);
			return ((w && w.on) && w.on[name]);
		},
		/**
		  * Returns a selector that's the name of the class prefixed by a '.'
		  * 
		  * >    <MyWidget instance> SelectorName () -> '.MyWidget'
		  * 
		*/
		SelectorName: function(  ){
			var self = this;
			return ("." + extend.access(self.getName().split("."),-1));
		}
	}
})
/**
  * A lightweight version of widget that is used for simple UI elements
  * such a text fields, option selectors, etc.
  * 
*/
widgets.Control = extend.Class({
	name  :'widgets.Control',
	parent: undefined,
	shared: {
		CSS_CLASS: null,
		UIS: {},
		EVENTS: [],
		OPTIONS: {}
	},
	properties: {
		ui:undefined,
		uis:undefined,
		options:undefined,
		isEnabled:undefined
	},
	initialize: function( ui ){
		var self = this;
		// Default initialization of property `ui`
		if (typeof(self.ui)=='undefined') {self.ui = null;};
		// Default initialization of property `uis`
		if (typeof(self.uis)=='undefined') {self.uis = {};};
		// Default initialization of property `options`
		if (typeof(self.options)=='undefined') {self.options = {};};
		// Default initialization of property `isEnabled`
		if (typeof(self.isEnabled)=='undefined') {self.isEnabled = true;};
		self.ui = __module__.$(ui);
		!((self.ui.length > 0)) && extend.assert(false, "widgets.Control.__init__:", ((self.getClass().getName + " ui node/selector empty: ") + __module__._extractSelector(ui)), "(failed `(self.ui.length > 0)`)");
		var parent = self.getClass().getParent();
		// Iterates over `extend.merge(self.getClass().OPTIONS, ((parent && parent.OPTIONS) || {}))`. This works on array,objects and null/undefined
		var __fr=extend.merge(self.getClass().OPTIONS, ((parent && parent.OPTIONS) || {}));
		var __gr=__fr instanceof Array ? __fr : Object.getOwnPropertyNames(__fr||{});
		var __is=__gr.length;
		for (var __hr=0;__hr<__is;__hr++){
			var name=(__gr===__fr)?__hr:__gr[__hr];
			var value=__fr[name];
			// This is the body of the iteration with (value=value, key/index=name) in __fr
			if (!extend.isDefined(self.options[name])) {
				var overriden_value = self.ui.data(name);
				if (extend.isDefined(overriden_value)) {
					self.options[name] = overriden_value;
				} else {
					self.options[name] = value;
				}
			};
		}
		__module__.asNode(ui)._control = self;
		self.bindUI();
	},
	methods: {
		bindUI: function() {
			var self = this;
			// Iterates over `self.getClass().UIS`. This works on array,objects and null/undefined
			var __js=self.getClass().UIS;
			var __ks=__js instanceof Array ? __js : Object.getOwnPropertyNames(__js||{});
			var __ms=__ks.length;
			for (var __ls=0;__ls<__ms;__ls++){
				var k=(__ks===__js)?__ls:__ks[__ls];
				var v=__js[k];
				// This is the body of the iteration with (value=v, key/index=k) in __js
				self.uis[k] = self.ui.find(v);
			}
		},
		
		enable: function() {
			var self = this;
			self.isEnabled = true;
			return self;
		},
		
		disable: function() {
			var self = this;
			self.isEnabled = false;
			return self;
		},
		
		updateUI: function(value) {
			var self = this;
		},
		
		getName: function() {
			var self = this;
			return self.ui.data("field");
		},
		
		getValue: function() {
			var self = this;
			return self.ui.data("value");
		},
		
		setValue: function(value) {
			var self = this;
			if (extend.isString(value)) {
				self.ui.attr("data-value", value);
			} else {
				self.ui.attr("data-value", JSON.stringify(value));
			}
			self.updateUI(value);
			return value;
		},
		
		trigger: function(event, value) {
			var self = this;
			if (self.isEnabled) {
				__module__.triggerEvent(self.ui[0], event, value, self);
			}
		},
		
		/**
		  * An alias to `on`
		  * 
		*/
		bind: function(event, callback) {
			var self = this;
			return self.on(event, callback);
		},
		
		on: function(event, callback) {
			var self = this;
			return __module__.bindEvent(self.ui[0], event, callback);
		}
	},
	operations:{
		Get: function( ui ){
			var self = this;
			ui = __module__.asElement(ui);
			if (ui && ui._control) {
				return ui._control;
			} else {
				return null;
			}
		},
		Bind: function( ui ){
			var self = this;
			if (!__module__.Control.Has(ui)) {
				return new self(ui);
			} else {
				return __module__.Control.Get(ui);
			}
		},
		BindEvent: function( ui, event, callback ){
			var self = this;
			!(extend.isFunction(callback)) && extend.assert(false, "widgets.Control.BindEvent:", (("Control.BindEvent(" + event) + "): callback is expected to be a function, got"), callback, "(failed `extend.isFunction(callback)`)");
			ui = __module__.asElement(ui);
			if (ui) {
				ui._widgetEvents = (ui._widgetEvents || {});
				ui._widgetEvents[event] = (ui._widgetEvents[event] || []);
				ui._widgetEvents[event].push(callback);
				return ui;
			} else {
				return null;
			}
		},
		TriggerEvent: function( ui, event, value, source ){
			var self = this;
			ui = __module__.asElement(ui);
			if ((!ui) || (!ui._widgetEvents)) {
				return null;
			}
			// Iterates over `ui._widgetEvents[event]`. This works on array,objects and null/undefined
			var __ns=ui._widgetEvents[event];
			var __ps=__ns instanceof Array ? __ns : Object.getOwnPropertyNames(__ns||{});
			var __rs=__ps.length;
			for (var __qs=0;__qs<__rs;__qs++){
				var __os=(__ps===__ns)?__qs:__ps[__qs];
				var callback=__ns[__os];
				// This is the body of the iteration with (value=callback, key/index=__os) in __ns
				callback(event, value, source);
			}
			return ui;
		},
		/**
		  * An alias for Bind
		  * 
		*/
		Ensure: function( ui ){
			var self = this;
			return self.Bind(ui);
		},
		HasEvent: function( ui, event ){
			var self = this;
			var control = self.Get(ui);
			if (control) {
				return ((extend.isIn(event,control.getClass().EVENTS)));
			} else {
				return false;
			}
		},
		Has: function( ui ){
			var self = this;
			ui = __module__.asElement(ui);
			return (ui && extend.isDefined(ui._control));
		}
	}
})
/**
  * A simple wrapper around `input` and `textarea` fields that supports
  * placeholders, detects `autocomplete` and `i18n` wrapper.
  * 
  * Each field can defined a `data-placeholder` as a placeholder value. When
  * the field's value is the placeholder, the `placeholder` class
  * will be set. When the field has no value, the `empty` class will be set.
  * 
*/
widgets.Field = extend.Class({
	name  :'widgets.Field',
	parent: __module__.Control,
	shared: {
		OPTIONS: {"placeholder":undefined, "clear":false}
	},
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Field.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.Field.getParent()).bindUI();
			var p = self.ui.parent();
			if (p.hasClass("autocomplete")) {
				__module__.bindAutocomplete(p);
			}
			if (p.hasClass("i18n")) {
				__module__.bindI18N(p, self.ui);
			} else if (p.parent().hasClass("i18n")) {
				__module__.bindI18N(p.parent(), self.ui);
			}
			__module__.bindEvent(self.ui, {"keyup":self.getMethod('onKeyUp') , "focus":self.getMethod('onFocusOrClick') , "click":self.getMethod('onFocusOrClick') , "blur":self.getMethod('onChange') , "change":self.getMethod('onChange') , "mouseup":self.getMethod('cancelEvent') });
			if (self.options.clear) {
				self.ui.val("");
			}
			self.onChange();
		},
		
		cancelEvent: function(e) {
			var self = this;
			e.preventDefault();
		},
		
		onChange: function(event) {
			var self = this;
			var val = ("" + self.ui.val());
			var label = self.ui.attr("data-label");
			if (label) {
				if (val.trim().length == 0) {
					self.ui.val(self.options.placeholder);
					self.ui.addClass("placeholder");
				} else if (val == self.options.placeholder) {
					self.ui.addClass("placeholder");
				} else {
					self.ui.removeClass("placeholder");
				}
			} else {
				self.ui.removeClass("placeholder");
			}
			self.ui.toggleClass("empty", (val.length == 0));
		},
		
		onFocusOrClick: function(event) {
			var self = this;
			if (self.ui.val() == self.options.placeholder) {
				self.ui.select();
			}
		},
		
		onKeyUp: function() {
			var self = this;
			self.ui.toggleClass("placeholder", (self.ui.val() == self.options.placeholder));
		}
	}
})

widgets.I18NField = extend.Class({
	name  :'widgets.I18NField',
	parent: __module__.Control,
	shared: {
		CSS_CLASS: ".i18n.input",
		UIS: {"select":".select:not(.template)", "field":"input"},
		EVENTS: ["change"],
		OPTIONS: {"default":"en"}
	},
	properties: {
		selector:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `selector`
		if (typeof(self.selector)=='undefined') {self.selector = null;};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.I18NField.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.I18NField.getParent()).bindUI();
			self.selector = __module__.Selector.Bind(self.uis.select);
			self.uis.field.change(self.getMethod('onFieldChange') );
			self.selector.on("change", self.getMethod('onSelectorChange') );
		},
		
		setValue: function(value) {
			var self = this;
			if (!(value || extend.isString(value))) {
				value = extend.createMapFromItems([self.getDisplayedLanguage(),value]);
			}
			self.getSuper(__module__.I18NField.getParent()).setValue(value);
			self.uis.field.attr("data-value", self.ui.attr("data-value")).data("value", value);
			return value;
		},
		
		getValue: function() {
			var self = this;
			var value = self.getSuper(__module__.I18NField.getParent()).getValue();
			if (!(value || extend.isString(value))) {
				value = extend.createMapFromItems([self.getDisplayedLanguage(),value]);
			}
			return value;
		},
		
		updateUI: function(value) {
			var self = this;
			if (value === undefined) {value=self.getValue();}
			var lang = self.getDisplayedLanguage();
			self.uis.field.attr("lang", lang).val(value[lang]);
			// Iterates over `self.selector.uis.options`. This works on array,objects and null/undefined
			var __ts=self.selector.uis.options;
			var __us=__ts instanceof Array ? __ts : Object.getOwnPropertyNames(__ts||{});
			var __ws=__us.length;
			for (var __vs=0;__vs<__ws;__vs++){
				var __ss=(__us===__ts)?__vs:__us[__vs];
				var oui=__ts[__ss];
				// This is the body of the iteration with (value=oui, key/index=__ss) in __ts
				oui = __module__.$(oui);
				var lang = oui.data("value");;
				if (!value[lang]) {
					oui.addClass("is-empty");
				} else {
					oui.removeClass("is-empty");
				};
			}
		},
		
		getDisplayedLanguage: function() {
			var self = this;
			return ((self.selector.getValue() || self.options._LF_default) || self.selector.getDefaultValue());
		},
		
		onFieldChange: function() {
			var self = this;
			var value = self.getValue();
			value[self.getDisplayedLanguage()] = self.uis.field.val();
			self.setValue(value);
		},
		
		onSelectorChange: function(event) {
			var self = this;
			self.updateUI();
		}
	}
})
/**
  * A control that implements SELECT/OPTION behavior
  * 
*/
widgets.Selector = extend.Class({
	name  :'widgets.Selector',
	parent: __module__.Control,
	shared: {
		CSS_CLASS: "select",
		UIS: {"options":".option:not(.template)", "value":".out-value", "label":".out-label"},
		EVENTS: ["change", "click"],
		OPTIONS: {"autoupdate":true, "multiple":false, "filter":false, "empty":true, "allToSingle":true, "any":undefined}
	},
	properties: {
		clickDelayed:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `clickDelayed`
		if (typeof(self.clickDelayed)=='undefined') {self.clickDelayed = new events.Delayed(function() {
			return self.ui.removeClass("clicked");
		}, 250);};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Selector.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.Selector.getParent()).bindUI();
			self.options.multiple = (self.ui.hasClass("multiple") || self.options.multiple);
			self.options.filter = (self.ui.hasClass("filter") || self.options.filter);
			__module__.bindEvent(self.ui, "click", self.getMethod('onClick') );
			self.setValue(self.getValue(), true);
		},
		
		onClick: function(event) {
			var self = this;
			var option = null;
			var node = event.target;
			var found = null;
			while (((node && (node != self.ui[0])) && (!found))) {
				var n = __module__.$(node);
				if (n.hasClass("option") && (!n.hasClass("template"))) {
					found = node;
				} else {
					node = node.parentNode;
				}
			}
			if (found) {
				self.onOptionClick(found);
			}
		},
		
		selectDefault: function() {
			var self = this;
			return self.setValue(self.getDefaultValue());
		},
		
		selectNone: function() {
			var self = this;
			if (!self.options.empty) {
				return self.selectDefault();
			} else {
				return self.setValue(null, true);
			}
		},
		
		selectAll: function() {
			var self = this;
			if (self.options.multiple) {
				var value = [];
				// Iterates over `self.uis.options`. This works on array,objects and null/undefined
				var __ys=self.uis.options;
				var __zs=__ys instanceof Array ? __ys : Object.getOwnPropertyNames(__ys||{});
				var __bs=__zs.length;
				for (var __as=0;__as<__bs;__as++){
					var __xs=(__zs===__ys)?__as:__zs[__as];
					var _=__ys[__xs];
					// This is the body of the iteration with (value=_, key/index=__xs) in __ys
					value.push(__module__.$(_).attr("data-value"));
				}
				return self.setValue(value);
			} else {
				self.setValue((self.getValue() || self.getDefaultValue()));
			}
		},
		
		getValue: function() {
			var self = this;
			var value = ((self.ui.attr("value") || self.ui.attr("data-value")) || "");
			if (self.options.multiple) {
				value = value.split(",");
				if ((extend.len(value) == 0) || ((extend.len(value) == 1) && (!value[0]))) {
					value = null;
				}
			}
			if (!value) {
				value = null;
			}
			return value;
		},
		
		getDefaultValue: function(option) {
			var self = this;
			if (option === undefined) {option=self.uis.options.first();}
			var value = null;
			if (self.options._LF_default) {
				value = self.options._LF_default;
			} else {
				value = __module__.$(option).attr("data-value");
			}
			if (self.options.multiple) {
				return [value];
			} else {
				return value;
			}
		},
		
		getOptions: function() {
			var self = this;
			var o = [];
			// Iterates over `self.uis.options`. This works on array,objects and null/undefined
			var __ds=self.uis.options;
			var __es=__ds instanceof Array ? __ds : Object.getOwnPropertyNames(__ds||{});
			var __gs=__es.length;
			for (var __fs=0;__fs<__gs;__fs++){
				var __cs=(__es===__ds)?__fs:__es[__fs];
				var _=__ds[__cs];
				// This is the body of the iteration with (value=_, key/index=__cs) in __ds
				o.push(__module__.$(_).data("value"));
			}
			return o;
		},
		
		/**
		  * Returns the count of options, exlcuding `options any`
		  * 
		*/
		getOptionsCount: function() {
			var self = this;
			var count = self.uis.options.length;
			if (self.options.any) {
				var count_any = self.uis.options.filter((("[data-value='" + self.options.any) + "']")).length;
				count = (count - count_any);
			}
			return count;
		},
		
		/**
		  * Tells wether all the options are selected, this supports `option any`.
		  * 
		*/
		isAllSelected: function() {
			var self = this;
			return ((self.getOptionsCount() - extend.len(self.getValue())) == 0);
		},
		
		/**
		  * Sets the current value for the selector. This method is fairly
		  * complex as it has to manage all the difference cases, such as single/multiple
		  * selection, not allowing an empty selection, and the `any` case.
		  * 
		*/
		setValue: function(value, force) {
			var self = this;
			if (force === undefined) {force=false}
			if (!value) {
				value = null;
			}
			var previous_value = (self.getValue() || null);
			var stored_value = "";
			if ((!self.options.empty) && (!value)) {
				value = (previous_value || self.getDefaultValue());
			}
			if ((value != previous_value) || force) {
				var is_filter = self.options.filter;
				var is_multiple = self.options.multiple;
				var is_empty = ((!value) || (value.length == 0));
				if (is_multiple) {
					if (extend.isString(value)) {
						value = extend.map(value.split(","), String.trim);
					}
					var has_any = (extend.isDefined(self.options.any) && (extend.find(value, self.options.any) >= 0));
					if (has_any) {
						var had_any = (extend.isDefined(self.options.any) && (extend.find(previous_value, self.options.any) >= 0));
						if (extend.cmp(value, previous_value) == 0) {
							value = value;
						} else if (had_any) {
							value = extend.filter(value, function(_) {
								return (_ != self.options.any);
							});
						} else {
							value = [self.options.any];
						}
					}
					// Iterates over `self.uis.options`. This works on array,objects and null/undefined
					var __it=self.uis.options;
					var __jt=__it instanceof Array ? __it : Object.getOwnPropertyNames(__it||{});
					var __lt=__jt.length;
					for (var __kt=0;__kt<__lt;__kt++){
						var __hs=(__jt===__it)?__kt:__jt[__kt];
						var o=__it[__hs];
						// This is the body of the iteration with (value=o, key/index=__hs) in __it
						o = __module__.$(o);
						o.toggleClass("selected", ((extend.find(value, o.attr("data-value")) != -1) || (is_filter && is_empty)));
					}
					if (value) {
						stored_value = value.join(",");
					} else {
						stored_value = "";
					}
				} else {
					self.uis.options.removeClass("selected");
					if (value) {
						self.uis.options.filter((("[data-value=\"" + value) + "\"]")).addClass("selected");
						stored_value = value;
					}
				}
				self.ui.attr("data-value", stored_value);
				self.ui.attr("data-index", self.getIndex(stored_value));
				__module__.Element.SetFieldValue(self.uis.value, value);
				__module__.Element.SetFieldValue(self.uis.label, self.getLabel(value));
				self.ui.toggleClass("has-value", ((value && true) || false));
				if (force || (previous_value != value)) {
					self.trigger("change", value);
					return true;
				} else {
					return false;
				}
			}
			return false;
		},
		
		setOptions: function(values, currentValue, callback) {
			var self = this;
			if (currentValue === undefined) {currentValue=undefined}
			if (callback === undefined) {callback=null}
			self.uis.options.filter(":not(.keep)").remove();
			self.uis.options = self.ui.find(".option:not(.template)");
			var opt_tmpl = self.ui.find(".option.template");
			if (opt_tmpl.length == 0) {
				opt_tmpl = __module__.$(html.li({"_":"option"}));
			}
			// Iterates over `values`. This works on array,objects and null/undefined
			var __ot=values;
			var __nt=__ot instanceof Array ? __ot : Object.getOwnPropertyNames(__ot||{});
			var __qt=__nt.length;
			for (var __pt=0;__pt<__qt;__pt++){
				var __mt=(__nt===__ot)?__pt:__nt[__pt];
				var value=__ot[__mt];
				// This is the body of the iteration with (value=value, key/index=__mt) in __ot
				var nui = opt_tmpl.clone().removeClass("template").addClass("actual");;
				var v = undefined;;
				var t = undefined;;
				if (extend.isString(value)) {
					v = value;
					t = value;
				} else if (extend.isMap(value)) {
					v = value.value;
					t = value.label;
				} else if (extend.isList(value)) {
					v = value[0];
					t = value[1];
				} else {
					extend.error(("Selector.setOptions: unsupported value " + value));
				};
				var ui_t = nui.find(".T");;
				if (ui_t.length == 0) {
					nui.attr("data-value", v).text(t);
				} else {
					nui.attr("data-value", v);
					ui_t.text(t);
				};
				if (callback) {
					callback(value, nui);
				};
				if (opt_tmpl.parent()) {
					opt_tmpl.parent().append(nui);
				} else {
					self.ui.append(nui);
				};
			}
			if (!self.updateOptions(self.getValue())) {
				self.trigger("change", self.getValue());
			}
			return self;
		},
		
		/**
		  * Handles a click on an option. This method will handle the cases
		  * for `options multiple` and `options empty`.
		  * 
		*/
		onOptionClick: function(sui) {
			var self = this;
			sui = __module__.$(sui);
			var value = sui.attr("data-value");
			if (self.options.autoupdate) {
				self.uis.options = self.ui.find(".option:not(.template)");
			}
			if (self.options.multiple) {
				if (self.isAllSelected() && self.options.allToSingle) {
					var value = sui.data("value");
					self.setValue([value]);
				} else {
					var selected = extend.reduce(self.uis.options.filter(".selected"), function(r, _, k) {
						if (_.getAttribute("data-value") != value) {
							r.push(_);
						}
					}, []);
					if ((extend.len(selected) == 0) && (!self.options.empty)) {
						sui.removeClass("selected");
					}
					if (!sui.hasClass("selected")) {
						selected.push(sui);
					}
					self.setValue(extend.map(selected, function(_) {
						return __module__.$(_).attr("data-value");
					}));
				}
			} else {
				if (sui.hasClass("selected") && self.options.empty) {
					self.setValue(null);
				} else {
					self.setValue(value);
				}
			}
			self.ui.addClass("clicked");
			self.clickDelayed.push();
		},
		
		/**
		  * Updates the `uis.options` by reading them from the DOM
		  * 
		*/
		updateOptions: function(currentValue) {
			var self = this;
			if (currentValue === undefined) {currentValue=self.getValue();}
			self.uis.options = self.ui.find(".option:not(.template)");
			return self.setValue(currentValue, true);
		},
		
		/**
		  * Gets the label for the given value
		  * 
		*/
		getLabel: function(value) {
			var self = this;
			var option = extend.first(self.uis.options, function(_) {
				return (__module__.$(_).attr("data-value") == value);
			});
			if (option) {
				option = __module__.$(option);
				return (option.attr("data-label") || option.text());
			} else {
				return value;
			}
		},
		
		getIndex: function(value) {
			var self = this;
			return extend.findLike(self.uis.options, function(_) {
				return (__module__.$(_).attr("data-value") == value);
			});
		}
	}
})
/**
  * A control that allows to autocomplete a field, optionally showing a menu
  * with the possible options.
  * 
*/
widgets.Autocomplete = extend.Class({
	name  :'widgets.Autocomplete',
	parent: __module__.Control,
	shared: {
		CSS_CLASS: "autocomplete",
		UIS: {"input":".in", "panel":".panel", "options":".options", "optionTmpl":".options .template"},
		OPTIONS: {"limit":10, "complete":null, "precomplete":true},
		SOUNDEX: {"en":{"a":"", "e":"", "i":"", "o":"", "u":"", "b":1, "f":1, "p":1, "v":1, "c":2, "g":2, "j":2, "k":2, "q":2, "s":2, "x":2, "z":2, "d":3, "t":3, "l":4, "m":5, "n":5, "r":6}}
	},
	properties: {
		completions:undefined,
		selected:undefined,
		_options:undefined,
		_updateTimeout:undefined,
		_value:undefined,
		_completions:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `completions`
		if (typeof(self.completions)=='undefined') {self.completions = null;};
		// Default value for property `selected`
		if (typeof(self.selected)=='undefined') {self.selected = undefined;};
		// Default value for property `_options`
		if (typeof(self._options)=='undefined') {self._options = {};};
		// Default value for property `_updateTimeout`
		if (typeof(self._updateTimeout)=='undefined') {self._updateTimeout = undefined;};
		// Default value for property `_value`
		if (typeof(self._value)=='undefined') {self._value = undefined;};
		// Default value for property `_completions`
		if (typeof(self._completions)=='undefined') {self._completions = undefined;};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Autocomplete.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.Autocomplete.getParent()).bindUI();
			self.uis.input.keydown(self.getMethod('onInputKeyDown') );
			self.uis.input.keypress(self.getMethod('onInputKeyPress') );
			self.uis.input.change(self.getMethod('onInputChange') );
			if (self.options.precomplete) {
				self.update();
			}
		},
		
		onInputKeyDown: function(event) {
			var self = this;
			if (event.keyCode == 27) {
				self.selectCompletion(0);
				self.uis.panel.addClass("hidden");
				return false;
			} else {
				self.uis.panel.removeClass("hidden");
			}
			if (event.keyCode == 38) {
				self.selectPreviousCompletion();
				self.uis.panel.removeClass("hidden");
				return false;
			} else if (event.keyCode == 40) {
				self.selectNextCompletion();
				self.uis.panel.removeClass("hidden");
				return false;
			} else if (event.keyCode == 13) {
				self.applyCompletion();
				self.uis.panel.removeClass("hidden");
				return false;
			} else if (event.keyCode == 27) {
				self.selectCompletion(0);
				self.uis.panel.addClass("hidden");
				return false;
			}
		},
		
		onInputKeyPress: function(event) {
			var self = this;
			self._triggerUpdate();
		},
		
		onInputChange: function(event) {
			var self = this;
			self._triggerUpdate();
		},
		
		_triggerUpdate: function() {
			var self = this;
			if (!extend.isDefined(self._updateTimeout)) {
				self._updateTimeout = window.setTimeout(function() {
					return self.update();
				}, 50);
			}
		},
		
		update: function() {
			var self = this;
			var value = self.getValue();
			if (value != self._value) {
				self._value = value;
				if (self.hasCompletions()) {
					var completions = self.complete(value);
					if (extend.cmp(self._completions, completions) != 0) {
						self._completions = completions;
						widgets.visualize(self._options, completions, self.getMethod('_renderOption') );
					}
				} else {
					self.uis.panel.addClass("hidden");
				}
			}
			if (extend.isDefined(self._updateTimeout)) {
				window.clearTimeout(self._updateTimeout);
				self._updateTimeout = undefined;
			}
			return self._completions;
		},
		
		selectNextCompletion: function() {
			var self = this;
			if (extend.isDefined(self.selected)) {
				return self.selectCompletion(((self.selected || 0) + 1));
			} else {
				return self.selectCompletion(0);
			}
		},
		
		selectPreviousCompletion: function() {
			var self = this;
			if (extend.isDefined(self.selected)) {
				return self.selectCompletion(((self.selected || 0) - 1));
			} else {
				return self.selectCompletion((self._options.count - 1));
			}
		},
		
		selectCompletion: function(i) {
			var self = this;
			if (extend.isNumber(i)) {
				if (i < 0) {
					i = (self._options.count + i);
				}
				i = (i % self._options.count);
			}
			var k = self._options.keys[i];
			if (i != self.selected) {
				if (extend.isDefined(self._options.keys[self.selected])) {
					self._options.all[self._options.keys[self.selected]].ui.removeClass("selected");
				}
				if (extend.isDefined(k)) {
					self._options.all[k].ui.addClass("selected");
				}
				self.selected = i;
			}
			return ((extend.isDefined(k) && self._options.all[k].ui) || null);
		},
		
		applyCompletion: function(selected) {
			var self = this;
			if (selected === undefined) {selected=self.selected}
			if (extend.isDefined(selected)) {
				var datum = self._options.all[self._options.keys[selected]].data;
				widgets.Element.SetFieldValue(self.uis.input, datum);
				var c = self.update();
				var i = extend.find(c, datum);
				if (i >= 0) {
					self.selectCompletion(i);
				} else {
					self.selectCompletion(undefined);
				}
			}
		},
		
		getValue: function() {
			var self = this;
			return self.uis.input.val();
		},
		
		getCompletions: function() {
			var self = this;
			return ((self.completions || __module__.COMPLETIONS[self.options.complete]) || []);
		},
		
		hasCompletions: function() {
			var self = this;
			return (extend.len(self.getCompletions()) > 0);
		},
		
		/**
		  * Returns the list of values that can complete the given value
		  * 
		*/
		complete: function(value) {
			var self = this;
			if (!value.trim()) {
				return [];
			}
			var v = value;
			var v_ci = v.toLowerCase();
			var exact = [];
			var exact_ci = [];
			var starting = [];
			var starting_ci = [];
			var containing = [];
			var containing_ci = [];
			var phonetic_ci = [];
			var v_phonetic = self.getClass().getOperation('Soundex')(v_ci);
			var count = 0;
			// Iterates over `((self.completions || __module__.COMPLETIONS[self.options.complete]) || [])`. This works on array,objects and null/undefined
			var __st=((self.completions || __module__.COMPLETIONS[self.options.complete]) || []);
			var __tt=__st instanceof Array ? __st : Object.getOwnPropertyNames(__st||{});
			var __vt=__tt.length;
			for (var __ut=0;__ut<__vt;__ut++){
				var __rt=(__tt===__st)?__ut:__tt[__ut];
				var c=__st[__rt];
				// This is the body of the iteration with (value=c, key/index=__rt) in __st
				c = ("" + c);
				var c_ci = c.toLowerCase();;
				if (c == v) {
					exact.push(c);
					count = (count + 1);
				} else if (c_ci == v_ci) {
					exact_ci.push(c);
					count = (count + 1);
				} else if (self.getClass().getOperation('Soundex')(c_ci) == v_phonetic) {
					phonetic_ci.push(c);
					count = (count + 1);
				} else if ((c.indexOf(v) == 0) || (v.indexOf(c) == 0)) {
					starting.push(c);
					count = (count + 1);
				} else if (c_ci.indexOf(v_ci) == 0) {
					starting_ci.push(c);
					count = (count + 1);
				} else if (c.indexOf(v) > 0) {
					containing.push(c);
					count = (count + 1);
				} else if (c_ci.indexOf(v_ci) > 0) {
					containing_ci.push(c);
					count = (count + 1);
				};
				if (count >= self.options.limit) {
					break
				};
			}
			return exact.concat(exact_ci).concat(phonetic_ci).concat(starting).concat(starting_ci).concat(containing).concat(containing_ci);
		},
		
		_renderOption: function(context, datum, index, nui) {
			var self = this;
			if (!nui) {
				nui = self.uis.optionTmpl.clone().removeClass("template").addClass("actual");
				self.uis.options.append(nui);
				nui.click(function() {
					self.uis.panel.addClass("hidden");
					return self.applyCompletion(index);
				});
				nui = {"ui":nui, "value":nui.find(".value"), "label":nui.find(".label"), "data":undefined};
			}
			nui.data = datum;
			nui.label.text(datum);
			return nui;
		}
	},
	operations:{
		Soundex: function( s, lang ){
			var self = this;
			if (lang === undefined) {lang="en"}
			var a = s.toLowerCase().split("");
			var f = a.shift();
			var r = "";
			r = (f + a.map(function(v, i, a) {
				return self.SOUNDEX[lang][v];
			}).filter(function(v, i, a) {
				if (i === 0) {
					return (!(v === self.SOUNDEX[lang][f]));
				} else {
					return (!(v === a[(i - 1)]));
				}
			}).join(""));
			return (r + "000").slice(0, 4).toUpperCase();
		}
	}
})
/**
  * A collection of functions to bind a composable editable list. The
  * list control's UI looks like the following:
  * 
  * ```
  * <div.list
  * <ul.elements
  * <li.when-empty:Empty
  * <li.template
  * <span.value.out(data-field=value):&mdash;
  * <button.do-remove:&times;
  * <button.do-moveUp:&uarr;
  * <button.do-moveDown:&darr;
  * <input.in-value(type=text)
  * <button.do-add:Add
  * ```
  * 
  * 
*/
widgets.List = extend.Class({
	name  :'widgets.List',
	parent: __module__.Control,
	shared: {
		CSS_CLASS: "list",
		UIS: {"tmpl":".template", "elements":"ul.elements", "input":".in-value", "add":".do-add", "whenEmpty":".when-empty"},
		EVENTS: ["added", "removed", "change"],
		OPTIONS: {"unique":true, "sorted":false}
	},
	properties: {
		on:undefined,
		processor:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `on`
		if (typeof(self.on)=='undefined') {self.on = events.create(self.getClass().EVENTS);};
		// Default value for property `processor`
		if (typeof(self.processor)=='undefined') {self.processor = null;};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.List.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.List.getParent()).bindUI();
			if (self.uis.input) {
				__module__.bindEvent(self.uis.input, "keypress", function(e) {
					if (extend.keys.match.RETURN(e) || extend.keys.match.ENTER(e)) {
						self.add();
						return false;
					}
				});
				__module__.triggerEvent(self.uis.input, "change");
				if (self.uis.add) {
					__module__.bindEvent(self.uis.add, "click", function() {
						return self.add(self.getInputValue());
					});
				}
			}
		},
		
		getInputValue: function() {
			var self = this;
			var value = null;
			if (self.uis.options.input) {
				if (extend.isFunction(self.uis.options.input)) {
					value = self.uis.options.input(self);
				} else {
					value = self.uis.options.input;
				}
			} else {
				value = self.uis.input.val();
			}
			return value;
		},
		
		setData: function(data) {
			var self = this;
			self.ui.find(".actual").remove();
			// Iterates over `data`. This works on array,objects and null/undefined
			var __xt=data;
			var __yt=__xt instanceof Array ? __xt : Object.getOwnPropertyNames(__xt||{});
			var __at=__yt.length;
			for (var __zt=0;__zt<__at;__zt++){
				var __wt=(__yt===__xt)?__zt:__yt[__zt];
				var _=__xt[__wt];
				// This is the body of the iteration with (value=_, key/index=__wt) in __xt
				self._addElement(_);
			}
			if ((extend.len(data) == 0) || (!data)) {
				self.uis.whenEmpty.removeClass("hidden");
			} else {
				self.uis.whenEmpty.addClass("hidden");
			}
		},
		
		getData: function() {
			var self = this;
			var actual = self.ui.find(".actual");
			if (extend.len(actual) == 0) {
				return null;
			} else {
				return extend.map(actual, function(_) {
					return __module__.Widget.Get(_).getData();
				});
			}
		},
		
		add: function(value) {
			var self = this;
			if (self.processor) {
				value = self.processor(value);
			}
			if (value && ((!self.options.unique) || (!self.hasValue(value)))) {
				var nui = self._addElement(value);
				self._updateValue();
				self.on.added.trigger(nui);
				self.on.change.trigger({"type":"added", "element":nui}, self);
			}
		},
		
		_addElement: function(value) {
			var self = this;
			var eui = self.uis.tmpl.clone().removeClass("template").addClass("actual");
			self.uis.elements.append(eui);
			var e = new __module__.Element(eui).setData(value);
			if (extend.isString(value)) {
				e.set("value", value);
			} else {
				e.set(value);
			}
			__module__.bindEvent(eui.find(".do-remove"), "click", function() {
				return self.removeElement(eui);
			});
			__module__.bindEvent(eui.find(".do-moveUp"), "click", function() {
				return self.moveUp(eui);
			});
			__module__.bindEvent(eui.find(".do-moveDown"), "click", function() {
				return self.moveDown(eui);
			});
			if (self.uis.input) {
				self.uis.input.val("").focus().select();
			}
			return eui;
		},
		
		removeElement: function(eui) {
			var self = this;
			eui.remove();
			self._updateValue();
			self.on.removed.trigger(eui);
			self.on.change.trigger({"type":"removed", "element":eui}, self);
		},
		
		moveUp: function(eui) {
			var self = this;
			if (eui.prev()) {
				eui.prev().before(eui);
				self._updateValue();
				self.on.change.trigger({"type":"up", "element":eui}, self);
			}
		},
		
		moveDown: function(eui) {
			var self = this;
			if (eui.next()) {
				eui.next().after(eui);
				self._updateValue();
				self.on.change.trigger({"type":"down", "element":eui}, self);
			}
		},
		
		hasValue: function(value) {
			var self = this;
			var elements = self.ui.find(".actual");
			var same = extend.findLike(elements, function(_) {
				return (__module__.Widget.Get(_).getData() == value);
			});
			return (same >= 0);
		},
		
		_updateValue: function() {
			var self = this;
			var elements = extend.map(self.ui.find(".actual"), function(_) {
				return __module__.Widget.Get(_).getData();
			});
			if (self.options.sorted) {
				elements = extend.sorted(elements);
			}
			self.setData(elements);
		},
		
		getValue: function() {
			var self = this;
			var elements = self.getData();
			if (extend.len(elements) > 0) {
				return JSON.stringify(elements);
			} else {
				return "";
			}
		},
		
		findElement: function(value) {
			var self = this;
			if (extend.isFunction(value)) {
				return extend.first(self.ui.find(".actual"), function(_, i) {
					var w = __module__.Widget.Get(_);
					return value(w.getData(), i, w);
				});
			} else {
				return extend.first(self.ui.find(".actual"), function(_) {
					return (__module__.Widget.Get(_).getData() == value);
				});
			}
		},
		
		getElement: function(index) {
			var self = this;
			return self.ui.find(".actual")[index];
		},
		
		setValue: function(value) {
			var self = this;
			if (extend.isString(value)) {
				value = JSON.parse(value);
			}
			if (!value) {
				self.setData(null);
			} else {
				self.setData(value);
			}
		}
	}
})

widgets.Layout = extend.Class({
	name  :'widgets.Layout',
	parent: undefined,
	properties: {
		ui:undefined,
		items:undefined
	},
	initialize: function( ui ){
		var self = this;
		// Default initialization of property `ui`
		if (typeof(self.ui)=='undefined') {self.ui = undefined;};
		// Default initialization of property `items`
		if (typeof(self.items)=='undefined') {self.items = [];};
		self.ui = __module__.$(ui);
		self.ui[0]._layout = self;
		self.items = extend.map(self.ui.find(".L"), function(_) {
			_ = __module__.$(_);
			data = _.data("layout");
			var layout_desc = data.split(":");
			var layout = layout_desc[0];
			if (layout_desc.length > 1) {
				layout_desc = layout_desc[1];
			} else {
				layout_desc = undefined;
			}
			return {"ui":_, "desc":layout_desc, "layout":layout};
		});
		self.ui[0]._layout = self;
		window.setTimeout(self.getMethod('relayout') , 0);
	},
	methods: {
		relayout: function() {
			var self = this;
			var w = self.ui.width();
			var h = self.ui.height();
			// Iterates over `self.items`. This works on array,objects and null/undefined
			var __ct=self.items;
			var __dt=__ct instanceof Array ? __ct : Object.getOwnPropertyNames(__ct||{});
			var __ft=__dt.length;
			for (var __et=0;__et<__ft;__et++){
				var __bt=(__dt===__ct)?__et:__dt[__et];
				var item=__ct[__bt];
				// This is the body of the iteration with (value=item, key/index=__bt) in __ct
				if (item.layout == "centered") {
					self.center(item.ui, w, h, item.desc);
				} else if (item.layout == "stick") {
					self.stick(item.ui, w, h, item.desc);
				} else {
					extend.error("Unknown layout:", item.layout);
				};
			}
		},
		
		center: function(tui, width, height) {
			var self = this;
			var w = tui.width();
			var h = tui.height();
			tui.css("position", "relative");
			tui.css("left", ((width - w) / 2));
			tui.css("top", ((height - h) / 2));
		},
		
		stick: function(tui, width, height, data) {
			var self = this;
			var w = tui.width();
			var h = tui.height();
			var o = tui.position();
			// Iterates over `data.split(",")`. This works on array,objects and null/undefined
			var __ht=data.split(",");
			var __iu=__ht instanceof Array ? __ht : Object.getOwnPropertyNames(__ht||{});
			var __ku=__iu.length;
			for (var __ju=0;__ju<__ku;__ju++){
				var __gt=(__iu===__ht)?__ju:__iu[__ju];
				var stick_to=__ht[__gt];
				// This is the body of the iteration with (value=stick_to, key/index=__gt) in __ht
				var from_to = stick_to.split("-");;
				var t = from_to;;
				var f = t[0];;
				t = t[1];
				if (f == "S") {
					if (t == "S") {
						tui.css("height", (height - o.top));
					}
				};
			}
		}
	},
	operations:{
		Ensure: function( ui ){
			var self = this;
			var layout = __module__.$(ui)._layout;
			if (!layout) {
				layout = new __module__.Layout(ui);
			}
			return layout;
		}
	}
})
widgets.clearSelection = function(){
	var self = widgets;
	if (window.getSelection) {
		window.getSelection().removeAllRanges();
	} else if (document.selection) {
		document.selection.empty();
	}
}
widgets.show = function(selector){
	var self = widgets;
	__module__.$(selector).removeClass("hidden");
}
widgets.hide = function(selector){
	var self = widgets;
	__module__.$(selector).addClass("hidden");
}
widgets.toggle = function(toShow, toHide){
	var self = widgets;
	toHide = extend.sliceArguments(arguments,1)
	__module__.show(toShow);
	// Iterates over `toHide`. This works on array,objects and null/undefined
	var __ou=toHide;
	var __nu=__ou instanceof Array ? __ou : Object.getOwnPropertyNames(__ou||{});
	var __qu=__nu.length;
	for (var __pu=0;__pu<__qu;__pu++){
		var __mu=(__nu===__ou)?__pu:__nu[__pu];
		var __lu=__ou[__mu];
		// This is the body of the iteration with (value=__lu, key/index=__mu) in __ou
		__module__.hide(__lu, __mu, __ou)
	}
}
widgets.getUIWidgetClass = function(selector){
	var self = widgets;
	var widget_class_name = (__module__.$(selector).attr("widget") || __module__.$(selector).attr("data-widget"));
	if (widget_class_name) {
		var res = eval((("(" + widget_class_name) + ")"));
		!(res) && extend.assert(false, "widgets.getUIWidgetClass:", ("widgets.getUIWidgetClass: Could not resolve class " + widget_class_name), "(failed `res`)");
		return res;
	} else {
		return undefined;
	}
}
/**
  * Automatically binds the widges in the given selector the given selector
  * 
*/
widgets.autobind = function(selector){
	var self = widgets;
	// Iterates over `__module__.$(selector)`. This works on array,objects and null/undefined
	var __su=__module__.$(selector);
	var __tu=__su instanceof Array ? __su : Object.getOwnPropertyNames(__su||{});
	var __vu=__tu.length;
	for (var __uu=0;__uu<__vu;__uu++){
		var __ru=(__tu===__su)?__uu:__tu[__uu];
		var sel=__su[__ru];
		// This is the body of the iteration with (value=sel, key/index=__ru) in __su
		sel = __module__.$(sel);
		if (sel.attr("data-autobind") != "false") {
			var widget_class = __module__.getUIWidgetClass(selector);
			if (extend.isDefined(widget_class)) {
				if (widget_class.isSubclassOf(__module__.Widget)) {
					widget_class.Bind(sel);
				} else {
					extend.error(("Class must be a widget subclass: " + widget_class.getName()));
				}
			} else {
				var widget_class_name = (__module__.$(selector).attr("widget") || __module__.$(selector).attr("data-widget"));
				extend.error((((("Cannot resolve widget class for " + selector) + " (") + widget_class_name) + ")"));
			}
		};
	}
}
widgets.bindExpandables = function(selector){
	var self = widgets;
	if (selector === undefined) {selector=document}
	// Iterates over `__module__.$(".is-expandable", selector)`. This works on array,objects and null/undefined
	var __xu=__module__.$(".is-expandable", selector);
	var __yu=__xu instanceof Array ? __xu : Object.getOwnPropertyNames(__xu||{});
	var __au=__yu.length;
	for (var __zu=0;__zu<__au;__zu++){
		var __wu=(__yu===__xu)?__zu:__yu[__zu];
		var ui=__xu[__wu];
		// This is the body of the iteration with (value=ui, key/index=__wu) in __xu
		ui = __module__.$(ui);
		var toggle = (function(ui){return (function() {
			return toggleState("expanded", ui);
		})}(ui));;
		__module__.bindEvent(ui.find(".do-toggle"), "click", toggle);
	}
}
widgets.bindSelector = function(selector){
	var self = widgets;
	if (selector === undefined) {selector=document}
	if (__module__.$(selector).hasClass(__module__.Selector.CSS_CLASS)) {
		return __module__.Selector.Bind(selector);
	} else {
		return false;
	}
}
/**
  * CSS classes for the option:
  * 
  * - `is-multiple`    to allow multiple selections
  * - `no-0`           prevents the selector from being empty
  * - `no-N`           blanks the selection when all selected
  * 
*/
widgets.bindSelectors = function(selector){
	var self = widgets;
	if (selector === undefined) {selector=document}
	var res = __module__.bindSelector(selector);
	if (!res) {
		var res = [];
		// Iterates over `__module__.$(".select:not(.template)", selector)`. This works on array,objects and null/undefined
		var __cu=__module__.$(".select:not(.template)", selector);
		var __du=__cu instanceof Array ? __cu : Object.getOwnPropertyNames(__cu||{});
		var __fu=__du.length;
		for (var __eu=0;__eu<__fu;__eu++){
			var __bu=(__du===__cu)?__eu:__du[__eu];
			var _=__cu[__bu];
			// This is the body of the iteration with (value=_, key/index=__bu) in __cu
			res = res.concat(__module__.bindSelectors(_));
		}
		return res;
	} else {
		return [res];
	}
}
widgets.bindList = function(selector){
	var self = widgets;
	if (selector === undefined) {selector=document}
	if (__module__.$(selector).hasClass(__module__.List.CSS_CLASS)) {
		return __module__.List.Bind(selector);
	} else {
		return false;
	}
}
widgets.bindLists = function(selector){
	var self = widgets;
	if (selector === undefined) {selector=document}
	var res = __module__.bindList(selector);
	if (!res) {
		var res = [];
		// Iterates over `__module__.$(".list:not(.template)", selector)`. This works on array,objects and null/undefined
		var __hu=__module__.$(".list:not(.template)", selector);
		var __iv=__hu instanceof Array ? __hu : Object.getOwnPropertyNames(__hu||{});
		var __kv=__iv.length;
		for (var __jv=0;__jv<__kv;__jv++){
			var __gu=(__iv===__hu)?__jv:__iv[__jv];
			var _=__hu[__gu];
			// This is the body of the iteration with (value=_, key/index=__gu) in __hu
			res = res.concat(__module__.bindSelectors(_));
		}
		return res;
	} else {
		return [res];
	}
}
widgets.bindAutocomplete = function(ui){
	var self = widgets;
	ui = __module__.$(ui);
	if (ui.length > 0) {
		return __module__.Autocomplete.Bind(ui);
	} else {
		return null;
	}
}
widgets.bindI18N = function(container, field){
	var self = widgets;
	container = __module__.$(container).filter(__module__.I18NField.CSS_CLASS);
	if (container.length > 0) {
		return __module__.I18NField.Bind(container);
	} else {
		return false;
	}
}
widgets.bindField = function(ui){
	var self = widgets;
	var _ = __module__.$(ui);
	if (_.is("input") || ((_.is("textarea") && (_.attr("type") != "password")) && (_.parents("template").length == 0))) {
		__module__.Field.Bind(_);
	}
}
widgets.bindFields = function(selector){
	var self = widgets;
	if (selector === undefined) {selector=document}
	// Iterates over `__module__.$(".in", selector)`. This works on array,objects and null/undefined
	var __ov=__module__.$(".in", selector);
	var __nv=__ov instanceof Array ? __ov : Object.getOwnPropertyNames(__ov||{});
	var __qv=__nv.length;
	for (var __pv=0;__pv<__qv;__pv++){
		var __mv=(__nv===__ov)?__pv:__nv[__pv];
		var __lv=__ov[__mv];
		// This is the body of the iteration with (value=__lv, key/index=__mv) in __ov
		__module__.bindField(__lv, __mv, __ov)
	}
}
widgets.bindBehaviours = function(selector){
	var self = widgets;
	if (selector === undefined) {selector=document}
	__module__.bindExpandables();
	__module__.bindSelectors();
	__module__.bindLists();
	__module__.bindFields();
}
widgets.bindLayouts = function(selector){
	var self = widgets;
	if (selector === undefined) {selector=document}
	// Iterates over `__module__.$(selector).find(".layout")`. This works on array,objects and null/undefined
	var __sv=__module__.$(selector).find(".layout");
	var __tv=__sv instanceof Array ? __sv : Object.getOwnPropertyNames(__sv||{});
	var __vv=__tv.length;
	for (var __uv=0;__uv<__vv;__uv++){
		var __rv=(__tv===__sv)?__uv:__tv[__uv];
		var _=__sv[__rv];
		// This is the body of the iteration with (value=_, key/index=__rv) in __sv
		new __module__.Layout(_);
	}
}
/**
  * Ensures that the widgets module is properly initialized
  * 
*/
widgets.initialize = function(){
	var self = widgets;
	if (__module__.CACHE.isInitialized) {
		return false;
	}
	__module__.CACHE.isInitialized = true;
	if (window.interaction) {
		__module__.CACHE.pressGesture = new interaction.Press();
		__module__.HANDLERS.click = {"bind":function(scope, callback, capture) {
			var wrapper = function(e) {
				if (__module__.$.event && __module__.$.event.fix) {
					__module__.$.event.fix(e);
				}
				return callback.apply(scope, [e]);
			};
			callback._callbackWrappers = (callback._callbackWrappers || []);
			callback._callbackWrappers.push(wrapper);
			return __module__.CACHE.pressGesture.bind(scope, {"press":wrapper});
		}, "trigger":function(scope, event) {
			var handlers = __module__.CACHE.pressGesture.getHandlers(scope);
			return __module__.CACHE.pressGesture._trigger(handlers, "press", event);
		}, "unbind":function(scope, callback) {
			return __module__.CACHE.PressGesture.unbind(scope, callback);
		}};
	}
}
/**
  * Binds the given list of widget classes, jQuery expression or list
  * of nodes.
  * 
*/
widgets.bind = function(widgetClasses, skipTemplates){
	var self = widgets;
	if (widgetClasses === undefined) {widgetClasses=[]}
	if (skipTemplates === undefined) {skipTemplates=true}
	__module__.initialize();
	__module__.bindBehaviours();
	__module__.bindLayouts();
	if (extend.isString(widgetClasses)) {
		if (widgetClasses == "*") {
			widgetClasses = ".widget";
		}
		widgetClasses = __module__.$(widgetClasses);
	} else if (__module__.isNode(widgetClasses)) {
		widgetClasses = [widgetClasses];
	}
	var matched = [];
	// Iterates over `widgetClasses`. This works on array,objects and null/undefined
	var __wv=widgetClasses;
	var __xv=__wv instanceof Array ? __wv : Object.getOwnPropertyNames(__wv||{});
	var __zv=__xv.length;
	for (var __yv=0;__yv<__zv;__yv++){
		var i=(__xv===__wv)?__yv:__xv[__yv];
		var _=__wv[i];
		// This is the body of the iteration with (value=_, key/index=i) in __wv
		if (__module__.isElement(_)) {
			_ = __module__.$(_);
			if ((!skipTemplates) || ((_.parents(".template").length == 0) && (!_.hasClass("template")))) {
				matched.push({"priority":(parseInt(_.attr("data-priority")) || 0), "ui":_});
			}
			matched.sort(function(a, b) {
				return (a.priority < b.priority);
			});
			// Iterates over `matched`. This works on array,objects and null/undefined
			var __bv=matched;
			var __cv=__bv instanceof Array ? __bv : Object.getOwnPropertyNames(__bv||{});
			var __ev=__cv.length;
			for (var __dv=0;__dv<__ev;__dv++){
				var __av=(__cv===__bv)?__dv:__cv[__dv];
				var __fv=__bv[__av];
				// This is the body of the iteration with (value=__fv, key/index=__av) in __bv
				(function(_){__module__.autobind(_.ui);}(__fv))
			}
		} else if (_.isSubclassOf && _.isSubclassOf(__module__.Widget)) {
			_.BindAll();
		} else {
			extend.error(((("widgets.bind: Unsupported parameter #" + i) + ":") + _));
		};
	}
	return matched;
}
widgets.init = function(){
	var self = widgets;
	if (typeof(markdown) != "undefined") {
		__module__.FORMATTERS.markdown = markdown.toHTML;
	}
}
if (typeof(widgets.init)!="undefined") {widgets.init();}

// START:VANILLA_POSTAMBLE
return widgets;})(widgets);
// END:VANILLA_POSTAMBLE
