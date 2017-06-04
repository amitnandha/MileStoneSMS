jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
jQuery.sap.require("com.itec.sams.util.formatter");
jQuery.sap.require("com.itec.sams.util.validator");
sap.ui.core.mvc.Controller.extend("com.itec.sams.controller.userRoleAccess", {
	onInit : function() {
		usrRoleDtl_context = this;
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
        if (sName !== "UserRolesDetail") {
            return;
        } else {
            oPageTitle.setText("User Role Detail");
            var contextModel = sap.ui.getCore().getModel("contextModel");
            if (contextModel != undefined) {
	            oBusyDialog.open();
	            jQuery.sap.delayedCall(1, this, function() {
	            	usrRoleDtl_context.initialLoad();
	            });
            }else{
            	  var bReplace = jQuery.device.is.phone ? false : true;
            	  usrRoleDtl_context.getRouter().navTo("UserRoles", bReplace);
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
   	                    usrRoleDtl_context.getRouter().navTo("UserRoles", bReplace);
   	                }
   	            }
   	        });
   	 }else{
   		 sap.ui.getCore().setModel(null, "contextModel");
   	     var bReplace = jQuery.device.is.phone ? false : true;
   	     usrRoleDtl_context.getRouter().navTo("UserRoles", bReplace);
   	 }
   },
    initialLoad:function(){
	  var queryStatus = {
          mode: "STATUS",
          schoolId: sessionStorage.getItem('schoolId'),
          key: ""
      }
	  usrRoleDtl_context.resetUserRolesDetail();
	  
      var valueStatus = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", queryStatus);
      if (valueStatus != null)
        	  usrRoleDtl_context.bindStatusDropDown(valueStatus);
      
      var cModelData = sap.ui.getCore().getModel("contextModel").getData();
      var sUri = "userAccessRights4RoleGet?schoolId=" + sessionStorage.getItem('schoolId') +
      		"&userRoleId=0";
      if(cModelData.mode === "DISPLAY" || cModelData.mode === "EDIT")
    	  sUri = "userAccessRights4RoleGet?schoolId=" + sessionStorage.getItem('schoolId') +
    		"&userRoleId=" + cModelData.tableData.roleId;
      
      	var oUserRolesDtlResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
      	if(oUserRolesDtlResponse != null){
      		usrRoleDtl_context.bindAccessRightsTable(oUserRolesDtlResponse);
      	}
      
      	
        if(cModelData.mode === "ADD"){
      	  usrRoleDtl_context.setUserRoleDetailEnabled(true);
        }else if(cModelData.mode === "EDIT"){
      	  usrRoleDtl_context.bindUserRoleDetail(cModelData.tableData);
      	  usrRoleDtl_context.setUserRoleDetailEnabled(true);
        }else if(cModelData.mode === "DISPLAY"){
      	  usrRoleDtl_context.bindUserRoleDetail(cModelData.tableData);
      	  usrRoleDtl_context.setUserRoleDetailEnabled(false);
        }
        		  
      oBusyDialog.close();
   },
    resetUserRolesDetail:function(){
    	usrRoleDtl_context.getView().byId("roleName_txtId").setValue("");
    	usrRoleDtl_context.getView().byId("roleDesc_txtId").setValue("");
    	usrRoleDtl_context.getView().byId("roleStatus_selId").setSelectedKey("");
    	usrRoleDtl_context.getView().byId("userRoleAccess_tblId").unbindAggregation("items");
    },
    setUserRoleDetailEnabled:function(isEnabled){
    	usrRoleDtl_context.getView().byId("roleName_txtId").setEnabled(isEnabled);
    	usrRoleDtl_context.getView().byId("roleDesc_txtId").setEnabled(isEnabled);
    	usrRoleDtl_context.getView().byId("roleStatus_selId").setEnabled(isEnabled);
    	usrRoleDtl_context.getView().byId("submit_usrRoleAccessDtl_btnId").setVisible(isEnabled);
    },
    bindUserRoleDetail:function(mData){
    	usrRoleDtl_context.getView().byId("roleName_txtId").setValue(mData.roleName);
    	usrRoleDtl_context.getView().byId("roleDesc_txtId").setValue(mData.roleDescription);
    	usrRoleDtl_context.getView().byId("roleStatus_selId").setSelectedKey(mData.activeStatusKey);
    },
    bindStatusDropDown:function(mData){
    	var status_cBoxId = usrRoleDtl_context.getView().byId("roleStatus_selId");
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
    bindAccessRightsTable:function(oData){
    	 var tblTemplate = new sap.m.ColumnListItem({
             cells: [new sap.m.Text({
                 text: "{groupName}",
             }),new sap.m.Text({
                 text: "{groupDescriptions}",
             }),new sap.m.CheckBox({
            	 enabled:false,
            	 selected:"{readAccess}"
             }),new sap.m.CheckBox({
            	 enabled:false,
            	 selected:"{createAccess}"
             }),new sap.m.CheckBox({
            	 enabled:false,
            	 selected:"{editAccess}"
             }),new sap.m.CheckBox({
            	 enabled:false,
            	 selected:"{deleteAccess}"
             }) ]
         });

         var oTable = usrRoleDtl_context.getView().byId("userRoleAccess_tblId");
         var oTblModel = new sap.ui.model.json.JSONModel(oData);
         oTable.setModel(oTblModel);
         oTable.bindAggregation("items", {
             path: "/navUserAccessRights",
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
                 var sAccessId = obj.accessId;
                 var cb = r.$().find('.sapMCb');
                 var oCb = sap.ui.getCore().byId(cb.attr('id'));
	       		  if(parseInt(sAccessId) > 0){
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
   validateUserRolesDetail:function(){
	 var msg = "";
	 	if(usrRoleDtl_context.getView().byId("roleName_txtId").getValue() === "")
	 		msg += "Please enter Role Name." + "\n";
	 	if(usrRoleDtl_context.getView().byId("roleStatus_selId").getSelectedKey() === "")
	 		msg += "Please select Status." + "\n";
	 	var oAccessRightTable = usrRoleDtl_context.getView().byId("userRoleAccess_tblId");
		if(oAccessRightTable.getSelectedItems().length === 0 )
			msg += "Please select alteast one or more User Access(s)." + "\n";
 		
	 return msg;
   },
   onSubmitPress:function(evt){
	   var msg = usrRoleDtl_context.validateUserRolesDetail();
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
                    	   usrRoleDtl_context.submitUserRoleDetail();
                       });
                   }
               }
           });
       } else {
           sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Error");
       }
   },
   getUserRolesDtlRequestBody:function(){
	 var requestBody = {};
	 var cModelData = sap.ui.getCore().getModel("contextModel").getData();
	 
	 requestBody.mode = cModelData.mode;
	 requestBody.schoolId = sessionStorage.getItem('schoolId');
	 requestBody.userId = sessionStorage.getItem('userId');
	 
	 var roleId = "0";
	 if(cModelData.mode === "EDIT")
		 roleId = cModelData.tableData.roleId;
	 
	 requestBody.navUserRoles = [];
	 requestBody.navUserRoles.push({
		 roleId:roleId,
		 roleName: usrRoleDtl_context.getView().byId("roleName_txtId").getValue(),
		 roleDescription: usrRoleDtl_context.getView().byId("roleDesc_txtId").getValue(),
		 activeStatusKey:usrRoleDtl_context.getView().byId("roleStatus_selId").getSelectedKey(),
	 });
	 
	 var oAccessRightsTable = usrRoleDtl_context.getView().byId("userRoleAccess_tblId");
	 requestBody.navUserAccessRights = [];
	 if(oAccessRightsTable.getItems().length > 0){
		 var oUserAccessRightSelItem = oAccessRightsTable.getSelectedItems();
		 for(var i = 0; i < oUserAccessRightSelItem.length; i++){
			 var accessRightObj = oUserAccessRightSelItem[i].getBindingContext().getObject();
			 var oElements = oUserAccessRightSelItem[i].findElements();
			 requestBody.navUserAccessRights.push({
				 "accessId": accessRightObj.accessId,
				 "groupId":accessRightObj.groupId,
				 "groupName":accessRightObj.groupName,
				 "groupDescriptions":accessRightObj.groupDescriptions,
				 "readAccess":oElements[2].getSelected(),
				 "createAccess":oElements[3].getSelected(),
				 "editAccess":oElements[4].getSelected(),
				 "deleteAccess":oElements[5].getSelected()
			 });
		 }
	 }
	 
	 return requestBody;
   },
   submitUserRoleDetail:function(){
	   var requestBody = usrRoleDtl_context.getUserRolesDtlRequestBody();
	   var saveResponse = new com.itec.sams.util.GetPostApiCall.postData("userRolesSet", requestBody);
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
                       usrRoleDtl_context.getRouter().navTo("UserRoles", bReplace);
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