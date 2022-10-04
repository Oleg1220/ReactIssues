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

const EditAction = (props) => {   

    const { _state, _callback,_id,_accessLevel,_moduleID,_section_id,_status } = props; 

   
    const {user,setUser} = useContext(UserContext);
    const [form, setForm] = useState({        
      name: "",
      status: _status,
      modified_by: user.fullname,
      date_modified: "",
    });    

    const [tabsState, setTabsState] = useState({ tabs: 1 });
    const [alertState, setAlertState] = useState(null);

    useEffect(() => {
        _getRecords(user,setForm); 
        updateForm({status: _status});
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
                payload:{access_level:_accessLevel,module_id:_moduleID} 
            };

            var requestOptions = {
                method: 'POST',
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify(_payload)
            };

            _dataService.CRUD(window.base_api+`get_al_actions/${_id}`,requestOptions, async (response)=>{

                // Your response to manipulate
                const records =response;                
                if(records.remarks=="success"){
                        
                    if(records.payload.result){
                        const resPayload = records.payload["result"][0];                
                        console.log(resPayload);
                        setForm({...form, 
                            name: resPayload.name,                                             
                        });
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

        
        // When a post request is sent to the create url, we'll add a new record to the database.
        const _payload = {
            payload: { ...form,action_id: _id, section_id: _section_id,access_level: _accessLevel,module_id: _moduleID },
            auth: { token: token, _id: _user_id, _fullname: _fullname },
        };


        var requestOptions = {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(_payload)
        };
        
        _dataService.CRUD(window.base_api+`update_al_actions/${_id}`,requestOptions, async (response)=>{

            // Your response to manipulate
            const records =response;                
            if (records.remarks === "success") {
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

    async function onRemove(e){
        var token = user.token;
        var _user_id = user.admin_id;
        var _fullname = user.fullname;
        //console.log(count_use_effect);

        setForm({ ...form });
        // When a post request is sent to the create url, we'll add a new record to the database.
        const _payload = {
            payload: { ...form,access_level:_accessLevel,module_id:_moduleID },
            auth: { token: token, _id: _user_id, _fullname: _fullname },
        };


        var requestOptions = {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(_payload)
        };
        
        _dataService.CRUD(window.base_api+`remove_al_Actions/${_id}`,requestOptions, async (response)=>{

            // Your response to manipulate
            const records =response;                
            if (records.remarks === "success") {
                setForm({
                title: "",
                description: "",
                status: 1,
                });
                // successAlert();
                _callback("deleted");
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
                    _callback("failed-delete");
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
                <label className="form-control-label">Action Name<span className="text-danger">*</span></label>
                <InputGroup>
                <Input
                    type="text"
                    id="name"
                    value={form.name}
                    onChange={(e) => updateForm({ name: e.target.value })}
                />
                </InputGroup>
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
    </>
    )
}

export default EditAction