jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
jQuery.sap.require("com.itec.sams.util.formatter");
sap.ui.core.mvc.Controller.extend("com.itec.sams.controller.reports", {

	onInit: function() {
		rpt_context = this;
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
        if (sName !== "Reports") {
            return;
        } else {
            oPageTitle.setText("Reports");
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
            	rpt_context.initialLoad();
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
    	oBusyDialog.close();
    },
    onReportListItemPress:function(evt){
    	var obj = evt.getSource().getBindingContext("reportListModel").getObject();
    	var bReplace = jQuery.device.is.phone ? false : true;
    	rpt_context.getRouter().navTo(obj.itemAction, bReplace);
    }
});