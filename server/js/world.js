var cls = require("./lib/class"),
	Player = require("./entities/player"),
	log = require('./log'),
	WorldMap = require("./worldmap"),
	_ = require("underscore"),
	Box2D = require('./lib/box2d'),
	EntityFactory = require('./entityFactory');

var b2Vec2 = Box2D.Common.Math.b2Vec2;

module.exports = cls.Class.extend({
	init: function (ups, map_filepath, engine, server, debug) {
		this.ups = ups;
		this.engine = engine;
		this.server = server;
		this.debug = debug;
		this.map = new WorldMap(map_filepath);
		this.engine.addEntities(this.map.entities);
		this.onPlayerConnect(this.playerConnect);
		this.onPlayerDisconnect(this.playerDisconnect);
	},
	playerConnect: function (connection) {
		var self = this;
		var player = new Player(connection, connection.id, this.debug);
		player.setPosition(100, 100);
		log.info("Player " + player.id + " connected");

		connection.onClose(function () {
			self.disconnect_callback(player.id);
		});

		log.info("Send Map to player " + player.id);
		player.sendMap(this.map);

		log.info("Send Welcome to player " + player.id);
		player.send(Constants.Types.Messages.Welcome, player.getBaseState());

		player.onShoot = function (player) {
			var bullet = EntityFactory.createBullet(player);
			self.engine.addBullet(bullet);
			var angle = player.getAngle() * Math.PI / 180,
				x = Math.cos(angle),
				y = -Math.sin(angle);

			bullet.body.ApplyImpulse(new b2Vec2(x, y), new b2Vec2(0, 0));
		};

		this.engine.addEntity(player);
	},
	playerDisconnect: function (id) {
		this.engine.removeEntity(id);
	},
	updateWorld: function () {
		var self = this;
		_.each(self.engine.getEntities(), function (entity) {
			entity.update();
		});
	},
	processEntities: function (player, entities) {
		var self = this;
		var result = {
			visible: [],
			nonvisible: []
		};
		_.each(entities, function (entity) {
			result[self.engine.isVisible(player, entity) ? "visible" : "nonvisible"].push(entity);
		});
		return result;
	},
	updatePlayers: function () {
		var self = this;
		var players = self.engine.getEntities(function (entity) {
			return entity instanceof Player;
		});
		_.each(players, function (player) {
			var entities = self.processEntities(player, self.engine.getEntities());
			player.sendEntities(entities.visible);
			player.sendRemoveList(entities.nonvisible, entities.visible);
		});
	},
	run: function () {
		var self = this;
		setInterval(function () {
			self.engine.tick(1000.0 / self.ups);
			self.updateWorld();
			self.updatePlayers();
		}, 1000 / this.ups);
		setTimeout(function () {
			self.ready_callback();
		}, 1000 / this.ups);
	},
	onPlayerConnect: function (callback) {
		this.connect_callback = callback;
	},
	onPlayerDisconnect: function (callback) {
		this.disconnect_callback = callback;
	},
	onReady: function (callback) {
		this.ready_callback = callback;
	},
	ready_callback: function () {
		log.info("World started");
	}
});