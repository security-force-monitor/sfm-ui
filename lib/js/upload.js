// 8< ---[upload.js]---
// START:VANILLA_PREAMBLE
var upload=typeof(extend)!='undefined' ? extend.module('upload') : (typeof(upload)!='undefined' ? upload : {});
(function(upload){
var Widget = widgets.Widget;
var __module__=upload;
// END:VANILLA_PREAMBLE

upload.__VERSION__='1.4.1';
upload.LICENSE = "http://ffctn.com/doc/licenses/bsd";
upload.$ = jQuery.noConflict();
/**
  * The UploadEngine class interfaces with the retro.contrib.upload module and
  * allows to asynchronously upload data while having upload progress information.
  * 
*/
upload.UploadEngine = extend.Class({
	name  :'upload.UploadEngine',
	parent: undefined,
	shared: {
		STATUS: {"IS_NEW":0, "IS_STARTED":1, "IS_IN_PROGRESS":2, "IS_DECODING":4, "IS_COMPLETED":5, "IS_FAILED":6},
		UIS: {"uploadFile":"input[type=file]", "uploadForm":"form"},
		HTTP: new channels.AsyncChannel(),
		OPTIONS: {"refresh":1000, "initialWaitThreshold":5000, "updateWaitThreshold":5000}
	},
	properties: {
		ui:undefined,
		id:undefined,
		name:undefined,
		result:undefined,
		bytesRead:undefined,
		started:undefined,
		percentage:undefined,
		isUploading:undefined,
		options:undefined,
		on:undefined,
		cache:undefined,
		uis:undefined
	},
	initialize: function( options ){
		var self = this;
		if (options === undefined) {options=null}
		// Default initialization of property `ui`
		if (typeof(self.ui)=='undefined') {self.ui = null;};
		// Default initialization of property `id`
		if (typeof(self.id)=='undefined') {self.id = null;};
		// Default initialization of property `name`
		if (typeof(self.name)=='undefined') {self.name = null;};
		// Default initialization of property `result`
		if (typeof(self.result)=='undefined') {self.result = null;};
		// Default initialization of property `bytesRead`
		if (typeof(self.bytesRead)=='undefined') {self.bytesRead = 0;};
		// Default initialization of property `started`
		if (typeof(self.started)=='undefined') {self.started = undefined;};
		// Default initialization of property `percentage`
		if (typeof(self.percentage)=='undefined') {self.percentage = 0;};
		// Default initialization of property `isUploading`
		if (typeof(self.isUploading)=='undefined') {self.isUploading = false;};
		// Default initialization of property `options`
		if (typeof(self.options)=='undefined') {self.options = {};};
		// Default initialization of property `on`
		if (typeof(self.on)=='undefined') {self.on = events.create(["start", "progress", "complete", "failed"]);;};
		// Default initialization of property `cache`
		if (typeof(self.cache)=='undefined') {self.cache = {};};
		// Default initialization of property `uis`
		if (typeof(self.uis)=='undefined') {self.uis = {"iframe":null, "uploadFile":__module__.$(html.input({"name":"data", "type":"file"})), "uploadForm":__module__.$(html.form({"class":"upload", "method":"POST", "enctype":"multipart/form-data", "style":"display:none"}))};};
		self.id = self.GenerateID();
		self.name = ("Upload_" + self.id);
		self.ui = self.uis.uploadForm;
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
		self.uis.uploadForm.append(self.uis.uploadFile);
		self.ui.attr("data-upload", self.id);
		__module__.$("body").append(self.ui);
		self.uis.iframe = __module__.$(html.iframe({"name":self.name, "style":"width:0px;height:0px;border:0px solid transparent;"}));
		self.ui.attr("target", self.name).append(self.uis.iframe);
		self.uis.uploadFile.change(function(event) {
			return self.on.start.trigger();
		});
	},
	methods: {
		remove: function() {
			var self = this;
			// Iterates over `self.on`. This works on array,objects and null/undefined
			var __r=self.on;
			var __s=__r instanceof Array ? __r : Object.getOwnPropertyNames(__r||{});
			var __u=__s.length;
			for (var __t=0;__t<__u;__t++){
				var __q=(__s===__r)?__t:__s[__t];
				var _=__r[__q];
				// This is the body of the iteration with (value=_, key/index=__q) in __r
				_.clear();
			}
			self.ui.remove();
		},
		
		upload: function(targetURL, progressURL, uid) {
			var self = this;
			if (targetURL === undefined) {targetURL=undefined}
			if (progressURL === undefined) {progressURL=undefined}
			if (uid === undefined) {uid=undefined}
			var f = new channels.Future();
			targetURL = (targetURL || self.cache.targetURL);
			self.cache.targetURL = targetURL;
			progressURL = (progressURL || self.cache.progressURL);
			self.cache.progressURL = progressURL;
			uid = (uid || self.cache.uid);
			self.cache.uid = uid;
			if (self.cache.future) {
				self.cache.future.fail();
				self.cache.future = undefined;
			}
			if (self.cache.callback) {
				self.on.start.unbind(self.cache.callback);
				self.cache.callback = undefined;
			}
			self.cache.future = f;
			self.cache.callback = self.on.start.bindOnce(function() {
				return f.set(self.doUpload(targetURL, progressURL, uid));
			});
			self.uis.uploadFile.trigger("click");
			return f;
		},
		
		/**
		  * Tracks the progress made on the given upload
		  * 
		*/
		trackProgress: function(progressURL, uid) {
			var self = this;
			if (!self.isUploading) {
				self.result = null;
				self.started = new Date().getTime();
				self.percentage = 0;
				self.bytesRead = 0;
				query = self.getClass().HTTP.get(progressURL.replace("${ID}", escape(uid)));
				query.onSucceed(function(_) {
					return self.doUploadProgress(query, _);
				}).onFail(function() {
					if (!query.retry(5, (1000 * query.retries))) {
						self.on.failed.trigger("failure");
					}
				});
				return self;
			} else {
				return null;
			}
		},
		
		/**
		  * Queries the status of the given upload. This will retrieve the upload
		  * information, if any, and return it as a future.
		  * 
		*/
		queryStatus: function(progressURL, uid) {
			var self = this;
			return self.getClass().HTTP.get(progressURL.replace("${ID}", escape(uid)));
		},
		
		/**
		  * Triggers an upload
		  * 
		*/
		doUpload: function(targetURL, progressURL, uid) {
			var self = this;
			if (progressURL === undefined) {progressURL=null}
			if (uid === undefined) {uid=("" + self.getClass().getOperation('GenerateID')())}
			self.isUploading = true;
			result = null;
			self.started = new Date().getTime();
			self.percentage = 0;
			self.bytesRead = 0;
			var query = null;
			var upload_id = uid;
			self.uis.uploadForm.attr("action", targetURL.replace("${ID}", escape(upload_id)));
			var result = self.uis.uploadForm.submit();
			if (progressURL) {
				query = self.getClass().HTTP.get(progressURL.replace("${ID}", escape(upload_id)));
				query.onSucceed(function(_) {
					return self.doUploadProgress(query, _);
				}).onFail(function() {
					if (!query.retry(5, (1000 * query.retries))) {
						self.on.failed.trigger("failure");
					}
				});
			}
			return query;
		},
		
		/**
		  * The callback that processes upload progress information returned by
		  * the server
		  * 
		*/
		doUploadProgress: function(query, value) {
			var self = this;
			var upload_failed = false;
			var reason = value.exception;
			var percentage = (value.progress || 0);
			var bytes_read = (value.bytesRead || 0);
			var status = value.status;
			var elapsed = (new Date().getTime() - self.started);
			if (bytes_read != self.bytesRead) {
				self.bytesRead = bytes_read;
			} else if (value.error || (status == self.getClass().STATUS.IS_FAILED)) {
				upload_failed = true;
			} else {
				if ((self.bytesRead == 0) && (elapsed > self.options.initialWaitThreshold)) {
					upload_failed = true;
					reason = "timeout.start";
				} else if ((self.bytesRead > 0) && (elapsed > self.options.updateWaitThreshold)) {
					upload_failed = true;
					reason = "timeout.progress";
				}
			}
			if (!upload_failed) {
				self.on.progress.trigger(value);
				if (status != self.getClass().STATUS.IS_COMPLETED) {
					window.setTimeout(function() {
						return query.redo();
					}, self.options.refresh);
				} else {
					if (extend.isMap(value)) {
						self.result = value.data;
					}
					self.on.complete.trigger(value);
					self.isUploading = false;
				}
			} else {
				self.on.failed.trigger(value);
				self.isUploading = false;
			}
		},
		
		cancel: function(url) {
			var self = this;
			if (url === undefined) {url="/api/ping"}
			self.isUploading = false;
		},
		
		getFilename: function() {
			var self = this;
			return extend.access(self.uis.uploadFile.val().split("/"),-1);
		},
		
		getRemainingTime: function() {
			var self = this;
			if (self.percentage < 100) {
				var elapsed = ((new Date().getTime() - self.started) / 1000);
				var second_per_percent = (elapsed / (self.percentage || 1));
				return (second_per_percent * (100 - self.percentage));
			} else {
				return 0;
			}
		}
	},
	operations:{
		/**
		  * Returns a unique ID to be used by the form that will be dynamically
		  * created and used to submit the file.
		  * 
		*/
		GenerateID: function(  ){
			var self = this;
			var t = (new Date().getTime() * 10000);
			t = (t + Math.floor((Math.random() * 10000)));
			return t;
		}
	}
})
/**
  * A widget that allows to upload files, get progress updates and display
  * preview/information for the uploaded file. This wraps an engine, forwarding
  * events and updating the UI.
  * 
*/
upload.Uploader = extend.Class({
	name  :'upload.Uploader',
	parent: widgets.Widget,
	shared: {
		STATES: {"data":["none", "available", "processing", "processingunknown"], "upload":["none", "progress", "complete", "failed"]},
		ON: events.create(["UploadStart", "UploadProgress", "UploadComplete", "UploadCancelled", "UploadFailed"]),
		UIS: {"progressBar":".progress .bar"},
		OPTIONS: {"type":"file", "post":"/api/upload/${TYPE}/${ID}", "progress":"/api/upload/${ID}", "maxStatusQueries":10}
	},
	properties: {
		on:undefined,
		engine:undefined,
		uploadID:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `on`
		if (typeof(self.on)=='undefined') {self.on = events.create(["start", "progress", "complete", "failed", "cancelled", "change"]);};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Uploader.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		_ensureEngine: function() {
			var self = this;
			if (!self.engine) {
				self.engine = new upload.UploadEngine();
				self.engine.on.start.bind(function(_) {
					self.cache.statusQueries = 0;
					self.cache.isComplete = false;
					self.setState("upload", "progress");
					self.getClass().ON.UploadStart.trigger({"upload":self.uploadID, "uploader":self});
					return self.on.start.trigger({"upload":self.uploadID, "uploader":self});
				});
				self.engine.on.progress.bind(function(_) {
					return self._setProgress(_.progress);
				});
				self.engine.on.complete.bind(function(_) {
					self.setState("upload", "complete");
					return self._setComplete(_);
				});
				self.engine.on.failed.bind(function(_) {
					self.setState("upload", "failed");
					return self.on.failed.trigger(_);
				});
			}
		},
		
		uploadFile: function() {
			var self = this;
			self._ensureEngine();
			self.uploadID = __module__.UploadEngine.GenerateID();
			self.engine.upload(self.options.post.replace("${TYPE}", self.options.type), self.options.progress.replace("${TYPE}", self.options.type), self.uploadID);
		},
		
		trackProgress: function(uploadID) {
			var self = this;
			self.setState("upload", "progress");
			self._ensureEngine();
			self.uploadID = uploadID;
			self.engine.trackProgress(self.options.progress.replace("${TYPE}", self.options.type), uploadID);
		},
		
		retry: function() {
			var self = this;
			self.engine.upload();
		},
		
		setData: function(data, forceChange) {
			var self = this;
			if (forceChange === undefined) {forceChange=false}
			var has_changed = (self.data != data);
			self.getSuper(__module__.Uploader.getParent()).setData(data);
			self.set(data);
			if (data) {
				self.setState("data", "available");
			} else {
				self.setState("data", "none");
			}
			if (has_changed || forceChange) {
				self.on.change.trigger(self.getData());
			}
		},
		
		setState: function(name, value) {
			var self = this;
			if (name == "data") {
				self.ui.toggleClass("with-file", (value == "available"));
			}
			return self.getSuper(__module__.Uploader.getParent()).setState(name, value);
		},
		
		removeFile: function() {
			var self = this;
			self.setData(null);
			self.setState("upload", "none");
		},
		
		cancel: function() {
			var self = this;
			self.getClass().ON.UploadCancelled.trigger({"uploader":self});
			self.on.cancelled.trigger({"uploader":self});
			self.engine.cancel();
		},
		
		_setProgress: function(progress) {
			var self = this;
			if (progress === undefined) {progress=0}
			self.getClass().ON.UploadProgress.trigger({"progress":progress, "uploader":self});
			self.on.progress.trigger({"progress":progress, "uploader":self});
			self.uis.progressBar.css("width", (progress + "%"));
			self.set("progress", (progress + "%"));
		},
		
		_setComplete: function(value) {
			var self = this;
			self.ui.data("value", value);
			if (!value.data) {
				self.setData(value.data, true);
				self.setState("data", "processing");
				if (!self.cache._statusDelayed) {
					self.cache._statusDelayed = new events.Delayed(self.getMethod('_queryStatus') , 1000);
				}
				if (self.cache.statusQueries < self.options.maxStatusQueries) {
					self.cache._statusDelayed.push();
				} else {
					self.setState("data", "processingunknown");
				}
			} else {
				self.setData(value.data);
				if (self.cache._statusDelayed) {
					self.cache._statusDelayed.stop();
				}
			}
			if (!self.cache.isComplete) {
				self.on.complete.trigger({"value":value, "uploader":self});
				self.getClass().ON.UploadComplete.trigger({"value":value, "uploader":self});
				self.cache.isComplete = true;
			}
		},
		
		_queryStatus: function() {
			var self = this;
			self.cache.statusQueries = (self.cache.statusQueries + 1);
			return self.engine.queryStatus(self.options.progress.replace("${TYPE}", self.options.type), self.uploadID).onSucceed(function(value) {
				return self._setComplete(value);
			});
		}
	}
})
upload.init = function(){
	var self = upload;
}
if (typeof(upload.init)!="undefined") {upload.init();}

// START:VANILLA_POSTAMBLE
return upload;})(upload);
// END:VANILLA_POSTAMBLE
