import React, { useState,useContext,useEffect } from "react";
import ReactBSAlert from "react-bootstrap-sweetalert";

import Dropzone from "dropzone";
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
  Form
} from "reactstrap";

import { UserContext,_dataService  } from "App";
import xlsx from "xlsx/xlsx.js"
import ExcelReport from "components/ExportExcel/ExcelReport";
import Dropzones from "components/Dropzone/Dropzone";
import Select from "react-select";
import CreatableSelect from 'react-select/creatable';
import ReactExport from 'react-data-export';
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

const fileTypes = ["xlsx", "xls"];



var count_use_effect=0;

const AddLoctype = (props) => {

  const { _state, _onCloseClick,_callback,_loctype_list } = props;

  const {user,setUser} = useContext(UserContext);
  const [form, setForm] = useState({
    name:"",
    loctype:[],
    heirarchy:1,    
    added_by: user.fullname,
    date_added: "",
  });
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [alertState, setAlertState] = useState(null);
  const [locTypeList, setLocTypeList] = useState([]);  
  //Used for passing TemplateexcelData, data can be set by processExcel
  //Then because of useState when btn-excel is clicked passed data will also change
  const [TemplateExcelData, setTemplateExcelData] = useState([]);
  const [guideSheet, setguideSheet] = useState([]);

  useEffect(() => {    
    if(tabsState.tabs==1){
      _getRecords(user,setLocTypeList);      
    }
    return;
  }, [user.token!=""]);

  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setAlertState(null);
    form.name = form.name.trim();
    if (form.name == "") {
      setAlertState(
        <Alert color="danger">
          <span className="alert-inner--icon">
            <i class="fas fa-exclamation-triangle"></i>
          </span>{" "}
          <span className="alert-inner--text">
            <strong>Warning:</strong> Fields with <span className="text-danger">*</span> are required.
          </span>
        </Alert>
      );
      return;
    }
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    //console.log(count_use_effect);

    setForm({ ...form,added_by:user.fullname, date_added: new Date() });
    // When a post request is sent to the create url, we'll add a new record to the database.
    const _payload = {
      payload: { ...form },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };


    var requestOptions = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_payload)
    };
      
    _dataService.CRUD(window.base_api+`access_levels/add`,requestOptions, async (response)=>{

      // Your response to manipulate
      const records =response;                
      if (records.remarks === "success") {
        setForm({
          name: "",
        });
        
        // successAlert();
        _callback(records.remarks);
        // callback();
      } else {
        switch (records.remarks) {
          case "Bad Token":
            _callback(records.remarks);
            break;

          case "existing":
            _callback(records.remarks);
            break;
          default:
            _callback(records.remarks);
            break;
        }
      }

    });

  }


  //#region Upload Batch  
    const [file, setFile] = useState(null);
    const [fileData, setFileData] = useState([]);
    const [file_name, setFilename] = useState(null);
    const handleFileChange = (event) => {
      console.log(event.target.files[0]);
      setFile(event.target.files[0]);

    };

    async function onUpload(){
      console.log(file);
      if(file==null){
        setAlertState(
          <Alert color="danger">
            <span className="alert-inner--icon">
              <i class="fas fa-exclamation-triangle"></i>
            </span>{" "}
            <span className="alert-inner--text">
              <strong>Warning:</strong> Fields with <span className="text-danger">*</span> are required.
            </span>
          </Alert>
        );
        return;
      }
      const reader = new FileReader();
      const rABS = !!reader.readAsBinaryString;
      reader.onload = async e => {
        /* Parse data */
        const bstr = e.target.result;
        const wb = xlsx.read(bstr, { type: rABS ? "binary" : "array" });
        /* Get first worksheet */
        const wsname = wb.SheetNames[0]; 
        const ws = wb.Sheets[wsname];       
        /* Convert array of arrays */
        const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
        /* Update state */
      
        var index =0;
        var collated_list=[];
        data.forEach(element => {              
          if(index==0){

          }
          else{                      
            if(element[0]){
              if(element[0].toString().trim()!=""){
                var arrayed_loc = {name:element[0]};
                collated_list.push(arrayed_loc);           
              }
            }
                        
          }
          index ++;

        });

        const token = user.token;
        const _user_id = user.admin_id;
        const _fullname = user.fullname;

        const batch_add = {
          auth:{
            token:token,
            _id:_user_id,
            _fullname:_fullname
          },
          payload:{
            list:collated_list
          }
        };    
        
        var requestOptions = {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(batch_add)
        };
          
        _dataService.CRUD(window.base_api+`get_archive/loctypes/`,requestOptions, async (response)=>{
  
          // Your response to manipulate
          const records =response;                                              
          if(records.remarks=="success"){                  
            _callback(records.remarks);

          }else{
            if(records.remarks =="Bad Token"){
              _callback(records.remarks);
            }else{
              _callback(records.remarks);
              console.log("Error occured with message "+records.remarks);
            }                 
          }
        });

        //this.setState({ data: data, cols: make_cols(ws["!ref"]) });
      };
      if (rABS) reader.readAsBinaryString(file[0]);
      else reader.readAsArrayBuffer(file[0]);
    }

  //#endregion


  const toggleTabs = (e, statesss, index) => {
    e.preventDefault();
    setTabsState({ tabs: index });
    // this.setState({
    //   [state]: index
    // });
  };
  function handleSelectChange(e){
    if(e){
      console.log(e)
      if(e.value!=""){
        updateForm({ loctype: e })
      }
       
    }
    else{
        updateForm({ loctype: [] })
    }
    
  }

  async function _getRecords(user,callback){

    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;
    //console.log(count_use_effect);
    if(token && token_creation){
      const _payload = { 
        auth:{
          token:token,
          _id:_user_id
        },
        payload:{} 
      };

      var requestOptions = {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`get_active_loctypes/`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
        if(records.remarks=="success"){
          if(records.payload.result.length > 0 ){
            const resPayload = records.payload["result"];     
            if(resPayload.length > 0){
              callback(
                resPayload.map((data) => ({
                    value: data._id,
                    label: data.name,
                  }))
               )
            }           
           
          }else{
            
          }
        }else{
          if(records.remarks =="Bad Token"){
            _callback(records.remarks);
          }else{
            _callback(records.remarks);
            console.log("Error occured with message "+records.remarks);
          }                
        }
      });

    }
    else{
      if(count_use_effect >= 2){
        console.log("Missing credentials kindly logged in");
      }
    }
  }
  return (
    <>
      <div className="modal-body pt-0">
        <div className="nav-wrapper">
          {alertState}
          <p className="description font-weight-bold mb-1">Add Options</p>
          <Nav
            className="nav-fill flex-column flex-md-row"
            id="tabs-icons-text"
            pills
            role="tablist"
          >
            <NavItem>            
              <NavLink
                aria-selected={tabsState.tabs === 1}
                className={classnames("mb-sm-3 mb-md-0", {
                  active: tabsState.tabs === 1,
                })}
                onClick={(e) => toggleTabs(e, "tabs", 1)}
                href="#pablo"
                role="tab"
              >
                <i class="fas fa-user"></i> Single Mode
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                aria-selected={tabsState.tabs === 2}
                className={classnames("mb-sm-3 mb-md-0", {
                  active: tabsState.tabs === 2,
                })}
                onClick={(e) => toggleTabs(e, "tabs", 2)}
                href="#pablo"
                role="tab"
              >
                <i class="fas fa-users"></i> Batch Mode
              </NavLink>
            </NavItem>
          </Nav>
        </div>
        <TabContent activeTab={"tabs" + tabsState.tabs}>
          <TabPane tabId="tabs1">            
            <div className="container">
              <FormGroup>
                <label className="form-control-label">Name <span className="text-danger">*</span></label>
                <InputGroup>
                  <Input
                    type="text"
                    id="name"
                    onChange={
                      (e) => {
                        updateForm({ name: e.target.value }
                        );
                        
                      }
                    }
                  />
                </InputGroup>
                
              </FormGroup>
              <FormGroup>
                <label className="form-control-label">Heirarchy <span className="text-danger">*</span></label>
                <InputGroup>
                  <Input
                    type="number"
                    min={1}
                    id="heirarchy"
                    onChange={
                      (e) => {
                        updateForm({ heirarchy: e.target.value }
                        );
                        
                      }
                    }
                  />
                </InputGroup>
                
              </FormGroup>
              <FormGroup className="mb-1 ">
                  <label
                    className="form-control-label"
                    htmlFor="example-date-input"
                  >
                    Location Types
                  </label>
                
                  <Select
                    closeMenuOnSelect={false}
                    id="moduleDropdown"
                    isClearable={false}
                    defaultValue={[]}
                    isMulti
                    onChange={(e) => handleSelectChange(e)}                    
                    options={locTypeList}
                   
                />
              </FormGroup>
                            
            </div>

            <div className="modal-footer">
              <Button
                color="primary"
                type="button"
                onClick={(e) => onSubmit(e)}
              >
                Save changes
              </Button>
              <Button
                color="secondary"
                data-dismiss="modal"
                type="button"
                onClick={_onCloseClick}
              >
                Close
              </Button>
            </div>
          </TabPane>
          <TabPane tabId="tabs2">
            <Dropzones 
              _maxfiles="1"  
              _pholder="All .xlsx and .xls file types are supported." 
              _response="Success"             
              _fileCallback={setFile} 
              _file_nameCallBack={setFilename}    
              />

              <div className="modal-footer">
                <ExcelReport 
                  id="btn-template-excel" 
                  btn_style="btn btn-primary d-none" 
                  file_name="Batch_Location_Template"  
                  data={TemplateExcelData} 
                  guide={guideSheet}
                  sheet_name="Location"
                  >Download Template</ExcelReport>
                <Button
                  color="primary"
                  type="button"
                  onClick={(e) => function test(){}}
                >
                  Download Template
                </Button>
                <Button
                  color="primary"
                  type="button"
                  onClick={(e) => onUpload(e)}
                >
                  Upload
                </Button>
                <Button
                  color="secondary"
                  data-dismiss="modal"
                  type="button"
                  onClick={_state}
                >
                  Close
                </Button>
              </div>
            </TabPane>
        </TabContent>
      </div>
    </>
  )

}

export default AddLoctype