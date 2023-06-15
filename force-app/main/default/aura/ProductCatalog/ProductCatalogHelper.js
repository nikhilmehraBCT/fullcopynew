({
    calculateFieldValue : function(component) {
        var productTypeList = component.get("v.productTypeList");
        var producttype = '';
        var description = '';
        for(var i=0; i < productTypeList.length; i++){
            if(productTypeList[i].isChecked){
                if(producttype == ''){
                    producttype = productTypeList[i].record.Name;
                }else{
                producttype += '-'+ productTypeList[i].record.Name;
                }
                if(description == ''){
                    description = productTypeList[i].record.ElementCode__c;
                }else{
                description += ' + '+ productTypeList[i].record.ElementCode__c;
                }
            }
        }
        component.set("v.producttype",producttype);
        component.set("v.description",description);
    },
    searchProductTypeRec : function(component, event, helper){
        var productTypeList = component.get("v.productTypeList");
        var selectedElements = [];
        for(var i = 0; i<productTypeList.length; i++){
            var wrpObj = productTypeList[i];
            if(wrpObj.isChecked){
                selectedElements.push(wrpObj.record.Id);
            }
        }

        var action = component.get("c.searchProRecords");
        action.setParams({
            "selectedElements": selectedElements
        });

        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var existingProductTypeRecord = response.getReturnValue();
                
                if(existingProductTypeRecord != null){
                    component.set("v.existingProductTypeId", existingProductTypeRecord.Id);
                    component.set("v.producttype",existingProductTypeRecord.Name);
                    component.set("v.description",existingProductTypeRecord.Description__c);
                    component.set("v.productCode",existingProductTypeRecord.ProductCode__c);
                    component.set("v.producttyperef",existingProductTypeRecord.Product_Type_Reference__c);
                    component.set("v.isAllowSave",false);
                }else{
                    //helper.calculateFieldValue(component);
                    component.set("v.existingProductTypeId", '');
                    component.set("v.producttype",'');
                    component.set("v.description",'');
                    component.set("v.productCode",'');
                    component.set("v.producttyperef",'');
                    component.set("v.isAllowSave",true);
                    
                }
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
    },
    readySaveButton : function(component){
        var productTypeList = component.get('v.productTypeList');
        var isAllChecked = 0;
        for(var index = 0; index < productTypeList.length; index++){
            if(productTypeList[index].isChecked){
            	isAllChecked++;
        	}
        }
        var selected = document.querySelector('input[name="options"]:checked');

        if(isAllChecked > 0 && selected != null){
            component.set("v.isSaveButtonDisabled",false);
             component.set('v.isSaveNewButtonDisabled',false);
        }else{
            component.set("v.isSaveButtonDisabled",true);
        }
    },
         restrictuserDetails : function(component){
         var action = component.get("c.getUserInfo");
         action.setCallback(this, function(response) {
             console.log(JSON.stringify(response.getReturnValue()))
            component.set("v.isSpinnerShow", false);
             component.set("v.uflag",response.getReturnValue());
        });
        $A.enqueueAction(action);
    },
     handleSaveandNew : function(component,event,helper){
       console.log('IT is working****');
          console.log('ProductTypelist>>'+component.get("v.productTypeList"));
           console.log('ProductTypelist1>>'+component.get("v.partnerTerritoriesList"));
        var productTypeList = component.get("v.productTypeList");
        var partnerTerritoriesList = component.get("v.partnerTerritoriesList");
        var selectedElements = 0;
        for(let i=0; i < productTypeList.length; i++){
            if(productTypeList[i].isChecked){
                selectedElements++;
            }
        }
        var selected = document.querySelector('input[name="options"]:checked');
        var partnerTerritoryRecord = null;
        if(component.get('v.recordId').trim() == '' && selected != null){
            partnerTerritoryRecord = partnerTerritoriesList[parseInt(selected.id)-1].record;
        }
        if(component.get('v.productCatalogName').trim() == ''){
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "message": "The Product Catalog Name field is required.",
                "type": "error"
            });
            toastEvent.fire();
        }else if(component.get('v.recordId').trim() == '' && selected == null){
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "message": "Please select at least one Partner Territory.",
                "type": "error"
            });
            toastEvent.fire();
        }else if(selectedElements == 0){
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "message": "Please select at least one Product Type Element.",
                "type": "error"
            });
            toastEvent.fire();
        }else if(!component.get('v.recordId') && !component.get('v.existingProductTypeId')){
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "message": "Product Type for selected Product Type Elements does not exist.",
                "type": "error"
            });
            toastEvent.fire();
        }else{
            component.set("v.isSpinnerShow", true);
            var action = component.get("c.saveRecord");
            console.log('alteranivecatalogid************'+component.get('v.alternateCatalogID'));
            console.log('interactiveHouse************'+ component.get('v.interactiveHouse'));
            if($A.util.isEmpty(component.get('v.interactiveHouse'))){
                component.set('v.interactiveHouse','');
            }
            console.log('After interactiveHouse************'+ component.get('v.interactiveHouse'));
            console.log('After interactiveHouse************'+ component.get('v.banner'));
            action.setParams({
                "productCatalogCode": component.get('v.productCatalogCode'),
                "productCatalogName": component.get('v.productCatalogName'),
                "existingProductTypeId": component.get('v.existingProductTypeId'),
                "partnerTerritoryRecord": partnerTerritoryRecord,
                "existingProductCatalogId": component.get('v.existingProductCatalogId'),
                "productSubCatageroryID" : component.get('v.productsubcategoryID'),
                "banner" : component.get('v.banner'),
                "hsPlanIcon" : component.get('v.hsPlanIcon'),
                "productCatageroryID" : component.get('v.productCategoryID'),
                "featuredFlag" : component.get('v.featuredFlag'),
                "featuredImage" : component.get('v.featuredImage'),
                "interactiveHouse" : component.get('v.interactiveHouse'),
                "digitalSequence" : component.get('v.digitalSequence'),
                "alternateCatalogID" : component.get('v.alternateCatalogID'),
                "exclusive" : component.get('v.Exclusive')
            });
            
            action.setCallback(this, function(response){
                component.set("v.isSpinnerShow", false);
                var state = response.getState();
                console.log('state********'+state);
                if (state === "SUCCESS" ) {
                   console.log("saveandNew Functinality************"+component.get('v.saveAndNew'));
                     console.log('response in>>'+response.getReturnValue());
                    if(component.get('v.saveAndNew') == true){
           				helper.clearAllAttributeValues(component,event,helper);
                        var toastEvent = $A.get("e.force:showToast");
                        toastEvent.setParams({
                            title: "Success!",
                            message: "Product Catalog record was created",
                            type: "success"
                        });
                        toastEvent.fire();
                         $A.get('e.force:refreshView').fire();
                    }
                    else if(component.get('v.saveNewOffer') == true){
                        console.log('Response>>'+response.getReturnValue());
                        var evt = $A.get("e.force:navigateToComponent");
                        evt.setParams({
                            componentDef: "c:ProductOffer",
                            componentAttributes: {
                                productnameid: response.getReturnValue()
                            }
                        });
                        evt.fire(); 
                    }else{
                        console.log('response in>>'+response.getReturnValue()); 
                        window.location = '/'+response.getReturnValue();
                    } 
                }
            });
            $A.enqueueAction(action);
        }
        
    },
    clearAllAttributeValues : function(component, event, helper){
                     var productTypeList = component.get("v.productTypeList");
        for(var i=0; i < productTypeList.length; i++){
            if(productTypeList[i].isChecked){
                productTypeList[i].isChecked = false;
            }
        }
        component.set("v.productTypeList",productTypeList);
        component.set("v.producttype",'');
        component.set("v.description",'');
        component.set("v.productCode",'');
        component.set("v.producttyperef",'');
        component.set("v.partnerCode",'');
        component.set("v.territoryType",'');
        component.set("v.productCatalogCode",'');
        component.set("v.productCatalogName",'');
        component.set("v.territoryNameKeyword",'');
        component.set("v.existingProductTypeId",'');
        component.set("v.existingProductCatalogId",'');
        component.set("v.partnerTerritoriesList",[]);
        component.set('v.searchText', '');
        component.set("v.productsubcategoryID",'');
        component.set("v.productCategoryID",'');
        component.set("v.hsPlanIcon",'');
        component.set("v.banner",'');
        component.set("v.featuredImage",'');
        component.set("v.featuredFlag",'');
        component.set("v.interactiveHouse",'');
        component.set("v.digitalSequence",'');
        component.set("v.alternateCatalogID",'');
        component.set("v.Exclusive",'');
        component.set("v.isSaveButtonDisabled", true);
    }
    
    
})