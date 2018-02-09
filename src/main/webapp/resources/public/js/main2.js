$(function() {

	// This function prints objects by recursively traversing each element
	// Use it if need to see/debug javascript objects
	function DumpObjectIndented(obj, indent) {
		var result = "";
		if (indent == null)
			indent = "";

		for (var property in obj) {
			var value = obj[property];
			if ( typeof value == 'string')
				value = "'" + value + "'";
			else if ( typeof value == 'object') {
				if ( value instanceof Array) {
					// Just let JS convert the Array to a string!
					value = "[ " + value + " ]";
				} else {
					// Recursive dump
					// (replace "  " by "\t" or something else if you prefer)
					var od = DumpObjectIndented(value, indent + "<br>");
					// If you like { on the same line as the key }
					//value = "{\n" + od + "\n" + indent + "}";
					// If you prefer { and } to be aligned
					value = "\n" + indent + "{\n" + od + "\n" + indent + "}";
				}
			}
			result += indent + "'" + property + "' : " + value + ",\n";
		}
		return result.replace(/,\n$/, "");
	};

	// Set brush size
	var BRUSH_SIZE = 20;

	// Set default canvas options
	var _canvasOptions = {
		interactive : true,
		graphics : {
			firstPointSize : 1,
			lineWidth : BRUSH_SIZE / 5,
			strokeStyle : "green"
		}
	};

	// This first canvas - make it a sketchable object with default options
	var $canvas = $('#drawing-canvas').sketchable(_canvasOptions);

	// Make newCanvas non-editable
	var _opt1 = {
		interactive : true
	};
	// This is second canvas - make it a sketchable object with default options
	var $newCanvas = $('#drawing-canvas-2').sketchable(_canvasOptions).sketchable('config', _opt1);

	function clearStrokes($canvas1, $canvas2) {
		$canvas1.sketchable('clear');
		$canvas2.sketchable('clear');
		$('.result').empty();
	};

	// This how you define the value of a pixel: //
	// Each pixel has 4 components - //
	// 0 - Red //
	// 1 - Green //
	// 2 - blue //
	// 3 - alpha value : 0 means transparent & 255 means opaque //
	function drawPixel(canvasData, canvasHeight, canvasWidth, x, y, r, g, b, a) {
		var index = (x + y * canvasWidth) * 4;

		canvasData.data[index + 0] = r;
		canvasData.data[index + 1] = g;
		canvasData.data[index + 2] = b;
		canvasData.data[index + 3] = a;
	}

	// This is how you update the canvas, so that your //
	// modification are taken in consideration //
	// Call this function after the image data buffer is filled //
	// with pixel (r,g,b,a) values //
	function updateCanvas(ctx, canvasData) {
		ctx.putImageData(canvasData, 0, 0);
	}

	// Draw the strokes in 2nd canvas //
	function drawCanvas(strokes, $canvas2) {

		// Set the strokes data for the canvas
		// This strokes data is retrieved from server-side
		$canvas2.sketchable('strokes', strokes);

		// Just to make sure, extract strokes from 2nd Canvas
		// and inspect - Not needed after testing
		var strokes2 = $canvas2.sketchable('strokes');
		alert('strokes2: ' + strokes2 + "\n");

		// Now canvas has all the strokes and configuration needed for drawing
		// Call jquery.sketchable plugin extension method 'redraw'
		$canvas2.sketchable('redraw');

		// Make newCanvas non-editable again - strokes drawing could have changed its non-editable status
		var _opt2 = {
			interactive : false
		};
		$canvas2.sketchable('config', _opt2);

	}

	function submitStrokes() {
		var $latex = $('#eq-latex');
		var strokes = $canvas.sketchable('strokes');
		$canvas2.sketchable('strokes', strokes);
		var brush = new jSketch(canvas2).stroke();
		var strokesStr = JSON.stringify(strokes);

		$.ajax({
			type : "POST",
			url : "http://localhost:9080/cgi-bin/ajax3.pl",
			data : {
				'strokes' : strokesStr
			},
			dataType : 'json',
			crossDomain : true,
			beforeSend : function(xhr) {
				$latex.empty();
			},
			error : function(jqXHR, textStatus, errorThrown) {
				$latex.html('<h2>' + textStatus + '</h2><p>' + errorThrown + '</p>');
				alert('FAILED: Either it is taking too long or engine failed to recognize.');
			},
			success : function(data, textStatus, jqXHR) {
				alert('Success 1');
				if (!data) {
					$latex.html('<h2>Server not available.</h2><p>Please try again later. We apologize for the inconvenience.</p>');
					return false;
				}
				alert('DATA:' + data);
				$latex.html(data);
				alert('Success 2');
			}
		});
		alert("After Ajax call...");
	};

	// This function sets the effective color for the canvas
	function setCanvasColor(colorName) {
		var _colorOpt = {
			graphics : {
				strokeStyle : colorName
			}
		};
		$canvas.sketchable('config', _colorOpt);
	}

	// Handle the click on Red color
	$('a#Red').on("click", function(e) {
		e.preventDefault();
		setCanvasColor("red");
	});

	// Handle the click on Green color
	$('a#Green').on("click", function(e) {
		e.preventDefault();
		setCanvasColor("green");
	});

	// Handle the click on Blue color
	$('a#Blue').on("click", function(e) {
		e.preventDefault();
		setCanvasColor("blue");
	});

	// Handle the click on Black color
	$('a#Black').on("click", function(e) {
		e.preventDefault();
		setCanvasColor("black");
	});

	// Clear the canvas
	$('a#clear').on("click", function(e) {
		e.preventDefault();
		clearStrokes($canvas, $newCanvas);
	});

	// After drawing is finished, retriev the strokes
	// Add the strokes to the MTData object
	// Here we save it into 'strokes' global variable
	// and call the drawCanvas() method
	// which draws the strokes data on the 2nd canvas
	$('a#send').on("click", function(e) {
		e.preventDefault();
		// This variable holds strokes extracted from first canvas (or retrieved from MTData)
		var strokes = $canvas.sketchable('strokes');
        console.log(strokes);
		drawCanvas(strokes, $newCanvas);
	});

	$('a#undo').on("click", function(e) {
		e.preventDefault();
		$canvas.sketchable('undo');
	});

	$('a#redo').on("click", function(e) {
		e.preventDefault();
		$canvas.sketchable('redo');
	});

});
