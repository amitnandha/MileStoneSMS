sap.ui.controller("com.itec.sams.controller.myProfile", {
    onInit: function() {
        MP_context = this;
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
    getRouter: function() {
        return sap.ui.core.UIComponent.getRouterFor(this);
    },
    onRouteMatched: function(evt) {
        var sName = evt.getParameter("name");
        if (sName !== "MyProfile") {
            return;
        } else {
            oPageTitle.setText("My Profile");
            MP_context.initialLoad();
        }

    },

    initialLoad: function() {

    }

});