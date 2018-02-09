//Set brush size
var BRUSH_SIZE = 20;
var _canvasOptions = {
    interactive : true,
    graphics : {
        firstPointSize : 1,
        lineWidth : 2,
        strokeStyle : "green"
    }
};
//session user id
var sessionGroupID = "nysmith";
var sessionStudentID = "NysmithUser055";
var sessionUserType = "STUDENT";
//
var canvasData = {};
var CanvasApp = {

    initJSketchCanvas : function(input){
        // Handle the click on colors
        $('.color-select').each(function(e) {
            var self = $(this);
            var color = self.attr("color");
            self.click(function(){
                var id = self.closest('div .canvas-div').attr('id');
                var canvas = self.closest('div .canvas-div').attr('canvas-id');
                var _canvas = canvasData[canvas];
                console.log(_canvas);
                CanvasApp.setCanvasColor(color, _canvas);
            });
        });
        // Handle the click on Drawings
        $('.draw-select').each(function(e) {
            var self = $(this);
            var drawSet = self.attr("draw-set");
            self.click(function(){
                var id = self.closest('div .canvas-div').attr('id');
                var canvas = self.closest('div .canvas-div').attr('canvas-id');
                var _canvas = canvasData[canvas];
                CanvasApp.setDrawMode(drawSet, _canvas, self);
            });
        });

        // Clear the canvas
        $('.clear-canvas').each(function(e) {
            var self = $(this);
            self.click(function(){
                var id = self.closest('div .canvas-div').attr('id');
                var canvas = self.closest('div .canvas-div').attr('canvas-id');
                var _canvas = canvasData[canvas];
                CanvasApp.clearCanvas(_canvas);
            });
        });
        // Undo the canvas
        $('.undo-canvas').each(function(e) {
            var self = $(this);
            self.click(function(){
                var id = self.closest('div .canvas-div').attr('id');
                var canvas = self.closest('div .canvas-div').attr('canvas-id');
                var _canvas = canvasData[canvas];
                console.log(_canvas);
                _canvas.sketchable('undo');
            });
        });

        // Redo the canvas
        $('.redo-canvas').each(function(e) {
            var self = $(this);
            self.click(function(){
                var id = self.closest('div .canvas-div').attr('id');
                var canvas = self.closest('div .canvas-div').attr('canvas-id');
                var _canvas = canvasData[canvas];
                _canvas.sketchable('redo');
            });
        });
        // Single line mode the canvas
        $('.single-line-mode-canvas').each(function(e) {
            var self = $(this);
            self.change(function(){
                var id = self.closest('div .canvas-div').attr('id');
                var canvas = self.closest('div .canvas-div').attr('canvas-id');
                var _canvas = canvasData[canvas];
                var checkedVal = $(this).is(":checked");
                if (checkedVal) {
                    var _opts = {
                        canvasWidth : 800,
                        canvasHeight : 100,
                    };

                    _canvas.sketchable('config', _opts).sketchable('resize', _opts.canvasWidth, _opts.canvasHeight).sketchable('clear');
                } else {
                    var _opts = {
                        canvasWidth : 500,
                        canvasHeight : 200,
                    };

                    _canvas.sketchable('config', _opts).sketchable('resize', _opts.canvasWidth, _opts.canvasHeight).sketchable('clear');
                }
                _canvas.sketchable('redraw');
            });
        });
        // Resize mode the canvas
        $('.auto-size-canvas').each(function(e) {
            var self = $(this);
            self.change(function(){
                var id = self.closest('div .canvas-div').attr('id');
                var canvas = self.closest('div .canvas-div').attr('canvas-id');
                var _canvas = canvasData[canvas];

                var checkedVal = $(this).is(":checked");
                if (checkedVal) {
                    var _opts = {
                        bgimage : {
                            resizeMode : 3
                        }
                    };

                    _canvas.sketchable('config', _opts).sketchable('resize');
                } else {
                    var _opts = {
                        bgimage : {
                            resizeMode : 1
                        }
                    };

                    _canvas.sketchable('config', _opts).sketchable('resize');
                }
                _canvas.sketchable('redraw');
            });
        });

        //Grid Options
        $('.grid-box').each(function(e) {
            var self = $(this);
            self.change(function(){
                var id = self.closest('div .canvas-div').attr('id');
                var canvas = self.closest('div .canvas-div').attr('canvas-id');
                var _canvas = canvasData[canvas];
                var _opts = {
                    grid : {
                        showGrid : false,
                        horizontal : 10,
                        vertical : 20
                    }
                };
                var checkedVal = $(this).is(":checked");
                if (checkedVal) {
                    _opts.grid.showGrid = true;
                    _canvas.sketchable('config', _opts);
                    _canvas.sketchable('showGrid', _opts.grid.horizontal, _opts.grid.vertical);
                } else {
                    _opts.grid.showGrid = false;
                    _canvas.sketchable('config', _opts);
                    _canvas.sketchable('erase');
                    _canvas.sketchable('hideGrid', _opts.grid.horizontal, _opts.grid.vertical);
                    _canvas.sketchable('redraw');
                }
            });
        });
        //Canvas picture Image Submit
        $('.img-upload').each(function(e) {
            var self = $(this);
            var imageInfoId = $(self).attr("data-image-info");
            var responseTextId = $(self).attr("data-response-text");
            var checkResultId = $(self).attr("data-check-result");
            self.submit(function(e){
                var data = self.serialize();
                var array = self.serializeArray();
                var jsonObj = {};
                jQuery.map( array, function( n, i ) {
                    jsonObj[n.name] = n.value;
                });
                console.log(jsonObj);
                var id = self.closest('div .canvas-div').attr('id');
                var canvas = self.closest('div .canvas-div').attr('canvas-id');
                var _canvas = canvasData[canvas];

                var btnAction = jsonObj.whattodo;

                if (btnAction === 'remove_image') {
                    var bgOpts = {
                        bgimage : {
                            localfile : "",
                            serverfile : "",
                            content_as_bg : ""
                        }
                    };
                    _canvas.sketchable('config', bgOpts);
                    _canvas.sketchable('redraw');
                    return;
                }

                var file_select = document.getElementById(jsonObj.file_id);
                var fileName = '';

                if ('files' in file_select) {
                    if (file_select.files.length == 0) {
                        alert('Browse and select a file');
                    } else {
                        var file = file_select.files[0];
                        if ('name' in file) {
                            fileName = file.name;
                            console.log('FileName:' + fileName);
                        };
                        if ('size' in file) {
                            console.log('FileSize:' + file.size);
                        };
                        if (file.type.match('image.*')) {
                            console.log('ImageType:' + file.type);
                        };
                        // The following code is to draw the image as background
                        // This uses e.target.result (as the local file) in the onload()
                        // uses FileReader and readAsDataURL() to achieve this
                        var reader = new FileReader();

                        // Do not expect onload() will be called at a predictable point
                        reader.onload = function(ole) {
                            // reader.addEventListener("load", function(e) {
                            var image = new Image();
                            image.crossOrigin = "Anonymous";
                            image.alt = 'Your browser does not support image display';

                            image.addEventListener("load", function() {
                                var imageInfo = fileName + ' ' + image.width + '×' + image.height + ' ' + file.type + ' ' + Math.round(file.size / 1024) + 'KB';
                                var elImageInfo = $(imageInfoId);
                                elImageInfo.innerHTML = imageInfo;
                                console.log(imageInfo);

                                var session_uid = sessionStudentID;
                                var session_gid = sessionGroupID;
                                var session_user_type = sessionUserType;

                                // Prepare FormData object to submit in Ajax calls
                                // this part calls saveImage() to save file on the server
                                // the filename on the server and OCR text are returned (by callocrmath)
                                var formData = new FormData();
                                formData.append('photo', file, fileName);
                                formData.append('action', btnAction);
                                formData.append('SESSION_UID', session_uid);
                                formData.append('SESSION_GID', session_gid);
                                formData.append('SESSION_UTP', session_user_type);
                                if (btnAction === "as_image" || btnAction === "as_ocr_normal") {
                                    CanvasApp.saveImage(formData, $(responseTextId));
                                }

                                var bgOpts = {
                                    bgimage : {
                                        width : image.width,
                                        height : image.height,
                                        localfile : image.src,
                                        selected : true,
                                        enabled : true
                                    }
                                };
                                _canvas.sketchable('config', bgOpts);
                                _canvas.sketchable('redraw');
                            });

                            image.src = ole.target.result;
                            // make sure the load event fires for cached images too
                            if (image.complete || image.complete === undefined) {
                                image.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                                image.src = ole.target.result;
                            };

                        };
                        reader.result = null;
                        reader.readAsDataURL(file);
                    };
                };
            });
        });

        // Adding Drawing only
        $('.add-strokes').each(function(e) {
            var self = $(this);
            var problemSheet = $(self).attr("data-problem-sheet");
            self.click(function(){
                var id = self.closest('div .canvas-div').attr('id');
                var canvas = self.closest('div .canvas-div').attr('canvas-id');
                var _canvas = canvasData[canvas];

                var canvasOpts = _canvas.sketchable('getOptions');
                var problem_sheet = $(problemSheet);
                var line_break = $("<br/>");
                var canvasAsImage = new Image();
                canvasAsImage.onload = function(e) {
                    var cabWidth = e.target.width;
                    var newWidth = cabWidth * 0.25;
                    e.target.width = newWidth;
                    problem_sheet.append(canvasAsImage);
                    problem_sheet.append(line_break);
                };
                canvasAsImage.src = canvasOpts.bgimage.content_as_bg;
            });
        });

        // Adding Canvas only
        $('.add-canvas').each(function(e) {
            var self = $(this);
            var problemSheet = $(self).attr("data-problem-sheet");
            self.click(function(){
                var id = self.closest('div .canvas-div').attr('id');
                var canvas = self.closest('div .canvas-div').attr('canvas-id');
                var _canvas = canvasData[canvas];

                _canvas.sketchable('redraw', function(src, x, y, srcWidth, srcHeight, content_as_bg){
                    var problem_sheet = $(problemSheet);
                    var line_break = $("<br/>");
                    var canvasAsImage = new Image();
                    canvasAsImage.onload = function(e) {
                        var cabWidth = e.target.width;
                        var newWidth = cabWidth * 0.25;
                        e.target.width = newWidth;
                        problem_sheet.append(canvasAsImage);
                        problem_sheet.append(line_break);

                        var bgOpts = {
                            bgimage : {
                                content_as_bg : canvasAsImage.src
                            }
                        };
                        _canvas.sketchable('config', bgOpts);
                    };
                    canvasAsImage.src = content_as_bg;
                });
            });
        });



        var selector = $(".drawing-canvas");
        selector.each(function(){
            var self = $(this);
            // This first canvas - make it a sketchable object with default options
            $main_canvas = self.sketchable(_canvasOptions)
            canvasData[self.attr("id")] = self;
        });
    },



    // This function sets the effective color for the canvas
    setCanvasColor : function (colorName, $main_canvas) {
        var _colorOpt = {
            graphics : {
                strokeStyle : colorName
            }
        };
        $main_canvas.sketchable('config', _colorOpt);
    },



	setDrawMode : function (modeName, $main_canvas, input) {
		var labelText = "";
		// if modeName is not one of the acceptable values, set it to 'FreeHand'
		if (!(modeName == 'FreeHand' || modeName == 'StraightLines' || modeName == 'Rectangles' || modeName == 'Circles' || modeName == 'Text')) {
			modeName = 'FreeHand';
		}
		if (modeName == 'Text') {
			labelText = $("#"+input.attr("input-text-id")).val();
		}
//		else {
//			document.getElementById("labelText").value = "";
//		}

		var _opts = {
			drawMode : modeName,
			textValue : labelText
		};
		$main_canvas.sketchable('config', _opts);
	},


    clearCanvas : function($canvas){
		if($canvas != undefined){
		    $($canvas).sketchable('clear');
		}
		else{
		    $main_canvas.sketchable('clear');
		}
    },

    getJSketchCanvasElement : function(input, _canvasOptions){
        return input.sketchable(_canvasOptions);
    },

    // Save the 'img_update' form data to
    // the server; include all the form
    // data in 'formData' (FormData) object
    saveImage : function (formData, $responseText) {
        var $response = '';
        $responseText.empty();
        var xhr = new XMLHttpRequest();
        // callocrmath saves the file and returns the name of the file
        // which can be used to reload at a different time
        xhr.open('POST', 'https://omtutor.com/cgi-bin/callocrmath', true);
        // Do not expect onload() will be called predictably
        xhr.onload = function() {
            if (xhr.status == 200) {
                $response = xhr.responseText;
                $responseText.text($response);
            } else {
                $response = 'ERROR';
            }
        };

        // Send the form data, this triggers onload() event
        // but onload handler is called asynchronously
        xhr.send(formData);

    },
}