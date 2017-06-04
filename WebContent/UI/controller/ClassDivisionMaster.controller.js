jQuery.sap.require("com.itec.sams.util.formatter");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
jQuery.sap.require("sap.m.MessageBox");
sap.ui.controller("com.itec.sams.controller.ClassDivisionMaster", {
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
        if (sName !== "ClassDivMaster") {
            return;
        } else {
            oPageTitle.setText("Class Division Master");
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
    initialLoad: function() {
        var query = {
            schoolId: comGlob.schoolData.schoolId,
            skip: 0,
            top: 1000,
        };

        var oClassResponse = new com.itec.sams.util.GetPostApiCall.postData("classMasterDataGet", query);
        if (oClassResponse != null)
            CDM_context.bindClassTable(oClassResponse);
        var oDivisionResponse = com.itec.sams.util.GetPostApiCall.postData("divisionMasterDataGet", query);
        if (oDivisionResponse != null)
            CDM_context.bindDivisionTable(oDivisionResponse);
        
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
    onClassDivisionTabSelect: function(evt) {
        var sKey = evt.getSource().getSelectedKey();
        var query = {
            schoolId: comGlob.schoolData.schoolId,
            skip: 0,
            top: 1000,
        };
        if (sKey === "divisionMaster") {
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
                var oDivisionResponse = new com.itec.sams.util.GetPostApiCall.postData("divisionMasterDataGet", query);
                if (oDivisionResponse != null)
                    CDM_context.bindDivisionTable(oDivisionResponse);
                oBusyDialog.close();
            });

        } else if (sKey === "classMaster") {
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
                var oClassResponse = new com.itec.sams.util.GetPostApiCall.postData("classMasterDataGet", query);
                if (oClassResponse != null)
                    CDM_context.bindClassTable(oClassResponse);
                oBusyDialog.close();
            });

        }
    },
    bindClassTable: function(oData) {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                text: "{className}",
            }), new sap.m.Text({
                text: {
                    path: "activeStatus",
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
                press: CDM_context.onClassTableActionPress
            }), ]
        });

        var oTable = this.getView().byId("classMaster_tblId");
        var oTblModel = new sap.ui.model.json.JSONModel(oData);
        oTable.setModel(oTblModel);
        oTable.bindAggregation("items", {
            path: "/NavClassMasterSet",
            template: tblTemplate
        });
    },
    setClassTableHeight: function(evt) {
        var oTable = evt.getSource();
        var oScrollContainer = evt.getSource().getParent();
        if (oTable.getDomRef() != null) {
            var footerHeight = CDM_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
            var tablePositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
            var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
            oScrollContainer.setHeight(String(scrollHeight + "px"));
            if(!jQuery.device.is.phone){
            	var tableHeight = oTable.getDomRef().getBoundingClientRect().height;
                var hdrTable = CDM_context.getView().byId("hdr_classMaster_tblId");
                if (tableHeight > scrollHeight) {
                	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(true);
                } else {
                	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(false);
                }
            }
        }
    },
    onRegisterNewClass: function(evt) {
        var mData = {
            frameId: "Class",
            frameMode: "ADD",
            tableData: []
        }
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "actionModel");
        if (!CDM_context._classDialogADE) {
            CDM_context._classDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.classMasterADE", CDM_context);
            CDM_context.getView().addDependent(CDM_context._classDialogADE);
        }
        CDM_context._classDialogADE.open();
    },
    onClassTableActionPress: function(evt) {
        var actButtonRef = evt.getSource();
        var obj = evt.getSource().getParent().getBindingContext().getObject();
        if (!CDM_context._actionSheet) {
            CDM_context._actionSheet = sap.ui.xmlfragment("com.itec.sams.fragment.editDisDlt", CDM_context);
            CDM_context.getView().addDependent(CDM_context._actionSheet);
        }
        var mData = {
            frameId: "Class",
            frameMode: "",
            tableData: []
        }
        mData.tableData.push(obj);
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "actionModel");
        CDM_context._actionSheet.openBy(actButtonRef);
    },
    onBeforeClassDialogOpen:function(evt){
    	var selectTemplate = new sap.ui.core.Item({
            key: "{key}",
            text: "{value}",
        });
        var status_cBoxId = sap.ui.getCore().byId("statusClass_cBoxId");
        var name_txtId = sap.ui.getCore().byId("className_txtId");
        var save_BtnId = CDM_context._classDialogADE.getBeginButton();
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
            name_txtId.setValue(actionModelData.tableData[0].className);
            status_cBoxId.setEnabled(true);
            status_cBoxId.setSelectedKey(actionModelData.tableData[0].activeStatus);
            save_BtnId.setVisible(true);
        } else if (actionModelData.frameMode === "DISPLAY") {
            name_txtId.setValue(actionModelData.tableData[0].className);
            status_cBoxId.setSelectedKey(actionModelData.tableData[0].activeStatus);
        }
    },
    onClassSaveDialogPress:function(evt){
    	if (sap.ui.getCore().byId("statusClass_cBoxId").getSelectedKey() != ""
    			&& sap.ui.getCore().byId("className_txtId").getValue() != "") {
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
                CDM_context.onSaveClass();
            });
        } else {
            var msg = "";

            if (sap.ui.getCore().byId("className_txtId").getValue() === "")
                msg += "Please enter Class Name." + "\n";
            if (sap.ui.getCore().byId("statusClass_cBoxId").getSelectedKey() === "")
                msg += "Please select Status." + "\n";

            sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "ERROR");
        }
    },
    onSaveClass:function(evt){
    	 var actionModelData = sap.ui.getCore().getModel("actionModel").getData();
         var requestBody = {
             "Mode": actionModelData.frameMode,
             "NavClassMasterSet": [],
             "schoolId": sessionStorage.getItem('schoolId'),
             "userId": sessionStorage.getItem('userId'),
         }
         if (actionModelData.frameMode === "ADD") {
             requestBody.NavClassMasterSet.push({
                 "className": sap.ui.getCore().byId("className_txtId").getValue(),
                 "activeStatus": sap.ui.getCore().byId("statusClass_cBoxId").getSelectedKey(),
             })
         } else {
             requestBody.NavClassMasterSet.push({
                 "classId": actionModelData.tableData[0].classId,
                 "className": sap.ui.getCore().byId("className_txtId").getValue(),
                 "activeStatus": sap.ui.getCore().byId("statusClass_cBoxId").getSelectedKey(),
             })
         }
         var saveResponse = new com.itec.sams.util.GetPostApiCall.postData("classMasterDataSet", requestBody);
         if (saveResponse != null) {
             if (saveResponse.msgType === "S") {
                 sap.m.MessageBox.show(saveResponse.msg, {
                     icon: sap.m.MessageBox.Icon.SUCCESS,
                     title: "Success",
                     styleClass: "sapUiSizeCompact",
                     onClose: function(action) {
                         CDM_context.initialLoad();
                         CDM_context._classDialogADE.close();
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
    onClassCancelDialogPress:function(evt){
    	CDM_context._classDialogADE.close();
    },
    bindDivisionTable: function(oData) {
        var divTblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                text: "{className}",
            }), new sap.m.Text({
                text: "{divisionName}",
            }), new sap.m.Text({
                text: "{description}",
            }), new sap.m.Text({
                text: {
                    path: "activeStatus",
                    formatter: function(value) {
                        if (value === false || value === "False")
                            return "InActive";
                        else
                            return "Active";
                    }
                }
            }), new sap.m.Button({
                icon: "sap-icon://action",
                type: "Default",
                press: CDM_context.onDivisionTableActionPress
            })]
        });

        var oDivTable = CDM_context.getView().byId("divMaster_tblId");
        oDivTable.setModel(new sap.ui.model.json.JSONModel(oData));
        oDivTable.bindAggregation("items", {
            path: "/NavDivisionMasterSet",
            template: divTblTemplate
        });
    },
    setDivisionTableHeight: function(evt) {
        var oTable = evt.getSource();
        var oScrollContainer = evt.getSource().getParent();
        if (oTable.getDomRef() != null) {
            var footerHeight = CDM_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
            var tablePositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
            var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
            oScrollContainer.setHeight(String(scrollHeight + "px"));
            if(!jQuery.device.is.phone){
            	var tableHeight = oTable.getDomRef().getBoundingClientRect().height;
                var hdrTable = CDM_context.getView().byId("hdr_divMaster_tblId");
                if (tableHeight > scrollHeight) {
                	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(true);
                } else {
                	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(false);
                }
            }
        }
    },
    onRegisterNewDivision: function(evt) {
        var mData = {
            frameId: "Division",
            frameMode: "ADD",
            tableData: [{
            	classId:"",
            	className:""
            }]
        }
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "actionModel");
        if (!CDM_context._divisionDialogADE) {
            CDM_context._divisionDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.divisionMasterADE", CDM_context);
            CDM_context.getView().addDependent(CDM_context._divisionDialogADE);
        }
        CDM_context._divisionDialogADE.open();
    },
    onDivisionTableActionPress: function(evt) {
        var actButtonRef = evt.getSource();
        var obj = evt.getSource().getParent().getBindingContext().getObject();
        if (!CDM_context._actionSheet) {
            CDM_context._actionSheet = sap.ui.xmlfragment("com.itec.sams.fragment.editDisDlt", CDM_context);
            CDM_context.getView().addDependent(CDM_context._actionSheet);
        }
        var mData = {
            frameId: "Division",
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
            if (actionModelData.frameId === "Class") {
                if (!CDM_context._classDialogADE) {
                    CDM_context._classDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.classMasterADE", CDM_context);
                    CDM_context.getView().addDependent(CDM_context._classDialogADE);
                }
                CDM_context._classDialogADE.open();
            } else if (actionModelData.frameId === "Division") {
                if (!CDM_context._divisionDialogADE) {
                    CDM_context._divisionDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.divisionMasterADE", CDM_context);
                    CDM_context.getView().addDependent(CDM_context._divisionDialogADE);
                }
                CDM_context._divisionDialogADE.open();
            }
        }
    },
    onAsheetDisplay: function(evt) {
        var actionModel = sap.ui.getCore().getModel("actionModel");
        if (actionModel != null && actionModel != undefined) {
            var actionModelData = actionModel.getData();
            actionModelData.frameMode = "DISPLAY";
            if (actionModelData.frameId === "Class") {
                if (!CDM_context._classDialogADE) {
                    CDM_context._classDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.classMasterADE", CDM_context);
                    CDM_context.getView().addDependent(CDM_context._classDialogADE);
                }
                CDM_context._classDialogADE.open();
            } else if (actionModelData.frameId === "Division") {
                if (!CDM_context._divisionDialogADE) {
                    CDM_context._divisionDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.divisionMasterADE", CDM_context);
                    CDM_context.getView().addDependent(CDM_context._divisionDialogADE);
                }
                CDM_context._divisionDialogADE.open();
            }
        }
    },
    onBeforeDivisionDialogOpen:function(evt){
    	var selectTemplate = new sap.ui.core.Item({
            key: "{key}",
            text: "{value}",
        });
        var status_cBoxId = sap.ui.getCore().byId("statusDivision_cBoxId");
        var class_txtId = sap.ui.getCore().byId("division_className_txtId");
        var descriptions_txtId = sap.ui.getCore().byId("divisionDesc_txtAreaId");
        var name_txtId = sap.ui.getCore().byId("divisionName_txtId");
        var save_BtnId = CDM_context._divisionDialogADE.getBeginButton();
        status_cBoxId.removeAllAggregation();
        if (CDM_context.valueStatus != undefined) {
            status_cBoxId.setModel(CDM_context.valueStatus);
            status_cBoxId.bindAggregation("items", {
                path: "/navHelpDialog",
                template: selectTemplate
            });
        }
        var actionModelData = sap.ui.getCore().getModel("actionModel").getData();
        class_txtId.setValue("");
        class_txtId.setEnabled(false);
        name_txtId.setValue("");
        name_txtId.setEnabled(false);
        descriptions_txtId.setValue("");
        descriptions_txtId.setEnabled(false);
        status_cBoxId.setSelectedKey("");
        status_cBoxId.setEnabled(false);
        save_BtnId.setVisible(false);
        if (actionModelData.frameMode === "ADD") {
            class_txtId.setEnabled(true);
            name_txtId.setEnabled(true);
            status_cBoxId.setEnabled(true);
            descriptions_txtId.setEnabled(true);
            save_BtnId.setVisible(true);
        } else if (actionModelData.frameMode === "EDIT") {
            class_txtId.setValue(actionModelData.tableData[0].className);
            name_txtId.setEnabled(true);
            name_txtId.setValue(actionModelData.tableData[0].divisionName);
            status_cBoxId.setEnabled(true);
            descriptions_txtId.setValue(actionModelData.tableData[0].description);
            descriptions_txtId.setEnabled(true);
            status_cBoxId.setSelectedKey(actionModelData.tableData[0].activeStatus);
            save_BtnId.setVisible(true);
        } else if (actionModelData.frameMode === "DISPLAY") {
            class_txtId.setValue(actionModelData.tableData[0].className);
            name_txtId.setValue(actionModelData.tableData[0].divisionName);
            descriptions_txtId.setValue(actionModelData.tableData[0].description);
            status_cBoxId.setSelectedKey(actionModelData.tableData[0].activeStatus);
        }
    },
    onDivisionDialog_ClassF4:function(evt){
    	 var query = {
    	            mode: "CLASS",
    	            schoolId: sessionStorage.getItem('schoolId'),
    	            key: ""
    	        };
    	        var f4DialogResponse = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", query);
    	        if (f4DialogResponse != "") {
    	            var f4Model = new sap.ui.model.json.JSONModel(f4DialogResponse);
    	            var handleClose = function(oEvent) {
    	                var oSelectedItem = oEvent.getParameter("selectedItem");
    	                if (oSelectedItem) {
    	                    sap.ui.getCore().byId("division_className_txtId").setValue(oSelectedItem.getTitle());
    	                    sap.ui.getCore().getModel("actionModel").getData().tableData[0].className = oSelectedItem.getTitle();
    	                    sap.ui.getCore().getModel("actionModel").getData().tableData[0].classId = oSelectedItem.getDescription();
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
    onDivisionSaveDialogPress:function(evt){
    	  if (sap.ui.getCore().byId("statusDivision_cBoxId").getSelectedKey() != "" 
    		  && sap.ui.getCore().byId("division_className_txtId").getValue() != "" 
				  && sap.ui.getCore().byId("divisionName_txtId").getValue() != "") {
              oBusyDialog.open();
              jQuery.sap.delayedCall(1, this, function() {
                  CDM_context.onSaveDivision();
              });
          } else {
              var msg = "";
              if (sap.ui.getCore().byId("statusDivision_cBoxId").getValue() === "")
                  msg += "Please select Class." + "\n";
              if (sap.ui.getCore().byId("divisionName_txtId").getValue() === "")
                  msg += "Please enter Division Name." + "\n";
              if (sap.ui.getCore().byId("statusDivision_cBoxId").getSelectedKey() === "")
                  msg += "Please select Status." + "\n";

              sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "ERROR");
          }
    },
    onSaveDivision:function(){
    	 var actionModelData = sap.ui.getCore().getModel("actionModel").getData();
         var requestBody = {
             "Mode": actionModelData.frameMode,
             "NavDivisionMasterSet": [],
             "schoolId": sessionStorage.getItem('schoolId'),
             "userId": sessionStorage.getItem('userId'),
         }
         if (actionModelData.frameMode === "ADD") {
             requestBody.NavDivisionMasterSet.push({
                 "classId": actionModelData.tableData[0].classId,
                 "className": actionModelData.tableData[0].className,
                 "divisionName": sap.ui.getCore().byId("divisionName_txtId").getValue(),
                 "description": sap.ui.getCore().byId("divisionDesc_txtAreaId").getValue(),
                 "activeStatus": sap.ui.getCore().byId("statusDivision_cBoxId").getSelectedKey(),
             })
         } else {
             requestBody.NavDivisionMasterSet.push({
                 "classId": actionModelData.tableData[0].classId,
                 "className": actionModelData.tableData[0].className,
                 "divisionId": actionModelData.tableData[0].divisionName_txtId,
                 "divisionName": sap.ui.getCore().byId("divisionName_txtId").getValue(),
                 "description": sap.ui.getCore().byId("divisionDesc_txtAreaId").getValue(),
                 "activeStatus": sap.ui.getCore().byId("statusDivision_cBoxId").getSelectedKey(),
             })
         }
         var saveResponse = new com.itec.sams.util.GetPostApiCall.postData("divisionMasterDataSet", requestBody);
         if (saveResponse != null) {
             if (saveResponse.msgType === "S") {
                 sap.m.MessageBox.show(saveResponse.msg, {
                     icon: sap.m.MessageBox.Icon.SUCCESS,
                     title: "Success",
                     styleClass: "sapUiSizeCompact",
                     onClose: function(action) {
                         CDM_context.initialLoad();
                         CDM_context._divisionDialogADE.close();
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
    onDivisionCancelDialogPress:function(evt){
    	CDM_context._divisionDialogADE.close();
    }
});