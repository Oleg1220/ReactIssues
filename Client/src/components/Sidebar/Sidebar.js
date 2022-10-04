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
import React,{useEffect,useContext} from "react";
// react library for routing
import { useLocation, NavLink as NavLinkRRD, Link } from "react-router-dom";
// nodejs library that concatenates classes
import classnames from "classnames";
// nodejs library to set properties for components
import { PropTypes } from "prop-types";
// react library that creates nice scrollbar on windows devices
import PerfectScrollbar from "react-perfect-scrollbar";
import { UserContext } from "App";
import { useTranslation, Trans } from 'react-i18next';
// reactstrap components
import {
  Collapse,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledTooltip,
} from "reactstrap";

import './Sidebar.css';


//#region (Verify and expire token add this to page where there are no select function on use Effect)
const token_expired =(error)=>{
  if(error){
    console.log("Token expired or mismatch with error: "+error);
  }
  else{
    console.log("Token expired or mismatch");
  }
  
  localStorage.removeItem("userData");
  setTimeout(() => {
    window.location.reload();
  }, 2500);
}

var count_use_effect = 0; 
export const verifyToken= async (user)=>{

  var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;
    //console.log(count_use_effect);
    if(token && token_creation){
      const payload = { token:token,_id:_user_id };
      await fetch(window.base_api+`verify-token/`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      }).then(async response => {
        // Your response to manipulate
        const records =await response.json();
  
        //console.log(records);                
        if(records.remarks=="success"){
            
        }else{
          token_expired("");
        }
      })
      .catch(error => {          
        token_expired(error);
      }); 

    } else{
      if(count_use_effect >= 2){
        console.log("Missing credentials kindly logged in");
      }
    }

 
}
//#endregion



