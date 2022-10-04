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
/*eslint-disable*/

// reactstrap components
import { NavItem, NavLink, Nav, Container, Row, Col } from "reactstrap";

function AuthFooter() {
  return (
    <>
      <footer className="py-5" id="footer-main">
        <Container>
          <Row className="align-items-center justify-content-xl-center">
            <Col xl="12" className="align-items-center">
              <div className="copyright text-center">
                © Copyright {new Date().getFullYear()} . All Rights Reserved |
                <a
                  className="font-weight-bold ml-1"
                  href="https://www.creative-tim.com?ref=adpr-auth-footer"
                  target="_blank"
                >
                  IDESS Interactive Technologies (IDESS I.T) Inc.
                </a>
              </div>
            </Col>
            <Col xl="12">
              <Nav className="nav-footer justify-content-center justify-content-lg-center">
                <NavItem>
                  <NavLink
                    href="https://www.creative-tim.com?ref=adpr-auth-footer"
                    target="_blank"
                  >
                    Terms and Conditions
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="https://www.creative-tim.com/presentation?ref=adpr-auth-footer"
                    target="_blank"
                  >
                    Privacy Policy
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="http://blog.creative-tim.com?ref=adpr-auth-footer"
                    target="_blank"
                  >
                    System Requirements
                  </NavLink>
                </NavItem>
              </Nav>
            </Col>
          </Row>
        </Container>
      </footer>
    </>
  );
}

export default AuthFooter;
