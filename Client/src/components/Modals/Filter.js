//#####################################
//##   Developer: Michael Lumanta     #
//##   Only God and I know this       # 
//## Since i can't remember anything, #
//#      only God know this           #
//##     Edit at your own risk        #
//#####################################


import React, { useState, useContext, useEffect } from "react";
import ReactBSAlert from "react-bootstrap-sweetalert";

import classnames from "classnames";
import {
  Alert,
  Button,
  FormGroup,
  Input,
  InputGroup,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  UncontrolledAlert,
  ListGroup,
  Row,
  Col,
} from "reactstrap";

import { UserContext, _dataService } from "App";

// import Select2 from "react-select2-wrapper";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { ActionMeta, OnChangeValue } from "react-select";
import CustButton from "components/Buttons/CustButton";
import { formatValue } from "services/data.services";
import { element } from "prop-types";
import { swapUndeScoreTSpace } from "services/data.services";
import { useTranslation } from "react-i18next";

const Filter = (props) => {

  const { _state, _data,_filterArray, _exclude_keys,_callback,_closeFilter ,_filterColumnArray} = props;
  
  
  var excluded = _exclude_keys;
    
  //# Exclude keys that is ##! hidden (DO NOT DELETE !!!) 
    // if(_filterColumnArray){
    //   _filterColumnArray.headers.forEach((element)=>{            
    //     excluded.push(element);
    //   })
    // }

  //

  if(excluded){

  }
  else{
    excluded=["_id","archive"];
  }

  //Div
  const [otherFilter,setOtherFilter] = useState(
    {other:[]}
  );
  const [alertState, setAlertState] = useState(null);

  //USED FOR PROCESS
  const [arrayFilter,setArrayFilter]=useState({
    "filters":[{     
      filter_index:0,
      filter_key:"",
      filter_type:"",
      filter_value:null,
      filter_condition:"and"        
    }]
  });
  
  const filterType = [
    { value: "is", label: "Is" },
    { value: "is_like", label: "Is like" },
    { value: "is_not", label: "Is not" },
    { value: "is_not_like", label: "Is not like" },
  ];

  const filterNumber = [
    { value: "is", label: "is" },
    { value: "is_not", label: "is not" },
    { value: "greater_than", label: "Greater than" },
    { value: "less_than", label: "Less than" },
  ];

  const AndOR = [
    { value: "AND", label: "AND" },
    { value: "OR", label: "OR" },
  ];

  function updateState(value,state) {
    return state((prev) => {
      return { ...prev, ...value };
    });
  }


  const [valueFilter,setValueFilter]=useState([]);
  const [typeFilter,setTypeFilter]=useState([]);
  const [filterIndex,setFilter_index] = useState({
    index:0
  });
  const [keyDefault,setkeyDefault] = useState([]);
  const [typeDefault,setypeDefault] = useState([]);
  const [valueDefault,setvalueDefault] = useState([]);
  
  const[keyList,setKeyList]= useState({
    list:[]
  })  
  const {t} =useTranslation();

  useEffect(()=>{
    var filter_key=null;
    var filter_type=null;
    var filter_value=null;
    if(_filterArray.filters.length > 0){        
      //
      //updateState({filters:_filterArray.filters},setArrayFilter)
      updateState({index:_filterArray.filters[_filterArray.filters.length-1].filter_index + 1 },setFilter_index)
     
       filter_key = _filterArray.filters[0].filter_key
       filter_type = _filterArray.filters[0].filter_type
       filter_value = _filterArray.filters[0].filter_value
      
    }

  
    var keys = [];  
    if(_data.length > 0 ){
      for (const [key, value] of Object.entries(_data[0])) {
        var raw_label = t(key)
        //#region options
          if(excluded.includes(key)){
  
          }else{
            
            keys.push({value:key,label:t(key)})    
          }
        //#endregion
  
          
        if(filter_key!=null){
          if(key==filter_key){
            setkeyDefault({value:key,label:t(key)})
          }
        }
      }
    }
   

    updateState({list:keys},setKeyList)
   
    if(_filterArray.filters.length > 0){     

      //Initiate Array

        var array_filters = arrayFilter.filters;      
        for (let index = 1; index < _filterArray.filters.length; index++) {
          array_filters.push(
            {
              filter_index:_filterArray.filters[index].filter_index,
              filter_key:"",
              filter_type:"",
              filter_value:null,
              filter_condition:"AND"
            }
          )            
        }

      ////#region  Assign existing filter Array to the initialized array
      var index =0;
        _filterArray.filters.forEach(element => {
          array_filters[index] ={
            filter_index: element.filter_index,
            filter_key: element.filter_key,
            filter_type: element.filter_type,
            filter_value: element.filter_value,
            filter_condition: element.filter_condition 
          }     
          index++  
        });
      //#endregion

      //
        array_filters.push(
          {
            filter_index:_filterArray.filters[_filterArray.filters.length-1].filter_index + 1,
            filter_key:"",
            filter_type:"",
            filter_value:null,
            filter_condition:"AND"
          }
        )  
      //
      //#region Assign Existing Filter UI
        var array_ui = otherFilter.other;
        var index =0;
        _filterArray.filters.forEach(element => {
          if(index > 0){
            var filter_index = element.filter_index
            var option_type =  returnFilterType(element.filter_key)  
            array_ui.push({
              index:filter_index,
              filter:<>
                <Row id={"row_"+filter_index} className="mb-2">
                  <Col xl="2" id={"row_"+filter_index+"_col"} >
                    
                    <Select
                      name={"AndOr"+filter_index}
                      className="react-select-custom"
                      classNamePrefix="react-select"
                      defaultValue={AndOR[0]}
                      onChange={(e)=>conditionChange(e,filter_index)}
                      options={AndOR}
                    />    
                  </Col>
                <Col xl="3">
                  <Select
                    name={"filter_key"+filter_index}
                    className="react-select-custom"
                    classNamePrefix="react-select"
                    onChange={(e)=>keyChange(e,filter_index)}
                    options={keys}
                  />
                </Col>
                <Col xl="3">
                  <Select
                    name={"filter_type"+filter_index}
                    inputId={"filter_type"+filter_index}
                    className="react-select-custom"
                    classNamePrefix="react-select"
                    onChange={(e)=>typeChange(e,filter_index)}
                    options={option_type}
                  />
                </Col>
                <Col  xl="3">
                  <CreatableSelect
                    isClearable
                    name={"filter_value"+filter_index}
                    inputId={"filter_value"+filter_index}
                    onChange={(e) => valueFilterChange(e,filter_index)}
                    onInputChange={handleInputChange}
                    options={[]}
                  />
                </Col>
                <Col xl="1" style={{display: 'flow-root'}}>
                  <CustButton           
                  _icon='fas fa-times'
                  _color='transparent'
                  _onClick={()=>removeFilter(filter_index)}
                  />
                </Col>
                </Row>
              </>
            }
              
            )
    
          }

          index++  
        });   
      //#endregion
      
      //
        var filter_index = _filterArray.filters[_filterArray.filters.length-1].filter_index + 1
        array_ui.push({
          index:filter_index,
          filter:<>
            <Row id={"row_"+filter_index} className="mb-2">
              <Col xl="2" id={"row_"+filter_index+"_col"} >
                
                <Select
                  name={"AndOr"+filter_index}
                  className="react-select-custom"
                  classNamePrefix="react-select"
                  defaultValue={AndOR[0]}
                  onChange={(e)=>conditionChange(e,filter_index)}
                  options={AndOR}
                />    
              </Col>
            <Col xl="3">
              <Select
                name={"filter_key"+filter_index}
                className="react-select-custom"
                classNamePrefix="react-select"
                onChange={(e)=>keyChange(e,filter_index)}
                options={keys}
              />
            </Col>
            <Col xl="3">
              <Select
                name={"filter_type"+filter_index}
                inputId={"filter_type"+filter_index}
                className="react-select-custom"
                classNamePrefix="react-select"
                onChange={(e)=>typeChange(e,filter_index)}
                options={filterType}
              />
            </Col>
            <Col  xl="3">
              <CreatableSelect
                isClearable
                name={"filter_value"+filter_index}
                inputId={"filter_value"+filter_index}
                onChange={(e) => valueFilterChange(e,filter_index)}
                onInputChange={handleInputChange}
                options={[]}
              />
            </Col>
            <Col xl="1" style={{display: 'flow-root'}}>
              <CustButton           
              _icon='fas fa-times'
              _color='transparent'
              _onClick={()=>removeFilter(filter_index)}
              />
            </Col>
            </Row>
          </>
        })
      //

      



      //#region Index 0 dropdown and default values Array Filter
        var option_type = returnFilterType(filter_key)     
        setTypeFilter(option_type) 
        option_type.map((element)=>{         
          if(element.value == filter_type){
            setypeDefault(element)
          }
        })
                
        var value_filter = getValueFilter(0,array_filters)      
       
        setValueFilter(value_filter);
        var filter_value_val =null;
        value_filter.forEach((_value)=>{
       
          if(filter_value == _value.value ){
            setvalueDefault(_value)
            filter_value_val=_value
          }
        })
                
        if(filter_value_val==null && filter_value !=null){
          setvalueDefault({value: filter_value , label:filter_value})
        }



      //#endregion
      
    
      //#region set existing filters UI
        var filters = [];

        var index =0;
        _filterArray.filters.forEach((element)=>{
          var filter_index = element.filter_index
          var option_type = returnFilterType(element.filter_key)
          
          var value_filter = getValueFilter(filter_index,array_filters)
          var check_value=[];

          // _data.forEach(_dataElement => {
          //   if(!check_value.includes(formatValue(true,element.filter_key,_dataElement[element.filter_key]).label)){
          //     value_filter.push(formatValue(true,element.filter_key,_dataElement[element.filter_key]))      
          //     check_value.push(formatValue(true,element.filter_key,_dataElement[element.filter_key]).label)
          //   }
          
          // });      

          var filter_condition_val = AndOR.map((_condition)=>{
            if(element.filter_condition == _condition.value ){
              return _condition
            }
          })
          var filter_key_val = keys.map((_key)=>{
            if(element.filter_key == _key.value ){
              return _key
            }
          })
          var filter_type_val = option_type.map((_type)=>{
            if(element.filter_type == _type.value ){
              return _type
            }
          })
          var filter_value_val =null;
          value_filter.forEach((_value)=>{
         
            if(element.filter_value == _value.value ){
              filter_value_val = _value
            }
          })

          if(filter_value_val==null && element.filter_value !=null){
            filter_value_val = {value: element.filter_value , label:element.filter_value}
          }


          if(index>0){
            
            filters.push({
              index:filter_index,
              filter:<>
                <Row id={"row_"+filter_index} className="mb-2">
                  <Col xl="2" id={"row_"+filter_index+"_col"} >
                    
                    <Select
                      name={"AndOr"+filter_index}
                      className="react-select-custom"
                      classNamePrefix="react-select"
                      value={filter_condition_val}
                      onChange={(e)=>conditionChange(e,filter_index)}
                      options={AndOR}
                    />    
                  </Col>
                <Col xl="3">
                  <Select
                    name={"filter_key"+filter_index}
                    className="react-select-custom"
                    classNamePrefix="react-select"
                    value={filter_key_val}
                    onChange={(e)=>keyChange(e,filter_index)}
                    options={keys}
                  />
                </Col>
                <Col xl="3">
                  <Select
                    name={"filter_type"+filter_index}
                    inputId={"filter_type"+filter_index}
                    className="react-select-custom"
                    classNamePrefix="react-select"
                    value={filter_type_val}
                    onChange={(e)=>typeChange(e,filter_index)}
                    options={option_type}
                  />
                </Col>
                <Col  xl="3">
                  <CreatableSelect
                    isClearable
                    name={"filter_value"+filter_index}
                    inputId={"filter_value"+filter_index}
                    defaultValue={filter_value_val}
                    onChange={(e) => valueFilterChange(e,filter_index)}
                    onInputChange={handleInputChange}
                    
                    options={value_filter}
                  />
                </Col>
                <Col xl="1" style={{display: 'flow-root'}}>
                  <CustButton           
                  _icon='fas fa-times'
                  _color='transparent'
                  _onClick={()=>removeFilter(filter_index)}
                  />
                </Col>
                </Row>
              </>
            }
              
            )
          }

          index++;
        })

        //# Additional Field
          var filter_index = _filterArray.filters[_filterArray.filters.length-1].filter_index + 1
          filters.push({
            index:filter_index,
            filter:<>
              <Row id={"row_"+filter_index} className="mb-2">
                <Col xl="2" id={"row_"+filter_index+"_col"} >
                  
                  <Select
                    name={"AndOr"+filter_index}
                    className="react-select-custom"
                    classNamePrefix="react-select"
                    defaultValue={AndOR[0]}
                    onChange={(e)=>conditionChange(e,filter_index)}
                    options={AndOR}
                  />    
                </Col>
              <Col xl="3">
                <Select
                  name={"filter_key"+filter_index}
                  className="react-select-custom"
                  classNamePrefix="react-select"
                  onChange={(e)=>keyChange(e,filter_index)}
                  options={keys}
                />
              </Col>
              <Col xl="3">
                <Select
                  name={"filter_type"+filter_index}
                  inputId={"filter_type"+filter_index}
                  className="react-select-custom"
                  classNamePrefix="react-select"
                  onChange={(e)=>typeChange(e,filter_index)}
                  options={filterType}
                />
              </Col>
              <Col  xl="3">
                <CreatableSelect
                  isClearable
                  name={"filter_value"+filter_index}
                  inputId={"filter_value"+filter_index}
                  onChange={(e) => valueFilterChange(e,filter_index)}
                  onInputChange={handleInputChange}
                  options={[]}
                />
              </Col>
              <Col xl="1" style={{display: 'flow-root'}}>
                <CustButton           
                _icon='fas fa-times'
                _color='transparent'
                _onClick={()=>removeFilter(filter_index)}
                />
              </Col>
              </Row>
            </>
          })
        //#

        updateState({filters:array_filters},setArrayFilter)
        updateState({other:filters},setOtherFilter);
      //#endregion     

    }

    forceUpdate()
    //updateFilter(0,"",[])
    
  },[_filterArray])
  
  const [state, reloadState] = useState();
  const forceUpdate = React.useCallback(() => reloadState({}), []);

 
  function updateState(value,setState){
    return setState((prev) => {
      return { ...prev, ...value };
    });
  }

  const handleInputChange = (inputValue, actionMeta) => {
    // console.group("Input Changed");
    // console.log(inputValue);
    // console.log(`action: ${actionMeta.action}`);
    // console.groupEnd();
  };


  function conditionChange(e,index){   

    var value = e.value;

    if(index ==0){     
 
      var array_filters = arrayFilter.filters;
      array_filters[0].filter_condition = value;
     
      updateState({filters:array_filters},setArrayFilter)
    }
    else{
      var array_index = -1;
      var array_filters = arrayFilter.filters;
      for (const [key, value] of Object.entries(array_filters)) {       
        if(value.filter_index == index){
          array_index = key;
        }
      }
      
      if(array_index>=0){
        var value_filter = getValueFilter(array_index,array_filters)
        
       

        array_filters[array_index].filter_condition = value;
        updateState({filters:array_filters},setArrayFilter)  
        updateFilter(index,"condition_change",value_filter,array_filters[array_index])
      }      
     
    }
   
    

  }


  function keyChange(e,index){   
    if(!e.value){
      return
    }
   
    var key_value = e.value;
    var array_filters = arrayFilter.filters;
   
  
    //console.log(check_value);
    if(index ==0){
      array_filters[0].filter_key = key_value;
      array_filters[0].filter_type = "";
      array_filters[0].filter_value = null;

      var value_filter = getValueFilter(0,array_filters)
      setkeyDefault(e)
      setypeDefault(null)
      setvalueDefault(null)
      setValueFilter(value_filter);
 
      
      
      updateState({filters:array_filters},setArrayFilter)

      var option_type = returnFilterType(key_value)    
      setTypeFilter(option_type) 
      //updateState(option_type, setTypeFilter);

    }
    else{
      var array_index = -1;
      var array_filters = arrayFilter.filters;      
      for (const [key, value] of Object.entries(array_filters)) {       
        if(value.filter_index == index){
          array_index = key;
        }
      }
    
         
      if(array_index>=0){
        array_filters[array_index].filter_key = key_value;
        array_filters[array_index].filter_type = "";
        array_filters[array_index].filter_value = null;

        var value_filter = getValueFilter(array_index,array_filters)
      
        updateState({filters:array_filters},setArrayFilter)
        updateFilter(index,"key_change",value_filter,array_filters[array_index])
      }      
    
    }
   
    

  }

  function typeChange(e,index){   
    console.log(e,index); 
    if(!e.value){
      return
    }    

    var value = e.value;

    if(index ==0){     
      setypeDefault(e)
      var array_filters = arrayFilter.filters;
      array_filters[0].filter_type = value;
     
      updateState({filters:array_filters},setArrayFilter)
    }
    else{
      var array_index = -1;
      var array_filters = arrayFilter.filters;
      for (const [key, value] of Object.entries(array_filters)) {       
        if(value.filter_index == index){
          array_index = key;
        }
      }
      
      if(array_index>=0){
        var value_filter = getValueFilter(array_index,array_filters )
        array_filters[array_index].filter_type = value;
        updateState({filters:array_filters},setArrayFilter)     
         updateFilter(index,"type_change",value_filter,array_filters[array_index])
      }      
     
    }
   
    

  }
  
  function valueFilterChange(e,index) {
    

    if(e==null){
      if(index==0){
        var array_filters = arrayFilter.filters;
        setvalueDefault({value:"",label:""})
        array_filters[0].filter_value = null;
        return
      }
   
    
    }
  
    
    if(index ==0){     
      var value = e.value;
      setvalueDefault(e)
      var array_filters = arrayFilter.filters;
      array_filters[0].filter_value = value;
     
      updateState({filters:array_filters},setArrayFilter)
    }
    else{
      var array_index = -1;
      var array_filters = arrayFilter.filters;
      for (const [key, value] of Object.entries(array_filters)) {       
        if(value.filter_index == index){
          array_index = key;
        }
      }

      if(array_index>-1){

        var value_filter = getValueFilter(array_index,array_filters )        
        if(e==null){
          array_filters[array_index].filter_value = null;
        }
        else{
          var value = e.value;
          array_filters[array_index].filter_value = value;
        }
        
        updateState({filters:array_filters},setArrayFilter)     
       
        updateFilter(index,"value_change",value_filter,array_filters[array_index])
      }      
    
    }
  }
  
  async function addNewFilter(){
    var filters = otherFilter.other;
    var array_filters = arrayFilter.filters;

    var filter_index = filterIndex.index;
    filter_index=filter_index+1;
    updateState({index:filter_index},setFilter_index);
    array_filters.push(
      {
        filter_index:filter_index,
        filter_key:"",
        filter_type:"",
        filter_value:null,
        filter_condition:"AND"
      }
    )

     

        filters.push({
          index:filter_index,
          filter:<>
            <Row id={"row_"+filter_index} className="mb-2">
              <Col xl="2" id={"row_"+filter_index+"_col"} >
                
                <Select
                  name={"AndOr"+filter_index}
                  className="react-select-custom"
                  classNamePrefix="react-select"
                  defaultValue={AndOR[0]}
                  onChange={(e)=>conditionChange(e,filter_index)}
                  options={AndOR}
                />    
              </Col>
            <Col xl="3">
              <Select
                name={"filter_key"+filter_index}
                className="react-select-custom"
                classNamePrefix="react-select"
                onChange={(e)=>keyChange(e,filter_index)}
                options={keyList.list}
              />
            </Col>
            <Col xl="3">
              <Select
                name={"filter_type"+filter_index}
                instanceId={"filter_type"+filter_index}
                inputId={"filter_type"+filter_index}
                className="react-select-custom"
                classNamePrefix="react-select"
                onChange={(e)=>typeChange(e,filter_index)}
                options={filterType}
              />
            </Col>
            <Col  xl="3">
              <CreatableSelect
                isClearable
                name={"filter_value"+filter_index}
                inputId={"filter_value"+filter_index}
                instanceId={"filter_value"+filter_index}
                onChange={(e) => valueFilterChange(e,filter_index)}
                onInputChange={handleInputChange}
                options={[]}
              />
            </Col>
            <Col xl="1" style={{display: 'flow-root'}}>
              <CustButton           
              _icon='fas fa-times'
              _color='transparent'
              _onClick={()=>removeFilter(filter_index)}
              />
            </Col>
            </Row>
          </>
        }
          
        )

      updateState({other:filters},setOtherFilter);
      updateState({filters:array_filters},setArrayFilter)
  }

    
  function updateFilter(index,key_value,value_filter,changes){
    var filters = otherFilter.other;
   
    if(index ==0){
      updateState({other:filters},setOtherFilter);
      return
    }
    var keys = getKeyoptions();    
    console.log(changes)
    var option_type =  returnFilterType(changes.filter_key)  
    
    var array_index = 0;
    for (const [key, value] of Object.entries(filters)) {
      if(value.index == index){
        array_index = parseInt(key);
      }
    }
    var filter_condition ={value:"and",label:"AND"};
    var filter_value = null;
    var filter_type =null;

    AndOR.forEach((element)=>{        
      if(element.value == changes.filter_condition){
        filter_condition = element;
      }        
    })

    if(key_value!="key_change"){           

      if(changes.filter_type !=""){
        option_type.forEach((element)=>{
          if(element.value == changes.filter_type){
            filter_type = element;
          }        
        })
      }
      
      if( changes.filter_value !=null){
        value_filter.forEach((element)=>{
          if(element.value == changes.filter_value){
            filter_value = element;
          }
        })
      }
      if(filter_value == null && changes.filter_value !=null){
        filter_value = {value:changes.filter_value, label: changes.filter_value}
      }
     
    }  
      
    if(array_index > -1){
      filters[array_index].filter =(
        <>
          <Row id={"row_"+index} className="mb-2">
            <Col xl="2" id={"row_"+index+"_col"} >
              
              <Select
                name={"AndOr"+index}
                className="react-select-custom"
                classNamePrefix="react-select"
                defaultValue={AndOR[0]}
                value={filter_condition}
                onChange={(e)=>conditionChange(e,index)}
                options={AndOR}
              />    
            </Col>
          <Col xl="3">
            <Select
              name={"filter_key"+index}
              className="react-select-custom"
              classNamePrefix="react-select"                         
              onChange={(e)=>keyChange(e,index)}
              options={keys}
            />
          </Col>
          <Col xl="3">
            <Select
              name={"filter_type"+index}
              className="react-select-custom"
              classNamePrefix="react-select"            
              value={key_value=="key_change"?null: filter_type}                  
              onChange={(e)=>typeChange(e,index)}
              hasValue={false}
              options={option_type}
            />
          </Col>
          <Col  xl="3">
            <CreatableSelect
              isClearable
              name={"filter_value"+index}          
              hasValue={false}
              value={key_value=="key_change"?null: filter_value}              
              onChange={(e) => valueFilterChange(e,index)}
              onInputChange={handleInputChange}
              options={value_filter}
            />
          </Col>
          <Col xl="1" style={{display: 'flow-root'}}>
            <CustButton           
            _icon='fas fa-times'
            _color='transparent'
            _onClick={()=>removeFilter(index)}
            />
          </Col>
          </Row>
        </>
      );
      

      updateState({other:filters},setOtherFilter);
    }
    
  
    
    
  }


  function removeFilter(index){
 
    if(index ==0){

    }
    else{

      const div = document.getElementById("row_"+index)
      //Hide the div, when div is removed clicking clear filter will error since the div is already removed
      if(div){
        div.style.display = 'none';      
      }
      

      var array_filters = arrayFilter.filters;

      var delete_index = -1;

      for (const [key, value] of Object.entries(array_filters)) {
        if(value.filter_index == index){
          delete_index = parseInt(key);
        }
      }

      if (delete_index > -1) { // only splice array when item is found
        array_filters.splice(delete_index, 1); // 2nd parameter means remove one item only
      }

     
      updateState({filters:array_filters},setArrayFilter);

      var other = otherFilter.other;

      var delete_index = -1;

      for (const [key, value] of Object.entries(other)) {
        if(value.index == index){
          delete_index = parseInt(key);
        }
      }

      if (delete_index > -1) {
        var keys = getKeyoptions();
        //other.splice(delete_index, 1);
        // other[delete_index].filter =(
        //   <>
        //     <Row id={"row_"+index} className="mb-2">
        //       <Col xl="2" id={"row_"+index+"_col"} >
                
        //         <Select
        //           name={"AndOr"+index}
        //           className="react-select-custom"
        //           classNamePrefix="react-select"
        //           value={AndOR[0]}    
        //           onChange={(e)=>conditionChange(e,index)}
        //           options={AndOR}
        //         />    
        //       </Col>
        //     <Col xl="3">
        //       <Select
        //         name={"filter_key"+index}
        //         className="react-select-custom"
        //         classNamePrefix="react-select"      
        //         value={null}                       
        //         onChange={(e)=>keyChange(e,index)}
        //         options={keys}
        //       />
        //     </Col>
        //     <Col xl="3">
        //       <Select
        //         name={"filter_type"+index}
        //         className="react-select-custom"
        //         classNamePrefix="react-select"            
        //         value={null}                  
        //         onChange={(e)=>typeChange(e,index)}
        //         hasValue={false}
        //         options={filterType}
        //       />
        //     </Col>
        //     <Col  xl="3">
        //       <CreatableSelect
        //         isClearable
        //         name={"filter_value"+index}          
        //         hasValue={false}
        //         value={null}              
        //         onChange={(e) => valueFilterChange(e,index)}
        //         onInputChange={handleInputChange}
        //         options={[]}
        //       />
        //     </Col>
        //     <Col xl="1" style={{display: 'flow-root'}}>
        //       <CustButton           
        //       _icon='fas fa-times'
        //       _color='transparent'
        //       _onClick={()=>removeFilter(index)}
        //       />
        //     </Col>
        //     </Row>
        //   </>
        // );
        updateState({other:other},setOtherFilter);
         // only splice array when item is found
       //  // 2nd parameter means remove one item only
      }

      updateState({other:other},setOtherFilter)            


      console.log(other);
    
            
    }
    

  }
    

  //## This will get the possible dropdown on the value 3rd dropdown
  function getValueFilter(array_index, array_filters){
    var key_value = array_filters[array_index].filter_key;
    if(key_value==""){
      return [];
    }
    var value_filter = [];
    var check_value=[];
    
    if(key_value =="status"){
      value_filter =[
        {value:1,label:"Active"},
        {value:0,label:"Inactive"},
      ]
    }
    else{
      _data.forEach(element => {
        var label = formatValue(true,key_value,element[key_value]);

        if(label !=null){
          label=label.label
          if(!check_value.includes(label)){
            var value = formatValue(true,key_value,element[key_value])
            value_filter.push(value)      
            check_value.push(label)
          }   
        }
              
      
      });
    }


    
    value_filter = value_filter.length > 0 ? value_filter:[]

   
    return value_filter

  }

  //## This will get the possible dropdown on the value 3rd dropdown
  function getKeyoptions(){
    var keys = [];  
    
    if(_data.length > 0){
      for (const [key, value] of Object.entries(_data[0])) {
        //#region options
          if(excluded.includes(key)){
  
          }else{
            
            keys.push({value:key,label:t(key)})    
          }
        //#endregion
  
         
      }
    }
   
    return keys;
  }

  
  function returnFilterType(key){
    var is_numerical = true;

    var key_default_text=["status"]
    var key_default_numeric=[""]

    if(key_default_text.includes(key)){
      return filterType;
    }
    if(key_default_numeric.includes(key)){
      return is_numerical;
    }

    _data.forEach(element => {
      var value = formatValue(true,key,element[key]);

      var option_value = "";
      if(value!=null){
        var option_value = value.value
      }
      
      //console.log(isNaN(option_key),option_key,element,key)
      if(isNaN(option_value)){
        is_numerical = false;
      }
    });

    if(is_numerical){
      return filterNumber;
    }

    return filterType
     
  }

  function clearFilter(){
    setArrayFilter(
      { "filters":[{     
        filter_index:0,
        filter_key:"",
        filter_type:"",
        filter_value:null,
        filter_condition:"and"        
      }]}
    )
    setOtherFilter(
      {other:[]}
    )
    setkeyDefault(null)
    setypeDefault(null)
    setvalueDefault(null)

    _callback(arrayFilter,true)
  }

  function remove_blankFilter(){
    var filter = []
    var err_index =[];
   // console.log(filter);
    arrayFilter.filters.forEach((element)=>{
      if(element.filter_key!="" && element.filter_type !="" && element.filter_value!=null){
        filter.push(element)
      }
      else if(
        (element.filter_key!="" && (element.filter_type =="" || element.filter_value==null))||
        (element.filter_type!="" && (element.filter_key =="" || element.filter_value==null))||
        (element.filter_value!=null && (element.filter_type =="" || element.filter_key==null))
        ){
        err_index.push(element.filter_index)

      }
      
    })
    if(filter.length > 0 && err_index.length < 1){
      _callback({filters:filter},false)
    }
    else{
      setAlertState(
        <Alert color="danger">
          <span className="alert-inner--icon">
            <i class="fas fa-exclamation-triangle"></i>
          </span>{" "}
          <span className="alert-inner--text">
            <strong>Warning:</strong> Please complete the filter fields.
          </span>
        </Alert>
      );
    }
   
  }

  function checkDisable(array){
    var toCheck = array.filters[array.filters.length - 1]
    if(toCheck){
      if(toCheck.filter_key!="" && toCheck.filter_type !="" && toCheck.filter_value!=null){
       return false
      }
    }
    return true
   
   
  }

  return (
    <>
      <h2 className="p-3 ">Filter</h2>      
      <div className="modal-body">
      {alertState}
        {/* {
        //JSON.stringify(arrayFilter)
        JSON.stringify(keyDefault)    
        }
        {
        JSON.stringify(typeDefault)
        }
        {
        JSON.stringify(valueDefault)      
        } */}
        {
        //console.log(arrayFilter)  
        }
        {
        //console.log(otherFilter)  
        }
        
        <Row id={"row_"+0}>
            <Col xl="2" id={"row_"+0+"_col"}>
                <p>Where</p>            
            </Col>
          <Col xl="3">
            <Select
              isSearchable={false}
              className="react-select-custom"
              classNamePrefix="react-select"
              value={keyDefault?keyDefault:null}                                          
              onChange={(e)=>keyChange(e,0)}
              options={keyList.list}
            />
          </Col>
          <Col xl="3">
            <Select
            isSearchable={false}
              className="react-select-custom"
              classNamePrefix="react-select"
              value={typeDefault?typeDefault:null }
              onChange={(e)=>typeChange(e,0)}
              options={typeFilter}
            />
          </Col>
          <Col  xl="3">
            <CreatableSelect
            id={"value_select_"+0}
              isClearable
              value={valueDefault?valueDefault:null}
              onChange={(e) => valueFilterChange(e,0)}
              onInputChange={()=>{}}
              options={valueFilter}
            />
          </Col>
          {/* <Col xl="1" style={{display: 'flow-root'}}>
            <CustButton
            _icon='fas fa-times'
            _color='transparent'
            _onClick={()=>removeFilter(0)}
            />
          </Col> */}
        </Row>
        {console.log(otherFilter.other.length)}
        {
        otherFilter.other.length > 0 
        ?
          otherFilter.other.map(element=>{            
            return element.filter
          }):
          null
        }
        <div>
            <CustButton
            _text='Add filter'
            _color='transparent'
            _icon='fas fa-plus' 
            _disabled={
              checkDisable(arrayFilter)
            }           
            _onClick={addNewFilter}
            />
                
        </div>
      </div>

      <div className="modal-footer">
        <Button color="primary" type="button" onClick={(e) => remove_blankFilter()}>
          Apply Filter
        </Button>
        <Button color="danger" type="button" onClick={(e) => clearFilter()}>
          Clear
        </Button>
        <Button
          color="secondary"
          data-dismiss="modal"
          type="button"
          onClick={(e) => _closeFilter()}
        >
          Close
        </Button>
      </div>
    </>
  );

  
  

};

export default Filter;
