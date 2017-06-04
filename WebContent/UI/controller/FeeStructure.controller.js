jQuery.sap.require("com.itec.sams.util.formatter");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
sap.ui.core.mvc.Controller.extend("com.itec.sams.controller.FeeStructure", {
    onInit: function() {
        FS_context = this;
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
        if (sName !== "FeeStructure") {
            return;
        } else {
            oPageTitle.setText("Fee Structure");
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
                FS_context.initialLoad();
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
        var query = {
            schoolId: sessionStorage.getItem('schoolId'),
            skip: 0,
            top: 1000,
        };

        var oFeeStructureResponse = new com.itec.sams.util.GetPostApiCall.postData("FeeStructureDetailGet", query);
        if (oFeeStructureResponse != null) {
        	FS_context.designExistsCount = oFeeStructureResponse.designExist;
            FS_context.bindTable(oFeeStructureResponse);
        }
        oBusyDialog.close();
    },
    onPressFeeDesign: function(evt) {
    	if(FS_context.getView().byId("classFeeStructureMaster_tblId").getItems().length > 0){
    		  sap.m.MessageBox.confirm("If you change your existing Fee Structure " +
    		  		"Design then it will affect your Fee Structure.\n\n Are you sure you want to change?", {
                  icon: sap.m.MessageBox.Icon.QUESION,
                  title: "Confirmation",
                  actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                  styleClass: "sapUiSizeCompact",
                  onClose: function(action) {
                      if (action === "YES"){
                    	  var bReplace = jQuery.device.is.phone ? false : true;
                          FS_context.getRouter().navTo("FeeStructureDesign", bReplace);
                      }
                  }
    		  });
    	}else{
    		var bReplace = jQuery.device.is.phone ? false : true;
            FS_context.getRouter().navTo("FeeStructureDesign", bReplace);
    	}
        
    },
    onPressCreateFeeStructure: function(evt) {
    	if(FS_context.designExistsCount != 0){
    		var mData = {
    	            mode: "ADD",
    	            tableData: []
    	        };
    	        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "contextModel");
    	        var bReplace = jQuery.device.is.phone ? false : true;
    	        FS_context.getRouter().navTo("FeeStructureDetail", bReplace);
    	}else{
    		sap.m.MessageBox.show("Please first design your Fee Structure.", sap.m.MessageBox.Icon.ERROR, "ERROR");
    	}
        
    },
    bindTable: function(mData) {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                    text: "{className}",
                }),
                new sap.m.Text({
                    text:{
                    	path:'totalMonthlyAmount',
                    	formatter:function(value){
                    		return " " + (parseInt(value)).toFixed(2);
                    	}
                    },
                }).addStyleClass("fa fa-inr"),
                new sap.m.Text({
                    text: {
                    	path:'totalYearlyAmount',
                    	formatter:function(value){
                    		return " " + (parseInt(value)).toFixed(2);
                    	}
                    },
                }).addStyleClass("fa fa-inr"),
                new sap.m.Text({
                    text: {
                    	parts:[
                    		{path:'totalMonthlyAmount'},
                    		{path:'totalYearlyAmount'},
                    	],
                    	formatter:function(val1, val2){
                    		return " " + ((parseInt(val1) * 12) + parseInt(val2)).toFixed(2);
                    	}
                    }
                }).addStyleClass("fa fa-inr"),
                new sap.m.Button({
                    icon: "sap-icon://action",
                    type: "Default",
                    press: FS_context.onFeeStructureTableActionPress
                })
            ]
        });
        var oTable = FS_context.getView().byId("classFeeStructureMaster_tblId");
        oTable.setModel(new sap.ui.model.json.JSONModel(mData));
        oTable.bindAggregation("items", {
            path: "/navFeeStructure",
            template: tblTemplate,
            //templateShareable: true
        });
    },
    setFeeStructureTableHeight: function(evt) {
        var oTable = evt.getSource();
        var oScrollContainer = evt.getSource().getParent();
        if (oTable.getDomRef() !== null && sap.ui.Device.system.phone !== true) {
            var footerHeight = FS_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
            var tablePositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
            var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
            oScrollContainer.setHeight(String(scrollHeight + "px"));
            if(!jQuery.device.is.phone){
            	var tableHeight = oTable.getDomRef().getBoundingClientRect().height;
                var hdrTable = FS_context.getView().byId("hdr_classFeeStructureMaster_tblId");
                if (tableHeight > scrollHeight) {
                	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(true);
                } else {
                	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(false);
                }
            }
        }
    },
    onFeeStructureTableActionPress: function(evt) {
    	var actButtonRef = evt.getSource();
        var obj = evt.getSource().getParent().getBindingContext().getObject();
        if (!FS_context._actionSheet) {
            FS_context._actionSheet = sap.ui.xmlfragment("com.itec.sams.fragment.editDisDlt", FS_context);
            FS_context.getView().addDependent(FS_context._actionSheet);
        }
        var mData = {
            mode: "",
            tableData: obj
        };
        sap.ui.getCore().setModel(new sap.ui.model.json.JSONModel(mData), "contextModel");
        FS_context._actionSheet.openBy(actButtonRef);
    },
    onAsheetEdit: function(evt) {
        var contextModel = sap.ui.getCore().getModel("contextModel");
        if (contextModel != undefined) {
            contextModel.getData().mode = "EDIT";
            var bReplace = jQuery.device.is.phone ? false : true;
            FS_context.getRouter().navTo("FeeStructureDetail", bReplace);
        }
    },
    onAsheetDisplay: function(evt) {
        var contextModel = sap.ui.getCore().getModel("contextModel");
        if (contextModel != undefined) {
            contextModel.getData().mode = "DISPLAY";
            var bReplace = jQuery.device.is.phone ? false : true;
            FS_context.getRouter().navTo("FeeStructureDetail", bReplace);

        }
    }

});