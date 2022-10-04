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
import { beautifyText } from "services/data.services";
import { useTranslation } from "react-i18next";

const FilterHeader = (props) => {

  const { _state, _data,_filterArray, _exclude_keys,_callback,_closeFilter,_filterColumnArray } = props;
  const[keyList,setKeyList]= useState({
    list:[]
  })  
  const [headers,setHeaders] =useState({
    headers:[""]
  })
  const [headersValue,setHeaderValue] = useState({
    headers:null
  })
  //Div  
  const {t} =useTranslation();

  useEffect(()=>{
    var excluded = _exclude_keys;
    var default_values = [];
    var default_headers = [];

    //# Exclude keys that is ##! filtered (DO NOT DELETE !!!) 
        // if(_filterArray){
        //     _filterArray.filters.forEach((element)=>{            
        //         excluded.push(element.filter_key)
        //     })
        // }
    //
    
    if(excluded){
      excluded.push("_id","archive");
    }
    else{
      excluded=["_id","archive"];
    }
  
    var keys = [];  
    if(_data.length > 0 ){
      for (const [key, value] of Object.entries(_data[0])) {
        var raw_label = beautifyText(key)
        //#region options
          if(excluded.includes(key)){
  
          }else{
            
            keys.push({value:key,label:t(key)})    
          }
        //#endregion
                           
        if(_filterColumnArray){
            if(_filterColumnArray.headers.includes(key.toLocaleLowerCase())){
                default_values.push({value:key,label:t(key)})
                default_headers.push(key)
              }
        }
       
      }
    }
   
    updateState({headers:default_values},setHeaderValue)
    updateState({headers:default_headers},setHeaders)
    updateState({list:keys},setKeyList)
    
  },[_filterArray])
  
  const [state, reloadState] = useState();
  const forceUpdate = React.useCallback(() => reloadState({}), []);

  const [alertState, setAlertState] = useState(null);
 
  function updateState(value,setState){
    return setState((prev) => {
      return { ...prev, ...value };
    });
  }

  function remove_blankFilter(){
    var _headers = []
    if(!headers.headers){
      _callback({headers:_headers},false)
      return;
    }
   // console.log(_headers);
    headers.headers.forEach((element)=>{    
        _headers.push(element)    
    })
  if(_headers.length > 0 ){
    _callback({headers:_headers},false)
  }
 
   
  }

  function clearFilter(){
    updateState({headers:null},setHeaderValue)         
    updateState({headers:null},setHeaders)
    _callback(headers,true)
  }
  
  function selectChange(e){
    updateState({headers:e},setHeaderValue)
    
    var headers = e.map((element)=>{
        return element.value
    })    
    updateState({headers:headers},setHeaders)
  }

  return (
    <>
      <h2 className="p-3 ">Filter Headers</h2>     
      
      <div className="modal-body">
      {alertState}       
        <Row id={"row_"+0}>           
          <Col xl="12">
            <Select
              isSearchable={false}
              isMulti={true}
              className="react-select-custom"
              classNamePrefix="react-select"
                value={headersValue.headers}
              onChange={(e)=>selectChange(e)}
              options={keyList.list}
            />
          </Col>
     
        </Row>
        
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

export default FilterHeader;
