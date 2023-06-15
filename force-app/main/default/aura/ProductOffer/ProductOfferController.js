({
    doInit : function(component, event, helper) {
        component.set("v.isSpinnerShow",false);
        var proName = component.get('v.productnameid'); 
        console.log('product res'+component.get('v.productnameid'));
        let productOfferRecord = component.get('v.productOfferRecord');
        let isEdit = false;
        productOfferRecord.ProductCatalog_ID__c =proName;
        component.set('v.productOfferRecord',productOfferRecord); 
        helper.getContractDefaultValuesJs(component);
         if(proName)
        { 
         helper.getProName(component,proName,isEdit);
        }
       // helper.getValuePriceEntry(component);
        helper.getUseInfoJs(component);
        var randomString = helper.randomString(8, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
        component.set('v.randomString',randomString);
        helper.getTableColumns(component);
        helper.getPriceEntries(component); 
    },
    productCatalogIdChange : function(component, event, helper) {
        if(component.get('v.productOfferRecord.ProductCatalog_ID__c') == '' || component.get('v.productOfferRecord.ProductCatalog_ID__c') == undefined){
            component.set('v.isModalProductCatalogOpen',true);
        }
        
    },
    onlySave : function(component, event, helper) {
        component.set('v.isFromNew', false);
        helper.checkDuplicates(component,false);
        
    },
    saveAndNew : function(component, event, helper) {
        component.set('v.isFromNew', true);
        helper.checkDuplicates(component,true);
        
    },
    saveNewProductOffer: function(component, event, helper) {
        helper.saveRec(component,component.get('v.isFromNew'));
        helper.closeDuplicateModal(component);
        
    },
    closeDuplicateModal: function(component, event, helper) {
        helper.closeDuplicateModal(component);
        
    },
    handleRecordUpdated: function(component, event, helper) {
        var eventParams = event.getParams();
        let isEdit = true;
  		
        console.log('### handleRecordUpdated: ' + eventParams.changeType);
        if(eventParams.changeType === "LOADED") {
            // record is loaded (render other component which needs record data value)
            var productOfferRecord = component.get("v.simpleRecord");
            console.log('### productOfferRecord: ' + JSON.stringify(productOfferRecord));
            helper.getProName(component,productOfferRecord.ProductCatalog_ID__c,isEdit);
            component.set("v.productOfferRecord",component.get("v.simpleRecord"));
            component.set("v.channelValue",component.get("v.simpleRecord").Channel__c);
        } else if(eventParams.changeType === "CHANGED") {
            // record is changed
        } else if(eventParams.changeType === "REMOVED") {
            // record is deleted
        } else if(eventParams.changeType === "ERROR") {
            // there’s an error while loading, saving, or deleting the record
            var errorMessage = event.getParam("targetError");
            console.log('Error: ' + errorMessage);
        }
        
    },
    closeModel : function(component, event, helper) {
        window.history.back();
        
    },
    changeToEdit : function(component, event, helper) {
        component.set('v.isView',false);
        
    },

   HideMe: function(component, event, helper) {
      component.set("v.ShowModule", false);
       
   },
   addNewRow: function(component, event, helper) {
      component.set("v.productOfferRecord.ProductOffer_ID__c",component.get("v.recordId"));
      component.set("v.ShowModule", true);
      component.set("v.selectedRecordId", "");
      component.set("v.channelValue", "All");
      component.set("v.changeToCode", "");
       
   },
   onChangeChannelFilter : function (component, event, helper) {
        if(component.get('v.filteredData').length >0){
            component.set("v.channelData",component.get('v.filteredData')); 
        }else{
            component.set("v.channelData",component.get("v.allPriceEntiresData"));  
        }
        var priceEntryListMain = component.get("v.channelData");
        var channelFilter = component.get("v.channelFilter");
        var list = [];
        console.log('length******************'+priceEntryListMain.length);
        console.log('sDate****'+$A.util.isEmpty(component.get("v.sDate")));
        if($A.util.isEmpty(component.get("v.sDate")) || $A.util.isEmpty(component.get("v.eDate"))){
            for(var index = 0; index < priceEntryListMain.length; index++){
                console.log('priceEntryListMain[index].Channel__c****'+priceEntryListMain[index].Channel__c);
                if(channelFilter == priceEntryListMain[index].Channel__c ){
                    list.push(priceEntryListMain[index]);
                }
            }
        }else{
            console.log('channael filter*****'+ JSON.stringify(component.get("v.filteredData")));
            var priceFilter = component.get("v.filteredData");  
            for(var index = 0; index < priceFilter.length; index++){
                if(channelFilter == priceFilter[index].Channel__c ){
                    list.push(priceFilter[index]);
                } 
            } 
        }
        
        if(list.length == 0){
            //component.set("v.channelData",component.get("v.filteredData")); 
            
        }
        
        console.log('list***'+list.length);
        component.set("v.channelData",list);
        component.set("v.totalRecords",list.length);
        helper.preparePagination(component, component.get("v.channelData"));
   		
   },
    selectedRecord : function (component, event, helper){

    },
    editSelected : function (component, event, helper){
        if(document.querySelector('input[name="default"]:checked') == null){
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "message": "Please select atleast one record.",
                "type": "error"
            });
            toastEvent.fire();
        }else{
            var selectedId = document.querySelector('input[name="default"]:checked').value;
            component.set('v.selectedRecordId',selectedId);
            component.set("v.ShowModule", true);
            var priceEntryList = component.get("v.priceEntryList");
            for(var i=0; i<priceEntryList.length; i++){
                if(priceEntryList[i].Id == selectedId){
                    component.set('v.changeToCode',priceEntryList[i].ChangeTo_ID__r.ProductOfferCode__c );
                }
            }
        }
        
    },
    getChangeToCode: function (component, event, helper){
        var changeTo = event.getSource().get("v.value");
        if(changeTo){
            var action = component.get("c.getNewOfferCode");
            action.setParams({changeToId:changeTo});
            action.setCallback(this, function(response){
                var state = response.getState();
                if (state === "SUCCESS") {
                    component.set("v.changeToCode", response.getReturnValue());
                }
            });
            $A.enqueueAction(action)
        }
    
    },
    handleSuccess: function(component, event, helper) {
        var updatedRecord = JSON.parse(JSON.stringify(event.getParams()));
        //helper.getValuePriceEntry(component);
        helper.getPriceEntries(component);
        component.set('v.selectedRecordId','');
        component.set("v.channelValue", "");
        console.log('Called 14');
    },
    handleError: function(component, event) {
        if(event.getParams().output.errors && event.getParams().output.errors.length > 0){

            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "message": event.getParams().output.errors[0].message,
                "type": "error"
            });
            toastEvent.fire();
        }
        /*var updatedRecord = JSON.parse(JSON.stringify(event.getParams()));
        console.log('handleError: ', updatedRecord.output.fieldErrors);
        for (var key in updatedRecord.output.fieldErrors) {
            if (updatedRecord.output.fieldErrors.hasOwnProperty(key)) {
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "message": updatedRecord.output.fieldErrors[key][0].message,
                    "type": "error"
                });
                toastEvent.fire();
            }
        }*/
    },
    handleOnSubmit : function(component, event, helper) {
        event.preventDefault(); //Prevent default submit
        var eventFields = event.getParam("fields");
        var channelValue = component.get("v.channelValue");
        
        eventFields["ProductOffer_ID__c"] = component.get("v.recordId");
        
        if (channelValue != null && channelValue != '')
	        eventFields["Channel__c"] = channelValue;
        
        component.find('recordCreateForm').submit(eventFields); //Submit Form
        //console.log('handleOnSubmit: ',  component.find('recordCreateForm').submit(eventFields));
        //
        //component.set("v.channelValue", "");
    },
    isBundleChange : function(component, event, helper) {
        var isBundle = component.find("isBundleField").get("v.value");
        let productOfferRecord = component.get('v.productOfferRecord');
        productOfferRecord.IsBundle__c = !isBundle;
        component.set('v.productOfferRecord',productOfferRecord);
    }, 
    isConfigurationTypeChange : function(component, event, helper) {
        var configurationType = component.find("configurationTypeField").get("v.value");
        let productOfferRecord = component.get('v.productOfferRecord');
         console.log('configurationType'+configurationType);
        if(configurationType =='11 for 12 with 30 day wait'){ 
            productOfferRecord.BillOffset__c = 0;
            productOfferRecord.WaitOffset__c = 30;
            productOfferRecord.StartOffset__c = 0;
            productOfferRecord.Term__c = 12;
            productOfferRecord.Full_Term__c = false;
        }else if(configurationType == 'Instant Cover'){
            productOfferRecord.BillOffset__c = 0;
            productOfferRecord.WaitOffset__c = 0;
            productOfferRecord.StartOffset__c = 0;
            productOfferRecord.Term__c = 12; 
            productOfferRecord.Full_Term__c = true;
        }else if(configurationType == '12 for 12')
        {
            productOfferRecord.BillOffset__c = 30;
            productOfferRecord.WaitOffset__c = 30;
            productOfferRecord.StartOffset__c = 30;
            productOfferRecord.Term__c = 12; 	
            productOfferRecord.Full_Term__c = true;
        }else if(configurationType =='11 for 12 with 10 day wait')
        {
            productOfferRecord.BillOffset__c = 0;
            productOfferRecord.WaitOffset__c = 10;
            productOfferRecord.StartOffset__c = 0;
            productOfferRecord.Term__c = 12; 	
            productOfferRecord.Full_Term__c = false;   
        }else if(configurationType =='90 day wait 10 year coverage'){
            productOfferRecord.BillOffset__c = 0;
            productOfferRecord.WaitOffset__c = 90;
            productOfferRecord.StartOffset__c = 0;
            productOfferRecord.Term__c = 120; 	
            productOfferRecord.Full_Term__c = false;   
        }
         component.set('v.productOfferRecord',productOfferRecord);
    },
    isDiscountEligibleChange : function(component, event, helper) {
        var isDiscountEligible = component.find("isDiscountEligibleField").get("v.value");
        let productOfferRecord = component.get('v.productOfferRecord');
        productOfferRecord.DiscountEligible__c = !isDiscountEligible;
        component.set('v.productOfferRecord',productOfferRecord);
    },
    isDiscountCountChange : function(component, event, helper) {
        var isDiscountCount = component.find("isDiscountCountField").get("v.value");
        let productOfferRecord = component.get('v.productOfferRecord');
        productOfferRecord.DiscountCount__c = !isDiscountCount;
        component.set('v.productOfferRecord',productOfferRecord);
    },
    isFullTermChange : function(component, event, helper) {
        var isFullTerm = component.find("isFullTermField").get("v.value");
        let productOfferRecord = component.get('v.productOfferRecord');
        productOfferRecord.Full_Term__c = !isFullTerm;
        component.set('v.productOfferRecord',productOfferRecord);
    },
    onDonotuseChange : function(component, event, helper) {
        console.log('DonotuseChange event*************');
        let productOfferRecord = component.get('v.productOfferRecord');
        productOfferRecord.Do_not_Use__c = productOfferRecord.Do_not_Use__c != true ? true : false;
        console.log('productOfferRecord.Do_not_Use__c************'+productOfferRecord.Do_not_Use__c);
        if(productOfferRecord.Do_not_Use__c){
       let AllPriceEntries = component.get("v.allPriceEntiresData");
           var __FOUND = AllPriceEntries.filter((cli, index)=> {
            if(cli.NewSell__c == true && cli.StartDate__c != undefined && cli.StartDate__c != ''
               && (cli.EndDate__c == undefined || cli.EndDate__c == '')){
                            return true;
            }
        });
        console.log('After _Found__'+JSON.stringify(__FOUND));
        if(__FOUND.length >0){
           component.set("v.isshowAlertModel", true);
          /*let productOfferRecord = component.get('v.productOfferRecord');
        if(productOfferRecord.Do_not_Use__c != true){
            productOfferRecord.Do_not_Use__c = true;
        }else{
            productOfferRecord.Do_not_Use__c = false;
        } 
       component.set('v.productOfferRecord',productOfferRecord);  */
        }
        }
       
    },
    donotusetoggle : function(component, event, helper) {
        let productOfferRecord = component.get('v.productOfferRecord');
        productOfferRecord.Do_not_Use__c  = true;
        component.set('v.productOfferRecord',productOfferRecord);
        component.set("v.isshowAlertModel", false);
    },
    closeisShowAlertModel : function(component, event, helper) {
        let productOfferRecord = component.get('v.productOfferRecord');
        productOfferRecord.Do_not_Use__c  = false;
        component.set('v.productOfferRecord',productOfferRecord);
        component.set("v.isshowAlertModel", false);
    },
    
    handleSave : function(component,event,helper) {
        //var rows= component.get('v.data');
        var draftValues = event.getParam('draftValues');
        if(draftValues.length > 0) {
            var rows = component.get("v.filteredData");
            console.log('draftValues--->'+JSON.stringify(draftValues));
            component.set("v.filteredData", rows);
           var action = component.get("c.updatePriceEntriesRecords");
            action.setParams({
                "PriceEntriesList" : draftValues
            });
            
            action.setCallback(this, $A.getCallback(function (response) {
                var state = response.getState();
                console.log('response***********'+state);
                if (state == "SUCCESS") {
                    helper.toastMsg( 'success', 'Records Updated Successfully.' );
                    window.location.reload();
                }
                /*else if (state === "ERROR") {
                var errors = response.getError();
                    console.log('errors*********'+JSON.stringify(errors));
                if (errors) {
                        helper.toastMsg( 'error', JSON.stringify(errors[0].pageErrors[0].message)); 
                        console.log("Error messages: " + 
                                 JSON.stringify(errors[0].pageErrors[0].message));
                    }
                
                }*/
                else if (state === "ERROR") {
                    var errors = response.getError();
                    //console.log('errors[0]>>>>'+JSON.stringify(errors[0].fieldErrors[0].message));
                    console.log('errors*********'+JSON.stringify(errors));
                    console.log('errors[0]>>>>'+JSON.stringify(errors[0].fieldErrors.EndDate__c[0].message));
                    if (errors) {
                        helper.toastMsg( 'error', JSON.stringify(errors[0].fieldErrors.EndDate__c[0].message)); 
                        helper.toastMsg( 'error', JSON.stringify(errors[0].pageErrors[0].message)); 
                        console.log("Error messages: " + 
                                    JSON.stringify(errors[0].pageErrors[0].message));
                    }
                    
                }
                else{
                    helper.toastMsg( 'error', 'Please Check the date Format.' );  
                }
            }));
            
            //helper.handleInlineEdit(component,event,helper,draftValues);*/
        }
        $A.enqueueAction(action);
    },
    handleSort : function(component, event, helper) {
        var sortBy = event.getParam("fieldName");
        var sortDirection = event.getParam("sortDirection");
        component.set("v.sortBy",sortBy);
        console.log('sortBy******'+sortBy);
        component.set("v.sortDirection",sortDirection);
        helper.sortData(component, sortBy, sortDirection);
    },
     isProValChange : function(component, event, helper) { 
        var productCatalogId = component.find("productcatalogId").get("v.value");  
        let isEdit = false;
        console.log('productCatalogId new'+productCatalogId);
        helper.getProName(component,productCatalogId,isEdit);
    },
    createNewPriceEntrie : function(component, event, helper) {
        console.log('test');
        /*var createRecordEvent = $A.get('e.force:createRecord');
        createRecordEvent.setParams({
            'entityApiName' : 'Price_Entry__c',
            'defaultFieldValues' : {
                'ProductOffer_ID__c' : component.get("v.recordId")
            },
            panelOnDestroyCallback: () => { // <-- This is not available for force:editRecord
                console.log('The Create Record modal has been closed!');
            },
               
        })
        
        createRecordEvent.fire();*/
        // var windowHash = window.location.hash;
        
        $A.get("e.force:createRecord").setParams({
            "entityApiName" : "Price_Entry__c",
            'defaultFieldValues' : {
                'ProductOffer_ID__c' : component.get("v.recordId")
            },
            "navigationLocation": "RELATED_LIST",
            "panelOnDestroyCallback": function(event) {
                $A.get('e.force:refreshView').fire();
            }
        }).fire();
        
        $A.get('e.force:refreshView').fire();
        //helper.refreshpage(component);
    },
    /* createNewPriceEntrie: function(component, event, helper) {
    var windowHash = window.location.hash;*/
        /*console.log('windowHash********'+windowHash);
    var createEvent = $A.get("e.force:createRecord");
    createEvent.setParams({
        "entityApiName": "Price_Entry__c",
        "panelOnDestroyCallback": function(event) {
            window.location.hash = windowHash;
        }
    });
    createEvent.fire();
},*/
    onNext: function(component, event, helper) {        
        let pageNumber = component.get("v.currentPageNumber");
        component.set("v.currentPageNumber", pageNumber + 1);
        helper.setPageDataAsPerPagination(component,component.get('v.filteredData'));
    },
    
    onPrev: function(component, event, helper) {        
        let pageNumber = component.get("v.currentPageNumber");
        component.set("v.currentPageNumber", pageNumber - 1);
        helper.setPageDataAsPerPagination(component,component.get('v.filteredData'));
    },
    
    onFirst: function(component, event, helper) {        
        component.set("v.currentPageNumber", 1);
        helper.setPageDataAsPerPagination(component,component.get('v.filteredData'));
    },
    
    onLast: function(component, event, helper) {        
        component.set("v.currentPageNumber", component.get("v.totalPages"));
        helper.setPageDataAsPerPagination(component,component.get('v.filteredData'));
    },
    
    onPageSizeChange: function(component, event, helper) {   
        console.log('filterData***********'+ component.get('v.filteredData').length);
        if(component.get('v.filteredData').length >0){
            helper.preparePagination(component, component.get('v.filteredData'));
        }else{
            //component.set("v.channelData",component.get("v.allPriceEntiresData")); 
            console.log('All Price entries****************'+component.get("v.allPriceEntiresData"));
            helper.preparePagination(component,component.get("v.allPriceEntiresData"));
        }
        
    },
    filter: function(component, event, helper) {  
        component.set("v.isSpinnerShow",true);
        if($A.util.isEmpty(component.get("v.sDate")) &&  $A.util.isEmpty(component.get("v.eDate")) ){
            helper.toastMsg( 'error', 'Please fill in the Either Start date Or  End date' );
            component.set("v.isSpinnerShow",false);
        }else if(!$A.util.isEmpty(component.get("v.sDate")) &&  $A.util.isEmpty(component.get("v.eDate")) ){
            var eeDate = component.set("v.eDate", null);
            helper.filterPriceEntrieRecord(component,component.get("v.sDate"),eeDate, component.get("v.channelFilter"));
        }else if($A.util.isEmpty(component.get("v.sDate")) &&  !$A.util.isEmpty(component.get("v.eDate")) ){
            
            var ssDate = component.set("v.sDate", null);
            helper.filterPriceEntrieRecord(component,ssDate,component.get("v.eDate"), component.get("v.channelFilter"));
        } else{
            console.log('pricing Start**********');
            helper.filterPriceEntrieRecord(component,component.get("v.sDate"),component.get("v.eDate"), component.get("v.channelFilter"));
        }    
    },
    reset: function(component, event, helper) {  
        component.set('v.sDate','');
        component.set("v.eDate",'');
        component.set("v.channelFilter",component.get("v.channelFilterPlaceholder"));
        helper.getPriceEntries(component);  
        
    },
    refreshpage:function(component){
        console.log('refresh');
        $A.get('e.force:refreshView').fire(); 	
    }, 
    isTcRecordValue: function(component, event, helper) {         
        var tcVal = component.find("tcrecordId").get("v.value");
        console.log(' tc record value***********'+ tcVal);
        var action = component.get("c.getProductTCName");
        action.setParams({
            tcID:tcVal.toString()
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") { 
                console.log(' tc record success***********'+ response.getReturnValue());
                let productOfferRecord = component.get('v.productOfferRecord');
                productOfferRecord.Name =response.getReturnValue();
                component.set('v.productOfferRecord',productOfferRecord); 
            }
        });
        $A.enqueueAction(action)
    },
    handleChange : function(component, event, helper) {  
        console.log('handlechange is calling');
        var donotusevalue = component.get("v.donotuseFlag");
        if(component.get("v.donotuseFlag") == false){
           component.set("v.donotuseFlag",true);
        component.set("v.productOfferRecord.Do_not_use__c", true);
             console.log('donotusevalue*******'+component.get("v.donotuseFlag"));
        }else if(component.get("v.donotuseFlag") == true){
             component.set("v.donotuseFlag",false);
        component.set("v.productOfferRecord.Do_not_use__c", false);
             console.log('donotusevalue*******'+component.get("v.donotuseFlag"));
        }
       
        },
	handleRowAction: function (cmp, event, helper) {
        var action = event.getParam('action');
        var row = event.getParam('row');
        switch (action.name) {
            case 'Edit':
                console.log('Showing Details: ' + JSON.stringify(row.Id));
                var selectedId = row.Id;//document.querySelector('input[name="default"]:checked').value;
                cmp.set("v.selectedRecordId",row.Id);
                console.log('Selected RecordID*****'+cmp.get("v.selectedRecordId"));
                cmp.set("v.ShowModule", true);
                
                break;
		}
		},
    setBillType : function(cmp, event) {
        var billType = event.getParam("billType");
        console.log('billType>>'+billType);
		var productOfferRecord = cmp.get("v.productOfferRecord");
        if(billType != null){
            if(billType == "OFF Bill"){
                productOfferRecord.BillType__c = "OffBill";
                cmp.set('v.isBillTypeBoth',true);
            }
            else if(billType == "ON Bill"){
                productOfferRecord.BillType__c = "OnBill";
                cmp.set('v.isBillTypeBoth',true);
            }else{
                cmp.set('v.isBillTypeBoth',false);
            }
            cmp.set("v.productOfferRecord", productOfferRecord);
        }
       
        
    },
    handleCondition : function(component, event, helper) { 
        if($A.util.isEmpty(event.getParam('value')) )        
    		component.set("v.isRenew",false);
        else
            component.set("v.isRenew",true);
    },
    isBillTypeChange : function(component, event, helper){
        var billType = component.find("isBillTypeField").get("v.value");
        console.log(billType);
        var productOfferRecord = component.get("v.productOfferRecord");
        productOfferRecord.BillType__c = billType;
        component.set("v.productOfferRecord", productOfferRecord);
        console.log(productOfferRecord.BillType__c);
    }
   
})