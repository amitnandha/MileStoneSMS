jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
sap.ui.core.mvc.Controller.extend("com.itec.sams.controller.ReligionCasteMaster", {
    onInit: function() {
        CDM_context = this;
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
        if (sName !== "ReligionCasteMaster") {
            return;
        } else {
            oPageTitle.setText("Religion - Caste - Sub Caste Master");
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
                CDM_context.initialLoad();
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
        CDM_context.getRouter().navTo("firstPage", bReplace);
    },
    initialLoad: function() {
        var query = {
            schoolId: comGlob.schoolData.schoolId,
            skip: 0,
            top: 1000,
        };

        var oReligionResponse = new com.itec.sams.util.GetPostApiCall.postData("ReligionDataGet", query);
        if (oReligionResponse != null)
            CDM_context.bindReligionTable(oReligionResponse);

        var oCasteResponse = new com.itec.sams.util.GetPostApiCall.postData("CasteDataGet", query);
        if (oCasteResponse != null)
            CDM_context.bindCasteTable(oCasteResponse);

        var oSubCasteResponse = new com.itec.sams.util.GetPostApiCall.postData("SubCasteDataGet", query);
        if (oSubCasteResponse != null)
            CDM_context.bindSubCasteTable(oSubCasteResponse);
        sap.ui.getCore().setModel(null, "actionModel");


        var queryStatus = {
            mode: "STATUS",
            schoolId: comGlob.schoolData.schoolId,
            key: ""
        }
        var valueStatus = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", queryStatus);
        if (valueStatus != null)
            CDM_context.valueStatus = new sap.ui.model.json.JSONModel(valueStatus);

        oBusyDialog.close();

    },
    bindReligionTable: function(oData) {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                text: "{religionName}",
            }), new sap.m.Text({
                text: {
                    path: "status",
                    formatter: function(value) {
                        if (value === false || value === "False")
                            return "InActive";
                        else
                            return "Active";
                    }
                },
            }), new sap.m.Button({
                icon: "sap-icon://action",
                type: "Default",
                press: CDM_context.onReligionTableActionPress
            }), ]
        });

        var oTable = this.getView().byId("religionMaster_tblId");
        var oTblModel = new sap.ui.model.json.JSONModel(oData);
        oTable.setModel(oTblModel);
        oTable.bindAggregation("items", {
            path: "/navReligionDtl",
            template: tblTemplate
        });
    },
    setReligionTableHeight: function(evt) {
        var oTable = evt.getSource();
        var oScrollContainer = evt.getSource().getParent();
        if (oTable.getDomRef() != null) {
            var footerHeight = CDM_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
            var tablePositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
            var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
            oScrollContainer.setHeight(String(scrollHeight + "px"));
        }
    },
    onRegisterNewReligion: function(evt) {
        var mData = {
            frameId: "Religion",
            frameMode: "ADD",
            tableData: []
        }
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "actionModel");
        if (!CDM_context._religionDialogADE) {
            CDM_context._religionDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.religionMasterADE", CDM_context);
            CDM_context.getView().addDependent(CDM_context._religionDialogADE);
        }
        CDM_context._religionDialogADE.open();
    },
    onReligionTableActionPress: function(evt) {
        var actButtonRef = evt.getSource();
        var obj = evt.getSource().getParent().getBindingContext().getObject();
        if (!CDM_context._actionSheet) {
            CDM_context._actionSheet = sap.ui.xmlfragment("com.itec.sams.fragment.editDisDlt", CDM_context);
            CDM_context.getView().addDependent(CDM_context._actionSheet);
        }
        var mData = {
            frameId: "Religion",
            frameMode: "",
            tableData: []
        }
        mData.tableData.push(obj);
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "actionModel");
        CDM_context._actionSheet.openBy(actButtonRef);
    },
    bindCasteTable: function(oData) {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                text: "{casteName}",
            }), new sap.m.Text({
                text: {
                    path: "status",
                    formatter: function(value) {
                        if (value === false || value === "False")
                            return "InActive";
                        else
                            return "Active";
                    }
                },
            }), new sap.m.Button({
                icon: "sap-icon://action",
                type: "Default",
                press: CDM_context.onCasteTableActionPress
            }), ]
        });

        var oTable = this.getView().byId("casteMaster_tblId");
        var oTblModel = new sap.ui.model.json.JSONModel(oData);
        oTable.setModel(oTblModel);
        oTable.bindAggregation("items", {
            path: "/navCasteDtl",
            template: tblTemplate
        });
    },
    setCasteTableHeight: function(evt) {
        var oTable = evt.getSource();
        var oScrollContainer = evt.getSource().getParent();
        if (oTable.getDomRef() != null) {
            var footerHeight = CDM_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
            var tablePositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
            var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
            oScrollContainer.setHeight(String(scrollHeight + "px"));
        }
    },
    onRegisterNewCaste: function(evt) {
        var mData = {
            frameId: "Caste",
            frameMode: "ADD",
            tableData: []
        }
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "actionModel");
        if (!CDM_context._casteDialogADE) {
            CDM_context._casteDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.casteMasterADE", CDM_context);
            CDM_context.getView().addDependent(CDM_context._casteDialogADE);
        }
        CDM_context._casteDialogADE.open();
    },
    onCasteTableActionPress: function(evt) {
        var actButtonRef = evt.getSource();
        var obj = evt.getSource().getParent().getBindingContext().getObject();
        if (!CDM_context._actionSheet) {
            CDM_context._actionSheet = sap.ui.xmlfragment("com.itec.sams.fragment.editDisDlt", CDM_context);
            CDM_context.getView().addDependent(CDM_context._actionSheet);
        }
        var mData = {
            frameId: "Caste",
            frameMode: "",
            tableData: []
        }
        mData.tableData.push(obj);
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "actionModel");
        CDM_context._actionSheet.openBy(actButtonRef);
    },
    bindSubCasteTable: function(oData) {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                text: "{subCasteName}",
            }), new sap.m.Text({
                text: "{casteName}",
            }), new sap.m.Text({
                text: {
                    path: "status",
                    formatter: function(value) {
                        if (value === false || value === "False")
                            return "InActive";
                        else
                            return "Active";
                    }
                },
            }), new sap.m.Button({
                icon: "sap-icon://action",
                type: "Default",
                press: CDM_context.onSubCasteTableActionPress
            }), ]
        });

        var oTable = this.getView().byId("subCasteMaster_tblId");
        var oTblModel = new sap.ui.model.json.JSONModel(oData);
        oTable.setModel(oTblModel);
        oTable.bindAggregation("items", {
            path: "/navSubCasteDtl",
            template: tblTemplate
        });
    },
    setSubCasteTableHeight: function(evt) {
        var oTable = evt.getSource();
        var oScrollContainer = evt.getSource().getParent();
        if (oTable.getDomRef() != null) {
            var footerHeight = CDM_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
            var tablePositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
            var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
            oScrollContainer.setHeight(String(scrollHeight + "px"));
        }
    },
    onRegisterNewSubCaste: function(evt) {
        var mData = {
            frameId: "SubCaste",
            frameMode: "ADD",
            tableData: [{
                casteId: "",
                casteName: ""
            }]
        }
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "actionModel");
        if (!CDM_context._subCasteDialogADE) {
            CDM_context._subCasteDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.subCasteMasterADE", CDM_context);
            CDM_context.getView().addDependent(CDM_context._subCasteDialogADE);
        }
        CDM_context._subCasteDialogADE.open();
    },
    onSubCasteTableActionPress: function(evt) {
        var actButtonRef = evt.getSource();
        var obj = evt.getSource().getParent().getBindingContext().getObject();
        if (!CDM_context._actionSheet) {
            CDM_context._actionSheet = sap.ui.xmlfragment("com.itec.sams.fragment.editDisDlt", CDM_context);
            CDM_context.getView().addDependent(CDM_context._actionSheet);
        }
        var mData = {
            frameId: "SubCaste",
            frameMode: "",
            tableData: []
        }
        mData.tableData.push(obj);
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "actionModel");
        CDM_context._actionSheet.openBy(actButtonRef);
    },
    onAsheetEdit: function(evt) {
        var actionModel = sap.ui.getCore().getModel("actionModel");
        if (actionModel != null && actionModel != undefined) {
            var actionModelData = actionModel.getData();
            actionModelData.frameMode = "EDIT";
            if (actionModelData.frameId === "Religion") {
                if (!CDM_context._religionDialogADE) {
                    CDM_context._religionDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.religionMasterADE", CDM_context);
                    CDM_context.getView().addDependent(CDM_context._religionDialogADE);
                }
                CDM_context._religionDialogADE.open();
            } else if (actionModelData.frameId === "Caste") {
                if (!CDM_context._casteDialogADE) {
                    CDM_context._casteDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.casteMasterADE", CDM_context);
                    CDM_context.getView().addDependent(CDM_context._casteDialogADE);
                }
                CDM_context._casteDialogADE.open();
            } else if (actionModelData.frameId === "SubCaste") {
                if (!CDM_context._subCasteDialogADE) {
                    CDM_context._subCasteDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.subCasteMasterADE", CDM_context);
                    CDM_context.getView().addDependent(CDM_context._subCasteDialogADE);
                }
                CDM_context._subCasteDialogADE.open();
            }
        }
    },
    onAsheetDisplay: function(evt) {
        var actionModel = sap.ui.getCore().getModel("actionModel");
        if (actionModel != null && actionModel != undefined) {
            var actionModelData = actionModel.getData();
            actionModelData.frameMode = "DISPLAY";
            if (actionModelData.frameId === "Religion") {
                if (!CDM_context._religionDialogADE) {
                    CDM_context._religionDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.religionMasterADE", CDM_context);
                    CDM_context.getView().addDependent(CDM_context._religionDialogADE);
                }
                CDM_context._religionDialogADE.open();
            } else if (actionModelData.frameId === "Caste") {
                if (!CDM_context._casteDialogADE) {
                    CDM_context._casteDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.casteMasterADE", CDM_context);
                    CDM_context.getView().addDependent(CDM_context._casteDialogADE);
                }
                CDM_context._casteDialogADE.open();
            } else if (actionModelData.frameId === "SubCaste") {
                if (!CDM_context._subCasteDialogADE) {
                    CDM_context._subCasteDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.subCasteMasterADE", CDM_context);
                    CDM_context.getView().addDependent(CDM_context._subCasteDialogADE);
                }
                CDM_context._subCasteDialogADE.open();
            }
        }
    },
    //Religion Add/ Edit/ Display
    onBeforeReligionDialogOpen: function(evt) {
        var selectTemplate = new sap.ui.core.Item({
            key: "{key}",
            text: "{value}",
        });
        var status_cBoxId = sap.ui.getCore().byId("statusReligion_cBoxId");
        var name_txtId = sap.ui.getCore().byId("religionName_txtId");
        var save_BtnId = CDM_context._religionDialogADE.getBeginButton();
        status_cBoxId.removeAllAggregation();
        if (CDM_context.valueStatus != undefined) {
            status_cBoxId.setModel(CDM_context.valueStatus);
            status_cBoxId.bindAggregation("items", {
                path: "/navHelpDialog",
                template: selectTemplate
            });
        }
        var actionModelData = sap.ui.getCore().getModel("actionModel").getData();
        name_txtId.setValue("");
        name_txtId.setEnabled(false);
        status_cBoxId.setSelectedKey("");
        status_cBoxId.setEnabled(false);
        save_BtnId.setVisible(false);
        if (actionModelData.frameMode === "ADD") {
            name_txtId.setEnabled(true);
            status_cBoxId.setEnabled(true);
            save_BtnId.setVisible(true);
        } else if (actionModelData.frameMode === "EDIT") {
            name_txtId.setEnabled(true);
            name_txtId.setValue(actionModelData.tableData[0].religionName);
            status_cBoxId.setEnabled(true);
            status_cBoxId.setSelectedKey(actionModelData.tableData[0].status);
            save_BtnId.setVisible(true);
        } else if (actionModelData.frameMode === "DISPLAY") {
            name_txtId.setValue(actionModelData.tableData[0].religionName);
            status_cBoxId.setSelectedKey(actionModelData.tableData[0].status);
        }
    },
    onReligionSaveDialogPress: function(evt) {
        if (sap.ui.getCore().byId("statusReligion_cBoxId").getSelectedKey() != "" && sap.ui.getCore().byId("religionName_txtId").getValue() != "") {
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
                CDM_context.onSaveReligion();
            });
        } else {
            var msg = "";

            if (sap.ui.getCore().byId("religionName_txtId").getValue() === "")
                msg += "Please enter Religion Name." + "\n";
            if (sap.ui.getCore().byId("statusReligion_cBoxId").getSelectedKey() === "")
                msg += "Please select Status." + "\n";

            sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "ERROR");
        }
    },
    onSaveReligion: function(evt) {
        var actionModelData = sap.ui.getCore().getModel("actionModel").getData();
        var requestBody = {
            "Mode": actionModelData.frameMode.toString(),
            "navReligionDtl": [],
            "schoolId": sessionStorage.getItem('schoolId'),
            "userId": sessionStorage.getItem('userId'),
        }
        if (actionModelData.frameMode === "ADD") {
            requestBody.navReligionDtl.push({
                "religionName": sap.ui.getCore().byId("religionName_txtId").getValue(),
                "status": sap.ui.getCore().byId("statusReligion_cBoxId").getSelectedKey(),
            })
        } else {
            requestBody.navReligionDtl.push({
                "religionId": actionModelData.tableData[0].religionId,
                "religionName": sap.ui.getCore().byId("religionName_txtId").getValue(),
                "status": sap.ui.getCore().byId("statusReligion_cBoxId").getSelectedKey(),
            })
        }
        var saveResponse = new com.itec.sams.util.GetPostApiCall.postData("ReligionDataSet", requestBody);
        if (saveResponse != null) {
            if (saveResponse.msgType === "S") {
                sap.m.MessageBox.show(saveResponse.msg, {
                    icon: sap.m.MessageBox.Icon.SUCCESS,
                    title: "Success",
                    styleClass: "sapUiSizeCompact",
                    onClose: function(action) {
                        CDM_context.initialLoad();
                        CDM_context._religionDialogADE.close();
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
    onRelgionCancelDialogPress: function(evt) {
        CDM_context._religionDialogADE.close();
    },

    //Caste Add/ Edit/ Display
    onBeforeCasteDialogOpen: function(evt) {
        var selectTemplate = new sap.ui.core.Item({
            key: "{key}",
            text: "{value}",
        });
        var status_cBoxId = sap.ui.getCore().byId("statusCaste_cBoxId");
        var name_txtId = sap.ui.getCore().byId("casteName_txtId");
        var save_BtnId = CDM_context._casteDialogADE.getBeginButton();
        status_cBoxId.removeAllAggregation();
        if (CDM_context.valueStatus != undefined) {
            status_cBoxId.setModel(CDM_context.valueStatus);
            status_cBoxId.bindAggregation("items", {
                path: "/navHelpDialog",
                template: selectTemplate
            });
        }
        var actionModelData = sap.ui.getCore().getModel("actionModel").getData();
        name_txtId.setValue("");
        name_txtId.setEnabled(false);
        status_cBoxId.setSelectedKey("");
        status_cBoxId.setEnabled(false);
        save_BtnId.setVisible(false);
        if (actionModelData.frameMode === "ADD") {
            name_txtId.setEnabled(true);
            status_cBoxId.setEnabled(true);
            save_BtnId.setVisible(true);
        } else if (actionModelData.frameMode === "EDIT") {
            name_txtId.setEnabled(true);
            name_txtId.setValue(actionModelData.tableData[0].casteName);
            status_cBoxId.setEnabled(true);
            status_cBoxId.setSelectedKey(actionModelData.tableData[0].status);
            save_BtnId.setVisible(true);
        } else if (actionModelData.frameMode === "DISPLAY") {
            name_txtId.setValue(actionModelData.tableData[0].casteName);
            status_cBoxId.setSelectedKey(actionModelData.tableData[0].status);
        }
    },
    onCasteSaveDialogPress: function(evt) {
        if (sap.ui.getCore().byId("statusCaste_cBoxId").getSelectedKey() != "" && sap.ui.getCore().byId("casteName_txtId").getValue() != "") {
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
                CDM_context.onSaveCaste();
            });
        } else {
            var msg = "";

            if (sap.ui.getCore().byId("casteName_txtId").getValue() === "")
                msg += "Please enter Caste Name." + "\n";
            if (sap.ui.getCore().byId("statusCaste_cBoxId").getSelectedKey() === "")
                msg += "Please select Status." + "\n";

            sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "ERROR");
        }

    },
    onSaveCaste: function() {
        var actionModelData = sap.ui.getCore().getModel("actionModel").getData();
        var requestBody = {
            "Mode": actionModelData.frameMode,
            "navCasteDtl": [],
            "schoolId": sessionStorage.getItem('schoolId'),
            "userId": sessionStorage.getItem('userId'),
        }
        if (actionModelData.frameMode === "ADD") {
            requestBody.navCasteDtl.push({
                "casteName": sap.ui.getCore().byId("casteName_txtId").getValue(),
                "status": sap.ui.getCore().byId("statusCaste_cBoxId").getSelectedKey(),
            })
        } else {
            requestBody.navCasteDtl.push({
                "casteId": actionModelData.tableData[0].casteId,
                "casteName": sap.ui.getCore().byId("casteName_txtId").getValue(),
                "status": sap.ui.getCore().byId("statusCaste_cBoxId").getSelectedKey(),
            })
        }
        var saveResponse = new com.itec.sams.util.GetPostApiCall.postData("CasteDataSet", requestBody);
        if (saveResponse != null) {
            if (saveResponse.msgType === "S") {
                sap.m.MessageBox.show(saveResponse.msg, {
                    icon: sap.m.MessageBox.Icon.SUCCESS,
                    title: "Success",
                    styleClass: "sapUiSizeCompact",
                    onClose: function(action) {
                        CDM_context.initialLoad();
                        CDM_context._casteDialogADE.close();
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
    onCasteCancelDialogPress: function(evt) {
        CDM_context._casteDialogADE.close();
    },

    //Sub-Caste Add/ Edit/ Display
    onBeforeSubCasteDialogOpen: function(evt) {
        var selectTemplate = new sap.ui.core.Item({
            key: "{key}",
            text: "{value}",
        });
        var status_cBoxId = sap.ui.getCore().byId("statusSubCaste_cBoxId");
        var caste_txtId = sap.ui.getCore().byId("subCaste_casteName_txtId");
        var name_txtId = sap.ui.getCore().byId("subCasteName_txtId");
        var save_BtnId = CDM_context._subCasteDialogADE.getBeginButton();
        status_cBoxId.removeAllAggregation();
        if (CDM_context.valueStatus != undefined) {
            status_cBoxId.setModel(CDM_context.valueStatus);
            status_cBoxId.bindAggregation("items", {
                path: "/navHelpDialog",
                template: selectTemplate
            });
        }
        var actionModelData = sap.ui.getCore().getModel("actionModel").getData();
        caste_txtId.setValue("");
        caste_txtId.setEnabled(false);
        name_txtId.setValue("");
        name_txtId.setEnabled(false);
        status_cBoxId.setSelectedKey("");
        status_cBoxId.setEnabled(false);
        save_BtnId.setVisible(false);
        if (actionModelData.frameMode === "ADD") {
            caste_txtId.setEnabled(true);
            name_txtId.setEnabled(true);
            status_cBoxId.setEnabled(true);
            save_BtnId.setVisible(true);
        } else if (actionModelData.frameMode === "EDIT") {
            caste_txtId.setValue(actionModelData.tableData[0].casteName);
            name_txtId.setEnabled(true);
            name_txtId.setValue(actionModelData.tableData[0].subCasteName);
            status_cBoxId.setEnabled(true);
            status_cBoxId.setSelectedKey(actionModelData.tableData[0].status);
            save_BtnId.setVisible(true);
        } else if (actionModelData.frameMode === "DISPLAY") {
            caste_txtId.setValue(actionModelData.tableData[0].casteName);
            name_txtId.setValue(actionModelData.tableData[0].subCasteName);
            status_cBoxId.setSelectedKey(actionModelData.tableData[0].status);
        }
    },
    onSubCasteDialog_CasteF4: function(evt) {

        var query = {
            mode: "CASTE",
            schoolId: sessionStorage.getItem('schoolId'),
            key: ""
        };
        var f4DialogResponse = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", query);
        if (f4DialogResponse != "") {
            var f4Model = new sap.ui.model.json.JSONModel(f4DialogResponse);
            var handleClose = function(oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                if (oSelectedItem) {
                    sap.ui.getCore().byId("subCaste_casteName_txtId").setValue(oSelectedItem.getTitle());
                    sap.ui.getCore().getModel("actionModel").getData().tableData[0].casteName = oSelectedItem.getTitle();
                    sap.ui.getCore().getModel("actionModel").getData().tableData[0].casteId = oSelectedItem.getDescription();
                }
                oEvent.getSource().getBinding("items").filter([]);
            };
            var _valueHelpSelectDialog = new sap.m.SelectDialog({
                title: "Select Caste",
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
            });
            _valueHelpSelectDialog.setModel(f4Model);
            _valueHelpSelectDialog.open();
            _valueHelpSelectDialog.attachBrowserEvent("keydown", function(oEvent) {
                if (oEvent.keyCode === 27) {
                    oEvent.stopPropagation();
                    oEvent.preventDefault();
                }
            });
            jQuery.sap.delayedCall(350, CDM_context, function() {
                _valueHelpSelectDialog._oSearchField.focus();
            });
        }
    },
    onSubCasteSaveDialogPress: function(evt) {
        if (sap.ui.getCore().byId("statusSubCaste_cBoxId").getSelectedKey() != "" && sap.ui.getCore().byId("subCaste_casteName_txtId").getValue() != "" && sap.ui.getCore().byId("subCasteName_txtId").getValue() != "") {
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
                CDM_context.onSaveSubCaste();
            });
        } else {
            var msg = "";
            if (sap.ui.getCore().byId("subCaste_casteName_txtId").getValue() === "")
                msg += "Please select Caste Name." + "\n";
            if (sap.ui.getCore().byId("subCasteName_txtId").getValue() === "")
                msg += "Please enter Sub-Caste Name." + "\n";
            if (sap.ui.getCore().byId("statusSubCaste_cBoxId").getSelectedKey() === "")
                msg += "Please select Status." + "\n";

            sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "ERROR");
        }
    },
    onSaveSubCaste: function() {
        var actionModelData = sap.ui.getCore().getModel("actionModel").getData();
        var requestBody = {
            "Mode": actionModelData.frameMode,
            "navSubCasteDtl": [],
            "schoolId": sessionStorage.getItem('schoolId'),
            "userId": sessionStorage.getItem('userId'),
        }
        if (actionModelData.frameMode === "ADD") {
            requestBody.navSubCasteDtl.push({
                "casteId": actionModelData.tableData[0].casteId,
                "casteName": actionModelData.tableData[0].casteName,
                "subCasteName": sap.ui.getCore().byId("subCasteName_txtId").getValue(),
                "status": sap.ui.getCore().byId("statusSubCaste_cBoxId").getSelectedKey(),
            })
        } else {
            requestBody.navSubCasteDtl.push({
                "casteId": actionModelData.tableData[0].casteId,
                "casteName": actionModelData.tableData[0].casteName,
                "subCasteId": actionModelData.tableData[0].subCasteId,
                "subCasteName": sap.ui.getCore().byId("subCasteName_txtId").getValue(),
                "status": sap.ui.getCore().byId("statusSubCaste_cBoxId").getSelectedKey(),
            })
        }
        var saveResponse = new com.itec.sams.util.GetPostApiCall.postData("SubCasteDataSet", requestBody);
        if (saveResponse != null) {
            if (saveResponse.msgType === "S") {
                sap.m.MessageBox.show(saveResponse.msg, {
                    icon: sap.m.MessageBox.Icon.SUCCESS,
                    title: "Success",
                    styleClass: "sapUiSizeCompact",
                    onClose: function(action) {
                        CDM_context.initialLoad();
                        CDM_context._subCasteDialogADE.close();
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
    onSubCasteCancelDialogPress: function(evt) {
        CDM_context._subCasteDialogADE.close();
    },
});