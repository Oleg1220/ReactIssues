import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import { UserContext, _dataService } from "App";
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
  Form,
  Container,
} from "reactstrap";

// import Select2 from "react-select2-wrapper";
import Select from "react-select";

// import dropzone from Dropzone
import Dropzones from "components/Dropzone/Dropzone";

function EditCompUnits({ _selectedId, _state, _callback }) {
  const [CompUnitsList, setCompUnits] = useState([]);
  const { user, setUser } = useContext(UserContext);
  const [alertState, setAlertState] = useState(null);

  const params = useParams();
  if (_selectedId) {
    params.id = _selectedId;
  }

  const [form, setForm] = useState({
    name: "",
    expiration: null,
    type: "",
    level: "",
    doc_no: null,
    modified_by: "",
    date_modified: "",
  });

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

  function handleSliderChange(e) {
    if (e.target.checked) {
      updateForm({ status: 1 });
    } else {
      updateForm({ status: 0 });
    }
  }
  const handleSelectChange = (e) => {
    console.log(e);
    // provid=e;
    if (typeof e.value !== "undefined") {
      updateForm({
        level: e.value,
      });
    }
  };

  useEffect(() => {
    _getCompUnitDetails(user, setCompUnits);
    return;
  }, [user.token != ""]);

  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }
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

  async function _getCompUnitDetails() {
    const id = params.id.toString();
    var token = `${user.token}`;
    var _user_id = `${user.admin_id}`;
    var _fullname = `${user.fullname}`;
    const payload = {
      payload: { ...form },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };
    await fetch(window.base_api + `_get_comp_units/${params.id.toString()}`, {
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
            }, 5000);
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
    
    _dataService.CRUD(window.base_api+`update_compUnits/${_selectedId}`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
        if (records.remarks === "success") {
            setForm({
              name: "",
              expiration: null,
              type: "",
              level: "",
              reference: "",
              doc_no: null,
              modified_by: "",
              date_modified: "",
            });
            console.log("Competency Units Updated");
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

  return (
    <>
      <div className="modal-body pt-3">
        <div className="container">
          <FormGroup>
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
            <label className="form-control-label">
              Expiration <span style={{ color: "#174278" }}>[in months]</span>
            </label>
            <InputGroup>
              <Input
                type="number"
                id="expiration"
                value={form.expiration}
                onChange={(e) => updateForm({ expiration: e.target.value })}
              />
            </InputGroup>
          </FormGroup>
          <InputGroup>
              <label class="custom-toggle custom-toggle-success">
                <Input
                  type="checkbox"
                  id="status"
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
          <Row>
            <Col size="6">
              <input
                class="type_radio"
                type="radio"
                value="Safety Critical"
                name="type_radio"
                checked={form.type == "Safety Critical" ? true : false}
                onChange={(e) => updateForm({ type: e.target.value })}
              />
              <label htmlFor="comp_type">&nbsp;Safety Critical</label>
            </Col>
            <Col size="6">
              <input
                class="type_radio"
                type="radio"
                value="Functional"
                name="type_radio"
                checked={form.type == "Functional" ? true : false}
                onChange={(e) => updateForm({ type: e.target.value })}
              />
              <label htmlFor="comp_type">&nbsp;Functional</label>
            </Col>
          </Row>
          <FormGroup>
            <label className="form-control-label">
              Level <span className="text-danger">*</span>
            </label>
            <Select
              closeMenuOnSelect={true}
              id="moduleDropdown"
              isClearable={false}
              defaultValue={form.level}
              onChange={(e) => handleSelectChange(e)}
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
                value={form.doc_no}
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
              _pholder="Only PDF file type is supported."
              _response="Success"
              // _fileCallback={setFile}
              // _file_nameCallBack={setFilename}
              _file_type=".pdf"
            />
          </FormGroup>
        </div>
      </div>
      <div className="modal-footer">
        <Button color="primary" type="button"
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
  );
}

export default EditCompUnits;
