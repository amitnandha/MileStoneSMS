jQuery.sap.declare("com.itec.sams.Component");
jQuery.sap.require("sap.ui.core.UIComponent");
jQuery.sap.require("sap.ui.core.routing.History");
jQuery.sap.require("sap.m.routing.RouteMatchedHandler");
jQuery.sap.require("com.itec.sams.util.xlsx");
jQuery.sap.require("com.itec.sams.util.base64");
jQuery.sap.require("com.itec.sams.util.jszip");

var dataSource = "http://localhost:54500/api/SMSAppSrv",
    comGlob = {};

sap.ui.core.UIComponent.extend("com.itec.sams.Component", {
    metadata: {
        name: "ZSAMSApp",
        version: "1.0.0",
        library: "com.itec.sams",
        includes: ["nfc/plugin.xml", "util/jszip.js", "util/xlsx.js", "../css/style.css", "../css/font-awesome.min.css",
            "library/amcharts/amcharts.js", "library/amcharts/serial.js", "library/amcharts/pie.js", "library/amcharts/themes/light.js",
            "library/amcharts/themes/patterns.js", "library/amcharts/plugins/responsive/responsive.js"
        ], //
        dependencies: {
            libs: ["sap.m", "sap.ui.layout"],
            components: []
        },
        config: {
            resourceBundle: "i18n/messageBundle.properties",
            serviceConfig: {
                /*name: "ZBANK",
				serviceUrl: "/sap/opu/odata/sap/ZBANK/"*/
            }
        },
        routing: {
            config: {
                viewType: "XML",
                viewPath: "com.itec.sams.view",
                targetControl: "fioriContent",
                targetAggregation: "pages",
                clearTarget: false,
                transition: "slide"
            },
            routes: [{
                pattern: "",
                name: "DashBoard",
                view: "dashboard"
            }, {
                pattern: "MP",
                name: "MyProfile",
                view: "myProfile"
            }, {
                pattern: "MS",
                name: "MySetting",
                view: "mySetting"
            }, {
                pattern: "SP",
                name: "ShiftPlanning",
                view: "shiftPlanning"
            }, {
                pattern: "SPA/{action}",
                name: "ShiftPlanDetail",
                view: "shiftPlanDtl"
            }, {
                pattern: "CM",
                name: "CardMaster",
                view: "cardMaster"
            }, {
                pattern: "MCA",
                name: "CardDetail",
                view: "cardDetail"
            }, {
                pattern: "STR",
                name: "StudentReg",
                view: "studentRegistration"
            }, {
                pattern: "STRA/{action}",
                name: "studentRegAdd",
                view: "studentRegFrm"
            }, {
                pattern: "MA",
                name: "ManualAttendance",
                view: "manualAttendance"
            }, {
                pattern: "NFT",
                name: "notification",
                view: "notification"
            }, {
                pattern: "CDM",
                name: "ClassDivMaster",
                view: "ClassDivisionMaster"
            }, {
                pattern: "FS",
                name: "FeeStructure",
                view: "FeeStructure"
            }, {
                pattern: "FSD",
                name: "FeeStructureDesign",
                view: "FeeStructureDesign"
            }, {
                pattern: "FSADE",
                name: "FeeStructureDetail",
                view: "FeeStructureDetail"
            }, {
                pattern: "RC",
                name: "ReligionCasteMaster",
                view: "ReligionCasteMaster"
            },{
                pattern: "SFEE",
                name: "StudentFee",
                view: "studentfFee"
            },{
                pattern: "CON",
                name: "FeeConcession",
                view: "FeeConcession"
            },{
                pattern: "CONDTL",
                name: "FeeConcessionDtl",
                view: "FeeConcessionDetail"
            },{
                pattern: "DDM",
                name: "DeptDesigMaster",
                view: "departmntDesignationMaster"
            },{
                pattern: "USRL",
                name: "UserRoles",
                view: "userRoles"
            },{
                pattern: "USRLDTL",
                name: "UserRolesDetail",
                view: "userRoleAccess"
            },{
                pattern: "AR2DESIG",
                name: "AssignRole2Designation",
                view: "assignRole2Designation"
            },{
                pattern: "USRGRPDTL",
                name: "UserGroupDetail",
                view: "userGroupDetail"
            },{
                pattern: "SGM",
                name: "ScreenGroupMaster",
                view: "screenGroupMaster"
            },{
                pattern: "SGMDTL",
                name: "ScreenGroupMasterDetail",
                view: "screenGroupMasterDetail"
            },{
                pattern: "STAFF",
                name: "StaffEnrollment",
                view: "staffEnrollment"
            },{
                pattern: "STAFFDTL",
                name: "StaffEnrollmentDetail",
                view: "staffEnrollmentDetail"
            },{
                pattern: "HNWO",
                name: "HolidayNWeeklyOff",
                view: "holidayNWeeklyOff"
            },{
                pattern: "RPT",
                name: "Reports",
                view: "reports"
            },{
                pattern: "FEERPT",
                name: "FeeReport",
                view: "feeReport"
            }]
        }
    },
    createContent: function() {
        var oViewData = {
            component: this
        };
        if(sessionStorage.length === 0)
			window.location.href = window.location.pathname.replace("UI/index.html", "") + "index.html";
        else{
        	return sap.ui.view({
                viewName: "com.itec.sams.view.App",
                type: sap.ui.core.mvc.ViewType.XML,
                viewData: oViewData
            });
        }
        
    },
    init: function() {
        // call super init (will call function "create content")
        sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

        // always use absolute paths relative to our own component
        // (relative paths will fail if running in the Fiori Launchpad)
        var sRootPath = jQuery.sap.getModulePath("com.itec.sams");

        // The service URL for the oData model 
        var oServiceConfig = this.getMetadata().getConfig().serviceConfig;
        var sServiceUrl = oServiceConfig.serviceUrl;

        // the metadata is read to get the location of the i18n language files later
        var mConfig = this.getMetadata().getConfig();
        this._routeMatchedHandler = new sap.m.routing.RouteMatchedHandler(this.getRouter(), this._bRouterCloseDialogs);

        // create oData model
        //this._initODataModel(sServiceUrl);

        // set i18n model
        var i18nModel = new sap.ui.model.resource.ResourceModel({
            bundleUrl: [sRootPath, mConfig.resourceBundle].join("/")
        });
        this.setModel(i18nModel, "i18n");
        this._setDeviceModel();
        this._setLocalJSONModel();
        // initialize router and navigate to the first page
        this.getRouter().initialize();

        this._appRefresh = false;
    },
    // Set Local Model
    _setLocalJSONModel: function() {
        var oMenuModelPath = jQuery.sap.getModulePath("com.itec.sams.model", "/menuNavigation.json");
        var oMenuModel = new sap.ui.model.json.JSONModel(oMenuModelPath);
        oMenuModel.setDefaultBindingMode("OneWay");
        this.setModel(oMenuModel, "menuModel");
        
        var oCalendarMonthModelPath = jQuery.sap.getModulePath("com.itec.sams.model", "/calendar.json");
        var oCalendarMonthModel = new sap.ui.model.json.JSONModel(oCalendarMonthModelPath);
        oCalendarMonthModel.setDefaultBindingMode("OneWay");
        this.setModel(oCalendarMonthModel, "calendarMonthModel");
        
        var oReportListModelPath = jQuery.sap.getModulePath("com.itec.sams.model", "/reportsListItem.json");
        var oReportListModel = new sap.ui.model.json.JSONModel(oReportListModelPath);
        oReportListModel.setDefaultBindingMode("OneWay");
        this.setModel(oReportListModel, "reportListModel");
        
        var curDate = new Date(),
		curYear = curDate.getFullYear(),
		curMonth = curDate.getMonth() + 1,
		min = 2017,
	    max = curYear + 1,
		yearArray = {};
		yearArray.results = [];
	 	yearArray.results.push({value:"Select Year",key:0});
		for (var i = min; i < max; i++){
			if(curYear === i && curMonth <= 3)
				break;
			else
		   		yearArray.results.push({value: i + " - " + (i + 1) ,key:i});
		}
		
		 var oCalendarYearRangeModel = new sap.ui.model.json.JSONModel(yearArray);
		 oCalendarYearRangeModel.setDefaultBindingMode("OneWay");
	     this.setModel(oCalendarYearRangeModel, "calendarYearRangeModel");
		
    },
    // Set device model
    _setDeviceModel: function() {
        var oDeviceModel = new sap.ui.model.json.JSONModel({
            isTouch: sap.ui.Device.support.touch,
            isNoTouch: !sap.ui.Device.support.touch,
            isPhone: sap.ui.Device.system.phone,
            isNoPhone: !sap.ui.Device.system.phone,
            listMode: sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
            listItemType: sap.ui.Device.system.phone ? "Active" : "Inactive"
        });
        oDeviceModel.setDefaultBindingMode("OneWay");
        this.setModel(oDeviceModel, "device");
    },
    exit: function() {
        this._routeMatchedHandler.destroy();
    },

    // This method lets the app can decide if a navigation closes all open dialogs
    setRouterSetCloseDialogs: function(bCloseDialogs) {
        this._bRouterCloseDialogs = bCloseDialogs;
        if (this._routeMatchedHandler) {
            this._routeMatchedHandler.setCloseDialogs(bCloseDialogs);
        }
    },

    // creation and setup of the oData model
    _initODataModel: function(sServiceUrl) {
        jQuery.sap.require("com.itec.sams.util.messages");
        var oConfig = {
            metadataUrlParams: {},
            json: true,
            loadMetadataAsync: true,
            defaultBindingMode: "TwoWay",
            defaultCountMode: "Inline",
            useBatch: true
        };
        var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, oConfig);
        oModel.attachRequestFailed(null, com.itec.sams.util.messages.showErrorMessage);
        this.setModel(oModel);
    }
});