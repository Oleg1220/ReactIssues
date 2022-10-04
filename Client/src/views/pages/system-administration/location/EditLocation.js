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

const EditLocation = (props) => {   

    const { _onCloseClick, _callback,_id } = props; 
    var _date= new Date();
    const current_date =  _date.getFullYear() + "-"+("0" + _date.getMonth()).slice(-2)+"-"+("0" + _date.getDate()).slice(-2);          
    _date.setFullYear( parseInt(_date.getFullYear()) + 1);      
    const ayear_date = _date.getFullYear() + "-"+("0" + _date.getMonth()).slice(-2)+"-"+("0" + _date.getDate()).slice(-2);
        
    const {user,setUser} = useContext(UserContext);
    const [form, setForm] = useState({
        loctype_id:"",
        location_groups_id:"",
        location_groups:"",    
        name: "",
        status: 1,
        modified_by: user.fullname,
        date_modified: "",
        license_start: current_date,
        license_end: ayear_date
    });    
    const [tabsState, setTabsState] = useState({ tabs: 1 });
    const [alertState, setAlertState] = useState(null);
    const [locGroupList, setLocGroupList] = useState([]);
    const [loctype, setloctype] = useState([]);

    useEffect(() => {
        _getRecords(user,setForm); 
        _getLocationGroup(user,setLocGroupList)   
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
            
            _dataService.CRUD(window.base_api+`get_location/${_id}`,requestOptions, async (response)=>{

                // Your response to manipulate
                const records =response;          
                switch (records.remarks) {
                    case "success":
                        if(records.payload.result){
                            const resPayload = records.payload["result"][0];                
                            console.log(resPayload);
                            setForm({...form, 
                                name: resPayload.name,
                                status:resPayload.status,
                                loctype_id:resPayload.loctype_id,
                                location_groups_id:resPayload.location_groups_id,  
                                location_groups:resPayload.location_groups.name,  
                                license_start: resPayload.license_start,
                                license_end: resPayload.license_end
    
                            });
                            
                        }else{
                            _callback("failed-fetch",form.name) 
                        }
                      break;
                    default:                       
                        _callback(records.remarks,form.name)                                  
                    break;
                  }                      
                
            });

        }
        else{
            if(count_use_effect >= 2){
                console.log("Missing credentials kindly logged in");
            }
        }
    }
    
    async function _getLocationGroup(user,callback){

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
            
          _dataService.CRUD(window.base_api+`get_active_location_groups/`,requestOptions, async (response)=>{
    
            // Your response to manipulate
            const records =response;              
            switch (records.remarks) {
                case "success":
                    if(records.payload.result.length > 0 ){
                        const resPayload = records.payload["result"];                
                        callback(resPayload.map(el=>{
                            return {
                                value: el._id,
                                label: el.name
                            }
                        }));
        
                        }else{
                        callback([]);
                        console.log("No records fetch");
                    }
                  break;
              
                default:

                    _callback(records.remarks,form.name);
                         
                  break;
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
                switch (records.remarks) {
                    case "success":
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
                      break;
                  
                    default:
                        _callback(records.remarks,form.name);
          
                      break;
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
        
        _dataService.CRUD(window.base_api+`update_location/${_id}`,requestOptions, async (response)=>{

            // Your response to manipulate
            const records =response;                 
            switch (records.remarks) {
                case "success":
                    setForm({
                        title: "",
                        description: "",
                        status: 1,
                        });                
                        // successAlert();
                        _callback(records.remarks,form.name);
                  break;                        
                default:
                    _callback(records.remarks,form.name);                    
                    break;
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

            <Row>                    
                <Col xl="12">

                    {/* <label className="form-control-label">Location Type<span className="text-danger">*</span></label>
                    <Select
                        className="react-select-custom"
                        classNamePrefix="react-select"
                        defaultValue=""
                        value={loctype.filter(function (option) {
                            return option.value === form.loctype_id;
                        })}
                        onChange={(e)=>{setForm({...form,loctype_id:e.value })}}
                        options={loctype}
                    /> */}
                </Col>
                
            </Row>
            <br/>
            {alertState}

            <FormGroup>
                
                <label className="form-control-label">Location Name<span className="text-danger">*</span></label>
                <InputGroup>
                <Input
                    type="text"
                    id="name"
                    value={form.name}
                    onChange={(e) => updateForm({ name: e.target.value })}
                />
                </InputGroup>
            </FormGroup>


            <Row>                    
                <Col xl="12">
                    <label className="form-control-label">Location Group<span className="text-danger"></span></label>
                    <Select
                        className="react-select-custom"
                        classNamePrefix="react-select"
                        defaultValue=""
                        value={locGroupList.filter(function (option) {
                            return option.value === form.location_groups_id;
                        })}
                        onChange={(e)=>{  setForm({...form,location_groups_id:e.value })}}
                        options={locGroupList}
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
                <span class="custom-toggle-slider rounded-circle ">
                
                </span>
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
                    defaultValue={form.license_start?form.license_start:current_date}                         
                    onChange={(e) =>
                        updateForm({ license_start: e.target.value })
                    }
                    value={form.license_start}                      
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
                    defaultValue={form.license_end?form.license_end:ayear_date}   
                    value={form.license_end}                      
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
    )
}

export default EditLocation