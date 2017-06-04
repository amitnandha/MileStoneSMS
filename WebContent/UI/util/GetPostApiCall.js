jQuery.sap.declare("com.itec.sams.util.GetPostApiCall");
jQuery.sap.require("sap.m.MessageBox");
com.itec.sams.util.GetPostApiCall = {
	getBaseUrl:function(key){
		var origin = "http://localhost:54500";
		if(key === "API")
			return origin + "/api/SMSAppSrv/";
		else
			return origin;
	},
	postData:function(entitySet, query){
		var errResponse = {msgType: "",	msg:""}; var apiResponse = {};
		try{
			$.ajax({
				url : com.itec.sams.util.GetPostApiCall.getBaseUrl("API") + entitySet,
				data : query,
				type : 'POST',
				async : false,
				crossDomain:true,
				success: function (oData, oResponse) {
					apiResponse = oData;
				},
				error : function(xhr,status,error){
					errResponse.msgType = "E";
					errResponse.msg = error.name === "NetworkError" ? "Please check your network." : error.message;
				}
			});
		}catch(err){
			errResponse.msgType = "E";
			errResponse.msg = err.message;
		}
		
		if(errResponse.msgType === "E"){
			sap.m.MessageBox.show(errResponse.msg, sap.m.MessageBox.Icon.ERROR, "Error");
			apiResponse = null;
		}
		
		return apiResponse;
	},
	getData:function(sURI){
		var errResponse = {msgType: "",	msg:""}; var apiResponse = {};
		try{
			$.ajax({
				url : com.itec.sams.util.GetPostApiCall.getBaseUrl("API") + sURI,
				type : 'GET',
				async : false,
				crossDomain:true,
				success: function (oData, oResponse) {
					apiResponse = oData;
				},
				error : function(xhr, status, error){
					errResponse.msgType = "E";
					errResponse.msg = error.name === "NetworkError" ? "Please check your network." : error.message;
				}
			});
		}catch(err){
			errResponse.msgType = "E";
			errResponse.msg = err.message;
		}

		if(errResponse.msgType === "E"){
			sap.m.MessageBox.show(errResponse.msg, sap.m.MessageBox.Icon.ERROR, "Error");
			apiResponse = null;
		}
		
		return apiResponse;
	},
};