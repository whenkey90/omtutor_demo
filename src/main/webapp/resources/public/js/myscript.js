var schema = {
     "$schema": "http://json-schema.org/draft-04/schema#",
     "title": "Equation",
     "description": "JSON Schema for Equation Class",
     "type": "object",
     "properties": {
         "__CLASS__": {
             "description": "CLASS name, defaults to Equation, unless sub-classed",
             "type": "string"
         },
         "lhs": {
             "description": "left hand side of the equation",
             "type": "object",
             "properties": {
                "__CLASS__": {
                    "description": "CLASS name, defaults to Expression, unless sub-classed",
                    "type": "string"
                },
                "ascii_expr": {
                    "description": "ASCII formatted expression",
                    "type": "string"
                },
                "latex_expr": {
                    "description": "LaTex formatted expression",
                    "type": "string"
                },
                "mathml_expr": {
                    "description": "MathML formatted expression",
                    "type": "string"
                },
                "numTerms": {
                    "description": "Number of terms in the Expression",
                    "type": "integer",
                    "minimum": 0
                },
                "exprDegree": {
                    "description": "Degree of the Expression",
                    "type": "integer",
                    "minimum": 0
                }
             }
         },
         "rhs": {
             "description": "right hand side of the equation",
             "type": "object",
             "properties": {
                "__CLASS__": {
                    "description": "CLASS name, defaults to Expression, unless sub-classed",
                    "type": "string"
                },
                "ascii_expr": {
                    "description": "ASCII formatted expression",
                    "type": "string"
                },
                "latex_expr": {
                    "description": "LaTex formatted expression",
                    "type": "string"
                },
                "mathml_expr": {
                    "description": "MathML formatted expression",
                    "type": "string"
                },
                "numTerms": {
                    "description": "Number of terms in the Expression",
                    "type": "integer",
                    "minimum": 0
                },
                "exprDegree": {
                    "description": "Degree of the Expression",
                    "type": "integer",
                    "minimum": 0
                }
             }
         },
         "relation": {
             "type": "string"
         },
         "_validity": {
             "type": "string"
         }
     },
 }



//TODO keep all the keys and values of the expression of mathjax
var charObj = {
    "a2b2": '<mrow><msup><mi>a</mi><mn>2</mn></msup><mo>+</mo><msup><mi>b</mi><mn>2</mn></msup><mo>=</mo><msup><mi>c</mi><mn>2</mn></msup></mrow>',
    "a2b3": '<mrow><mi>A</mi><mo>=</mo><mfenced open="[" close="]"><mtable><mtr><mtd><mi>x</mi></mtd><mtd><mi>y</mi></mtd></mtr><mtr><mtd><mi>z</mi></mtd><mtd><mi>w</mi></mtd></mtr></mtable></mfenced></mrow>',
    "a2b4": '<msqrt><mn>64</mn></msqrt>',
    "area": '<mi>A</mi><mo>=</mo><mfrac><mrow><mi>h</mi><mo>*</mo><mi>b</mi></mrow><mn>2</mn></mfrac>',
    "rectarea": '<mi>A</mi><mo>=</mo><mi>l</mi><mo>&#xD7;</mo><mi>b</mi>',
    "open": '<mo>(</mo>',
    "close": '<mo>)</mo>',
    "w": '<mi contentEditable="true">W</mo>',
    "x": '<mi contentEditable="true">X</mo>',
    "y": '<mi contentEditable="true">Y</mo>',
    "z": '<mi contentEditable="true">Z</mo>',
    };
//TODO relation-keys
var relationKeys = {
    'eq' : '=',
    'lt' : '<',
    'gt' : '>',
    'lte' : '<=',
    'gte' : '>=',
    'ne' : '#',
}
//TODO maintain latexcode of keys
var keys = {
	'sqrt' : '\sqrt',
	'plusminus' : '\pm',
	'minusplus' : '\mp',
	'frac' : '/',
	'power' : '^',
	'cdot' : '\cdot',
	'lt' : '\lt',
	'gt' : '\gt',
	'le' : '\le',
	'ge' : '\ge',
	'space' : '\qquad',
	'backspace' : 'Backspace',
	'[' : '[',
	']' : ']',
	'(' : '(',
	')' : ')',
	'{' : '{',
	'}' : '}',
	'alpha' : '\alpha',
	'delta' : '\delta',
	'gamma' : '\gamma',
	'epsilon': '\epsilon',
	'not-equal' : '\neq',
    'star' : '\star',
    'pi' : '\pi',
    'mid' : '\mid',
    'div' : '\div',
    'comma' : ',',
    '+' : '+',
    '*' : '*',
    '=' : '=',
    '-' : '-',
	'9' : '9',
	'8' : '8',
	'7' : '7',
	'6' : '6',
	'5' : '5',
	'4' : '4',
	'3' : '3',
	'2' : '2',
	'1' : '1',
	'0' : '0',

};
var canX = new Array();
var canY = new Array();
var canDrag = new Array();

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;
var canvasWidth = "500";
var canvasHeight = "200";
var context;
var contentArray = [];

