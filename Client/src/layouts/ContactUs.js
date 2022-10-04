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
import React from "react";
// react library for routing
import { useLocation } from "react-router-dom";

// core components
import AuthFooter from "components/Footers/AuthFooter.js";
import Contact from "views/pages/contact-us/Contact";

function ContactUs() {
  const location = useLocation();
  const mainContentRef = React.useRef(null);
  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContentRef.current.scrollTop = 0;
    document.body.classList.add("bg-secondary2");
    // Specify how to clean up after this effect:
    return function cleanup() {
      document.body.classList.remove("bg-secondary2");
    };
  });
  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContentRef.current.scrollTop = 0;
  }, [location]);

  return (
    <>
      <div className="main-content" ref={mainContentRef}>
        <Contact/>
      </div>
      <AuthFooter />
    </>
  );
}

export default ContactUs;
