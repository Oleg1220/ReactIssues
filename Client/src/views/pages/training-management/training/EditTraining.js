import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import { UserContext } from "App";
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
import Dropzones from "components/Dropzone/Dropzone";
function EditTraining({ _selectedId, _state, _callback }) {
  const { user, setUser } = useContext(UserContext);

  const [form, setForm] = useState({
    name: "",
    accreditation: "",
    description: "",
    validity: "",
    reference_number: "",
    syllabus: "",
  });
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [alertState, setAlertState] = useState(null);

  var [file, setFile] = useState(null);
  var [fileName, setFilename] = useState(null);
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
    });
  };

  const params = useParams();
  const navigate = useNavigate();
  if (_selectedId) {
    params.id = _selectedId;
  }

  useEffect(() => {
    async function fetchData() {
      const id = params.id.toString();
      var token = `${user.token}`;
      var _user_id = `${user.admin_id}`;
      var _fullname = `${user.fullname}`;
      const payload = {
        payload: { ...form },
        auth: { token: token, _id: _user_id, _fullname: _fullname },
      };
      await fetch(window.base_api + `get_training/${params.id.toString()}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(async (response) => {
          // Your response to manipulate
          const records = await response.json();

          //console.log(records);
          if (records.remarks == "success") {
            if (records.payload != null) {
              const resPayload = records.payload["result"];
              setForm(resPayload);
            } else {
              //console.log("No records fetch");
              window.alert(`Record with id ${id} not found`);
            }
          } else {
            if (records.remarks == "Bad Token") {
              console.log("Token expired or mismatch");
              localStorage.removeItem("userData");
              setTimeout(() => {
                window.location.reload();
              }, 2500);
            } else {
              console.log("Error occured with message " + records.remarks);
            }
          }
        })
        .catch((error) => {
          var return_data = {
            message: "Something went wrong, System return " + error,
            payload: [],
            remarks: "error",
          };
          console.log(
            "Something went wrong, Server cannot be reach with returned error : " +
              error
          );
        });
    }

    fetchData();
    return;
  }, [params.id, navigate]);

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
      formdata.append("newFileName", newFileName);
      formdata.append("file", file);
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

    // Display the key/value pairs
    for (var pair of formdata.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }

    await fetch(window.base_api + "update_training/" + params.id, {
      method: "POST",
      body: formdata,
    })
      .then(async (response) => {
        const records = await response.json();
        if (records.remarks === "success") {
          _callback(`success_edit`, form.name);
          setForm({
            name: "",
            accreditation: "",
            description: "",
            validity: "",
            reference_number: "",
            syllabus: "",
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

  function handleSliderChange(e) {
    if (e.target.checked) {
      updateForm({ status: 1 });
    } else {
      updateForm({ status: 0 });
    }
  }
  return (
    <>
      <div className="modal-body pt-3">
        <div className="container">
          <FormGroup className="mb-1">
            <label className="form-control-label">
              Name <span className="text-danger">*</span>
            </label>
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
            <label className="form-control-label">Accreditation</label>
            <InputGroup>
              <Input
                type="text"
                id="accreditation"
                value={form.accreditation}
                onChange={(e) => updateForm({ accreditation: e.target.value })}
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
                  className={form.status === 1 ? "text-success" : "text-danger"}
                ></span>{" "}
                {form.status === 1 ? "Active" : "Inactive"}
              </label>
            </InputGroup>
          </FormGroup>
          <p className="description font-weight-bold mb-2">Training Details</p>
          <div className="px-4">
            <FormGroup className="mb-1">
              <label className="form-control-label">Description</label>
              <InputGroup className="input-group-merge">
                <Input
                  type="textarea"
                  id="description"
                  value={form.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
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
                      value={form.validity}
                      onChange={(e) => updateForm({ validity: e.target.value })}
                    />
                  </InputGroup>
                </FormGroup>
              </Col>
              <Col xl="6">
                <FormGroup className="mb-1 mt-1">
                  <label className="form-control-label">Reference No.</label>
                  <InputGroup>
                    <Input
                      type="text"
                      id="reference_number"
                      value={form.reference_number}
                      onChange={(e) =>
                        updateForm({ reference_number: e.target.value })
                      }
                    />
                  </InputGroup>
                </FormGroup>
              </Col>
            </Row>

            <label className="form-control-label">
              Upload Syllabus
              <br />
              <span className="text-danger">
                * Upload a file to replace currently uploaded
              </span>
            </label>
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
          <Button color="primary" type="button" onClick={(e) => onSubmit(e)}>
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
      </div>
    </>
  );
}

export default EditTraining;