var count=0;
var currPos=0;
var curentpos=0;
var isAdd=true,pos=0,type="";
var lineCounter = 0;
var lineArray = new Array(50);
$(function() {
        // Cross-browsser function to get text selected (there is only one selection at a time in each window)
        function getSelection() {
            return (!!document.getSelection) ? document.getSelection() : (!!window.getSelection) ? window.getSelection() : document.selection.createRange().text;
        }
				$('a#pm').on("click", function(e) {
					e.preventDefault();
					//alert('Enter PM...');
					var mathFieldSpan = document.getElementById('math-field1');
					var editMathField = MQ.MathField(mathFieldSpan);
					editMathField.focus();
					editMathField.cmd('\\pm');
					//alert('Exit PM...');
					return false;
				});

				$('a#sqrt').on("click", function(e) {
					e.preventDefault();
					//alert('Enter SQRT...');
					var mathFieldSpan = document.getElementById('math-field1');
					var editMathField = MQ.MathField(mathFieldSpan);
					editMathField.focus();
					editMathField.cmd('\\sqrt');
					//alert('Exit SQRT...');
					return false;
				});

				$('a#square').on("click", function(e) {
					e.preventDefault();
					//alert('Enter SQUARE...');
					var mathFieldSpan = document.getElementById('math-field1');
					var editMathField = MQ.MathField(mathFieldSpan);
					editMathField.focus();
					editMathField.write('^{2}');
					//alert('Exit SQUARE...');
					return false;
				});

				$('a#power').on("click", function(e) {
					e.preventDefault();
					//alert('Enter POWER...');
					var mathFieldSpan = document.getElementById('math-field1');
					var editMathField = MQ.MathField(mathFieldSpan);
					editMathField.focus();
					editMathField.write('^{}');
					editMathField.keystroke('Left');
					//alert('Exit POWER...');
					return false;
				});

				$('a#denom').on("click", function(e) {
					e.preventDefault();
					//alert('Enter Add Denominator...');
					var mathFieldSpan = document.getElementById('math-field1');
					var editMathField = MQ.MathField(mathFieldSpan);
					alert('Selection:[' + getSelection() + ']');
					// not working
					editMathField.focus();
					editMathField.cmd('/');
					editMathField.focus();
					//alert('Exit Add Denominator...');
					return false;
				});
})
var MQ = MathQuill.getInterface(2);
var mathFieldSpan = document.getElementById('math-field1');
var latexSpan = document.getElementById('latex1');
var resultMathML = document.getElementById('result-mathml');
var mathField;
//TODO maintain type(question,solution)
function equObj(type) {
    count = 0;
    this._mtDataLines = [];
    this.dataType=type;
    this.__CLASS__="MTData"
}
//TODO maintain text value in textobj
function textObj() {
    this.lineValue="";
    this.lineType="TEXT";
    this.__CLASS__="MTDataLine"
}
//TODO maintain linevalue of formula
function lineValue () {
    this.relation="eq";
    this.rhs = new rhs();
    this.lhs = new lhs();
    this.__CLASS__="Equation";
    this._validity="unknown"
};
//TODO maintain rhs value of formula
function rhs() {
    this.numTerms=0;
    this.mathml_expr="";
    this.exprDegree=0;
    this.__CLASS__="Expression";
    this.ascii_expr="";
    this.latex_expr=""
};
//TODO maintain lhs value of formula
function lhs(){
    this.numTerms=0;
    this.mathml_expr="";
    this.__CLASS__="Expression";
    this.exprDegree=0;
    this.ascii_expr="";
    this.latex_expr=""
};

//TODO Maintain linetype(text,formula,shape)
function formulaObj() {
    this.lineValue=new lineValue();
    this.lineType="EQUATION";
    this.__CLASS__="MTDataLine"
}
//shape object
function shapeObj() {
    this.lineValue="";
    this.lineType="SHAPE";
    this.__CLASS__="MTDataLine"
}
//TODO latex,mathml,ascii format
function exprObj(latex,mathml,ascii){
    this.latex_expr=latex
    this.mathml_expr=mathml;
    this.ascii_expr=ascii;
};
var question = new equObj("PROBLEM");
var $main_canvas;
//TODO manitain all functions in one object for reusing
var App = {
    init: function() {
//        $("#include-html").load("basic.html");
        App.initEvents();
        App.initMath();
        App.manageKeys();
        App.manageDeleteEquation();
        App.manageMathOptions();
		App.initCanvas();
		App.initJSketchCanvas();
		App.SubmitProblem();
		App.pageLoad();
		App.getProblemData();
		App.getSolutionData();
		App.submitSolution();
		App.initAjaxGET();
		App.initAjaxOnLoad();
		App.initAjaxClick();
    },
//TODO maintain mathmlcode
	initMath : function(){
	    mathField = MQ.MathField(mathFieldSpan, {
		  spaceBehavesLikeTab: true, // configurable
		  handlers: {
		    spaceBehavesLikeTab : false,
			edit: function() { // useful event handlers
			  latexSpan.textContent = mathField.latex(); // simple API
              resultMathML.textContent = TeXZilla.toMathMLString(mathField.latex());
			}
		  }
		});
	},
	//TODO In html maintain the  keys object key as same and value with latex code
    manageKeys: function() {
        var selector = $(".btn");
        selector.each(function() {
            var self = $(this);
            self.on("mousedown",function(e) {
                var $element = $("#math-field1");
                //TODO In html maintain the data-char and keys object key as same and value with latex code
                var data = keys[self.attr("data-char")];
				var mathField = MQ.MathField($element[0]);
				if(data === 'Backspace'){
					mathField.keystroke("Backspace");
					return;
				}
				//var $staticElement=$("#static-math");
				//var staticMathField= MQ.MathField($staticElement[0]);
                //$(staticMathField).attr("readonly",true);
				mathField.cmd(data);
				//staticMathField.cmd(data);
				mathField.focus();
				e.preventDefault();
			});
        });

        $("#submit-btn").click(function() {
           alert("Expression : " + $("#main-text").html());
        });
    },

	insertAtCaret : function (areaId, text) {
		var txtarea = document.getElementById(areaId);
		if (!txtarea) { return; }

		var scrollPos = txtarea.scrollTop;
		var strPos = 0;
		var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
			"ff" : (document.selection ? "ie" : false ) );
		if (br == "ie") {
			txtarea.focus();
			var range = document.selection.createRange();
			range.moveStart ('character', -txtarea.value.length);
			strPos = range.text.length;
		} else if (br == "ff") {
			strPos = txtarea.selectionStart;
		}

		var front = (txtarea.value).substring(0, strPos);
		var back = (txtarea.value).substring(strPos, txtarea.value.length);
		txtarea.value = front + text + back;
		strPos = strPos + text.length;
		if (br == "ie") {
			txtarea.focus();
			var ieRange = document.selection.createRange();
			ieRange.moveStart ('character', -txtarea.value.length);
			ieRange.moveStart ('character', strPos);
			ieRange.moveEnd ('character', 0);
			ieRange.select();
		} else if (br == "ff") {
			txtarea.selectionStart = strPos;
			txtarea.selectionEnd = strPos;
			txtarea.focus();
		}

		txtarea.scrollTop = scrollPos;
	},

    manageDeleteEquation: function() {
        $("#delete-btn").click(function() {
            var str = $("#main-text").html();
            $("#main-text").html(str.substring(0, str.length - 1));
            console.log("Expression : " + $("#main-text").html());
        });
    },

    getMathKey : function(key){
        return '<math xmlns="http://www.w3.org/1998/Math/MathML">'+ key + '</math>'
    },

	doSet : function () {
      editor.setMathML("<math><mfrac><mn>1</mn><mi>x</mi></mfrac></math>");
    },
	doGet : function (){
      alert(editor.getMathML());
    },
	//TODO dynamically change key-editors
	manageMathOptions : function (){
	    $("#math-options").change(function(){
	        var self = $(this);
	        $("#include-html").load(self.val()+".html");
	    });
    },
	//canvas code
	initCanvas : function (){
	    var canvasDiv = document.getElementById('myCanvas');
        if(canvasDiv != null){
        canvas = document.createElement('canvas');
        canvas.setAttribute('width', canvasWidth);
        canvas.setAttribute('height', canvasHeight);
        canvas.setAttribute('id', 'canvas');
        canvasDiv.appendChild(canvas);
        if(typeof G_vmlCanvasManager != 'undefined') {
        	canvas = G_vmlCanvasManager.initElement(canvas);
        }
        context = canvas.getContext("2d");

        $('#canvas').mousedown(function(e){
          var mouseX = e.pageX - this.offsetLeft;
          var mouseY = e.pageY - this.offsetTop;

          paint = true;
          App.addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
          App.redraw();
        });
        $('#canvas').mousemove(function(e){
          if(paint){
            App.addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
            App.redraw();
          }
        });
        $('#canvas').mouseup(function(e){
          paint = false;
        });
        $('#canvas').mouseleave(function(e){
          paint = false;
        });
        $('#clear-canvas').click(function(e){
	        context.clearRect(0, 0, canvasWidth, canvasHeight);
        });
        // Add touch event listeners to canvas element
        canvas.addEventListener("touchstart", function(e){
            // Mouse down location
            var mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - this.offsetLeft,
                mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - this.offsetTop;
            paint_simple = true;
            App.addClick(mouseX, mouseY, false);
            App.redraw();
        }, false);
        canvas.addEventListener("touchmove", function(e){
            var mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - this.offsetLeft,
                mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - this.offsetTop;
            if(paint_simple){
                App.addClick(mouseX, mouseY, true);
                App.redraw();
            }
            e.preventDefault()
        }, false);
        canvas.addEventListener("touchend", function(e){
            paint_simple = false;
            App.redraw();
        }, false);
        canvas.addEventListener("touchcancel", function(e){
            paint_simple = false;
        }, false);
        }
	},

