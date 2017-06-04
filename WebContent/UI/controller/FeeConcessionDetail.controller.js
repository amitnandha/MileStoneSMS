jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
jQuery.sap.require("com.itec.sams.util.formatter");
sap.ui.core.mvc.Controller.extend("com.itec.sams.controller.FeeConcessionDetail", {
    onInit: function() {
        feeConDtl_context = this;
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
        if (sName !== "FeeConcessionDtl") {
            return;
        } else {
            oPageTitle.setText("Fee Concession Detail");
            var contextModel = sap.ui.getCore().getModel("contextModel");
            if (contextModel != undefined) {
                oBusyDialog.open();
                jQuery.sap.delayedCall(1, this, function() {
                    feeConDtl_context.initialLoad();
                });
            } else {
                var bReplace = jQuery.device.is.phone ? false : true;
                feeConDtl_context.getRouter().navTo("FeeConcession", bReplace);
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
                    	feeConDtl_context.StudentConcessionDtlModel = undefined;
                        sap.ui.getCore().setModel(null, "contextModel");
                        var bReplace = jQuery.device.is.phone ? false : true;
                        feeConDtl_context.getRouter().navTo("FeeConcession", bReplace);
                    }
                }
            });
        } else {
        	feeConDtl_context.StudentConcessionDtlModel = undefined;
            sap.ui.getCore().setModel(null, "contextModel");
            var bReplace = jQuery.device.is.phone ? false : true;
            feeConDtl_context.getRouter().navTo("FeeConcession", bReplace);
        }
    },
    initialLoad: function() {
        var contextModelData = sap.ui.getCore().getModel("contextModel").getData();
        feeConDtl_context.oStudentConcessionDtlReponse = {};
        feeConDtl_context.oStudentConcessionDtlReponse.results = [];
        var query = {
            mode: "FEE_DESIGN",
            schoolId: sessionStorage.getItem('schoolId'),
            key: ""
        };
        var oFeeDesignDataResponse = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", query);
        feeConDtl_context.getView().setModel(new sap.ui.model.json.JSONModel(oFeeDesignDataResponse), "feeDesignDdlModel");
        if (contextModelData.mode === "EDIT" || contextModelData.mode === "DISPLAY") {
            var sUri = "FeeConcessionDetailGet?schoolId=" + sessionStorage.getItem('schoolId') + "&studentId=" + contextModelData.tableData.studentId;
            var oResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
            if (oResponse != null) {
                feeConDtl_context.oStudentConcessionDtlReponse.results = oResponse.results;
                jQuery.sap.delayedCall(1, this, function() {
                    feeConDtl_context.getStudentConcessionDtlTableModel("INITIAL");
                });
                jQuery.sap.delayedCall(1, this, function() {
                    feeConDtl_context.bindStudentConcessionDtlTable();
                });
                feeConDtl_context.getView().byId("studentConcessionDtl_pnlId").setVisible(true);
            }

            var studentData = {
                results: [{
                    studentId: contextModelData.tableData.studentId,
                    firstName: contextModelData.tableData.studentName,
                    lastName: "",
                    grNo: contextModelData.tableData.grNo,
                    rollNumber: contextModelData.tableData.rollNumber,
                    className: contextModelData.tableData.className,
                    divisionName: contextModelData.tableData.divisionName,
                }]
            };

            feeConDtl_context.bindStudentDetail(studentData);

            if (contextModelData.mode === "DISPLAY") {
                feeConDtl_context.getView().byId("submit_CON_btnId").setVisible(false);
                feeConDtl_context.getView().byId("studentFind_btnId").setVisible(false);
                feeConDtl_context.getView().byId("feeConcessionTblAddRow_btnId").setVisible(false);
            } else {
                feeConDtl_context.getView().byId("submit_CON_btnId").setVisible(true);
                feeConDtl_context.getView().byId("studentFind_btnId").setVisible(false);
                feeConDtl_context.getView().byId("feeConcessionTblAddRow_btnId").setVisible(true);
            }
        } else {
            feeConDtl_context.getView().byId("submit_CON_btnId").setVisible(true);
            feeConDtl_context.getView().byId("studentFind_btnId").setVisible(true);
            feeConDtl_context.getView().byId("feeConcessionTblAddRow_btnId").setVisible(true);
            feeConDtl_context.getView().byId("studentConcessionDtl_pnlId").setVisible(false);
            feeConDtl_context.getView().byId("studentDtl_tblId").unbindAggregation("items");
        }
        oBusyDialog.close();
    },
    onFindStudentButtonPress: function(evt) {
        if (!feeConDtl_context._studentSearchFrgDialog) {
            feeConDtl_context._studentSearchFrgDialog = sap.ui.xmlfragment("com.itec.sams.fragment.studentSearch", feeConDtl_context);
            feeConDtl_context.getView().addDependent(feeConDtl_context._studentSearchFrgDialog);
        }
        feeConDtl_context._studentSearchFrgDialog.open();
    },
    onStudentSearchFrgBeforeOpen: function(evt) {
        sap.ui.getCore().byId("frg_firstName_txtId").setValue("");
        sap.ui.getCore().byId("frg_lastName_txtId").setValue("");
        sap.ui.getCore().byId("frg_rollNumber_txtId").setValue("");
        sap.ui.getCore().byId("frg_class_txtId").removeAllCustomData();
        sap.ui.getCore().byId("frg_class_txtId").setValue("");
        sap.ui.getCore().byId("frg_division_txtId").removeAllCustomData();
        sap.ui.getCore().byId("frg_division_txtId").setValue("");
        sap.ui.getCore().byId("frg_studentDtl_tblId").unbindAggregation("items");
    },
    onStudentSearchFrgChange: function(evt) {
        oBusyDialog.open();
        jQuery.sap.delayedCall(1, this, function() {
            feeConDtl_context.onSearchStudentDtl();
        });
    },
    handleStudentSearchFrgClassValueHelp: function(evt) {
        var query = {
            mode: "CLASS_FEE_CONCESSION",
            schoolId: sessionStorage.getItem('schoolId'),
            key: ""
        };
        var f4DialogResponse = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", query);
        if (f4DialogResponse != "") {
            var f4Model = new sap.ui.model.json.JSONModel(f4DialogResponse);
            var handleClose = function(oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    sap.ui.getCore().byId("frg_class_txtId").removeAllCustomData();
                    sap.ui.getCore().byId("frg_class_txtId").setValue(oSelectedItem.getTitle());
                    sap.ui.getCore().byId("frg_class_txtId").addCustomData(
                        new sap.ui.core.CustomData({
                            key: "classId",
                            value: oSelectedItem.data().key
                        })
                    )
                    feeConDtl_context.onStudentSearchFrgChange();
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
            jQuery.sap.delayedCall(350, feeConDtl_context, function() {
                _valueHelpSelectDialog._oSearchField.focus();
            });
        }
    },
    handleStudentSearchFrgDivisionValueHelp: function(evt) {
        var oClassTxt = sap.ui.getCore().byId("frg_class_txtId");
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
                        sap.ui.getCore().byId("frg_division_txtId").removeAllCustomData();
                        sap.ui.getCore().byId("frg_division_txtId").setValue(oSelectedItem.getTitle());
                        sap.ui.getCore().byId("frg_division_txtId").addCustomData(
                            new sap.ui.core.CustomData({
                                key: "divisionId",
                                value: oSelectedItem.data().key
                            })
                        )
                        feeConDtl_context.onStudentSearchFrgChange();
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
                jQuery.sap.delayedCall(350, feeConDtl_context, function() {
                    _valueHelpSelectDialog._oSearchField.focus();
                });
            }
        } else {
            sap.m.MessageBox.show("Please select class.", sap.m.MessageBox.Icon.WARNING, "WARNING");
        }
    },
    onSearchStudentDtl: function() {
        var sFName = sap.ui.getCore().byId("frg_firstName_txtId").getValue();
        var sLName = sap.ui.getCore().byId("frg_lastName_txtId").getValue();
        var sRollNo = sap.ui.getCore().byId("frg_rollNumber_txtId").getValue();
        var sClassId = sap.ui.getCore().byId("frg_class_txtId").getValue() != "" ? sap.ui.getCore().byId("frg_class_txtId").data().classId : "";
        var sDivisionId = sap.ui.getCore().byId("frg_division_txtId").getValue() != "" ? sap.ui.getCore().byId("frg_division_txtId").data().divisionId : "";
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
            var sUri = "StudentSearchDtlGet?schoolId=" + sessionStorage.getItem('schoolId') + "&mode=CONCESSION" + sQuery;
            var oResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
            if (oResponse != null) {
                feeConDtl_context.bindSuggestionTable(oResponse);
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
                })
            ]
        });
        var oTable = sap.ui.getCore().byId("frg_studentDtl_tblId");
        oTable.unbindAggregation("items");
        oTable.setModel(new sap.ui.model.json.JSONModel(oData));
        oTable.bindAggregation("items", {
            path: "/results",
            template: tblTemplate,
            //templateShareable: true
        });
    },
    onStudentSearchFrgSelectPress: function(evt) {
        var oItems = sap.ui.getCore().byId("frg_studentDtl_tblId").getSelectedItems();
        if (oItems.length > 0) {
            var oModelData = {
                results: []
            };
            for (var i = 0; i < oItems.length; i++) {
                var obj = oItems[i].getBindingContext().getObject();
                oModelData.results.push(obj);
            }
        }
        feeConDtl_context.bindStudentDetail(oModelData);
        feeConDtl_context.getView().byId("studentConcessionDtl_pnlId").setVisible(true);
        feeConDtl_context.getStudentConcessionDtlTableModel("INITIAL");
        jQuery.sap.delayedCall(1, this, function() {
            feeConDtl_context.bindStudentConcessionDtlTable();
        });
        feeConDtl_context._studentSearchFrgDialog.close();
    },
    bindStudentDetail: function(oData) {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                    text: "{firstName}  {lastName}",
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
                new sap.ui.core.Icon({
                    src: "sap-icon://sys-minus",
                    color: "#ff0000",
                    size: "1rem",
                    alt: "Delete",
                    visible: sap.ui.getCore().getModel("contextModel").getData().mode === "DISPLAY" || sap.ui.getCore().getModel("contextModel").getData().mode === "EDIT" ? false : true,
                    press: feeConDtl_context.onPressStudentDtlDeleteRow
                })
            ]
        });
        var oTable = feeConDtl_context.getView().byId("studentDtl_tblId");
        oTable.unbindAggregation("items");
        oTable.setModel(new sap.ui.model.json.JSONModel(oData));
        oTable.bindAggregation("items", {
            path: "/results",
            template: tblTemplate,
            //templateShareable: true
        });
    },
    onPressStudentDtlDeleteRow: function(evt) {
        var oItem = evt.getSource().getParent();
        var oTable = feeConDtl_context.getView().byId("studentDtl_tblId");
        oTable.removeItem(oItem);
        oTable.getModel().refresh();
    },
    onStudentSearchFragmentResetPress: function(evt) {
        sap.ui.getCore().byId("frg_firstName_txtId").setValue("");
        sap.ui.getCore().byId("frg_lastName_txtId").setValue("");
        sap.ui.getCore().byId("frg_rollNumber_txtId").setValue("");
        sap.ui.getCore().byId("frg_class_txtId").removeAllCustomData();
        sap.ui.getCore().byId("frg_class_txtId").setValue("");
        sap.ui.getCore().byId("frg_division_txtId").removeAllCustomData();
        sap.ui.getCore().byId("frg_division_txtId").setValue("");
        sap.ui.getCore().byId("frg_studentDtl_tblId").unbindAggregation("items");
    },
    onStudentSearcgFrgCancelBtnPress: function(evt) {
        feeConDtl_context._studentSearchFrgDialog.close();
    },
    getStudentConcessionDtlTableModel: function(mode) {
        var jData = {
            Mode: "",
            results: []
        };

        if (!feeConDtl_context.StudentConcessionDtlModel) {
            var mData = feeConDtl_context.oStudentConcessionDtlReponse.results;
            if (mData.length === 0 || mData === null) {
                jData.results.push({
                    srno: 1,
                    feeConcessionId: "0",
                    studentId: feeConDtl_context.studentId,
                    designId: "0",
                    designName: "",
                    concessionAmount: ""
                });
            } else {
                for (var i = 0; i < mData.length; i++) {
                    jData.results.push({
                        srno: i + 1,
                        feeConcessionId: mData[i].feeConcessionId,
                        studentId: mData[i].studentId,
                        designId: mData[i].designId,
                        designName: mData[i].designName,
                        concessionAmount: mData[i].concessionAmount
                    });
                }
            }

            feeConDtl_context.StudentConcessionDtlModel = new sap.ui.model.json.JSONModel(jData);
        } else {
            var tblItems = feeConDtl_context.getView().byId("studentConcessionDtl_tblId").getItems();
            for (var x = 0; x < tblItems.length; x++) {
                var tblElements = tblItems[x].findElements();
                var obj = tblItems[x].getBindingContext().getObject();
                jData.results.push({
                    srno: x + 1,
                    feeConcessionId: obj.feeConcessionId,
                    studentId: "",
                    designId: tblElements[1].getSelectedKey(),
                    designName: tblElements[1].getSelectedItem().getText(),
                    concessionAmount: tblElements[2].getValue()
                });
            }
            if (mode === "ADD") {
                jData.results.push({
                    srno: tblItems.length + 1,
                    feeConcessionId: "0",
                    studentId: "",
                    designId: "0",
                    designName: "",
                    concessionAmount: ""
                });
            }
            feeConDtl_context.StudentConcessionDtlModel = new sap.ui.model.json.JSONModel(jData);
        }
    },
    bindStudentConcessionDtlTable: function() {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                    text: "{srno}",
                }),
                new sap.m.Select({
                    width: "16rem",
                    selectedKey: "{designId}",
                    enabled: sap.ui.getCore().getModel("contextModel").getData().mode === "DISPLAY" ? false : true,
                    items: {
                        path: 'feeDesignDdlModel>/navHelpDialog',
                        template: new sap.ui.core.Item({
                            key: "{feeDesignDdlModel>key}",
                            text: "{feeDesignDdlModel>value}"
                        }),
                        templateShareable: true
                    },
                    change: feeConDtl_context.onFeeLabelChange
                }),
                new sap.m.Input({
                    width: "16rem",
                    value: "{concessionAmount}",
                    placeholder: "Enter Concession Amount...",
                    maxLength: 9,
                    enabled: sap.ui.getCore().getModel("contextModel").getData().mode === "DISPLAY" ? false : true,
                    liveChange: feeConDtl_context.onConcessionAmountLiveChange
                }),
                new sap.ui.core.Icon({
                    src: "sap-icon://sys-minus",
                    color: "#ff0000",
                    size: "1rem",
                    alt: "Delete",
                    visible: sap.ui.getCore().getModel("contextModel").getData().mode === "DISPLAY" ? false : true,
                    press: feeConDtl_context.onPressDeleteRow
                })
            ]
        });

        var oTable = feeConDtl_context.getView().byId("studentConcessionDtl_tblId");
        oTable.setModel(feeConDtl_context.StudentConcessionDtlModel);
        oTable.bindAggregation("items", {
            path: "/results",
            template: tblTemplate,
            //templateShareable: true
        });
    },
    onStudentConcessionDtlAddRowPress: function(evt) {
        feeConDtl_context.getStudentConcessionDtlTableModel("ADD");
        jQuery.sap.delayedCall(1, this, function() {
            feeConDtl_context.bindStudentConcessionDtlTable();
        });
    },
    onFeeLabelChange: function(evt) {
        var sKey = evt.getSource().getSelectedKey();
        var sIndex = evt.getSource().getParent().getBindingContext().getPath().split('/')[2];
        var sMsg = "";
        var tblItems = feeConDtl_context.getView().byId("studentConcessionDtl_tblId").getItems();
        for (var x = 0; x < tblItems.length; x++) {
            if (x != sIndex) {
                var tblElements = tblItems[x].findElements();
                var sFeeLabelKey = tblElements[1].getSelectedKey();
                if (sFeeLabelKey === sKey && sKey != "0") {
                    sMsg = "You can select only one Fee Label.";
                    break;
                }
            }
        }
        if (sMsg != "") {
            evt.getSource().setSelectedKey("0");
            sap.m.MessageBox.show(sMsg, sap.m.MessageBox.Icon.WARNING, "WARNING");
        }
    },
    onConcessionAmountLiveChange: function(evt) {
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
    onPressDeleteRow: function(evt) {
        var oItem = evt.getSource().getParent();
        var oTable = feeConDtl_context.getView().byId("studentConcessionDtl_tblId");
        oTable.removeItem(oItem);
        oTable.removeAllAggregation();
        feeConDtl_context.getStudentConcessionDtlTableModel("REMOVE");
        jQuery.sap.delayedCall(1, this, function() {
            feeConDtl_context.bindStudentConcessionDtlTable();
        });
    },
    validateStudentFeeConcession: function() {
        var msg = "";
        var studentTblItems = feeConDtl_context.getView().byId("studentDtl_tblId").getItems();
        if (studentTblItems.length > 0) {
        	var conTblItems = feeConDtl_context.getView().byId("studentConcessionDtl_tblId").getItems();
            if (conTblItems.length > 0) {
                for (var x = 0; x < conTblItems.length; x++) {
                    var valMsg = "";
                    var tblElements = conTblItems[x].findElements();
                    if (tblElements[1].getSelectedKey() != "0") {
                        if (tblElements[2].getValue() === "")
                            valMsg = "Please enter Concession Amount.";
                    }
                    if (valMsg != "") {
                        if (msg === "")
                            msg = "Serial No.: " + tblElements[0].getText() + "\n" + valMsg + "\n";
                        else
                            msg += "\nSerial No.: " + tblElements[0].getText() + "\n" + valMsg + "\n";
                    }
                }
            }else{
            	msg += "Please add one or more concession detail.";
            }
        } else {
            msg += "Please select or find student for Fee Concession.";
        }
        return msg;
    },
    onSubmitPress: function(evt) {
        var msg = feeConDtl_context.validateStudentFeeConcession();
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
                            feeConDtl_context.submitStudentFeeConcession();
                        });
                    }

                }
            });
        } else {
            sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Error");
        }
    },
    submitStudentFeeConcession: function() {
        var requestBody = {
            "Mode": sap.ui.getCore().getModel("contextModel").getData().mode,
            "navStudentFeeConcession": [],
            "schoolId": sessionStorage.getItem('schoolId'),
            "userId": sessionStorage.getItem('userId'),
        };
        var studentTblItems = feeConDtl_context.getView().byId("studentDtl_tblId").getItems();
        var conTblItems = feeConDtl_context.getView().byId("studentConcessionDtl_tblId").getItems();
        for (var i = 0; i < studentTblItems.length; i++) {
            var studentObj = studentTblItems[i].getBindingContext().getObject();
            for (var x = 0; x < conTblItems.length; x++) {
                var tblElements = conTblItems[x].findElements();
                var obj = conTblItems[x].getBindingContext().getObject();
                requestBody.navStudentFeeConcession.push({
                    feeConcessionId: obj.feeConcessionId,
                    studentId: studentObj.studentId,
                    designId: tblElements[1].getSelectedKey(),
                    designName: tblElements[1].getSelectedItem().getText(),
                    concessionAmount: tblElements[2].getValue()
                });
            }
        }
        var saveResponse = new com.itec.sams.util.GetPostApiCall.postData("FeeConcessionDetailSet", requestBody);
        if (saveResponse != null) {
            if (saveResponse.msgType === "S") {
                sap.m.MessageBox.show(saveResponse.msg, {
                    icon: sap.m.MessageBox.Icon.SUCCESS,
                    title: "Success",
                    styleClass: "sapUiSizeCompact",
                    onClose: function(action) {
                        feeConDtl_context.StudentConcessionDtlModel = null;
                        var bReplace = jQuery.device.is.phone ? false : true;
                        feeConDtl_context.getRouter().navTo("FeeConcession", bReplace);
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