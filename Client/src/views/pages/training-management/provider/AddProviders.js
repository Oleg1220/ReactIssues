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

const fileTypes = ["xlsx", "xls"];




const AddPRoviders = ({ _state, _callback }) => {

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    status: 1,
    modified_by: "",
    date_modified: "",
    archive: 1,
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
      
    _dataService.CRUD(window.base_api+`providers/add`,requestOptions, async (response)=>{
      // Your response to manipulate
      const records =response;                

      if (records.remarks === "success") {
        _callback(records.remarks, form.name);
        setForm({
          name: "",
          email: "",
          address: "",
          phone: "",
          syllabus: "",
          status: "",
          modified_by: "",
          date_modified: "",
          archive: "",
        });
        console.log("Proider Successfully Added");
        // successAlert();
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
            console.log("Error occured with message " + records.remarks);
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
        `providers/download_excel_template_providers.php`,
        body,
        "Batch_Add_Providers_Template",
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
      
      if(!file[0].name.includes("Batch_Add_Providers_Template")){
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

  //#endregion

  const toggleTabs = (e, statesss, index) => {
    e.preventDefault();
    setTabsState({ tabs: index });
    // this.setState({
    //   [state]: index
    // });
  };


  function handleSliderChange(e) {
    if (e.target.checked) {
      updateForm({ status: 1 });
    } else {
      updateForm({ status: 0 });
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
                    id="email"
                    onChange={(e) => updateForm({ name: e.target.value })}
                  />
                </InputGroup>

                <FormGroup className="mt-2 mb--2">
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
                  <label className="pl-2">
                    <span
                      className={
                        form.status === 1 ? "text-success" : "text-danger"
                      }
                    ></span>{" "}
                    {form.status === 1 ? " Active" : " Inactive"}
                  </label>
                </InputGroup>
              </FormGroup>
                <label style={{marginTop:"20px"}} className="form-control-label">Contact Details</label>

                <div style={{marginLeft:"20px"}}>
                <label className="form-control-label">E-mail Address</label>
                <InputGroup>
                  <Input
                    type="text"
                    id="name"
                    onChange={(e) => updateForm({ email: e.target.value })}
                  />
                </InputGroup>
                <label className="form-control-label">Address </label>
                <InputGroup>
                  <Input
                    type="text"
                    id="name"
                    onChange={(e) => updateForm({ address: e.target.value })}
                  />
                </InputGroup>
                <label className="form-control-label">Telephone Number </label>
                <InputGroup>
                  <Input
                    type="text"
                    id="name"
                    placeholder=""
                    onChange={(e) => updateForm({ phone: e.target.value })}
                  />
                </InputGroup>
                </div>
              </FormGroup>
            </div>

            <div className="modal-footer">
              <Button
                color="primary"
                type="button"
                onClick={(e) => onSubmit(e)}
              >
                Add
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
              _pholder="All .xlsx and .xls file types are supported." 
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
  )


}

export default AddPRoviders