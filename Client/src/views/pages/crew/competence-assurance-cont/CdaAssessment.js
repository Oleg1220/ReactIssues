import CustButton from "components/Buttons/CustButton";
import React, { useState, useEffect, useContext } from "react";
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  Nav,
  NavItem,
  NavLink,
  Row,
} from "reactstrap";

function CdaAssessment() {
  const [caTabsState, setCaTabsState] = useState({ tabs: 1 });
  const [openedCollapses, setOpenedCollapses] = useState([]);
  const [openedCollapsesIns, setOpenedCollapsesIns] = useState([]);
  const collapsesToggle = (collapse) => {
    let tmpOpenedCollapses = openedCollapses;
    if (tmpOpenedCollapses.includes(collapse)) {
      setOpenedCollapses([]);
    } else {
      setOpenedCollapses([collapse]);
    }
  };

  const collapsesToggleIns = (collapse) => {
    let tmpOpenedCollapses = openedCollapsesIns;
    if (tmpOpenedCollapses.includes(collapse)) {
      setOpenedCollapsesIns([]);
    } else {
      setOpenedCollapsesIns([collapse]);
    }
  };

  const toggleCaNavs = (e, statesss, index) => {
    e.preventDefault();
    setCaTabsState({ tabs: index });
  };

  const viewAdditionalEvidence = (e, id) => {
    if (e !== undefined) {
      e.stopPropagation();
    }
    console.log(id);
  };
  return (
    <>
      <Row>
        <Col xl="12">
          <div className="accordion">
            <Card
              className="card-plain mb-2"
              style={{ boxShadow: "0 0 0rem 0 rgb(136 152 170 / 15%)" }}
            >
              <CardHeader
                role="tab"
                onClick={() => collapsesToggle("collapseOne")}
                aria-expanded={openedCollapses.includes("collapseOne")}
                style={{ boxShadow: "inset 0 0 2rem 0 rgb(136 152 170 / 15%)" }}
              >
                <h5 className="mb-0">A1 Demo</h5>
              </CardHeader>
              <Collapse
                role="tabpanel"
                isOpen={openedCollapses.includes("collapseOne")}
              >
                <CardBody>
                  <div className="accordion">
                    <Card
                      className="card-plain mb-2"
                      style={{ boxShadow: "0 0 0rem 0 rgb(136 152 170 / 15%)" }}
                    >
                      <CardHeader
                        role="tab"
                        onClick={() => collapsesToggleIns("collapseOne")}
                        aria-expanded={openedCollapsesIns.includes(
                          "collapseOne"
                        )}
                        style={{
                          boxShadow: "inset 0 0 2rem 0 rgb(136 152 170 / 15%)",
                        }}
                      >
                        <Row>
                          <Col xl="4">
                            <h5 className="mb-0">
                              A1 Demo <Badge color="warning">In Progress</Badge>
                            </h5>
                          </Col>
                        </Row>
                      </CardHeader>
                      <Collapse
                        role="tabpanel"
                        isOpen={openedCollapsesIns.includes("collapseOne")}
                      >
                        <CardBody>
                          <Row>
                            <Col xl="12">
                              <Card className="mb-2">
                                <CardBody>
                                  <Row className="align-items-center">
                                    <div className="col ml--2">
                                      <h4 className="mb-0">
                                        <a
                                          href="#pablo"
                                          onClick={(e) => e.preventDefault()}
                                        >
                                          Knowledge Assessment
                                        </a>
                                      </h4>
                                      <p className="text-sm text-muted mb-0">
                                        Date started: 24-10-2019
                                      </p>
                                      <span className="text-success mr-1">
                                        ●
                                      </span>
                                      <small>Competent</small>
                                      <p className="text-sm text-muted mb-0">
                                        Date signed off: 24-10-2019
                                      </p>
                                    </div>
                                    <Col className="col-auto">
                                      <Button
                                        color="primary"
                                        size="sm"
                                        type="button"
                                      >
                                        View
                                      </Button>
                                    </Col>
                                  </Row>
                                </CardBody>
                              </Card>
                            </Col>
                            <Col xl="12">
                              <Card className="mb-2">
                                <CardBody>
                                  <Row className="align-items-center">
                                    <div className="col ml--2">
                                      <h4 className="mb-0">
                                        <a
                                          href="#pablo"
                                          onClick={(e) => e.preventDefault()}
                                        >
                                          Performance Assessment
                                        </a>
                                      </h4>
                                      <p className="text-sm text-muted mb-0">
                                        Date started: 24-10-2019
                                      </p>
                                      <span className="text-danger mr-1">
                                        ●
                                      </span>
                                      <small>Not yet competent</small>
                                      <p className="text-sm text-muted mb-0">
                                        Date signed off: 24-10-2019
                                      </p>
                                    </div>
                                    <Col className="col-auto">
                                      <Button
                                        color="primary"
                                        size="sm"
                                        type="button"
                                      >
                                        View
                                      </Button>
                                    </Col>
                                  </Row>
                                </CardBody>
                              </Card>
                            </Col>
                          </Row>
                        </CardBody>
                      </Collapse>
                    </Card>
                    <Card
                      className="card-plain mb-2"
                      style={{ boxShadow: "0 0 0rem 0 rgb(136 152 170 / 15%)" }}
                    >
                      <CardHeader
                        role="tab"
                        onClick={() => collapsesToggleIns("collapseTwo")}
                        aria-expanded={openedCollapsesIns.includes(
                          "collapseTwo"
                        )}
                        style={{
                          boxShadow: "inset 0 0 2rem 0 rgb(136 152 170 / 15%)",
                        }}
                      >
                        <h5 className="mb-0">
                          Confined Space Entry{" "}
                          <Badge color="success">Completed</Badge>
                        </h5>
                      </CardHeader>
                      <Collapse
                        role="tabpanel"
                        isOpen={openedCollapsesIns.includes("collapseTwo")}
                      >
                        <CardBody>
                          Anim pariatur cliche reprehenderit, enim eiusmod high
                          life accusamus terry richardson ad squid. 3 wolf moon
                          officia aute, non cupidatat skateboard dolor brunch.
                          Food truck quinoa nesciunt laborum eiusmod. Brunch 3
                          wolf moon tempor, sunt aliqua put a bird on it squid
                          single-origin coffee nulla assumenda shoreditch et.
                          Nihil anim keffiyeh helvetica, craft beer labore wes
                          anderson cred nesciunt sapiente ea proident. Ad vegan
                          excepteur butcher vice lomo. Leggings occaecat craft
                          beer farm-to-table, raw denim aesthetic synth nesciunt
                          you probably haven't heard of them accusamus labore
                          sustainable VHS.
                        </CardBody>
                      </Collapse>
                    </Card>
                  </div>
                </CardBody>
              </Collapse>
            </Card>
            <Card
              className="card-plain mb-2"
              style={{ boxShadow: "0 0 0rem 0 rgb(136 152 170 / 15%)" }}
            >
              <CardHeader
                role="tab"
                onClick={() => collapsesToggle("collapseTwo")}
                aria-expanded={openedCollapses.includes("collapseTwo")}
                style={{ boxShadow: "inset 0 0 2rem 0 rgb(136 152 170 / 15%)" }}
              >
                <h5 className="mb-0">Confined Space Entry</h5>
              </CardHeader>
              <Collapse
                role="tabpanel"
                isOpen={openedCollapses.includes("collapseTwo")}
              >
                <CardBody>
                  Anim pariatur cliche reprehenderit, enim eiusmod high life
                  accusamus terry richardson ad squid. 3 wolf moon officia aute,
                  non cupidatat skateboard dolor brunch. Food truck quinoa
                  nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt
                  aliqua put a bird on it squid single-origin coffee nulla
                  assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft
                  beer labore wes anderson cred nesciunt sapiente ea proident.
                  Ad vegan excepteur butcher vice lomo. Leggings occaecat craft
                  beer farm-to-table, raw denim aesthetic synth nesciunt you
                  probably haven't heard of them accusamus labore sustainable
                  VHS.
                </CardBody>
              </Collapse>
            </Card>
          </div>
        </Col>
      </Row>
    </>
  );
}

export default CdaAssessment;
