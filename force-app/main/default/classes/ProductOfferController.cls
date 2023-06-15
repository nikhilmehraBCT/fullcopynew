public class ProductOfferController {
    @AuraEnabled
    public static DoNotUseUserClass getUserInfo(){
        Boolean DoNotUseAccess = true;        
        DoNotUseUserClass wrap = new DoNotUseUserClass();
        wrap.userInfo =  [SELECT Id,Name,Profile.Name FROM User Where Id = :UserInfo.getUserId() limit 1];
        for(hs_Product_Offer_User_Settings__mdt pousMdt: hs_Product_Offer_User_Settings__mdt.getAll().values()){
            if(pousMdt.Do_not_Use__c && pousMdt.Profile_Name__c == wrap.userInfo.Profile.Name && 
              pousMdt.User_Name__c == wrap.userInfo.Name)
            {
             	DoNotUseAccess = false;   
            }
        }
        wrap.DoNotUseAccess = DoNotUseAccess;
        return wrap;
    }
    @AuraEnabled
    public static Contract_Default_Values__mdt getContractDefaultValues(){
        return [SELECT Id, DeveloperName, Bill_Offset__c, Frequency__c, Start_Offset__c, Wait_Offet__c, Term__c FROM Contract_Default_Values__mdt limit 1];
    } 
    
    @AuraEnabled
    public static String saveRecord(Product_Offer__c productOfferRecord){
        System.debug(productOfferRecord);
        try{
        	upsert productOfferRecord;
        }catch(DMLException e){
            throw new AuraHandledException(e.getdmlMessage(0));
        }
        System.debug(productOfferRecord);
        return productOfferRecord.Id;
    }
    @AuraEnabled
    public static List<Price_Entry__c> getPriceEntry (String productOfferId){
        List<Price_Entry__c> priceEntryRecords = [SELECT Id, Name, Price__c, StartDate__c, EndDate__c, NewSell__c, 
                                                  Renew__c, Marketing__c, ChangeTo_ID__c, Channel__c, ConditionOpp__c,Condition_Value__c, 
                                                  ChangeTo_ID__r.Name, ChangeTo_ID__r.ProductOfferCode__c FROM Price_Entry__c where ProductOffer_ID__c = :productOfferId order by EndDate__c,ConditionOpp__c,Condition_Value__c NULLS FIRST];
        return priceEntryRecords;
    }
    @AuraEnabled
    public static string getNewOfferCode(String changeToId){
        String poCode = '';
        List<Product_Offer__c> poList = [SELECT ProductOfferCode__c FROM Product_Offer__c WHERE Id =:changeToId];
        if(!poList.isEmpty()){
            poCode = poList.get(0).ProductOfferCode__c;
        }
        return poCode;
    }
    
    @AuraEnabled
    public static String getProductCatelogName(String recordId){
        System.debug('Product Catalog Id>>'+recordId);
        Product_Catalog__c pc =  [SELECT Id,Name,PartnerTerritory_ID__r.Partner_ID__r.OnBill_OffBill__c FROM Product_Catalog__c where id =: recordId limit 1];
        return pc.Name;
    }
    @AuraEnabled
    public static String getProductTCName(String tcID){
        System.debug('Product Catalog Id>>'+tcID);
        T_C__c tc = [SELECT Id,Name,Product_Offer_Name__c FROM T_C__c where id =:tcID];
        return tc.Product_Offer_Name__c;
    }
    @AuraEnabled
    public static DuplicateResponse checkForDuplicates(String tcId, String pcId, String recId){
        DuplicateResponse response = new DuplicateResponse();
        List<Product_Offer__c> duplicates = [
            SELECT Id, Name, ProductCatalog_ID__r.Name, ProductCatalog_ID__r.Product_Catalog_Code__c, TC__r.Name FROM Product_Offer__c
            WHERE TC__c =: tcId AND ProductCatalog_ID__c =: pcId LIMIT 15
        ];
        if(!duplicates.isEmpty() && (recId == null || recId == '')){
            response = new DuplicateResponse(true, duplicates);
        }
        return response;
    }
    public class DuplicateResponse{
        @AuraEnabled 
        public Boolean isDuplicate{get;set;}
        @AuraEnabled 
        public List<Product_Offer__c> duplicates{get;set;}
        public DuplicateResponse(){
            isDuplicate = false;
            duplicates = new List<Product_Offer__c>();
        }
        public DuplicateResponse(Boolean isDuplicate, List<Product_Offer__c> duplicates){
            this.isDuplicate = isDuplicate;
            this.duplicates = duplicates;
        }
    }
     @AuraEnabled
    Public static List<Price_Entry__c > getPriceEntriesRecords(Id PriceofferId){
        List<Price_Entry__c > priceEntryList = new List<Price_Entry__c >();
        priceEntryList = [Select Name,Channel__c,ChangeTo_ID__c,ChangeTo_ID__r.Name,ChangeTo_ID__r.ProductOfferCode__c,ConditionOpp__c, Condition_Value__c, EndDate__c, NewSell__c, Price__c,
                          Renew__c,StartDate__c FROM Price_Entry__c where ProductOffer_ID__c =:PriceofferId order by EndDate__c,ConditionOpp__c,Condition_Value__c NULLS FIRST];
        System.debug('priceEntryList*******'+priceEntryList);
        return priceEntryList;
    }
      @AuraEnabled
    public static Product_Catalog__c gettest(String val){
        System.debug('Product Catalog Id>>'+val);
        Product_Catalog__c pc =  [SELECT Id,Name, PartnerTerritory_ID__r.Partner_ID__r.OnBill_OffBill__c FROM Product_Catalog__c where id =: val limit 1];
        return pc;
    }
    @AuraEnabled
    Public static List<Price_Entry__c > getFilterPriceEntrieRecord(Id PriceofferId,Date sDate,Date eDate,String channel){
        System.debug('getFilterPriceEntrieRecord************');
        System.debug('eDate******'+eDate);
        List<String> channelList = new List<String>{'All','Phone','Web'};
            List<Price_Entry__c > priceEntryList = new List<Price_Entry__c >();
        System.debug('channel******'+channel);
         System.debug('sDate******'+sDate);
         System.debug('eDate******'+eDate);
        
        if(channelList.contains(channel) && sDate != Null && eDate != Null){
            priceEntryList = [Select Name,Channel__c,ChangeTo_ID__c,ChangeTo_ID__r.Name,ChangeTo_ID__r.ProductOfferCode__c, ConditionOpp__c, Condition_Value__c, EndDate__c, NewSell__c, Price__c,
                              Renew__c,StartDate__c FROM Price_Entry__c where ProductOffer_ID__c =:PriceofferId AND (StartDate__c >=:sDate AND StartDate__c <=:eDate) AND (EndDate__c >=:sDate AND EndDate__c <=:eDate) AND Channel__c =:channel  order by Name];  
        }else if(channelList.contains(channel) && sDate != Null && eDate == Null){
            priceEntryList = [Select Name,Channel__c,ChangeTo_ID__c,ChangeTo_ID__r.Name,ChangeTo_ID__r.ProductOfferCode__c, ConditionOpp__c, Condition_Value__c, EndDate__c, NewSell__c, Price__c,
                              Renew__c,StartDate__c FROM Price_Entry__c where ProductOffer_ID__c =:PriceofferId AND StartDate__c >=:sDate AND Channel__c =:channel  order by Name];  
        }else if(channelList.contains(channel) && sDate == Null && eDate != Null){
            priceEntryList = [Select Name,Channel__c,ChangeTo_ID__c,ChangeTo_ID__r.Name,ChangeTo_ID__r.ProductOfferCode__c, ConditionOpp__c, Condition_Value__c, EndDate__c, NewSell__c, Price__c,
                              Renew__c,StartDate__c FROM Price_Entry__c where ProductOffer_ID__c =:PriceofferId AND EndDate__c <=:eDate AND Channel__c =:channel  order by Name];  
        }
        else if(!channelList.contains(channel) && sDate != Null && eDate != Null){
            priceEntryList = [Select Name,Channel__c,ChangeTo_ID__c,ChangeTo_ID__r.Name,ChangeTo_ID__r.ProductOfferCode__c, ConditionOpp__c, Condition_Value__c, EndDate__c, NewSell__c, Price__c,
                              Renew__c,StartDate__c FROM Price_Entry__c where ProductOffer_ID__c =:PriceofferId AND (StartDate__c >=:sDate AND StartDate__c <=:eDate) AND (EndDate__c >=:sDate AND EndDate__c <=:eDate)  order by Name]; 
        }else if(!channelList.contains(channel) && sDate != Null && eDate == Null){
            priceEntryList = [Select Name,Channel__c,ChangeTo_ID__c,ChangeTo_ID__r.Name,ChangeTo_ID__r.ProductOfferCode__c, ConditionOpp__c, Condition_Value__c, EndDate__c, NewSell__c, Price__c,
                              Renew__c,StartDate__c FROM Price_Entry__c where ProductOffer_ID__c =:PriceofferId AND StartDate__c >=:sDate  order by Name];
        }else if(!channelList.contains(channel) && sDate == Null && eDate != Null){
            priceEntryList = [Select Name,Channel__c,ChangeTo_ID__c,ChangeTo_ID__r.Name,ChangeTo_ID__r.ProductOfferCode__c, ConditionOpp__c, Condition_Value__c, EndDate__c, NewSell__c, Price__c,
                              Renew__c,StartDate__c FROM Price_Entry__c where ProductOffer_ID__c =:PriceofferId AND EndDate__c <=:eDate  order by Name];  
        }
        
        System.debug('priceEntryList*******'+priceEntryList);
        return priceEntryList;
    }
    @AuraEnabled
    Public static void updatePriceEntriesRecords(List<Price_Entry__c> PriceEntriesList){
        update PriceEntriesList;
    }
    
    List<Price_Entry__c> priceEntryListMain = new List<Price_Entry__c>();
  
    public class DoNotUseUserClass{
        @AuraEnabled public User userInfo {get;set;}
        @AuraEnabled public Boolean DoNotUseAccess {get;set;}
    }
}