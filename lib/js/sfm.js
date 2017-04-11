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

sfm.__VERSION__='0.9.0';
sfm.LICENSE = "http://ffctn.com/doc/licenses/bsd";
sfm.$ = widgets.$;
sfm.S = extend.modules.select;
sfm.API = undefined;
/**
  * The cache is a dictionary with timestamps, used by objects to cache
  * data.
  * NOTE: This could become a memory leak if we don't implement a cleanup.
  * 
*/
sfm.Cache = extend.Class({
	name  :'sfm.Cache',
	parent: undefined,
	properties: {
		values:undefined,
		lastCleanup:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `values`
		if (typeof(self.values)=='undefined') {self.values = {};};
		// Default value for property `lastCleanup`
		if (typeof(self.lastCleanup)=='undefined') {self.lastCleanup = null;};
	},
	methods: {
		now: function() {
			var self = this;
			return window.animation.nowInSeconds();
		},
		
		/**
		  * This doesn't work over 10 MB
		  * 
		*/
		_setPersistant: function(name, value) {
			var self = this;
			if (value.isInstance && value.isInstance(channels.Future)) {
				value.onSucceed(function(_) {
					return localStorage.setItem(name, JSON.stringify(_));
				});
			} else {
				localStorage.setItem(name, JSON.stringify(value));
			}
		},
		
		set: function(name, value) {
			var self = this;
			self.values[name] = [self.getMethod('now') , value];
			self.cleanup();
			return value;
		},
		
		update: function(name, value) {
			var self = this;
			self.values[name] = [self.getMethod('now') , value];
			self.cleanup();
		},
		
		get: function(name, _LF_default) {
			var self = this;
			if (_LF_default === undefined) {_LF_default=undefined}
			var result = self.values[name][1];
			if (extend.isDefined(result)) {
				return result;
			} else {
				return _LF_default;
			}
		},
		
		ensure: function(name, producer) {
			var self = this;
			if (!self.has(name)) {
				return self.set(name, producer());
			} else {
				return self.get(name);
			}
		},
		
		has: function(name) {
			var self = this;
			return extend.isDefined(self.values[name]);
		},
		
		addTo: function(dict) {
			var self = this;
			// Iterates over `self.values`. This works on array,objects and null/undefined
			var __i=self.values;
			var __j=__i instanceof Array ? __i : Object.getOwnPropertyNames(__i||{});
			var __l=__j.length;
			for (var __k=0;__k<__l;__k++){
				var k=(__j===__i)?__k:__j[__k];
				var v=__i[k];
				// This is the body of the iteration with (value=v, key/index=k) in __i
				dict[k] = v[1];
			}
			return dict;
		},
		
		cleanup: function() {
			var self = this;
		},
		
		wrap: function(producer, cacheKey) {
			var self = this;
			if (self.has(cacheKey)) {
				var f = new channels.Future();
				return f.set(self.get(cacheKey));
			} else {
				return producer().onSucceed(function(v) {
					return self.set(cacheKey, v);
				});
			}
		}
	}
})
/**
  * The connector to the data API. See https://github.com/opennorth/sfm-proxy#security-force-monitor-csv-proxy
  * for API.
  * 
*/
sfm.Connector = extend.Class({
	name  :'sfm.Connector',
	parent: undefined,
	shared: {
		URL_PREFIX: {"organization":"o", "event":"e", "person":"p"},
		DOMAIN: null,
		SUFFIX: null,
		Instance: null,
		SOURCES: {"staging":["https://basetracker.securityforcemonitor.org/api/", ""], "proxied":["api/", ""], "local":["data/", ".json"]},
		DEFAULT_DATE: dates.Date.ToString(dates.Date.Today())
	},
	properties: {
		cache:undefined,
		jsonp:undefined,
		http:undefined,
		data:undefined,
		sources:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `cache`
		if (typeof(self.cache)=='undefined') {self.cache = new __module__.Cache();};
		// Default value for property `jsonp`
		if (typeof(self.jsonp)=='undefined') {self.jsonp = new channels.JSONPTransport();};
		// Default value for property `http`
		if (typeof(self.http)=='undefined') {self.http = new channels.AsyncChannel({"evalJSON":true});};
		// Default value for property `data`
		if (typeof(self.data)=='undefined') {self.data = {};};
		// Default value for property `sources`
		if (typeof(self.sources)=='undefined') {self.sources = [];};
	},
	methods: {
		clearSources: function() {
			var self = this;
			var s = self.sources;
			self.sources = [];
			return s;
		},
		
		_url: function(url) {
			var self = this;
			return ((self.getClass().DOMAIN + url) + self.getClass().SUFFIX);
		},
		
		/**
		  * Returns a future resulting from the HTTP GET request to the
		  * following URL with the given options. This will retry the future
		  * until the final failure, which will trigger the `APIFailed` event.
		  * 
		*/
		_get: function(url, options) {
			var self = this;
			if (options === undefined) {options=null}
			if (!self.getClass().DOMAIN) {
				self.getClass().getOperation('SetSource')();
			}
			var o = {};
			// Iterates over `options`. This works on array,objects and null/undefined
			var __m=options;
			var __o=__m instanceof Array ? __m : Object.getOwnPropertyNames(__m||{});
			var __p=__o.length;
			for (var __n=0;__n<__p;__n++){
				var k=(__o===__m)?__n:__o[__n];
				var v=__m[k];
				// This is the body of the iteration with (value=v, key/index=k) in __m
				if (extend.isDefined(v)) {
					o[k] = v;
				};
			}
			url = channels.Channel.AddParameters(self._url(url), o);
			return self.cache.ensure(url, function() {
				return self.http.get(url).onFail(function(s, r, c, f) {
					if (!f.retry()) {
						app.ON.APIFailed.trigger({"url":url, "options":options, "future":f});
					}
				});
			});
		},
		
		parseDate: function(date) {
			var self = this;
			if (!date) {
				return "";
			}
			if (extend.isList(date)) {
				return date;
			}
			date = stats.map1((date || "").split("-"), stats.asInteger);
			if ((extend.len(date) == extend.len(extend.filter(date, function(_) {
				return (!isNaN(_));
			}))) && (extend.len(date) > 0)) {
				return dates.Date.Ensure(date);
			} else {
				return null;
			}
		},
		
		setCurrentOrganization: function(oid) {
			var self = this;
			app.URL.updatePath("country", undefined, "o", oid);
		},
		
		getCurrentOrganization: function() {
			var self = this;
			if (app.URL.pathLike("country", undefined, "o", undefined)) {
				return app.URL.parsePath(3);
			} else {
				return null;
			}
		},
		
		setCurrentEvent: function(eid) {
			var self = this;
			app.URL.updatePath("country", undefined, "e", eid);
		},
		
		getCurrentEvent: function() {
			var self = this;
			if (app.URL.pathLike("country", undefined, "e", undefined)) {
				return app.URL.parsePath(3);
			} else {
				return null;
			}
		},
		
		setCurrentPerson: function(eid, org) {
			var self = this;
			if (org === undefined) {org=undefined}
			app.URL.update({"__path__":app.URL.createPath("country", undefined, "o", org, "p", eid), "focus":"chart", "overlay":null});
		},
		
		getCurrentPerson: function() {
			var self = this;
			if (app.URL.pathLike("country", undefined, undefined, undefined, "p")) {
				return app.URL.parsePath(5);
			} else {
				return null;
			}
		},
		
		getCurrentDate: function(date) {
			var self = this;
			if (date === undefined) {date=app.URL.get("date");}
			return self.parseDate((date || self.getClass().DEFAULT_DATE));
		},
		
		getDefaultDate: function(options) {
			var self = this;
			if (options === undefined) {options=null}
			return ((options && options.date) || self.getCurrentDate());
		},
		
		getDefaultISODate: function(options) {
			var self = this;
			if (options === undefined) {options=null}
			return widgets.FORMATTERS.isodate(self.getDefaultDate(options));
		},
		
		setCurrentCountry: function(cid) {
			var self = this;
			app.URL.updatePath("country", cid);
		},
		
		getCurrentCountry: function() {
			var self = this;
			return app.URL.parsePath()[1];
		},
		
		/**
		  * Normalizes the options so that they comply with the API
		  * specification.
		  * 
		  * SEE <https://github.com/opennorth/sfm-proxy/blob/master/docs/search.md>
		  * 
		  * The parameters are noramlized as follow:
		  * 
		  * - `query` --> `q`
		  * - `criteria` and `order` -> `o`
		  * - `page` --> `p`
		  * - `classification` --> `classification__in`
		  * - `rank` --> `rank__in`
		  * - `role` --> `role__in`
		  * - `locations` --> `geonames_id`
		  * - `events`   --> `events_count__gte` and `events_count__gte`
		  * - `firstDate` --> `date_first_cited__gte` and `date_first_cited__lte`
		  * - `lastDate` --> `date_last_cited__gte` and `date_last_cited__gte`
		  * - `startDate` --> `start_date__gte` and `start_date__gte`
		  * 
		*/
		_normalizeOptions: function(options, o) {
			var self = this;
			if (o === undefined) {o={}}
			options = extend.map(options, function(v, k) {
				if (v == "any") {
					return null;
				}
				else {
					return v;
				}
			});
			if (options.query) {
				o.q = options.query;
			}
			if (options.page) {
				o.p = options.page;
			}
			if (options.classification) {
				o.classification__in = options.classification;
			}
			if (options.locations) {
				o.geonames_id = options.locations;
			}
			if (options.rank) {
				o.rank__in = widgets.FORMATTERS.cslist(options.rank);
			}
			if (options.role) {
				o.role__in = widgets.FORMATTERS.cslist(options.role);
			}
			if (options.startDate) {
				o.start_date__gte = widgets.FORMATTERS.isodate(options.startDate[0]);
				o.start_date__lte = widgets.FORMATTERS.isodate(options.startDate[1]);
			}
			if (options.firstDate) {
				o.date_first_cited__gte = widgets.FORMATTERS.isodate(options.firstDate[0]);
				o.date_first_cited__lte = widgets.FORMATTERS.isodate(options.firstDate[1]);
			}
			if (options.lastDate) {
				o.date_last_cited__gte = widgets.FORMATTERS.isodate(options.lastDate[0]);
				o.date_last_cited__lte = widgets.FORMATTERS.isodate(options.lastDate[1]);
			}
			if (options.events) {
				o.events_count__gte = options.events[0];
				o.events_count__lte = options.events[1];
			}
			return o;
		},
		
		getWorldMap: function() {
			var self = this;
			return self.cache.ensure("getWorldMap", function() {
				return self.http.get("data/countries.geo.json");
			});
		},
		
		/**
		  * See https://github.com/opennorth/sfm-proxy/blob/master/docs/countries.md
		  * 
		*/
		listCountries: function() {
			var self = this;
			return self._get("countries/");
		},
		
		/**
		  * See https://github.com/opennorth/sfm-proxy/blob/master/docs/countries.md
		  * 
		*/
		getCountrySummary: function(id) {
			var self = this;
			return self._get((("countries/" + id) + "/"));
		},
		
		/**
		  * See https://github.com/opennorth/sfm-proxy/blob/master/docs/search.md#autocomplete
		  * 
		*/
		getCountryLocations: function(id) {
			var self = this;
			if (id === undefined) {id=self.getCurrentCountry();}
			var req = (("countries/" + id) + "/geometries/");
			return self._get(req, {"tolerance":1});
		},
		
		getCountryInstallations: function(id, date) {
			var self = this;
			if (id === undefined) {id=self.getCurrentCountry();}
			if (date === undefined) {date=self.getClass().DEFAULT_DATE}
			var f = new channels.Future();
			__module__.API.getCountryMap(id, date).onSucceed(function(d) {
				return f.set(extend.map(d.organizations, function(org) {
					var raw_site = org.properties.site_current;
					return {"type":"Feature", "id":org.id, "properties":org, "geometry":raw_site.geometry};
				}));
			});
			return f;
		},
		
		/**
		  * This will return the country locations (cities, regions, etc)
		  * 
		*/
		getCountryLocationFeatures: function(id) {
			var self = this;
			if (id === undefined) {id=self.getCurrentCountry();}
			return self.cache.ensure(("getCountryLocationFeatures/" + id), function() {
				return sfm.API.getCountryLocations(id).process(function(d) {
					var res = extend.reduce(extend.slice(d,0,100), function(r, _, i) {
						if (_.coordinates) {
							r.push({"type":"Feature", "id":("" + _.id), "properties":{}, "geometry":{"type":"Point", "coordinates":_.coordinates}});
						}
					}, []);
					return res;
				});
			});
		},
		
		/**
		  * See <https://github.com/opennorth/sfm-proxy/blob/master/docs/search.md#organizations>
		  * 
		*/
		listOrganizations: function(country, options) {
			var self = this;
			if (country === undefined) {country=self.getCurrentCountry();}
			if (options === undefined) {options={}}
			var o = self._normalizeOptions(options, {"q":"", "p":1});
			return self._get((("countries/" + country) + "/search/organizations/"), o);
		},
		
		getOrganization: function(oid) {
			var self = this;
			return self._get((("organizations/" + oid) + "/"));
		},
		
		getOrganizationMap: function(oid, options) {
			var self = this;
			if (options === undefined) {options={}}
			var o = {"at":self.getDefaultISODate(options)};
			return self._get((("organizations/" + oid) + "/map/"), o);
		},
		
		getOrganizationLatestMap: function(oid) {
			var self = this;
			return self.cache.wrap(function() {
				return self.getOrganizationMap(oid);
			}, "getOrganizationMap:oid");
		},
		
		getOrganizationChart: function(oid, options) {
			var self = this;
			if (options === undefined) {options={}}
			var o = {"at":self.getDefaultISODate(options)};
			!(o.at) && extend.assert(false, "sfm.Connector.getOrganizationChart:", "Connector.getOrganizationChart: missing `at` option", "(failed `o.at`)");
			return self._get((("organizations/" + oid) + "/chart/"), o);
		},
		
		/**
		  * See <https://github.com/opennorth/sfm-proxy/blob/master/docs/search.md#events>
		  * 
		*/
		listEvents: function(country, options) {
			var self = this;
			if (country === undefined) {country=self.getCurrentCountry();}
			if (options === undefined) {options={}}
			var o = self._normalizeOptions(options, {"q":"", "p":1});
			return self._get((("countries/" + country) + "/search/events/"), o);
		},
		
		/**
		  * See <https://github.com/opennorth/sfm-proxy/blob/master/docs/events.md#list>
		  * 
		*/
		listTimelineEvents: function(country, options) {
			var self = this;
			if (country === undefined) {country=self.getCurrentCountry();}
			if (options === undefined) {options={}}
			return self._get((("countries/" + country) + "/events/"), options);
		},
		
		getEvent: function(eid) {
			var self = this;
			return self._get((("events/" + eid) + "/"));
		},
		
		/**
		  * See <https://github.com/opennorth/sfm-proxy/blob/master/docs/search.md#people>
		  * 
		*/
		listPersons: function(country, options) {
			var self = this;
			if (country === undefined) {country=self.getCurrentCountry();}
			if (options === undefined) {options={}}
			var o = self._normalizeOptions(options, {"q":"", "p":1});
			return self._get((("countries/" + country) + "/search/people/"), o);
		},
		
		getPerson: function(eid) {
			var self = this;
			return self._get((("people/" + eid) + "/"));
		},
		
		/**
		  * Returns organization and event features for the given country and time
		  * 
		*/
		getCountryMap: function(country, date) {
			var self = this;
			if (country === undefined) {country=self.getCurrentCountry();}
			if (date === undefined) {date=self.getClass().DEFAULT_DATE}
			var options = {"tolerance":0.01};
			if (date && extend.isList(date)) {
				date = widgets.FORMATTERS.isodate(date);
			}
			if ((!options).at || (extend.len(options.at) == 0)) {
				options.at = (date || self.getClass().DEFAULT_DATE);
			}
			var f = self._get((("countries/" + country) + "/map/"), options).process(function(d) {
				// Iterates over `d.organizations`. This works on array,objects and null/undefined
				var __r=d.organizations;
				var __s=__r instanceof Array ? __r : Object.getOwnPropertyNames(__r||{});
				var __u=__s.length;
				for (var __t=0;__t<__u;__t++){
					var __q=(__s===__r)?__t:__s[__t];
					var org=__r[__q];
					// This is the body of the iteration with (value=org, key/index=__q) in __r
					org.geometry = org.properties.area_current.geometry;
				}
				var orgs = extend.sorted(d.organizations, function(a, b) {
					var a_area = (a.area | 0);
					var b_area = (b.area | 0);
					if (((!a.area) && a.geometry) && a.geometry.geometries) {
						var a_coords = extend.map(a.geometry.geometries, function(_0) {
							return _0.coordinates;
						});
						a_coords = stats.flatten(a_coords, 3);
						var ax = stats.minmax(extend.map(a_coords, function(_) {
							return _[0];
						}));
						var ay = stats.minmax(extend.map(a_coords, function(_) {
							return _[1];
						}));
						a_area = (Math.abs((ax[0] - ax[1])) * Math.abs((ay[0] - ay[1])));
						a.area = a_area;
					}
					if (((!b.area) && b.geometry) && b.geometry.geometries) {
						var b_coords = extend.map(b.geometry.geometries, function(_0) {
							return _0.coordinates;
						});
						b_coords = stats.flatten(b_coords, 3);
						var bx = stats.minmax(extend.map(b_coords, function(_) {
							return _[0];
						}));
						var by = stats.minmax(extend.map(b_coords, function(_) {
							return _[1];
						}));
						b_area = (Math.abs((bx[0] - bx[1])) * Math.abs((by[0] - by[1])));
						b.area = b_area;
					}
					return extend.cmp(a_area, b_area);
				}, true);
				d.organizations = orgs;
				return d;
			});
			return f;
		}
	},
	operations:{
		SetSource: function( name ){
			var self = this;
			var p = (__module__.Connector.SOURCES[name] || __module__.Connector.SOURCES.staging);
			__module__.Connector.DOMAIN = p[0];
			__module__.Connector.SUFFIX = p[1];
		},
		Get: function(  ){
			var self = this;
			if (!self.Instance) {
				self.Instance = new __module__.Connector();
			}
			return self.Instance;
		}
	}
})
/**
  * Represents a sequence of page and allows to iterate through them
  * 
*/
sfm.Pagination = extend.Class({
	name  :'sfm.Pagination',
	parent: widgets.Widget,
	shared: {
		STATES: {"empty":[true, false]},
		UIS: {"previousPage":"li.is-previous", "previousPageA":"li.is-previous a", "nextPage":"li.is-next", "nextPageA":"li.is-next a", "pageTmpl":"li.page.template", "pageList":"ul.pages"},
		OPTIONS: {"useLinks":false, "resultsPerPage":20, "pagesDisplayed":10}
	},
	properties: {
		page:undefined,
		count:undefined,
		on:undefined,
		handlers:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `page`
		if (typeof(self.page)=='undefined') {self.page = -1;};
		// Default value for property `count`
		if (typeof(self.count)=='undefined') {self.count = -1;};
		// Default value for property `on`
		if (typeof(self.on)=='undefined') {self.on = events.create(["pageChanged"]);};
		// Default value for property `handlers`
		if (typeof(self.handlers)=='undefined') {self.handlers = {"page":{"press":{"press":self.getMethod('onPagePressed') }}};};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Pagination.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.Pagination.getParent()).bindUI();
		},
		
		setCount: function(count) {
			var self = this;
			!((extend.isNumber(count) && (count >= 0))) && extend.assert(false, "sfm.Pagination.setCount:", "Pagination.setCount: expected number, got", count, "(failed `(extend.isNumber(count) && (count >= 0))`)");
			self.count = count;
			self._setPagination(Math.max(0, Math.min(self.count, ((self.page - 1) * self.options.resultsPerPage))), self.count);
			self.setState("empty", (count == 0));
		},
		
		/**
		  * Sets the page number (starting with `1`) and, optionally, the `count`
		  * of elements.
		  * 
		*/
		setPage: function(page, count) {
			var self = this;
			if (count === undefined) {count=self.count}
			if (self.hasState("empty") || (self.cache.pageCount < 2)) {
				return false;
			}
			var prev_page = self.page;
			count = Math.max(count, 0);
			page = Math.min(Math.max(1, page), Math.max(0, Math.ceil((count / self.options.resultsPerPage))));
			if ((page != self.page) || (count != self.count)) {
				self.count = count;
				self.page = page;
				self._setPagination(((page - 1) * self.options.resultsPerPage), count);
				self.on.pageChanged.trigger({"page":page, "previous":prev_page}, self);
				return true;
			} else {
				return false;
			}
		},
		
		next: function() {
			var self = this;
			return self.setPage((self.page + 1));
		},
		
		previous: function() {
			var self = this;
			return self.setPage((self.page - 1));
		},
		
		onPagePressed: function(event) {
			var self = this;
			var page = parseInt(__module__.$(interaction.target(event, "page")).data("value"));
			self.setPage(page);
		},
		
		/**
		  * Sets/renders the pagination for the given `offset` within `count` elements
		  * 
		*/
		_setPagination: function(offset, count) {
			var self = this;
			self.count = count;
			var per_page = self.options.resultsPerPage;
			var pages_displayed = self.options.pagesDisplayed;
			var half_pages = Math.round((pages_displayed / 2));
			var page_count = Math.ceil((count / per_page));
			var current_page = Math.floor((offset / per_page));
			var leading = Math.min(half_pages, current_page);
			var remaining = Math.min((half_pages + 1), (page_count - current_page));
			var pages = [Math.max(0, (current_page - (pages_displayed - remaining))), Math.min((current_page + (pages_displayed - leading)), page_count)];
			if (self.options.useLinks) {
				self.uis.previousPageA.attr("href", ("#+page=" + (Math.max((current_page - 1), 0) + 1)));
				self.uis.nextPageA.attr("href", ("#+page=" + (Math.min((current_page + 1), (page_count - 1)) + 1)));
			}
			self.uis.previousPage.toggleClass("hidden", (current_page == 0));
			self.uis.nextPage.toggleClass("hidden", (current_page == (page_count - 1)));
			var pages = extend.range((pages[0]),(pages[1]));
			self.cache.currentPage = current_page;
			self.cache.pageCount = extend.len(pages);
			self.visualize("pages", pages, self.getMethod('_renderPagination') );
			self.ui.attr("data-pages", ("" + self.cache.pageCount));
		},
		
		/**
		  * Renders the page elements
		  * 
		*/
		_renderPagination: function(context, datum, index, link) {
			var self = this;
			if (!link) {
				var nui = self.cloneTemplate(self.uis.pageTmpl);
				self.uis.nextPage.before(nui);
				link = {"ui":nui, "t":nui.find(".T"), "a":nui.find("a"), "remove":function() {
					return nui.remove();
				}};
				if (self.options.useLinks) {
					// Iterates over `self.ui.a`. This works on array,objects and null/undefined
					var __x=self.ui.a;
					var __y=__x instanceof Array ? __x : Object.getOwnPropertyNames(__x||{});
					var __a=__y.length;
					for (var __z=0;__z<__a;__z++){
						var __w=(__y===__x)?__z:__y[__z];
						var __v=__x[__w];
						// This is the body of the iteration with (value=__v, key/index=__w) in __x
						app.URL.bindLink(__v, __w, __x)
					}
				} else {
					self.handlers.page.bind(nui);
				}
			} else {
				link.ui.removeClass("hidden");
			}
			if (self.options.useLinks) {
				link.a.attr("href", ("#+page=" + (datum + 1)));
			}
			link.ui.data("value", (datum + 1));
			link.t.text(widgets.FORMATTERS.index(datum));
			if (datum == self.cache.currentPage) {
				link.ui.addClass("current");
			} else {
				link.ui.removeClass("current");
			}
			return link;
		}
	}
})

