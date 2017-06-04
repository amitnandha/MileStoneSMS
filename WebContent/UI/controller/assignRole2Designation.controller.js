jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
jQuery.sap.require("com.itec.sams.util.formatter");
jQuery.sap.require("com.itec.sams.util.validator");
sap.ui.core.mvc.Controller.extend("com.itec.sams.controller.assignRole2Designation", {
	onInit : function() {
		ar2Desig_context = this;
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
        if (sName !== "AssignRole2Designation") {
            return;
        } else {
            oPageTitle.setText("User Role Detail");
            var contextModel = sap.ui.getCore().getModel("contextModel");
            if (contextModel != undefined) {
	            oBusyDialog.open();
	            jQuery.sap.delayedCall(1, this, function() {
	            	ar2Desig_context.initialLoad();
	            });
            }else{
            	  var bReplace = jQuery.device.is.phone ? false : true;
            	  ar2Desig_context.getRouter().navTo("UserRoles", bReplace);
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
   	                    ar2Desig_context.getRouter().navTo("UserRoles", bReplace);
   	                }
   	            }
   	        });
   	 }else{
   		 sap.ui.getCore().setModel(null, "contextModel");
   	     var bReplace = jQuery.device.is.phone ? false : true;
   	     ar2Desig_context.getRouter().navTo("UserRoles", bReplace);
   	 }
   },
    initialLoad:function(){
    	ar2Desig_context.resetAssigRole2DesigDtl();
    	var cModelData = sap.ui.getCore().getModel("contextModel").getData();
      
    	ar2Desig_context.bindAssigRole2DesigDtl(cModelData.tableData);
      
    	var sUri = "assignRole2DesignationGet?schoolId=" + sessionStorage.getItem('schoolId') +
      		"&designationId=" + cModelData.tableData.designationId;
      
      	var oResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
      	if(oResponse != null){
      		ar2Desig_context.bindAssignUserRolesTable(oResponse);
      	}
      
      	
        if(cModelData.mode === "EDIT"){
        	ar2Desig_context.getView().byId("submit_assignRole2DesignDtl_btnId").setVisible(true);
        }else if(cModelData.mode === "DISPLAY"){
        	ar2Desig_context.getView().byId("submit_assignRole2DesignDtl_btnId").setVisible(false);
        }
        		  
      oBusyDialog.close();
   },
    resetAssigRole2DesigDtl:function(){
    	ar2Desig_context.getView().byId("designationName_txtId").setValue("");
    	ar2Desig_context.getView().byId("designationDesc_txtId").setValue("");
    	ar2Desig_context.getView().byId("assignUserRoles_tblId").unbindAggregation("items");
    },
    bindAssigRole2DesigDtl:function(mData){
    	ar2Desig_context.getView().byId("designationName_txtId").setValue(mData.designationName);
    	ar2Desig_context.getView().byId("designationDesc_txtId").setValue(mData.designationDescription);
    },
    bindAssignUserRolesTable:function(oData){
    	 var tblTemplate = new sap.m.ColumnListItem({
             cells: [new sap.m.Text({
                 text: "{roleName}",
             }),new sap.m.Text({
                 text: "{roleDescriptions}",
             })]
         });

         var oTable = ar2Desig_context.getView().byId("assignUserRoles_tblId");
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
   validateAssignRolesDetail:function(){
	 var msg = "";
	 	var oAssignRolesTable = ar2Desig_context.getView().byId("assignUserRoles_tblId");
		if(oAssignRolesTable.getSelectedItems().length === 0 )
			msg += "Please select alteast one or more User Role(s) to assign." + "\n";
 		
	 return msg;
   },
   onSubmitPress:function(evt){
	   var msg = ar2Desig_context.validateAssignRolesDetail();
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
                    	   ar2Desig_context.submitAR2DesignationDetail();
                       });
                   }
               }
           });
       } else {
           sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Error");
       }
   },
   getAR2DesignationDtlRequestBody:function(){
	 var requestBody = {};
	 var cModelData = sap.ui.getCore().getModel("contextModel").getData();
	 
	 if(cModelData.tableData.assignedId === "0" || cModelData.tableData.assignedId === null)
		 requestBody.mode = "ADD";
	 else
	 	requestBody.mode = "EDIT";
	 requestBody.schoolId = sessionStorage.getItem('schoolId');
	 requestBody.userId = sessionStorage.getItem('userId');
	 
	 var designationId = cModelData.tableData.designationId, assignedId = cModelData.tableData.assignedId;
	 
	 
	 requestBody.navDesignationDtl = [];
	 requestBody.navDesignationDtl.push({
		 assignedId:assignedId,
		 designationId:designationId,
		 designationName: ar2Desig_context.getView().byId("designationName_txtId").getValue(),
		 designationDescription: ar2Desig_context.getView().byId("designationDesc_txtId").getValue()
	 });
	 
	 var oAssignRolesTable = ar2Desig_context.getView().byId("assignUserRoles_tblId");
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
   submitAR2DesignationDetail:function(){
	   var requestBody = ar2Desig_context.getAR2DesignationDtlRequestBody();
	   var saveResponse = new com.itec.sams.util.GetPostApiCall.postData("assignRole2DesignationSet", requestBody);
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
                       ar2Desig_context.getRouter().navTo("UserRoles", bReplace);
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