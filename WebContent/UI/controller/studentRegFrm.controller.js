jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.formatter");
var action, imageSource = "http://devsmsapp.milestonetechnologies.in";
//.extion , .uploadValue, .imageAdd
sap.ui.controller("com.itec.sams.controller.studentRegFrm", {
    onInit: function() {
        SRADE_context = this;
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
        //date validation
        this.getView().byId("dob_txtId").setMaxDate(new Date());
    },
    onRouteMatched: function(oEvent) {
        var sName = oEvent.getParameter("name");
        if (sName !== "studentRegAdd") {
            return;
        } else {
            oPageTitle.setText("Student Enrollment");
            action = oEvent.getParameters().arguments.action;
            SRADE_context.formSetup(action);
            SRADE_context._intialBinding();

            if (action == "AD") {
                SRADE_context.imageAdd = false;
            }

            if (action == "ED") {
                SRADE_context.imageAdd = false;
                SRADE_context._formBinding();
            }

            if (action == "DI") {
                SRADE_context._formBinding();
            }

        }
    },
    getEventBus: function() {
        return sap.ui.getCore().getEventBus();
    },
    getRouter: function() {
        return sap.ui.core.UIComponent.getRouterFor(this);
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
    resetStudentDlt: function() {

        SRADE_context.getView().byId("alternateEmailId_txtId").setValue("");
        SRADE_context.getView().byId("alternateNumber_txtId").setValue("");
        SRADE_context.getView().byId("cardNumber_txtId").removeAllCustomData();
        SRADE_context.getView().byId("cardNumber_txtId").setValue();
        SRADE_context.getView().byId("city_txtId").removeAllCustomData();
        SRADE_context.getView().byId("city_txtId").setValue("");
        SRADE_context.getView().byId("inp_class").removeAllCustomData();
        SRADE_context.getView().byId("inp_class").setValue("");
        SRADE_context.getView().byId("inp_religion").removeAllCustomData();
        SRADE_context.getView().byId("inp_religion").setValue("");
        SRADE_context.getView().byId("inp_caste").removeAllCustomData();
        SRADE_context.getView().byId("inp_caste").setValue("");
        SRADE_context.getView().byId("inp_subCaste").removeAllCustomData();
        SRADE_context.getView().byId("inp_subCaste").setValue("");
        SRADE_context.getView().byId("dob_txtId").setDateValue(null);
        SRADE_context.getView().byId("inp_division").removeAllCustomData();
        SRADE_context.getView().byId("inp_division").setValue("");
        SRADE_context.getView().byId("email_txtId").setValue("");
        SRADE_context.getView().byId("fDOB_txtId").setDateValue(null);
        SRADE_context.getView().byId("fFName_txtId").setValue("");
        SRADE_context.getView().byId("fLName_txtId").setValue("");
        SRADE_context.getView().byId("fOccupation_txtId").setValue("");
        SRADE_context.getView().byId("fName_txtId").setValue("");
        SRADE_context.getView().byId("sel_gender").setSelectedKey("");
        SRADE_context.getView().byId("grNo_txtId").setValue("");
        SRADE_context.getView().byId("gFName_txtId").setValue("");
        SRADE_context.getView().byId("gLName_txtId").setValue("");
        SRADE_context.getView().byId("gOccupation_txtId").setValue("");
        SRADE_context.getView().byId("gRelation_txtId").setValue("");
        SRADE_context.getView().byId("lName_txtId").setValue("");
        SRADE_context.getView().byId("locality_txtId").setValue("");
        SRADE_context.getView().byId("mobileNumber_txtId").setValue();
        SRADE_context.getView().byId("mDOB_txtId").setDateValue(null);
        SRADE_context.getView().byId("mFName_txtId").setValue("");
        SRADE_context.getView().byId("mLName_txtId").setValue("");
        SRADE_context.getView().byId("mOccupation_txtId").setValue("");
        SRADE_context.getView().byId("pinCode_txtId").setValue("");
        SRADE_context.getView().byId("rollNumber_txtId").setValue("");
        SRADE_context.getView().byId("state_txtId").removeAllCustomData();
        SRADE_context.getView().byId("state_txtId").setValue("");
        SRADE_context.getView().byId("status_cBoxId").getSelectedKey("");
        SRADE_context.getView().byId("streetAddress_txtId").setValue("");
        SRADE_context.getView().byId("img_student").setSrc("img/stdBlank.jpg");
        SRADE_context.getView().byId("imageUplaod").setValue("");
        SRADE_context.uploadValue = "";
        SRADE_context.imageAdd = false;

    },
    _intialBinding: function() {
        //Gender F4 Binding...
        oBusyDialog.open();
        var query = {
            mode: "GENDER",
            schoolId: comGlob.schoolData.schoolId,
            key: ""
        }
        var genderF4Data;
        $.ajax({
            url: dataSource + "/f4HelpDataGet",
            data: query,
            type: 'POST',
            async: false,
            success: function(oData, oResponse) {
                genderF4Data = oData;
                oBusyDialog.close();
            },
            error: function(oError) {
                var msg = oError.responseText.split("Message")[1];
            }
        });
        var jModel = new sap.ui.model.json.JSONModel(genderF4Data);
        var selectTemplate = new sap.ui.core.Item({
            key: "{key}",
            text: "{value}",
        });
        SRADE_context.getView().byId("sel_gender").setModel(jModel);
        SRADE_context.getView().byId("sel_gender").bindAggregation("items", {
            path: "/navHelpDialog",
            template: selectTemplate
        });
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
            }
        });
        var jStatusModel = new sap.ui.model.json.JSONModel(statusF4Data);
        SRADE_context.getView().byId("status_cBoxId").setModel(jStatusModel);
        SRADE_context.getView().byId("status_cBoxId").bindAggregation("items", {
            path: "/navHelpDialog",
            template: selectTemplate
        });
        oBusyDialog.close();

    },
    //Card F4 function...
    onCardF4: function(oEvent) {
        oBusyDialog.open();
        var query = {
            mode: "CARD",
            schoolId: comGlob.schoolData.schoolId,
            key: ""
        }
        var cardF4Data;
        $.ajax({
            url: dataSource + "/f4HelpDataGet",
            data: query,
            type: 'POST',
            async: true,
            success: function(oData, oResponse) {
                cardF4Data = oData;
                var f4Model = new sap.ui.model.json.JSONModel(cardF4Data);
                var handleClose = function(oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    if (oSelectedItem) {
                        SRADE_context.getView().byId("cardNumber_txtId").setValue(oSelectedItem.getTitle());
                        SRADE_context.getView().byId("cardNumber_txtId").removeAllCustomData();
                        SRADE_context.getView().byId("cardNumber_txtId").addCustomData(
                            new sap.ui.core.CustomData({
                                key: "code",
                                value: oSelectedItem.getDescription()
                            }));
                    }
                    oEvent.getSource().getBinding("items").filter([]);
                };
                var _valueHelpSelectDialog = new sap.m.SelectDialog({
                        title: "Select Card",
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
                jQuery.sap.delayedCall(350, SRADE_context, function() {
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
    //Religion F4 Function
    onReligionF4: function(oEvent) {
        oBusyDialog.open();
        var query = {
            mode: "RELIGION",
            schoolId: comGlob.schoolData.schoolId,
            key: ""
        }
        var religionF4Data;
        $.ajax({
            url: dataSource + "/f4HelpDataGet",
            data: query,
            type: 'POST',
            async: true,
            success: function(oData, oResponse) {
                religionF4Data = oData;
                var f4Model = new sap.ui.model.json.JSONModel(religionF4Data);
                var handleClose = function(oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    if (oSelectedItem) {
                        SRADE_context.getView().byId("inp_religion").setValue(oSelectedItem.getTitle());
                        SRADE_context.getView().byId("inp_religion").removeAllCustomData();
                        SRADE_context.getView().byId("inp_religion").addCustomData(
                            new sap.ui.core.CustomData({
                                key: "code",
                                value: oSelectedItem.getDescription()
                            }));
                    }
                    oEvent.getSource().getBinding("items").filter([]);
                };
                var _valueHelpSelectDialog = new sap.m.SelectDialog({
                        title: "Select Religion",
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
                jQuery.sap.delayedCall(350, SRADE_context, function() {
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
    //Caste F4 Function
    onCasteF4: function(oEvent) {
        oBusyDialog.open();
        var query = {
            mode: "CASTE",
            schoolId: comGlob.schoolData.schoolId,
            key: ""
        }
        var casteF4Data;
        $.ajax({
            url: dataSource + "/f4HelpDataGet",
            data: query,
            type: 'POST',
            async: true,
            success: function(oData, oResponse) {
                casteF4Data = oData;
                var f4Model = new sap.ui.model.json.JSONModel(casteF4Data);
                var handleClose = function(oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    if (oSelectedItem) {
                        SRADE_context.getView().byId("inp_caste").setValue(oSelectedItem.getTitle());
                        SRADE_context.getView().byId("inp_caste").removeAllCustomData();
                        SRADE_context.getView().byId("inp_caste").addCustomData(
                            new sap.ui.core.CustomData({
                                key: "code",
                                value: oSelectedItem.getDescription()
                            }));
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
                jQuery.sap.delayedCall(350, SRADE_context, function() {
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
    // Sub Caste f4 Function
    onSubCasteF4: function(oEvent) {
        oBusyDialog.open();
        if (SRADE_context.getView().byId("inp_caste").getValue() == "") {
            sap.m.MessageBox.show("Select Caste", {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: "Error",
                styleClass: "sapUiSizeCompact",
                onClose: function(oEvent) {
                    oBusyDialog.close();
                }
            });
            return;
        }

        oBusyDialog.open();
        var casteKey = SRADE_context.getView().byId("inp_caste").getCustomData()[0].getValue();
        var query = {
            mode: "SUBCASTE",
            schoolId: comGlob.schoolData.schoolId,
            key: casteKey
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
                        SRADE_context.getView().byId("inp_subCaste").setValue(oSelectedItem.getTitle());
                        SRADE_context.getView().byId("inp_subCaste").removeAllCustomData();
                        SRADE_context.getView().byId("inp_subCaste").addCustomData(
                            new sap.ui.core.CustomData({
                                key: "code",
                                value: oSelectedItem.getDescription()
                            }));
                    }
                    oEvent.getSource().getBinding("items").filter([]);
                };
                var _valueHelpSelectDialog = new sap.m.SelectDialog({
                        title: "Select Sub-Caste",
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
                jQuery.sap.delayedCall(350, SRADE_context, function() {
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
    //Class F4 function...
    onClassF4: function(oEvent) {
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
                        SRADE_context.getView().byId("inp_class").setValue(oSelectedItem.getTitle());
                        SRADE_context.getView().byId("inp_class").removeAllCustomData();
                        SRADE_context.getView().byId("inp_class").addCustomData(
                            new sap.ui.core.CustomData({
                                key: "code",
                                value: oSelectedItem.getDescription()
                            }));
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
                jQuery.sap.delayedCall(350, SRADE_context, function() {
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

    onDivisionF4: function(oEvent) {
        oBusyDialog.open();
        if (SRADE_context.getView().byId("inp_class").getValue() == "") {
            sap.m.MessageBox.show("Select Class", {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: "Error",
                styleClass: "sapUiSizeCompact",
                onClose: function(oEvent) {
                    oBusyDialog.close();
                }
            });
            return;
        }

        oBusyDialog.open();
        var classKey = SRADE_context.getView().byId("inp_class").getCustomData()[0].getValue();
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
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    if (oSelectedItem) {
                        SRADE_context.getView().byId("inp_division").setValue(oSelectedItem.getTitle());
                        SRADE_context.getView().byId("inp_division").removeAllCustomData();
                        SRADE_context.getView().byId("inp_division").addCustomData(
                            new sap.ui.core.CustomData({
                                key: "code",
                                value: oSelectedItem.getDescription()
                            }));
                    }
                    oEvent.getSource().getBinding("items").filter([]);
                };
                var _valueHelpSelectDialog = new sap.m.SelectDialog({
                        title: "Select Division",
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
                jQuery.sap.delayedCall(350, SRADE_context, function() {
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
    //State F4 function...
    onStateF4: function(oEvent) {
        oBusyDialog.open();
        var query = {
            mode: "STATE",
            schoolId: comGlob.schoolData.schoolId,
            key: ""
        }
        var stateF4Data;
        $.ajax({
            url: dataSource + "/f4HelpDataGet",
            data: query,
            type: 'POST',
            async: true,
            success: function(oData, oResponse) {
                stateF4Data = oData;
                var f4Model = new sap.ui.model.json.JSONModel(stateF4Data);
                var handleClose = function(oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    if (oSelectedItem) {
                        SRADE_context.getView().byId("state_txtId").setValue(oSelectedItem.getTitle());
                        SRADE_context.getView().byId("state_txtId").removeAllCustomData();
                        SRADE_context.getView().byId("state_txtId").addCustomData(
                            new sap.ui.core.CustomData({
                                key: "code",
                                value: oSelectedItem.getDescription()
                            }));
                    }
                    oEvent.getSource().getBinding("items").filter([]);
                };
                var _valueHelpSelectDialog = new sap.m.SelectDialog({
                        title: "Select State",
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
                jQuery.sap.delayedCall(350, SRADE_context, function() {
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
    //City F4
    onCityF4: function(oEvent) {
        oBusyDialog.open();
        if (SRADE_context.getView().byId("state_txtId").getValue() == "") {
            sap.m.MessageBox.show("Select State", {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: "Error",
                styleClass: "sapUiSizeCompact",
                onClose: function(oEvent) {
                    oBusyDialog.close();
                }
            });
            return;
        }

        oBusyDialog.open();
        var stateKey = SRADE_context.getView().byId("state_txtId").getCustomData()[0].getValue();
        var query = {
            mode: "CITY",
            schoolId: comGlob.schoolData.schoolId,
            key: stateKey
        }
        var cityF4Data;
        $.ajax({
            url: dataSource + "/f4HelpDataGet",
            data: query,
            type: 'POST',
            async: true,
            success: function(oData, oResponse) {
                cityF4Data = oData;
                var f4Model = new sap.ui.model.json.JSONModel(cityF4Data);
                var handleClose = function(oEvent) {
                    var oSelectedItem = oEvent.getParameter("selectedItem");
                    if (oSelectedItem) {
                        SRADE_context.getView().byId("city_txtId").setValue(oSelectedItem.getTitle());
                        SRADE_context.getView().byId("city_txtId").removeAllCustomData();
                        SRADE_context.getView().byId("city_txtId").addCustomData(
                            new sap.ui.core.CustomData({
                                key: "code",
                                value: oSelectedItem.getDescription()
                            }));
                    }
                    oEvent.getSource().getBinding("items").filter([]);
                };
                var _valueHelpSelectDialog = new sap.m.SelectDialog({
                        title: "Select City",
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
                jQuery.sap.delayedCall(350, SRADE_context, function() {
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
    validateStudentFrm: function() {
        var msg = "";

        return msg;
    },
    getRequestBody: function(action) {
        var stdKey = "";

        if (action == "EDIT") {
            stdKey = curStdData.studentId;
        }
        var requestBody = {
            "Mode": action,
            "msg": "",
            "msgType": "",
            "navStudentDetail": [{
                "alternateEmailId": SRADE_context.getView().byId("alternateEmailId_txtId").getValue(),
                "alternateNumber": SRADE_context.getView().byId("alternateNumber_txtId").getValue(),
                "cardId": SRADE_context.getView().byId("cardNumber_txtId").getCustomData()[0].getValue(),
                "cardNumber": SRADE_context.getView().byId("cardNumber_txtId").getValue(),
                "cityKey": SRADE_context.getView().byId("city_txtId").getCustomData()[0].getValue(),
                "classId": SRADE_context.getView().byId("inp_class").getCustomData()[0].getValue(),
                "className": SRADE_context.getView().byId("inp_class").getValue(),
                "dateOfBirth": com.itec.sams.util.formatter.dateFormat(SRADE_context.getView().byId("dob_txtId").getDateValue()),
                "divisionId": SRADE_context.getView().byId("inp_division").getCustomData()[0].getValue(),
                "divisionName": SRADE_context.getView().byId("inp_division").getValue(),
                "religionId": SRADE_context.getView().byId("inp_religion").getCustomData()[0].getValue(),
                "religionName": SRADE_context.getView().byId("inp_religion").getValue(),
                "casteId": SRADE_context.getView().byId("inp_caste").getCustomData()[0].getValue(),
                "casteName": SRADE_context.getView().byId("inp_caste").getValue(),
                "subCasteId": SRADE_context.getView().byId("inp_subCaste").getCustomData()[0].getValue(),
                "subCasteName": SRADE_context.getView().byId("inp_subCaste").getValue(),
                "emailId": SRADE_context.getView().byId("email_txtId").getValue(),
                "fatherDOB": com.itec.sams.util.formatter.dateFormat(SRADE_context.getView().byId("fDOB_txtId").getDateValue()),
                "fatherFName": SRADE_context.getView().byId("fFName_txtId").getValue(),
                "fatherLName": SRADE_context.getView().byId("fLName_txtId").getValue(),
                "fatherOccupation": SRADE_context.getView().byId("fOccupation_txtId").getValue(),
                "firstName": SRADE_context.getView().byId("fName_txtId").getValue(),
                "gender": SRADE_context.getView().byId("sel_gender").getSelectedKey(),
                "grCode": SRADE_context.getView().byId("grNo_txtId").getValue(),
                "guardianFName": SRADE_context.getView().byId("gFName_txtId").getValue(),
                "guardianLName": SRADE_context.getView().byId("gLName_txtId").getValue(),
                "guardianOccupation": SRADE_context.getView().byId("gOccupation_txtId").getValue(),
                "guardianRelation": SRADE_context.getView().byId("gRelation_txtId").getValue(),
                "lastName": SRADE_context.getView().byId("lName_txtId").getValue(),
                "localityLandmark": SRADE_context.getView().byId("locality_txtId").getValue(),
                "mobileNumber": SRADE_context.getView().byId("mobileNumber_txtId").getValue(),
                "motherDOB": com.itec.sams.util.formatter.dateFormat(SRADE_context.getView().byId("mDOB_txtId").getDateValue()),
                "motherFName": SRADE_context.getView().byId("mFName_txtId").getValue(),
                "motherLName": SRADE_context.getView().byId("mLName_txtId").getValue(),
                "motherOccupation": SRADE_context.getView().byId("mOccupation_txtId").getValue(),
                "pinCode": SRADE_context.getView().byId("pinCode_txtId").getValue(),
                "rollNumber": SRADE_context.getView().byId("rollNumber_txtId").getValue(),
                "stateKey": SRADE_context.getView().byId("state_txtId").getCustomData()[0].getValue(),
                "statusKey": SRADE_context.getView().byId("status_cBoxId").getSelectedKey(),
                "statusText": "",
                "streetAddress": SRADE_context.getView().byId("streetAddress_txtId").getValue(),
                "studentId": stdKey,
                "imageURL": SRADE_context.uploadValue
            }],
            "schoolId": comGlob.schoolData.schoolId,
            "userId": comGlob.schoolData.userId
        }


        return requestBody;
    },
    onSave: function(evt) {

        if (SRADE_context.mainManditCheck().flag) {
            sap.m.MessageToast.show("Enter Mandatory Fields...");
            return
        }

        var msg = SRADE_context.validateStudentFrm();
        if (msg === "") {
            sap.m.MessageBox.confirm("Are you sure want to save?", {
                icon: sap.m.MessageBox.Icon.QUESION,
                title: "Confirmation",
                action: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                styleClass: "sapUiSizeCompact",
                onClose: function(action) {
                    if (action === "OK") {
                        if (SRADE_context.imageAdd) {
                            oBusyDialog.open();
                            var oFileUploader = SRADE_context.getView().byId("imageUplaod");
                            oFileUploader.removeAllHeaderParameters();
                            oFileUploader.addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
                                name: "slug",
                                value: SRADE_context.getView().byId("grNo_txtId").getValue() + "." + SRADE_context.extion
                            }));
                            oFileUploader.setSendXHR(true);
                            oFileUploader.upload();
                        } else {
                            SRADE_context.onSaveStudentDtl();
                        }
                    }

                }
            });
        } else {
            sap.m.MessageBox.show(msg, {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: "Error",
                styleClass: "sapUiSizeCompact",
            });
        }
    },
    onSaveStudentDtl: function() {
        oBusyDialog.open();
        if (action == "AD") {
            var query = SRADE_context.getRequestBody("ADD");
        } else {
            var query = SRADE_context.getRequestBody("EDIT");
        }
        $.ajax({
            url: dataSource + "/StudentDtlSet",
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
                            SRADE_context.resetStudentDlt();
                            var bReplace = jQuery.device.is.phone ? false : true;
                            SRADE_context.getRouter().navTo("StudentReg", bReplace);
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

    onCancel: function(evt) {

        if (action != "DI") {
            sap.m.MessageBox.confirm("Are you sure want to cancel?", {
                icon: sap.m.MessageBox.Icon.QUESION,
                title: "Confirmation",
                action: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                styleClass: "sapUiSizeCompact",
                onClose: function(action) {
                    if (action === "OK") {
                        SRADE_context.resetStudentDlt();
                        var bReplace = jQuery.device.is.phone ? false : true;
                        SRADE_context.getRouter().navTo("StudentReg", bReplace);
                    }

                }
            });
        } else {
            SRADE_context.resetStudentDlt();
            var bReplace = jQuery.device.is.phone ? false : true;
            SRADE_context.getRouter().navTo("StudentReg", bReplace);
        }
    },

    formSetup: function(action) {
        SRADE_context.resetFormLayout();

        switch (action) {
            case "AD":
                break;

            case "ED":
                SRADE_context.getView().byId("grNo_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_grNo").setRequired(false);
                break;

            case "DI":
                SRADE_context.getView().byId("fName_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_fName").setRequired(false);

                SRADE_context.getView().byId("dob_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_dob").setRequired(false);

                SRADE_context.getView().byId("grNo_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_grNo").setRequired(false);

                SRADE_context.getView().byId("rollNumber_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_rollNo").setRequired(false);

                SRADE_context.getView().byId("inp_class").setEnabled(false);
                SRADE_context.getView().byId("lb_class").setRequired(false);

                SRADE_context.getView().byId("inp_religion").setEnabled(false);
                SRADE_context.getView().byId("lb_religion").setRequired(false);

                SRADE_context.getView().byId("inp_caste").setEnabled(false);
                SRADE_context.getView().byId("lb_caste").setRequired(false);

                SRADE_context.getView().byId("inp_subCaste").setEnabled(false);
                SRADE_context.getView().byId("lb_subCaste").setRequired(false);

                SRADE_context.getView().byId("lName_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_lName").setRequired(false);

                SRADE_context.getView().byId("sel_gender").setEnabled(false);
                SRADE_context.getView().byId("lb_gender").setRequired(false);

                SRADE_context.getView().byId("cardNumber_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_cardNo").setRequired(false);

                SRADE_context.getView().byId("inp_division").setEnabled(false);
                SRADE_context.getView().byId("lb_division").setRequired(false);

                SRADE_context.getView().byId("fFName_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_ftFname").setRequired(false);

                SRADE_context.getView().byId("fLName_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_ftLname").setRequired(false);

                SRADE_context.getView().byId("fOccupation_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_ftOccup").setRequired(false);

                SRADE_context.getView().byId("fDOB_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_ftDob").setRequired(false);

                SRADE_context.getView().byId("mFName_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_mtFname").setRequired(false);

                SRADE_context.getView().byId("mLName_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_mtLname").setRequired(false);

                SRADE_context.getView().byId("mOccupation_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_mtOccup").setRequired(false);

                SRADE_context.getView().byId("mDOB_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_mtDob").setRequired(false);

                SRADE_context.getView().byId("gFName_txtId").setEnabled(false);

                SRADE_context.getView().byId("gLName_txtId").setEnabled(false);

                SRADE_context.getView().byId("gOccupation_txtId").setEnabled(false);

                SRADE_context.getView().byId("gRelation_txtId").setEnabled(false);

                SRADE_context.getView().byId("streetAddress_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_street").setRequired(false);

                SRADE_context.getView().byId("locality_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_lMark").setRequired(false);

                SRADE_context.getView().byId("mobileNumber_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_mobNo").setRequired(false);

                SRADE_context.getView().byId("email_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_email").setRequired(false);

                SRADE_context.getView().byId("status_cBoxId").setEnabled(false);
                SRADE_context.getView().byId("lb_status").setRequired(false);

                SRADE_context.getView().byId("state_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_state").setRequired(false);

                SRADE_context.getView().byId("city_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_city").setRequired(false);

                SRADE_context.getView().byId("pinCode_txtId").setEnabled(false);
                SRADE_context.getView().byId("lb_pinCode").setRequired(false);

                SRADE_context.getView().byId("alternateNumber_txtId").setEnabled(false);

                SRADE_context.getView().byId("alternateEmailId_txtId").setEnabled(false);

                SRADE_context.getView().byId("bt_stdSave").setVisible(false);
                //SRADE_context.getView().byId("bt_stdCancel").setVisible(false);

                SRADE_context.getView().byId("imageUplaod").setVisible(false);
                break;
        }
    },

    resetFormLayout: function() {
        SRADE_context.getView().byId("fName_txtId").setEnabled(true);
        SRADE_context.getView().byId("fName_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_fName").setRequired(true);

        SRADE_context.getView().byId("dob_txtId").setEnabled(true);
        SRADE_context.getView().byId("dob_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_dob").setRequired(true);

        SRADE_context.getView().byId("grNo_txtId").setEnabled(true);
        SRADE_context.getView().byId("grNo_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_grNo").setRequired(true);

        SRADE_context.getView().byId("rollNumber_txtId").setEnabled(true);
        SRADE_context.getView().byId("rollNumber_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_rollNo").setRequired(true);

        SRADE_context.getView().byId("inp_class").setEnabled(true);
        SRADE_context.getView().byId("inp_class").setValueState("None");
        SRADE_context.getView().byId("lb_class").setRequired(true);

        SRADE_context.getView().byId("inp_religion").setEnabled(true);
        SRADE_context.getView().byId("inp_religion").setValueState("None");
        SRADE_context.getView().byId("lb_religion").setRequired(true);

        SRADE_context.getView().byId("inp_caste").setEnabled(true);
        SRADE_context.getView().byId("inp_caste").setValueState("None");
        SRADE_context.getView().byId("lb_caste").setRequired(true);

        SRADE_context.getView().byId("inp_subCaste").setEnabled(true);
        SRADE_context.getView().byId("inp_subCaste").setValueState("None");
        SRADE_context.getView().byId("lb_subCaste").setRequired(true);


        SRADE_context.getView().byId("lName_txtId").setEnabled(true);
        SRADE_context.getView().byId("lName_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_lName").setRequired(true);

        SRADE_context.getView().byId("sel_gender").setEnabled(true);
        SRADE_context.getView().byId("sel_gender").setValueState("None");
        SRADE_context.getView().byId("lb_gender").setRequired(true);

        SRADE_context.getView().byId("cardNumber_txtId").setEnabled(true);
        SRADE_context.getView().byId("cardNumber_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_cardNo").setRequired(true);

        SRADE_context.getView().byId("inp_division").setEnabled(true);
        SRADE_context.getView().byId("inp_division").setValueState("None");
        SRADE_context.getView().byId("lb_division").setRequired(true);

        SRADE_context.getView().byId("fFName_txtId").setEnabled(true);
        SRADE_context.getView().byId("fFName_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_ftFname").setRequired(true);

        SRADE_context.getView().byId("fLName_txtId").setEnabled(true);
        SRADE_context.getView().byId("fLName_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_ftLname").setRequired(true);

        SRADE_context.getView().byId("fOccupation_txtId").setEnabled(true);
        SRADE_context.getView().byId("fOccupation_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_ftOccup").setRequired(true);

        SRADE_context.getView().byId("fDOB_txtId").setEnabled(true);
        SRADE_context.getView().byId("fDOB_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_ftDob").setRequired(true);

        SRADE_context.getView().byId("mFName_txtId").setEnabled(true);
        SRADE_context.getView().byId("mFName_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_mtFname").setRequired(true);

        SRADE_context.getView().byId("mLName_txtId").setEnabled(true);
        SRADE_context.getView().byId("mLName_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_mtLname").setRequired(true);

        SRADE_context.getView().byId("mOccupation_txtId").setEnabled(true);
        SRADE_context.getView().byId("mOccupation_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_mtOccup").setRequired(true);

        SRADE_context.getView().byId("mDOB_txtId").setEnabled(true);
        SRADE_context.getView().byId("mDOB_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_mtDob").setRequired(true);

        SRADE_context.getView().byId("gFName_txtId").setEnabled(true);
        //		SRADE_context.getView().byId("lb_grFname").setRequired(true);

        SRADE_context.getView().byId("gLName_txtId").setEnabled(true);
        //		SRADE_context.getView().byId("lb_grLname").setRequired(true);

        SRADE_context.getView().byId("gOccupation_txtId").setEnabled(true);
        //		SRADE_context.getView().byId("lb_grOccup").setRequired(true);

        SRADE_context.getView().byId("gRelation_txtId").setEnabled(true);
        //		SRADE_context.getView().byId("lb_grRelation").setRequired(true);

        SRADE_context.getView().byId("streetAddress_txtId").setEnabled(true);
        SRADE_context.getView().byId("streetAddress_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_street").setRequired(true);

        SRADE_context.getView().byId("locality_txtId").setEnabled(true);
        SRADE_context.getView().byId("locality_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_lMark").setRequired(true);

        SRADE_context.getView().byId("mobileNumber_txtId").setEnabled(true);
        SRADE_context.getView().byId("mobileNumber_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_mobNo").setRequired(true);

        SRADE_context.getView().byId("email_txtId").setEnabled(true);
        SRADE_context.getView().byId("email_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_email").setRequired(true);

        SRADE_context.getView().byId("status_cBoxId").setEnabled(true);
        SRADE_context.getView().byId("status_cBoxId").setValueState("None");
        SRADE_context.getView().byId("lb_status").setRequired(true);

        SRADE_context.getView().byId("state_txtId").setEnabled(true);
        SRADE_context.getView().byId("state_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_state").setRequired(true);

        SRADE_context.getView().byId("city_txtId").setEnabled(true);
        SRADE_context.getView().byId("city_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_city").setRequired(true);

        SRADE_context.getView().byId("pinCode_txtId").setEnabled(true);
        SRADE_context.getView().byId("pinCode_txtId").setValueState("None");
        SRADE_context.getView().byId("lb_pinCode").setRequired(true);

        SRADE_context.getView().byId("alternateNumber_txtId").setEnabled(true);
        //		SRADE_context.getView().byId("lb_alNumber").setRequired(true);

        SRADE_context.getView().byId("alternateEmailId_txtId").setEnabled(true);
        //		SRADE_context.getView().byId("lb_alEmail").setRequired(true);

        SRADE_context.getView().byId("bt_stdSave").setVisible(true);
        //SRADE_context.getView().byId("bt_stdCancel").setVisible(true);

        SRADE_context.getView().byId("imageUplaod").setVisible(true);
    },


    mainManditCheck: function() {
        var retObj = {
            msgArray: [],
            flag: false
        }

        if (SRADE_context.getView().byId("lb_fName").getRequired()) {
            if (SRADE_context.getView().byId("fName_txtId").getValue() == "") {
                SRADE_context.getView().byId("fName_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }

        if (SRADE_context.getView().byId("lb_dob").getRequired()) {
            if (SRADE_context.getView().byId("dob_txtId").getValue() == "") {
                SRADE_context.getView().byId("dob_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_grNo").getRequired()) {
            if (SRADE_context.getView().byId("grNo_txtId").getValue() == "") {
                SRADE_context.getView().byId("grNo_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_rollNo").getRequired()) {
            if (SRADE_context.getView().byId("rollNumber_txtId").getValue() == "") {
                SRADE_context.getView().byId("rollNumber_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_class").getRequired()) {
            if (SRADE_context.getView().byId("inp_class").getValue() == "") {
                SRADE_context.getView().byId("inp_class").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_religion").getRequired()) {
            if (SRADE_context.getView().byId("inp_religion").getValue() == "") {
                SRADE_context.getView().byId("inp_religion").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_caste").getRequired()) {
            if (SRADE_context.getView().byId("inp_caste").getValue() == "") {
                SRADE_context.getView().byId("inp_caste").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_subCaste").getRequired()) {
            if (SRADE_context.getView().byId("inp_subCaste").getValue() == "") {
                SRADE_context.getView().byId("inp_subCaste").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_lName").getRequired()) {
            if (SRADE_context.getView().byId("lName_txtId").getValue() == "") {
                SRADE_context.getView().byId("lName_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_gender").getRequired()) {
            if (SRADE_context.getView().byId("sel_gender").getSelectedKey() == "") {
                SRADE_context.getView().byId("sel_gender").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_cardNo").getRequired()) {
            if (SRADE_context.getView().byId("cardNumber_txtId").getValue() == "") {
                SRADE_context.getView().byId("cardNumber_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_division").getRequired()) {
            if (SRADE_context.getView().byId("inp_division").getValue() == "") {
                SRADE_context.getView().byId("inp_division").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_ftFname").getRequired()) {
            if (SRADE_context.getView().byId("fFName_txtId").getValue() == "") {
                SRADE_context.getView().byId("fFName_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_ftLname").getRequired()) {
            if (SRADE_context.getView().byId("fLName_txtId").getValue() == "") {
                SRADE_context.getView().byId("fLName_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_ftOccup").getRequired()) {
            if (SRADE_context.getView().byId("fOccupation_txtId").getValue() == "") {
                SRADE_context.getView().byId("fOccupation_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_ftDob").getRequired()) {
            if (SRADE_context.getView().byId("fDOB_txtId").getValue() == "") {
                SRADE_context.getView().byId("fDOB_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_mtFname").getRequired()) {
            if (SRADE_context.getView().byId("mFName_txtId").getValue() == "") {
                SRADE_context.getView().byId("mFName_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_mtLname").getRequired()) {
            if (SRADE_context.getView().byId("mLName_txtId").getValue() == "") {
                SRADE_context.getView().byId("mLName_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_mtOccup").getRequired()) {
            if (SRADE_context.getView().byId("mOccupation_txtId").getValue() == "") {
                SRADE_context.getView().byId("mOccupation_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_mtDob").getRequired()) {
            if (SRADE_context.getView().byId("mDOB_txtId").getValue() == "") {
                SRADE_context.getView().byId("mDOB_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_street").getRequired()) {
            if (SRADE_context.getView().byId("streetAddress_txtId").getValue() == "") {
                SRADE_context.getView().byId("streetAddress_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_lMark").getRequired()) {
            if (SRADE_context.getView().byId("locality_txtId").getValue() == "") {
                SRADE_context.getView().byId("locality_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_mobNo").getRequired()) {
            if (SRADE_context.getView().byId("mobileNumber_txtId").getValue() == "") {
                SRADE_context.getView().byId("mobileNumber_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_email").getRequired()) {
            if (SRADE_context.getView().byId("email_txtId").getValue() == "") {
                SRADE_context.getView().byId("email_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_status").getRequired()) {
            if (SRADE_context.getView().byId("status_cBoxId").getSelectedKey() == "") {
                SRADE_context.getView().byId("status_cBoxId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_state").getRequired()) {
            if (SRADE_context.getView().byId("state_txtId").getValue() == "") {
                SRADE_context.getView().byId("state_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_city").getRequired()) {
            if (SRADE_context.getView().byId("city_txtId").getValue() == "") {
                SRADE_context.getView().byId("city_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }
        if (SRADE_context.getView().byId("lb_pinCode").getRequired()) {
            if (SRADE_context.getView().byId("pinCode_txtId").getValue() == "") {
                SRADE_context.getView().byId("pinCode_txtId").setValueState("Error");
                retObj.flag = true;
            }
        }

        return retObj;
    },


    valAlfabet: function(oEvent) {
        var inputVal = oEvent.getSource().getValue();
        oEvent.getSource().setValueState("None");
        //        oEvent.getSource().attachBrowserEvent("keydown", function( oEvent) {
        //              if (oEvent.keyCode === 32) {
        //                    oEvent.stopPropagation();
        //                    oEvent.preventDefault();
        //              }
        //        });

        var isValid = false;
        var regex = /^[A-Za-z\-\.\s]+$/;
        isValid = regex.test(inputVal);
        if (isValid == false) {
            inputVal = inputVal.replace(/[^a-zA-Z\-\.\s]/g, "");
            oEvent.getSource().setValue(inputVal);
            return;
        } else {}
    },

    valNumber: function(oEvent) {
        var inputVal = oEvent.getSource().getValue();
        oEvent.getSource().setValueState("None");
        oEvent.getSource().attachBrowserEvent("keydown", function(oEvent) {
            if (oEvent.keyCode === 32) {
                oEvent.stopPropagation();
                oEvent.preventDefault();
            }
        });

        var isValid = false;
        var regex = /^[0-9]+$/;
        isValid = regex.test(inputVal);
        if (isValid == false) {
            inputVal = inputVal.replace(/[^0-9]/g, "");
            oEvent.getSource().setValue(inputVal);
            return;
        } else {}
    },

    valueStateNone: function(oEvent) {
        oEvent.getSource().setValueState("None");
    },

    _formBinding: function() {
        SRADE_context.getView().byId("alternateEmailId_txtId").setValue(curStdData.alternateEmailId);
        SRADE_context.getView().byId("alternateNumber_txtId").setValue(curStdData.alternateNumber);

        SRADE_context.getView().byId("cardNumber_txtId").setValue(curStdData.cardNumber);
        SRADE_context.getView().byId("cardNumber_txtId").removeAllCustomData();
        SRADE_context.getView().byId("cardNumber_txtId").addCustomData(
            new sap.ui.core.CustomData({
                key: "code",
                value: curStdData.cardId
            }));

        SRADE_context.getView().byId("city_txtId").setValue(curStdData.cityName);
        SRADE_context.getView().byId("city_txtId").removeAllCustomData();
        SRADE_context.getView().byId("city_txtId").addCustomData(
            new sap.ui.core.CustomData({
                key: "code",
                value: curStdData.cityKey
            }));

        SRADE_context.getView().byId("inp_religion").setValue(curStdData.religionName);
        SRADE_context.getView().byId("inp_religion").removeAllCustomData();
        SRADE_context.getView().byId("inp_religion").addCustomData(
            new sap.ui.core.CustomData({
                key: "code",
                value: curStdData.religionId
            }));

        SRADE_context.getView().byId("inp_caste").setValue(curStdData.casteName);
        SRADE_context.getView().byId("inp_caste").removeAllCustomData();
        SRADE_context.getView().byId("inp_caste").addCustomData(
            new sap.ui.core.CustomData({
                key: "code",
                value: curStdData.casteId
            }));

        SRADE_context.getView().byId("inp_subCaste").setValue(curStdData.subCasteName);
        SRADE_context.getView().byId("inp_subCaste").removeAllCustomData();
        SRADE_context.getView().byId("inp_subCaste").addCustomData(
            new sap.ui.core.CustomData({
                key: "code",
                value: curStdData.subCasteId
            }));

        SRADE_context.getView().byId("inp_class").setValue(curStdData.className);
        SRADE_context.getView().byId("inp_class").removeAllCustomData();
        SRADE_context.getView().byId("inp_class").addCustomData(
            new sap.ui.core.CustomData({
                key: "code",
                value: curStdData.classId
            }));

        SRADE_context.getView().byId("dob_txtId").setValue(com.itec.sams.util.formatter.date(curStdData.dateOfBirth));

        SRADE_context.getView().byId("inp_division").setValue(curStdData.divisionName);
        SRADE_context.getView().byId("inp_division").removeAllCustomData();
        SRADE_context.getView().byId("inp_division").addCustomData(
            new sap.ui.core.CustomData({
                key: "code",
                value: curStdData.divisionId
            }));

        SRADE_context.getView().byId("email_txtId").setValue(curStdData.emailId);
        SRADE_context.getView().byId("fDOB_txtId").setValue(com.itec.sams.util.formatter.date(curStdData.fatherDOB));
        SRADE_context.getView().byId("fFName_txtId").setValue(curStdData.fatherFName);
        SRADE_context.getView().byId("fLName_txtId").setValue(curStdData.fatherLName);
        SRADE_context.getView().byId("fOccupation_txtId").setValue(curStdData.fatherOccupation);
        SRADE_context.getView().byId("fName_txtId").setValue(curStdData.firstName);
        SRADE_context.getView().byId("sel_gender").setSelectedKey(curStdData.gender);
        SRADE_context.getView().byId("grNo_txtId").setValue(curStdData.grCode);
        SRADE_context.getView().byId("gFName_txtId").setValue(curStdData.guardianFName);
        SRADE_context.getView().byId("gLName_txtId").setValue(curStdData.guardianLName);
        SRADE_context.getView().byId("gOccupation_txtId").setValue(curStdData.guardianOccupation);
        SRADE_context.getView().byId("gRelation_txtId").setValue(curStdData.guardianRelation);
        SRADE_context.getView().byId("lName_txtId").setValue(curStdData.lastName);
        SRADE_context.getView().byId("locality_txtId").setValue(curStdData.localityLandmark);
        SRADE_context.getView().byId("mobileNumber_txtId").setValue(curStdData.mobileNumber);
        SRADE_context.getView().byId("mDOB_txtId").setValue(com.itec.sams.util.formatter.date(curStdData.motherDOB));
        SRADE_context.getView().byId("mFName_txtId").setValue(curStdData.motherFName);
        SRADE_context.getView().byId("mLName_txtId").setValue(curStdData.motherLName);
        SRADE_context.getView().byId("mOccupation_txtId").setValue(curStdData.motherOccupation);
        SRADE_context.getView().byId("pinCode_txtId").setValue(curStdData.pinCode);
        SRADE_context.getView().byId("rollNumber_txtId").setValue(curStdData.rollNumber);

        SRADE_context.getView().byId("state_txtId").setValue(curStdData.stateName);
        SRADE_context.getView().byId("state_txtId").removeAllCustomData();
        SRADE_context.getView().byId("state_txtId").addCustomData(
            new sap.ui.core.CustomData({
                key: "code",
                value: curStdData.stateKey
            }));

        SRADE_context.getView().byId("status_cBoxId").setSelectedKey(curStdData.statusKey);
        SRADE_context.getView().byId("streetAddress_txtId").setValue(curStdData.streetAddress);

        if (curStdData.imageURL == "") {
            SRADE_context.getView().byId("img_student").setSrc("../img/stdBlank.jpg");
        } else {
            SRADE_context.getView().byId("img_student").setSrc(imageSource + curStdData.imageURL);
        }
        SRADE_context.uploadValue = curStdData.imageURL;

        //		studentId
    },

    valEmailChar: function(oEvent) {
        oEvent.getSource().setValueState("None");
        var inputID = oEvent.getSource().getValue();
        var isValid = false;
        var regex = /^[0-9A-Za-z@._]+$/;
        isValid = regex.test(inputID);
        if (isValid == false) {
            // oEvent.getSource().setValueState("Error");
            inputID = inputID.replace(/[^a-zA-Z0-9@._]/g, "");
            oEvent.getSource().setValue(inputID);
            return;
        } else {
            // oEvent.getSource().setValueState("None");
        }
    },

    valEmail: function(oEvent) {
        var emailvalue = oEvent.getSource().getValue();
        var isValid = false;
        var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        isValid = regex.test(emailvalue);
        var atpos = emailvalue.indexOf("@");
        var dotpos = emailvalue.lastIndexOf(".");
        if (isValid == false) {
            var msg = "Invalid Email";
            sap.m.MessageBox.show(msg, {
                title: "Error",
                icon: sap.m.MessageBox.Icon.ERROR,
                styleClass: "sapUiSizeCompact",
                onClose: function(evt) {
                    oBusyDialog.close();
                }
            });
            return;
        } else {
            if (atpos < 1 || dotpos < atpos + 2) {
                var msg = "Invalid Email";
                sap.m.MessageBox.show(msg, {
                    title: "Error",
                    icon: sap.m.MessageBox.Icon.ERROR,
                    styleClass: "sapUiSizeCompact",
                    onClose: function(evt) {
                        oBusyDialog.close();
                    }
                });
                return;
            } else {
                oEvent.getSource().setValueState("None");
            }
        }
    },

    onImageUploadChange: function(oEvent) {
        var localFile = oEvent.getParameter("files")[0];
        SRADE_context.extion = localFile.name.split(".")[1];
        SRADE_context.imageAdd = true;
        var FR = new FileReader();
        FR.onload = function(e) {

            //    	  var MAX_WIDTH = 400;
            //          var MAX_HEIGHT = 300;
            //          var tempW = tempImg.width;
            //          var tempH = tempImg.height;
            //          if (tempW > tempH) {
            //              if (tempW > MAX_WIDTH) {
            //                 tempH *= MAX_WIDTH / tempW;
            //                 tempW = MAX_WIDTH;
            //              }
            //          } else {
            //              if (tempH > MAX_HEIGHT) {
            //                 tempW *= MAX_HEIGHT / tempH;
            //                 tempH = MAX_HEIGHT;
            //              }
            //          }
            //  
            //          var canvas = document.createElement('canvas');
            //          canvas.width = tempW;
            //          canvas.height = tempH;
            //          var ctx = canvas.getContext("2d");
            //          ctx.drawImage(this, 0, 0, tempW, tempH);
            //          var dataURL = canvas.toDataURL("image/jpeg");
            //          S1_context.getView().byId("imgId").setSrc(dataURL);

            SRADE_context.getView().byId("img_student").setSrc(e.target.result);
        };
        FR.readAsDataURL(localFile);
    },

    onImageUpload: function(oEvent) {

    },

    onUploadStart: function(oEvent) {

    },

    onTypeMissmatch: function(oEvent) {
        sap.m.MessageBox.show("Invalid file type.", {
            title: "Error",
            icon: sap.m.MessageBox.Icon.ERROR,
            styleClass: "sapUiSizeCompact",
            onClose: function(evt) {
                oBusyDialog.close();
            }
        });
    },

    onFileSizeExceed: function(oEvent) {
        sap.m.MessageBox.show("File size exceed 2 MB.", {
            title: "Error",
            icon: sap.m.MessageBox.Icon.ERROR,
            styleClass: "sapUiSizeCompact",
            onClose: function(evt) {
                oBusyDialog.close();
            }
        });
    },

    handleImageUploadComplete: function(oEvent) {
        SRADE_context.uploadValue = $.parseJSON(oEvent.getParameter("responseRaw"))[0].Value;
        SRADE_context.onSaveStudentDtl();
    }
});