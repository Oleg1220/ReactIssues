import React, { useState, useContext, useEffect } from "react";
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
import Dropzones from "components/Dropzone/Dropzone";
import Select from "react-select";
// import Select2 from "react-select2-wrapper";

const _dataService = require("services/data.services");

function AddTraining({ _state, _callback }) {
  const { user, setUser } = useContext(UserContext);

  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    middlename: "",
    date_of_birth: "",
    nationality: "",
    address: "",
    home_number: "",
    work_number: "",
    personal_email: "",
    work_email: "",
    passport_number: "",
    passport_expiration: "",
    access_level_id: "62ddec406eaa1224152b8a57",
    username: "",
    password: "",
    company_id: "",
    location_id: "",
    department_id: "",
    position_id: "",
    with_promotion: "",
    joining_date: "",
    eval_date_from: "",
    eval_date_to: "",
  });
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [alertState, setAlertState] = useState(null);
  const [nationalityList, setNationalityList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [locationsList, setLocationsList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [positionsList, setPositionsList] = useState([]);
  const [accessLevelsList, setAccessLevelsList] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(`weak`);
  const [passwordLength, setPasswordLength] = useState(0);
  const [strengthClass, setStrengthClass] = useState({
    count: "",
    withNumber: "",
    withUppercase: "",
    withSpecialChar: "",
    startsWithNumber: "",
  });
  const [strengthErrMsg, setStrengthErrMsg] = useState({
    count: "At least 8 characters",
    withNumber: "A combination of letters and numbers",
    withUppercase: "A combination of uppercase and lowercase letters",
    withSpecialChar:"Inclusion of at least one special character, e.g., ! @ # $ % ^ & * ]",
    startsWithNumber:"Cannot start with a number"
  });

  const [strengthErrMsgOutput, setStrengthErrMsgOutput] = useState([]);
  const [show_password, setShow] = useState({
    showPassword: false,
  });

  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }
  function updateStrengthClass(value) {
    return setStrengthClass((prev) => {
      return { ...prev, ...value };
    });
  }
  // This function will handle the submission.
  async function onSubmit(e) {
    e.preventDefault();
    setAlertState(null);


    // ** Check if password criterias match
    if (strengthErrMsgOutput.length > 0 && form.password) {
      setAlertState(
        <Alert color="danger">
          <span className="alert-inner--icon">
            <i class="fas fa-exclamation-triangle"></i>
          </span>{" "}
          <span className="alert-inner--text">
            <strong>Warning:</strong> Please check your password.
          </span>
        </Alert>
      );
      return;
    }

    
    var token = `${user.token}`;
    var _user_id = `${user.admin_id}`;
    var _fullname = `${user.fullname}`;

    setForm({ ...form });
    console.log(form);
    return;

    // When a post request is sent to the create url, we'll add a new record to the database.
    const _payload = {
      payload: { ...form },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };

    await fetch(window.base_api + "crews/add", {
      method: "POST",
      body: JSON.stringify(_payload),
    })
      .then(async (response) => {
        const records = await response.json();
        if (records.remarks === "success") {
          setForm({
            title: "",
            description: "",
            status: 1,
          });
          _callback(records.remarks);
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
      })
      .catch((error) => {
        console.log(
          "Something went wrong, Server cannot be reach with returned error : " +
            error
        );
      });
  }

  const showPassword = (e) => {
    setShow({
      showPassword: !show_password.showPassword,
    });
  };
  //

  //** To be Used on Creating Crews */
  function StrengthChecker(PasswordParameter) {
    setPasswordLength(PasswordParameter.length);

    // The strong and weak password Regex pattern checker
    var validationCriteria = {
      count: new RegExp("(?=.{8,})"),
      withNumber: new RegExp("(?=.*[a-z])(?=.*[0-9])"),
      withUppercase: new RegExp("(?=.*[A-Z])"),
      withSpecialChar: new RegExp("(?=.*[!@#$%^&*])"),
      // startsWithNumber: new RegExp("^[a-zA-z][A-Za-z0-9]*$")
    };
    var errorCollection = [];
    for (const key in validationCriteria) {
      if (Object.hasOwnProperty.call(validationCriteria, key)) {
        const element = validationCriteria[key];
        if (element.test(PasswordParameter)) {
          updateStrengthClass({ [key]: "text-primary font-weight-700" });
        } else {
          errorCollection.push(strengthErrMsg[key]);
          updateStrengthClass({ [key]: "" });
        }
      }
    }
    var firstChar = PasswordParameter.charAt(0);
    if( firstChar <='9' && firstChar >='0') {
      errorCollection.push(strengthErrMsg['startsWithNumber']);
    } 
    setStrengthErrMsgOutput( PasswordParameter.length > 0 ? errorCollection : []);

    updateForm({ password: PasswordParameter });
  }
  useEffect(() => {
    _getNationality(user, setNationalityList);
    _getCompanies(user, setCompaniesList);
    _getLocations(user, setLocationsList);
    _getDepartments(user, setDepartmentsList);
    _getAccessLevels(user, setAccessLevelsList);
    return;
  }, [user.token != ""]);

  var count_use_effect = 0;
  const _getNationality = async (user, callback) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;

    if (token && token_creation) {
      const payload = {
        payload: {},
        auth: { token: token, _id: _user_id },
      };

      _dataService.CRUD(
        window.base_api + `get_nationalities`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
        async (records) => {
          if (records.remarks === "success") {
            if (records.payload != null) {
              const resPayload = records.payload["result"];
              callback(
                resPayload.map((data) => ({
                  value: data.nationality,
                  label: data.nationality,
                }))
              );
            } else {
              console.log("No records fetch");
            }
          } else {
            if (records.remarks === "Bad Token") {
              console.log("Token expired or mismatch");
              localStorage.removeItem("userData");
              setInterval(() => {
                window.location.reload();
              }, 2500);
            } else {
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
    console.log(`fetch data`);
  };

  var count_use_effect = 0;
  const _getCompanies = async (user, callback) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;

    if (token && token_creation) {
      const payload = {
        payload: {},
        auth: { token: token, _id: _user_id },
      };

      _dataService.CRUD(
        window.base_api + `get_companies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
        async (records) => {
          if (records.remarks === "success") {
            if (records.payload != null) {
              const resPayload = records.payload["result"];
              callback(
                resPayload.map((data) => ({
                  value: data._id,
                  label: data.name,
                }))
              );
            } else {
              console.log("No records fetch");
            }
          } else {
            if (records.remarks === "Bad Token") {
              console.log("Token expired or mismatch");
              localStorage.removeItem("userData");
              setInterval(() => {
                window.location.reload();
              }, 2500);
            } else {
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
    console.log(`fetch data`);
  };

  var count_use_effect = 0;
  const _getLocations = async (user, callback) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;

    if (token && token_creation) {
      const payload = {
        payload: { is_archived: 0 },
        auth: { token: token, _id: _user_id },
      };

      _dataService.CRUD(
        window.base_api + `get_loctypes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
        async (records) => {
          if (records.remarks === "success") {
            if (records.payload != null) {
              const resPayload = records.payload["result"];
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
              console.log("No records fetch");
            }
          } else {
            if (records.remarks === "Bad Token") {
              console.log("Token expired or mismatch");
              localStorage.removeItem("userData");
              setInterval(() => {
                window.location.reload();
              }, 2500);
            } else {
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
    console.log(`fetch data`);
  };

  var count_use_effect = 0;
  const _getDepartments = async (user, callback) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;

    if (token && token_creation) {
      const payload = {
        payload: { is_archived: 0 },
        auth: { token: token, _id: _user_id },
      };

      _dataService.CRUD(
        window.base_api + `get_departments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
        async (records) => {
          if (records.remarks === "success") {
            if (records.payload != null) {
              const resPayload = records.payload["result"];
              callback(
                resPayload.map((data) => ({
                  value: data._id,
                  label: data.name,
                }))
              );
            } else {
              console.log("No records fetch");
            }
          } else {
            if (records.remarks === "Bad Token") {
              console.log("Token expired or mismatch");
              localStorage.removeItem("userData");
              setInterval(() => {
                window.location.reload();
              }, 2500);
            } else {
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
    console.log(`fetch data`);
  };

  const loadPositions = async (value) => {
    _getDepartmentPositions(value, user, setPositionsList);
  };

  var count_use_effect = 0;
  const _getDepartmentPositions = async (value, user, callback) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;

    if (token && token_creation) {
      const payload = {
        payload: { is_archived: 0 },
        auth: { token: token, _id: _user_id },
      };

      _dataService.CRUD(
        window.base_api + `get_positions_by_department/${value}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
        async (records) => {
          if (records.remarks === "success") {
            if (records.payload != null) {
              const resPayload = records.payload["result"];
              console.log(resPayload);
              callback(
                resPayload.map((data) => ({
                  value: data._id,
                  label: data.name,
                }))
              );
            } else {
              console.log("No records fetch");
            }
          } else {
            if (records.remarks === "Bad Token") {
              console.log("Token expired or mismatch");
              localStorage.removeItem("userData");
              setInterval(() => {
                window.location.reload();
              }, 5000);
            } else {
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
    console.log(`fetch data`);
  };

  var count_use_effect = 0;
  const _getAccessLevels = async (user, callback) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;

    if (token && token_creation) {
      const payload = {
        payload: { is_archived: 0 },
        auth: { token: token, _id: _user_id },
      };

      _dataService.CRUD(
        window.base_api + `get_access_levels`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
        async (records) => {
          if (records.remarks === "success") {
            if (records.payload != null) {
              const resPayload = records.payload["result"];
              callback(
                resPayload.map((data) => ({
                  value: data._id,
                  label: data.name,
                }))
              );
            } else {
              console.log("No records fetch");
            }
          } else {
            if (records.remarks === "Bad Token") {
              console.log("Token expired or mismatch");
              localStorage.removeItem("userData");
              setInterval(() => {
                window.location.reload();
              }, 2500);
            } else {
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
    console.log(`fetch data`);
  };
  return (
    <>
      <div className="modal-body pb-0">
        <div className="container">
          {alertState}
          <Row>
            <Col xl="6">
              <p className="description font-weight-bold mb-2">
                Personal Information
              </p>
              <div className="px-4">
                <FormGroup className="mb-1 ">
                  <label className="form-control-label">
                    First name <span className="text-danger">*</span>
                  </label>
                  <InputGroup>
                    <Input
                      type="text"
                      id="name"
                      className=""
                      onChange={(e) =>
                        updateForm({ firstname: e.target.value })
                      }
                    />
                  </InputGroup>
                </FormGroup>
                <FormGroup className="mb-1 ">
                  <label className="form-control-label">
                    Middle name <span className="text-danger">*</span>
                  </label>
                  <InputGroup>
                    <Input
                      type="text"
                      id="name"
                      className=""
                      onChange={(e) =>
                        updateForm({ middlename: e.target.value })
                      }
                    />
                  </InputGroup>
                </FormGroup>
                <FormGroup className="mb-1 ">
                  <label className="form-control-label">
                    Last name <span className="text-danger">*</span>
                  </label>
                  <InputGroup>
                    <Input
                      type="text"
                      id="name"
                      className=""
                      onChange={(e) => updateForm({ lastname: e.target.value })}
                    />
                  </InputGroup>
                </FormGroup>
                <Row>
                  <Col xl="6">
                    <FormGroup className="mb-1 ">
                      <label
                        className="form-control-label"
                        htmlFor="example-date-input"
                      >
                        Date of Birth
                      </label>
                      <Input
                        className=""
                        defaultValue={new Date().getFullYear() + "-11-23"}
                        onChange={(e) =>
                          updateForm({ date_of_birth: e.target.value })
                        }
                        id="example-date-input"
                        type="date"
                      />
                    </FormGroup>
                  </Col>
                  <Col xl="6">
                    <FormGroup className="mb-1 ">
                      <label
                        className="form-control-label"
                        htmlFor="example-date-input"
                      >
                        Nationality
                      </label>
                      <Select
                        className="react-select-custom "
                        classNamePrefix="react-select "
                        defaultValue=""
                        onChange={(e) => updateForm({ nationality: e.value })}
                        options={nationalityList}
                      />
                      {/* <Select2
                        className=""
                        defaultValue="1"
                        options={{
                          placeholder: "Select",
                        }}
                        data={nationalityList}
                      /> */}
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup className="mb-1 ">
                  <label className="form-control-label">Home Address</label>
                  <InputGroup>
                    <Input
                      type="text"
                      id="name"
                      className=""
                      onChange={(e) => updateForm({ address: e.target.value })}
                    />
                  </InputGroup>
                </FormGroup>
                <Row>
                  <Col xl="6">
                    <FormGroup className="mb-1 ">
                      <label className="form-control-label">Home Tel</label>
                      <InputGroup>
                        <Input
                          type="text"
                          id="name"
                          className=""
                          onChange={(e) =>
                            updateForm({ home_number: e.target.value })
                          }
                        />
                      </InputGroup>
                    </FormGroup>
                  </Col>
                  <Col xl="6">
                    <FormGroup className="mb-1 ">
                      <label className="form-control-label">Work Tel</label>
                      <InputGroup>
                        <Input
                          type="text"
                          id="name"
                          className=""
                          onChange={(e) =>
                            updateForm({ work_number: e.target.value })
                          }
                        />
                      </InputGroup>
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup className="mb-1 ">
                  <label className="form-control-label">Personal Email</label>
                  <InputGroup>
                    <Input
                      type="text"
                      id="name"
                      className=""
                      onChange={(e) =>
                        updateForm({ personal_email: e.target.value })
                      }
                    />
                  </InputGroup>
                </FormGroup>
                <FormGroup className="mb-1 ">
                  <label className="form-control-label">
                    Work Email <span className="text-danger">*</span>
                  </label>
                  <InputGroup>
                    <Input
                      type="text"
                      id="name"
                      className=""
                      onChange={(e) =>
                        updateForm({ work_email: e.target.value })
                      }
                    />
                  </InputGroup>
                </FormGroup>
                <Row>
                  <Col xl="6">
                    <FormGroup className="mb-1 ">
                      <label className="form-control-label">Passport No.</label>
                      <InputGroup>
                        <Input
                          type="text"
                          id="name"
                          className=""
                          onChange={(e) =>
                            updateForm({ passport_number: e.target.value })
                          }
                        />
                      </InputGroup>
                    </FormGroup>
                  </Col>
                  <Col xl="6">
                    <FormGroup className="mb-1 ">
                      <label
                        className="form-control-label"
                        htmlFor="example-date-input"
                      >
                        Passport Expiration
                      </label>
                      <Input
                        className=""
                        defaultValue={new Date().getFullYear() + "-11-23"}
                        onChange={(e) =>
                          updateForm({ passport_expiration: e.target.value })
                        }
                        id="example-date-input"
                        type="date"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col xl="6">
              <p className="description font-weight-bold mb-2">
                Account Information
              </p>
              <div className="px-4">
                <FormGroup className="mb-1 ">
                  <label className="form-control-label">Username </label>
                  <InputGroup>
                    <Input
                      type="text"
                      id="name"
                      className=""
                      onChange={(e) => updateForm({ username: e.target.value })}
                    />
                  </InputGroup>
                </FormGroup>
                <FormGroup className="mb-1 ">
                  <label className="form-control-label">Password </label>
                  <InputGroup className="input-group-merge input-group-alternative">
                    <Input
                      type={show_password.showPassword ? "text" : "password"}
                      id="name"
                      className=""
                      onChange={(e) => {
                        StrengthChecker(e.target.value);
                      }}
                    />
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText
                        onClick={showPassword}
                        className="bg-default text-white"
                      >
                        <i
                          className={
                            show_password.showPassword
                              ? "fa fa-eye-slash"
                              : "fa fa-eye"
                          }
                        />
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>

                  <Col xs="12">
                    <div
                      className={`text-muted font-italic mb-1 text-right ${strengthClass.count}`}
                    >
                      <small className={strengthClass.count}>
                        {passwordLength}/8
                      </small>
                    </div>
                    <div className="mt--4">
                      {strengthErrMsgOutput.map((elem) => {
                        return(
                          <div class="text-muted font-italic mb-0 ">
                            <small className="text-danger">
                              {elem}
                            </small>
                          </div>
                        )
                      })}
                    </div>
                  </Col>
                </FormGroup>
              </div>
              <p className="description font-weight-bold mb-2 mt-2">
                Employment Information
              </p>
              <div className="px-4">
                <FormGroup className="mb-1 ">
                  <label
                    className="form-control-label"
                    htmlFor="example-date-input"
                  >
                    Company
                  </label>

                  <Select
                    className="react-select-custom "
                    classNamePrefix="react-select "
                    defaultValue=""
                    onChange={(e) => updateForm({ company_id: e.value })}
                    options={companiesList}
                  />
                  {/* <Select2
                    className=""
                    defaultValue="1"
                    options={{
                      placeholder: "Select",
                    }}
                    data={companiesList}
                  /> */}
                </FormGroup>
                <FormGroup className="mb-1 ">
                  <label className="form-control-label">Work Location </label>

                  <Select
                    className="react-select-custom "
                    classNamePrefix="react-select "
                    defaultValue=""
                    onChange={(e) => updateForm({ location_id: e.value })}
                    options={locationsList}
                  />
                  {/* <Select2
                    className=""
                    defaultValue="1"
                    options={{
                      placeholder: "Select",
                    }}
                    onChange={(e) => loadPositions(e.target.value)}
                    data={locationsList}
                  /> */}
                </FormGroup>
                <FormGroup className="mb-1 ">
                  <label className="form-control-label">Department </label>

                  <Select
                    className="react-select-custom "
                    classNamePrefix="react-select "
                    defaultValue=""
                    onChange={(e) => {
                      updateForm({ department_id: e.value });
                      loadPositions(e.value);
                    }}
                    options={departmentsList}
                  />
                </FormGroup>
                <FormGroup className="mb-1 ">
                  <label className="form-control-label">Position </label>

                  <Select
                    className="react-select-custom "
                    classNamePrefix="react-select "
                    defaultValue=""
                    onChange={(e) => updateForm({ position_id: e.value })}
                    options={positionsList}
                  />
                </FormGroup>
                <div
                  className="custom-control custom-checkbox mb-2"
                  style={{ zIndex: "0  " }}
                >
                  <input
                    className="custom-control-input"
                    id="customCheck1"
                    type="checkbox"
                    onChange={(e) =>
                      updateForm({ with_promotion: e.target.checked })
                    }
                  />
                  <label
                    className="custom-control-label"
                    htmlFor="customCheck1"
                  >
                    Tick if user can be promoted
                  </label>
                </div>
                <FormGroup className="mb-1 ">
                  <label
                    className="form-control-label"
                    htmlFor="example-date-input"
                  >
                    Joining Date
                  </label>
                  <Input
                    className=""
                    defaultValue={new Date().getFullYear() + "-11-23"}
                    onChange={(e) =>
                      updateForm({ joining_date: e.target.value })
                    }
                    id="example-date-input"
                    type="date"
                  />
                </FormGroup>
                <Row>
                  <Col xl="6">
                    <FormGroup className="mb-1 ">
                      <label
                        className="form-control-label"
                        htmlFor="example-date-input"
                      >
                        Evaluation Date From
                      </label>
                      <Input
                        className=""
                        defaultValue={new Date().getFullYear() + "-11-23"}
                        onChange={(e) =>
                          updateForm({ eval_date_from: e.target.value })
                        }
                        id="example-date-input"
                        type="date"
                      />
                    </FormGroup>
                  </Col>
                  <Col xl="6">
                    <FormGroup className="mb-1 ">
                      <label
                        className="form-control-label"
                        htmlFor="example-date-input"
                      >
                        Evaluation Date To
                      </label>
                      <Input
                        className=""
                        defaultValue={new Date().getFullYear() + "-11-23"}
                        onChange={(e) =>
                          updateForm({ eval_date_to: e.target.value })
                        }
                        id="example-date-input"
                        type="date"
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </div>
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

export default AddTraining;
