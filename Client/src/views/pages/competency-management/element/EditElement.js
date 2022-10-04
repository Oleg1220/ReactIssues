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

const EditElement = (props) => {

  const { _state, _callback,_loctype_id,_id} = props;
  
  const {user,setUser} = useContext(UserContext);
  const [form, setForm] = useState({
    loctype_id:_loctype_id,
    level_id:"",    
    name: "",
    reference:"",
    status: 1,
    modified_by: user.fullname,
    date_modified: "",
  });
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [alertState, setAlertState] = useState(null);
  const [levelList, setlevelList] = useState([]);
  var assigned_level =[];
  
  //const [loctype_list, setLoctype_list] = useState([]);

  //Used for passing TemplateexcelData, data can be set by processExcel
  //Then because of useState when btn-excel is clicked passed data will also change
  const [TemplateExcelData, setTemplateExcelData] = useState([]);
  const [guideSheet, setguideSheet] = useState([]);

  useEffect(() => {    
    if(tabsState.tabs==1){
      _getRecords(user,setForm); 
      
      //_dropdownLoctypeList();   
    }
    return;
  }, [user.token!=""]);
    
  // function _dropdownLoctypeList(){
  //   var dropdown=[];
  //   _loctype_list.forEach(element => {
  //     if(element.name){
  //       dropdown.push({
  //         value: element._id,
  //         label: element.name
  //       });
  //     }
  //     setLoctype_list(dropdown);
      
  //   });
  // }


  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  const sanitizeFileName = (filename) => {
    // * filename variable should not include the extension.
    return filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  };

  const renameFile = (originalFile, newName) => {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
      folder:"elements_reference"
    });
  };

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
    var token = `${user.token}`;
    var _user_id = `${user.admin_id}`;
    var _fullname = `${user.fullname}`;
    var formdata = new FormData();
    var newFileName = null;
    var _file;
    if (file != null) {
      var uniqidn = `_${Math.floor(1000 + Math.random() * 9000)}_${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      newFileName =
        sanitizeFileName(form.name) +
        uniqidn +
        "." +
        file[0].name.split(".").pop();
        var _file = renameFile(file[0], newFileName);
      formdata.append("newFileName", newFileName);
      formdata.append("file", _file);
    } else {
      console.log(`No File Attached`);
    }

    setForm({ ...form });
    // When a post request is sent to the create url, we'll add a new record to the database.
    const _payload = {
      payload: { ...form },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };
    formdata.append("jsonData", JSON.stringify(_payload)); 

    var requestOptions = {
      method: 'POST',
      body: formdata
    };
      
    _dataService.CRUD(window.base_api+`update_elements/`+_id,requestOptions, async (response)=>{

      // Your response to manipulate
      const records =response;                
      if (records.remarks === "success") {
        setForm({
          title: "",
          description: "",
          status: 1,
        });
        console.log("Location Type Successfully Edited");
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

        const batch_Edit = {
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
          body: JSON.stringify(batch_Edit)
        };
          
        _dataService.CRUD(window.base_api+`get_archive/elements/`,requestOptions, async (response)=>{
  
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
        updateForm({ level_id: [{value:e.value,label:e.label}] })
      }
       
    }
    else{
        updateForm({ level_id: [] })
    }
    
  }


  async function _getLevel(user,callback){

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
        var levels= [
          {
            value:"TECHNICAL",
            label:"TECHNICAL"
          },
          {
            value:"OPERATIONAL",
            label:"OPERATIONAL"
          }
        ];
        callback(levels);
        getAssignLevel(levels);  
      // _dataService.CRUD(window.base_api+`get_active_location_groups/`,requestOptions, async (response)=>{

      //   // Your response to manipulate
      //   const records =response;                
      //   if(records.remarks=="success"){
      //     if(records.payload.result.length > 0 ){
      //       const resPayload = records.payload["result"];                
      //       callback(resPayload);
      //     }else{
      //       callback([]);
      //       console.log("No records fetch");
      //     }
      //   }else{
      //     if(records.remarks =="Bad Token"){
      //       _callback(records.remarks);
      //     }else{
      //       _callback(records.remarks);
      //       console.log("Error occured with message "+records.remarks);
      //     }                
      //   }
      // });

    }
    else{
      if(count_use_effect >= 2){
        console.log("Missing credentials kindly logged in");
      }
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
        console.log(_id);
        _dataService.CRUD(window.base_api+`get_elements/${_id}`,requestOptions, async (response)=>{

            // Your response to manipulate
            const records =response;                
            if(records.remarks=="success"){
                    
                if(records.payload.result){
                    const resPayload = records.payload["result"][0];                
                    
                    updateForm({...form, 
                        name: resPayload.name,
                        status:resPayload.status,
                        level_id:resPayload.level_id,  
                        reference:resPayload.reference                                                  
                    });
                    assigned_level = resPayload.level_id;
                    _getLevel(user,setlevelList);                     
                       
                    
                }else{
                    //_callback("failed-fetch") 
                }
            }else{
                if(records.remarks =="Bad Token"){
                    //_callback(records.remarks)                               
                }else{
                    //_callback(records.remarks)       
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

  function getAssignLevel(levels){
    var assigned = [];
    
    for (let index = 0; index < levels.length; index++) {
      if(assigned_level == (levels[index].value)){
        assigned.push({
            value:levels[index].value,
            label:levels[index].label,
        });
    }
        
    }

    updateForm({level_id:assigned})

}
  function handleSliderChange(e){
        
    if(e.target.checked){
        updateForm({ status: 1 })
    }
    else{
        updateForm({ status: 0 })
    }
}
  return (
    <>
      <div className="modal-body pt-0">
        <div className="nav-wrapper">
          {alertState}
        </div>
        <div className="container">

          <FormGroup>
            <label className="form-control-label">Name <span className="text-danger">*</span></label>
            <InputGroup>
              <Input
                type="text"
                id="name"
                value={form.name}
                onChange={
                  (e) => {
                    updateForm({ name: e.target.value }
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
                Level
              </label>  
                 
              <Select
          
                id="moduleDropdown"
                isClearable={false}
                defaultValue={form.level_id}
                value={form.level_id}
                onChange={(e) => handleSelectChange(e)}                    
                options={levelList}
              
            />
          </FormGroup>
                <br/> 
          <FormGroup className="mb-1 ">
            <label
                  className="form-control-label"
                  htmlFor="example-date-input"
                >
              Upload New Reference
            </label>  
            <Dropzones
              _maxfiles="1"
              _file_type={{ "application/pdf": [".pdf"] }}
              _pholder="Only PDF file type is supported"
              _response="Success"
              _fileCallback={setFile}
              _file_nameCallBack={setFilename}
            />
          </FormGroup>
          <FormGroup>
            <label className="form-control-label">Status <span className="text-danger">*</span></label>
            <InputGroup>

            <label class="custom-toggle custom-toggle-success">
            <Input
                type="checkbox"
                id="name"
                checked={form.status==1?true:false}
                onChange={(e) => handleSliderChange(e)}
                />
                <span class="custom-toggle-slider rounded-circle "></span>
                </label>
                <label><span className={form.status === 1 ? "text-success" : "text-danger"}>
                
            </span>{" "}
            {form.status=== 1 ? "Active" : "Inactive"}</label>
            </InputGroup>
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
            onClick={_state}
          >
            Close
          </Button>
          </div>
      </div>
    </>
  )


}

export default EditElement