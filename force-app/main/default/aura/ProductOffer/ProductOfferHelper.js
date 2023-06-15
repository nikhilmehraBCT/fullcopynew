({
    saveRec : function(component, isFromNew) {
        var helper = this;
        let poRec = component.get("v.productOfferRecord");
        console.log('poRec>>'+poRec.BillType__c+'as'+poRec.ProductCatalog_ID__c);
        if(poRec.TC__c.length == 0){
            poRec.TC__c = '';
            component.set("v.productOfferRecord", poRec);
        }
        if((component.get('v.recordId') == '' || component.get('v.recordId') == undefined) && component.get('v.productOfferRecord.ProductCatalog_ID__c') == ''){
            helper.showErrorToast('The Product Catalog Code field is required field to save the records.');
        }else if((component.get('v.recordId') == '' || component.get('v.recordId') == undefined) && component.get('v.productOfferRecord.Name')==''){
            helper.showErrorToast('The Offer Name field is required.');
        }else{
          
            var action= component.get("c.saveRecord");
            action.setParams({productOfferRecord:component.get("v.productOfferRecord")});
            action.setCallback(this,function(response){
                 var state= response.getState();
                if(state == "SUCCESS"){
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Success!",
                        "type":"success",
                        "message": "The record is successfully saved."
                    });
                    toastEvent.fire();
                    let poRec = component.get("v.productOfferRecord"); 
                        poRec.Configuration_Type__c='--None--';
                        component.set("v.productOfferRecord", poRec);  
                    if(isFromNew){
                        var contractDefaultValues = component.get('v.contractDefaultValues');
                        var productOfferRecord = {'ProductCatalog_ID__c':'','Marketing_Product_Name__c':'','Name':'','TC__c':'','Underwriter_Rate_Code__c':'','BillOffset__c':0,'WaitOffset__c':0,'StartOffset__c':0,
                                                  'Term__c':0,'Full_Term__c':false,'Frequency__c':'','Description__c':'','BillType__c':'','DiscountEligible__c':false,
                                                  'DiscountCount__c':false,'IsBundle__c':false,'BundlePrice__c':'','Comment__c':''};
                        productOfferRecord.ProductCatalog_ID__c = component.get('v.productOfferRecord').ProductCatalog_ID__c;
                        /*productOfferRecord.BillOffset__c = contractDefaultValues.Bill_Offset__c;
                        productOfferRecord.WaitOffset__c = contractDefaultValues.Wait_Offet__c;
                        productOfferRecord.StartOffset__c = contractDefaultValues.Start_Offset__c;
                        productOfferRecord.Term__c = contractDefaultValues.Term__c;
                        productOfferRecord.Frequency__c = contractDefaultValues.Frequency__c;*/
                        productOfferRecord.IsBundle__c = false;
                        productOfferRecord.BundlePrice__c = 'Single';
                        component.set('v.productOfferRecord',productOfferRecord);
                        helper.getContractDefaultValuesJs(component);
                        component.set("v.recordId","");
                    }else{
                        window.location = '/'+response.getReturnValue();
                    }
                }else if (state === "ERROR") {
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            var toastEvent = $A.get("e.force:showToast");
                            toastEvent.setParams({
                                "title": "Error!",
                                "type":"error",
                                "message": errors[0].message
                            });
                            toastEvent.fire();
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
    checkDuplicates: function(component,isFromNew){
        let poRec = component.get("v.productOfferRecord");
        var action= component.get("c.checkForDuplicates");
        if(poRec.TC__c && poRec.ProductCatalog_ID__c && poRec.Name){
            console.log('checking Duplicate***********************');
            console.log('proRecords************'+poRec);
            action.setParams({
                tcId:poRec.TC__c,
                pcId:poRec.ProductCatalog_ID__c,
                recId:component.get("v.recordId")
            });
            action.setCallback(this,function(response){
                var state= response.getState();
                if(state == "SUCCESS"){
                    var duplicateResponse = response.getReturnValue();
                    if(!duplicateResponse.isDuplicate){
                        this.closeDuplicateModal(component);
                        this.saveRec(component,isFromNew);
                    }else{
                        component.set('v.isDuplicate',duplicateResponse.isDuplicate);
                        component.set('v.duplicates',duplicateResponse.duplicates);
                    }
                }else if (state === "ERROR") {
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({"title": "Error!","type":"error","message": errors[0].message});
                    toastEvent.fire();
                }
            });
            $A.enqueueAction(action);
        }else{
            this.saveRec(component,isFromNew);
        }
    },
    closeDuplicateModal : function(component) {
        component.set('v.isDuplicate',false);
        component.set('v.duplicates',[]);
    },
    getContractDefaultValuesJs : function(component) {
        var action= component.get("c.getContractDefaultValues");
        action.setCallback(this,function(response){
            var state= response.getState();
            if(state == "SUCCESS"){
                var contractDefaultValues = response.getReturnValue();
                component.set("v.contractDefaultValues",contractDefaultValues);
                var productOfferRecord = component.get("v.productOfferRecord");
                if(component.get("v.recordId") == '' || component.get("v.recordId") == undefined){
                    productOfferRecord.BillOffset__c = contractDefaultValues.Bill_Offset__c;
                    productOfferRecord.WaitOffset__c = contractDefaultValues.Wait_Offet__c;
                    productOfferRecord.StartOffset__c = contractDefaultValues.Start_Offset__c;
                    productOfferRecord.Term__c = contractDefaultValues.Term__c;
                    productOfferRecord.Full_Term__c = contractDefaultValues.Full_Term__c;
                    productOfferRecord.Frequency__c = contractDefaultValues.Frequency__c;
                    productOfferRecord.BundlePrice__c = 'Single';
                    component.set("v.productOfferRecord", productOfferRecord);
                }
                
            }
        });
        $A.enqueueAction(action);
    },
    showErrorToast : function(msg) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "message": msg,
            "type": "error"
        });
        toastEvent.fire();
    },
    getValuePriceEntry : function(component){
        component.set("v.isSpinnerShow", true);
        var action = component.get("c.getPriceEntry");
        action.setParams({productOfferId:component.get("v.recordId")});
        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.priceEntryList", response.getReturnValue());
                component.set("v.priceEntryListMain", response.getReturnValue());
                component.set("v.isSpinnerShow", false);
                component.set("v.ShowModule", false);
                component.set("v.channelFilter", "All");
            }
        });
        $A.enqueueAction(action)
    },
    getUseInfoJs : function(component){
        var action = component.get("c.getUserInfo");
        action.setCallback(this, function(response){
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                console.log(result);
                component.set("v.userInfo", result.userInfo);
                component.set("v.uservalidationFlag", result.DoNotUseAccess);
                /*var profileName = response.getReturnValue().Profile.Name;
                var userName = response.getReturnValue().Name;
                if( profileName == 'System Administrator'
                   && ( userName == 'Marguerite Stadler' || userName == 'Noelle Hallahan') 
                   && !$A.util.isEmpty(component.get("v.recordId")))
                {
                    component.set("v.uservalidationFlag", false);
                }
                else if(profileName == 'Product Manager'
                         && (userName == 'Stephanie Simons' || userName == 'Rebecca Greathouse' || userName == 'Lashawn Beard')
                         &&  !$A.util.isEmpty(component.get("v.recordId")) )
                {
                    component.set("v.uservalidationFlag", false);
                }*/
                console.log('userflag *************'+component.get("v.uservalidationFlag"));
            }
        });
        $A.enqueueAction(action)
    }
    ,
    randomString : function(length, chars){
        var result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    },
    getTableColumns : function(component) {
         var actions = [
            { label: 'Edit', name: 'Edit' }
        ];
        var columns = [
            {label: 'Price Entry Name', fieldName: 'PriceEntryUrl', type: 'url', typeAttributes:{
                label: {
                    fieldName: 'Name'
                },target:'_blank'
            },sortable: true
            },
            {label: 'Channel', fieldName: 'Channel__c', type: 'text',sortable: true},
            {label: 'Condition opp', fieldName: 'ConditionOpp__c', type: 'text',sortable: true},
            {label: 'Condition value', fieldName: 'Condition_Value__c', type: 'currency',sortable: true},
            {label: 'Price', fieldName: 'Price__c', sortable: true,type: 'currency'},
            {label: 'New Sell', fieldName: 'NewSell__c', type: 'boolean',sortable: true},
            {label: 'Renew', fieldName: 'Renew__c', type: 'boolean',sortable: true},
            {label: 'Marketing', fieldName: 'Marketing__c', type: 'boolean',sortable: true},
            {label: 'Start Date', fieldName: 'StartDate__c', type: 'date-local',editable: true,sortable: true, typeAttributes:{
                year: "numeric",month: "2-digit",day: "2-digit"},cellAttributes:{ class: 'slds-datepicker '}},
            {label: 'End Date', fieldName: 'EndDate__c', type: 'date-local',editable: true,sortable: true, typeAttributes:{
                year: "numeric",month: "2-digit",day: "2-digit"},cellAttributes:{ class: 'slds-datepicker',}},
          //  {label: 'Change To', fieldName: 'ChangeTo_ID__c', type: 'lookup',sortable: true},
            {label: 'Change To', fieldName: 'changeToUrl',type: 'url',typeAttributes:{
                label: {
                    fieldName: 'ChangeTo_ID__c'
                },target:'_blank'
            },sortable: true
            },
            {type: "button", typeAttributes: {
                label: 'Edit',
                name: 'Edit',
                title: 'Edit',
                disabled: false,
                value: 'edit',
                iconPosition: 'center'
            }},
            
             
        ];
        let mycolumns = columns.filter(col => col.label !== 'Marketing');
        component.set('v.columns', mycolumns);
    },
    getPriceEntries : function(component) {
            console.log('getPriceEntries with record Id is ***'+component.get("v.recordId"));
        var action = component.get("c.getPriceEntriesRecords");
        action.setParams({
            "PriceofferId" : component.get("v.recordId")
        });
        
        action.setCallback(this, $A.getCallback(function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
               /* response.getReturnValue().forEach(function(item){
                    //item['PriceEntryUrl'] = '/lightning/r/Price_Entry__c/' +item['Id'] +'/view';
                    
        			//item['changeToUrl'] = '/lightning/r/Product_Offer__c/' + item['ChangeTo_ID__r.ProductOfferCode__c']+'/view';
                });*/
                var rows = response.getReturnValue();
                    if(rows.length >0){
                        for ( var i = 0; i < rows.length; i++ ) {
                            var row = rows[i];
    						row.PriceEntryUrl = '/lightning/r/Price_Entry__c/' +row.Id+'/view';
        					row.name = row.Name;
                            console.log('ChangeTO****'+row.ChangeTo_ID__c );
                            console.log('If ChangeTO****'+!$A.util.isEmpty(row.ChangeTo_ID__c) );
                            
                            if ( !$A.util.isEmpty(row.ChangeTo_ID__c) ) {
                                console.log('ChangeTO NAme****'+row.ChangeTo_ID__r.ProductOfferCode__c );
                               // row.ChangeTo_ID__c = row.ChangeTo_ID__r.ProductOfferCode__c;
                                row.changeToUrl = '/lightning/r/Product_Offer__c/' + row.ChangeTo_ID__c+'/view';
                                row.ChangeTo_ID__c =  row.ChangeTo_ID__r.ProductOfferCode__c;
                            }                   
                        }
                    }
 				component.set("v.allPriceEntiresData", rows);
console.log("allPriceEntiresData *******",component.get("v.allPriceEntiresData"));

                component.set('v.filteredData', rows);
                component.set("v.totalRecords",rows.length);
				component.set('v.channelData', rows);
                this.preparePagination(component,component.get("v.allPriceEntiresData"));
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.error(errors);
            }
        }));
        $A.enqueueAction(action);
    },
    filterPriceEntrieRecord : function(component,startDate,endDate,channelFilter) {
        console.log('filterPriceEntrieRecord runnin');
        var action = component.get("c.getFilterPriceEntrieRecord");
        action.setParams({
            "PriceofferId" : component.get("v.recordId"),
            "sDate" : startDate,
            "eDate" : endDate,
            "channel" : channelFilter
        });
        
        action.setCallback(this, $A.getCallback(function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
               /* response.getReturnValue().forEach(function(item){
                    item['PriceEntryUrl'] = '/lightning/r/Price_Entry__c/' +item['Id'] +'/view';
                });*/
                 var rows = response.getReturnValue();
                if(rows.length >0){
                        for ( var i = 0; i < rows.length; i++ ) {
                            var row = rows[i];
    						row.PriceEntryUrl = '/lightning/r/Price_Entry__c/' +row.Id+'/view';
        					row.name = row.Name;
                            console.log('ChangeTO****'+row.ChangeTo_ID__c );
                            console.log('If ChangeTO****'+!$A.util.isEmpty(row.ChangeTo_ID__c) );
                            
                            if ( !$A.util.isEmpty(row.ChangeTo_ID__c) ) {
                                console.log('ChangeTO Name****'+row.ChangeTo_ID__r.ProductOfferCode__c );
                               // row.ChangeTo_ID__c = row.ChangeTo_ID__r.ProductOfferCode__c;
                                row.changeToUrl = '/lightning/r/Product_Offer__c/' + row.ChangeTo_ID__c+'/view';
                                row.ChangeTo_ID__c =  row.ChangeTo_ID__r.ProductOfferCode__c;
                            }                   
                        }
                }
                component.set('v.filteredData', rows);
                console.log('filteredData****'+component.get('v.filteredData'));
                component.set("v.totalRecords",rows.length);
                component.set('v.channelData', rows);
                component.set('v.intialLoad', true);
                this.preparePagination(component, component.get('v.filteredData'));
            } else if (state === "ERROR") {
                var errors = response.getError();
                console.error(errors);
            }
        }));
        $A.enqueueAction(action);
         component.set("v.isSpinnerShow",false);
    },
    preparePagination: function (component, PriceEntriesRecords) {
        console.log('priceEntries*************'+PriceEntriesRecords.length);
        console.log('pageSize*************'+component.get("v.pageSize"));
        let countTotalPage = Math.ceil(PriceEntriesRecords.length/component.get("v.pageSize"));
        let totalPage = countTotalPage > 0 ? countTotalPage : 1;
        component.set("v.totalPages", totalPage);
        component.set("v.currentPageNumber", 1);
        this.setPageDataAsPerPagination(component,PriceEntriesRecords);
    },
    setPageDataAsPerPagination: function(component,PriceEntriesRecords) {
        let data = [];
        let pageNumber = component.get("v.currentPageNumber");
        let pageSize = component.get("v.pageSize");
        let filteredData = PriceEntriesRecords;
        let x = (pageNumber - 1) * pageSize;
        for (; x < (pageNumber) * pageSize; x++){
            if (filteredData[x]) {
                data.push(filteredData[x]);
            }
        }
        console.log('channelFilter*****'+component.get("v.channelFilter"));
        component.set("v.tableData", data);
        component.set("v.isSpinnerShow", false);
        component.set("v.ShowModule", false);
        component.set("v.channelFilter",component.get("v.channelFilter"));
    }, 
    handleInlineEdit : function(component, event, helper, draftValues) {
        var rows = component.get("v.filteredData");
        var colData = component.get("v.columns");
        var finalRowList = [];
        component.set("v.updateRecordList",draftValues);
        
        var rowList = [];
        var draftMap = {};
        draftValues.forEach(function (rec) {            
            draftMap[rec.Id] = rec;
        });
        
        rows.forEach(function (rec) {
            var draftRec = draftMap[rec.Id];
            if (draftRec != null) {                    
                rec.EndDate__c = draftRec.EndDate__c;
            }   
        });
        component.set("v.filteredData", rows);
        component.set("v.columns", colData);
        var action = component.get("c.updatePriceEntriesRecords");
        action.setParams({
            "PriceEntriesList" : component.get("v.updateRecordList")
        });
        
        action.setCallback(this, $A.getCallback(function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                $A.get('e.force:refreshView').fire();
            }
        }));
        $A.enqueueAction(action);
        //
        
    }, 
        getProName :function(component, productCatalogId,isEdit) {   
         console.log('productCatalogId helper'+productCatalogId);
         let productOfferRecord = component.get('v.productOfferRecord');
        var action = component.get("c.gettest");
        action.setParams({
            "val" :  productCatalogId.toString()
        });
        
        action.setCallback(this, $A.getCallback(function (response) {
            var state = response.getState();
            if (state === "SUCCESS") { 
                var responsedRecord = response.getReturnValue();
                console.log('Response response.getReturnValue()>>>'+JSON.stringify(response.getReturnValue()));
                //nm
                if(isEdit == false){
                    productOfferRecord.BillType__c = responsedRecord.PartnerTerritory_ID__r.Partner_ID__r.OnBill_OffBill__c == 'OFF Bill'?'OffBill': responsedRecord.PartnerTerritory_ID__r.Partner_ID__r.OnBill_OffBill__c == 'ON Bill'?'OnBill':'';
                    if(responsedRecord.PartnerTerritory_ID__r.Partner_ID__r.OnBill_OffBill__c == 'Both'){
                        let check = component.get('v.isBillTypeBoth');
                        console.log("check>>>"+check);
                        component.set('v.isBillTypeBoth',false);
                    }else{
                        component.set('v.isBillTypeBoth',true);
                    }
                    productOfferRecord.Description__c =  responsedRecord.Name;
                    productOfferRecord.Marketing_Product_Name__c =  responsedRecord.Name;
                    component.set('v.productOfferRecord',productOfferRecord);
                }else{
                     if(responsedRecord.PartnerTerritory_ID__r.Partner_ID__r.OnBill_OffBill__c == 'Both'){
                        let check = component.get('v.isBillTypeBoth');
                        console.log("check>>>"+check);
                        component.set('v.isBillTypeBoth',false);
                    }
                }
                
               
                //nm console.log('Response response.getReturnValue()>>>'+response.getReturnValue());
            //nm    productOfferRecord.Description__c =  response.getReturnValue();
                //productOfferRecord.Underwriter_Rate_Code__c =  response.getReturnValue();
			//nm	productOfferRecord.Marketing_Product_Name__c =  response.getReturnValue();
			//nm
			
                //component.set('v.productOfferRecord',productOfferRecord);
            } else if (state === "ERROR") {	
                var errors = response.getError();
                console.error(errors);
            }
        })); 
        $A.enqueueAction(action);
    },
    sortData : function(component, fieldName, sortDirection) {
        var data = component.get("v.channelData");
        console.log('sort filtter data'+data);
        var colData =  component.get("v.columns")
        //function to return the value stored in the field
        var key = function(a) { return a[fieldName]; }
        var reverse = sortDirection == 'asc' ? 1: -1;
        var colType;
        for(var col in colData) {
            if(colData[col].fieldName == fieldName) {
                colType = colData[col].type;
            }            
        }
         console.log('colType*********'+colType);
        if(colType == 'currency' || colType == 'number') {
            data.sort(function(a,b) {
                var a = key(a) ? key(a) : '';
                var b = key(b) ? key(b) : '';
                return reverse * ((a>b) - (b>a));
            }); 
        }else if(colType == 'boolean'){
            data.sort(function(a,b) {
                console.log('a***'+JSON.stringify(a[fieldName]));
                console.log('b***'+JSON.stringify(b[fieldName]));
                var a = a[fieldName] ? 1 : 0;//To handle null values , uppercase records during sorting
                var b = b[fieldName] ? 1 : 0;
                console.log('a value***'+a);
                console.log('b value***'+b);
                console.log('comp***************** '+(a == b)? 0 : a);
                //(a === b)? 0 : a? -1 : 1;
                return reverse * ((a>b) - (b>a));
            });
            
        }else {
            data.sort(function(a,b) { 
                var a = key(a) ? key(a).toLowerCase() : '';//To handle null values , uppercase records during sorting
                var b = key(b) ? key(b).toLowerCase() : '';
                return reverse * ((a>b) - (b>a));
            });  
        }
        //component.set("v.filteredData",data);
         this.setPageDataAsPerPagination(component,data);
    },
   
    toastMsg : function( strType, strMessage ) {  
        
        var showToast = $A.get( "e.force:showToast" );   
        showToast.setParams({   
            
            message : strMessage,  
            type : strType,  
            mode : 'dismissible'  
            
        });   
        showToast.fire();         
    }   
 
})