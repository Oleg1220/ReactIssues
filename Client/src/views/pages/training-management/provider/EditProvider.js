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
  Form,
} from "reactstrap";
function EditProvider({ _selectedId, _state, _callback }) {
  const { user, setUser } = useContext(UserContext);

  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
  });
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [alertState, setAlertState] = useState(null);

  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  function handleSliderChange(e) {
    if (e.target.checked) {
      updateForm({ status: 1 });
    } else {
      updateForm({ status: 0 });
    }
  }

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
      await fetch(window.base_api + `get_providers/${params.id.toString()}`, {
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
    form.name = form.name.trim();
    if (form.name == "") {
      setAlertState(
        <Alert color="danger">
          <span className="alert-inner--icon">
            <i className="fas fa-exclamation-triangle"></i>
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
    //console.log(count_use_effect);

    setForm({ ...form });
    // When a post request is sent to the create url, we'll add a new record to the database.
    const newPayload = {
      payload: { ...form },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };
    await fetch(window.base_api + "update_providers/" + params.id, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newPayload),
    })
      .then(async (response) => {
        const records = await response.json();

        if (records.remarks === "success") {
          setForm({
            name: "",
            email: "",
            address: "",
            phone: "",
            status: "",
            modified_by: "test",
            date_modified: new Date(),
          });
          console.log("Successfully Added");
          // successAlert();
          _callback(`success_edit`, form.name);
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
                  Status
            </label>
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
            </FormGroup>

          <p className="description font-weight-bold mb-2">Contact Details</p>
          <div className="px-4">
            <FormGroup className="mb-1">
              <label className="form-control-label">E-mail Address</label>
              <InputGroup className="input-group-merge">
                <Input
                  type="text"
                  id="email"
                  value={form.email}
                  onChange={(e) => updateForm({ email: e.target.value })}
                />
              </InputGroup>
            </FormGroup>
            <FormGroup className="mb-1">
              <label className="form-control-label">Address</label>
              <InputGroup className="input-group-merge">
                <Input
                  type="text"
                  id="address"
                  value={form.address}
                  onChange={(e) => updateForm({ address: e.target.value })}
                />
              </InputGroup>
            </FormGroup>
            <FormGroup className="mb-1">
              <label className="form-control-label">Telephone Number</label>
              <InputGroup className="input-group-merge">
                <Input
                  type="text"
                  id="phone"
                  value={form.phone}
                  onChange={(e) => updateForm({ phone: e.target.value })}
                />
              </InputGroup>
            </FormGroup>
          </div>
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
    </>
  );
}

export default EditProvider;
