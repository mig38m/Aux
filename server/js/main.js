var fs = require('fs'),
	log = require('./log'),
	cls = require('./lib/class'),
	ws = require("./ws"),
	World = require('./world'),
	Box2dEngine = require('./b2dengine');

var Server = module.exports = cls.Class.extend({
	init: function (config) {
		this.started = false;

		this.config = config;

		if (this.config.c9io === true) {
			this.config.port = Number(process.env.PORT);
			this.config.host = process.env.IP;
		}

		if (config.debug_level === "error") {
			this.loglevel = 0;
		} else if (config.debug_level === "debug") {
			this.loglevel = 2;
		} else if (config.debug_level === "info") {
			this.loglevel = 1;
		}
	},
	start: function () {

		log.info("Starting Aux game server...");

		var self = this;

		this._server = new ws.MultiVersionWebsocketServer(this.config.port);
		this._server.onConnect(function (connection) {
			self.world.connect_callback(connection);
		});
		this._server.onError(function () {
			log.error(Array.prototype.join.call(arguments, ", "));
		});

		this.engine = new Box2dEngine();
		this.world = new World(this.config.ups, this.config.map_filepath, this.engine, this._server);
		this.world.onException(function (err) {
			log.error(err);
		});
		this.world.run();
	}
});

function getConfigFile(path, callback) {
	fs.readFile(path, 'utf8', function (err, json_string) {
		if (err) {
			console.error("Could not open config file: ", err.path);
			callback(null);
		} else {
			callback(JSON.parse(json_string));
		}
	});
}

var main = function () {
	var defaultConfigPath = './server/config.json',
		customConfigPath = './server/config_local.json';

	process.argv.forEach(function (val, index) {
		if (index === 2) {
			customConfigPath = val;
		}
	});

	getConfigFile(customConfigPath, function (customConfig) {
		if (customConfig) {
			var server = new Server(customConfig);
			server.start();
		} else {
			getConfigFile(defaultConfigPath, function (defaultConfig) {
				if (defaultConfig) {
					var server = new Server(defaultConfig);
					server.start();
				} else {
					console.error("Server cannot start without any configuration file.");
					process.exit(1);
				}
			});
		}
	});
};

if (require.main === module) {
	main();
}