sfm.Timeline = extend.Class({
	name  :'sfm.Timeline',
	parent: widgets.Widget,
	shared: {
		UIS: {"wrapper":".wrapper", "graph":".graph", "years":"ul.years", "yearTmpl":"ul.years li.template", "events":"ul.events", "eventTmpl":"ul.events li.template", "now":".cursor .now"},
		OPTIONS: {"zoom":8, "zoomBounds":[1, 15], "eventDistance":10, "events":true}
	},
	properties: {
		_pixelsPerYear:undefined,
		_zoomLevel:undefined,
		_range:undefined,
		currentDate:undefined,
		cache:undefined,
		handlers:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `_pixelsPerYear`
		if (typeof(self._pixelsPerYear)=='undefined') {self._pixelsPerYear = 0;};
		// Default value for property `_zoomLevel`
		if (typeof(self._zoomLevel)=='undefined') {self._zoomLevel = 0;};
		// Default value for property `_range`
		if (typeof(self._range)=='undefined') {self._range = [undefined, undefined];};
		// Default value for property `currentDate`
		if (typeof(self.currentDate)=='undefined') {self.currentDate = undefined;};
		// Default value for property `cache`
		if (typeof(self.cache)=='undefined') {self.cache = {"eventByID":{}, "selectedEvent":null, "focusedEvent":null};};
		// Default value for property `handlers`
		if (typeof(self.handlers)=='undefined') {self.handlers = {"graph":{"press":self.getMethod('onGraphPress') , "drag":{"start":self.getMethod('onGraphDragStart') , "drag":self.getMethod('onGraphDrag') , "end":self.getMethod('onGraphDragEnd') }, "mouse":{"wheel":self.getMethod('onGraphWheel') }}, "event":{"press":self.getMethod('onEventPress') , "mouse":{"in":self.getMethod('onEventIn') , "out":self.getMethod('onEventOut') }}};};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Timeline.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.Timeline.getParent()).bindUI();
			self.setZoomLevel(self.options.zoom);
			var year = dates.Date.ThisYear()[0];
			self.setAvailableRange(1990, year);
			self.inputs.date.change(function() {
				return self.onDateChange();
			});
			app.ON.Relayout.bind(self.getMethod('relayout') );
			app.ON.EventFocused.bind(self.getMethod('onEventFocused') );
			app.URL.bind(self.getMethod('onURLStateChanged') );
		},
		
		relayout: function() {
			var self = this;
			self.getSuper(__module__.Timeline.getParent()).relayout();
			self.cache.size = dimension.sizeA(self.ui);
			self._invalidateBounds();
			self._moveGraphBy(0);
		},
		
		onURLStateChanged: function(event) {
			var self = this;
			if (event.isInitial || event.changed.__path__) {
				var country = __module__.API.getCurrentCountry();
				var evt = __module__.API.getCurrentEvent();
				if (country) {
					if (self.options.events) {
						if (self.cache.currentEvent != evt) {
							if (evt) {
								__module__.$(self.cache.eventByID[self.cache.currentEvent]).removeClass("selected");
								__module__.$(self.cache.eventByID[evt]).addClass("selected");
								self.cache.currentEvent = evt;
							} else {
								__module__.$(self.cache.eventByID[self.cache.currentEvent]).removeClass("selected");
								self.cache.currentEvent = null;
							}
						}
						if (self.cache.country != country) {
							self.cache.country = country;
							self._loadEvents(country);
						}
					}
					self.show();
				} else {
					self.hide();
				}
			}
			if (event.isInitial || event.changed.date) {
				var d = __module__.API.getCurrentDate();
				if (d && stats.within(d[0], self._range[0], self._range[1])) {
					self.inputs.date.removeClass("hidden");
					self.set("date", d);
					self.currentDate = d;
					self.setDate(d, event.isInitial);
					self.focusOnDate(d, true);
				} else {
					self.currentDate = null;
					self._setCursorDate(null);
					self.inputs.date.addClass("hidden");
				}
			}
			self.cache.previousDate = event.values.date;
			if (event.changed.focus) {
				self.relayout();
			}
		},
		
		_loadEvents: function(country) {
			var self = this;
			if (self.cache._loadEventsFuture) {
				self.cache._loadEventsFuture.cancel();
				self.cache._loadEventsFuture = undefined;
			}
			self.ui.addClass("loading");
			self.cache._loadEventsFuture = __module__.API.listTimelineEvents(country).onSucceed(function(_) {
				self.ui.removeClass("loading");
				return self.setData(_);
			}).onFail(function() {
				return self.ui.removeClass("loading");
			});
		},
		
		setData: function(data) {
			var self = this;
			self.getSuper(__module__.Timeline.getParent()).setData(data);
			var end_year = (dates.Date.Today()[0] + 1);
			var start_year = (end_year - 20);
			if (self.options.events) {
				var events = extend.reduce(data, function(r, d) {
					var _ = extend.copy(d.properties);
					_.id = d.id;
					_.start_date = __module__.API.parseDate(_.start_date);
					if (_.start_date) {
						start_year = stats.min(_.start_date[0], start_year);
						r.push(_);
					}
					return r;
				}, []);
				self.setAvailableRange(start_year, end_year);
				self.cache.events = stats.sorted(events, "get:start_date");
				self.cache.eventByID = {};
				self.visualize("events", self.cache.events, self.getMethod('_renderEvent') );
			}
			self.render();
			self.setDate((self.currentDate || dates.Date.Today()));
		},
		
		render: function() {
			var self = this;
			self.cache.graphWidth = dimension.width(self.uis.graph);
			self._renderRange();
		},
		
		onGraphDragStart: function(event) {
			var self = this;
		},
		
		onGraphDrag: function(event) {
			var self = this;
			self._moveGraphBy(event.last.delta[0]);
		},
		
		onGraphDragEnd: function(event) {
			var self = this;
			self.cache.lastDragEnd = animation.now();
		},
		
		onGraphWheel: function(event) {
			var self = this;
			self._moveGraphBy(((stats.normalize(event.deltaY) * self._pixelsPerYear) / 2));
		},
		
		onGraphPress: function(event) {
			var self = this;
			var t = interaction.target(event, "event", self.uis.graph);
			var elapsed = (animation.now() - (self.cache.lastDragEnd || 0));
			if (((!t) || (t == self.uis.graph[0])) && (elapsed > 50)) {
				var x = dimension.positionA(event, self.uis.graph)[0];
				var date = stats.scale(x, dimension.width(self.uis.graph), self.cache._gregorianRange);
				date = dates.Date.AggregateToDay(dates.Date.FromGregorianDayNumber(date));
				app.URL.update("date", widgets.FORMATTERS.isodate(date));
			}
		},
		
		onEventPress: function(event) {
			var self = this;
			var t = interaction.target(event, "event");
			var eid = __module__.$(t).data("id");
			if (eid) {
				__module__.API.setCurrentEvent(eid);
			}
		},
		
		onEventIn: function(event) {
			var self = this;
			var t = interaction.target(event.target, "event");
			var d = __module__.$(t).data();
			!(d.id) && extend.assert(false, "sfm.Timeline.onEventIn:", "Timeline.onEventIn: no id for event", d, "(failed `d.id`)");
			self.cache.focusedEvent = d.id;
			app.ON.EventFocused.trigger(d.id);
		},
		
		onEventOut: function(event) {
			var self = this;
			var t = __module__.$(event.target, "event");
			var d = t.data();
			if (self.cache.focusedEvent == d.id) {
				app.ON.EventFocused.trigger(null);
			}
		},
		
		onEventFocused: function(eid) {
			var self = this;
			if (self.cache.focusedEvent != eid) {
				__module__.$(self.cache.eventByID[self.cache.focusedEvent]).removeClass("focused");
				var e = __module__.$(self.cache.eventByID[eid]).addClass("focused");
				self.cache.focusedEvent = eid;
				var d = e.data("start_date");
				if (d) {
					self.focusOnDate(d, true);
				} else {
					self.focusOnDate(self.currentDate, true);
				}
			}
		},
		
		onDateChange: function(event) {
			var self = this;
			var date = dates.Date.Ensure(stats.map1(self.get("date").split("-"), stats.asInteger));
			app.URL.update("date", widgets.FORMATTERS.isodate(date));
		},
		
		zoomIn: function() {
			var self = this;
			var d = self.getFocusedDate();
			self.setZoomLevel(stats.clamp((self._zoomLevel + 1), self.options.zoomBounds));
			self.focusOnDate(d);
		},
		
		zoomOut: function() {
			var self = this;
			var d = self.getFocusedDate();
			self.setZoomLevel(stats.clamp((self._zoomLevel - 1), self.options.zoomBounds));
			self.focusOnDate(d);
		},
		
		/**
		  * The zoom level defines the number of pixel per year. The actual
		  * zoom will be `Math pow (2, level)`.
		  * 
		*/
		setZoomLevel: function(level) {
			var self = this;
			self._invalidateBounds();
			self._zoomLevel = level;
			self._pixelsPerYear = Math.pow(2, level);
			self.render();
		},
		
		/**
		  * Sets the available range of years
		  * 
		*/
		setAvailableRange: function(startYear, endYear) {
			var self = this;
			self._invalidateBounds();
			self._range[0] = startYear;
			self._range[1] = endYear;
			self.cache._gregorianRange = [dates.Date.GregorianDayNumber(startYear), dates.Date.GregorianDayNumber(endYear)];
			self._renderRange();
			self.visualize("years", extend.range((startYear),((endYear + 1))), self.getMethod('_renderYear') );
		},
		
		getFocusedDate: function() {
			var self = this;
			var gw = dimension.width(self.uis.graph);
			var uw = dimension.width(self.ui);
			var o = (Math.abs(parseInt(self.uis.graph.css("left"))) + (uw / 2));
			var d = dates.Date.FromGregorianDayNumber(stats.scale(o, gw, self.cache._gregorianRange));
			return d;
		},
		
		/**
		  * Sets the current date
		  * 
		*/
		setDate: function(date) {
			var self = this;
			if (dates.Date.Between(date, self._range[0], self._range[1])) {
				self._setCursorDate(date, false);
			} else {
				self._setCursorDate(date, true);
			}
		},
		
		/**
		  * Puts the focus on the given date. The date shoudl be centered, if possible
		  * 
		*/
		focusOnDate: function(date, transition) {
			var self = this;
			if (transition === undefined) {transition=false}
			var gw = dimension.width(self.uis.graph);
			var uw = dimension.width(self.ui);
			var o = stats.scale(dates.Date.GregorianDayNumber(date), self.cache._gregorianRange, gw);
			var p = stats.scale(dates.Date.GregorianDayNumber(date), self.cache._gregorianRange, 100);
			o = (o - (uw / 2));
			self._moveGraphTo(o, transition);
		},
		
		/**
		  * Sets the cursor to move to the current year
		  * 
		*/
		_setCursorDate: function(date, focus) {
			var self = this;
			if (focus === undefined) {focus=true}
			if (date) {
				var n = dates.Date.GregorianDayNumber(date);
				var d = dates.Date.FromGregorianDayNumber(n);
				var p = stats.scale(n, self.cache._gregorianRange, 100);
				self.uis.now.css("left", (p + "%")).removeClass("hidden");
				if (focus) {
					var w = dimension.width(self.uis.graph);
					var x = stats.scale(n, self.cache._gregorianRange, w);
					var l = Math.abs(parseInt(self.uis.graph.css("left")));
					if (!stats.within((x - l), 0, w)) {
						x = (x - (dimension.width(self.ui) / 2));
						self._moveGraphBy((0 - x));
					}
				}
				return true;
			} else {
				self.uis.now.addClass("hidden");
				return false;
			}
		},
		
		/**
		  * Render the range of years, based on the number of pixels per year
		  * 
		*/
		_renderRange: function() {
			var self = this;
			if (self._range) {
				self.uis.graph.css("width", Math.max(dimension.width(self.ui), ((self._range[1] - self._range[0]) * self._pixelsPerYear)));
			}
			self._setCursorDate(self.currentDate);
		},
		
		_renderYear: function(context, datum, index, nui) {
			var self = this;
			if (!nui) {
				nui = self.cloneTemplate(self.uis.yearTmpl, self.uis.years);
				nui = {"ui":nui, "t":nui.find(".T")};
			}
			var x = stats.scale(datum, context.data, 100);
			nui.t.text(datum);
			nui.ui.css("left", (x + "%")).toggleClass("Y5", ((datum % 5) == 0)).toggleClass("Y10", ((datum % 10) == 0)).toggleClass("Y100", ((datum % 100) == 0));
			return nui;
		},
		
		_renderEvent: function(context, datum, index, nui) {
			var self = this;
			if (!nui) {
				nui = self.cloneTemplate(self.uis.eventTmpl, self.uis.events);
				nui = {"ui":nui, "t":nui.find(".T")};
				nui.t.text(widgets.FORMATTERS.index(index));
				self.handlers.event.bind(nui.ui);
			}
			self.cache.eventByID[datum.id] = nui.ui;
			var n = dates.Date.GregorianDayNumber(datum.start_date);
			var p = stats.scale(n, self.cache._gregorianRange, 100);
			var d = ((Math.abs((p - (context.lastOffset || 0))) * self.cache.graphWidth) / 100.0);
			var y = ((self._range[1] - self._range[0]) - 1);
			var delta = (p - (context.lastPosition || 0));
			var o = -1;
			if (delta < 0.1) {
				o = ((context.lastOffset + 1) % 15);
			} else {
				o = 0;
			}
			nui.ui.toggleClass("selected", (datum.id == self.cache.currentEvent));
			nui.ui.css("left", (p + "%")).css("margin-bottom", ((o / 3) + "em")).data(datum);
			context.lastPosition = p;
			context.lastOffset = o;
			return nui;
		},
		
		_moveGraphTo: function(offset, transition) {
			var self = this;
			if (offset === undefined) {offset=0}
			if (transition === undefined) {transition=false}
			return self._moveGraphBy((0 - offset), 0, transition);
		},
		
		/**
		  * Internal method that moves the graph's left property by offset pixels.
		  * 
		*/
		_moveGraphBy: function(offset, origin, transition) {
			var self = this;
			if (offset === undefined) {offset=0}
			if (origin === undefined) {origin=undefined}
			if (transition === undefined) {transition=false}
			if (!extend.isDefined(self.cache.graphLeft)) {
				self.cache.graphLeft = parseInt(self.uis.graph.css("left"));
			}
			if (!extend.isDefined(self.cache.size)) {
				self.cache.size = dimension.sizeA(self.ui);
			}
			if (!extend.isDefined(self.cache.graphBounds)) {
				self.cache.graphBounds = [((0 - ((self._range[1] - self._range[0]) * self._pixelsPerYear)) + self.cache.size[0]), 0];
			}
			if (!extend.isDefined(origin)) {
				origin = self.cache.graphLeft;
			}
			self.cache.graphLeft = stats.clamp((offset + origin), self.cache.graphBounds);
			if (!self.tweens.graph) {
				self.tweens.graph = new animation.Tween().setSource(0.0).setDuration("0.5s").onUpdate(function(_) {
					return self.uis.graph.css("left", _);
				});
			}
			if (transition) {
				self.tweens.graph.update(self.cache.graphLeft);
			} else {
				self.tweens.graph.cancel().setSource(self.cache.graphLeft);
				self.uis.graph.css("left", self.cache.graphLeft);
			}
		},
		
		/**
		  * Invalidates the cache graph bounds
		  * 
		*/
		_invalidateBounds: function() {
			var self = this;
			self.cache.graphBounds = undefined;
		}
	}
})
/**
  * A special type of widget that wraps two sidebar and allows to switch
  * between one and the other
  * 
*/
sfm.SidebarContainer = extend.Class({
	name  :'sfm.SidebarContainer',
	parent: widgets.Widget,
	shared: {
		UIS: {"panels":"> .body > .panel", "body":"> .body"}
	},
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.SidebarContainer.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.SidebarContainer.getParent()).bindUI();
			// Iterates over `self.uis.panels`. This works on array,objects and null/undefined
			var __d=self.uis.panels;
			var __e=__d instanceof Array ? __d : Object.getOwnPropertyNames(__d||{});
			var __g=__e.length;
			for (var __f=0;__f<__g;__f++){
				var __c=(__e===__d)?__f:__e[__f];
				var __b=__d[__c];
				// This is the body of the iteration with (value=__b, key/index=__c) in __d
				self.getMethod('addChild') (__b, __c, __d)
			}
		},
		
		/**
		  * Sets the panel
		  * 
		*/
		setPanel: function(index) {
			var self = this;
			self.uis.body.css("left", ((0 - (index * 100)) + "%"));
		},
		
		relayout: function() {
			var self = this;
			var size = dimension.size(self.ui);
			self.uis.panels.css({"width":(parseInt(size.width) + "px"), "height":(parseInt(size.height) + "px")});
			self.uis.body.css("width", ((size.width * extend.len(self.uis.panels)) + "px"));
			self.getSuper(__module__.SidebarContainer.getParent()).relayout();
		}
	}
})

