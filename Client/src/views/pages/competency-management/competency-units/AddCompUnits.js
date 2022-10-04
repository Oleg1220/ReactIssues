import React, { useState, useContext } from "react";
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
  Row,
  Col,
} from "reactstrap";

import { UserContext, _dataService } from "App";
import xlsx from "xlsx/xlsx.js";
import ExcelReport from "components/ExportExcel/ExcelReport";
import Dropzones from "components/Dropzone/Dropzone";

// import Select2 from "react-select2-wrapper";
import Select from "react-select";

const fileTypes = ["xlsx", "xls"];

const AddComptUnits = (props) => {
  const { _state, _callback,_loctype_id,_loctype_list} = props;
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    status: 1,
    modified_by: "",
    date_modified: "",
    reference:"",
    archive: 1,
  });

  const { user, setUser } = useContext(UserContext);
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [alertState, setAlertState] = useState(null);

  //Used for passing TemplateexcelData, data can be set by processExcel
  //Then because of useState when btn-excel is clicked passed data will also change
  const [TemplateExcelData, setTemplateExcelData] = useState([]);

  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }
  const sanitizeFileName = (filename) => {
    // * filename variable should not include the extension.
    return filename.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  };
  const renameFile = (originalFile, newName) => {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
      folder:"compUnits_reference"
    });
  };
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
    var formdata = new FormData();
    var newFileName = null;
    var _file;
    if (file != null) {
      var uniqidn = `_${Math.floor(1000 + Math.random() * 9000)}_${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      newFileName =
        sanitizeFileName(form.name) +
        uniqidn +
        "." +
        file[0].name.split(".").pop();
        _file = renameFile(file[0], newFileName);
      formdata.append("file", _file);
      formdata.append("newFileName", newFileName);
    } else {
      console.log(`No File Attached`);
    }


    setForm({ ...form, added_by: user.fullname, date_added: new Date() });
    // When a post request is sent to the create url, we'll add a new record to the database.
    const _payload = {
      payload: { ...form },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };
    formdata.append("jsonData", JSON.stringify(_payload));

    var requestOptions = {
      method: "POST",
      body: formdata
    };

    _dataService.CRUD(
      window.base_api + `comp_units/add`,
      requestOptions,
      async (response) => {
        // Your response to manipulate
        const records = response;

        if (records.remarks === "success") {
          setForm({
            name: "",
            expiration: null,
            type: "",
            level: "",
            doc_no: null,
            reference:"",
            status: "",
            fpath:"",
            modified_by: "",
            date_modified: "",
            archive: "",
          });
          console.log("Competency Unit Successfully Added");
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
            <strong>Warning:</strong> Fields with{" "}
            <span className="text-danger">*</span> are required.
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
              var arrayed_loc = { name: element[0] };
              collated_list.push(arrayed_loc);
            }
          }
        }
        index++;
      });

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

      var requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batch_add),
      };

      _dataService.CRUD(
        window.base_api + `provider/batch_add`,
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

  // Dummy data
  const options = [
    { value: "Jitcoin", label: "Jitcoin" },
    { value: "Badjit", label: "Badjit" },
    { value: "Sadjit", label: "Sadjit" },
    { value: "Yagjit", label: "Yagjit" },
    { value: "Lagjit", label: "Lagjit" },
    { value: "Cumjit", label: "Cumjit" },
    { value: "Jito", label: "Jito" },
    { value: "JagJo", label: "JagJo" },
  ];

  function updateForm(value) {
    setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  const handleChange = (e) => {
    console.log(e);
    // provid=e;
    if (typeof e.value !== "undefined") {
      updateForm({
        level: e.value,
      });
    }
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
                  Expiration{" "}
                  <span style={{ color: "#174278" }}>[in months]</span>
                </label>
                <InputGroup>
                  <Input
                    type="number"
                    id="expiration"
                    onChange={(e) => updateForm({ expiration: e.target.value })}
                  />
                </InputGroup>
              </FormGroup>
              <Row>
                <Col size="6">
                <input
                      class="type_radio"
                      type="radio"
                      value="Safety Critical"
                      name="type_radio"
                      onChange={(e) => updateForm({ type: e.target.value })}
                    />
                    <label
                      htmlFor="comp_type"
                    >
                      &nbsp;Safety Critical
                    </label>
                </Col>
                <Col size="6">
                    <input
                      class="type_radio"
                      type="radio"
                      value="Functional"
                      name="type_radio"
                      onChange={(e) => updateForm({ type: e.target.value })}
                    />
                    <label
                      htmlFor="comp_type"
                    >
                      &nbsp;Functional
                    </label>
                </Col>
              </Row>
              <FormGroup>
                <label className="form-control-label">
                  Level <span className="text-danger">*</span>
                </label>
                <Select
                  className="react-select-custom"
                  classNamePrefix="react-select"
                  onChange={(e) => {
                    handleChange(e);
                  }}
                  options={options}
                />
              </FormGroup>
              <FormGroup>
                <label className="form-control-label">
                  Document No. <span className="text-danger">*</span>
                </label>
                <InputGroup>
                  <Input
                    type="number"
                    id="email"
                    onChange={(e) => updateForm({ doc_no: e.target.value })}
                  />
                </InputGroup>
              </FormGroup>
              <FormGroup>
                <label className="form-control-label">
                  Upload Reference<span className="text-danger">*</span>
                </label>
                <Dropzones
                  _maxfiles="1"
                  _file_type={{ "application/pdf": [".pdf"] }}
                  _pholder="Only PDF file type is supported"
                  _response="Success"
                  _fileCallback={setFile}
                  _file_nameCallBack={setFilename}
                />
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
            <Dropzones
              _maxfiles="1"
              _pholder="All .xlsx and .xls file types are supported."
              _response="Success"
              _fileCallback={setFile}
              _file_nameCallBack={setFilename}
            />

            <div className="modal-footer">
              <ExcelReport
                id="btn-template-excel"
                btn_style="btn btn-primary d-none"
                file_name="Batch_Providers_Template"
                data={TemplateExcelData}
                sheet_name="Location Type"
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
    var template = [
      {
        columns: [
          {
            title: "",
            width: { wpx: 80 },
            style: {
              fill: { patternType: "solid", fgColor: { rgb: "FFCCEEFF" } },
            },
          },
          {
            title: "Location Type",
            width: { wpx: 80 },
            style: {
              fill: { patternType: "solid", fgColor: { rgb: "FFCCEEFF" } },
            },
          },
          {
            title: "",
            width: { wpx: 80 },
            style: {
              fill: { patternType: "solid", fgColor: { rgb: "FFCCEEFF" } },
            },
          },
        ],
        data: [],
      },
    ];
    for (let index = 0; index < 20; index++) {
      template[0].data.push([
        {
          value: "",
          style: {
            font: { sz: "12", bold: false },
            border: {
              top: { style: "thin", color: { rgb: "#1A0000" } },
              right: { style: "thin", color: { rgb: "#1A0000" } },
              bottom: { style: "thin", color: { rgb: "#1A0000" } },
              left: { style: "thin", color: { rgb: "#1A0000" } },
            },
          },
        },
      ]);
    }
    console.log(template);
    setTemplateExcelData(template);

    const btn = document.getElementById("btn-template-excel");

    setTimeout(() => {
      if (btn != null) {
        btn.click();
      }
    }, 1000);
  }
};

export default AddComptUnits;
