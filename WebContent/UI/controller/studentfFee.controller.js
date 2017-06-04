jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
jQuery.sap.require("com.itec.sams.util.formatter");
jQuery.sap.require("com.itec.sams.util.validator");
sap.ui.core.mvc.Controller.extend("com.itec.sams.controller.studentfFee", {
    onInit: function() {
        SFEE_context = this;
        this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
        this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
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
        if (sName !== "StudentFee") {
            return;
        } else {
            oPageTitle.setText("Fee Payment");
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
                SFEE_context.initialLoad();
            });

        }
    },
    getEventBus: function() {
        return sap.ui.getCore().getEventBus();
    },
    getRouter: function() {
        return sap.ui.core.UIComponent.getRouterFor(this);
    },
    initialLoad: function() {
        SFEE_context.getView().byId("firstName_txtId").setValue("");
        SFEE_context.getView().byId("lastName_txtId").setValue("");
        SFEE_context.getView().byId("rollNumber_txtId").setValue("");
        SFEE_context.getView().byId("class_txtId").removeAllCustomData();
        SFEE_context.getView().byId("class_txtId").setValue("");
        SFEE_context.getView().byId("division_txtId").removeAllCustomData();
        SFEE_context.getView().byId("division_txtId").setValue("");
        var oFilterButton = SFEE_context.getView().byId("filterExpand_btnId");
        var oFilterPnl = SFEE_context.getView().byId("filter_pnlId");
        var oFeeDtlPnl = SFEE_context.getView().byId("studentFeeDtl_pnlId");
        var oSubmitBtn = SFEE_context.getView().byId("studentFee_submit_btnId");
        var oCancelBtn = SFEE_context.getView().byId("studentFee_cancel_btnId");
        
        if (oFilterPnl.getVisible() === false) {
        	oFilterButton.setIcon("sap-icon://navigation-up-arrow");
        	oFilterButton.setText("Collapse");
            oFilterPnl.setVisible(true);
            if (oFeeDtlPnl.getVisible() === true)
                oFeeDtlPnl.setVisible(false);
        }
        
	   	if (oSubmitBtn.getVisible() === true)
	            oSubmitBtn.setVisible(false);
        if (oCancelBtn.getVisible() === true)
        	oCancelBtn.setVisible(false);
        SFEE_context.getView().byId("filterStudentList_pnlId").setVisible(false);
        if (SFEE_context.getView().getContent()[0].getEnableScrolling() === true && SFEE_context.getView().getModel("device").getData().isPhone === false)
        	SFEE_context.getView().getContent()[0].setEnableScrolling(SFEE_context.getView().getModel("device").getData().isPhone);
        oBusyDialog.close();
    },
    onResetFilterPress: function(evt) {
        SFEE_context.getView().byId("firstName_txtId").setValue("");
        SFEE_context.getView().byId("lastName_txtId").setValue("");
        SFEE_context.getView().byId("rollNumber_txtId").setValue("");
        SFEE_context.getView().byId("class_txtId").removeAllCustomData();
        SFEE_context.getView().byId("class_txtId").setValue("");
        SFEE_context.getView().byId("division_txtId").removeAllCustomData();
        SFEE_context.getView().byId("division_txtId").setValue("");
        var oFiterButton = SFEE_context.getView().byId("filterExpand_btnId");
        var oFilterPnl = SFEE_context.getView().byId("filter_pnlId");
        var oFeeDtlPnl = SFEE_context.getView().byId("studentFeeDtl_pnlId");
        if (oFilterPnl.getVisible() === false) {
            oFiterButton.setIcon("sap-icon://navigation-up-arrow");
            oFiterButton.setText("Collapse");
            oFilterPnl.setVisible(true);
            if (oFeeDtlPnl.getVisible() === true)
                oFeeDtlPnl.setVisible(false);
        }
        SFEE_context.getView().byId("filterStudentList_pnlId").setVisible(false);
        SFEE_context.getView().byId("studentFee_submit_btnId").setVisible(false);
        SFEE_context.getView().byId("studentFee_cancel_btnId").setVisible(true);
        if (SFEE_context.getView().getContent()[0].getEnableScrolling() === true && SFEE_context.getView().getModel("device").getData().isPhone === false)
        	SFEE_context.getView().getContent()[0].setEnableScrolling(SFEE_context.getView().getModel("device").getData().isPhone);
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
    validateDate:function(evt){
    	var sValue = evt.getSource().getValue();
    	var dateValue = evt.getSource().getDateValue();
    	var isValid = com.itec.sams.util.validator.validateDateFormat(sValue);
    	if(!isValid){
    		sap.m.MessageBox.show("Please enter valid date in dd-MM-yyyy format.", sap.m.MessageBox.Icon.WARNING, "WARNING");
    	}else{
    		var curDate = new Date();
    		if(dateValue > curDate){
    			sap.m.MessageBox.show("Date should be smaller than or equal to current date.", sap.m.MessageBox.Icon.WARNING, "WARNING");
    			evt.getSource().setDateValue(null);
    		}
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
                    SFEE_context.getView().byId("class_txtId").removeAllCustomData();
                    SFEE_context.getView().byId("class_txtId").setValue(oSelectedItem.getTitle());
                    SFEE_context.getView().byId("class_txtId").addCustomData(
                        new sap.ui.core.CustomData({
                            key: "classId",
                            value: oSelectedItem.data().key
                        })
                    )
                    SFEE_context.onChangeSearch();
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
            jQuery.sap.delayedCall(350, SFEE_context, function() {
                _valueHelpSelectDialog._oSearchField.focus();
            });
        }
    },
    handleDivisionValueHelp: function(evt) {
        var oClassTxt = SFEE_context.getView().byId("class_txtId");
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
                        SFEE_context.getView().byId("division_txtId").removeAllCustomData();
                        SFEE_context.getView().byId("division_txtId").setValue(oSelectedItem.getTitle());
                        SFEE_context.getView().byId("division_txtId").addCustomData(
                            new sap.ui.core.CustomData({
                                key: "divisionId",
                                value: oSelectedItem.data().key
                            })
                        )
                        SFEE_context.onChangeSearch();
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
                jQuery.sap.delayedCall(350, SFEE_context, function() {
                    _valueHelpSelectDialog._oSearchField.focus();
                });
            }
        } else {
            sap.m.MessageBox.show("Please select class.", sap.m.MessageBox.Icon.WARNING, "WARNING");
        }
    },
    onFilterExpandPress: function(evt) {
        var oButton = evt.getSource();
        var oFilterPnl = SFEE_context.getView().byId("filter_pnlId");
        var oFeeDtlPnl = SFEE_context.getView().byId("studentFeeDtl_pnlId");
        var oSubmitBtn = SFEE_context.getView().byId("studentFee_submit_btnId");
        var oCancelBtn = SFEE_context.getView().byId("studentFee_cancel_btnId");
        if (oButton.getText() === "Collapse") {
            oButton.setIcon("sap-icon://navigation-down-arrow");
            oButton.setText("Expand");
            oFilterPnl.setVisible(false);
        } else {
            oButton.setIcon("sap-icon://navigation-up-arrow");
            oButton.setText("Collapse");
            oFilterPnl.setVisible(true);
            if (oFeeDtlPnl.getVisible() === true)
                oFeeDtlPnl.setVisible(false);
            if (oSubmitBtn.getVisible() === true)
                oSubmitBtn.setVisible(false);
            if (oCancelBtn.getVisible() === true)
            	oCancelBtn.setVisible(false);
            if (SFEE_context.getView().getContent()[0].getEnableScrolling() === true && SFEE_context.getView().getModel("device").getData().isPhone === false)
                SFEE_context.getView().getContent()[0].setEnableScrolling(SFEE_context.getView().getModel("device").getData().isPhone);
        }
    },
    onChangeSearch: function(evt) {
        oBusyDialog.open();
        jQuery.sap.delayedCall(1, this, function() {
            SFEE_context.onSearchStudentDtl();
        });
    },
    onSearchStudentDtl: function() {
        var sFName = SFEE_context.getView().byId("firstName_txtId").getValue();
        var sLName = SFEE_context.getView().byId("lastName_txtId").getValue();
        var sRollNo = SFEE_context.getView().byId("rollNumber_txtId").getValue();
        var sClassId = SFEE_context.getView().byId("class_txtId").getValue() != "" ? SFEE_context.getView().byId("class_txtId").data().classId : "";
        var sDivisionId = SFEE_context.getView().byId("division_txtId").getValue() != "" ? SFEE_context.getView().byId("division_txtId").data().divisionId : "";
        var sQuery = "";
        if (sFName)
            sQuery += "&fName=" + sFName;
        else
            sQuery += "&fName=null";
        if (sLName)
            sQuery += "&lName=" + sLName;
        else
            sQuery += "&lName=null";
        if (sRollNo)
            sQuery += "&rollumber=" + sRollNo;
        else
            sQuery += "&rollumber=null";
        if (sClassId)
            sQuery += "&classId=" + sClassId;
        else
            sQuery += "&classId=null";
        if (sDivisionId)
            sQuery += "&divisionId=" + sDivisionId;
        else
            sQuery += "&divisionId=null";
        if (sFName || sLName || sRollNo || sClassId || sDivisionId) {
            var sUri = "StudentDtl4FeeGet?schoolId=" + sessionStorage.getItem('schoolId')+ sQuery;
            var oResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
            if (oResponse != null) {
                SFEE_context.bindSuggestionTable(oResponse);
                SFEE_context.getView().byId("filterStudentList_pnlId").setVisible(true);
            }
        }
        oBusyDialog.close();
    },
    bindSuggestionTable: function(oData) {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                    text: "{firstName}",
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
                new sap.ui.layout.HorizontalLayout({
                	allowWrapping:"{device>/isPhone}",
                	content:[
                		new sap.m.Button({
                            icon: "sap-icon://edit",
                            type: "Emphasized",
                            text: "Edit",
                            visible:"{isEditFlag}",
                            press: SFEE_context.onStudentFeeTableEditActionPress
                        }).addStyleClass("sapUiTinyMarginEnd"),
	                	new sap.m.Button({
	                        icon: "sap-icon://action",
	                        type: "Accept",
	                        text: "Pay",
	                        press: SFEE_context.onStudentFeeTablePayActionPress
	                    })]
                })
                
            ]
        });
        var oTable = SFEE_context.getView().byId("studentFee_tblId");
        oTable.unbindAggregation("items");
        oTable.setModel(new sap.ui.model.json.JSONModel(oData));
        oTable.bindAggregation("items", {
            path: "/results",
            template: tblTemplate,
            //templateShareable: true
        });
    },
    setStudentFeeTableHeight: function(evt) {
        var oTable = evt.getSource();
        SFEE_context.setTableHeigth(oTable);
    },
    setTableHeigth: function(oTable) {
        var oScrollContainer = oTable.getParent();
        if (oTable.getDomRef() != null && sap.ui.Device.system.phone !== true) {
            var footerHeight = SFEE_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
            var tablePositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
            var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
            oScrollContainer.setHeight(String(scrollHeight + "px"));
            if (!jQuery.device.is.phone) {
                var tableHeight = oTable.getDomRef().getBoundingClientRect().height;
                var hdrTable = SFEE_context.getView().byId("hdr_studentFee_tblId");
                if (tableHeight > scrollHeight) {
                    hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(true);
                } else {
                    hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(false);
                }
            }
        }
    },
    onStudentFeeTableEditActionPress:function(evt){
    	SFEE_context.Mode = "EDIT";
    	 var obj = evt.getSource().getParent().getParent().getBindingContext().getObject();
    	 if(obj.feeStrutureStatus){
        	 SFEE_context.getView().byId("filterExpand_btnId").firePress(this);
             SFEE_context.getView().byId("studentFeeDtl_pnlId").setVisible(true);
             SFEE_context.getView().byId("studentFee_submit_btnId").setVisible(true);
             SFEE_context.getView().byId("studentFee_cancel_btnId").setVisible(true);
             SFEE_context.getView().byId("receiptNo_lblId").setVisible(false);
             SFEE_context.getView().byId("receiptNo_txtId").setVisible(false);
             SFEE_context.getView().byId("receiptDt_lblId").setVisible(false);
             SFEE_context.getView().byId("receiptDt_dtpId").setVisible(false);
             SFEE_context.getView().getContent()[0].setEnableScrolling(true);
             oBusyDialog.open();
             jQuery.sap.delayedCall(1, this, function() {
                 SFEE_context.getStudentFeeDetail(obj.studentId, "EDIT");
             });
             SFEE_context.getView().byId("studentFirstName_txtId").setText(obj.firstName);
             SFEE_context.getView().byId("studentLastName_txtId").setText(obj.lastName);
             SFEE_context.getView().byId("studentGRNo_txtId").setText(obj.grNo);
             SFEE_context.getView().byId("studentRollNumber_txtId").setText(obj.rollNumber);
             SFEE_context.getView().byId("studentClass_txtId").setText(obj.className);
             SFEE_context.getView().byId("studentDivision_txtId").setText(obj.divisionName);
             SFEE_context.getView().byId("receiptNo_txtId").setValue("");
             SFEE_context.getView().byId("receiptDt_dtpId").setDateValue(null);
        }else{
        	sap.m.MessageBox.show("Please define or update Fee Structure for Class " + obj.className + ".", sap.m.MessageBox.Icon.WARNING, "Warning");
        }
    },
    onStudentFeeTablePayActionPress: function(evt) {
    	SFEE_context.Mode = "ADD";
        var obj = evt.getSource().getParent().getParent().getBindingContext().getObject();
        if(obj.feeStrutureStatus){
        	 SFEE_context.getView().byId("filterExpand_btnId").firePress(this);
             SFEE_context.getView().byId("studentFeeDtl_pnlId").setVisible(true);
             SFEE_context.getView().byId("studentFee_submit_btnId").setVisible(true);
             SFEE_context.getView().byId("studentFee_cancel_btnId").setVisible(true);
             SFEE_context.getView().byId("receiptNo_lblId").setVisible(true);
             SFEE_context.getView().byId("receiptNo_txtId").setVisible(true);
             SFEE_context.getView().byId("receiptDt_lblId").setVisible(true);
             SFEE_context.getView().byId("receiptDt_dtpId").setVisible(true);
             oBusyDialog.open();
             jQuery.sap.delayedCall(1, this, function() {
                 SFEE_context.getStudentFeeDetail(obj.studentId, "ADD");
             });
             SFEE_context.getView().byId("studentFirstName_txtId").setText(obj.firstName);
             SFEE_context.getView().byId("studentLastName_txtId").setText(obj.lastName);
             SFEE_context.getView().byId("studentGRNo_txtId").setText(obj.grNo);
             SFEE_context.getView().byId("studentRollNumber_txtId").setText(obj.rollNumber);
             SFEE_context.getView().byId("studentClass_txtId").setText(obj.className);
             SFEE_context.getView().byId("studentDivision_txtId").setText(obj.divisionName);
             SFEE_context.getView().byId("receiptNo_txtId").setValue("");
             SFEE_context.getView().byId("receiptDt_dtpId").setDateValue(null);
        }else{
        	sap.m.MessageBox.show("Please define or update Fee Structure for Class " + obj.className + ".", sap.m.MessageBox.Icon.WARNING, "Warning");
        }
    },
    setPanelScrollHeight: function(oPanel) {
        var oScrollContainer = oPanel.getParent();
        if (oPanel.getDomRef() != null && sap.ui.Device.system.phone !== true) {
            var footerHeight = SFEE_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
            var panelPositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
            var scrollHeight = window.innerHeight - panelPositionTop - footerHeight;
            oScrollContainer.setHeight(String(scrollHeight + "px"));
        }
    },
    getStudentFeeDetail: function(studentId, mode) {
        var sUri = "FeeDtl4StudentGet?schoolId=" + sessionStorage.getItem('schoolId') + "&studentId=" + studentId + "&mode=" + mode;
        var oResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
        if (oResponse != null) {
            SFEE_context.bindFeePaymentDetail(oResponse);
        }
        oBusyDialog.close();
    },
    bindFeePaymentDetail:function(oData){
    	var oFeePaymentDtlPanel = SFEE_context.getView().byId("feePaymentDtl_pnlId");
    	oFeePaymentDtlPanel.destroyContent();
    	var hdrLen = oData.navFeePayableHdrDetail.length;
    	for(var i = 0; i < hdrLen; i++){
    		var sHeaderText = oData.navFeePayableHdrDetail[i].payableMonthText;
    		sHeaderText += ", " + oData.navFeePayableHdrDetail[i].payableYear;
    		var oPanel = SFEE_context.getFeePaymentPanel(sHeaderText);
    		var oTable = SFEE_context.getFeePaymentTable();
    		SFEE_context.bindFeePaymentTable(oTable, oData, oData.navFeePayableHdrDetail[i].payableMonthKey);
    		if(oTable.getItems().length > 0){
    			oPanel.addContent(oTable);
        		oFeePaymentDtlPanel.addContent(oPanel);
    		}else
    			continue;
    	}
    	SFEE_context.setPanelScrollHeight(oFeePaymentDtlPanel);
    	
    	if(oFeePaymentDtlPanel.getContent().length === 0 
    			&& (SFEE_context.Mode === "ADD" || SFEE_context.Mode === "EDIT")){
    		 SFEE_context.getView().byId("studentFee_submit_btnId").setVisible(false);
    	}
    },
    getFeePaymentPanel:function(sHeaderText){
    	var oPanel = new sap.m.Panel({
    		expandable:true,
    		expanded:false,
    		width:"100%",
    		headerToolbar:[
    			new sap.m.Toolbar({
    				height:"2.5rem",
    				content:[
    					new sap.m.Title({
    						level:"H6",
    						titleStyle:"H6",
    						text:sHeaderText
    					}),
    					new sap.m.ToolbarSpacer(),
    					new sap.m.CheckBox({
    						 text: SFEE_context.Mode === "EDIT" ? "Remove All" : "Pay All",
    						 select:SFEE_context.onFeePaymentPayAllSelect
    		            }).addStyleClass("sapUiTinyMarginEnd")
    				]
    			})
    		]
    	});
    	oPanel.addStyleClass("sapUiResponsiveContentPadding");
    	return oPanel;
    },
    onFeePaymentPayAllSelect:function(evt){
    	var bSelect = evt.getSource().getSelected();
    	var oPanel = evt.getSource().getParent().getParent();
    	var oTableItems = oPanel.getContent()[0].getItems();
    	for(var x = 0; x < oTableItems.length; x++){
    		var oPayChkBox = oTableItems[x].getCells()[7];
    		if(oPayChkBox.getSelected() !== bSelect)
    			oPayChkBox.setSelected(bSelect);
    	}
    },
    getFeePaymentTable:function(){
    	var oTable = new sap.m.Table({
    		inset:false,
    		columns:[
    			SFEE_context.getFeePaymentTableHeaderColumn("Left", "Fee Label"),
    			SFEE_context.getFeePaymentTableHeaderColumn("Center", "Amount"),
    			SFEE_context.getFeePaymentTableHeaderColumn("Center", "Discount"),
    			SFEE_context.getFeePaymentTableHeaderColumn("Center", "Discount Amount"),
    			SFEE_context.getFeePaymentTableHeaderColumn("Center", "Consession"),
    			SFEE_context.getFeePaymentTableHeaderColumn("Center", "Consession Amount"),
    			SFEE_context.getFeePaymentTableHeaderColumn("Center", "Amount Payable"),
    			SFEE_context.getFeePaymentTableHeaderColumn("Center", SFEE_context.Mode === "EDIT" ? "Remove" : "Pay"),
    		]
    	});
    	return oTable;
    },
    getFeePaymentTableHeaderColumn:function(hAlign, sLabel){
    	return new sap.m.Column({
			minScreenWidth:"Tablet",
			demandPopin:true,
			hAlign:hAlign,
			header:[
				new sap.m.ObjectIdentifier({
					title:sLabel
				})
			]
		});
    },
    bindFeePaymentTable:function(oTable, oData, sFilterValue){
    	var tblTemplate = new sap.m.ColumnListItem({
            cells: [
                new sap.m.ObjectIdentifier({
                	title: "{feeLabel}",
                }),
                new sap.m.Text({
                    text: "{totalAmount}"
                }),
                new sap.m.Text({
                	 text: {
                         path: "isDiscountApplicable",
                         formatter: function(value) {
                             if (value === true)
                                 return "Yes";
                             else
                                 return "No";
                         }
                     }
                }),
                new sap.m.Text({
                    text: "{discountAmount}"
                }),
                new sap.m.Text({
                	 text: {
                         path: "isConcessionApplicable",
                         formatter: function(value) {
                             if (value === true)
                                 return "Yes";
                             else
                                 return "No";
                         }
                     }
                }),
                new sap.m.Text({
                    text: "{consessionAmount}",
                }),
                new sap.m.Text({
                    text: "{amountPaid}"
                }),
                new sap.m.CheckBox({
            		selected:"{paid}",
            		select:SFEE_context.onFeePaymentPaySelect
                }),
            ]
        });
        oTable.unbindAggregation("items");
        oTable.setModel(new sap.ui.model.json.JSONModel(oData));
        oTable.bindAggregation("items", {
            path: "/navFeePayableItemDetail",
            template: tblTemplate,
            filters:[new sap.ui.model.Filter("payableMonth", sap.ui.model.FilterOperator.EQ, sFilterValue)]
            //templateShareable: true
        });
    },
    onFeePaymentPaySelect:function(evt){
    	var bSelect = evt.getSource().getSelected();
    	var oPayAllChkBox = evt.getSource().getParent().getParent().getParent().getHeaderToolbar().getContent()[2];
    	if(oPayAllChkBox.getSelected() === true && bSelect === false)
    		oPayAllChkBox.setSelected(false);
    	
    },
    validateStudentFeeDtl:function(){
    	var msg = "";
    	if(SFEE_context.Mode === "ADD"){
    		if(SFEE_context.getView().byId("receiptNo_txtId").getValue() === "")
    			msg += "Please enter Receipt No." + "\n";
    		if(SFEE_context.getView().byId("receiptDt_dtpId").getValue() === "")
    			msg += "Please select Receipt Date." + "\n";
    	}
    		
    	return msg;
    },
    getStudentFeeDtlRequestBody:function(){
    	var requestBody = {};
    	requestBody.schoolId = sessionStorage.getItem('schoolId');
    	requestBody.mode = SFEE_context.Mode;
    	requestBody.receiptNo = SFEE_context.getView().byId("receiptNo_txtId").getValue();
    	if(SFEE_context.getView().byId("receiptDt_dtpId").getDateValue() != null)
    		requestBody.receiptDate = com.itec.sams.util.formatter.dateFormat(SFEE_context.getView().byId("receiptDt_dtpId").getDateValue());
    	requestBody.userId = sessionStorage.getItem('userId');
    	
    	var oFeePaymentDtlPanel = SFEE_context.getView().byId("feePaymentDtl_pnlId");
    	var oTable = oFeePaymentDtlPanel.getContent()[0].getContent()[0];
    	var oData = oTable.getModel().getData();
    	
    	requestBody.navFeePayableHdrDetail = oData.navFeePayableHdrDetail;
    	requestBody.navFeePayableItemDetail = oData.navFeePayableItemDetail;
    	requestBody.studentId = oData.navFeePayableItemDetail[0].studentId;
    	
    	
    	return requestBody;
    },
    onStudentFeeDetailSubmit:function(){
    	var requestBody = SFEE_context.getStudentFeeDtlRequestBody();
        var saveResponse = new com.itec.sams.util.GetPostApiCall.postData("FeeDtl4StudentSet", requestBody);
        if (saveResponse != null) {
            if (saveResponse.msgType === "S") {
                sap.m.MessageBox.show(saveResponse.msg, {
                    icon: sap.m.MessageBox.Icon.SUCCESS,
                    title: "Success",
                    styleClass: "sapUiSizeCompact",
                    onClose: function(action) {
                    	oBusyDialog.close();
                    	SFEE_context.getView().byId("firstName_txtId").setValue("");
                        SFEE_context.getView().byId("lastName_txtId").setValue("");
                        SFEE_context.getView().byId("rollNumber_txtId").setValue("");
                        SFEE_context.getView().byId("class_txtId").removeAllCustomData();
                        SFEE_context.getView().byId("class_txtId").setValue("");
                        SFEE_context.getView().byId("division_txtId").removeAllCustomData();
                        SFEE_context.getView().byId("division_txtId").setValue("");
                        var oFiterButton = SFEE_context.getView().byId("filterExpand_btnId");
                        var oFilterPnl = SFEE_context.getView().byId("filter_pnlId");
                        var oFeeDtlPnl = SFEE_context.getView().byId("studentFeeDtl_pnlId");
                        if (oFilterPnl.getVisible() === false) {
                            oFiterButton.setIcon("sap-icon://navigation-up-arrow");
                            oFiterButton.setText("Collapse");
                            oFilterPnl.setVisible(true);
                            if (oFeeDtlPnl.getVisible() === true)
                                oFeeDtlPnl.setVisible(false);
                        }
                        SFEE_context.getView().byId("filterStudentList_pnlId").setVisible(false);
                        SFEE_context.getView().byId("studentFee_submit_btnId").setVisible(false);
                        SFEE_context.getView().byId("studentFee_cancel_btnId").setVisible(true);
                        SFEE_context.getView().getContent()[0].setEnableScrolling(SFEE_context.getView().getModel("device").getData().isPhone);
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
    onSubmit:function(evt){
    	 var msg = SFEE_context.validateStudentFeeDtl();
         if (msg === "") {
             sap.m.MessageBox.confirm("Are you sure you want to submit?", {
                 icon: sap.m.MessageBox.Icon.QUESION,
                 title: "Confirmation",
                 action: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                 styleClass: "sapUiSizeCompact",
                 onClose: function(action) {
                     if (action === "OK") {
                         oBusyDialog.open();
                         jQuery.sap.delayedCall(1, this, function() {
                        	 SFEE_context.onStudentFeeDetailSubmit();
                         });
                     }
                 }
             });
         } else {
             sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Error");
         }
    },
    onCancel:function(evt){
    	 sap.m.MessageBox.confirm("Are you sure you want to cancel?", {
             icon: sap.m.MessageBox.Icon.QUESION,
             title: "Confirmation",
             action: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
             styleClass: "sapUiSizeCompact",
             onClose: function(action) {
                 if (action === "OK") {
                	 SFEE_context.initialLoad();
                 }
             }
         });
    },
});