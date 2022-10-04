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

import ReactExport from 'react-data-export';
import Select from "react-select";
import CreatableSelect from 'react-select/creatable';
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

const fileTypes = ["xlsx", "xls"];



var count_use_effect=0;

const AddModule = (props) => {

  const { _state, _onCloseClick,_callback,_accessLevel } = props;

  console.log(_accessLevel);
  const {user,setUser} = useContext(UserContext);
  const [form, setForm] = useState({
    module_id:"",
    module_name:"",
    access_level:"",
    added_by: user.fullname,
    date_added: "",
  });
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [alertState, setAlertState] = useState(null);
  const [moduleList, setmoduleList] = useState( [{
    value: "",
    label: "All modules have been added",
    isDisabled:true
  }]);

  //Used for passing TemplateexcelData, data can be set by processExcel
  //Then because of useState when btn-excel is clicked passed data will also change
  const [TemplateExcelData, setTemplateExcelData] = useState([]);
  const [guideSheet, setguideSheet] = useState([]);


  useEffect(() => {    
    if(tabsState.tabs==1){
      _getRecords(user,setmoduleList);      
    }
    return;
  }, [user.token!=""]);
    

  function handleSelectChange(e){
    if(e){
      console.log(e)
      if(e.value!=""){
        updateForm({ module_id: e.value,module_name:e.label })
      }
       
    }
    else{
        updateForm({ module_id: "" })
    }
    
  }

  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setAlertState(null);
    form.module_id = form.module_id.trim();
    console.log(form);
    if (form.module_name == "") {
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

    // When a post request is sent to the create url, we'll add a new record to the database.
    const _payload = {
      payload: { ...form,access_level:_accessLevel, added_by:user.fullname, date_added: new Date()},
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };


    var requestOptions = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_payload)
    };
      
    _dataService.CRUD(window.base_api+`al_modules/add`,requestOptions, async (response)=>{

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
    function processExcel (e){

      //#Guidfield
      // field_name = header
      // for values just put the componentList for the dropdown
      var body= JSON.stringify(
        {
          "key": "Q2FzeXNNb2RlY0FwaQ==",
          "guideFields":[
            // {
            //   field_name:"Location Type",
            //   "values":loctype
            // },
            // {
            //   field_name:"Location Group",
            //   "values":locGroupList
            // }
          ]
        } 
      )   
      
      _dataService.processExcel(
        `location/download_excel_template_location.php`,
        body,
        "Batch_Add_Location_Template",
        (return_data)=>{          
          
          if(return_data.remarks!="success"){

            _callback("download-fail");
          }          
        }
      )

    }

    async function onUpload(){
     
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
      
      if(!file[0].name.includes("Batch_Add_Location_Template")){
        setAlertState(
          <Alert color="danger">
            <span className="alert-inner--icon">
              <i class="fas fa-exclamation-triangle"></i>
            </span>{" "}
            <span className="alert-inner--text">
              <strong>Warning: </strong> Please use the template provided below.
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
        var added_names = [];
        var existing_names = [];
        
        data.forEach(element => {              
          if(index==0 || index==1 ){

          }
          else{                      
            if(element[1]){
              var name = element[1].toString().trim();
              if(name!="" && element[3]){
                                
                //# Check if duplicate name entry in excel
                if(added_names.includes(name)){
                  existing_names.push(name);
                }
                else{

                  //#Dropdown value
                    // var location_type_id=
                    // loctype.filter(function (option) {
                    //   return option.label == element[0].trim();
                    // })
                    // var location_groups_id=
                    // locGroupList.filter(function (option) {
                    //   return option.label == element[2].trim();
                    // });
                  //#end
                  //# Check if status is valid entry
                  //#Validations
                  // element[index of status].toUpperCase() ==
                  if(
                    (element[3].toUpperCase() =="ACTIVE" || element[3].toUpperCase() =="INACTIVE" )
                    //&& (location_type_id.length > 0 && location_groups_id.length > 0)
                    ){
                      var status =element[3]=="ACTIVE"?1:0 ;
                      var arrayed_loc = {
                        //loctype_id:location_type_id[0].value,
                        name:element[1].toString(),
                        //location_groups_id:location_groups_id[0].value,
                        status:status
      
                      };
                      //# add to collated_list to be send on server
                      collated_list.push(arrayed_loc); 
                      //# add to added_names for verification of duplicate name entry
                      added_names.push(name); 
                    }
                  }
               
       
              }
            }
                        
          }
          index ++;

        });
        
        if(collated_list.length <= 0 ){
          _callback("no-record");
          return
        }

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
          
        _dataService.CRUD(window.base_api+`location/batch_add`,requestOptions, async (response)=>{
  
          // Your response to manipulate
          const records =response;                                              
          if(records.remarks=="success"){  
                   
            var addtional_message = ""
            var prefix=""  
            if(existing_names.length > 0){
              var addtional_message = "Some Locations are not added since they are already existing.";
              var prefix="Some ";
            }        

            var return_data =
            <>
            {prefix+"Locations have been successfully added."}
            <br/>
            {addtional_message}
            </>
            _callback(records.remarks,return_data);

          }else{
            if(records.remarks =="Bad Token"){
              _callback(records.remarks);
            }else{
              _callback(records.remarks,"Location Types already exist.");
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
        payload:{access_level:_accessLevel} 
      };

      var requestOptions = {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`get_al_modulesDropdown/`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
        if(records.remarks=="success"){
          if(records.payload.result.length > 0 ){
            const resPayload = records.payload["result"];     
            if(resPayload.length > 0){
              setmoduleList(
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
            {/* <NavItem>
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
            </NavItem> */}
          </Nav>
        </div>
        <TabContent activeTab={"tabs" + tabsState.tabs}>
          <TabPane tabId="tabs1">            
            <div className="container">
                <FormGroup className="mb-1 ">
                  <label
                    className="form-control-label"
                    htmlFor="example-date-input"
                  >
                    Module Name
                  </label>
                
                  <CreatableSelect
                    id="moduleDropdown"
                    isClearable
                    defaultValue=""
                    onChange={(e) => handleSelectChange(e)}                    
                    options={moduleList}
                   
                />
                </FormGroup>
              
            </div>

            <div className="modal-footer">
              <Button
                color="primary"
                type="button"
                onClick={(e) => onSubmit(e)}
              >
                Add Module
              </Button>
              <Button
                color="secondary"
                data-dismiss="modal"
                type="button"
                onClick={(e)=>{_onCloseClick(false)}}
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
                  onClick={(e) => processExcel(e)}
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

export default AddModule