//click events
    addClick : function (x, y, dragging){
      clickX.push(x);
      clickY.push(y);
      canX = clickX;
      canY = clickY;
      clickDrag.push(dragging);
      canDrag = clickDrag;
    },
//TODO resraw canvas
    redraw : function (){
      context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

      context.strokeStyle = "#df4b26";
      context.lineJoin = "round";
      context.lineWidth = 5;

      for(var i=0; i < clickX.length; i++) {
        context.beginPath();
        if(clickDrag[i] && i){
          context.moveTo(clickX[i-1], clickY[i-1]);
         }else{
           context.moveTo(clickX[i]-1, clickY[i]);
         }
         context.lineTo(clickX[i], clickY[i]);
         context.closePath();
         context.stroke();
      }
    },
//clear canvas function
    clearCanvas : function($canvas){
		if($canvas != undefined){
		    $($canvas).sketchable('clear');
		}
		else{
		    $main_canvas.sketchable('clear');
		}
    },
//initially drawing canvas

    drawCanvasAt : function(input, strokes){
	    var canvasDiv = document.getElementById(input);
        canvas = document.createElement('canvas');
        canvas.setAttribute('width', canvasWidth);
        canvas.setAttribute('height', canvasHeight);
        canvasDiv.appendChild(canvas);
        if(typeof G_vmlCanvasManager != 'undefined') {
        	canvas = G_vmlCanvasManager.initElement(canvas);
        }
        App.redrawCanvas(canvas, strokes);
//        var context = canvas.getContext("2d");
//        context.strokeStyle = "#df4b26";
//        context.lineJoin = "round";
//        context.lineWidth = 5;
//        for(var i=0; i < canX.length; i++) {
//            context.beginPath();
//            if(canDrag[i] && i){
//                context.moveTo(canX[i-1], canY[i-1]);
//            }else{
//                context.moveTo(canX[i]-1, canY[i]);
//            }
//            context.lineTo(canX[i], canY[i]);
//            context.closePath();
//            context.stroke();
//        }
    },
//TODO edit canvas
    editCanvasAt : function(input, content){
        var canvas = $("#"+input).children("canvas");
        if(typeof G_vmlCanvasManager != 'undefined') {
        	canvas = G_vmlCanvasManager.initElement(canvas);
        }
        var context = canvas[0].getContext('2d');
        context.strokeStyle = "#df4b26";
        context.lineJoin = "round";
        context.lineWidth = 5;
        var canX = content.canX;
        var canY = content.canY;
        var canDrag = content.canDrag;
        for(var i=0; i < canX.length; i++) {
            context.beginPath();
            if(canDrag[i] && i){
                context.moveTo(canX[i-1], canY[i-1]);
            }else{
                context.moveTo(canX[i]-1, canY[i]);
            }
            context.lineTo(canX[i], canY[i]);
            context.closePath();
            context.stroke();
        }
        clickX = canX;
        clickY = canY;
        clickDrag = canDrag;
    },

//TODO maintain Text,Formula,Shape content
    createObj : function(type, content,id){
        var obj = new Object();
        obj.type = type;
        if(type == "TEXT" || type == "FORMULA"){
            obj.content = content;
        }
        else if(type == "SHAPE"){
            obj.canX = canX;
            obj.canY = canY;
            obj.canDrag = canDrag;
        }
        obj.id=id;
        return obj;
    },
//TODO submit problem by student
    SubmitProblem : function(){
        $("#submit-problem").click(function(){
            var jsonResp = { "mt_problem" : JSON.stringify(question)};
            console.log(question);
            console.log({ "mt_problem" : JSON.stringify(question)});
			alert("question");
            var validateSchema = jsen(schema);
            question._mtDataLines.forEach(function(value){
                if(value.lineType == "EQUATION"){
                    var isSchemaValid = validateSchema(value); // true
                    alert("The formule is "+isSchemaValid);
                }
            });
            $.ajax({
                url :  "https://omtutor.com/cgi-bin/Level9/saveMTData",
                type : "POST",
                data : {
                          "inputMTData" :  JSON.stringify(question),//jsonResp,
                          "problemID" : id,
                        }, //jsonResp,
                dataType: 'json',
                crossDomain: true,
                success : function(result){
                    console.log(result);
                    $("#problem-display").empty();
                    $("#answer-display").empty();
                    App.displayMTData(result, "answer-display");
                    question = new equObj("PROBLEM");
                },
                 error : function(){
                     $("#error-display").fadeIn(1000);
                     $("#error-display").fadeOut(3000);
                 }
            });
        });
    },
