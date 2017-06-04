jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
jQuery.sap.require("com.itec.sams.util.formatter");
jQuery.sap.require("com.itec.sams.util.validator");
sap.ui.core.mvc.Controller.extend("com.itec.sams.controller.userGroupDetail", {
	onInit : function() {
		usrGrpDtl_context = this;
		this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
		this._oComponent = sap.ui.component(sap.ui.core.Component
				.getOwnerIdFor(this.getView()));
		if (this._oComponent._appRefresh == undefined) {
			comGlob.schoolData = {
				cityName : sessionStorage.getItem('cityName'),
				schoolId : sessionStorage.getItem('schoolId'),
				schoolName : sessionStorage.getItem('schoolName'),
				userId : sessionStorage.getItem('userId'),
				userName : sessionStorage.getItem('userName')
			}
		}
	},
	 onRouteMatched: function(evt) {
        var sName = evt.getParameter("name");
        if (sName !== "UserGroupDetail") {
            return;
        } else {
            oPageTitle.setText("User Group Detail");
            var contextModel = sap.ui.getCore().getModel("contextModel");
            if (contextModel != undefined) {
	            oBusyDialog.open();
	            jQuery.sap.delayedCall(1, this, function() {
	            	usrGrpDtl_context.initialLoad();
	            });
            }else{
            	  var bReplace = jQuery.device.is.phone ? false : true;
            	  usrGrpDtl_context.getRouter().navTo("UserRoles", bReplace);
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
   	 if(cModelData.mode != "DISPLAY"){
   		 sap.m.MessageBox.confirm("Are you sure want to cancel?", {
   	            icon: sap.m.MessageBox.Icon.QUESION,
   	            title: "Confirmation",
   	            action: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
   	            styleClass: "sapUiSizeCompact",
   	            onClose: function(action) {
   	                if (action === "OK") {
   	                	sap.ui.getCore().setModel(null, "contextModel");
   	                    var bReplace = jQuery.device.is.phone ? false : true;
   	                    usrGrpDtl_context.getRouter().navTo("UserRoles", bReplace);
   	                }
   	            }
   	        });
   	 }else{
   		 sap.ui.getCore().setModel(null, "contextModel");
   	     var bReplace = jQuery.device.is.phone ? false : true;
   	     usrGrpDtl_context.getRouter().navTo("UserRoles", bReplace);
   	 }
   },
    initialLoad:function(){
	  var queryStatus = {
          mode: "STATUS",
          schoolId: sessionStorage.getItem('schoolId'),
          key: ""
      }
	  usrGrpDtl_context.resetUserGroupDetail();
	  
      var valueStatus = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", queryStatus);
      if (valueStatus != null)
        	  usrGrpDtl_context.bindStatusDropDown(valueStatus);
      
      var cModelData = sap.ui.getCore().getModel("contextModel").getData();
      var sUri = "userGroupMasterDetailGet?schoolId=" + sessionStorage.getItem('schoolId') +
      		"&userGroupMasterId=0";
      if(cModelData.mode === "DISPLAY" || cModelData.mode === "EDIT")
    	  sUri = "userGroupMasterDetailGet?schoolId=" + sessionStorage.getItem('schoolId') +
    		"&userGroupMasterId=" + cModelData.tableData.userGroupId;
      
      	var oUserRolesDtlResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
      	if(oUserRolesDtlResponse != null){
      		usrGrpDtl_context.bindAssignedUsersTable(oUserRolesDtlResponse);
      		usrGrpDtl_context.bindAssignUserRolesTable(oUserRolesDtlResponse);
      	}
      
      	
        if(cModelData.mode === "ADD"){
      	  usrGrpDtl_context.setUserGroupDetailEnabled(true);
        }else if(cModelData.mode === "EDIT"){
      	  usrGrpDtl_context.bindUserGroupDetail(cModelData.tableData);
      	  usrGrpDtl_context.setUserGroupDetailEnabled(true);
        }else if(cModelData.mode === "DISPLAY"){
      	  usrGrpDtl_context.bindUserGroupDetail(cModelData.tableData);
      	  usrGrpDtl_context.setUserGroupDetailEnabled(false);
        }
        		  
      oBusyDialog.close();
   },
    resetUserGroupDetail:function(){
    	usrGrpDtl_context.getView().byId("userGroupName_txtId").setValue("");
    	usrGrpDtl_context.getView().byId("userGroupDesc_txtId").setValue("");
    	usrGrpDtl_context.getView().byId("userGroupStatus_selId").setSelectedKey("");
    	usrGrpDtl_context.getView().byId("uGroupUsers_tblId").unbindAggregation("items");
    	usrGrpDtl_context.getView().byId("uGroupAssignRoles_tblId").unbindAggregation("items");
    },
    setUserGroupDetailEnabled:function(isEnabled){
    	usrGrpDtl_context.getView().byId("userGroupName_txtId").setEnabled(isEnabled);
    	usrGrpDtl_context.getView().byId("userGroupDesc_txtId").setEnabled(isEnabled);
    	usrGrpDtl_context.getView().byId("userGroupStatus_selId").setEnabled(isEnabled);
    	usrGrpDtl_context.getView().byId("uGroupUsersTblHdr_toolbarId").setVisible(isEnabled);
    	usrGrpDtl_context.getView().byId("submit_usrGroupDtl_btnId").setVisible(isEnabled);
    },
    bindUserGroupDetail:function(mData){
    	usrGrpDtl_context.getView().byId("userGroupName_txtId").setValue(mData.userGroupName);
    	usrGrpDtl_context.getView().byId("userGroupDesc_txtId").setValue(mData.userGroupDescriptions);
    	usrGrpDtl_context.getView().byId("userGroupStatus_selId").setSelectedKey(mData.activeStatusKey);
    },
    bindStatusDropDown:function(mData){
    	var status_cBoxId = usrGrpDtl_context.getView().byId("userGroupStatus_selId");
    	var selectTemplate = new sap.ui.core.Item({
            key: "{key}",
            text: "{value}",
        });
    	status_cBoxId.setModel(new sap.ui.model.json.JSONModel(mData));
        status_cBoxId.bindAggregation("items", {
            path: "/navHelpDialog",
            template: selectTemplate
        });
    },
    bindAssignedUsersTable:function(oData){
    	 var tblTemplate = new sap.m.ColumnListItem({
             cells: [new sap.m.Text({
                 text: "{employeeNo}",
             }),new sap.m.Text({
                 text: "{firstName}",
             }),new sap.m.Text({
            	 text:"{lastName}"
             }),new sap.m.Text({
            	 text:"{departmentName}"
             }),new sap.m.Text({
            	 text:"{designationName}"
             })]
         });

         var oTable = usrGrpDtl_context.getView().byId("uGroupUsers_tblId");
         var oTblModel = new sap.ui.model.json.JSONModel(oData);
         oTable.setModel(oTblModel);
         oTable.bindAggregation("items", {
             path: "/navUserGroupMasterDetail",
             template: tblTemplate
         });
    },
    bindAssignUserRolesTable:function(oData){
   	 var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                text: "{roleName}",
            }),new sap.m.Text({
                text: "{roleDescriptions}",
            })]
        });

        var oTable = usrGrpDtl_context.getView().byId("uGroupAssignRoles_tblId");
        var oTblModel = new sap.ui.model.json.JSONModel(oData);
        oTable.setModel(oTblModel);
        oTable.bindAggregation("items", {
            path: "/navAssignedRoleDtl",
            template: tblTemplate
        });
        oTable.addDelegate({
            onAfterRendering: function() {
              var header = this.$().find('thead');
              var cModelData = sap.ui.getCore().getModel("contextModel").getData();
              var selectAllCb = header.find('.sapMCb');
              if(cModelData.mode === "DISPLAY")
           	   selectAllCb.hide();
              else
           	   selectAllCb.show();
              
              this.getItems().forEach(function(r) {
                var obj = r.getBindingContext().getObject();
                var sAssignId = obj.assignedId;
                var cb = r.$().find('.sapMCb');
                var oCb = sap.ui.getCore().byId(cb.attr('id'));
	       		  if(parseInt(sAssignId) > 0){
	       			oTable.setSelectedItem(r);
	       		  }
	       		if(cModelData.mode === "DISPLAY")
	       				oCb.setEnabled(false);
	               else
	            	   oCb.setEnabled(true);
              });
            }
          }, oTable);
   },
   onAddUsers2Group:function(evt){
	   if (!usrGrpDtl_context._searchUsersDialog) {
		   usrGrpDtl_context._searchUsersDialog = sap.ui.xmlfragment("com.itec.sams.fragment.schoolStaffSearch", usrGrpDtl_context);
		   usrGrpDtl_context.getView().addDependent(usrGrpDtl_context._searchUsersDialog);
       }
	   usrGrpDtl_context._searchUsersDialog.open();
   },
   onBeforeSchoolStaffSearchDialogOpen:function(evt){
	   sap.ui.getCore().byId("staffSrchDialog_empNo_txtId").setValue("");
       sap.ui.getCore().byId("staffSrchDialog_fName_txtId").setValue("");
       sap.ui.getCore().byId("staffSrchDialog_lName_txtId").setValue("");
       sap.ui.getCore().byId("staffSrchDialog_department_txtId").removeAllCustomData();
       sap.ui.getCore().byId("staffSrchDialog_department_txtId").setValue("");
       sap.ui.getCore().byId("staffSrchDialog_designation_txtId").removeAllCustomData();
       sap.ui.getCore().byId("staffSrchDialog_designation_txtId").setValue("");
       sap.ui.getCore().byId("staffSrchDialog_userDtl_tblId").unbindAggregation("items");
   },
   onStaffSearchDialogDepartmentValueHelp:function(evt){
	   var query = {
	            mode: "DEPARTMENT",
	            schoolId: sessionStorage.getItem('schoolId'),
	            key: ""
	        };
	        var f4DialogResponse = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", query);
	        if (f4DialogResponse != "") {
	            var f4Model = new sap.ui.model.json.JSONModel(f4DialogResponse);
	            var handleClose = function(oEvent) {
	                var oSelectedItem = oEvent.getParameter("selectedItem");
	                if (oSelectedItem) {
	                	sap.ui.getCore().byId("staffSrchDialog_department_txtId").removeAllCustomData();
	                	sap.ui.getCore().byId("staffSrchDialog_department_txtId").setValue(oSelectedItem.getTitle());
	                	sap.ui.getCore().byId("staffSrchDialog_department_txtId").addCustomData(new sap.ui.core.CustomData({
	                        key: "key",
	                        value: oSelectedItem.data().key
	                    }));
	                }
	                oEvent.getSource().getBinding("items").filter([]);
	            };
	            var _valueHelpSelectDialog = new sap.m.SelectDialog({
	                title: "Department",
	                multiSelect: false,
	                items: {
	                    path: "/navHelpDialog",
	                    template: new sap.m.StandardListItem({
	                        title: "{value}",
	                        active: true
	                    }).addCustomData(new sap.ui.core.CustomData({
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
	            jQuery.sap.delayedCall(350, usrGrpDtl_context, function() {
	                _valueHelpSelectDialog._oSearchField.focus();
	            });
	        }
   },
   onStaffSearchDialogDesignationValueHelp:function(evt){
	   var query = {
	            mode: "DESIGNATION",
	            schoolId: sessionStorage.getItem('schoolId'),
	            key: ""
	        };
	        var f4DialogResponse = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", query);
	        if (f4DialogResponse != "") {
	            var f4Model = new sap.ui.model.json.JSONModel(f4DialogResponse);
	            var handleClose = function(oEvent) {
	                var oSelectedItem = oEvent.getParameter("selectedItem");
	                if (oSelectedItem) {
	                	sap.ui.getCore().byId("staffSrchDialog_designation_txtId").removeAllCustomData();
	                	sap.ui.getCore().byId("staffSrchDialog_designation_txtId").setValue(oSelectedItem.getTitle());
	                	sap.ui.getCore().byId("staffSrchDialog_designation_txtId").addCustomData(new sap.ui.core.CustomData({
	                        key: "key",
	                        value: oSelectedItem.data().key
	                    }));
	                }
	                oEvent.getSource().getBinding("items").filter([]);
	            };
	            var _valueHelpSelectDialog = new sap.m.SelectDialog({
	                title: "Designation",
	                multiSelect: false,
	                items: {
	                    path: "/navHelpDialog",
	                    template: new sap.m.StandardListItem({
	                        title: "{value}",
	                        active: true
	                    }).addCustomData(new sap.ui.core.CustomData({
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
	            jQuery.sap.delayedCall(350, usrGrpDtl_context, function() {
	                _valueHelpSelectDialog._oSearchField.focus();
	            });
	        }
   },
   onSchoolStaffSrchDialogSearchBtnPress:function(evt){
	   oBusyDialog.open();
       jQuery.sap.delayedCall(1, this, function() {
    	   usrGrpDtl_context.onSearchUsersDtl();
       });
   },
   onSearchUsersDtl:function(){
	   var sFName = sap.ui.getCore().byId("staffSrchDialog_fName_txtId").getValue();
       var sLName = sap.ui.getCore().byId("staffSrchDialog_lName_txtId").getValue();
       var sEmpNo = sap.ui.getCore().byId("staffSrchDialog_empNo_txtId").getValue();
       var sDepartmentId = sap.ui.getCore().byId("staffSrchDialog_department_txtId").getValue() != "" ? sap.ui.getCore().byId("staffSrchDialog_department_txtId").data().key : "";
       var sDesignationId = sap.ui.getCore().byId("staffSrchDialog_designation_txtId").getValue() != "" ? sap.ui.getCore().byId("staffSrchDialog_designation_txtId").data().key : "";
       var sQuery = "";
       if (sEmpNo)
           sQuery += "&employeeNo=" + sEmpNo;
       else
           sQuery += "&employeeNo=null";
       if (sFName)
           sQuery += "&fName=" + sFName;
       else
           sQuery += "&fName=null";
       if (sLName)
           sQuery += "&lName=" + sLName;
       else
           sQuery += "&lName=null";
       if (sDepartmentId)
           sQuery += "&departmentId=" + sDepartmentId;
       else
           sQuery += "&departmentId=null";
       if (sDesignationId)
           sQuery += "&designationId=" + sDesignationId;
       else
           sQuery += "&designationId=null";
       if (sFName || sLName || sEmpNo || sDepartmentId || sDesignationId) {
           var sUri = "SchoolStaffSearchDtlGet?schoolId=" + sessionStorage.getItem('schoolId') + sQuery;
           var oResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
           if (oResponse != null) {
        	   usrGrpDtl_context.bindSchoolStaffDialogUserTable(oResponse);
           }
       }
       oBusyDialog.close();
   },
   bindSchoolStaffDialogUserTable:function(oData){
	   var tblTemplate = new sap.m.ColumnListItem({
           cells: [new sap.m.Text({
                   text: "{employeeNo}",
               }),
               new sap.m.Text({
                   text: "{firstName}"
               }),
               new sap.m.Text({
                   text: "{lastName}"
               }),
               new sap.m.Text({
                   text: "{departmentName}"
               }),
               new sap.m.Text({
                   text: "{designationName}"
               })
           ]
       });
       var oTable = sap.ui.getCore().byId("staffSrchDialog_userDtl_tblId");
       oTable.unbindAggregation("items");
       oTable.setModel(new sap.ui.model.json.JSONModel(oData));
       oTable.bindAggregation("items", {
           path: "/results",
           template: tblTemplate,
           //templateShareable: true
       });
   },
   onSchoolStaffSrchDialogResetBtnPress:function(evt){
	   sap.ui.getCore().byId("staffSrchDialog_empNo_txtId").setValue("");
       sap.ui.getCore().byId("staffSrchDialog_fName_txtId").setValue("");
       sap.ui.getCore().byId("staffSrchDialog_lName_txtId").setValue("");
       sap.ui.getCore().byId("staffSrchDialog_department_txtId").removeAllCustomData();
       sap.ui.getCore().byId("staffSrchDialog_department_txtId").setValue("");
       sap.ui.getCore().byId("staffSrchDialog_designation_txtId").removeAllCustomData();
       sap.ui.getCore().byId("staffSrchDialog_designation_txtId").setValue("");
       sap.ui.getCore().byId("staffSrchDialog_userDtl_tblId").unbindAggregation("items");
   },
   onSchoolStaffSearchOkPress:function(evt){
	   oBusyDialog.open();
       jQuery.sap.delayedCall(1, this, function() {
    	   usrGrpDtl_context.bindUsersToUsersGroupTable();
       });
	   usrGrpDtl_context._searchUsersDialog.close();
   },
   bindUsersToUsersGroupTable:function(){
	   var oTable = sap.ui.getCore().byId("staffSrchDialog_userDtl_tblId");
	   var oGroupUsersTable = usrGrpDtl_context.getView().byId("uGroupUsers_tblId");
	   var oGroupUsersTblMData = oGroupUsersTable.getModel().getData();
	   if(oTable.getItems().length > 0){
		   var oSelectedItems = oTable.getSelectedItems();
		   for(var x = 0; x < oSelectedItems.length; x++){
			   var obj = oSelectedItems[x].getBindingContext().getObject();
			   if(oGroupUsersTblMData.navUserGroupMasterDetail.length === 0){
				   oGroupUsersTblMData.navUserGroupMasterDetail.push({
					   "userGroupDtlId": "0",
						"userId":obj.userId,
						"employeeNo":obj.employeeNo,
						"firstName":obj.firstName,
						"lastName":obj.lastName,
						"departmentName":obj.departmentName,
						"designationName":obj.designationName,
				   });
			   }else{
				   var isExists = false;
				   for(var y = 0; y < oGroupUsersTblMData.navUserGroupMasterDetail.length; y++){
					  if(obj.userId === oGroupUsersTblMData.navUserGroupMasterDetail[y].userId) {
						  isExists = true;
						  break;
					  }
				   }
				   if(isExists === false){
					   oGroupUsersTblMData.navUserGroupMasterDetail.push({
						   "userGroupDtlId": "0",
							"userId":obj.userId,
							"employeeNo":obj.employeeNo,
							"firstName":obj.firstName,
							"lastName":obj.lastName,
							"departmentName":obj.departmentName,
							"designationName":obj.designationName,
					   });
				   }
			   }
		   }
	   }
	   usrGrpDtl_context.bindAssignedUsersTable(oGroupUsersTblMData);
	   oBusyDialog.close();
   },
   onSchoolStaffCancelDialogPress:function(evt){
	   usrGrpDtl_context._searchUsersDialog.close();
   },
   validateUserGroupDetail:function(){
	 var msg = "";
	 	if(usrGrpDtl_context.getView().byId("userGroupName_txtId").getValue() === "")
	 		msg += "Please enter User Group Name." + "\n";
	 	if(usrGrpDtl_context.getView().byId("userGroupStatus_selId").getSelectedKey() === "")
	 		msg += "Please select Status." + "\n";
	 	var oUsersDetailTable = usrGrpDtl_context.getView().byId("uGroupUsers_tblId");
	 	if(oUsersDetailTable.getItems().length === 0 )
			msg += "Please add alteast one or more User(s)." + "\n";
	 	var oAssignRolesTable = usrGrpDtl_context.getView().byId("uGroupAssignRoles_tblId");
		if(oAssignRolesTable.getSelectedItems().length === 0 )
			msg += "Please select alteast one or more User Role(s) to assign." + "\n";
 		
	 return msg;
   },
   onSubmitPress:function(evt){
	   var msg = usrGrpDtl_context.validateUserGroupDetail();
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
                    	   usrGrpDtl_context.submitUserGroupDetail();
                       });
                   }
               }
           });
       } else {
           sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Error");
       }
   },
   getUserGroupDtlRequestBody:function(){
	 var requestBody = {};
	 var cModelData = sap.ui.getCore().getModel("contextModel").getData();
	 
	 requestBody.mode = cModelData.mode;
	 requestBody.schoolId = sessionStorage.getItem('schoolId');
	 requestBody.userId = sessionStorage.getItem('userId');
	 
	 var userGroupId = "0";
	 if(cModelData.mode === "EDIT")
		 userGroupId = cModelData.tableData.userGroupId;
	 
	 requestBody.navUserGroupMaster = [];
	 requestBody.navUserGroupMaster.push({
		 userGroupId:userGroupId,
		 userGroupName: usrGrpDtl_context.getView().byId("userGroupName_txtId").getValue(),
		 userGroupDescriptions: usrGrpDtl_context.getView().byId("userGroupDesc_txtId").getValue(),
		 activeStatusKey:usrGrpDtl_context.getView().byId("userGroupStatus_selId").getSelectedKey(),
	 });
	 
	 var oUsersDetailTable = usrGrpDtl_context.getView().byId("uGroupUsers_tblId");
	 requestBody.navUserGroupMasterDetail = [];
	 if(oUsersDetailTable.getItems().length > 0){
		 var oUsersDetailItems = oUsersDetailTable.getItems();
		 for(var i = 0; i < oUsersDetailItems.length; i++){
			 var accessRightObj = oUsersDetailItems[i].getBindingContext().getObject();
			 var oElements = oUsersDetailItems[i].findElements();
			 requestBody.navUserGroupMasterDetail.push({
				 "userGroupDtlId": accessRightObj.userGroupDtlId,
				 "userId":accessRightObj.userId,
				 "employeeNo":accessRightObj.employeeNo,
				 "firstName":accessRightObj.firstName,
				 "lastName":accessRightObj.lastName,
				 "departmentName":accessRightObj.departmentName,
				 "designationName":accessRightObj.designationName,
			 });
		 }
	 }
	 
	 var oAssignRolesTable = usrGrpDtl_context.getView().byId("uGroupAssignRoles_tblId");
	 requestBody.navAssignedRoleDtl = [];
	 if(oAssignRolesTable.getItems().length > 0){
		 var oAssignRolesSelItem = oAssignRolesTable.getSelectedItems();
		 for(var i = 0; i < oAssignRolesSelItem.length; i++){
			 var accessRightObj = oAssignRolesSelItem[i].getBindingContext().getObject();
			 var oElements = oAssignRolesSelItem[i].findElements();
			 requestBody.navAssignedRoleDtl.push({
				 "assignedId": accessRightObj.assignedId,
				 "roleId":accessRightObj.roleId,
				 "roleName":accessRightObj.roleName,
				 "roleDescriptions":accessRightObj.roleDescriptions
			 });
		 }
	 }
	 
	 return requestBody;
   },
   submitUserGroupDetail:function(){
	   var requestBody = usrGrpDtl_context.getUserGroupDtlRequestBody();
	   var saveResponse = new com.itec.sams.util.GetPostApiCall.postData("userGroupMasterDetailSet", requestBody);
       if (saveResponse != null) {
           if (saveResponse.msgType === "S") {
               sap.m.MessageBox.show(saveResponse.msg, {
                   icon: sap.m.MessageBox.Icon.SUCCESS,
                   title: "Success",
                   styleClass: "sapUiSizeCompact",
                   onClose: function(action) {
                	   oBusyDialog.close();
                	   sap.ui.getCore().setModel(null, "contextModel");
                       var bReplace = jQuery.device.is.phone ? false : true;
                       usrGrpDtl_context.getRouter().navTo("UserRoles", bReplace);
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
});