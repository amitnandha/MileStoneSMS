jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
jQuery.sap.require("com.itec.sams.util.formatter");
jQuery.sap.require("com.itec.sams.util.validator");
sap.ui.core.mvc.Controller.extend("com.itec.sams.controller.userRoles", {
	onInit : function() {
		usrRole_context = this;
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
        if (sName !== "UserRoles") {
            return;
        } else {
            oPageTitle.setText("User Roles");
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
            	usrRole_context.initialLoad();
            });

        }
    },
    getEventBus: function() {
        return sap.ui.getCore().getEventBus();
    },
    getRouter: function() {
        return sap.ui.core.UIComponent.getRouterFor(this);
    },
    initialLoad:function(){
    	var oUserRoles_iconTabBar = usrRole_context.getView().byId("userRoles_itbId");
    	if(oUserRoles_iconTabBar.getSelectedKey() !== "userRoles")
    		oUserRoles_iconTabBar.setSelectedKey("userRoles");
    	usrRole_context.getUserRoles();
    },
    onUserRolesIconTabBarSelect:function(evt){
    	var sSelectedKey = evt.getSource().getSelectedKey();
    	if(sSelectedKey === "userRoles"){
    		 oBusyDialog.open();
             jQuery.sap.delayedCall(1, this, function() {
            	 usrRole_context.getUserRoles();
             });
    	}else{
    		oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
            	var oAssignRoles_iconTabBar = usrRole_context.getView().byId("assignRoles_itbId");
            	if(oAssignRoles_iconTabBar.getSelectedKey() !== "assignRoles2Designation")
            		oAssignRoles_iconTabBar.setSelectedKey("assignRoles2Designation");
            	usrRole_context.getAssignedRole2Designation();
            });
    	}
    		
    },
    onCreateUserRole: function(evt) {
		var mData = {
	            mode: "ADD",
	            tableData: []
	        };
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "contextModel");
        var bReplace = jQuery.device.is.phone ? false : true;
        usrRole_context.getRouter().navTo("UserRolesDetail", bReplace);
    },
    getUserRoles:function(evt){
    	var sUri = "userRolesGet?schoolId=" + sessionStorage.getItem('schoolId');
    	var oResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
        if (oResponse != null) {
        	usrRole_context.bindUserRolesTable(oResponse);
        }
        oBusyDialog.close();
    },
    bindUserRolesTable: function(mData) {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                    text: "{roleName}",
                }),
                new sap.m.Text({
                    text:"{roleDescription}"
                }),
                new sap.m.Text({
                    text:"{activeStatusText}"
                }),
                new sap.m.Button({
                    icon: "sap-icon://action",
                    type: "Default",
                    press: usrRole_context.onUserRoleTableActionPress
                })
            ]
        });
        var oTable = usrRole_context.getView().byId("userRoles_tblId");
        oTable.setModel(new sap.ui.model.json.JSONModel(mData));
        oTable.bindAggregation("items", {
            path: "/navUserRoles",
            template: tblTemplate,
            // templateShareable: true
        });
    },
    setUserRolesTableHeight: function(evt) {
        var oTable = evt.getSource();
        var oScrollContainer = evt.getSource().getParent();
        if (oTable.getDomRef() !== null && sap.ui.Device.system.phone !== true) {
            var footerHeight = usrRole_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
            var tablePositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
            var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
            oScrollContainer.setHeight(String(scrollHeight + "px"));
            if(!jQuery.device.is.phone){
            	var tableHeight = oTable.getDomRef().getBoundingClientRect().height;
                var hdrTable = usrRole_context.getView().byId("hdr_userRoles_tblId");
                if (tableHeight > scrollHeight) {
                	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(true);
                } else {
                	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(false);
                }
            }
        }
    },
    onUserRoleTableActionPress: function(evt) {
    	var actButtonRef = evt.getSource();
        var obj = evt.getSource().getParent().getBindingContext().getObject();
        if (!usrRole_context._actionSheet) {
            usrRole_context._actionSheet = sap.ui.xmlfragment("com.itec.sams.fragment.editDisDlt", usrRole_context);
            usrRole_context.getView().addDependent(usrRole_context._actionSheet);
        }
        var mData = {
            mode: "",
            tableData: obj
        };
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "contextModel");
        usrRole_context._actionSheet.openBy(actButtonRef);
    },
    onAsheetEdit: function(evt) {
        var contextModel = sap.ui.getCore().getModel("contextModel");
        if (contextModel != undefined) {
            contextModel.getData().mode = "EDIT";
            var bReplace = jQuery.device.is.phone ? false : true;
            var userRoles_iTBSelectedKey = usrRole_context.getView().byId("userRoles_itbId").getSelectedKey();
            if(userRoles_iTBSelectedKey === "userRoles")
            	usrRole_context.getRouter().navTo("UserRolesDetail", bReplace);
            else if(userRoles_iTBSelectedKey === "assignRoles"){
            	 var assignRole_iTBSelectedKey = usrRole_context.getView().byId("assignRoles_itbId").getSelectedKey();
            	 if(assignRole_iTBSelectedKey === "assignRoles2Designation"){
            		 usrRole_context.getRouter().navTo("AssignRole2Designation", bReplace);
            	 }else if(assignRole_iTBSelectedKey === "assignRoles2UserGrp"){
            		 usrRole_context.getRouter().navTo("UserGroupDetail", bReplace);
            	 }else if(assignRole_iTBSelectedKey === "assignRoles2User"){
            		 
            	 }
            }
        }
    },
    onAsheetDisplay: function(evt) {
        var contextModel = sap.ui.getCore().getModel("contextModel");
        if (contextModel != undefined) {
            contextModel.getData().mode = "DISPLAY";
            var bReplace = jQuery.device.is.phone ? false : true;
            var userRoles_iTBSelectedKey = usrRole_context.getView().byId("userRoles_itbId").getSelectedKey();
            if(userRoles_iTBSelectedKey === "userRoles")
            	usrRole_context.getRouter().navTo("UserRolesDetail", bReplace);
            else if(userRoles_iTBSelectedKey === "assignRoles"){
            	 var assignRole_iTBSelectedKey = usrRole_context.getView().byId("assignRoles_itbId").getSelectedKey();
            	 if(assignRole_iTBSelectedKey === "assignRoles2Designation"){
            		 usrRole_context.getRouter().navTo("AssignRole2Designation", bReplace);
            	 }else if(assignRole_iTBSelectedKey === "assignRoles2UserGrp"){
            		 usrRole_context.getRouter().navTo("UserGroupDetail", bReplace);
            	 }else if(assignRole_iTBSelectedKey === "assignRoles2User"){
            		 
            	 }
            }
        }
    },
    onAssignRoleIconTabBarSelect:function(evt){
    	var sSelectedKey = evt.getSource().getSelectedKey();
    	if(sSelectedKey === "assignRoles2Designation"){
    		oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
            	usrRole_context.getAssignedRole2Designation();
            });
    	}else if(sSelectedKey === "assignRoles2UserGrp"){
    		oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
            	usrRole_context.getUserGroupMaster();
            });
    	}
    },
    getAssignedRole2Designation:function(){
    	var sUri = "assignRole2DesignationGet?schoolId=" + sessionStorage.getItem('schoolId');
    	var oResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
        if (oResponse != null) {
        	usrRole_context.bindAssignedRoleDesignationTable(oResponse);
        }
        oBusyDialog.close();
    },
    bindAssignedRoleDesignationTable:function(mData){
    	var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                    text: "{designationName}",
                }),
                new sap.m.Text({
                    text:"{designationDescription}"
                }),
                new sap.m.Text({
                    text:"{assignedStatusText}"
                }),
                new sap.m.Button({
                    icon: "sap-icon://action",
                    type: "Default",
                    press: usrRole_context.onAssignRole2DesignationTblActionPress
                })
            ]
        });
        var oTable = usrRole_context.getView().byId("assignRole2Designation_tblId");
        oTable.setModel(new sap.ui.model.json.JSONModel(mData));
        oTable.bindAggregation("items", {
            path: "/navDesignationDtl",
            template: tblTemplate,
            // templateShareable: true
        });
    },
    onAssignRole2DesignationTblActionPress:function(evt){
    	var actButtonRef = evt.getSource();
        var obj = evt.getSource().getParent().getBindingContext().getObject();
        if (!usrRole_context._actionSheet) {
            usrRole_context._actionSheet = sap.ui.xmlfragment("com.itec.sams.fragment.editDisDlt", usrRole_context);
            usrRole_context.getView().addDependent(usrRole_context._actionSheet);
        }
        var mData = {
            mode: "",
            tableData: obj
        };
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "contextModel");
        usrRole_context._actionSheet.openBy(actButtonRef);
    },
    setAssignRole2DesignationTableHeight:function(evt){
   	 	var oTable = evt.getSource();
        var oScrollContainer = evt.getSource().getParent();
        if (oTable.getDomRef() !== null && sap.ui.Device.system.phone !== true) {
            var footerHeight = usrRole_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
            var tablePositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
            var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
            oScrollContainer.setHeight(String(scrollHeight + "px"));
            if(!jQuery.device.is.phone){
            	var tableHeight = oTable.getDomRef().getBoundingClientRect().height;
                var hdrTable = usrRole_context.getView().byId("hdr_assignRole2Designation_tblId");
                if (tableHeight > scrollHeight) {
                	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(true);
                } else {
                	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(false);
                }
            }
        }
   },
   onCreateUserGroup:function(evt){
	   var mData = {
	            mode: "ADD",
	            tableData: []
	        };
       sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "contextModel");
       var bReplace = jQuery.device.is.phone ? false : true;
       usrRole_context.getRouter().navTo("UserGroupDetail", bReplace);
   },
   getUserGroupMaster:function(){
   	var sUri = "userGroupMasterGet?schoolId=" + sessionStorage.getItem('schoolId');
   	var oResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
       if (oResponse != null) {
       	usrRole_context.bindUserGroupMasterTable(oResponse);
       }
       oBusyDialog.close();
   },
   bindUserGroupMasterTable:function(mData){
   	var tblTemplate = new sap.m.ColumnListItem({
           cells: [new sap.m.Text({
                   text: "{userGroupName}",
               }),
               new sap.m.Text({
                   text:"{userGroupDescriptions}"
               }),
               new sap.m.Text({
                   text:"{activeStatusText}"
               }),
               new sap.m.Button({
                   icon: "sap-icon://action",
                   type: "Default",
                   press: usrRole_context.onUserGroupMasterTableActionPress
               })
           ]
       });
       var oTable = usrRole_context.getView().byId("assignRole2UserGrp_tblId");
       oTable.setModel(new sap.ui.model.json.JSONModel(mData));
       oTable.bindAggregation("items", {
           path: "/navUserGroupMaster",
           template: tblTemplate,
           // templateShareable: true
       });
   },
   onUserGroupMasterTableActionPress:function(evt){
		  var actButtonRef = evt.getSource();
	      var obj = evt.getSource().getParent().getBindingContext().getObject();
	      if (!usrRole_context._actionSheet) {
	          usrRole_context._actionSheet = sap.ui.xmlfragment("com.itec.sams.fragment.editDisDlt", usrRole_context);
	          usrRole_context.getView().addDependent(usrRole_context._actionSheet);
	      }
	      var mData = {
	          mode: "",
	          tableData: obj
	      };
	      sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "contextModel");
	      usrRole_context._actionSheet.openBy(actButtonRef);
	},
   setAssignRole2UserGrpTableHeight:function(evt){
  	 var oTable = evt.getSource();
       var oScrollContainer = evt.getSource().getParent();
       if (oTable.getDomRef() !== null && sap.ui.Device.system.phone !== true) {
           var footerHeight = usrRole_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
           var tablePositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
           var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
           oScrollContainer.setHeight(String(scrollHeight + "px"));
           if(!jQuery.device.is.phone){
           	var tableHeight = oTable.getDomRef().getBoundingClientRect().height;
               var hdrTable = usrRole_context.getView().byId("hdr_assignRole2UserGrp_tblId");
               if (tableHeight > scrollHeight) {
               	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(true);
               } else {
               	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(false);
               }
           }
       }
  },
  
   setAssignRole2UserTableHeight:function(evt){
    	 var oTable = evt.getSource();
         var oScrollContainer = evt.getSource().getParent();
         if (oTable.getDomRef() !== null && sap.ui.Device.system.phone !== true) {
             var footerHeight = usrRole_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
             var tablePositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
             var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
             oScrollContainer.setHeight(String(scrollHeight + "px"));
             if(!jQuery.device.is.phone){
             	var tableHeight = oTable.getDomRef().getBoundingClientRect().height;
                 var hdrTable = usrRole_context.getView().byId("hdr_assignRole2User_tblId");
                 if (tableHeight > scrollHeight) {
                 	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(true);
                 } else {
                 	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(false);
                 }
             }
         }
    }
});