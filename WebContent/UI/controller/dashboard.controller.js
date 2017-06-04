jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.library.amcharts.amcharts");
jQuery.sap.require("com.itec.sams.library.amcharts.serial");
jQuery.sap.require("com.itec.sams.library.amcharts.pie");
jQuery.sap.require("com.itec.sams.library.amcharts.themes.light");
sap.ui.controller("com.itec.sams.controller.dashboard", {
    onInit: function() {
        DB_context = this;
        this.getRouter().attachRoutePatternMatched(this.onRouteMatched, this);
        this._oComponent = sap.ui.component(sap.ui.core.Component.getOwnerIdFor(this.getView()));  
        this.getView().addEventDelegate({
            onBeforeHide: function(oEvent) {
            	//clearInterval(DB_context.IntervalId);
            },
            onAfterHide: function(oEvent) {
            	clearInterval(DB_context.IntervalId);
            }
        }, this)
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
        if (sName !== "DashBoard") {
            return;
        } else {
            oPageTitle.setText("Dashboard");
            DB_context.initialLoad();
            DB_context.IntervalId = setInterval('DB_context.initialLoad()', 30000);
        }
    },

    getEventBus: function() {
        return sap.ui.getCore().getEventBus();
    },

    getRouter: function() {
        return sap.ui.core.UIComponent.getRouterFor(this);
    },

    initialLoad: function() {
        oBusyDialog.open();
        jQuery.sap.delayedCall(1, DB_context, function() {
            DB_context._todayAjax();
            DB_context._loadToday(DB_context._today);
        });
    },
    readRestApi: function(entitySet, query) {
        var oApiResponse = {};
        $.ajax({
            url: dataSource + entitySet,
            data: query,
            type: 'POST',
            async: false,
            success: function(oData, oResponse) {
                if (oData.msgType === "S") {
                    oApiResponse = oData;
                    oBusyDialog.close();
                } else {
                    sap.m.MessageBox.show(oData.msg, {
                        icon: sap.m.MessageBox.Icon.ERROR,
                        title: "Error",
                        styleClass: "sapUiSizeCompact",
                        onClose: function(action) {
                            oBusyDialog.oBusyDialog();
                        }
                    });
                }
            },
            error: function(oError) {
                var msg = oError.responseText.split("Message")[1];
                sap.m.MessageBox.show(msg, {
                    icon: sap.m.MessageBox.Icon.ERROR,
                    title: "Error",
                    styleClass: "sapUiSizeCompact",
                    onClose: function(action) {
                        oBusyDialog.close();
                    }
                });
                oBusyDialog.close();
            }
        });

        return oApiResponse;
    },

    _todayAjax: function() {
        var query = {
            schoolId: comGlob.schoolData.schoolId,
            userId: comGlob.schoolData.userId,
            Mode: "TODAY"
        };
        DB_context._today = DB_context.readRestApi("/dashboardDataGet", query);
    },

    _loadToday: function(data) {

        var pie_holder_ttlStd = DB_context.getView().byId("hb_prAb").sId;
        var bar_holder_preStd = DB_context.getView().byId("hb_preAttd").sId;
        //		var pie_holder_ttlNft = DB_context.getView().byId("hb_ttlNft").sId;
        var pie_holder_sntNft = DB_context.getView().byId("hb_nftStatus").sId;
        AmCharts.makeChart(pie_holder_ttlStd, {
            "type": "pie",
            "theme": "dark",
            "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
            "labelRadius": 0,
            "labelText": "",
            "colors": [
                "#33cc33", //Green
                "#ff6600" //Red
            ],
            "labelsEnabled": false,
            "titleField": "category",
            "valueField": "column-1",
            "angle": 30,
            "outlineAlpha": 0.4,
            "depth3D": 15,
            "allLabels": [],
            "balloon": {},
            "legend": {
                "enabled": true,
                "align": "right",
                "markerBorderColor": "#AAB3B3",
                "markerType": "diamond",
                "maxColumns": 1,
                "position": "right",
                "spacing": 7,
                "textClickEnabled": true,
                "useMarkerColorForLabels": true,
                "useMarkerColorForValues": true,
                "valueWidth": 25,
                "rollOverColor": "#FF8000",
                "fontSize": 12,
                "switchColor": "#CC0000",
            },
            "titles": [],
            "dataProvider": [{
                "category": "Present",
                "column-1": data.todayPresentStudent
            }, {
                "category": "Absent",
                "column-1": data.todayAbsentStudent
            }]
        });


        DB_context.getView().byId("ct_prAb").setText("Total Student (" + data.totalStudent + ")");

        AmCharts.makeChart(bar_holder_preStd, {
            "type": "serial",
            "categoryField": "category",
            "startDuration": 1,
            "startEffect": "bounce",
            "fontSize": 12,
            "categoryAxis": {
                "autoWrap": true,
                "gridPosition": "start",
                "labelRotation": 45
            },
            "trendLines": [],
            "graphs": [{
                "colorField": "color",
                "fillAlphas": 1,
                "id": "AmGraph-1",
                "lineColorField": "color",
                "title": "graph 1",
                "type": "column",
                "valueField": "column-1"
            }],
            "guides": [],
            "valueAxes": [{
                "id": "ValueAxis-1",
                "title": "Present Student(s)"
            }],
            "allLabels": [],
            "balloon": {},
            "titles": [],
            "dataProvider": [{
                "category": "Manual",
                "column-1": data.todayManualStudent,
                "color": "#66b3ff"
            }, {
                "category": "Late Coming",
                "column-1": data.todayLateComingStudent,
                "color": "#ff4000"
            }, {
                "category": "Early Going",
                "column-1": data.todayEarlyGoingStudent,
                "color": "#669999"
            }, {
                "category": "Without Out-Punch",
                "column-1": data.todayWithoutPunchOutStudent,
                "color": "#aaaa55"
            }]
        });

        DB_context.getView().byId("ct_preAttd").setText("Present Students (" + data.todayPresentStudent + ")");

        AmCharts.makeChart(pie_holder_sntNft, {
            "type": "pie",
            "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
            "labelRadius": 0,
            "labelText": "",
            //			"baseColor": "#B73CEB",
            "colors": [
                "#6666ff", //Blue
                "#00e673", //Green
                "#ff5c33" //Red
            ],
            "labelsEnabled": false,
            "titleField": "category",
            "valueField": "column-1",
            "theme": "dark",
            "allLabels": [],
            "balloon": {},
            "angle": 30,
            "outlineAlpha": 0.4,
            "depth3D": 15,
            "legend": {
                "enabled": true,
                "align": "right",
                "markerBorderColor": "#AAB3B3",
                "markerType": "diamond",
                "maxColumns": 1,
                "position": "right",
                "spacing": 7,
                "textClickEnabled": true,
                "useMarkerColorForLabels": true,
                "useMarkerColorForValues": true,
                "valueWidth": 25,
                "rollOverColor": "#FF8000",
                "fontSize": 12,
                "switchColor": "#CC0000",
            },
            "titles": [],
            "dataProvider": [{
                "category": "Sent",
                "column-1": data.totalMessageSent
            }, {
                "category": "Delivered",
                "column-1": data.totalMessageDelivered
            }, {
                "category": "Failed",
                "column-1": data.totalMessageFailed
            }]
        });

        DB_context.getView().byId("ct_nftStatus").setText("Total Message Left: " + data.totalMessageLeft);
    },
    onExit:function(){
    	debugger;
    	console.log("exit dashboard");
    },

});