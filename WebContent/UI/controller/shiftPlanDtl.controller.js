jQuery.sap.require("sap.m.MessageBox");
var SPA_context, cellRef, curDiaClass = {},
    action;
sap.ui.controller("com.itec.sams.controller.shiftPlanDtl", {
    onInit: function() {
        SPA_context = this;
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
        oBusyDialog.close();
        var sName = oEvent.getParameter("name");
        if (sName !== "ShiftPlanDetail") {
            return;
        } else {
            oPageTitle.setText("Shift Planning Detail");
            action = oEvent.getParameters().arguments.action;
            SPA_context.formSetup(action);
            SPA_context.resetShftDtl();
            SPA_context._intialBinding();

            if (action == "AD") {
                SPA_context.resetShftDtl();
            }

            if (action == "ED") {
                SPA_context._formBinding();
                SPA_context.tabBindData();
            }

            if (action == "DI") {
                SPA_context._formBinding();
                SPA_context.tabBindData();
            }
        }
    },

    getRouter: function() {
        return sap.ui.core.UIComponent.getRouterFor(this);
    },

    onNavBack: function(oEvent) {
        if (action != "DI") {
            sap.m.MessageBox.confirm("Are you sure want to cancel?", {
                icon: sap.m.MessageBox.Icon.QUESION,
                title: "Confirmation",
                action: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                styleClass: "sapUiSizeCompact",
                onClose: function(action) {
                    if (action === "OK") {
                        var bReplace = jQuery.device.is.phone ? false : true;
                        SPA_context.getRouter().navTo("ShiftPlanning", bReplace);
                    }

                }
            });
        } else {
            var bReplace = jQuery.device.is.phone ? false : true;
            SPA_context.getRouter().navTo("ShiftPlanning", bReplace);
        }
    },

    //Add class for shift starts
    addTabRow: function(oSelItems) {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [
                new sap.m.Text({
                    text: curDiaClass.value,
                    customData: new sap.ui.core.CustomData({
                        key: "code",
                        value: curDiaClass.key
                    })
                }),
                new sap.m.HBox({
                    alignContent: "Start",
                    alignItems: "Start",
                    justifyContent: "Start",
                    items: []
                })
            ]
        });

        for (var i = 0; i < oSelItems.length; i++) {
            var chBox = new sap.m.CheckBox({
                text: oSelItems[i].getTitle(),
                selected: true,
                customData: new sap.ui.core.CustomData({
                    key: "code",
                    value: oSelItems[i].getDescription()
                })
            });

            tblTemplate.getCells()[1].addItem(chBox);
        }


        SPA_context.getView().byId("tb_classDiv").addItem(tblTemplate);
    },

    //Class F4 function...
    onAddClassDiv: function(oEvent) {
        cellRef = oEvent.getSource();
        oBusyDialog.open();
        var query = {
            mode: "CLASS",
            schoolId: comGlob.schoolData.schoolId,
            key: ""
        }
        var classF4Data;
        $.ajax({
            url: dataSource + "/f4HelpDataGet",
            data: query,
            type: 'POST',
            async: true,
            success: function(oData, oResponse) {
                classF4Data = oData;
                var f4Model = new sap.ui.model.json.JSONModel(classF4Data);
                var handleClose = function(oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    if (oSelectedItem) {
                        //							cellRef.setValue(oSelectedItem.getTitle());
                        //							cellRef.removeAllCustomData();
                        //							cellRef.addCustomData(
                        //                                    new sap.ui.core.CustomData( {
                        //                                                      key : "code",
                        //                                                      value : oSelectedItem.getDescription()
                        //                                                }));
                        curDiaClass.key = oSelectedItem.getDescription();
                        curDiaClass.value = oSelectedItem.getTitle();
                        SPA_context.onDivisionF4(oSelectedItem.getDescription());
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
                                description: "{key}",
                                active: true
                            }).addStyleClass("sapUiSizeCompact"),
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
                    })
                    //.addStyleClass("sapUiSizeCompact");
                _valueHelpSelectDialog.setModel(f4Model);
                _valueHelpSelectDialog.open();
                _valueHelpSelectDialog.attachBrowserEvent("keydown", function(oEvent) {
                    if (oEvent.keyCode === 27) {
                        oEvent.stopPropagation();
                        oEvent.preventDefault();
                    }
                });
                jQuery.sap.delayedCall(350, SPA_context, function() {
                    _valueHelpSelectDialog._oSearchField.focus();
                });


                oBusyDialog.close();
            },
            error: function(oError) {
                var msg = oError.responseText.split("Message")[1];
                sap.m.MessageBox.show(msg, {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: "Error",
                    styleClass: "sapUiSizeCompact",
                    onClose: function(oEvent) {
                        oBusyDialog.close();
                    }
                });
            }
        });
    },

    onDivisionF4: function(classKey) {
        //		cellRef = oEvent.getSource();
        oBusyDialog.open();
        var classKey = classKey;
        var query = {
            mode: "DIVISION",
            schoolId: comGlob.schoolData.schoolId,
            key: classKey
        }
        var classF4Data;
        $.ajax({
            url: dataSource + "/f4HelpDataGet",
            data: query,
            type: 'POST',
            async: true,
            success: function(oData, oResponse) {
                classF4Data = oData;
                var f4Model = new sap.ui.model.json.JSONModel(classF4Data);
                var handleClose = function(oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItems");
                    if (oSelectedItem.length != 0) {
                        //							cellRef.setValue(oSelectedItem.getTitle());
                        //							cellRef.removeAllCustomData();
                        //							cellRef.addCustomData(
                        //                                    new sap.ui.core.CustomData( {
                        //                                                      key : "code",
                        //                                                      value : oSelectedItem.getDescription()
                        //                                                }));
                        SPA_context.addTabRow(oSelectedItem);
                    }
                    oEvent.getSource().getBinding("items").filter([]);
                };
                var _valueHelpSelectDialog = new sap.m.SelectDialog({
                        title: "Select Division",
                        multiSelect: true,
                        rememberSelections: true,
                        items: {
                            path: "/navHelpDialog",
                            template: new sap.m.StandardListItem({
                                title: "{value}",
                                description: "{key}",
                                active: true
                            }).addStyleClass("sapUiSizeCompact"),
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
                    })
                    //.addStyleClass("sapUiSizeCompact");
                _valueHelpSelectDialog.setModel(f4Model);
                _valueHelpSelectDialog.open();
                _valueHelpSelectDialog.attachBrowserEvent("keydown", function(oEvent) {
                    if (oEvent.keyCode === 27) {
                        oEvent.stopPropagation();
                        oEvent.preventDefault();
                    }
                });
                jQuery.sap.delayedCall(350, SPA_context, function() {
                    _valueHelpSelectDialog._oSearchField.focus();
                });


                oBusyDialog.close();
            },
            error: function(oError) {
                var msg = oError.responseText.split("Message")[1];
                sap.m.MessageBox.show(msg, {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: "Error",
                    styleClass: "sapUiSizeCompact",
                    onClose: function(oEvent) {
                        oBusyDialog.close();
                    }
                });
            }
        });
    },

    onClDivTabDelete: function(oEvent) {
        oEvent.getParameter("listItem").getParent().removeItem(oEvent.getParameter("listItem"));
    },

    resetFormLayout: function() {
        SPA_context.getView().byId("in_shftName").setEnabled(true);
        SPA_context.getView().byId("in_shftName").setValueState("None");
        SPA_context.getView().byId("lb_shftName").setRequired(true);

        SPA_context.getView().byId("sel_shftTyp").setEnabled(true);
        SPA_context.getView().byId("sel_shftTyp").setValueState("None");
        SPA_context.getView().byId("lb_shfTyp").setRequired(true);

        SPA_context.getView().byId("sel_shfpState").setEnabled(true);
        SPA_context.getView().byId("sel_shfpState").setValueState("None");
        SPA_context.getView().byId("lb_shfpState").setRequired(true);

        SPA_context.getView().byId("dp_effFrmDate").setEnabled(true);
        SPA_context.getView().byId("dp_effFrmDate").setValueState("None");
        SPA_context.getView().byId("lb_effFrmDate").setRequired(true);

        SPA_context.getView().byId("dp_effToDate").setEnabled(true);
        SPA_context.getView().byId("dp_effToDate").setValueState("None");
        SPA_context.getView().byId("lb_effToDate").setRequired(true);

        SPA_context.getView().byId("tp_minIn").setEnabled(true);
        SPA_context.getView().byId("tp_minIn").setValueState("None");
        SPA_context.getView().byId("lb_minIn").setRequired(true);

        SPA_context.getView().byId("tp_maxIn").setEnabled(true);
        SPA_context.getView().byId("tp_maxIn").setValueState("None");
        SPA_context.getView().byId("lb_maxIn").setRequired(true);

        SPA_context.getView().byId("tp_minOut").setEnabled(true);
        SPA_context.getView().byId("tp_minOut").setValueState("None");
        SPA_context.getView().byId("lb_minOut").setRequired(true);

        SPA_context.getView().byId("tp_maxOut").setEnabled(true);
        SPA_context.getView().byId("tp_maxOut").setValueState("None");
        SPA_context.getView().byId("lb_maxOut").setRequired(true);

        SPA_context.getView().byId("tp_bufOut").setEnabled(true);
        SPA_context.getView().byId("tp_bufOut").setValueState("None");
        SPA_context.getView().byId("lb_bufOut").setRequired(true);

        SPA_context.getView().byId("tb_classDiv").setMode("Delete");

        SPA_context.getView().byId("bt_hdrAddClDiv").setVisible(true);
        SPA_context.getView().byId("bt_shftSave").setVisible(true);
        //SPA_context.getView().byId("bt_shftCancel").setVisible(true);
    },

    formSetup: function(action) {
        SPA_context.resetFormLayout();

        switch (action) {
            case "AD":
                break;

            case "ED":
                break;

            case "DI":
                SPA_context.getView().byId("in_shftName").setEnabled(false);
                SPA_context.getView().byId("lb_shftName").setRequired(false);

                SPA_context.getView().byId("sel_shftTyp").setEnabled(false);
                SPA_context.getView().byId("lb_shfTyp").setRequired(false);

                SPA_context.getView().byId("sel_shfpState").setEnabled(false);
                SPA_context.getView().byId("lb_shfpState").setRequired(false);

                SPA_context.getView().byId("dp_effFrmDate").setEnabled(false);
                SPA_context.getView().byId("lb_effFrmDate").setRequired(false);

                SPA_context.getView().byId("dp_effToDate").setEnabled(false);
                SPA_context.getView().byId("lb_effToDate").setRequired(false);

                SPA_context.getView().byId("tp_minIn").setEnabled(false);
                SPA_context.getView().byId("lb_minIn").setRequired(false);

                SPA_context.getView().byId("tp_maxIn").setEnabled(false);
                SPA_context.getView().byId("lb_maxIn").setRequired(false);

                SPA_context.getView().byId("tp_minOut").setEnabled(false);
                SPA_context.getView().byId("lb_minOut").setRequired(false);

                SPA_context.getView().byId("tp_maxOut").setEnabled(false);
                SPA_context.getView().byId("lb_maxOut").setRequired(false);

                SPA_context.getView().byId("tp_bufOut").setEnabled(false);
                SPA_context.getView().byId("lb_bufOut").setRequired(false);

                SPA_context.getView().byId("bt_hdrAddClDiv").setVisible(false);
                SPA_context.getView().byId("bt_shftSave").setVisible(false);
                //SPA_context.getView().byId("bt_shftCancel").setVisible(false);

                SPA_context.getView().byId("tb_classDiv").setMode("None");
                break;
        }

        SPA_context.getView().byId("tb_classDiv").removeAllItems();
    },

    _intialBinding: function() {
        oBusyDialog.open();
        var queryStatus = {
            mode: "STATUS",
            schoolId: comGlob.schoolData.schoolId,
            key: ""
        }
        var statusF4Data;
        $.ajax({
            url: dataSource + "/f4HelpDataGet",
            data: queryStatus,
            type: 'POST',
            async: false,
            success: function(oData, oResponse) {
                statusF4Data = oData;
                oBusyDialog.close();
            },
            error: function(oError) {
                var msg = oError.responseText.split("Message")[1];
                sap.m.MessageBox.show(msg, {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: "Error",
                    styleClass: "sapUiSizeCompact",
                    onClose: function(action) {
                        oBusyDialog.close();
                    }
                });
            }
        });
        var jStatusModel = new sap.ui.model.json.JSONModel(statusF4Data);
        var selectTemplate = new sap.ui.core.Item({
            key: "{key}",
            text: "{value}",
        });
        SPA_context.getView().byId("sel_shfpState").setModel(jStatusModel);
        SPA_context.getView().byId("sel_shfpState").bindAggregation("items", {
            path: "/navHelpDialog",
            template: selectTemplate
        });


        var queryStatus = {
            mode: "SHIFTTYPE",
            schoolId: comGlob.schoolData.schoolId,
            key: ""
        }
        var shftypF4Data;
        $.ajax({
            url: dataSource + "/f4HelpDataGet",
            data: queryStatus,
            type: 'POST',
            async: false,
            success: function(oData, oResponse) {
                shftypF4Data = oData;
                oBusyDialog.close();
            },
            error: function(oError) {
                var msg = oError.responseText.split("Message")[1];
                sap.m.MessageBox.show(msg, {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: "Error",
                    styleClass: "sapUiSizeCompact",
                    onClose: function(action) {
                        oBusyDialog.close();
                    }
                });
            }
        });
        var jShftypModel = new sap.ui.model.json.JSONModel(shftypF4Data);
        SPA_context.getView().byId("sel_shftTyp").setModel(jShftypModel);
        SPA_context.getView().byId("sel_shftTyp").bindAggregation("items", {
            path: "/navHelpDialog",
            template: selectTemplate
        });
    },

    mainManditCheck: function() {
        var retObj = {
            msgArray: [],
            flag: false
        }

        if (SPA_context.getView().byId("lb_shftName").getRequired()) {
            if (SPA_context.getView().byId("in_shftName").getValue() == "") {
                SPA_context.getView().byId("in_shftName").setValueState("Error");
                retObj.flag = true;
            }
        }

        if (SPA_context.getView().byId("lb_shfTyp").getRequired()) {
            if (SPA_context.getView().byId("sel_shftTyp").getSelectedKey() == "") {
                SPA_context.getView().byId("sel_shftTyp").setValueState("Error");
                retObj.flag = true;
            }
        }

        if (SPA_context.getView().byId("lb_shfpState").getRequired()) {
            if (SPA_context.getView().byId("sel_shfpState").getSelectedKey() == "") {
                SPA_context.getView().byId("sel_shfpState").setValueState("Error");
                retObj.flag = true;
            }
        }

        if (SPA_context.getView().byId("lb_effFrmDate").getRequired()) {
            if (SPA_context.getView().byId("dp_effFrmDate").getValue() == "") {
                SPA_context.getView().byId("dp_effFrmDate").setValueState("Error");
                retObj.flag = true;
            }
        }

        if (SPA_context.getView().byId("lb_effToDate").getRequired()) {
            if (SPA_context.getView().byId("dp_effToDate").getValue() == "") {
                SPA_context.getView().byId("dp_effToDate").setValueState("Error");
                retObj.flag = true;
            }
        }

        if (SPA_context.getView().byId("lb_minIn").getRequired()) {
            if (SPA_context.getView().byId("tp_minIn").getValue() == "") {
                SPA_context.getView().byId("tp_minIn").setValueState("Error");
                retObj.flag = true;
            }
        }

        if (SPA_context.getView().byId("lb_maxIn").getRequired()) {
            if (SPA_context.getView().byId("tp_maxIn").getValue() == "") {
                SPA_context.getView().byId("tp_maxIn").setValueState("Error");
                retObj.flag = true;
            }
        }

        if (SPA_context.getView().byId("lb_minOut").getRequired()) {
            if (SPA_context.getView().byId("tp_minOut").getValue() == "") {
                SPA_context.getView().byId("tp_minOut").setValueState("Error");
                retObj.flag = true;
            }
        }

        if (SPA_context.getView().byId("lb_maxOut").getRequired()) {
            if (SPA_context.getView().byId("tp_maxOut").getValue() == "") {
                SPA_context.getView().byId("tp_maxOut").setValueState("Error");
                retObj.flag = true;
            }
        }

        if (SPA_context.getView().byId("lb_bufOut").getRequired()) {
            if (SPA_context.getView().byId("tp_bufOut").getValue() == "") {
                SPA_context.getView().byId("tp_bufOut").setValueState("Error");
                retObj.flag = true;
            }
        }

        return retObj;
    },

    onSave: function(oEvent) {
        oBusyDialog.open();
        if (SPA_context.mainManditCheck().flag) {
            sap.m.MessageToast.show("Enter Mandatory Fields...");
            oBusyDialog.close()
            return;
        }

        if (SPA_context.getView().byId("tb_classDiv").getItems().length == 0) {
            sap.m.MessageBox.show("Enter Class and Division data", {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: "Error",
                styleClass: "sapUiSizeCompact",
                onClose: function(action) {
                    oBusyDialog.close();
                }
            });
            return;
        }

        SPA_context.hitSave();
    },

    valueStateNone: function(oEvent) {
        oEvent.getSource().setValueState("None");
    },

    hitSave: function() {
        var mode, shiftId;
        if (action == "AD") {
            mode = "ADD";
            shiftId = "";
        }
        if (action == "ED") {
            mode = "EDIT";
            shiftId = curShftData.shiftId;
        }

        var toDate = "",
            minIn, maxIn, minOut, maxOut, bufOut;

        if (SPA_context.getView().byId("dp_effToDate").getValue() != "") {
            toDate = SPA_context.getView().byId("dp_effToDate").getValue() + "T00:00:00"
        }

        if (SPA_context.getView().byId("tp_minIn").getValue().split(" ")[1] != undefined) {
            minIn = SPA_context.getView().byId("tp_minIn").getValue().split(" ")[0] + ":00";
        } else {
            minIn = SPA_context.getView().byId("tp_minIn").getValue();
        }

        if (SPA_context.getView().byId("tp_maxIn").getValue().split(" ")[1] != undefined) {
            maxIn = SPA_context.getView().byId("tp_maxIn").getValue().split(" ")[0] + ":00";
        } else {
            maxIn = SPA_context.getView().byId("tp_maxIn").getValue();
        }

        if (SPA_context.getView().byId("tp_minOut").getValue().split(" ")[1] != undefined) {
            minOut = SPA_context.getView().byId("tp_minOut").getValue().split(" ")[0] + ":00";
        } else {
            minOut = SPA_context.getView().byId("tp_minOut").getValue();
        }

        if (SPA_context.getView().byId("tp_maxOut").getValue().split(" ")[1] != undefined) {
            maxOut = SPA_context.getView().byId("tp_maxOut").getValue().split(" ")[0] + ":00";
        } else {
            maxOut = SPA_context.getView().byId("tp_maxOut").getValue();
        }

        if (SPA_context.getView().byId("tp_bufOut").getValue().split(" ")[1] != undefined) {
            bufOut = SPA_context.getView().byId("tp_bufOut").getValue().split(" ")[0] + ":00";
        } else {
            bufOut = SPA_context.getView().byId("tp_bufOut").getValue();
        }

        var query = {
            schoolId: comGlob.schoolData.schoolId, //Number
            Mode: mode, //Value will be 'ADD', 'EDIT' & 'DELETE'
            shiftId: shiftId, //Number
            shiftName: SPA_context.getView().byId("in_shftName").getValue(),
            shiftType: SPA_context.getView().byId("sel_shftTyp").getSelectedKey(),
            minInTime: "2016-12-07T" + minIn,
            maxInTime: "2016-12-07T" + maxIn,
            minOutTime: "2016-12-07T" + minOut,
            maxOutTime: "2016-12-07T" + maxOut,
            bufferOutTime: "2016-12-07T" + bufOut,
            shiftStartDate: SPA_context.getView().byId("dp_effFrmDate").getValue() + "T00:00:00",
            shiftEndDate: toDate,
            statusKey: SPA_context.getView().byId("sel_shfpState").getSelectedKey(), //Value will be '0' or '1'
            //				statusText : SPA_context.getView().byId("sel_shfpState").getSelectedItem().getText(),
            userId: comGlob.schoolData.userId,
            NavShiftClassDivDtlSet: [],
            msgType: "",
            msg: ""
        };

        query.NavShiftClassDivDtlSet = SPA_context.getClDivTabData();

        $.ajax({
            url: dataSource + "/ShiftDtlSet",
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
                            SPA_context.resetShftDtl();
                            var bReplace = jQuery.device.is.phone ? false : true;
                            SPA_context.getRouter().navTo("ShiftPlanning", bReplace);
                            oBusyDialog.close();
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

    getClDivTabData: function() {
        var tempArr = [];
        var clDivItems = SPA_context.getView().byId("tb_classDiv").getItems();

        for (var i = 0; i < clDivItems.length; i++) {

            var divCellItems = clDivItems[i].getCells()[1].getItems();
            for (var j = 0; j < divCellItems.length; j++) {
                if (divCellItems[j].getSelected()) {
                    tempArr.push({
                        classId: clDivItems[i].getCells()[0].getCustomData()[0].getValue(), //Number
                        className: clDivItems[i].getCells()[0].getText(),
                        divisionId: divCellItems[j].getCustomData()[0].getValue(),
                        divisionName: divCellItems[j].getText()
                    });
                }
            }

        }
        return tempArr;
    },

    resetShftDtl: function() {
        SPA_context.getView().byId("in_shftName").setValue("");
        SPA_context.getView().byId("sel_shftTyp").setSelectedKey("");
        SPA_context.getView().byId("sel_shfpState").setSelectedKey("");
        SPA_context.getView().byId("dp_effFrmDate").setValue("");
        SPA_context.getView().byId("dp_effToDate").setValue("");
        SPA_context.getView().byId("tp_minIn").setValue("");
        SPA_context.getView().byId("tp_maxIn").setValue("");
        SPA_context.getView().byId("tp_minOut").setValue("");
        SPA_context.getView().byId("tp_maxOut").setValue("");
        SPA_context.getView().byId("tp_bufOut").setValue("");
    },

    dateToString: function(value) {
        if (value) {
            var oDateFormat = sap.ui.core.format.DateFormat
                .getDateTimeInstance({
                    pattern: "yyyy-MM-dd"
                });
            return oDateFormat.format(new Date(value));
        } else {
            return null;
        }
    },

    timeToString: function(value) {
        if (value) {
            var oDateFormat = sap.ui.core.format.DateFormat
                .getDateTimeInstance({
                    pattern: "HH:mm:ss"
                });
            return oDateFormat.format(new Date(value));
        } else {
            return null;
        }
    },

    _formBinding: function() {
        SPA_context.getView().byId("in_shftName").setValue(curShftData.shiftName);
        SPA_context.getView().byId("sel_shftTyp").setSelectedKey(curShftData.shiftType);
        SPA_context.getView().byId("sel_shfpState").setSelectedKey(curShftData.statusKey);
        SPA_context.getView().byId("dp_effFrmDate").setValue(SPA_context.dateToString(curShftData.shiftStartDate));
        SPA_context.getView().byId("dp_effToDate").setValue(SPA_context.dateToString(curShftData.shiftEndDate));
        jQuery.sap.delayedCall(350, SPA_context, function() {
            SPA_context.getView().byId("tp_minIn").setValue(SPA_context.timeToString(curShftData.minInTime));
            SPA_context.getView().byId("tp_maxIn").setValue(SPA_context.timeToString(curShftData.maxInTime));
            SPA_context.getView().byId("tp_minOut").setValue(SPA_context.timeToString(curShftData.minOutTime));
            SPA_context.getView().byId("tp_maxOut").setValue(SPA_context.timeToString(curShftData.maxOutTime));
            SPA_context.getView().byId("tp_bufOut").setValue(SPA_context.timeToString(curShftData.bufferOutTime));
        });
    },

    tabBindData: function() {
        var query = {
            schoolId: comGlob.schoolData.schoolId, //Number
            shiftId: curShftData.shiftId, //Number
        };

        $.ajax({
            url: dataSource + "/ClassDivShiftDtlGet",
            data: query,
            type: 'POST',
            async: false,
            success: function(oData, oResponse) {
                var tabClDivData = oData.NavShiftClassDivDtlSet;
                SPA_context.setTabData(tabClDivData);

            },
            error: function(oError) {
                var msg = oError.responseText.split("Message")[1];
                oBusyDialog.close();
            }
        });
    },

    setTabData: function(tabData) {
        var flag;
        if (action == "ED") {
            flag = true;
        } else {
            flag = false;
        }
        for (var i = 0; i < tabData.length; i++) {
            var curClass = tabData[i].classId;
            var tblTemplate = new sap.m.ColumnListItem({
                cells: [
                    new sap.m.Text({
                        text: tabData[i].className,
                        customData: new sap.ui.core.CustomData({
                            key: "code",
                            value: tabData[i].classId
                        })
                    }),
                    new sap.m.HBox({
                        alignContent: "Start",
                        alignItems: "Start",
                        justifyContent: "Start",
                        items: []
                    })
                ]
            });
            for (var j = 0; j < tabData.length; j++) {
                if (curClass == tabData[j].classId) {
                    var chBox = new sap.m.CheckBox({
                        text: tabData[j].divisionName,
                        enabled: flag,
                        selected: true,
                        customData: new sap.ui.core.CustomData({
                            key: "code",
                            value: tabData[j].divisionId
                        })
                    });

                    tblTemplate.getCells()[1].addItem(chBox);
                    i++;
                }
            }
            SPA_context.getView().byId("tb_classDiv").addItem(tblTemplate);
        }
    },

    onShftTypeChange: function(oEvent) {
        oEvent.getSource().setValueState("None");
        if ((oEvent.getSource().getSelectedKey() == "2") || (oEvent.getSource().getSelectedKey() == "3")) {
            SPA_context.getView().byId("lb_effToDate").setRequired(true);
        } else {
            SPA_context.getView().byId("lb_effToDate").setRequired(true);
        }
    }


});