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
import { UserContext } from "App";

function AddTrainingCategory({ _state, _callback }) {
  const { user, setUser } = useContext(UserContext);

  const [form, setForm] = useState({
    name: "",
    status: 1,
    archive: 0,
    modified_by: "test",
    date_modified: "date",
  });
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [alertState, setAlertState] = useState(null);

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
    //console.log(count_use_effect);

    setForm({ ...form });
    // When a post request is sent to the create url, we'll add a new record to the database.
    const _payload = {
      payload: { ...form },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };
    await fetch(window.base_api + "training_categories/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_payload),
    })
      .then(async (response) => {
        const records = await response.json();
        if (records.remarks === "success") {
          setForm({
            title: "",
            description: "",
            status: 1,
          });
          console.log("Location Type Successfully Added");
          // successAlert();
          _callback(records.remarks);
          // callback();
        } else {
          switch (records.remarks) {
            case "Bad Token":
              console.log("Token expired or mismatch");
              // localStorage.removeItem("userData");
              // setTimeout(() => {
              //   window.location.reload();
              // }, 2500);
              break;

            case "existing":
              _callback(records.remarks);
              break;
            default:
              console.log("Error occured with message " + records.remarks);
              break;
          }
        }
      })
      .catch((error) => {
        // var return_data = {
        //   message: "Something went wrong, System return " + error,
        //   payload: [],
        //   remarks: "error",
        // };
        console.log(
          "Something went wrong, Server cannot be reach with returned error : " +
            error
        );
      });
  }
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
          </TabPane>
          <TabPane tabId="tabs2">
          <div className="dropzone dropzone-multiple" id="dropzone-multiple">
          <div className="fallback">
            <div className="custom-file">
              <input
                className="custom-file-input"
                id="customFileUploadMultiple"
                type="file"
              />
              <label
                className="custom-file-label"
                htmlFor="customFileUploadMultiple"
              >
                Choose file
              </label>
            </div>
          </div>
          <ListGroup
            className=" dz-preview dz-preview-multiple list-group-lg"
            flush
          >

          </ListGroup>
            </div>

            <div className="modal-footer">
              <Button
                color="primary"
                type="button"
                onClick={(e) => onSubmit(e)}
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
  );
}

export default AddTrainingCategory;
