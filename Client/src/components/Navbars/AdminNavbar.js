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
import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { UserContext } from "../../App";
import { useNavigate } from "react-router-dom";
import ReactBSAlert from "react-bootstrap-sweetalert";

// nodejs library that concatenates classes
import classnames from "classnames";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// reactstrap components
import {
  Collapse,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  ListGroupItem,
  ListGroup,
  Media,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
  Row,
  Col,
  Button,
} from "reactstrap";
import CustModal from "components/Modals/CustModal";
import { useTranslation } from "react-i18next";

function AdminNavbar(props) {
  const { t } = useTranslation();
  const { theme} = props;
  const [sidenavOpen, setSidenavOpen] = React.useState(true);
  const toggleSidenav = (e) => {
    if (document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.remove("g-sidenav-pinned");
      document.body.classList.add("g-sidenav-hidden");
    } else {
      document.body.classList.add("g-sidenav-pinned");
      document.body.classList.remove("g-sidenav-hidden");
    }
    setSidenavOpen(!sidenavOpen);
  };
  // function that on mobile devices makes the search open
  const openSearch = () => {
    document.body.classList.add("g-navbar-search-showing");
    setTimeout(function () {
      document.body.classList.remove("g-navbar-search-showing");
      document.body.classList.add("g-navbar-search-show");
    }, 150);
    setTimeout(function () {
      document.body.classList.add("g-navbar-search-shown");
    }, 300);
  };
  // function that on mobile devices makes the search close
  const closeSearch = () => {
    document.body.classList.remove("g-navbar-search-shown");
    setTimeout(function () {
      document.body.classList.remove("g-navbar-search-show");
      document.body.classList.add("g-navbar-search-hiding");
    }, 150);
    setTimeout(function () {
      document.body.classList.remove("g-navbar-search-hiding");
      document.body.classList.add("g-navbar-search-hidden");
    }, 300);
    setTimeout(function () {
      document.body.classList.remove("g-navbar-search-hidden");
    }, 500);
  };
  const { user, setUser } = useContext(UserContext);
  const [openAlert, setOpenAlert] = useState(null);
  
  const navigate = useNavigate();

  const hideAlert = () => {
    setOpenAlert(null);
  };
  const confirmLogoutAlert = () => {
    setOpenAlert(
      <ReactBSAlert
        warning
        style={{ display: "block", marginTop: "-100px" }}
        title="Logout"
        onConfirm={logout}
        onCancel={hideAlert}
        showCancel
        confirmBtnBsStyle="primary"
        confirmBtnText="Yes"
        cancelBtnBsStyle="secondary"
        cancelBtnText="No"
        btnSize=""
      >
        Are you sure you want to log out?
      </ReactBSAlert>
    );
  };

  const editView = () => {
    setOpenAlert(
        <ReactBSAlert
          warning
          reverseButtons={false}
          style={{ display: "block", marginTop: "-100px" }}
          title="Change View"
          onConfirm={ async (e)=>
            {
              await setUser({...user,dev_view:!user.dev_view})
              hideAlert()
            }
            
          
          }

          onCancel={hideAlert}
          showCancel
          cancelBtnBsStyle="secondary"
          cancelBtnText="Cancel"
          confirmBtnBsStyle="primary"
          confirmBtnText={user.dev_view?"Change to Client View":"Change to Dev View"}
          btnSize=""
        >
         <b>Current View: {user.dev_view?"Dev View":"Client View"}</b>
        </ReactBSAlert>      

    );


  };
 



  function logout() {
    setUser({
      loggedIn: false,
      fullname: "",
      admin_id: "",
      email: "",
      rank: "",
      tl_id: "",
      token: "",
      token_creation: "",
    });
    localStorage.removeItem("userData");
    navigate("/login");
  }


  return (
    <>
      {openAlert}
      <Navbar
        className={classnames(
          "navbar-top navbar-expand border-bottom",
          { "navbar-dark bg-default": theme === "dark" },
          { "navbar-light bg-secondary": theme === "light" }
        )}
      >
        <Container fluid>
          <Collapse navbar isOpen={true}>
            <div>
              {/* {alert(navTtl)} */}
            <h6 className="h2 text-white d-inline-block mb-0">{t(user.navTtl)}
            <span style={{display:"block",fontSize:"0.8rem",fontWeight:'normal'}}>{t(user.navSubttl)}</span></h6>{" "}
            </div>
            <Nav className="align-items-center ml-md-auto" navbar>
              <NavItem className="d-xl-none">
                <div
                  className={classnames(
                    "pr-3 sidenav-toggler",
                    { active: sidenavOpen },
                    { "sidenav-toggler-dark": theme === "dark" }
                  )}
                  onClick={toggleSidenav}
                >
                  <div className="sidenav-toggler-inner">
                    <i className="sidenav-toggler-line" />
                    <i className="sidenav-toggler-line" />
                    <i className="sidenav-toggler-line" />
                  </div>
                </div>
              </NavItem>
              <NavItem className="d-sm-none">
                <NavLink onClick={openSearch}>
                  <i className="ni ni-zoom-split-in" />
                </NavLink>
              </NavItem>
              
            </Nav>
            <Nav className="align-items-center ml-auto ml-md-0" navbar>
            <Form
              className={classnames(
                "navbar-search form-inline mr-sm-3",
                { "navbar-search-light": theme === "dark" },
                { "navbar-search-dark": theme === "light" }
              )}
            >
              <FormGroup className="mb-0">
                <InputGroup className="input-group-alternative input-group-merge">
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>
                      <i className="fas fa-search" />
                    </InputGroupText>
                  </InputGroupAddon>
                  <Input placeholder="Search" type="text" />
                </InputGroup>
              </FormGroup>
              <button
                aria-label="Close"
                className="close"
                type="button"
                onClick={closeSearch}
              >
                <span aria-hidden={true}>×</span>
              </button>
            </Form>
              <UncontrolledDropdown nav>
                <DropdownToggle className="nav-link pr-0" color="" tag="a">
                  <Media className="align-items-center">
                    <span className="avatar avatar-sm rounded-circle">
                      <img
                        alt="..."
                        src={require("assets/img/theme/team-4.jpg").default}
                      />
                    </span>
                    <Media className="ml-2 d-none d-lg-block">
                      <span className="mb-0 text-sm font-weight-bold">
                        {user.fullname}
                      </span>
                    </Media>
                  </Media>
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem className="noti-title" header tag="div">
                    <h6 className="text-overflow m-0">Welcome!</h6>
                  </DropdownItem>
                  <DropdownItem
                    href="#pablo"
                    onClick={(e) => navigate("/admin/profile")}
                  >
                    <i className="ni ni-single-02" />
                    <span>My profile</span>
                  </DropdownItem>
                  <DropdownItem
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                  >
                    <i className="ni ni-settings-gear-65" />
                    <span>Settings</span>
                  </DropdownItem>
                  <DropdownItem
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                  >
                    <i className="ni ni-calendar-grid-58" />
                    <span>Activity</span>
                  </DropdownItem>                 

                  <DropdownItem
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                  >
                    <i className="ni ni-support-16" />
                    <span>Support</span>
                  </DropdownItem>                     
                  {                    
                    user.access_level =="62c64a0326e4e0c656cd2009"?
                    <DropdownItem            
                      onClick={(e) => editView()}
                    >
                      <i className={user.dev_view?"fas fa-eye":"fas fa-eye-slash"} />

                      <span>{user.dev_view?"Dev View":"Client View"}</span>
                    </DropdownItem>
                  :
                  null
                  }

                  <DropdownItem divider />
                  <DropdownItem
                    href="#pablo"
                    onClick={(e) => confirmLogoutAlert()}
                  >
                    <i className="ni ni-user-run" />
                    <span>Logout</span>
                  </DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
        </Container>
      </Navbar>
    </>
  );
}

AdminNavbar.defaultProps = {
  toggleSidenav: () => {},
  sidenavOpen: false,
  theme: "dark",
  navTtl: "",
  navSubttl: ""
};
AdminNavbar.propTypes = {
  toggleSidenav: PropTypes.func,
  sidenavOpen: PropTypes.bool,
  theme: PropTypes.oneOf(["dark", "light"]),
  navTtl: PropTypes.string,
  navSubttl: PropTypes.string
};

export default AdminNavbar;
