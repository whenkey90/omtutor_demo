/*!
* jQuery sketchable | v1.8.1 | Luis A. Leiva | MIT license
* A jQuery plugin for the jSketch drawing library.
* Modified with many additional features by OMTutor.com
*/
/**
 * @name $
 * @class
 * @ignore
 * @description This just documents the method that is added to jQuery by this plugin.
 * See <a href="http://jquery.com/">the jQuery library</a> for full details.
 */
/**
 * @name $.fn
 * @memberof $
 * @description This just documents the method that is added to jQuery by this plugin.
 * See <a href="http://jquery.com/">the jQuery library</a> for full details.
 */
;(function($) {
	// Custom namespace ID.
	var _ns = "sketchable";
	/**
	 * jQuery sketchable plugin API.
	 * @namespace methods
	 */
	var methods = {
		/**
		 * Initializes the selected jQuery objects.
		 * @param {Object} opts - Plugin configuration (see defaults).
		 * @return jQuery
		 * @ignore
		 * @namespace methods.init
		 * @example $(selector).sketchable();
		 */
		init : function(opts) {
			// Options will be available for all plugin methods.
			var options = $.extend(true, {}, $.fn.sketchable.defaults, opts || {});
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns);
				// Check if element is not initialized yet.
				if (!data) {
					// Attach event listeners.
					if (options.interactive) {
						options.bgimage.useContent = false;
						elem.bind("mousedown", mousedownHandler);
						elem.bind("mousemove", mousemoveHandler);
						elem.bind("mouseup", mouseupHandler);
						elem.bind("touchstart", touchdownHandler);
						elem.bind("touchmove", touchmoveHandler);
						elem.bind("touchend", touchupHandler);
						// Fix Chrome "bug".
						this.onselectstart = function() {
							return false;
						};
					};
					postProcess(elem, options);
				};

				var sketch = new jSketch(this, options.graphics);

				// Set the sketchable options dimensions to that of canvas
				// if the canvas element is too big, adjust it to sketchable max
				if (sketch.stageWidth > options.maxWidth || sketch.stageHeight > options.maxHeight) {
					options.canvasWidth = options.maxWidth;
					options.canvasHeight = options.maxHeight;
					// resize the sketch to the new dimensions
					sketch.size(options.canvasWidth, options.canvasHeight);
					console.log("Canvas resized to the maximum sketchable dimensions allowed.");
				} else {
					options.canvasWidth = sketch.stageWidth;
					options.canvasHeight = sketch.stageHeight;
				};

				// Reconfigure element data.
				elem.data(_ns, {
					// All strokes will be stored here.
					strokes : [],
					// This will store one stroke per touching finger.
					coords : {},
					// Define a stack to store undo strokes
					stack : [],

					// Date of first coord, used as time origin.
					timestamp : (new Date).getTime(),
					// Save a pointer to the drawing canvas (jSketch instance).
					sketch : sketch,
					// Save also a pointer to the given options.
					options : options
				});

				// Trigger init event.
				if ( typeof options.events.init === 'function') {
					options.events.init(elem, elem.data(_ns));
				};

				// show or hide border as per the setting
				if (options.showBorder === true) {
					sketch.showBorder();
				} else {
					sketch.hideBorder();
				};
			});
		},
		/**
		 * Changes config on the fly of an existing sketchable element.
		 * Previous options are retained with some exceptions.
		 * if lockInteractive() was called before this, interactive value cannot be changed.
		 * if freezeConfig is true, configuration options cannot be modified.
		 * To completely reconfigure the options just use the reset method.
		 * @param {Object} opts - Plugin configuration (see defaults).
		 * @return jQuery
		 * @namespace methods.config
		 * @example
		 * $(selector).sketchable('config', { interactive: false }); // Later on:
		 * $(selector).sketchable('config', { interactive: true });
		 */
		config : function(opts) {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns);

				if (!data.options.freezeConfig) {
					var curInteractive = data.options.interactive;
					var curLockInteractive = data.options.lockInteractive;
					data.options = $.extend(true, {}, $.fn.sketchable.defaults, data.options, opts || {});
					if (curLockInteractive == true) {
						data.options.interactive = curInteractive;
						data.options.lockInteractive = true;
					};

					data.sketch.data.options = data.options;
					data.sketch.graphics.strokeStyle = data.options.graphics.strokeStyle;
					data.sketch.graphics.lineWidth = data.options.graphics.lineWidth;

					if (data.options.canvasWidth > data.options.maxWidth) {
						data.options.canvasWidth = data.options.maxWidth;
					};

					if (data.options.canvasHeight > data.options.maxHeight) {
						data.options.canvasHeight = data.options.maxHeight;
					};

					if (data.options.interactive) {
						data.options.bgimage.useContent = false;
					};

					postProcess(elem);
				};
			});
		},
		/**
		 * Lock Interactive value by setting lockInteractive = true
		 * Prevents changing interactive value via config method
		 * To revert this, call unlock interactive method
		 * This has NO effect init [object.sketchable(opts)] method
		 * or reset [object.sketchable('reset',opts)] method are called
		 * @return jQuery
		 * @namespace methods.lockInteractive
		 * @example
		 * $(selector).sketchable('lockInteractive'); // lock current interactive value
		 * $(selector).sketchable('lockInteractive', true|false); // set new interactive value and lock it
		 */
		lockInteractive : function(interactiveValue) {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				if (interactiveValue == true || interactiveValue == false) {
					data.options.interactive = interactiveValue;
					data.options.lockInteractive = true;
				} else {
					data.options.lockInteractive = true;
				};

			});
		},
		/**
		 * Unlock Interactive value by setting lockInteractive = false
		 * Allows changing interactive value via config method
		 * @return jQuery
		 * @namespace methods.unlockInteractive
		 * @example
		 * $(selector).sketchable('unlockInteractive');
		 */
		unlockInteractive : function() {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				data.options.lockInteractive = false;
			});
		},
		/**
		 * Freeze configuration changes by setting freezeConfig = true
		 * Prevents changing configuration options already loaded
		 * To revert this, call unfreezeConfig() method
		 * @return jQuery
		 * @namespace methods.freezeConfig
		 * @example
		 * $(selector).sketchable('freezeConfig');
		 */
		freezeConfig : function() {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				data.options.freezeConfig = true;
			});
		},
		/**
		 * Allow configuration changes by setting freezeConfig = false
		 * Allows changing configuration options via config method
		 * @return jQuery
		 * @namespace methods.unfreezeConfig
		 * @example
		 * $(selector).sketchable('unfreezeConfig');
		 */
		unfreezeConfig : function() {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				data.options.freezeConfig = false;
			});
		},
		/**
		 * Gets/Sets drawing data strokes sequence.
		 * @param {Array} arr - Multidimensional array of [x,y,time,status] tuples; status = 0 (pen down) or 1 (pen up).
		 * @return Strokes object on get, jQuery on set (with the new data attached)
		 * @namespace methods.strokes
		 * @example
		 * $(selector).sketchable('strokes'); // Getter
		 * $(selector).sketchable('strokes', [ [arr1], ..., [arrN] ]); // Setter
		 */
		strokes : function(arr) {
			if (arr) {// setter
				return this.each(function() {
					var elem = $(this),
					    data = elem.data(_ns) || {};
					data.strokes = arr;
				});
			} else {// getter
				var data = $(this).data(_ns);
				return data.strokes;
			};
		},
		/**
		 * Gets options object.
		 * @return options object
		 * @namespace methods.getOptions
		 * @example
		 * $(selector).sketchable('getOptions'); // Getter
		 */
		getOptions : function() {
			var data = $(this).data(_ns);
			return data.options;
		},
		/**
		 * Allows low-level manipulation of the sketchable canvas.
		 * @param {Function} callback - Callback function, invoked with 2 arguments: elem (jQuery element) and data (jQuery element data).
		 * @return jQuery
		 * @namespace methods.handler
		 * @example
		 * $(selector).sketchable('handler', function(elem, data){
		 *   // do something with elem or data
		 * });
		 */
		handler : function(callback) {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns);
				callback(elem, data);
			});
		},
		/**
		 * Sets the backgound image new width and new height.
		 * @see methods.resizeBGImage
		 * @return jQuery
		 * @namespace methods.resizeBGImage
		 * @example
		 * $(selector).sketchable('resizeBGImage',width,height);
		 */
		resizeBGImage : function(width, height) {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				var widthLimit = options.canvasWidth <= options.maxWidth ? options.canvasWidth : options.maxWidth;
				var heightLimit = options.canvasHeight <= options.maxHeight ? options.canvasHeight : options.maxHeight;
				if (width > widthLimit || height > heightLimit) {
					var retObj = proportionalDimensions(width, height, widthLimit, heightLimit);
					data.options.bgimage.width = retObj.width;
					data.options.bgimage.height = retObj.height;
				} else {
					data.options.bgimage.width = width;
					data.options.bgimage.height = height;
				};
			});
		},
		/**
		 * Sets the canvas new width and new height.
		 * @see methods.resizeCanvas
		 * @return jQuery
		 * @namespace methods.resizeCanvas
		 * @example
		 * $(selector).sketchable('resizeCanvas',width,height);
		 */
		resizeCanvas : function(width, height) {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;

				if (width !== 'undefined' && height !== 'undefined' && options.allowResize === true) {
					data.options.canvasWidth = width > data.options.maxWidth ? data.options.maxWidth : width;
					data.options.canvasHeight = height > data.options.maxHeight ? data.options.maxHeight : height;
					data.sketch.size(data.options.canvasWidth, data.options.canvasHeight);
				};

				// draw border if showBorder is true
				if (options.showBorder === true) {
					$(this).sketchable('showBorder');
				} else {
					$(this).sketchable('hideBorder');
				};

				// if we need to show the grid, do so
				if (options.grid.showGrid && options.grid.enabled) {
					$(this).sketchable('showGrid', options.grid.horizontal, options.grid.vertical);
				};

				drawStrokes(elem, data);
			});
		},
		/**
		 * Sets the canvas new width and new height and
		 * the backgound image new width and new height
		 * so that, next redraw adjusts the sizes of canvas
		 * and the background image to the new dimensions
		 * @see methods.resize
		 * @return jQuery
		 * @namespace methods.resize
		 * @example
		 * $(selector).sketchable('resize',width,height);
		 */
		resize : function(width, height) {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				if (width > 0 && height > 0 && width <= options.maxWidth && height <= options.maxHeight) {
					data.options.canvasWidth = width;
					data.options.canvasHeight = height;
					$(this).sketchable('resizeBGImage', width, height);
					$(this).sketchable('resizeCanvas', width, height);
				}
			});
		},
		/**
		 * redraws the strokes using the options of each stroke.
		 * @see methods.redraw
		 * @return jQuery
		 * @namespace methods.redraw
		 * @example
		 * $(selector).sketchable('redraw');
		 */
		redraw : function(callBackForImage) {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				var canvasWidth = elem[0].width;
				var canvasHeight = elem[0].height;

				// Clear the canvas of existing drawings
				data.sketch.clear();

				// draw border if showBorder is true
				if (options.showBorder === true) {
					$(this).sketchable('showBorder');
				} else {
					$(this).sketchable('hideBorder');
				};

				// if we need to show the grid, do so
				if (options.grid.showGrid && options.grid.enabled) {
					$(this).sketchable('showGrid', options.grid.horizontal, options.grid.vertical);
				};

				// Now the canvas is ready for redrawing everything.
				// Assume strokes data contains all you need.

				drawStrokes(elem, data);

/*
				// Extract the (x,y) values from strokes by discarding timestamp and isDrawing fields
				// strokes is a variable filled with strokes data (either extracted from first canvas or retrieved from mtData object)
				var strokes = data.strokes;
				var strokesArr = transform(strokes);

				// Now each stroke is a an array of points with (x,y) coords, starting at mouseDown event and ending at mouseUp event. //
				for (var k = 0; k < strokesArr.length; ++k) {

					var _strokeOpts = strokesArr[k][0];
					$(this).sketchable('config', _strokeOpts);
					var KthStroke = strokesArr[k][1];
					for (var m = 0; m < KthStroke.length; ++m) {
						// First point
						var pointM = KthStroke[m];
						var x1 = pointM[0];
						var y1 = pointM[1];

						var nextPoint = KthStroke[m];
						// Next point, assume this is last point
						if (m != KthStroke.length - 1) {// if it is not the last point ...
							// set next point to the (m+1)th point in strokeArr
							nextPoint = KthStroke[m + 1];
						}// if
						var x2 = nextPoint[0];
						var y2 = nextPoint[1];

						if (_strokeOpts.drawMode == 'FreeHand' || _strokeOpts.drawMode == 'StraightLines') {
							// Mark visually the 1st point of stroke.
							if (m == 0 && _strokeOpts.graphics.firstPointSize > 0) {
								data.sketch.fillColoredCircle(x1, y1, _strokeOpts.graphics.firstPointSize, _strokeOpts.graphics.strokeStyle);
							}// if
							// draw line from old point to new point which is a better way than drawPixel() method
							data.sketch.line(x1, y1, x2, y2);
							// Mark visually the last point of stroke.
							if (m == KthStroke.length - 1 && _strokeOpts.graphics.firstPointSize > 0) {
								data.sketch.fillColoredCircle(x2, y2, _strokeOpts.graphics.firstPointSize, _strokeOpts.graphics.strokeStyle);
							} // if
						} else if (_strokeOpts.drawMode == 'Circles') {
							data.sketch.strokeCircle(x1, y1, Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)));
						} else if (_strokeOpts.drawMode == 'Rectangles') {
							data.sketch.beginPath().strokeRect(x1, y1, x2 - x1, y2 - y1).stroke().closePath();
						} else if (_strokeOpts.drawMode == 'Text') {
							data.sketch.insertText(x1, y1, _strokeOpts.textFont, _strokeOpts.textValue, _strokeOpts.graphics.strokeStyle);
						}
						;

						// Display all the lines and paths set on this canvas context //
						data.sketch.stroke();

					}; // for KthStroke
				};// for StrokeArr
*/
				// Restore original options - drawBGImage needs them
				$(this).sketchable('config', options);

				if ( typeof callBackForImage !== 'undefined') {
					// display the background image
					$(this).sketchable('drawBGImage', undefined, undefined, undefined, callBackForImage);
				} else {
					$(this).sketchable('drawBGImage');
					options.bgimage.content_as_bg = data.sketch.canvas.toDataURL("image/png");
				}

				// Restore original options + content_as_bg
				$(this).sketchable('config', options);

			});
			// return
		},
		/**
		 * Shows grid with specified number of horizontal and vertical divisions
		 * @param horizontal number of horizontal divsions
		 * @param vertical number of vertical divisions
		 * @return jQuery
		 * @namespace methods.showGrid
		 * @example $(selector).sketchable('showGrid', horizontal, vertical)
		 */
		showGrid : function(horizontal, vertical) {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				data.sketch.showGrid(horizontal, vertical).stroke();
			});
		},
		/**
		 * Hides grid with specified number of horizontal and vertical divisions
		 * @param horizontal number of horizontal divsions
		 * @param vertical number of vertical divisions
		 * @return jQuery
		 * @namespace methods.hideGrid
		 * @example $(selector).sketchable('hideGrid', horizontal, vertical)
		 */
		hideGrid : function(horizontal, vertical) {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				data.sketch.hideGrid(horizontal, vertical).stroke();
			});
		},
		/**
		 * Sets the showBorder: true and draws border
		 * @return jQuery
		 * @namespace methods.showBorder
		 * @example $(selector).sketchable('showBorder')
		 */
		showBorder : function() {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				data.sketch.showBorder().stroke();
			});
		},
		/**
		 * Sets the showBorder: false and erases border
		 * @return jQuery
		 * @namespace methods.hideBorder
		 * @example $(selector).sketchable('hideBorder')
		 */
		hideBorder : function() {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				data.sketch.hideBorder().stroke();
			});
		},
		/**
		 * Clears canvas (together with strokes data and background image).
		 * If you need to clear canvas only, just invoke <tt>data.sketch.clear()</tt> via <tt>$(selector).sketchable('handler')</tt>.
		 * @see methods.handler
		 * @return jQuery
		 * @namespace methods.clear
		 * @example $(selector).sketchable('clear');
		 */
		clear : function() {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				if (data.sketch) {
					data.sketch.clear();
					data.strokes = [];
					data.coords = {};
					data.stack = [];
				};

				if (options && typeof options.events.clear === 'function') {
					options.events.clear(elem, data);
				};
			});
		},
		/**
		 * Erase canvas (leave strokes data intact).
		 * @see methods.handler
		 * @return jQuery
		 * @namespace methods.erase
		 * @example $(selector).sketchable('erase');
		 */
		erase : function() {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				if (data.sketch) {
					data.sketch.clear();
				};
			});
		},
		/**
		 * undo last drawing (pops out last stroke and saves on stack).
		 * @see methods.handler
		 * @return jQuery
		 * @namespace methods.undo
		 * @example $(selector).sketchable('undo');
		 */
		undo : function() {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				if (data.sketch) {
					if (data.strokes.length >= 1) {
						data.stack.push(data.strokes.pop());
						$(this).sketchable('redraw');
					}
				};
			});
		},
		/**
		 * redo last undo (extracts last stroke from stack and appends to strokes).
		 * @see methods.handler
		 * @return jQuery
		 * @namespace methods.redo
		 * @example $(selector).sketchable('redo');
		 */
		redo : function() {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				if (data.sketch) {
					if (data.stack.length >= 1) {
						data.strokes.push(data.stack.pop());
						$(this).sketchable('redraw');
					}
				};
			});
		},
		/**
		 * Reinitializes a sketchable canvas with given opts - ignores _configLocked and _freezeConfig flags
		 * @param {Object} opts - Plugin configuration (see defaults).
		 * @return jQuery
		 * @namespace methods.reset
		 * @example
		 * $(selector).sketchable('reset');
		 * $(selector).sketchable('reset', {interactive:false});
		 */
		reset : function(opts) {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				elem.sketchable('destroy').sketchable(opts);

				if (options && typeof options.events.reset === 'function') {
					options.events.reset(elem, data);
				};
			});
		},
		/**
		 * Destroys sketchable canvas (together with strokes data and events).
		 * @return jQuery
		 * @namespace methods.destroy
		 * @example $(selector).sketchable('destroy');
		 */
		destroy : function() {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				if (options.interactive) {
					elem.unbind("mouseup", mouseupHandler);
					elem.unbind("mousemove", mousemoveHandler);
					elem.unbind("mousedown", mousedownHandler);
					elem.unbind("touchstart", touchdownHandler);
					elem.unbind("touchmove", touchmoveHandler);
					elem.unbind("touchend", touchupHandler);
				};

				elem.removeData(_ns);

				if (options && typeof options.events.destroy === 'function') {
					options.events.destroy(elem, data);
				};
			});
		},
		/**
		 * Draw image on canvas (leave strokes data intact), draws over existing.
		 * @param src source file (image file)
		 * @param x x-coordinate of the pixel where left top corner starts
		 * @param y y-coordinate of the pixel where left top corner starts
		 * @see methods.handler
		 * @return jQuery
		 * @namespace methods.drawImage
		 * @example $(selector).sketchable('drawImage', src, x, y);
		 */
		drawImage : function(src, x, y) {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				if (data.sketch) {
					data.sketch.drawImage(src, x, y);
				};
			});
		},
		/**
		 * Draw background image on canvas (leave strokes data intact), draws under existing.
		 * @param src source file (image file)
		 * @param x x-coordinate of the pixel where left top corner starts
		 * @param y y-coordinate of the pixel where left top corner starts
		 * @param callBackForImage - function with (src, x, y, srcWidth, srcHeight, content_as_bg)
		 * @see methods.handler
		 * @return jQuery
		 * @namespace methods.drawBGImage
		 * @example $(selector).sketchable('drawBGImage', src, x, y, callBackForImage);
		 */
		drawBGImage : function(src, x, y, callBackForImage) {
			return this.each(function() {
				var elem = $(this),
				    data = elem.data(_ns) || {},
				    options = data.options;
				var imageSrc,
				    bgImageWidth,
				    bgImageHeight,
				    canvasWidth,
				    canvasHeight;

				// If source image is supplied, use it
				// if not, check the sketchable for
				// localfile
				// or serverfile
				// or content_as_bg
				// in that order and use it
				if ( typeof src !== "undefined") {
					imageSrc = src;
					var tempImage = new Image();
					tempImage.crossOrigin = "Anonymous";
					var imageInfo = '';
					tempImage.addEventListener("load", function() {
						bgImageWidth = tempImage.width;
						bgImageHeight = tempImage.height;
						data.options.bgimage.width = tempImage.width;
						data.options.bgimage.height = tempImage.height;
						resizeAndDrawBGImage(elem, data, imageSrc, x, y, bgImageWidth, bgImageHeight, callBackForImage);
					});
					// Note: the following line causes above event handler triggered
					// but timing for completing even handler is not guaranteed
					tempImage.src = imageSrc;
					// make sure the load event fires for cached images too
					if (tempImage.complete || tempImage.complete === undefined) {
						tempImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
						tempImage.src = imageSrc;
					};
					// here: don't expect event handler is finished processing
				} else {
					if (options.bgimage.localfile !== "") {
						imageSrc = options.bgimage.localfile;
					} else if (options.bgimage.serverfile !== "") {
						imageSrc = options.bgimage.serverfile;
					} else if (options.bgimage.useContent === true && options.bgimage.content_as_bg !== "") {
						imageSrc = options.bgimage.content_as_bg;
					}
					;

					if (options.interactive === false && options.bgimage.useContent === true && options.bgimage.content_as_bg !== "") {
						imageSrc = options.bgimage.content_as_bg;
					};

					if ( typeof imageSrc !== 'undefined' && imageSrc !== "") {
						bgImageWidth = options.bgimage.width;
						bgImageHeight = options.bgimage.height;
						resizeAndDrawBGImage(elem, data, imageSrc, x, y, bgImageWidth, bgImageHeight, callBackForImage);
					};
				};
			});
		}
	};

	/**
	 * Creates a <tt>jQuery.sketchable</tt> instance.
	 * This is a jQuery plugin for the <tt>jSketch</tt> drawing class.
	 * @param {String|Object} method - Method to invoke, or a configuration object.
	 * @return jQuery
	 * @class
	 * @version 1.8.1
	 * @date 28 Nov 2016
	 * @author Luis A. Leiva
	 * @license MIT license
	 * @example
	 * $(selector).sketchable();
	 * $(selector).sketchable({interactive:false});
	 * @see methods
	 */
	$.fn.sketchable = function(method) {
		// These "magic" keywords return internal plugin methods,
		// so that they can be easily extended/overriden.
		if ("methods functions hooks".split(" ").indexOf(method) > -1) {
			return methods;
		} else if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if ( typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist. See jQuery.sketchable("methods").');
		}
		;

		return this;
	};

	/**
	 * Default configuration.
	 * Note that mouse* callbacks are triggered only if <tt>interactive</tt> is set to <tt>true</tt>.
	 * @name defaults
	 * @default
	 * @memberof $.fn.sketchable
	 * @example
	 * $(selector).sketchable({
	 *   interactive: true,
	 *   lockInteractive: false,
	 *   mouseupMovements: false,
	 *   relTimestamps: false,
	 *   multitouch: true,
	 *   cssCursors: true,
	 *   freezeConfig: false,
	 *   drawMode: 'FreeHand',
	 *   textFont: '30x Arial'.
	 *   textValue: "",
	 * 	 showBorder: true,
	 *   canvasWidth : 0,
	 *   canvasHeight : 0,
	 *   maxWidth : 800,
	 *   maxHeight : 600,
	 *   allowResize : true,
	 *   events: {
	 *     init: function(elem, data){ },
	 *     clear: function(elem, data){ },
	 *     destroy: function(elem, data){ },
	 *     mousedown: function(elem, data, evt){ },
	 *     mousemove: function(elem, data, evt){ },
	 *     mouseup: function(elem, data, evt){ },
	 *   },
	 *   graphics: {
	 *     firstPointSize: 3,
	 *     lineWidth: 3,
	 *     strokeStyle: '#F0F',
	 *     fillStyle: '#F0F',
	 *     lineCap: "round",
	 *     lineJoin: "round",
	 *     miterLimit: 10
	 *   },
	 * 	thinline : {
	 *		graphics : {
	 *			firstPointSize : 1,
	 *			lineWidth : 1,
	 * 			strokeStyle : "gray",
	 *			fillStyle : "gray",
	 *			lineCap : "round",
	 *			lineJoin : "round",
	 *			miterLimit : 10
	 *		},
	 *	grid : {
	 * 		enabled : false,
	 *		showGrid : false,
	 *		numHorizontal : 10,
	 *		numVertical : 20
	 *	},
	 *  bgimage : {
	 * 		enabled : true,
	 * 		selected : false,
	 * 		localfile : "",
	 * 		serverfile : "",
	 * 		content_as_bg : "",
	 * 		xCoordinate : 0,
	 * 		yCoordinate : 0,
	 * 		width : 500,
	 * 		height : 200,
	 *      resizeMode : 1,
	 * 		useContent : true
	 * }
	 *
	 * });
	 */
	$.fn.sketchable.defaults = {
		// In interactive mode, it's possible to draw via mouse/pen/touch input.
		interactive : true,
		// lock interactive value
		// if true - keeps current 'interactive' value maintained during 'config' method call
		// if false - current value of 'interactive' can be changed via 'config' method call
		lockInteractive : false,
		// Indicate whether non-drawing strokes should be registered as well.
		// Notice that the last mouseUp stroke is never recorded, as the user has already finished drawing.
		mouseupMovements : false,
		// Indicate whether timestamps should be relative (start at time 0) or absolute (start at Unix epoch).
		relTimestamps : false,
		// Enable multitouch drawing.
		multitouch : true,
		// Display CSS cursors, mainly to indicate whether the element is interactive or not.
		cssCursors : true,
		// freeze all current configuration entries - config method can't change options
		// if false, it allows changing configuration options via 'config' method
		freezeConfig : false,
		// if drawMode = 'FreeHand', allows freehand drawing
		// if drawMode = 'StraightLines', only straight lines are drawn
		// if drawMode = 'Text', typing text is allowed
		// if drawMode = 'Rectangles', rectangles are drawn for each diagonal line
		// if drawMode = 'Circles', circles are drawn (within the square for the diagonal line)
		drawMode : 'FreeHand',
		// textFont = "30x Arial" - a string setting text font properties
		textFont : "30x Arial",
		textValue : "",
		// showBorder: canvas doesn't have a border by default, draw border if true
		showBorder : true,
		// canvasWidth and canvasHeight are set when resizing or extracting options
		canvasWidth : 0,
		canvasHeight : 0,
		// maxWidth and maxHeight are the maximum canvas size
		maxWidth : 800,
		maxHeight : 600,
		// allowResize - Should canvas be resized within maximum dimensions?
		allowResize : true,
		// Event callbacks.
		events : {
			// init: function(elem, data){ },
			// clear: function(elem, data){ },
			// destroy: function(elem, data){ },
			// mousedown: function(elem, data, evt){ },
			// mousemove: function(elem, data, evt){ },
			// mouseup: function(elem, data, evt){ },
		},
		graphics : {
			firstPointSize : 3,
			lineWidth : 3,
			strokeStyle : '#F0F',
			fillStyle : '#F0F',
			lineCap : "round",
			lineJoin : "round",
			miterLimit : 10
		},
		thinline : {
			graphics : {
				firstPointSize : 1,
				lineWidth : 1,
				strokeStyle : "gray",
				fillStyle : "gray",
				lineCap : "round",
				lineJoin : "round",
				miterLimit : 10
			}
		},
		grid : {
			enabled : false,
			showGrid : false,
			numHorizontal : 10,
			numVertical : 20
		},
		bgimage : {
			enabled : true,
			selected : false,
			localfile : "",
			serverfile : "",
			content_as_bg : "",
			xCoordinate : 0,
			yCoordinate : 0,
			// initial width and height of image, modified for each background image
			width : 500,
			height : 200,
			// What should be the resize behavior?
			// resizeMode : 1 - no resizing of background image, use image's dimensions
			// resizeMode : 2 - resize the image proportionately to fit in current canvas
			// resizeMode : 3 - resize the canvas to accommodate the image size
			// if the dimensions of image exceed maxWidth and maxHeight, shrink image
			resizeMode : 1,
			// if useContent is true, previously saved content is used as background
			// use this for read-only canvas - to transform or translate saved canvas
			// setting this true for editable canvas is ignored by 'config' method
			useContent : false
		}
	};

	/**
	 * @private
	 */
	function postProcess(elem, options) {
		if (!options)
			options = elem.data(_ns).options;
		if (options.cssCursors) {
			// Visually indicate whether this element is interactive or not.
			elem[0].style.cursor = options.interactive ? "pointer" : "not-allowed";
		};
	};

	/**
	 * @private
	 */
	function proportionalDimensions(width, height, maxWidth, maxHeight) {
		var widthRatio = 1,
		    heightRatio = 1,
		    effectiveRatio = 1;

		if (width > maxWidth && height > maxHeight) {
			var widthRatio = maxWidth / width;
			var heightRatio = maxHeight / height;
			effectiveRatio = widthRatio < heightRatio ? widthRatio : heightRatio;
		} else if (width > maxWidth) {
			effectiveRatio = maxWidth / width;
		} else if (height > maxHeight) {
			effectiveRatio = maxHeight / height;
		}
		;

		var newWidth = width * effectiveRatio;
		var newHeight = height * effectiveRatio;
		var retObj = {
			"width" : newWidth,
			"height" : newHeight
		};
		return retObj;
	};

	/**
	 * @private
	 */
	function resizeAndDrawBGImage(elem, data, imageSrc, x, y, bgImageWidth, bgImageHeight, callBackForImage) {
		var options = data.options;
		var xCoord,
		    yCoord,
		    canvasWidth,
		    canvasHeight;

		canvasWidth = options.canvasWidth;
		canvasHeight = options.canvasHeight;
		console.log('Image Dimensions: ' + bgImageWidth + 'x' + bgImageHeight);
		console.log('Canvas Dimensions: ' + canvasWidth + 'x' + canvasHeight);

		if (options.bgimage.resizeMode == 1) {
			options.bgimage.width = bgImageWidth;
			options.bgimage.height = bgImageHeight;
		} else if (options.bgimage.resizeMode == 2) {
			// Resize the image here
			// to fit it into canvas
			// maintain proportions to avoid skewing
			var retDim = proportionalDimensions(bgImageWidth, bgImageHeight, canvasWidth, canvasHeight);
			options.bgimage.width = retDim.width;
			options.bgimage.height = retDim.height;
		} else if (options.bgimage.resizeMode == 3) {
			// Resize the canvas to fit the image within maxWidth and maxHeight
			var newWidth = bgImageWidth < options.maxWidth ? bgImageWidth : options.maxWidth;
			var newHeight = bgImageHeight < options.maxHeight ? bgImageHeight : options.maxHeight;
			elem.sketchable('resizeCanvas', newWidth, newHeight);
			// Resize the image proportionately if necessary
			var retDim = proportionalDimensions(bgImageWidth, bgImageHeight, newWidth, newHeight);
			options.bgimage.width = retDim.width;
			options.bgimage.height = retDim.height;
		} else {
			// Resize both canvas and image to the max dimensions; maintain proportions for image
			elem.sketchable('resizeCanvas', options.maxWidth, options.maxHeight);
			// Resize the image here
			// to fit it into maximized canvas
			// maintain proportions to avoid skewing
			var retDim = proportionalDimensions(bgImageWidth, bgImageHeight, options.maxWidth, options.maxHeight);
			options.bgimage.width = retDim.width;
			options.bgimage.height = retDim.height;
		}
		;

		// if x-coordinate for top-left corner is specified
		if ( typeof x !== "undefined") {
			xCoord = x;
		} else {
			xCoord = options.bgimage.xCoordinate;
		};

		// if y-coordinate for top-left corner is specified
		if ( typeof y !== "undefined") {
			yCoord = y;
		} else {
			yCoord = options.bgimage.yCoordinate;
		};

		// Now draw the image at given coordinates
		if (data.sketch && imageSrc != "" && options.bgimage.enabled == true && options.bgimage.selected == true) {
			data.sketch.drawBGImage(imageSrc, xCoord, yCoord, options.bgimage.width, options.bgimage.height, callBackForImage);
		};

	};

	/**
	 * @private
	 * This function transforms sketchable.strokes into an array of array of (x,y) points
	 * sketchable.strokes has timestamp and isDrawing fields, which we don't need
	 */
	function drawStrokes(elem, data) {
		// Extract the (x,y) values from strokes by discarding timestamp and isDrawing fields
		// strokes is a variable filled with strokes data (either extracted from first canvas or retrieved from mtData object)
		var strokes = data.strokes;
		var strokesArr = transform(strokes);

		// Now each stroke is a an array of points with (x,y) coords, starting at mouseDown event and ending at mouseUp event. //
		for (var k = 0; k < strokesArr.length; ++k) {

			var _strokeOpts = strokesArr[k][0];
			elem.sketchable('config', _strokeOpts);
			var KthStroke = strokesArr[k][1];
			for (var m = 0; m < KthStroke.length; ++m) {
				// First point
				var pointM = KthStroke[m];
				var x1 = pointM[0];
				var y1 = pointM[1];

				var nextPoint = KthStroke[m];
				// Next point, assume this is last point
				if (m != KthStroke.length - 1) {// if it is not the last point ...
					// set next point to the (m+1)th point in strokeArr
					nextPoint = KthStroke[m + 1];
				}// if
				var x2 = nextPoint[0];
				var y2 = nextPoint[1];

				if (_strokeOpts.drawMode == 'FreeHand' || _strokeOpts.drawMode == 'StraightLines') {
					// Mark visually the 1st point of stroke.
					if (m == 0 && _strokeOpts.graphics.firstPointSize > 0) {
						data.sketch.fillColoredCircle(x1, y1, _strokeOpts.graphics.firstPointSize, _strokeOpts.graphics.strokeStyle);
					}// if
					// draw line from old point to new point which is a better way than drawPixel() method
					data.sketch.line(x1, y1, x2, y2);
					// Mark visually the last point of stroke.
					if (m == KthStroke.length - 1 && _strokeOpts.graphics.firstPointSize > 0) {
						data.sketch.fillColoredCircle(x2, y2, _strokeOpts.graphics.firstPointSize, _strokeOpts.graphics.strokeStyle);
					} // if
				} else if (_strokeOpts.drawMode == 'Circles') {
					data.sketch.strokeCircle(x1, y1, Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)));
				} else if (_strokeOpts.drawMode == 'Rectangles') {
					data.sketch.beginPath().strokeRect(x1, y1, x2 - x1, y2 - y1).stroke().closePath();
				} else if (_strokeOpts.drawMode == 'Text') {
					data.sketch.insertText(x1, y1, _strokeOpts.textFont, _strokeOpts.textValue, _strokeOpts.graphics.strokeStyle);
				}
				;

				// Display all the lines and paths set on this canvas context //
				data.sketch.stroke();

			}; // for KthStroke
		};// for StrokeArr

	};

	/**
	 * @private
	 * This function transforms sketchable.strokes into an array of array of (x,y) points
	 * sketchable.strokes has timestamp and isDrawing fields, which we don't need
	 */
	function transform(strokes) {
		var strokesArr = new Array();
		for (var i = 0; i < strokes.length; ++i) {
			var pointArr = new Array();
			// First element of a stroke is options //
			var _strokeOptions = strokes[i][0];
			// This is an array of points, representing a stroke after extracting only (x,y) values
			var ithStroke = strokes[i][1];
			for (var j = 0; j < ithStroke.length; ++j) {
				// Each stroke point has 4 items: x, y, timestamp, isDrawing.
				// we only need (x,y) values for rendering
				var pointJ = new Array();
				// an array of two values (x,y) - a point
				pointJ[0] = ithStroke[j][0];
				pointJ[1] = ithStroke[j][1];
				pointArr[j] = pointJ;
				// add this point to the points array
			};
			strokesArr[i] = [_strokeOptions, pointArr];
		};

		return strokesArr;
	};

	/**
	 * @private
	 */
	function getMousePos(e) {
		var elem = $(e.target),
		    pos = elem.offset();
		return {
			x : Math.round(e.pageX - pos.left),
			y : Math.round(e.pageY - pos.top)
		};
	};

	/**
	 * @private
	 */
	function saveMousePos(idx, data, pt) {
		// Ensure that coords is properly initialized.
		if (!data.coords[idx]) {
			data.coords[idx] = [];
		};

		var time = (new Date).getTime();
		if (data.options.relTimestamps) {
			// The first timestamp is relative to initialization time;
			// thus fix it so that it is relative to the timestamp of the first stroke.
			if (data.strokes.length === 0 && data.coords[idx].length === 0)
				data.timestamp = time;
			time -= data.timestamp;
		};

		data.coords[idx].push([pt.x, pt.y, time, +data.sketch.isDrawing]);
	};

	/**
	 * @private
	 */
	function deleteLastPoint(idx, data) {
		// Ensure that coords is properly initialized.
		if (!data.coords[idx]) {
			data.coords[idx] = [];
			return;
		};

		// If this is the only point in the stroke, don't delete it.
		if (data.coords[idx].length <= 1) {
			return;
		};

		data.coords[idx].pop();
	};

	/**
	 * @private
	 */
	function mousedownHandler(e) {
		if (e.originalEvent.touches)
			return false;
		downHandler(e);
	};

	/**
	 * @private
	 */
	function mousemoveHandler(e) {
		if (e.originalEvent.touches)
			return false;
		moveHandler(e);
	};

	/**
	 * @private
	 */
	function mouseupHandler(e) {
		if (e.originalEvent.touches)
			return false;
		upHandler(e);
	};

	function execTouchEvent(e, callback) {
		var elem = $(e.target),
		    data = elem.data(_ns),
		    options = data.options;
		var touches = e.originalEvent.changedTouches;
		if (options.multitouch) {
			for (var i = 0; i < touches.length; i++) {
				var touch = touches[i];
				// Add the type of event to the touch object.
				touch.type = e.type;
				callback(touch);
			}
		} else {
			var touch = touches[0];
			// Add the type of event to the touch object.
			touch.type = e.type;
			callback(touch);
		};
	};

	/**
	 * @private
	 */
	function touchdownHandler(e) {
		execTouchEvent(e, downHandler);
		e.preventDefault();
	};

	/**
	 * @private
	 */
	function touchmoveHandler(e) {
		execTouchEvent(e, moveHandler);
		e.preventDefault();
	};

	/**
	 * @private
	 */
	function touchupHandler(e) {
		execTouchEvent(e, upHandler);
		e.preventDefault();
	};

	/**
	 * @private
	 */
	function downHandler(e) {
		// Don't handle right clicks.
		if (e.which === 3)
			return false;

		var idx = e.identifier || 0,
		    elem = $(e.target),
		    data = elem.data(_ns),
		    options = data.options;
		// Exit early if interactivity is disabled.
		if (!options.interactive || options.drawMode == 'Text')
			return;

		data.sketch.isDrawing = true;
		var p = getMousePos(e);
		// Mark visually 1st point of stroke.
		if (options.graphics.firstPointSize > 0) {
			data.sketch.fillColoredCircle(p.x, p.y, options.graphics.firstPointSize, options.graphics.strokeStyle);
		};

		// Ensure that coords is properly initialized.
		if (!data.coords[idx]) {
			data.coords[idx] = [];
		};

		// Don't mix mouseup and mousedown in the same stroke.
		if (data.coords[idx].length > 0) {
			data.strokes.push([options, data.coords[idx]]);
			data.stack = [];
			data.coords[idx] = [];
		};
		saveMousePos(idx, data, p);

		if ( typeof options.events.mousedown === 'function') {
			options.events.mousedown(elem, data, e);
		};
	};

	/**
	 * @private
	 */
	function moveHandler(e) {
		var idx = e.identifier || 0,
		    elem = $(e.target),
		    data = elem.data(_ns),
		    options = data.options;
		// Exit early if interactivity is disabled.
		// if drawMode is Text, nothing to do on mouseMove
		if (!options.interactive || options.drawMode == 'Text')
			return;

		//if (!options.mouseupMovements && !data.sketch.isDrawing) return;
		// This would grab all penup strokes AFTER drawing something on the canvas for the first time.
		if ((!options.mouseupMovements || data.strokes.length === 0 || data.coords[idx].length == 0) && !data.sketch.isDrawing)
			return;

		var p = getMousePos(e);

		if (p.x <= 1 || p.x >= options.canvasWidth-1 || p.y <= 1 || p.y >= options.canvasHeight-1) {
			console.log('You are outside');
			upHandler(e);
			return;
		}

		if (data.sketch.isDrawing) {
			var firstPoint = data.coords[idx][0];
			var lastPoint = data.coords[idx][data.coords[idx].length - 1];

			if (options.drawMode == 'StraightLines' && data.coords[idx].length == 2) {
				// set eraser
				data.sketch.eraser(options.lineWidth);
				data.sketch.beginPath().line(firstPoint[0], firstPoint[1], lastPoint[0], lastPoint[1]).stroke().closePath();
				deleteLastPoint(idx, data);
				// set pencil
				data.sketch.pencil(options.lineWidth);
				data.sketch.beginPath().line(firstPoint[0], firstPoint[1], p.x, p.y).stroke().closePath();
				// Mark visually 1st and last points of the line.
				if (options.graphics.firstPointSize > 0) {
					data.sketch.fillColoredCircle(firstPoint[0], firstPoint[1], options.graphics.firstPointSize, options.graphics.strokeStyle).stroke();
					data.sketch.fillColoredCircle(p.x, p.y, options.graphics.firstPointSize, options.graphics.strokeStyle).stroke();
				};
			} else if (options.drawMode == 'Circles' && data.coords[idx].length == 2) {
				// set eraser
				var oldRadius = Math.sqrt(Math.pow((firstPoint[0] - lastPoint[0]), 2) + Math.pow((firstPoint[1] - lastPoint[1]), 2));
				data.sketch.eraser(options.lineWidth);
				// erase old thin line
				data.sketch.beginPath().thinLine(firstPoint[0], firstPoint[1], lastPoint[0], lastPoint[1], options.thinline.graphics).stroke().closePath();
				// erase old circle
				data.sketch.beginPath().strokeCircle(firstPoint[0], firstPoint[1], oldRadius).stroke().closePath();
				deleteLastPoint(idx, data);
				// set pencil
				var newRadius = Math.sqrt(Math.pow((firstPoint[0] - p.x), 2) + Math.pow((firstPoint[1] - p.y), 2));
				data.sketch.pencil(options.lineWidth);
				// draw new thin line
				data.sketch.beginPath().thinLine(firstPoint[0], firstPoint[1], p.x, p.y, options.thinline.graphics).stroke().closePath();
				// draw new circle
				data.sketch.beginPath().strokeCircle(firstPoint[0], firstPoint[1], newRadius).stroke().closePath();
			} else if (options.drawMode == 'Rectangles' && data.coords[idx].length == 2) {
				// set eraser
				data.sketch.eraser(options.lineWidth);
				// erase old thin line
				data.sketch.beginPath().thinLine(firstPoint[0], firstPoint[1], lastPoint[0], lastPoint[1], options.thinline.graphics).stroke().closePath();
				// erase old rectangle
				//data.sketch.beginPath().line(firstPoint[0], firstPoint[1], lastPoint[0], lastPoint[1]).stroke().closePath();
				var oldwidth = lastPoint[0] - firstPoint[0],
				    oldheight = lastPoint[1] - firstPoint[1];
				data.sketch.beginPath().strokeRect(firstPoint[0], firstPoint[1], oldwidth, oldheight).stroke().closePath();
				// if it was a square, erase 2nd diagonal
				if (Math.abs(oldwidth) == Math.abs(oldheight)) {
					data.sketch.beginPath().thinLine(firstPoint[0], lastPoint[1], lastPoint[0], firstPoint[1], options.thinline.graphics).stroke().closePath();
				};
				deleteLastPoint(idx, data);
				// set pencil
				data.sketch.pencil(options.lineWidth);
				// draw a thin line
				data.sketch.beginPath().thinLine(firstPoint[0], firstPoint[1], p.x, p.y, options.thinline.graphics).stroke().closePath();
				var newwidth = p.x - firstPoint[0],
				    newheight = p.y - firstPoint[1];
				data.sketch.beginPath().strokeRect(firstPoint[0], firstPoint[1], newwidth, newheight).stroke().closePath();
				// if it is a square, draw 2nd diagonal as well
				if (Math.abs(newwidth) == Math.abs(newheight)) {
					data.sketch.beginPath().thinLine(firstPoint[0], p.y, p.x, firstPoint[1], options.thinline.graphics).stroke().closePath();
				}
			} else {
				data.sketch.beginPath().line(lastPoint[0], lastPoint[1], p.x, p.y).stroke().closePath();
			}
			;
		};

		saveMousePos(idx, data, p);

		if ( typeof options.events.mousemove === 'function') {
			options.events.mousemove(elem, data, e);
		};
	};

	/**
	 * @private
	 */
	function upHandler(e) {
		var idx = e.identifier || 0,
		    elem = $(e.target),
		    data = elem.data(_ns),
		    options = data.options;
		// Exit early if interactivity is disabled.
		if (!options.interactive)
			return;

		var p = getMousePos(e);
		if (options.drawMode == 'Text') {
			saveMousePos(idx, data, p);
		};

		data.sketch.isDrawing = false;
		data.strokes.push([options, data.coords[idx]]);
		data.stack = [];
		data.coords[idx] = [];

		elem.sketchable('redraw');

		if ( typeof options.events.mouseup === 'function') {
			options.events.mouseup(elem, data, e);
		};
	};

})(jQuery);
