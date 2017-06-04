jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
sap.ui.core.mvc.Controller.extend("com.itec.sams.controller.FeeStructureDetail", {
    onInit: function() {
        FSADE_context = this;
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
        if (sName !== "FeeStructureDetail") {
            return;
        } else {
            oPageTitle.setText("Fee Structure Detail");
            var contextModel = sap.ui.getCore().getModel("contextModel");
            if (contextModel != undefined) {
                oBusyDialog.open();
                jQuery.sap.delayedCall(1, this, function() {
                    FSADE_context.initialLoad();
                });
            } else {
                var bReplace = jQuery.device.is.phone ? false : true;
                FSADE_context.getRouter().navTo("FeeStructure", bReplace);
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
    	 if(cModelData.mode != "DISPLAY"){
    		 sap.m.MessageBox.confirm("Are you sure want to cancel?", {
    	            icon: sap.m.MessageBox.Icon.QUESION,
    	            title: "Confirmation",
    	            action: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
    	            styleClass: "sapUiSizeCompact",
    	            onClose: function(action) {
    	                if (action === "OK") {
    	                	sap.ui.getCore().setModel(null, "contextModel");
    	                    var bReplace = jQuery.device.is.phone ? false : true;
    	                    FSADE_context.getRouter().navTo("FeeStructure", bReplace);
    	                }

    	            }
    	        });
    	 }else{
    		 sap.ui.getCore().setModel(null, "contextModel");
    	        var bReplace = jQuery.device.is.phone ? false : true;
    	        FSADE_context.getRouter().navTo("FeeStructure", bReplace);
    	 }
    },
    initialLoad: function() {
//    	FSADE_context.getView().byId("classFeeStruct_txtId").removeAllCustomData();
//    	FSADE_context.getView().byId("classFeeStruct_txtId").setValue("");
        var contextModelData = sap.ui.getCore().getModel("contextModel").getData();
        var query = "FeeStructureDetail4ClassGet?schoolId=4&feeStructureId=0";
        FSADE_context.getView().byId("totalAmountPayable_txtId").setText(" " + parseInt("0").toFixed(2));
        if (contextModelData.mode === "EDIT" || contextModelData.mode === "DISPLAY"){
        	query = "FeeStructureDetail4ClassGet?schoolId=4&feeStructureId=" + contextModelData.tableData.structureId;
        	FSADE_context.onEditDisplayViewBind(contextModelData.tableData);
        }
            
        var oFeeStructureDtlResponse = new com.itec.sams.util.GetPostApiCall.getData(query);
        if (oFeeStructureDtlResponse != null) {
            FSADE_context._createFeeStructureForm(oFeeStructureDtlResponse.navfeeStructureDetail);
            FSADE_context.bindCasteSubCasteMinorityTbl(oFeeStructureDtlResponse);
        }
        FSADE_context.setViewEnable(contextModelData.mode);
        oBusyDialog.close();
    },
    onEditDisplayViewBind:function(oData){
    	 FSADE_context.getView().byId("classFeeStruct_txtId").removeAllCustomData();
         FSADE_context.getView().byId("classFeeStruct_txtId").setValue(oData.className);
         FSADE_context.getView().byId("classFeeStruct_txtId").addCustomData(
             new sap.ui.core.CustomData({
                 key: "classId",
                 value: oData.classId
             })
         );
         var totalAmount = (parseInt(oData.totalMonthlyAmount) * 12) + parseInt(oData.totalYearlyAmount);
         FSADE_context.getView().byId("totalAmountPayable_txtId").setText(" " + totalAmount.toFixed(2));
         if(oData.isConsession === true){
        	 FSADE_context.getView().byId("consessionYes_rBtnId").setSelected(true);
         }else{
        	 FSADE_context.getView().byId("consessionNo_rBtnId").setSelected(true);
         } 
         
         if(oData.isDiscount === true){
        	 FSADE_context.getView().byId("discountYes_rBtnId").setSelected(true);
        	 FSADE_context.getView().byId("discountYes_rBtnId").fireSelect(this);
         }else{
        	 FSADE_context.getView().byId("discountNo_rBtnId").setSelected(true);
        	 FSADE_context.getView().byId("discountNo_rBtnId").fireSelect(this);
         } 
         
    },
    setViewEnable:function(mode){
    	var isEnabled = mode === "ADD" || mode === "EDIT" ? true : false; 
    	if(mode === "EDIT")
    		FSADE_context.getView().byId("classFeeStruct_txtId").setEnabled(false);
    	else
    		FSADE_context.getView().byId("classFeeStruct_txtId").setEnabled(isEnabled);
    	
    	 var feeStructureForm = FSADE_context.getView().byId("feeStructure_frmId");
         var fContent = feeStructureForm.getContent();
         for (var x = 0; x < fContent.length; x++) {
             var sElement = fContent[x];
             if (sElement.getMetadata().getName() === "sap.m.Input") {
            	 sElement.setEnabled(isEnabled);
             }
         }
         
         FSADE_context.getView().byId("consessionYes_rBtnId").setEnabled(isEnabled);
         FSADE_context.getView().byId("consessionNo_rBtnId").setEnabled(isEnabled);
         
         FSADE_context.getView().byId("discountYes_rBtnId").setEnabled(isEnabled);
         FSADE_context.getView().byId("discountNo_rBtnId").setEnabled(isEnabled);
         
         if(mode === "ADD"){
        	 FSADE_context.getView().byId("consessionYes_rBtnId").setSelected(false);
             FSADE_context.getView().byId("consessionNo_rBtnId").setSelected(false);
             FSADE_context.getView().byId("discountYes_rBtnId").setSelected(false);
             FSADE_context.getView().byId("discountNo_rBtnId").setSelected(false);
         }
         
    	 var feeDiscountTable = FSADE_context.getView().byId("casteSubCasteDiscount_tblId");
         var tblItems = feeDiscountTable.getItems();
         for (var i = 0; i < tblItems.length; i++) {
             var tblCells = tblItems[i].getCells();
             for (var j = 1; j < tblCells.length; j++) {
                 var tblElements = tblCells[j];
                 if (tblElements.getMetadata().getName() === "sap.m.Input") {
                	 tblElements.setEnabled(isEnabled);
                 }
             }
         }
         
         FSADE_context.getView().byId("submit_FSD_btnId").setVisible(isEnabled);
    },
    onFeeStructureClassF4: function(evt) {
        var query = {
            mode: "CLASS_FSD",
            schoolId: sessionStorage.getItem('schoolId'),
            key: ""
        };
        var f4DialogResponse = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", query);
        if (f4DialogResponse != "") {
            var f4Model = new sap.ui.model.json.JSONModel(f4DialogResponse);
            var handleClose = function(oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    FSADE_context.getView().byId("classFeeStruct_txtId").removeAllCustomData();
                    FSADE_context.getView().byId("classFeeStruct_txtId").setValue(oSelectedItem.getTitle());
                    FSADE_context.getView().byId("classFeeStruct_txtId").addCustomData(
                        new sap.ui.core.CustomData({
                            key: "classId",
                            value: oSelectedItem.data().key
                        })
                    )
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
            jQuery.sap.delayedCall(350, FSADE_context, function() {
                _valueHelpSelectDialog._oSearchField.focus();
            });
        }
    },
    _createFeeStructureForm: function(mData) {
        var feeStructureForm = FSADE_context.getView().byId("feeStructure_frmId");
        feeStructureForm.destroyContent();
        for (var x = 0; x < mData.length; x++) {
            if (x === 0) {
                feeStructureForm.addContent(new sap.ui.core.Title());
            }
            var oLabel = new sap.m.Label({
                text: mData[x].labelName,
                required: true,
                design: "Bold"
            });
            
            var placeholderText = "Enter Amount payable in monthly...";
            if (mData[x].applicableOn === "1")
                placeholderText = "Enter Amount payable in one time...";
            else if (mData[x].applicableOn === "2")
                placeholderText = "Enter Amount payable in annually...";
            else if (mData[x].applicableOn === "3")
                placeholderText = "Enter Amount payable in half yearly...";
            else if (mData[x].applicableOn === "4")
                placeholderText = "Enter Amount payable in quaterly...";
            var oInput = new sap.m.Input({
                value: mData[x].amountPayable,
                type: "Text",
                maxLength: 5,
                placeholder: placeholderText,
                liveChange: FSADE_context.onFormInputLiveChange
            });
            oInput.addCustomData(new sap.ui.core.CustomData({
                key: "designId",
                value: mData[x].designId,

            }));
            oInput.addCustomData(new sap.ui.core.CustomData({
                key: "applicableOn",
                value: mData[x].applicableOn,

            }));
            
            oInput.addCustomData(new sap.ui.core.CustomData({
                key: "structureDtlId",
                value: mData[x].structureDtlId,

            }));
            
            oInput.addStyleClass("indianCurrencyInput");
            feeStructureForm.addContent(oLabel);
            feeStructureForm.addContent(oInput);
            x += 1;
        }
        for (var y = 1; y < mData.length; y++) {
            if (y === 1) {
                feeStructureForm.addContent(new sap.ui.core.Title());
            }
            var oLabel = new sap.m.Label({
                text: mData[y].labelName,
                required: true,
                design: "Bold"
            });
            
            var placeholderText = "Enter Amount payable in monthly...";
            if (mData[y].applicableOn === "1")
                placeholderText = "Enter Amount payable in one time...";
            else if (mData[y].applicableOn === "2")
                placeholderText = "Enter Amount payable in annually...";
            else if (mData[y].applicableOn === "3")
                placeholderText = "Enter Amount payable in half yearly...";
            else if (mData[y].applicableOn === "4")
                placeholderText = "Enter Amount payable in quaterly...";
            var oInput = new sap.m.Input({
                value: mData[y].amountPayable,
                type: "Text",
                maxLength: 5,
                placeholder: placeholderText,
                liveChange: FSADE_context.onFormInputLiveChange
            });
            
            oInput.addCustomData(new sap.ui.core.CustomData({
                key: "designId",
                value: mData[y].designId
            }));
            
            oInput.addCustomData(new sap.ui.core.CustomData({
                key: "structureDtlId",
                value: mData[y].structureDtlId,

            }));
            
            oInput.addCustomData(new sap.ui.core.CustomData({
                key: "applicableOn",
                value: mData[y].applicableOn,

            }));
            
            feeStructureForm.addContent(oLabel);
            feeStructureForm.addContent(oInput);
            y += 1;
        }
    },
    bindCasteSubCasteMinorityTbl: function(mData) {
        var oTable = FSADE_context.getView().byId("casteSubCasteDiscount_tblId");
        oTable.removeAllColumns();

        for (var y = 0; y < mData.navFeeArchitectureDtl.length; y++) {
            if (y === 0) {
                var oColumn = new sap.m.Column({
                    minScreenWidth: "Tablet",
                    demandPopin: true,
                    header: new sap.m.ObjectIdentifier({
                        title: "Caste - Sub Caste",
                    })
                });
                oTable.addColumn(oColumn);
            }
            var oColumn = new sap.m.Column({
                minScreenWidth: "Tablet",
                demandPopin: true,
                header: new sap.m.ObjectIdentifier({
                    title: mData.navFeeArchitectureDtl[y].labelName,
                }).addCustomData(
                    new sap.ui.core.CustomData({
                        key: "designId",
                        value: mData.navFeeArchitectureDtl[y].designId
                    })
                )
            });
            oTable.addColumn(oColumn);
        }

        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.ObjectIdentifier({
                title: "{casteName} - {subCasteName}",
            }).addCustomData(
                new sap.ui.core.CustomData({
                    key: "subCasteId",
                    value: "{subCasteId}"
                })
            )]
        });
        for (var y = 0; y < mData.navFeeArchitectureDtl.length; y++) {
            var oInput = new sap.m.Input({
                type: "Text",
                value: "{value" + y + "}",
                maxLength: 3,
                placeholder: "Enter Percentage...",
                liveChange: FSADE_context.onTableInputLiveChange
            });
            oInput.addCustomData(new sap.ui.core.CustomData({
                key: "key",
                value: "{key" + y + "}"
            }));
            oInput.addCustomData(new sap.ui.core.CustomData({
                key: "id",
                value: "{id" + y + "}"
            }));
            tblTemplate.addCell(oInput);
        }

        oTable.setModel(new sap.ui.model.json.JSONModel(FSADE_context.getTableDataforCasteSubCaste(mData)));
        oTable.bindItems("/results", tblTemplate);
    },
    getTableDataforCasteSubCaste: function(mData) {
        var localData = {
            results: []
        };
        for (var x = 0; x < mData.navSubCasteDtl.length; x++) {
            var valueData = {};
            valueData["subCasteId"] = mData.navSubCasteDtl[x].subCasteId;
            valueData["subCasteName"] = mData.navSubCasteDtl[x].subCasteName;
            valueData["casteName"] = mData.navSubCasteDtl[x].casteName;
            for (var y = 0; y < mData.navFeeArchitectureDtl.length; y++) {
                valueData["value" + y] = "";
                valueData["key" + y] = mData.navFeeArchitectureDtl[y].designId;
                valueData["id" + y] = 0;
            }
            localData.results.push(valueData);
        }
        if (mData.navCasteSubCasteDiscountDtl.length > 0) {
            for (var i = 0; i < localData.results.length; i++) {
                var obj = localData.results[i];
                for (var j = 0; j < mData.navFeeArchitectureDtl.length; j++) {
                    for (var k = 0; k < mData.navCasteSubCasteDiscountDtl.length; k++) {
                        if (mData.navCasteSubCasteDiscountDtl[k].feeStructureDesignId === obj["key" + j] && mData.navCasteSubCasteDiscountDtl[k].subCasteId === obj["subCasteId"]) {
                            localData.results[i]["id" + j] = mData.navCasteSubCasteDiscountDtl[k].casteSubCasteDiscountId;
                            localData.results[i]["value" + j] = mData.navCasteSubCasteDiscountDtl[k].discountPercent;
                            break;
                        }
                    }
                }
            }
        }
        return localData;
    },
    onTableInputLiveChange: function(evt) {
        var value = evt.getSource().getValue();
        var pattern = /\d/g;
        if (pattern.test(value) === true) {
            if (parseInt(value) > 100 || value.length > 3) {
                value = value.substr(0, value.length - 1);
                evt.getSource().setValue(value);
            }
        } else {
            value = value.replace(/\D/g, '');;
            evt.getSource().setValue(value);
        }
    },
    onFormInputLiveChange: function(evt) {
        var value = evt.getSource().getValue();
        var pattern = /\d/g;
        if (pattern.test(value) === true) {
            if (parseInt(value) > 99999 || value.length > 5) {
                value = value.substr(0, value.length - 1);
                evt.getSource().setValue(value);
            }
        } else {
            value = value.replace(/\D/g, '');;
            evt.getSource().setValue(value);
        }
    },
    onDiscountYesSelect: function(evt) {
        var selected = evt.getSource().getSelected();
        if (selected) {
            FSADE_context.getView().byId("casteSubCasteDiscount_tblId").setVisible(true);
        }
    },
    onDiscountNoSelect: function(evt) {
        var selected = evt.getSource().getSelected();
        if (selected) {
            FSADE_context.getView().byId("casteSubCasteDiscount_tblId").setVisible(false);
        }
    },
    validateFeeStructureDetail: function() {
        var msg = "";
        if (FSADE_context.getView().byId("classFeeStruct_txtId").getValue() === "") {
            FSADE_context.getView().byId("classFeeStruct_txtId").setValueState("Error");
            FSADE_context.getView().byId("classFeeStruct_txtId").setValueStateText(" ");
            msg = "Please enter all mandatory fields.";
        } else {
            FSADE_context.getView().byId("classFeeStruct_txtId").setValueState("None");
            FSADE_context.getView().byId("classFeeStruct_txtId").setValueStateText(" ");
        }
        var feeStructureForm = FSADE_context.getView().byId("feeStructure_frmId");
        var fContent = feeStructureForm.getContent();
        var totalAmount = 0;
        for (var x = 0; x < fContent.length; x++) {
            var sElement = fContent[x];
            if (sElement.getMetadata().getName() === "sap.m.Input") {
                if (sElement.getValue() === "") {
                    sElement.setValueState("Error");
                    sElement.setValueStateText(" ");
                    msg = "Please enter all mandatory fields.";
                } else {
                    sElement.setValueState("None");
                    sElement.setValueStateText(" ");
                    var feeValue = 0;
                    if(sElement.data("applicableOn") === "5")
                    	feeValue = parseInt(sElement.getValue()) * 12;
                    else if(sElement.data("applicableOn") === "4")
                    	feeValue = parseInt(sElement.getValue()) * 4;
                    else if (sElement.data("applicableOn") === "3")
                    	feeValue = parseInt(sElement.getValue()) * 2;
                    else 
                    	feeValue = parseInt(sElement.getValue());
                	totalAmount = parseInt(totalAmount) + parseInt(feeValue);
                	FSADE_context.getView().byId("totalAmountPayable_txtId").setText(" " + totalAmount.toFixed(2));
                }
            }
        }
        
        if (FSADE_context.getView().byId("consessionYes_rBtnId").getSelected() === false && FSADE_context.getView().byId("consessionNo_rBtnId").getSelected() === false) {
            FSADE_context.getView().byId("consessionYes_rBtnId").setValueState("Error");
            FSADE_context.getView().byId("consessionNo_rBtnId").setValueState("Error");
            msg = "Please enter all mandatory fields.";
        } else {
            FSADE_context.getView().byId("consessionYes_rBtnId").setValueState("None");
            FSADE_context.getView().byId("consessionNo_rBtnId").setValueState("None");
        }

        if (FSADE_context.getView().byId("discountYes_rBtnId").getSelected() === false && FSADE_context.getView().byId("discountNo_rBtnId").getSelected() === false) {
            FSADE_context.getView().byId("discountYes_rBtnId").setValueState("Error");
            FSADE_context.getView().byId("discountNo_rBtnId").setValueState("Error");
            msg = "Please enter all mandatory fields.";
        } else {
            FSADE_context.getView().byId("discountYes_rBtnId").setValueState("None");
            FSADE_context.getView().byId("discountNo_rBtnId").setValueState("None");
        }
        if (FSADE_context.getView().byId("discountYes_rBtnId").getSelected() === true) {
            var feeDiscountTable = FSADE_context.getView().byId("casteSubCasteDiscount_tblId");
            var tblItems = feeDiscountTable.getItems();
            for (var i = 0; i < tblItems.length; i++) {
                var tblCells = tblItems[i].getCells();
                for (var j = 1; j < tblCells.length; j++) {
                    var tblElements = tblCells[j];
                    if (tblElements.getMetadata().getName() === "sap.m.Input") {
                        if (tblElements.getValue() === "") {
                            tblElements.setValueState("Error");
                            tblElements.setValueStateText(" ");
                            msg = "Please enter all mandatory fields.";
                        } else {
                            tblElements.setValueState("None");
                            tblElements.setValueStateText(" ");
                        }
                    }
                }
            }
        }


        return msg;
    },
    onSubmitPress: function(evt) {
        var msg = FSADE_context.validateFeeStructureDetail();
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
                            FSADE_context.submitFeeStructureDetail();
                        });
                    }
                }
            });
        } else {
            sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Error");
        }
    },
    getRequestBody4FeeStructure: function() {
        var requestBody = {};
        var contextModelData = sap.ui.getCore().getModel("contextModel").getData();
        requestBody.Mode = contextModelData.mode;
        requestBody.schoolId = sessionStorage.getItem('schoolId');
        requestBody.classId = FSADE_context.getView().byId("classFeeStruct_txtId").data().classId;
        requestBody.isConsession = FSADE_context.getView().byId("consessionYes_rBtnId").getSelected();
        requestBody.isDiscount = FSADE_context.getView().byId("discountYes_rBtnId").getSelected();
        requestBody.feeStructureId = contextModelData.tableData.structureId === undefined ? 0 : contextModelData.tableData.structureId;
        requestBody.navSubCasteDiscountDtl = [];
        requestBody.navFeeStructureDtl = [];
        var feeStructureForm = FSADE_context.getView().byId("feeStructure_frmId");
        var fContent = feeStructureForm.getContent();
        for (var x = 0; x < fContent.length; x++) {
            var sElement = fContent[x];
            if (sElement.getMetadata().getName() === "sap.m.Input") {
            	requestBody.navFeeStructureDtl.push({
            		structureDtlId:sElement.data().structureDtlId,
            		amountPayable: sElement.getValue(),
            		designId:sElement.data().designId,
            		applicableOn:sElement.data().applicableOn,
            		isDiscount:FSADE_context.getView().byId("discountYes_rBtnId").getSelected()
            	});
            }
        }
        
        if (FSADE_context.getView().byId("discountYes_rBtnId").getSelected() === true) {
            var feeDiscountTable = FSADE_context.getView().byId("casteSubCasteDiscount_tblId");
            var tblItems = feeDiscountTable.getItems();
            for (var i = 0; i < tblItems.length; i++) {
                var tblCells = tblItems[i].getCells();
                for (var j = 1; j < tblCells.length; j++) {
                    var tblElements = tblCells[j];
                    if (tblElements.getMetadata().getName() === "sap.m.Input") {
                    	requestBody.navSubCasteDiscountDtl.push({
                    		casteSubCasteDiscountId:tblElements.data().id,
                    		feeStructureDesignId:tblElements.data().key,
                    		subCasteId:tblCells[0].data().subCasteId,
                    		discountPercent:tblElements.getValue(),
                    	});
                    }
                }
            }
        }

        return requestBody;
    },
    submitFeeStructureDetail: function() {
        var requestBody = FSADE_context.getRequestBody4FeeStructure();
        var saveResponse = new com.itec.sams.util.GetPostApiCall.postData("FeeStructureDetail4ClassSet", requestBody);
        if (saveResponse != null) {
            if (saveResponse.msgType === "S") {
                sap.m.MessageBox.show(saveResponse.msg, {
                    icon: sap.m.MessageBox.Icon.SUCCESS,
                    title: "Success",
                    styleClass: "sapUiSizeCompact",
                    onClose: function(action) {
                        sap.ui.getCore().setModel(null, "contextModel");
                        var bReplace = jQuery.device.is.phone ? false : true;
                        FSADE_context.getRouter().navTo("FeeStructure", bReplace);
                        oBusyDialog.close();
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
    }
});