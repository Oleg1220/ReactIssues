import React, { useState, useContext, useEffect } from "react";
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

import Dropzone from "dropzone";
import classnames from "classnames";
// import Select2 from "react-select2-wrapper";
import Select from "react-select";
import xlsx from "xlsx/xlsx.js"
import ExcelReport from "components/ExportExcel/ExcelReport";
import Dropzones from "components/Dropzone/Dropzone";

const fileTypes = ["xlsx", "xls"];
function AddDirectory({ _state, _callback }) {
  // Callback Allerts
  const [alertState, setAlertState] = useState(null);
  const { user, setUser } = useContext(UserContext);
  const [form, setForm] = useState({
    training_id: "",
    provider_id: [],
  });

  // Lists
  const [trainingsList, setTrainingsList] = useState([]);
  const [providersList, setProvidersList] = useState([]);
  const [existingData, setExistingData] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  //Used for passing TemplateexcelData, data can be set by processExcel
  //Then because of useState when btn-excel is clicked passed data will also change
  const [TemplateExcelData, setTemplateExcelData] = useState([]);

  // These methods will update the state properties.
  function updateForm(value) {
    setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  useEffect(() => {
    _getTrainings(user, setTrainingsList);
    return;
  }, [user.token != ""]);

  var count_use_effect = 0;
  async function _getTrainings(user, callback, id) {
    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;
    if (token && token_creation) {
      const _payload = {
        auth: {
          token: token,
          _id: _user_id,
        },
        payload: { is_archived: 0 },
      };

      var requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      };

      _dataService.CRUD(
        window.base_api + `get_trainingByDirectory`,
        requestOptions,
        async (response) => {
          // Your response to manipulate
          const records = response;
          if (records.remarks == "success") {
            if (records.payload.result.length > 0) {
              const resPayload = records.payload["result"];
              callback(
                resPayload.map((data) => ({
                  value: data._id,
                  label: data.name,
                }))
              );
            } else {
              callback([]);
              console.log("No records fetch");
            }
          } else {
            if (records.remarks == "Bad Token") {
              _callback(records.remarks);
            } else {
              _callback(records.remarks);
              console.log("Error occured with message " + records.remarks);
            }
          }
        }
      );
    } else {
      if (count_use_effect >= 2) {
        console.log("Missing credentials kindly logged in");
      }
    }
  }
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [file_name, setFilename] = useState(null);

  const handleFileChange = (event) => {
    console.log(event.target.files[0]);
    setFile(event.target.files[0]);

  };
  const toggleTabs = (e, statesss, index) => {
    e.preventDefault();
    setTabsState({ tabs: index });
    // this.setState({
    //   [state]: index
    // });
  };
  var count_use_effect = 0;
  async function _getProviders(user, callback, providersRemoved) {
    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;
    if (token && token_creation) {
      const _payload = {
        auth: {
          token: token,
          _id: _user_id,
        },
        payload: { is_archived: 0 },
      };

      var requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      };
      console.log(providersRemoved)
      _dataService.CRUD(
        window.base_api + `get_ProvidersByDirectory`,
        requestOptions,
        async (response) => {
          // Your response to manipulate
          const records = response;
          if (records.remarks == "success") {
            if (records.payload.result.length > 0) {
              const resPayload = records.payload["result"];
              var idsToRemove = providersRemoved.map((data) => data._id);
              var result = resPayload
                .filter((word) => !idsToRemove.includes(word._id))
                .map((data) => ({
                  value: data._id,
                  label: data.name,
                }));
              callback(result);
            } else {
              callback([]);
              console.log("No records fetch");
            }
          } else {
            if (records.remarks == "Bad Token") {
              _callback(records.remarks);
            } else {
              _callback(records.remarks);
              console.log("Error occured with message " + records.remarks);
            }
          }
        }
      );
    } else {
      if (count_use_effect >= 2) {
        console.log("Missing credentials kindly logged in");
      }
    }
  }

  function processExcel (e){
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
      `providers/download_excel_template_directory.php`,
      body,
      "Batch_Add_Directory_Template",
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
    
    if(!file[0].name.includes("Batch_Add_Directory_Template")){
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
          if(element[0]){
            var name = element[0].toString().trim();
            if(name!="" && element[1]){
                              
              //# Check if duplicate name entry in excel
              if(added_names.includes(name)){
                existing_names.push(name);
              }
              else{
                //# Check if status is valid entry
                if(element[1].toUpperCase() =="ACTIVE" || element[1].toUpperCase() =="INACTIVE" ){
                  var status =element[1]=="ACTIVE"?1:0 ;
                  var phone = (typeof element[4] === 'undefined') ? "" : element[4].toString();
                  // console.log(element[4])
                  var arrayed = {
                    //loctype_id:location_type_id[0].value,
                    name:element[0].toString(),
                    email:element[2].toString(),
                    address:element[3].toString(),
                    // phone:phone,
                    //location_groups_id:location_groups_id[0].value,
                    status:status    
                  };           
                     //# add to collated_list to be send on server
                     collated_list.push(arrayed); 
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
        
      _dataService.CRUD(window.base_api+`providers/batch_add`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                                              
        if(records.remarks=="success"){  
                 
          var addtional_message = ""
          var prefix=""  
          if(existing_names.length > 0){
            var addtional_message = "Some provider are not added since they are already existing.";
            var prefix="Some ";
          }        

          var return_data =
          <>
          {prefix+"Providers have been successfully added."}
          <br/>
          {addtional_message}
          </>
          _callback(records.remarks,return_data);

        }else{
          if(records.remarks =="Bad Token"){
            _callback(records.remarks);
          }else{
            _callback(records.remarks,"Provider already exist.");
            console.log("Error occured with message "+records.remarks);
          }                 
        }
      });

      //this.setState({ data: data, cols: make_cols(ws["!ref"]) });
    };
    if (rABS) reader.readAsBinaryString(file[0]);
    else reader.readAsArrayBuffer(file[0]);
  }

  var count_use_effect = 0;
  async function _getTrainingRecord(user, callback, selectedId) {
    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;
    if (token && token_creation) {
      const _payload = {
        auth: {
          token: token,
          _id: _user_id,
        },
        payload: {
          match_by_training: 1,
        },
      };

      var requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      };

      _dataService.CRUD(
        window.base_api + `get_directory/${selectedId}`,
        requestOptions,
        async (response) => {
          // Your response to manipulate
          const records = response;
          if (records.remarks == "success") {
            if (records.payload.result) {
              const resPayload = records.payload["result"][0];
              if(resPayload){
                console.log(`training data found`)
                setExistingData(resPayload);
                _getProviders(user, setProvidersList, resPayload.provider);
              }else{
                setExistingData([]);
                _getProviders(user, setProvidersList, []);
              }
            } else {
              console.log(`failed-fetch`)
              //_callback("failed-fetch")
            }
          } else {
            if (records.remarks == "Bad Token") {
              //_callback(records.remarks)
            } else {
              //_callback(records.remarks)
            }
          }
        }
      );
    } else {
      if (count_use_effect >= 2) {
        console.log("Missing credentials kindly logged in");
      }
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setAlertState(null);
    if (form.training_id == "" || !form.provider_id.length) {
      setAlertState(
        <Alert color="danger">
          <span className="alert-inner--icon">
            <i class="fas fa-exclamation-triangle"></i>
          </span>{" "}
          <span className="alert-inner--text">
            <strong>Warning:</strong> Fields with{" "}
            <span className="text-danger">*</span> are required.
          </span>
        </Alert>
      );
      return;
    }

    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    var url = `directory/add`;
    var tmpExistingData;
    var tmpFormData = {...form };
    /** Check if training selected has existing data */
    if(existingData.length != 0){
      url = `update_directory/${existingData._id}`
      tmpExistingData = existingData.provider.map((e)=>(
        {
          value: e._id,
          label: e.name,
        }
      ))
      tmpFormData.provider_id = tmpExistingData.concat(form.provider_id)
    }
    
    // When a post request is sent to the create url, we'll add a new record to the database.
    const _payload = {
      payload: { ...tmpFormData },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };

    // console.log(tmpFormData);
    var requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_payload),
    };
    
    _dataService.CRUD(
      window.base_api + url,
      requestOptions,
      async (response) => {
        // Your response to manipulate
        const records = response;
        if (records.remarks === "success") {
          _callback(records.remarks, tmpFormData.training_id.label);
          setForm({
            training_id: "",
            provider_id: [],
          });

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
      }
    );
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
  <div className="modal-body pb-0">
        {alertState}
        <div className="container">
          <Row>
            <Col xl="12">
              <p className="description font-weight-bold mb-2">
                Training
                <span className="text-danger"> *</span>
              </p>
              <Select
                className="react-select-custom"
                classNamePrefix="react-select"
                defaultValue="Yagjit"
                onChange={(e) => {
                  updateForm({ training_id: e });
                  _getTrainingRecord(user, setSelectedData, e.value);
                }}
                options={trainingsList}
              />
            </Col>
          </Row>
          <Row>
            <Col xl="12">
              <p className="description font-weight-bold mb-2">
                Provider
                <span className="text-danger"> *</span>
              </p>
              <Select
                className="react-select-custom"
                classNamePrefix="react-select"
                defaultValue=""
                isMulti
                onChange={(e) => {
                  updateForm({ provider_id: e });
                }}
                options={providersList}
                closeMenuOnSelect={false}

              />
            </Col>
          </Row>
        </div>
      </div>

      <div className="modal-footer">
        <Button color="primary" type="button" onClick={(e) => onSubmit(e)}>
          Save changes
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
  <TabPane tabId="tabs2">
    <Dropzones 
      _maxfiles="1"  
      _pholder="All .xlsx and .xls file types are supported" 
      _response="Success"             
      _fileCallback={setFile} 
      _file_nameCallBack={setFilename}   
      _downloadCallback={(e)=> processExcel(e)}
      />

      <div className="modal-footer">
        
        <ExcelReport 
          id="btn-template-excel" 
          btn_style="btn btn-primary d-none" 
          file_name="Batch_Providers_Template"  
          data={TemplateExcelData} 
          sheet_name="Location Type"
          >Download Template</ExcelReport>
  
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
  );
}

export default AddDirectory;
