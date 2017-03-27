// 8< ---[dimension.js]---
// START:VANILLA_PREAMBLE
var dimension=typeof(extend)!='undefined' ? extend.module('dimension') : (typeof(dimension)!='undefined' ? dimension : {});
(function(dimension){
var __module__=dimension;
// END:VANILLA_PREAMBLE

dimension.__VERSION__='0.5.2';
dimension.CORNERS = {"N":[0.5, 0.0], "S":[0.5, 1.0], "E":[1.0, 0.5], "W":[0.0, 0.5], "C":[0.5, 0.5], "NE":[1.0, 0.0], "NW":[0.0, 0.0], "SE":[1.0, 1.0], "SW":[0.0, 1.0]};
dimension.width = function(element){
	var self = dimension;
	element = __module__.E(element);
	if (!element) {
		return 0;
	} else {
		return element.getBoundingClientRect().width;
	}
}
dimension.height = function(element){
	var self = dimension;
	element = __module__.E(element);
	if (!element) {
		return 0;
	} else {
		return element.getBoundingClientRect().height;
	}
}
dimension.size = function(element){
	var self = dimension;
	element = __module__.E(element);
	if (!element) {
		return {"width":0, "height":0};
	} else if (element === window) {
		return {"width":window.innerWidth, "height":window.innerHeight};
	} else {
		var b = element.getBoundingClientRect();
		return {"width":b.width, "height":b.height};
	}
}
dimension.sizeA = function(element){
	var self = dimension;
	var r = __module__.size(element);
	return [r.width, r.height];
}
dimension.ratio = function(element){
	var self = dimension;
	var s = __module__.size(element);
	return (s.width / s.height);
}
dimension.bounds = function(element, parent){
	var self = dimension;
	if (parent === undefined) {parent=document}
	element = __module__.E(element);
	parent = __module__.E(parent);
	if (element === window) {
		return {"x":0, "y":0, "width":window.innerWidth, "height":window.innerHeight};
	} else if (element === document) {
		return {"x":0, "y":0, "width":window.innerWidth, "height":window.innerHeight};
	} else if (__module__.isSVG(element)) {
		var b = element.getBoundingClientRect();
		var x = (b.left + window.pageXOffset);
		var y = (b.top + window.pageYOffset);
		if (parent) {
			var p = __module__.position(parent);
			x = (x - p.x);
			y = (y - p.y);
		}
		return {"x":x, "y":y, "width":b.width, "height":b.height};
	} else if (__module__.isEvent(element)) {
		var r = __module__.position(element, parent);
		r.width = 0;
		r.height = 0;
		return r;
	} else {
		var r = __module__.size(element);
		var p = __module__.position(element, parent);
		r.x = p.x;
		r.y = p.y;
		return r;
	}
}
dimension.boundsA = function(element, parent){
	var self = dimension;
	if (parent === undefined) {parent=undefined}
	var r = __module__.bounds(element, parent);
	return [r.x, r.y, r.width, r.height];
}
dimension.center = function(element, parent){
	var self = dimension;
	if (parent === undefined) {parent=undefined}
	var b = __module__.bounds(element, parent);
	return {"x":(b.x + (b.width / 2)), "y":(b.y + (b.height / 2))};
}
dimension.centerA = function(element, parent){
	var self = dimension;
	if (parent === undefined) {parent=undefined}
	var r = __module__.center();
	return [r.x, r.y];
}
dimension.position = function(element, parent){
	var self = dimension;
	if (parent === undefined) {parent=document}
	parent = __module__.E(parent);
	element = __module__.E(element);
	var x = 0;
	var y = 0;
	if (!element) {
		return null;
	} else if (__module__.isSVG(element)) {
		var b = element.getBoundingClientRect();
		x = (b.left + (window.pageXOffset || 0));
		y = (b.top + (window.pageYOffset || 0));
		if (parent) {
			var parent_pos = __module__.position(parent);
			x = (x - parent_pos.x);
			y = (y - parent_pos.y);
		}
		return {"x":x, "y":y};
	} else if (__module__.isEvent(element)) {
		if (element.original) {
			element = element.original;
		}
		var x = element.clientX;
		var y = element.clientY;
		if (parent) {
			var b = parent.getBoundingClientRect();
			x = (x - b.left);
			y = (y - b.top);
		}
		return {"x":x, "y":y};
	} else {
		var node = element;
		while ((node && (node != parent))) {
			x = (x + node.offsetLeft);
			y = (y + node.offsetTop);
			node = node.offsetParent;
		}
		if ((parent && (parent != element)) && (parent != document)) {
			var pos = __module__.position(parent);
			x = (x - pos.x);
			y = (y - pos.y);
		}
		return {"x":x, "y":y};
	}
}
dimension.positionA = function(element, parent){
	var self = dimension;
	if (parent === undefined) {parent=document}
	var p = __module__.position(element, parent);
	return [p.x, p.y];
}
/**
  * Returns the `{x,y}` position of the indicated corner, where
  * the `ox` and `oy` are `0-1` proportional offsets of respectively
  * the element's width & height. If `ox` is a string, it will be resolved
  * from the `CORNERS` map (`N` for north, `SE` for south-east, etc).
  * 
*/
dimension.corner = function(element, ox, oy){
	var self = dimension;
	if (ox === undefined) {ox=0}
	if (oy === undefined) {oy=0}
	var b = element;
	if (!__module__.isBounds(b)) {
		b = __module__.bounds(element);
	}
	if (extend.isString(ox)) {
		var c = __module__.CORNERS[ox];
		!(c) && extend.assert(false, "dimension.corner:", (("dimension.corner: cannot find CORNER[" + ox) + "]"), "(failed `c`)");
		ox = c[0];
		oy = c[1];
	} else if (extend.isList(ox)) {
		oy = ox[1];
		ox = ox[0];
	} else if (extend.isMap(ox)) {
		oy = ox.y;
		ox = ox.x;
	}
	return {"x":(b.x + (ox * b.width)), "y":(b.y + (oy * b.height))};
}
/**
  * Alters the given correction {x:0,y:0} offset so that the given bounds fit
  * in the region.
  * 
*/
dimension.fit = function(a, b){
	var self = dimension;
	var x = a.x;
	var y = a.y;
	a.x = Math.max(a.x, b.x);
	a.y = Math.max(a.y, b.y);
	a.x = Math.min(a.x, ((b.x + b.width) - a.width));
	a.y = Math.min(a.y, ((b.y + b.height) - a.height));
	return [(a.x - x), (a.y - y)];
}
/**
  * Tells if the given value is an event
  * 
*/
dimension.isEvent = function(element){
	var self = dimension;
	if (!element) {
		return false;
	}
	if (extend.isDefined(element.nodeType)) {
		return false;
	}
	return (element && (extend.isDefined(element.target) || (extend.isDefined(element.original) && extend.isDefined(element.target))));
}
/**
  * Tells if the given node is an SVG node or not
  * 
*/
dimension.isSVG = function(element){
	var self = dimension;
	if (element.jquery) {
		element = element[0];
	}
	return (typeof(element.getBBox) != "undefined");
}
/**
  * Tells if the given value is a bounds `{x,y,width,height}` object or not.
  * 
*/
dimension.isBounds = function(value){
	var self = dimension;
	return ((((value && extend.isDefined(value.x)) && extend.isDefined(value.x)) && extend.isDefined(value.width)) && extend.isDefined(value.height));
}
dimension.eventPosition = function(event, element){
	var self = dimension;
	if (element === undefined) {element=null}
	var p = __module__.eventPositionA(event, element);
	return {"x":p[0], "y":p[1]};
}
dimension.eventPositionA = function(event, element){
	var self = dimension;
	if (element === undefined) {element=null}
	var x = event.pageX;
	var y = event.pageY;
	if (element) {
		var p = __module__.positionA(element);
		x = (x - p[0]);
		y = (y - p[1]);
	}
	return [x, y];
}
/**
  * Extracts the given element (will unwrap jQuery)
  * 
*/
dimension.E = function(element){
	var self = dimension;
	if (element && element.jquery) {
		element = element[0];
	}
	if (element && element.isSelection) {
		element = element[0];
	}
	if (!element) {
		return null;
	}
	if (element.target) {
		return element;
	}
	if (element == document) {
		return document.body;
	}
	if (element && (element.nodeType == Node.TEXT_NODE)) {
		element = element.parentNode;
	}
	return element;
}
dimension.init = function(){
	var self = dimension;
}
if (typeof(dimension.init)!="undefined") {dimension.init();}

// START:VANILLA_POSTAMBLE
return dimension;})(dimension);
// END:VANILLA_POSTAMBLE
