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
  ListGroup
} from "reactstrap";
import { UserContext, _dataService } from "App";
import Select from "react-select";
const EditLocation = (props) => {   

    const { _state, _callback,_id,_onCloseClick } = props; 
    const {user,setUser} = useContext(UserContext);
    const [form, setForm] = useState({  
      name: "",
      loctype:[],
      status: 1,
      heirarchy:1,
      modified_by: user.fullname,
      date_modified: "",
    });    
    const [tabsState, setTabsState] = useState({ tabs: 1 });
    const [alertState, setAlertState] = useState(null);
    const [locGroupList, setLocGroupList] = useState([]);
    var  [locTypeList, setloctype] = useState([]);
    var assigned_loc =[];
    useEffect(() => {
        _getRecords(user,setForm);          
      
       
        return;
    }, [user.token!=""]);

    const [, updateState] = useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);
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
            
            _dataService.CRUD(window.base_api+`get_access_levels/${_id}`,requestOptions, async (response)=>{

                // Your response to manipulate
                const records =response;                
                if(records.remarks=="success"){
                        
                    if(records.payload.result){
                        const resPayload = records.payload["result"][0];                
                        
                        updateForm({...form, 
                            name: resPayload.name,
                            status:resPayload.status,
                            heirarchy:resPayload.heirarchy,                                                    
                        });
                                              
                        assigned_loc = resPayload.assigned_loctypes;
                        _getLocationType(user,setloctype)
                        
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
                        callback(resPayload.map((data) => ({
                            value: data._id,
                            label: data.name,
                        })));
                        getAssignLocType(resPayload);
                    }else{
                    callback([]);
                    console.log("No records fetch");
                    }
                }else{
                    if(records.remarks =="Bad Token"){
                    //_callback(records.remarks);
                    }else{
                    //_callback(records.remarks);
                    console.log("Error occured with message "+records.message);
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
    function getAssignLocType(loctypes){
        var assigned = [];
        
       
        for (let index = 0; index < loctypes.length; index++) {
            if(Array.isArray(assigned_loc)){

                if(assigned_loc.includes(loctypes[index]._id)){
                    assigned.push({
                        value:loctypes[index]._id,
                        label:loctypes[index].name,
                    });
                }
            }
            
        }
    
        updateForm({loctype:assigned})

    }
    function handleSelectChange(e){
        if(e){
          console.log(e)
          if(e.value!=""){
            updateForm({ loctype: e })

          }
           
        }
        else{
            updateForm({ loctype_id: [] })
   
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
        
        _dataService.CRUD(window.base_api+`update_access_levels/${_id}`,requestOptions, async (response)=>{

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
        <FormGroup>
            <label className="form-control-label">Heirarchy <span className="text-danger">*</span></label>
            <InputGroup>
                <Input
                type="text"
                id="heirarchy"
                value={form.heirarchy}
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
            Location Types  <span className="text-danger">*</span>
            </label>
        
            <Select
                    closeMenuOnSelect={false}
                    id="moduleDropdown"
                    isClearable={false}
                    defaultValue={form.loctype}
                    value={form.loctype}
                    isMulti
                    onChange={(e) => handleSelectChange(e)}                    
                    options={locTypeList}
                   
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
                onClick={_onCloseClick}
            >
                Close
            </Button>
        </div>
    </>
    )
}

export default EditLocation