sfm.Sidebar = extend.Class({
	name  :'sfm.Sidebar',
	parent: widgets.Widget,
	shared: {
		UIS: {"body":"> .body", "header":"> .header", "footer":"> .footer", "scrollable":".scrollable", "pagination":".Pagination", "eventLists":"ul.events.out", "organizationLists":"ul.organizations.out", "personLists":"ul.persons.out"}
	},
	properties: {
		handlers:undefined,
		pagination:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `handlers`
		if (typeof(self.handlers)=='undefined') {self.handlers = {"organization":{"press":self.getMethod('onOrganizationPress') }, "event":{"press":self.getMethod('onEventPress') }, "person":{"press":self.getMethod('onPersonPress') }, "organizationLists":{"mouse":{"out":self.getMethod('onOrganizationListOut') , "in":self.getMethod('onOrganizationListIn') }}};};
		// Default value for property `pagination`
		if (typeof(self.pagination)=='undefined') {self.pagination = null;};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Sidebar.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.Sidebar.getParent()).bindUI();
			self.pagination = widgets.ensure(self.uis.pagination);
			if (self.pagination) {
				self.pagination.on.pageChanged.bind(self.getMethod('onPageChanged') );
			}
			// Iterates over `self.uis.scrollable`. This works on array,objects and null/undefined
			var __h=self.uis.scrollable;
			var __ij=__h instanceof Array ? __h : Object.getOwnPropertyNames(__h||{});
			var __kj=__ij.length;
			for (var __jj=0;__jj<__kj;__jj++){
				var i=(__ij===__h)?__jj:__ij[__jj];
				var _=__h[i];
				// This is the body of the iteration with (value=_, key/index=i) in __h
				_ = __module__.$(_);
				var name = (_.attr("data-behavior") || ("scrollable" + i));;
				var s = new behavior.Scrollable(_);;
				s.on.scrollStart.bind(self.getMethod('onScrollStart') );
				s.on.scrollEnd.bind(self.getMethod('onScrollEnd') );
				self.behaviors[name] = s;
			}
		},
		
		_disableScrollables: function() {
			var self = this;
			// Iterates over `self.behaviors`. This works on array,objects and null/undefined
			var __mj=self.behaviors;
			var __oj=__mj instanceof Array ? __mj : Object.getOwnPropertyNames(__mj||{});
			var __pj=__oj.length;
			for (var __nj=0;__nj<__pj;__nj++){
				var __lj=(__oj===__mj)?__nj:__oj[__nj];
				var b=__mj[__lj];
				// This is the body of the iteration with (value=b, key/index=__lj) in __mj
				if (behavior.Scrollable.hasInstance(b)) {
					b.disable();
				};
			}
		},
		
		_enableScrollables: function() {
			var self = this;
			// Iterates over `self.behaviors`. This works on array,objects and null/undefined
			var __rj=self.behaviors;
			var __sj=__rj instanceof Array ? __rj : Object.getOwnPropertyNames(__rj||{});
			var __uj=__sj.length;
			for (var __tj=0;__tj<__uj;__tj++){
				var __qj=(__sj===__rj)?__tj:__sj[__tj];
				var b=__rj[__qj];
				// This is the body of the iteration with (value=b, key/index=__qj) in __rj
				if (behavior.Scrollable.hasInstance(b)) {
					b.enable();
				};
			}
		},
		
		relayout: function() {
			var self = this;
			var hdr_h = dimension.height(self.uis.header);
			var ftr_h = dimension.height(self.uis.footer);
			var bar_h = dimension.height(self.ui);
			self.uis.body.css({"top":hdr_h, "bottom":ftr_h});
			self.getSuper(__module__.Sidebar.getParent()).relayout();
		},
		
		/**
		  * A utility method that allows to load the data from the api using
		  * the given `method` and `params`. The optional `lui` (list ui)
		  * will have a `loading` class added and removed inbetween the calls.
		  * 
		  * This method will:
		  * 
		  * - detect if there was a previous call
		  * - if the call had the same parameters, the method will abort
		  * - otehrwise the previous call will be cancelled and a new
		  * call will be placed.
		  * 
		*/
		_api: function(lui, method, params, success, failure) {
			var self = this;
			if (failure === undefined) {failure=undefined}
			self._disableScrollables();
			if (!self.cache._load) {
				self.cache._load = {};
			}
			if (self.cache._load[method]) {
				self.cache._load[method].cancel();
			}
			if (lui) {
				lui.addClass("loading");
			}
			!(extend.isDefined(__module__.API[method])) && extend.assert(false, "sfm.Sidebar._api:", ("Sidebar._api: API does not define method " + method), "(failed `extend.isDefined(__module__.API[method])`)");
			var f = __module__.API.getMethod(method).apply(__module__.API, params).onSucceed(function(_) {
				if (success) {
					success(_);
				}
				self.ui.removeClass("loading");
				if (lui) {
					lui.removeClass("loading");
				}
				return self._enableScrollables();
			}).onFail(function(a, b, c, d, e) {
				extend.warning(self.getClass().getName(), ("._api(): failed with method " + method));
				if (failure) {
					failure(a, b, d, c, d, e);
				}
				self.ui.removeClass("loading");
				if (lui) {
					lui.removeClass("loading");
				}
				return self._enableScrollables();
			});
			f._params = params;
			self.cache._load[method] = f;
			return f;
		},
		
		onPageChanged: function(event) {
			var self = this;
			// Iterates over `self.behaviors`. This works on array,objects and null/undefined
			var __wj=self.behaviors;
			var __xj=__wj instanceof Array ? __wj : Object.getOwnPropertyNames(__wj||{});
			var __zj=__xj.length;
			for (var __yj=0;__yj<__zj;__yj++){
				var __vj=(__xj===__wj)?__yj:__xj[__yj];
				var _=__wj[__vj];
				// This is the body of the iteration with (value=_, key/index=__vj) in __wj
				if (behavior.Scrollable.hasInstance(_)) {
					_.scrollTo(0);
				};
			}
		},
		
		onOrganizationPress: function(event) {
			var self = this;
			if (extend.len(__module__.$(event.target).parents(".sources")) != 0) {
				return null;
			}
			var t = interaction.target(event, "organization");
			var d = __module__.$(t).data();
			!(d.id) && extend.assert(false, "sfm.Sidebar.onOrganizationPress:", "Organization has no id: ", d, "(failed `d.id`)");
			__module__.API.setCurrentOrganization(d.id);
			app.URL.remove("overlay");
		},
		
		onOrganizationListOut: function(event) {
			var self = this;
			app.ON.OrganizationFocused.trigger(null);
		},
		
		onOrganizationListIn: function(event) {
			var self = this;
			var e = interaction.target(event, "organization", self.ui);
			if (e) {
				var id = e.getAttribute("data-id");
				if (id) {
					app.ON.OrganizationFocused.trigger(id);
					self.cache.focusedOrganization = e;
				}
			}
		},
		
		onEventPress: function(event) {
			var self = this;
			var t = interaction.target(event, "event");
			var d = __module__.$(t).data();
			!(d.id) && extend.assert(false, "sfm.Sidebar.onEventPress:", "Event has no id: ", d, "(failed `d.id`)");
			__module__.API.setCurrentEvent(d.id);
			app.URL.remove("overlay");
		},
		
		onScrollStart: function(value, scrollable) {
			var self = this;
		},
		
		onScrollEnd: function(value, scrollable) {
			var self = this;
		},
		
		onPersonPress: function(event) {
			var self = this;
			if (extend.len(__module__.$(event.target).parents(".sources")) != 0) {
				return null;
			}
			var t = interaction.target(event, "person");
			var d = __module__.$(t).data();
			!(d.id) && extend.assert(false, "sfm.Sidebar.onPersonPress:", "Person has no id: ", d, "(failed `d.id`)");
			__module__.API.setCurrentPerson(d.id);
			app.URL.remove("overlay");
		}
	}
})

