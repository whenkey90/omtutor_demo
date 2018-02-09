/*!
* jSketch 0.8 | Luis A. Leiva | MIT license
* A simple JavaScript library for drawing facilities on HTML5 canvas.
*/
/**
 * A simple JavaScript library for drawing facilities on HTML5 canvas.
 * This class is mostly a wrapper for the HTML5 canvas API with some syntactic sugar,
 * such as function chainability and old-school AS3-like notation.
 * @name jSketch
 * @class
 * @version 0.8
 * @date 9 Jul 2014
 * @author Luis A. Leiva
 * @license MIT license
 * @example
 * var canvas1 = document.getElementById('foo');
 * var canvas2 = document.getElementById('bar');
 * // Instantiate once, reuse everywhere.
 * var brush = new jSketch(canvas1).lineStyle('red').moveTo(50,50).lineTo(10,10).stroke();
 * // Actually, .moveTo(50,50).lineTo(10,10) can be just .line(50,50, 10,10)
 * // Switching between contexts removes the need of having to reinstantiate the jSketch class.
 * brush.context(canvas2).beginFill('#5F7').fillCircle(30,30,8).endFill();
 */
;(function(window) {
	/**
	 * @constructor
	 * @param {Object} elem - MUST be a DOM element
	 * @param {Object} options - Configuration
	 */
	var jSketch = function(elem, options) {
		return new Sketch(elem, options);
	};
	// Base class, private.
	var Sketch = function(elem, options) {
		// Although discouraged, we can instantiate the class without arguments.
		if (!elem)
			return;
		// Set drawing context first.
		this.context(elem);
		// Scene defaults.
		this.stageWidth = elem.width;
		this.stageHeight = elem.height;
		// Make room for storing some data such as brush type, colors, etc.
		this.data = {};
		// get toDataURL() and save it here
		this.content_as_bg = '';
		// Set drawing defaults.
		this.drawingDefaults(options);
		// Make constructor chainable.
		return this;
	};
	/**
	 * jSketch methods (publicly extensible).
	 * @ignore
	 * @memberof jSketch
	 * @see jSketch
	 */
	jSketch.fn = Sketch.prototype = {
		/**
		 * Allows to change the drawing context at runtime.
		 * @param {Object} elem - DOM element.
		 * @return jSketch
		 * @memberof jSketch
		 */
		context : function(elem) {
			if (elem === null)
				throw ("No canvas element specified.");
			// Save shortcuts: canvas (DOM elem) & graphics (2D canvas context).
			this.canvas = elem;
			this.graphics = elem.getContext("2d");
			// Always allow chainability.
			return this;
		},
		/**
		 * Sets drawing defaults.
		 * @param {Object} [options] - Drawing options.
		 * @param {String} options.fillStyle - Fill style color (default: '#F00').
		 * @param {String} options.strokeStyle - Stroke style color (default: '#F0F').
		 * @param {Number} options.lineWidth - Line width (default: 2).
		 * @param {String} options.lineCap - Line cap (default: 'round').
		 * @param {String} options.lineJoin - Line join (default: 'round').
		 * @param {Number} options.miterLimit - Line miter (default: 10). Works only if the lineJoin attribute is "miter".
		 * @return jSketch
		 * @memberof jSketch
		 */
		drawingDefaults : function(options) {
			if ( typeof options === 'undefined')
				options = {};
			if ( typeof options.fillStyle === 'undefined')
				options.fillStyle = '#F00';
			if ( typeof options.strokeStyle === 'undefined')
				options.strokeStyle = '#F0F';
			if ( typeof options.lineWidth === 'undefined')
				options.lineWidth = 2;
			if ( typeof options.lineCap === 'undefined')
				options.lineCap = 'round';
			if ( typeof options.lineJoin === 'undefined')
				options.lineJoin = 'round';
			if ( typeof options.miterLimit === 'undefined')
				options.miterLimit = 10;
			// Remember graphic options for later saving/restoring drawing status.
			this.saveGraphics(options);
			// Apply defaults.
			this.restoreGraphics(options);
			return this;
		},
		/**
		 * Sets the dimensions of canvas.
		 * @param {Number} width - New canvas width.
		 * @param {Number} height - New canvas width.
		 * @return jSketch
		 * @memberof jSketch
		 */
		size : function(width, height) {
			this.stageWidth = width;
			this.stageHeight = height;
			this.canvas.width = width;
			this.canvas.height = height;
			// On resizing we lose drawing options, so restore them.
			this.restoreGraphics();
			return this;
		},
		/**
		 * Sets the background color of canvas.
		 * @param {Number|String} color - An HTML color.
		 * @return jSketch
		 * @memberof jSketch
		 */
		background : function(color) {
			this.beginFill(color);
			this.graphics.fillRect(0, 0, this.stageWidth, this.stageHeight);
			this.endFill();
			return this;
		},
		/**
		 * Shortcut for setting the size + background color.
		 * @param {Number} width - New canvas width.
		 * @param {Number} height - New canvas width.
		 * @param {Number|String} bgcolor - An HTML color.
		 * @return jSketch
		 * @memberof jSketch
		 */
		stage : function(width, height, bgcolor) {
			this.size(width, height).background(bgcolor);
			return this;
		},
		/**
		 * Sets the fill color.
		 * @param {Number|String} color - An HTML color.
		 * @return jSketch
		 * @memberof jSketch
		 */
		beginFill : function(color) {
			this.saveGraphics();
			this.graphics.fillStyle = color;
			return this;
		},
		/**
		 * Recovers the fill color that was set before <code>beginFill()</code>.
		 * @return jSketch
		 * @memberof jSketch
		 */
		endFill : function() {
			this.restoreGraphics();
			return this;
		},
		/**
		 * Sets the line style.
		 * @param {Number|String} color - An HTML color.
		 * @param {Number} thickness - Line thickness.
		 * @param {String} capStyle - Style of line cap.
		 * @param {String} joinStyle - Style of line join.
		 * @param {String} miter - Style of line miter. Only works if capStyle is "miter".
		 * @return jSketch
		 * @memberof jSketch
		 */
		lineStyle : function(color, thickness, capStyle, joinStyle, miter) {
			var options = {
				strokeStyle : color || this.graphics.strokeStyle,
				lineWidth : thickness || this.graphics.lineWidth,
				lineCap : capStyle || this.graphics.lineCap,
				lineJoin : joinStyle || this.graphics.lineJoin,
				miterLimit : miter || this.graphics.miterLimit
			};
			this.saveGraphics(options);
			this.restoreGraphics(options);
			return this;
		},
		/**
		 * Move brush to a coordinate in canvas.
		 * @param {Number} x - Horizontal coordinate.
		 * @param {Number} y - Vertical coordinate.
		 * @return jSketch
		 * @memberof jSketch
		 */
		moveTo : function(x, y) {
			this.graphics.moveTo(x, y);
			return this;
		},
		/**
		 * Draws line to given coordinate.
		 * @param {Number} x - Horizontal coordinate.
		 * @param {Number} y - Vertical coordinate.
		 * @return jSketch
		 * @memberof jSketch
		 */
		lineTo : function(x, y) {
			this.graphics.lineTo(x, y);
			return this;
		},
		/**
		 * Draws line from point 1 to point 2.
		 * @param {Number} x1 - Horizontal coordinate of point 1.
		 * @param {Number} y1 - Vertical coordinate of point 1.
		 * @param {Number} x2 - Horizontal coordinate of point 2.
		 * @param {Number} y2 - Vertical coordinate of point 2.
		 * @return jSketch
		 * @memberof jSketch
		 */
		line : function(x1, y1, x2, y2) {
			this.graphics.moveTo(x1, y1);
			this.lineTo(x2, y2);
			return this;
		},
		/**
		 * Draws thin line from point 1 to point 2.
		 * @param {Number} x1 - Horizontal coordinate of point 1.
		 * @param {Number} y1 - Vertical coordinate of point 1.
		 * @param {Number} x2 - Horizontal coordinate of point 2.
		 * @param {Number} y2 - Vertical coordinate of point 2.
		 * @param {Object} options - options to use to draw thin line
		 * @return jSketch
		 * @memberof jSketch
		 */
		thinLine : function(x1, y1, x2, y2, options) {
			// save the current graphics line options and set the new ones
			var oldGraphicsOpts = {
				strokeStyle : this.graphics.strokeStyle,
				lineWidth : this.graphics.lineWidth,
				lineCap : this.graphics.lineCap,
				lineJoin : this.graphics.lineJoin,
				miterLimit : this.graphics.miterLimit
			};
			this.graphics.strokeStyle = options.strokeStyle || "gray";
			//this.graphics.lineWidth = options.lineWidth || 1;
			//this.graphics.lineCap = options.lineCap;
			//this.graphics.lineJoin = options.lineJoin;
			//this.graphics.miterLimit = options.miterLimit;
			this.graphics.moveTo(x1, y1);
			this.graphics.lineTo(x2 + 0.5, y2 + 0.5);
			this.stroke();
			//this.graphics.strokeStyle = oldGraphicsOpts.strokeStyle;
			//this.graphics.lineWidth = oldGraphicsOpts.lineWidth;
			//this.graphics.lineCap = oldGraphicsOpts.lineCap;
			//this.graphics.lineJoin = oldGraphicsOpts.lineJoin;
			//this.graphics.miterLimit = oldGraphicsOpts.miterLimit;
			return this;
		},
		/**
		 * Draws n x m grid.
		 * @param {Boolean} show - if true draw Grid, if false erase Grid
		 * @param {Number} n - number of horizontal divisions
		 * @param {Number} m - number of vertical divisions
		 * @param {Object} options - Options to use to draw grid lines
		 * @return jSketch
		 * @memberof jSketch
		 */
		gridMaker : function(show, n, m, options) {
			var numHorizontal = this.stageHeight / m;
			var numVertical = this.stageWidth / n;

			// save current line width to restore the pencil
			var curLineWidth = this.graphics.lineWidth;

			if (show == true) {
				this.pencil(1);
			} else {
				this.eraser(1);
			};

			for ( i = 1; i < numHorizontal; i++) {
				var y1 = y2 = (m * i);
				var x1 = 0;
				var x2 = this.stageWidth;
				this.thinLine(x1 - 0.5, y1 - 0.5, x2 + 0.5, y2 + 0.5, {
					strokeStyle : "gray"
				});
			};

			for ( i = 1; i < numVertical; i++) {
				var x1 = x2 = (n * i) + 0.5;
				var y1 = 0.5;
				var y2 = this.stageHeight + 0.5;
				this.thinLine(x1 - 0.5, y1 - 0.5, x2 + 0.5, y2 + 0.5, {
					strokeStyle : "gray"
				});
			};

			this.pencil(curLineWidth);

			return this;
		},
		/**
		 * Shows n x m grid.
		 * @param {Number} n - number of horizontal divisions
		 * @param {Number} m - number of vertical divisions
		 * @return jSketch
		 * @memberof jSketch
		 */
		showGrid : function(n, m) {
			var options = {
				strokeStyle : "gray"
			};
			this.gridMaker(true, n, m, options);
			return this;
		},
		/**
		 * Hides n x m grid.
		 * @param {Number} n - number of horizontal divisions
		 * @param {Number} m - number of vertical divisions
		 * @return jSketch
		 * @memberof jSketch
		 */
		hideGrid : function(n, m) {
			var options = {
				strokeStyle : "gray"
			};
			this.gridMaker(false, n, m, options);
			return this;
		},
		/**
		 * Draws or hides border.
		 * @param {Boolean} showBorder - if true draw Border, if false erase Border
		 * @param {Object} options - Options to use to draw grid lines
		 * @return jSketch
		 * @memberof jSketch
		 */
		borderMaker : function(showBorder, options) {

			// save current line width to restore the pencil
			var curLineWidth = this.graphics.lineWidth;
			var curStrokeStyle = this.graphics.strokeStyle;

			if (showBorder == true) {
				this.pencil(1);
				this.graphics.strokeStyle = options.strokeStype;
			} else {
				this.eraser(1);
			};

			var x1 = 0;
			var x2 = this.stageWidth;
			var y1 = 0;
			var y2 = this.stageHeight;
			this.strokeRect(x1, y1, x2, y2);

			if (showBorder == true) {
				this.graphics.strokeStyle = curStrokeStyle;
			};
			this.pencil(curLineWidth);

			return this;
		},
		/**
		 * Draws border around the canvas
		 * @return jSketch
		 * @memberof jSketch
		 */
		showBorder : function() {
			var options = {
				strokeStyle : "gray"
			};
			this.borderMaker(true, options);
			return this;
		},
		/**
		 * Erases border around the canvas
		 * @return jSketch
		 * @memberof jSketch
		 */
		hideBorder : function() {
			var options = {
				strokeStyle : "gray"
			};
			this.borderMaker(true, options);
			return this;
		},
		/**
		 * Draws curve to given coordinate.
		 * @param {Number} x - Horizontal coordinate.
		 * @param {Number} y - Vertical coordinate.
		 * @param {Number} cpx - Horizontal coordinate of control point.
		 * @param {Number} cpy - Vertical coordinate of control point.
		 * @return jSketch
		 * @memberof jSketch
		 */
		curveTo : function(x, y, cpx, cpy) {
			this.graphics.quadraticCurveTo(cpx, cpy, x, y);
			return this;
		},
		/**
		 * Draws curve from coordinate 1 to coordinate 2.
		 * @param {Number} x1 - Horizontal coordinate of point 1.
		 * @param {Number} y1 - Vertical coordinate of point 1.
		 * @param {Number} x2 - Horizontal coordinate of point 2.
		 * @param {Number} y2 - Vertical coordinate of point 2.
		 * @param {Number} cpx - Horizontal coordinate of control point.
		 * @param {Number} cpy - Vertical coordinate of control point.
		 * @return jSketch
		 * @memberof jSketch
		 */
		curve : function(x1, y1, x2, y2, cpx, cpy) {
			this.graphics.moveTo(x1, y1);
			this.curveTo(x2, y2, cpx, cpy);
			return this;
		},
		/**
		 * Strokes a given path.
		 * @return jSketch
		 * @memberof jSketch
		 */
		stroke : function() {
			this.graphics.stroke();
			return this;
		},
		/**
		 * Draws a stroke-only rectangle.
		 * @param {Number} x - Horizontal coordinate.
		 * @param {Number} y - Vertical coordinate.
		 * @param {Number} width - Rectangle width.
		 * @param {Number} height - Rectangle height.
		 * @return jSketch
		 * @memberof jSketch
		 */
		strokeRect : function(x, y, width, height) {
			this.graphics.beginPath();
			this.graphics.strokeRect(x, y, width, height);
			this.graphics.closePath();
			return this;
		},
		/**
		 * Draws a filled rectangle.
		 * @param {Number} x - Horizontal coordinate.
		 * @param {Number} y - Vertical coordinate.
		 * @param {Number} width - Rectangle width.
		 * @param {Number} height - Rectangle height.
		 * @return jSketch
		 * @memberof jSketch
		 */
		fillRect : function(x, y, width, height) {
			this.graphics.beginPath();
			this.graphics.fillRect(x, y, width, height);
			this.graphics.closePath();
			return this;
		},
		/**
		 * Draws a stroke-only circle.
		 * @param {Number} x - Horizontal coordinate.
		 * @param {Number} y - Vertical coordinate.
		 * @param {Number} radius - Circle radius.
		 * @return jSketch
		 * @memberof jSketch
		 */
		strokeCircle : function(x, y, radius) {
			this.graphics.beginPath();
			this.graphics.arc(x, y, radius, 0, Math.PI * 2, false);
			this.graphics.stroke();
			this.graphics.closePath();
			return this;
		},
		/**
		 * Draws a filled circle.
		 * @param {Number} x - Horizontal coordinate.
		 * @param {Number} y - Vertical coordinate.
		 * @param {Number} radius - Circle radius.
		 * @return jSketch
		 * @memberof jSketch
		 */
		fillCircle : function(x, y, radius) {
			this.graphics.beginPath();
			this.graphics.arc(x, y, radius, 0, Math.PI * 2, false);
			this.graphics.fill();
			this.graphics.closePath();
			return this;
		},
		/**
		 * Draws a color filled circle.
		 * @param {Number} x - Horizontal coordinate.
		 * @param {Number} y - Vertical coordinate.
		 * @param {Number} radius - Circle radius.
		 * @param {String} color - Color of Circle
		 * @return jSketch
		 * @memberof jSketch
		 */
		fillColoredCircle : function(x, y, radius, color) {
			this.graphics.beginPath();
			this.graphics.arc(x, y, radius, 0, Math.PI * 2, false);
			this.graphics.fillStyle = color;
			this.graphics.fill();
			this.graphics.closePath();
			return this;
		},
		// experimental
		radialCircle : function(x, y, radius, color, glowSize) {
			var g = this.graphics.createRadialGradient(x, y, radius, x, y, glowSize);
			g.addColorStop(0, color);
			g.addColorStop(1.0, "rgba(0,0,0,0)");
			this.graphics.fillStyle = g;
			this.fillCircle(x, y, radius);
			return this;
		},
		// experimental
		insertText : function(textXord, textYord, textFont, textValue, fillStyle) {
			this.graphics.font = textFont;
			this.graphics.fillStyle = fillStyle;
			this.graphics.fillText(textValue, textXord, textYord);
			return this;
		},
		/**
		 * A path is started.
		 * @return jSketch
		 * @memberof jSketch
		 */
		beginPath : function() {
			this.saveGraphics();
			this.graphics.beginPath();
			return this;
		},
		/**
		 * A path is finished.
		 * @return jSketch
		 * @memberof jSketch
		 */
		closePath : function() {
			this.graphics.closePath();
			this.restoreGraphics();
			return this;
		},
		/**
		 * Sets brush to eraser mode.
		 * @param {Number} [brushSize] - Brush size.
		 * @return jSketch
		 * @memberof jSketch
		 */
		eraser : function(brushSize) {
			if ( typeof brushSize === 'undefined')
				brushSize = 15;
			this.graphics.globalCompositeOperation = "destination-out";
			this.lineStyle(null, brushSize);
			return this;
		},
		/**
		 * Sets brush to pencil mode.
		 * @param {Number} [brushSize] - Brush size.
		 * @return jSketch
		 * @memberof jSketch
		 */
		pencil : function(brushSize) {
			if ( typeof brushSize === 'undefined')
				brushSize = 2;
			this.graphics.globalCompositeOperation = "source-over";
			this.lineStyle(null, brushSize);
			return this;
		},
		/**
		 * Clears stage.
		 * @return jSketch
		 * @memberof jSketch
		 */
		clear : function() {
			// If there are any transformations, save them
			// and restore after clearing the drawing
			// Store the current transformation matrix
			this.graphics.save();
			// Use the identity matrix while clearing the canvas
			this.graphics.setTransform(1, 0, 0, 1, 0, 0);
			// Note: using 'this.canvas.width = this.canvas.width' resets _all_ styles, so better use clearRect.
			this.graphics.clearRect(0, 0, this.stageWidth, this.stageHeight);
			// Restore the transform
			this.graphics.restore();

			return this;
		},
		/**
		 * Saves a snapshot of all styles and transformations.
		 * @return jSketch
		 * @memberof jSketch
		 */
		save : function() {
			this.graphics.save();
			return this;
		},
		/**
		 * Restores previous drawing state.
		 * @return jSketch
		 * @memberof jSketch
		 */
		restore : function() {
			this.graphics.restore();
			return this;
		},
		/**
		 * Saves given drawing settings.
		 * @param {Object} [options] - Graphics options.
		 * @return jSketch
		 * @memberof jSketch
		 */
		saveGraphics : function(options) {
			if ( typeof options === 'undefined')
				options = this.data.options;
			this.data.options = options;
			return this;
		},
		/**
		 * Restores given drawing settings.
		 * @param {Object} [options] - Graphics options.
		 * @return jSketch
		 * @memberof jSketch
		 */
		restoreGraphics : function(options) {
			if ( typeof options === 'undefined')
				options = this.data.options;
			for (var opt in options) {
				this.graphics[opt] = options[opt];
			};
			return this;
		},
		/**
		 * Draws an image.
		 * @param {Number} src - Image source path.
		 * @param {Number} [x] - Horizontal coordinate.
		 * @param {Number} [y] - Vertical coordinate.
		 * @return jSketch
		 * @memberof jSketch
		 */
		drawImage : function(src, x, y) {
			if ( typeof x === 'undefined')
				x = 0;
			if ( typeof y === 'undefined')
				y = 0;
			var self = this,
			    img = new Image();
			img.onload = function() {
				self.graphics.drawImage(img, x, y, self.canvas.width, self.canvas.height);
			};
			img.src = src;
			return this;
		},
		/**
		 * Draws a background image.
		 * @param {Number} src - Image source path.
		 * @param {Number} [x] - Horizontal coordinate.
		 * @param {Number} [y] - Vertical coordinate.
		 * @param {Number} [width] - Width of image
		 * @param {Number} [height] - Height of image
		 * @return jSketch
		 * @memberof jSketch
		 */
		drawBGImage : function(src, x, y, width, height, callBackFunc) {
			if ( typeof x === 'undefined')
				x = 0;
			if ( typeof y === 'undefined')
				y = 0;
			if ( typeof width === 'undefined')
				width = self.canvas.width;
			if ( typeof height === 'undefined')
				height = self.canvas.height;
			var self = this,
			    img = new Image();

			// The following two lines are introduced to
			// have the background image preserved in the
			// drawing buffer.
			img.crossOrigin = "Anonymous";
			var gl = self.canvas.getContext("webgl", {
				preserveDrawingBuffer : true
			});

			img.onload = function() {
				var existingGCO = self.graphics.globalCompositeOperation;
				self.graphics.globalCompositeOperation = 'destination-over';
				self.graphics.drawImage(img, x, y, width, height);
				self.content_as_bg = self.canvas.toDataURL("image/png");
				self.graphics.globalCompositeOperation = existingGCO;

				if ( typeof callBackFunc !== 'undefined') {
					callBackFunc(src, x, y, width, height, self.content_as_bg);
				}

				// var canvasAsImage = document.getElementById("canvas-as-image");
				// canvasAsImage.src = self.content_as_bg;

			};
			img.src = src;
			// make sure the load event fires for cached images too
			if (img.complete || img.complete === undefined) {
				img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
				img.src = src;
			};
			return this;
		}
	};

	// Expose.
	window.jSketch = jSketch;

})(this);
