import React, { useState,useContext,useEffect } from "react";

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
  Col
} from "reactstrap";
import Select from "react-select";
import { UserContext, _dataService } from "App";
import CustButton from "components/Buttons/CustButton";


function EditDepartment(props){

  const { _state, _callback,_id,_onCloseClick } = props; 
    const {user,setUser} = useContext(UserContext);
    const [form, setForm] = useState({
      loctype_id:"",
      divisions_id:"",    
      divisions_name:"",
      name: "",
      status: 1,
      added_by: user.fullname,
      date_added: "",
    });  
    const [tabsState, setTabsState] = useState({ tabs: 1 });
    const [alertState, setAlertState] = useState(null);
    const [divisionList, setDivisionsList] = useState([]);

    const [loctype, setloctype] = useState([]);

    useEffect(() => {
        _getRecords(user,setForm); 
        _getDivisions(user,setDivisionsList)   
        _getLocationType(user,setloctype)
        return;
    }, [user.token!=""]);

    var count_use_effect=0;
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
            
            _dataService.CRUD(window.base_api+`get_departments/${_id}`,requestOptions, async (response)=>{

                // Your response to manipulate
                const records =response;                
                if(records.remarks=="success"){
                        
                    if(records.payload.result){
                        const resPayload = records.payload["result"][0];                
                        console.log(resPayload);
                        setForm({...form, 
                            name: resPayload.name,
                            status:resPayload.status,
                            loctype_id:resPayload.loctype_id,
                            divisions_id :resPayload.divisions_id,  
                            divisions_name:resPayload.divisions.name,  

                        });
                    }else{
                        _callback("failed-fetch") 
                    }
                }else{
                    if(records.remarks =="Bad Token"){
                        _callback(records.remarks)                               
                    }else{
                        _callback(records.remarks)       
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
    
    async function _getDivisions(user,callback){

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
            
          _dataService.CRUD(window.base_api+`get_active_divisions/`,requestOptions, async (response)=>{
    
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
                    callback(resPayload);
                    }else{
                    callback([]);
                    _callback("failed-fetch",form.name);
                    }
                }else{
                    if(records.remarks =="Bad Token"){
                    _callback(records.remarks);
                    }else{
                    _callback("failed-fetch",form.name);
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

    function selectDivisionOption(){
        divisionList.map(function(item, i){          
            if(item._id == form.divisions_id){
                var dropdown = document.getElementById("Divisions");
                dropdown.selectedIndex=i;            
            }
        })
    }

    function selectLocTypeOption(){
        loctype.map(function(item, i){          
            if(item._id == form.loctype_id){
                var dropdown = document.getElementById("locType");
                dropdown.selectedIndex=i;            
            }
        })
    }
    
  // These methods will update the state properties.
  function updateForm(value) {
    setDivisions()
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  function setDivisions(){
  
    var dropdown = document.getElementById("Divisions");
    var Divisions_id = dropdown.value;
    var Divisions_name =dropdown.options[dropdown.selectedIndex].text;

    setForm({...form,divisions_id:Divisions_id });
 
  }


    function setLocType(){
  
        var dropdown = document.getElementById("locType");
        var locType_id = dropdown.value;
       
    
        setForm({...form,loctype_id:locType_id });
     
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

        setForm({ ...form });
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
        
        _dataService.CRUD(window.base_api+`update_departments/${_id}`,requestOptions, async (response)=>{

            // Your response to manipulate
            const records =response;                
            if (records.remarks === "success") {
                setForm({
                title: "",
                description: "",
                status: 1,
                });
                console.log("Location Type Successfully Updated");
                // successAlert();
                _callback(records.remarks,form.name);
                // callback();
            } else {
                switch (records.remarks) {
                case "Bad Token":
                    _callback(records.remarks);
                    break;

                case "existing":
                    _callback(records.remarks,form.name);
                    break;
                default:
                    _callback("failed-fetch",form.name);
                    console.log("Error occured with message " + records.remarks);
                    break;
                }
            }
        });

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
        <div className="container">
          {/* <FormGroup>
            <label className="form-control-label">Location Type
            <span className="text-danger">*</span></label>
            <InputGroup>
              <select class="form-control" id="locType" onChange={(e)=> setLocType()}>

                  {
                      loctype.map(function(item, i){          
                      return (         
                          <option value={item._id}>{item.name} </option>
                      )
                  })
                  
                  }
                  { selectLocTypeOption()}

              </select>

            </InputGroup>
            
          </FormGroup> */}

          <br/>
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
          
          
             <Row>                    
                <Col xl="12">
                <label className="form-control-label">Division <span className="text-danger">*</span></label>                    
                <Select
                    className="react-select-custom"
                    classNamePrefix="react-select"
                    defaultValue=""
                    value={divisionList.filter(function (option) {
                        return option.value === form.divisions_id;
                    })}
                    onChange={(e)=>{setForm({...form,divisions_id:e.value })}}
                    options={divisionList}
                    />                    
                </Col>
            
            </Row>
            <br/>

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
            <CustButton
                _text="Update"
                _id={`modal_button_add`}
                _type="button"
                _color="primary"
                _icon="fas fa-sync"
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
    </>
    );
}

export default EditDepartment