jQuery.sap.require("com.itec.sams.util.formatter");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
jQuery.sap.require("sap.m.MessageBox");
sap.ui.controller("com.itec.sams.controller.departmntDesignationMaster", {
    onInit: function() {
        DDM_context = this;
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
        if (sName !== "DeptDesigMaster") {
            return;
        } else {
            oPageTitle.setText("Department - Designation Master");
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
                DDM_context.initialLoad();
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

        var oDepartmentResponse = new com.itec.sams.util.GetPostApiCall.postData("departmentMasterDataGet", query);
        if (oDepartmentResponse != null)
            DDM_context.bindDepartmentTable(oDepartmentResponse);
        var oDesignationResponse = com.itec.sams.util.GetPostApiCall.postData("designationMasterDataGet", query);
        if (oDesignationResponse != null)
            DDM_context.bindDesignationTable(oDesignationResponse);
        
        var queryStatus = {
                mode: "STATUS",
                schoolId: comGlob.schoolData.schoolId,
                key: ""
            }
            var valueStatus = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", queryStatus);
            if (valueStatus != null)
            	DDM_context.valueStatus = new sap.ui.model.json.JSONModel(valueStatus);
        oBusyDialog.close();
    },
    onDeptDesigTabSelect: function(evt) {
        var sKey = evt.getSource().getSelectedKey();
        var query = {
            schoolId: comGlob.schoolData.schoolId,
            skip: 0,
            top: 1000,
        };
        if (sKey === "departmentMaster") {
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
            	 var oDepartmentResponse = new com.itec.sams.util.GetPostApiCall.postData("departmentMasterDataGet", query);
                 if (oDepartmentResponse != null)
                     DDM_context.bindDepartmentTable(oDepartmentResponse);
                oBusyDialog.close();
            });

        } else if (sKey === "designationMaster") {
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
            	 var oDesignationResponse = com.itec.sams.util.GetPostApiCall.postData("designationMasterDataGet", query);
                 if (oDesignationResponse != null)
                     DDM_context.bindDesignationTable(oDesignationResponse);
                oBusyDialog.close();
            });

        }
    },
    bindDepartmentTable: function(oData) {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                text: "{departmentName}",
            }),new sap.m.Text({
                text: "{departmentDescriptions}",
            }), new sap.m.Text({
                text: "{activeStatusText}",
            }), new sap.m.Button({
                icon: "sap-icon://action",
                type: "Default",
                press: DDM_context.onDeaprtmentTableActionPress
            }), ]
        });

        var oTable = this.getView().byId("deptMaster_tblId");
        var oTblModel = new sap.ui.model.json.JSONModel(oData);
        oTable.setModel(oTblModel);
        oTable.bindAggregation("items", {
            path: "/results",
            template: tblTemplate
        });
    },
    setDeptTableHeight: function(evt) {
        var oTable = evt.getSource();
        var oScrollContainer = evt.getSource().getParent();
        if (oTable.getDomRef() != null) {
            var footerHeight = DDM_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
            var tablePositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
            var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
            oScrollContainer.setHeight(String(scrollHeight + "px"));
            if(!jQuery.device.is.phone){
            	var tableHeight = oTable.getDomRef().getBoundingClientRect().height;
                var hdrTable = DDM_context.getView().byId("hdr_deptMaster_tblId");
                if (tableHeight > scrollHeight) {
                	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(true);
                } else {
                	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(false);
                }
            }
        }
    },
    onRegisterNewDepartment: function(evt) {
        var mData = {
            frameId: "Department",
            frameMode: "ADD",
            tableData: []
        }
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "actionModel");
        if (!DDM_context._departmentDialogADE) {
            DDM_context._departmentDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.departmentMasterADE", DDM_context);
            DDM_context.getView().addDependent(DDM_context._departmentDialogADE);
        }
        DDM_context._departmentDialogADE.open();
    },
    onDeaprtmentTableActionPress: function(evt) {
        var actButtonRef = evt.getSource();
        var obj = evt.getSource().getParent().getBindingContext().getObject();
        if (!DDM_context._actionSheet) {
            DDM_context._actionSheet = sap.ui.xmlfragment("com.itec.sams.fragment.editDisDlt", DDM_context);
            DDM_context.getView().addDependent(DDM_context._actionSheet);
        }
        var mData = {
            frameId: "Department",
            frameMode: "",
            tableData: []
        }
        mData.tableData.push(obj);
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "actionModel");
        DDM_context._actionSheet.openBy(actButtonRef);
    },
    onBeforeDepartmentDialogOpen:function(evt){
    	var selectTemplate = new sap.ui.core.Item({
            key: "{key}",
            text: "{value}",
        });
        var status_cBoxId = sap.ui.getCore().byId("statusDepartment_cBoxId");
        var name_txtId = sap.ui.getCore().byId("departmentName_txtId");
        var desc_txtId = sap.ui.getCore().byId("departmentDesc_txtId");
        var save_BtnId = DDM_context._departmentDialogADE.getBeginButton();
        status_cBoxId.removeAllAggregation();
        if (DDM_context.valueStatus != undefined) {
            status_cBoxId.setModel(DDM_context.valueStatus);
            status_cBoxId.bindAggregation("items", {
                path: "/navHelpDialog",
                template: selectTemplate
            });
        }
        var actionModelData = sap.ui.getCore().getModel("actionModel").getData();
        name_txtId.setValue("");
        name_txtId.setEnabled(false);
        desc_txtId.setValue("");
        desc_txtId.setEnabled(false);
        status_cBoxId.setSelectedKey("");
        status_cBoxId.setEnabled(false);
        save_BtnId.setVisible(false);
        if (actionModelData.frameMode === "ADD") {
            name_txtId.setEnabled(true);
            desc_txtId.setEnabled(true);
            status_cBoxId.setEnabled(true);
            save_BtnId.setVisible(true);
        } else if (actionModelData.frameMode === "EDIT") {
            name_txtId.setEnabled(true);
            name_txtId.setValue(actionModelData.tableData[0].departmentName);
            desc_txtId.setEnabled(true);
            desc_txtId.setValue(actionModelData.tableData[0].departmentDescriptions);
            status_cBoxId.setEnabled(true);
            status_cBoxId.setSelectedKey(actionModelData.tableData[0].activeStatusKey);
            save_BtnId.setVisible(true);
        } else if (actionModelData.frameMode === "DISPLAY") {
            name_txtId.setValue(actionModelData.tableData[0].departmentName);
            desc_txtId.setValue(actionModelData.tableData[0].departmentDescriptions);
            status_cBoxId.setSelectedKey(actionModelData.tableData[0].activeStatusKey);
        }
    },
    onDepartmentSaveDialogPress:function(evt){
    	if (sap.ui.getCore().byId("statusDepartment_cBoxId").getSelectedKey() != ""
    			&& sap.ui.getCore().byId("departmentName_txtId").getValue() != "") {
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
                DDM_context.onSaveDepartment();
            });
        } else {
            var msg = "";

            if (sap.ui.getCore().byId("departmentName_txtId").getValue() === "")
                msg += "Please enter Department Name." + "\n";
            if (sap.ui.getCore().byId("statusDepartment_cBoxId").getSelectedKey() === "")
                msg += "Please select Status." + "\n";

            sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "ERROR");
        }
    },
    onSaveDepartment:function(evt){
    	 var actionModelData = sap.ui.getCore().getModel("actionModel").getData();
         var requestBody = {
             "mode": actionModelData.frameMode,
             "results": [],
             "schoolId": sessionStorage.getItem('schoolId'),
             "userId": sessionStorage.getItem('userId'),
         }
         if (actionModelData.frameMode === "ADD") {
             requestBody.results.push({
                 "departmentName": sap.ui.getCore().byId("departmentName_txtId").getValue(),
                 "departmentDescriptions": sap.ui.getCore().byId("departmentDesc_txtId").getValue(),
                 "activeStatusKey": sap.ui.getCore().byId("statusDepartment_cBoxId").getSelectedKey(),
             })
         } else {
             requestBody.results.push({
                 "departmentId": actionModelData.tableData[0].departmentId,
                 "departmentName": sap.ui.getCore().byId("departmentName_txtId").getValue(),
                 "departmentDescriptions": sap.ui.getCore().byId("departmentDesc_txtId").getValue(),
                 "activeStatusKey": sap.ui.getCore().byId("statusDepartment_cBoxId").getSelectedKey(),
             })
         }
         var saveResponse = new com.itec.sams.util.GetPostApiCall.postData("departmentMasterDataSet", requestBody);
         if (saveResponse != null) {
             if (saveResponse.msgType === "S") {
                 sap.m.MessageBox.show(saveResponse.msg, {
                     icon: sap.m.MessageBox.Icon.SUCCESS,
                     title: "Success",
                     styleClass: "sapUiSizeCompact",
                     onClose: function(action) {
                         DDM_context.initialLoad();
                         DDM_context._departmentDialogADE.close();
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
    onDepartmentCancelDialogPress:function(evt){
    	DDM_context._departmentDialogADE.close();
    },
    bindDesignationTable: function(oData) {
        var designationTblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                text: "{designationName}",
            }), new sap.m.Text({
                text: "{designationDescriptions}",
            }), new sap.m.Text({
                text: "{activeStatusText}"
            }), new sap.m.Button({
                icon: "sap-icon://action",
                type: "Default",
                press: DDM_context.onDesignationTableActionPress
            })]
        });

        var oDesignationTable = DDM_context.getView().byId("desigMaster_tblId");
        oDesignationTable.setModel(new sap.ui.model.json.JSONModel(oData));
        oDesignationTable.bindAggregation("items", {
            path: "/results",
            template: designationTblTemplate
        });
    },
    setDesignationTableHeight: function(evt) {
        var oTable = evt.getSource();
        var oScrollContainer = evt.getSource().getParent();
        if (oTable.getDomRef() != null) {
            var footerHeight = DDM_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
            var tablePositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
            var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
            oScrollContainer.setHeight(String(scrollHeight + "px"));
            if(!jQuery.device.is.phone){
            	var tableHeight = oTable.getDomRef().getBoundingClientRect().height;
                var hdrTable = DDM_context.getView().byId("hdr_desigMaster_tblId");
                if (tableHeight > scrollHeight) {
                	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(true);
                } else {
                	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(false);
                }
            }
        }
    },
    onRegisterNewDesignation: function(evt) {
        var mData = {
            frameId: "Designation",
            frameMode: "ADD",
            tableData: [{
            	classId:"",
            	className:""
            }]
        }
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "actionModel");
        if (!DDM_context._designationDialogADE) {
            DDM_context._designationDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.designationMasterADE", DDM_context);
            DDM_context.getView().addDependent(DDM_context._designationDialogADE);
        }
        DDM_context._designationDialogADE.open();
    },
    onDesignationTableActionPress: function(evt) {
        var actButtonRef = evt.getSource();
        var obj = evt.getSource().getParent().getBindingContext().getObject();
        if (!DDM_context._actionSheet) {
            DDM_context._actionSheet = sap.ui.xmlfragment("com.itec.sams.fragment.editDisDlt", DDM_context);
            DDM_context.getView().addDependent(DDM_context._actionSheet);
        }
        var mData = {
            frameId: "Designation",
            frameMode: "",
            tableData: []
        }
        mData.tableData.push(obj);
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "actionModel");
        DDM_context._actionSheet.openBy(actButtonRef);
    },
    onAsheetEdit: function(evt) {
        var actionModel = sap.ui.getCore().getModel("actionModel");
        if (actionModel != null && actionModel != undefined) {
            var actionModelData = actionModel.getData();
            actionModelData.frameMode = "EDIT";
            if (actionModelData.frameId === "Department") {
                if (!DDM_context._departmentDialogADE) {
                    DDM_context._departmentDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.departmentMasterADE", DDM_context);
                    DDM_context.getView().addDependent(DDM_context._departmentDialogADE);
                }
                DDM_context._departmentDialogADE.open();
            } else if (actionModelData.frameId === "Designation") {
                if (!DDM_context._designationDialogADE) {
                    DDM_context._designationDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.designationMasterADE", DDM_context);
                    DDM_context.getView().addDependent(DDM_context._designationDialogADE);
                }
                DDM_context._designationDialogADE.open();
            }
        }
    },
    onAsheetDisplay: function(evt) {
        var actionModel = sap.ui.getCore().getModel("actionModel");
        if (actionModel != null && actionModel != undefined) {
            var actionModelData = actionModel.getData();
            actionModelData.frameMode = "DISPLAY";
            if (actionModelData.frameId === "Department") {
                if (!DDM_context._departmentDialogADE) {
                    DDM_context._departmentDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.departmentMasterADE", DDM_context);
                    DDM_context.getView().addDependent(DDM_context._departmentDialogADE);
                }
                DDM_context._departmentDialogADE.open();
            } else if (actionModelData.frameId === "Designation") {
                if (!DDM_context._designationDialogADE) {
                    DDM_context._designationDialogADE = sap.ui.xmlfragment("com.itec.sams.fragment.designationMasterADE", DDM_context);
                    DDM_context.getView().addDependent(DDM_context._designationDialogADE);
                }
                DDM_context._designationDialogADE.open();
            }
        }
    },
    onBeforeDesignationDialogOpen:function(evt){
    	var selectTemplate = new sap.ui.core.Item({
            key: "{key}",
            text: "{value}",
        });
        var status_cBoxId = sap.ui.getCore().byId("statusDesignation_cBoxId");
        var name_txtId = sap.ui.getCore().byId("designationName_txtId");
        var descriptions_txtId = sap.ui.getCore().byId("designationDesc_txtId");
        var save_BtnId = DDM_context._designationDialogADE.getBeginButton();
        status_cBoxId.removeAllAggregation();
        if (DDM_context.valueStatus != undefined) {
            status_cBoxId.setModel(DDM_context.valueStatus);
            status_cBoxId.bindAggregation("items", {
                path: "/navHelpDialog",
                template: selectTemplate
            });
        }
        var actionModelData = sap.ui.getCore().getModel("actionModel").getData();
        name_txtId.setValue("");
        name_txtId.setEnabled(false);
        descriptions_txtId.setValue("");
        descriptions_txtId.setEnabled(false);
        status_cBoxId.setSelectedKey("");
        status_cBoxId.setEnabled(false);
        save_BtnId.setVisible(false);
        if (actionModelData.frameMode === "ADD") {
            name_txtId.setEnabled(true);
            status_cBoxId.setEnabled(true);
            descriptions_txtId.setEnabled(true);
            save_BtnId.setVisible(true);
        } else if (actionModelData.frameMode === "EDIT") {
            name_txtId.setEnabled(true);
            name_txtId.setValue(actionModelData.tableData[0].designationName);
            status_cBoxId.setEnabled(true);
            descriptions_txtId.setValue(actionModelData.tableData[0].designationDescriptions);
            descriptions_txtId.setEnabled(true);
            status_cBoxId.setSelectedKey(actionModelData.tableData[0].activeStatusKey);
            save_BtnId.setVisible(true);
        } else if (actionModelData.frameMode === "DISPLAY") {
            name_txtId.setValue(actionModelData.tableData[0].designationName);
            descriptions_txtId.setValue(actionModelData.tableData[0].designationDescriptions);
            status_cBoxId.setSelectedKey(actionModelData.tableData[0].activeStatusKey);
        }
    },
   
    onDesignationSaveDialogPress:function(evt){
    	  if (sap.ui.getCore().byId("statusDesignation_cBoxId").getSelectedKey() != "" 
    		  	&& sap.ui.getCore().byId("designationName_txtId").getValue() != "" ) {
              oBusyDialog.open();
              jQuery.sap.delayedCall(1, this, function() {
                  DDM_context.onSaveDesignation();
              });
          } else {
              var msg = "";
              if (sap.ui.getCore().byId("designationName_txtId").getValue() === "")
                  msg += "Please enter Designation Name." + "\n";
              if (sap.ui.getCore().byId("statusDesignation_cBoxId").getSelectedKey() === "")
                  msg += "Please select Status." + "\n";

              sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "ERROR");
          }
    },
    onSaveDesignation:function(){
    	 var actionModelData = sap.ui.getCore().getModel("actionModel").getData();
         var requestBody = {
             "Mode": actionModelData.frameMode,
             "results": [],
             "schoolId": sessionStorage.getItem('schoolId'),
             "userId": sessionStorage.getItem('userId'),
         }
         if (actionModelData.frameMode === "ADD") {
             requestBody.results.push({
                 "designationName": sap.ui.getCore().byId("designationName_txtId").getValue(),
                 "designationDescriptions": sap.ui.getCore().byId("designationDesc_txtId").getValue(),
                 "activeStatusKey": sap.ui.getCore().byId("statusDesignation_cBoxId").getSelectedKey(),
             })
         } else {
             requestBody.results.push({
                 "designationId": actionModelData.tableData[0].designationId,
                 "designationName": sap.ui.getCore().byId("designationName_txtId").getValue(),
                 "designationDescriptions": sap.ui.getCore().byId("designationDesc_txtId").getValue(),
                 "activeStatusKey": sap.ui.getCore().byId("statusDesignation_cBoxId").getSelectedKey(),
             })
         }
         var saveResponse = new com.itec.sams.util.GetPostApiCall.postData("designationMasterDataSet", requestBody);
         if (saveResponse != null) {
             if (saveResponse.msgType === "S") {
                 sap.m.MessageBox.show(saveResponse.msg, {
                     icon: sap.m.MessageBox.Icon.SUCCESS,
                     title: "Success",
                     styleClass: "sapUiSizeCompact",
                     onClose: function(action) {
                         DDM_context.initialLoad();
                         DDM_context._designationDialogADE.close();
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
    onDesignationCancelDialogPress:function(evt){
    	DDM_context._designationDialogADE.close();
    }
});