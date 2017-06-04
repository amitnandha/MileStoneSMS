jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.formatter");
jQuery.sap.require("com.itec.sams.util.xlsx");
jQuery.sap.require("com.itec.sams.util.base64");
jQuery.sap.require("com.itec.sams.util.jszip");
var actButtonRef, curStdData;
//SR_context._sheetData, ._uplResult
sap.ui.controller("com.itec.sams.controller.studentRegistration", {
    onInit: function() {
        SR_context = this;
        this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
        this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));
        this._oRouter = this.getRouter();
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
        if (sName !== "StudentReg") {
            return;
        } else {
            oPageTitle.setText("Student Enrollment");
            SR_context._uplResult = [];
            SR_context.initialLoad();
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
        $.ajax({
            url: dataSource + "/StudentDtlGet",
            data: query,
            type: 'POST',
            async: true,
            success: function(oData, oResponse) {
                var studentDtl = oData;
                SR_context.bindTable(studentDtl);
                oBusyDialog.close();
            },
            error: function(oError) {
                var msg = oError.responseText.split("Message")[1];
            }
        });
    },
    bindTable: function(mData) {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [
                new sap.m.Text({
                    text: "{grCode}",
                }), new sap.m.Text({
                    text: "{firstName} {lastName}",
                }), new sap.m.Text({
                    text: "{rollNumber}",
                }), new sap.m.Text({
                    text: "{genderText}",
                }), new sap.m.Text({
                    text: "{className}",
                }), new sap.m.Text({
                    text: "{divisionName}",
                }), new sap.m.Text({
                    text: "{path:'dateOfBirth',formatter:'com.itec.sams.util.formatter.date'}",
                }),
                new sap.m.Text({
                    text: "{mobileNumber}",
                }),
                //			new sap.m.HBox({
                //                alignContent : "Center",
                //                alignItems : "Center",
                //                justifyContent : "Center",
                //                items : [
                //                         new sap.m.Button({
                //                        	 icon:"sap-icon://edit-outside",
                //                        	 type:"Accept",
                //                        	 width:"35px"
                //                         }),
                //                         new sap.m.Text({
                //             				text:" ",
                //             			}),
                //             			new sap.m.Button({
                //                        	 icon:"sap-icon://display",
                //                        	 type:"Emphasized",
                //                        	 width:"35px",
                //                         }),
                //                         new sap.m.Text({
                //              				text:" ",
                //              			}),
                //                         new sap.m.Button({
                //                        	 icon:"sap-icon://delete",
                //                        	 type:"Reject",
                //                        	 width:"35px",
                //                         }),
                //                         ]
                //			})
                new sap.m.Button({
                    icon: "sap-icon://action",
                    type: "Default",
                    press: SR_context.onStrTabAction
                }),
            ]
        });

        var oTable = SR_context.getView().byId("studentReg_tblId");
        var oTblModel = new sap.ui.model.json.JSONModel(mData);
        oTable.setModel(oTblModel);
        oTable.bindAggregation("items", {
            path: "/navStudentDetail",
            template: tblTemplate
        });
    },
    handleOpen: function(oEvent) {
        var oButton = oEvent.getSource();

        // create action sheet only once
        if (!this._actionSheet) {
            this._actionSheet = sap.ui.xmlfragment(
                "com.itec.sams.fragment.useraction",
                this
            );
            this.getView().addDependent(this._actionSheet);
        }

        this._actionSheet.openBy(oButton);
    },
    onHomePage: function(evt) {
        var bReplace = jQuery.device.is.phone ? false : true;
        this.getRouter().navTo("HomePage", bReplace);
    },
    onAddNewStudent: function(evt) {
        var bReplace = jQuery.device.is.phone ? false : true;
        SR_context.getRouter().navTo("studentRegAdd", {
            action: "AD"
        }, bReplace);
    },

    onStrTabAction: function(oEvent) {
        if (!SR_context._actionSheet) {
            SR_context._actionSheet = sap.ui.xmlfragment("com.itec.sams.fragment.editDisDlt", SR_context);
            SR_context.getView().addDependent(SR_context._actionSheet);
        }
        SR_context._actionSheet.openBy(oEvent.getSource());
        actButtonRef = oEvent.getSource();
        //		curStdData = actButtonRef.getParent().getModel().getData().navStudentDetail[curIndex];
        curStdData = oEvent.getSource().getParent().getBindingContext().getObject();
    },

    onAsheetEdit: function(oEvent) {
        var bReplace = jQuery.device.is.phone ? false : true;
        SR_context.getRouter().navTo("studentRegAdd", {
            action: "ED"
        }, bReplace);
    },

    onAsheetDisplay: function(oEvent) {
        var bReplace = jQuery.device.is.phone ? false : true;
        SR_context.getRouter().navTo("studentRegAdd", {
            action: "DI"
        }, bReplace);
    },


    onNavBack: function(oEvent) {

    },

    onAsheetDelete: function(oEvent) {
        oBusyDialog.open();
        var requestBody = {
            "Mode": "DELETE",
            "msg": "",
            "msgType": "",
            "navStudentDetail": [actButtonRef.getParent().getBindingContext().getObject()],
            "schoolId": comGlob.schoolData.schoolId,
            "userId": comGlob.schoolData.userId
        }

        $.ajax({
            url: dataSource + "/StudentDtlSet",
            data: requestBody,
            type: 'POST',
            async: false,
            success: function(oData, oResponse) {
                oBusyDialog.close();
                if (oData.msgType === "S") {
                    actButtonRef.getParent().getParent().removeItem(actButtonRef.getParent());
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

    //Excel Upload START...
    onFileUploaderChange: function(oEvent) {
        var file = undefined;
        if (oEvent.getParameter("files")[0] != undefined) {
            file = oEvent.getParameter("files")[0];
            SR_context._import(file);
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
                SR_context._sheetData = result.StudentUploadData;
                //				SR_context._rebuildSheetData();
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

    onStdSearch: function(oEvent) {
        var oFilter = new sap.ui.model.Filter([
                new sap.ui.model.Filter("className",
                    sap.ui.model.FilterOperator.Contains, oEvent.getParameter("newValue")),
                new sap.ui.model.Filter("grCode",
                    sap.ui.model.FilterOperator.Contains, oEvent.getParameter("newValue")),
                new sap.ui.model.Filter("mobileNumber",
                    sap.ui.model.FilterOperator.Contains, oEvent.getParameter("newValue")),
                new sap.ui.model.Filter("divisionName",
                    sap.ui.model.FilterOperator.Contains, oEvent.getParameter("newValue"))
            ],
            false);
        SR_context.getView().byId("studentReg_tblId").getBinding("items").filter([oFilter]);
    },

    onUploadBtPress: function(oEvent) {
        SR_context._excelUpload = sap.ui.xmlfragment("com.itec.sams.fragment.excelUpload", SR_context);
        SR_context.getView().addDependent(SR_context._excelUpload);

        SR_context._excelUpload.open();
    },

    onExcelUpload: function(oEvent) {
        SR_context._excelUpload.close();
        SR_context._excelUpload.destroy();
        SR_context._excelUpload = null;

        //		oBusyDialog.open();
        SR_context._uplResult = [];
        SR_context._resActCnt = 0;
        SR_context._resTtlCnt = SR_context._sheetData.length;

        SR_context._excelUpload = sap.ui.xmlfragment("com.itec.sams.fragment.excelUpldResult", SR_context);
        SR_context.getView().addDependent(SR_context._excelUpload);
        var oTable = sap.ui.getCore().byId("tab_resStdExcel");
        var oTblModel = new sap.ui.model.json.JSONModel({
            results: SR_context._uplResult
        });
        oTable.setModel(oTblModel);
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                text: "{firstName} {lastName}",
            }), new sap.m.Text({
                text: "{className}",
            }), new sap.m.Text({
                text: "{divisionName}",
            }), new sap.m.Text({
                text: "{uploadMsg}",
            })]
        });
        oTable.bindAggregation("items", {
            path: "/results",
            template: tblTemplate
        });
        SR_context._excelUpload.open();
        SR_context._uplOneByOne(SR_context._sheetData[0]);
    },

    onExlUplRefresh: function() {
        //		if(SR_context._resActCnt != 200){
        if (SR_context._resActCnt != SR_context._resTtlCnt) {
            SR_context._uplOneByOne(SR_context._sheetData[SR_context._resActCnt]);
            SR_context.setFragTableHeight();
        } else {
            sap.ui.getCore().byId("dlg_exlUplRslt").getEndButton().setEnabled(true);
        }
    },

    _uplOneByOne: function(shRecord) {

        var query = {
            schoolId: comGlob.schoolData.schoolId,
            userId: comGlob.schoolData.userId,
            Mode: "ADD",
            navStudentDetail: [shRecord]
        }

        $.ajax({
            url: dataSource + "/UploadStudentExcelDataSet",
            data: query,
            type: 'POST',
            async: false,
            success: function(oData, oResponse) {
                if (oData.msgType === "S") {
                    SR_context._resActCnt = 1 + SR_context._resActCnt;
                    SR_context._uplResult.push(oData.navStudentDetail[0]);
                    sap.ui.getCore().byId("tab_resStdExcel").getModel().refresh(true);
                    var pValue = (SR_context._resActCnt / SR_context._resTtlCnt) * 100;
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

        if (SR_context._resActCnt == SR_context._resTtlCnt) {
            SR_context._sheetData = [];
        }
    },

    onExcelCancel: function(oEvent) {
        SR_context._excelUpload.close();
        SR_context._excelUpload.destroy();
        SR_context._excelUpload = null;
    },

    onExcelRsltClose: function(oEvent) {
        SR_context._excelUpload.close();
        SR_context._excelUpload.destroy();
        SR_context._excelUpload = null;
        SR_context.initialLoad();
    },

    _rebuildSheetData: function() {
        var data = SR_context._sheetData;
        for (var i = 0; i < data.length; i++) {
            if (data[i].classId != "") {
                data[i].classId = Number(data[i].classId);
            }

            if (data[i].divisionId != "") {
                data[i].divisionId = Number(data[i].divisionId);
            }

            if (data[i].stateKey != "") {
                data[i].stateKey = Number(data[i].stateKey);
            }

            if (data[i].cityKey != "") {
                data[i].cityKey = Number(data[i].cityKey);
            }

            if (data[i].pinCode != "") {
                data[i].pinCode = Number(data[i].pinCode);
            }
        }

        SR_context._sheetData = data;
    },

    setTableHeight: function() {
        var footerHeight = SR_context.getView().byId("ftr_stdrPage").getDomRef().getBoundingClientRect().height + 5;
        //		var dialogHeight = SR_context.getView().byId("dialog_route").getDomRef().getBoundingClientRect().height;
        var tablePositionTop = SR_context.getView().byId("scrl_stdTab").getDomRef().getBoundingClientRect().top;
        var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
        SR_context.getView().byId("scrl_stdTab").setHeight(String(scrollHeight + "px"));

        var tableHeight = SR_context.getView().byId("studentReg_tblId").getDomRef().getBoundingClientRect().height;
        if (tableHeight > scrollHeight) {
            SR_context.getView().byId("colstd_scroll").setVisible(true);
        } else {
            SR_context.getView().byId("colstd_scroll").setVisible(false);
        }
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

});