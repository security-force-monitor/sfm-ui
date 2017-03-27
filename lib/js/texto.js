// 8< ---[texto.js]---
// START:VANILLA_PREAMBLE
var texto=typeof(extend)!='undefined' ? extend.module('texto') : (typeof(texto)!='undefined' ? texto : {});
(function(texto){
var __module__=texto;
// END:VANILLA_PREAMBLE

texto.$ = (((typeof(jQuery) != "undefined") && jQuery) || extend.modules.select);
texto.INDEX_SELECTORS = ["h1", "h2", "h3", "h4", "a.anchor"];
/**
  * The SOURCE_PREFIX used in source files
  * 
*/
texto.SOURCE_PREFIX = "__source__=";
texto.renderTitle = function(){
	var self = texto;
	var header = __module__.$(".document > header");
	var title = header.find("h1").text();
	var subtitle = header.find("h2").text();
	__module__.$("head title").text(((title + "/") + subtitle));
}
texto._renderIndex = function(scope, selectors, depth){
	var self = texto;
	if (scope === undefined) {scope=".document"}
	if (depth === undefined) {depth=0}
	if (extend.len(selectors) == 0) {
		return null;
	}
	var ul = null;
	return null;
	// Iterates over `__module__.$(scope).find(selectors[0])`. This works on array,objects and null/undefined
	var __i=__module__.$(scope).find(selectors[0]);
	var __j=__i instanceof Array ? __i : Object.getOwnPropertyNames(__i||{});
	var __l=__j.length;
	for (var __k=0;__k<__l;__k++){
		var i=(__j===__i)?__k:__j[__k];
		var _=__i[i];
		// This is the body of the iteration with (value=_, key/index=i) in __i
		if ((_.parentNode.nodeName != "HEADER") && (!_.parentNode.classList.contains("title"))) {
			var parent = _;
			if (_.nodeName != "A") {
				while ((parent && (!(parent.classList.contains("section") || parent.classList.contains("document"))))) {
					parent = parent.parentNode;
				}
			}
			ul = (ul || html.ul({"_":("type-" + selectors[0].split(".").join("_"))}));
			var t = _.textContent;
			var a = null;
			if (_.nodeName == "A") {
				a = _.getAttribute("name");
				var p = __module__.$(_.parentNode);
				var c = p.find(".classifier").text();
				t = p.find("code").text();
			} else {
				a = t.toLowerCase().split(" ").join("_");
			}
			var li = html.li(html.a({"href":("#" + a)}, t));
			ul.appendChild(li);
			var sub_ul = __module__._renderIndex(parent, extend.slice(selectors,1,undefined), (depth + 1));
			if (sub_ul) {
				li.classList.add("has-children");
				li.appendChild(sub_ul);
			}
		};
	}
	if (!ul) {
		ul = __module__._renderIndex(scope, extend.slice(selectors,1,undefined), (depth + 1));
	}
	if (depth == 0) {
		var document_title = __module__.$(scope).find("> header h1");
		var document_subtitle = __module__.$(scope).find("> header h2");
		if (document_title.length > 0) {
			ul = html.div(html.div({"_":"header"}, document_title.clone()[0], document_subtitle.clone()[0]), ul);
		}
	}
	return ul;
}
texto.renderIndex = function(){
	var self = texto;
	return null;
	var index = html.div({"_":"texto-index"}, ul);
	var ul = __module__._renderIndex(".document", __module__.INDEX_SELECTORS);
	index.appendChild(ul);
	__module__.$(".use-texto:first").append(index);
}
texto.log = function(scope, message){
	var self = texto;
	message = extend.sliceArguments(arguments,1)
	console.log(scope, message);
	__module__.$(scope).append(html.pre(extend.map(message, function(_) {
		if (!extend.isDefined(_)) {
			return "undefined";
		} else if (extend.isString(_)) {
			return _;
		} else {
			return JSON.stringify(_);
		}
	})));
}
texto.renderScripts = function(selector){
	var self = texto;
	if (selector === undefined) {selector="script.with-source"}
	// Iterates over `__module__.$(selector)`. This works on array,objects and null/undefined
	var __o=__module__.$(selector);
	var __n=__o instanceof Array ? __o : Object.getOwnPropertyNames(__o||{});
	var __q=__n.length;
	for (var __p=0;__p<__q;__p++){
		var __m=(__n===__o)?__p:__n[__p];
		var _=__o[__m];
		// This is the body of the iteration with (value=_, key/index=__m) in __o
		_ = __module__.$(_);
		var source = _.text();;
		var i = source.indexOf(__module__.SOURCE_PREFIX);;
		if (i >= 0) {
			source = eval(extend.slice(source,(i + extend.len(__module__.SOURCE_PREFIX)),extend.len(source)));
		};
		var action_show = __module__.$(html.button("Show source"));;
		var pre = __module__.$(html.pre({"_":"hidden"}, source));;
		if (extend.isDefined(hljs)) {
			hljs.highlightBlock(pre[0]);
		};
		action_show.click((function(pre, action_show){return (function() {
			if (pre.hasClass("hidden")) {
				action_show.text("Hide script");
				pre.removeClass("hidden");
			} else {
				action_show.text("Show script");
				pre.addClass("hidden");
			}
		})}(pre, action_show)));
		_.before(html.div({"_":"script"}, action_show, pre));
		if (_.hasClass("visible")) {
			action_show.click();
		};
	}
}
texto.start = function(){
	var self = texto;
	__module__.renderTitle();
	__module__.renderScripts();
	__module__.renderIndex();
}
texto.init = function(){
	var self = texto;
	document.addEventListener("ready", __module__.start);
}
if (typeof(texto.init)!="undefined") {texto.init();}

// START:VANILLA_POSTAMBLE
return texto;})(texto);
// END:VANILLA_POSTAMBLE