//TODO maintain Formula(ascii,latex,mathml)forat and Text,Shape content
    displayMTData : function(result, selector){
        result._mtDataLines.forEach(function(item){
            if(item.lineType == "EQUATION"){
                var expr;
                var eq;
                if(item.lineValue.latex_expr != ""){
                        eq = item.lineValue.latex_expr;
//                    if(item.lineValue.latex_expr != ""){
//                    }
//                    if(item.lineValue.rhs.latex_expr != ""){
//                        eq = eq + relationKeys[item.lineValue.relation] + item.lineValue.rhs.latex_expr;
//                    }
                    expr = new exprObj(eq,'','');
                    App.displayFormula(expr, selector, result.dataType);
                }
                else if(item.lineValue.ascii_expr != ""){
                        eq = item.lineValue.ascii_expr;
//                    if(item.lineValue.lhs.ascii_expr != ""){
//                        eq = item.lineValue.lhs.ascii_expr;
//                    }
//                    if(item.lineValue.rhs.ascii_expr != ""){
//                        eq = eq + relationKeys[item.lineValue.relation] + item.lineValue.rhs.ascii_expr;
//                    }
//                    expr = new exprObj('','',eq);
                    App.displayFormula(expr, selector, result.dataType);
                }
                else if(item.lineValue.mathml_expr != ""){
                    //eq = '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block"> <mi>x</mi> <mo>=</mo> <mrow> <mfrac> <mrow> <mo>&#x2212;</mo> <mi>b</mi> <mo>&#x00B1;</mo> <msqrt> <msup><mi>b</mi><mn>2</mn></msup> <mo>&#x2212;</mo> <mn>4</mn><mi>a</mi><mi>c</mi> </msqrt> </mrow> <mrow> <mn>2</mn><mi>a</mi> </mrow> </mfrac> </mrow> <mtext>.</mtext> </math>'
                    eq = item.lineValue.mathml_expr;
                    $("#"+selector).append(eq);
                    MathJax.Hub.Queue(["Typeset",MathJax.Hub,"#"+selector]);
                }

            }
            else if(item.lineType == "TEXT"){
                App.displayText(item.lineValue, selector, result.dataType);
            }
            else if(item.lineType == "SHAPE"){
                var canX = []; var canY = [];
                var arr = JSON.parse(item.lineValue);
                //arr.forEach(function(item){
                //item.forEach(function(subItem){
                //canX.push(subItem[0]);
                //canY.push(subItem[1]);
                //});
                //});
                App.displayShape(arr[0], arr[1], selector, result.dataType);
            }
        });

    },
//TODO displaying question types(Text,Formula,Shapes)
    manageArray : function (arr, value, type, dataType){
        if(dataType === "PROBLEM"){
            var content="";
            var t1;
            switch (type) {
                case "TEXT":
                    content = value;
                    t1 = new textObj();
                    t1.lineValue = value;
                    question._mtDataLines.push(t1);
                    break;
                case "FORMULA":
                    content = value.latex_expr;
                    t1 = new formulaObj();
                    t1.lineValue.latex_expr = value.latex_expr;
                    t1.lineValue.ascii_expr = value.ascii_expr;
                    t1.lineValue.mathml_expr = value.mathml_expr;
                    question._mtDataLines.push(t1);
                    break;
                case "SHAPE":
                     content = "SHAPE";
//                     var canArr = [];
//                     canArr.push(canX);canArr.push(canY);
                     t1 = new shapeObj();
                     t1.lineValue = JSON.stringify(value);
                     question._mtDataLines.push(t1);
                 break;
            }
            id=count;
            arr.push(App.createObj(type, content,id));
        }
        count++;
        return t1;
        },
// Text code
    displayText : function(textValue, container, dataType){
        var textLength=0;
        if(isAdd||(type!="text")){
            var obj = App.manageArray(contentArray,textValue,"TEXT", dataType);
            textLength = count;
            $("#"+container).append("<div class='display-text' id=text-"+textLength+"  data-pos="+(textLength)+"><span></span></div>");
            $("#text-"+textLength).data('obj',obj);
        }
        else if(!isAdd&&(type=="text")){
            $("#textact").text("Add");
            $("#resettext").show();
			$(".deleteText").hide();
            textLength=parseInt(pos);
            var obj = $("#text-"+textLength).data('obj');
            var index = question._mtDataLines.indexOf(obj);
            obj.lineValue = textValue;
            question._mtDataLines[index] = obj;
            $("#text-"+textLength).data('obj', obj);
            isAdd=true;
        }
        $("#text-"+textLength+" span:last-child").text(textValue);
        return false;
    },
