// 8< ---[app.js]---
// START:VANILLA_PREAMBLE
var app=typeof(extend)!='undefined' ? extend.module('app') : (typeof(app)!='undefined' ? app : {});
(function(app){
var Widget = widgets.Widget;
var __module__=app;
// END:VANILLA_PREAMBLE

app.__VERSION__='0.4.3';
app.API = [];
app.URL = linking.URLHashState.Install();
app.$ = (((typeof(jQuery) != "undefined") && jQuery) || extend.modules.select);
app.T = widgets.T;
app.APP = null;
app.UNITS = {"p":1.0, "em":null, "pad":null};
app.ON = events.create(["ApplicationAssetsLoading", "ApplicationAssetsLoaded", "ApplicationDataLoaded", "ApplicationInitialized", "SectionChanged", "DeviceChanged", "LanguageChanged", "FontSizeChanged", "ApplicationResized", "Relayout"]);
/**
  * The base class for applications.
  * 
  * Options:
  * -  `mobileWidth`: The reference size of a mobile screen in pixels, will
  * be used to calculate the zoom for mobile devices.
  * - `baseWidth`, `baseHeight`: used to specify the width/height for a 1:1
  * zoom ratio. The zoom will be adjusted relative to the baseWidth
  * and baseHeight.
  * - `constraint` can be `both`, `w` or `h`, depending on how you want
  * to resize the application's `div` based on the baseWidth/baseHeight
  * and zoom. Selecting `both` will ensure that the aspect ratio is preserved.
  * 
*/
app.Application = extend.Class({
	name  :'app.Application',
	parent: widgets.Widget,
	shared: {
		PRELOAD: [],
		STATES: {"assets":["loading", "loaded"]},
		UIS: {"navigationSections":".Navigation .section", "sections":".Content   *.section[data-name]", "overlays":".Overlays > *[data-name]", "padRef":"#PADREF", "emRef":"#EMREF"},
		BROWSERS: {"ie":9.0},
		OPTIONS: {"mobileWidth":360, "baseWidth":null, "baseHeight":null, "width":null, "resize":true, "zoom":undefined, "zoomMax":undefined, "constraint":"both", "container":"window", "device":null, "defaultPath":null, "relayout":true}
	},
	properties: {
		isMobile:undefined,
		assets:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `isMobile`
		if (typeof(self.isMobile)=='undefined') {self.isMobile = undefined;};
		// Default value for property `assets`
		if (typeof(self.assets)=='undefined') {self.assets = null;};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Application.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function(bindURL) {
			var self = this;
			if (bindURL === undefined) {bindURL=true}
			var browser = useragent.getBrowser();
			var version = useragent.getVersion();
			var failed = false;
			// Iterates over `self.getClass().BROWSERS`. This works on array,objects and null/undefined
			var __i=self.getClass().BROWSERS;
			var __j=__i instanceof Array ? __i : Object.getOwnPropertyNames(__i||{});
			var __l=__j.length;
			for (var __k=0;__k<__l;__k++){
				var b=(__j===__i)?__k:__j[__k];
				var req_version=__i[b];
				// This is the body of the iteration with (value=req_version, key/index=b) in __i
				if ((b == browser) && (version < req_version)) {
					self.onBrowserFailed();
					failed = true;
				};
			}
			if (!failed) {
				self.getSuper(__module__.Application.getParent()).bindUI();
				__module__.APP = self;
				self.uis.defaultSection = self.uis.sections.filter(".default");
				if (self.uis.defaultSection.length == 0) {
					self.uis.defaultSection = self.uis.sections.eq(0);
				}
				if (!self.options.defaultPath) {
					self.options.defaultPath = self.uis.defaultSection.attr("data-name");
				}
				self.setDevice((self.options.device || self.guessDevice()));
				__module__.ON.Relayout.bind(self.getMethod('relayout') );
				if (self.options.relayout) {
					self.relayout();
				}
				__module__.ON.ApplicationInitialized.bind(function() {
					__module__.URL.bind(self.getMethod('onURLStateChanged') );
					return __module__.URL.bindLinks(self.ui);
				});
				return self.loadData().onSucceed(function(d) {
					self.setData(d);
					return __module__.ON.ApplicationDataLoaded.trigger(d);
				});
			}
		},
		
		onBrowserFailed: function() {
			var self = this;
			window.location = "http://outdatedbrowser.com/";
		},
		
		/**
		  * Loads the assets defined in the `Application.PRELOAD` list. Returns the
		  * corresponding `RendezVous`, which is assigned to `assetsRDV`. The
		  * `ApplicationAssetsLoaded` event will be triggered when the
		  * preload is complete. This can only be called once.
		  * 
		*/
		loadAssets: function(assets) {
			var self = this;
			if (assets === undefined) {assets=__module__.Application.PRELOAD}
			if (!self.cache.assetRDV) {
				self.setState("assets", "loading");
				self.cache.assetRDV = preload.assets(assets);
				self.cache.assetRDV.onPartial(function(v) {
					return __module__.ON.ApplicationAssetsLoading.trigger(self.cache.assetRDV, v);
				});
				self.cache.assetRDV.onSucceed(function(v) {
					self.setState("assets", "loaded");
					self.assets = v.assets;
					return __module__.ON.ApplicationAssetsLoaded.trigger(self);
				});
			}
			return self.cache.assetRDV;
		},
		
		loadData: function() {
			var self = this;
			return new channels.Future().set(true);
		},
		
		guessDevice: function() {
			var self = this;
			if (useragent && useragent.isMobile()) {
				return "mobile";
			}
			else {
				return "web";
			}
		},
		
		onURLStateChanged: function(event) {
			var self = this;
			if (event.changed && event.changed.__path__) {
				var path = (__module__.URL.getPath(0) || self.options.defaultPath);
				self.setSection(path);
			}
			if (event.changed && event.changed.overlay) {
				self.setOverlay(event.values.overlay);
			}
		},
		
		/**
		  * Sets the section with the given name as active. This looks for a matching `[data-name]`
		  * in `uis sections` and will set it as current. If the section has a widget class, then
		  * the widget will be bound lazily. The `setActive()` method will be called on the current
		  * section's widget, and `setInactive()` will be called on the previous section's widget, if
		  * any.
		  * 
		  * Using `setActive()` and `setInactive()` in widgets implemented as sections will allow
		  * you to improve performance by preventing code from being executed when the
		  * widget is not active.
		  * 
		*/
		setSection: function(sectionName) {
			var self = this;
			var section_ui = self.uis.sections.filter((("[data-name='" + sectionName) + "']"));
			if (extend.len(section_ui) == 0) {
				if (self.ui.attr("data-section")) {
					sectionName = self.ui.attr("data-section");
				} else {
					section_ui = self.uis.defaultSection;
					sectionName = section_ui.attr("data-name");
				}
			}
			!((extend.len(section_ui) <= 1)) && extend.assert(false, "app.Application.setSection:", (("Application: More than one section named `" + sectionName) + "`"), "(failed `(extend.len(section_ui) <= 1)`)");
			self.setOverlay();
			if (sectionName != self.ui.attr("data-section")) {
				if (self.cache.currentSectionUI) {
					self.cache.currentSectionUI.removeClass("current");
				}
				if (self.cache.currentSectionWidget) {
					self.cache.currentSectionWidget.setInactive();
				}
				self.ui.attr("data-section", sectionName);
				self.uis.navigationSections.removeClass("current").filter((("[data-name='" + sectionName) + "']")).addClass("current");
				section_ui.addClass("current");
				var section_widget = null;
				if (section_ui.hasClass("widget")) {
					section_widget = widgets.ensureWidget(section_ui);
					section_widget.setActive();
				}
				self.cache.currentSectionUI = section_ui;
				self.cache.currentSectionWidget = section_widget;
				__module__.ON.SectionChanged.trigger(sectionName, self);
				return section_ui;
			} else {
				return null;
			}
		},
		
		setOverlay: function(overlayName) {
			var self = this;
			if (overlayName === undefined) {overlayName=""}
			var overlay_ui = self.uis.overlays.filter((("[data-name='" + overlayName) + "']"));
			if (overlayName != self.ui.attr("data-overlay")) {
				self.ui.attr("data-overlay", overlayName);
				self.uis.overlays.removeClass("current");
				overlay_ui.addClass("current");
			}
		},
		
		setZoom: function(zoom) {
			var self = this;
			if (zoom === undefined) {zoom=null}
			if (zoom && extend.isNumber(zoom)) {
				self.options.zoom = zoom;
			} else {
				self.options.zoom = undefined;
			}
			self._resetLayout();
			return self;
		},
		
		getZoom: function() {
			var self = this;
			return self.cache.z;
		},
		
		setWidth: function(width) {
			var self = this;
			self.options.width = width;
			self._resetLayout();
		},
		
		setDevice: function(device) {
			var self = this;
			self.ui.attr("data-device", device);
			if (device == "mobile") {
				self.isMobile = true;
			} else {
				self.isMobile = false;
			}
			self._resetLayout();
			__module__.ON.DeviceChanged.trigger(device);
			return self;
		},
		
		getDevice: function() {
			var self = this;
			return self.ui.attr("data-device");
		},
		
		setConstraint: function(constraint) {
			var self = this;
			self.options.constraint = constraint;
			self._resetLayout();
			return self;
		},
		
		getConstraint: function() {
			var self = this;
			return self.options.constraint;
		},
		
		_resetLayout: function(doRelayout) {
			var self = this;
			if (doRelayout === undefined) {doRelayout=true}
			self.ui[0].style.width = null;
			self.ui[0].style.height = null;
			self.ui[0].style.left = null;
			self.ui[0].style.right = null;
			self.ui[0].style.bottom = null;
			self.ui[0].style.top = null;
			if (doRelayout) {
				self.relayout();
			}
			return false;
		},
		
		/**
		  * This is by far the most complex function of the Application. It resizes
		  * the application ui based on the parameters and sets a font-size (in %)
		  * that is proportional to the base size.
		  * 
		  * TODO: Describe the algorithm
		  * 
		*/
		relayout: function() {
			var self = this;
			var device = self.ui.attr("data-device");
			var is_mobile = (device == "mobile");
			if (!self.uis.container) {
				if (self.options.container == "window") {
					self.uis.container = window;
				} else {
					self.uis.container = self.options.container;
				}
			}
			var c = self.uis.container;
			var cs = dimension.size(self.uis.container);
			var w = cs.width;
			var h = cs.height;
			var base_w = (self.options.baseWidth || w);
			var base_h = (self.options.baseHeight || h);
			var z_w = (w / base_w);
			var z_h = (h / base_h);
			var z = Math.min(z_w, z_h);
			if (self.options.constraint == "w") {
				z = z_w;
			} else if (self.options.constraint == "h") {
				z = z_h;
			}
			if (extend.isDefined(self.options.zoom)) {
				z = self.options.zoom;
			}
			if (extend.isDefined(self.options.maxZoom)) {
				z = Math.min(z, self.options.maxZoom);
			}
			var w_a = (self.options.width || w);
			var h_a = h;
			if (((self.options.constraint == "w") || (self.options.constraint == "both")) || (self.options.constraint === true)) {
				w_a = (base_w * z);
			}
			if (((self.options.constraint == "h") || (self.options.constraint == "both")) || (self.options.constraint === true)) {
				h_a = (base_h * z);
			}
			var style = {"fontSize":((100.0 * z) + "%")};
			if (self.ui.css("position") == "absolute") {
				if (((self.options.constraint == "w") || (self.options.constraint == "both")) || (self.options.constraint === true)) {
					style.left = ((w - w_a) / 2);
					style.right = ((w - w_a) / 2);
				}
				if (((self.options.constraint == "h") || (self.options.constraint == "both")) || (self.options.constraint === true)) {
					style.top = ((h - h_a) / 2);
					style.bottom = ((h - h_a) / 2);
				}
			} else {
				if (((self.options.constraint == "w") || (self.options.constraint == "both")) || (self.options.constraint === true)) {
					style.width = w_a;
				}
				if (((self.options.constraint == "h") || (self.options.constraint == "both")) || (self.options.constraint === true)) {
					style.height = h_a;
				}
			}
			var had_no_animation = self.ui.hasClass("no-animation");
			if (!had_no_animation) {
				self.ui.addClass("no-animation");
			}
			self.ui.css(style).attr("data-size", self.getSizeMode(w_a, h_a));
			__module__.UNITS.p = z;
			if (self.uis.padRef) {
				__module__.UNITS.pad = self.uis.padRef.width();
			}
			if (self.uis.emRef) {
				__module__.UNITS.em = self.uis.emRef.width();
			}
			if (window.animation) {
				animation.UNITS.p = z;
			}
			var resized = false;
			if (self.cache.z != z) {
				resized = true;
				__module__.ON.FontSizeChanged.trigger();
				self.cache.z = z;
			}
			resized = (((resized || (!self.cache.size)) || (w_a != self.cache.size[0])) || (h_a != self.cache.size[1]));
			self.cache.size = [w_a, h_a];
			if (resized) {
				__module__.ON.ApplicationResized.trigger({"zoom":z, "width":w_a, "height":h_a});
			}
			if (!had_no_animation) {
				self.ui.removeClass("no-animation");
			}
		},
		
		getSizeMode: function(w, h) {
			var self = this;
			if (!self.options.sizes) {
				return null;
			} else {
				var res = extend.first(self.options.sizes, function(_) {
					var max_w = _[0];
					var name = _[1];
					return ((w <= max_w) || (max_w === null));
				});
				if (res) {
					return res[1];
				} else {
					null
				}
			}
		}
	}
})
app.pxToEm = function(value){
	var self = app;
	!(__module__.UNITS.em) && extend.assert(false, "app.pxToEm:", "app: EMREF not found", "(failed `__module__.UNITS.em`)");
	return (value / __module__.UNITS.em);
}
app.addEvents = function(eventNames){
	var self = app;
	eventNames = extend.sliceArguments(arguments,0)
	// Iterates over `eventNames`. This works on array,objects and null/undefined
	var __o=eventNames;
	var __n=__o instanceof Array ? __o : Object.getOwnPropertyNames(__o||{});
	var __q=__n.length;
	for (var __p=0;__p<__q;__p++){
		var __m=(__n===__o)?__p:__n[__p];
		var _=__o[__m];
		// This is the body of the iteration with (value=_, key/index=__m) in __o
		__module__.ON[_] = new events.EventSource(_);
	}
	return __module__.ON;
}
app.relayout = function(){
	var self = app;
	var ui = __module__.$(document.body);
	ui.addClass("no-animation");
	__module__.ON.Relayout.trigger();
	var enable_animations = function() {
		return ui.removeClass("no-animation");
	};
	if (window.animation) {
		animation.onNextFrame(enable_animations);
	} else {
		window.setTimeout(enable_animations, 0);
	}
}
/**
  * Starts the application, returning a reference to the application
  * The default initialization sequence diagram:
  * START-> |
  * Application bind  |===|
  * (async)load data        |======================|
  * Application DataLoaded                             |
  * widgets bind      |===|
  * (async)load assets          |===========|
  * Application Initialized                      |
  * Hide the loading page                      |
  * urlStateChanged                      |=============......
  * All other code is executed from urlStateChanged
  * 
*/
app.start = function(bind){
	var self = app;
	if (bind === undefined) {bind=true}
	var browser = useragent.getUserAgent();
	if (browser.msie && (browser.version < 9)) {
		__module__.$("body").addClass("with-legacy");
		return false;
	} else {
		if (extend.isFunction(bind)) {
			bind();
		} else {
			widgets.bind("*");
			__module__.APP.loadAssets().onSucceed(function() {
				return __module__.ON.ApplicationInitialized.trigger();
			}).onFail(function() {
				return extend.error("app: Loading assets failed");
			});
		}
		window.addEventListener("resize", __module__.relayout);
		__module__.relayout();
		return __module__.APP;
	}
}
app.init = function(){
	var self = app;
}
if (typeof(app.init)!="undefined") {app.init();}

// START:VANILLA_POSTAMBLE
return app;})(app);
// END:VANILLA_POSTAMBLE