sfm.CountryList = extend.Class({
	name  :'sfm.CountryList',
	parent: __module__.Sidebar,
	shared: {
		UIS: extend.merge({"countryList":"ul.countries", "countryTmpl":"li.country.template"}, __module__.Sidebar.UIS, false)
	},
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.CountryList.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.CountryList.getParent()).bindUI();
			app.ON.ApplicationDataLoaded.bindWithLastEvent(function(d) {
				self.setData(d.countries);
				self.ui.removeClass("loading");
				return app.URL.bind(self.getMethod('onURLStateChanged') );
			});
		},
		
		onURLStateChanged: function(event) {
			var self = this;
			if (event.isInitial || event.changed.__path__) {
				var p = app.URL.parsePath();
			}
			self.relayout();
		},
		
		setData: function(data) {
			var self = this;
			// Iterates over `self.behaviors`. This works on array,objects and null/undefined
			var __bj=self.behaviors;
			var __cj=__bj instanceof Array ? __bj : Object.getOwnPropertyNames(__bj||{});
			var __ej=__cj.length;
			for (var __dj=0;__dj<__ej;__dj++){
				var __aj=(__cj===__bj)?__dj:__cj[__dj];
				var _=__bj[__aj];
				// This is the body of the iteration with (value=_, key/index=__aj) in __bj
				if (behavior.Scrollable.hasInstance(_)) {
					_.scrollTo(0);
				};
			}
			self.visualize("countries", data, self.getMethod('_renderCountry') );
		},
		
		_renderCountry: function(context, datum, index, nui) {
			var self = this;
			if (!nui) {
				nui = new widgets.Element(self.cloneTemplate(self.uis.countryTmpl, self.uis.countryList));
			}
			nui.set(datum);
			nui.set(datum.properties);
			return nui;
		}
	}
})

