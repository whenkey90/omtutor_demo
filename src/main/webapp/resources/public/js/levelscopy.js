$(function() {

	var globalData = '';
	var $jsontext = $('#eq-json');

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

	// Function to call CGI script (levels1to4.pl) to generate
	// (a) lessons (HTML) - To be displayed as-is
	// (b) questions (JSON) - To be displayed based on required format
	// (c) pdfgen (PDF) - Generate PDF on the server, to download as pop-up
	// Store the returned data in 'globalData' variable or display PDF
	// The following function is called only for lessons and questions (also see, generateServerPDF())
	function callAjax(action) {
                // Display that data is being loaded.
                show_overlay("Data is being loaded. Please wait. If it doesn't load in few seconds, please try again.");

		var dtype = 'json';
		var postData = {
			'action' : 'questions',
			'SESSION_LID' : 10,
			'SESSION_GID' : 'nysmith',
			'SESSION_UID' : 'reddy'
		};
		if (action == 'lesson') {
			dtype = 'text';
			postData = {
				'action' : 'lesson',
				'SESSION_LID' : 10,
				'SESSION_GID' : 'nysmith',
				'SESSION_UID' : 'reddy'
			}
		};

		$.ajax({
			type : "POST",
			url : "cgi-bin/Levels1to4/levels1to4.pl",
			data : postData,
			dataType : dtype,
			//timeout : 2000,
			beforeSend : function(xhr) {
				//$jsontext.empty();
			},
			error : function(jqXHR, textStatus, errorThrown) {
				$jsontext.html('<h2>' + textStatus + '</h2><p>' + errorThrown + '</p>');
				alert('FAILED: Either it is taking too long or generator failed.' + textStatus);
			},
			success : function(data, textStatus, jqXHR) {
				if (!data) {
					$jsontext.html('<h2>Server not available.</h2><p>Please try again later. We apologize for the inconvenience.</p>');
					return false;
				}

				// Assign the returned data to 'globalData' to be used by other functions
				globalData = data;

			}
		}).done( function() {
                       if ( typeof globalData === 'undefined' || globalData === "" || globalData.length < 0 ) {
                            show_overlay("There was a problem loading data. Please try again.");
                       } else {
				switch (action) {
				case 'lesson':
					displayLesson();
					break;
				case 'examples':
					displayExamples();
					break;
				case 'exercises':
					displayExercises();
					break;
				case 'tests':
					displayTests();
					break;
				default:
					$jsontext.html('<h2>Action requested does not match known types [levels 1 to 4]');
					return false;
				}
                            // remove_overlay();
                       }
                });
	}

        function show_overlay(displayText) {
		$jsontext.empty();
		$jsontext.html(displayText);
        }

        function remove_overlay() {
		// $jsontext.empty();
        }

	function displayLesson() {
		if ( typeof globalData === 'undefined' ) {
		   return ;
		}

                if (globalData === "") {
                   callAjax("lesson");
                } else {

		   var html2Display = globalData;
		   $("#main-example").removeClass("display-none");
                  $("#exercise-container").addClass("display-none");
                  $("#test-container").addClass("display-none");
                  //var html2Display = data;
                  $render.html('\\[' + globalData + '\\]');
		         //$jsontext.empty();
		          $jsontext.html(html2Display);
                }
	};
 var dataArr = [];
	function displayExamples() {
		if ( typeof globalData === 'undefined' ) {
		   return ;
		}

                if (globalData === "") {
                   callAjax("examples");
                }
                //var jsonArr = globalData;
		if ( globalData.length < 1 || globalData.length > 100 ) {
		   return ;
		}



		else{
			 $("#main-example").removeClass("display-none");
                      $("#exercise-container").addClass("display-none");
                      $("#test-container").addClass("display-none");
                      dataArr = globalData;
                      //console.log(dataArr[0]);
                      var html2Display = "Example 1" + ":\t " + dataArr[1]._answer;
                      $('#eq-json').html(html2Display);
                      $("#next-btn").removeClass("display-none");
					  $('#next-btn').attr("data-que-no", 2);
		}
		 //end here
		      //var html2Display = '<br/>';
		      // 0th object is configuration object; skip it; start from 1
		      //for ( j = 1; j < jsonArr.length; j++) {
			   //var newStr = jsonArr[j]._answer;

			  //html2Display = html2Display + "Example " + j + ":\t " + newStr + "<br/>";
		       //};
			    data.shift();
                  dataArr = data;
                  MathJax.Hub.Typeset();

		        $jsontext.empty();
		       $jsontext.html(html2Display);
	};
	 var exerciseArr = [];
	function displayExercises() {

		if ( typeof globalData === 'undefined' ) {
		   return ;
		}

                if (globalData === "") {
                   callAjax("exercises");
                }
             //var jsonArr = globalData;
		if ( globalData.length < 1 || globalData.length > 100 ) {
		   return ;
		}
			else {
                      $("#main-example").addClass("display-none");
                      $("#exercise-container").removeClass("display-none");
                      $("#test-container").addClass("display-none");
                      console.log("inside excersice data");
                      exerciseArr = globalData;
                      var html2Display = '';
                      //for (var j=1;j<jsonArr.length;j++){
                      var obj = exerciseArr[1];
                      var question, chA, chB, chC, chD, test, test_status;
                      $("#ex-question").empty();
                      if (obj._questtype == 'word') {
                          question = obj._expression.replace(/\?/g, "<input type='text' id='input' name='choices' maxlength='5'>");
                          html2Display = "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                          $("#ex-question").append(html2Display);
                      } else if (obj._questtype == 'expression') {
                          question = obj._expression.replace(/\?/g, "<input type='text' id='input' name='choices' maxlength='5'>");
                          html2Display += "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                          $("#ex-question").append(html2Display);
                      } else if (obj._questtype == 'multiple') {
                          question = obj._expression;
                          choices = obj._multichoice;
                          chA = choices[0];
                          chB = choices[1];
                          chC = choices[2];
                          chD = choices[3];
                          html2Display = "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='" + chA + "'> " + chA + "<br />";
                          html2Display = html2Display + "<input type='radio' name='choices' value='" + chB + "'> " + chB + "<br>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='" + chC + "'> " + chC + "<br>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='" + chD + "'> " + chD + "<br><br>";
                          $("#ex-question").append(html2Display);

                      } else if (obj._questtype == 'wordmulti') {
                          question = obj._expression;
                          choices = obj._multichoice;
                          chA = choices[0];
                          chB = choices[1];
                          chC = choices[2];
                          chD = choices[3];
                          html2Display = html2Display + "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='" + chA + "'> " + chA + "<br>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='" + chB + "'> " + chB + "<br>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='" + chC + "'> " + chC + "<br>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='" + chD + "'> " + chD + "<br><br>";
                          $("#ex-question").append(html2Display);

                      }
                  }
		        // var jsonArr = globalData;
		     //var html2Display = '<br/>';

		     var link2PDF = "<p class='genpdf' style='font-size:18px;color:blue'> Click here to generate <span style='width: 35px; height: 20px; margin:auto; display: inline-block; border: 1px solid gray; vertical-align: middle; border-radius: 2px; background:yellow '>PDF</span> for offline practice. </p>";

		// Register the function to call when clicked on
		// genpdf link (defined in link2PDF)
		$jsontext.on("click", "p.genpdf", function() {
			generateClientPDF();
		});

		// Add link2PDF to the html to display
		html2Display = html2Display + link2PDF + "<br/><br/>";
		// Add all the objects to html to display
		//for ( j = 0; j < jsonArr.length; j++) {
			//var str = jsonArr[j];
			//var newStr = DumpObjectIndented(jsonArr[j], '<br>');

			//html2Display = html2Display + newStr;
			//html2Display = html2Display + "<br/><br/>";
		//};
		        $("#testtimerdiv").removeClass("display-none");
                  $("#get-next-exercise").addClass("display-none");
                  $("#next-ex-question").removeClass("display-none");
                  $('.next-exercise').attr("data-que-no", 2).removeClass("display-none");
                  $('.skip-exercise').attr("data-que-no", 2).removeClass("display-none");
                  //$('.next-set').attr("data-que-no",2);

                  var asurl = encodeURIComponent(data);
                  //var jsonArr = JSON.parse(data);
                  // var jsonArr = data;
                  //var html2Display= document.getElementById("eq-json");
                  MathJax.Hub.Typeset();

		$jsontext.empty();
		$jsontext.html(html2Display);
	};
       var testArr = [];
	   var timer = 60;
	function displayTests() {

		if ( typeof globalData === 'undefined' ) {
		   return ;
		}

                if (globalData === "") {
                   callAjax("tests");
                }
        // var jsonArr = globalData;
		if ( globalData.length < 1 || globalData.length > 100 ) {
		   return ;
		}
		else {
                      $("#main-example").addClass("display-none");
                      $("#exercise-container").addClass("display-none");
                      $("#test-container").removeClass("display-none");
                      console.log("inside test data");
                      console.log(globalData);
                      testArr = globalData;
                      var html2Display = '';
                      //	for (var j=1;j<testArr.length;j++){
                      var obj = testArr[1];
                      var question, chA, chB, chC, chD, test, test_status;
                      $("#test-question").empty();
                      if (obj._questtype == 'word') {
                          question = obj._expression.replace(/\?/g, "<input type='text' id='input' name='choices' maxlength='5'>");
                          html2Display = "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                          $("#test-question").append(html2Display);
                      } else if (obj._questtype == 'expression') {
                          question = obj._expression.replace(/\?/g, "<input type='text' id='input' name='choices' maxlength='5'>");
                          html2Display += "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                          $("#test-question").append(html2Display);
                      } else if (obj._questtype == 'multiple') {
                          question = obj._expression;
                          choices = obj._multichoice;
                          chA = choices[0];
                          chB = choices[1];
                          chC = choices[2];
                          chD = choices[3];
                          html2Display = "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='A'> " + chA + "<br />";
                          html2Display = html2Display + "<input type='radio' name='choices' value='B'> " + chB + "<br>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='C'> " + chC + "<br>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='D'> " + chD + "<br><br>";
                          $("#test-question").append(html2Display);

                      } else if (obj._questtype == 'wordmulti') {
                          question = obj._expression;
                          choices = obj._multichoice;
                          chA = choices[0];
                          chB = choices[1];
                          chC = choices[2];
                          chD = choices[3];
                          html2Display = html2Display + "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='A'> " + chA + "<br>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='B'> " + chB + "<br>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='C'> " + chC + "<br>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='D'> " + chD + "<br><br>";
                          $("#test-question").append(html2Display);

                      }
                      //}
                  }
				   $("#testtimerdiv").removeClass("display-none");
                  $("#get-next-test").addClass("display-none");
                  $("#next-ex-test").removeClass("display-none");
                  $('.next-test').attr("data-que-no", 2).removeClass("display-none");
                  $('.skip-test').attr("data-que-no", 2).removeClass("display-none");
				  startTestInterval();

                  var asurl = encodeURIComponent(data);
                  MathJax.Hub.Typeset();
		//var html2Display = '<br/>';
		//for ( j = 0; j < jsonArr.length; j++) {
			//var str = jsonArr[j];
			// var newStr = JSON.stringify(jsonArr[j], null, '\t');
			//var newStr = DumpObjectIndented(jsonArr[j], '<br>');

			//html2Display = html2Display + newStr;
			//html2Display = html2Display + "<br/><br/>";
		//};

		$jsontext.empty();
		$jsontext.html(html2Display);
	};
	 var testInterval;
	  function startTestInterval (){
		var timer = 60;
		$("#timer").text(timer);
		  testInterval = setInterval(function() {
			  --timer;
			  $("#timer").text(timer);
			  if (timer == 0) {
				timer=60;
				$("#timer").text(timer);
				displayNextTest($(".skip-test"));
			  }
		  }, 1000);
	  };

	  function stopTestInterval (){
		clearInterval(testInterval);
	  };
	  //take test code
	  var testArr1= [];
	   var timer1 = 60;

      function takeTests(action) {

		if ( typeof globalData === 'undefined' ) {
		   return ;
		}

                if (globalData === "") {
                   callAjax("tests");
                }
        // var jsonArr = globalData;
		if ( globalData.length < 1 || globalData.length > 100 ) {
		   return ;
		}
                   else {
                      $("#main-example").addClass("display-none");
                      $("#exercise-container").addClass("display-none");
					  $("#test-container").addClass("display-none");
                      $("#take-test-container").removeClass("display-none");
                      $("#config-form").addClass("display-none");
                      console.log("inside test data");
					  console.log(globalData);
                      testArr1 = globalData;
                      var html2Display = '';
                      //	for (var j=1;j<testArr1.length;j++){
                      var obj = testArr1[1];
                      var question, chA, chB, chC, chD, test, test_status;
                      $("#take-test-question").empty();
                      if (obj._questtype == 'word') {
                          question = obj._expression.replace(/\?/g, "<input type='text' id='input' name='choices' maxlength='5'>");
                          html2Display = "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                          $("#take-test-question").append(html2Display);
                      } else if (obj._questtype == 'expression') {
                          question = obj._expression.replace(/\?/g, "<input type='text' id='input' name='choices' maxlength='5'>");
                          html2Display += "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                          $("#take-test-question").append(html2Display);
                      } else if (obj._questtype == 'multiple') {
                          question = obj._expression;
                          choices = obj._multichoice;
                          chA = choices[0];
                          chB = choices[1];
                          chC = choices[2];
                          chD = choices[3];
                          html2Display = "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='A'> " + chA + "<br />";
                          html2Display = html2Display + "<input type='radio' name='choices' value='B'> " + chB + "<br>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='C'> " + chC + "<br>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='D'> " + chD + "<br><br>";
                          $("#take-test-question").append(html2Display);

                      } else if (obj._questtype == 'wordmulti') {
                          question = obj._expression;
                          choices = obj._multichoice;
                          chA = choices[0];
                          chB = choices[1];
                          chC = choices[2];
                          chD = choices[3];
                          html2Display = html2Display + "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='A'> " + chA + "<br>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='B'> " + chB + "<br>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='C'> " + chC + "<br>";
                          html2Display = html2Display + "<input type='radio' name='choices' value='D'> " + chD + "<br><br>";
                          $("#take-test-question").append(html2Display);

                      }
                      //}
                  }

				 $("#teststimerdiv").removeClass("display-none");
                  $("#take-next-test").addClass("display-none");
                  $("#next-take-test").removeClass("display-none");
                  $('.next-tests').attr("data-que-no", 2).removeClass("display-none");
                  $('.skip-tests').attr("data-que-no", 2).removeClass("display-none");
				  startTestIntervals();

                  var asurl = encodeURIComponent(data);
                  MathJax.Hub.Typeset();

      };

	  var testIntervals;
	  function startTestIntervals(){
		var timer1 = 60;
		$("#timers").text(timer1);
		  testIntervals = setInterval(function() {
			  --timer1;
			  $("#timers").text(timer1);
			  if (timer1 == 0) {
				timer1=60;
				$("#timers").text(timer1);
				displayTakeTest($(".skip-test"));
			  }
		  }, 1000);
	  };

	  function stopTestIntervals (){
		clearInterval(testIntervals);
	  };
	//test code end here


	// Generate PDF document on the server and return it
	function generateServerPDF(action) {
		var postData = {
			'action' : 'pdfgen',
			'SESSION_LID' : 10,
			'SESSION_GID' : 'nysmith',
			'SESSION_UID' : 'reddy'
		};

		$.ajax({
			type : "POST",
			url : "cgi-bin/Levels1to4/levels1to4.pl",
			data : postData,
			dataType : 'text',
			timeout : 2000,
			crossDomain : true,
			beforeSend : function(xhr) {
				$jsontext.empty();
			},
			error : function(jqXHR, textStatus, errorThrown) {
				$jsontext.html('<h2>' + textStatus + '</h2><p>' + errorThrown + '</p>');
				alert('FAILED: Could not generate PDF document ' + textStatus);
			},
			success : function(data, textStatus, jqXHR) {
				if (!data) {
					$jsontext.html('<h2>Server not available.</h2><p>Please try again later. We apologize for the inconvenience.</p>');
					return false;
				}
				//$.download('cgi-bin/levels1to4.pl', 'pdfgen=10');
				var blob = new Blob([data], {
					type : 'application/pdf;charset=UTF-8'
				});
				var link = document.createElement('a');
				link.href = window.URL.createObjectURL(blob);
				var curDate = new Date();
				var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

				var dateStr = curDate.getDate() + "-" + monthNames[curDate.getMonth()] + "-" + curDate.getFullYear() + "-" + curDate.getHours() + "-" + curDate.getMinutes();
				link.download = "MyOMTutorQsAs_" + dateStr + ".pdf";
				link.click();
			}
		});
	};

	// Function to generate PDF using javascript
	// Converts questions that are in 'globaData' object to PDF
	function generateClientPDF() {
		if (!globalData) {
			alert('ERROR: Sorry, PDF could not be generated. Please report this problem.');
			return false;
		}

		var jsonQsArr = globalData;
		var numQs = jsonQsArr.length - 1;

		var doc = new jsPDF();
		doc.text(20, 20, "My Online Math Tutor (c)");
		doc.text(20, 30, " ");
		doc.text(20, 40, "Number of Questions: " + numQs);
		for ( j = 1; j < jsonQsArr.length; j++) {
			var pos1 = 20;
			var pos2 = (j + 5) * 10;
			var quest = jsonQsArr[j]._expression;
			quest = quest.replace(/\?/, "____");
			doc.text(pos1, pos2, 'Question ' + j + ':   ' + quest);
		}
		doc.addPage();
		doc.text(20, 20, "My Online Math Tutor (c)");
		doc.text(20, 30, " ");
		doc.text(20, 40, "Answer Key: ");
		for ( k = 1; k < jsonQsArr.length; k++) {
			var pos1 = 20;
			var pos2 = (k + 5) * 10;
			var ansr = jsonQsArr[k]._missingTerm;
			doc.text(pos1, pos2, 'Answer ' + k + ':    ' + ansr);
		}
		var curDate = new Date();
		var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

		var dateStr = curDate.getDate() + "-" + monthNames[curDate.getMonth()] + "-" + curDate.getFullYear() + "-" + curDate.getHours() + "-" + curDate.getMinutes();
		doc.save("MyOMTutorQsAs_" + dateStr + ".pdf");
	};

	// Class to submit Ajax request and display the results in a new popup page
        // This class has been copied from Stackoverflow.com posting on how to
        // present Ajax returned files in a pop-up window (Ajax call is different from
        // calling a CGI script when a link is clicked. CGI overwrites current page,
        // unless target is defined to be a new page which fails if pop-ups are blocked.)
	// There are some problems with this code (doesn't work well in Chrome browser and Firefox)
        // It needs to be tweaked further to make it work properly. Kept code as reference.
	// Use it in the rest of the code only after making it work
	var AjaxDownloadFile = function(configurationSettings) {
		// Standard settings.
		this.settings = {
			// JQuery AJAX default attributes.
			url : "",
			type : "POST",
			headers : {
				"Content-Type" : "application/json; charset=UTF-8"
			},
			data : {},
			// Custom events.
			onSuccessStart : function(response, status, xhr, self) {
			},
			onSuccessFinish : function(response, status, xhr, self, filename) {
			},
			onErrorOccured : function(response, status, xhr, self) {
			}
		};
		this.download = function() {
			var self = this;
			$.ajax({
				type : this.settings.type,
				url : this.settings.url,
				headers : this.settings.headers,
				data : this.settings.data,
				success : function(response, status, xhr) {
					// Start custom event.
					self.settings.onSuccessStart(response, status, xhr, self);

					// Check if a filename is existing on the response headers.
					var filename = "";
					var disposition = xhr.getResponseHeader("Content-Disposition");
					alert("Content-Disposition: " + disposition);
					if (disposition && disposition.indexOf("attachment") !== -1) {
						var filenameRegex = /filename[^;=\n]*=(([""]).*?\2|[^;\n]*)/;
						var matches = filenameRegex.exec(disposition);
						if (matches != null && matches[1])
							filename = matches[1].replace(/[""]/g, "");
					}
					alert("FileName: " + filename);

					var type = xhr.getResponseHeader("Content-Type");
					alert("Content-Type: " + type);
					var blob = new Blob([response], {
						type : type
					});

					if ( typeof window.navigator.msSaveBlob !== "undefined") {
						// IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed.
						window.navigator.msSaveBlob(blob, filename);
					} else {
						var URL = window.URL || window.webkitURL;
						var downloadUrl = URL.createObjectURL(blob);

						if (filename) {
							// Use HTML5 a[download] attribute to specify filename.
							var a = document.createElement("a");
							// Safari doesn"t support this yet.
							if ( typeof a.download === "undefined") {
								window.location = downloadUrl;
							} else {
								a.href = downloadUrl;
								a.download = filename;
								document.body.appendChild(a);
								a.click();
							}
						} else {
							window.location = downloadUrl;
						}

						setTimeout(function() {
							URL.revokeObjectURL(downloadUrl);
						}, 100);
						// Cleanup
					}

					// Final custom event.
					self.settings.onSuccessFinish(response, status, xhr, self, filename);
				},
				error : function(response, status, xhr) {
					// Custom event to handle the error.
					self.settings.onErrorOccured(response, status, xhr, self);
				}
			});
		};
		// Constructor.
		{
			// Merge settings.
			$.extend(this.settings, configurationSettings);
			// Make the request.
			this.download();
		}
	};

        // This JavaScript code works in an HTML page if it has href links:
        // lesson, examples, exercises, tests, pdfgen
        // all the links are <a href="#" id="[lesson or example or ...]"> form
	// On click of each of the links:
	// call the function that gets data from server
	// and stores it in 'globalData'
        // See callAjax() function
        // After data is retrieved call the function that uses the data
	$('a#lesson').on("click", function(e) {
		callAjax("lesson");
                displayLesson();
	});

	$('a#examples').on("click", function(e) {
		callAjax("examples");
                displayExamples();
	});

	$('a#exercises').on("click", function(e) {
		callAjax("exercises");
                displayExercises();
	});

	$('a#tests').on("click", function(e) {
		callAjax("tests");
                displayTests();
	});
	$('#get-next-exercise').on("click", function(e) {
          displayExercises("exercises");
      });
      $('#get-next-test').on("click", function(e) {
          displayTests("tests");
      });
	 $('#displaytest').on("click", function(e) {
          takeTests("tests");
      });
      var rightAnsCount = 0;
      var wrongAnsCount = 0;
      var skipAnsCount = 0;
      $('.next-exercise').on("click", function(e) {

          var self = $(this);
          var qno = parseInt(self.attr("data-que-no"));
          if ((exerciseArr.length != qno) && (qno > 0)) {
              var prevQue = exerciseArr[qno - 1];
              var ans = '';
              if (prevQue._questtype == 'word' || prevQue._questtype == 'expression') {
                  ans = $("input[name = choices]").val();
				  console.log(ans)
				  if(ans==''){
					alert("please enter your answer");
						return false;
					}
					else if(isNaN(ans)){
						alert("enter answer in numbers");
						return false;
						}

              } else if (prevQue._questtype == 'multiple' || prevQue._questtype == 'wordmulti') {
                  ans = $("input[type=radio][name = choices]:checked").val();
				  if(ans==undefined){
					alert("Please select answer");
						return false;
					}

              }
              if (ans === prevQue._missingTerm) {
                  ++rightAnsCount;
              } else {
                  ++wrongAnsCount;
              }
              var html2Display = '';
              $("#ex-question").empty();
              var obj = exerciseArr[qno];
              var question, chA, chB, chC, chD;
              if (obj._questtype == 'word') {
                  question = obj._expression.replace(/\?/g, "<input type='text' id='input' name='choices' maxlength='5'>");
                  html2Display = "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  $("#ex-question").append(html2Display);
              } else if (obj._questtype == 'expression') {
                  question = obj._expression.replace(/\?/g, "<input type='text' id='input' name='choices' maxlength='5'>");
                  html2Display += "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  $("#ex-question").append(html2Display);
              } else if (obj._questtype == 'multiple') {
                  question = obj._expression;
                  choices = obj._multichoice;
                  chA = choices[0];
                  chB = choices[1];
                  chC = choices[2];
                  chD = choices[3];
                  html2Display = "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chA + "'> " + chA + "<br />";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chB + "'> " + chB + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chC + "'> " + chC + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chD + "'> " + chD + "<br><br>";
                  $("#ex-question").append(html2Display);

              } else if (obj._questtype == 'wordmulti') {
                  question = obj._expression;
                  choices = obj._multichoice;
                  chA = choices[0];
                  chB = choices[1];
                  chC = choices[2];
                  chD = choices[3];
                  html2Display = html2Display + "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chA + "'> " + chA + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chB + "'> " + chB + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chC + "'> " + chC + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chD + "'> " + chD + "<br><br>";
                  $("#ex-question").append(html2Display);

              }
              var cqno = ++qno;
              $('.skip-exercise').attr("data-que-no", cqno);
              $(self).attr("data-que-no", cqno);
          } else if (exerciseArr.length == qno) {
			  var prevQue = exerciseArr[qno - 1];
              var ans = '';
              if (prevQue._questtype == 'word' || prevQue._questtype == 'expression') {
                  ans = $("input[name = choices]").val();
				  console.log(ans)
				  if(ans==''){
					alert("please enter your answer");
						return false;
					}
					else if(isNaN(ans)){
						alert("enter answer in numbers");
						return false;
						}
              } else if (prevQue._questtype == 'multiple' || prevQue._questtype == 'wordmulti') {
                  ans = $("input[type=radio][name = choices]:checked").val();
				  if(ans==undefined){
					alert("Please select answer");
						return false;
					}

              }
              if (ans === prevQue._missingTerm) {
                  ++rightAnsCount;
              } else {
                  ++wrongAnsCount;
              }

			  $('.skip-exercise').attr("data-que-no", -1);
              $(self).attr("data-que-no", -1);
          } else if (parseInt(qno) == -1) {
              $("#ex-question").empty();
              html2Display = "Right - " + rightAnsCount + "Wrong - " + wrongAnsCount + "skip-" + skipAnsCount;
              $("#ex-question").append(html2Display);
              $("#get-next-exercise").removeClass("display-none");
              $('.skip-exercise').addClass("display-none");
              $(self).addClass("display-none");

          }
      });


      $('.skip-exercise').on("click", function(e) {
          var self = $(this);
          var qno = parseInt(self.attr("data-que-no"));
          if ((exerciseArr.length != qno) && (qno > 0)) {
              var prevQue = exerciseArr[qno - 1];
              var ans = '';
              ++skipAnsCount;
              var html2Display = '';
              $("#ex-question").empty();
              var obj = exerciseArr[qno];
              var question, chA, chB, chC, chD;
              if (obj._questtype == 'word') {
                  question = obj._expression.replace(/\?/g, "<input type='text' id='input' name='choices' maxlength='5'>");
                  html2Display = "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  $("#ex-question").append(html2Display);
              } else if (obj._questtype == 'expression') {
                  question = obj._expression.replace(/\?/g, "<input type='text' id='input' name='choices' maxlength='5'>");
                  html2Display += "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  $("#ex-question").append(html2Display);
              } else if (obj._questtype == 'multiple') {
                  question = obj._expression;
                  choices = obj._multichoice;
                  chA = choices[0];
                  chB = choices[1];
                  chC = choices[2];
                  chD = choices[3];
                  html2Display = "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chA + "'> " + chA + "<br />";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chB + "'> " + chB + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chC + "'> " + chC + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chD + "'> " + chD + "<br><br>";
                  $("#ex-question").append(html2Display);

              } else if (obj._questtype == 'wordmulti') {
                  question = obj._expression;
                  choices = obj._multichoice;
                  chA = choices[0];
                  chB = choices[1];
                  chC = choices[2];
                  chD = choices[3];
                  html2Display = html2Display + "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chA + "'> " + chA + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chB + "'> " + chB + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chC + "'> " + chC + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chD + "'> " + chD + "<br><br>";
                  $("#ex-question").append(html2Display);

              }
              var cqno = ++qno;
              $('.next-exercise').attr("data-que-no", cqno);
              $(self).attr("data-que-no", cqno);
          } else if (exerciseArr.length == qno) {
			   ++skipAnsCount;

              $('.next-exercise').attr("data-que-no", -1);
              $(self).attr("data-que-no", -1);
          } else if (parseInt(qno) == -1) {
              $("#ex-question").empty();
              html2Display = "Right - " + rightAnsCount + "Wrong - " + wrongAnsCount + "skip-" + skipAnsCount;
              $("#ex-question").append(html2Display);
              $("#get-next-exercise").removeClass("display-none");
              $('.next-exercise').addClass("display-none");
              $(self).addClass("display-none");

          } else  {
              //$('.next-set').on("click", function(e){
              //displayExercises("exercises");
              //});
             // displayExercises("exercises");

          }
      });

      $('.next-test').on("click", function(e) {
		  var self = $(this);
          var qno = parseInt(self.attr("data-que-no"));
          if ((testArr.length != qno) && (qno > 0)) {
              var prevQue = testArr[qno - 1];
              var ans = '';

			  stopTestInterval();
			  startTestInterval();
			  if (prevQue._questtype == 'word' || prevQue._questtype == 'expression') {
                  ans = $("input[name = choices]").val();
				  if(ans.trim()==''){
					alert("please enter your answer");
						return false;
					}
					else if(isNaN(ans)){
						alert("enter answer in numbers only");
						return false;
						}

              } else if (prevQue._questtype == 'multiple' || prevQue._questtype == 'wordmulti') {
                  ans = $("input[type=radio][name = choices]:checked").val();
				  if(ans==undefined){
					alert("Please select answer");
						return false;
					}
              }
              if (ans === prevQue._missingTerm) {
                  ++rightAnsCount;
              } else {
                  ++wrongAnsCount;
              }
              var html2Display = '';
              $("#test-question").empty();
              var obj = testArr[qno];
              var question, chA, chB, chC, chD;
              if (obj._questtype == 'word') {
                  question = obj._expression.replace(/\?/g, "<input type='text' id='input' name='choices' maxlength='5'>");
                  html2Display = "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  $("#test-question").append(html2Display);
              } else if (obj._questtype == 'expression') {
                  question = obj._expression.replace(/\?/g, "<input type='text' id='input' name='choices' maxlength='5'>");
                  html2Display += "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  $("#test-question").append(html2Display);
              } else if (obj._questtype == 'multiple') {
                  question = obj._expression;
                  choices = obj._multichoice;
                  chA = choices[0];
                  chB = choices[1];
                  chC = choices[2];
                  chD = choices[3];
                  html2Display = "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chA + "'> " + chA + "<br />";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chB + "'> " + chB + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chC + "'> " + chC + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chD + "'> " + chD + "<br><br>";
                  $("#test-question").append(html2Display);

              } else if (obj._questtype == 'wordmulti') {
                  question = obj._expression;
                  choices = obj._multichoice;
                  chA = choices[0];
                  chB = choices[1];
                  chC = choices[2];
                  chD = choices[3];
                  html2Display = html2Display + "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chA + "'> " + chA + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chB + "'> " + chB + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chC + "'> " + chC + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chD + "'> " + chD + "<br><br>";
                  $("#test-question").append(html2Display);

              }
              var cqno = ++qno;
              $('.skip-test').attr("data-que-no", cqno);
              $(self).attr("data-que-no", cqno);
          } else if (testArr.length == qno) {
			  var prevQue = testArr[qno - 1];
              var ans = '';
			  if (prevQue._questtype == 'word' || prevQue._questtype == 'expression') {
                  ans = $("input[name = choices]").val();
				  if(ans.trim()==''){
					alert("please enter your answer");
						return false;
					}
					else if(isNaN(ans)){
						alert("enter answer in numbers only");
						return false;
						}

              } else if (prevQue._questtype == 'multiple' || prevQue._questtype == 'wordmulti') {
                  ans = $("input[type=radio][name = choices]:checked").val();
				  if(ans==undefined){
					alert("Please select answer");
						return false;
					}
              }
              if (ans === prevQue._missingTerm) {
                  ++rightAnsCount;
              } else {
                  ++wrongAnsCount;
              }
			  $('.skip-test').attr("data-que-no", -1);
			      $(self).attr("data-que-no", -1);
          } else if (parseInt(qno) == -1) {
			  stopTestInterval();
              $("#testtimerdiv").addClass("display-none");
              $("#test-question").empty();
              html2Display = "Right - " + rightAnsCount + "Wrong - " + wrongAnsCount + "skip-" + skipAnsCount;
              $("#test-question").append(html2Display);
              $("#get-next-test").removeClass("display-none");
              $('.skip-test').addClass("display-none");
              $(self).addClass("display-none");
          } else {

              //displayTests("tests");

          }

      });

      function displayNextTest(e) {
		 ++timer;
          var self = $(e);
          var qno = parseInt(self.attr("data-que-no"));
          if ((testArr.length != qno) && (qno > 0)) {
              var prevQue = testArr[qno - 1];
              var ans = '';
              ++skipAnsCount;
              var html2Display = '';
              $("#test-question").empty();
              var obj = testArr[qno];
              var question, chA, chB, chC, chD;
              if (obj._questtype == 'word') {
                  question = obj._expression.replace(/\?/g, "<input type='text' id='input' name='choices' maxlength='5'>");
                  html2Display = "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  $("#test-question").append(html2Display);
              } else if (obj._questtype == 'expression') {
                  question = obj._expression.replace(/\?/g, "<input type='text' id='input' name='choices' maxlength='5'>");
                  html2Display += "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  $("#test-question").append(html2Display);
              } else if (obj._questtype == 'multiple') {
                  question = obj._expression;
                  choices = obj._multichoice;
                  chA = choices[0];
                  chB = choices[1];
                  chC = choices[2];
                  chD = choices[3];
                  html2Display = "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chA + "'> " + chA + "<br />";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chB + "'> " + chB + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chC + "'> " + chC + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chD + "'> " + chD + "<br><br>";
                  $("#test-question").append(html2Display);

              } else if (obj._questtype == 'wordmulti') {
                  question = obj._expression;
                  choices = obj._multichoice;
                  chA = choices[0];
                  chB = choices[1];
                  chC = choices[2];
                  chD = choices[3];
                  html2Display = html2Display + "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chA + "'> " + chA + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chB + "'> " + chB + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chC + "'> " + chC + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chD + "'> " + chD + "<br><br>";
                  $("#test-question").append(html2Display);

              }
              var cqno = ++qno;
              $('.next-test').attr("data-que-no", cqno);
              $(self).attr("data-que-no", cqno);
          } else if (testArr.length == qno) {
			  ++skipAnsCount;
              $('.next-test').attr("data-que-no", -1);
			  $("#next-ex-test").removeClass("display-none");
              $(self).attr("data-que-no", -1);
          } else if (parseInt(qno) == -1) {
			  stopTestInterval();
              $("#testtimerdiv").addClass("display-none");
              $("#test-question").empty();
              html2Display = "Right - " + rightAnsCount + "Wrong - " + wrongAnsCount + "skip-" + skipAnsCount;
              $("#test-question").append(html2Display);
              $("#get-next-test").removeClass("display-none");
              $('.next-test').addClass("display-none");
              $(self).addClass("display-none");
          } else {

              //displayTests("tests");

          }
		  stopTestInterval();
		  startTestInterval();

      };


      $('.skip-test').on("click", function(e) {
          displayNextTest(this);
      });
	  $('#next-btn').on("click", function(e){
		//var qno=1;
		var self = $(this);
		var qno=parseInt(self.attr("data-que-no"));
		console.log(dataArr[qno]);
		if(dataArr.length != qno){
			var html2Display="Example"+qno+":/t"+dataArr[qno]._answer;
			$('#eq-json').html(html2Display);
			$(self).attr("data-que-no",++qno);
		}
		else{
			//$('#next-set').removeClass("display-none");
			displayExamples("examples");
			//$("#next-btn").addClass("display-none");
		}
    });
	//take test code from here
	 $('.next-tests').on("click", function(e) {
		  var self = $(this);
          var qno = parseInt(self.attr("data-que-no"));
          if ((testArr1.length != qno) && (qno > 0)) {
              var prevQue = testArr1[qno - 1];
              var ans = '';

			  stopTestIntervals();
			  startTestIntervals();
			  if (prevQue._questtype == 'word' || prevQue._questtype == 'expression') {
                  ans = $("input[name = choices]").val();
				  if(ans.trim()==''){
					alert("please enter your answer");
						return false;
					}
					else if(isNaN(ans)){
						alert("enter answer in numbers only");
						return false;
						}

              } else if (prevQue._questtype == 'multiple' || prevQue._questtype == 'wordmulti') {
                  ans = $("input[type=radio][name = choices]:checked").val();
				  if(ans==undefined){
					alert("Please select answer");
						return false;
					}
              }
              if (ans === prevQue._missingTerm) {
                  ++rightAnsCount;
              } else {
                  ++wrongAnsCount;
              }
              var html2Display = '';
              $("#take-test-question").empty();
              var obj = testArr1[qno];
              var question, chA, chB, chC, chD;
              if (obj._questtype == 'word') {
                  question = obj._expression.replace(/\?/g, "<input type='text' id='input' name='choices' maxlength='5'>");
                  html2Display = "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  $("#take-test-question").append(html2Display);
              } else if (obj._questtype == 'expression') {
                  question = obj._expression.replace(/\?/g, "<input type='text' id='input' name='choices' maxlength='5'>");
                  html2Display += "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  $("#take-test-question").append(html2Display);
              } else if (obj._questtype == 'multiple') {
                  question = obj._expression;
                  choices = obj._multichoice;
                  chA = choices[0];
                  chB = choices[1];
                  chC = choices[2];
                  chD = choices[3];
                  html2Display = "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chA + "'> " + chA + "<br />";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chB + "'> " + chB + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chC + "'> " + chC + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chD + "'> " + chD + "<br><br>";
                  $("#take-test-question").append(html2Display);

              } else if (obj._questtype == 'wordmulti') {
                  question = obj._expression;
                  choices = obj._multichoice;
                  chA = choices[0];
                  chB = choices[1];
                  chC = choices[2];
                  chD = choices[3];
                  html2Display = html2Display + "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chA + "'> " + chA + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chB + "'> " + chB + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chC + "'> " + chC + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chD + "'> " + chD + "<br><br>";
                  $("#take-test-question").append(html2Display);

              }
              var cqno = ++qno;
              $('.skip-tests').attr("data-que-no", cqno);
              $(self).attr("data-que-no", cqno);
          } else if (testArr1.length == qno) {
			  var prevQue = testArr1[qno - 1];
              var ans = '';
			  if (prevQue._questtype == 'word' || prevQue._questtype == 'expression') {
                  ans = $("input[name = choices]").val();
				  if(ans.trim()==''){
					alert("please enter your answer");
						return false;
					}
					else if(isNaN(ans)){
						alert("enter answer in numbers only");
						return false;
						}

              } else if (prevQue._questtype == 'multiple' || prevQue._questtype == 'wordmulti') {
                  ans = $("input[type=radio][name = choices]:checked").val();
				  if(ans==undefined){
					alert("Please select answer");
						return false;
					}
              }
              if (ans === prevQue._missingTerm) {
                  ++rightAnsCount;
              } else {
                  ++wrongAnsCount;
              }
			  $('.skip-tests').attr("data-que-no", -1);
			      $(self).attr("data-que-no", -1);
          } else if (parseInt(qno) == -1) {
			  stopTestIntervals();
              $("#teststimerdiv").addClass("display-none");
              $("#take-test-question").empty();
              html2Display = "Right - " + rightAnsCount + "Wrong - " + wrongAnsCount + "skip-" + skipAnsCount;
              $("#take-test-question").append(html2Display);
              $("#take-next-test").removeClass("display-none");
              $('.skip-tests').addClass("display-none");
			  $('#displaytest').removeClass("display");
              $(self).addClass("display-none");
			  $("#config-form").removeClass("display-none");



          } else {

              //displayTests("tests");

          }

      });

      function displayTakeTest(e) {
		 ++timer1;
          var self = $(e);
          var qno = parseInt(self.attr("data-que-no"));
          if ((testArr1.length != qno) && (qno > 0)) {
              var prevQue = testArr[qno - 1];
              var ans = '';
              ++skipAnsCount;
              var html2Display = '';
              $("#take-test-question").empty();
              var obj = testArr1[qno];
              var question, chA, chB, chC, chD;
              if (obj._questtype == 'word') {
                  question = obj._expression.replace(/\?/g, "<input type='text' id='input' name='choices' maxlength='5'>");
                  html2Display = "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  $("#take-test-question").append(html2Display);
              } else if (obj._questtype == 'expression') {
                  question = obj._expression.replace(/\?/g, "<input type='text' id='input' name='choices' maxlength='5'>");
                  html2Display += "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  $("#take-test-question").append(html2Display);
              } else if (obj._questtype == 'multiple') {
                  question = obj._expression;
                  choices = obj._multichoice;
                  chA = choices[0];
                  chB = choices[1];
                  chC = choices[2];
                  chD = choices[3];
                  html2Display = "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chA + "'> " + chA + "<br />";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chB + "'> " + chB + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chC + "'> " + chC + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chD + "'> " + chD + "<br><br>";
                  $("#take-test-question").append(html2Display);

              } else if (obj._questtype == 'wordmulti') {
                  question = obj._expression;
                  choices = obj._multichoice;
                  chA = choices[0];
                  chB = choices[1];
                  chC = choices[2];
                  chD = choices[3];
                  html2Display = html2Display + "<h3 id='question'>" + question + "<span id='message'></span></h3>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chA + "'> " + chA + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chB + "'> " + chB + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chC + "'> " + chC + "<br>";
                  html2Display = html2Display + "<input type='radio' name='choices' value='" + chD + "'> " + chD + "<br><br>";
                  $("#take-test-question").append(html2Display);

              }
              var cqno = ++qno;
              $('.next-tests').attr("data-que-no", cqno);
              $(self).attr("data-que-no", cqno);
          } else if (testArr1.length == qno) {
			  ++skipAnsCount;
              $('.next-tests').attr("data-que-no", -1);
			  $("#next-take-test").removeClass("display-none");
              $(self).attr("data-que-no", -1);
          } else if (parseInt(qno) == -1) {
			  stopTestInterval();
              $("#teststimerdiv").addClass("display-none");
              $("#take-test-question").empty();
              html2Display = "Right - " + rightAnsCount + "Wrong - " + wrongAnsCount + "skip-" + skipAnsCount;
              $("#take-test-question").append(html2Display);
              $("#get-next-test").removeClass("display-none");
              $('.next-tests').addClass("display-none");
			   $('#displaytest').removeClass("display");
              $(self).addClass("display-none");
              $("#config-form").removeClass("display-none");

          } else {

              //displayTests("tests");

          }
		  stopTestIntervals();
		  startTestIntervals();

      };


      $('.skip-tests').on("click", function(e) {
          displayTakeTest(this);
      });
	//take test code end



	$('a#pdfgen').on("click", function(e) {
		// Use the following function to get it by submitting Ajax - did not work
		//generateServerPDF();

		// Use the following code to call the class for popup download - did not work
		//event.stopPropagation(); // Do not propagate the event.
		//var postData = { 'postData' : 'pdfgen=10' };
		//var postData = 'pdfgen=10';
		// Create an object that will manage to download the file.
		//new AjaxDownloadFile({
		//    url: "cgi-bin/levels1to4.pl",
		//    data: postData
		//});
		//return false; // Do not submit the form.


		// Use the following code to display PDF in the same page
		// Overwrites everything on the page - works, but not suitable
                // Need to find a way to display in pop-up (download/save) window
		var url = "cgi-bin/Levels1to4/levels1to4.pl";
		var inputs = '<input type="hidden" name="action" value="pdfgen" />';
		inputs = inputs + '<input type="hidden" name="SESSION_LID" value="10" />';
		inputs = inputs + '<input type="hidden" name="SESSION_GID" value="nysmith" />';
		inputs = inputs + '<input type="hidden" name="SESSION_UID" value="reddy" />';
		// send request by creating temporary form with inputs, submit it, and remove it.
		// Response from URL follows default action (display PDF output in the same page).
                window.open('about:blank', '_blank_popup', 'width=400,height=400,resizeable=yes,location=0,toolbar=0');
		jQuery('<form action="' + url + '" method="post" target=_blank_popup>' + inputs + '</form>').appendTo('body').submit().remove();
	});
});