// Formula code
    displayFormula : function(formulaValue, container, dataType){
        var value = formulaValue.latex_expr != '' ? formulaValue.latex_expr : formulaValue.ascii_expr;
            var formulaLength =0;
        if(isAdd||(type!="formula")){
           var obj= App.manageArray(contentArray,value,"FORMULA", dataType);
           formulaLength=count;
          $("#"+container).append("<div class='display-formula' id=formula-"+formulaLength+" data-pos='"+ (formulaLength) +"'></div><br/>");
		  obj.lineValue = formulaValue;
                $("#formula-"+formulaLength).data('obj',obj);
              $('.display-formula').each(function(index, element) {
            if($(element).attr('data-pos')==(formulaLength)){
                element.textContent = value;
                MQ.StaticMath(element);
            };
           });
            lineCounter++;
        }
        else if(!isAdd&&(type=="formula")){
           $("#addformula").text("Add");
           $("#resetformula").show();
		   $(".deleteFormula").hide();
           formulaLength = parseInt(pos);
           var obj = $("#formula-"+formulaLength).data('obj');
                       var index = question._mtDataLines.indexOf(obj);
                       obj.lineValue = formulaValue;
                       question._mtDataLines[index] = obj;
                       $("#formula-"+formulaLength).data('obj', obj);
					   $('.display-formula').each(function(index, element) {
            			if($(element).attr('data-pos')==(formulaLength)){
                		element.textContent = value;
                			MQ.StaticMath(element);
            			};
           			});
                         //MQ.StaticMath(element);
                currPos = 0;
                isAdd=true;
        }
        if(mathField != null){
            mathField.latex('');
        }
        return false;
    },
    // Shapes code
    displayShape : function($canvas, strokes, container, dataType){
           var canvasLength=0;
        if(isAdd||(type!=="shape")){
           var obj = App.manageArray(contentArray,strokes,"SHAPE", dataType);
            App.clearCanvas($canvas);
             canvasLength = count;
            $(container).append("<div class='display-canvas' id='display-canvas-"+canvasLength+"'"+" data-pos='"+ (canvasLength) +"'></div>");
            $("#display-canvas-"+canvasLength).data('obj',obj);
            var canvasElement = $('<canvas/>', { id: 'draw-canvas-'+canvasLength, height: 200, width: 200});
            $("#display-canvas-"+canvasLength).append(canvasElement);
            App.redrawCanvas('#draw-canvas-'+canvasLength, strokes);
            //App.drawCanvasAt("canvas-"+canvasLength);
        }
        else if(!isAdd&&(type=="shape")){
         $("#addshape").show();
         $("#update-shape").hide();
          $("#resetshape").show();
		  $(".deleteShape").hide();
          canvasLength=parseInt(pos);
          var obj = $("#display-canvas-"+canvasLength).data('obj');
             var index = question._mtDataLines.indexOf(obj);
             var canArr = [];
             canArr.push(canX);canArr.push(canY);
             obj.lineValue = canArr;
             question._mtDataLines[index] = obj;
             $("#display-canvas-"+canvasLength).data('obj', obj);
        // for (i = 0; i <= contentArray.length; i++) {
         // contentArray.forEach(function(item,id){
         // if(item.id == curentpos){
         //   contentArray[id].content=$('#myCanvas').val('');//change
         //   App.editCanvasAt("canvas-"+(contentArray[id].id+1), contentArray[id]);//break;
            App.clearCanvas();
            curentpos=0;
          //}
        //});
        isAdd=true;
        //}
        return false;
        }
    },

    initEvents : function(){
		//reset text value
        $('a#resettext').on('click',function(){
            $("#textlines").val("");
        });
//TODO initially enter Text
        $('a#textact').on("click", function(e) {
            e.preventDefault();
            var textareaElem = $("#textlines");
            App.displayText(textareaElem.val(),"problem-display", "PROBLEM");
            if(!isAdd&&(type=="text")){
                $("#textact").text("Add");
                $("#resettext").show();
            }
            textareaElem.val("");
        });
//ToDO delete text
        $('.textline').on('click', '.deleteText', function() {
            $("#textlines").val('');
            var container = $(this).attr("data-id");
            var obj = $(container).data('obj');
            var index = question._mtDataLines.indexOf(obj);
            question._mtDataLines.splice(index, 1);
            $(container).remove();
            isAdd=true;
            $("#textact").text("Add");
            $("#resettext").show();
            $(".deleteText").hide();
        });
//Edit and Update Text code
        $('#problem-display').on('click', '.display-text', function() {
            App.showContent('textline');
            $("#textlines").focus();
            $("#addformula").text("Add");
            $("#resetformula").show();
            mathField.latex('');
            //App.clearCanvas();
            $("#addshape").show();
            $("#update-shape").hide();
            $("#resetshape").show();
            var selector = $(this).closest(".display-text");
            pos = selector.attr('data-pos');
            var obj = $("#text-"+pos).data('obj');
            $('#textlines').val(obj.lineValue);
            isAdd=false;
            type="text";
            $("#textlines").focus();
            $("#textact").text("Update");
            $("#resettext").hide();
            $(".deleteText").show();
            $("#delete-text").attr("data-id","#text-"+pos);
        });
//reset formula
        $('a#resetformula').on('click',function(){
            mathField.latex('');
        });
//TODO initially add formula value
        $('a#addformula').on("click", function(e) {
            e.preventDefault();
            var latexContent = $("#latex1").text();
            var mathml = $("#result-mathml").text();
            var mathmlContent = mathml.replace(/\"/g , "\'");
            App.displayFormula(new exprObj(latexContent,mathmlContent,'') , "problem-display", "PROBLEM");
            if(!isAdd&&(type=="formula")){
                $("#addformula").text("Add");
                $("#resetformula").show();
                $(".deleteFormula").hide();
            }
        });
//Edit and Update formula value
        $('#problem-display').on('click', '.display-formula', function() {
            App.showContent('controls');
            $("#math-field1").focus();
            $("#textlines").val('');
            $("#textact").text("Add");
            $("#resettext").show();
            //isAdd=false;
            App.clearCanvas();
            $("#addshape").show();
            $("#update-shape").hide();
            $("#resetshape").show();
            var selector = $(this).closest(".display-formula");
            pos = selector.attr('data-pos');
            var obj = $("#formula-"+pos).data('obj');
            mathField.latex(obj.lineValue.latex_expr);
            isAdd=false;
            type="formula";
            $("#math-field1").focus();
            $("#addformula").text("Update");
            $("#resetformula").hide();
            $(".deleteFormula").show();
            $("#delete-formula").attr("data-id","#formula-"+pos);
        });
//TODO Delete Formula
        $('.controls').on('click', '.deleteFormula', function() {
                       mathField.latex('');
                       var container = $(this).attr("data-id");
                        var obj = $(container).data('obj');
                        var index = question._mtDataLines.indexOf(obj);
                        question._mtDataLines.splice(index, 1);
                        $(container).remove();
                        isAdd=true;
                        $("#addformula").text("Add");
                       $("#resetformula").show();;
                        $(".deleteFormula").hide();


       });
//reset shape
        $('a#resetshape').on('click',function(){
            App.clearCanvas();
        });
//initially add shapes
        $('a#addshape').on("click", function(e) {
            var input = $(this).attr("data-canvas-id");
            var container = $(this).attr("data-container");
            var problemType = $(this).attr("data-problem-type");
            var strokes = $(input).sketchable('strokes');
            //App.setCanvasValues(dataId);
            e.preventDefault();
            if(strokes.length != 0){
                App.displayShape(input, strokes, container, problemType);
                if(!isAdd&&(type=="shape")){
                    $("#addshape").show();
                    $("#update-shape").hide();
                    $("#resetshape").show();
                }
            }
        });
//TODO delete shapes
        //Update Shape
        $('#update-shape').on("click", function(e) {
            var pos = $(this).attr('data-pos');
            var obj = $("#display-canvas-"+pos).data('obj');
            var strokes = JSON.parse(obj.lineValue);

            var input = "#draw-canvas-"+pos;
            var curr_strokes = $main_canvas.sketchable('strokes');
            $(input).sketchable('strokes', curr_strokes);
            //var curr_strokes = JSON.parse(obj.lineValue);
            console.log(curr_strokes);
            $(input).sketchable('redraw');
            e.preventDefault();
            $("#addshape").show();
            $("#update-shape").hide();
            $("#resetshape").show();
            $(".deleteShape").hide();
            App.clearCanvas();
        });

        $('.shapes').on('click', '.deleteShape', function() {
           App.clearCanvas();
           //$('div.display-canvas').find('canvas').empty();
           var container = $(this).attr("data-id");
                       var obj = $(container).data('obj');
                       var index = question._mtDataLines.indexOf(obj);
                       question._mtDataLines.splice(index, 1);
                       $(container).remove();
                       isAdd=true;
                       $("#addshape").show();
                       $("#update-shape").hide();
                       $("#resetshape").show();
                       $(".deleteShape").hide();
        });
//Edit and Update shapes
        $('#problem-display').on('click', '.display-canvas', function() {
            App.showContent('shapes');
            $("#canvas").focus();
            $("#textlines").val('');
            $("#textact").text("Add");
            $("#resettext").show();
            mathField.latex('');
            $("#addformula").text("Add");
            $("#resetformula").show();
            //pos=$(this).closest(".display-canvas").attr('data-pos');
            App.clearCanvas();
            var selector=$(this).closest('.display-canvas');
            pos = selector.attr('data-pos');
            var obj = $("#display-canvas-"+pos).data('obj');
            var strokes = JSON.parse(obj.lineValue);
             App.editCanvas("#drawing-canvas",strokes);
            console.log(strokes);
            $("#update-shape").attr("data-pos",pos)
            //$("#myCanvas").val(obj.lineValue);
           // for (i = 0; i < contentArray.length; i++) {
                  //if(contentArray[i].id==curentpos){
                  //App.editCanvasAt("myCanvas",contentArray[i]);
                  //$('#myCanvas').val(contentArray[i].content);
                  isAdd=false;
                  $("#canvas").focus();
                  $("#addshape").hide();
                  $("#update-shape").show();
                  $("#resetshape").hide();
				  $(".deleteShape").show();
                  type="shape";
                  $("#delete-shape").attr("data-id","#display-canvas-"+pos);
               //}
           // }
        });

//sve image
          function saveImage(formData) {
                var $responseText = $('#responseText');

                var $response = '';
                var $responseText = document.getElementById('responseText');
                $responseText.innerHTML = '';
                var xhr = new XMLHttpRequest();
                // callocrmath saves the file and returns the name of the file
                // which can be used to reload at a different time
                xhr.open('POST', '/cgi-bin/callocrmath', true);
                // Do not expect onload() will be called predictably
                xhr.onload = function() {
                        if (xhr.status == 200) {
                                $response = xhr.responseText;
                                //var $respObj = JSON.parse($response);
                                $responseText.innerHTML = $response;
       // var srvrImage = new Image();
       // srvrImage.src = $respObj.serverFileName;
       // var $image_problem = document.getElementById("image_problem");
       // $image_problem.src = srvrImage.src;
                        } else {
                                $response = 'ERROR';
                        }
                };
                xhr.send(formData);

                // response here could be empty as onload() cannot be expected
                // to be called or finished at this point
                // try to use global variables to get Ajax response
                return $response;
        };

//TODO upload image
//$("#imgfile").change(function(){
            //var input = this;
            //if (input.files && input.files[0]) {
               // var reader = new FileReader();
                //reader.onload = function (e) {
                 //   $('#images').attr('src', e.target.result);
                //}
               // reader.readAsDataURL(input.files[0]);
            // }
        //});
  //  },
         $('#img_upload').on("submit", function(e) {
                e.preventDefault();

                var add_background_btn = document.getElementById('as_image');
                add_background_btn.innerHTML = 'Uploading...';

                var file_select = document.getElementById('file_select');
                var fileName = '';

                if ('files' in file_select) {
                        if (file_select.files.length == 0) {
                                alert('Browse and select a file');
                        } else {
                                var file = file_select.files[0];
                                if ('name' in file) {
                                        fileName = file.name;
                                        console.log('FileName:' + file.name);
                                }
                                if ('size' in file) {
                                        console.log('FileSize:' + file.size);
                                }
                                if (file.type.match('image.*')) {
                                        console.log('ImageType:' + file.type);
                                }
                                var session_uid_elem = document.getElementById('select_student');
                                var session_uid = session_uid_elem.options[session_uid_elem.selectedIndex].value;
                                var session_gid_elem = document.getElementById('select_school');
                                var session_gid = session_gid_elem.options[session_gid_elem.selectedIndex].value;
                                // Prepare FormData object to submit in Ajax calls
                                // this part calls saveImage() to save file on the server
                                // the filename on the server and OCR text are returned (by callocrmath)
                                var formData = new FormData();
                                formData.append('photo', file, fileName);
                                formData.append('action', 'as_image');
                                formData.append('SESSION_UID', session_uid);
                                formData.append('SESSION_GID', session_gid);
                                var serverfile = saveImage(formData);

                                // The following code is to draw the image as background
                                // This uses e.target.result (as the local file) in the onload()
                                // uses FileReader and readAsDataURL() to achieve this
                                var reader = new FileReader();

                                // Do not expect onload() will be called at a predictable point
                                //reader.onload = function(e) {

                                //      var _opts = {
                                //              bgimage : {
                                //                      enabled : true,
                                //                      selected : true,
                                //                      localfile : e.target.result,
                                //                      serverfile : serverfile
                                //              }
                                //      };
                                //      $canvas.sketchable('config', _opts);

                                //      $canvas.sketchable('drawBGImage', _opts.bgimage.localfile, 0, 0);
                                //};

                                //reader.readAsDataURL(file);
                        }
                }

                add_background_btn.innerHTML = 'as_image';
        });
    },

//TODO show keyeditor keys
    showContent : function(content) {
        var i, tabcontent;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        document.getElementsByClassName(content)[0].style.display = "block";
    },
//To get problem-id in teacher page
    pageLoad : function(){
        var selector = ".mt-page-load";

        $(selector).each(function(){
            var self = $(this);
            var dataUrl = self.attr("data-url");
            var callback = self.attr("data-callback");
            $.ajax({
                url : dataUrl,
                method : "GET",
                cache : false,
                crossDomain: true,
                async : false,
                success : function(result) {
                    var fn = window['App'][callback];
                    if(typeof fn === 'function') {
                        fn(result);
                    }
                }
            });
        });
		//TO Reset problem-id in teacher page
        	$('.select-question').on('click', '#reset-probid', function() {
        		$('#questions').val('');
        		$("#textlines").val('');
        		 mathField.latex('');
        		 App.clearCanvas();
        		$('#question-display').empty('');
        		$('.flex-container').hide();
           		$('.display').hide();

        	});
			//To Discard solution in teacher page
        	$('.display').on('click', '#discard-probid', function(){
            				$('#problem-display').empty('')
            				});
             //To select solution-id in student page
            			$('.select-question').on('click', '#reset-question-id', function(){
            				$('#solution-ids').val('');
            				$('#solution-display').empty('');
            				});

    },
    appendSolution : function(result){
        var container = $("#questions")
        result.forEach(function(item){
            container.append($("<option />").val(item).text(item));
        })
    },

    appendQuestions : function(result){
        var container = $("#solution-ids")
        result.forEach(function(item){
            container.append($("<option />").val(item).text(item));
        })
    },
	//To selecr problem-id and submit code
    getProblemData : function(){
        $('#select-probid').on('click', function() {
            var self = $(this);
            $('#question-display').empty('');
            $('#problem-display').empty('');
            var problemId = $("#questions").val();
            var data = App.getMTDATA(problemId, "PROBLEM", "appendProblemMTData", self);
            $('.flex-container').show();
            $('.display').show();
            question = new equObj("SOLUTION");
        });
    },
//To get solution in student page
    getSolutionData : function(){
        $('#select-question-id').on('click', function() {
            var self = $(this);
            var container = self.attr("data-container");
            $('#'+container).empty('');
            var solutionId = $("#solution-ids").val();
            var data = App.getMTDATA(solutionId, "SOLUTION", "appendSolutionMTData", self);
        });
    },
        //submit solution logic in teacher page

        submitSolution : function(){
                $('#upload-probid').on('click', function() {
                  var self = $(this);
                    var container = self.attr("data-container");
                   var problemId = $("#questions").val();
                   var data = App.solutionMTDATA(problemId, "SOLUTION", "appenduploadMTData", self);
                });
            },
           solutionMTDATA : function(id, type, callback, selector){
                    var dataUrl = "https://omtutor.com/cgi-bin/Level9/saveMTData"
                    var data;
                    $.ajax({
                        url : dataUrl,
                        method : "POST",
                        crossDomain: true,
                        async : false,
                        data : {
                            "inputMTData" : JSON.stringify(question),
                            "problemID" : id,
                        },
                        success : function(result) {
                            var fn = window['App'][callback];
                            if(typeof fn === 'function') {
                                fn(result, selector);
                            }
                            $("#success-display").fadeIn(2000);
                            $("#success-display").fadeOut(4000);
                             App.displayMTData(result, "answer-display");

                        }
                    });
                    return data;
                },

    appenduploadMTData : function(result, selector){
        console.log(result._mtDataLines[0].lineValue);
        App.displayMTData(result, $(selector).attr("data-container"));
    },
//To Display error msg if any question have no solution
    getMTDATA : function(id, type, callback, selector){
        var dataUrl = "https://omtutor.com/cgi-bin/Level9/getMTData"
        var data;
        $.ajax({
            url : dataUrl,
            method : "GET",
            crossDomain: true,
            async : false,
            data : {
                "DataType" : type,
                "MTDataID" : id,
            },
            success : function(result) {
                var fn = window['App'][callback];
                if(typeof fn === 'function') {
                    fn(result, selector);
                }
            }
        });
        return data;
    },

    appendProblemMTData : function(result, selector){
        console.log(result);
        App.displayMTData(result, $(selector).attr("data-container"));
    },

    appendSolutionMTData : function(result, selector){
        App.displayMTData(result, $(selector).attr("data-container"));
    },

    initJSketchCanvas : function(input){
        // Set brush size
        var BRUSH_SIZE = 20;
        var _canvasOptions = {
            interactive : true,
            graphics : {
                firstPointSize : 1,
                lineWidth : 2,
                strokeStyle : "green"
            }
        };

        // This first canvas - make it a sketchable object with default options
        $main_canvas = $("#drawing-canvas").sketchable(_canvasOptions);

        // Handle the click on Red color
        $('a#Red').on("click", function(e) {
            e.preventDefault();
            App.setCanvasColor("red");
        });

        // Handle the click on Green color
        $('a#Green').on("click", function(e) {
            e.preventDefault();
            App.setCanvasColor("green");
        });

        // Handle the click on Blue color
        $('a#Blue').on("click", function(e) {
            e.preventDefault();
            App.setCanvasColor("blue");
        });

        // Handle the click on Black color
        $('a#Black').on("click", function(e) {
            e.preventDefault();
            App.setCanvasColor("black");
        });

        // freehand drawing
        $("a#freehand").on("click", function(e) {
            e.preventDefault();
            App.setDrawMode('FreeHand');
        });

        // straight lines only
        $("a#straight_lines").on("click", function(e) {
            e.preventDefault();
            App.setDrawMode('StraightLines');
        });

        // draw Rectangles
        $("a#drawArcs").on("click", function(e) {
            e.preventDefault();
            App.setDrawMode('Rectangles');
        });

        // draw Circles
        $("a#drawCircles").on("click", function(e) {
            e.preventDefault();
            App.setDrawMode('Circles');
        });

        // draw text
        $("a#drawText").on("click", function(e) {
            e.preventDefault();
            App.setDrawMode('Text');
        });

        // text changed
        $("#labelText").on("change", function(e) {
            e.preventDefault();
            App.setDrawMode('Text');
        });

        // Clear the canvas
        $('a#clear').on("click", function(e) {
            e.preventDefault();
            App.clearCanvas($main_canvas);
        });

        $('a#undo').on("click", function(e) {
            e.preventDefault();
            $main_canvas.sketchable('undo');
        });

        $('a#redo').on("click", function(e) {
            e.preventDefault();
            $main_canvas.sketchable('redo');
        });

        $('#gridBox').change(function(e) {
            e.preventDefault();
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
                $main_canvas.sketchable('config', _opts);
                $main_canvas.sketchable('showGrid', _opts.grid.horizontal, _opts.grid.vertical);
            } else {
                _opts.grid.showGrid = false;
                $main_canvas.sketchable('config', _opts);
                $main_canvas.sketchable('erase');
                $main_canvas.sketchable('hideGrid', _opts.grid.horizontal, _opts.grid.vertical);
                $main_canvas.sketchable('redraw');
            }
        });
//changes start for autoresize
			$('#line_mode').change(function(e) {
		e.preventDefault();

		var checkedVal = $(this).is(":checked");
		if (checkedVal) {
			var _opts = {
				canvasWidth : 800,
				canvasHeight : 100,
			};

			$main_canvas.sketchable('config', _opts).sketchable('resize', _opts.canvasWidth, _opts.canvasHeight).sketchable('clear');
		} else {
			var _opts = {
				canvasWidth : 500,
				canvasHeight : 200,
			};

			$main_canvas.sketchable('config', _opts).sketchable('resize', _opts.canvasWidth, _opts.canvasHeight).sketchable('clear');
		}
		$main_canvas.sketchable('redraw');
	});

	$('#auto_resize').change(function(e) {
		e.preventDefault();

		var checkedVal = $(this).is(":checked");
		if (checkedVal) {
			var _opts = {
				bgimage : {
					resizeMode : 3
				}
			};

			$main_canvas.sketchable('config', _opts).sketchable('resize');
		} else {
			var _opts = {
				bgimage : {
					resizeMode : 1
				}
			};

			$main_canvas.sketchable('config', _opts).sketchable('resize');
		}
		$main_canvas.sketchable('redraw');
	});
//auto-resize end here
        // After drawing is finished, retriev the strokes
        // Add the strokes to the MTData object

        // Here we save it into 'strokes' global variable
        // and call the drawCanvas() method
        // which draws the strokes data on the 2nd canvas
        $('a#send').on("click", function(e) {
            e.preventDefault();
            // This variable holds strokes extracted from first canvas (or retrieved from MTData)
            var strokes = $main_canvas.sketchable('strokes');

            drawCanvas(strokes, $newCanvas);
        });
    },

	// This function sets the effective color for the canvas
	setCanvasColor : function (colorName) {
		var _colorOpt = {
			graphics : {
				strokeStyle : colorName
			}
		};
		$main_canvas.sketchable('config', _colorOpt);
	},

	setDrawMode : function (modeName) {
		var labelText = "";
		// if modeName is not one of the acceptable values, set it to 'FreeHand'
		if (!(modeName == 'FreeHand' || modeName == 'StraightLines' || modeName == 'Rectangles' || modeName == 'Circles' || modeName == 'Text')) {
			modeName = 'FreeHand';
		}
		if (modeName == 'Text') {
			labelText = document.getElementById("labelText").value;
		} else {
			document.getElementById("labelText").value = "";
		}

		var _opts = {
			drawMode : modeName,
			textValue : labelText
		};
		$main_canvas.sketchable('config', _opts);
	},

    setCanvasValues : function(input){
        var strokes = $(input).sketchable('strokes');
    },

    redrawCanvas : function(input, strokes){
        // Set the strokes data for the canvas
//        $(input).sketchable('strokes',strokes);
//        //redraw it
//        $(input).sketchable('redraw');
        var _canvasOptions = {
            interactive : false

        };
        var $canvass = $(input).sketchable(_canvasOptions);
        $canvass.sketchable('strokes',strokes);
        $canvass.sketchable('redraw');
        $canvass.sketchable('config', _canvasOptions);
    },

    editCanvas : function(input, strokes){
        // Set the strokes data for the canvas
        $main_canvas.sketchable('strokes',strokes);
//        //redraw it
        //var input = "#draw-canvas-"+pos;
          // var curr_strokes = $main_canvas.sketchable('strokes');
         //$(input).sketchable('strokes', curr_strokes);
        // $(input).sketchable('redraw');
        //$(input).sketchable('strokes', strokes);

        $main_canvas.sketchable('redraw');
        $main_canvas.sketchable('strokes',strokes);
        console.log(strokes);
    },

    initAjaxGET: function() {
        var selector = $(".omt-partial-get");
        $(selector).each(function(){
          var self = $(this);
          var url = self.attr("data-url");
          var callback = self.attr("data-callback");
          var container = self.attr("data-container");
          $(self).on("change",function(e) {
            var data = self.serialize();
              $.ajax({
                url: url,
                data: data,
                type: "GET",
                success: function(result) {
                    var fn = window['App'][callback];
                    if(typeof fn === 'function') {
                        fn(container, result);
                    }
                }
              });
          });
        });
    },

    initAjaxOnLoad: function() {
        var selector = $(".omt-partial-on-load");
        $(selector).each(function(){
            var self = $(this);
            var url = self.attr("data-url");
            var callback = self.attr("data-callback");
            var container = self.attr("data-container");
            var data = self.serialize();
            $.ajax({
                url: url,
                data: data,
                type: "GET",
                success: function(result) {
                    var fn = window['App'][callback];
                    if(typeof fn === 'function') {
                        fn(container, result);
                    }
                }
            });
        });
    },

    initAjaxClick: function() {
        var selector = $(".omt-partial-click");
        $(selector).each(function(){
          var self = $(this);
          var url = self.attr("data-url");
          var callback = self.attr("data-callback");
          var container = self.attr("data-container");
          $(self).on("click",function(e) {
            var data = self.serialize();
              $.ajax({
                url: url,
                type: "GET",
                success: function(result) {
                    var fn = window['App'][callback];
                    if(typeof fn === 'function') {
                        fn(container, result);
                    }
                }
              });
          });
        });
    },

      appendData : function(container,result){
        $(container).empty();
        $(container).append(result);
      },

}
