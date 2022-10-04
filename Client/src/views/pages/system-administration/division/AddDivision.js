import React, { useState,useContext } from "react";
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
  ListGroup
} from "reactstrap";

import { UserContext,_dataService } from "App";
import xlsx from "xlsx/xlsx.js"
import ExcelReport from "components/ExportExcel/ExcelReport";
import Dropzones from "components/Dropzone/Dropzone";
import CustButton from "components/Buttons/CustButton";

const fileTypes = ["xlsx", "xls"];


function AddDivision({ _state, _callback,_onCloseClick }){
  const [form, setForm] = useState({
    name: "",
    status: 1,
    added_by: "",
    date_added: "",
  });
  const {user,setUser} = useContext(UserContext);

  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [alertState, setAlertState] = useState(null);

  //Used for passing TemplateexcelData, data can be set by processExcel
  //Then because of useState when btn-excel is clicked passed data will also change
  const [TemplateExcelData, setTemplateExcelData] = useState([]);

  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }
  async function onSubmit(e) {
    e.preventDefault();
    e.target.disabled = true;
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
      
    _dataService.CRUD(window.base_api+`divisions/add`,requestOptions, async (response)=>{
      // Your response to manipulate
      const records =response;                
      e.target.disabled = false;
      switch (records.remarks) {
        case "success":
          setForm({
            name: "",
            description: "",
            status: 1,
          });
  
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

      //#Guidfield
      // field_name = header
      // for values just put the componentList for the dropdown
      var body= JSON.stringify(
        {
          "key": "Q2FzeXNNb2RlY0FwaQ==",
          "guideFields":[
            // {
            //   field_name:"Division",
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
        `divisions/download_excel_template_divisions.php`,
        body,
        "Batch_Add_division_Template",
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
      
      if(!file[0].name.includes("Batch_Add_division_Template")){
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
          //# this is for skipping row 1 and 2 which contains header and NOTE: texts          
          if(index==0 || index==1){
  
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
                    var status =element[1].toUpperCase()=="ACTIVE"?1:0;
                     //#archive is inserted in server side check_batch_record_exists
                    var _arrayed = {
                      name:name ,
                      status:status,
                      date_added: new Date(), 
                      added_by: user.fullname
                    };
                    //# add to collated_list to be send on server
                    collated_list.push(_arrayed); 
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
          
        _dataService.CRUD(window.base_api+`division/batch_add`,requestOptions, async (response)=>{
  
          // Your response to manipulate
          const records =response;      
          if(records.payload){
            //# Final checking for duplicate entry on server side
            //# if not yet added to existing names it will be pushed here
            records.payload.existing_records.forEach(element => {
              if(!existing_names.includes(element.name)){
                existing_names.push(element.name);
              }
            });
          }                                            
          if(records.remarks=="success"){  
                   
            var addtional_message = ""
            var prefix=""  
            if(existing_names.length > 0){
              var addtional_message = "Some Divisions are not added since they are already existing.";
              var prefix="Some ";
            }        

            var return_data =
            <>
            {prefix+"Divisions have been successfully added."}
            <br/>
            {addtional_message}
            </>
            _callback(records.remarks,return_data);

          }else{
            if(records.remarks =="Bad Token"){
              _callback(records.remarks);
            }else{
              _callback(records.remarks,"Divisions already exist.");
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
                  onChange={(e) => updateForm({ name: e.target.value })}
                />
              </InputGroup>
            </FormGroup>
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
  );


}

export default AddDivision