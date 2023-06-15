({
    doInit : function(component, event, helper){

        component.set("v.isSpinnerShow", true);
        helper.restrictuserDetails(component);
        var action = component.get("c.getProRecord");

        component.set('v.existingProductCatalogId', component.get('v.recordId'));
        action.setParams({
            "existingProductTypeId": component.get('v.recordId')
        });
        action.setCallback(this, function(data) {
            component.set("v.isSpinnerShow", false);
            component.set("v.productTypeList", data.getReturnValue());
        });
        $A.enqueueAction(action);
    },
    clearAll : function(component, event, helper){ 
	helper.clearAllAttributeValues(component,event,helper);
    },
    searchexistingProductCatalogRec : function(component, event, helper){
        var selected = document.querySelector('input[name="options"]:checked');
        helper.readySaveButton(component);
        var partnerTerritoriesList = component.get("v.partnerTerritoriesList");
        //Incident#236138 code has Started
        component.set("v.productCatalogCode",component.get("v.productCode")+'-'+partnerTerritoriesList[parseInt(selected.id)-1].record.Partner_Territory_Code__c)
        component.set("v.productCatalogName",partnerTerritoriesList[parseInt(selected.id)-1].record.Name + '-'+component.get("v.producttyperef"));
        if(component.get("v.productCatalogName").length > 80){
            console.log('it start*************');
            let tempName = component.get("v.productCatalogName").toString();
            component.set("v.productCatalogName",component.get("v.productCatalogName").substring(0, 80));
            console.log('productCatalogName**************'+component.get("v.productCatalogName"));
            console.log('templName***************'+tempName.substring(0, 80));
        }
        if(component.get('v.isFromProductOffer') == true){
            var action1 = component.get("c.searchexistingProductCatalog");
            
            action1.setParams({
                "partnerTerritoryId": partnerTerritoriesList[parseInt(selected.id)-1].record.Id,
                "existingProductTypeId": component.get('v.existingProductTypeId')
            });
            
            action1.setCallback(this, function(response){
                var state = response.getState();
                if (state === "SUCCESS") {
                    console.log('after success****************'+JSON.stringify(response.getReturnValue()));
                    var existingProductTypeRecord = response.getReturnValue();
                    if(existingProductTypeRecord != null){
                        console.log('v.productCatalogName*****************'+existingProductTypeRecord.Name);
                        component.set("v.existingProductCatalogId", existingProductTypeRecord.Id);
                        component.set("v.productCatalogName",existingProductTypeRecord.Name);
                        component.set("v.productsubcategoryID",existingProductTypeRecord.productsubcategoryID__c);
                    }else{
                        console.log('v.productCatalogName*****************'+existingProductTypeRecord.Name);
                        component.set("v.existingProductCatalogId","");
                        component.set("v.productCatalogName",'');
                    }
                    var setBillTypeEvt = component.getEvent("setBillTypeName");
                    setBillTypeEvt.setParams({
                        "billType" : existingProductTypeRecord.PartnerTerritory_ID__r.Partner_ID__r.OnBill_OffBill__c
                    });
        			setBillTypeEvt.fire();
                }else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " +
                                        errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
            });
            $A.enqueueAction(action1);
        }
        else{
            var action = component.get("c.verifyingCatalog");
            action.setParams({
                "catalogName" : component.get("v.productCatalogName"),
                "catalogCode" : component.get("v.productCatalogCode")
            });
            action.setCallback(this, function(response){
                var state = response.getState();
                console.log('response.getReturnValue()*******'+response.getReturnValue());
                
                if (state === "SUCCESS" && response.getReturnValue() == true) {
                    component.set("v.isSaveButtonDisabled",true)
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "message": "Product catalog already exists",
                        "type": "error"
                    });
                    toastEvent.fire();
                    var action = component.get("c.getProductCatalogId");  
                    action.setParams({
                        "prodCatName": component.get('v.productCatalogName'),
                        "catalogCode" : component.get('v.productCatalogCode')
                    });
                    action.setCallback(this, function(response) {   
                        console.log('Product existing respo id'+response.getReturnValue());
                        var evt = $A.get("e.force:navigateToComponent");
                        evt.setParams({
                            componentDef: "c:ProductOffer",
                            componentAttributes: {
                                productnameid: response.getReturnValue()
                            }
                        });
                        evt.fire();
                    });
                    $A.enqueueAction(action);
                }
            });
            $A.enqueueAction(action);
        }
        //Incident#236138 code Ended
    },
    searchRec : function(component, event, helper){

        if(component.get('v.recordId') != ''){
            component.set('v.isSaveButtonDisabled',false);
        }else{
            component.set("v.isSaveButtonDisabled", true);
             component.set('v.isSaveNewButtonDisabled',true);
        }
        /*if(component.get('v.territoryNameKeyword').trim() == ''){
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "message": "The search keyword field is required to search.",
                "type": "error"
            });
            toastEvent.fire();
        }else if(component.get('v.partnerCode').trim() == ''){
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "message": "The Partner field is required to search.",
                "type": "error"
            });
            toastEvent.fire();
        }else{*/
        if(component.get('v.partnerCode') && !component.get('v.recordId')){
            component.set('v.isSpinnerShow',true);
            var action = component.get("c.searchRecords");
            action.setParams({"PartnerID":component.get('v.partnerCode'),
                              "type":component.get('v.territoryType'),
                             "territoryNameWith":component.get('v.territoryNameWith'),
                             "searchKeyword":component.get('v.territoryNameKeyword')});

            action.setCallback(this, function(response){
                component.set('v.isSpinnerShow',false);

                var state = response.getState();
                if (state == "SUCCESS") {
                    component.set("v.partnerTerritoriesList", response.getReturnValue());
                }else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            console.log("Error message: " +
                                        errors[0].message);
                        }
                    } else {
                        console.log("Unknown error");
                    }
                }
            });
            $A.enqueueAction(action);
        }
    },
    saveRec : function(component, event, helper){

			helper.handleSaveandNew(component,event,helper);
        
    },
    checkboxSelect : function(component, event, helper){
        helper.readySaveButton(component);
        helper.searchProductTypeRec(component,event,helper);
        component.set('v.searchText', '');
    },
    handleRecordUpdated: function(component, event, helper) {
        var eventParams = event.getParams();
        if(eventParams.changeType === "LOADED") {
            // record is loaded (render other component which needs record data value)
            component.set("v.productCatalogName",component.get("v.simpleRecord.Name"));
            component.set("v.productCatalogCode",component.get("v.simpleRecord.ProductCode__c"));
            component.set("v.producttype",component.get("v.simpleRecord.ProductType_ID__r.Name"));
            component.set("v.description",component.get("v.simpleRecord.ProductType_ID__r.Description__c"));
            component.set("v.producttyperef",component.get("v.simpleRecord.ProductType_ID__r.Product_Type_Reference__c"));
            component.set("v.productCode",component.get("v.simpleRecord.ProductType_ID__r.ProductCode__c"));
            component.set("v.partnerCode",component.get("v.simpleRecord.PartnerTerritory_ID__r.Partner_ID__c"));
            component.set("v.productsubcategoryID",component.get("v.simpleRecord.productsubcategoryID__c"));
            component.set("v.banner",component.get("v.simpleRecord.Banner__c"));
            component.set("v.hsPlanIcon",component.get("v.simpleRecord.HS_Plan_Icon__c"));
            component.set("v.productCategoryID",component.get("v.simpleRecord.Product_Category_ID__c"));
            component.set("v.featuredFlag",component.get("v.simpleRecord.Featured_Flag__c"));
            component.set("v.featuredImage",component.get("v.simpleRecord.FeaturedImage__c"));
            component.set("v.interactiveHouse",component.get("v.simpleRecord.InteractiveHouse__c"));
            component.set("v.digitalSequence",component.get("v.simpleRecord.Digital_Sequence__c"));
            component.set("v.alternateCatalogID",component.get("v.simpleRecord.Alternate_Catalog_Id__c"));
            component.set("v.Exclusive",component.get("v.simpleRecord.Exclusive__c"));
			component.set("v.ProductcatalogsCode",component.get("v.simpleRecord.Product_Catalog_Code__c"));
            console.log('Exclusive Session********'+component.get("v.Exclusive"));
            console.log('productsubcategoryID__c****'+component.get("v.productsubcategoryID"));
            console.log('productCategoryID****'+component.get("v.productCategoryID"));
            var partnerTerritoriesList = [
                {
                    "isChecked" : true,
                    "record": {
                    "Id" : component.get("v.simpleRecord.PartnerTerritory_ID__r.Partner_ID__c"),
                    "Name" : component.get("v.simpleRecord.PartnerTerritory_ID__r.Name"),
                    "Partner_Territory_Code__c": component.get("v.simpleRecord.PartnerTerritory_ID__r.Partner_Territory_Code__c"),
                    "Partner_ID__r" : {"Name":component.get("v.simpleRecord.PartnerTerritory_ID__r.Partner_ID__r.Name")},
                    "Territory_ID__r" : {"Name" : component.get("v.simpleRecord.PartnerTerritory_ID__r.Territory_ID__r.Name")}
                    }	
                }];
            component.set("v.partnerTerritoriesList",partnerTerritoriesList);
            
        } else if(eventParams.changeType === "CHANGED") {
            // record is changed
        } else if(eventParams.changeType === "REMOVED") {
            // record is deleted
        } else if(eventParams.changeType === "ERROR") {
            // there’s an error while loading, saving, or deleting the record
        }
    },
    closeModel : function(component, event, helper) {
        var isFromProductOffer = component.get('v.isFromProductOffer');
        if(isFromProductOffer){
			component.set('v.isModalOpen',false);
            component.set('v.existingProductCatalogId','');
            component.set('v.existingProductCatalogIdInModel','');
        }else{
            window.history.back();
        }
    },
    selectRecord : function(component, event, helper) {
        if(component.get('v.existingProductCatalogId') == ''){ 
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "message": "The Product Catalog Record is not exists with these filters.",
                "type": "error"
            });
            toastEvent.fire();
        }else{
            component.set('v.existingProductCatalogIdInModel',component.get('v.existingProductCatalogId'));
            component.set("v.isModalOpen",false);
        }
        
    },
    partnerCodeChange : function(component, event, helper) {
        component.set("v.partnerTerritoriesList",[]);
    },
    searchProductType: function(component, event, helper) {
        var action = component.get("c.searchProductTypeByNameOrCode");
        action.setParams({
            "searchText": component.get('v.searchText')
        });

        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var existingProductTypeRecord = response.getReturnValue();
                var productTypeElemsList = component.get('v.productTypeList');
                for(var i=0; i < productTypeElemsList.length; i++){
                    productTypeElemsList[i].isChecked = false;
                }

                if(existingProductTypeRecord != null){
                    var productTypeDetails = existingProductTypeRecord.Product_Type_Details__r;

                    for(var i=0; i < productTypeElemsList.length; i++){
                        for(var j=0; j < productTypeDetails.length; j++){
                            if(productTypeElemsList[i].record.Id == productTypeDetails[j].ProductTypeElement_ID__c){
                                productTypeElemsList[i].isChecked = true;
                            }
                        }
                    }

                    component.set("v.existingProductTypeId", existingProductTypeRecord.Id);
                    component.set("v.producttype",existingProductTypeRecord.Name);
                    component.set("v.description",existingProductTypeRecord.Description__c);
                    component.set("v.productCode",existingProductTypeRecord.ProductCode__c);
                    component.set("v.producttyperef",existingProductTypeRecord.Product_Type_Reference__c);
                }else{
                    component.set("v.existingProductTypeId", '');
                    component.set("v.producttype",'');
                    component.set("v.description",'');
                    component.set("v.productCode",'');
                    component.set("v.producttyperef",'');
                }
                helper.readySaveButton(component);
                component.set('v.productTypeList', productTypeElemsList);
            } else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: " + errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });
        $A.enqueueAction(action);
    },
     saveandNewRec : function(component, event, helper){  
         component.set("v.saveAndNew", true);    
         helper.handleSaveandNew(component,event,helper);
    }, 
     saveandNewOffer : function(component, event, helper){  
         component.set("v.saveNewOffer", true);    
         helper.handleSaveandNew(component,event,helper);
    },
     handleChange: function (cmp, evt) {
        let eflag = cmp.get("v.Exclusive");
         console.log('eflag&&&&&&&'+eflag);
    },
    handlefeatureFlagChange: function(cmp,evt){
        let Fflag = cmp.get("v.featuredFlag");
         console.log('Fflag&&&&&&&'+Fflag);
    },
     handleInteractiveHouseChange: function(cmp,evt){
        let inHouse = cmp.get("v.interactiveHouse");
         console.log('inHouse&&&&&&&'+inHouse);
    }
});