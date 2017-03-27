// 8< ---[physics.js]---
// START:VANILLA_PREAMBLE
var physics=typeof(extend)!='undefined' ? extend.module('physics') : (typeof(physics)!='undefined' ? physics : {});
(function(physics){
var Vector = geom.Vector;
var Circle = geom.Circle;
var __module__=physics;
// END:VANILLA_PREAMBLE

physics.__VERSION__='0.4.0';
physics.PRECISION = 1e-07;
/**
  * This allows to keep all the values within the same precision interval. This
  * is especially useful if you're mappint a position to SVG attributes, as the
  * "1.234e+10" notation is not supported by SVG.
  * 
*/
physics.approximateZero = function(value, precision){
	var self = physics;
	if (precision === undefined) {precision=__module__.PRECISION}
	if ((value > 0) && (value < precision)) {
		return 0;
	} else if ((value < 0) && ((0 - precision) < value)) {
		return 0;
	} else {
		return value;
	}
}

physics.Body = extend.Class({
	name  :'physics.Body',
	parent: undefined,
	shared: {
		COUNT: 0
	},
	properties: {
		id:undefined,
		mass:undefined,
		envelope:undefined,
		ui:undefined,
		world:undefined,
		data:undefined,
		_onPositionUpdated:undefined,
		isFixed:undefined,
		_position:undefined,
		_forces:undefined,
		positionChanged:undefined,
		velocity:undefined
	},
	initialize: function( ui ){
		var self = this;
		// Default initialization of property `id`
		if (typeof(self.id)=='undefined') {self.id = 0;};
		// Default initialization of property `mass`
		if (typeof(self.mass)=='undefined') {self.mass = 1;};
		// Default initialization of property `envelope`
		if (typeof(self.envelope)=='undefined') {self.envelope = null;};
		// Default initialization of property `ui`
		if (typeof(self.ui)=='undefined') {self.ui = null;};
		// Default initialization of property `world`
		if (typeof(self.world)=='undefined') {self.world = null;};
		// Default initialization of property `data`
		if (typeof(self.data)=='undefined') {self.data = null;};
		// Default initialization of property `_onPositionUpdated`
		if (typeof(self._onPositionUpdated)=='undefined') {self._onPositionUpdated = [];};
		// Default initialization of property `isFixed`
		if (typeof(self.isFixed)=='undefined') {self.isFixed = false;};
		// Default initialization of property `_position`
		if (typeof(self._position)=='undefined') {self._position = geom.Vector.Create3D();;};
		// Default initialization of property `_forces`
		if (typeof(self._forces)=='undefined') {self._forces = geom.Vector.Create3D();;};
		// Default initialization of property `positionChanged`
		if (typeof(self.positionChanged)=='undefined') {self.positionChanged = false;};
		// Default initialization of property `velocity`
		if (typeof(self.velocity)=='undefined') {self.velocity = geom.Vector.Create3D();;};
		self.ui = ui;
		self.id = self.getClass().COUNT;
		self.getClass().COUNT = (self.getClass().COUNT + 1);
	},
	methods: {
		deltaTo: function(body) {
			var self = this;
			return geom.Vector.DeltaTo(self._position, body._position);
		},
		
		distanceTo: function(body, delta) {
			var self = this;
			if (delta === undefined) {delta=undefined}
			if (delta === undefined) {
				return geom.Vector.DistanceTo(self._position, body._position);
			} else {
				return geom.Vector.DistanceTo(delta);
			}
		},
		
		setPosition: function(px, py, pz) {
			var self = this;
			if (extend.isList(px)) {
				return self.setPosition(px[0], px[1], px[2]);
			}
			if (extend.isDefined(px) && (self._position[0] != px)) {
				self.positionChanged = true;
				self._position[0] = __module__.approximateZero(px);
			}
			if (extend.isDefined(py) && (self._position[1] != py)) {
				self.positionChanged = true;
				self._position[1] = __module__.approximateZero(py);
			}
			if (extend.isDefined(pz) && (self._position[2] != pz)) {
				self.positionChanged = true;
				self._position[2] = __module__.approximateZero(pz);
			}
			if (self.positionChanged && self.envelope) {
				self.envelope.setPosition(self._position);
			}
			return self;
		},
		
		/**
		  * Fixes/unfixes the body, triggering a position change on the next
		  * step if the new status is different.
		  * 
		*/
		setFixed: function(value) {
			var self = this;
			if (value === undefined) {value=true}
			if (self.isFixed != value) {
				self.isFixed = value;
				geom.Vector.Reset(self.velocity);
				self.positionChanged = true;
			}
			return self;
		},
		
		setEnvelope: function(env) {
			var self = this;
			self.envelope = env;
			return self;
		},
		
		setVelocity: function(v) {
			var self = this;
			geom.Vector.Update(self.velocity, v);
			return self;
		},
		
		applyForce: function(v) {
			var self = this;
			self._forces = geom.Vector.Add(self._forces, v);
		},
		
		onPositionUpdated: function(callback) {
			var self = this;
			self._onPositionUpdated.push(callback);
			return self;
		},
		
		/**
		  * Removes the UI node. Remove is called by Context.step when the
		  * body is out of the context bounds (if any).
		  * Override this for custom behaviour.
		  * 
		*/
		remove: function() {
			var self = this;
			if (self.ui) {
				self.ui.remove();
			}
			return self;
		},
		
		/**
		  * Calls _step () and set 'positionChanged' to 'False'.
		  * 
		*/
		step: function(elapsed) {
			var self = this;
			if (elapsed === undefined) {elapsed=1}
			self._step(elapsed);
			if (self.positionChanged) {
				// Iterates over `self._onPositionUpdated`. This works on array,objects and null/undefined
				var __j=self._onPositionUpdated;
				var __k=__j instanceof Array ? __j : Object.getOwnPropertyNames(__j||{});
				var __m=__k.length;
				for (var __l=0;__l<__m;__l++){
					var __i=(__k===__j)?__l:__k[__l];
					var _=__j[__i];
					// This is the body of the iteration with (value=_, key/index=__i) in __j
					_(self, self._position);
				}
				self.positionChanged = false;
			}
		},
		
		/**
		  * Steps the position. Override it to do custom behaviour.
		  * 
		*/
		_step: function(elapsed) {
			var self = this;
			if (elapsed === undefined) {elapsed=1}
			if (!self.isFixed) {
				self.stepPosition(elapsed);
			}
		},
		
		/**
		  * Returns the next position for the current body
		  * 
		*/
		getNextPosition: function(elapsed) {
			var self = this;
			if (elapsed === undefined) {elapsed=1}
			var forces = geom.Vector.Copy(self._forces);
			var position = geom.Vector.Copy(self._position);
			forces = geom.Vector.Multiply(forces, elapsed);
			position = geom.Vector.Add(position, forces);
			return position;
		},
		
		/**
		  * Adds the velocity to the current position
		  * 
		*/
		stepPosition: function(elapsed) {
			var self = this;
			if (elapsed === undefined) {elapsed=1}
			self.applyForce(self.velocity);
			if ((self._forces[0] || self._forces[1]) || self._forces[2]) {
				self.setPosition((self._position[0] + (self._forces[0] * elapsed)), (self._position[1] + (self._forces[1] * elapsed)), (self._position[2] + (self._forces[2] * elapsed)));
				geom.Vector.Reset(self._forces);
				return true;
			} else {
				return false;
			}
		}
	}
})
/**
  * An abstraction for the physical boundaries of a body.
  * 
*/
physics.Envelope = extend.Class({
	name  :'physics.Envelope',
	parent: undefined,
	shared: {
		CIRCLE: 0,
		TYPE: null,
		SHAPE: null,
		RECTANGLE: 1
	},
	properties: {
		type:undefined,
		shape:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `type`
		if (typeof(self.type)=='undefined') {self.type = self.getClass().TYPE;};
		// Default value for property `shape`
		if (typeof(self.shape)=='undefined') {self.shape = self.getClass().SHAPE.Create2D();};
	},
	methods: {
		intersects: function(envelope, tolerance) {
			var self = this;
			if (tolerance === undefined) {tolerance=1.0}
			extend.error("Not implemented");
		},
		
		setPosition: function(position) {
			var self = this;
			self.shape[self.getClass().SHAPE.X] = position[0];
			self.shape[self.getClass().SHAPE.Y] = position[1];
			if (extend.isDefined(position[2])) {
				self.shape[self.getClass().SHAPE.Z] = position[2];
			}
			return self;
		},
		
		isCircle: function() {
			var self = this;
			return (self.type == __module__.Envelope.CIRCLE);
		}
	}
})

physics.Circle = extend.Class({
	name  :'physics.Circle',
	parent: __module__.Envelope,
	shared: {
		SHAPE: geom.Circle,
		TYPE: __module__.Envelope.CIRCLE
	},
	initialize: function( radius ){
		var self = this;
		if (radius === undefined) {radius=0}
		self.getSuper(__module__.Circle.getParent())();
		self.setRadius(radius);
	},
	methods: {
		setRadius: function(radius) {
			var self = this;
			self.shape[geom.Circle.R] = radius;
			return self;
		},
		
		getRadius: function() {
			var self = this;
			return self.shape[geom.Circle.R];
		},
		
		intersects: function(envelope, tolerance) {
			var self = this;
			if (tolerance === undefined) {tolerance=1.0}
			if (envelope.isCircle()) {
				return __module__.Circle.IntersectsCircle(self.shape, envelope.shape, tolerance);
			} else {
				extend.fail("Intersection between those two shapes not implemented.");
			}
		},
		
		contains: function(point) {
			var self = this;
			if (point._position) {
				point = point._position;
			}
			return geom.Circle.Contains(self.shape, point);
		}
	}
})

physics.Force = extend.Class({
	name  :'physics.Force',
	parent: undefined,
	shared: {
		INTENSITY: 1.0
	},
	properties: {
		bodies:undefined,
		intensity:undefined,
		isEnabled:undefined,
		cache:undefined,
		_onApply:undefined
	},
	initialize: function( intensity ){
		var self = this;
		if (intensity === undefined) {intensity=self.intensity}
		// Default initialization of property `bodies`
		if (typeof(self.bodies)=='undefined') {self.bodies = null;};
		// Default initialization of property `intensity`
		if (typeof(self.intensity)=='undefined') {self.intensity = self.getClass().INTENSITY;};
		// Default initialization of property `isEnabled`
		if (typeof(self.isEnabled)=='undefined') {self.isEnabled = true;};
		// Default initialization of property `cache`
		if (typeof(self.cache)=='undefined') {self.cache = {};};
		// Default initialization of property `_onApply`
		if (typeof(self._onApply)=='undefined') {self._onApply = undefined;};
		if (extend.isNumber(intensity)) {
			self.intensity = intensity;
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
		},
		
		setBodies: function(bodies) {
			var self = this;
			if (!extend.isList(bodies)) {
				bodies = [bodies];
			}
			self.bodies = bodies;
			return self;
		},
		
		getBodies: function(world) {
			var self = this;
			if (world === undefined) {world=null}
			if (self.bodies) {
				return self.bodies;
			} else if (world) {
				return world.bodies;
			} else {
				return null;
			}
		},
		
		apply: function(context, elapsed) {
			var self = this;
			if (elapsed === undefined) {elapsed=undefined}
			extend.error("Force.apply not implemented");
		},
		
		onApply: function(callback) {
			var self = this;
			self._onApply = callback;
			return self;
		},
		
		doApply: function(world) {
			var self = this;
			if (self._onApply) {
				self._onApply(self, world);
			}
			return self;
		},
		
		/**
		  * Applies the force if it is enabled, triggering the `onApply`
		  * callback if it is declared.
		  * 
		*/
		step: function(world, elapsed) {
			var self = this;
			if (elapsed === undefined) {elapsed=undefined}
			if (self.isEnabled) {
				self.apply(world, elapsed);
				self.doApply(world, elapsed);
			}
		}
	}
})

physics.Friction = extend.Class({
	name  :'physics.Friction',
	parent: __module__.Force,
	shared: {
		INTENSITY: 0.01
	},
	initialize: function(){
		var self = this;
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Friction.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		apply: function(world) {
			var self = this;
			// Iterates over `self.getBodies(world)`. This works on array,objects and null/undefined
			var __n=self.getBodies(world);
			var __p=__n instanceof Array ? __n : Object.getOwnPropertyNames(__n||{});
			var __r=__p.length;
			for (var __q=0;__q<__r;__q++){
				var __o=(__p===__n)?__q:__p[__q];
				var body=__n[__o];
				// This is the body of the iteration with (value=body, key/index=__o) in __n
				if (!body.isFixed) {
					self.getClass().getOperation('Apply')(body, (self.intensity * world.elapsed));
				};
			}
			return self;
		}
	},
	operations:{
		Apply: function( body, intensity ){
			var self = this;
			if (intensity === undefined) {intensity=self.INTENSITY}
			geom.Vector.Multiply(body.velocity, (1 - intensity));
		}
	}
})

physics.Spring = extend.Class({
	name  :'physics.Spring',
	parent: __module__.Force,
	shared: {
		INTENSITY: 1.0
	},
	properties: {
		source:undefined
	},
	initialize: function( source ){
		var self = this;
		if (source === undefined) {source=new __module__.Body()}
		// Default initialization of property `source`
		if (typeof(self.source)=='undefined') {self.source = null;};
		self.getSuper(__module__.Spring.getParent())();
		self.setSource(source);
	},
	methods: {
		setSource: function(source) {
			var self = this;
			self.source = source;
			return self;
		},
		
		setPosition: function(x, y) {
			var self = this;
			if (extend.isList(x)) {
				return self.setPosition(x[0], x[1]);
			} else {
				self.source.setPosition(x, y);
			}
			return self;
		},
		
		apply: function(world) {
			var self = this;
			var ratio = (self.intensity * world.elapsed);
			var attracted_bodies = (self.bodies || world.bodies);
			// Iterates over `attracted_bodies`. This works on array,objects and null/undefined
			var __t=attracted_bodies;
			var __u=__t instanceof Array ? __t : Object.getOwnPropertyNames(__t||{});
			var __w=__u.length;
			for (var __v=0;__v<__w;__v++){
				var __s=(__u===__t)?__v:__u[__v];
				var attracted=__t[__s];
				// This is the body of the iteration with (value=attracted, key/index=__s) in __t
				if (attracted && (attracted != self.source)) {
					self.getClass().getOperation('Apply')(self.source, attracted, ratio);
				};
			}
			return self;
		}
	},
	operations:{
		/**
		  * The body B's velocity will be shifted towards the body A by `ratio` (1% by default).
		  * 
		*/
		Apply: function( bodyA, bodyB, intensity ){
			var self = this;
			if (intensity === undefined) {intensity=self.INTENSITY}
			var delta = bodyB.deltaTo(bodyA);
			var dist = bodyB.distanceTo(bodyA, delta);
			var accel = geom.Vector.Create3D((delta[0] * intensity), (delta[1] * intensity), (delta[2] * intensity));
			geom.Vector.Add(bodyB.velocity, accel);
		}
	}
})

physics.Collider = extend.Class({
	name  :'physics.Collider',
	parent: __module__.Force,
	shared: {
		INTENSITY: 0.5,
		TOLERANCE: 0.95
	},
	properties: {
		tolerance:undefined,
		lastDelta:undefined,
		elasticity:undefined,
		rebounds:undefined,
		bodiesA:undefined,
		bodiesB:undefined
	},
	initialize: function( bodiesA, bodiesB ){
		var self = this;
		if (bodiesA === undefined) {bodiesA=self.bodiesA}
		if (bodiesB === undefined) {bodiesB=self.bodiesB}
		// Default initialization of property `tolerance`
		if (typeof(self.tolerance)=='undefined') {self.tolerance = self.getClass().TOLERANCE;};
		// Default initialization of property `lastDelta`
		if (typeof(self.lastDelta)=='undefined') {self.lastDelta = 0;};
		// Default initialization of property `elasticity`
		if (typeof(self.elasticity)=='undefined') {self.elasticity = 0.9;};
		// Default initialization of property `rebounds`
		if (typeof(self.rebounds)=='undefined') {self.rebounds = false;};
		// Default initialization of property `bodiesA`
		if (typeof(self.bodiesA)=='undefined') {self.bodiesA = null;};
		// Default initialization of property `bodiesB`
		if (typeof(self.bodiesB)=='undefined') {self.bodiesB = null;};
		self.getSuper(__module__.Collider.getParent())();
		self.bodiesA = bodiesA;
		self.bodiesB = bodiesB;
	},
	methods: {
		apply: function(world, elapsed) {
			var self = this;
			if (self.bodiesA && self.bodiesB) {
				self.applyAB(self.bodiesA, self.bodiesB, world.elapsed);
			} else if (self.bodiesA) {
				self.applyAA(self.bodiesA, world.elapsed);
			} else {
				self.applyAA(world.bodies, world.elapsed);
			}
		},
		
		/**
		  * An version of the force that applies that applies collisions to
		  * all the bodies in the given set.
		  * 
		*/
		applyAA: function(bodies, elapsed) {
			var self = this;
			if (bodies === undefined) {bodies=self.bodiesA}
			var length = bodies.length;
			var i = 0;
			var delta = 0;
			while ((i < length)) {
				var j = (i + 1);
				var a = bodies[i];
				while ((j < length)) {
					var b = bodies[j];
					if (((a != b) && a) && b) {
						delta = Math.max((self.getClass().getOperation('Collide')(a, b, elapsed, self.elasticity, self.rebounds, self.intensity, self.tolerance) || 0), delta);
					}
					j = (j + 1);
				}
				i = (i + 1);
			}
			self.lastDelta = delta;
		},
		
		applyAB: function(bodiesA, bodiesB, elapsed) {
			var self = this;
			if (bodiesA === undefined) {bodiesA=self.bodiesA}
			if (bodiesB === undefined) {bodiesB=self.bodiesB}
			var i = 0;
			var delta = 0;
			while ((i < bodiesA.length)) {
				var j = 0;
				var a = bodiesA[i];
				while ((j < bodiesB.length)) {
					var b = bodiesB[j];
					if (((a != b) && a) && b) {
						delta = Math.max((self.getClass().getOperation('Collide')(a, b, elapsed, self.elasticity, self.rebounds, self.tolerance) || 0), delta);
					}
					j = (j + 1);
				}
				i = (i + 1);
			}
			self.lastDelta = delta;
		}
	},
	operations:{
		Rebound: function( bodyA, bodyB, elasticity ){
			var self = this;
			var dv = geom.Vector.DeltaTo(bodyA.velocity, bodyB.velocity);
			var vi_a = (elasticity * geom.Vector.Length(bodyA.velocity));
			var vi_b = (elasticity * geom.Vector.Length(bodyB.velocity));
			var dir_a = Math.atan2(bodyA.velocity[1], bodyA.velocity[0]);
			var dir_b = Math.atan2(bodyB.velocity[1], bodyB.velocity[0]);
			var dir_dv = Math.atan2(dv[1], dv[0]);
			var v_ax = (vi_a * Math.cos((dir_a - dir_dv)));
			var v_ay = (vi_a * Math.sin((dir_a - dir_dv)));
			var v_bx = (vi_b * Math.cos((dir_b - dir_dv)));
			var v_by = (vi_b * Math.sin((dir_b - dir_dv)));
			var vf_ax = ((((bodyA.mass * 2) * v_ax) + ((bodyB.mass - bodyA.mass) * v_bx)) / (bodyA.mass + bodyB.mass));
			var vf_bx = ((((bodyA.mass - bodyB.mass) * v_ax) + ((bodyB.mass * 2) * v_bx)) / (bodyA.mass + bodyB.mass));
			var vf_ay = v_ay;
			var vf_by = v_by;
			bodyA.velocity[0] = ((vf_bx * Math.cos(dir_dv)) - (vf_by * Math.sin(dir_dv)));
			bodyA.velocity[1] = ((vf_bx * Math.sin(dir_dv)) + (vf_by * Math.cos(dir_dv)));
			bodyB.velocity[0] = ((vf_ax * Math.cos(dir_dv)) - (vf_ay * Math.sin(dir_dv)));
			bodyB.velocity[1] = ((vf_ax * Math.sin(dir_dv)) + (vf_ay * Math.cos(dir_dv)));
		},
		Collide: function( bodyA, bodyB, elapsed, elasticity, rebound, intensity, tolerance ){
			var self = this;
			if (intensity === undefined) {intensity=self.INTENSITY}
			if (tolerance === undefined) {tolerance=self.TOLERANCE}
			var env_a = bodyA.envelope;
			var env_b = bodyB.envelope;
			if (((!env_a) || (!env_b)) || (bodyA.isFixed && bodyB.isFixed)) {
				return 0;
			} else if (env_a.intersects(env_b, tolerance)) {
				var delta = self.Separate(bodyA, bodyB, elapsed, intensity);
				return delta;
			} else {
				return 0;
			}
			return 0;
		},
		/**
		  * Separates bodies that are in intersection
		  * 
		*/
		Separate: function( bodyA, bodyB, elapsed, intensity, threshold ){
			var self = this;
			if (intensity === undefined) {intensity=self.INTENSITY}
			if (threshold === undefined) {threshold=0.0}
			if (!elapsed) {
				return null;
			}
			if (bodyA.envelope.isCircle() && bodyB.envelope.isCircle()) {
				var pos_a = geom.Vector.Copy(bodyA.getNextPosition(elapsed));
				var pos_b = geom.Vector.Copy(bodyB.getNextPosition(elapsed));
				var ab = geom.Vector.DeltaTo(pos_a, pos_b);
				var d = geom.Vector.Length(ab);
				var r_a = bodyA.envelope.getRadius();
				var r_b = bodyB.envelope.getRadius();
				if (ab < threshold) {
					return 0;
				}
				var d_a = (((d - r_b) - r_a) / 2);
				d_a = ((d_a * intensity) / (elapsed || 1));
				var d_b = (0 - d_a);
				var f_a = geom.Vector.Multiply(geom.Vector.Normalize(geom.Vector.Copy(ab)), d_a);
				var f_b = geom.Vector.Multiply(geom.Vector.Normalize(geom.Vector.Copy(ab)), d_b);
				if (bodyA.isFixed) {
					f_b = geom.Vector.Multiply(f_b, 2);
				}
				if (bodyB.isFixed) {
					f_a = geom.Vector.Multiply(f_a, 2);
				}
				if (!bodyA.isFixed) {
					bodyA.applyForce(f_a);
				}
				if (!bodyB.isFixed) {
					bodyB.applyForce(f_b);
				}
				var max_delta = Math.max(Math.abs((f_a[0] || 0)), Math.abs((f_a[1] || 0)));
				max_delta = Math.max(Math.abs((f_a[2] || 0)), max_delta);
				max_delta = Math.max(Math.abs((f_b[0] || 0)), max_delta);
				max_delta = Math.max(Math.abs((f_b[1] || 0)), max_delta);
				max_delta = Math.max(Math.abs((f_b[2] || 0)), max_delta);
				return max_delta;
			} else {
				extend.fail("physics.Separate: Not implemented for those shapes");
				return 0;
			}
		}
	}
})

physics.Translate = extend.Class({
	name  :'physics.Translate',
	parent: __module__.Force,
	properties: {
		source:undefined
	},
	initialize: function( bodyOrPosition ){
		var self = this;
		// Default initialization of property `source`
		if (typeof(self.source)=='undefined') {self.source = undefined;};
		self.getSuper(__module__.Translate.getParent())();
		self.setSource(bodyOrPosition);
	},
	methods: {
		setSource: function(source) {
			var self = this;
			self.source = source;
			return self;
		},
		
		step: function(world) {
			var self = this;
			var delta = geom.Vector.Copy(self.source._position);
			if (extend.isDefined(self.cache.lastPosition)) {
				var pos = geom.Vector.Copy(delta);
				delta = geom.Vector.Remove(delta, self.cache.lastPosition);
			}
			// Iterates over `self.getBodies(world)`. This works on array,objects and null/undefined
			var __y=self.getBodies(world);
			var __z=__y instanceof Array ? __y : Object.getOwnPropertyNames(__y||{});
			var __b=__z.length;
			for (var __a=0;__a<__b;__a++){
				var __x=(__z===__y)?__a:__z[__a];
				var body=__y[__x];
				// This is the body of the iteration with (value=body, key/index=__x) in __y
				body.setPosition((body._position[0] + delta[0]), (body._position[1] + delta[1]), (body._position[2] + (delta[2] || 0)));
			}
			self.cache.lastPosition = geom.Vector.Copy(self.source._position);
		}
	}
})
/**
  * Fixes the bodies that have stayed close to the same position for a certain
  * period of time. This is helpful to help "freeze" a system that has many
  * forces that might trigger artifact movements.
  * 
*/
physics.Stabilizer = extend.Class({
	name  :'physics.Stabilizer',
	parent: __module__.Force,
	properties: {
		lastPositions:undefined,
		distance:undefined,
		duration:undefined
	},
	initialize: function(){
		var self = this;
		// Default value for property `lastPositions`
		if (typeof(self.lastPositions)=='undefined') {self.lastPositions = {};};
		// Default value for property `distance`
		if (typeof(self.distance)=='undefined') {self.distance = 1.0;};
		// Default value for property `duration`
		if (typeof(self.duration)=='undefined') {self.duration = 5.0;};
	// Invokes the parent constructor - this requires the parent to be an extend.Class class
		if (true) {var __super__=self.getSuper(__module__.Stabilizer.getParent());__super__.initialize.apply(__super__, arguments);}
	},
	methods: {
		step: function(world) {
			var self = this;
			// Iterates over `self.getBodies(world)`. This works on array,objects and null/undefined
			var __d=self.getBodies(world);
			var __e=__d instanceof Array ? __d : Object.getOwnPropertyNames(__d||{});
			var __g=__e.length;
			for (var __f=0;__f<__g;__f++){
				var __c=(__e===__d)?__f:__e[__f];
				var body=__d[__c];
				// This is the body of the iteration with (value=body, key/index=__c) in __d
				if (!body.isFixed) {
					if (!extend.isDefined(self.lastPositions[body.id])) {
						self.lastPositions[body.id] = [geom.Vector.Copy(body._position), world.seconds];
					} else {
						var last_position = self.lastPositions[body.id][0];
						var delta = geom.Vector.Length(geom.Vector.Remove(geom.Vector.Copy(last_position), body._position));
						if (delta < self.distance) {
							if ((world.seconds - self.lastPositions[body.id][1]) > self.duration) {
								body.setFixed();
							}
						} else {
							self.lastPositions[body.id][0] = geom.Vector.Copy(last_position, body._position);
							self.lastPositions[body.id][1] = world.seconds;
						}
					}
				};
			}
		}
	}
})

physics.Context = extend.Class({
	name  :'physics.Context',
	parent: undefined,
	shared: {
		OPTIONS: {"autostop":false}
	},
	properties: {
		options:undefined,
		bodies:undefined,
		forces:undefined,
		children:undefined,
		bounds:undefined,
		frame:undefined,
		elapsed:undefined,
		seconds:undefined,
		_lastFrame:undefined,
		_onStep:undefined
	},
	initialize: function( options ){
		var self = this;
		if (options === undefined) {options=null}
		// Default initialization of property `options`
		if (typeof(self.options)=='undefined') {self.options = {};};
		// Default initialization of property `bodies`
		if (typeof(self.bodies)=='undefined') {self.bodies = [];};
		// Default initialization of property `forces`
		if (typeof(self.forces)=='undefined') {self.forces = [];};
		// Default initialization of property `children`
		if (typeof(self.children)=='undefined') {self.children = [];};
		// Default initialization of property `bounds`
		if (typeof(self.bounds)=='undefined') {self.bounds = null;};
		// Default initialization of property `frame`
		if (typeof(self.frame)=='undefined') {self.frame = 0;};
		// Default initialization of property `elapsed`
		if (typeof(self.elapsed)=='undefined') {self.elapsed = 0;};
		// Default initialization of property `seconds`
		if (typeof(self.seconds)=='undefined') {self.seconds = 0;};
		// Default initialization of property `_lastFrame`
		if (typeof(self._lastFrame)=='undefined') {self._lastFrame = undefined;};
		// Default initialization of property `_onStep`
		if (typeof(self._onStep)=='undefined') {self._onStep = [];};
		// Iterates over `self.getClass().OPTIONS`. This works on array,objects and null/undefined
		var __h=self.getClass().OPTIONS;
		var __ij=__h instanceof Array ? __h : Object.getOwnPropertyNames(__h||{});
		var __kj=__ij.length;
		for (var __jj=0;__jj<__kj;__jj++){
			var k=(__ij===__h)?__jj:__ij[__jj];
			var v=__h[k];
			// This is the body of the iteration with (value=v, key/index=k) in __h
			if (!extend.isDefined(self.options[k])) {
				self.options[k] = v;
			};
		}
		// Iterates over `options`. This works on array,objects and null/undefined
		var __lj=options;
		var __mj=__lj instanceof Array ? __lj : Object.getOwnPropertyNames(__lj||{});
		var __nj=__mj.length;
		for (var __oj=0;__oj<__nj;__oj++){
			var k=(__mj===__lj)?__oj:__mj[__oj];
			var v=__lj[k];
			// This is the body of the iteration with (value=v, key/index=k) in __lj
			self.options[k] = v;
		}
	},
	methods: {
		setBounds: function(boundsOrWidth, height) {
			var self = this;
			if (height === undefined) {height=undefined}
			if (extend.isDefined(height)) {
				self.bounds = geom.Rect.Create2D(0, 0, boundsOrWidth, height);
			} else {
				self.bounds = boundsOrWidth;
			}
			return self;
		},
		
		getBodiesAround: function(position, distance) {
			var self = this;
			if (distance === undefined) {distance=1}
			return extend.filter(self.bodies, function(_) {
				return (_.distanceTo(position) <= distance);
			});
		},
		
		addBody: function(body) {
			var self = this;
			if (extend.isList(body)) {
				// Iterates over `body`. This works on array,objects and null/undefined
				var __rj=body;
				var __sj=__rj instanceof Array ? __rj : Object.getOwnPropertyNames(__rj||{});
				var __uj=__sj.length;
				for (var __tj=0;__tj<__uj;__tj++){
					var __qj=(__sj===__rj)?__tj:__sj[__tj];
					var __pj=__rj[__qj];
					// This is the body of the iteration with (value=__pj, key/index=__qj) in __rj
					self.getMethod('addBody') (__pj, __qj, __rj)
				}
			} else {
				!(body) && extend.assert(false, "physics.Context.addBody:", ("Context.addBody: no body given, got " + body), "(failed `body`)");
				if (body.world && (body.world != self)) {
					body.world.remove(body);
				}
				body.world = self;
				self.bodies.push(body);
			}
			return self;
		},
		
		removeBody: function(body) {
			var self = this;
			var i = extend.find(self.bodies, body);
			if (i >= 0) {
				self.bodies.splice(i, 1);
			}
			return self;
		},
		
		addContext: function(context) {
			var self = this;
			if (extend.isList(context)) {
				// Iterates over `context`. This works on array,objects and null/undefined
				var __xj=context;
				var __yj=__xj instanceof Array ? __xj : Object.getOwnPropertyNames(__xj||{});
				var __aj=__yj.length;
				for (var __zj=0;__zj<__aj;__zj++){
					var __wj=(__yj===__xj)?__zj:__yj[__zj];
					var __vj=__xj[__wj];
					// This is the body of the iteration with (value=__vj, key/index=__wj) in __xj
					self.getMethod('addContext') (__vj, __wj, __xj)
				}
			} else {
				self.children.push(context);
			}
			return self;
		},
		
		removeContext: function(context) {
			var self = this;
			var i = extend.find(self.children, context);
			if (i >= 0) {
				self.children.splice(i, 1);
			}
			return self;
		},
		
		setBodies: function(bodies) {
			var self = this;
			if (!extend.isList(bodies)) {
				bodies = [bodies];
			}
			self.bodies = [].concat(bodies);
			return self;
		},
		
		addForce: function(force) {
			var self = this;
			if (extend.isList(force)) {
				// Iterates over `force`. This works on array,objects and null/undefined
				var __dj=force;
				var __ej=__dj instanceof Array ? __dj : Object.getOwnPropertyNames(__dj||{});
				var __gj=__ej.length;
				for (var __fj=0;__fj<__gj;__fj++){
					var __cj=(__ej===__dj)?__fj:__ej[__fj];
					var __bj=__dj[__cj];
					// This is the body of the iteration with (value=__bj, key/index=__cj) in __dj
					self.getMethod('addForce') (__bj, __cj, __dj)
				}
			} else {
				self.forces.push(force);
			}
			return self;
		},
		
		removeForce: function(force) {
			var self = this;
			var i = extend.find(self.forces, force);
			if (i >= 0) {
				self.forces.splice(i, 1);
			}
			return self;
		},
		
		setForces: function(forces) {
			var self = this;
			self.forces = [].concat(forces);
			return self;
		},
		
		step: function(animator) {
			var self = this;
			if (animator === undefined) {animator=undefined}
			var frame_duration = null;
			if (animator && extend.isDefined(animator.frameDuration)) {
				frame_duration = (animator.frameDuration / 1000);
			} else {
				var now = animation.now();
				if (self._lastFrame) {
					frame_duration = ((now - self._lastFrame) / 1000);
				}
				self._lastFrame = now;
			}
			self.seconds = (self.seconds + frame_duration);
			self.elapsed = frame_duration;
			var count = 0;
			// Iterates over `self.forces`. This works on array,objects and null/undefined
			var __ik=self.forces;
			var __jk=__ik instanceof Array ? __ik : Object.getOwnPropertyNames(__ik||{});
			var __lk=__jk.length;
			for (var __kk=0;__kk<__lk;__kk++){
				var __hj=(__jk===__ik)?__kk:__jk[__kk];
				var force=__ik[__hj];
				// This is the body of the iteration with (value=force, key/index=__hj) in __ik
				force.step(self, frame_duration);
			}
			var active = extend.filter(self.bodies, function(_, i) {
				if (!(_.step(frame_duration) === false)) {
					count = (count + 1);
				}
				if ((self.bounds && _._position) && (!geom.Rect.Contains(self.bounds, _._position))) {
					_.remove();
					return false;
				} else {
					return true;
				}
			});
			// Iterates over `self.children`. This works on array,objects and null/undefined
			var __ok=self.children;
			var __nk=__ok instanceof Array ? __ok : Object.getOwnPropertyNames(__ok||{});
			var __qk=__nk.length;
			for (var __pk=0;__pk<__qk;__pk++){
				var __mk=(__nk===__ok)?__pk:__nk[__pk];
				var context=__ok[__mk];
				// This is the body of the iteration with (value=context, key/index=__mk) in __ok
				count = (count + (context.step(animator) || 1));
			}
			// Iterates over `self._onStep`. This works on array,objects and null/undefined
			var __sk=self._onStep;
			var __tk=__sk instanceof Array ? __sk : Object.getOwnPropertyNames(__sk||{});
			var __vk=__tk.length;
			for (var __uk=0;__uk<__vk;__uk++){
				var __rk=(__tk===__sk)?__uk:__tk[__uk];
				var _=__sk[__rk];
				// This is the body of the iteration with (value=_, key/index=__rk) in __sk
				_(self, self.frame, frame_duration);
			}
			self.frame = (self.frame + 1);
			return 1;
			if (self.options.autostop) {
				return (count > 0);
			} else {
				return 1;
			}
		},
		
		onStep: function(callback) {
			var self = this;
			if (extend.find(self._onStep, callback) == -1) {
				self._onStep.push(callback);
			}
			return self;
		}
	}
})
physics.init = function(){
	var self = physics;
}
if (typeof(physics.init)!="undefined") {physics.init();}

// START:VANILLA_POSTAMBLE
return physics;})(physics);
// END:VANILLA_POSTAMBLE
