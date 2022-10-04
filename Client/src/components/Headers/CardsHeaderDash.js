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
// nodejs library to set properties for components
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
// reactstrap components
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardTitle,
  Container,
  Row,
  Col,
} from "reactstrap";

function CardsHeaderDash({ name, parentName,parentRoute }) {
  return (
    <>
      <div className="header bg-default pb-6">
        <Container fluid>
          <div className="header-body">
            <Row className="align-items-center py-4">
              <Col lg="6" xs="12">
                {/* <h6 className="h2 text-white d-inline-block mb-0">{name}</h6>{" "} */}
                <Breadcrumb
                  className="d-none d-md-inline-block ml-md-4"
                  listClassName="breadcrumb-links breadcrumb-dark"
                >
                  <BreadcrumbItem>
                    <Link replace to={"/admin/dashboard"}>
                      <i className="fas fa-home" />
                    </Link>
                  </BreadcrumbItem>
                  <BreadcrumbItem>
                    <Link replace to={parentRoute}>
                      {parentName}
                    </Link>
                  </BreadcrumbItem>
                  <BreadcrumbItem aria-current="page" className="active">
                    {name}
                  </BreadcrumbItem>
                </Breadcrumb>
              </Col>
              <Col className="text-right" lg="6" xs="12">
                <Button
                  outline
                  className=""
                  color="white"
                  href="#pablo"
                  onClick={(e) => e.preventDefault()}
                  size="md"
                >
                  <i className="fas fa-wave-square" /> Activity
                </Button>
                <Button
                  outline
                  className=""
                  color="white"
                  href="#pablo"
                  onClick={(e) => e.preventDefault()}
                  size="md"
                >
                  <i className="fas fa-cog" /> Settings
                </Button>
              </Col>
            </Row>

            <Row>
              <Col lg="6" xl="4">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                          Inspection Teams
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          1
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-blue text-white rounded-circle shadow">
                          <i class="fas fa-anchor"></i>
                        </div>
                      </Col>
                    </Row>
                    <p className="mt-3 mb-0 text-muted text-sm">
                      <span className="text-warning mr-2">
                        {/* <i className="fas fa-arrow-down" /> 1.10% */}
                      </span>{" "}
                      <span className="text-nowrap">
                      {/* Since yesterday */}
                      </span>
                    </p>
                  </CardBody>
                </Card>
              </Col>
              <Col lg="6" xl="4">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                          Ships
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">4</span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-yellow text-white rounded-circle shadow">
                          <i class="fas fa-ship"></i>
                        </div>
                      </Col>
                    </Row>
                    <p className="mt-3 mb-0 text-muted text-sm">
                      <span className="text-warning mr-2">
                        {/* <i className="fas fa-arrow-down" /> 1.10% */}
                      </span>{" "}
                      <span className="text-nowrap">
                      {/* Since yesterday */}
                      </span>
                    </p>
                  </CardBody>
                </Card>
              </Col>
              <Col lg="6" xl="4">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                          Crew
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">80</span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-success text-white rounded-circle shadow">
                          <i class="fas fa-users"></i>
                        </div>
                      </Col>
                    </Row>
                    <p className="mt-3 mb-0 text-muted text-sm">
                      <span className="text-warning mr-2">
                        {/* <i className="fas fa-arrow-down" /> 1.10% */}
                      </span>{" "}
                      <span className="text-nowrap">
                      {/* Since yesterday */}
                      </span>
                    </p>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </>
  );
}

CardsHeaderDash.propTypes = {
  name: PropTypes.string,
  parentName: PropTypes.string,
};

export default CardsHeaderDash;
