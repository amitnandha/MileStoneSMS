jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
jQuery.sap.require("com.itec.sams.util.formatter");
jQuery.sap.require("com.itec.sams.util.validator");
sap.ui.core.mvc.Controller.extend("com.itec.sams.controller.screenGroupMaster", {
	onInit : function() {
		screenGrp_context = this;
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
        if (sName !== "ScreenGroupMaster") {
            return;
        } else {
            oPageTitle.setText("Screen Groups");
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
            	screenGrp_context.initialLoad();
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
    	var sUri = "uiScreensGroupMasterGet?schoolId=" + sessionStorage.getItem('schoolId');
    	var oResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
        if (oResponse != null) {
        	screenGrp_context.bindTable(oResponse);
        }
    	oBusyDialog.close();
    },
    onCreateScreenGroup: function(evt) {
		var mData = {
	            mode: "ADD",
	            tableData: []
	        };
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "contextModel");
        var bReplace = jQuery.device.is.phone ? false : true;
        screenGrp_context.getRouter().navTo("ScreenGroupMasterDetail", bReplace);
    },
    bindTable: function(mData) {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                    text: "{screenGroupName}",
                }),
                new sap.m.Text({
                    text:"{screenGroupDescriptions}"
                }),
                new sap.m.Text({
                    text:"{activeStatusText}"
                }),
                new sap.m.Button({
                    icon: "sap-icon://action",
                    type: "Default",
                    press: screenGrp_context.onScreenGroupMasterTblActionPress
                })
            ]
        });
        var oTable = screenGrp_context.getView().byId("screenGroupMaster_tblId");
        oTable.setModel(new sap.ui.model.json.JSONModel(mData));
        oTable.bindAggregation("items", {
            path: "/navUIScreenGroupMaster",
            template: tblTemplate,
            //templateShareable: true
        });
    },
    setScreenGroupMasterTableHeight: function(evt) {
        var oTable = evt.getSource();
        var oScrollContainer = evt.getSource().getParent();
        if (oTable.getDomRef() !== null && sap.ui.Device.system.phone !== true) {
            var footerHeight = screenGrp_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
            var tablePositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
            var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
            oScrollContainer.setHeight(String(scrollHeight + "px"));
            if(!jQuery.device.is.phone){
            	var tableHeight = oTable.getDomRef().getBoundingClientRect().height;
                var hdrTable = screenGrp_context.getView().byId("hdr_screenGroupMaster_tblId");
                if (tableHeight > scrollHeight) {
                	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(true);
                } else {
                	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(false);
                }
            }
        }
    },
    onScreenGroupMasterTblActionPress: function(evt) {
    	var actButtonRef = evt.getSource();
        var obj = evt.getSource().getParent().getBindingContext().getObject();
        if (!screenGrp_context._actionSheet) {
            screenGrp_context._actionSheet = sap.ui.xmlfragment("com.itec.sams.fragment.editDisDlt", screenGrp_context);
            screenGrp_context.getView().addDependent(screenGrp_context._actionSheet);
        }
        var mData = {
            mode: "",
            tableData: obj
        };
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "contextModel");
        screenGrp_context._actionSheet.openBy(actButtonRef);
    },
    onAsheetEdit: function(evt) {
        var contextModel = sap.ui.getCore().getModel("contextModel");
        if (contextModel != undefined) {
            contextModel.getData().mode = "EDIT";
            var bReplace = jQuery.device.is.phone ? false : true;
            screenGrp_context.getRouter().navTo("ScreenGroupMasterDetail", bReplace);
        }
    },
    onAsheetDisplay: function(evt) {
        var contextModel = sap.ui.getCore().getModel("contextModel");
        if (contextModel != undefined) {
            contextModel.getData().mode = "DISPLAY";
            var bReplace = jQuery.device.is.phone ? false : true;
            screenGrp_context.getRouter().navTo("ScreenGroupMasterDetail", bReplace);

        }
    }
});