sfm.CountrySummary = extend.Class({
	name  :'sfm.CountrySummary',
	parent: __module__.Sidebar,
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.CountrySummary.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.CountrySummary.getParent()).bindUI();
			app.ON.ApplicationDataLoaded.bindWithLastEvent(function(d) {
				return app.URL.bind(self.getMethod('onURLStateChanged') );
			});
		},
		
		onURLStateChanged: function(event) {
			var self = this;
			if (event.isInitial || event.changed.__path__) {
				var p = self.getCountryId();
				if (p) {
					if (!self._api(self.ui, "getCountrySummary", [p], self.getMethod('setData') , self.getMethod('reset') ).hasFailed()) {
						self.reset();
					}
				}
			}
			self.relayout();
		},
		
		getCountryId: function() {
			var self = this;
			return app.URL.parsePath()[1];
		},
		
		setData: function(summary) {
			var self = this;
			var country_id = self.getCountryId();
			self.ui.attr("data-country", country_id);
			// Iterates over `self.behaviors`. This works on array,objects and null/undefined
			var __gj=self.behaviors;
			var __hj=__gj instanceof Array ? __gj : Object.getOwnPropertyNames(__gj||{});
			var __jk=__hj.length;
			for (var __ik=0;__ik<__jk;__ik++){
				var __fj=(__hj===__gj)?__ik:__hj[__ik];
				var _=__gj[__fj];
				// This is the body of the iteration with (value=_, key/index=__fj) in __gj
				if (behavior.Scrollable.hasInstance(_)) {
					_.scrollTo(0);
				};
			}
			if (extend.isList(summary)) {
				summary = summary[0];
			}
			self.set(summary);
			self.set({"countryCSV":__module__.API._url((("countries/" + country_id) + ".zip")), "countryTXT":__module__.API._url((("countries/" + country_id) + ".txt"))});
			// Iterates over `self.behaviors`. This works on array,objects and null/undefined
			var __lk=self.behaviors;
			var __mk=__lk instanceof Array ? __lk : Object.getOwnPropertyNames(__lk||{});
			var __nk=__mk.length;
			for (var __ok=0;__ok<__nk;__ok++){
				var __kk=(__mk===__lk)?__ok:__mk[__ok];
				var _=__lk[__kk];
				// This is the body of the iteration with (value=_, key/index=__kk) in __lk
				_.relayout();
			}
			self.getSuper(__module__.CountrySummary.getParent()).setData(summary);
			return self;
		}
	}
})
/**
  * Lists are used both as a standalone sidebar and embedded in the
  * search results. As a result, they have a couple of specific options:
  * 
  * - `url=false`: will bind the list to URL changes when `true`
  * - `trigger=false`: will trigger Organization events (see `sfm.ON`) when `true`
  * 
*/
sfm.List = extend.Class({
	name  :'sfm.List',
	parent: __module__.Sidebar,
	shared: {
		STATES: {"organization":[false, true], "filters":[false, true], "empty":[true, false]},
		UIS: extend.merge({"elementList":"ul.elements", "elementTmpl":"li.element.template", "dossier":".Dossier", "list":".content.list"}, __module__.Sidebar.UIS, false),
		OPTIONS: extend.merge({"order":undefined, "criteria":undefined, "query":undefined, "trigger":false, "source":"url", "type":"element"}, __module__.Sidebar.OPTIONS)
	},
	properties: {
		on:undefined,
		handlers:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `on`
		if (typeof(self.on)=='undefined') {self.on = events.create(["change", "loading", "elementIn", "elementOut", "elementSelected"]);};
		// Default value for property `handlers`
		if (typeof(self.handlers)=='undefined') {self.handlers = {"item":{"press":{"press":self.getMethod('onItemSelected') }, "mouse":{"in":self.getMethod('onItemIn') , "out":self.getMethod('onItemOut') }}};};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.List.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.List.getParent()).bindUI();
			widgets.bindEvent(self.inputs.order, "change", self.getMethod('onSortChanged') );
			widgets.bindEvent(self.inputs.criteria, "change", self.getMethod('onSortChanged') );
			if (self.options.source == "url") {
				self.ui.addClass("loading");
				app.ON.ApplicationDataLoaded.bindWithLastEvent(function(d) {
					self.ui.removeClass("loading");
					return app.URL.bind(self.getMethod('onURLStateChanged') );
				});
			}
		},
		
		onURLStateChanged: function(event) {
			var self = this;
		},
		
		onItemSelected: function(event) {
			var self = this;
			var li = interaction.target(event, self.options.type);
			var id = __module__.$(li).data("id");
			!(id) && extend.assert(false, "sfm.List.onItemSelected:", (self.getClass().getName() + ": selected element has no id"), id, "(failed `id`)");
			self.on.elementSelected.trigger({"id":id, "element":li}, self);
			if (id) {
				app.URL.updatePath(undefined, undefined, __module__.Connector.URL_PREFIX[self.options.type], id);
				app.URL.remove("overlay");
			}
		},
		
		onItemIn: function(event) {
			var self = this;
			var li = interaction.target(event, self.options.type);
			var id = __module__.$(li).attr("data-id");
			if (li != self.cache.lastItemIn) {
				self.cache.lastItemIn = li;
				self.cache.focusedElement = id;
				self.on.elementIn.trigger({"id":id, "element":li, "type":self.options.type}, self);
			}
			return id;
		},
		
		onItemOut: function(event) {
			var self = this;
			var li = event.target;
			if (self.cache.lastItemIn == li) {
				self.cache.lastItemIn = null;
				var id = __module__.$(li).data("id");
				self.on.elementOut.trigger({"id":id, "element":li, "type":self.options.type}, self);
				if (self.cache.focusedElement == id) {
					return true;
				} else {
					self.cache.focusedElement = null;
					return null;
				}
			} else {
				return null;
			}
		},
		
		onScrollStart: function(value, event) {
			var self = this;
			if (self.ui.hasClass("loading")) {
				return false;
			}
		},
		
		onScrollEnd: function(value, event) {
			var self = this;
			if (self.ui.hasClass("loading")) {
				return false;
			}
		},
		
		onPageChanged: function(event) {
			var self = this;
			self.getSuper(__module__.List.getParent()).onPageChanged(event);
			self._disableScrollables();
			self.loadData(undefined, {"page":event.page});
		},
		
		onSortChanged: function() {
			var self = this;
			var options = extend.copy(self.cache.options);
			options.page = undefined;
			if (!self.pagination.setPage(1)) {
				self.loadData(undefined, {"page":1});
			}
		},
		
		setFocusedElement: function(eid, etype) {
			var self = this;
			if (etype == self.options.type) {
				if (self.cache.focusedElement != eid) {
					__module__.$(self.cache.elementByID[self.cache.focusedElement]).removeClass("focused");
					__module__.$(self.cache.elementByID[eid]).addClass("focused");
					self.cache.focusedElement = eid;
				}
			} else {
				return false;
			}
		},
		
		toggleFilters: function() {
			var self = this;
			self.toggleState("filters");
			self.relayout();
		},
		
		toggleOrder: function() {
			var self = this;
			if ((!self.get("order")) || (self.get("order") == "+")) {
				self.set("order", "-");
			} else {
				self.set("order", "+");
			}
			self.onSortChanged();
		},
		
		loadData: function(country, options) {
			var self = this;
			if (country === undefined) {country=self.cache.country}
			if (options === undefined) {options=undefined}
			self.cache.country = country;
			options = (options || {});
			self.cache.options = extend.copy(options);
			// Iterates over `self.options`. This works on array,objects and null/undefined
			var __pk=self.options;
			var __qk=__pk instanceof Array ? __pk : Object.getOwnPropertyNames(__pk||{});
			var __sk=__qk.length;
			for (var __rk=0;__rk<__sk;__rk++){
				var k=(__qk===__pk)?__rk:__qk[__rk];
				var v=__pk[k];
				// This is the body of the iteration with (value=v, key/index=k) in __pk
				if (extend.isDefined(v) && (!extend.isDefined(options[k]))) {
					options[k] = v;
				};
			}
			if (!extend.isDefined(options.query)) {
				options.query = self.get("query");
			}
			if (!extend.isDefined(options.order)) {
				options.order = self.get("order");
			}
			if (!extend.isDefined(options.criteria)) {
				options.criteria = self.get("criteria");
			}
			var o = self.get("order");
			var c = self.get("criteria");
			if (extend.isDefined(o)) {
				options.order = o;
			}
			if (extend.isDefined(c)) {
				options.criteria = c;
			}
			var f = self._api(self.uis.list, (("list" + (options.type[0].toUpperCase() + extend.slice(options.type,1,undefined))) + "s"), [country, options], function(_) {
				return self.setData(_);
			});
			self.set({"exportCSV":(f.url + ".csv"), "exportTXT":(f.url + ".txt")});
			self.on.loading.trigger(f, self);
			return f;
		},
		
		setData: function(data) {
			var self = this;
			self.getSuper(__module__.List.getParent()).setData(data);
			// Iterates over `self.behaviors`. This works on array,objects and null/undefined
			var __uk=self.behaviors;
			var __vk=__uk instanceof Array ? __uk : Object.getOwnPropertyNames(__uk||{});
			var __xk=__vk.length;
			for (var __wk=0;__wk<__xk;__wk++){
				var __tk=(__vk===__uk)?__wk:__vk[__wk];
				var _=__uk[__tk];
				// This is the body of the iteration with (value=_, key/index=__tk) in __uk
				if (behavior.Scrollable.hasInstance(_)) {
					_.scrollTo(0);
				};
			}
			self.set("count", (data.count || "0"));
			self.setState("empty", (!data.count));
			self.pagination.setCount(data.count);
			self.visualize("elements", data.results, self.getMethod('_renderElement') );
			self.on.change.trigger(data, self);
			self.ui.removeClass("loading");
			self.relayout();
		},
		
		_renderElement: function(context, datum, index, nui) {
			var self = this;
			if (!nui) {
				nui = new widgets.Element(self.cloneTemplate(self.uis.elementTmpl, self.uis.elementList));
				self.handlers.item.bind(nui.ui);
			}
			nui.ui.data("id", datum.id);
			if (index == 0) {
				self.cache.elementByID = extend.createMapFromItems([datum.id,nui.ui[0]]);
			} else {
				self.cache.elementByID[datum.id] = nui.ui[0];
			}
			nui.set(datum);
			nui.setData(datum);
			return nui;
		}
	}
})
/**
  * A specialized class of list that triggers events on hover/selection
  * 
*/
sfm.OrganizationList = extend.Class({
	name  :'sfm.OrganizationList',
	parent: __module__.List,
	shared: {
		OPTIONS: extend.merge({"type":"organization", "source":"map"}, __module__.List.OPTIONS)
	},
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.OrganizationList.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.OrganizationList.getParent()).bindUI();
			widgets.bindEvent(self.inputs.filters, "change", self.getMethod('onFilterChanged') );
			if (self.options.source == "url") {
			
			} else if (self.options.source == "map") {
				self.ui.addClass("loading");
				self.pagination.hide();
				app.ON.MapLoading.bind(function() {
					return self.ui.addClass("loading");
				});
				app.ON.MapLoaded.bind(self.getMethod('onMapLoaded') );
				app.URL.bind(self.getMethod('onURLStateChanged') );
			}
		},
		
		onURLStateChanged: function(event) {
			var self = this;
			var classifications = self.getFilter();
			if (event.isInitial || event.changed.classifications) {
				self.applyFilter(classifications);
			}
		},
		
		onMapLoaded: function(d) {
			var self = this;
			var classifications = extend.sorted(extend.keys(extend.reduce(d.organizations, function(r, _) {
				var c = _.properties.classifications;
				// Iterates over `c`. This works on array,objects and null/undefined
				var __zk=c;
				var __ak=__zk instanceof Array ? __zk : Object.getOwnPropertyNames(__zk||{});
				var __ck=__ak.length;
				for (var __bk=0;__bk<__ck;__bk++){
					var __yk=(__ak===__zk)?__bk:__ak[__bk];
					var __dk=__zk[__yk];
					// This is the body of the iteration with (value=__dk, key/index=__yk) in __zk
					(function(_){if (_) {
						r[_] = true;
					};}(__dk))
				}
			}, {})));
			var set_classifications = self.getFilter();
			var f = widgets.Selector.Get(self.inputs.filters);
			f.disable().setOptions(classifications).setValue(set_classifications);
			f.enable();
			d = extend.map(d.organizations, function(_) {
				_.properties.id = _.id;
				return _.properties;
			});
			self.setData({"count":extend.len(d), "results":d});
			self.applyFilter(set_classifications);
		},
		
		/**
		  * Filters the displayed elements based on their classification matching
		  * the current filter.
		  * 
		*/
		onFilterChanged: function() {
			var self = this;
			var f = self.get("filters");
			app.URL.update("classifications", f);
		},
		
		getFilter: function() {
			var self = this;
			var classifications = (app.URL.get("classifications") || "any");
			if (extend.isString(classifications)) {
				classifications = classifications.split(",");
			}
			return classifications;
		},
		
		applyFilter: function(f) {
			var self = this;
			if (self.uis.viz.elements) {
				var is_any = ((extend.len(f) == 0) || (((extend.len(f) == 1) && f[0]) == "any"));
				if (is_any) {
					// Iterates over `self.uis.viz.elements.all`. This works on array,objects and null/undefined
					var __fk=self.uis.viz.elements.all;
					var __gk=__fk instanceof Array ? __fk : Object.getOwnPropertyNames(__fk||{});
					var __il=__gk.length;
					for (var __hk=0;__hk<__il;__hk++){
						var __ek=(__gk===__fk)?__hk:__gk[__hk];
						var _=__fk[__ek];
						// This is the body of the iteration with (value=_, key/index=__ek) in __fk
						_.show();
					}
				} else {
					var count = 0;
					// Iterates over `self.uis.viz.elements.all`. This works on array,objects and null/undefined
					var __kl=self.uis.viz.elements.all;
					var __ll=__kl instanceof Array ? __kl : Object.getOwnPropertyNames(__kl||{});
					var __ol=__ll.length;
					for (var __ml=0;__ml<__ol;__ml++){
						var __jl=(__ll===__kl)?__ml:__ll[__ml];
						var _=__kl[__jl];
						// This is the body of the iteration with (value=_, key/index=__jl) in __kl
						var classes = _.data.classifications;;
						var has_class = (extend.len(extend.intersection(classes, f)) > 0);;
						if (has_class) {
							count = (count + 1);
						};
						_.ui.toggleClass("hidden", (!has_class));
					}
					self.setData({"count":count, "results":self.data.results});
				}
			}
		},
		
		onItemIn: function(event) {
			var self = this;
			var id = self.getSuper(__module__.OrganizationList.getParent()).onItemIn(event);
			if (self.options.trigger) {
				app.ON.OrganizationFocused.trigger(id);
			}
		},
		
		onItemOut: function(event) {
			var self = this;
			if (self.getSuper(__module__.OrganizationList.getParent()).onItemOut(event) && self.options.trigger) {
				app.ON.OrganizationFocused.trigger(null);
			}
		}
	}
})

sfm.OrganizationSummary = extend.Class({
	name  :'sfm.OrganizationSummary',
	parent: __module__.Sidebar,
	shared: {
		UIS: extend.merge({"back":"a.do-back"}, __module__.Sidebar.UIS)
	},
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.OrganizationSummary.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.OrganizationSummary.getParent()).bindUI();
			app.ON.ApplicationDataLoaded.bindWithLastEvent(function(d) {
				return app.URL.bind(self.getMethod('onURLStateChanged') );
			});
		},
		
		onURLStateChanged: function(event) {
			var self = this;
			var p = app.URL.parsePath();
			if (self.uis.back && ((event.isInitial || event.changed.__path__) || event.changed.focus)) {
				if (app.URL.pathLike("country", undefined, "o", undefined)) {
					if (event.values.focus == "chart") {
						self.uis.back.attr("href", "#+focus=map");
					} else {
						self.uis.back.attr("href", ("#+" + extend.slice(p,0,2).join("/")));
					}
				}
			}
			if (event.isInitial || event.changed.__path__) {
				if (app.URL.pathLike("country", undefined, "o", undefined)) {
					var oid = p[3];
					self._api(self.ui, "getOrganization", [oid], self.getMethod('setData') );
				}
				self.relayout();
			}
		},
		
		setData: function(data) {
			var self = this;
			// Iterates over `self.behaviors`. This works on array,objects and null/undefined
			var __pl=self.behaviors;
			var __ql=__pl instanceof Array ? __pl : Object.getOwnPropertyNames(__pl||{});
			var __sl=__ql.length;
			for (var __rl=0;__rl<__sl;__rl++){
				var __nl=(__ql===__pl)?__rl:__ql[__rl];
				var _=__pl[__nl];
				// This is the body of the iteration with (value=_, key/index=__nl) in __pl
				if (behavior.Scrollable.hasInstance(_)) {
					_.scrollTo(0);
				};
			}
			self.reset();
			data.other_names_list = (data.other_names && data.other_names.value);
			__module__.API.clearSources();
			data = extend.copy(data);
			data.sites = extend.map(data.sites, function(s) {
				return {"name":s.properties.osm_name, "date_first_cited":s.properties.date_first_cited, "date_last_cited":s.properties.date_last_cited, "properties":s.properties};
			});
			if (data.classifications) {
				data.classification_labels = data.classifications.value;
			}
			data.area_names = extend.map(data.areas, function(a) {
				return {"name":a.properties.osm_name, "first_cited":a.properties.date_first_cited, "last_cited":a.properties.date_last_cited, "properties":a.properties};
			});
			data.commanders_former = extend.sorted(data.commanders_former, function(a, b) {
				a = (a.first_cited || "1900-01-01");
				b = (b.first_cited || "1900-01-01");
				a = dates.Date.ParseTimestamp(a);
				b = dates.Date.ParseTimestamp(b);
				return dates.Date.Compare(a, b);
			}, true);
			data.parents = extend.filter(data.parents, function(_) {
				return (_.child_id == data.id);
			});
			data.children = extend.filter(data.children, function(_) {
				return (_.parent_id == data.id);
			});
			self.set(data);
			var sources = extend.map(__module__.API.clearSources(), function(_, i) {
				return {"index":((i + 1) + ""), "text":_.title, "url":(_.source_url || "")};
			});
			self.set("sources", sources);
			self.handlers.organization.bind(self.ui.find("li.organization"));
			self.handlers.event.bind(self.ui.find("li.event"));
			self.handlers.person.bind(self.ui.find("li.person"));
			self.getSuper(__module__.OrganizationSummary.getParent()).setData(data);
			self.relayout();
			return self;
		}
	}
})

