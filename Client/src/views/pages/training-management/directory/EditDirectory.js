import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import { UserContext, _dataService } from "App";
import { Button, Row, Col, Alert } from "reactstrap";

// import Select2 from "react-select2-wrapper";
import Select from "react-select";

function EditDirectory({ _selectedData, _state, _callback }) {
  const { user, setUser } = useContext(UserContext);
  const [form, setForm] = useState({
    training_id: "",
    provider_id: null,
    trainings: null,
  });

  // set training and provider list
  const [alertState, setAlertState] = useState(null);
  const [trainingsList, setTrainingsList] = useState([]);
  const [providersList, setProvidersList] = useState([]);
  const [assigned_provid, setAssigned_provid] = useState([]);
  const params = useParams();
  if (_selectedData._id) {
    params.id = _selectedData._id;
  }
  useEffect(() => {
    _getRecords(user, setForm);
    return;
  }, [user.token != ""]);

  useEffect(() => {
    _getTrainingsList(user, setTrainingsList);
  }, [form.training_id != ""]);

  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

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
        window.base_api + `get_directory/${_selectedData._id}`,
        requestOptions,
        async (response) => {
          // Your response to manipulate
          const records = response;
          if (records.remarks == "success") {
            if (records.payload.result) {
              const resPayload = records.payload["result"][0];
              updateForm({
                ...form,
                name: resPayload.name,
                training: resPayload.training,
                training_id: resPayload.training[0]["_id"],
                provider_id: resPayload.provider.map((data) => ({
                  value: data._id,
                  label: data.name,
                })),
              });

              _getProviderList(
                user,
                setProvidersList,
                resPayload.provider,
                setAssigned_provid
              );
            } else {
              //_callback("failed-fetch")
            }
          } else {
            if (records.remarks == "Bad Token") {
              //_callback(records.remarks)
            } else {
              //_callback(records.remarks)
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
  async function _getProviderList(user, callback) {
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
        payload: { filter: { archive: 0, status: 1 } },
      };

      var requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      };

      _dataService.CRUD(
        window.base_api + `get_providers/`,
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
              //_callback(records.remarks);
            } else {
              //_callback(records.remarks);
              console.log("Error occured with message " + records.message);
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

  async function _getTrainingsList(user, callback) {
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
        payload: { filter: { archive: 0, status: 1 } },
      };

      var requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      };

      _dataService.CRUD(
        window.base_api + `get_trainings/`,
        requestOptions,
        async (response) => {
          // Your response to manipulate
          const records = response;
          if (records.remarks == "success") {
            if (records.payload.result.length > 0) {
              const resPayload = records.payload["result"];
              var result = resPayload
                .filter((word) => word._id === form.training_id)
                .map((data) => ({
                  value: data._id,
                  label: data.name,
                }));
              updateForm({ trainings: result });
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
              //_callback(records.remarks);
            } else {
              //_callback(records.remarks);
              console.log("Error occured with message " + records.message);
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
  
  async function onSubmit(e) {
    e.preventDefault();
    setAlertState(null);
    if (form.training_id == "" || form.provider_id.length == 0) {
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

    // When a post request is sent to the create url, we'll add a new record to the database.
    const _payload = {
      payload: { ...form },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };
    

    var requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_payload),
    };

    _dataService.CRUD(
      window.base_api + `update_directory/${params.id}`,
      requestOptions,
      async (response) => {
        // Your response to manipulate
        const records = response;
        if (records.remarks === "success") {
          setForm({
            training_id: "",
            provider_id: [],
          });
          _callback(`success_edit`, _selectedData.training[0].name);
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

  return (
    <>
      <div className="modal-body pt-3">
        {alertState}
        <div className="container">
          <Row>
            <Col xl="12">
              <p className="description font-weight-bold mb-2">
                Training
              </p>
              <Select
              components={{ DropdownIndicator:() => null, IndicatorSeparator:() => null }}
                closeMenuOnSelect={true}
                className="react-select-custom"
                classNamePrefix="react-select"
                isClearable={true}
                onChange={(e) => {updateForm({ trainings: e });updateForm({ training_id: e.value });}}
                value={form.trainings}
                options={trainingsList}
                isDisabled={true}
              />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col xl="12">
              <p className="description font-weight-bold mb-2">
                Provider
                <span className="text-danger"> *</span>
              </p>
              {console.log(assigned_provid)}
              <Select
                closeMenuOnSelect={false}
                id="moduleDropdown"
                isClearable={false}
                value={form.provider_id}
                isMulti
                onChange={(e) => {updateForm({ provider_id: e })}}
                options={providersList}
              />
            </Col>
          </Row>
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

export default EditDirectory;
