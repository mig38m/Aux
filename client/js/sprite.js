/* global _ */

define(['lib/animation', 'sprites'], function (Animation, sprites) {

	var imageCache = {},
	Sprite = Class.extend({
		init: function (name, scale) {
			this.name = name;
			this.scale = scale;
			this.isLoaded = false;
			this.offsetX = 0;
			this.offsetY = 0;
			this.loadJSON(sprites[name]);
		},

		loadJSON: function (data) {
			this.id = data.id;
			this.filepath = "img/" + this.scale + "/" + this.id + ".png";
			this.animationData = data.animations;
			this.width = data.width;
			this.height = data.height;
			this.offsetX = (data.offset_x !== undefined) ? data.offset_x : -16;
			this.offsetY = (data.offset_y !== undefined) ? data.offset_y : -16;
			this.load();
		},

		load: function () {
			var self = this;

			// This causing that all objects are linked to one sprite
			// so it must be constant in time.

			if (this.filepath in imageCache) {
				this.image = imageCache[this.filepath];
				this.isLoaded = true;
				if (this.onload_func) {
					this.onload_func();
				}
			} else {
				this.image = new Image();
				this.image.src = this.filepath;

				this.image.onload = function () {
					self.isLoaded = true;
					imageCache[self.filepath] = self.image;
					if (self.onload_func) {
						self.onload_func();
					}
				};
			}
		},

		createAnimations: function () {
			var animations = {},
				self = this;

			_.each(self.animationData, function (animation, name) {
				animations[name] = new Animation(name, animation.length, animation.row, self.width, self.height,
				animation.flipSpriteX, animation.flipSpriteY, animation.speed);
			});

			return animations;
		},

		createHurtSprite: function () {
			var canvas = document.createElement('canvas'),
				ctx = canvas.getContext('2d'),
				width = this.image.width,
				height = this.image.height,
				spriteData, data;

			canvas.width = width;
			canvas.height = height;
			ctx.drawImage(this.image, 0, 0, width, height);

			try {
				spriteData = ctx.getImageData(0, 0, width, height);

				data = spriteData.data;

				for (var i = 0; i < data.length; i += 4) {
					data[i] = 255;
					data[i + 1] = data[i + 2] = 75;
				}
				spriteData.data = data;

				ctx.putImageData(spriteData, 0, 0);

				this.whiteSprite = {
					image: canvas,
					isLoaded: true,
					offsetX: this.offsetX,
					offsetY: this.offsetY,
					width: this.width,
					height: this.height
				};
			} catch (e) {
				console.log.error("Error getting image data for sprite : " + this.name);
			}
		},

		getHurtSprite: function () {
			return this.whiteSprite;
		},

		createSilhouette: function () {
			var canvas = document.createElement('canvas'),
				ctx = canvas.getContext('2d'),
				width = this.image.width,
				height = this.image.height,
				finalData, data;

			canvas.width = width;
			canvas.height = height;
			ctx.drawImage(this.image, 0, 0, width, height);
			data = ctx.getImageData(0, 0, width, height).data;
			finalData = ctx.getImageData(0, 0, width, height);
			var fdata = finalData.data;

			var getIndex = function (x, y) {
				return ((width * (y - 1)) + x - 1) * 4;
			};

			var getPosition = function (i) {
				var x, y;

				i = (i / 4) + 1;
				x = i % width;
				y = ((i - x) / width) + 1;

				return {
					x: x,
					y: y
				};
			};

			var hasAdjacentPixel = function (i) {
				var pos = getPosition(i);

				if (pos.x < width && !isBlankPixel(getIndex(pos.x + 1, pos.y))) {
					return true;
				}
				if (pos.x > 1 && !isBlankPixel(getIndex(pos.x - 1, pos.y))) {
					return true;
				}
				if (pos.y < height && !isBlankPixel(getIndex(pos.x, pos.y + 1))) {
					return true;
				}
				if (pos.y > 1 && !isBlankPixel(getIndex(pos.x, pos.y - 1))) {
					return true;
				}
				return false;
			};

			var isBlankPixel = function (i) {
				if (i < 0 || i >= data.length) {
					return true;
				}
				return data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0 && data[i + 3] === 0;
			};

			for (var i = 0; i < data.length; i += 4) {
				if (isBlankPixel(i) && hasAdjacentPixel(i)) {
					fdata[i] = fdata[i + 1] = 255;
					fdata[i + 2] = 150;
					fdata[i + 3] = 150;
				}
			}

			finalData.data = fdata;
			ctx.putImageData(finalData, 0, 0);

			this.silhouetteSprite = {
				image: canvas,
				isLoaded: true,
				offsetX: this.offsetX,
				offsetY: this.offsetY,
				width: this.width,
				height: this.height
			};
		}
	});

	return Sprite;
});