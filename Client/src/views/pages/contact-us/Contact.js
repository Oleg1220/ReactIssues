import AuthHeader from "components/Headers/AuthHeader";
import React from "react"; 
// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
  Row,
  Col,
  CardFooter,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import CustButton from "components/Buttons/CustButton";

const Contact = () => {
    const navigate = useNavigate();
  const goToPrevious = (event) => {
    event.preventDefault();
    navigate(-1);
  };
  return (
    <>
      <AuthHeader title="" lead="" />
      <Container className="mt--11">
        <Row className="justify-content-center">
          <Col lg="7" md="10" sm="12">
            <div className="text-muted text-center mt-2 mb-5">
              <img
                className=""
                width={"30%"}
                src={require("assets/img/brand/logo.png").default}
                alt=""
              />
            </div>
            <Card
              className="bg-secondary border-0 mb-0"
              style={{ boxShadow: "-20px -20px 0rem 2px rgb(23 64 116)" }}
            >
              <CardHeader className="bg-transparent justify-content-center">
                <div className=" text-center">
                  <h1>Contact Us</h1>
                </div>
              </CardHeader>
              <CardBody className="px-lg-5 py-lg-3">
                <div className="mb-4">
                  <FormGroup>
                    <InputGroup className="mb-3">
                      <Input placeholder="Enter your name" type="text" />
                      <InputGroupAddon addonType="append">
                        <InputGroupText className="bg-default text-white">
                          <i class="fas fa-user"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormGroup>
                  <FormGroup>
                    <InputGroup className="mb-3">
                      <Input
                        placeholder="Enter your email address"
                        type="email"
                      />
                      <InputGroupAddon addonType="append">
                        <InputGroupText className="bg-default text-white">
                          <i class="fas fa-envelope"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormGroup>
                  <FormGroup>
                    <InputGroup className="mb-3">
                      <Input placeholder="Enter referrence link" type="text" />
                      <InputGroupAddon addonType="append">
                        <InputGroupText className="bg-default text-white">
                          <i class="fas fa-link"></i>
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormGroup>

                  <FormGroup>
                    <InputGroup>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>Message</InputGroupText>
                      </InputGroupAddon>
                      <Input type="textarea" rows="5" />
                    </InputGroup>
                  </FormGroup>
                </div>
                <div className="text-right">
                  <CustButton
                    _text="Send Message"
                    _id={`sendBtn`}
                    _type="button"
                    _color="default"
                    _icon="fas fa-paper-plane"
                  />
                  <CustButton
                    _text="Cancel"
                    _id={`cancelBtn`}
                    _type="button"
                    _color="default"
                    _icon="fas fa-ban"
                    _onClick={goToPrevious}
                  />
                </div>
              </CardBody>
              <CardFooter className="bg-transparent text-right">
                <small className="text-muted">
                  Competence Management System for MPSG Version 4.0
                </small>
              </CardFooter>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Contact;