const lngs = {
  'en-GB': { nativeName: 'English (UK)',nativeFlag:'https://countryflagsapi.com/png/gb' },
  'jp': { nativeName: 'Japanese',nativeFlag:'https://countryflagsapi.com/png/jp' }
};
function Sidebar({ toggleSidenav, sidenavOpen, routes, logo, rtlActive }) {
  const { t, i18n } = useTranslation();
  const [state, setState] = React.useState({});
  const [hoverState, setHoverState] = React.useState(true);
  const [selectedLang, setSelectedLang] = React.useState((localStorage.getItem('cms_lang')) ? localStorage.getItem('cms_lang') : 'en-US');
  const location = useLocation();
  React.useEffect(() => {
    setState(getCollapseStates(routes));
    // eslint-disable-next-line
  }, []);
  const {user,setUser} =  useContext(UserContext);
  useEffect(() => {
    verifyToken(user);

    
}, [user.token!="",location.pathname]);

  // verifies if routeName is the one active (in browser input)
  const activeRoute = (routeName) => {
    if(location.pathname.indexOf(routeName) > -1){
    }
    return location.pathname.indexOf(routeName) > -1 ? "active" : "";
  };
  // makes the sidenav normal on hover (actually when mouse enters on it)
  const onMouseEnterSidenav = () => {
    if (!document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.add("g-sidenav-show");
      setHoverState(true)
    }
  };
  // makes the sidenav mini on hover (actually when mouse leaves from it)
  const onMouseLeaveSidenav = () => {
    if (!document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.remove("g-sidenav-show");
      setHoverState(false)
    }
  };
  // this creates the intial state of this component based on the collapse routes
  // that it gets through routes
  const getCollapseStates = (routes) => {
    let initialState = {};
    routes.map((prop, key) => {
      if (prop.collapse) {
        initialState = {
          [prop.state]: getCollapseInitialState(prop.views),
          ...getCollapseStates(prop.views),
          ...initialState,
        };
      }
      return null;
    });
    return initialState;
  };
  // this verifies if any of the collapses should be default opened on a rerender of this component
  // for example, on the refresh of the page,
  // while on the src/views/forms/RegularForms.js - route /admin/regular-forms
  const getCollapseInitialState = (routes) => {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse && getCollapseInitialState(routes[i].views)) {
        return true;
      } else if (location.pathname.indexOf(routes[i].path) !== -1) {
        return true;
      }
    }
    return false;
  };
  // this is used on mobile devices, when a user navigates
  // the sidebar will autoclose
  const closeSidenav = (title,subtitle) => {    
    //onReload setting of title and subtitle is on protectedRoutes.jsx
    setUser({...user,navTtl:title,navSubttl:subtitle})
    if (window.innerWidth < 1200) {
      toggleSidenav();
    }
  };
  // this function creates the links and collapses that appear in the sidebar (left menu)
  const createLinks = (routes) => {
    return routes.map((prop, key) => {
      if (prop.redirect) {
        return null;
      }
      if (prop.collapse) {
        var st = {};
        st[prop["state"]] = !state[prop.state];
        return (
          <NavItem key={key}>
            <NavLink
              href="#pablo"
              data-toggle="collapse"
              aria-expanded={state[prop.state]}
              className={classnames({
                active: getCollapseInitialState(prop.views),
              })}
              onClick={(e) => {
                e.preventDefault();
                setState(st);
              }}
            >
              {prop.icon ? (
                <>
                  <i className={prop.icon} />
                  <span className="nav-link-text">{t(prop.name)}</span>
                </>
              ) : prop.miniName ? (
                <>
                  <span className="sidenav-mini-icon"> {prop.miniName} </span>
                  <span className="sidenav-normal"> {t(prop.name)} </span>
                </>
              ) : null}
            </NavLink>
            <Collapse isOpen={state[prop.state]}>
              <Nav className="nav-sm flex-column">
                {createLinks(prop.views)}
              </Nav>
            </Collapse>
          </NavItem>
        );
      }
     
      return (
        <NavItem className={activeRoute(prop.layout + prop.path)} key={key}>
          <NavLink
            to={prop.layout + prop.path}
            onClick={()=>closeSidenav(prop.navTitle,prop.navSubTitle)}
            tag={NavLinkRRD}
          >
            {prop.icon !== undefined ? (
              <>
                <i className={prop.icon} />
                <span className="nav-link-text">{t(prop.name)}</span>
              </>
            ) : prop.miniName !== undefined ? (
              <>
                <span className="sidenav-mini-icon"> {prop.miniName} </span>
                <span className="sidenav-normal"> {t(prop.name)} </span>
              </>
            ) : (
              prop.name
            )}
          </NavLink>
        </NavItem>
      );
    });
  };

  let navbarBrandProps;
  if (logo && logo.innerLink) {
    navbarBrandProps = {
      to: logo.innerLink,
      tag: Link,
    };
  } else if (logo && logo.outterLink) {
    navbarBrandProps = {
      href: logo.outterLink,
      target: "_blank",
    };
  }

  const changeLang = (e,lng)=>{
    e.preventDefault();
    
    i18n.changeLanguage(lng);
    localStorage.setItem('cms_lang',lng)
    setSelectedLang(lng)
  }

  const scrollBarInner = (
    <div className="scrollbar-inner">
      <div className="sidenav-header d-flex align-items-center">
        {logo ? (
          <NavbarBrand {...navbarBrandProps}>
            <img
              alt={logo.imgAlt}
              className="navbar-brand-img"
              src={logo.imgSrc}
            />
          </NavbarBrand>
        ) : null}
        <div className="ml-auto">
          <div
            className={classnames("sidenav-toggler d-none d-xl-block", {
              active: sidenavOpen,
            })}
            onClick={toggleSidenav}
          >
            <div className="sidenav-toggler-inner">
              <i className="sidenav-toggler-line" />
              <i className="sidenav-toggler-line" />
              <i className="sidenav-toggler-line" />
            </div>
          </div>
        </div>
      </div>
      <div className="navbar-inner">
        
        <Collapse navbar isOpen={true}>
          <Nav navbar>{createLinks(routes)}</Nav>
        </Collapse>
      </div>
      <footer
        className={classnames("sidenav", { 
          "d-none": !sidenavOpen,
          "d-none": !hoverState,
        })}
         style={{position:'absolute',bottom:'0',width:"100%" }} >
          <div style={{float:'right'}}>
          <UncontrolledDropdown>
            <DropdownToggle id="changeLang" style={{padding:'5px 5px 5px 5px'}} color="default">
              <img alt="..." style={{width:'40px'}} src={lngs[selectedLang]?.nativeFlag} />
              
            </DropdownToggle>
            <UncontrolledTooltip
              delay={0}
              placement="left"
              target="changeLang"
            >
              {t('select_lang')}
            </UncontrolledTooltip>
            <DropdownMenu>
              {Object.keys(lngs).map((lng) => (
                <li>
                <DropdownItem  key={lng} href="#pablo" onClick={e => {changeLang(e,lng)}}>
                  <img
                    alt="..."
                    style={{width:'25px',marginRight:'5px'}} 
                    src={lngs[lng].nativeFlag}
                  />
                  {lngs[lng].nativeName}
                </DropdownItem>
              </li>
              ))}
            </DropdownMenu>
          </UncontrolledDropdown>
          {/* {Object.keys(lngs).map((lng) => (
            <button key={lng} style={{ fontWeight: i18n.resolvedLanguage === lng ? 'bold' : 'normal' }} type="submit" onClick={() =>{i18n.changeLanguage(lng);localStorage.setItem('cms_lang',lng)}}>
              {lngs[lng].nativeName}
            </button>
          ))} */}
        </div>
         </footer>
    </div>
  );
  return (
    <Navbar
      className={
        "sidenav navbar-vertical navbar-expand-xs navbar-light bg-white " +
        (rtlActive ? "" : "fixed-left")
      }
      onMouseEnter={onMouseEnterSidenav}
      onMouseLeave={onMouseLeaveSidenav}
    >
      {navigator.platform.indexOf("Win") > -1 ? (
        <PerfectScrollbar>{scrollBarInner}</PerfectScrollbar>
      ) : (
        scrollBarInner
      )}
        
    </Navbar>
  );
}

Sidebar.defaultProps = {
  routes: [{}],
  toggleSidenav: () => {},
  sidenavOpen: false,
  rtlActive: false, 
};

Sidebar.propTypes = {
  // function used to make sidenav mini or normal
  toggleSidenav: PropTypes.func,
  // prop to know if the sidenav is mini or normal
  sidenavOpen: PropTypes.bool,
  // links that will be displayed inside the component
  routes: PropTypes.arrayOf(PropTypes.object),
  // logo
  logo: PropTypes.shape({
    // innerLink is for links that will direct the user within the app
    // it will be rendered as <Link to="...">...</Link> tag
    innerLink: PropTypes.string,
    // outterLink is for links that will direct the user outside the app
    // it will be rendered as simple <a href="...">...</a> tag
    outterLink: PropTypes.string,
    // the image src of the logo
    imgSrc: PropTypes.string.isRequired,
    // the alt for the img
    imgAlt: PropTypes.string.isRequired,
  }),
  // rtl active, this will make the sidebar to stay on the right side
  rtlActive: PropTypes.bool,
};

export default Sidebar;
