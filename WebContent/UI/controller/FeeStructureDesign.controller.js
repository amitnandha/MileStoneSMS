jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("com.itec.sams.util.GetPostApiCall");
sap.ui.core.mvc.Controller.extend("com.itec.sams.controller.FeeStructureDesign", {

    onInit: function() {
        FSD_context = this;
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
        if (sName !== "FeeStructureDesign") {
            return;
        } else {
            oPageTitle.setText("Fee Structure Design");
            oBusyDialog.open();
            jQuery.sap.delayedCall(1, this, function() {
            	FSD_context.initialLoad();
            });
            
        }
    },
    getEventBus: function() {
        return sap.ui.getCore().getEventBus();
    },
    getRouter: function() {
        return sap.ui.core.UIComponent.getRouterFor(this);
    },
    onNavBack: function(evt) {
    	 sap.m.MessageBox.confirm("Are you sure want to cancel?", {
             icon: sap.m.MessageBox.Icon.QUESION,
             title: "Confirmation",
             action: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
             styleClass: "sapUiSizeCompact",
             onClose: function(action) {
                 if (action === "OK") {
                	 FSD_context.feeDesignModel = null;
                	 var bReplace = jQuery.device.is.phone ? false : true;
                     FSD_context.getRouter().navTo("FeeStructure", bReplace);
                 }

             }
         });
    },
    initialLoad: function() {
        var query = {
                schoolId: comGlob.schoolData.schoolId,
                skip: 0,
                top: 1000,
            };

        FSD_context.oFeeStructureDesignResponse = new com.itec.sams.util.GetPostApiCall.postData("FeeStructureDesignGet", query);
        if (FSD_context.oFeeStructureDesignResponse != null){
        	FSD_context.getView().byId("monthDueOn_selId").setSelectedKey(FSD_context.oFeeStructureDesignResponse.dueOnDayKey);
        	FSD_context.getfeeStructureDesignModel("INITIAL");
        	jQuery.sap.delayedCall(1, this, function() {
        		 FSD_context.bindTable();
        	});
        }
        oBusyDialog.close();
    },
    getfeeStructureDesignModel: function(mode) {
        var jData = {
        	Mode:"",
            results: []
        };
        if(mode === "INITIAL")
        	FSD_context.feeDesignModel = null;
        if (!FSD_context.feeDesignModel) {
        	var mData = FSD_context.oFeeStructureDesignResponse.navFeeStructureDesignDtl;
        	if(mData.length === 0 || mData === null){
        		 jData.results.push({
                     srno: 1,
                     designId:"0",
                     labelName: "",
                     controlKey: "1",
                     applicableOnKey: "",
                     dueOnDayKey: "",
                     dueOnDayText: "",
                     dueOnMonthKey: "",
                     dueOnMonthText: "",
                     dueOnSecondMonthKey:"",
                     dueOnSecondMonthText:"",
                     dueOnThirdMonthKey:"",
                     dueOnThirdMonthText:"",
                     dueOnFourthMonthKey:"",
                     dueOnFourthMonthText:"",
                     discountApplicable:false
                 });
        	}else{
        		for(var i = 0; i < mData.length; i++){
        			 jData.results.push({
                         srno: i + 1,
                         designId:mData[i].designId,
                         labelName: mData[i].labelName,
                         controlKey: mData[i].controlKey,
                         applicableOnKey: mData[i].applicableOnKey,
                         dueOnDayKey: mData[i].dueOnDayKey,
                         dueOnDayText: mData[i].dueOnDayText,
                         dueOnMonthKey: mData[i].dueOnMonthKey,
                         dueOnMonthText: mData[i].dueOnMonthText,
                         dueOnSecondMonthKey:mData[i].dueOnSecondMonthKey,
                         dueOnSecondMonthText:mData[i].dueOnSecondMonthText,
                         dueOnThirdMonthKey:mData[i].dueOnThirdMonthKey,
                         dueOnThirdMonthText:mData[i].dueOnThirdMonthText,
                         dueOnFourthMonthKey:mData[i].dueOnFourthMonthKey,
                         dueOnFourthMonthText:mData[i].dueOnFourthMonthText,
                         discountApplicable:mData[i].discountApplicable
                     });
        		}
        	}
        	
            FSD_context.feeDesignModel = new sap.ui.model.json.JSONModel(jData);
        } else {
            var tblItems = FSD_context.getView().byId("feeStructureDesign_tblId").getItems();
            var sDueOnDayKey = FSD_context.getView().byId("monthDueOn_selId").getSelectedKey();
            var sDueOnDayText = FSD_context.getView().byId("monthDueOn_selId").getSelectedItem().getText();
            for (var x = 0; x < tblItems.length; x++) {
                var tblElements = tblItems[x].findElements();
                var oHLayoutDueOn1 = tblElements[4].getContent()[0];
                var oHLayoutDueOn2 = tblElements[4].getContent()[1];
                jData.results.push({
                    srno: x + 1,
                    designId: tblElements[0].data().designId,
                    labelName: tblElements[1].getValue(),
                    controlKey: "1",
                    applicableOnKey: tblElements[3].getSelectedKey(),
                    dueOnDayKey: sDueOnDayKey,
                    dueOnDayText: sDueOnDayText,
                    dueOnMonthKey: oHLayoutDueOn1.getContent()[0].getSelectedKey(),
                    dueOnMonthText: oHLayoutDueOn1.getContent()[0].getSelectedItem().getText(),
                    dueOnSecondMonthKey: oHLayoutDueOn1.getContent()[1].getSelectedKey(),
                    dueOnSecondMonthText: oHLayoutDueOn1.getContent()[1].getSelectedItem().getText(),
                    dueOnThirdMonthKey: oHLayoutDueOn2.getContent()[0].getSelectedKey(),
                    dueOnThirdMonthText: oHLayoutDueOn2.getContent()[0].getSelectedItem().getText(),
                    dueOnFourthMonthKey: oHLayoutDueOn2.getContent()[1].getSelectedKey(),
                    dueOnFourthMonthText: oHLayoutDueOn2.getContent()[1].getSelectedItem().getText(),
                    discountApplicable:tblElements[5].getSelected()
                });
            }
            if (mode === "ADD") {
                jData.results.push({
                    srno: tblItems.length + 1,
                    designId:"0",
                    label: "",
                    controlKey: "1",
                    applicableOnKey: "",
                    dueOnDayKey: "",
                    dueOnDayText: "",
                    dueOnMonthKey: "",
                    dueOnMonthText: "",
                    dueOnSecondMonthKey:"",
                    dueOnSecondMonthText:"",
                    dueOnThirdMonthKey:"",
                    dueOnThirdMonthText:"",
                    dueOnFourthMonthKey:"",
                    dueOnFourthMonthText:"",
                    discountApplicable:false
                });
            }
            FSD_context.feeDesignModel = new sap.ui.model.json.JSONModel(jData);
        }
    },
   
    bindTable: function() {
        var tblTemplate = new sap.m.ColumnListItem({
            cells: [new sap.m.Text({
                text: "{srno}",
            }).addCustomData(new sap.ui.core.CustomData({key:"designId", value: "{designId}"})),
            new sap.m.Input({
                value: "{labelName}",
                placeholder: "Enter Label Name"
            }), new sap.m.Select({
                selectedKey: "{controlKey}",
                enabled:false,
                items: {
                    path: 'calendarMonthModel>/controls/results',
                    template: new sap.ui.core.Item({
                        key: "{calendarMonthModel>key}",
                        text: "{calendarMonthModel>value}"
                    }),
                    sorter:"{key}",
                    templateShareable: true
                },
            }), new sap.m.Select({
                selectedKey: "{applicableOnKey}",
                items: {
                    path: 'calendarMonthModel>/applicableOn/results',
                    template: new sap.ui.core.Item({
                        key: "{calendarMonthModel>key}",
                        text: "{calendarMonthModel>value}"
                    }),
                    sorter:"{key}",
                    templateShareable: true
                },
                change: FSD_context.onChangeApplicable,
            }), new sap.ui.layout.VerticalLayout({
                content: [new sap.ui.layout.HorizontalLayout({
                    content: [new sap.m.Select({
		                        enabled: {
		                        	path:'dueOnMonthKey',
		                        	formatter:function(value){
		                        		if(value != "0" && value != "" && value != 0)
		                        			return true;
		                        		else 
		                        			return false;
		                        	}
		                        },
		                        selectedKey: "{dueOnMonthKey}",
		                        items: {
		                            path: 'calendarMonthModel>/months/results',
		                            template: new sap.ui.core.Item({
		                                key: "{calendarMonthModel>key}",
		                                text: "{calendarMonthModel>longText}"
		                            }),
		                            sorter:"{key}",
		                            templateShareable: true
		                        }
		                    }).addStyleClass("sapUiTinyMarginEnd"),
		                    new sap.m.Select({
		                        enabled: {
		                        	path:'dueOnSecondMonthKey',
		                        	formatter:function(value){
		                        		if(value != "0" && value != "" && value != 0)
		                        			return true;
		                        		else 
		                        			return false;
		                        	}
		                        },
		                        selectedKey: "{dueOnSecondMonthKey}",
		                        items: {
		                            path: 'calendarMonthModel>/months/results',
		                            template: new sap.ui.core.Item({
		                                key: "{calendarMonthModel>key}",
		                                text: "{calendarMonthModel>longText}"
		                            }),
		                            sorter:"{key}",
		                            templateShareable: true
		                        }
		                    }).addStyleClass("sapUiTinyMarginEnd"),
                ]}),new sap.ui.layout.HorizontalLayout({
                    content: [new sap.m.Select({
		                        enabled: {
		                        	path:'dueOnThirdMonthKey',
		                        	formatter:function(value){
		                        		if(value != "0" && value != "" && value != 0)
		                        			return true;
		                        		else 
		                        			return false;
		                        	}
		                        },
		                        selectedKey: "{dueOnThirdMonthKey}",
		                        items: {
		                            path: 'calendarMonthModel>/months/results',
		                            template: new sap.ui.core.Item({
		                                key: "{calendarMonthModel>key}",
		                                text: "{calendarMonthModel>longText}"
		                            }),
		                            sorter:"{key}",
		                            templateShareable: true
		                        }
		                    }).addStyleClass("sapUiTinyMarginEnd"),
		                    new sap.m.Select({
		                        enabled: {
		                        	path:'dueOnFourthMonthKey',
		                        	formatter:function(value){
		                        		if(value != "0" && value != "" && value != 0)
		                        			return true;
		                        		else 
		                        			return false;
		                        	}
		                        },
		                        selectedKey: "{dueOnFourthMonthKey}",
		                        items: {
		                            path: 'calendarMonthModel>/months/results',
		                            template: new sap.ui.core.Item({
		                                key: "{calendarMonthModel>key}",
		                                text: "{calendarMonthModel>longText}"
		                            }),
		                            sorter:"{key}",
		                            templateShareable: true
		                        }
		                    }).addStyleClass("sapUiTinyMarginEnd")
                    ]}),
                ]
            }),new sap.m.CheckBox({
            	selected:"{discountApplicable}"
            }), new sap.ui.core.Icon({
                src: "sap-icon://sys-minus",
                color: "#ff0000",
                size: "1rem",
                alt: "Delete",
                press: FSD_context.onPressDeleteRow
            })]
        });

        var oTable = FSD_context.getView().byId("feeStructureDesign_tblId");
        oTable.setModel(FSD_context.feeDesignModel);
        oTable.bindAggregation("items", {
            path: "/results",
            template: tblTemplate,
            //templateShareable: true
        });
    },
    setFeeStructureDesignTableHeight:function(evt){
	   var oTable = evt.getSource();
       var oScrollContainer = evt.getSource().getParent();
       if (oTable.getDomRef() !== null && sap.ui.Device.system.phone !== true) {
           var footerHeight = FSD_context.getView().getContent()[0].getFooter().getDomRef().getBoundingClientRect().height + 5;
           var tablePositionTop = oScrollContainer.getDomRef().getBoundingClientRect().top;
           var scrollHeight = window.innerHeight - tablePositionTop - footerHeight;
           oScrollContainer.setHeight(String(scrollHeight + "px"));
           if(!jQuery.device.is.phone){
           	   var tableHeight = oTable.getDomRef().getBoundingClientRect().height;
               var hdrTable = FSD_context.getView().byId("feeStructureDesign_tblId");
               if (tableHeight > scrollHeight) {
               	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(true);
               } else {
               	hdrTable.getColumns()[hdrTable.getColumns().length - 1].setVisible(false);
               }
           }
       }
    },
    onPressAddRow: function(evt) {
        FSD_context.getfeeStructureDesignModel("ADD");
        FSD_context.bindTable();
    },
    onPressDeleteRow: function(evt) {
        var oItem = evt.getSource().getParent();
        var oTable = FSD_context.getView().byId("feeStructureDesign_tblId");
        oTable.removeItem(oItem);
        oTable.removeAllAggregation();
        FSD_context.getfeeStructureDesignModel("REMOVE");
        FSD_context.bindTable();
    },
    onChangeApplicable: function(evt) {
        var sKey = evt.getSource().getSelectedKey();
        var itemIndex = FSD_context.getView().byId("feeStructureDesign_tblId").indexOfItem(evt.getSource().getParent());
        var sItem = FSD_context.getView().byId("feeStructureDesign_tblId").getItems()[itemIndex];
        var sContent = sItem.findElements()[4].findElements();
        var oHLayout1Content = sContent[0].getContent();
        var oHLayout2Content = sContent[1].getContent();
        oHLayout1Content[0].setEnabled(false);
        oHLayout1Content[0].setSelectedKey("0");
        oHLayout1Content[1].setEnabled(false);
        oHLayout1Content[1].setSelectedKey("0");
        oHLayout2Content[0].setEnabled(false);
        oHLayout2Content[0].setSelectedKey("0");
        oHLayout2Content[1].setEnabled(false);
        oHLayout2Content[1].setSelectedKey("0");
        if (sKey === "1" || sKey === "2") {
        	oHLayout1Content[0].setEnabled(true);
        } else if (sKey === "3") {
        	oHLayout1Content[0].setEnabled(true);
        	oHLayout1Content[1].setEnabled(true);
        } else if (sKey === "4") {
        	oHLayout1Content[0].setEnabled(true);
        	oHLayout1Content[1].setEnabled(true);
        	oHLayout2Content[0].setEnabled(true);
        	oHLayout2Content[1].setEnabled(true);
        }
    },
    validateFeeStructureDesgin: function() {
        var msg = "";
        var tblItems = FSD_context.getView().byId("feeStructureDesign_tblId").getItems();
        if (tblItems.length > 0) {
            for (var x = 0; x < tblItems.length; x++) {
                var valMsg = "";
                var tblElements = tblItems[x].findElements();
                var oHLayout1 = tblElements[4].getContent()[0].getContent();
                var oHLayout2 = tblElements[4].getContent()[1].getContent();
                if (tblElements[1].getValue() === "")
                    valMsg += "Please enter Label." + "\n";
                if (tblElements[3].getSelectedKey() === "0")
                    valMsg += "Please select Applicable On." + "\n";
                else if(tblElements[3].getSelectedKey() === "1" && oHLayout1[0].getSelectedKey() === "0")
                		 valMsg += "Please select month for One-Time Due On." + "\n";
                else if(tblElements[3].getSelectedKey() === "2" && oHLayout1[0].getSelectedKey() === "0")
              		 valMsg += "Please select month for Annually Due On." + "\n";
                else if(tblElements[3].getSelectedKey() === "3"){
                	if(oHLayout1[0].getSelectedKey() === "0")
                		valMsg += "Please select month for first Half Yearly Due On." + "\n";
                	if(oHLayout1[1].getSelectedKey() === "0")
                		valMsg += "Please select month for second Half Yearly Due On." + "\n";
                }else if(tblElements[3].getSelectedKey() === "4"){
                	if(oHLayout1[0].getSelectedKey() === "0")
                		valMsg += "Please select month for first Quarter Due On." + "\n";
                	if(oHLayout1[1].getSelectedKey() === "0")
                		valMsg += "Please select month for second Quarter Due On." + "\n";
                	if(oHLayout2[0].getSelectedKey() === "0")
                		valMsg += "Please select month for third Quarter Due On." + "\n";
                	if(oHLayout2[1].getSelectedKey() === "0")
                		valMsg += "Please select month for fourth Quarter Due On." + "\n";
                }


                if (valMsg != "") {
                    if (msg === "")
                        msg = "Sr. No.: " + tblElements[0].getText() + "\n" + valMsg + "\n";
                    else
                        msg += "\nSr. No.: " + tblElements[0].getText() + "\n" + valMsg + "\n";
                }
            }
        } else {
            msg = "Please add item(s) to generate Fee Structure Design.";
        }
        return msg;
    },
    onPressSubmit: function(evt) {
        var msg = FSD_context.validateFeeStructureDesgin();
        if (msg === "") {
            sap.m.MessageBox.confirm("Are you sure want to submit?", {
                icon: sap.m.MessageBox.Icon.QUESION,
                title: "Confirmation",
                action: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],
                styleClass: "sapUiSizeCompact",
                onClose: function(action) {
                    if (action === "OK"){
                    	 oBusyDialog.open();
                         jQuery.sap.delayedCall(1, this, function() {
                        	 FSD_context.submitFeeStructureDesgin();
                         });
                    }
                       
                }
            });
        } else {
            sap.m.MessageBox.show(msg, sap.m.MessageBox.Icon.ERROR, "Error");
        }
    },
    submitFeeStructureDesgin: function(evt) {
    	 var requestBody = {
                 "Mode": FSD_context.oFeeStructureDesignResponse.navFeeStructureDesignDtl.length === 0 ? "ADD" : "EDIT",
                 "navFeeStructureDesignDtl": [],
                 "schoolId": sessionStorage.getItem('schoolId'),
                 "userId": sessionStorage.getItem('userId'),
         };
    	 var tblItems = FSD_context.getView().byId("feeStructureDesign_tblId").getItems();
    	  var sDueOnDayKey = FSD_context.getView().byId("monthDueOn_selId").getSelectedKey();
          var sDueOnDayText = FSD_context.getView().byId("monthDueOn_selId").getSelectedItem().getText();
         for (var x = 0; x < tblItems.length; x++) {
             var tblElements = tblItems[x].findElements();
             var oHLayout1 = tblElements[4].getContent()[0];
             var oHLayout2 = tblElements[4].getContent()[1];
             requestBody.navFeeStructureDesignDtl.push({
                 designId: tblElements[0].data().designId,
                 labelName: tblElements[1].getValue(),
                 controlKey: tblElements[2].getSelectedKey(),
                 applicableOnKey: tblElements[3].getSelectedKey(),
                 dueOnDayKey: sDueOnDayKey,
                 dueOnDayText: sDueOnDayText,
                 dueOnMonthKey: oHLayout1.getContent()[0].getSelectedKey(),
                 dueOnMonthText: oHLayout1.getContent()[0].getSelectedItem().getText(),
                 dueOnSecondMonthKey: oHLayout1.getContent()[1].getSelectedKey(),
                 dueOnSecondMonthText: oHLayout1.getContent()[1].getSelectedItem().getText(),
                 dueOnThirdMonthKey: oHLayout2.getContent()[0].getSelectedKey(),
                 dueOnThirdMonthText: oHLayout2.getContent()[0].getSelectedItem().getText(),
                 dueOnFourthMonthKey: oHLayout2.getContent()[1].getSelectedKey(),
                 dueOnFourthMonthText: oHLayout2.getContent()[1].getSelectedItem().getText(),
                 discountApplicable:tblElements[5].getSelected()
             });
         }
    	 var saveResponse = new com.itec.sams.util.GetPostApiCall.postData("FeeStructureDesignSet", requestBody);
         if (saveResponse != null) {
             if (saveResponse.msgType === "S") {
                 sap.m.MessageBox.show(saveResponse.msg, {
                     icon: sap.m.MessageBox.Icon.SUCCESS,
                     title: "Success",
                     styleClass: "sapUiSizeCompact",
                     onClose: function(action) {
                    	 FSD_context.feeDesignModel = null;
                    	 FSD_context.initialLoad();
                    	
                     }
                 });
             } else {
                 sap.m.MessageBox.show(saveResponse.msg, {
                     icon: sap.m.MessageBox.Icon.ERROR,
                     title: "Error",
                     styleClass: "sapUiSizeCompact",
                     onClose: function(action) {
                         oBusyDialog.close();
                     }
                 });
             }

         }
    }
});