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
import { useState } from "react";

import classnames from "classnames";
// reactstrap components
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Container,
  Row,
  Col,
  NavItem,
  NavLink,
  Nav,
  Card,
  CardBody,
  CardTitle,
} from "reactstrap";

function CardsHeader({ name, parentName, parentRoute,title,subtitle }) {
  return (
    <>
      <div className="header bg-default pb-6">
        <Container fluid>
          <div className="header-body">
            <Row className="align-items-center py-4">
              <Col lg="6" style={{display:'flex', alignItems:'center'}} xs="12">
                <h6 className="h2 text-white d-inline-block mb-0">{title} <span style={{display:"block",fontSize:"0.8rem",fontWeight:'normal'}}>{subtitle}</span></h6>{" "}
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
          </div>
        </Container>
      </div>
    </>
  );
}

CardsHeader.propTypes = {
  name: PropTypes.string,
  parentName: PropTypes.string,
  parentRoute: PropTypes.string,
};

export default CardsHeader;
