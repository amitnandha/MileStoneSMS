jQuery.sap.require("com.itec.sams.util.formatter");
var MA_context, curObject;
// .preStd .absStd .pndStd
sap.ui.controller("com.itec.sams.controller.manualAttendance", {
    onInit: function() {
        MA_context = this;
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
        this.initialLoad();
    },
    onRouteMatched: function(oEvent) {
        var sName = oEvent.getParameter("name");
        if (sName !== "ManualAttendance") {
            return;
        } else {
            oPageTitle.setText("Student Attendance");
            MA_context.getView().byId("inp_maClass").fireValueHelpRequest();
        }
        //		MA_context.bindAtdTable();
    },

    bindAtdTable: function(classId, divisionId) {
        var attData;

        oBusyDialog.open();
        var query = {
            "schoolId": comGlob.schoolData.schoolId,
            "classId": classId,
            "divisionId": divisionId,
            "userId": comGlob.schoolData.userId
        };
        $.ajax({
            url: dataSource + "/StudentAttendanceGet",
            data: query,
            type: 'POST',
            async: true,
            success: function(oData, oResponse) {
                oBusyDialog.close();
                if (oData.msgType == "S") {
                    attData = oData;
                    var oTable = MA_context.getView().byId("tab_manAttd");
                    MA_context.getView().byId("tt_hdrTtl").setText("Total Student: " + attData.totalStudent);
                    var jModel = new sap.ui.model.json.JSONModel(attData);
                    oTable.setModel(jModel);
                    var oTemplate = MA_context.maTableTemplate();
                    oTable.bindAggregation("items", {
                        path: "/navStudentAttendanceDtl",
                        template: oTemplate
                    });
                    MA_context.updateTabHeader();
                } else {
                    sap.m.MessageBox.show(oData.msg, {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: "Error",
                        styleClass: "sapUiSizeCompact",
                        onClose: function(oEvent) {
                            oBusyDialog.close();
                        }
                    });
                }
            },
            error: function(oError) {
                var msg = oError.responseText.split("Message")[1];
            }
        });

    },

    maTableTemplate: function() {
        var template = new sap.m.ColumnListItem({
            cells: [
                new sap.m.Text({
                    text: "{rollNumber}",
                }),
                new sap.m.Text({
                    text: "{cardNumber}",
                }),
                new sap.m.Text({
                    text: "{firstname}",
                }),
                new sap.m.Text({
                    text: "{lastName}",
                }),
                new sap.m.Text({
                    text: "{path:'inTime',formatter:'com.itec.sams.util.formatter.time'}",
                }),
                //                     new sap.m.Switch({
                //                    	 customTextOn : "Yes",
                //                    	 customTextOff : "No",
                //                    	 state : "{path:'isVerify',formatter:'com.itec.sams.util.formatter.getSwitchState'}",
                //                    	 change : MA_context.switchChange
                //                     }),
                //                     new sap.m.RadioButtonGroup({
                //                    	 selectedIndex : "{path:'isVerify',formatter:'com.itec.sams.util.formatter.getSwitchState'}",
                //                    	 select : MA_context.switchChange,
                //                    	 buttons : [
                //                    	            new sap.m.RadioButton({
                //                    	            	text : "Present"
                //                    	            }),
                //                    	            new sap.m.RadioButton({
                //                    	            	text : "Absent"
                //                    	            })
                //                    	            ]
                //                     }),
                new sap.m.SegmentedButton({
                    select: MA_context.switchChange,
                    selectedKey: "{path:'isVerify',formatter:'com.itec.sams.util.formatter.getSwitchState'}",
                    items: [
                        new sap.m.SegmentedButtonItem({
                            text: "Present",
                            key: "P"
                        }),
                        new sap.m.SegmentedButtonItem({
                            text: "Absent",
                            key: "A"
                        }),
                        //                    	          new sap.m.SegmentedButtonItem({
                        //                    	        	  text : "Absent",
                        //                    	        	  key : "V",
                        //                    	        	  visible : false
                        //                    	          }),
                    ]
                })
            ]
        });

        return template;
    },

    switchChange: function(oEvent) {
        if (oEvent.getParameter("key") == "P") {
            oEvent.getSource().getParent().getBindingContext().getObject().isVerify = "True";
        } else {
            oEvent.getSource().getParent().getBindingContext().getObject().isVerify = "False";
        }
        //		curObject = oEvent.getSource().getParent();
        oEvent.getSource().getParent().getBindingContext().getObject().isManual = 1
        MA_context.updateTabHeader();
        //		MA_context._reason = sap.ui.xmlfragment("com.itec.sams.fragment.maReason",MA_context);
        //		MA_context.getView().addDependent(MA_context._reason);
        //		MA_context._reason.open();


    },

    onSave: function(oEvent) {
        MA_context._reason = sap.ui.xmlfragment("com.itec.sams.fragment.manualA", MA_context);
        MA_context.getView().addDependent(MA_context._reason);
        MA_context._reason.open();
        MA_context.setFragTableHeight();

        var template = new sap.m.ColumnListItem({
            cells: [
                new sap.m.Text({
                    text: "{rollNumber}",
                }),
                new sap.m.Text({
                    text: "{className}",
                }),
                new sap.m.Text({
                    text: "{firstname} {lastName}",
                }),
                new sap.m.Text({
                    text: "{path:'isVerify',formatter:'com.itec.sams.util.formatter.getPreAbs'}",
                }),
                new sap.m.Select({
                    selectedKey: "{reasonKey}",
                    change: MA_context.onFragTabRes
                }),
                new sap.m.Input({
                    value: "{comment}",
                    //                    	 change : MA_context.onFragTabComment
                })
            ]
        });
        //		template.getCells()[4].setModel(MA_context.reaModel);
        for (var t = 0; t < MA_context.reaModel.getData().navHelpDialog.length; t++) {
            var selTmp = new sap.ui.core.Item({
                key: MA_context.reaModel.getData().navHelpDialog[t].key,
                text: MA_context.reaModel.getData().navHelpDialog[t].value
            });
            template.getCells()[4].addItem(selTmp);
        }

        //		template.getCells()[4].bindAggregation("items", {
        //            path : "/navHelpDialog",
        //            template : selTmp,
        //            templateShareable : true
        //      });
        //		core:Item key="{ProductId}" text="{Name}" 
        var oTable = sap.ui.getCore().byId("tab_ManlAttd");
        var data = MA_context.getView().byId("tab_manAttd").getModel().getData().navStudentAttendanceDtl;
        var jModel = new sap.ui.model.json.JSONModel({
            results: data
        });
        var filter = new sap.ui.model.Filter("isManual", "EQ", 1)
        oTable.setModel(jModel);
        MA_context._reason.setModel(MA_context.reaModel);
        oTable.bindAggregation("items", {
            path: "/results",
            template: template,
            filters: [filter]
        });
    },

    onReasonOk: function(oEvent) {
        curObject.getBindingContext().getObject().isManual = 1;
        curObject.getBindingContext().getObject().reasonKey = sap.ui.getCore().byId("sel_reason").getSelectedKey();
        curObject.getBindingContext().getObject().reasonText = sap.ui.getCore().byId("sel_reason").getSelectedItem().getText();
        curObject.getBindingContext().getObject().comment = sap.ui.getCore().byId("txar_coments").getValue();

        MA_context.updateTabHeader();
        MA_context._reason.close();
        MA_context._reason.destroy();
        MA_context._reason = null;
    },

    getRouter: function() {
        return sap.ui.core.UIComponent.getRouterFor(this);
    },

    initialLoad: function() {
        var query = {
            mode: "ATTENDANCE_STATUS",
            schoolId: comGlob.schoolData.schoolId,
            key: ""
        }
        $.ajax({
            url: dataSource + "/f4HelpDataGet",
            data: query,
            type: 'POST',
            async: true,
            success: function(oData, oResponse) {
                MA_context.reaModel = new sap.ui.model.json.JSONModel(oData);
                //					var selectTemplate = new sap.ui.core.Item({
                //						key : "{key}",
                //						text : "{value}",
                //					});
                //					sap.ui.getCore().byId("sel_reason").setModel(jModel);
                //					sap.ui.getCore().byId("sel_reason").bindAggregation("items", {
                //			            path : "/navHelpDialog",
                //			            template : selectTemplate
                //					});
                oBusyDialog.close();
            },
            error: function(oError) {
                oBusyDialog.close();
                var msg = oError.responseText.split("Message")[1];
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
                        MA_context.getView().byId("inp_maClass").setValue(oSelectedItem.getTitle());
                        MA_context.getView().byId("inp_maClass").removeAllCustomData();
                        MA_context.getView().byId("inp_maClass").addCustomData(
                            new sap.ui.core.CustomData({
                                key: "code",
                                value: oSelectedItem.getDescription()
                            }));
                        MA_context.getView().byId("inp_maDiv").fireValueHelpRequest();
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
                jQuery.sap.delayedCall(350, MA_context, function() {
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
        if (MA_context.getView().byId("inp_maClass").getValue() == "") {
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
        var classKey = MA_context.getView().byId("inp_maClass").getCustomData()[0].getValue();
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
                        MA_context.getView().byId("inp_maDiv").setValue(oSelectedItem.getTitle());
                        MA_context.getView().byId("inp_maDiv").removeAllCustomData();
                        MA_context.getView().byId("inp_maDiv").addCustomData(
                            new sap.ui.core.CustomData({
                                key: "code",
                                value: oSelectedItem.getDescription()
                            }));

                        MA_context.bindAtdTable(MA_context.getView().byId("inp_maClass").getCustomData()[0].getValue(), oSelectedItem.getDescription());
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
                jQuery.sap.delayedCall(350, MA_context, function() {
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

    onSubmit: function(oEvent) {
        oBusyDialog.open();
        var flag = false;
        for (var i = 0; i < sap.ui.getCore().byId("tab_ManlAttd").getItems().length; i++) {
            if (sap.ui.getCore().byId("tab_ManlAttd").getItems()[i].getCells()[4].getSelectedKey() == "") {
                flag = true;
            }
        }

        if (flag) {
            sap.m.MessageBox.show("Provide reason for all items.", {
                icon: sap.m.MessageBox.Icon.ERROR,
                title: "Error",
                styleClass: "sapUiSizeCompact",
                onClose: function(oEvent) {
                    oBusyDialog.close();
                }
            });
            return;
        }
        //sap.ui.getCore().byId("tab_ManlAttd").getModel().getData()
        var query = {
            schoolId: comGlob.schoolData.schoolId,
            //				totalStudent : "31",
            userId: comGlob.schoolData.userId,
            navStudentAttendanceDtl: sap.ui.getCore().byId("tab_ManlAttd").getModel().getData().results
        }
        $.ajax({
            url: dataSource + "/StudentAttendanceSet",
            data: query,
            type: 'POST',
            async: true,
            success: function(oData, oResponse) {
                oBusyDialog.close();
                if (oData.msgType == "S") {
                    sap.m.MessageBox.show(oData.msg, {
                        icon: sap.m.MessageBox.Icon.SUCCESS,
                        title: "Success",
                        styleClass: "sapUiSizeCompact",
                        onClose: function(oEvent) {
                            oBusyDialog.open();
                            MA_context.bindAtdTable(MA_context.getView().byId("inp_maClass").getCustomData()[0].getValue(), MA_context.getView().byId("inp_maDiv").getCustomData()[0].getValue());
                            oBusyDialog.close();
                        }
                    });
                } else {
                    sap.m.MessageBox.show(oData.msg, {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: "Error",
                        styleClass: "sapUiSizeCompact",
                        onClose: function(oEvent) {
                            oBusyDialog.close();
                        }
                    });
                }
            },
            error: function(oError) {
                oBusyDialog.close();
                var msg = oError.responseText.split("Message")[1];
            }
        });

        MA_context._reason.close();
        MA_context._reason.destroy();
        MA_context._reason = null;
    },

    updateTabHeader: function() {
        var data = MA_context.getView().byId("tab_manAttd").getModel().getData().navStudentAttendanceDtl;
        MA_context.preStd = 0;
        MA_context.absStd = 0;
        MA_context.pndStd = 0;
        for (var i = 0; i < data.length; i++) {
            if (data[i].isVerify == "True") {
                MA_context.preStd++
            } else if (data[i].isVerify == "False") {
                MA_context.absStd++
            } else {
                MA_context.pndStd++
            }
        }

        if (MA_context.pndStd == 0) {
            MA_context.getView().byId("bt_maSave").setEnabled(true);
        } else {
            MA_context.getView().byId("bt_maSave").setEnabled(false);
        }

        MA_context.getView().byId("tt_hdrPre").setText("Present Student: " + MA_context.preStd.toString());
        MA_context.getView().byId("tt_hdrAbs").setText("Absent Student: " + MA_context.absStd.toString());
        MA_context.getView().byId("tt_hdrPnd").setText("Pending Student: " + MA_context.pndStd.toString());
    },

    onClose: function(oEvent) {
        MA_context._reason.close();
        MA_context._reason.destroy();
        MA_context._reason = null;
    },

    setFragTableHeight: function() {
        var footerTop = sap.ui.getCore().byId("dlg_manualAttd").getEndButton().getDomRef().getBoundingClientRect().top;
        var tablePositionTop = sap.ui.getCore().byId("tab_HdrManlAttd").getDomRef().getBoundingClientRect().bottom;
        var scrollHeight = footerTop - tablePositionTop - 8;
        var tableHeight = sap.ui.getCore().byId("tab_ManlAttd").getDomRef().getBoundingClientRect().height;
        sap.ui.getCore().byId("scrl_ManlAttd").setHeight(String(scrollHeight + "px"));
        if (tableHeight > scrollHeight) {
            sap.ui.getCore().byId("col_manlAttd").setVisible(true);
        } else {
            sap.ui.getCore().byId("col_manlAttd").setVisible(false);
        }
    },

    onMassChange: function(oEvent) {
        var mItems = sap.ui.getCore().byId("tab_ManlAttd").getItems();
        var mData = sap.ui.getCore().byId("tab_ManlAttd").getModel().getData().results;

        for (var i = 0; i < mData.length; i++) {
            if (mData[i].isManual == 1) {
                mData[i].reasonKey = oEvent.getParameter("selectedItem").getKey();
                mData[i].reasonText = oEvent.getParameter("selectedItem").getText();
            }
        }

        sap.ui.getCore().byId("tab_ManlAttd").getModel().refresh(true);

        //		for(var i = 0; i < mItems.length; i++){
        //			mItems[i].getCells()[4].setSelectedKey(oEvent.getParameter("selectedItem").getKey());
        //		}
    },

    onFragTabRes: function(oEvent) {
        oEvent.getSource().getParent().getBindingContext().getObject().reasonKey = oEvent.getParameter("selectedItem").getKey();
        oEvent.getSource().getParent().getBindingContext().getObject().reasonText = oEvent.getParameter("selectedItem").getText();
    },

    onFragTabComment: function(oEvent) {
        //		oEvent.getSource().getParent().getBindingContext().getObject().comment = oEvent.getParameter("value");
    },

    setTableHeight: function() {
        var footerHeight = MA_context.getView().byId("ftr_maPage").getDomRef().getBoundingClientRect().height + 5;
        //		var dialogHeight = MA_context.getView().byId("dialog_route").getDomRef().getBoundingClientRect().height;
        var tablePositionTop = MA_context.getView().byId("scrl_maTab").getDomRef().getBoundingClientRect().top;
        var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
        MA_context.getView().byId("scrl_maTab").setHeight(String(scrollHeight + "px"));

        var tableHeight = MA_context.getView().byId("tab_manAttd").getDomRef().getBoundingClientRect().height;
        if (tableHeight > scrollHeight) {
            MA_context.getView().byId("col_maTabScrl").setVisible(true);
        } else {
            MA_context.getView().byId("col_maTabScrl").setVisible(false);
        }
    },
});