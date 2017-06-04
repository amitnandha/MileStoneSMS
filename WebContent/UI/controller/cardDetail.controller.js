var action;
//CDADE_context._sModel, CDADE_context._cgModel
sap.ui.controller("com.itec.sams.controller.cardDetail", {
    onInit: function() {
        CDADE_context = this;
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
    onRouteMatched: function(oEvent) {
        var sName = oEvent.getParameter("name");
        if (sName !== "CardDetail") {
            return;
        } else {
            oPageTitle.setText("Card Detail");
            CDADE_context.initialLoad();
        }
    },
    getEventBus: function() {
        return sap.ui.getCore().getEventBus();
    },
    getRouter: function() {
        return sap.ui.core.UIComponent.getRouterFor(this);
    },
    initialLoad: function(evt) {
        //F4 model of Status and Card Group start

        oBusyDialog.open();
        var query = {
            mode: "CARDGROUP",
            schoolId: comGlob.schoolData.schoolId,
            key: ""
        }
        $.ajax({
            url: dataSource + "/f4HelpDataGet",
            data: query,
            type: 'POST',
            async: false,
            success: function(oData, oResponse) {
                CDADE_context._cgModel = new sap.ui.model.json.JSONModel(oData);
                oBusyDialog.close();
            },
            error: function(oError) {
                var msg = oError.responseText.split("Message")[1];
            }
        });

        var queryStatus = {
            mode: "STATUS",
            schoolId: comGlob.schoolData.schoolId,
            key: ""
        }
        oBusyDialog.open();
        $.ajax({
            url: dataSource + "/f4HelpDataGet",
            data: queryStatus,
            type: 'POST',
            async: false,
            success: function(oData, oResponse) {
                CDADE_context._sModel = new sap.ui.model.json.JSONModel(oData);
                oBusyDialog.close();
            },
            error: function(oError) {
                var msg = oError.responseText.split("Message")[1];
            }
        });
        //F4 model of Status and Card Group Ends

        CDADE_context._addRow();
        CDADE_context._addRow();
        CDADE_context._addRow();
        CDADE_context._addRow();
        CDADE_context._addRow();
    },

    resetCardMasterDtl: function() {
        CDADE_context.getView().byId("cardDetail_tblId").destroyItems();
    },

    getRequestBody: function() {
        var tabData = [];
        var tabItems = CDADE_context.getView().byId("cardDetail_tblId").getItems();
        for (var i = 0; i < tabItems.length; i++) {
            var obj = {
                "cardRFId": tabItems[i].getCells()[0].getValue(),
                "description": tabItems[i].getCells()[1].getValue(),
                "cardGroupKey": tabItems[i].getCells()[2].getSelectedKey(),
                "statusKey": tabItems[i].getCells()[3].getSelectedKey()
            }

            tabData.push(obj);
        }
        var cardId = ""
        var actionBack = "ADD";
        var requestBody = {
            "Mode": actionBack,
            "msg": "",
            "msgType": "",
            "NavCardNumberSet": tabData,
            "schoolId": comGlob.schoolData.schoolId,
            "userId": comGlob.schoolData.userId
        };

        return requestBody;
    },
    onSave: function(evt) {

        if (CDADE_context.validateCardDtl()) {
            sap.m.MessageToast.show("Enter Mandatory Fields...");
        } else {
            sap.m.MessageBox.confirm("Are you sure want to save?", {
                icon: sap.m.MessageBox.Icon.QUESION,
                title: "Confirmation",
                action: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                styleClass: "sapUiSizeCompact",
                onClose: function(action) {
                    if (action === "OK")
                        CDADE_context.onSaveCardMasterDtl();
                }
            });
        }
    },

    validateCardDtl: function() {
        var flag = false;
        var tabItems = CDADE_context.getView().byId("cardDetail_tblId").getItems();
        for (var i = 0; i < tabItems.length; i++) {
            if (tabItems[i].getCells()[0].getValue() == "") {
                tabItems[i].getCells()[0].setValueState("Error");
                tabItems[i].getCells()[0].setValueStateText(" ");
                flag = true;
            }else
           	 	tabItems[i].getCells()[0].setValueState("None");

            if (tabItems[i].getCells()[1].getValue() == "") {
                tabItems[i].getCells()[1].setValueState("Error");
                tabItems[i].getCells()[1].setValueStateText(" ");
                flag = true;
            }else
           	 	tabItems[i].getCells()[1].setValueState("None");

            if (tabItems[i].getCells()[2].getSelectedKey() == "") {
                tabItems[i].getCells()[2].setValueState("Error");
                tabItems[i].getCells()[2].setValueStateText(" ");
                flag = true;
            }else
            	 tabItems[i].getCells()[2].setValueState("None");
            

            if (tabItems[i].getCells()[3].getSelectedKey() == "") {
                tabItems[i].getCells()[3].setValueState("Error");
                tabItems[i].getCells()[3].setValueStateText(" ");
                flag = true;
            }else
           	 	tabItems[i].getCells()[3].setValueState("None");

        }

        return flag;
    },

    onSaveCardMasterDtl: function() {
        oBusyDialog.open();
        var query = CDADE_context.getRequestBody();
        $.ajax({
            url: dataSource + "/cardNumberDataSet",
            data: query,
            type: 'POST',
            async: true,
            success: function(oData, oResponse) {
                oBusyDialog.close();
                if (oData.msgType === "S") {

                    CDADE_context._excelUpload = sap.ui.xmlfragment("com.itec.sams.fragment.bulkCardMaster", CDADE_context);
                    CDADE_context.getView().addDependent(CDADE_context._excelUpload);
                    var oTblModel = new sap.ui.model.json.JSONModel({
                        results: oData.NavCardNumberSet
                    });
                    var oTable = sap.ui.getCore().byId("tab_resStdExcel");
                    oTable.setModel(oTblModel);
                    var tblTemplate = new sap.m.ColumnListItem({
                        cells: [, new sap.ui.core.Icon({
                            src: "{path:'minInTime',formatter:'com.itec.sams.util.formatter.stateIcon'}",
                        }), new sap.m.Text({
                            text: "{cardNumber}",
                        }), new sap.m.Text({
                            text: "{cardRFId}",
                        }), new sap.m.Text({
                            text: "{cardGroupText}",
                        }), new sap.m.Text({
                            text: "{msg}",
                        })]
                    });
                    sap.ui.getCore().byId("prgInd_ExcelUploadStatus").setVisible(false);
                    sap.ui.getCore().byId("dlg_exlUplRslt").getEndButton().setEnabled(true);
                    oTable.bindAggregation("items", {
                        path: "/results",
                        template: tblTemplate
                    });
                    CDADE_context._excelUpload.open();
                } else {
                    sap.m.MessageBox.show(oData.msg, {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: "Error",
                        styleClass: "sapUiSizeCompact",
                        onClose: function(action) {
                            oBusyDialog.close();
                        }
                    });
                }
            },
            error: function(oError) {
                var msg = oError.responseText.split("Message")[1];
                oBusyDialog.close();
            }
        });
    },
    onNavBack: function(evt) {
        sap.m.MessageBox.confirm("Are you sure want to cancel?", {
            icon: sap.m.MessageBox.Icon.QUESION,
            title: "Confirmation",
            action: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
            styleClass: "sapUiSizeCompact",
            onClose: function(action) {
                if (action === "OK") {
                    CDADE_context.resetCardMasterDtl();
                    var bReplace = jQuery.device.is.phone ? false : true;
                    CDADE_context.getRouter().navTo("CardMaster", bReplace);
                }

            }
        });

    },

    valueStateNone: function(oEvent) {
        oEvent.getSource().setValueState("None");
    },

    valAlfaNum: function(oEvent) {
        var inputVal = oEvent.getSource().getValue();
        oEvent.getSource().setValueState("None");
        oEvent.getSource().attachBrowserEvent("keydown", function(oEvent) {
            if (oEvent.keyCode === 32) {
                oEvent.stopPropagation();
                oEvent.preventDefault();
            }
        });

        var isValid = false;
        var regex = /^[A-Za-z0-9]+$/;
        isValid = regex.test(inputVal);
        if (isValid == false) {
            inputVal = inputVal.replace(/[^a-zA-Z0-9]/g, "");
            oEvent.getSource().setValue(inputVal);
            return;
        } else {}
    },

    onRFIDdevice: function(oEvent) {
        nfc.addTagDiscoveredListener(function(oEvent) {
            console.log("RFID");
        });
    },

    _addRow: function() {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Input({
                liveChange: CDADE_context.valAlfaNum

            }), new sap.m.Input({

            }), new sap.m.Select({

            }), new sap.m.Select({

            })]
        });

        var selectTemplate = new sap.ui.core.Item({
            key: "{key}",
            text: "{value}",
            //			templateShareable : true
        });

        tblTemplate.getCells()[2].setModel(CDADE_context._cgModel);
        tblTemplate.getCells()[2].bindAggregation("items", {
            path: "/navHelpDialog",
            template: selectTemplate
        });

        tblTemplate.getCells()[3].setModel(CDADE_context._sModel);
        tblTemplate.getCells()[3].bindAggregation("items", {
            path: "/navHelpDialog",
            template: selectTemplate
        });

        CDADE_context.getView().byId("cardDetail_tblId").addItem(tblTemplate);
        CDADE_context.setTableHeight();
    },

    onDelete: function(oEvent) {
        oEvent.getSource().removeItem(oEvent.getParameter("listItem"));
    },

    onExcelRsltClose: function(oEvent) {
        CDADE_context._excelUpload.close();
        CDADE_context._excelUpload.destroy();
        CDADE_context._excelUpload = null;

        CDADE_context.resetCardMasterDtl();
        var bReplace = jQuery.device.is.phone ? false : true;
        CDADE_context.getRouter().navTo("CardMaster", bReplace);
        oBusyDialog.close();
    },

    setFragTableHeight: function() {
        var footerTop = sap.ui.getCore().byId("dlg_exlUplRslt").getEndButton().getDomRef().getBoundingClientRect().top;
        var tablePositionTop = sap.ui.getCore().byId("tab_HdrResStdExcel").getDomRef().getBoundingClientRect().bottom;
        var scrollHeight = footerTop - tablePositionTop - 8;
        var tableHeight = sap.ui.getCore().byId("tab_resStdExcel").getDomRef().getBoundingClientRect().height;
        sap.ui.getCore().byId("scrl_exlUplRslt").setHeight(String(scrollHeight + "px"));
        if (tableHeight > scrollHeight) {
            sap.ui.getCore().byId("col_exclScrl").setVisible(true);
        } else {
            sap.ui.getCore().byId("col_exclScrl").setVisible(false);
        }
    },

    setTableHeight: function() {
        var footerHeight = CDADE_context.getView().byId("ftr_crdPage").getDomRef().getBoundingClientRect().height;
        //		var dialogHeight = CDADE_context.getView().byId("dialog_route").getDomRef().getBoundingClientRect().height;
        var tablePositionTop = CDADE_context.getView().byId("scrl_crdTab").getDomRef().getBoundingClientRect().top;
        var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
        CDADE_context.getView().byId("scrl_crdTab").setHeight(String(scrollHeight + "px"));

        var tableHeight = CDADE_context.getView().byId("cardDetail_tblId").getDomRef().getBoundingClientRect().height;
        if (tableHeight > scrollHeight) {
            CDADE_context.getView().byId("colcrd_scroll").setVisible(true);
        } else {
            CDADE_context.getView().byId("colcrd_scroll").setVisible(false);
        }
    },

});