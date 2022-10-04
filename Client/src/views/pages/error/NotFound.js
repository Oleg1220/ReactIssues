import AuthHeader from "components/Headers/AuthHeader";
import React from "react";
// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  Container,
  Row,
  Col,
  CardFooter,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import CustButton from "components/Buttons/CustButton";

const NotFound = () => {
  const navigate = useNavigate();
  const goToContact = (event)=> {
    event.preventDefault();
    navigate("../contactus");
  } 
  const goToPrevious = (event)=> {
    event.preventDefault();
    navigate(-1)
  } 
  document.body.classList.add("bg-secondary2");
  return (
    <>
      <AuthHeader title="" lead="" />
      <Container className="mt--9 pb-5">
        <Row className="justify-content-center">
          <Col lg="10" md="7">
            <Card
              className="bg-secondary border-0 mb-0"
              style={{ boxShadow: "-20px -20px 0rem 2px rgb(23 64 116)" }}
            >
              <CardHeader className="bg-transparent pb-4 justify-content-center">
                <div className="text-muted text-center mt-2 mb-3">
                  <img
                    className=""
                    width={"30%"}
                    src={require("assets/img/brand/logo.png").default}
                    alt=""
                  />
                </div>
              </CardHeader>
              <CardBody className="px-lg-5 py-lg-3">
                <div className="text-center   mb-4">
                  <h1
                    className="display-1 text-default "
                    style={{ fontSize: "5.3rem" }}
                  >
                    404
                  </h1>
                  <p className="h2">
                    The page you are looking for might have been removed, had
                    its name changed, or is temporarily unavailable
                  </p>
                  <br />
                  <CustButton
                    _text="Go Back to Previous Page"
                    _id={`goBackBtn`}
                    _type="button"
                    _color="default"
                    _icon="fas fa-chevron-left"
                    _onClick={goToPrevious}
                  />
                  <CustButton
                    _text="Contact Us"
                    _id={`contactUsBtn`}
                    _type="button"
                    _color="default"
                    _icon="fas fa-comments"
                    _onClick={goToContact}
                  />
                </div>
              </CardBody>
              <CardFooter className="bg-transparent text-right">
                <small className="text-muted">Competence Management System for MPSG Version 4.0</small>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default NotFound;