sfm.OrganizationDossier = extend.Class({
	name  :'sfm.OrganizationDossier',
	parent: __module__.OrganizationSummary,
	shared: {
		UIS: {"header":"> .header", "headerTitle":"> .header .is-title", "headerButtons":"> .header .is-buttons", "body":"> .body", "columnLeft":"> .body .is-main", "columnLeftBody":"> .body .is-main > .body", "columnRight":"> .body .is-sidebar", "columnRightBody":"> .body .is-sidebar > .body", "columnRightFooter":"> .body .is-sidebar > .footer", "footer":"> .footer", "scrollable":".scrollable", "pagination":".Pagination"}
	},
	properties: {
		minimap:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `minimap`
		if (typeof(self.minimap)=='undefined') {self.minimap = null;};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.OrganizationDossier.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.OrganizationDossier.getParent()).bindUI();
			self.minimap = widgets.ensure(self.ui.find(".MiniMap"));
		},
		
		show: function() {
			var self = this;
			self.getSuper(__module__.OrganizationDossier.getParent()).show();
			self.relayout();
		},
		
		relayout: function() {
			var self = this;
			var hdr_h = dimension.height(self.uis.header);
			var ui_h = dimension.height(self.ui);
			var ui_w = dimension.width(self.ui);
			var bar_ftr_h = dimension.height(self.uis.columnRightFooter);
			var bar_w = dimension.width(self.uis.columnRight);
			self.uis.body.css({"top":hdr_h, "bottom":"0em"});
			self.uis.columnLeft.css({"width":Math.floor((ui_w - bar_w))});
			self.uis.columnRightBody.css({"top":"0em", "bottom":bar_ftr_h});
			self.getSuper(widgets.Widget).relayout();
		},
		
		setData: function(d) {
			var self = this;
			// Iterates over `self.behaviors`. This works on array,objects and null/undefined
			var __ul=self.behaviors;
			var __vl=__ul instanceof Array ? __ul : Object.getOwnPropertyNames(__ul||{});
			var __xl=__vl.length;
			for (var __wl=0;__wl<__xl;__wl++){
				var __tl=(__vl===__ul)?__wl:__vl[__wl];
				var _=__ul[__tl];
				// This is the body of the iteration with (value=_, key/index=__tl) in __ul
				if (behavior.Scrollable.hasInstance(_)) {
					_.scrollTo(0);
				};
			}
			self.getSuper(__module__.OrganizationDossier.getParent()).setData(d);
			var country = app.URL.parsePath(1);
			var f = self.minimap.loadMap(country, sfm.API.getCurrentDate());
			if (d && d.id) {
				f.onSucceed(function() {
					self.minimap.focusOnCountry(country);
					return self.minimap.setFocusedElement(d.id, "organization");
				});
				self.set({"organizationCSV":__module__.API._url((("organization/" + d.id) + ".zip")), "organizationTXT":__module__.API._url((("organization/" + d.id) + ".txt"))});
			}
		}
	}
})

sfm.EventSummary = extend.Class({
	name  :'sfm.EventSummary',
	parent: __module__.Sidebar,
	shared: {
		UIS: extend.merge({"back":"a.do-back"}, __module__.Sidebar.UIS)
	},
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.EventSummary.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.EventSummary.getParent()).bindUI();
			app.ON.ApplicationDataLoaded.bindWithLastEvent(function(d) {
				return app.URL.bind(self.getMethod('onURLStateChanged') );
			});
		},
		
		onURLStateChanged: function(event) {
			var self = this;
			if (event.isInitial || event.changed.__path__) {
				var p = app.URL.parsePath();
				if (app.URL.pathLike("country", undefined, "e", undefined)) {
					if (self.uis.back) {
						self.uis.back.attr("href", ("#+" + extend.slice(p,0,2).join("/")));
					}
					var eid = p[3];
					self._api(self.ui, "getEvent", [eid], self.getMethod('setData') );
				}
				self.relayout();
			}
		},
		
		setData: function(data) {
			var self = this;
			data = extend.copy(data);
			// Iterates over `self.behaviors`. This works on array,objects and null/undefined
			var __zl=self.behaviors;
			var __al=__zl instanceof Array ? __zl : Object.getOwnPropertyNames(__zl||{});
			var __cl=__al.length;
			for (var __bl=0;__bl<__cl;__bl++){
				var __yl=(__al===__zl)?__bl:__al[__bl];
				var _=__zl[__yl];
				// This is the body of the iteration with (value=_, key/index=__yl) in __zl
				if (behavior.Scrollable.hasInstance(_)) {
					_.scrollTo(0);
				};
			}
			self.reset();
			data.sources = extend.map(data.sources, function(source, i) {
				source = extend.copy(source);
				source.index = (i + "");
				return source;
			});
			data.organizations_nearby = extend.map(data.organizations_nearby, function(org) {
				org = extend.copy(org);
				org.classifications = org.classification;
				return org;
			});
			self.set(data);
			self.handlers.organization.bind(self.ui.find("li.organization"));
			self.relayout();
			self.getSuper(__module__.EventSummary.getParent()).setData(data);
			return self;
		}
	}
})

sfm.PersonSummary = extend.Class({
	name  :'sfm.PersonSummary',
	parent: __module__.Sidebar,
	shared: {
		UIS: extend.merge({"back":"a.do-back"}, __module__.Sidebar.UIS)
	},
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.PersonSummary.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.PersonSummary.getParent()).bindUI();
			app.ON.ApplicationDataLoaded.bindWithLastEvent(function(d) {
				return app.URL.bind(self.getMethod('onURLStateChanged') );
			});
		},
		
		onURLStateChanged: function(event) {
			var self = this;
			if (event.isInitial || event.changed.__path__) {
				var p = app.URL.parsePath();
				if (app.URL.pathLike("country", undefined, "p", undefined)) {
					if (self.uis.back) {
						self.uis.back.attr("href", ("#+" + extend.slice(p,0,-2).join("/")));
					}
					var eid = p[3];
					self._api(self.ui, "getPerson", [eid], self.getMethod('setData') );
				}
				self.relayout();
			}
		},
		
		setData: function(data) {
			var self = this;
			// Iterates over `self.behaviors`. This works on array,objects and null/undefined
			var __el=self.behaviors;
			var __fl=__el instanceof Array ? __el : Object.getOwnPropertyNames(__el||{});
			var __hl=__fl.length;
			for (var __gl=0;__gl<__hl;__gl++){
				var __dl=(__fl===__el)?__gl:__fl[__gl];
				var _=__el[__dl];
				// This is the body of the iteration with (value=_, key/index=__dl) in __el
				if (behavior.Scrollable.hasInstance(_)) {
					_.scrollTo(0);
				};
			}
			data = extend.copy(data);
			self.reset();
			__module__.API.clearSources();
			data.other_names_list = (data.other_names && data.other_names.value);
			data.organization = null;
			if (data.memberships) {
				var o = __module__.API.getCurrentOrganization();
				o = (extend.first(data.memberships, function(_) {
					return (_.organization_id && (_.organization_id.value == o));
				}) || data.memberships[0]);
				data.organization = (o && o.organization);
			}
			data.memberships = stats.sorted(data.memberships, function(a, b) {
				var a_value = (dates.Date.GregorianDayNumber(dates.Date.FromString(a.date_first_cited.value)) || 0);
				var b_value = (dates.Date.GregorianDayNumber(dates.Date.FromString(b.date_first_cited.value)) || 0);
				return extend.cmp(a_value, b_value);
			}, true);
			if (data.site_present) {
				data.hqName = data.site_present.name;
				data.hqLocation = extend.filter([data.site_present.admin_level_2, data.site_present.admin_level_1], stats.isNotEmpty).join(", ");
			}
			if (data.area_present) {
				data.hqArea = data.area_present.name;
			}
			self.set(data);
			var sources = extend.map(__module__.API.clearSources(), function(_, i) {
				return {"index":((i + 1) + ""), "text":_.title, "url":(_.source_url || "")};
			});
			self.set("sources", sources);
			self.handlers.organization.bind(self.ui.find("li.membership"));
			self.relayout();
			self.getSuper(__module__.PersonSummary.getParent()).setData(data);
			return self;
		},
		
		onOrganizationPress: function(event) {
			var self = this;
			if (extend.len(__module__.$(event.target).parents(".sources")) != 0) {
				return null;
			}
			var t = event.currentTarget;
			var d = __module__.$(t).data();
			!((d.organization_id && d.organization_id.value)) && extend.assert(false, "sfm.PersonSummary.onOrganizationPress:", "Organization has no id: ", d, "(failed `(d.organization_id && d.organization_id.value)`)");
			app.URL.update({"__path__":app.URL.createPath(undefined, undefined, "o", d.organization_id.value, "p", self.data.id), "date":(d.date_first_cited || d.date_last_cited).value, "overlay":undefined, "focus":"chart"});
		}
	}
})

