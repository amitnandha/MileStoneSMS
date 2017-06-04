jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.formatter");
var actButtonRef, curShftData;
sap.ui.controller("com.itec.sams.controller.shiftPlanning", {
    onInit: function() {
        SP_context = this;
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
        if (sName !== "ShiftPlanning") {} else {
            oPageTitle.setText("Shift Planning Detail");
            SP_context.initialLoad();
        }
    },
    getEventBus: function() {
        return sap.ui.getCore().getEventBus();
    },
    getRouter: function() {
        return sap.ui.core.UIComponent.getRouterFor(this);
    },
    onAddShift: function(evt) {
        oBusyDialog.open();
        var bReplace = jQuery.device.is.phone ? false : true;
        SP_context.getRouter().navTo("ShiftPlanDetail", {
            action: "AD"
        }, bReplace);
    },

    initialLoad: function() {
        oBusyDialog.open();
        var query = {
            "schoolId": comGlob.schoolData.schoolId
        };
        $.ajax({
            url: dataSource + "/ShiftDtlGet",
            data: query,
            type: 'POST',
            async: false,
            success: function(oData, oResponse) {
                var shiftData = oData;
                SP_context.bindTable(shiftData);
                oBusyDialog.close();
            },
            error: function(oError) {
                var msg = oError.responseText.split("Message")[1];
            }
        });
    },

    bindTable: function(mData) {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                    text: "{shiftName}",
                }), new sap.m.Text({
                    text: "{shiftTypeName}",
                }), new sap.m.Text({
                    text: "Min - {path:'minInTime',formatter:'com.itec.sams.util.formatter.time'} \n Max - {path:'maxInTime',formatter:'com.itec.sams.util.formatter.time'}",
                }), new sap.m.Text({
                    text: "Min - {path:'minOutTime',formatter:'com.itec.sams.util.formatter.time'} \n Max - {path:'maxOutTime',formatter:'com.itec.sams.util.formatter.time'}",
                }), new sap.m.Text({
                    text: "{path:'shiftStartDate',formatter:'com.itec.sams.util.formatter.date'}",
                }), new sap.m.Text({
                    text: "{path:'shiftEndDate',formatter:'com.itec.sams.util.formatter.date'}",
                }),
                new sap.m.Button({
                    icon: "sap-icon://action",
                    type: "Default",
                    press: SP_context.onStrTabAction
                }),
            ]
        });

        var oTable = SP_context.getView().byId("shiftPlanning_tblId");
        var oTblModel = new sap.ui.model.json.JSONModel(mData);
        oTable.setModel(oTblModel);
        oTable.bindAggregation("items", {
            path: "/NavShiftDetailSet",
            template: tblTemplate
        });
    },

    onStrTabAction: function(oEvent) {
        if (!SP_context._actionSheet) {
            SP_context._actionSheet = sap.ui.xmlfragment("com.itec.sams.fragment.editDisDlt", SP_context);
            SP_context.getView().addDependent(SP_context._actionSheet);
        }
        SP_context._actionSheet.openBy(oEvent.getSource());
        actButtonRef = oEvent.getSource();
        //		var curIndex = actButtonRef.getParent().getParent().getItems().indexOf(actButtonRef.getParent());
        //		curShftData = actButtonRef.getParent().getModel().getData().NavShiftDetailSet[curIndex];
        curShftData = oEvent.getSource().getParent().getBindingContext().getObject();
    },

    onAsheetEdit: function(oEvent) {
        oBusyDialog.open();

        var bReplace = jQuery.device.is.phone ? false : true;
        SP_context.getRouter().navTo("ShiftPlanDetail", {
            action: "ED"
        }, bReplace);
    },

    onAsheetDisplay: function(oEvent) {
        oBusyDialog.open();
        var bReplace = jQuery.device.is.phone ? false : true;
        SP_context.getRouter().navTo("ShiftPlanDetail", {
            action: "DI"
        }, bReplace);
    },

    onAsheetDelete: function(oEvent) {
        oBusyDialog.open();
        var requestBody = {
            schoolId: comGlob.schoolData.schoolId, //Number
            Mode: "DELETE", //Value will be 'ADD', 'EDIT' & 'DELETE'
            shiftId: curShftData.shiftId, //Number
            shiftName: curShftData.shiftName,
            shiftType: curShftData.shiftType,
            minInTime: curShftData.minInTime,
            maxInTime: curShftData.maxInTime,
            minOutTime: curShftData.minOutTime,
            maxOutTime: curShftData.maxOutTime,
            bufferOutTime: curShftData.bufferOutTime,
            shiftStartDate: curShftData.shiftStartDate,
            shiftEndDate: curShftData.shiftEndDate,
            statusKey: curShftData.statusKey, //Value will be '0' or '1'
            userId: comGlob.schoolData.userId,
            NavShiftClassDivDtlSet: [],
            msgType: "",
            msg: ""
        };

        $.ajax({
            url: dataSource + "/ShiftDtlSet",
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

    setTableHeight: function() {
        var footerHeight = SP_context.getView().byId("ftr_shftPage").getDomRef().getBoundingClientRect().height;
        //		var dialogHeight = SP_context.getView().byId("dialog_route").getDomRef().getBoundingClientRect().height;
        var tablePositionTop = SP_context.getView().byId("scrl_shftTab").getDomRef().getBoundingClientRect().top;
        var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
        SP_context.getView().byId("scrl_shftTab").setHeight(String(scrollHeight + "px"));

        var tableHeight = SP_context.getView().byId("shiftPlanning_tblId").getDomRef().getBoundingClientRect().height;
        if (tableHeight > scrollHeight) {
            SP_context.getView().byId("colshft_scroll").setVisible(true);
        } else {
            SP_context.getView().byId("colshft_scroll").setVisible(false);
        }
    },
});