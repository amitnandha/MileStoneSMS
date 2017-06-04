jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
jQuery.sap.require("com.itec.sams.util.formatter");
jQuery.sap.require("com.itec.sams.util.validator");
sap.ui.core.mvc.Controller.extend("com.itec.sams.controller.screenGroupMasterDetail", {
	onInit : function() {
		screenGrpDtl_context = this;
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
        if (sName !== "ScreenGroupMasterDetail") {
            return;
        } else {
            oPageTitle.setText("Screen Group Details");
            var contextModel = sap.ui.getCore().getModel("contextModel");
            if (contextModel != undefined) {
	            oBusyDialog.open();
	            jQuery.sap.delayedCall(1, this, function() {
	            	screenGrpDtl_context.initialLoad();
	            });
            }else{
            	  var bReplace = jQuery.device.is.phone ? false : true;
            	  screenGrpDtl_context.getRouter().navTo("ScreenGroupMaster", bReplace);
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
   	                 screenGrpDtl_context.getRouter().navTo("ScreenGroupMaster", bReplace);
   	                }
   	            }
   	        });
   	 }else{
   		 sap.ui.getCore().setModel(null, "contextModel");
   	     var bReplace = jQuery.device.is.phone ? false : true;
   	     screenGrpDtl_context.getRouter().navTo("ScreenGroupMaster", bReplace);
   	 }
   },
    initialLoad:function(){
	  var queryStatus = {
          mode: "STATUS",
          schoolId: sessionStorage.getItem('schoolId'),
          key: ""
      }
	  screenGrpDtl_context.resetScreenGroupMasterDetail();
	  
      var valueStatus = new com.itec.sams.util.GetPostApiCall.postData("f4HelpDataGet", queryStatus);
      if (valueStatus != null)
        	  screenGrpDtl_context.bindStatusDropDown(valueStatus);
      
      var cModelData = sap.ui.getCore().getModel("contextModel").getData();
      var sUri = "uiScreensDtl4ScreensGroupGet?schoolId=" + sessionStorage.getItem('schoolId') +
      		"&uiScreensGroupMasterId=0&mode=ADD";
      if(cModelData.mode === "DISPLAY" || cModelData.mode === "EDIT")
    	  sUri = "uiScreensDtl4ScreensGroupGet?schoolId=" + sessionStorage.getItem('schoolId') +
    		"&uiScreensGroupMasterId=" + cModelData.tableData.masterGroupId + "&mode=EDIT";
      
      	var oScreenGroupDtlResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
      	if(oScreenGroupDtlResponse != null){
      		screenGrpDtl_context.bindScreenGroupTable(oScreenGroupDtlResponse);
      		screenGrpDtl_context.bindSubScreenGroupTable(oScreenGroupDtlResponse);
      	}
      
      	
        if(cModelData.mode === "ADD"){
      	  screenGrpDtl_context.setScreenGroupMasterDetailEnabled(true);
        }else if(cModelData.mode === "EDIT"){
      	  screenGrpDtl_context.bindScreenGroupMasterDetail(cModelData.tableData);
      	  screenGrpDtl_context.setScreenGroupMasterDetailEnabled(true);
        }else if(cModelData.mode === "DISPLAY"){
      	  screenGrpDtl_context.bindScreenGroupMasterDetail(cModelData.tableData);
      	  screenGrpDtl_context.setScreenGroupMasterDetailEnabled(false);
        }
        		  
      oBusyDialog.close();
   },
    resetScreenGroupMasterDetail:function(){
    	screenGrpDtl_context.getView().byId("grpName_txtId").setValue("");
    	screenGrpDtl_context.getView().byId("grpDesc_txtId").setValue("");
    	screenGrpDtl_context.getView().byId("grpStatus_selId").setSelectedKey("");
    	screenGrpDtl_context.getView().byId("screenGroup_tblId").unbindAggregation("items");
    	screenGrpDtl_context.getView().byId("subScreenGroup_tblId").unbindAggregation("items");
    },
    setScreenGroupMasterDetailEnabled:function(isEnabled){
    	screenGrpDtl_context.getView().byId("grpName_txtId").setEnabled(isEnabled);
    	screenGrpDtl_context.getView().byId("grpDesc_txtId").setEnabled(isEnabled);
    	screenGrpDtl_context.getView().byId("grpStatus_selId").setEnabled(isEnabled);
    	screenGrpDtl_context.getView().byId("submit_screenGrpMasterDtl_btnId").setVisible(isEnabled);
    },
    bindScreenGroupMasterDetail:function(mData){
    	screenGrpDtl_context.getView().byId("grpName_txtId").setValue(mData.screenGroupName);
    	screenGrpDtl_context.getView().byId("grpDesc_txtId").setValue(mData.screenGroupDescriptions);
    	screenGrpDtl_context.getView().byId("grpStatus_selId").setSelectedKey(mData.activeStatusKey);
    },
    bindStatusDropDown:function(mData){
    	var status_cBoxId = screenGrpDtl_context.getView().byId("grpStatus_selId");
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
    bindScreenGroupTable:function(oData){
    	 var tblTemplate = new sap.m.ColumnListItem({
             cells: [new sap.m.Text({
                 text: "{screenTitle}",
             }),new sap.m.Text({
                 text: "{screenDescriptions}",
             }) ]
         });

         var oTable = screenGrpDtl_context.getView().byId("screenGroup_tblId");
         var oTblModel = new sap.ui.model.json.JSONModel(oData);
         oTable.setModel(oTblModel);
         oTable.bindAggregation("items", {
             path: "/navUIScreenGroup",
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
                 var sScreenGroupId = obj.screenGroupId;
                 var cb = r.$().find('.sapMCb');
                 var oCb = sap.ui.getCore().byId(cb.attr('id'));
	       		  if(parseInt(sScreenGroupId) > 0){
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
    bindSubScreenGroupTable:function(oData){
   	 var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                text: "{subScreenTitle}",
            }),new sap.m.Text({
                text: "{screenTitle}",
            }),new sap.m.Text({
                text: "{subScreenDescriptions}",
            }) ]
        });

        var oTable = screenGrpDtl_context.getView().byId("subScreenGroup_tblId");
        var oTblModel = new sap.ui.model.json.JSONModel(oData);
        oTable.setModel(oTblModel);
        oTable.bindAggregation("items", {
            path: "/navUISubScreenGroup",
            template: tblTemplate
        });
        if(oData.navUISubScreenGroup.length > 0)
        	screenGrpDtl_context.getView().byId("subScreens_pnlId").setVisible(true);
        else
        	screenGrpDtl_context.getView().byId("subScreens_pnlId").setVisible(false);
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
                var sScreenGroupId = obj.subScreenGroupId;
                var cb = r.$().find('.sapMCb');
                var oCb = sap.ui.getCore().byId(cb.attr('id'));
	       		  if(parseInt(sScreenGroupId) > 0){
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
   validateScreenGroupDetail:function(){
	 var msg = "";
	 	if(screenGrpDtl_context.getView().byId("grpName_txtId").getValue() === "")
	 		msg += "Please enter Group Name." + "\n";
	 	if(screenGrpDtl_context.getView().byId("grpStatus_selId").getSelectedKey() === "")
	 		msg += "Please select Status." + "\n";
	 	var oScreensTable = screenGrpDtl_context.getView().byId("screenGroup_tblId");
	 	var oSubScreensTable = screenGrpDtl_context.getView().byId("subScreenGroup_tblId");
 		if(oScreensTable.getItems().length > 0 && oSubScreensTable.getItems().length > 0){
 			if(oScreensTable.getSelectedItems().length === 0 && oSubScreensTable.getSelectedItems().length === 0 )
 				msg += "Please select alteast one or more User Screen(s)." + "\n";
 		}else if(oScreensTable.getItems().length > 0 && oSubScreensTable.getItems().length === 0){
 			if(oScreensTable.getSelectedItems().length === 0)
 				msg += "Please select alteast one or more User Screen(s)." + "\n";
 		}else if(oScreensTable.getItems().length === 0 && oSubScreensTable.getItems().length > 0){
 			if(oSubScreensTable.getSelectedItems().length === 0 )
 				msg += "Please select alteast one or more User Screen(s)." + "\n";
 		}
	 return msg;
   },
   onSubmitPress:function(evt){
	   var msg = screenGrpDtl_context.validateScreenGroupDetail();
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
                    	   screenGrpDtl_context.submitScreensGroupDetail();
                       });
                   }
               }
           });
       } else {
           sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Error");
       }
   },
   getScreenGroupsDtlRequestBody:function(){
	 var requestBody = {};
	 var cModelData = sap.ui.getCore().getModel("contextModel").getData();
	 
	 requestBody.mode = cModelData.mode;
	 requestBody.schoolId = sessionStorage.getItem('schoolId');
	 requestBody.userId = sessionStorage.getItem('userId');
	 
	 var uiScreenGroupMasterGroupId = "0";
	 if(cModelData.mode === "EDIT")
		 uiScreenGroupMasterGroupId = cModelData.tableData.masterGroupId;
	 
	 requestBody.navUIScreenGroupMaster = [];
	 requestBody.navUIScreenGroupMaster.push({
		 masterGroupId:uiScreenGroupMasterGroupId,
		 screenGroupName: screenGrpDtl_context.getView().byId("grpName_txtId").getValue(),
		 screenGroupDescriptions: screenGrpDtl_context.getView().byId("grpDesc_txtId").getValue(),
		 activeStatusKey:screenGrpDtl_context.getView().byId("grpStatus_selId").getSelectedKey(),
	 });
	 
	 var oScreensTable = screenGrpDtl_context.getView().byId("screenGroup_tblId");
	 requestBody.navUIScreenGroup = [];
	 if(oScreensTable.getItems().length > 0){
		 var oScreenSelectedItems = oScreensTable.getSelectedItems();
		 for(var i = 0; i < oScreenSelectedItems.length; i++){
			 var screenObj = oScreenSelectedItems[i].getBindingContext().getObject();
			 requestBody.navUIScreenGroup.push({
				 "screenGroupId": screenObj.screenGroupId,
				 "screenId":screenObj.screenId,
				 "screenIcon":screenObj.screenIcon,
				 "screenTitle":screenObj.screenTitle,
				 "screenName":screenObj.screenName,
				 "screenDescriptions":screenObj.screenDescriptions
			 });
		 }
	 }
	 
	 var oSubScreensTable = screenGrpDtl_context.getView().byId("subScreenGroup_tblId");
	 requestBody.navUISubScreenGroup = [];
	 if(oSubScreensTable.getItems().length > 0){
		 var oSubScreenSelectedItems = oScreensTable.getSelectedItems();
		 for(var i = 0; i < oSubScreenSelectedItems.length; i++){
			 var subScreenObj = oSubScreenSelectedItems[i].getBindingContext().getObject();
			 requestBody.navUISubScreenGroup.push({
				 "subScreenGroupId":subScreenObj.subScreenGroupId,
				 "screenId":subScreenObj.screenId,
				 "screenIcon":subScreenObj.screenIcon,
				 "screenTitle":subScreenObj.screenTitle,
				 "screenName":subScreenObj.screenName,
				 "screenDescriptions":subScreenObj.screenDescriptions,
				 "subScreenId":subScreenObj.subScreenId,
				 "subScreenIcon":subScreenObj.subScreenIcon,
				 "subScreenTitle":subScreenObj.subScreenTitle,
				 "subScreenName":subScreenObj.subScreenName,
				 "subScreenDescriptions":subScreenObj.subScreenDescriptions
			 });
		 }
	 }
	 
	 return requestBody;
   },
   submitScreensGroupDetail:function(){
	   var requestBody = screenGrpDtl_context.getScreenGroupsDtlRequestBody();
	   var saveResponse = new com.itec.sams.util.GetPostApiCall.postData("uiScreensGroupMasterSet", requestBody);
       if (saveResponse != null) {
           if (saveResponse.msgType === "S") {
               sap.m.MessageBox.show(saveResponse.msg, {
                   icon: sap.m.MessageBox.Icon.SUCCESS,
                   title: "Success",
                   styleClass: "sapUiSizeCompact",
                   onClose: function(action) {
                	   sap.ui.getCore().setModel(null, "contextModel");
                       var bReplace = jQuery.device.is.phone ? false : true;
                       screenGrpDtl_context.getRouter().navTo("ScreenGroupMaster", bReplace);
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