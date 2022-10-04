/**
 * 
 * @param {string} url 
 * @param {Object} requestOptions 
 * @param {Function} _callback 
 */
export async function CRUD(url,requestOptions,_callback){

  await fetch(url, requestOptions)
    .then(response => response.json())
    .then(result => _callback(result))
    .catch(error => _callback({remarks:"error","message":error}));
}

export async function BlobFetch(url,requestOptions,_callback){

  await fetch(url, requestOptions)
    .then(response => response.blob())
    .then(result => _callback(result))
    .catch(error => _callback({remarks:"error","message":error}));
}

  //#region (EXPORT REPORT XLS PDF) 

  export async function processExcel(url_request,body,file_name,_callback){

    var requestOptions = {
      method: 'POST',
      body:body  
    };
    
    BlobFetch(window.download_api+url_request,requestOptions, async (response,status)=>{
      
      if ( response.size <=51 || response.remarks =="error") {
        _callback(response)        
        return
      }
         
      // Your response to manipulate        
      var a = document.createElement("a");
      a.href = window.URL.createObjectURL(response);
      a.download = file_name+".xlsx";
      a.click();

      //close modal
      _callback({remarks:"success","message":"downloaded"})   
    });
  }

  export async function processPDF(url_request,body,file_name,_callback){
    var requestOptions = {
      method: 'POST',
      body:body  
    };

    BlobFetch(window.download_api+url_request,requestOptions, async (response,status)=>{        
      if ( response.size <=51 || response.remarks =="error") {
        _callback(response)
        return
      }
      
     
    
      // Your response to manipulate      
      var binaryData = [];
      binaryData.push(response);
        
      var a = document.createElement("a");
      a.href = window.URL.createObjectURL(new Blob(binaryData, {type: "application/pdf"}))
      a.download = file_name+".pdf";
      a.click();
      //close modal      
      _callback({remarks:"success","message":"downloaded"})   
    });
  }


  /**
   * 
   * @param {object} original_data componentList/TrainingList or just the list got from _getRecords
   * @param {object} filters object return by the filter.js modal can be retrieve in ReactBSTables.js or through callback (FilterCallback)
   * @return {Object} return the filtered object using the filters on parameter
   */

  export function processDataFilter (original_data,filters)
  {
   
    if(filters.filters.length <=0){
      return original_data
    }


    var proccess_data=[];    
    
    original_data.forEach(element => {
      var and_bool=null;
      var or_bool =false;
      filters.filters.forEach(filter => {               
        if (element[filter.filter_key] != null) {
          if((and_bool==null || and_bool==true) && filter.filter_condition.toUpperCase() == "and".toUpperCase()){
            and_bool = filterData(
              filter.filter_type,
              filter.filter_value,              
              formatValue(false,filter.filter_key,element[filter.filter_key])
             )
           }
           if(!or_bool && filter.filter_condition.toUpperCase() == "or".toUpperCase()){
             or_bool = filterData(
              filter.filter_type,
              filter.filter_value,
              formatValue(false,filter.filter_key,element[filter.filter_key])
              );
           }
        }

             
      });
      console.log(and_bool,or_bool)
      if(and_bool || or_bool){
        proccess_data.push(element)
      }

    });    

    // if(proccess_data.length <=0){
    //   return original_data
    // }
    return proccess_data;
  
  }


  /**
   * 
   * @param {string} is_option whether the return value is gonna be used as an option or a just plain text/value 
   * @param {string} key key to be used as basis on how to format the value 
   * @param {object} value the value to be customize this can be an object string or integer, the return value is base on how you customize the data
   * @return {Object/String} return the customize value either as an option or as a string/integer 
   */

  export function formatValue(is_option,key,value){    

    var return_data=null;
    var count = 0;

    
    if(value == null || value==""){
      return null
    }

    if(isObject(value)){
      count = value.length
    }    
    
    if(key.includes("-")){
      return_data = {
        value:value.name,
        label:value.name
      }
    }
    // else if(key.includes("date")){
    //   var options = { year: 'numeric', month: 'long', day: 'numeric' };
    //   var date  = new Date(value);
    //   console.log(value,date)
    //   return_data = {
    //     value:value,
    //     label:date.toLocaleDateString("en-US", options)
    //   }
    // }
    else{
      return_data = {
        value:isObject(value)?count:value,
        label:isObject(value)?count:value
      }
      
    }
   
    
    if(is_option){
      return return_data
    }

    
    return return_data.value
    
  }

  export function removeColumn(original_data,filters){
 
    if(!filters){
      return original_data
    }


    var proccess_data=[];    
    
    original_data.forEach(element => {   
      var current_row = element; 
      filters.forEach(filter => {       
        if(current_row.hasOwnProperty(filter)){
          delete current_row[filter]
        }      
               
      });         
      proccess_data.push(current_row)     
    });    
    return proccess_data;
  }

   /**
   * 
   * @param {string} val is the data to be checked   
   * @return {boolean} return whether val is an object returns true if it is
   */
  function isObject(val) {
    return (typeof val === 'object');
  }

  /**
   * 
   * @param {type} type is the type of checker it will use on the data_value and search-value
   * @param {string} search_value is the value of the search filter
   * @param {string} data_value is the value on the row that needs to be checked
   * @return {boolean} return whether the data_value is affected by the search_value return true if it should be displayed
   */

  export function filterData(type, search_value, data_value){

    if(
      data_value === null || 
      data_value ===undefined || 
      search_value === null ||      
      search_value === null 
      ){
      return false
    }
  
    if(isNaN(search_value)){
      search_value = search_value.toUpperCase()
    }

    if(isNaN(data_value)){
      data_value = data_value.toUpperCase()
    }
      
    switch(type){
      case "is":
        return data_value == search_value
        break
      case "is_like":
        return data_value.includes(search_value)
        break
      case "is_not":
        return data_value != search_value
        break
      case "is_not_like":
        return !(data_value.includes(search_value))
        break  
      case "greater_than":
        if(isNaN(data_value) || isNaN(search_value)){
          return false;
        }
        return parseInt(data_value) > parseInt(search_value)
        break  
      case "less_than":
        if(isNaN(data_value) || isNaN(search_value)){
          return false;
        }
        return parseInt(data_value) < parseInt(search_value)
        break  
    }
  }
  
  export function swapUndeScoreTSpace(string){
    const result2 = string.replace(/_+/g, ' ');
    return result2;
  }

  export function beautifyText(string) {
    
    if(string.includes("-")){
      string = string.split("-");
      string = string[1];
    }
    
    var beautified =  swapUndeScoreTSpace(string.charAt(0).toUpperCase() + string.slice(1));
    beautified = beautified.replace(" id"," ID")
    beautified = beautified.replace("Number "," No. ")
    beautified = beautified.replace("Numbers "," No. ")
    return beautified
  }
//#endregion

