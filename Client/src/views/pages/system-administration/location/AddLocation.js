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
  Form,
  Col,
  Row
} from "reactstrap";

import { UserContext,_dataService  } from "App";
import xlsx from "xlsx/xlsx.js"
import ExcelReport from "components/ExportExcel/ExcelReport";
import Dropzones from "components/Dropzone/Dropzone";

import ReactExport from 'react-data-export';
import Select from "react-select";
import CustButton from "components/Buttons/CustButton";
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

const fileTypes = ["xlsx", "xls"];



var count_use_effect=0;

const AddLoctype = (props) => {

  const { _onCloseClick, _callback,_loctype_id,_loctype_list } = props;
  var _date= new Date();
  const current_date =  _date.getFullYear() + "-"+("0" + _date.getMonth()).slice(-2)+"-"+("0" + _date.getDate()).slice(-2);  
  _date.setFullYear( parseInt(_date.getFullYear()) + 1);  
  const ayear_date = _date.getFullYear() + "-"+("0" + _date.getMonth()).slice(-2)+"-"+("0" + _date.getDate()).slice(-2);
  

  const {user,setUser} = useContext(UserContext);
  const [form, setForm] = useState({
    loctype_id:_loctype_id,
    location_groups_id:"",    
    name: "",
    status: 1,
    added_by: user.fullname,
    date_added: "",
    license_start: current_date,
    license_end: ayear_date
  });
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [alertState, setAlertState] = useState(null);
  const [loctype, setloctype] = useState([]);
  const [locGroupList, setLocGroupList] = useState([]);

  //Used for passing TemplateexcelData, data can be set by processExcel
  //Then because of useState when btn-excel is clicked passed data will also change
  const [TemplateExcelData, setTemplateExcelData] = useState([]);
  const [guideSheet, setguideSheet] = useState([]);
  

  useEffect(() => {    
    if(tabsState.tabs==1){
      _getRecords(user,setLocGroupList);      
    }
    _getLocationType(user,setloctype)
    return;
  }, [user.token!=""]);
    

  async function _getLocationType(user,callback){

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
            payload:{filter:{archive:0,status:1} } 
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
                callback(resPayload.map((el)=>{
                    return {
                        value:el._id,
                        label:el.name
                    }
                })
                );
                
                }else{
                callback([]);
                console.log("No records fetch");
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
    if (form.name == "" || form.location_groups_id == ""
    ) {
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
   
    if (form.license_start > form.license_end) {
      setAlertState(
        <Alert color="danger">
          <span className="alert-inner--icon">
            <i class="fas fa-exclamation-triangle"></i>
          </span>{" "}
          <span className="alert-inner--text">
            <strong>Warning:</strong> License end date must be after license start date.
          </span>
        </Alert>
      );
      return;
    }


    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    //console.log(count_use_effect);

    setForm({ ...form,loctype_id:_loctype_id,added_by:user.fullname, date_added: new Date() });
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
      
    _dataService.CRUD(window.base_api+`location/add`,requestOptions, async (response)=>{

      // Your response to manipulate
      const records =response;           
      
      switch (records.remarks) {
        case "success":
          setForm({
            title: "",
            description: "",
            status: 1,
          });
          //console.log("Location Type Successfully Added");
          // successAlert();
          
          _callback(records.remarks,form.name);
        break;
        case "Bad Token":
          _callback(records.remarks);
          break;

        case "existing":
          _callback(records.remarks,form.name);
          break;
        default:
          _callback(records.remarks);
          break;
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
      var body= JSON.stringify(
        {
          "key": "Q2FzeXNNb2RlY0FwaQ==",
          "guideFields":[
            {
              field_name:"Location Type",
              "values":loctype
            },
            {
              field_name:"Location Group",
              "values":locGroupList
            }
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
              if(name!="" && element[5]){
                                
                //# Check if duplicate name entry in excel
                if(added_names.includes(name)){
                  existing_names.push(name);
                }
                else{
                  var location_type_id=
                  loctype.filter(function (option) {
                    return option.label == element[0].trim();
                  })
                  var location_groups_id=
                  locGroupList.filter(function (option) {
                    return option.label == element[2].trim();
                  });
                  
                  //# Check if status is valid entry
                  //#Validations
                  if(
                    (element[5].toUpperCase() =="ACTIVE" || element[5].toUpperCase() =="INACTIVE" )
                    && (location_type_id.length > 0 && location_groups_id.length > 0)
                    ){
                      var status =element[5]=="ACTIVE"?1:0 ;

                      //#archive is inserted in server side check_batch_record_exists
                      var arrayed_loc = {
                        loctype_id:location_type_id[0].value,
                        name:element[1].toString(),
                        location_groups_id:location_groups_id[0].value,
                        status:status,
                        license_start: element[3],
                        license_end: element[4],
                        date_added: new Date(), 
                        added_by: user.fullname
      
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
          switch (records.remarks) {
            case "success":              
                
              _callback(records.remarks, (collated_list.length - records.payload.existing_records.length) > 1 ? "Locations": "Location");
              if(existing_names.length > 0 || records.payload.existing_records.length > 0){
                _callback("existing", (existing_names.length > 1 || records.payload.existing_records.length > 1) ? "Some Locations": "A Location" );
              }     
            break;
            case "Bad Token":
              _callback(records.remarks);
              break;
    
            case "existing":
              _callback(records.remarks, records.payload.existing_records.length > 1 ? "Locations": "Location" );
              break;
            default:
              _callback(records.remarks,"Location already exist.");
              break;
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

  
  function handleSliderChange(e){
        
    if(e.target.checked){
        updateForm({ status: 1 })
    }
    else{
        updateForm({ status: 0 })
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
        payload:{
          archive:0,
          status:1,
          loctype_id: form.loctype_id
        } 
      };

      var requestOptions = {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`get_active_location_groups/`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
        if(records.remarks=="success"){
          if(records.payload.result.length > 0 ){
            const resPayload = records.payload["result"];                           
            callback(
              resPayload.map((data) => ({
                value: data._id,
                label: data.name,
              }))
            );
          }else{
            callback([]);
            console.log("No records fetch");
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
              
              <Row>                    
                <Col xl="12">

                  <label className="form-control-label">Location Group <span className="text-danger">*</span></label>


                    <Select
                      className="react-select-custom"
                      classNamePrefix="react-select"
                      defaultValue=""
                      onChange={(e)=>{setForm({...form,location_groups_id:e.value })}}
                      options={locGroupList}
                    />

                </Col>
              
              </Row>
              <br/>


              <FormGroup>
                <label className="form-control-label">
                  Status <span className="text-danger">*</span>
                </label>
                <InputGroup>
                  <label class="custom-toggle custom-toggle-success">
                    <Input
                      type="checkbox"
                      id="name"
                      checked={form.status == 1 ? true : false}
                      onChange={(e) => handleSliderChange(e)}
                    />
                    <span class="custom-toggle-slider rounded-circle "></span>
                  </label>
                  <label className=" pl-2">
                    <span
                      className={
                        form.status === 1 ? "text-success" : "text-danger"
                      }
                    ></span>{" "}
                    {form.status === 1 ? " Active" : " Inactive"}
                  </label>
                </InputGroup>
              </FormGroup>

              <Row>
                  <Col xl="6">
                    <FormGroup className="mb-1 ">
                      <label
                        className="form-control-label"
                        htmlFor="date-start"
                      >
                        License Start Date <span className="text-danger">*</span>
                      </label>                      
                      <Input
                        className=""
                        defaultValue={current_date}      
                        onChange={(e) =>
                          updateForm({ license_start: e.target.value })
                        }
                        
                        id="date-start"
                        name="date-end"
                        type="date"
                      />
                    </FormGroup>
                  </Col>                  
                  <Col xl="6">
                    <FormGroup className="mb-1 ">
                      <label
                        className="form-control-label"
                        htmlFor="date-end"
                      >
                        License End Date <span className="text-danger">*</span>
                      </label>
                      <Input
                        className=""
                        defaultValue={ayear_date}                       
                        onChange={(e) =>
                          updateForm({ license_end: e.target.value })
                        }
                        id="date-end"
                        name="date-end"
                        type="date"
                      />
                    </FormGroup>
                  </Col>
                </Row>
            </div>

            <div className="modal-footer">

              <CustButton
                _text="Add"
                _id={`modal_button_add`}
                _type="button"
                _color="primary"
                _icon="fas fa-plus"
                _onClick={(e) => onSubmit(e)}
              />

              <CustButton
                _text="Cancel"
                _id={`modal_button_add`}
                _type="button"
                _color="secondary"
                _icon="fas fa-ban"
                _onClick={_onCloseClick}
              />

            </div>
          </TabPane>
          <TabPane tabId="tabs2">
            <Dropzones 
              _maxfiles="1"  
              _pholder="All .xlsx and .xls file types are supported." 
              _response="Success"             
              _fileCallback={setFile} 
              _file_nameCallBack={setFilename}   
              _downloadCallback={(e) => processExcel(e)} 
              />

              <div className="modal-footer">
                <CustButton
                  _text="Upload"
                  _id={`modal_button_add`}
                  _type="button"
                  _color="primary"
                  _icon="fas fa-upload"
                  _onClick={(e) => onUpload(e)}
                />                
                                  
                <CustButton
                  _text="Cancel"
                  _id={`modal_button_add`}
                  _type="button"
                  _color="secondary"
                  _icon="fas fa-ban"
                  _onClick={_onCloseClick}
                />
              </div>
            </TabPane>
        </TabContent>
      </div>
    </>
  )

}

export default AddLoctype