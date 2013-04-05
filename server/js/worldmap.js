var fs = require('fs'),
	cls = require('./lib/class'),
	_ = require('underscore'),
	CommonEntity = require('./commonEntity'),
	Engine = require('./engine');

var WorldMap = module.exports = cls.Class.extend({
	init: function (config, engine) {
		this.isLoaded = false;
		this.data = {};
		this.engine = engine;
		var self = this;

		fs.readFile(config.map_filepath, 'utf8', function (err, data) {
			if (err) {
				throw new Error(err);
			}
			self.data = JSON.parse(data);
			self.isLoaded = true;
			self.fillWorld(self.data, self.engine);
		});
	},

	sendMap: function (socket) {
		if (this.isLoaded) {
			socket.emit("map", this.data);
		} else {
			setTimeout(this.sendMap, 100);
		}
	},

	fillWorld: function (data, engine) {
		var self = this,
			objects = _.find(data.layers, function (layer) { 
			return layer.name === "objects";
		}).objects;

		_.each(objects, function (entity_info) {
			var obj = new CommonEntity(null, engine.b2w, entity_info.type);
			self.setParameters(obj, entity_info);
			self.createPhysicBody(obj, entity_info);
			if (entity_info.type !== "border")
				engine.addEntity(obj);
		});
	},

	setParameters: function (obj, entity_info) {
		obj.width = entity_info.width / 100 / 2;
		obj.height = entity_info.height / 100 / 2;
		var x = entity_info.x / 100 + obj.width,
			y = entity_info.y / 100 + obj.height;
		obj.setPosition(x, y);
	},

	createPhysicBody: function (obj, entity_info) {
		obj.body = Engine.createBody(obj.world, obj.position.x, obj.position.y);
		obj.body.m_userData = obj;
		if (entity_info.polyline) {
			var vertices = [];
			_.each(entity_info.polyline, function (v) {
				vertices.push({x: v.x / 100, y: v.y / 100});
			});
			obj.fixture = Engine.createPolygonFixture(obj.body, vertices);
		}
		else {
			obj.fixture = Engine.createBoxFixture(obj.body, obj.width, obj.height);
		}
	}
});

return WorldMap;