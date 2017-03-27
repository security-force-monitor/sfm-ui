// 8< ---[sharing.js]---
// START:VANILLA_PREAMBLE
var sharing=typeof(extend)!='undefined' ? extend.module('sharing') : (typeof(sharing)!='undefined' ? sharing : {});
(function(sharing){
var __module__=sharing;
// END:VANILLA_PREAMBLE

sharing.__VERSION__='1.5.6';
sharing.HTTP = new channels.AsyncChannel({"JSONP":true});
sharing.$ = (((typeof(jQuery) != "undefined") && jQuery) || extend.modules.select);
sharing.QUERY_URLS = {"facebook":"https://graph.facebook.com/fql?q=SELECT%20url,%20normalized_url,%20share_count,%20like_count,%20comment_count,%20total_count,commentsbox_count,%20comments_fbid,%20click_count%20FROM%20link_stat%20WHERE%20url=%27${URL}%27", "twitter":"http://cdn.api.twitter.com/1/urls/count.json?", "digg":"http://services.digg.com/2.0/story.getInfo?links=${URL}&type=javascript", "delicious":"http://feeds.delicious.com/v2/json/urlinfo/data?url=${URL}", "linkedin":"http://www.linkedin.com/countserv/count/share?format=jsonp&url=${URL}", "pinterest":"http://api.pinterest.com/v1/urls/count.json?url=${URL}"};
sharing.QUERY_EXTRACTORS = {"delicious":function(_) {
	return (_[0] && _[0].total_posts);
}, "facebook":function(_) {
	return ((_.data && _.data[0]) && _.data[0].share_count);
}, "linkedin":function(_) {
	return _.count;
}, "pinterest":function(_) {
	return _.count;
}, "twitter":function(_) {
	return _.count;
}};
sharing.SHARE_URLS = {"googleplus":function(url, options) {
	return ("https://plus.google.com/share?" + channels.encode({"url":url, "hl":options.lang}));
}, "facebook":function(url, options) {
	return ("http://www.facebook.com/sharer/sharer.php?" + channels.encode({"u":url, "p[title]":options.title, "p[summary]":options.text}));
}, "twitter":function(url, options) {
	return ("https://twitter.com/intent/tweet?" + channels.encode({"url":url, "text":(options.text || options.title), "via":options.via}, true));
}, "delicious":function(url, options) {
	return ("http://www.delicious.com/save?noui&jump=close&" + channels.encode({"url":url, "title":options.title, "v":5}));
}, "linkedin":function(url, options) {
	return ("https://www.linkedin.com/shareArticle?mini=true&" + channels.encode({"url":url, "title":options.title, "source":options.via, "summary":options.text}, false));
}, "pinterest":function(url, options) {
	return ("http://pinterest.com/pin/create/button/?" + channels.encode({"url":url, "media":options.media, "description":options.text}));
}, "email":function(url, options) {
	return ((("mailto:" + options.recipient) + "?") + channels.encode({"subject":(options.title || options.url), "body":(((options.text && (options.text + "\r\n\r\n")) || "") + options.url)}));
}};
sharing.SHARE_WINDOWS = {"facebook":[350, 200], "linkedin":[350, 350], "delicious":[350, 500], "googleplus":[350, 500]};
/**
  * A class that can be used to wrap a DOM node, given as the `ui` parameter. The
  * sharer support the following attributes, which all have to be specified
  * in as `data-ATTRIBUTE` attributes.
  * 
  * - `url`   the URL to be shared, which will default to the current URL
  * - `title` the title of the page to be shared (by default, the page's title)
  * - `text`  the text to be displayed in the sharer
  * - `via`   the network-specific username do be displayed as the source
  * 
  * The sharer will look for nodes with `[data-network=NETWORK]` where `NETWORK`
  * is one of the values in the table below. Each network can have dedicated
  * sharing options (specified as `data-ATTRIBUTE` attributes) which will
  * default to the options defined globally for the sharer widget.
  * 
  * Also, note that the options will be dynamically retrieved/udpated when
  * the user clicks on one of the network nodes, so you can safely update
  * the `data-ATTTRIBUTES`.
  * 
  * =============================================================================
  * NETWORK    | ATTRIBUTES (by order of importance)
  * =============================================================================
  * googleplus | url
  * -----------------------------------------------------------------------------
  * facebook   | url, text
  * -----------------------------------------------------------------------------
  * twitter    | text|title, url, via
  * -----------------------------------------------------------------------------
  * linkedin   | url, title, text, via
  * -----------------------------------------------------------------------------
  * email      | url, title, text
  * -----------------------------------------------------------------------------
  * 
  * References:
  * - http://ar.zu.my/how-to-really-customize-the-deprecated-facebook-sharer-dot-php/
  * 
*/
sharing.Sharer = extend.Class({
	name  :'sharing.Sharer',
	parent: undefined,
	shared: {
		OPTIONS: {"lang":"en", "text":undefined, "media":undefined, "title":undefined, "summary":undefined, "via":undefined, "url":window.location.href, "recipient":"user@domain.com"}
	},
	properties: {
		ui:undefined,
		uis:undefined
	},
	initialize: function( ui ){
		var self = this;
		// Default initialization of property `ui`
		if (typeof(self.ui)=='undefined') {self.ui = undefined;};
		// Default initialization of property `uis`
		if (typeof(self.uis)=='undefined') {self.uis = {"title":jQuery("head title")};};
		self.ui = __module__.$(ui);
		self.bindUI();
	},
	methods: {
		bindUI: function() {
			var self = this;
			// Iterates over `self.ui.find("*[data-network]")`. This works on array,objects and null/undefined
			var __k=self.ui.find("*[data-network]");
			var __l=__k instanceof Array ? __k : Object.getOwnPropertyNames(__k||{});
			var __o=__l.length;
			for (var __m=0;__m<__o;__m++){
				var __j=(__l===__k)?__m:__l[__m];
				var __i=__k[__j];
				// This is the body of the iteration with (value=__i, key/index=__j) in __k
				self.getMethod('_bindNetwork') (__i, __j, __k)
			}
		},
		
		/**
		  * Binds the given network using the given node
		  * 
		*/
		_bindNetwork: function(nui) {
			var self = this;
			nui = __module__.$(nui);
			var name = nui.attr("data-network");
			if (name) {
				self.uis[name] = nui;
				if (name == "email") {
					nui.find("input").change(self.getMethod('_onEmailInputChanged') );
				}
				widgets.bindEvent(nui, "click", function() {
					return self.share(name, self.getOptions(name));
				});
			}
		},
		
		share: function(network, options) {
			var self = this;
			if (options === undefined) {options=self.getOptions(network);}
			return sharing.share(network, options);
		},
		
		/**
		  * Custom handler for upda
		  * 
		*/
		_onEmailInputChanged: function() {
			var self = this;
			var a = self.uis.email.find("a");
			var opt = self.getOptions("email");
			var url = opt.url;
			if (!extend.isDefined(url)) {
				url = window.location.href;
			}
			a.attr({"target":(a.attr("target") || "_blank"), "href":__module__.SHARE_URLS.email(url, opt)});
		},
		
		getOptions: function(network) {
			var self = this;
			if (network === undefined) {network=undefined}
			if (network) {
				var network_options = self.getLocalOptions(self.uis[network]);
				var global_options = self.getOptions();
				return extend.merge(global_options, network_options, true);
			} else {
				var o = {};
				// Iterates over `self.getClass().OPTIONS`. This works on array,objects and null/undefined
				var __n=self.getClass().OPTIONS;
				var __p=__n instanceof Array ? __n : Object.getOwnPropertyNames(__n||{});
				var __r=__p.length;
				for (var __q=0;__q<__r;__q++){
					var k=(__p===__n)?__q:__p[__q];
					var v=__n[k];
					// This is the body of the iteration with (value=v, key/index=k) in __n
					if (extend.isFunction(v)) {
						o[k] = v(k, self);
					} else {
						o[k] = v;
					};
				}
				return extend.merge(o, self.getLocalOptions(self.ui), true);
			}
		},
		
		getLocalOptions: function(scope) {
			var self = this;
			res = {};
			if (scope) {
				// Iterates over `extend.keys(self.getClass().OPTIONS)`. This works on array,objects and null/undefined
				var __t=extend.keys(self.getClass().OPTIONS);
				var __u=__t instanceof Array ? __t : Object.getOwnPropertyNames(__t||{});
				var __w=__u.length;
				for (var __v=0;__v<__w;__v++){
					var __s=(__u===__t)?__v:__u[__v];
					var o=__t[__s];
					// This is the body of the iteration with (value=o, key/index=__s) in __t
					if ((o == "lang") && scope.attr("lang")) {
						res[o] = scope.attr("lang");
					};
					if (extend.isDefined(scope.attr(("data-" + o)))) {
						res[o] = scope.attr(("data-" + o));
					};
				}
			}
			return res;
		}
	}
})
/**
  * Binds a new sharer widget to the given UI. The sharer can be directly
  * retrieved throught the `_sharer` property. If a `Sharer` was already
  * bound, this will return the sharer.
  * 
*/
sharing.bind = function(ui){
	var self = sharing;
	if (ui.jquery) {
		ui = ui[0];
	}
	if (!ui._sharer) {
		ui._sharer = new __module__.Sharer(ui);
	}
	return ui._sharer;
}
sharing.shareURL = function(network, options){
	var self = sharing;
	var sharer = __module__.SHARE_URLS[network];
	!(sharer) && extend.assert(false, "sharing.shareURL:", ("sharing.share: Cannot find share URL for " + network), "(failed `sharer`)");
	var o = {};
	// Iterates over `options`. This works on array,objects and null/undefined
	var __x=options;
	var __y=__x instanceof Array ? __x : Object.getOwnPropertyNames(__x||{});
	var __a=__y.length;
	for (var __z=0;__z<__a;__z++){
		var k=(__y===__x)?__z:__y[__z];
		var v=__x[k];
		// This is the body of the iteration with (value=v, key/index=k) in __x
		if (extend.isDefined(v)) {
			o[k] = v;
		};
	}
	if (!extend.isDefined(o.url)) {
		o.url = window.location.href;
	}
	if (!o.title) {
		o.title = __module__.$("head title").text();
	}
	if ((o.url && (o.url.length > 0)) && ((o.url || "").indexOf("://") == -1)) {
		var base = extend.slice(("" + window.location).split("#")[0].split("/"),0,-1).join("/");
		o.url = ((base + "/") + o.url);
	}
	return sharer(o.url, o);
}
/**
  * Share the given `data` over the given network. This will pop-up a share
  * window.
  * 
  * The options are:
  * 
  * - `url`    the URL to be shared (defaults to `window.location.href`)
  * - `text`   the sharing text description
  * - `title`  the title of the sharing box (linkedin only)
  * - `id`     the origin id                (twitter id, linkedin id)
  * - `media`  an image URL                 (pinterest only)
  * 
*/
sharing.share = function(network, options){
	var self = sharing;
	var url = __module__.shareURL(network, options);
	if (network == "email") {
		window.location = url;
	} else {
		var size = (__module__.SHARE_WINDOWS[network] || [350, 250]);
		window.open(url, network, ((("menubar=1,resizable=1,width=" + size[0]) + ",height=") + size[1]));
	}
	return url;
}
/**
  * Query the number of shares of the specific URL on the given network(s) (all
  * networks by default). This will return a `channels.Future` instance with
  * a map of `{<NETWORK>:<NETWORK DATA>}` where the network data is the raw
  * data returned by the network API.
  * 
  * If you'd like to have the count, you should use `getCount`
  * 
*/
sharing.query = function(url, network){
	var self = sharing;
	if (network === undefined) {network=null}
	!(url) && extend.assert(false, "sharing.query:", "sharing.query: URL is not defined", "(failed `url`)");
	if (extend.isString(network)) {
		if (extend.isDefined(__module__.QUERY_URLS[network])) {
			if (url.indexOf("://") == -1) {
				url = ("http://" + url);
			}
			var query_url = __module__.QUERY_URLS[network];
			query_url = query_url.replace("${URL}", encodeURIComponent(url));
			return __module__.HTTP.get(query_url);
		} else {
			return new channels.Future().fail(("sharing: network not supported " + network));
		}
	} else if (extend.isList(network) || extend.isMap(network)) {
		var result = {};
		var rdv = new channels.RendezVous();
		var is_list = extend.isList(network);
		// Iterates over `network`. This works on array,objects and null/undefined
		var __b=network;
		var __c=__b instanceof Array ? __b : Object.getOwnPropertyNames(__b||{});
		var __e=__c.length;
		for (var __d=0;__d<__e;__d++){
			var k=(__c===__b)?__d:__c[__d];
			var v=__b[k];
			// This is the body of the iteration with (value=v, key/index=k) in __b
			var f = null;;
			var k = ((is_list && v) || k);;
			rdv.increaseExpected();
			__module__.query(url, k).onSucceed((function(k){return (function(value) {
				result[k] = value;
				return rdv.join();
			})}(k))).onFail(rdv.getMethod("join"));
		}
		var future = new channels.Future();
		rdv.onMeet(function() {
			return future.set(result);
		});
		return future;
	} else {
		return __module__.query(url, __module__.QUERY_URLS);
	}
}
/**
  * Same as `query` but instead of returning all the data given by the network,
  * it just returns the count.
  * 
*/
sharing.getCount = function(url, network){
	var self = sharing;
	if (network === undefined) {network=null}
	if (extend.isString(network)) {
		return __module__.query(url, network).process(function(value) {
			return __module__.QUERY_EXTRACTORS[network](value);
		});
	} else {
		return __module__.query(url, network).process(function(value) {
			// Iterates over `value`. This works on array,objects and null/undefined
			var __f=value;
			var __g=__f instanceof Array ? __f : Object.getOwnPropertyNames(__f||{});
			var __ij=__g.length;
			for (var __h=0;__h<__ij;__h++){
				var k=(__g===__f)?__h:__g[__h];
				var v=__f[k];
				// This is the body of the iteration with (value=v, key/index=k) in __f
				value[k] = __module__.QUERY_EXTRACTORS[k](v);
			}
			return value;
		});
	}
}
sharing.init = function(){
	var self = sharing;
}
if (typeof(sharing.init)!="undefined") {sharing.init();}

// START:VANILLA_POSTAMBLE
return sharing;})(sharing);
// END:VANILLA_POSTAMBLE
