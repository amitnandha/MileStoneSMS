jQuery.sap.require("com.itec.sams.util.formatter");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
jQuery.sap.require("sap.m.MessageBox");
sap.ui.controller("com.itec.sams.controller.holidayNWeeklyOff", {
    onInit: function() {
        HNWOff_context = this;
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
        if (sName !== "HolidayNWeeklyOff") {
            return;
        } else {
            oPageTitle.setText("Holiday - Weekly Off");
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
            	HNWOff_context.initialLoad();
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
    	oBusyDialog.close();
    },
    onHolidayNWeeklyOffTabSelect:function(evt){
    	
    },
});