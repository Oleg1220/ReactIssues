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
import { UserContext,_dataService } from "App";
import CustButton from "components/Buttons/CustButton";

function EditDivision({ _id ,_state, _callback,_onCloseClick }){

  const [form, setForm] = useState({
    name: "",
    status: 1,
    modified_by: "test",
    date_modified: "date",
});

const {user,setUser} = useContext(UserContext);

const [tabsState, setTabsState] = useState({ tabs: 1 });
const [alertState, setAlertState] = useState(null);

useEffect(() => {
    _getRecords(user,setForm);    
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
        
    _dataService.CRUD(window.base_api+`get_divisions/${_id}`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
        if(records.remarks=="success"){
            
            if(records.payload.result){
                const resPayload = records.payload["result"];                
                console.log(resPayload);
                setForm({...form, name: resPayload.name,status:resPayload.status});
            }else{
                _callback("failed") 
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
        
    _dataService.CRUD(window.base_api+`update_divisions/${_id}`,requestOptions, async (response)=>{

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

      <div className="modal-body pt-0">
        <br/>
          <div className="container">
            <FormGroup>
              <label className="form-control-label">Name <span className="text-danger">*</span></label>
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
      </div>

      );
}

export default EditDivision