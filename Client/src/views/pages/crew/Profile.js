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
// reactstrap components
import React, { useState, useEffect, useContext } from "react";
import ProfileHeader from "components/Headers/ProfileHeader";
import classnames from "classnames";
import "./Profile.css";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardImg,
  CardTitle,
  FormGroup,
  Form,
  Input,
  ListGroupItem,
  ListGroup,
  Progress,
  Container,
  Row,
  Col,
  Nav,
  NavItem,
  NavLink,
  UncontrolledTooltip,
  UncontrolledCollapse,
  TabContent,
  TabPane,
  Breadcrumb,
} from "reactstrap";
import CompetenceAssurance from "./CompetenceAssurance";
import Appraisal from "./Appraisal";
import TrainingRecords from "./TrainingRecords";
// core components

function Profile() {
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [caTabsState, setCaTabsState] = useState({ tabs: 1 });

  const toggleTabs = (e, statesss, index) => {
    e.preventDefault();
    setTabsState({ tabs: index });
  };

  const toggleCaNavs = (e, statesss, index) => {
    e.preventDefault();
    setCaTabsState({ tabs: index });
  };

  return (
    <>
      <ProfileHeader
        name="Default"
        parentName="Dashboards"
        parentRoute="/admin/dashboard"
        title=""
        subtitle=""
      />
      <Container className="mt--5" fluid>
        <Row>
          <Col className=" " xl="3">
            <Card className="card-profile">
              <CardImg
                alt="..."
                src={require("assets/img/theme/profile-cover.jpg").default}
                top
              />
              <Row className="justify-content-center">
                <Col className="" lg="3">
                  <div className="card-profile-image">
                    <a href="#pablo" onClick={(e) => e.preventDefault()}>
                      <img
                        alt="..."
                        className="rounded-circle"
                        src={require("assets/img/theme/team-4.jpg").default}
                      />
                    </a>
                  </div>
                </Col>
              </Row>
              <CardHeader className="text-center border-0 pt-8 pt-md-4 pb-0 pb-md-4">
                <div className="d-flex justify-content-between">
                  <Button
                    className="mr-4"
                    color="default"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                    size="sm"
                  >
                    sEaLearn
                  </Button>
                  <Button
                    className="float-right"
                    color="success"
                    href="#pablo"
                    onClick={(e) => e.preventDefault()}
                    size="sm"
                  >
                    iTest
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="text-center pt-2">
                  <h5 className="h3">Jessica Jones</h5>
                  <div className="h5 font-weight-500">JGC Test Onshore</div>
                  <div className="h5 font-weight-600 mb-0">Captain</div>
                  <div className="h5 font-weight-300">
                    <span data-placement="top" id="dateAssumingPositionToolTip">
                      11-06-2015
                    </span>
                  </div>
                </div>

                <Row>
                  <div className="col">
                    <div className="card-profile-stats pt-0 d-flex justify-content-center">
                      <div>
                        <span className="heading">23</span>
                        <span className="description">Competency Units</span>
                      </div>
                      <div>
                        <span className="heading">12</span>
                        <span className="description">Trainings</span>
                      </div>
                      <div>
                        <span className="heading">53</span>
                        <span className="description">eLearnings</span>
                      </div>
                    </div>
                  </div>
                </Row>
                <Row className=" justify-content-center">
                  <div>
                    <a color="primary" href="#collapseExample" id="profileinfo">
                      <i className=" fas fa-chevron-down"> </i>
                    </a>
                  </div>
                </Row>
                <UncontrolledCollapse toggler="#profileinfo">
                  <ListGroup className="list" flush>
                    <ListGroupItem className="px-0 py-2">
                      <Row className="align-items-center">
                        <div className="col ml--2">
                          <h4 className="mb-0">Company</h4>
                          <small className="pl-2">.JGC Test Company</small>
                          <h5 className="pl-4 font-weight-600 mb-0">
                            Joining Date:{" "}
                            <span className=" font-weight-normal">
                              11-06-2015
                            </span>
                          </h5>
                        </div>
                      </Row>
                    </ListGroupItem>
                    <ListGroupItem className="px-0 py-2">
                      <Row className="align-items-center">
                        <div className="col ml--2">
                          <h4 className="mb-0">Department</h4>
                          <small className="pl-2">.JGC Test Company</small>
                        </div>
                      </Row>
                    </ListGroupItem>
                    <ListGroupItem className="px-0  py-2">
                      <Row className="align-items-center">
                        <div className="col ml--2">
                          <h4 className="mb-0">Date joining</h4>
                          <small className="pl-2">.JGC Test Company</small>
                        </div>
                      </Row>
                    </ListGroupItem>
                    <ListGroupItem className="px-0  py-2">
                      <Row className="align-items-center">
                        <div className="col ml--2">
                          <h4 className="mb-0">Company</h4>
                          <small className="pl-2">.JGC Test Company</small>
                        </div>
                      </Row>
                    </ListGroupItem>
                    <ListGroupItem className="px-0  py-2">
                      <Row className="align-items-center">
                        <div className="col ml--2">
                          <h4 className="mb-0">Company</h4>
                          <small className="pl-2">.JGC Test Company</small>
                        </div>
                      </Row>
                    </ListGroupItem>
                  </ListGroup>
                </UncontrolledCollapse>
              </CardBody>
            </Card>
          </Col>
          <Col className=" " xl="9">
            <Row>
              <Col lg="6"></Col>
            </Row>
            <Card className="card-frame" style={{boxShadow:'0 0 2rem 0 rgb(136 152 170 / 65%)'}}>
              <CardBody className=" p-3">
                <Nav
                  className=" flex-column flex-md-row"
                  id="tabs-icons-text"
                  pills
                  role="tablist"
                >
                  <NavItem size="cust-md">
                    <NavLink
                      aria-selected={tabsState.tabs === 1}
                      className={classnames("mb-sm-3 mb-md-0", {
                        active: tabsState.tabs === 1,
                      })}
                      onClick={(e) => toggleTabs(e, "tabs", 1)}
                      href="#pablo"
                      role="tab"
                    >
                      Competence Assurance
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
                      Appraisal
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      aria-selected={tabsState.tabs === 3}
                      className={classnames("mb-sm-3 mb-md-0", {
                        active: tabsState.tabs === 3,
                      })}
                      onClick={(e) => toggleTabs(e, "tabs", 3)}
                      href="#pablo"
                      role="tab"
                    >
                      Training Records
                    </NavLink>
                  </NavItem>
                </Nav>
              </CardBody>
            </Card>
              <TabContent activeTab={"tabs" + tabsState.tabs}>
                <TabPane tabId={"tabs1"}>
                  <CompetenceAssurance />
                </TabPane>
                <TabPane tabId={"tabs2"}>
                  <Appraisal />
                </TabPane>
                <TabPane tabId={"tabs3"}>
                  <TrainingRecords />
                </TabPane>
              </TabContent>
          </Col>
        </Row>
      </Container>

      <UncontrolledTooltip
        delay={0}
        placement="top"
        target="dateAssumingPositionToolTip"
      >
        Date of Assuming Current Position
      </UncontrolledTooltip>
    </>
  );
}

export default Profile;
