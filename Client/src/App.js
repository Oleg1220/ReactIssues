//### DEPENDECIES
import  React, { useState,useEffect,createContext } from "react";

import { createBrowserHistory } from 'history';

// react library for routing
import { BrowserRouter, Route, Routes,useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

// plugins styles from node_modules
import "react-notification-alert/dist/animate.css";
import "react-perfect-scrollbar/dist/css/styles.css";
import "@fullcalendar/common/main.min.css";
import "@fullcalendar/daygrid/main.min.css";
import "sweetalert2/dist/sweetalert2.min.css";
import "select2/dist/css/select2.min.css";
import "quill/dist/quill.core.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
// plugins styles downloaded
import "assets/vendor/nucleo/css/nucleo.css";
import "assets/css/custom.css";
// core styles
import "assets/scss/argon-dashboard-pro-react.scss?v1.2.0";
import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";
import ErrorLayout from "layouts/Error";
import routes from "routes.js";
import ContactUs from "layouts/ContactUs";

import Login from "views/pages/auth/login/Login";
import ForgotPassword from "views/pages/auth/forgot-password/ForgotPassword";
import NotFound from "views/pages/error/NotFound";
import AuthFooter from "components/Footers/AuthFooter";
import ProtectedRoutes from "layouts/routing/ProtectedRoutes";
import ProtectedLogIn from "layouts/routing/ProtectedLogIn";
import otherRoutes from "layouts/routing/otherRoutes";
import { useTranslation } from "react-i18next";
//## GLOBAL VARIABLE INIT
export const UserContext = createContext();
export const _dataService = require('services/data.services');
export const _toastService = require('services/toasts.services');
export const _helper = require('services/helper.services');
export const history = createBrowserHistory({
  basename: process.env.PUBLIC_URL
});




function App() {
  const server_ip = "192.168.1.84:5000";
  const download_ip="http://localhost:80/api/"
  window.base_api = (typeof process.env.REACT_APP_API_URL !== 'undefined' ? process.env.REACT_APP_API_URL : `http://${server_ip}/api/`);
  window.download_api = (typeof process.env.REACT_DOWNLOAD_API_URL !== 'undefined' ? process.env.REACT_DOWNLOAD_API_URL : `${download_ip}`);
  
  //## GLOBAL VARIABLE SET STATE
  const [user,setUser] = useState(
    {
      loggedIn : null,
      fullname : "",
      admin_id : "",
      email : "",
      rank : "",
      tl_id : "",
      access_level : "",
      token : "",
      token_creation : "",
      dev_view:false,
      navTtl: "",
      navSubttl: ""
    });
  
  const mainContentRef = React.useRef(null);
  const { t, i18n } =  useTranslation();
  const getRoutes = (routes) => {
    // toggles collapse between mini sidenav and normal
  
    return routes.map((prop, key) => {
      if (prop.collapse) {
        return getRoutes(prop.views);
      }


      if (prop.layout === "/admin") {
        return (
          <Route
            path={prop.layout + prop.path}
            element={
              <>
                <AdminLayout contentRef={<prop.component />} />
              </>
            }
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };
  return (
    
    //## GLABAL VARIABLE ASSIGN TO PROVIDER
    // userContext is for the global variables
    <UserContext.Provider value={{ user, setUser }}>      
      <BrowserRouter basename={process.env.REACT_APP_BASE_NAME}>
      <Toaster position="top-center" reverseOrder={false} />
          <Routes>
              <Route element={<ProtectedRoutes/>}>
                  {getRoutes(routes)}
                  {getRoutes(otherRoutes)}
              </Route>
              <Route element={<ProtectedLogIn/>}>
                  <Route path="/login" element={<div className="main-content" ref={mainContentRef}><Login /><AuthFooter /></div>} />
                  <Route index element={<div className="main-content" ref={mainContentRef}><Login /><AuthFooter /></div>} />
              </Route>
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
