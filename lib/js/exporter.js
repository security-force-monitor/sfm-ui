// 8< ---[exporter.js]---
// START:VANILLA_PREAMBLE
var exporter=typeof(extend)!='undefined' ? extend.module('exporter') : (typeof(exporter)!='undefined' ? exporter : {});
(function(exporter){
var Widget = widgets.Widget;
var __module__=exporter;
// END:VANILLA_PREAMBLE

exporter.__VERSION__='1.0.1';

exporter.SVGExporter = extend.Class({
	name  :'exporter.SVGExporter',
	parent: undefined,
	shared: {
		OPTIONS: {"label":"Download SVG", "copyStyles":true}
	},
	properties: {
		options:undefined,
		ui:undefined,
		uis:undefined
	},
	initialize: function( ui, options ){
		var self = this;
		// Default initialization of property `options`
		if (typeof(self.options)=='undefined') {self.options = {};};
		// Default initialization of property `uis`
		if (typeof(self.uis)=='undefined') {self.uis = {};};
		!(base64) && extend.assert(false, "exporter.SVGExporter.__init__:", "exporter.SVGExporter requires the base64 module", "(failed `base64`)");
		// Iterates over `self.getClass().OPTIONS`. This works on array,objects and null/undefined
		var __i=self.getClass().OPTIONS;
		var __j=__i instanceof Array ? __i : Object.getOwnPropertyNames(__i||{});
		var __l=__j.length;
		for (var __k=0;__k<__l;__k++){
			var k=(__j===__i)?__k:__j[__k];
			var v=__i[k];
			// This is the body of the iteration with (value=v, key/index=k) in __i
			self.options[k] = v;
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
		self.ui = $(ui);
		self.bindUI();
	},
	methods: {
		bindUI: function() {
			var self = this;
			self.uis.svg = self.ui.find("svg");
			self.ui.append(self._createAction());
			self.ui.addClass("has-exporter");
		},
		
		_createAction: function() {
			var self = this;
			self.uis.action = $(html.a({"_":"exporter action", "target":"_blank"}, html.span({"_":"text"}, self.options.label)));
			self.ui.append(self.uis.action);
			self.uis.action.bind("click", self.getMethod('doExport') );
		},
		
		copyStyles: function(nodes) {
			var self = this;
			var styles = [];
			// Iterates over `nodes`. This works on array,objects and null/undefined
			var __r=nodes;
			var __s=__r instanceof Array ? __r : Object.getOwnPropertyNames(__r||{});
			var __u=__s.length;
			for (var __t=0;__t<__u;__t++){
				var __q=(__s===__r)?__t:__s[__t];
				var node=__r[__q];
				// This is the body of the iteration with (value=node, key/index=__q) in __r
				var node = $(node);;
				styles.push(node.attr("style"));
				var style = [];;
				// Iterates over `["stroke", "fill", "opacity", "stroke-width", "font-family", "font-size", "text-transform"]`. This works on array,objects and null/undefined
				var __w=["stroke", "fill", "opacity", "stroke-width", "font-family", "font-size", "text-transform"];
				var __x=__w instanceof Array ? __w : Object.getOwnPropertyNames(__w||{});
				var __z=__x.length;
				for (var __y=0;__y<__z;__y++){
					var __v=(__x===__w)?__y:__x[__y];
					var p=__w[__v];
					// This is the body of the iteration with (value=p, key/index=__v) in __w
					var v = node.css(p);;
					if (extend.isDefined(v)) {
						style.push((((p + ":") + v) + ";"));
					};
				};
				if (extend.len(style) > 0) {
					node.attr("style", style.join(""));
				};
			}
			return styles;
		},
		
		resetStyles: function(nodes, styles) {
			var self = this;
			// Iterates over `nodes`. This works on array,objects and null/undefined
			var __a=nodes;
			var __b=__a instanceof Array ? __a : Object.getOwnPropertyNames(__a||{});
			var __d=__b.length;
			for (var __c=0;__c<__d;__c++){
				var i=(__b===__a)?__c:__b[__c];
				var node=__a[i];
				// This is the body of the iteration with (value=node, key/index=i) in __a
				node.setAttribute("style", styles[i]);
			}
		},
		
		doExport: function() {
			var self = this;
			var s = self.uis.svg;
			var nodes = s.find("*");
			var styles = self.copyStyles(nodes);
			var t = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\r\n";
			t = (t + "<svg xmlns=\"http://www.w3.org/2000/svg\"");
			// Iterates over `s[0].attributes`. This works on array,objects and null/undefined
			var __f=s[0].attributes;
			var __g=__f instanceof Array ? __f : Object.getOwnPropertyNames(__f||{});
			var __ij=__g.length;
			for (var __h=0;__h<__ij;__h++){
				var __e=(__g===__f)?__h:__g[__h];
				var a=__f[__e];
				// This is the body of the iteration with (value=a, key/index=__e) in __f
				if (a.name != "xmlns") {
					t = (t + ((((" " + a.name) + "=\"") + a.value) + "\""));
				};
			}
			t = (t + ">");
			t = (t + s.html());
			t = (t + "</svg>");
			var href = ("data:image/svg+xml;base64," + base64.encode(t));
			self.uis.action.attr("href", href);
			self.resetStyles(nodes, styles);
		}
	}
})
exporter.bind = function(ui){
	var self = exporter;
	return new __module__.SVGExporter(ui);
}
exporter.init = function(){
	var self = exporter;
}
if (typeof(exporter.init)!="undefined") {exporter.init();}

// START:VANILLA_POSTAMBLE
return exporter;})(exporter);
// END:VANILLA_POSTAMBLE