sfm.PersonDossier = extend.Class({
	name  :'sfm.PersonDossier',
	parent: __module__.PersonSummary,
	shared: {
		UIS: {"header":"> .header", "headerTitle":"> .header .is-title", "headerButtons":"> .header .is-buttons", "body":"> .body", "columnLeft":"> .body .is-main", "columnLeftBody":"> .body .is-main > .body", "columnRight":"> .body .is-sidebar", "columnRightBody":"> .body .is-sidebar > .body", "columnRightFooter":"> .body .is-sidebar > .footer", "footer":"> .footer", "scrollable":".scrollable", "pagination":".Pagination"}
	},
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.PersonDossier.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		show: function() {
			var self = this;
			self.getSuper(__module__.PersonDossier.getParent()).show();
			self.relayout();
		},
		
		relayout: function() {
			var self = this;
			var hdr_h = dimension.height(self.uis.header);
			var ui_h = dimension.height(self.ui);
			var ui_w = dimension.width(self.ui);
			var bar_ftr_h = dimension.height(self.uis.columnRightFooter);
			var bar_w = dimension.width(self.uis.columnRight);
			self.uis.body.css({"top":hdr_h, "bottom":"0em"});
			self.uis.columnLeft.css({"width":Math.floor((ui_w - bar_w))});
			self.uis.columnRightBody.css({"top":"0em", "bottom":bar_ftr_h});
			self.getSuper(widgets.Widget).relayout();
		},
		
		setData: function(d) {
			var self = this;
			// Iterates over `self.behaviors`. This works on array,objects and null/undefined
			var __jm=self.behaviors;
			var __km=__jm instanceof Array ? __jm : Object.getOwnPropertyNames(__jm||{});
			var __mm=__km.length;
			for (var __lm=0;__lm<__mm;__lm++){
				var __im=(__km===__jm)?__lm:__km[__lm];
				var _=__jm[__im];
				// This is the body of the iteration with (value=_, key/index=__im) in __jm
				if (behavior.Scrollable.hasInstance(_)) {
					_.scrollTo(0);
				};
			}
			self.getSuper(__module__.PersonDossier.getParent()).setData(d);
			if (d && d.id) {
				self.set({"organizationCSV":__module__.API._url((("person/" + d.id) + ".zip")), "organizationTXT":__module__.API._url((("person/" + d.id) + ".txt"))});
			}
		}
	}
})
/**
  * Filters are used in the search box
  * 
*/
sfm.Filters = extend.Class({
	name  :'sfm.Filters',
	parent: __module__.Sidebar,
	shared: {
		OPTIONS: {"link":null, "delay":1500}
	},
	properties: {
		linkedList:undefined,
		defaultValues:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `linkedList`
		if (typeof(self.linkedList)=='undefined') {self.linkedList = null;};
		// Default value for property `defaultValues`
		if (typeof(self.defaultValues)=='undefined') {self.defaultValues = null;};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Filters.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.Filters.getParent()).bindUI();
			self.cache.facets = {};
			if (self.options.link) {
				var lui = __module__.$(self.options.link);
				if (lui.length > 0) {
					self.linkedList = widgets.ensure(lui);
					self.linkedList.on.change.bind(self.getMethod('onListChanged') );
					self.linkedList.on.loading.bind(self.getMethod('onListLoading') );
				}
			}
			// Iterates over `self.inputs`. This works on array,objects and null/undefined
			var __om=self.inputs;
			var __nm=__om instanceof Array ? __om : Object.getOwnPropertyNames(__om||{});
			var __qm=__nm.length;
			for (var __pm=0;__pm<__qm;__pm++){
				var k=(__nm===__om)?__pm:__nm[__pm];
				var _=__om[k];
				// This is the body of the iteration with (value=_, key/index=k) in __om
				widgets.bindEvent(_, "change", self.getMethod('onInputChanged') );
			}
			self.defaultValues = self.get();
		},
		
		resetFilters: function() {
			var self = this;
			self.set(self.defaultValues);
		},
		
		onInputChanged: function(event) {
			var self = this;
			if (!self.cache.isInitialized) {
				return null;
			}
			if (!self.cache.inputChangedDelayed) {
				self.cache.inputChangedDelayed = new events.Delayed(self.getMethod('doInputChanged') , (self.options.delay || self.getClass().OPTIONS.delay));
			}
			if (self.linkedList) {
				self.linkedList.ui.addClass("loading");
			}
			self.cache.inputChangedDelayed.push((self.options.delay || self.getClass().OPTIONS.delay));
		},
		
		doInputChanged: function() {
			var self = this;
			if (self.linkedList) {
				var o = self.get();
				self.linkedList.loadData(undefined, o);
			}
		},
		
		onListLoading: function(f) {
			var self = this;
			self.set({"exportCSV":(f.url + ".csv"), "exportTXT":(f.url + ".txt")});
		},
		
		onListChanged: function(data, list) {
			var self = this;
			if (self.cache.isInitialized) {
				return false;
			}
			if (self.cache.onListChanging) {
				return null;
			}
			self.cache.onListChanging = true;
			// Iterates over `data.facets`. This works on array,objects and null/undefined
			var __rm=data.facets;
			var __sm=__rm instanceof Array ? __rm : Object.getOwnPropertyNames(__rm||{});
			var __um=__sm.length;
			for (var __tm=0;__tm<__um;__tm++){
				var name=(__sm===__rm)?__tm:__sm[__tm];
				var facet=__rm[name];
				// This is the body of the iteration with (value=facet, key/index=name) in __rm
				var o = extend.reduce(facet, function(r, _) {
					if (_ && _[0]) {
						r[_[0]] = {"label":_[0], "value":_[0], "count":_[1]};
					}
				}, {});;
				// Iterates over `(self.cache.facets[name] || {})`. This works on array,objects and null/undefined
				var __vm=(self.cache.facets[name] || {});
				var __wm=__vm instanceof Array ? __vm : Object.getOwnPropertyNames(__vm||{});
				var __ym=__wm.length;
				for (var __xm=0;__xm<__ym;__xm++){
					var k=(__wm===__vm)?__xm:__wm[__xm];
					var v=__vm[k];
					// This is the body of the iteration with (value=v, key/index=k) in __vm
					o[k] = (o[k] || {"label":k, "value":k, "count":0});
				};
				self.cache.facets[name] = o;
				o = stats.sorted(extend.values(o), stats.comparator(function(_) {
					return _.count;
				}), true);
				// Iterates over `self.inputs[name]`. This works on array,objects and null/undefined
				var __am=self.inputs[name];
				var __bm=__am instanceof Array ? __am : Object.getOwnPropertyNames(__am||{});
				var __dm=__bm.length;
				for (var __cm=0;__cm<__dm;__cm++){
					var __zm=(__bm===__am)?__cm:__bm[__cm];
					var _=__am[__zm];
					// This is the body of the iteration with (value=_, key/index=__zm) in __am
					var w = widgets.Selector.Get(_);;
					if (w) {
						w.setOptions(o, undefined, function(v, oui) {
							return oui.find(".count").text(v.count);
						}, false);
					};
				};
			}
			self.cache.isInitialized = true;
			self.cache.onListChanging = false;
			self.ui.removeClass("loading");
		}
	}
})
/**
  * The search widget, composed of three panels (organizations, events, people).
  * 
*/
sfm.Search = extend.Class({
	name  :'sfm.Search',
	parent: widgets.Widget,
	shared: {
		STATES: {"query":["new", "running", "done"]},
		UIS: {"scrollable":".scrollable", "header":"> .header", "body":"> .body", "maps":".Map", "panelsCnt":".panels", "panels":".panels > .panel", "main":".panels > .panel > .is-main", "mainHeader":".panels > .panel > .is-main > .header", "mainBody":".panels > .panel > .is-main > .body", "mainFooter":".panels > .panel > .is-main > .footer", "sidebar":".panels > .panel > .is-sidebar", "sidebarHeader":".panels > .panel > .is-sidebar > .header", "sidebarBody":".panels > .panel > .is-sidebar > .body", "sidebarFooter":".panels > .panel > .is-sidebar > .footer"}
	},
	properties: {
		cache:undefined,
		maps:undefined,
		locations:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `cache`
		if (typeof(self.cache)=='undefined') {self.cache = {"searches":0};};
		// Default value for property `locations`
		if (typeof(self.locations)=='undefined') {self.locations = new sfm.Locations();};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Search.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.getSuper(__module__.Search.getParent()).bindUI();
			self.maps = extend.map(self.uis.maps, function(_) {
				return widgets.ensure(_);
			});
			// Iterates over `self.ui.find(".widget")`. This works on array,objects and null/undefined
			var __gm=self.ui.find(".widget");
			var __hm=__gm instanceof Array ? __gm : Object.getOwnPropertyNames(__gm||{});
			var __jo=__hm.length;
			for (var __io=0;__io<__jo;__io++){
				var __fm=(__hm===__gm)?__io:__hm[__io];
				var __em=__gm[__fm];
				// This is the body of the iteration with (value=__em, key/index=__fm) in __gm
				self.getMethod('addChild') (__em, __fm, __gm)
			}
			widgets.bindEvent(self.inputs.tab, "change", function() {
				return self.setTab(self.get("tab"));
			});
			widgets.bindEvent(self.inputs.query, "change", self.getMethod('onQueryChanged') );
			widgets.bindEvent(self.inputs.query, "keydown", function() {
				return self.setState("query", "new");
			});
			self.uis.panels.iterate(function(_) {
				var l = widgets.ensure(_.find(".List"));
				var m = widgets.ensure(_.find(".MiniMap"));
				if (m && l) {
					l.on.elementIn.bind(function(e) {
						return m.setFocusedElement(e.id, l.options.type);
					});
					l.on.elementOut.bind(function(e) {
						return m.setFocusedElement(null, l.options.type);
					});
					m.on.elementIn.bind(function(e) {
						return l.setFocusedElement(e.id, l.options.type);
					});
					m.on.elementOut.bind(function(e) {
						return l.setFocusedElement(null, l.options.type);
					});
				}
			});
			self.relayout();
			app.ON.ApplicationDataLoaded.bindWithLastEvent(function(d) {
			});
		},
		
		show: function() {
			var self = this;
			self.getSuper(__module__.Search.getParent()).show();
			animation.after(500, function() {
				return self.inputs.query[0].focus();
			});
			var country = __module__.API.getCurrentCountry();
			var date = sfm.API.getCurrentDate();
			!(country) && extend.assert(false, "sfm.Search.show:", "Search.show: no country defined", "(failed `country`)");
			// Iterates over `self.maps`. This works on array,objects and null/undefined
			var __lo=self.maps;
			var __mo=__lo instanceof Array ? __lo : Object.getOwnPropertyNames(__lo||{});
			var __no=__mo.length;
			for (var __oo=0;__oo<__no;__oo++){
				var __ko=(__mo===__lo)?__oo:__mo[__oo];
				var _=__lo[__ko];
				// This is the body of the iteration with (value=_, key/index=__ko) in __lo
				_.loadMap(country, date).onSucceed((function(_){return (function() {
					return _.focusOnCountry(country);
				})}(_)));
			}
			if (country != self.cache.country) {
			
			}
			self.cache.country = country;
			if (!self.cache.searches) {
				self.search();
			}
			self.relayout();
		},
		
		onQueryChanged: function() {
			var self = this;
			self.setState("query", "new");
			if (!self.cache.searchDelayed) {
				self.cache.searchDelayed = new events.Delayed(function() {
					return self.search();
				}, 150);
			}
			self.cache.searchDelayed.push();
		},
		
		/**
		  * Slides the panels so that the panel with the given name becomes visible
		  * 
		*/
		setTab: function(name) {
			var self = this;
			var index = extend.findLike(self.uis.panels, function(_) {
				return (__module__.$(_).attr("data-name") == name);
			});
			self.uis.panelsCnt.css("left", (stats.scale(index, 1, [0, -100]) + "%"));
		},
		
		updateMapResults: function(listWidget, mapWidget, event) {
			var self = this;
			var t = listWidget.options.type;
			if (t == "organization") {
				var l = extend.reduce(event.results, function(r, e) {
					if (e.area_present && e.area_present.geometry) {
						r.push(e.area_present);
					}
				}, []);
				mapWidget.setOrganizations(l);
			} else if (t == "event") {
				var l = extend.reduce(event.results, function(r, e) {
					if (e.geometry) {
						r.push({"type":"Feature", "id":e.id, "properties":e, "geometry":e.geometry});
					}
				}, []);
				mapWidget.setEvents(l);
			}
		},
		
		relayout: function() {
			var self = this;
			var size = dimension.sizeA(self.ui);
			var hdr_h = dimension.height(self.uis.header);
			var sbr_w = dimension.width(self.uis.sidebar);
			self.uis.body.css("top", hdr_h);
			self.uis.main.css("width", (size[0] - sbr_w));
			// Iterates over `self.uis.panels`. This works on array,objects and null/undefined
			var __po=self.uis.panels;
			var __qo=__po instanceof Array ? __po : Object.getOwnPropertyNames(__po||{});
			var __so=__qo.length;
			for (var __ro=0;__ro<__so;__ro++){
				var i=(__qo===__po)?__ro:__qo[__ro];
				var panel=__po[i];
				// This is the body of the iteration with (value=panel, key/index=i) in __po
				self.uis.mainBody.eq(i).css({"top":dimension.height(self.uis.mainHeader[i]), "bottom":dimension.height(self.uis.mainFooter[i])});
				self.uis.sidebarBody.eq(i).css({"top":dimension.height(self.uis.sidebarHeader[i]), "bottom":dimension.height(self.uis.sidebarFooter[i])});
			}
			self.getSuper(__module__.Search.getParent()).relayout();
		},
		
		clear: function() {
			var self = this;
			self.set("query", "");
		},
		
		/**
		  * Starts a new serch query, forcing the loading of data for all the
		  * child widgets that implement the method.
		  * 
		*/
		search: function() {
			var self = this;
			var query = (self.get("query") || null);
			if (!query) {
				return null;
			}
			if (self.cache.searchDelayed) {
				self.cache.searchDelayed.cancel();
			}
			self.cache.searches = (self.cache.searches + 1);
			self.setState("query", "running");
			self.cache.searchedQuery = query;
			var rdv = new channels.RendezVous();
			// Iterates over `self.children`. This works on array,objects and null/undefined
			var __uo=self.children;
			var __vo=__uo instanceof Array ? __uo : Object.getOwnPropertyNames(__uo||{});
			var __xo=__vo.length;
			for (var __wo=0;__wo<__xo;__wo++){
				var __to=(__vo===__uo)?__wo:__vo[__wo];
				var child=__uo[__to];
				// This is the body of the iteration with (value=child, key/index=__to) in __uo
				if (extend.isDefined(child.loadData)) {
					child.options.query = query;
					var f = child.loadData().onFail(function() {
						return console.error("Search.search(): child failed with query", self.get("query"), "progress", rdv.getProgress());
					});
					rdv.register(f);
				};
			}
			rdv.onMeet(function() {
				return self.setState("query", "done");
			});
		}
	}
})

