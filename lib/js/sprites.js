// 8< ---[sprites.js]---
// START:VANILLA_PREAMBLE
var sprites=typeof(extend)!='undefined' ? extend.module('sprites') : (typeof(sprites)!='undefined' ? sprites : {});
(function(sprites){
var __module__=sprites;
// END:VANILLA_PREAMBLE

sprites.__VERSION__='0.0.0';
sprites.LICENSE = "http://ffctn.com/doc/licenses/bsd";
/**
  * Loads a spritesheet from an image, generates flipped versions and
  * allows to extract a subset of it.
  * 
*/
sprites.Spritesheet = extend.Class({
	name  :'sprites.Spritesheet',
	parent: undefined,
	properties: {
		spriteSize:undefined,
		gridSize:undefined,
		imageSize:undefined,
		imageLeft:undefined,
		imageRight:undefined
	},
	/**
	  * Creates a new spritesheet with the given `[width,height]` spritesize
	  * with data from the given `url` (or `img`, `canvas` or `video` element).
	  * 
	*/
	initialize: function( spriteSize, url ){
		var self = this;
		// Default initialization of property `spriteSize`
		if (typeof(self.spriteSize)=='undefined') {self.spriteSize = [0, 0];};
		// Default initialization of property `gridSize`
		if (typeof(self.gridSize)=='undefined') {self.gridSize = [0, 0];};
		// Default initialization of property `imageSize`
		if (typeof(self.imageSize)=='undefined') {self.imageSize = [0, 0];};
		self.imageLeft = self.Load(url);
		self.spriteSize = spriteSize;
		!(self.spriteSize) && extend.assert(false, "sprites.Spritesheet.__init__:", "Spritesheet: spriteSize=[w,h] is required", "(failed `self.spriteSize`)");
		if (self.imageLeft.complete) {
			self._onImageLoaded(false);
		} else {
			self.imageLeft.addEventListener("load", self.getMethod('_onImageLoaded') );
		}
	},
	methods: {
		/**
		  * Called once the image has been loaded.
		  * 
		*/
		_onImageLoaded: function(unbind) {
			var self = this;
			if (unbind === undefined) {unbind=false}
			self.imageRight = self.getClass().getOperation('HorizontalFlip')(self.imageLeft);
			self.imageSize[0] = self.imageLeft.naturalWidth;
			self.imageSize[1] = self.imageLeft.naturalHeight;
			self.gridSize[0] = parseInt((self.imageSize[0] / self.spriteSize[0]));
			self.gridSize[1] = parseInt((self.imageSize[1] / self.spriteSize[1]));
			if (unbind) {
				self.imageLeft.removeEventListener("load", self.getMethod('_onImageLoaded') );
			}
		},
		
		/**
		  * Draws the sprite at the given `column` and `row` at the `x` and `y`
		  * coordinates on the given `context`. If `flipped` is `True`, then
		  * the horizontally flipped version of the sprite is taken.
		  * 
		*/
		draw: function(context, column, row, x, y, flipped) {
			var self = this;
			if (flipped === undefined) {flipped=false}
			var source = self.imageLeft;
			var sw = self.spriteSize[0];
			var sh = self.spriteSize[1];
			var sx = (column * sw);
			if (flipped) {
				source = self.imageRight;
				sx = (self.imageSize[0] - (sx + sw));
			}
			context.drawImage(source, sx, (row * sh), sw, sh, x, y, sw, sh);
			return self;
		}
	},
	operations:{
		/**
		  * Returns an image which data is being loaded from the given `url`. The url
		  * can be a string or a an `img`, `canvas` or `video` node.
		  * 
		*/
		Load: function( url ){
			var self = this;
			if (extend.isString(url)) {
				var image = new Image();
				image.src = url;
				return image;
			} else if (((url.nodeName == "IMG") || (url.nodeName == "CANVAS")) || (url.nodeName == "VIDEO")) {
				return url;
			} else {
				extend.error("Load: no URL, or canvas/image/video node given");
			}
		},
		/**
		  * Creates a horizontally flipped version of this image, returning the
		  * corresponding `canvas` node (offscreen)
		  * 
		*/
		HorizontalFlip: function( image ){
			var self = this;
			!(image.complete) && extend.assert(false, "sprites.Spritesheet.HorizontalFlip:", "HorizontalFlip: Image is not completely loaded", "(failed `image.complete`)");
			var width = image.naturalWidth;
			var height = image.naturalHeight;
			var canvas = document.createElement("canvas");
			canvas.setAttribute("width", width);
			canvas.setAttribute("height", height);
			var context = canvas.getContext("2d");
			context.translate(width, 0);
			context.scale(-1, 1);
			context.drawImage(image, 0, 0);
			return canvas;
		}
	}
})

sprites.Sprite = extend.Class({
	name  :'sprites.Sprite',
	parent: undefined,
	properties: {
		spritesheet:undefined,
		state:undefined,
		anchor:undefined,
		sprite:undefined,
		sequences:undefined,
		_offset:undefined,
		step:undefined,
		direction:undefined,
		fps:undefined,
		_lastUpdate:undefined
	},
	initialize: function( spritesheet ){
		var self = this;
		// Default initialization of property `spritesheet`
		if (typeof(self.spritesheet)=='undefined') {self.spritesheet = null;};
		// Default initialization of property `state`
		if (typeof(self.state)=='undefined') {self.state = null;};
		// Default initialization of property `anchor`
		if (typeof(self.anchor)=='undefined') {self.anchor = [0, 0];};
		// Default initialization of property `sprite`
		if (typeof(self.sprite)=='undefined') {self.sprite = [0, 0];};
		// Default initialization of property `sequences`
		if (typeof(self.sequences)=='undefined') {self.sequences = {};};
		// Default initialization of property `_offset`
		if (typeof(self._offset)=='undefined') {self._offset = [0, 0];};
		// Default initialization of property `step`
		if (typeof(self.step)=='undefined') {self.step = 0;};
		// Default initialization of property `direction`
		if (typeof(self.direction)=='undefined') {self.direction = 1;};
		// Default initialization of property `fps`
		if (typeof(self.fps)=='undefined') {self.fps = 15;};
		// Default initialization of property `_lastUpdate`
		if (typeof(self._lastUpdate)=='undefined') {self._lastUpdate = undefined;};
		self.spritesheet = spritesheet;
		self._lastUpdate = null;
	},
	methods: {
		clone: function() {
			var self = this;
			var s = new __module__.Sprite(self.spritesheet);
			s.state = null;
			s.anchor = self.anchor;
			s.sprite = extend.copy(self.sprite);
			s.sequences = self.sequences;
			s._offset = extend.copy(self._offset);
			s.step = 0;
			s.fps = self.fps;
			s.direction = self.direction;
			s._lastUpdate = self._lastUpdate;
			return s;
		},
		
		setState: function(name, direction) {
			var self = this;
			if (direction === undefined) {direction=self.direction}
			self.state = name;
			self.direction = direction;
			!(self.sequences[name]) && extend.assert(false, "sprites.Sprite.setState:", ("No sprite sequence: " + name), "(failed `self.sequences[name]`)");
			return self;
		},
		
		/**
		  * Sets the sprite anchor in the normalized sprite space (`[0.0-1.0]`)
		  * 
		*/
		setAnchor: function(x, y) {
			var self = this;
			self.anchor[0] = x;
			self.anchor[1] = y;
			self._offset[0] = parseInt((self.spritesheet.spriteSize[0] * self.anchor[0]));
			self._offset[1] = parseInt((self.spritesheet.spriteSize[1] * self.anchor[1]));
			return self;
		},
		
		/**
		  * Adds  an animation sequence with the given name.
		  * 
		*/
		addSequence: function(name, startOffset, endOffset, speed) {
			var self = this;
			if (endOffset === undefined) {endOffset=startOffset}
			if (speed === undefined) {speed=undefined}
			var so = (startOffset[0] + (startOffset[1] * self.spritesheet.gridSize[1]));
			var eo = (endOffset[0] + (endOffset[1] * self.spritesheet.gridSize[1]));
			self.sequences[name] = {"start":startOffset, "end":endOffset, "length":((eo - so) + 1), "speed":speed};
			if (!self.state) {
				self.state = name;
				self.sprite[0] = startOffset[0];
				self.sprite[1] = startOffset[1];
			}
			return self;
		},
		
		_updateCurrentSprite: function() {
			var self = this;
			var sequence = self.sequences[self.state];
			if (sequence) {
				var now = animation.now();
				var delay = (1000 / (sequence.speed || self.fps));
				if ((!self._lastUpdate) || ((now - self._lastUpdate) > delay)) {
					self.step = ((self.step + 1) % sequence.length);
					self.sprite[0] = ((sequence.start[0] + self.step) % self.spritesheet.gridSize[0]);
					self.sprite[1] = (sequence.start[1] + parseInt(Math.floor(((sequence.start[0] + self.step) / self.spritesheet.gridSize[0]))));
					self._lastUpdate = now;
				}
			}
		},
		
		/**
		  * Draws the sprite on the given context
		  * 
		*/
		draw: function(context, x, y) {
			var self = this;
			if (x === undefined) {x=0}
			if (y === undefined) {y=0}
			x = (x - self._offset[0]);
			y = (y - self._offset[1]);
			self.spritesheet.draw(context, self.sprite[0], self.sprite[1], x, y, (self.direction < 0));
			self._updateCurrentSprite();
			return self;
		}
	}
})
sprites.init = function(){
	var self = sprites;
}
if (typeof(sprites.init)!="undefined") {sprites.init();}

// START:VANILLA_POSTAMBLE
return sprites;})(sprites);
// END:VANILLA_POSTAMBLE
