// 8< ---[tooltips.js]---
// START:VANILLA_PREAMBLE
var tooltips=typeof(extend)!='undefined' ? extend.module('tooltips') : (typeof(tooltips)!='undefined' ? tooltips : {});
(function(tooltips){
var Widget = widgets.Widget;
var __module__=tooltips;
// END:VANILLA_PREAMBLE

tooltips.__VERSION__='0.2.1';
/**
  * Tooltips allow to display a panel/widget relatively to another element.
  * Tooltips can be parametered using the following options:
  * 
  * - `anchor`: the orientation of point to which the tooltip will be anchored
  * on the taget element.
  * - `tip`: the location of tip (on the tooltip) that will be attached to the
  * anchored point. Blank by default, will be calulcated based on `anchor`.
  * - `smart`: will reposition the tooltip so that it does not bleed outside
  * a specific boundary (by default, the window).
  * 
  * Tooltips are always expected to be positioned relative to (0,0) in the page,
  * in other words, they are not positionned relatively to a parent but relatively
  * to the page.
  * 
*/
tooltips.Tooltip = extend.Class({
	name  :'tooltips.Tooltip',
	parent: widgets.Widget,
	shared: {
		OPTIONS: {"smart":true, "anchor":"N", "tip":undefined, "delay":150},
		TIP_ANCHOR: {"N":"S", "S":"N", "E":"W", "W":"E", "C":"S", "NE":"SW", "NW":"SE", "SE":"NW", "SW":"NE"}
	},
	properties: {
		currentTarget:undefined,
		constraint:undefined,
		handler:undefined,
		showDelayed:undefined,
		hideDelayed:undefined,
		updater:undefined
	},
	initialize: function( ui ){
		var self = this;
		// Default initialization of property `currentTarget`
		if (typeof(self.currentTarget)=='undefined') {self.currentTarget = null;};
		// Default initialization of property `constraint`
		if (typeof(self.constraint)=='undefined') {self.constraint = window;};
		// Default initialization of property `handler`
		if (typeof(self.handler)=='undefined') {self.handler = null;};
		// Default initialization of property `showDelayed`
		if (typeof(self.showDelayed)=='undefined') {self.showDelayed = null;};
		// Default initialization of property `hideDelayed`
		if (typeof(self.hideDelayed)=='undefined') {self.hideDelayed = null;};
		// Default initialization of property `updater`
		if (typeof(self.updater)=='undefined') {self.updater = null;};
		self.getSuper(__module__.Tooltip.getParent())(ui);
		self.hideDelayed = new events.Delayed(function() {
			return self._hide();
		}, self.options.delay, false);
		self.uis.tip = self.ui.find("> .tip");
		var anchor = self.options.anchor.split(",");
		if (extend.len(anchor) == 2) {
			var x = parseFloat(anchor[0]);
			var y = parseFloat(anchor[1]);
			if (!(isNaN(x) || isNaN(y))) {
				self.options.anchor = [x, y];
			}
		} else {
			self.options.anchor = self.options.anchor.toUpperCase();
		}
		if (typeof(interaction) != "undefined") {
			self.handler = interaction.handle({"mouse":{"in":function(e) {
				return self.show(e.originalTarget);
			}, "out":function(e) {
				return self.hide();
			}}});
		}
	},
	methods: {
		hasBounds: function(bounds) {
			var self = this;
			if (self.cache.bounds) {
				return (extend.cmp(bounds, self.cache.bounds) == 0);
			} else {
				return false;
			}
		},
		
		hasTarget: function(element) {
			var self = this;
			return ((element && self.currentTarget) && (widgets.asElement(element) == widgets.asElement(self.currentTarget)));
		},
		
		setConstraint: function(constraint) {
			var self = this;
			self.constraint = constraint;
			return self;
		},
		
		setAnchor: function(anchor) {
			var self = this;
			self.options.anchor = anchor;
			return self;
		},
		
		getAnchor: function() {
			var self = this;
			return self.options.anchor;
		},
		
		/**
		  * Returns the anchor name for the tip on the tooltip's UI.
		  * 
		*/
		getTipAnchor: function() {
			var self = this;
			return (self.options.tip || self.getClass().TIP_ANCHOR[self.getAnchor()]);
		},
		
		/**
		  * Returns the bounds covered by the tooltip on the targetBounds
		  * 
		*/
		getPosition: function(targetBounds) {
			var self = this;
			if (targetBounds === undefined) {targetBounds=self.cache.bounds}
			var anchor = self.getClass().getOperation('GetAnchorPosition')(self.getAnchor(), targetBounds);
			var b = dimension.bounds(self.ui);
			var delta = self.getClass().getOperation('GetAnchorPosition')(self.getTipAnchor(), b);
			anchor.x = (anchor.x - (delta.x - b.x));
			anchor.y = (anchor.y - (delta.y - b.y));
			anchor.width = b.width;
			anchor.height = b.height;
			return anchor;
		},
		
		show: function(element, force) {
			var self = this;
			if (element === undefined) {element=undefined}
			if (force === undefined) {force=false}
			self.hideDelayed.cancel();
			var target_bounds = self.cache.targetBounds;
			if (dimension.isEvent(element)) {
				self.currentTarget = element.target;
				target_bounds = dimension.bounds(element);
			} else if (element) {
				element = widgets.asElement(element);
				self.currentTarget = element;
				target_bounds = self._normalizeBounds(element);
			}
			if (!target_bounds) {
				return false;
			}
			if (self.updater) {
				self.updater(self);
			}
			var tip_anchor = self.getTipAnchor();
			if (force || (!self.hasBounds(target_bounds))) {
				self.cache.targetBounds = target_bounds;
				var position = self.getPosition(target_bounds);
				if (self.options.smart) {
					var delta = dimension.fit(position, dimension.bounds(self.constraint));
					if (self.uis.tip.length > 0) {
						if ((tip_anchor == "N") || (tip_anchor == "S")) {
							self.uis.tip.css("margin-left", ((0 - delta[0]) + "px"));
						} else {
							self.uis.tip.css("margin-top", ((0 - delta[1]) + "px"));
						}
					}
				}
				self._applyPosition(position, null);
			}
			self.ui.attr("data-tip", tip_anchor);
			self._show();
		},
		
		/**
		  * Updates the position of the tooltip if it was shown before. The typical
		  * use case is when the current target has moved on screen and you would
		  * like to update the tooltip's position. Note that his is not optimization
		  * for real-time animation.
		  * 
		*/
		update: function() {
			var self = this;
			if (self.currentTarget) {
				self.show(self.currentTarget);
				return true;
			} else {
				return false;
			}
		},
		
		hide: function() {
			var self = this;
			self.hideDelayed.push();
		},
		
		_show: function() {
			var self = this;
			self.ui.removeClass("hidden");
		},
		
		_hide: function() {
			var self = this;
			self.ui.addClass("hidden");
			self.currentTarget = null;
		},
		
		isVisible: function() {
			var self = this;
			return (!self.ui.hasClass("hidden"));
		},
		
		_applyPosition: function(position, correction) {
			var self = this;
			var e = dimension.E(self.ui);
			var parent = dimension.position(self.ui.parent());
			e.style.left = (((0 - parent.x) + (position.x + ((correction && correction.x) || 0))) + "px");
			e.style.top = (((0 - parent.y) + position.y) + "px");
			var t = dimension.E(self.uis.tip);
			if (t) {
				if ((self.options.tipAnchor == "S") || (self.options.tipAnchor == "N")) {
					t.style.left = ((self.cache.targetBounds.width + correction.x) + "px");
				} else {
					t.style.left = null;
				}
			}
		},
		
		/**
		  * Nornmalizes the given bounds. Bounds can be a DOM/SVG node, a jQuery
		  * selection, a {x,y,width,height} map or [x,y,width,height] array.
		  * 
		*/
		_normalizeBounds: function(bounds) {
			var self = this;
			if (!bounds) {
				return null;
			} else if (bounds.nodeName || bounds.jquery) {
				bounds = dimension.bounds(bounds);
			} else if (extend.isList(bounds)) {
				bounds = {"x":bounds[0], "y":bounds[1], "width":(bounds[2] || 1), "height":(bounds[3] || 1)};
			} else {
				extend.error("Tooltip._normalizeBounds: type not supported");
			}
			return bounds;
		}
	},
	operations:{
		GetAnchorPosition: function( location, bounds ){
			var self = this;
			return dimension.corner(bounds, location);
		}
	}
})
tooltips.init = function(){
	var self = tooltips;
}
if (typeof(tooltips.init)!="undefined") {tooltips.init();}

// START:VANILLA_POSTAMBLE
return tooltips;})(tooltips);
// END:VANILLA_POSTAMBLE
