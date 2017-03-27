// 8< ---[sfm.js]---
// START:VANILLA_PREAMBLE
var sfm=typeof(extend)!='undefined' ? extend.module('sfm') : (typeof(sfm)!='undefined' ? sfm : {});
(function(sfm){
var Widget = widgets.Widget;
var T = widgets.T;
var $ = widgets.$;
var Application = app.Application;
var URL = app.URL;
var APP = app.APP;
var ON = app.ON;
var Date = dates.Date;
var __module__=sfm;
// END:VANILLA_PREAMBLE

/**
  * A wrapper around a quadtree that allows to quickly find locations within
  * the map.
  * 
*/
sfm.Locations = extend.Class({
	name  :'sfm.Locations',
	parent: undefined,
	shared: {
		Instance: null
	},
	properties: {
		region:undefined,
		byName:undefined
	},
	initialize: function(  ){
		var self = this;
		// Default initialization of property `region`
		if (typeof(self.region)=='undefined') {self.region = new quadtree.Region(360, 180, -180, -90);};
		// Default initialization of property `byName`
		if (typeof(self.byName)=='undefined') {self.byName = {};};
		self.getClass().Instance = self;
	},
	methods: {
		setLocations: function(l) {
			var self = this;
			// Iterates over `l`. This works on array,objects and null/undefined
			var __k=l;
			var __l=__k instanceof Array ? __k : Object.getOwnPropertyNames(__k||{});
			var __o=__l.length;
			for (var __m=0;__m<__o;__m++){
				var __j=(__l===__k)?__m:__l[__m];
				var __i=__k[__j];
				// This is the body of the iteration with (value=__i, key/index=__j) in __k
				self.getMethod('addLocation') (__i, __j, __k)
			}
			return self;
		},
		
		addLocation: function(location) {
			var self = this;
			var p = location.geometry.coordinates;
			self.region.add(location.geometry.coordinates, location);
			return self;
		},
		
		clear: function() {
			var self = this;
			self.region.clear();
			return self;
		},
		
		queryWithinMap: function(m) {
			var self = this;
			var r = m.getLngLatExtent();
			return self.region.getWithin(r);
		}
	}
})
/**
  * Base class used by `Map` (the main map) and the `MiniMap`
  * 
*/
sfm.AbstractMap = extend.Class({
	name  :'sfm.AbstractMap',
	parent: widgets.Widget,
	shared: {
		STATES: {"scope":["world", "country"]},
		UIS: {"graph":".graph", "svg":".graph > svg", "tooltips":".tooltips"},
		OPTIONS: {"defaultZoom":3, "defaultCenter":{"lat":0, "lon":0}, "world":true, "countries":true, "organizations":true, "locations":true, "events":true, "interaction":true, "relayout":false}
	},
	properties: {
		_map:undefined,
		_mapInteraction:undefined,
		_layerWorld:undefined,
		_layerCountries:undefined,
		_layerOrganizations:undefined,
		_layerOrganizationsFocus:undefined,
		_layerLocations:undefined,
		_layerEvents:undefined,
		handlers:undefined,
		cache:undefined,
		on:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `handlers`
		if (typeof(self.handlers)=='undefined') {self.handlers = {"ui":{"mouse":{"up":self.getMethod('onInteract') }, "touch":{"end":self.getMethod('onInteract') }}, "country":{"press":self.getMethod('onCountrySelected') , "mouse":{"in":self.getMethod('onCountryIn') , "out":self.getMethod('onCountryOut') }}, "event":{"press":self.getMethod('onEventSelected') , "mouse":{"in":self.getMethod('onEventIn') , "out":self.getMethod('onEventOut') }}, "location":{"press":self.getMethod('onLocationSelected') , "mouse":{"in":self.getMethod('onLocationIn') , "out":self.getMethod('onLocationOut') }}, "organization":{"press":self.getMethod('onOrganizationSelected') , "mouse":{"in":self.getMethod('onOrganizationIn') , "out":self.getMethod('onOrganizationOut') }}};};
		// Default value for property `cache`
		if (typeof(self.cache)=='undefined') {self.cache = {"selectedCountry":null, "selectedEvent":null, "selectedOrganization":null, "focusedEvent":null, "focusedCountry":null, "countriesByID":{}, "organizationByID":{}, "organizationFocusByID":{}, "eventByID":{}, "locationByID":{}, "eventIndexByID":{}, "data":null};};
		// Default value for property `on`
		if (typeof(self.on)=='undefined') {self.on = events.create(["elementSelected", "elementIn", "elementOut"]);};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.AbstractMap.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.AbstractMap.getParent()).bindUI();
			self.handlers.ui.bind(self.ui);
			var po = org.polymaps;
			if (self.uis.svg.length == 0) {
				var s = svg.svg({"width":"100%", "height":"100%"}, svg.defs(svg.path({"id":"EventMarker", "_":"event-path", "d":"m 7.7958785,-13.516439 c 0,-4.418367 -3.581929,-8.000296 -8.00029687,-8.000296 -4.41836783,0 -7.99970213,3.581929 -7.99970213,8.000296 0,3.6479637 2.4432789,6.7188697 5.7812972,7.6814277 L 2.2932988e-4,0.00637079 2.1288035,-5.8641623 c 3.279718,-0.998847 5.667076,-4.045956 5.667076,-7.6522767"})));
				s.setAttributeNS("xmlns", "xlink", "http://www.w3.org/1999/xlink");
				self.uis.graph.append(s);
				self.uis.svg = widgets.$(s);
			}
			!((self.uis.svg.length > 0)) && extend.assert(false, "sfm.AbstractMap.bindUI:", (self.getClass().getName() + ": Cannot resolve uis.svg node"), "(failed `(self.uis.svg.length > 0)`)");
			self.uis.graph.append(self.uis.svg);
			self._map = po.map().container(self.uis.svg[0]);
			if (self.options.world) {
				self._layerWorld = po.geoJson();
				self._map.add(self._layerWorld);
				sfm.API.getWorldMap().onSucceed(function(_) {
					return self._layerWorld.features(_.features);
				});
			}
			self._map.zoomRange([1, 10]).zoom(self.options.defaultZoom);
			self._map.on("move", self.getMethod('onMapMove') );
			widgets.bindEvent(self.inputs.filter, "change", self.getMethod('onFilterChanged') );
			app.ON.ApplicationDataLoaded.bindWithLastEvent(function(d) {
				if (self.options.countries) {
					self._layerCountries = po.geoJson();
					self._layerCountries.on("load", function(event) {
						return self._onCountryFeaturesLoad(event);
					});
					self._layerCountries.features(d.countries);
					self._map.add(self._layerCountries);
				}
				if (self.options.organizations) {
					self._layerOrganizations = po.geoJson();
					self._layerOrganizations.on("load", self.getMethod('_onOrganizationFeaturesLoad') );
					self._map.add(self._layerOrganizations);
					self._layerOrganizationsFocus = po.geoJson();
					self._layerOrganizationsFocus.on("load", self.getMethod('_onOrganizationFocusFeaturesLoad') );
					self._map.add(self._layerOrganizationsFocus);
				}
				if (self.options.locations) {
					self._layerLocations = po.geoJson();
					self._layerLocations.on("load", self.getMethod('_onLocationFeaturesLoad') );
					self._layerLocations.on("show", self.getMethod('_onLocationFeaturesShow') );
					self._map.add(self._layerLocations);
				}
				if (self.options.events) {
					self._layerEvents = po.geoJson();
					self._layerEvents.on("load", self.getMethod('_onEventFeaturesLoad') );
					self._layerEvents.on("show", self.getMethod('_onEventFeaturesShow') );
					self._map.add(self._layerEvents);
				}
				if (self.options.interaction) {
					self._mapInteraction = po.interact();
					self._map.add(self._mapInteraction);
				}
			});
		},
		
		relayout: function() {
			var self = this;
			self.getSuper(__module__.AbstractMap.getParent()).relayout();
			self._map.resize();
			self._updateTooltips();
		},
		
		/**
		  * Hides all tooltips
		  * 
		*/
		hideTooltips: function() {
			var self = this;
			self.cache.currentTooltipOrganization = null;
			self.cache.currentEventTooltip = null;
			self.cache.currentCountryTooltip = null;
		},
		
		/**
		  * Updates the location of the tooltips
		  * 
		*/
		_updateTooltips: function() {
			var self = this;
		},
		
		onFilterChanged: function() {
			var self = this;
			var f = self.get("filter");
			var o = widgets.Selector.Get(self.inputs.filter).getOptions();
			var no = extend.difference(o, f);
			// Iterates over `f`. This works on array,objects and null/undefined
			var __p=f;
			var __q=__p instanceof Array ? __p : Object.getOwnPropertyNames(__p||{});
			var __s=__q.length;
			for (var __r=0;__r<__s;__r++){
				var __n=(__q===__p)?__r:__q[__r];
				var _=__p[__n];
				// This is the body of the iteration with (value=_, key/index=__n) in __p
				self.ui.removeClass(("no-" + _));
			}
			// Iterates over `no`. This works on array,objects and null/undefined
			var __u=no;
			var __v=__u instanceof Array ? __u : Object.getOwnPropertyNames(__u||{});
			var __x=__v.length;
			for (var __w=0;__w<__x;__w++){
				var __t=(__v===__u)?__w:__v[__w];
				var _=__u[__t];
				// This is the body of the iteration with (value=_, key/index=__t) in __u
				self.ui.addClass(("no-" + _));
			}
		},
		
		_onCountryFeaturesLoad: function(event) {
			var self = this;
			widgets.$(event.tile.element).addClass("countries");
			var current_country = self.getSelectedCountry();
			self._helperFeaturesLoad(event, function(_, d, e) {
				e.addClass("country").toggleClass("selected", (d.id == current_country));
				self.cache.countriesByID[d.id] = (self.cache.countriesByID[d.id] || []);
				self.cache.countriesByID[d.id].push(_.element);
				return self.handlers.country.bind(e);
			});
		},
		
		getSelectedOrganization: function() {
			var self = this;
			return sfm.API.getCurrentOrganization();
		},
		
		_onOrganizationFeaturesLoad: function(event) {
			var self = this;
			widgets.$(event.tile.element).addClass("organizations");
			var current_organization = self.getSelectedOrganization();
			self._helperFeaturesLoad(event, function(_, d, e) {
				e.addClass("organization").toggleClass("selected", (d.id == current_organization));
				self.cache.organizationByID[d.id] = (self.cache.organizationByID[d.id] || []);
				self.cache.organizationByID[d.id].push(_.element);
				return self.handlers.organization.bind(e);
			});
		},
		
		_onOrganizationFocusFeaturesLoad: function(event) {
			var self = this;
			widgets.$(event.tile.element).addClass("organizations").addClass("focused");
			var current_organization = self.getSelectedOrganization();
			self._helperFeaturesLoad(event, function(_, d, e) {
				e.addClass("organization").addClass("focused").toggleClass("selected", (d.id == current_organization));
				self.cache.organizationFocusByID[d.id] = (self.cache.organizationFocusByID[d.id] || []);
				self.cache.organizationFocusByID[d.id].push(_.element);
				return self.handlers.organization.bind(e);
			});
		},
		
		getSelectedEvent: function() {
			var self = this;
			return sfm.API.getCurrentEvent();
		},
		
		_onEventFeaturesLoad: function(event) {
			var self = this;
			widgets.$(event.tile.element).addClass("events");
			var current_event = self.getSelectedEvent();
			self._helperFeaturesLoad(event, function(_, d, e) {
				var x = parseInt(e.attr("cx"));
				var y = parseInt(e.attr("cy"));
				var p = e.parent();
				var u = svg.use();
				var i = self.cache.eventIndexByID[d.id];
				var t = svg.text(widgets.FORMATTERS.index(i));
				var g = widgets.$(svg.g(e, u, t));
				e.attr("r", "4.5");
				u.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#EventMarker");
				p.append(g);
				g.attr("transform", e.attr("transform")).data(e.data()).addClass("event").toggleClass("selected", (d.id == current_event)).toggleClass("focused", (d.id == self.cache.focusedEvent));
				e.attr("transform", "");
				self.cache.eventByID[d.id] = (self.cache.eventByID[d.id] || []);
				self.cache.eventByID[d.id].push(g[0]);
				return self.handlers.event.bind(g[0]);
			});
		},
		
		_onEventFeaturesShow: function(event) {
			var self = this;
			// Iterates over `event.features`. This works on array,objects and null/undefined
			var __z=event.features;
			var __a=__z instanceof Array ? __z : Object.getOwnPropertyNames(__z||{});
			var __c=__a.length;
			for (var __b=0;__b<__c;__b++){
				var __y=(__a===__z)?__b:__a[__b];
				var _=__z[__y];
				// This is the body of the iteration with (value=_, key/index=__y) in __z
				var g = _.element.parentNode;;
				var t = widgets.$(g).find("text");;
				graphing.SVG.Center(t[0], [1.5, -3]);
			}
		},
		
		_onLocationFeaturesLoad: function(event) {
			var self = this;
			widgets.$(event.tile.element).addClass("locations");
			self._helperFeaturesLoad(event, function(_, d, e) {
				var p = e.parent();
				var circle = e.find("circle");
				var u = svg.use();
				var uf = svg.use();
				u.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#InstallationMarker");
				uf.setAttribute("class", "unfocused");
				uf.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#InstallationMarkerFocused");
				uf.setAttribute("class", "focused");
				e.append(u);
				e.append(uf);
				e.attr("class", "location");
				e.attr("title", d.id);
				e.attr("transform", circle.attr("transform"));
				circle.attr("transform", "");
				self.cache.locationByID[d.id] = (self.cache.locationByID[d.id] || []);
				self.cache.locationByID[d.id].push(e);
				return self.handlers.location.bind(p);
			});
		},
		
		_onLocationFeaturesShow: function(event) {
			var self = this;
			// Iterates over `event.features`. This works on array,objects and null/undefined
			var __e=event.features;
			var __f=__e instanceof Array ? __e : Object.getOwnPropertyNames(__e||{});
			var __h=__f.length;
			for (var __g=0;__g<__h;__g++){
				var __d=(__f===__e)?__g:__f[__g];
				var _=__e[__d];
				// This is the body of the iteration with (value=_, key/index=__d) in __e
				var g = _.element.parentNode;;
				graphing.SVG.Center(g, [1.5, -3]);
			}
		},
		
		/**
		  * A helper used by the `_onEventXXXLoad` handlers. Iterates through
		  * the features, invoking `callback(feautre, datum, element)`.
		  * 
		*/
		_helperFeaturesLoad: function(event, callback) {
			var self = this;
			// Iterates over `event.features`. This works on array,objects and null/undefined
			var __jj=event.features;
			var __kj=__jj instanceof Array ? __jj : Object.getOwnPropertyNames(__jj||{});
			var __mj=__kj.length;
			for (var __lj=0;__lj<__mj;__lj++){
				var __ij=(__kj===__jj)?__lj:__kj[__lj];
				var _=__jj[__ij];
				// This is the body of the iteration with (value=_, key/index=__ij) in __jj
				if (_.data.id) {
					var d = extend.copy(_.data.properties);
					d.id = _.data.id;
					d.bbox = _.data.bbox;
					var e = widgets.$(_.element);
					e.data(d);
					callback(_, d, e);
				};
			}
		},
		
		onMapMove: function(event) {
			var self = this;
			self.hideTooltips();
		},
		
		onInteract: function(event) {
			var self = this;
			self._updateTooltips();
		},
		
		/**
		  * A generic method that can set organizations, events and, locations
		  * as focused based on the `etype`
		  * 
		*/
		setFocusedElement: function(eid, etype) {
			var self = this;
			if (etype == "country") {
				setFocusedCountry(eid);
				return true;
			} else if (etype == "organization") {
				self.setFocusedOrganization(eid);
				return true;
			} else if (etype == "event") {
				self.setFocusedEvent(eid);
				return true;
			} else if (etype == "location") {
				setFocusedLocation(eid);
				return true;
			} else {
				return false;
			}
		},
		
		onCountrySelected: function(event) {
			var self = this;
			var d = widgets.$(interaction.target(event.target, "country", self.uis.svg)).data();
			self.on.elementSelected.trigger({"type":"country", "data":self.data, "event":event}, self);
		},
		
		onCountryIn: function(event) {
			var self = this;
		},
		
		onCountryOut: function(event) {
			var self = this;
		},
		
		getSelectedCountry: function() {
			var self = this;
			return self.cache.selectedCountry;
		},
		
		setSelectedCountry: function(country) {
			var self = this;
			var nodes = self.cache.countriesByID[country];
			if (self.cache.selectedCountry && (self.cache.selectedCountry != country)) {
				widgets.$(self.cache.countriesByID[self.cache.selectedCountry]).removeClass("selected");
			}
			if (nodes) {
				if (self.cache.selectedCountry != country) {
					widgets.$(nodes).addClass("selected");
					self.cache.selectedCountry = country;
					return true;
				}
			} else {
				self.cache.selectedCountry = null;
			}
			return false;
		},
		
		_triggerUIEvent: function(event, source, elementType) {
			var self = this;
			var t = widgets.$(interaction.target(event, elementType, self.uis.svg));
			source.trigger({"type":elementType, "id":t.data("id"), "element":t}, self);
			return t;
		},
		
		onOrganizationSelected: function(event) {
			var self = this;
			var e = self._triggerUIEvent(event, self.on.elementSelected, "organization");
			var oid = widgets.$(e).data("id");
			if (oid) {
				sfm.API.setCurrentOrganization(oid);
			}
			return e;
		},
		
		onOrganizationIn: function(event) {
			var self = this;
			return self._triggerUIEvent(event, self.on.elementIn, "organization");
		},
		
		onOrganizationOut: function(event) {
			var self = this;
			return self._triggerUIEvent(event, self.on.elementOut, "organization");
		},
		
		setFocusedOrganization: function(oid) {
			var self = this;
			var p = function(_) {
				return (!widgets.$(_).parents("body").isEmpty());
			};
			var n = extend.first(self.cache.organizationByID[oid], p);
			var location = self.cache.locationByID[oid];
			n = (n || extend.first((self.cache.organizationFocusByID && self.cache.organizationFocusByID[oid]), p));
			if (self.cache.focusedLocation) {
				// Iterates over `self.cache.focusedLocation`. This works on array,objects and null/undefined
				var __nj=self.cache.focusedLocation;
				var __pj=__nj instanceof Array ? __nj : Object.getOwnPropertyNames(__nj||{});
				var __rj=__pj.length;
				for (var __qj=0;__qj<__rj;__qj++){
					var __oj=(__pj===__nj)?__qj:__pj[__qj];
					var _=__nj[__oj];
					// This is the body of the iteration with (value=_, key/index=__oj) in __nj
					_.removeClass("focused");
				}
			}
			if (location) {
				self.cache.focusedLocation = [];
				// Iterates over `location`. This works on array,objects and null/undefined
				var __tj=location;
				var __uj=__tj instanceof Array ? __tj : Object.getOwnPropertyNames(__tj||{});
				var __wj=__uj.length;
				for (var __vj=0;__vj<__wj;__vj++){
					var __sj=(__uj===__tj)?__vj:__uj[__vj];
					var l=__tj[__sj];
					// This is the body of the iteration with (value=l, key/index=__sj) in __tj
					l = widgets.$(l);
					l.addClass("focused");
					self.cache.focusedLocation.push(l);
				}
			}
			if (self.cache.focusedOrganization) {
				self.cache.focusedOrganization.removeClass("focused");
			}
			if (!oid) {
				self.setFocusedOrganizations();
				return false;
			} else if (n) {
				n = widgets.$(n);
				n.addClass("focused");
				self.cache.focusedOrganization = n;
				return n;
			} else {
				if (self.cache.organizationFuture) {
					self.cache.organizationFuture.cancel();
				}
				self.cache.organizationFuture = sfm.API.getOrganizationLatestMap(oid).onSucceed(function(d) {
					if (d.area.geometry) {
						self.setFocusedOrganizations([d.area]);
					} else {
					
					}
				});
				return false;
			}
		},
		
		setSelectedOrganization: function(org) {
			var self = this;
			if (org != self.cache.selectedOrganization) {
				widgets.$(self.cache.organizationByID[self.cache.selectedOrganization]).removeClass("selected");
				widgets.$(self.cache.organizationByID[org]).addClass("selected");
				self.cache.selectedOrganization = org;
			}
		},
		
		onEventSelected: function(event) {
			var self = this;
			var e = self._triggerUIEvent(event, self.on.elementSelected, "event");
			var eid = widgets.$(e).data("id");
			if (eid) {
				sfm.API.setCurrentEvent(eid);
			}
			return e;
		},
		
		onEventIn: function(event) {
			var self = this;
			return self._triggerUIEvent(event, self.on.elementIn, "event");
		},
		
		onEventOut: function(event) {
			var self = this;
			return self._triggerUIEvent(event, self.on.elementOut, "event");
		},
		
		onEventFocused: function(eid) {
			var self = this;
		},
		
		setFocusedEvent: function(eid) {
			var self = this;
			var n = extend.first(self.cache.eventByID[eid], function(_) {
				return (!widgets.$(_).parents("body").isEmpty());
			});
			var p = extend.first(self.cache.eventByID[self.cache.focusedEvent], function(_) {
				return (!widgets.$(_).parents("body").isEmpty());
			});
			widgets.$(p).removeClass("focused");
			self.cache.focusedEvent = eid;
			if (n) {
				n = widgets.$(n);
				n.parent().append(n);
				var d = n.addClass("focused").data();
				return n[0];
			} else {
				return null;
			}
		},
		
		setSelectedEvent: function(evt) {
			var self = this;
			if (evt != self.cache.selectedEvent) {
				widgets.$(self.cache.eventByID[self.cache.selectedEvent]).removeClass("selected");
				widgets.$(self.cache.eventByID[evt]).addClass("selected");
				self.cache.selectedEvent = evt;
			}
		},
		
		onLocationSelected: function(event) {
			var self = this;
			var t = widgets.$(interaction.target(event, "location", self.uis.svg));
			var oid = t.data("id");
			self.on.elementSelected.trigger({"type":"organization", "id":oid, "element":t}, self);
			if (oid) {
				sfm.API.setCurrentOrganization(oid);
			}
			return event;
		},
		
		onLocationIn: function(event) {
			var self = this;
			var t = widgets.$(interaction.target(event, "location", self.uis.svg));
			var oid = t.data("id");
			self.on.elementIn.trigger({"type":"organization", "id":oid, "element":t}, self);
			return t;
		},
		
		onLocationOut: function(event) {
			var self = this;
			var t = widgets.$(interaction.target(event, "location", self.uis.svg));
			var oid = t.data("id");
			self.on.elementOut.trigger({"type":"organization", "id":oid, "element":t}, self);
			return t;
		},
		
		/**
		  * Returns the geom Rect2D `[x,y,w,h]` lat/lng bounds covered by the map at the current
		  * dimension
		  * 
		*/
		getLngLatExtent: function() {
			var self = this;
			var e = self._map.extent();
			return geom.Rect.Create2D(e[0].lon, e[0].lat, (e[1].lon - e[0].lon), (e[1].lat - e[0].lat));
		},
		
		zoomIn: function() {
			var self = this;
			self._map.zoom((self._map.zoom() + 1));
			return self._map.zoom();
		},
		
		zoomOut: function() {
			var self = this;
			self._map.zoom((self._map.zoom() - 1));
			return self._map.zoom();
		},
		
		/**
		  * Loads the events in the country, which allows to number them properly
		  * 
		*/
		loadEvents: function(country) {
			var self = this;
			if (country === undefined) {country=undefined}
			if (!self.options.events) {
				return null;
			}
			if (self.cache.loadEventsFuture) {
				self.cache.loadEventsFuture.cancel();
				self.cache.loadEventsFuture = undefined;
			}
			self.cache.loadEventsFuture = sfm.API.listTimelineEvents(country).onSucceed(function(d) {
				var events = extend.reduce(d, function(r, _) {
					_ = extend.copy(_);
					_.properties.start_date = sfm.API.parseDate(_.properties.start_date);
					_.date = _.properties.start_date;
					if (_.properties.start_date) {
						r.push(_);
					}
					return r;
				}, []);
				events = stats.sorted(events, "get:date");
				var events_by_id = extend.reduce(events, function(r, _, i) {
					r[_.id] = i;
					return r;
				}, {});
				self.cache.eventIndexByID = events_by_id;
				return self.setEvents(events);
			});
			return self.cache.loadEventsFuture;
		},
		
		/**
		  * locations are used for installations, I'm not 100% this is what locations where
		  * intended for initially or not.
		  * 
		*/
		loadLocations: function(country, date) {
			var self = this;
			if (country === undefined) {country=undefined}
			if (date === undefined) {date=sfm.Connector.DEFAULT_DATE}
			if (!self.options.locations) {
				return null;
			}
			if (self.cache.loadLocationsFuture) {
				self.cache.loadLocationsFuture.cancel();
				self.cache.loadLocationsFuture = undefined;
			}
			self.cache.locationsCountry = country;
			self.cache.loadLocationsFuture = sfm.API.getCountryInstallations(country, date).onSucceed(self.getMethod('setLocations') );
			return self.cache.loadLocationsFuture;
		},
		
		/**
		  * Loads the detailed map for the given country. The date should be either
		  * and iso date or date tuple.
		  * 
		*/
		loadMap: function(country, date) {
			var self = this;
			if (country === undefined) {country=undefined}
			if (date === undefined) {date=undefined}
			if (!self.options.countries) {
				return null;
			}
			if (self.cache.loadMapFuture) {
				self.cache.loadMapFuture.cancel();
				self.cache.loadMapFuture = undefined;
			}
			self.ui.addClass("no-animation");
			self.ui.addClass("loading");
			date = (date || extend.map(sfm.Connector.DEFAULT_DATE.split("-"), function(_0) {
				return parseInt(_0);
			}));
			!((extend.isList(date) || (!date))) && extend.assert(false, "sfm.AbstractMap.loadMap:", "Map.loadMap: date is expected to be either a list or nothing, got:", date, "(failed `(extend.isList(date) || (!date))`)");
			self.cache.selectedDate = date;
			self.cache.loadMapFuture = sfm.API.getCountryMap(country, date).onSucceed(function(_) {
				self.cache.data = _;
				self.ui.removeClass("no-animation");
				self.setOrganizations(_.organizations);
				return self.ui.removeClass("loading");
			}).onFail(function() {
				self.ui.removeClass("no-animation");
				return self.ui.removeClass("loading");
			});
			return self.cache.loadMapFuture;
		},
		
		setOrganizations: function(d) {
			var self = this;
			if (self.options.organizations) {
				var f = self.getOrganizationFilter();
				d = extend.filter(d, function(org) {
					if ((extend.isIn("any",f))) {
						return true;
					}
					return (extend.len(extend.intersection(org.properties.classifications, f)) > 0);
				});
				self.cache.organizationByID = {};
				self._layerOrganizations.features(d);
			}
		},
		
		getOrganizationFilter: function() {
			var self = this;
			var classifications = (app.URL.get("classifications") || "any");
			if (extend.isString(classifications)) {
				classifications = classifications.split(",");
			}
			return classifications;
		},
		
		setFocusedOrganizations: function(d) {
			var self = this;
			if (self.options.organizations) {
				self.cache.organizationFocusByID = {};
				self._layerOrganizationsFocus.features((d || []));
			}
		},
		
		setEvents: function(d) {
			var self = this;
			if (self.options.events) {
				self.cache.eventByID = {};
				self._layerEvents.features(d);
			}
		},
		
		setLocations: function(locations) {
			var self = this;
			var f = self.getOrganizationFilter();
			locations = extend.filter(locations, function(org) {
				if ((extend.isIn("any",f))) {
					return true;
				}
				return (extend.len(extend.intersection(org.properties.properties.classifications, f)) > 0);
			});
			if (self.options.locations) {
				self.cache.locationByID = {};
				self._layerLocations.features(locations);
			}
		},
		
		/**
		  * Focuses on the given country, given by ID
		  * 
		*/
		focusOnCountry: function(country) {
			var self = this;
			self.cache.focusedCountry = country;
			if (country) {
				self.uis.tooltips.removeClass("hidden");
				var c = self.cache.countriesByID[country];
				if (c) {
					var bbox = widgets.$(c[0]).data("bbox");
					if (bbox) {
						var center = {"lat":stats.scale(0.5, [bbox[0].lat, bbox[1].lat]), "lon":stats.scale(0.5, [bbox[0].lon, bbox[1].lon])};
						var ne = self._map.locationPoint(bbox[0]);
						var sw = self._map.locationPoint(bbox[1]);
						var r = geom.Rect.FromPoints([ne.x, ne.y], [sw.x, sw.y]);
						var s = dimension.sizeA(self.ui);
						var f = geom.Rect.FitFactor(r, s[0], s[1], 0.75);
						var zd = Math.floor((Math.log(f) / Math.log(2)));
						self._map.center(center);
						self._map.zoom((self._map.zoom() + zd));
						self.setState("scope", "country");
						return true;
					} else {
						extend.error((self.getClass().getName() + ".focusOnCountry: no `bbox` attribute for country"), country);
						self.setState("scope", "world");
						return false;
					}
				} else {
					extend.error((self.getClass().getName() + ".focusOnCountry: country not found"), country);
					self.setState("scope", "world");
					return false;
				}
			} else {
				self.uis.tooltips.addClass("hidden");
				self._map.center(self.options.defaultCenter);
				self._map.zoom(self.options.defaultZoom);
				self.setState("scope", "world");
				return false;
			}
		}
	}
})

