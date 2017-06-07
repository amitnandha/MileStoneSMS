/*amit*/


jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
sap.ui.controller("com.itec.sams.controller.App", {
	onInit : function() {
		App_context = this;
		oPageTitle = this.getView().byId("pageTitle_titleId");
		oBusyDialog =  new sap.m.BusyDialog({
			text: "Please wait ..."
		})
		this._setLogonUser();
		App_context.initialLoad();
		this
	},
	initialLoad:function(){
		 var sUri = "menuListItemGet?schoolId=" + sessionStorage.getItem('schoolId')+ "&userId=" + sessionStorage.getItem("userId");
         var oResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
         App_context.getView().setModel(new sap.ui.model.json.JSONModel(oResponse), "userMenuModel");
        /* App_context.
         
         var oNavigationItemTemplate= new sap.tnt.NavigationListItem({
        	 text:"{menuText}",
        	 icon:"{menuIcon}",
        	 key:"{menuAction}"
         });
         var oNavigationList = App_context.getView().byId("mainMenu_navListId");
         oNavigationList.unbindAggregation();
         oNavigationList.setModel(new sap.ui.model.json.JSONModel(oResponse));*/
         
	},
	getEventBus : function() {
		return sap.ui.getCore().getEventBus();
	},
	getRouter : function() {
		return sap.ui.core.UIComponent.getRouterFor(this);
	},
	onSideNavButtonPress:function(evt){
		var viewId = this.getView().getId();
		var toolPage = sap.ui.getCore().byId(viewId + "--toolPage");
		var sideExpanded = toolPage.getSideExpanded();

		this._setToggleButtonTooltip(sideExpanded);

		toolPage.setSideExpanded(!toolPage.getSideExpanded());
	},
	_setToggleButtonTooltip : function(bLarge) {
		var toggleButton = this.getView().byId('sideNavigationToggleButton');
		if (bLarge) {
			toggleButton.setTooltip('Large Size Navigation');
		} else {
			toggleButton.setTooltip('Small Size Navigation');
		}
	},
	_setLogonUser:function(){
		if(sessionStorage.length > 0){
			if(!jQuery.device.is.phone)
				App_context.getView().byId("userName_btnId").setText(sessionStorage.getItem("userName"));
			else
				App_context.getView().byId("userName_btnId").setText("");
			App_context.getView().byId("schoolName_titleId").setText(sessionStorage.getItem("schoolName"));
			App_context.getView().byId("schoolCity_titleId").setText(sessionStorage.getItem("cityName"));
		}else
			window.location.href = window.location.pathname.replace("UI/index.html", "") + "index.html";
	},
	_destroyLogonUser:function(){
		sessionStorage.clear();
		window.location.href = window.location.pathname.replace("index.html", "") + "index.html";
	},
	
	onItemSelect:function(evt){
		var sKey = evt.getParameter('item').getKey();
		var sTitle = evt.getParameter('item').getText();
		if(sKey === "logoff")
			App_context.onPressLogOut();
		else{
			oPageTitle.setText(sTitle);
			if(jQuery.device.is.phone){
				var viewId = App_context.getView().getId();
				var toolPage = sap.ui.getCore().byId(viewId + "--toolPage");
				var sideExpanded = toolPage.getSideExpanded();
				if(sideExpanded === true){
					App_context._setToggleButtonTooltip(sideExpanded);
					toolPage.setSideExpanded(!sideExpanded);
				}
				
			}
			var bReplace = jQuery.device.is.phone ? false : true;
			App_context.getRouter().navTo(sKey, bReplace);
		}
	},
	onUserBtnPress:function(evt){
		var oButton = evt.getSource();
		if(jQuery.device.is.phone){
			if (!App_context._actionSheet) {
				App_context._actionSheet = sap.ui.xmlfragment(
					"com.itec.sams.fragment.useraction",
					App_context
				);
				App_context.getView().addDependent(this._actionSheet);
			}
			App_context._actionSheet.getButtons()[0].setText(sessionStorage.getItem("userName"));
			App_context._actionSheet.getButtons()[1].setText(sessionStorage.getItem("schoolName"));
			App_context._actionSheet.getButtons()[2].setText(sessionStorage.getItem("cityName"));
			App_context._actionSheet.openBy(oButton);
		}
	},
	onPressLogOut:function(){
		sap.m.MessageBox.show("Are you sure you want to logout?", {
          icon: sap.m.MessageBox.Icon.QUESTION,
          title: "Warning",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function(oAction) { 
        	  if(oAction === "YES"){
        		  App_context._destroyLogonUser();
        	  }
          }
		});
		
	}
});