	  $(function() {

      function DumpObjectIndented(obj, indent) {
          var result = "";
          if (indent == null) indent = "";

          for (var property in obj) {
              var value = obj[property];
              if (typeof value == 'string')
                  value = "'" + value + "'";
              else if (typeof value == 'object') {
                  if (value instanceof Array) {
                      // Just let JS convert the Array to a string!
                      value = "[ " + value + " ]";
                  } else {
                      // Recursive dump
                      // (replace "  " by "\t" or something else if you prefer)
                      var od = DumpObjectIndented(value, indent + "<br>");
                      // If you like { on the same line as the key
                      //value = "{\n" + od + "\n" + indent + "}";
                      // If you prefer { and } to be aligned
                      value = "\n" + indent + "{\n" + od + "\n" + indent + "}";
                  }
              }
              result += indent + "'" + property + "' : " + value + ",\n";
          }
          return result.replace(/,\n$/, "");
      }

      function urlParam(name) {
          var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(top.window.location.href);
          return (results !== null) ? results[1] : undefined;
      };

      function getLesson(action) {
          console.log("lessons clicked");
          $("#next-btn").addClass("display-none");
          var postData = {
              'postData': 'questions=10'
          };
          if (action == 'lesson') {
              postData = {
                  'postData': 'lesson=10'
              }
          };
          var $render = $('#eq-render'),
              $jsontext = $('#eq-json');

          $.ajax({
              type: "POST",
              url: "cgi-bin/Levels1to4/levels1to4.pl",
              data: postData,
              // dataType: 'json',
             // timeout: 2000,
              crossDomain: true,
              beforeSend: function(xhr) {
                  $render.empty();
                  $jsontext.empty();
              },
              error: function(jqXHR, textStatus, errorThrown) {
                  $jsontext.html('<h2>' + textStatus + '</h2><p>' + errorThrown + '</p>');
                  alert('FAILED: Either it is taking too long or generator failed.' + textStatus);
              },
              success: function(data, textStatus, jqXHR) {
                  if (!data) {
                      $('.eq').html('<h2>Server not available.</h2><p>Please try again later. We apologize for the inconvenience.</p>');
                      return false;
                  }
                  $("#main-example").removeClass("display-none");
                  $("#exercise-container").addClass("display-none");
                  $("#test-container").addClass("display-none");
                  var html2Display = data;
                  $render.html('\\[' + data + '\\]');
                  $jsontext.html(html2Display);
              }
          });
      };
      var dataArr = [];

      function displayExamples(action) {
          var postData = {
              'postData': 'questions=10'
          };
          if (action == 'lesson') {
              postData = {
                  'postData': 'lesson=10'
              }
          };
          var $render = $('#eq-render'),
              $jsontext = $('#eq-json');

          $.ajax({
              type: "POST",
              url: "cgi-bin/Levels1to4/levels1to4.pl",
              data: postData,
              dataType: 'json',
              //timeout: 2000,
              crossDomain: true,
              beforeSend: function(xhr) {
                  $render.empty();
                  $jsontext.empty();
              },
              error: function(jqXHR, textStatus, errorThrown) {
                  $jsontext.html('<h2>' + textStatus + '</h2><p>' + errorThrown + '</p>');
                  alert('FAILED: Either it is taking too long or generator failed.' + textStatus);
              },
              success: function(data, textStatus, jqXHR) {
                  console.log(data);
                  if (!data) {
                      $('.eq').html('<h2>Server not available.</h2><p>Please try again latergize for the inc. We apoloonvenience.</p>');
                      return false;
                  } else {
                      $("#main-example").removeClass("display-none");
                      $("#exercise-container").addClass("display-none");
                      $("#test-container").addClass("display-none");
                      dataArr = data;
                      //console.log(dataArr[0]);
                      var html2Display = "Example 1" + ":\t " + dataArr[1]._answer;
                      $('#eq-json').html(html2Display);
                      $("#next-btn").removeClass("display-none");
					  $('#next-btn').attr("data-que-no", 2);
                  }
                  data.shift();
                  dataArr = data;
                  MathJax.Hub.Typeset();
              }
          });
      };
      var exerciseArr = [];

      function displayExercises(action) {

          var postData = {
              'postData': 'questions=10'
          };
          if (action == 'lesson') {
              postData = {
                  'postData': 'lesson=10'
              }
          };
          var $render = $('#eq-render'),
              $jsontext = $('#eq-json');

          $.ajax({
              type: "POST",
              url: "cgi-bin/Levels1to4/levels1to4.pl",
              data: postData,
              dataType: 'json',
              //timeout: 2000,
              crossDomain: true,
              beforeSend: function(xhr) {
                  $render.empty();
                  $jsontext.empty();
                  $("#ex-question").empty();
              },
              error: function(jqXHR, textStatus, errorThrown) {
                  $jsontext.html('<h2>' + textStatus + '</h2><p>' + errorThrown + '</p>');
                  alert('FAILED: Either it is taking too long or generator failed.' + textStatus);
              },
              success: function(data, textStatus, jqXHR) {
                  if (!data) {
                      $('.eq').html('<h2>Server not available.</h2><p>Please try again later. We apologize for the inconvenience.</p>');
                      return false;
                  } else {
                      $("#main-example").addClass("display-none");
                      $("#exercise-container").removeClass("display-none");
                      $("#test-container").addClass("display-none");
                      console.log("inside excersice data");
                      exerciseArr = data;
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
              }
          });
      };
      var testArr = [];
	   var timer = 60;

      function displayTests(action) {
          var postData = {
              'postData': 'questions=10'
          };
          if (action == 'lesson') {
              postData = {
                  'postData': 'lesson=10'
              }
          };
          var $render = $('#eq-render'),
              $jsontext = $('#eq-json');
          $.ajax({
              type: "POST",
              url: "cgi-bin/Levels1to4/levels1to4.pl",
              data: postData,
              dataType: 'json',
              //timeout: 2000,
              crossDomain: true,
              beforeSend: function(xhr) {
                  $render.empty();
                  $jsontext.empty();
              },
              error: function(jqXHR, textStatus, errorThrown) {
                  $jsontext.html('<h2>' + textStatus + '</h2><p>' + errorThrown + '</p>');
                  alert('FAILED: Either it is taking too long or generator failed.' + textStatus);
              },
              success: function(data, textStatus, jqXHR) {
                  if (!data) {
                      console.log(data);
                      $('.eq').html('<h2>Server not available.</h2><p>Please try again later. We apologize for the inconvenience.</p>');
                      return false;
                  } else {
                      $("#main-example").addClass("display-none");
                      $("#exercise-container").addClass("display-none");
                      $("#test-container").removeClass("display-none");
                      console.log("inside test data");
                      console.log(data);
                      testArr = data;
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
              }
          });
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
          var postData = {
              'postData': 'questions=10'
          };
          if (action == 'lesson') {
              postData = {
                  'postData': 'lesson=10'
              }
          };
          var $render = $('#eq-render'),
              $jsontext = $('#eq-json');
          $.ajax({
              type: "POST",
              url: "cgi-bin/Levels1to4/levels1to4.pl",
              data: postData,
              dataType: 'json',
              timeout: 2000,
              crossDomain: true,
              beforeSend: function(xhr) {
                  $render.empty();
                  $jsontext.empty();
              },
              error: function(jqXHR, textStatus, errorThrown) {
                  $jsontext.html('<h2>' + textStatus + '</h2><p>' + errorThrown + '</p>');
                  alert('FAILED: Either it is taking too long or generator failed.' + textStatus);
              },
              success: function(data, textStatus, jqXHR) {
                  if (!data) {
                      console.log(data);
                      $('.eq').html('<h2>Server not available.</h2><p>Please try again later. We apologize for the inconvenience.</p>');
                      return false;
                  } else {
                      $("#main-example").addClass("display-none");
                      $("#exercise-container").addClass("display-none");
					  $("#test-container").addClass("display-none");
                      $("#take-test-container").removeClass("display-none");
                      $("#config-form").addClass("display-none");
                      console.log("inside test data");
					  console.log(data);
                      testArr1 = data;
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
              }
          });
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
	      $('a#lesson').on("click", function(e) {
          getLesson("lesson");
      });

      $('a#examples').on("click", function(e) {
          displayExamples("examples");
      });

      $('a#exercises').on("click", function(e) {
          displayExercises("exercises");
      });

      $('a#tests').on("click", function(e) {
          displayTests("tests");
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
      if (urlParam("train")) {
          // Shortcut to clear canvas + submit strokes.
          $(document).on("keydown", function(e) {
              //if (e.ctrlKey && e.which == 65) { // This can be exhausting.
              if (e.which == 45 || e.which == 96) { // Better be pressing a single key, e.g. INS.
                  e.preventDefault();
              }
          });
      }

      // Render LaTeX math expressions on page load.
      MathJax.Hub.Config({
          showMathMenu: false
      });
      MathJax.Hub.Typeset();
  });