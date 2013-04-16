var Entity = require('./entity'),	Box2D = require('../lib/box2d'),	b2FixtureDef = Box2D.Dynamics.b2FixtureDef,	b2BodyDef = Box2D.Dynamics.b2BodyDef,	b2Body = Box2D.Dynamics.b2Body,	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;require('../../../client/js/constants');var CommonEntity = module.exports = Entity.extend({	init: function (id, type) {		this._super(id, type, Constants.Types.Entities.CommonEntity);		this.animation = "basic";	},	setBodyDefAsPoly: function (points) {		var fixDef = new b2FixtureDef();		fixDef.density = 15;		fixDef.friction = 1;		fixDef.restitution = 1;		fixDef.shape = new b2PolygonShape();		if (points) {			fixDef.shape.SetAsArray(points);		}		this.fixtureDef = fixDef;		this.bodyDef = new b2BodyDef();		this.bodyDef.type = b2Body.b2_staticBody;		this.bodyDef.linearDamping = 4;	},	getBaseState: function () {		return {			id: this.id,			kind: this.kind,			position: this.getPosition(),			angle: this.getAngle(),			sprite: this.type		};	}});return CommonEntity;