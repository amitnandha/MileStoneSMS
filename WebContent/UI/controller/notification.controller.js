jQuery.sap.require("sap.m.MessageBox");
sap.ui.controller("com.itec.sams.controller.notification", {
    onInit: function() {
        NFT_context = this;
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
        if (sName !== "notification") {
            return;
        } else {
            oPageTitle.setText("Notification");
            NFT_context.initialLoad();

        }

    },

    initialLoad: function() {
        NFT_context.getView().byId("txa_message1").setValue("");
        NFT_context.getView().byId("txa_message2").setValue("");
        NFT_context.getView().byId("txa_message3").setValue("");

        NFT_context.getView().byId("tab_nftClassDiv").removeAllItems();
        NFT_context.getView().byId("tab_nftStudent").removeAllItems();
    },

    getRouter: function() {
        return sap.ui.core.UIComponent.getRouterFor(this);
    },

    onNtfClaDiv: function(oEvent) {
        //		if(oEvent.getParameter("id") == "inp_maClass"){
        //			NFT_context._isStudent = true;
        //		}else{
        //			NFT_context._isStudent = false;
        //		}
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
                        if (NFT_context._isStudent) {
                            sap.ui.getCore().byId("inp_maClass").setValue(oSelectedItem.getTitle());
                            sap.ui.getCore().byId("inp_maClass").removeAllCustomData();
                            sap.ui.getCore().byId("inp_maClass").addCustomData(
                                new sap.ui.core.CustomData({
                                    key: "code",
                                    value: oSelectedItem.getDescription()
                                }));
                        }
                        NFT_context._curClassId = oSelectedItem.getDescription();
                        NFT_context._curClassName = oSelectedItem.getTitle();
                        NFT_context.onDivision(NFT_context._curClassId);

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
                jQuery.sap.delayedCall(350, NFT_context, function() {
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

    onDivision: function(classId) {
        oBusyDialog.open();
        var query = {
            mode: "DIVISION",
            schoolId: comGlob.schoolData.schoolId,
            key: classId
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
                    //						if(NFT_context._isStudent){
                    //							var oSelectedItem = oEvent.getParameter("selectedItem");
                    //							var querry = {
                    //									schoolId : comGlob.schoolData.schoolId,
                    //									userId : comGlob.schoolData.userId,
                    //									divisionId : oSelectedItem.getDescription(),
                    //							};
                    //							
                    //							NFT_context._getStudent(querry);
                    //						}else{
                    if (oEvent.getParameter("selectedContexts").length != 0) {
                        var cTextData = oEvent.getParameter("selectedContexts");
                        var oTable = NFT_context.getView().byId("tab_nftClassDiv")
                        for (var i = 0; i < cTextData.length; i++) {
                            var tmpl = new sap.m.ColumnListItem({
                                cells: [
                                    new sap.m.Text({
                                        text: NFT_context._curClassName,
                                        customData: new sap.ui.core.CustomData({
                                            key: "code",
                                            value: NFT_context._curClassId
                                        })
                                    }),
                                    new sap.m.Text({
                                        text: cTextData[i].getObject().value,
                                        customData: new sap.ui.core.CustomData({
                                            key: "code",
                                            value: cTextData[i].getObject().key
                                        })
                                    }),
                                ]
                            });

                            oTable.addItem(tmpl);

                        }
                    }
                    //						}

                    oEvent.getSource().getBinding("items").filter([]);
                };
                var _valueHelpSelectDialog = new sap.m.SelectDialog({
                        title: "Select Division",
                        multiSelect: true,
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
                jQuery.sap.delayedCall(350, NFT_context, function() {
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

    onAddStudent: function() {
        NFT_context._nftStudent = sap.ui.xmlfragment("com.itec.sams.fragment.nftStudent", NFT_context);
        NFT_context.getView().addDependent(NFT_context._nftStudent);
        NFT_context._nftStudent.open();
    },

    onNftStdCancel: function(oEvent) {
        NFT_context._nftStudent.close();
        NFT_context._nftStudent.destroy();
        NFT_context._nftStudent = null;
    },

    onAddNftFrg: function(oEvent) {

        var oListItem = sap.ui.getCore().byId("lst_nftStd").getSelectedItems();
        var className = sap.ui.getCore().byId("inp_nftClass").getValue();
        var classId = sap.ui.getCore().byId("inp_nftClass").getCustomData()[0].getValue();
        var divName = sap.ui.getCore().byId("inp_nftDiv").getValue();
        var divId = sap.ui.getCore().byId("inp_nftDiv").getCustomData()[0].getValue();
        var oTable = NFT_context.getView().byId("tab_nftStudent");

        for (var i = 0; i < oListItem.length; i++) {
            var tmpl = new sap.m.ColumnListItem({
                cells: [
                    new sap.m.Text({
                        text: className,
                        customData: new sap.ui.core.CustomData({
                            key: "code",
                            value: classId
                        })
                    }),
                    new sap.m.Text({
                        text: divName,
                        customData: new sap.ui.core.CustomData({
                            key: "code",
                            value: divId
                        })
                    }),
                    new sap.m.Text({
                        text: oListItem[i].getBindingContext().getObject().studentName,
                        customData: new sap.ui.core.CustomData({
                            key: "code",
                            value: oListItem[i].getBindingContext().getObject().studentId
                        })
                    }),
                    new sap.m.Text({
                        text: oListItem[i].getBindingContext().getObject().primaryNumber,
                    }),
                    new sap.m.Text({
                        text: oListItem[i].getBindingContext().getObject().secondaryNumber,
                    }),
                ]
            });

            oTable.addItem(tmpl);
        }

        NFT_context._nftStudent.close();
        NFT_context._nftStudent.destroy();
        NFT_context._nftStudent = null;
    },

    onPublish: function(oEvent) {
        var selKey = NFT_context.getView().byId("itab_notification").getSelectedKey();
        var payload = {
            schoolId: comGlob.schoolData.schoolId,
            userId: comGlob.schoolData.userId,
            messageContent: "",
            Mode: "",
            navClassDivisionNotification: null,
            navStudentNotification: null
        }
        if (selKey == "claDiv") {
            if (NFT_context.getView().byId("txa_message1").getValue() == "") {
                NFT_context.getView().byId("txa_message1").setValueState("Error");
                sap.m.MessageToast.show("Enter Mandatory Fields...");
                return;
            }

            if (NFT_context.getView().byId("tab_nftClassDiv").getItems().length == 0) {
                sap.m.MessageToast.show("Add Class and Division.");
                return;
            }

            payload.Mode = "CLASSDIVISION";
            payload.messageContent = NFT_context.getView().byId("txa_message1").getValue();
            var oItems = NFT_context.getView().byId("tab_nftClassDiv").getItems();
            payload.navClassDivisionNotification = [];
            for (var t = 0; t < oItems.length; t++) {
                payload.navClassDivisionNotification.push({
                    classId: oItems[t].getCells()[0].getCustomData()[0].getValue(),
                    divisionId: oItems[t].getCells()[1].getCustomData()[0].getValue(),
                })
            }
        }

        if (selKey == "student") {
            if (NFT_context.getView().byId("txa_message2").getValue() == "") {
                NFT_context.getView().byId("txa_message2").setValueState("Error");
                sap.m.MessageToast.show("Enter Mandatory Fields...");
                return;
            }

            if (NFT_context.getView().byId("tab_nftStudent").getItems().length == 0) {
                sap.m.MessageToast.show("Add Student(s).");
                return;
            }
            payload.Mode = "STUDENT";
            payload.messageContent = NFT_context.getView().byId("txa_message2").getValue();
            var oItems = NFT_context.getView().byId("tab_nftStudent").getItems();
            payload.navStudentNotification = [];
            for (var t = 0; t < oItems.length; t++) {
                payload.navStudentNotification.push({
                    studentId: oItems[t].getCells()[2].getCustomData()[0].getValue(),
                    studentName: oItems[t].getCells()[2].getText(),
                    primaryNumber: oItems[t].getCells()[3].getText(),
                    secondaryNumber: oItems[t].getCells()[4].getText(),
                })
            }
        }

        if (selKey == "school") {
            if (NFT_context.getView().byId("txa_message3").getValue() == "") {
                NFT_context.getView().byId("txa_message3").setValueState("Error");
                sap.m.MessageToast.show("Enter Mandatory Fields...");
                return;
            }
            payload.Mode = "ALL";
            payload.messageContent = NFT_context.getView().byId("txa_message3").getValue();
        }

        NFT_context._postAjax(payload);
    },

    onNoneValueState: function(oEvent) {
        oEvent.getSource().setValueState("None");
    },

    _postAjax: function(payload) {
        oBusyDialog.open();
        $.ajax({
            url: dataSource + "/GroupNotificationSet",
            data: payload,
            type: 'POST',
            async: true,
            success: function(oData, oResponse) {
                if (oData.msgType === "S") {
                    sap.m.MessageBox.show(oData.msg, {
                        icon: sap.m.MessageBox.Icon.SUCCESS,
                        title: "Success",
                        styleClass: "sapUiSizeCompact",
                        onClose: function(action) {
                            NFT_context.initialLoad();
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
                sap.m.MessageBox.show(msg, {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: "Error",
                    styleClass: "sapUiSizeCompact",
                    onClose: function(action) {
                        oBusyDialog.close();
                    }
                });
                oBusyDialog.close();
            }
        });
    },

    _getStudent: function(payload) {
        oBusyDialog.open();
        $.ajax({
            url: dataSource + "/StudentDetail4NotificationGet",
            data: payload,
            type: 'POST',
            async: true,
            success: function(oData, oResponse) {
                if (oData.msgType === "S") {
                    var oList = sap.ui.getCore().byId("lst_nftStd");
                    var oTblModel = new sap.ui.model.json.JSONModel(oData);
                    oList.setModel(oTblModel);
                    oBusyDialog.close();

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
                sap.m.MessageBox.show(msg, {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: "Error",
                    styleClass: "sapUiSizeCompact",
                    onClose: function(action) {
                        oBusyDialog.close();
                    }
                });
                oBusyDialog.close();
            }
        });
    },

    onNftClDivTabDelete: function(oEvent) {
        oEvent.getSource().removeItem(oEvent.getParameter("listItem"));
    },

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
                        sap.ui.getCore().byId("inp_nftClass").setValue(oSelectedItem.getTitle());
                        sap.ui.getCore().byId("inp_nftClass").removeAllCustomData();
                        sap.ui.getCore().byId("inp_nftClass").addCustomData(
                            new sap.ui.core.CustomData({
                                key: "code",
                                value: oSelectedItem.getDescription()
                            }));
                        sap.ui.getCore().byId("inp_nftDiv").fireValueHelpRequest();
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
                jQuery.sap.delayedCall(350, NFT_context, function() {
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
        if (sap.ui.getCore().byId("inp_nftClass").getValue() == "") {
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
        var classKey = sap.ui.getCore().byId("inp_nftClass").getCustomData()[0].getValue();
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
                        sap.ui.getCore().byId("inp_nftDiv").setValue(oSelectedItem.getTitle());
                        sap.ui.getCore().byId("inp_nftDiv").removeAllCustomData();
                        sap.ui.getCore().byId("inp_nftDiv").addCustomData(
                            new sap.ui.core.CustomData({
                                key: "code",
                                value: oSelectedItem.getDescription()
                            }));

                        var querry = {
                            schoolId: comGlob.schoolData.schoolId,
                            userId: comGlob.schoolData.userId,
                            divisionId: oSelectedItem.getDescription(),
                        };

                        NFT_context._getStudent(querry);
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
                jQuery.sap.delayedCall(350, NFT_context, function() {
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

    onSelect: function(oEvent) {
        if (oEvent.getSource().getSelectedItems().length == 0) {
            sap.ui.getCore().byId("frgBt_addStd").setEnabled(false);
        } else {
            sap.ui.getCore().byId("frgBt_addStd").setEnabled(true);
        }
    },


})