sfm.Application = extend.Class({
	name  :'sfm.Application',
	parent: app.Application,
	shared: {
		STATES: extend.merge({"country":[false, true], "focus":["countries", "map", "chart"], "overlay":["none", "search", "about", "organization-dossier", "person-dossier"]}, app.Application.STATES),
		UIS: extend.merge({"navigation":"> .Navigation", "content":"> .Content", "sections":"> .Content > .section", "landing":"> .Content .Landing", "overlays":"> .Overlays > .overlay", "dossierSidebar":"> .Overlays > .Dossier .width-sidebar"}, app.Application.UIS),
		OPTIONS: extend.merge({"sidebarWidth":450}, app.Application.OPTIONS)
	},
	properties: {
		countrySidebar:undefined,
		organizationSidebar:undefined,
		eventSidebar:undefined,
		personSidebar:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `countrySidebar`
		if (typeof(self.countrySidebar)=='undefined') {self.countrySidebar = null;};
		// Default value for property `organizationSidebar`
		if (typeof(self.organizationSidebar)=='undefined') {self.organizationSidebar = null;};
		// Default value for property `eventSidebar`
		if (typeof(self.eventSidebar)=='undefined') {self.eventSidebar = null;};
		// Default value for property `personSidebar`
		if (typeof(self.personSidebar)=='undefined') {self.personSidebar = null;};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Application.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.cache.focusOffsets = {};
			__module__.Connector.SetSource(self.ui.attr("data-source"));
			self.getSuper(__module__.Application.getParent()).bindUI();
			self.bindChildren();
			self.countrySidebar = extend.first(self.children, function(_) {
				return (_.ui.hasClass("SidebarContainer") && (_.ui.data("name") == "country"));
			});
			self.organizationSidebar = extend.first(self.children, function(_) {
				return (_.ui.hasClass("SidebarContainer") && (_.ui.data("name") == "organization"));
			});
			self.eventSidebar = extend.first(self.children, function(_) {
				return (_.ui.hasClass("SidebarContainer") && (_.ui.data("name") == "event"));
			});
			self.personSidebar = extend.first(self.children, function(_) {
				return (_.ui.hasClass("SidebarContainer") && (_.ui.data("name") == "person"));
			});
			app.ON.APIFailed.bindWithLastEvent(self.getMethod('onAPIFailed') );
		},
		
		loadData: function() {
			var self = this;
			return channels.join({"countries":__module__.API.listCountries()});
		},
		
		onURLStateChanged: function(event) {
			var self = this;
			if (event.isInitial || event.changed.focus) {
				self.setFocus((event.values.focus || ""));
			}
			var overlay = true;
			if (event.isInitial || event.changed.__path__) {
				var path = app.URL.parsePath();
				if (app.URL.pathLike("country")) {
					if (extend.len(path) == 1) {
						self.countrySidebar.setPanel(0);
						self.setState("country", false);
					} else {
						self.setState("country", true);
						var country = path[1];
						var country_data = extend.first(self.data.countries, function(_) {
							return (_.id == country);
						});
						if (country_data) {
							country = widgets.T(country_data.properties.name);
						}
						if (self.cache.country != country) {
							self.cache.country = country;
						}
						self.set("country", country);
						self.countrySidebar.setPanel(1);
					}
				} else {
					self.setState("country", false);
				}
				if (app.URL.pathLike("country", undefined, "p", undefined)) {
					self.organizationSidebar.setPanel(3);
				} else if (app.URL.pathLike("country", undefined, "o", undefined)) {
					self.organizationSidebar.setPanel(1);
				} else if (app.URL.pathLike("country", undefined, "e", undefined)) {
					self.organizationSidebar.setPanel(2);
				} else {
					self.organizationSidebar.setPanel(0);
				}
				if (!event.isInitial) {
					app.URL.remove("overlay");
					overlay = false;
				}
			}
			if (overlay && (event.isInitial || event.changed.overlay)) {
				self.showOverlay(event.values.overlay);
			}
		},
		
		onAPIFailed: function(event) {
			var self = this;
			self.set({"errorURL":event.future.url, "errorReason":event.future._failureReason, "errorStatus":event.future._failureStatus, "errorRetries":event.future.retries});
			self.cache.failedFuture = event.future;
			self.showOverlay("apifailed");
		},
		
		retryFailedAPI: function() {
			var self = this;
			if (self.cache.failedFuture) {
				self.cache.failedFuture.retries = 0;
				self.cache.failedFuture.retry();
				self.hideOverlays();
			}
		},
		
		relayout: function() {
			var self = this;
			self.getSuper(__module__.Application.getParent()).relayout({});
			self.ui.addClass("no-animation");
			var nav_h = dimension.height(self.uis.navigation);
			var app_w = self.cache.size[0];
			var app_h = self.cache.size[1];
			var cnt_h = (app_h - nav_h);
			var bar_w = (app.UNITS.p * self.options.sidebarWidth);
			self.uis.content.css("top", nav_h);
			self.uis.overlays.css("top", nav_h);
			self.uis.sections.iterate(function(_) {
				if (_.hasClass("Sidebar")) {
					_.css({"width":bar_w, "height":cnt_h});
				} else if (_.hasClass("Map")) {
					_.css({"width":(app_w - bar_w), "height":cnt_h});
				} else if (_.hasClass("Chart")) {
					_.css({"width":(app_w - bar_w), "height":cnt_h});
				} else {
					extend.error("Application.relayout: Unsupported node type", _);
				}
			});
			self.uis.dossierSidebar.css("width", bar_w);
			self.cache.focusOffsets = {"map":bar_w, "chart":app_w};
			// Iterates over `self.children`. This works on array,objects and null/undefined
			var __zo=self.children;
			var __ao=__zo instanceof Array ? __zo : Object.getOwnPropertyNames(__zo||{});
			var __co=__ao.length;
			for (var __bo=0;__bo<__co;__bo++){
				var __yo=(__ao===__zo)?__bo:__ao[__bo];
				var _=__zo[__yo];
				// This is the body of the iteration with (value=_, key/index=__yo) in __zo
				_.relayout();
			}
			self.setFocus();
			self.ui.removeClass("no-animation");
		},
		
		setFocus: function(focus) {
			var self = this;
			if (focus === undefined) {focus=self.cache.focus}
			self.uis.content.css("left", (0 - (self.cache.focusOffsets[focus] || 0)));
			self.cache.focus = focus;
			self.setState("focus", (focus || "countries"));
			return self;
		},
		
		showOverlay: function(name) {
			var self = this;
			self.setState("overlay", (name || "none"));
			self.uis.overlays.iterate(function(o) {
				var w = widgets.get(o);
				if (w) {
					if (o.data("name") == name) {
						w.show();
					} else {
						w.hide();
					}
				} else {
					o.toggleClass("hidden", (o.data("name") != name));
				}
			});
		},
		
		hideOverlays: function() {
			var self = this;
			self.showOverlay();
		}
	}
})
sfm.start = function(){
	var self = sfm;
	extend.merge(app.ON, events.create(["OrganizationFocused", "EventFocused", "MapLoading", "MapLoaded"]));
	widgets.mergeTranslations({"undefined":{"en":"N/A"}, "N/A":{"en":"N/A"}, "Confidence: ":{"en":"Confidence: "}, "High":{"en":"High"}, "Low":{"en":"Low"}, "Medium":{"en":"Medium"}, "Unknown commander":{"en":"Unknown commander"}});
	widgets.mergeFormats({"commander":function(v, e) {
		e = __module__.$(e);
		if (v) {
			e.removeClass("empty");
			v = extend.copy(v);
			var data = v;
			var name = html.span({"_":"name clickable"}, v.name);
			__module__.$(name).click(function(_) {
				return app.URL.updatePath(undefined, undefined, "p", data.id);
			});
			var other = html.span({"_":"other-names"});
			var dates = html.span({"_":"dates"});
			if (v.first_cited || v.last_cited) {
				dates.appendChild(html.span({"_":"first date"}, (v.first_cited || "N/A")));
				dates.appendChild(html.span({"_":"sep"}, "\u2013"));
				dates.appendChild(html.span({"_":"last date"}, (v.last_cited || "N/A")));
			}
			v.value = html.span({"_":"person"}, name, other);
			var v = widgets.FORMATTERS.withSource(v);
			if (extend.isString(v) || (!v)) {
				return v;
			} else {
				return __module__.$(v).append(dates).addClass("commander");
			}
		} else {
			e.addClass("empty");
			return widgets.FORMATTERS["default"](v, e[0]);
		}
	}, "commanderEventsCount":function(v) {
		if (v) {
			return widgets.FORMATTERS.count(v.events_count);
		} else {
			return 0;
		}
	}, "count":function(v) {
		if (extend.isList(v) || extend.isMap(v)) {
			return extend.len(v);
		} else {
			return formatting.Number.Integer(parseInt(v));
		}
	}, "date":function(v, e) {
		if ((!v) || (extend.len(v) == 0)) {
			return null;
		} else if (extend.isString(v)) {
			return widgets.FORMATTERS.isodate(__module__.API.parseDate(v));
		} else if (extend.isList(v)) {
			return widgets.FORMATTERS.isodate(v);
		} else {
			return widgets.FORMATTERS.withSource(v, e);
		}
	}, "element":function(v, e, tmpl) {
		!(tmpl) && extend.assert(false, "sfm.start:", "FORMATTERS.element: template required", "(failed `tmpl`)");
		var t = tmpl.clone().removeClass("template").addClass("actual");
		var r = new widgets.Element(t);
		v = extend.merge(extend.map(r.get(), function(_) {
			return widgets.DEFAULT;
		}), v, true);
		t.reset();
		v.self = v;
		r.set(v);
		return t;
	}, "listItems":function(v, e) {
		e = __module__.$(e);
		e.find("li.actual").remove();
		var tmpl = e.find("li.template");
		if (v && (extend.len(v) != 0)) {
			if (extend.isMap(v)) {
				v = [v];
			}
			e.removeClass("empty");
			var format = widgets.FORMATTERS[(e.attr("data-item-format") || "value")];
			!(format) && extend.assert(false, "sfm.start:", "FORMATTERS.listItem: Item format not found", (e.attr("data-item-format") || "value"), "(failed `format`)");
			// Iterates over `v`. This works on array,objects and null/undefined
			var __eo=v;
			var __fo=__eo instanceof Array ? __eo : Object.getOwnPropertyNames(__eo||{});
			var __ho=__fo.length;
			for (var __go=0;__go<__ho;__go++){
				var __do=(__fo===__eo)?__go:__fo[__go];
				var _=__eo[__do];
				// This is the body of the iteration with (value=_, key/index=__do) in __eo
				var s = html.span({"_":"value"});;
				var t = format(_, s, tmpl);;
				if (widgets.isSelection(t) && t.is("li")) {
					t.addClass("actual");
					t.data(_);
					e.append(t);
				} else {
					__module__.$(s).append(t);
					t = __module__.$(html.li({"_":("actual " + (e.attr("data-item-class") || ""))}, s));
					e.append(t);
				};
			}
			return widgets.NOTHING;
		} else {
			e.addClass("empty");
			return undefined;
		}
	}, "organization":function(v, e) {
		if (v && v.id) {
			e = __module__.$(e);
			e.addClass("clickable");
			__module__.$(e).click(function(_) {
				return app.URL.updatePath(undefined, undefined, "o", v.id);
			});
			return v.name;
		} else {
			return ((v && v.name) || widgets.FORMATTERS["default"](v, e));
		}
	}, "person":function(v, e) {
		if (v && v.id) {
			e = __module__.$(e);
			e.addClass("clickable");
			__module__.$(e).click(function(_) {
				return app.URL.updatePath(undefined, undefined, "p", v.id);
			});
			return v.name;
		} else {
			return ((v && v.name) || widgets.FORMATTERS["default"](v, e));
		}
	}, "value":function(v, e) {
		e = __module__.$(e);
		if (extend.isMap(v)) {
			e.removeClass("empty");
			return (v.value || v.name);
		} else if (v) {
			e.removeClass("empty");
			return v;
		} else {
			e.addClass("empty");
			return widgets.T(e.data("default"));
		}
	}, "withSource":function(v, e) {
		if (v) {
			var text = (v.value || v.name);
			var confidence = html.span({"_":"confidence", "title":(widgets.T("Confidence: ") + widgets.T(v.confidence)), "data-level":stats.asKey(v.confidence)});
			if (!v.confidence) {
				confidence = undefined;
			}
			var sources = html.span({"_":"sources"});
			// Iterates over `v.sources`. This works on array,objects and null/undefined
			var __jn=v.sources;
			var __kn=__jn instanceof Array ? __jn : Object.getOwnPropertyNames(__jn||{});
			var __mn=__kn.length;
			for (var __ln=0;__ln<__mn;__ln++){
				var __in=(__kn===__jn)?__ln:__kn[__ln];
				var _=__jn[__in];
				// This is the body of the iteration with (value=_, key/index=__in) in __jn
				var i = extend.find(__module__.API.sources, _);;
				if (i == -1) {
					i = extend.len(__module__.API.sources);
					__module__.API.sources.push(_);
				};
				sources.appendChild(html.span({"_":"source-index", "title":_.title}, "[", html.span({"_":"T"}, ("" + (i + 1))), "]"));
			}
			__module__.$(sources).click(function(e) {
				var t = interaction.target(e, "source-index");
				var widget_ui = __module__.$(e.target).parents(".Dossier");
				if (!extend.len(widget_ui)) {
					widget_ui = __module__.$(e.target).parents(".Summary");
				}
				if (widget_ui) {
					var widget = widgets.get(widget_ui);
					var scrollable = widget.behaviors.sideScrollable;
					var sources = widget.outputs.sources;
					if (scrollable && sources) {
						if (extend.len(sources) > 1) {
							sources = __module__.$(sources[0]);
						}
						var bounds = dimension.bounds(sources, scrollable.ui);
						var offset = bounds.y;
						scrollable.scrollTo((offset + (0 - scrollable.cache.offset)));
					}
				}
			});
			if (text) {
				__module__.$(e).removeClass("empty");
				return html.span({"_":"with-source", "confidence":stats.asKey(v.confidence)}, text, sources, confidence);
			} else {
				return widgets.FORMATTERS["default"](v, __module__.$(e).addClass("empty")[0]);
			}
		} else {
			return widgets.FORMATTERS["default"](v, __module__.$(e).addClass("empty")[0]);
		}
	}, "sources":function(v, e) {
		if (v && (extend.len(v.sources) > 0)) {
			v = extend.copy(v);
			v.value = " ";
			return widgets.FORMATTERS.withSource(v, e);
		} else {
			return "";
		}
	}});
	app.addEvents("APIFailed");
	__module__.API = __module__.Connector.Get();
	app.APP = app.start(function() {
		widgets.bind("*");
		return app.ON.ApplicationDataLoaded.bind(function() {
			return app.ON.ApplicationInitialized.trigger();
		});
	});
}
sfm.init = function(){
	var self = sfm;
}
if (typeof(sfm.init)!="undefined") {sfm.init();}

// START:VANILLA_POSTAMBLE
return sfm;})(sfm);
// END:VANILLA_POSTAMBLE
