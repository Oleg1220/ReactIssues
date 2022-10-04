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
} from "reactstrap";

function EditTrainingCategory({ _selectedId, _state, _callback }) {
  const { user, setUser } = useContext(UserContext);
  const [form, setForm] = useState({
    name: "",
    status: 1,
    modified_by: "test",
    date_modified: "date",
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
      await fetch(
        window.base_api + `get_training_category/${params.id.toString()}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      )
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
    await fetch(window.base_api + "update_training_category/" + params.id, {
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
            status: 1,
            modified_by: "test",
            date_modified: "date",
          });
          console.log(" Successfully Added");
          // successAlert();
          _callback(records.remarks + `_edit`);
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
        <div className="nav-wrapper">{alertState}</div>

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

export default EditTrainingCategory;
