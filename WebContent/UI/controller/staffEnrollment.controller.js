jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
jQuery.sap.require("com.itec.sams.util.formatter");
jQuery.sap.require("com.itec.sams.util.validator");
sap.ui.core.mvc.Controller.extend("com.itec.sams.controller.staffEnrollment", {
	onInit : function() {
		staffEnroll_context = this;
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
        if (sName !== "StaffEnrollment") {
            return;
        } else {
            oPageTitle.setText("Staff Enrollment");
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
            	staffEnroll_context.initialLoad();
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
    	var sUri = "schoolStaffGet?schoolId=" + sessionStorage.getItem('schoolId');
    	var oResponse = new com.itec.sams.util.GetPostApiCall.getData(sUri);
        if (oResponse != null) {
        	staffEnroll_context.bindTable(oResponse);
        }
    	oBusyDialog.close();
    },
    onCreateStaff: function(evt) {
		var mData = {
	            mode: "ADD",
	            tableData: []
	        };
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "contextModel");
        var bReplace = jQuery.device.is.phone ? false : true;
        staffEnroll_context.getRouter().navTo("StaffEnrollmentDetail", bReplace);
    },
    onFilterExpandPress: function(evt) {
        var oButton = evt.getSource();
        var oFilterPnl = feerRpt_context.getView().byId("filter_pnlId");
        var oTable = feerRpt_context.getView().byId("schoolStaffMaster_tblId");
        if (oButton.getText() === "Collapse") {
            oButton.setIcon("sap-icon://navigation-down-arrow");
            oButton.setText("Expand");
            oFilterPnl.setVisible(false);
        } else {
            oButton.setIcon("sap-icon://navigation-up-arrow");
            oButton.setText("Collapse");
            oFilterPnl.setVisible(true);
        }
        jQuery.sap.delayedCall(1, feerRpt_context, function() {
        	oTable.fireUpdateFinished(this);
        });
    },
    bindTable: function(mData) {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                    text: "{EmployeeNo}",
                }),
                new sap.m.Text({
                    text: "{firstName}",
                }),
                new sap.m.Text({
                    text: "{lastName}",
                }),
                new sap.m.Text({
                    text: "{path:'dateOfBirth',formatter:'com.itec.sams.util.formatter.date'}",
                }),
                new sap.m.Text({
                    text: "{cardNumber}",
                }),
                new sap.m.Text({
                    text: "{mobileNo}",
                }),
                new sap.m.Text({
                    text: "{emailId}",
                }),
                new sap.m.Text({
                    text:"{activeStatusText}"
                }),
                new sap.m.Button({
                    icon: "sap-icon://action",
                    type: "Default",
                    press: staffEnroll_context.onStaffEnrollmentTblActionPress
                })
            ]
        });
        var oTable = staffEnroll_context.getView().byId("schoolStaffMaster_tblId");
        oTable.setModel(new sap.ui.model.json.JSONModel(mData));
        oTable.bindAggregation("items", {
            path: "/navSchoolStaffDtl",
            template: tblTemplate,
            //templateShareable: true
        });
    },
    setSchoolStaffMasterTableHeight: function(evt) {
        var oTable = evt.getSource();
        var oScrollContainer = evt.getSource().getParent();
        if (oTable.getDomRef() !== null && sap.ui.Device.system.phone !== true) {
            var footerHeight = staffEnroll_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
            var tablePositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
            var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
            oScrollContainer.setHeight(String(scrollHeight + "px"));
            if(!jQuery.device.is.phone){
            	var tableHeight = oTable.getDomRef().getBoundingClientRect().height;
                var hdrTable = staffEnroll_context.getView().byId("hdr_schoolStaffMaster_tblId");
                if (tableHeight > scrollHeight) {
                	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(true);
                } else {
                	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(false);
                }
            }
        }
    },
    onStaffEnrollmentTblActionPress: function(evt) {
    	var actButtonRef = evt.getSource();
        var obj = evt.getSource().getParent().getBindingContext().getObject();
        if (!staffEnroll_context._actionSheet) {
            staffEnroll_context._actionSheet = sap.ui.xmlfragment("com.itec.sams.fragment.editDisDlt", staffEnroll_context);
            staffEnroll_context.getView().addDependent(staffEnroll_context._actionSheet);
        }
        var mData = {
            mode: "",
            tableData: obj
        };
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "contextModel");
        staffEnroll_context._actionSheet.openBy(actButtonRef);
    },
    onAsheetEdit: function(evt) {
        var contextModel = sap.ui.getCore().getModel("contextModel");
        if (contextModel != undefined) {
            contextModel.getData().mode = "EDIT";
            var bReplace = jQuery.device.is.phone ? false : true;
            staffEnroll_context.getRouter().navTo("StaffEnrollmentDetail", bReplace);
        }
    },
    onAsheetDisplay: function(evt) {
        var contextModel = sap.ui.getCore().getModel("contextModel");
        if (contextModel != undefined) {
            contextModel.getData().mode = "DISPLAY";
            var bReplace = jQuery.device.is.phone ? false : true;
            staffEnroll_context.getRouter().navTo("StaffEnrollmentDetail", bReplace);

        }
    }
});