import React, { useState, useContext, useEffect } from "react";
import {
  Alert,
  Button,
  FormGroup,
  Input,
  InputGroup,
  Row,
  Col,
} from "reactstrap";

import { UserContext, _dataService } from "App";
import Dropzones from "components/Dropzone/Dropzone";
import Select from "react-select";
import CustModal from "components/Modals/CustModal";

const EditPosition = ({ _id, _state, _callback }) => {
  const [form, setForm] = useState({
    department_id: "",
    division_id: "",
    location_id: "",
    name: "",
    hierarchy: "",
    job_description: "",
  });
  const [requiredInputs, setRequiredInputs] = useState([
    "department_id",
    "division_id",
    "location_id",
    "name",
    "hierarchy",
  ]);
  const [divisionList, setDivisionList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [baseDepartmentList, setBaseDepartmentList] = useState([]);
  const [locList, setLocList] = useState([]);
  const [jobUploadPopup, setJobUploadOpenModal] = useState(false);
  const [locationsList, setLocationList] = useState([]);
  const [jobDescPopup, setJobDescOpenModal] = useState(false);
  const [continueUpdate, setContinueUpdate] = useState(false);
  const { user, setUser } = useContext(UserContext);

  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [alertState, setAlertState] = useState(null);

  var [fileAdd, setFileAdd] = useState(null);
  const [file_nameAdd, setFilenameAdd] = useState(null);
  const renameFile = (originalFile, newName) => {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  };
  useEffect(() => {
    _getRecords(user, setForm);
    _getLocation(user, setLocList);
    _getDivision(user, setDivisionList);
    _getDepartments(user, setBaseDepartmentList);
    return;
  }, [user.token != ""]);

  const handleDivisionChange = (e) => {
    if (typeof e.value !== "undefined") {
      updateForm({ division_id: e.value });
      _getDivisionDepartments(user, setDepartmentList, e.value);
    }
  };
  var count_use_effect = 0;
  async function _getRecords(user, callback) {
    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;
    //console.log(count_use_effect);
    if (token && token_creation) {
      const _payload = {
        auth: {
          token: token,
          _id: _user_id,
        },
        payload: {},
      };

      var requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      };

      _dataService.CRUD(
        window.base_api + `get_positions/${_id}`,
        requestOptions,
        async (response) => {
          // Your response to manipulate
          const records = response;
          if (records.remarks == "success") {
            if (records.payload.result) {
              const resPayload = records.payload["result"];
              console.log(resPayload);

              _getDivisionDepartments(
                user,
                setDepartmentList,
                resPayload.division_id
              );
              callback(resPayload);
            } else {
              _callback("failed");
            }
          } else {
            if (records.remarks == "Bad Token") {
              _callback(records.remarks);
            } else {
              _callback(records.remarks);
            }
          }
        }
      );
    } else {
      if (count_use_effect >= 2) {
        console.log("Missing credentials kindly logged in");
      }
    }
  }

  var count_use_effect = 0;
  async function _getDivisionDepartments(user, callback, id) {
    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;
    if (token && token_creation) {
      const _payload = {
        auth: {
          token: token,
          _id: _user_id,
        },
        payload: { is_archived: 0 },
      };

      var requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      };

      _dataService.CRUD(
        window.base_api + `get_departments_byDivision/${id}`,
        requestOptions,
        async (response) => {
          // Your response to manipulate
          const records = response;
          if (records.remarks == "success") {
            if (records.payload.result.length > 0) {
              const resPayload = records.payload["result"];
              callback(
                resPayload.map((data) => ({
                  value: data._id,
                  label: data.name,
                }))
              );
            } else {
              callback([]);
              console.log("No records fetch");
            }
          } else {
            if (records.remarks == "Bad Token") {
              _callback(records.remarks);
            } else {
              _callback(records.remarks);
              console.log("Error occured with message " + records.remarks);
            }
          }
        }
      );
    } else {
      if (count_use_effect >= 2) {
        console.log("Missing credentials kindly logged in");
      }
    }
  }

  async function _getLocation(user, callback) {
    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;
    if (token && token_creation) {
      const _payload = {
        auth: {
          token: token,
          _id: _user_id,
        },
        payload: { is_archived: 0 },
      };

      var requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      };

      _dataService.CRUD(
        window.base_api + `get_loctypes/`,
        requestOptions,
        async (response) => {
          // Your response to manipulate
          const records = response;
          if (records.remarks == "success") {
            if (records.payload.result.length > 0) {
              const resPayload = records.payload["result"];
              var tmpLoc = [];
              resPayload.map((data) =>
                data.locations.map((locData) => {
                  tmpLoc.push(locData);
                })
              );
              setLocationList(tmpLoc);

              callback(
                resPayload.map((data) => ({
                  label: data.name,
                  options: data.locations.map((locData) => ({
                    label: locData.name,
                    value: locData._id,
                  })),
                }))
              );
            } else {
              callback([]);
              console.log("No records fetch");
            }
          } else {
            if (records.remarks == "Bad Token") {
              _callback(records.remarks);
            } else {
              _callback(records.remarks);
              console.log("Error occured with message " + records.remarks);
            }
          }
        }
      );
    } else {
      if (count_use_effect >= 2) {
        console.log("Missing credentials kindly logged in");
      }
    }
  }
  async function _getDivision(user, callback) {
    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;
    if (token && token_creation) {
      const _payload = {
        auth: {
          token: token,
          _id: _user_id,
        },
        payload: { is_archived: 0 },
      };

      var requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      };

      _dataService.CRUD(
        window.base_api + `get_divisions/`,
        requestOptions,
        async (response) => {
          // Your response to manipulate
          const records = response;
          if (records.remarks == "success") {
            if (records.payload.result.length > 0) {
              const resPayload = records.payload["result"];
              callback(
                resPayload.map((data) => ({
                  value: data._id,
                  label: data.name,
                }))
              );
            } else {
              callback([]);
              console.log("No records fetch");
            }
          } else {
            if (records.remarks == "Bad Token") {
              _callback(records.remarks);
            } else {
              _callback(records.remarks);
              console.log("Error occured with message " + records.remarks);
            }
          }
        }
      );
    } else {
      if (count_use_effect >= 2) {
        console.log("Missing credentials kindly logged in");
      }
    }
  }
  async function _getDepartments(user, callback) {
    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;
    if (token && token_creation) {
      const _payload = {
        auth: {
          token: token,
          _id: _user_id,
        },
        payload: { is_archived: 0 },
      };

      var requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      };

      _dataService.CRUD(
        window.base_api + `get_departments/`,
        requestOptions,
        async (response) => {
          // Your response to manipulate
          const records = response;
          if (records.remarks == "success") {
            if (records.payload.result.length > 0) {
              const resPayload = records.payload["result"];
              callback(resPayload);
            } else {
              callback([]);
              console.log("No records fetch");
            }
          } else {
            if (records.remarks == "Bad Token") {
              _callback(records.remarks);
            } else {
              _callback(records.remarks);
              console.log("Error occured with message " + records.remarks);
            }
          }
        }
      );
    } else {
      if (count_use_effect >= 2) {
        console.log("Missing credentials kindly logged in");
      }
    }
  }
  // These methods will update the state properties.
  function updateForm(value) {
    setForm((prev) => {
      return { ...prev, ...value };
    });
  }
  
  async function confirmOnSubmit(e){
    e.preventDefault();
    setAlertState(null);
    
    if (fileAdd != null) {
      toggleModalJobUpload();
    } else {
      onSubmit(e)
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setAlertState(null);
    form.name = form.name.trim();

    var requiredCounter = 0;
    for (const key in form) {
      if (Object.hasOwnProperty.call(form, key)) {
        const tmpValue = form[key];
        requiredCounter = requiredInputs.includes(key)
          ? tmpValue.trim() == ""
            ? requiredCounter + 1
            : requiredCounter
          : requiredCounter;
      }
    }
    if (requiredCounter != 0) {
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
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;

    // * Prep Form Data
    var formdata = new FormData();
    var newFileName = null;
    if (fileAdd != null) {
      var uniqidn = `JD_${Math.floor(1000 + Math.random() * 9000)}_${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      newFileName = uniqidn + "." + fileAdd[0].name.split(".").pop();
      fileAdd = renameFile(fileAdd[0], newFileName);
      formdata.append("file", fileAdd);
      formdata.append("newFileName", newFileName);
    } else {
      console.log(`No File Attached`);
    } 

    setForm({ ...form });
    // When a post request is sent to the create url, we'll add a new record to the database.
    const _payload = {
      payload: { ...form },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };
    formdata.append("jsonData", JSON.stringify(_payload));

    var requestOptions = {
      method: "POST",
      body: formdata,
    };
    _dataService.CRUD(
      window.base_api + `update_position/${_id}`,
      requestOptions,
      async (response) => {
        // Your response to manipulate
        const records = response;
        if (records.remarks === "success") {
          if (fileAdd != null) {
            toggleModalJobUpload();
          }
          setForm({
            title: "",
            description: "",
            status: 1,
          });
          
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
              _callback(records.remarks);
              break;
          }
        }
      }
    );
  }
  const setSelectedLocation = () => {
    var tmpFiltered = locList
      .map(function (option) {
        return option.options
          .filter(function (option2) {
            return option2.value === form.location_id;
          })
          .flat();
      })
      .filter(function (ele) {
        return ele.length > 0;
      })
      .flat();
    return tmpFiltered.length > 0 ? tmpFiltered[0] : tmpFiltered;
  };

  function handleSliderChange(e) {
    if (e.target.checked) {
      updateForm({ status: 1 });
    } else {
      toggleModalJobDesc(e, 1);
      // updateForm({ status: 0 });
    }
  }

  const toggleModalJobDesc = (e, id) => {
    setJobDescOpenModal(!jobDescPopup);
  };
  const toggleModalJobUpload = (e, id) => {
    setJobUploadOpenModal(!jobUploadPopup);
  };

  return (
    <>
      <div className="container mt-3">
        <FormGroup className="mb-2">
          <label className="form-control-label">
            Name <span className="text-danger">*</span>
          </label>
          <InputGroup>
            <Input
              type="text"
              id="name"
              value={form.name}
              onChange={(e) => {
                updateForm({ name: e.target.value });
              }}
            />
          </InputGroup>
        </FormGroup>
        <FormGroup className="mb-2">
          <label className="form-control-label">
            Location <span className="text-danger">*</span>
          </label>
          <Select
            className="react-select-custom"
            options={locList}
            classNamePrefix="react-select"
            value={setSelectedLocation()}
            onChange={(e) => updateForm({ location_id: e.value })}
          />
        </FormGroup>
        <FormGroup className="mb-2">
          <label className="form-control-label">
            Division <span className="text-danger">*</span>
          </label>
          <Select
            className="react-select-custom"
            classNamePrefix="react-select"
            defaultValue=""
            value={divisionList.filter(function (option) {
              return option.value === form.division_id;
            })}
            onChange={(e) => {
              handleDivisionChange(e);
            }}
            options={divisionList}
          />
        </FormGroup>

        <FormGroup className="mb-2">
          <label className="form-control-label">
            Department <span className="text-danger">*</span>
          </label>
          <Select
            className="react-select-custom"
            classNamePrefix="react-select"
            defaultValue=""
            value={departmentList.filter(function (option) {
              return option.value === form.department_id;
            })}
            onChange={(e) => {
              updateForm({ department_id: e.value });
            }}
            options={departmentList}
          />
        </FormGroup>
        <Row>
          <Col xl="4">
            <FormGroup className="mb-2">
              <label className="form-control-label">
                Hierarchy <span className="text-danger">*</span>
              </label>
              <InputGroup>
                <Input
                  type="text"
                  pattern="\d*"
                  maxlength="3"
                  id="hierarchy"
                  value={form.hierarchy}
                  onChange={(e) => {
                    updateForm({ hierarchy: e.target.value });
                  }}
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
                <label>
                  <span
                    className={
                      form.status === 1 ? "text-success" : "text-danger"
                    }
                  ></span>{" "}
                  {form.status === 1 ? "Active" : "Inactive"}
                </label>
              </InputGroup>
            </FormGroup>
          </Col>
          <Col xl="12">
              <div className="">
            <label className="form-control-label">Upload Job Description</label>
            <Dropzones
              _maxfiles="1"
              _file_type={{ "application/pdf": [".pdf"] }}
              _pholder="Only PDF file type is supported"
              _response="Success"
              _fileCallback={setFileAdd}
              _file_nameCallBack={setFilenameAdd}
            />
              </div>
          </Col>
        </Row>
      </div>

      <div className="modal-footer">
        <Button color="primary" type="button" onClick={(e) => confirmOnSubmit(e)}>
          <i class="fas fa-sync"></i> Update 
        </Button>
        <Button
          color="secondary"
          data-dismiss="modal"
          type="button"
          onClick={_state}
        >
        <i class="fas fa-ban"></i> Close
        </Button>
      </div>

      <CustModal
        _modalTitle="Deactivate Position"
        _modalId="confirmDeleteFile"
        _state={toggleModalJobDesc}
        _size="sm"
        _stateBool={jobDescPopup}
        _modalBg="bg-warning"
      >
        <div className="modal-body">
          <div className="text-center">
            <i class="fas fa-exclamation-triangle fa-3x text-warning"></i>
            <h2>Are you sure?</h2>
            <h3>
              Deactivating this position, will also deactivate users under it.
            </h3>
          </div>
        </div>
        <div className="modal-footer">
          <Button
            color="danger"
            type="button"
            onClick={async (e) => {
              updateForm({ status: 0 });
              toggleModalJobDesc();
            }}
          >
            Yes, Continue
          </Button>
          <Button
            color="secondary"
            data-dismiss="modal"
            type="button"
            onClick={toggleModalJobDesc}
          >
            Cancel
          </Button>
        </div>
      </CustModal>
      
      <CustModal
        _modalId="confirmUpdateFile"
        _state={setJobUploadOpenModal}
        _size="md"
        _stateBool={jobUploadPopup}
        _header={false}
      >
        <div className="modal-body">
          <div className="text-center">
            <div className="py-3"><i class="fas fa-exclamation-circle fa-5x text-warning"></i></div>
            <h2>Are you sure you want to update the uploaded <br /> Job Description?</h2>  
            <h5 className=" text-muted m-0">This process cannot be undone.</h5>
          </div>
        </div>
        <div className="modal-footer justify-content-center">
          <Button color="warning" type="button" onClick={(e) => onSubmit(e)}>
            <i className="fas fa-trash"> </i><span>Yes</span>
          </Button>
          <Button
            color="secondary"
            data-dismiss="modal"
            type="button"
            onClick={toggleModalJobUpload}
          >
            <i className="fas fa-ban"> </i><span>No</span>
          </Button>
        </div>
      </CustModal>
    </>
  );
};

export default EditPosition;
