jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
jQuery.sap.require("com.itec.sams.util.formatter");
jQuery.sap.require("com.itec.sams.util.validator");
sap.ui.core.mvc.Controller.extend("com.itec.sams.controller.FeeConcession", {
	onInit : function() {
		feeCon_context = this;
		this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		this._oComponent = sap.ui.component(sap.ui.core.Component
				.getOwnerIdFor(this.getView()));
		if (this._oComponent._appRefresh == undefined) {
			comGlob.schoolData = {
				cityName : sessionStorage.getItem('cityName'),
				schoolId : sessionStorage.getItem('schoolId'),
				schoolName : sessionStorage.getItem('schoolName'),
				userId : sessionStorage.getItem('userId'),
				userName : sessionStorage.getItem('userName')
			}
		}
	},
  onRouteMatched: function(evt) {
        var sName = evt.getParameter("name");
        if (sName !== "FeeConcession") {
            return;
        } else {
            oPageTitle.setText("Fee Concession");
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
            	feeCon_context.initialLoad();
            });

        }
    },
    getEventBus: function() {
        return sap.ui.getCore().getEventBus();
    },
    getRouter: function() {
        return sap.ui.core.UIComponent.getRouterFor(this);
    },
    initialLoad:function(){
    	 var sUri = "FeeConcessionGet?schoolId=" + sessionStorage.getItem('schoolId');
    	 var oResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
    	        if (oResponse != null) {
    	        	feeCon_context.designExistsCount = oResponse.designExist;
    	        	feeCon_context.bindTable(oResponse);
    	        }
    	oBusyDialog.close();
    },
    onResetFilterPress: function(evt) {
        feeCon_context.getView().byId("firstName_txtId").setValue("");
        feeCon_context.getView().byId("lastName_txtId").setValue("");
        feeCon_context.getView().byId("rollNumber_txtId").setValue("");
        feeCon_context.getView().byId("class_txtId").removeAllCustomData();
        feeCon_context.getView().byId("class_txtId").setValue("");
        feeCon_context.getView().byId("division_txtId").removeAllCustomData();
        feeCon_context.getView().byId("division_txtId").setValue("");
        var oFiterButton = feeCon_context.getView().byId("filterExpand_btnId");
        var oFilterPnl = feeCon_context.getView().byId("filter_pnlId");
        if (oFilterPnl.getVisible() === false) {
            oFiterButton.setIcon("sap-icon://navigation-up-arrow");
            oFiterButton.setText("Collapse");
            oFilterPnl.setVisible(true);
        }
        feeCon_context.getView().getContent()[0].setEnableScrolling(feeCon_context.getView().getModel("device").getData().isPhone);
        feeCon_context.getView().byId("studentFeeConcessionMaster_tblId").getBinding("items").filter([]);
    },
    validateOnlyAlphabets:function(evt){
    	var sValue = evt.getSource().getValue();
    	var isValid = com.itec.sams.util.validator.validateAlphabets(sValue);
    	if(!isValid){
    		sValue = sValue.substring(0, sValue.length - 1);
    		evt.getSource().setValue(sValue);
    	}
    },
    validateOnlyNumbers:function(evt){
    	var sValue = evt.getSource().getValue();
    	var isValid = com.itec.sams.util.validator.validateNumber(sValue);
    	if(!isValid){
    		sValue = sValue.replace(/\D/g,'');
    		evt.getSource().setValue(sValue);
    	}
    },
    validateOnlyAlphabetNumeric:function(evt){
    	var sValue = evt.getSource().getValue();
    	var isValid = com.itec.sams.util.validator.validateAlphaNumeric(sValue);
    	if(!isValid){
    		sValue = sValue.substring(0, sValue.length - 1);
    		evt.getSource().setValue(sValue);
    	}
    },
    handleClassValueHelp: function(evt) {
        var query = {
            mode: "CLASS",
            schoolId: sessionStorage.getItem('schoolId'),
            key: ""
        };
        var f4DialogResponse = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", query);
        if (f4DialogResponse != "") {
            var f4Model = new sap.ui.model.json.JSONModel(f4DialogResponse);
            var handleClose = function(oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    feeCon_context.getView().byId("class_txtId").removeAllCustomData();
                    feeCon_context.getView().byId("class_txtId").setValue(oSelectedItem.getTitle());
                    feeCon_context.getView().byId("class_txtId").addCustomData(
                        new sap.ui.core.CustomData({
                            key: "classId",
                            value: oSelectedItem.data().key
                        })
                    )
                    feeCon_context.onChangeSearch();
                }
                oEvent.getSource().getBinding("items").filter([]);
            };
            var _valueHelpSelectDialog = new sap.m.SelectDialog({
                title: "Select Class",
                multiSelect: false,
                items: {
                    path: "/navHelpDialog",
                    template: new sap.m.StandardListItem({
                        title: "{value}",
                        active: true
                    }).addCustomData(
                        new sap.ui.core.CustomData({
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
            jQuery.sap.delayedCall(350, feeCon_context, function() {
                _valueHelpSelectDialog._oSearchField.focus();
            });
        }
    },
    handleDivisionValueHelp: function(evt) {
        var oClassTxt = feeCon_context.getView().byId("class_txtId");
        if (oClassTxt.getValue()) {
            var query = {
                mode: "DIVISION",
                schoolId: sessionStorage.getItem('schoolId'),
                key: oClassTxt.data().classId
            };
            var f4DialogResponse = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", query);
            if (f4DialogResponse != "") {
                var f4Model = new sap.ui.model.json.JSONModel(f4DialogResponse);
                var handleClose = function(oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    if (oSelectedItem) {
                        feeCon_context.getView().byId("division_txtId").removeAllCustomData();
                        feeCon_context.getView().byId("division_txtId").setValue(oSelectedItem.getTitle());
                        feeCon_context.getView().byId("division_txtId").addCustomData(
                            new sap.ui.core.CustomData({
                                key: "divisionId",
                                value: oSelectedItem.data().key
                            })
                        )
                        feeCon_context.onChangeSearch();
                    }
                    oEvent.getSource().getBinding("items").filter([]);
                };
                var _valueHelpSelectDialog = new sap.m.SelectDialog({
                    title: "Select Class",
                    multiSelect: false,
                    items: {
                        path: "/navHelpDialog",
                        template: new sap.m.StandardListItem({
                            title: "{value}",
                            active: true
                        }).addCustomData(
                            new sap.ui.core.CustomData({
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
                jQuery.sap.delayedCall(350, feeCon_context, function() {
                    _valueHelpSelectDialog._oSearchField.focus();
                });
            }
        } else {
            sap.m.MessageBox.show("Please select class.", sap.m.MessageBox.Icon.WARNING, "WARNING");
        }
    },
    onFilterExpandPress: function(evt) {
        var oButton = evt.getSource();
        var oFilterPnl = feeCon_context.getView().byId("filter_pnlId");
        if (oButton.getText() === "Collapse") {
            oButton.setIcon("sap-icon://navigation-down-arrow");
            oButton.setText("Expand");
            oFilterPnl.setVisible(false);
        } else {
            oButton.setIcon("sap-icon://navigation-up-arrow");
            oButton.setText("Collapse");
            oFilterPnl.setVisible(true);
            if (feeCon_context.getView().getContent()[0].getEnableScrolling() === true && feeCon_context.getView().getModel("device").getData().isPhone === false)
                feeCon_context.getView().getContent()[0].setEnableScrolling(feeCon_context.getView().getModel("device").getData().isPhone);
        }
        jQuery.sap.delayedCall(1, this, function() {
        	if(!sap.ui.Device.system.phone)
        		feeCon_context.getView().byId("studentFeeConcessionMaster_tblId").fireUpdateFinished(this);
        });
    },
    onChangeSearch: function(evt) {
        oBusyDialog.open();
        jQuery.sap.delayedCall(1, this, function() {
        	feeCon_context.onSearchFeeConcession();
        });
    },
    onSearchFeeConcession:function(evt){
    	var sFName = feeCon_context.getView().byId("firstName_txtId").getValue();
        var sLName = feeCon_context.getView().byId("lastName_txtId").getValue();
        var sRollNo = feeCon_context.getView().byId("rollNumber_txtId").getValue();
        var sClassId = feeCon_context.getView().byId("class_txtId").getValue() != "" ? feeCon_context.getView().byId("class_txtId").data().classId : "";
        var sDivisionId = feeCon_context.getView().byId("division_txtId").getValue() != "" ? feeCon_context.getView().byId("division_txtId").data().divisionId : "";
        var oFilter = [];
        if(sFName)
        	oFilter.push(new sap.ui.model.Filter("studentName", sap.ui.model.FilterOperator.StartsWith, sFName));
        if(sLName)
        	oFilter.push(new sap.ui.model.Filter("studentName", sap.ui.model.FilterOperator.Contains, sLName));
        if(sRollNo)
        	oFilter.push(new sap.ui.model.Filter("rollNumber", sap.ui.model.FilterOperator.EQ, sRollNo));
        if(sClassId)
        	oFilter.push(new sap.ui.model.Filter("classId", sap.ui.model.FilterOperator.EQ, sClassId));
        if(sDivisionId)
        	oFilter.push(new sap.ui.model.Filter("divisionId", sap.ui.model.FilterOperator.EQ, sDivisionId));
        
        feeCon_context.getView().byId("studentFeeConcessionMaster_tblId").getBinding("items").filter(oFilter);
        oBusyDialog.close();
    },
    onPressCreateFeeConcession: function(evt) {
    	if(feeCon_context.designExistsCount != 0){
    		var mData = {
    	            mode: "ADD",
    	            tableData: []
    	        };
    	        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "contextModel");
    	        var bReplace = jQuery.device.is.phone ? false : true;
    	        feeCon_context.getRouter().navTo("FeeConcessionDtl", bReplace);
    	}else{
    		sap.m.MessageBox.show("Please first design your Fee Structure.", sap.m.MessageBox.Icon.ERROR, "ERROR");
    	}
        
    },
    bindTable:function(oData){
    	 var tblTemplate = new sap.m.ColumnListItem({
             cells: [new sap.m.Text({
                     text: "{studentName}",
                 }),
                 new sap.m.Text({
                     text: "{rollNumber}",
                 }),
                 new sap.m.Text({
                     text: "{grNo}",
                 }),
                 new sap.m.Text({
                     text: "{className}",
                 }),
                 new sap.m.Text({
                     text: "{divisionName}",
                 }),
                 new sap.m.Text({
                     text:{
                     	path:'monthlyConcession',
                     	formatter:function(value){
                     		return " " + (parseInt(value)).toFixed(2);
                     	}
                     },
                 }).addStyleClass("fa fa-inr"),
                 new sap.m.Text({
                     text: {
                     	path:'yearlyConcession',
                     	formatter:function(value){
                     		return " " + (parseInt(value)).toFixed(2);
                     	}
                     },
                 }).addStyleClass("fa fa-inr"),
                 new sap.m.Text({
                     text: {
                     	parts:[
                     		{path:'monthlyConcession'},
                     		{path:'yearlyConcession'},
                     	],
                     	formatter:function(val1, val2){
                     		return " " + ((parseInt(val1) * 12) + parseInt(val2)).toFixed(2);
                     	}
                     }
                 }).addStyleClass("fa fa-inr"),
                 new sap.m.Button({
                     icon: "sap-icon://action",
                     type: "Default",
                     press: feeCon_context.onFeeConcessionTableActionPress
                 })
             ]
         });
         var oTable = feeCon_context.getView().byId("studentFeeConcessionMaster_tblId");
         oTable.setModel(new sap.ui.model.json.JSONModel(oData));
         oTable.bindAggregation("items", {
             path: "/results",
             template: tblTemplate,
             //templateShareable: true
         });
    },
    setStudentFeeConcessionTableHeight:function(evt){
    	 var oTable = evt.getSource();
         var oScrollContainer = evt.getSource().getParent();
         if (oTable.getDomRef() != null) {
             var footerHeight = feeCon_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
             var tablePositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
             var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
             oScrollContainer.setHeight(String(scrollHeight + "px"));
             if(!jQuery.device.is.phone){
             	var tableHeight = oTable.getDomRef().getBoundingClientRect().height;
                 var hdrTable = feeCon_context.getView().byId("hdr_studentFeeConcessionMaster_tblId");
                 if (tableHeight > scrollHeight) {
                 	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(true);
                 } else {
                 	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(false);
                 }
             }
         }
    },
    onFeeConcessionTableActionPress:function(evt){
    	var actButtonRef = evt.getSource();
        var obj = evt.getSource().getParent().getBindingContext().getObject();
        if (!feeCon_context._actionSheet) {
        	feeCon_context._actionSheet = sap.ui.xmlfragment("com.itec.sams.fragment.editDisDlt", feeCon_context);
        	feeCon_context.getView().addDependent(feeCon_context._actionSheet);
        }
        var mData = {
            mode: "",
            tableData: obj
        };
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "contextModel");
        feeCon_context._actionSheet.openBy(actButtonRef);
    },
    onAsheetEdit: function(evt) {
        var contextModel = sap.ui.getCore().getModel("contextModel");
        if (contextModel != undefined) {
            contextModel.getData().mode = "EDIT";
            var bReplace = jQuery.device.is.phone ? false : true;
            feeCon_context.getRouter().navTo("FeeConcessionDtl", bReplace);
        }
    },
    onAsheetDisplay: function(evt) {
        var contextModel = sap.ui.getCore().getModel("contextModel");
        if (contextModel != undefined) {
            contextModel.getData().mode = "DISPLAY";
            var bReplace = jQuery.device.is.phone ? false : true;
            feeCon_context.getRouter().navTo("FeeConcessionDtl", bReplace);

        }
    }

});