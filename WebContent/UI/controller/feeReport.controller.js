jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
jQuery.sap.require("com.itec.sams.util.formatter");
jQuery.sap.require("com.itec.sams.util.validator");
sap.ui.core.mvc.Controller.extend("com.itec.sams.controller.feeReport", {

    onInit: function() {
        feerRpt_context = this;
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
        if (sName !== "FeeReport") {
            return;
        } else {
            oPageTitle.setText("Fee Report");
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
                feerRpt_context.initialLoad();
            });

        }
    },
    getEventBus: function() {
        return sap.ui.getCore().getEventBus();
    },
    getRouter: function() {
        return sap.ui.core.UIComponent.getRouterFor(this);
    },
    onNavBack: function(evt) {
        var bReplace = jQuery.device.is.phone ? false : true;
        feerRpt_context.getRouter().navTo("Reports", bReplace);
    },
    initialLoad: function() {
        feerRpt_context.resetFilter();
        var curDate = new Date();
        var curMonth = curDate.getMonth() + 1;
        var curYear = curDate.getFullYear();
        feerRpt_context.getView().byId("assessmentYear_filter_selId").setSelectedKey(curYear);
        feerRpt_context.getView().byId("assessmentMonth_filter_selId").setSelectedKey(curMonth);
        var sUri = feerRpt_context.getSearchDataUri("data");
    	if(sUri !== ""){
    		oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function(){
                var oResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
                if (oResponse != null) {
                    feerRpt_context.bindFeeReportTable(oResponse);
                    feerRpt_context.getView().byId("filterExpand_btnId").firePress(this);
                }
                oBusyDialog.close();
            });
    	}
    	
        oBusyDialog.close();
    },
    onFilterExpandPress: function(evt) {
        var oButton = evt.getSource();
        var oFilterPnl = feerRpt_context.getView().byId("filter_pnlId");
        var oTable = feerRpt_context.getView().byId("feeReports_tblId");
        if (oButton.getText() === "Collapse") {
            oButton.setIcon("sap-icon://navigation-down-arrow");
            oButton.setText("Expand");
            oFilterPnl.setVisible(false);
        } else {
            oButton.setIcon("sap-icon://navigation-up-arrow");
            oButton.setText("Collapse");
            oFilterPnl.setVisible(true);
            if (feerRpt_context.getView().getContent()[0].getEnableScrolling() === true && feerRpt_context.getView().getModel("device").getData().isPhone === false)
                feerRpt_context.getView().getContent()[0].setEnableScrolling(feerRpt_context.getView().getModel("device").getData().isPhone);
        }
        jQuery.sap.delayedCall(1, feerRpt_context, function() {
            feerRpt_context.setTableHeight(oTable);
        });
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
                    feerRpt_context.getView().byId("class_filter_txtId").removeAllCustomData();
                    feerRpt_context.getView().byId("class_filter_txtId").setValue(oSelectedItem.getTitle());
                    feerRpt_context.getView().byId("class_filter_txtId").addCustomData(
                        new sap.ui.core.CustomData({
                            key: "classId",
                            value: oSelectedItem.data().key
                        })
                    )
                    feerRpt_context.onChangeSearch();
                }
                oEvent.getSource().getBinding("items").filter([]);
            };
            var _valueHelpSelectDialog = new sap.m.SelectDialog({
                title: "Class",
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
            jQuery.sap.delayedCall(350, feerRpt_context, function() {
                _valueHelpSelectDialog._oSearchField.focus();
            });
        }
    },
    handleDivisionValueHelp: function(evt) {
        var oClassTxt = feerRpt_context.getView().byId("class_filter_txtId");
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
                        feerRpt_context.getView().byId("division_filter_txtId").removeAllCustomData();
                        feerRpt_context.getView().byId("division_filter_txtId").setValue(oSelectedItem.getTitle());
                        feerRpt_context.getView().byId("division_filter_txtId").addCustomData(
                            new sap.ui.core.CustomData({
                                key: "divisionId",
                                value: oSelectedItem.data().key
                            })
                        )
                    }
                    oEvent.getSource().getBinding("items").filter([]);
                };
                var _valueHelpSelectDialog = new sap.m.SelectDialog({
                    title: "Division",
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
                jQuery.sap.delayedCall(350, feerRpt_context, function() {
                    _valueHelpSelectDialog._oSearchField.focus();
                });
            }
        } else {
            sap.m.MessageBox.show("Please select class.", sap.m.MessageBox.Icon.WARNING, "WARNING");
        }
    },
    onFilterSearchBtnPress: function(evt) {
    	var sUri = feerRpt_context.getSearchDataUri("data");
    	if(sUri !== ""){
    		oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function(){
                var oResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
                if (oResponse != null) {
                    feerRpt_context.bindFeeReportTable(oResponse);
                    feerRpt_context.getView().byId("filterExpand_btnId").firePress(this);
                }
                oBusyDialog.close();
            });
    	}
    },
    getSearchDataUri:function(mode){
    	var sUri  = "";
    	var oView = feerRpt_context.getView()
        var sAssessmentYear = oView.byId("assessmentYear_filter_selId").getSelectedKey();
        var sAssessmentMonth = oView.byId("assessmentMonth_filter_selId").getSelectedKey();
        var sFirstName = oView.byId("firstName_filter_txtId").getValue();
        var sLastName = oView.byId("lastName_filter_txtId").getValue();
        var sRollNo = oView.byId("rollNo_filter_txtId").getValue();
        var sGenRegNo = oView.byId("genRegNo_filter_txtId").getValue();
        var sClassId = oView.byId("class_filter_txtId").data("classId");
        var sDivisionId = oView.byId("division_filter_txtId").data("divisionId");
        var sStatus = oView.byId("status_filter_selId").getSelectedKey();
        var msg = "";
        if (sAssessmentYear === "0")
            msg += "Please select Assessment Year." + "\n";
        if (sAssessmentMonth === "0")
            msg += "Please select Assessment Month." + "\n"

        if (msg !== "")
            sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.WARNING, "Warning");
        else {
            var sQuery = "";
            sQuery += "&mode=" + mode;
            sQuery += "&assessmentYear=" + sAssessmentYear;
            sQuery += "&assessmentMonth=" + sAssessmentMonth;

            if (sFirstName)
                sQuery += "&fName=" + sFirstName;
            else
                sQuery += "&fName=null";
            if (sLastName)
                sQuery += "&lName=" + sLastName;
            else
                sQuery += "&lName=null";
            if (sRollNo)
                sQuery += "&rollumber=" + sRollNo;
            else
                sQuery += "&rollumber=null";
            if (sGenRegNo)
                sQuery += "&grNo=" + sGenRegNo;
            else
                sQuery += "&grNo=null";
            if (sClassId)
                sQuery += "&classId=" + sClassId;
            else
                sQuery += "&classId=null";
            if (sDivisionId)
                sQuery += "&divisionId=" + sDivisionId;
            else
                sQuery += "&divisionId=null";

            sQuery += "&status=" + sStatus;
            
            sUri = "FeeReportExcelGet?schoolId=" + sessionStorage.getItem('schoolId') + sQuery;
        }
        
        return sUri;
    },
    bindFeeReportTable: function(oData) {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                    text: "{srNo}",
                }),
                new sap.m.Text({
                    text: "{firstName}"
                }),
                new sap.m.Text({
                    text: "{lastName}"
                }),
                new sap.m.Text({
                    text: "{grNo}"
                }),
                new sap.m.Text({
                    text: "{rollNumber}"
                }),
                new sap.m.Text({
                    text: "{className}"
                }),
                new sap.m.Text({
                    text: "{divisionName}"
                }),
                new sap.m.Text({
                    text: "{assessmentMonth}"
                }),
                new sap.m.Text({
                    text: "{assessmentYear}"
                }),
                new sap.m.Text({
                    text: "{paymentOn}"
                }),
                new sap.m.Text({
                    text: "{status}"
                })
            ]
        });
        var oTable = feerRpt_context.getView().byId("feeReports_tblId");
        oTable.unbindAggregation("items");
        oTable.setModel(new sap.ui.model.json.JSONModel(oData));
        oTable.bindAggregation("items", {
            path: "/results",
            template: tblTemplate,
            //templateShareable: true
        });
    },
    onFeeReportTableUpdateFinish: function(evt) {
        var oTable = evt.getSource();
        feerRpt_context.setTableHeight(oTable);
    },
    setTableHeight: function(oTable) {
        var oScrollContainer = oTable.getParent();
        if (oTable.getDomRef() !== null && sap.ui.Device.system.phone !== true) {
            var footerHeight = feerRpt_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
            var tablePositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
            var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
            oScrollContainer.setHeight(String(scrollHeight + "px"));
            if (!jQuery.device.is.phone) {
                var tableHeight = oTable.getDomRef().getBoundingClientRect().height;
                var hdrTable = feerRpt_context.getView().byId("hdr_feeReports_tblId");
                if (tableHeight > scrollHeight) {
                    hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(true);
                } else {
                    hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(false);
                }
            }
        }
    },
    onFilterResetBtnPress: function(evt) {
        feerRpt_context.resetFilter();
    },
    resetFilter: function() {
        feerRpt_context.getView().byId("assessmentYear_filter_selId").setSelectedKey("0");
        feerRpt_context.getView().byId("assessmentMonth_filter_selId").setSelectedKey("0");
        feerRpt_context.getView().byId("firstName_filter_txtId").setValue();
        feerRpt_context.getView().byId("lastName_filter_txtId").setValue();
        feerRpt_context.getView().byId("rollNo_filter_txtId").setValue();
        feerRpt_context.getView().byId("genRegNo_filter_txtId").setValue();
        feerRpt_context.getView().byId("class_filter_txtId").removeAllCustomData();
        feerRpt_context.getView().byId("class_filter_txtId").setValue();
        feerRpt_context.getView().byId("division_filter_txtId").removeAllCustomData();
        feerRpt_context.getView().byId("division_filter_txtId").setValue();
        feerRpt_context.getView().byId("status_filter_selId").setSelectedKey("0");
        feerRpt_context.getView().byId("feeReports_tblId").unbindAggregation("items");
    },

    onExporttoExcel: function(evt) {
    	var baseUrl = com.itec.sams.util.GetPostApiCall.getBaseUrl("API");
    	var sUri = baseUrl + feerRpt_context.getSearchDataUri("Excel");
    	if(sUri !== ""){
    		sap.m.URLHelper.redirect(sUri, "true");
    	}
    },
});