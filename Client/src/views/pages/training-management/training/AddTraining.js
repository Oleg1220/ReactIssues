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
  UncontrolledAlert,
  ListGroup,
  InputGroupAddon,
  InputGroupText,
  Row,
  Col,
} from "reactstrap";
import { UserContext } from "App";
import xlsx from "xlsx/xlsx.js";
import Dropzones from "components/Dropzone/Dropzone";
import ExcelReport from "components/ExportExcel/ExcelReport";

const _dataService = require("services/data.services");

function AddTraining({ _state, _callback }) {
  const { user, setUser } = useContext(UserContext);

  const [form, setForm] = useState({
    name: "",
    accreditation: "",
    description: "",
    validity: "",
    reference_number: "",
    syllabus: "",
    status : 1
  });
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [alertState, setAlertState] = useState(null);

  var [file, setFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [file_name, setFilename] = useState(null);
  const handleFileChange = (event) => {
    console.log(event.target.files[0]);
  };
  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

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

  //Used for passing TemplateexcelData, data can be set by processExcel
  //Then because of useState when btn-excel is clicked passed data will also change
  const [TemplateExcelData, setTemplateExcelData] = useState([]);
  const [guideSheet, setguideSheet] = useState([]);

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
  // This function will handle the submission.
  async function onSubmit(e) {
    e.preventDefault();
    setAlertState(null);

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
    var formdata = new FormData();
    var newFileName = null;
    if (file != null) {
      var uniqidn = `_${Math.floor(1000 + Math.random() * 9000)}_${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      newFileName =
        sanitizeFileName(form.name) +
        uniqidn +
        "." +
        file[0].name.split(".").pop();
      file = renameFile(file[0], newFileName);
      formdata.append("file", file);
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

    await fetch(window.base_api + "trainings/add", {
      method: "POST",
      body: formdata,
    })
      .then(async (response) => {
        const records = await response.json();
        if (records.remarks === "success") {
          _callback(records.remarks, form.name);
          setForm({
            title: "",
            description: "",
            status: 1,
          });
        } else {
          switch (records.remarks) {
            case "Bad Token":
              localStorage.removeItem("userData");
              setTimeout(() => {
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
      })
      .catch((error) => {
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
              <FormGroup className="mb-1">
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
                <label className="form-control-label">Accreditation</label>
                <InputGroup>
                  <Input
                    type="text"
                    id="accreditation"
                    onChange={(e) =>
                      updateForm({ accreditation: e.target.value })
                    }
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
              <p className="description font-weight-bold mb-2">
                Training Details
              </p>
              <div className="px-4">
                <FormGroup className="mb-1">
                  <label className="form-control-label">Description</label>
                  <InputGroup className="input-group-merge">
                    <Input
                      type="textarea"
                      id="description"
                      onChange={(e) =>
                        updateForm({ description: e.target.value })
                      }
                    />
                  </InputGroup>
                </FormGroup>
                <Row>
                  <Col xl="6">
                    <FormGroup className="mb-1">
                      <label className="form-control-label">
                        Validity in month(s)
                      </label>
                      <InputGroup>
                        <Input
                          type="number"
                          id="validity"
                          onChange={(e) =>
                            updateForm({ validity: e.target.value })
                          }
                        />
                      </InputGroup>
                    </FormGroup>
                  </Col>
                  <Col xl="6">
                    <FormGroup className="mb-1">
                      <label className="form-control-label">
                        Reference No.
                      </label>
                      <InputGroup>
                        <Input
                          type="text"
                          id="reference_number"
                          onChange={(e) =>
                            updateForm({ reference_number: e.target.value })
                          }
                        />
                      </InputGroup>
                    </FormGroup>
                  </Col>
                </Row>

                <label className="form-control-label">Upload Syllabus</label>
                <Dropzones
                  _maxfiles="1"
                  _file_type={{ "application/pdf": [".pdf"] }}
                  _pholder="Only PDF file type is supported"
                  _response="Success"
                  _fileCallback={setFile}
                  _file_nameCallBack={setFilename}
                />
              </div>
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

export default AddTraining;
