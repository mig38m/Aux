var Entity = require('./entity'),	Constants = require('../../client/js/constants');module.exports = CommonEntity = Entity.extend({	init: function(id ,object, engine) {    	this._super(id, object.type, Types.Entities.CommonEntity);		var width = object.width / 100;		var height = object.height / 100;		var x = object.x / 100;		var y = object.y / 100;		this.setPosition(x, y);		this.animation = "basic";		this.body = engine.createBody(x, y);		if (object.type !== "border")			this.body.m_userData = this;		if (object.width == 0 && object.height == 0){		  //this.fixture = engine.createPolygonFixture(this.body, object.polyline);		}		else{		  this.fixture = engine.createBoxFixture(this.body, width, height);		  engine.addEntity(this);		}    },		getBaseState: function() {        return {            id: this.id,            kind: this.kind,            position: this.getPosition(),            angle: this.getAngle(),            animation: this.animation,			sprite: this.type        };    },});