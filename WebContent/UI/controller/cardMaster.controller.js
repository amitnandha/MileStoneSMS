jQuery.sap.require("com.itec.sams.util.formatter");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
var curCrdDetl;
// CM_context._sModel, CM_context._cgModel, CM_context._sheetData, CM_context._uplResult
sap.ui.controller("com.itec.sams.controller.cardMaster", {
    onInit: function() {
        CM_context = this;
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
        if (sName !== "CardMaster") {
            return;
        } else {
            oPageTitle.setText("Card Master");
            CM_context.initialLoad();
        }

    },
    getEventBus: function() {
        return sap.ui.getCore().getEventBus();
    },
    getRouter: function() {
        return sap.ui.core.UIComponent.getRouterFor(this);
    },
    initialLoad: function() {
        oBusyDialog.open();
        var query = {
            "schoolId": comGlob.schoolData.schoolId
        };
        var cardMasterDtl = {};
        $.ajax({
            url: dataSource + "/cardNumberDataGet",
            data: query,
            type: 'POST',
            async: true,
            success: function(oData, oResponse) {
                cardMasterDtl = oData;
                CM_context.bindTable(cardMasterDtl);
                oBusyDialog.close();
            },
            error: function(oError) {
                var msg = oError.responseText.split("Message")[1];
            }
        });

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
            async: true,
            success: function(oData, oResponse) {
                CM_context._cgModel = new sap.ui.model.json.JSONModel(oData);
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
            async: true,
            success: function(oData, oResponse) {
                CM_context._sModel = new sap.ui.model.json.JSONModel(oData);
                oBusyDialog.close();
            },
            error: function(oError) {
                var msg = oError.responseText.split("Message")[1];
            }
        });
        //F4 model of Status and Card Group Ends
    },
    bindTable: function(mData) {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                text: "{cardNumber}",
            }), new sap.m.Text({
                text: "{cardRFId}",
            }), new sap.m.Text({
                text: "{description}",
            }), new sap.m.Text({
                text: {
                    path: "assignedStatus",
                    formatter: function(value) {
                        if (value === false || value === "False")
                            return "Not Assigned";
                        else
                            return "Assigned";
                    }
                },
            }), new sap.m.Text({
                text: "{cardGroupText}",
            }), new sap.m.Text({
                text: "{statusText}",
            }), new sap.m.Button({
                icon: "sap-icon://edit",
                press: CM_context.onEdit,
                type: "Default",
            })]
        });

        var oTable = this.getView().byId("cardMaster_tblId");
        var oTblModel = new sap.ui.model.json.JSONModel(mData);
        oTable.setModel(oTblModel);
        oTable.bindAggregation("items", {
            path: "/NavCardNumberSet",
            template: tblTemplate
        });
    },

    onDisplay: function(oEvent) {
        curCrdDetl = oEvent.getSource().getParent().getBindingContext().getObject();
        CM_context._crdDetails = sap.ui.xmlfragment("com.itec.sams.fragment.cardDet", CM_context);
        CM_context.getView().addDependent(CM_context._crdDetails);
        CM_context._crdDetails.open();
        sap.ui.getCore().byId("lb_crdNo").setRequired(false);
        sap.ui.getCore().byId("cardNo_txtId").setEnabled(false);

        sap.ui.getCore().byId("lb_rfid").setRequired(false);
        sap.ui.getCore().byId("rfId_txtId").setEnabled(false);

        sap.ui.getCore().byId("desc_txtId").setEnabled(false);

        sap.ui.getCore().byId("lb_crdGrp").setRequired(false);
        sap.ui.getCore().byId("cardGroup_cBoxId").setEnabled(false);

        sap.ui.getCore().byId("lb_crdStatus").setRequired(false);
        sap.ui.getCore().byId("status_cBoxId").setEnabled(false);

        CM_context._crdDetails.getBeginButton().setVisible(false);
        CM_context._crdDetails.getEndButton().setText("Close");

        CM_context._formBinding();
    },

    onEdit: function(oEvent) {
        curCrdDetl = oEvent.getSource().getParent().getBindingContext().getObject();
        if(!CM_context._crdDetails){
        	  CM_context._crdDetails = sap.ui.xmlfragment("com.itec.sams.fragment.cardDet", CM_context);
              CM_context.getView().addDependent(CM_context._crdDetails);
        }
        CM_context._crdDetails.open();
        CM_context._formBinding();
    },

    onRegisterNewCard: function(evt) {
        var bReplace = jQuery.device.is.phone ? false : true;
        CM_context.getRouter().navTo("CardDetail", bReplace);
    },

    onDelete: function(oEvent) {
        oBusyDialog.open();
        var requestBody = {
            "Mode": "DELETE",
            "msg": "",
            "msgType": "",
            "NavCardNumberSet": [oEvent.getParameter("listItem").getBindingContext().getObject()],
            "schoolId": comGlob.schoolData.schoolId,
            "userId": comGlob.schoolData.userId
        };

        $.ajax({
            url: dataSource + "/cardNumberDataSet",
            data: requestBody,
            type: 'POST',
            async: false,
            success: function(oData, oResponse) {
                oBusyDialog.close();
                if (oData.msgType === "S") {
                    oEvent.getSource().removeItem(oEvent.getParameter("listItem"));
                    sap.m.MessageBox.show(oData.msg, {
                        icon: sap.m.MessageBox.Icon.SUCCESS,
                        title: "Success",
                        styleClass: "sapUiSizeCompact",
                        onClose: function(action) {

                        }
                    });
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

    setTableHeight: function() {
        var footerHeight = CM_context.getView().byId("ftr_cmPage").getDomRef().getBoundingClientRect().height + 5;
        //		var dialogHeight = CM_context.getView().byId("dialog_route").getDomRef().getBoundingClientRect().height;
        var tablePositionTop = CM_context.getView().byId("scrl_cmTab").getDomRef().getBoundingClientRect().top;
        var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
        CM_context.getView().byId("scrl_cmTab").setHeight(String(scrollHeight + "px"));

        var tableHeight = CM_context.getView().byId("cardMaster_tblId").getDomRef().getBoundingClientRect().height;
        if (tableHeight > scrollHeight) {
            CM_context.getView().byId("colcm_scroll").setVisible(true);
        } else {
            CM_context.getView().byId("colcm_scroll").setVisible(false);
        }
    },

    onCardSearch: function(oEvent) {
        var oFilter = new sap.ui.model.Filter([
                new sap.ui.model.Filter("cardNumber",
                    sap.ui.model.FilterOperator.Contains, oEvent.getParameter("newValue")),
            ],
            false);
        CM_context.getView().byId("cardMaster_tblId").getBinding("items").filter([oFilter]);
    },

    onCmSave: function(oEvent) {

        if (CM_context.mandtCheck()) {
            sap.m.MessageToast.show("Enter Mandatory Fields...");
            return;
        }

        CM_context.onSaveCardMasterDtl();

        CM_context._crdDetails.close();
        CM_context._crdDetails.destroy();
        CM_context._crdDetails = null;
    },

    onCmCancel: function(oEvent) {
        CM_context._crdDetails.close();
        CM_context._crdDetails.destroy();
        CM_context._crdDetails = null;
    },

    _formBinding: function() {
        var selectTemplate = new sap.ui.core.Item({
            key: "{key}",
            text: "{value}",
        });
        sap.ui.getCore().byId("cardGroup_cBoxId").setModel(CM_context._cgModel);
        sap.ui.getCore().byId("cardGroup_cBoxId").bindAggregation("items", {
            path: "/navHelpDialog",
            template: selectTemplate
        });

        sap.ui.getCore().byId("status_cBoxId").setModel(CM_context._sModel);
        sap.ui.getCore().byId("status_cBoxId").bindAggregation("items", {
            path: "/navHelpDialog",
            template: selectTemplate
        });

        sap.ui.getCore().byId("cardNo_txtId").setValue(curCrdDetl.cardNumber);
        sap.ui.getCore().byId("rfId_txtId").setValue(curCrdDetl.cardRFId);
        sap.ui.getCore().byId("desc_txtId").setValue(curCrdDetl.description);
        sap.ui.getCore().byId("cardGroup_cBoxId").setSelectedKey(curCrdDetl.cardGroupKey);
        sap.ui.getCore().byId("status_cBoxId").setSelectedKey(curCrdDetl.statusKey);
    },

    mandtCheck: function() {
        var flag = false;
        //		if(sap.ui.getCore().byId("lb_crdNo").getRequired()){
        //			if(sap.ui.getCore().byId("cardNo_txtId").getValue() == ""){
        //				sap.ui.getCore().byId("cardNo_txtId").setValueState("Error");
        //				flag = true;
        //			}
        //		}

        if (sap.ui.getCore().byId("lb_rfid").getRequired()) {
            if (sap.ui.getCore().byId("rfId_txtId").getValue() == "") {
                sap.ui.getCore().byId("rfId_txtId").setValueState("Error");
                flag = true;
            }
        }

        if (sap.ui.getCore().byId("lb_crdGrp").getRequired()) {
            if (sap.ui.getCore().byId("cardGroup_cBoxId").getSelectedKey() == "") {
                sap.ui.getCore().byId("cardGroup_cBoxId").setValueState("Error");
                flag = true;
            }
        }

        if (sap.ui.getCore().byId("lb_crdStatus").getRequired()) {
            if (sap.ui.getCore().byId("status_cBoxId").getSelectedKey() == "") {
                sap.ui.getCore().byId("status_cBoxId").setValueState("Error");
                flag = true;
            }
        }

        return flag;
    },

    onSaveCardMasterDtl: function() {
        oBusyDialog.open();
        var query = CM_context.getRequestBody();
        $.ajax({
            url: dataSource + "/cardNumberDataSet",
            data: query,
            type: 'POST',
            async: false,
            success: function(oData, oResponse) {
                if (oData.msgType === "S") {
                    sap.m.MessageBox.show(oData.msg, {
                        icon: sap.m.MessageBox.Icon.SUCCESS,
                        title: "Success",
                        styleClass: "sapUiSizeCompact",
                        onClose: function(action) {
                            CM_context.initialLoad();
                        }
                    });
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

    getRequestBody: function() {
        var actionBack = "EDIT";
        var requestBody = {
            "Mode": actionBack,
            "msg": "",
            "msgType": "",
            "NavCardNumberSet": [{
                "cardID": curCrdDetl.cardID,
                "cardNumber": sap.ui.getCore().byId("cardNo_txtId").getValue(),
                "cardRFId": sap.ui.getCore().byId("rfId_txtId").getValue(),
                "description": sap.ui.getCore().byId("desc_txtId").getValue(),
                "cardGroupKey": sap.ui.getCore().byId("cardGroup_cBoxId").getSelectedKey(),
                "statusKey": sap.ui.getCore().byId("status_cBoxId").getSelectedKey()
            }],
            "schoolId": comGlob.schoolData.schoolId,
            "userId": comGlob.schoolData.userId
        };

        return requestBody;
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

    valueStateNone: function(oEvent) {
        oEvent.getSource().setValueState("None");
    },

    onExcelCard: function(oEvent) {
        CM_context._excelUpload = sap.ui.xmlfragment("com.itec.sams.fragment.excelUpload", CM_context);
        CM_context.getView().addDependent(CM_context._excelUpload);

        CM_context._excelUpload.open();
    },

    onExcelUpload: function(oEvent) {

        CM_context._excelUpload.close();
        CM_context._excelUpload.destroy();
        CM_context._excelUpload = null;

        //		oBusyDialog.open();
        CM_context._uplResult = [];
        CM_context._resActCnt = 0;
        CM_context._resTtlCnt = CM_context._sheetData.length;

        CM_context._excelUpload = sap.ui.xmlfragment("com.itec.sams.fragment.bulkCardMaster", CM_context);
        CM_context.getView().addDependent(CM_context._excelUpload);
        var oTable = sap.ui.getCore().byId("tab_resStdExcel");
        var oTblModel = new sap.ui.model.json.JSONModel({
            results: CM_context._uplResult
        });
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
        oTable.bindAggregation("items", {
            path: "/results",
            template: tblTemplate
        });
        CM_context._excelUpload.open();
        CM_context._uplOneByOne(CM_context._sheetData[0]);

    },

    onExcelCancel: function(oEvent) {
        CM_context._excelUpload.close();
        CM_context._excelUpload.destroy();
        CM_context._excelUpload = null;
    },

    _uplOneByOne: function(shRecord) {
        var query = {
            schoolId: comGlob.schoolData.schoolId,
            userId: comGlob.schoolData.userId,
            Mode: "EXCEL",
            NavCardNumberSet: [shRecord]
        }

        $.ajax({
            url: dataSource + "/cardNumberDataSet",
            data: query,
            type: 'POST',
            async: false,
            success: function(oData, oResponse) {
                if (oData.msgType === "S") {
                    CM_context._resActCnt = 1 + CM_context._resActCnt;
                    CM_context._uplResult.push(oData.NavCardNumberSet[0]);
                    sap.ui.getCore().byId("tab_resStdExcel").getModel().refresh(true);
                    var pValue = (CM_context._resActCnt / CM_context._resTtlCnt) * 100;
                    sap.ui.getCore().byId("prgInd_ExcelUploadStatus").setPercentValue(pValue);
                    sap.ui.getCore().byId("prgInd_ExcelUploadStatus").setDisplayValue(pValue.toFixed(1) + "%");
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

        if (CM_context._resActCnt == CM_context._resTtlCnt) {
            CM_context._sheetData = [];
        }
    },

    //Excel Upload START...
    onFileUploaderChange: function(oEvent) {
        var file = undefined;
        if (oEvent.getParameter("files")[0] != undefined) {
            file = oEvent.getParameter("files")[0];
            CM_context._import(file);
        } else {

        }

    },

    _import: function(file) {
        if (file && window.FileReader) {
            var reader = new FileReader();
            that = this;
            //result = {};
            //var data;
            reader.onload = function(evt) {
                var data = evt.target.result;
                //var xlsx = XLSX.read(data, {type: 'binary'});
                var CHUNK_SIZE = 0x8000; // arbitrary number here, not too small, not too big
                var index = 0;
                var array = new Uint8Array(data);
                var length = array.length;
                var arr = '';
                var slice;
                while (index < length) {
                    slice = array.slice(index, Math.min(index + CHUNK_SIZE, length)); // `Math.min` is not really necessary here I think
                    arr += String.fromCharCode.apply(null, slice);
                    index += CHUNK_SIZE;
                }
                //var arr = String.fromCharCode.apply(null,new Uint8Array(data));
                var xlsx = XLSX.read(btoa(arr), {
                    type: 'base64'
                });
                result = xlsx.Strings;
                result = {};
                xlsx.SheetNames.forEach(function(sheetName) {
                    var rObjArr = XLSX.utils
                        .sheet_to_row_object_array(xlsx.Sheets[sheetName]);
                    if (rObjArr.length > 0) {
                        result[sheetName] = rObjArr;
                    }
                });
                CM_context._sheetData = result.CardMasterSheet;
                //				CM_context._rebuildSheetData();
                return result;
                that.b64toBlob(xlsx, "binary");
            };
            reader.readAsArrayBuffer(file);

        };
    },

    b64toBlob: function(b64Data, contentType) {

        contentType = contentType || '';
        var sliceSize = 512;
        b64Data = b64Data.replace(/^[^,]+,/, '');
        b64Data = b64Data.replace(/\s/g, '');
        var byteCharacters = Base64.decode(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        var blob = new Blob(byteArrays, {
            type: contentType
        });
    },

    //Excel Upload END...

    onExlUplRefresh: function() {
        //		if(CM_context._resActCnt != 200){
        if (CM_context._resActCnt != CM_context._resTtlCnt) {
            CM_context._uplOneByOne(CM_context._sheetData[CM_context._resActCnt]);
            CM_context.setFragTableHeight();
        } else {
            sap.ui.getCore().byId("dlg_exlUplRslt").getEndButton().setEnabled(true);
        }
    },

    onExcelRsltClose: function(oEvent) {
        CM_context._excelUpload.close();
        CM_context._excelUpload.destroy();
        CM_context._excelUpload = null;
        CM_context.initialLoad();
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
    onExporttoExcel:function(evt){
    	var baseUrl = com.itec.sams.util.GetPostApiCall.getBaseUrl("API");
    	var sUri = baseUrl + "notAssignedCardGet?schoolId=" + sessionStorage.getItem('schoolId');
    	if(sUri !== ""){
    		sap.m.URLHelper.redirect(sUri, "true");
    	}
    }
});