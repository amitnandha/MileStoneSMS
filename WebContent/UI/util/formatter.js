jQuery.sap.declare("com.itec.sams.util.formatter");
jQuery.sap.require("sap.ui.core.format.DateFormat");

com.itec.sams.util.formatter = {
	date : function(value) {
		if (value) {
			var oDateFormat = sap.ui.core.format.DateFormat
					.getDateTimeInstance({
						pattern : "dd-MM-yyyy"
					});
			return oDateFormat.format(new Date(value));
		} else {
			return null;
		}
	},
	
	time : function(value) {
		if (value) {
			var oDateFormat = sap.ui.core.format.DateFormat
					.getDateTimeInstance({
						pattern : "hh:mm a"
					});
			return oDateFormat.format(new Date(value));
		} else {
			return null;
		}
	},
	
	dateWEFormat : function(value) {
		if (value) {
			var oDateFormat = sap.ui.core.format.DateFormat
					.getDateTimeInstance({
						pattern : "dd-MM-yyyy"
					});
			var dt = new Date(value);
			if(dt.getFullYear() === 9999 && dt.getMonth()+1 === 12 && dt.getDate() === 31)
				return "Till Date.";
			else			
				return oDateFormat.format(dt);
		} else {
			return "-";
		}
	},
	lastUpdateDate:function(value){
		if (value) {
			var oDateFormat = sap.ui.core.format.DateFormat
					.getDateTimeInstance({
						pattern : "dd-MM-yyyy"
					});
			var dt = new Date(value);
			if(dt.getFullYear() === 9999 && dt.getMonth()+1 === 12 && dt.getDate() === 31)
				return "-";
			else			
				return oDateFormat.format(dt);
		} else {
			return "-";
		}
	},
	dateFormat : function(value) {
		if (value == undefined || value == null || value == "0000-00-00T00:00:00")
			return "0000-00-00T00:00:00";
		else {
			var _smonth = value.getMonth() + 1;
			var _sdate = value.getDate();
			if (_smonth.toString().length < 2) {
				_smonth = "0" + _smonth.toString();
			}
			if (_sdate.toString().length < 2) {
				_sdate = "0" + _sdate.toString();
			}
			var formatDate = value.getFullYear() + '-' + _smonth + '-' + _sdate
					+ "T00:00:00";
			return formatDate;
		}
	},
	dateTimeFormat : function(value) {
		if (value) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern : "dd-MMM-yyyy HH:mm:ss"
			});
			return oDateFormat.format(new Date(value));
		}
	},
	setSelected:function(value){
		if(value!="")
			return true;
		else
			return false;
	},
	getSelected:function(value){
		if(value === true)
			return "X";
		else
			return "";
	},
	getAge : function(birth) {
		if (birth) {
			var today = new Date();
			var nowyear = today.getFullYear();
			var nowmonth = today.getMonth();
			var nowday = today.getDate();

			var birthyear = birth.getFullYear();
			var birthmonth = birth.getMonth();
			var birthday = birth.getDate();

			var age = nowyear - birthyear;
			var age_month = nowmonth - birthmonth;
			var age_day = nowday - birthday;

			if (age_month < 0 || (age_month == 0 && age_day < 0)) {
				age = parseInt(age) - 1;
			}
			return age;
		} else {
			return 0;
		}

	},
	getMonthText:function(value){
		if(value === "1")
			return "January";
		else if(value === "2")
			return "February";
		else if(value === "3")
			return "March";
		else if(value === "4")
			return "April";
		else if(value === "5")
			return "May";
		else if(value === "6")
			return "June";
		else if(value === "7")
			return "July";
		else if(value === "8")
			return "August";
		else if(value === "9")
			return "September";
		else if(value === "10")
			return "October";
		else if(value === "11")
			return "November";
		else if(value === "12")
			return "December";
		else
			return "";
	},
	getSwitchState : function(str){
		if(str == "True"){
			return "P";
		}else if(str == "False"){
			return "A";
		}else{
//			return "V";
			this.setSelectedButton("test");
		}
	},
	
	getPreAbs : function(isVerify){
		if(isVerify == "True"){
			return "Present";
		}
		
		if(isVerify == "False"){
			return "Absent";
		}
		
		if(isVerify == ""){
			return "";
		}
	},
	
	stateIcon : function(msgType){
		if(msgType == "S"){
			this.setColor("Green");
			return "sap-icon://accept";
		}else{
			this.setColor("Red");
			return "sap-icon://status-error";
		}
	}
};