sfm.MiniMap = extend.Class({
	name  :'sfm.MiniMap',
	parent: __module__.AbstractMap,
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.MiniMap.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.MiniMap.getParent()).bindUI();
			app.ON.ApplicationDataLoaded.bindWithLastEvent(function(d) {
				return app.URL.bind(self.getMethod('onURLStateChanged') );
			});
		},
		
		onURLStateChanged: function(event) {
			var self = this;
			var has_changed = ((event.changed.__path__ || event.isInitial) || (event.changed.date && (event.values.date != self.cache.selectedDate)));
			if (has_changed) {
				var country = app.URL.parsePath(1);
				var org = sfm.API.getCurrentOrganization();
				var evt = sfm.API.getCurrentEvent();
				var date = sfm.API.getCurrentDate();
				self.setSelectedCountry(country);
				self.setSelectedOrganization(org);
				self.setSelectedEvent(evt);
			}
		},
		
		onLocationSelected: function(event) {
			var self = this;
			var l = widgets.$(event.target);
		}
	}
})

sfm.Map = extend.Class({
	name  :'sfm.Map',
	parent: __module__.AbstractMap,
	shared: {
		UIS: extend.merge({"graph":".graph", "svg":".graph > svg", "tooltips":".tooltips", "detailedTooltip":".Tooltip[data-name=detailed]", "smallTooltip":".Tooltip[data-name=small]"}, __module__.AbstractMap.UIS)
	},
	properties: {
		detailedTooltip:undefined,
		smallTooltip:undefined
	},
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Map.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.Map.getParent()).bindUI();
			self.detailedTooltip = widgets.ensure(self.uis.detailedTooltip);
			self.smallTooltip = widgets.ensure(self.uis.smallTooltip);
			app.ON.ApplicationDataLoaded.bindWithLastEvent(function(d) {
				app.ON.OrganizationFocused.bind(self.getMethod('onOrganizationFocused') );
				app.ON.EventFocused.bind(self.getMethod('onEventFocused') );
				app.ON.Relayout.bind(self.getMethod('relayout') );
				return app.URL.bind(self.getMethod('onURLStateChanged') );
			});
		},
		
		onURLStateChanged: function(event) {
			var self = this;
			var has_changed = ((event.changed.__path__ || event.isInitial) || (event.changed.date && (event.values.date != self.cache.selectedDate)));
			if (has_changed) {
				var country = app.URL.parsePath(1);
				var org = sfm.API.getCurrentOrganization();
				var evt = sfm.API.getCurrentEvent();
				var date = sfm.API.getCurrentDate();
				var nodes = self.cache.countriesByID[country];
				self.hideTooltips();
				if (self.cache.selectedCountry && (self.cache.selectedCountry != country)) {
					widgets.$(self.cache.countriesByID[self.cache.selectedCountry]).removeClass("selected");
				}
				if (nodes) {
					if (self.cache.selectedCountry != country) {
						widgets.$(nodes).addClass("selected");
						var future = channels.join(self.loadLocations(country, date), self.loadEvents());
						future.onSucceed(function(d) {
							var events = d[1];
							var locations = d[0];
							self.setEvents(events);
							self.loadMap(country, date);
							self.focusOnCountry(country);
							self.cache.selectedCountry = country;
						});
					} else if (extend.cmp(self.cache.selectedDate, date) != 0) {
						self.cache.selectedDate = date;
						self.loadMap(country, date);
					}
				} else {
					self.cache.selectedCountry = null;
					self.focusOnCountry();
				}
				self.setSelectedOrganization(org);
				self.setSelectedEvent(evt);
			}
			if (has_changed || event.changed.classifications) {
				self.loadLocations(self.cache.selectedCountry, self.cache.selectedDate).onSucceed(self.getMethod('setLocations') );
				self.loadMap(self.cache.selectedCountry, self.cache.selectedDate).onSucceed(function(_) {
					return self.setOrganizations(_.organizations);
				});
			}
		},
		
		relayout: function() {
			var self = this;
			self.getSuper(__module__.Map.getParent()).relayout();
			if (self.cache.selectedCountry) {
				self.focusOnCountry(self.cache.selectedCountry);
			}
		},
		
		/**
		  * Hides all tooltips
		  * 
		*/
		hideTooltips: function() {
			var self = this;
			self.cache.currentTooltipOrganization = null;
			self.cache.currentEventTooltip = null;
			self.cache.currentCountryTooltip = null;
			self.detailedTooltip.hide();
			self.smallTooltip.hide();
		},
		
		/**
		  * Updates the location of the tooltips
		  * 
		*/
		_updateTooltips: function() {
			var self = this;
			self.detailedTooltip.update();
			self.smallTooltip.update();
		},
		
		onInteract: function(event) {
			var self = this;
			if (app.URL.pathLike("country", undefined)) {
				if (app.URL.get("focus") != "map") {
					app.URL.update("focus", "map");
				}
			}
			return self.getSuper(__module__.Map.getParent()).onInteract(event);
		},
		
		onCountrySelected: function(event) {
			var self = this;
			var d = widgets.$(event.target).data();
			sfm.API.setCurrentCountry(d.id);
		},
		
		onCountryIn: function(event) {
			var self = this;
			if (!sfm.API.getCurrentCountry()) {
				var t = widgets.$(event.target);
				var d = t.data();
				self.uis.tooltips.removeClass("hidden");
				self.smallTooltip.set(d).show(t);
			} else {
				self.smallTooltip.hide();
			}
		},
		
		onCountryOut: function(event) {
			var self = this;
			var t = widgets.$(event.target);
			var d = t.data();
			if (self.smallTooltip.hasTarget(t)) {
				self.smallTooltip.hide();
			}
		},
		
		getSelectedCountry: function() {
			var self = this;
			return sfm.API.getCurrentCountry();
		},
		
		onOrganizationFocused: function(oid) {
			var self = this;
			var n = self.setFocusedOrganization(oid);
			if (self.cache.data.organizations) {
				var data = extend.copy(extend.first(self.cache.data.organizations, function(_0) {
					return (_0.id == oid);
				}));
				if (data && data.properties) {
					data = data.properties;
					if (data.area_current && data.area_current.osm_name) {
						data.area_name = data.area_current.osm_name;
						var split = data.area_name.split(", ");
						if (extend.len(split) > 8) {
							data.area_name = (((extend.slice(split,0,7).join(", ") + " and ") + (extend.len(split) - 7)) + " others");
						}
					}
					if (data.site_current) {
						data.site_name = data.site_current.name;
					}
				}
				self.detailedTooltip.ui.attr("data-mode", "organization");
				if (n) {
					self.detailedTooltip.set(data).show(widgets.$(n));
				} else if (self.cache.locationByID[oid]) {
					var location = self.cache.locationByID[oid];
					self.detailedTooltip.set(data).show(widgets.$(location));
				} else {
					self.detailedTooltip.hide();
				}
			} else {
				self.detailedTooltip.hide();
			}
		},
		
		onOrganizationIn: function(event) {
			var self = this;
			var t = self.getSuper(__module__.Map.getParent()).onOrganizationIn(event);
			if (t) {
				var oid = widgets.$(t).data("id");
				!(oid) && extend.assert(false, "sfm.Map.onOrganizationIn:", "Map.onOrganizationIn: no id for organization", t, "(failed `oid`)");
				app.ON.OrganizationFocused.trigger(oid);
			}
		},
		
		onOrganizationOut: function(event) {
			var self = this;
			var t = self.getSuper(__module__.Map.getParent()).onOrganizationOut(event);
			if (self.detailedTooltip.hasTarget(t)) {
				app.ON.OrganizationFocused.trigger(null);
			}
		},
		
		onEventFocused: function(eid) {
			var self = this;
			return self.setFocusedEvent(eid);
		},
		
		onEventIn: function(event) {
			var self = this;
			var t = self.getSuper(__module__.Map.getParent()).onEventIn(event);
			var d = widgets.$(t).data();
			if (d) {
				!(d.id) && extend.assert(false, "sfm.Map.onEventIn:", "Map.onEventIn: no id for event", d, "(failed `d.id`)");
				app.ON.EventFocused.trigger(d.id);
			}
		},
		
		onEventOut: function(event) {
			var self = this;
			var t = self.getSuper(__module__.Map.getParent()).onEventOut(event);
			if (self.detailedTooltip.hasTarget(t)) {
				app.ON.EventFocused.trigger(null);
			}
		},
		
		setFocusedEvent: function(eid) {
			var self = this;
			var n = self.getSuper(__module__.Map.getParent()).setFocusedEvent(eid);
			if (n) {
				self.detailedTooltip.ui.attr("data-mode", "event");
				self.detailedTooltip.set(widgets.$(n).data()).show(n);
			} else {
				self.detailedTooltip.hide();
			}
		},
		
		onLocationFocused: function(oid, ui) {
			var self = this;
			self.setFocusedOrganization(oid);
			var data = extend.first(self.cache.data.organizations, function(_0) {
				return (_0.id == oid);
			});
			if (data && data.properties) {
				data = extend.copy(data.properties);
				self.detailedTooltip.ui.attr("data-mode", "organization");
				if (data.area_current) {
					data.area_name = data.area_current.osm_name;
				}
				if (data.site_current) {
					data.site_name = data.site_current.name;
				}
				self.detailedTooltip.set(data).show(ui);
			} else {
				self.detailedTooltip.hide();
			}
		},
		
		onLocationIn: function(event) {
			var self = this;
			var t = self.getSuper(__module__.Map.getParent()).onLocationIn(event);
			if (t) {
				var oid = widgets.$(t).data("id");
				!(oid) && extend.assert(false, "sfm.Map.onLocationIn:", "Map.onOrganizationIn: no id for organization", t, "(failed `oid`)");
				self.onLocationFocused(oid, widgets.$(t));
			}
		},
		
		onLocationOut: function(event) {
			var self = this;
			var t = self.getSuper(__module__.Map.getParent()).onLocationOut(event);
			if (self.detailedTooltip.hasTarget(t)) {
				app.ON.OrganizationFocused.trigger(null);
			}
		},
		
		/**
		  * Overrides the default `loadMap` and triggers the `MapLoaded` event with
		  * the corresponding data.
		  * 
		*/
		loadMap: function(country, date) {
			var self = this;
			if (country === undefined) {country=undefined}
			if (date === undefined) {date=undefined}
			app.ON.MapLoading.trigger(self);
			var f = self.getSuper(__module__.Map.getParent()).loadMap(country, date);
			f.onSucceed(function(_) {
				return app.ON.MapLoaded.trigger(_, self);
			});
			return f;
		}
	}
})
sfm.init = function(){
	var self = sfm;
}
if (typeof(sfm.init)!="undefined") {sfm.init();}

// START:VANILLA_POSTAMBLE
return sfm;})(sfm);
// END:VANILLA_POSTAMBLE
