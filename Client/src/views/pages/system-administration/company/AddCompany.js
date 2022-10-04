import React, { useState, useContext } from "react";
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
} from "reactstrap";
import { UserContext } from "App";
import Dropzones from "components/Dropzone/Dropzone";

const _dataService = require("services/data.services");

function AddCompany({ _state, _callback }) {
  const { user, setUser } = useContext(UserContext);

  const [form, setForm] = useState({
    name: "",
    status: 1,
  });
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [alertState, setAlertState] = useState(null);
  
  var [file, setFile] = useState(null);
  const [file_name, setFilename] = useState(null);
  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }
  
  // This function will handle the submission.
  async function onSubmit(e) {
    e.preventDefault();
    setAlertState(null);
    form.name = form.name.trim();

    if (form.name.trim() == "") {
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
    var token = `${user.token}`;
    var _user_id = `${user.admin_id}`;
    var _fullname = `${user.fullname}`;
    

    setForm({ ...form });
    // When a post request is sent to the create url, we'll add a new record to the database.
    const _payload = {
      payload: { ...form },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };

    _dataService.CRUD(
      window.base_api + "companies/add",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      },
      async (records) => {
        if (records.remarks === "success") {
          _callback(records.remarks,form.name);
          setForm({
            name: "",
            status: 1,
          });
        } else {
          switch (records.remarks) {
            case "Bad Token":
              localStorage.removeItem("userData");
              setInterval(() => {
                window.location.reload();
              }, 2500);
              break;

            case "existing":
              _callback(records.remarks);
              break;
            default:
              console.log("Error occured with message " + records.remarks);
              break;
          }
        }
      }
    );
  }
  const toggleTabs = (e, statesss, index) => {
    e.preventDefault();
    setTabsState({ tabs: index });
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
              {console.log(tabsState.tabs)}
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
              <FormGroup className="mb-3">
                <label className="form-control-label">
                  Name <span className="text-danger">*</span>
                </label>
                <InputGroup>
                  <Input
                    type="text"
                    id="name"
                    onChange={(e) => updateForm({ name: e.target.value })}
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
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
                  <label className=" pl-2">
                    <span
                      className={
                        form.status === 1 ? "text-success" : "text-danger"
                      }
                    ></span>{" "}
                    {form.status === 1 ? " Active" : " Inactive"}
                  </label>
                </InputGroup>
              </FormGroup>
            </div>

            <div className="modal-footer">
              <Button
                color="primary"
                type="button"
                onClick={(e) => onSubmit(e)}
              >
                <i class="fas fa-plus"></i> Add
              </Button>
              <Button
                color="secondary"
                data-dismiss="modal"
                type="button"
                onClick={_state}
              >
                <i class="fas fa-ban"></i> Cancel
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
              _downloadCallback={(e) => processExcel(e)}
            />

            <div className="modal-footer">
              <Button
                color="primary"
                type="button"
                onClick={(e) => onSubmit(e)}
              >
                <i class="fas fa-upload"></i> Upload
              </Button>
              <Button
                color="secondary"
                data-dismiss="modal"
                type="button"
                onClick={_state}
              >
              <i class="fas fa-ban"></i> Cancel
              </Button>
            </div>
          </TabPane>
        </TabContent>
      </div>
    </>
  );
  function processExcel(e) {
    var body= JSON.stringify(
      {
        "key": "Q2FzeXNNb2RlY0FwaQ==",
      } 
    )   
    
    _dataService.processExcel(
      `trainings/download_excel_template_trainings.php`,
      body,
      "Batch_Add_Location_Types_Template",
      (return_data)=>{          
        if(return_data.remarks!="success"){
          _callback("download-fail");
        }          
      }
    )
  }
}

export default AddCompany;
