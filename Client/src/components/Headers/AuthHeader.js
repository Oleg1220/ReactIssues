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
// reactstrap components
import { Container, Row, Col } from "reactstrap";

function AuthHeader({ title, lead }) {
  return (
    <>
      <div className="header bg-secondary2 py-7 py-lg-8 pt-0">
        <Container>
          <div className="header-body text-center mb-0">
            <Row className="justify-content-center">
              <Col className="px-5" lg="6" md="8" xl="5">
                {title ? <h1 className="text-white">{title}</h1> : null}
                {lead ? <p className="text-lead text-white">{lead}</p> : null}
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </>
  );
}

AuthHeader.propTypes = {
  name: PropTypes.string,
  parentName: PropTypes.string,
  parentRoute: PropTypes.string,
};

export default AuthHeader;
