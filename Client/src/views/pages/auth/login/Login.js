/*!

=========================================================
* Argon Dashboard PRO React - v1.2.1
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-pro-react
* Copyright 2021 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { UserContext } from "App";

// nodejs library that concatenates classes
import classnames from "classnames";
// reactstrap components
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Col,
  Alert,
} from "reactstrap";
// core components
import AuthHeader from "components/Headers/AuthHeader.js";
import ReactBSAlert from "react-bootstrap-sweetalert";

function Login() {
  const [focusedEmail, setfocusedEmail] = React.useState(false);
  const [focusedPassword, setfocusedPassword] = React.useState(false);
  const [openAlert, setOpenAlert] = useState(null);

  const [details, setDetails] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const { user, setUser } = useContext(UserContext);
  const [alertState, setAlertState] = useState(``);
  const [passwordStrength, setPasswordStrength] = useState(`weak`);
  const [strengthClass, setStrengthClass] = useState(`text-danger`);

  const navigate = useNavigate();
  const location = useLocation();

  //SHOW HIDE PASSWORD
  const [show_password, setShow] = useState({
    showPassword: false,
  });

  const showPassword = (e) => {
    setShow({
      showPassword: !show_password.showPassword,
    });
  };
  //

  const hideAlert = () => {
    setOpenAlert(null);
  };

  //** To be Used on Creating Crews */
  function StrengthChecker(PasswordParameter) {
    // The strong and weak password Regex pattern checker
    let strongPassword = new RegExp(
      "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
    );
    let mediumPassword = new RegExp(
      "((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,}))|((?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,}))"
    );

    // We then change the badge's color and text based on the password strength
    if (strongPassword.test(PasswordParameter)) {
      setPasswordStrength("Strong");
      setStrengthClass("text-success");
    } else if (mediumPassword.test(PasswordParameter)) {
      setPasswordStrength("Medium");
      setStrengthClass("text-warning");
    } else {
      setPasswordStrength("Weak");
      setStrengthClass("text-danger");
    }
  }
  const invalidCredentials = () => {
    setOpenAlert(
      <ReactBSAlert
        warning
        style={{ display: "block", marginTop: "-100px" }}
        title="Warning"
        onConfirm={() => hideAlert}
        onCancel={() => hideAlert}
        confirmBtnBsStyle="warning"
        confirmBtnText="Ok"
        btnSize=""
      >
        Invalid Crendentials
      </ReactBSAlert>
    );
    return;
  };
  //#region
  //LOGIN PART
  async function LoginCred(e, details) {
    e.preventDefault();

    if (details.password.trim() == "" || details.username.trim() == "") {
      setAlertState(
        <Alert color="danger">
          <span className="alert-inner--icon">
            <i class="fas fa-exclamation-triangle"></i>
          </span>{" "}
          <span className="alert-inner--text">
            <strong>Warning:</strong> All fields are required.
          </span>
        </Alert>
      );
      return;
    }
    await fetch(window.base_api + "login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(details),
    })
      .then(async (response) => {
        // Your response to manipulate
        const records = await response.json();

        if (records.remarks == "success") {
          if (records.token != "") {
            setAlertState("Login");
            const payload = records.payload[0];
            await setUser({
              loggedIn: true,
              fullname: payload.ulname + ", " + payload.ufname,
              ulname: payload.ulname,
              ufname: payload.ufname,
              admin_id: payload._id,
              email: payload.work_email,
              access_level: payload.access_level,
              rank: payload.rnk_id,
              tl_id: payload.tl_id,
              token: records.token,
              token_creation: new Date(),
            });
            await localStorage.setItem("userData", btoa(JSON.stringify(user)));
            if (location.state) {
              navigate(location.state.from);
              document.body.classList.remove("bg-secondary2");
            } else {
              navigate("/admin/dashboard");
              document.body.classList.remove("bg-secondary2");
            }
          } else {
            setAlertState(
              <Alert color="danger">
                <span className="alert-inner--icon">
                  <i class="fas fa-exclamation-triangle"></i>
                </span>{" "}
                <span className="alert-inner--text">
                  <strong>Warning:</strong> Invalid Credentials
                </span>
              </Alert>
            );
            return;
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
  //
  //#endregion
  document.body.classList.add("bg-secondary2");
  return (
    <>
      <AuthHeader title="" lead="" />
      <Container className="mt--9 pb-5">
        <Row className="justify-content-center">
          <Col lg="5" md="7">
            <Card
              className="bg-secondary border-0 mb-0"
              style={{ boxShadow: "-20px -20px 0rem 2px rgb(23 64 116)" }}
            >
              <CardHeader className="bg-transparent pb-4 justify-content-center">
                <div className="text-muted text-center mt-2 mb-3">
                  <img
                    className=""
                    width={"60%"}
                    src={require("assets/img/brand/logo.png").default}
                    alt=""
                  />

                  <h2 className="text-uppercase">
                    Competence Management System
                  </h2>
                  <small>
                    Managing Human Resource Development and Performance in the
                    Workspace
                  </small>
                </div>
              </CardHeader>
              <CardBody className="px-lg-5 py-lg-3">
                <h2 className="text-center">Login</h2>
                <div className="text-center text-muted mb-3">{alertState}</div>

                <Form role="form" onenter={(e) => LoginCred(e, details)}>
                  <FormGroup
                    className={classnames("mb-3", {
                      focused: focusedEmail,
                    })}
                  >
                    <InputGroup className="input-group-merge input-group-alternative">
                      <Input
                        placeholder="Email"
                        type="email"
                        onFocus={() => setfocusedEmail(true)}
                        onBlur={() => setfocusedEmail(true)}
                        onChange={(e) =>
                          setDetails({ ...details, username: e.target.value })
                        }
                        value={details.username}
                      />
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText className="bg-default text-white">
                          <i className=" fa fa-envelope" />
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormGroup>
                  <FormGroup
                    className={classnames("mb-3", {
                      focused: focusedPassword,
                    })}
                  >
                    <InputGroup className="input-group-merge input-group-alternative">
                      <Input
                        placeholder="Password"
                        type={show_password.showPassword ? "text" : "password"}
                        onFocus={() => setfocusedPassword(true)}
                        onBlur={() => setfocusedPassword(true)}
                        onChange={(e) => {
                          setDetails({ ...details, password: e.target.value });
                          StrengthChecker(e.target.value);
                        }}
                        value={details.password}
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
                  </FormGroup>
                  <Row>
                    {/* <Col xs="12">
                      <div class="text-muted font-italic mb-2">
                        <small>
                          password strength:
                          <span className={`${strengthClass} font-weight-700 `}>
                          {passwordStrength}
                          </span>
                        </small>
                      </div>
                    </Col> */}
                    <Col xs="6">
                      <div className="custom-control custom-control-alternative custom-checkbox">
                        <input
                          className="custom-control-input"
                          id=" customCheckLogin"
                          type="checkbox"
                        />
                        <label
                          className="custom-control-label"
                          htmlFor=" customCheckLogin"
                        >
                          <span className="text-muted">Remember me</span>
                        </label>
                      </div>
                    </Col>
                    <Col xs="6" className=" text-right">
                      <a
                        className="text-muted"
                        href="#pablo"
                        onClick={(e) => e.preventDefault()}
                      >
                        <small>Forgot your password?</small>
                      </a>
                    </Col>
                  </Row>
                  <div className="text-center">
                    <Button
                      className="my-4"
                      color="info"
                      type="submit"
                      onClick={(e) => LoginCred(e, details)}
                    >
                      Login
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Login;
