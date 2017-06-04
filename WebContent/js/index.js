  $(document).ready(function() {
      $("#username_txtId").val("");
      $('#password_txtId').val("");
      if (sessionStorage.length > 0)
          window.location.href = window.location.pathname.replace("index.html", "") + "UI/index.html";
      function init(){
    	  alert("Hello");
      };
      
      function getBaseUrl(key) {
          var origin = "http://localhost:54500";
          if (key === "API")
              return origin + "/api/SMSAppSrv/";
          else
              return origin;
      };

      function postAPIData(entitySet, query) {
          var errResponse = {
              msgType: "",
              msg: ""
          };
          var apiResponse = {};
          try {
              $.ajax({
                  url: getBaseUrl("API") + entitySet,
                  data: query,
                  type: 'POST',
                  async: false,
                  success: function(oData, oResponse) {
                      apiResponse = oData;
                  },
                  error : function(xhr, status, error){
  					errResponse.msgType = "E";
  					errResponse.msg = error.name === "NetworkError" ? "Please check your network." : error.message;
  				 }
              });
          } catch (err) {
              errResponse.msgType = "E";
              errResponse.msg = err.message;
          }

          if (errResponse.msgType === "E") {
              apiResponse = null;
              $("#errorAlert").text(errResponse.msg);
              $('.alert').fadeIn(500);
              setTimeout("$('.alert').fadeOut(1500);", 3000);
          }

          return apiResponse;
      };

      function getAPIData(entitySet, query) {
          var errResponse = {
              msgType: "",
              msg: ""
          };
          var apiResponse = {};
          try {
              $.ajax({
                  url: getBaseUrl("API") + entitySet,
                  data: query,
                  type: 'GET',
                  async: false,
                  success: function(oData, oResponse) {
                      apiResponse = oData;
                  },
                  error : function(xhr, status, error){
  					errResponse.msgType = "E";
  					errResponse.msg = error.name === "NetworkError" ? "Please check your network." : error.message;
  				 }
              });
          } catch (err) {
              errResponse.msgType = "E";
              errResponse.msg = err.message;
          }

          if (errResponse.msgType === "E") {
              apiResponse = null;
              $("#errorAlert").text(errResponse.msg);
              $('.alert').fadeIn(500);
              setTimeout("$('.alert').fadeOut(1500);", 3000);
          }

          return apiResponse;
      };
      $('.log-btn').click(function() {
          var err = false;
          if ($('#username_txtId').val() === "" && $('#password_txtId').val() === "") {
              err = true;
              $("#errorAlert").text("Enter Username & Password.");
              $('.log-status-user').addClass('wrong-entry');
              $('.log-status-password').addClass('wrong-entry');
          } else if ($('#username_txtId').val() != "" && $('#password_txtId').val() === "") {
              err = true;
              $("#errorAlert").text("Enter Password.");
              $('.log-status-password').addClass('wrong-entry');
          } else if ($('#username_txtId').val() === "" && $('#password_txtId').val() != "") {
              err = true;
              $("#errorAlert").text("Enter Username.");
              $('.log-status-user').addClass('wrong-entry');
          } else {
              var query = {
                  userName: $('#username_txtId').val(),
                  password: $('#password_txtId').val()
              };
              var response = postAPIData("userAuthSet", query);
              if (response != null && response != "") {
                  if (response.msgType === "S") {
                      sessionStorage.setItem('cityName', response.cityName);
                      sessionStorage.setItem('schoolId', response.schoolId);
                      sessionStorage.setItem('schoolName', response.schoolName);
                      sessionStorage.setItem('userId', response.userId);
                      sessionStorage.setItem('userName', response.userName);
                      //Navigate to Home Page
                      window.location.href = window.location.pathname.replace("index.html", "") + "UI/index.html";
                  } else {
                      err = true;
                      $("#errorAlert").text(response.msg);
                  }
              }
          }

          if (err === true) {
              $('.alert').fadeIn(500);
              setTimeout("$('.alert').fadeOut(1000);", 6000);
          }
      });
      $('#username_txtId').keypress(function() {
          $('.log-status-user').removeClass('wrong-entry');
      });
      $('#password_txtId').keypress(function() {
          $('.log-status-password').removeClass('wrong-entry');
      });
  });
  $(document).keypress(function(e) {
      if (e.which == 13) {
          $(".log-btn").click();
      }
  });
  $(document).on("pageload", function() {
      if (sessionStorage.length > 0)
          window.location.href = window.location.pathname.replace("index.html", "") + "UI/index.html";
  });