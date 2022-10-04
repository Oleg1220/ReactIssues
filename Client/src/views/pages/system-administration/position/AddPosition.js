import React, { useState, useContext, useEffect } from "react";
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
  ListGroup,
  Form,
  Row,
  Col,
} from "reactstrap";

import { UserContext, _dataService } from "App";
import xlsx from "xlsx/xlsx.js";
import ExcelReport from "components/ExportExcel/ExcelReport";
import Dropzones from "components/Dropzone/Dropzone";

import ReactExport from "react-data-export";
import Select from "react-select";
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

const fileTypes = ["xlsx", "xls"];

var count_use_effect = 0;

const AddPosition = (props) => {
  const { _state, _callback, _loctype_id, _loctype_list } = props;

  const { user, setUser } = useContext(UserContext);
  const [form, setForm] = useState({
    department_id: "",
    division_id: "",
    location_id: "",
    name: "",
    hierarchy: "",
    job_description: "",
    status: 1,
  });
  const [requiredInputs, setRequiredInputs] = useState([
    "department_id",
    "division_id",
    "location_id",
    "name",
    "hierarchy",
  ]);
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [alertState, setAlertState] = useState(null);
  const [locGroupList, setLocGroupList] = useState([]);
  const [divisionList, setDivisionList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [baseDepartmentList, setBaseDepartmentList] = useState([]);
  const [locList, setLocList] = useState([]);
  const [baseLocList, setBaseLocList] = useState([]);
  const [locationsList, setLocationList] = useState([]);
  const [jobDescPopup, setJobDescOpenModal] = useState(false);

  //Used for passing TemplateexcelData, data can be set by processExcel
  //Then because of useState when btn-excel is clicked passed data will also change
  const [TemplateExcelData, setTemplateExcelData] = useState([]);
  const [guideSheet, setguideSheet] = useState([]);

  useEffect(() => {
    if (tabsState.tabs == 1) {
      _getLocation(user, setLocList);
      _getDivision(user, setDivisionList);
      _getDepartments(user, setBaseDepartmentList);
    }
    return;
  }, [user.token != ""]);

  // These methods will update the state properties.
  function updateForm(value) {
    setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  var [fileAdd, setFileAdd] = useState(null);
  const [file_nameAdd, setFilenameAdd] = useState(null);

  const sanitizeFileName = (filename) => {
    // * filename variable should not include the extension.
    return filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  };
  const renameFile = (originalFile, newName) => {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  };
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
    _callback(`uploading`);

    setForm({
      ...form,
    });
    // When a post request is sent to the create url, we'll add a new record to the database.
    const _payload = {
      payload: { ...form },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };
    formdata.append("jsonData", JSON.stringify(_payload));
    console.log(fileAdd);

    var requestOptions = {
      method: "POST",
      body: formdata,
    };

    _dataService.CRUD(
      window.base_api + `positions/add`,
      requestOptions,
      async (response) => {
        // Your response to manipulate
        const records = response;
        if (records.remarks === "success") {
          setForm({
            department_id: "",
            division_id: "",
            location_id: "",
            name: "",
            hierarchy: "",
            job_description: "",
          });
          _callback(records.remarks);
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

  //#region Upload Batch
  const [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [file_name, setFilename] = useState(null);
  const handleFileChange = (event) => {
    console.log(event.target.files[0]);
    setFile(event.target.files[0]);
  };

  async function onUpload() {
    console.log(file);
    if (file == null) {
      setAlertState(
        <Alert color="danger">
          <span className="alert-inner--icon">
            <i class="fas fa-exclamation-triangle"></i>
          </span>{" "}
          <span className="alert-inner--text">
            <strong>Warning:</strong> Choose a file to upload when in batch
            mode.
          </span>
        </Alert>
      );
      return;
    }
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    reader.onload = async (e) => {
      /* Parse data */
      const bstr = e.target.result;
      const wb = xlsx.read(bstr, { type: rABS ? "binary" : "array" });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
      /* Update state */

      var index = 0;
      var collated_list = [];
      data.forEach((element) => {
        if (index == 0) {
        } else {
          if (element[0]) {
            if (element[0].toString().trim() != "") {
              var arrayed_loc = {
                name: element[0],
                location_name: element[1],
                department_name: element[2],
                hierarchy: element[3],
                status: element[4],
              };
              collated_list.push(arrayed_loc);
            }
          }
        }
        index++;
      });
      collated_list.shift();

      const token = user.token;
      const _user_id = user.admin_id;
      const _fullname = user.fullname;

      const batch_add = {
        auth: {
          token: token,
          _id: _user_id,
          _fullname: _fullname,
        },
        payload: {
          list: collated_list,
        },
      };
      console.log(batch_add);
      return;
      var requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batch_add),
      };

      _dataService.CRUD(
        window.base_api + `get_archive/loctypes/`,
        requestOptions,
        async (response) => {
          // Your response to manipulate
          const records = response;
          if (records.remarks == "success") {
            _callback(records.remarks);
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
              setBaseLocList(tmpLoc);
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
              console.log(resPayload)
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

  const handleDivisionChange = (e) => {
    if (typeof e.value !== "undefined") {
      updateForm({ division_id: e.value });
      _getDivisionDepartments(user, setDepartmentList, e.value);
    }
  };

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
              <FormGroup className="mb-2">
                <label className="form-control-label">
                  Name <span className="text-danger">*</span>
                </label>
                <InputGroup>
                  <Input
                    type="text"
                    id="name"
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
                  classNamePrefix="react-select"
                  defaultValue=""
                  onChange={(e) => updateForm({ location_id: e.value })}
                  options={locList}
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
                  <label className="form-control-label">
                    Upload Job Description
                  </label>
                  <Dropzones
                    _maxfiles="1"
                    _file_type={{ "application/pdf": [".pdf"] }}
                    _pholder="Only PDF file type is supported"
                    _response="Success"
                    _fileCallback={setFileAdd}
                    _file_nameCallBack={setFilenameAdd}
                  />
                </Col>
              </Row>
            </div>

            <div className="modal-footer mt-3">
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
            <Dropzones
              _maxfiles="1"
              _pholder="All .xlsx and .xls file types are supported."
              _response="Success"
              _fileCallback={setFile}
              _file_nameCallBack={setFilename}
            />

            <div className="modal-footer " >
              <ExcelReport
                id="btn-template-excel"
                btn_style="btn btn-primary d-none"
                file_name="Batch_Location_Template"
                data={TemplateExcelData}
                guide={guideSheet}
                sheet_name="Location"
              >
                Download Template
              </ExcelReport>
              <Button
                color="primary"
                type="button"
                onClick={(e) => processExcel(e)}
              >
                Download Template
              </Button>
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
  );

  function processExcel(e) {
    var requestOptions = {
      method: 'POST',
      body:JSON.stringify(
        {
          "key": "Q2FzeXNNb2RlY0FwaQ==",
          "payload":{
            "locations":baseLocList,
            "departments":baseDepartmentList,
          },
        } 
      )
    };
    
    _dataService.BlobFetch(window.download_api+`positions/download_excel_template_positions.php`,requestOptions, async (response,status)=>{        
      if ( response.size <=51) {  
        _callback("download-fail");
        return
      }

      // Your response to manipulate        
      var a = document.createElement("a");
      a.href = window.URL.createObjectURL(response);
      a.download = "Batch_Add_Positions_Template.xlsx";
      a.click();
    });
  }
};

export default AddPosition;
