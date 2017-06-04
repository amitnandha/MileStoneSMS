jQuery.sap.declare("com.itec.sams.util.validator");
com.itec.sams.util.validator = {
	validateNumber:function(value){
		var regex = /^[0-9]+$/;
		if (regex.test(value) === true)
			return true;
		else 
			return false;
	},
	validateDecimal:function(value){
		var regex = /^(\d{0,2})+(\.\d{0,2})?$/g;;
		if (regex.test(value) === true)
			return true;
		else 
			return false;
	},
	validateAlphaNumeric:function(value){
		var regex = /^[A-Za-z0-9]{0,16}$/;
		if (regex.test(value) === true)
			return true;
		else 
			return false;
	},
	validateAlphabets:function(value){
		var regex = /^[A-Za-z]+$/;
		if (regex.test(value) === true)
			return true;
		else 
			return false;
	},
	validateEmail:function(value){
		var regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		if (regex.test(value) === true)
			return true;
		else 
			return false;
	},
	validateDateFormat:function(value){
		var regex = /^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
		if (regex.test(value) === true)
			return true;
		else 
			return false;
	},
	validateDateTimeFormatWithAMPM:function(value){
		var regex = /(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})[\s](\w)[AMPMampm]/g;
		if (regex.test(value) === true)
			return true;
		else 
			return false;
	},
	validateDateTimeFormat24Hr:function(value){
		var regex = /(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/g;
		if (regex.test(value) === true)
			return true;
		else 
			return false;
	},
	valueStateFormat:function(sView, sId, sValue){
		var sElement = sView.byId(sId);
		var valueState = false;
		if(sElement.getMetadata().getName() === "sap.m.Select"){
			if((sElement.getSelectedIndex() === 0 || sElement.getSelectedIndex() === -1)
					&& (sValue === null || sValue === true))
				valueState = true;
			else
				valueState = false;
		}else if(sElement.getMetadata().getName() === "sap.m.Input"){
			if(sElement.getValue() === "" && (sValue === null || sValue === true))
				valueState = true;
			else
				valueState = false;
		}else if(sElement.getMetadata().getName() === "sap.m.TextArea"){
			if(sElement.getValue() === "" && (sValue === null || sValue === true))
				valueState = true;
			else
				valueState = false;
		}else if(sElement.getMetadata().getName() === "sap.m.DatePicker"){
			if((sElement.getValue() === "" && sElement.getDateValue() === null ) 
					&& (sValue === null || sValue === true))
				valueState = true;
			else
				valueState = false;
		}else if(sElement.getMetadata().getName() === "sap.m.RadioButton"){
				valueState = sValue;
		}else if(sElement.getMetadata().getName() === "sap.m.CheckBox"){
				valueState = sValue;
		}
		
		if(valueState === true)
			sElement.addStyleClass("controlValueStateError");
		else 
			sElement.removeStyleClass("controlValueStateError");
	}
};