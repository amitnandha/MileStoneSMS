jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
jQuery.sap.require("com.itec.sams.util.formatter");
jQuery.sap.require("com.itec.sams.util.validator");
sap.ui.core.mvc.Controller.extend("com.itec.sams.controller.staffEnrollmentDetail", {
    onInit: function() {
        staffEnrollDtl_context = this;
        this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
        this._oComponent = sap.ui.component(sap.ui.core.Component
            .getOwnerIdFor(this.getView()));
        if (this._oComponent._appRefresh == undefined) {
            comGlob.schoolData = {
                cityName: sessionStorage.getItem('cityName'),
                schoolId: sessionStorage.getItem('schoolId'),
                schoolName: sessionStorage.getItem('schoolName'),
                userId: sessionStorage.getItem('userId'),
                userName: sessionStorage.getItem('userName')
            }
        }
    },
    onRouteMatched: function(evt) {
        var sName = evt.getParameter("name");
        if (sName !== "StaffEnrollmentDetail") {
            return;
        } else {
            oPageTitle.setText("Staff Enrollment Detail");
            var contextModel = sap.ui.getCore().getModel("contextModel");
            if (contextModel != undefined) {
            	oBusyDialog.open();
                jQuery.sap.delayedCall(1, this, function() {
                    staffEnrollDtl_context.initialLoad();
                });
            } else {
                var bReplace = jQuery.device.is.phone ? false : true;
                staffEnrollDtl_context.getRouter().navTo("StaffEnrollment", bReplace);
            }
            
        }
    },
    getEventBus: function() {
        return sap.ui.getCore().getEventBus();
    },
    getRouter: function() {
        return sap.ui.core.UIComponent.getRouterFor(this);
    },
    onNavBack: function(evt) {
        var cModelData = sap.ui.getCore().getModel("contextModel").getData();
        if (cModelData.mode != "DISPLAY") {
            sap.m.MessageBox.confirm("Are you sure want to cancel?", {
                icon: sap.m.MessageBox.Icon.QUESION,
                title: "Confirmation",
                action: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                styleClass: "sapUiSizeCompact",
                onClose: function(action) {
                    if (action === "OK") {
                        sap.ui.getCore().setModel(null, "contextModel");
                        var bReplace = jQuery.device.is.phone ? false : true;
                        staffEnrollDtl_context.getRouter().navTo("StaffEnrollment", bReplace);
                    }
                }
            });
        } else {
            sap.ui.getCore().setModel(null, "contextModel");
            var bReplace = jQuery.device.is.phone ? false : true;
            staffEnrollDtl_context.getRouter().navTo("StaffEnrollment", bReplace);
        }
    },
    initialLoad: function() {
    	staffEnrollDtl_context.resetStaffEnrollmentDtl();
    	
    	 ///GET Gender Drop Down
        var queryGender = {
            mode: "GENDER",
            schoolId: sessionStorage.getItem('schoolId'),
            key: ""
        };
        var oGenderResponse = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", queryGender);
        if (oGenderResponse != null)
            staffEnrollDtl_context.bindDropDown("gender_selId", oGenderResponse);

        var queryStatus = {
            mode: "STATUS",
            schoolId: sessionStorage.getItem('schoolId'),
            key: ""
        };
        var oStatusResponse = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", queryStatus);
        if (oStatusResponse != null)
            staffEnrollDtl_context.bindDropDown("status_selId", oStatusResponse);
    	
    	var oCModelData = sap.ui.getCore().getModel("contextModel").getData();
    	
    	if(oCModelData.mode === "ADD")
    		staffEnrollDtl_context.setStaffEnrollmentDtlEnabled(true);
    	else if(oCModelData.mode === "EDIT"){
    		staffEnrollDtl_context.setStaffEnrollmentDtlEnabled(true);
    		staffEnrollDtl_context.bindStaffEnrollmentDtl(oCModelData.tableData);
    	}else {
    		staffEnrollDtl_context.setStaffEnrollmentDtlEnabled(false);
    		staffEnrollDtl_context.bindStaffEnrollmentDtl(oCModelData.tableData);
    	}
       

        oBusyDialog.close();
    },
    bindDropDown: function(sId, mData) {
        var oSelect = staffEnrollDtl_context.getView().byId(sId);
        var selectTemplate = new sap.ui.core.Item({
            key: "{key}",
            text: "{value}",
        });
        oSelect.setModel(new sap.ui.model.json.JSONModel(mData));
        oSelect.bindAggregation("items", {
            path: "/navHelpDialog",
            template: selectTemplate
        });
    },
    resetStaffEnrollmentDtl:function(){
    	var oView = staffEnrollDtl_context.getView();
    	oView.byId("fName_txtId").setValue("");
    	oView.byId("empNo_txtId").setValue("");
    	oView.byId("dob_txtId").setValue("");
    	oView.byId("dob_txtId").setDateValue(null);
    	oView.byId("cardNumber_txtId").removeAllCustomData();
    	oView.byId("cardNumber_txtId").setValue("");
    	oView.byId("panNo_txtId").setValue("");
    	oView.byId("mobileNumber_txtId").setValue("");
    	oView.byId("alternateNumber_txtId").setValue("");
    	oView.byId("email_txtId").setValue("");
    	oView.byId("alternateEmailId_txtId").setValue("");
    	oView.byId("lName_txtId").setValue("");
    	oView.byId("gender_selId").setSelectedKey("");
    	oView.byId("department_txtId").removeAllCustomData();
    	oView.byId("department_txtId").setValue("");
    	oView.byId("designation_txtId").removeAllCustomData();
    	oView.byId("designation_txtId").setValue("");
    	oView.byId("aadhaarNo_txtId").setValue("");
    	oView.byId("userName_txtId").setValue("");
    	oView.byId("password_txtId").setValue("");
    	oView.byId("cnfrmPassword_txtId").setValue("");
    	oView.byId("status_selId").setSelectedKey("");
    	oView.byId("perm_streetAddress_txtId").setValue("");
    	oView.byId("perm_locality_txtId").setValue("");
    	oView.byId("perm_state_txtId").removeAllCustomData();
    	oView.byId("perm_state_txtId").setValue("");
    	oView.byId("perm_city_txtId").removeAllCustomData();
    	oView.byId("perm_city_txtId").setValue("");
    	oView.byId("perm_pinCode_txtId").setValue("");
    	oView.byId("sameAsPermanent_cBoxId").setSelected(false);
    	oView.byId("streetAddress_txtId").setValue("");
    	oView.byId("locality_txtId").setValue("");
    	oView.byId("state_txtId").removeAllCustomData();
    	oView.byId("state_txtId").setValue("");
    	oView.byId("city_txtId").removeAllCustomData();
    	oView.byId("city_txtId").setValue("");
    	oView.byId("pinCode_txtId").setValue("");
    },
    setStaffEnrollmentDtlEnabled:function(isEnabled){
    	var oCModelData = sap.ui.getCore().getModel("contextModel").getData();
    	var oView = staffEnrollDtl_context.getView();
    	oView.byId("fName_txtId").setEnabled(isEnabled);
    	oView.byId("empNo_txtId").setEnabled(isEnabled);
    	oView.byId("dob_txtId").setEnabled(isEnabled);
    	oView.byId("cardNumber_txtId").setEnabled(isEnabled);
    	oView.byId("panNo_txtId").setEnabled(isEnabled);
    	oView.byId("mobileNumber_txtId").setEnabled(isEnabled);
    	oView.byId("alternateNumber_txtId").setEnabled(isEnabled);
    	oView.byId("email_txtId").setEnabled(isEnabled);
    	oView.byId("alternateEmailId_txtId").setEnabled(isEnabled);
    	oView.byId("lName_txtId").setEnabled(isEnabled);
    	oView.byId("gender_selId").setEnabled(isEnabled);
    	oView.byId("department_txtId").setEnabled(isEnabled);
    	oView.byId("designation_txtId").setEnabled(isEnabled);
    	oView.byId("aadhaarNo_txtId").setEnabled(isEnabled);
    	if(oCModelData.mode === "ADD"){
    		oView.byId("userName_txtId").setEnabled(true);
    		oView.byId("password_txtId").setEnabled(true);
    		oView.byId("cnfrmPassword_txtId").setEnabled(true);
    	}else{
    		oView.byId("userName_txtId").setEnabled(false);
    		oView.byId("password_txtId").setEnabled(false);
    		oView.byId("cnfrmPassword_txtId").setEnabled(false);
    	}
    	oView.byId("status_selId").setEnabled(isEnabled);
    	oView.byId("perm_streetAddress_txtId").setEnabled(isEnabled);
    	oView.byId("perm_locality_txtId").setEnabled(isEnabled);
    	oView.byId("perm_state_txtId").setEnabled(isEnabled);
    	oView.byId("perm_city_txtId").setEnabled(isEnabled);
    	oView.byId("perm_pinCode_txtId").setEnabled(isEnabled);
    	oView.byId("sameAsPermanent_cBoxId").setEnabled(isEnabled);
    	oView.byId("streetAddress_txtId").setEnabled(isEnabled);
    	oView.byId("locality_txtId").setEnabled(isEnabled);
    	oView.byId("state_txtId").setEnabled(isEnabled);
    	oView.byId("city_txtId").setEnabled(isEnabled);
    	oView.byId("pinCode_txtId").setEnabled(isEnabled);
    	if(oCModelData.mode === "DISPLAY")
    		oView.byId("sumit_staffEnrollDtl_btnId").setVisible(false);
    	else
    		oView.byId("sumit_staffEnrollDtl_btnId").setVisible(isEnabled);
    },
    bindStaffEnrollmentDtl:function(mData){
    	var oView = staffEnrollDtl_context.getView();
    	oView.byId("fName_txtId").setValue(mData.firstName);
    	oView.byId("empNo_txtId").setValue(mData.EmployeeNo);
    	oView.byId("dob_txtId").setValue(com.itec.sams.util.formatter.date(mData.dateOfBirth));
    	oView.byId("cardNumber_txtId").removeAllCustomData();
    	oView.byId("cardNumber_txtId").setValue(mData.cardNumber);
    	oView.byId("cardNumber_txtId").addCustomData(new sap.ui.core.CustomData({
    		key:"key",
    		value:mData.cardId
    	}));
    	oView.byId("panNo_txtId").setValue(mData.panCardNo);
    	oView.byId("mobileNumber_txtId").setValue(mData.mobileNo);
    	oView.byId("alternateNumber_txtId").setValue(mData.alternateMobileNo);
    	oView.byId("email_txtId").setValue(mData.emailId);
    	oView.byId("alternateEmailId_txtId").setValue(mData.alternateEmailId);
    	oView.byId("lName_txtId").setValue(mData.lastName);
    	oView.byId("gender_selId").setSelectedKey(mData.genderKey);
    	oView.byId("department_txtId").removeAllCustomData();
    	oView.byId("department_txtId").setValue(mData.departmentName);
    	oView.byId("department_txtId").addCustomData(new sap.ui.core.CustomData({
    		key:"key",
    		value:mData.departmentId
    	}));
    	oView.byId("designation_txtId").removeAllCustomData();
    	oView.byId("designation_txtId").setValue(mData.designationName);
    	oView.byId("designation_txtId").addCustomData(new sap.ui.core.CustomData({
    		key:"key",
    		value:mData.designationId
    	}));
    	oView.byId("aadhaarNo_txtId").setValue(mData.aadharCardNo);
    	oView.byId("userName_txtId").removeAllCustomData();
    	oView.byId("userName_txtId").setValue(mData.userName);
    	oView.byId("userName_txtId").addCustomData(new sap.ui.core.CustomData({
    		key:"key",
    		value:mData.userId
    	}));
    	
    	var password = "";
    	var sUri = "encryptDecryptGet?mode=DECRYPT&value=" + mData.password;
        var oResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
        if(oResponse){
        	password = oResponse.msg;
        	oView.byId("password_txtId").setValue(password);
        	oView.byId("cnfrmPassword_txtId").setValue(password);
        }
    	
    	oView.byId("status_selId").setSelectedKey(mData.activeStatusKey);
    	oView.byId("perm_streetAddress_txtId").setValue(mData.permanentAddress);
    	oView.byId("perm_locality_txtId").setValue(mData.permanentLocality);
    	oView.byId("perm_state_txtId").removeAllCustomData();
    	oView.byId("perm_state_txtId").setValue(mData.permanentStateName);
    	oView.byId("perm_state_txtId").addCustomData(new sap.ui.core.CustomData({
    		key:"key",
    		value:mData.permanentStateId
    	}));
    	oView.byId("perm_city_txtId").removeAllCustomData();
    	oView.byId("perm_city_txtId").setValue(mData.permanentCityName);
    	oView.byId("perm_city_txtId").addCustomData(new sap.ui.core.CustomData({
    		key:"key",
    		value:mData.permanentCityId
    	}));
    	oView.byId("perm_pinCode_txtId").setValue(mData.permanentPINCode);
    	oView.byId("streetAddress_txtId").setValue(mData.correspondanceAddress);
    	oView.byId("locality_txtId").setValue(mData.correspondanceLocality);
    	oView.byId("state_txtId").removeAllCustomData();
    	oView.byId("state_txtId").setValue(mData.correspondanceStateName);
    	oView.byId("state_txtId").addCustomData(new sap.ui.core.CustomData({
    		key:"key",
    		value:mData.correspondanceStateId
    	}));
    	oView.byId("city_txtId").removeAllCustomData();
    	oView.byId("city_txtId").setValue(mData.correspondanceCityName);
    	oView.byId("city_txtId").addCustomData(new sap.ui.core.CustomData({
    		key:"key",
    		value:mData.correspondanceCityId
    	}));
    	oView.byId("pinCode_txtId").setValue(mData.correspondancePINCode);
    },
    onCardNumberValueHelp: function(evt) {
        var query = {
            mode: "CARD_STM",
            schoolId: sessionStorage.getItem('schoolId'),
            key: ""
        };
        var f4DialogResponse = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", query);
        if (f4DialogResponse != "") {
            var f4Model = new sap.ui.model.json.JSONModel(f4DialogResponse);
            var handleClose = function(oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    staffEnrollDtl_context.byId("cardNumber_txtId").removeAllCustomData();
                    staffEnrollDtl_context.byId("cardNumber_txtId").setValue(oSelectedItem.getTitle());
                    staffEnrollDtl_context.byId("cardNumber_txtId").addCustomData(new sap.ui.core.CustomData({
                        key: "key",
                        value: oSelectedItem.data().key
                    }));
                }
                oEvent.getSource().getBinding("items").filter([]);
            };
            var _valueHelpSelectDialog = new sap.m.SelectDialog({
                title: "Card Number",
                multiSelect: false,
                items: {
                    path: "/navHelpDialog",
                    template: new sap.m.StandardListItem({
                        title: "{value}",
                        active: true
                    }).addCustomData(new sap.ui.core.CustomData({
                        key: "key",
                        value: "{key}"
                    })).addStyleClass("sapUiSizeCompact"),
                },
                liveChange: function(oEvent) {
                    var sValue = oEvent.getParameter("value");
                    var oFilter = new sap.ui.model.Filter([
                            new sap.ui.model.Filter("value",
                                sap.ui.model.FilterOperator.Contains, sValue),
                            new sap.ui.model.Filter("key",
                                sap.ui.model.FilterOperator.Contains, sValue)
                        ],
                        false);
                    oEvent.getSource().getBinding("items").filter([oFilter]);
                },
                confirm: handleClose,
                cancel: handleClose
            });
            _valueHelpSelectDialog.setModel(f4Model);
            _valueHelpSelectDialog.open();
            _valueHelpSelectDialog.attachBrowserEvent("keydown", function(oEvent) {
                if (oEvent.keyCode === 27) {
                    oEvent.stopPropagation();
                    oEvent.preventDefault();
                }
            });
            jQuery.sap.delayedCall(350, staffEnrollDtl_context, function() {
                _valueHelpSelectDialog._oSearchField.focus();
            });
        }
    },
    onDepartmentValueHelp: function(evt) {
        var query = {
            mode: "DEPARTMENT",
            schoolId: sessionStorage.getItem('schoolId'),
            key: ""
        };
        var f4DialogResponse = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", query);
        if (f4DialogResponse != "") {
            var f4Model = new sap.ui.model.json.JSONModel(f4DialogResponse);
            var handleClose = function(oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    staffEnrollDtl_context.byId("department_txtId").removeAllCustomData();
                    staffEnrollDtl_context.byId("department_txtId").setValue(oSelectedItem.getTitle());
                    staffEnrollDtl_context.byId("department_txtId").addCustomData(new sap.ui.core.CustomData({
                        key: "key",
                        value: oSelectedItem.data().key
                    }));
                }
                oEvent.getSource().getBinding("items").filter([]);
            };
            var _valueHelpSelectDialog = new sap.m.SelectDialog({
                title: "Department",
                multiSelect: false,
                items: {
                    path: "/navHelpDialog",
                    template: new sap.m.StandardListItem({
                        title: "{value}",
                        active: true
                    }).addCustomData(new sap.ui.core.CustomData({
                        key: "key",
                        value: "{key}"
                    })).addStyleClass("sapUiSizeCompact"),
                },
                liveChange: function(oEvent) {
                    var sValue = oEvent.getParameter("value");
                    var oFilter = new sap.ui.model.Filter([
                            new sap.ui.model.Filter("value",
                                sap.ui.model.FilterOperator.Contains, sValue),
                            new sap.ui.model.Filter("key",
                                sap.ui.model.FilterOperator.Contains, sValue)
                        ],
                        false);
                    oEvent.getSource().getBinding("items").filter([oFilter]);
                },
                confirm: handleClose,
                cancel: handleClose
            });
            _valueHelpSelectDialog.setModel(f4Model);
            _valueHelpSelectDialog.open();
            _valueHelpSelectDialog.attachBrowserEvent("keydown", function(oEvent) {
                if (oEvent.keyCode === 27) {
                    oEvent.stopPropagation();
                    oEvent.preventDefault();
                }
            });
            jQuery.sap.delayedCall(350, staffEnrollDtl_context, function() {
                _valueHelpSelectDialog._oSearchField.focus();
            });
        }
    },
    onDesignationValueHelp: function(evt) {
        var query = {
            mode: "DESIGNATION",
            schoolId: sessionStorage.getItem('schoolId'),
            key: ""
        };
        var f4DialogResponse = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", query);
        if (f4DialogResponse != "") {
            var f4Model = new sap.ui.model.json.JSONModel(f4DialogResponse);
            var handleClose = function(oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    staffEnrollDtl_context.byId("designation_txtId").removeAllCustomData();
                    staffEnrollDtl_context.byId("designation_txtId").setValue(oSelectedItem.getTitle());
                    staffEnrollDtl_context.byId("designation_txtId").addCustomData(new sap.ui.core.CustomData({
                        key: "key",
                        value: oSelectedItem.data().key
                    }));
                }
                oEvent.getSource().getBinding("items").filter([]);
            };
            var _valueHelpSelectDialog = new sap.m.SelectDialog({
                title: "Designation",
                multiSelect: false,
                items: {
                    path: "/navHelpDialog",
                    template: new sap.m.StandardListItem({
                        title: "{value}",
                        active: true
                    }).addCustomData(new sap.ui.core.CustomData({
                        key: "key",
                        value: "{key}"
                    })).addStyleClass("sapUiSizeCompact"),
                },
                liveChange: function(oEvent) {
                    var sValue = oEvent.getParameter("value");
                    var oFilter = new sap.ui.model.Filter([
                            new sap.ui.model.Filter("value",
                                sap.ui.model.FilterOperator.Contains, sValue),
                            new sap.ui.model.Filter("key",
                                sap.ui.model.FilterOperator.Contains, sValue)
                        ],
                        false);
                    oEvent.getSource().getBinding("items").filter([oFilter]);
                },
                confirm: handleClose,
                cancel: handleClose
            });
            _valueHelpSelectDialog.setModel(f4Model);
            _valueHelpSelectDialog.open();
            _valueHelpSelectDialog.attachBrowserEvent("keydown", function(oEvent) {
                if (oEvent.keyCode === 27) {
                    oEvent.stopPropagation();
                    oEvent.preventDefault();
                }
            });
            jQuery.sap.delayedCall(350, staffEnrollDtl_context, function() {
                _valueHelpSelectDialog._oSearchField.focus();
            });
        }
    },
    onPermStateValueHelp: function(evt) {
        var query = {
            mode: "STATE",
            schoolId: sessionStorage.getItem('schoolId'),
            key: ""
        };
        var f4DialogResponse = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", query);
        if (f4DialogResponse != "") {
            var f4Model = new sap.ui.model.json.JSONModel(f4DialogResponse);
            var handleClose = function(oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    staffEnrollDtl_context.byId("perm_state_txtId").removeAllCustomData();
                    staffEnrollDtl_context.byId("perm_state_txtId").setValue(oSelectedItem.getTitle());
                    staffEnrollDtl_context.byId("perm_state_txtId").addCustomData(new sap.ui.core.CustomData({
                        key: "key",
                        value: oSelectedItem.data().key
                    }));
                }
                oEvent.getSource().getBinding("items").filter([]);
            };
            var _valueHelpSelectDialog = new sap.m.SelectDialog({
                title: "State",
                multiSelect: false,
                items: {
                    path: "/navHelpDialog",
                    template: new sap.m.StandardListItem({
                        title: "{value}",
                        active: true
                    }).addCustomData(new sap.ui.core.CustomData({
                        key: "key",
                        value: "{key}"
                    })).addStyleClass("sapUiSizeCompact"),
                },
                liveChange: function(oEvent) {
                    var sValue = oEvent.getParameter("value");
                    var oFilter = new sap.ui.model.Filter([
                            new sap.ui.model.Filter("value",
                                sap.ui.model.FilterOperator.Contains, sValue),
                            new sap.ui.model.Filter("key",
                                sap.ui.model.FilterOperator.Contains, sValue)
                        ],
                        false);
                    oEvent.getSource().getBinding("items").filter([oFilter]);
                },
                confirm: handleClose,
                cancel: handleClose
            });
            _valueHelpSelectDialog.setModel(f4Model);
            _valueHelpSelectDialog.open();
            _valueHelpSelectDialog.attachBrowserEvent("keydown", function(oEvent) {
                if (oEvent.keyCode === 27) {
                    oEvent.stopPropagation();
                    oEvent.preventDefault();
                }
            });
            jQuery.sap.delayedCall(350, staffEnrollDtl_context, function() {
                _valueHelpSelectDialog._oSearchField.focus();
            });
        }
    },
    onPermCityValueHelp: function(evt) {
        if (staffEnrollDtl_context.byId("perm_state_txtId").getValue() === "")
            sap.m.MessageBox.show("Please select Permanent State.", sap.m.MessageBox.Icon.ERROR, "Warning");
        else {
            var query = {
                mode: "CITY",
                schoolId: sessionStorage.getItem('schoolId'),
                key: staffEnrollDtl_context.byId("perm_state_txtId").data().key,
            };
            var f4DialogResponse = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", query);
            if (f4DialogResponse != "") {
                var f4Model = new sap.ui.model.json.JSONModel(f4DialogResponse);
                var handleClose = function(oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    if (oSelectedItem) {
                        staffEnrollDtl_context.byId("perm_city_txtId").removeAllCustomData();
                        staffEnrollDtl_context.byId("perm_city_txtId").setValue(oSelectedItem.getTitle());
                        staffEnrollDtl_context.byId("perm_city_txtId").addCustomData(new sap.ui.core.CustomData({
                            key: "key",
                            value: oSelectedItem.data().key
                        }));
                    }
                    oEvent.getSource().getBinding("items").filter([]);
                };
                var _valueHelpSelectDialog = new sap.m.SelectDialog({
                    title: "City",
                    multiSelect: false,
                    items: {
                        path: "/navHelpDialog",
                        template: new sap.m.StandardListItem({
                            title: "{value}",
                            active: true
                        }).addCustomData(new sap.ui.core.CustomData({
                            key: "key",
                            value: "{key}"
                        })).addStyleClass("sapUiSizeCompact"),
                    },
                    liveChange: function(oEvent) {
                        var sValue = oEvent.getParameter("value");
                        var oFilter = new sap.ui.model.Filter([
                                new sap.ui.model.Filter("value",
                                    sap.ui.model.FilterOperator.Contains, sValue),
                                new sap.ui.model.Filter("key",
                                    sap.ui.model.FilterOperator.Contains, sValue)
                            ],
                            false);
                        oEvent.getSource().getBinding("items").filter([oFilter]);
                    },
                    confirm: handleClose,
                    cancel: handleClose
                });
                _valueHelpSelectDialog.setModel(f4Model);
                _valueHelpSelectDialog.open();
                _valueHelpSelectDialog.attachBrowserEvent("keydown", function(oEvent) {
                    if (oEvent.keyCode === 27) {
                        oEvent.stopPropagation();
                        oEvent.preventDefault();
                    }
                });
                jQuery.sap.delayedCall(350, staffEnrollDtl_context, function() {
                    _valueHelpSelectDialog._oSearchField.focus();
                });
            }
        }
    },
    onCorressStateValueHelp: function(evt) {
        var query = {
            mode: "STATE",
            schoolId: sessionStorage.getItem('schoolId'),
            key: ""
        };
        var f4DialogResponse = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", query);
        if (f4DialogResponse != "") {
            var f4Model = new sap.ui.model.json.JSONModel(f4DialogResponse);
            var handleClose = function(oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    staffEnrollDtl_context.byId("state_txtId").removeAllCustomData();
                    staffEnrollDtl_context.byId("state_txtId").setValue(oSelectedItem.getTitle());
                    staffEnrollDtl_context.byId("state_txtId").addCustomData(new sap.ui.core.CustomData({
                        key: "key",
                        value: oSelectedItem.data().key
                    }));
                }
                oEvent.getSource().getBinding("items").filter([]);
            };
            var _valueHelpSelectDialog = new sap.m.SelectDialog({
                title: "State",
                multiSelect: false,
                items: {
                    path: "/navHelpDialog",
                    template: new sap.m.StandardListItem({
                        title: "{value}",
                        active: true
                    }).addCustomData(new sap.ui.core.CustomData({
                        key: "key",
                        value: "{key}"
                    })).addStyleClass("sapUiSizeCompact"),
                },
                liveChange: function(oEvent) {
                    var sValue = oEvent.getParameter("value");
                    var oFilter = new sap.ui.model.Filter([
                            new sap.ui.model.Filter("value",
                                sap.ui.model.FilterOperator.Contains, sValue),
                            new sap.ui.model.Filter("key",
                                sap.ui.model.FilterOperator.Contains, sValue)
                        ],
                        false);
                    oEvent.getSource().getBinding("items").filter([oFilter]);
                },
                confirm: handleClose,
                cancel: handleClose
            });
            _valueHelpSelectDialog.setModel(f4Model);
            _valueHelpSelectDialog.open();
            _valueHelpSelectDialog.attachBrowserEvent("keydown", function(oEvent) {
                if (oEvent.keyCode === 27) {
                    oEvent.stopPropagation();
                    oEvent.preventDefault();
                }
            });
            jQuery.sap.delayedCall(350, staffEnrollDtl_context, function() {
                _valueHelpSelectDialog._oSearchField.focus();
            });
        }
    },
    onCorressCityValueHelp: function(evt) {
        if (staffEnrollDtl_context.byId("state_txtId").getValue() === "")
            sap.m.MessageBox.show("Please select Correspondance State.", sap.m.MessageBox.Icon.ERROR, "Warning");
        else {
            var query = {
                mode: "CITY",
                schoolId: sessionStorage.getItem('schoolId'),
                key: staffEnrollDtl_context.byId("state_txtId").data().key,
            };
            var f4DialogResponse = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", query);
            if (f4DialogResponse != "") {
                var f4Model = new sap.ui.model.json.JSONModel(f4DialogResponse);
                var handleClose = function(oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    if (oSelectedItem) {
                        staffEnrollDtl_context.byId("city_txtId").removeAllCustomData();
                        staffEnrollDtl_context.byId("city_txtId").setValue(oSelectedItem.getTitle());
                        staffEnrollDtl_context.byId("city_txtId").addCustomData(new sap.ui.core.CustomData({
                            key: "key",
                            value: oSelectedItem.data().key
                        }));
                    }
                    oEvent.getSource().getBinding("items").filter([]);
                };
                var _valueHelpSelectDialog = new sap.m.SelectDialog({
                    title: "City",
                    multiSelect: false,
                    items: {
                        path: "/navHelpDialog",
                        template: new sap.m.StandardListItem({
                            title: "{value}",
                            active: true
                        }).addCustomData(new sap.ui.core.CustomData({
                            key: "key",
                            value: "{key}"
                        })).addStyleClass("sapUiSizeCompact"),
                    },
                    liveChange: function(oEvent) {
                        var sValue = oEvent.getParameter("value");
                        var oFilter = new sap.ui.model.Filter([
                                new sap.ui.model.Filter("value",
                                    sap.ui.model.FilterOperator.Contains, sValue),
                                new sap.ui.model.Filter("key",
                                    sap.ui.model.FilterOperator.Contains, sValue)
                            ],
                            false);
                        oEvent.getSource().getBinding("items").filter([oFilter]);
                    },
                    confirm: handleClose,
                    cancel: handleClose
                });
                _valueHelpSelectDialog.setModel(f4Model);
                _valueHelpSelectDialog.open();
                _valueHelpSelectDialog.attachBrowserEvent("keydown", function(oEvent) {
                    if (oEvent.keyCode === 27) {
                        oEvent.stopPropagation();
                        oEvent.preventDefault();
                    }
                });
                jQuery.sap.delayedCall(350, staffEnrollDtl_context, function() {
                    _valueHelpSelectDialog._oSearchField.focus();
                });
            }
        }
    },
    onSameAsPermanentSelect:function(evt){
    	var bSelect = evt.getSource().getSelected();
    	var oView = staffEnrollDtl_context.getView();
    	if(bSelect){
        	oView.byId("streetAddress_txtId").setValue(oView.byId("perm_streetAddress_txtId").getValue());
        	oView.byId("locality_txtId").setValue(oView.byId("perm_locality_txtId").getValue());
        	oView.byId("state_txtId").removeAllCustomData();
        	oView.byId("state_txtId").setValue(oView.byId("perm_state_txtId").getValue());
        	oView.byId("state_txtId").addCustomData(new sap.ui.core.CustomData({
        		key:"key",
        		value:oView.byId("perm_state_txtId").data().key
        	}));
        	oView.byId("city_txtId").removeAllCustomData();
        	oView.byId("city_txtId").setValue(oView.byId("perm_city_txtId").getValue());
        	oView.byId("city_txtId").addCustomData(new sap.ui.core.CustomData({
        		key:"key",
        		value:oView.byId("perm_city_txtId").data().key
        	}));
        	oView.byId("pinCode_txtId").setValue(oView.byId("perm_pinCode_txtId").getValue());
    	}
    },
    validateStaffEnrollmentDetail:function(){
    	var msg = "";
    	var cModelData = sap.ui.getCore().getModel("contextModel").getData();
    	var oView = staffEnrollDtl_context.getView();
    	if(oView.byId("fName_txtId").getValue() === ""){
    		msg += "Please enter First Name." + "\n";
    	}
    	if(oView.byId("empNo_txtId").getValue() === "")
    		msg += "Please enter Employee No." + "\n"
    	if(oView.byId("dob_txtId").getDateValue() === null)
    		msg += "Please select Date of Birth." + "\n";
//    	if(oView.byId("cardNumber_txtId").getValue() === "")
//    		msg += "Please enter Card Number." + "\n";
//    	if(oView.byId("panNo_txtId").getValue() === "")
//    		msg += "Please enter PAN No." + "\n";
    	if(oView.byId("mobileNumber_txtId").getValue() === "")
    		msg += "Please enter Mobile No." + "\n";
    	if(oView.byId("alternateNumber_txtId").getValue() != ""){
    		if(oView.byId("alternateNumber_txtId").getValue().length != 10)
    			msg += "Alternate Number length must 10 digit." + "\n";
    	}
    	if(oView.byId("email_txtId").getValue() === "")
    		msg += "Please enter Email-Id." + "\n";
    	if(oView.byId("lName_txtId").getValue() === "")
    		msg += "Please enter Last Name." + "\n";
    	if(oView.byId("gender_selId").getSelectedKey() === "")
    		msg += "Please select Gender." + "\n";
    	if(oView.byId("department_txtId").getValue() === "")
    		msg += "Please select Department." + "\n";
    	if(oView.byId("designation_txtId").getValue() === "")
    		msg += "Please select Designation." + "\n";
//    	if(oView.byId("aadhaarNo_txtId").getValue() === "")
//    		msg += "Please enter Aadhar Number." + "\n";
    	/*else */if((oView.byId("aadhaarNo_txtId").getValue().length > 0) && (oView.byId("aadhaarNo_txtId").getValue().length != 12)) 
    		msg += "Aadhar Number length must 12 digit." + "\n";
    	if(oView.byId("userName_txtId").getValue() === "")
    		msg += "Please enter User Name." + "\n";
    	if(oView.byId("password_txtId").getValue() === "")
    		msg += "Please enter Password." + "\n";
    	if(oView.byId("cnfrmPassword_txtId").getValue() === "")
    		msg += "Please enter Confirm Password." + "\n";
    	else if(oView.byId("cnfrmPassword_txtId").getValue() !== oView.byId("password_txtId").getValue())
    		msg += "Password and Confirm Password didnot matched." + "\n";
    	if(oView.byId("status_selId").getSelectedKey() === "")
    		msg += "Please select Status." + "\n";
    	if(oView.byId("perm_streetAddress_txtId").getValue() === "")
    		msg += "Please enter Permanent Street Address." + "\n";
    	if(oView.byId("perm_locality_txtId").getValue() === "")
    		msg += "Please enter Permanent Locality." + "\n";
    	if(oView.byId("perm_state_txtId").getValue() === "")
    		msg += "Please select Permanent State." + "\n";
    	if(oView.byId("perm_city_txtId").getValue() === "")
    		msg += "Please select Permanent City." + "\n";
    	if(oView.byId("perm_pinCode_txtId").getValue() === "")
    		msg += "Please enter Permanent PIN Code." + "\n";
    	else if(oView.byId("perm_pinCode_txtId").getValue().length != 6)
    		msg += "Permanent PIN Code length must 6 digit." + "\n";
    	if(oView.byId("streetAddress_txtId").getValue() === "")
    		msg += "Please enter Correspondance Street Address." + "\n";
    	if(oView.byId("locality_txtId").getValue() === "")
    		msg += "Please enter Correspondance Locality." + "\n";
    	if(oView.byId("state_txtId").getValue() === "")
    		msg += "Please select Correspondance State." + "\n";
    	if(oView.byId("city_txtId").getValue() === "")
    		msg += "Please select Correspondance City." + "\n";
    	if(oView.byId("pinCode_txtId").getValue() === "")
    		msg += "Please enter Correspondance PIN Code." + "\n";
    	else if (oView.byId("pinCode_txtId").getValue().length != 6)
			msg += "Correspondance PIN Code length must 6 digit." + "\n";
    	return msg;
    },
    onSubmit:function(evt){
    	var msg = staffEnrollDtl_context.validateStaffEnrollmentDetail();
        if (msg === "") {
            sap.m.MessageBox.confirm("Are you sure want to submit?", {
                icon: sap.m.MessageBox.Icon.QUESION,
                title: "Confirmation",
                action: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                styleClass: "sapUiSizeCompact",
                onClose: function(action) {
                    if (action === "OK") {
                        oBusyDialog.open();
                        jQuery.sap.delayedCall(1, this, function() {
                        	staffEnrollDtl_context.submitStaffEnrollmentDetail();
                        });
                    }
                }
            });
        } else {
            sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Error");
        }
    },
    getStaffEnrollmentDtlRequestBody:function(){
    	var requestBody = {};
    	var cModelData = sap.ui.getCore().getModel("contextModel").getData();
    	var oView = staffEnrollDtl_context.getView();
    	requestBody.mode = cModelData.mode;
    	requestBody.schoolId = sessionStorage.getItem('schoolId');
    	requestBody.userId = sessionStorage.getItem('userId');
    	requestBody.navSchoolStaffDtl = [];
    	var staffId = "0", userId = "0";
    	if(cModelData.mode === "EDIT"){
    		staffId = cModelData.tableData.staffId;
    		userId = cModelData.tableData.userId;
    	}
    		
    	requestBody.navSchoolStaffDtl.push({
    		staffId:staffId,
    		EmployeeNo:oView.byId("empNo_txtId").getValue(),
    		userId:userId,
    		userName:oView.byId("userName_txtId").getValue(),
    		password:oView.byId("cnfrmPassword_txtId").getValue(),
    		firstName:oView.byId("fName_txtId").getValue(),
    		lastName:oView.byId("lName_txtId").getValue(),
    		dateOfBirth:com.itec.sams.util.formatter.dateFormat(oView.byId("dob_txtId").getDateValue()),
    		genderKey:oView.byId("gender_selId").getSelectedKey(),
    		genderText:oView.byId("gender_selId").getSelectedItem().getText(),
    		permanentAddress:oView.byId("perm_streetAddress_txtId").getValue(),
    		permanentLocality:oView.byId("perm_locality_txtId").getValue(),
    		permanentStateId:oView.byId("perm_state_txtId").data().key,
    		permanentStateName:oView.byId("perm_state_txtId").getValue(),
    		permanentCityId:oView.byId("perm_city_txtId").data().key,
    		permanentCityName:oView.byId("perm_city_txtId").getValue(),
    		permanentPINCode:oView.byId("perm_pinCode_txtId").getValue(),
    		correspondanceAddress:oView.byId("streetAddress_txtId").getValue(),
    		correspondanceLocality:oView.byId("locality_txtId").getValue(),
    		correspondanceStateId:oView.byId("state_txtId").data().key,
    		correspondanceStateName:oView.byId("state_txtId").getValue(),
    		correspondanceCityId:oView.byId("city_txtId").data().key,
    		correspondanceCityName:oView.byId("city_txtId").getValue(),
    		correspondancePINCode:oView.byId("pinCode_txtId").getValue(),
    		mobileNo:oView.byId("mobileNumber_txtId").getValue(),
    		alternateMobileNo:oView.byId("alternateNumber_txtId").getValue(),
    		emailId:oView.byId("email_txtId").getValue(),
    		alternateEmailId:oView.byId("alternateEmailId_txtId").getValue(),
    		panCardNo:oView.byId("panNo_txtId").getValue(),
    		aadharCardNo:oView.byId("aadhaarNo_txtId").getValue(),
    		departmentId:oView.byId("department_txtId").data().key,
    		departmentName:oView.byId("department_txtId").getValue(),
    		designationId:oView.byId("designation_txtId").data().key,
    		designationName:oView.byId("designation_txtId").getValue(),
    		cardId:oView.byId("cardNumber_txtId").data().key,
    		cardNumber:oView.byId("cardNumber_txtId").getValue(),
    		activeStatusKey:oView.byId("status_selId").getSelectedKey(),
    		activeStatusText:oView.byId("status_selId").getSelectedItem().getText()
    	});
    	
    	return requestBody;
    },
    submitStaffEnrollmentDetail:function(){
 	   var requestBody = staffEnrollDtl_context.getStaffEnrollmentDtlRequestBody();
 	   var saveResponse = new com.itec.sams.util.GetPostApiCall.postData("schoolStaffSet", requestBody);
        if (saveResponse != null) {
            if (saveResponse.msgType === "S") {
                sap.m.MessageBox.show(saveResponse.msg, {
                    icon: sap.m.MessageBox.Icon.SUCCESS,
                    title: "Success",
                    styleClass: "sapUiSizeCompact",
                    onClose: function(action) {
                 	   oBusyDialog.close();
                 	   sap.ui.getCore().setModel(null, "contextModel");
                        var bReplace = jQuery.device.is.phone ? false : true;
                        staffEnrollDtl_context.getRouter().navTo("StaffEnrollment", bReplace);
                    }
                });
            } else {
                sap.m.MessageBox.show(saveResponse.msg, {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: "Error",
                    styleClass: "sapUiSizeCompact",
                    onClose: function(action) {
                        oBusyDialog.close();
                    }
                });
            }
        }
    },
});