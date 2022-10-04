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
import ReactBSAlert from "react-bootstrap-sweetalert";
import { UserContext,_dataService  } from "App";
import CustButton from "components/Buttons/CustButton";

function EditLocGroup(props){ 
  const { _id ,_state, _callback,_onCloseClick } = props;
  const [form, setForm] = useState({
    name: "",
    status: 1,
    deactivate_locations:false,
    deactivate_Users:false,
    modified_by: "test",
    date_modified: "date",
  });

  const {user,setUser} = useContext(UserContext);

  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [alertState, setOpenAlert] = useState(null);
  const [deactivateLocations, setdeactivateLocations] = useState(false);
  const [deactivateUsers, setdeactivateUsers] = useState(false);

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
          
        _dataService.CRUD(window.base_api+`get_location_groups/${_id}`,requestOptions, async (response)=>{
  
          // Your response to manipulate
          const records =response;             
          switch (records.remarks) {
            case "success":
                if(records.payload.result){                               
                    const resPayload = records.payload["result"];                
               
                    setForm({...form, name: resPayload.name,status:resPayload.status});
                    
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

 
  async function onSubmit(e) {
    e.preventDefault();
    setOpenAlert(null);
    form.name = form.name.trim();
    if (form.name == "") {
      setOpenAlert(
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

    var _payload = {
        payload: { ...form },
        auth: { token: token, _id: _user_id, _fullname: _fullname },
    };
    if(form.status ==0){
      var _payload = {
        payload: { ...form,deactivate_locations:deactivateLocations,deactivate_Users:deactivateUsers },
        auth: { token: token, _id: _user_id, _fullname: _fullname },
      };
    }

    // When a post request is sent to the create url, we'll add a new record to the database.
    var requestOptions = {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_payload)
    };
      
    _dataService.CRUD(window.base_api+`update_location_groups/${_id}`,requestOptions, async (response)=>{
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

  //#region Event Listener

    // These methods will update the state properties.
    function updateForm(value) {
      return setForm((prev) => {
          return { ...prev, ...value };
      });
    }

    function handleSliderChange(e){
          
        if(e.target.checked){
            updateForm({ status: 1 })
            setdeactivateLocations(false)
            setdeactivateUsers(false)
        }
        else{
            //div.style.backgroundColor = null;
            setdeactivateLocations(true);
            setdeactivateUsers(true)
          updateForm({ status: 0 })
        }
    }

    function handleLocationSlider(e){
        
        if(e.target.checked){
            setdeactivateLocations(true)
            setdeactivateUsers(true)
        }
        else{
            //div.style.backgroundColor = null;
            setdeactivateLocations(false)
            setdeactivateUsers(false)
        }
    }

    function handleUserSlider(e){
        
        if(e.target.checked){
            setdeactivateUsers(true)
        }
        else{
            //div.style.backgroundColor = null;
            setdeactivateUsers(false)
        }
    }

  //#endregion

  const hideAlert = () => {
    setOpenAlert(null);
  };
  return (
    <>
      <div className="container">
        
        <FormGroup>
        <br/>
        {alertState}
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
        {
          form.status=== 0 ?
          <FormGroup>          
            <label className="form-control-label">Deactivate Assigned Locations <span className="text-danger">*</span></label>
            <InputGroup>

            <label class="custom-toggle custom-toggle-danger">
            <Input
                type="checkbox"
                id="name"
                checked={deactivateLocations}
                onChange={(e) => handleLocationSlider(e)}
              />
              <span class="custom-toggle-slider rounded-circle "></span>
              </label>
              <label>
                {deactivateLocations? "" : ""}</label>
            </InputGroup>
          </FormGroup>
          :null
        }
        {
          deactivateLocations ?
          <FormGroup>          
            <label className="form-control-label">Deactivate Users Assigned on  Locations <span className="text-danger">*</span></label>
            <InputGroup>

            <label class="custom-toggle custom-toggle-danger">
            <Input
                type="checkbox"
                id="name"
                checked={deactivateUsers}
                onChange={(e) => handleUserSlider(e)}
              />
              <span class="custom-toggle-slider rounded-circle "></span>
              </label>
              <label>
                {deactivateUsers? "" : ""}</label>
            </InputGroup>
          </FormGroup>
          :null
        }
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

export default EditLocGroup