// 8< ---[preload.js]---
// START:VANILLA_PREAMBLE
var preload=typeof(extend)!='undefined' ? extend.module('preload') : (typeof(preload)!='undefined' ? preload : {});
(function(preload){
var __module__=preload;
// END:VANILLA_PREAMBLE

preload.__VERSION__='1.2.2';
preload.$ = (((typeof(jQuery) != "undefined") && jQuery) || extend.modules.select);
preload.MODE_IMAGE = 1;
preload.MODE_REQUEST = 2;
preload.MODES = {"jpeg":__module__.MODE_IMAGE, "jpg":__module__.MODE_IMAGE, "gif":__module__.MODE_IMAGE, "png":__module__.MODE_IMAGE, "ico":__module__.MODE_IMAGE, "svg":__module__.MODE_IMAGE};
preload.LICENSE = "http://ffctn.com/doc/licenses/bsd";
preload.HTTP = null;
/**
  * Tells if the given URL can be preloaded. Images extensions and files
  * available on the local server are both supported.
  * 
*/
preload.isSupported = function(url){
	var self = preload;
	var ext = extend.access(url.split("."),-1);
	if (__module__.MODES[ext]) {
		return true;
	} else {
		var prefix = ((window.location.protocol + "//") + window.location.host);
		return ((url.indexOf("://") == -1) || (url.indexOf(prefix) == 0));
	}
}
/**
  * Tells if the given image is loaded or not. The given `url` can be a string
  * or an `image` tag.
  * 
*/
preload.isImageLoaded = function(url){
	var self = preload;
	var img = url;
	if (extend.isString(url)) {
		img = html.img({"src":url});
	} else {
		img = __module__.$(img)[0];
	}
	if ((!img.complete) || ((typeof(img.naturalWidth) != "undefined") && (img.naturalWidth == 0))) {
		return false;
	} else {
		return true;
	}
}
/**
  * Preloads the image at the given URL,returning a future that will be set
  * once the image is loaded.
  * 
*/
preload.image = function(url, timeout){
	var self = preload;
	if (timeout === undefined) {timeout=undefined}
	!(__module__.isSupported(url)) && extend.assert(false, "preload.image:", ("preload.image: URL not supported " + url), "(failed `__module__.isSupported(url)`)");
	var img = html.img({"src":url});
	var f = new channels.Future();
	if (__module__.isImageLoaded(img)) {
		f.set(img);
	} else {
		__module__.$(img).load(function() {
			return f.set(img);
		});
	}
	return f;
}
preload.images = function(images){
	var self = preload;
	return __module__.assets(images);
}
/**
  * Preloads the file at the given URL, returning a future that will be set
  * once the URL is loaded.
  * 
*/
preload.file = function(url, timeout){
	var self = preload;
	if (timeout === undefined) {timeout=undefined}
	!(__module__.isSupported(url)) && extend.assert(false, "preload.file:", ("preload.file: URL not supported " + url), "(failed `__module__.isSupported(url)`)");
	if (!__module__.HTTP) {
		__module__.HTTP = new channels.AsyncChannel();
	}
	return __module__.HTTP.get(url);
}
/**
  * Will call either `preload.image` or `preload.file` depending on the
  * type of the URL
  * 
*/
preload.load = function(url, timeout){
	var self = preload;
	if (timeout === undefined) {timeout=undefined}
	var extension = extend.access(url.split("."),-1);
	var mode = __module__.MODES[extension];
	if (mode == __module__.MODE_IMAGE) {
		return __module__.image(url, timeout);
	} else {
		return __module__.file(url, timeout);
	}
}
/**
  * Preload the assets at the given URLS, returning a future that will be set
  * if all the assets are loaded before the timeout. The future's value will
  * be a map of URL --> loaded data. Loaded data will be image objects
  * for images, JavaScript objects for JSON and text otherwise.
  * 
*/
preload.assets = function(urls, timeout){
	var self = preload;
	if (timeout === undefined) {timeout=10000}
	!(urls) && extend.assert(false, "preload.assets:", "preload.assets: Missing list of URLS", "(failed `urls`)");
	urls = extend.filter(urls, __module__.isSupported);
	var res = new channels.Future();
	var rdv = new channels.RendezVous((extend.len(urls) || 0));
	var timeout = window.setTimeout(function() {
		if (!rdv.isMet()) {
			res.fail();
		}
	}, timeout);
	rdv.assets = {};
	rdv.onJoin(function(v) {
		return res.setPartial(v);
	});
	rdv.onMeet(function() {
		return res.set(rdv.assets);
	});
	window.setTimeout(function() {
		// Iterates over `urls`. This works on array,objects and null/undefined
		var __i=urls;
		var __j=__i instanceof Array ? __i : Object.getOwnPropertyNames(__i||{});
		var __l=__j.length;
		for (var __k=0;__k<__l;__k++){
			var i=(__j===__i)?__k:__j[__k];
			var asset_url=__i[i];
			// This is the body of the iteration with (value=asset_url, key/index=i) in __i
			__module__.load(asset_url).onSucceed((function(asset_url){return (function(v) {
				var name = extend.access(asset_url.split("/"),-1);
				rdv.assets[asset_url] = v;
				if (!rdv[name]) {
					rdv.assets[name] = v;
				}
				return rdv.join(asset_url);
			})}(asset_url)));
		}
	}, 0);
	if ((extend.len(urls) == 0) && (!res.isSet())) {
		res.set(urls);
	}
	return rdv;
}
preload.init = function(){
	var self = preload;
}
if (typeof(preload.init)!="undefined") {preload.init();}

// START:VANILLA_POSTAMBLE
return preload;})(preload);
// END:VANILLA_POSTAMBLE
