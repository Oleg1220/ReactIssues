import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import { UserContext } from "App";
import {
  Alert,
  Button,
  FormGroup,
  Input,
  InputGroup,
} from "reactstrap";
const _dataService = require("services/data.services");
function EditCompany({ _selectedId, _state, _callback }) {
  const { user, setUser } = useContext(UserContext);

  const [form, setForm] = useState({
    name: "",
    status: "",
  });
  const [alertState, setAlertState] = useState(null);
 
  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
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
      await fetch(window.base_api + `get_company/${params.id.toString()}`, {
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
              setInterval(() => {
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
    if (form.name.trim() == "") {
      setAlertState(
        <Alert color="danger">
          <span className="alert-inner--icon">
            <i class="fas fa-exclamation-triangle"></i>
          </span>{" "}
          <span className="alert-inner--text ">
            <strong>Warning:</strong> Fields with * are required.
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
      window.base_api + "update_company/" + params.id,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      },
      async (records) => {
        if (records.remarks === "success") {
          _callback(`success_edit`,form.name);
          setForm({
            name: "",
            status: ""
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
        {alertState}
        <div className="container">
          <FormGroup className="mb-3">
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
              <label className="pl-1">
                <span
                  className={form.status === 1 ? "text-success" : "text-danger"}
                ></span>{" "}
                {form.status === 1 ? " Active" : " Inactive"}
              </label>
            </InputGroup>
          </FormGroup>
        </div>

        <div className="modal-footer">
          <Button color="primary" type="button" onClick={(e) => onSubmit(e)}>
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
      </div>
    </>
  );
}

export default EditCompany;
