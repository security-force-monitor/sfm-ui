// 8< ---[behavior.js]---
/**
  * The behaviour module implements specific user-interaction patterns that
  * are shared by widgets. These patterns will update the widget's UIs based
  * on user interaction.
  * 
  * Implementing scrollable areas (with custom scrollbars) or sliding panes
  * that work with touch devices and mouse/keyboard is one of the reason for
  * this module.
  * 
*/
// START:VANILLA_PREAMBLE
var behavior=typeof(extend)!='undefined' ? extend.module('behavior') : (typeof(behavior)!='undefined' ? behavior : {});
(function(behavior){
var __module__=behavior;
// END:VANILLA_PREAMBLE

behavior.__VERSION__='0.6.2';
behavior.$ = (((typeof(jQuery) != "undefined") && jQuery) || extend.modules.select);
behavior.LICENSE = "http://ffctn.com/doc/licenses/bsd";
/**
  * A behaviour encapsulate a main UI node, sub-uis, options and a cache to
  * store state.
  * 
*/
behavior.Behavior = extend.Class({
	name  :'behavior.Behavior',
	parent: undefined,
	shared: {
		COUNT: 0,
		OPTIONS: undefined
	},
	properties: {
		id:undefined,
		ui:undefined,
		uis:undefined,
		options:undefined,
		cache:undefined,
		handlers:undefined,
		isEnabled:undefined
	},
	initialize: function( ui, options ){
		var self = this;
		if (options === undefined) {options={}}
		// Default initialization of property `id`
		if (typeof(self.id)=='undefined') {self.id = -1;};
		// Default initialization of property `uis`
		if (typeof(self.uis)=='undefined') {self.uis = {};};
		// Default initialization of property `options`
		if (typeof(self.options)=='undefined') {self.options = {};};
		// Default initialization of property `cache`
		if (typeof(self.cache)=='undefined') {self.cache = {};};
		// Default initialization of property `handlers`
		if (typeof(self.handlers)=='undefined') {self.handlers = {};};
		// Default initialization of property `isEnabled`
		if (typeof(self.isEnabled)=='undefined') {self.isEnabled = undefined;};
		self.id = self.getClass().COUNT;
		self.getClass().COUNT = (self.getClass().COUNT + 1);
		self.ui = __module__.$(ui);
		var data_options = self.ui.data();
		// Iterates over `self.getClass().OPTIONS`. This works on array,objects and null/undefined
		var __i=self.getClass().OPTIONS;
		var __j=__i instanceof Array ? __i : Object.getOwnPropertyNames(__i||{});
		var __l=__j.length;
		for (var __k=0;__k<__l;__k++){
			var k=(__j===__i)?__k:__j[__k];
			var v=__i[k];
			// This is the body of the iteration with (value=v, key/index=k) in __i
			if (data_options && extend.isDefined(data_options[k])) {
				self.options[k] = data_options[k];
			} else {
				self.options[k] = v;
			};
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
		enable: function() {
			var self = this;
			self.isEnabled = true;
			return self;
		},
		
		disable: function() {
			var self = this;
			self.isEnabled = false;
			return self;
		}
	}
})
/**
  * Allows an interface element to become (vertically) scrollable. the
  * `panel` element will have its `top` property (or the one defined in
  * `options.scrollProperty` shifted from an amount represented in the `scrollbar`.
  * 
  * The UIS used by the scrollbar are:
  * 
  * - `ui` is the main interface element on which the event handlers
  * are registered.
  * - `uis.panel` is the scrollable panel that will be shifted/scrolled
  * - `uis.scrollbar`  is the scrollbar "rail", which should usually be a child
  * of the `ui`, and not a child of the `panel`
  * - `uis.cursor`     is the scrollbar "rail", which should be a child of
  * the `uis.scrollbar`.
  * 
  * A typical HTML tree would be like:
  * 
  * ```
  * <div.ui(style=position:relative;overflow:hidden)
  * <div.panel(style=position:relative)
  * ....
  * <div.scrollbar(style=position:absolute;top:0px;right:0px;bottom:0px;width:10px)
  * <div.cursor(position:absolute;top:0px;left:0px;right:0px;height:10px)
  * ```
  * 
  * The scrollable behaviour also sets some CSS classes to the DOM nodes,
  * depending on what's going on:
  * 
  * - `uis.scrollbar:.dragging` when the scrollbar is being dragged
  * - `ui.more-up`   when the scrollable can be scrolled down for more content
  * - `ui.more-down` when the scrollable can be scrolled up for more content
  * 
*/
behavior.Scrollable = extend.Class({
	name  :'behavior.Scrollable',
	parent: __module__.Behavior,
	shared: {
		OPTIONS: {"scrollProperty":"top", "scrollableHeight":undefined, "visibleHeight":undefined, "mouseInertia":true, "touchInertia":true, "touchVelocity":1, "inertiaPower":1.5, "inertiaThreshold":0.4, "keyboard":true, "scrollStep":null}
	},
	properties: {
		uis:undefined,
		cache:undefined,
		on:undefined,
		scrollableHandler:undefined,
		scrollbarHandler:undefined
	},
	initialize: function( ui, options ){
		var self = this;
		if (options === undefined) {options={}}
		// Default initialization of property `uis`
		if (typeof(self.uis)=='undefined') {self.uis = {"panel":null, "scrollbar":null, "cursor":null};};
		// Default initialization of property `cache`
		if (typeof(self.cache)=='undefined') {self.cache = {"offset":0};};
		// Default initialization of property `on`
		if (typeof(self.on)=='undefined') {self.on = events.create(["scroll", "scrollEnd", "scrollStart"]);;};
		// Default initialization of property `scrollableHandler`
		if (typeof(self.scrollableHandler)=='undefined') {self.scrollableHandler = null;};
		// Default initialization of property `scrollbarHandler`
		if (typeof(self.scrollbarHandler)=='undefined') {self.scrollbarHandler = null;};
		ui = __module__.$(ui);
		self.getSuper(__module__.Scrollable.getParent())(ui, options);
		ui.addClass("scrollable");
		self.uis.body = __module__.$(document.body);
		self.uis.panel = (options.panel || self.ui.find(".panel:first"));
		self.uis.scrollbar = (options.scrollbar || self.ui.find(".scrollbar:first"));
		if (self.uis.scrollbar.length == 0) {
			self.uis.scrollbar = __module__.$(html.div({"_":"scrollbar"}, html.div({"_":"cursor"})));
			ui.append(self.uis.scrollbar);
		}
		self.uis.cursor = (options.cursor || self.uis.scrollbar.find(".cursor"));
		!((self.ui.length > 0)) && extend.assert(false, "behavior.Scrollable.__init__:", "behaviour.Scrollable lacks ui parameter", "(failed `(self.ui.length > 0)`)");
		!((self.uis.panel.length > 0)) && extend.assert(false, "behavior.Scrollable.__init__:", "behaviour.Scrollable cannot find .panel", "(failed `(self.uis.panel.length > 0)`)");
		!((self.uis.scrollbar.length > 0)) && extend.assert(false, "behavior.Scrollable.__init__:", "behaviour.Scrollable cannot find .scrollbar", "(failed `(self.uis.scrollbar.length > 0)`)");
		!((self.uis.cursor.length > 0)) && extend.assert(false, "behavior.Scrollable.__init__:", "behaviour.Scrollable cannot find .cursor", "(failed `(self.uis.cursor.length > 0)`)");
		self.initUIS();
		self.initHandlers();
		self.relayout();
	},
	methods: {
		initHandlers: function() {
			var self = this;
			self.handlers.scrollable = interaction.handle({"mouse":{"wheel":self.getMethod('onMouseWheel') }, "swipe":{"start":self.getMethod('onSwipeStart') , "move":self.getMethod('onSwipe') , "end":self.getMethod('onSwipeEnd') }, "keyboard":{"press":self.getMethod('onKeyPress') }});
			self.handlers.scrollbar = interaction.handle({"mouse":{"click":self.getMethod('onScrollBarClick') }});
			self.handlers.cursor = interaction.handle({"drag":{"start":function(e, h) {
				return self.onCursorDragStart(e, h);
			}, "drag":function(e, h) {
				return self.onCursorDrag(e, h);
			}, "end":function(e, h) {
				return self.onCursorDragStop(e, h);
			}}});
			self.enable();
		},
		
		initUIS: function() {
			var self = this;
			self.ui.css({"margin":0, "border-width":0, "padding":0, "overflow":"hidden"});
			if ((self.ui.css("position") == "static") || (!self.ui.css("position"))) {
				self.ui.css("position", "relative");
			}
			self.uis.panel.css(extend.createMapFromItems(["position","relative"],["margin",0],["padding",0],["borderWidth",0],[self.options.scrollProperty,self.cache.offset]));
		},
		
		hide: function() {
			var self = this;
			self.uis.scrollbar.addClass("hidden");
		},
		
		show: function() {
			var self = this;
			self.uis.scrollbar.removeClass("hidden");
		},
		
		enable: function() {
			var self = this;
			self.ui.removeClass("no-scrollbar");
			if (!self.isEnabled) {
				self.handlers.scrollable.bind(self.ui);
				self.handlers.scrollbar.bind(self.uis.scrollbar);
				self.handlers.cursor.bind(self.uis.cursor);
			}
			return self.getSuper(__module__.Scrollable.getParent()).enable();
		},
		
		disable: function() {
			var self = this;
			self.ui.addClass("no-scrollbar");
			if (self.isEnabled) {
				self.handlers.scrollable.unbind(self.ui);
				self.handlers.scrollbar.unbind(self.uis.scrollbar);
				self.handlers.cursor.unbind(self.uis.cursor);
			}
			return self.getSuper(__module__.Scrollable.getParent()).disable();
		},
		
		/**
		  * Caches the dimensions of the elements for fast access, as
		  * the dimension access can be quite slow on some browsers (eg. Firefox)
		  * 
		*/
		_cacheDimensions: function() {
			var self = this;
			self.cache.cursorStartOffset = (parseInt(self.uis.cursor.css("top")) || 0);
			self.cache.visibleHeight = self.getVisibleHeight(true);
			self.cache.cursorHeight = self.uis.cursor[0].clientHeight;
			self.cache.scrollbarHeight = self.uis.scrollbar[0].clientHeight;
			if (self.uis.panel) {
				self.cache.panelHeight = self.getPanelHeight(true);
			} else {
				self.cache.panelHeight = 0;
			}
		},
		
		relayout: function() {
			var self = this;
			self._cacheDimensions();
			self.renderScrollbar();
			return self;
		},
		
		renderScrollbar: function(offset) {
			var self = this;
			if (offset === undefined) {offset=self.cache.offset}
			var visible_height = self.getVisibleHeight(true);
			var panel_height = self.getPanelHeight(true);
			var scrollbar_height = self.cache.scrollbarHeight;
			var offset_ratio = Math.abs(((1.0 * offset) / (panel_height || 1)));
			var visible_ratio = ((1.0 * visible_height) / (panel_height || 1));
			self.cache.visibleRatio = visible_ratio;
			if (visible_ratio >= 1.0) {
				self.ui.removeClass("more-up").removeClass("more-down");
				self.uis.cursor.css({"visibility":"hidden"});
				self.cache.offset = 0;
				self.uis.panel.css(self.options.scrollProperty, self.cache.offset);
			} else {
				if (offset == 0) {
					self.ui.removeClass("more-up");
				} else {
					self.ui.addClass("more-up");
				}
				if (offset == (visible_height - panel_height)) {
					self.ui.removeClass("more-down");
				} else {
					self.ui.addClass("more-down");
				}
				self.cache.cursorHeight = (scrollbar_height * visible_ratio);
				self.uis.cursor.css({"visibility":"visible", "top":(scrollbar_height * offset_ratio), "height":self.cache.cursorHeight});
			}
		},
		
		onKeyPress: function(event) {
			var self = this;
			if (self.options.keyboard) {
				self._stopInertia();
				if (event.keyCode == 38) {
					self.scrollUp(undefined, true);
					self._triggerScrollStartEnd();
					return false;
				} else if (event.keyCode == 40) {
					self.scrollDown(undefined, true);
					self._triggerScrollStartEnd();
					return false;
				}
			}
		},
		
		onScrollBarClick: function(event) {
			var self = this;
			if (self.isEnabled && (event.target != self.uis.cursor[0])) {
				self._stopInertia();
				if (self.cache.inertiaTween) {
					self.cache.inertiaTween.stop();
				}
				var offset = (event.pageY - self.uis.scrollbar.offset().top);
				var offset_percent = ((1.0 * offset) / self.cache.scrollbarHeight);
				self.ui.addClass("no-animation");
				if (self.getOffsetForPercentage(offset_percent) > self.getOffset()) {
					self.scrollUpPercent(0.1, true);
				} else {
					self.scrollDownPercent(0.1, true);
				}
				self.ui.removeClass("no-animation");
			}
		},
		
		onCursorDragStart: function(event, handler) {
			var self = this;
			if (self.isEnabled) {
				self._stopInertia();
				self._cacheDimensions();
				self.cache.dragStartOffset = self.getOffset();
				self.uis.scrollbar.addClass("dragging");
				self.uis.body.addClass("dragging");
				self.ui.addClass("no-animation");
			}
		},
		
		onCursorDrag: function(event, handler) {
			var self = this;
			if (self.isEnabled) {
				self._stopInertia();
				if (event.type != "touch") {
					var offset = (self.cache.cursorStartOffset + event.delta[1]);
					offset = Math.max(0, offset);
					offset = Math.min((self.cache.scrollbarHeight - self.cache.cursorHeight), offset);
					var offset_percent = ((1.0 * offset) / self.cache.scrollbarHeight);
					self.scrollToPercent(offset_percent, undefined, true);
				} else {
					var offset = (self.cache.dragStartOffset - (event.delta[1] * self.options.touchVelocity));
					self.scrollTo(offset, true, true);
				}
			}
		},
		
		onCursorDragStop: function(event, handler) {
			var self = this;
			if (self.isEnabled) {
				self.uis.scrollbar.removeClass("dragging");
				self.uis.body.removeClass("dragging");
				self.ui.removeClass("no-animation");
				if (((event.type == "touch") && self.options.touchInertia) || ((event.type == "mouse") && self.options.mouseInertia)) {
					self._startInertia(event.velocity);
				}
			}
		},
		
		onSwipeStart: function(event) {
			var self = this;
			self.onCursorDragStart(event);
		},
		
		onSwipe: function(event) {
			var self = this;
			self.onCursorDrag(event);
		},
		
		onSwipeEnd: function(event) {
			var self = this;
			self.onCursorDragStop(event);
		},
		
		onMouseWheel: function(event, delta) {
			var self = this;
			if (self.isEnabled) {
				var scrollable = interaction.target(event, "scrollable");
				if (scrollable != self.ui[0]) {
					return self;
				}
				self._stopInertia();
				interaction.cancel(event);
				if (event.deltaY < 0) {
					self.scrollDown((0 - event.deltaY), true);
				} else {
					self.scrollUp(event.deltaY, true);
				}
				if (self.options.mouseInertia) {
					self._startInertia(((event.deltaY * 25) / 1000));
				}
				self._triggerScrollStartEnd();
				return false;
			}
		},
		
		/**
		  * The velocity is given in pixels / s.
		  * 
		*/
		_startInertia: function(velocity) {
			var self = this;
			if (!extend.isDefined(animation)) {
				extend.error((self.getClass().getName() + ": animation module required for inertia"));
				return false;
			}
			self.cache.inertiaVelocity = velocity;
			self.cache.inertiaFriction = 0.05;
			self.cache.inertiaUpdated = animation.now();
			self.cache.inertiaRunning = true;
			animation.onNextFrame(self.getMethod('_stepIntertia') );
		},
		
		/**
		  * The main method to iterate the inertial. This manages the
		  * increasing of the offset and the decrease of the velocity.
		  * 
		*/
		_stepIntertia: function() {
			var self = this;
			return false;
			var velocity = self.cache.inertiaVelocity;
			var elapsed = ((animation.now() - self.cache.inertiaUpdated) / 1000);
			var delta = ((self.cache.inertiaVelocity * self.cache.inertiaFriction) * elapsed);
			if ((velocity < 1) || (!self.cache.inertiaRunning)) {
				self.cache.inertiaVelocity = 0;
			} else {
				if ((delta >= 1) || (delta <= 1)) {
					var unit = Math.floor(delta);
					var unit_factor = ((delta - unit) / delta);
					var unit_elapsed = (unit_factor * elapsed);
					self.scrollTo((self.getOffset() + unit), true, false);
					self.cache.inertiaVelocity = (self.cache.inertiaVelocity - (unit / unit_elapsed));
					self.cache.inertiaUpdated = (self.cache.inertiaUpdated + unit_elapsed);
				}
				animation.onNextFrame(self.getMethod('_stepIntertia') );
			}
		},
		
		_stopInertia: function() {
			var self = this;
			self.cache.inertiaRunning = false;
		},
		
		reset: function() {
			var self = this;
			self.scrollTo(0);
			return self;
		},
		
		setPanel: function(sui) {
			var self = this;
			self.uis.panel = __module__.$(sui);
			self._cacheDimensions();
			self.reset();
		},
		
		getVisibleHeight: function(reset) {
			var self = this;
			if (reset === undefined) {reset=false}
			if (reset) {
				self.cache.visibleHeight = undefined;
			}
			if (self.options.visibleHeight) {
				self.cache.visibleHeight = self.options.visibleHeight(self);
			} else {
				if (dimension) {
					self.cache.visibleHeight = dimension.height(self.ui[0]);
				} else {
					self.cache.visibleHeight = self.ui[0].clientHeight;
				}
			}
			return self.cache.visibleHeight;
		},
		
		getPanelHeight: function(reset) {
			var self = this;
			if (reset === undefined) {reset=false}
			if (reset) {
				self.cache.panelHeight = undefined;
			}
			if (extend.isDefined(self.cache.panelHeight)) {
				return self.cache.panelHeight;
			}
			if (self.options.panelHeight) {
				self.cache.panelHeight = self.options.panelHeight(self);
			} else {
				if (self.uis.panel) {
					if (dimension) {
						self.cache.panelHeight = dimension.height(self.uis.panel[0]);
					} else {
						self.cache.panelHeight = self.uis.panel[0].clientHeight;
					}
				} else {
					self.cache.panelHeight = 0;
				}
			}
			return self.cache.panelHeight;
		},
		
		scrollTo: function(value, updateScrollbar, interactive) {
			var self = this;
			if (updateScrollbar === undefined) {updateScrollbar=true}
			if (interactive === undefined) {interactive=false}
			var ui_height = self.getVisibleHeight(true);
			var panel_height = self.getPanelHeight(true);
			var max_value = 0;
			var original_value = value;
			if (panel_height > ui_height) {
				max_value = (0 - (panel_height - ui_height));
				value = (0 - value);
				value = Math.min(0, value);
				value = Math.max(max_value, value);
			} else {
				value = 0;
			}
			self.uis.panel.css(self.options.scrollProperty, value);
			var is_new_value = (value != self.cache.offset);
			self.cache.previousOffset = self.cache.offset;
			self.cache.offset = value;
			self.cache.isOffsetNew = is_new_value;
			self.cache.maxValue = max_value;
			if (updateScrollbar) {
				self.renderScrollbar(value);
			}
			if (is_new_value) {
				self.on.scroll.trigger(value, self);
			}
			return value;
		},
		
		/**
		  * Triggers the `scrollStart` and `scrollEnd` events
		  * 
		*/
		_triggerScrollStartEnd: function() {
			var self = this;
			var value = self.cache.offset;
			var max_value = self.cache.maxValue;
			if (value == 0) {
				self.on.scrollStart.trigger(value, self);
			} else if (value == max_value) {
				self.on.scrollEnd.trigger(value, self);
			}
		},
		
		scrollToPercent: function(percent, updateScrollbar, interactive) {
			var self = this;
			if (updateScrollbar === undefined) {updateScrollbar=undefined}
			if (interactive === undefined) {interactive=undefined}
			return self.scrollTo(self.getOffsetForPercentage(percent), updateScrollbar, interactive);
		},
		
		scrollDown: function(value, interactive) {
			var self = this;
			if (value === undefined) {value=self._getDefaultScrollOffset();}
			if (interactive === undefined) {interactive=undefined}
			self.scrollTo((self.getOffset() - value), undefined, interactive);
		},
		
		scrollDownPercent: function(percent, interactive) {
			var self = this;
			return self.scrollDown(self.getOffsetForPercentage(percent), interactive);
		},
		
		scrollUp: function(value, interactive) {
			var self = this;
			if (value === undefined) {value=self._getDefaultScrollOffset();}
			self.scrollTo((self.getOffset() + value), undefined, interactive);
		},
		
		scrollUpPercent: function(percent, interactive) {
			var self = this;
			return self.scrollUp(self.getOffsetForPercentage(percent), interactive);
		},
		
		/**
		  * Like get offset, but the input value is in percent (0-1).
		  * 
		*/
		getOffsetForPercentage: function(value) {
			var self = this;
			return (self.getPanelHeight(true) * value);
		},
		
		getOffsetForElement: function(element) {
			var self = this;
		},
		
		/**
		  * Returns the current offset (in pixels).
		  * 
		*/
		getOffset: function() {
			var self = this;
			return (0 - (parseInt(self.uis.panel.css(self.options.scrollProperty)) || 0));
		},
		
		_getDefaultScrollOffset: function() {
			var self = this;
			if (extend.isNumber(self.options.scrollStep)) {
				return (self.getVisibleHeight(true) * self.options.scrollStep);
			} else if (extend.isFunction(self.options.scrollStep)) {
				return self.options.scrollStep(self);
			} else {
				var content_height = self.getPanelHeight(true);
				var visible_height = self.getVisibleHeight(true);
				return (visible_height / 2);
			}
		}
	}
})

behavior.Slidable = extend.Class({
	name  :'behavior.Slidable',
	parent: __module__.Behavior,
	shared: {
		OPTIONS: {"dragBounding":true, "shiftProperty":"left", "shiftUnit":"px", "stepDelay":2500, "updateWidth":true, "touchEnabled":false, "touchSlideThreshold":0.3, "mouseWheelEnabled":false, "pageWidth":null, "panel":".panel:first", "pages":"> .page"}
	},
	properties: {
		currentIndex:undefined,
		currentOffset:undefined,
		on:undefined,
		isRunning:undefined,
		cache:undefined,
		uis:undefined
	},
	/**
	  * Creates a new slider that will slide the given panel so that its
	  * `options.shiftProperty` (left by default) will be adjusted to display
	  * the given element of `pagesUI` (which is expected to be a list of
	  * pages).
	  * 
	*/
	initialize: function( ui, options ){
		var self = this;
		if (options === undefined) {options={}}
		// Default initialization of property `currentIndex`
		if (typeof(self.currentIndex)=='undefined') {self.currentIndex = -1;};
		// Default initialization of property `currentOffset`
		if (typeof(self.currentOffset)=='undefined') {self.currentOffset = 0;};
		// Default initialization of property `on`
		if (typeof(self.on)=='undefined') {self.on = events.create(["interaction", "pageChanged", "panelDraggedBeyond"]);;};
		// Default initialization of property `isRunning`
		if (typeof(self.isRunning)=='undefined') {self.isRunning = false;};
		// Default initialization of property `cache`
		if (typeof(self.cache)=='undefined') {self.cache = {"previousWidth":null, "offsetInvalid":true};};
		// Default initialization of property `uis`
		if (typeof(self.uis)=='undefined') {self.uis = {"body":__module__.$("body"), "pages":[]};};
		self.getSuper(__module__.Slidable.getParent())(ui, options);
		ui.addClass("slidable");
		options = self.options;
		if (options.panel) {
			if (extend.isString(options.panel)) {
				self.uis.panel = ui.find(options.panel);
			} else {
				self.uis.panel = __module__.$(options.panel);
			}
		}
		if (options.pages) {
			if (extend.isString(options.pages)) {
				self.uis.pages = self.uis.panel.find(options.pages);
			} else {
				self.uis.pages = __module__.$(options.pages);
			}
		}
		self.initUIS();
		self.initHandlers();
		__module__.$(window).resize.bind(function() {
			return self.relayout();
		});
		self.relayout();
	},
	methods: {
		initUIS: function() {
			var self = this;
			if ((self.uis.panel.css("position") == "static") || (!self.uis.panel.css("position"))) {
				self.uis.panel.css("position", "relative");
			}
			self.uis.pages.css({"margin":0, "padding":0, "border-width":0, "position":"relative"});
			if (self.uis.pages.css("display") == "block") {
				self.uis.pages.css("float", "left");
			}
		},
		
		initHandlers: function() {
			var self = this;
			if (self.options.touchEnabled) {
				self.handlers.touch = new interaction.Drag({"touch":true, "mouse":false});
				self.handlers.touch.setHandlers({"start":self.getMethod('onPanelDragStart') , "drag":self.getMethod('onPanelDrag') , "stop":self.getMethod('onPanelDragStop') });
			}
			self.handlers.wheel = interaction.handle({"mouse":{"wheel":self.getMethod('onMouseWheel') }});
			self.enable();
		},
		
		enable: function() {
			var self = this;
			if (!self.isEnabled) {
				self.handlers.wheel.bind(self.ui);
				if (self.options.touchEnabled) {
					self.handlers.touch.bind(self.ui);
				}
			}
			return self.getSuper(__module__.Slidable.getParent()).enable();
		},
		
		disable: function() {
			var self = this;
			if (self.isEnabled) {
				self.handlers.wheel.unbind(self.ui);
				self.handlers.touch.unbind(self.ui);
			}
			return self.getSuper(__module__.Slidable.getParent()).disable();
		},
		
		/**
		  * This will override the scrollable's `scrollableHeight` option to always use the
		  * current page's height
		  * 
		*/
		bindToScrollable: function(scrollable) {
			var self = this;
			scrollable.options.scrollableHeight = function() {
				return dimension.height(self.getCurrentPage());
			};
			return self;
		},
		
		relayout: function() {
			var self = this;
			self.currentOffset = self._getOffset();
			var width = self.getPagesWidth();
			if (extend.isFunction(self.options.updateWidth)) {
				updateWidth(width);
			} else if (self.options.updateWidth) {
				self.uis.panel.css("width", width);
			}
			self.slidePages(self.currentOffset);
			return self;
		},
		
		setPages: function(sui) {
			var self = this;
			self.uis.pages = sui;
			self.relayout();
			return self;
		},
		
		onMouseWheel: function(event) {
			var self = this;
			if (self.options.mouseWheelEnabled) {
				if (event.deltaY > 0) {
					self.next();
				} else {
					self.previous();
				}
			}
		},
		
		onPanelDragStart: function(event, handler) {
			var self = this;
			if (self.isEnabled) {
				self.stop();
				self.cache.dragStartOffset = self.currentOffset;
				self.ui.addClass("dragging").addClass("no-animation");
				self.uis.body.addClass("dragging").addClass("no-animation");
				self.on.interaction.trigger(event, self);
			}
		},
		
		onPanelDrag: function(event, handler) {
			var self = this;
			if (self.isEnabled) {
				var offset = (self.cache.dragStartOffset + event.delta[0]);
				if (event.type == "touch") {
					offset = (self.cache.dragStartOffset + event.delta[0]);
				}
				if (self.options.dragBounding) {
					offset = Math.min(0, offset);
					offset = Math.max(offset, (0 - self.getPagesWidth()));
				}
				self.shift((offset - self.currentOffset));
				self.cache.lastDragOffset = offset;
			}
		},
		
		onPanelDragStop: function(event, handler) {
			var self = this;
			if (self.isEnabled) {
				self.ui.removeClass("dragging").removeClass("no-animation");
				self.uis.body.removeClass("dragging").removeClass("no-animation");
				var width = self.getPageWidth();
				var threshold = self.options.touchSlideThreshold;
				if ((threshold > 0) && (threshold < 1)) {
					threshold = ((width * self.options.touchSlideThreshold) / Math.max(1, event.velocity));
				}
				var index = self.currentIndex;
				self.currentIndex = null;
				var last_page = (self.uis.pages.length - 1);
				if (Math.abs(event.delta[0]) >= threshold) {
					if (event.delta[0] > 0) {
						self.setPage(Math.max(0, (index - 1)));
						if ((index - 1) < 0) {
							self.on.panelDraggedBeyond.trigger({"direction":-1}, self);
						}
					} else {
						self.setPage(Math.min((index + 1), last_page));
						if ((index + 1) > last_page) {
							self.on.panelDraggedBeyond.trigger({"direction":1}, self);
						}
					}
				} else {
					self.setPage(index);
				}
			}
		},
		
		start: function(delay) {
			var self = this;
			if (delay === undefined) {delay=undefined}
			self.run(delay);
			return self;
		},
		
		run: function(delay) {
			var self = this;
			if (delay === undefined) {delay=self.options.stepDelay}
			if (!self.isRunning) {
				self.isRunning = true;
				window.setTimeout(self.getMethod('step') , delay);
			}
		},
		
		stop: function() {
			var self = this;
			if (self.isRunning) {
				self.isRunning = false;
				if (extend.isDefined(self.cache.stepTimeout)) {
					window.clearTimeout(self.cache.stepTimeout);
					self.cache.stepTimeout = undefined;
				}
			}
		},
		
		step: function() {
			var self = this;
			self.cache.stepTimeout = undefined;
			if (self.isRunning) {
				self.setPage(((self.currentIndex + 1) % self.getPageCount()));
				self.cache.stepTimeout = window.setTimeout(self.getMethod('step') , self.options.stepDelay);
			}
		},
		
		shift: function(amount, relative) {
			var self = this;
			if (relative === undefined) {relative=true}
			if (relative) {
				self.uis.panel.css(self.options.shiftProperty, (self.currentOffset + amount));
			} else {
				self.uis.panel.css(self.options.shiftProperty, amount);
			}
		},
		
		getPageCount: function() {
			var self = this;
			return self.uis.pages.length;
		},
		
		/**
		  * Returns the page width
		  * 
		*/
		getPageWidth: function(pui) {
			var self = this;
			if (pui === undefined) {pui=undefined}
			if (!extend.isDefined(pui)) {
				pui = self.uis.pages[self.currentIndex];
			}
			if (extend.isNumber(pui)) {
				pui = self.uis.pages[pui];
			}
			if (self.options.pageWidth) {
				if (extend.isFunction(self.options.pageWidth)) {
					return self.options.pageWidth(pui);
				} else {
					return (self.options.pageWidth || 0);
				}
			} else {
				return dimension.width(pui);
			}
		},
		
		getPagesWidth: function() {
			var self = this;
			var width = 0;
			// Iterates over `self.uis.pages`. This works on array,objects and null/undefined
			var __q=self.uis.pages;
			var __r=__q instanceof Array ? __q : Object.getOwnPropertyNames(__q||{});
			var __t=__r.length;
			for (var __s=0;__s<__t;__s++){
				var i=(__r===__q)?__s:__r[__s];
				var _=__q[i];
				// This is the body of the iteration with (value=_, key/index=i) in __q
				width = (width + (self.getPageWidth(_, i) || 0));
			}
			!((self.uis.pages.length > 0)) && extend.assert(false, "behavior.Slidable.getPagesWidth:", "Slidable: No page defined for ", self.ui.selector, "(failed `(self.uis.pages.length > 0)`)");
			width = (width + 1);
			return width;
		},
		
		getCurrentPage: function() {
			var self = this;
			return __module__.$(self.uis.pages[self.currentIndex]);
		},
		
		getCurrentPageName: function() {
			var self = this;
			return (__module__.$(self.uis.pages[self.currentIndex]).attr("data-name") || ("" + self.currentIndex));
		},
		
		getPage: function(index) {
			var self = this;
			if (extend.isString(index)) {
				index = self.getIndex(index);
				return self.getPage(index);
			} else {
				return __module__.$(self.uis.pages[index]);
			}
		},
		
		getPages: function() {
			var self = this;
			return self.uis.pages;
		},
		
		getIndex: function(name) {
			var self = this;
			var result = -1;
			// Iterates over `self.uis.pages`. This works on array,objects and null/undefined
			var __u=self.uis.pages;
			var __v=__u instanceof Array ? __u : Object.getOwnPropertyNames(__u||{});
			var __x=__v.length;
			for (var __w=0;__w<__x;__w++){
				var i=(__v===__u)?__w:__v[__w];
				var _=__u[i];
				// This is the body of the iteration with (value=_, key/index=i) in __u
				_ = __module__.$(_);
				if (_.attr("data-name")) {
					var names = _.attr("data-name").split(",");
					if (names.indexOf(name) != -1) {
						result = i;
						return i;
					}
				};
			}
			if (result < 0) {
				var index = parseInt(name);
				if (!isNaN(index)) {
					if (index < 0) {
						result = Math.max(0, (self.getPageCount() + index));
					} else {
						result = index;
					}
				}
			}
			return result;
		},
		
		setPage: function(index, animation) {
			var self = this;
			if (animation === undefined) {animation=true}
			if (extend.isString(index)) {
				index = self.getIndex(index);
			} else if (!extend.isNumber(index)) {
				index = extend.find(self.uis.pages, __module__.$(index)[0]);
			}
			index = (index % self.getPageCount());
			if (index < 0) {
				index = (self.getPageCount() + index);
			}
			var previous_index = self.currentIndex;
			if (((index >= 0) && (index <= self.getPageCount())) && (index != self.currentIndex)) {
				if (self.uis.pages[self.currentIndex]) {
					__module__.$(self.uis.pages[self.currentIndex]).removeClass("current");
				}
				self.currentOffset = self._getOffset(index);
				self.currentIndex = index;
				var no_animation = self.uis.body.hasClass("no-animation");
				if (!animation) {
					self.uis.body.addClass("no-animation");
				}
				self.slidePages(self.currentOffset, animation);
				var page = __module__.$(self.uis.pages[index]);
				var event = {"page":page, "index":index, "previous":__module__.$(self.uis.pages[previous_index]), "previousIndex":previous_index, "isFirst":(index == 0), "isLast":(index == (extend.len(self.uis.pages) - 1)), "total":self.uis.pages.length, "behavior":self};
				page.addClass("current");
				self.on.pageChanged.trigger(event, self);
				if (!no_animation) {
					self.uis.body.removeClass("no-animation");
				}
				self.ui.toggleClass("has-first-page", (index == 0));
				self.ui.toggleClass("has-last-page", (index == (extend.len(self.uis.pages) - 1)));
			}
			return self.uis.pages[self.currentIndex];
		},
		
		slidePages: function(offset, animation) {
			var self = this;
			if (animation === undefined) {animation=true}
			if (self.options.sliding) {
				self.options.sliding(offset, animation, self);
			} else {
				self.shift(offset, false);
			}
		},
		
		next: function(page) {
			var self = this;
			if (page === undefined) {page=self.currentIndex}
			self.setPage(((page + 1) % self.uis.pages.length));
		},
		
		previous: function(page) {
			var self = this;
			if (page === undefined) {page=self.currentIndex}
			self.setPage(((page - 1) % self.uis.pages.length));
		},
		
		isLast: function() {
			var self = this;
			return ((self.currentIndex + 1) == self.uis.pages.length);
		},
		
		_getOffset: function(index) {
			var self = this;
			if (index === undefined) {index=self.currentIndex}
			var i = 0;
			var offset = 0;
			var direction = 0;
			while ((i < index)) {
				var page = __module__.$(self.uis.pages[i]);
				if (!page.hasClass("hidden")) {
					offset = (offset + self.getPageWidth(page, i));
				}
				i = (i + 1);
			}
			return (0 - offset);
		},
		
		getThreshold: function() {
			var self = this;
			return {"previous":(((self.currentIndex > 0) && __module__.$(self.uis.pages[(self.currentIndex - 1)]).width()) || 99999), "current":(__module__.$(self.uis.pages[self.currentIndex]).width() / 2), "next":(((self.currentIndex < self.getPageCount()) && __module__.$(self.uis.pages[(self.currentIndex + 1)]).width()) || 99999)};
		}
	}
})
behavior.init = function(){
	var self = behavior;
}
if (typeof(behavior.init)!="undefined") {behavior.init();}

// START:VANILLA_POSTAMBLE
return behavior;})(behavior);
// END:VANILLA_POSTAMBLE
