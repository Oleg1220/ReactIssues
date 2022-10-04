//DEFAULT NEEDED 
import React, { useEffect, useState,useContext } from "react";
import CardsHeader from "components/Headers/CardsHeader";
import classnames from "classnames";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Row,
  TabContent,
  TabPane,  
  Nav,
  NavItem,
  NavLink,
  Collapse, 
  Input,
  InputGroup
} from "reactstrap";

import ReactBSTablesPlain from "components/Tables/ReactBSTablesPlain";

import CustModal from "components/Modals/CustModal";
import CustButton from "components/Buttons/CustButton";
import ReactBSAlert from "react-bootstrap-sweetalert";
import ExcelReport from "components/ExportExcel/ExcelReport";
import PDFReport from "components/ExportPDF/PDFReport";
import { UserContext,_dataService } from "App";
import DownloadOptions from "../../../../layouts/modals/DownloadOptions";

//
//Cusom Modal
//ACCESS LEVEL
import AddAccessLevel from './AddAccessLevel';
import EditAccessLevel from './EditAccessLevel';

//Module
import AddModule from './AddModule';
import EditModule from './EditModule';

//Sections
import AddSection from './AddSection';
import EditSection from './EditSection';

//Action
import AddAction from './AddAction';
import EditAction from './EditAction';



//Mock Data
import { dataTable } from "variables/general";
import { useParams,useNavigate, useLocation } from "react-router-dom";
import { element } from "prop-types";


const Templates = require('components/ExportPDF/Templates/TemplateLocType');

//GLOBAL VARIABLE
//currentAccessLevel is for httpRequest
//useState returns delay value or the last value set not the current
var currentAccessLevelAPI = "";
var currentModuleAPI = "";
var currentSectionAPI = "";
var count_use_effect=0;

function AccessLevel() {
  const params = useParams();

  const navigate = useNavigate();
  const {user,setUser} = useContext(UserContext);
  const [accessLevelList, setaccessLevelList] = useState([]);

  const [moduleList, setModuleList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [actionList, setActionList] = useState([]);
  
  //USED FOR JSX PARAMETERS SUCH AS MODALS AND is_ACITVE
  const [currentAccessLevel, setcurrentAccessLevel] = useState("");
  const [currentModuleID, setcurrentModuleID] = useState("");
  const [currentSectionID, setcurrentSectionID] = useState("");
   
  var batch_List = [];
  var batch_ArchiveList = [];
  const [tabsState, setTabsState] = useState({ tabs: 1 });

  //Used for passing excelData, data can be set by processExcel
  //Then because of useState when btn-excel is clicked passed data will also change
  const [ExcelData, setExcelData] = useState([]);
  const [PDFData, setPDFData] = useState("");

  useEffect(() => {
    
    _getAccessLevels(user,setaccessLevelList);       

    return;
  }, [user.token!=""]);
    

  //THIS METHOD IS FOR FORCING UPDATE RENDER
    const [state, updateState] = useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);
  //

  //#region CRUD
    const addCallback = async (status) => {
        
      switch (status) {
        case "success":
          setOpenAlert(
            <ReactBSAlert
              success
              style={{ display: "block", marginTop: "-100px" }}
              title="Success"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="success"
              confirmBtnText="Ok"
              btnSize=""
            >
              Access Level: has been successfully added.
            </ReactBSAlert>
          );
          _getAccessLevels(user,setaccessLevelList); 
          toggleModal();
          break;

        case "existing":
          setOpenAlert(
            <ReactBSAlert
              warning
              style={{ display: "block", marginTop: "-100px" }}
              title="Warning"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
              Location already exists.
            </ReactBSAlert>
          );
          break;
        case "Bad Token":
          setOpenAlert(
            <ReactBSAlert
              danger
              style={{ display: "block", marginTop: "-100px" }}
              title="Warning"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
              Session Expired / Session Mismatch
            </ReactBSAlert>          
          );

          localStorage.removeItem("userData");
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          break;
          default:
          toggleModal();
          break;
      }
    };
    
    const editCallback = async (status) => {
      
      switch (status) {
        case "success":
          setOpenAlert(
            <ReactBSAlert
              success
              style={{ display: "block", marginTop: "-100px" }}
              title="Success"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="success"
              confirmBtnText="Ok"
              btnSize=""
            >
              Access Level: has been successfully updated.
            </ReactBSAlert>
          );
          _getAccessLevels(user,setaccessLevelList);       
          setEditOpenModal(!openEditPopup);
          break;

          case "failed-fetch":
            setOpenAlert(
              <ReactBSAlert
                warning
                style={{ display: "block", marginTop: "-100px" }}
                title="Warning"
                onConfirm={() => hideAlert()}
                onCancel={() => hideAlert()}
                confirmBtnBsStyle="warning"
                confirmBtnText="Ok"
                btnSize=""
              >
              Access Level cannot be found
              </ReactBSAlert>
            );
            setEditOpenModal(!openEditPopup);
          break;
          case "failed":
            setOpenAlert(
              <ReactBSAlert
                warning
                style={{ display: "block", marginTop: "-100px" }}
                title="Warning"
                onConfirm={() => hideAlert()}
                onCancel={() => hideAlert()}
                confirmBtnBsStyle="warning"
                confirmBtnText="Ok"
                btnSize=""
              >
              Access Level failed to update
              </ReactBSAlert>              
            );
            setEditOpenModal(!openEditPopup);
          break;
          case "Bad Token":
          setOpenAlert(
            <ReactBSAlert
              danger
              style={{ display: "block", marginTop: "-100px" }}
              title="Warning"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
              Session Expired / Session Mismatch
            </ReactBSAlert>          
          );

          localStorage.removeItem("userData");
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          break;
          default:
            setEditOpenModal(!openEditPopup);
          break;
      }
    };
    
    const proceedDelete = async (id,name) => {
      
      var token = user.token;
      var _user_id = user.admin_id;
      var _fullname = user.fullname;
      const _payload = {  
        payload: { action_id:id, access_level:currentAccessLevelAPI,module_id: currentModuleAPI,section_id:currentSectionAPI },
        auth: { token: token, _id: _user_id, _fullname: _fullname }
      };
        

      var requestOptions = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`remove_al_actions/${id}`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;  

        if(records.remarks=="success"){

          setOpenAlert(
            <ReactBSAlert
              success
              style={{ display: "block", marginTop: "-100px" }}
              title="Deleted!"
              onConfirm={hideAlert}
              onCancel={hideAlert}
              confirmBtnBsStyle="primary"
              confirmBtnText="Ok"
              btnSize=""
            >
              Action has been removed.
            </ReactBSAlert>
          );
          _getRecords(user,setActionList,0,"get_al_actions/");

        }else{
          if(records.remarks =="Bad Token"){
            setOpenAlert(
            <ReactBSAlert
              danger
              style={{ display: "block", marginTop: "-100px" }}
              title="Warning"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
              Session Expired / Session Mismatch
            </ReactBSAlert>          
          );
          
          localStorage.removeItem("userData");
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          }else{
            console.log("Error occured with message "+records.remarks);
          }                 
        }

      });
      
    };

    const permanentDelete = async (id, name) => {
      
      var token = user.token;
      var _user_id = user.admin_id;
      var _fullname = user.fullname;
      const _payload = {  
        payload: { ...moduleList },
        auth: { token: token, _id: _user_id, _fullname: _fullname }
      };


      var requestOptions = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`delete_location/${id}`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
        if(records.remarks=="success"){

          const newRecords = moduleList.filter((el) => el._id !== id);
          setModuleList  (newRecords);
          setOpenAlert(
            <ReactBSAlert
              success
              style={{ display: "block", marginTop: "-100px" }}
              title="Deleted!"
              onConfirm={hideAlert}
              onCancel={hideAlert}
              confirmBtnBsStyle="primary"
              confirmBtnText="Ok"
              btnSize=""
            >
              Location type has been deleted.
            </ReactBSAlert>
          );
        }else{
          if(records.remarks =="Bad Token"){
            setOpenAlert(
            <ReactBSAlert
              danger
              style={{ display: "block", marginTop: "-100px" }}
              title="Warning"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
              Session Expired / Session Mismatch
            </ReactBSAlert>          
          );
          
          localStorage.removeItem("userData");
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          }else{
            console.log("Error occured with message "+records.remarks);
          }                 
        }
      });
      
    }; 

    const restore = async (id,name)=>{
      var token = user.token;
      var _user_id = user.admin_id;
      var _fullname = user.fullname;
      const _payload = {  
        payload: { ...moduleList },
        auth: { token: token, _id: _user_id, _fullname: _fullname }
      };
        
      var requestOptions = {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`restore/locations/${id}`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                

        //console.log(records);                
        if(records.remarks=="success"){

          if(tabsState.tabs==1){
            _getRecords(user,setModuleList,0,"get_al_modules/");
          }else{
            const newRecords = moduleList.filter((el) => el._id !== id);
            setModuleList  (newRecords);            
          }
        
          setOpenAlert(
            <ReactBSAlert
              success
              style={{ display: "block", marginTop: "-100px" }}
              title="Restored!"
              onConfirm={hideAlert}
              onCancel={hideAlert}
              confirmBtnBsStyle="success"
              confirmBtnText="Ok"
              btnSize=""
            >
              Location type has been restored.
            </ReactBSAlert>
          );
        }else{
          if(records.remarks =="Bad Token"){
            setOpenAlert(
              <ReactBSAlert
                danger
                style={{ display: "block", marginTop: "-100px" }}
                title="Warning"
                onConfirm={() => hideAlert()}
                onCancel={() => hideAlert()}
                confirmBtnBsStyle="warning"
                confirmBtnText="Ok"
                btnSize=""
              >
                Session Expired / Session Mismatch
              </ReactBSAlert>          
            );
            
            localStorage.removeItem("userData");
              setTimeout(() => {
                window.location.reload();
              }, 2500);
          }else{
            console.log("Error occured with message "+records.remarks);
          }                 
        }
      });

    }

    //Module

    const addModuleCallback = async (status) => {
        
      switch (status) {
        case "success":
          setOpenAlert(
            <ReactBSAlert
              success
              style={{ display: "block", marginTop: "-100px" }}
              title="Success"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="success"
              confirmBtnText="Ok"
              btnSize=""
            >
              Access Level: has been successfully added.
            </ReactBSAlert>
          );
          _getAccessLevels(user,setaccessLevelList); 
          setopenAddModulePopup(!openAddModulePopup);
          break;

        case "existing":
          setOpenAlert(
            <ReactBSAlert
              warning
              style={{ display: "block", marginTop: "-100px" }}
              title="Warning"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
              Module already exists.
            </ReactBSAlert>
          );
          break;
        case "Bad Token":
          setOpenAlert(
            <ReactBSAlert
              danger
              style={{ display: "block", marginTop: "-100px" }}
              title="Warning"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
              Session Expired / Session Mismatch
            </ReactBSAlert>          
          );

          localStorage.removeItem("userData");
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          break;
          default:
            setopenAddModulePopup(!openAddModulePopup);
          break;
      }
    };
    const editModuleCallback = async (status) => {
      
      switch (status) {
        case "success":
        setOpenAlert(
          <ReactBSAlert
            success
            style={{ display: "block", marginTop: "-100px" }}
            title="Success"
            onConfirm={() => hideAlert()}
            onCancel={() => hideAlert()}
            confirmBtnBsStyle="success"
            confirmBtnText="Ok"
            btnSize=""
          >
            Module: has been successfully updated.
          </ReactBSAlert>
        );
        
        setEditOpenModuleModal(!openEditModulePopup);
        break;
        case "deleted":
          setOpenAlert(
            <ReactBSAlert
              success
              style={{ display: "block", marginTop: "-100px" }}
              title="Success"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="success"
              confirmBtnText="Ok"
              btnSize=""
            >
              Module: has been successfully Removed.
            </ReactBSAlert>
          );
          
          setEditOpenModuleModal(!openEditModulePopup);
          _getRecords(user,setModuleList,0,"get_al_modules/"); 
        break;
        case "failed-delete":
          setOpenAlert(
            <ReactBSAlert
              warning
              style={{ display: "block", marginTop: "-100px" }}
              title="Warning"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
              Failed to removed Module
            </ReactBSAlert>              
          );
          setEditOpenModuleModal(!openEditModulePopup);
        break;
        case "failed-fetch":
          setOpenAlert(
            <ReactBSAlert
              warning
              style={{ display: "block", marginTop: "-100px" }}
              title="Warning"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
            Module cannot be found
            </ReactBSAlert>
          );
          setEditOpenModuleModal(!openEditModulePopup);
        break;
        case "failed":
          setOpenAlert(
            <ReactBSAlert
              warning
              style={{ display: "block", marginTop: "-100px" }}
              title="Warning"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
            Module failed to update
            </ReactBSAlert>              
          );
          setEditOpenModuleModal(!openEditModulePopup);
        break;
        case "Bad Token":
        setOpenAlert(
          <ReactBSAlert
            danger
            style={{ display: "block", marginTop: "-100px" }}
            title="Warning"
            onConfirm={() => hideAlert()}
            onCancel={() => hideAlert()}
            confirmBtnBsStyle="warning"
            confirmBtnText="Ok"
            btnSize=""
          >
            Session Expired / Session Mismatch
          </ReactBSAlert>          
        );

        localStorage.removeItem("userData");
          setTimeout(() => {
            window.location.reload();
          }, 2500);
        break;
        default:
          setEditOpenModal(!openEditPopup);
        break;
      }
    };  

    //Section

    const addSectionCallback = async (status) => {
        
      switch (status) {
        case "success":
          setOpenAlert(
            <ReactBSAlert
              success
              style={{ display: "block", marginTop: "-100px" }}
              title="Success"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="success"
              confirmBtnText="Ok"
              btnSize=""
            >
              Section: has been successfully added.
            </ReactBSAlert>
          );
          _getRecords(user,setSectionList,0,"get_al_sections/");
          //_getRecords(user,setSectionList,0,"get_al_sections/");
          setOpenAddSectionPopup(!openAddSectionPopup);
          break;

        case "existing":
          setOpenAlert(
            <ReactBSAlert
              warning
              style={{ display: "block", marginTop: "-100px" }}
              title="Warning"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
              Section already exists.
            </ReactBSAlert>
          );
          break;
        case "Bad Token":
          setOpenAlert(
            <ReactBSAlert
              danger
              style={{ display: "block", marginTop: "-100px" }}
              title="Warning"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
              Session Expired / Session Mismatch
            </ReactBSAlert>          
          );

          localStorage.removeItem("userData");
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          break;
          default:
            setopenAddModulePopup(!openAddModulePopup);
          break;
      }
    };
    const editSectionCallback = async (status) => {
          
          switch (status) {
            case "success":
            setOpenAlert(
              <ReactBSAlert
                success
                style={{ display: "block", marginTop: "-100px" }}
                title="Success"
                onConfirm={() => hideAlert()}
                onCancel={() => hideAlert()}
                confirmBtnBsStyle="success"
                confirmBtnText="Ok"
                btnSize=""
              >
                Section: has been successfully updated.
              </ReactBSAlert>
            );
            
            setOpenEditSectionModal(!openEditSectionPopup);
            break;
            case "deleted":
              setOpenAlert(
                <ReactBSAlert
                  success
                  style={{ display: "block", marginTop: "-100px" }}
                  title="Success"
                  onConfirm={() => hideAlert()}
                  onCancel={() => hideAlert()}
                  confirmBtnBsStyle="success"
                  confirmBtnText="Ok"
                  btnSize=""
                >
                  Section: has been successfully Removed.
                </ReactBSAlert>
              );
              var secList = sectionList;
              secList = secList.filter((el)=> el._id !== editSectionID)
              setSectionList(secList);
              forceUpdate()
              setOpenEditSectionModal(!openEditSectionPopup);              
            break;
            case "failed-delete":
              setOpenAlert(
                <ReactBSAlert
                  warning
                  style={{ display: "block", marginTop: "-100px" }}
                  title="Warning"
                  onConfirm={() => hideAlert()}
                  onCancel={() => hideAlert()}
                  confirmBtnBsStyle="warning"
                  confirmBtnText="Ok"
                  btnSize=""
                >
                  Failed to removed Section
                </ReactBSAlert>              
              );
              setOpenEditSectionModal(!openEditSectionPopup);              
            break;
            case "failed-fetch":
              setOpenAlert(
                <ReactBSAlert
                  warning
                  style={{ display: "block", marginTop: "-100px" }}
                  title="Warning"
                  onConfirm={() => hideAlert()}
                  onCancel={() => hideAlert()}
                  confirmBtnBsStyle="warning"
                  confirmBtnText="Ok"
                  btnSize=""
                >
                Section cannot be found
                </ReactBSAlert>
              );
              setEditOpenModuleModal(!openEditModulePopup);
            break;
            case "failed":
              setOpenAlert(
                <ReactBSAlert
                  warning
                  style={{ display: "block", marginTop: "-100px" }}
                  title="Warning"
                  onConfirm={() => hideAlert()}
                  onCancel={() => hideAlert()}
                  confirmBtnBsStyle="warning"
                  confirmBtnText="Ok"
                  btnSize=""
                >
                Section failed to update
                </ReactBSAlert>              
              );
              setEditOpenModuleModal(!openEditModulePopup);
            break;
            case "Bad Token":
            setOpenAlert(
              <ReactBSAlert
                danger
                style={{ display: "block", marginTop: "-100px" }}
                title="Warning"
                onConfirm={() => hideAlert()}
                onCancel={() => hideAlert()}
                confirmBtnBsStyle="warning"
                confirmBtnText="Ok"
                btnSize=""
              >
                Session Expired / Session Mismatch
              </ReactBSAlert>          
            );

            localStorage.removeItem("userData");
              setTimeout(() => {
                window.location.reload();
              }, 2500);
            break;
            default:
              setEditOpenModal(!openEditPopup);
            break;
          }
    };  

    //Section

    const addActionCallback = async (status) => {
        
      switch (status) {
        case "success":
          setOpenAlert(
            <ReactBSAlert
              success
              style={{ display: "block", marginTop: "-100px" }}
              title="Success"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="success"
              confirmBtnText="Ok"
              btnSize=""
            >
              Action: has been successfully added.
            </ReactBSAlert>
          );
          _getRecords(user,setActionList,0,"get_al_Actions/");
          //_getRecords(user,setActionList,0,"get_al_Actions/");
          setOpenAddActionPopup(!openAddActionPopup);
          break;

        case "existing":
          setOpenAlert(
            <ReactBSAlert
              warning
              style={{ display: "block", marginTop: "-100px" }}
              title="Warning"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
              Action already exists.
            </ReactBSAlert>
          );
          break;
        case "Bad Token":
          setOpenAlert(
            <ReactBSAlert
              danger
              style={{ display: "block", marginTop: "-100px" }}
              title="Warning"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
              Session Expired / Session Mismatch
            </ReactBSAlert>          
          );

          localStorage.removeItem("userData");
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          break;
          default:
            setopenAddModulePopup(!openAddModulePopup);
          break;
      }
    };
    const editActionCallback = async (status) => {
          
          switch (status) {
            case "success":
            setOpenAlert(
              <ReactBSAlert
                success
                style={{ display: "block", marginTop: "-100px" }}
                title="Success"
                onConfirm={() => hideAlert()}
                onCancel={() => hideAlert()}
                confirmBtnBsStyle="success"
                confirmBtnText="Ok"
                btnSize=""
              >
                Action: has been successfully updated.
              </ReactBSAlert>
            );
            
            setOpenEditActionModal(!openEditActionPopup);
            break;
            case "deleted":
              setOpenAlert(
                <ReactBSAlert
                  success
                  style={{ display: "block", marginTop: "-100px" }}
                  title="Success"
                  onConfirm={() => hideAlert()}
                  onCancel={() => hideAlert()}
                  confirmBtnBsStyle="success"
                  confirmBtnText="Ok"
                  btnSize=""
                >
                  Action: has been successfully Removed.
                </ReactBSAlert>
              );
              var secList = actionList;
              secList = secList.filter((el)=> el._id !== editActionID)
              setActionList(secList);
              forceUpdate()
              setOpenEditActionModal(!openEditActionPopup);              
            break;
            case "failed-delete":
              setOpenAlert(
                <ReactBSAlert
                  warning
                  style={{ display: "block", marginTop: "-100px" }}
                  title="Warning"
                  onConfirm={() => hideAlert()}
                  onCancel={() => hideAlert()}
                  confirmBtnBsStyle="warning"
                  confirmBtnText="Ok"
                  btnSize=""
                >
                  Failed to removed Action
                </ReactBSAlert>              
              );
              setOpenEditActionModal(!openEditActionPopup);              
            break;
            case "failed-fetch":
              setOpenAlert(
                <ReactBSAlert
                  warning
                  style={{ display: "block", marginTop: "-100px" }}
                  title="Warning"
                  onConfirm={() => hideAlert()}
                  onCancel={() => hideAlert()}
                  confirmBtnBsStyle="warning"
                  confirmBtnText="Ok"
                  btnSize=""
                >
                Action cannot be found
                </ReactBSAlert>
              );
              setEditOpenModuleModal(!openEditModulePopup);
            break;
            case "failed":
              setOpenAlert(
                <ReactBSAlert
                  warning
                  style={{ display: "block", marginTop: "-100px" }}
                  title="Warning"
                  onConfirm={() => hideAlert()}
                  onCancel={() => hideAlert()}
                  confirmBtnBsStyle="warning"
                  confirmBtnText="Ok"
                  btnSize=""
                >
                Action failed to update
                </ReactBSAlert>              
              );
              setEditOpenModuleModal(!openEditModulePopup);
            break;
            case "Bad Token":
            setOpenAlert(
              <ReactBSAlert
                danger
                style={{ display: "block", marginTop: "-100px" }}
                title="Warning"
                onConfirm={() => hideAlert()}
                onCancel={() => hideAlert()}
                confirmBtnBsStyle="warning"
                confirmBtnText="Ok"
                btnSize=""
              >
                Session Expired / Session Mismatch
              </ReactBSAlert>          
            );

            localStorage.removeItem("userData");
              setTimeout(() => {
                window.location.reload();
              }, 2500);
            break;
            default:
              setEditOpenModal(!openEditPopup);
            break;
          }
    };  

  //#endregion


  
  const toggleTabs = (e, statesss, index) => {
    e.preventDefault();    
    if(index != currentAccessLevel){  
      currentAccessLevelAPI=index;      
      setcurrentAccessLevel(index);   
      forceUpdate();   
      //Tabs is either 1 or 2

      _getRecords(user,setModuleList,tabsState.tabs-1,"get_al_modules/");
      setopenedCollapseModule([]);
      setopenedCollapseSection([]);
      forceUpdate();  
   
    }
  
  };
  //#region Modals Events and Variables
    const [alertState, setAlertState] = useState({ alert: "" });

    //USER ACCESS
      const [openAddPopup, setAddOpenModal] = useState(false);
      const [openEditPopup, setEditOpenModal] = useState(false);
      const [editID, setEditID] = useState(null);
    
      const [openDownloadPopup, setDownloadPopup] = useState(false);  
      const [openAlert, setOpenAlert] = useState(null);

      const toggleModal = async (e) => {     
      
      await setAddOpenModal(!openAddPopup);
      };
      const toggleModalDownload = async () => {
        await setDownloadPopup(!openDownloadPopup);
      };
      const toggleModaledit = (e,id) => {   
        
        setEditID(id);
        setEditOpenModal(!openEditPopup);
        forceUpdate();
      };


    //#region Module Modals
      const [openAddModulePopup, setopenAddModulePopup] = useState(false);
      const [openEditModulePopup, setEditOpenModuleModal] = useState(false);
      const [editModuleID, setEditModuleID] = useState(null);
      //


      const toggleModuleModal = async (e) => {     
        await setopenAddModulePopup(!openAddModulePopup);
      };

      const toggleModuleModaledit = (e,id) => {   
        
        if(e !==undefined){
          e.stopPropagation();
        }
        setEditModuleID(id);
        setEditOpenModuleModal(!openEditModulePopup);
        
      };

    //#endregion

    //#region Section Modals
      const [openAddSectionPopup, setOpenAddSectionPopup] = useState(false);
      const [openEditSectionPopup, setOpenEditSectionModal] = useState(false);
      const [editSectionID, setEditSectionID] = useState(null);
      //


      const toggleSectionModal = async (e,id) => {     
        
        if(e !==undefined && openedCollapseModule.includes("module-"+id)){
          e.stopPropagation();
        }
        setcurrentModuleID(id);
        currentModuleAPI = id;
        
        await setOpenAddSectionPopup(!openAddSectionPopup);
      };

      const toggleSectionModaledit = (e,id,module_id) => {   
        
        if(e !==undefined){
          e.stopPropagation();
        }
        setEditSectionID(id);
        setcurrentModuleID(module_id);
        setOpenEditSectionModal(!openEditSectionPopup);
        
      };
    //#endregion

    //#region Action Modals
      const [openAddActionPopup, setOpenAddActionPopup] = useState(false);
      const [openEditActionPopup, setOpenEditActionModal] = useState(false);
      const [editActionID, setEditActionID] = useState(null);
      const [editActionStatus, setActionStatus] = useState(0);
      const toggleActionModal = async (e,id,module_id) => {     
        
        if(e !==undefined && openedCollapseSection.includes("section-"+id)){
          e.stopPropagation();
        }
        

        setcurrentSectionID(id)
        setcurrentModuleID(module_id);
        currentSectionAPI = id;
        
        await setOpenAddActionPopup(!openAddActionPopup);
      };

      const toggleActionModaledit = (e,id,status) => {   
        
        if(e !==undefined){
          e.stopPropagation();
        }
        setEditActionID(id);
        
        setActionStatus(status);
        //setcurrentModuleID(module_id);    
        forceUpdate();
        setOpenEditActionModal(!openEditActionPopup);
    
        
      };
    //#endregion
    const hideAlert = () => {
      setOpenAlert(null);
    };
    const confirmDeleteAlert = (id) => {
      
      setOpenAlert(
        <ReactBSAlert
          warning
          style={{ display: "block", marginTop: "-100px" }}
          title="Are you sure?"
          onConfirm={hideAlert}
          onCancel={()=>proceedDelete(id)}
          showCancel
          confirmBtnBsStyle="secondary"
          confirmBtnText="Cancel"
          cancelBtnBsStyle="danger"
          cancelBtnText="Yes, delete it!"
          btnSize=""
        >
          This will delete the data
        </ReactBSAlert>
      );
    };
    const confirmPermanentDeleteAlert = (id) => {
      
      setOpenAlert(
        <ReactBSAlert
          warning
          style={{ display: "block", marginTop: "-100px" }}
          title="Are you sure?"
          onConfirm={hideAlert}
          onCancel={()=>permanentDelete(id)}
          showCancel
          confirmBtnBsStyle="secondary"
          confirmBtnText="Cancel"
          cancelBtnBsStyle="danger"
          cancelBtnText="Yes, delete it!"
          btnSize=""
        >
          You won't be able to revert this!
        </ReactBSAlert>
      );
    };
  //#endregion



  //#region Get Records and disiplay card body

    const [openedCollapseModule, setopenedCollapseModule] = useState([]);
   
    const [openedCollapseSection, setopenedCollapseSection] = useState([]);

    const collapsesToggle = (_callback,_component,collapse) => {
      var opened =[];
      opened = _component;   
      if(setopenedCollapseModule == _callback){
        setopenedCollapseSection([]);
      } 
      if (opened.includes(collapse)) {
        
        opened = opened.filter((el) => el !== collapse);
        _callback(opened);
      } else {
        opened =[];
        opened.push(collapse);
        _callback(opened);
      }
      forceUpdate();
    };

    async function _getAccessLevels(user,callback){

      var token = user.token;
      var _user_id = user.admin_id;
      var token_creation = user.token_creation;
      count_use_effect++;      
      
      if(token && token_creation ){
        const _payload = { 
          auth:{
            token:token,
            _id:_user_id
          },
          payload:{is_archived:0} 
        };

        var requestOptions = {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(_payload)
        };
          
        _dataService.CRUD(window.base_api+`get_access_levels/`,requestOptions, async (response)=>{

          // Your response to manipulate
          const records =response;                
          if(records.remarks=="success"){
            if(records.payload.result.length > 0 ){
              const resPayload = records.payload["result"];                
              callback(resPayload);              
              currentAccessLevelAPI = resPayload[0]._id;
              setcurrentAccessLevel(resPayload[0]._id);
              forceUpdate();                  
              _getRecords(user,setModuleList,0,"get_al_modules/"); 

                                  
            }else{
              callback([]);
              
            }
          }else{
            if(records.remarks =="Bad Token"){
              setOpenAlert(
                <ReactBSAlert
                  danger
                  style={{ display: "block", marginTop: "-100px" }}
                  title="Warning"
                  onConfirm={() => hideAlert()}
                  onCancel={() => hideAlert()}
                  confirmBtnBsStyle="warning"
                  confirmBtnText="Ok"
                  btnSize=""
                >
                  Session Expired / Session Mismatch
                </ReactBSAlert>          
              );
              
              localStorage.removeItem("userData");
                setTimeout(() => {
                  window.location.reload();
                }, 2500);
            }else{
              console.log("Error occured with message "+records.remarks);
            }                 
          }
        });

      }
      else{
        if(count_use_effect >= 2){
          console.log("Missing credentials kindly logged in");
        }
      }
    }

    function _getTabs(){

      return (
        <Nav
          className="flex-column flex-md-row"
          id="tabs-icons-text"
          pills
          role="tablist"
        >

        {
          accessLevelList.map(function(item, i){            
            return (         
              <NavItem size="cust-md" key={"navItem-"+i} className="mt-1">                
                <NavLink key={"navLink-"+i}
                  aria-selected={currentAccessLevel === item._id}
                  className={classnames("mb-sm-3 mb-md-0" , {
                    active: currentAccessLevel === item._id,
                  })}
                  onClick={(e) => toggleTabs(e, "tabs", item._id)}
                  href={"#"+item.name}
                  role="tab"
                >
                  {item.name}
                </NavLink>
              </NavItem>
            )
          })
          
        }   
        <Row>
          <Col xl="2">
            <CustButton 
                _text="" 
                _onClick={toggleModal} 
                _id={`addBtnAccessLevel`} 
                _classes={"btn-primary btn-sm"}
                _style={{borderRadius:"50%",height:"32px",marginTop:"11px"}}
                _type="button" 
                _tooltip="Add Access Level"
                _color="default"
                _icon="fas fa-plus" 
                _hidden ={false}
              />        
          </Col> 

          <Col xl="2" style={{marginLeft:'10px'}}>
            <CustButton
                _text=""
                _id={`editBtn_accessLevel`}
                _type="button"
                _classes={"btn-primary btn-sm"}
                _style={{borderRadius:"50%",height:"32px",marginTop:"11px"}}
                _onClick={(e)=>toggleModaledit()}
                _color="default"
                _icon="fas fa-pen"
              
                _tooltip="Edit Access Level"
              />

          </Col> 

        </Row>       
           
        </Nav>


      )
      
    }    

    async function _getRecords(user,callback,archived,get_collection){

      //## Disable delete selected on load
      //Props not removing disable on run

      //setMultiplelist([]);
      //

      var token = user.token;
      var _user_id = user.admin_id;
      var token_creation = user.token_creation;      
      
      if(token && token_creation){
        const _payload = { 
          auth:{
            token:token,
            _id:_user_id
          },
          payload:{ 
            is_archived: (archived),
            access_level:currentAccessLevelAPI,
            module_id:currentModuleAPI,
            section_id:currentSectionAPI,
          } 
        };
          
        if(currentAccessLevelAPI==""){
          return;
        }

        var requestOptions = {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(_payload)
        };
          
        _dataService.CRUD(window.base_api+get_collection,requestOptions, async (response)=>{

          // Your response to manipulate
          const records =response;                
          if(records.remarks=="success"){
            if(records.payload.result.length > 0 ){
              const resPayload = records.payload["result"];                
              callback(resPayload);
              forceUpdate();
            }else{
              callback([]);
              forceUpdate();
              console.log("No records fetch");
            }
          }else{
            if(records.remarks =="Bad Token"){
              setOpenAlert(
                <ReactBSAlert
                  danger
                  style={{ display: "block", marginTop: "-100px" }}
                  title="Warning"
                  onConfirm={() => hideAlert()}
                  onCancel={() => hideAlert()}
                  confirmBtnBsStyle="warning"
                  confirmBtnText="Ok"
                  btnSize=""
                >
                  Session Expired / Session Mismatch
                </ReactBSAlert>          
              );
              
              localStorage.removeItem("userData");
                setTimeout(() => {
                  window.location.reload();
                }, 2500);
            }else{
              console.log("Error occured with message "+records.remarks);
            }                 
          }
        });

      }
      else{
        if(count_use_effect >= 2){
          console.log("Missing credentials kindly logged in");
        }
      }
    }

    const _getSections = (module_id,_callback,_component,collapse) => {


      
      var opened = _component;    

     
      if (!opened.includes(collapse) ) {
        setcurrentModuleID(module_id)
        currentModuleAPI = module_id;
        _getRecords(user,setSectionList,0,"get_al_sections/");           
      }

      collapsesToggle(_callback,_component,collapse);
      forceUpdate();
    };

    const _getActions = (section_id,_callback,_component,collapse) => {
      
      var opened = _component;
      if (!opened.includes(collapse)) {
        currentSectionAPI = section_id;
        setcurrentSectionID(section_id);
        _getRecords(user,setActionList,0,"get_al_actions/");
        
      }

      collapsesToggle(_callback,_component,collapse);    

      forceUpdate();
    };

    const tableCols = [
      {
        dataField: "name",
        text: "Name",
        sort: true,
        headerStyle: { width: "30%" },
      },
      {
        dataField: "status",
        text: "Status",
        headerStyle: { width: "20%" },
        sort: true,
        formatter: (cell, row, rowIndex) => {
          return (
            <>
              {
              /* <InputGroup>
                <label class="custom-toggle custom-toggle-success">
                <Input
                    type="checkbox"
                    id="name"
                    checked={row.status==1?true:false}
                    onChange={(e) => handleSliderChange(e)}
                />
                <span class="custom-toggle-slider rounded-circle "></span>
                </label> */}
                <label><span className={row.status === 1 ? "text-success" : "text-danger"}>

                </span>{" "}
                {row.status=== 1 ? "Active" : "Inactive"}</label>
              {/* </InputGroup> */}

            </>
          );
        },
      },
      {
        dataField: "name",
        text: "Action",
        sort: false,
        isDummyField: true,
        headerStyle: { width: "20%" },
        formatter: (cell, row, rowIndex) => {
          return (
            <>
              <CustButton
                _text="Edit"
                _id={`editBtn_${row.name}`}
                _type="button"
                _onClick={(e)=>toggleActionModaledit(e,row._id,row.status)}
                _color="default"
                _icon="fas fa-pen"
                _size="cust-md"
              />
              <CustButton
                _text="Remove Action"
                _id={`deleteBtn_${row.name}`}
                _type="button"
                _color="danger"
                _icon="fas fa-trash-alt"
                _onClick={()=>confirmDeleteAlert(row._id)}
                _size="cust-md"
              />
            </>
          );
        },
      },
    ];

    function handleSliderChange(e){
        
      var enable = e.target.checked;
      
    }

    function _displayModule(){
      
      return(<CardBody>
        <div className="accordion">

          {moduleList.map((element)=>{  
                
            return(
              <>
                <Card className="card-plain">
                  <CardHeader
                    id={"module-"+element._id}
                    key={"module-"+element._id}
                    role="tab"
                    onClick={() => _getSections(element._id,setopenedCollapseModule,openedCollapseModule,"module-"+element._id)}
                    aria-expanded={openedCollapseModule.includes(
                      "module-"+element._id
                    )}
                  >
                    <h5 className="mb-0">{element.name}
                      <span class="badge badge-secondary">
                      {/* <i className="fas fa-pen" onClick={toggleModal} /> */}
                        <CustButton 
                          _text="" 
                          _onClick={(e)=>toggleModuleModaledit(e,element._id)} 
                          _classes={" btn btn-primary btn-sm "}
                          _id={`editModule`+element._id} 
                          _type="button" 
                          _icon="fas fa-pen" 
                          _tooltip="Edit Module"
                          _hidden ={false}
                        />
                        <CustButton 
                            
                            _classes={" btn btn-primary btn-sm "}
                            _onClick={(e)=>toggleSectionModal(e,element._id)} 
                            _id={`addSectionBtn`+element._id} 
                            _type="button" 
                            _icon="fas fa-plus" 
                            _tooltip="Add Section"
                            _hidden ={false}/>
                      </span>
                    </h5>
                        
                  </CardHeader>
                  
                  <Collapse
                      role="tabpanel"
                      isOpen={openedCollapseModule.includes("module-"+element._id)}
                    >
                      <CardBody>


                      { sectionList.length<=0? <CardBody><p>No Page Section Fetched</p></CardBody> :  _displaySections(element._id)}                        
                      </CardBody>
                  </Collapse>
                </Card>
              </>
            );
          })}
        </div>
      </CardBody>)
    }

    function _displaySections(module_id){
      
      return(
        <>
        {
          sectionList.map((element)=>{
          
            return(
              <Card className="card-plain">
                <CardHeader
                  role="tab"
                  onClick={() => _getActions(element._id,setopenedCollapseSection,openedCollapseSection,"section-"+element._id)}
                  aria-expanded={openedCollapseSection.includes(
                    "section-"+element._id
                  )}
                >
                  <h5 className="mb-0">{element.name}
                  <span class="badge badge-secondary">
                      {/* <i className="fas fa-pen" onClick={toggleModal} /> */}
                        <CustButton 
                          _text="" 
                          _onClick={(e)=>toggleSectionModaledit(e,element._id,module_id)} 
                          _classes={" btn btn-primary btn-sm "}
                          _id={`editAction`+element._id} 
                          _type="button" 
                          _icon="fas fa-pen" 
                          _tooltip="Edit Action"
                          _hidden ={false}
                        />
                        <CustButton 
                            
                            _classes={" btn btn-primary btn-sm "}
                            _onClick={(e)=>toggleActionModal(e,element._id,module_id)} 
                            _id={`addActionbtn`+element._id} 
                            _type="button" 
                            _icon="fas fa-plus" 
                            _tooltip="Add Action"
                            _hidden ={false}/>
                      </span>
                  
                  </h5>
                </CardHeader>
                <Collapse
                    role="tabpanel"
                    isOpen={openedCollapseSection.includes("section-"+element._id)}
                  >
                    <CardBody>                      
                    {actionList.length<=0? <CardBody><p>No Section Fetched</p></CardBody>:_displayActions() }
                    </CardBody>
                </Collapse>
              </Card>
            )
          
          })
        }
        </>
        
      )
    }

    function _displayActions(){
      
      return(
        <>

        <CardBody className="Scrollble">
          
          <ReactBSTablesPlain
            data={actionList}
            columns={tableCols}
            tableKeyField="name"
            classes="table-responsive"        
            selectRow={{
              mode: "checkbox",
              headerColumnStyle: { width: "3%" },              
            }}
          />
          </CardBody>
        </>
        
      )
    }

  //#endregion



  return (
    <>
      <CardsHeader
        name={(tabsState.tabs==2?"Location | Archive": "Location")  }
        title=""
        subtitle=""
        parentName="Dashboard"
        parentRoute="/admin/dashboard"
      ></CardsHeader>
      <Container className="mt--6" fluid>
          <Row>
          <Col xl="12">
            <Card className="bg-white">
              <CardHeader className="bg-transparent">
                <Row>
                  <Col xl="7">
                    <div>
                      {_getTabs()}
                    </div>
                  </Col>
                  <Col xl="5">
                    <div className="col" style={{ textAlign: "end" }}>
                    <TabContent activeTab={"tabs" + tabsState.tabs}>
                      <TabPane tabId="tabs1">
                        <CustButton 
                          _text="Add Module" 
                          _onClick={toggleModuleModal} 
                          _id={`addBtn`} 
                          _type="button" 
                          _color="default"
                          _icon="fas fa-plus" 
                          _tooltip="Add Module"
                          _hidden ={false}/>
                        <CustButton 
                          _text="Download" 
                          _onClick={toggleModalDownload} 
                          _tooltip="Download"
                          _id={`downloadBtn`} 
                          _type="button" 
                          _color="default" 
                          _icon="fas fa-download" 
                          _disabled={moduleList.length<=0} 
                          _hidden ={false}/>
                        
                        
                        <ExcelReport 
                          id="btn-excel" 
                          btn_style="btn btn-primary d-none" 
                          file_name="Location Types"  
                          data={ExcelData} >
                            Download Template
                        </ExcelReport>
                        
                        <PDFReport 
                          html_data={PDFData} 
                          file_name="Location Types"  
                          id="btn-pdf" 
                          btn_style="btn btn-primary d-none"   
                        >
                        </PDFReport>  
                      </TabPane>

                    </TabContent>
                      
                    </div>
                  </Col>
                </Row>
              </CardHeader>
              { moduleList.length<=0? <CardBody><p>No Data Fetched</p></CardBody> :  _displayModule()}
            </Card>
          </Col>
        </Row>
      </Container>
 
      {//User ACCESS
      }
      <CustModal
          _onCloseClick={toggleModal}
          _modalTitle="Add Access Level"
          _modalId="addAccessLevel"
          _state={toggleModal}
          _size="md"
          _stateBool={openAddPopup}
        >

        <AddAccessLevel 
          _onCloseClick={toggleModal}
          _state={openAddPopup} 
          _callback={addCallback} 
   
        />
      </CustModal>
      <CustModal 
        _modalTitle="Edit Access Level" 
        _modalId="editAccessLevel" 
        _state={openEditPopup} 
        _onCloseClick={toggleModaledit}
        _size="md" 
        _stateBool={openEditPopup} >
        <EditAccessLevel  
          _id={currentAccessLevel} 
          _state={openEditPopup} 
          _onCloseClick={toggleModaledit}
          _callback={editCallback} />
      </CustModal>
      {
      //
      //Module
      }
        <CustModal
          _onCloseClick={()=>{setopenAddModulePopup(false)}}
          _modalTitle="Add Module"
          _modalId="addModule"
          _size="md"
          _stateBool={openAddModulePopup}
        >

          <AddModule 
            _onCloseClick={setopenAddModulePopup}
            _state={openAddModulePopup} 
            _callback={addModuleCallback} 
            _accessLevel={currentAccessLevel} 
          />
        </CustModal>

        <CustModal 
          _modalTitle="Edit Module" 
          _modalId="editModule" 
          _state={toggleModuleModaledit} 
          _size="md" 
          _stateBool={openEditModulePopup} >
          <EditModule  _id={editModuleID} _accessLevel={currentAccessLevel} _state={toggleModuleModaledit} _callback={editModuleCallback} />
        </CustModal>
        
      {
      //
      //Section
      }
        <CustModal
          _onCloseClick={()=>{setOpenAddSectionPopup(false)}}
          _modalTitle="Add Section"
          _modalId="addSection"
          _size="md"
          _stateBool={openAddSectionPopup}
        >

          <AddSection 
            _onCloseClick={setOpenAddSectionPopup}
            _state={openAddSectionPopup} 
            _callback={addSectionCallback} 
            _accessLevel={currentAccessLevel} 
            _module_id = {currentModuleID}
          />
        </CustModal>

        <CustModal 
          _modalTitle="Edit Section" 
          _modalId="editSection" 
          _state={toggleSectionModaledit} 
          _size="md" 
          _stateBool={openEditSectionPopup} >
          <EditSection  _id={editSectionID} _accessLevel={currentAccessLevel} _moduleID={currentModuleID} _state={toggleSectionModaledit} _callback={editSectionCallback} />
        </CustModal>
      
      {
      //
      //Action
      }
        <CustModal
          _onCloseClick={toggleActionModal}
          _modalTitle="Add Action"
          _modalId="addSection"
          _size="md"
          _stateBool={openAddActionPopup}
        >

          <AddAction 
            _onCloseClick={toggleActionModal}
            _state={openAddActionPopup} 
            _callback={addActionCallback} 
            _accessLevel={currentAccessLevel} 
            _module_id = {currentModuleID}
            _section_id = {currentSectionID}
          />
        </CustModal>

        <CustModal 
          _onCloseClick={toggleActionModaledit}
          _modalTitle="Edit Action" 
          _modalId="editAction" 
          _state={openEditActionPopup} 
          _size="md" 
          _stateBool={openEditActionPopup} >
          <EditAction _id={editActionID} _status={editActionStatus} _section_id={currentSectionID} _accessLevel={currentAccessLevel} _moduleID={currentModuleID} _state={toggleActionModaledit} _callback={editActionCallback} />
        </CustModal> 
        

      <CustModal
        _modalTitle="Download Options"
        _modalId="viewDownloadOptions"
        _state={toggleModalDownload}
        _size="sm"
        _stateBool={openDownloadPopup}
      >
        <DownloadOptions _state={downloadReport} />      
      </CustModal>

      {openAlert}
    </>
  )



  
  //#region (EXPORT REPORT XLS PDF) 
  function downloadReport(){
    var radio_btn = document.querySelector('input[name = "customRadio"]:checked');

    if(radio_btn != null){  //Test if something was checked


      if(radio_btn.id == "pdf_radio"){
        processPDF();
      }
      else if(radio_btn.id == "excel_radio"){
        processExcel();
      }
    } else {
      alert('Nothing checked'); //Alert, nothing was checked.
    }
  }

  async function processExcel(){
    var template = [{
      columns: [        
        {
          title: "Name",
          width: {wpx: 100}, 
          style: {
            fill: {patternType: "solid", 
            fgColor: {rgb: "FFCCEEFF"}},
            font: {sz: "16", bold: true} ,
            border: {right: {style: "thin", color: {rgb: "#1A0000"}}} 
          }
        },
        {
          title: "No. of Location",
          width: {wpx: 200}, 
          style: {
            fill: {patternType: "solid", 
            fgColor: {rgb: "FFCCEEFF"}},
            font: {sz: "16", bold: true} ,
            border: {right: {style: "thin", color: {rgb: "#1A0000"}}} 
          }
        },
        {
          title: "Status",
          width: {wpx: 80}, 
          style: {
            fill: {patternType: "solid", 
            fgColor: {rgb: "FFCCEEFF"}},
            font: {sz: "16", bold: true},
            border: {right: {style: "thin", color: {rgb: "#1A0000"}}} 
          }
        },
      ],
      data:[]
    }]; 

    moduleList.forEach(element => {
          
      var status = element.status ==1 ?"ACTIVE":"INACTIVE";
      //var text_color = element.status ==1 ?"#000000":"#FFFFFF";
      var text_color = element.status ==1 ?"#000000":"#000000";
      var status_bg = element.status ==1 ?"FF00FF00":"FFFF0000";

      template[0].data.push([
        {
          value: element.name, 
          style: {
            font: {sz: "12", bold: false},
            
            border: {
              top: {style: "thin", color: {rgb: "#1A0000"}},
              right: {style: "thin", color: {rgb: "#1A0000"}},
              bottom: {style: "thin", color: {rgb: "#1A0000"}},
              left: {style: "thin", color: {rgb: "#1A0000"}}
            }
          }
        },
        {
          value: element.team, 
          style: {
            font: {sz: "12", bold: false},
            
            border: {
              top: {style: "thin", color: {rgb: "#1A0000"}},
              right: {style: "thin", color: {rgb: "#1A0000"}},
              bottom: {style: "thin", color: {rgb: "#1A0000"}},
              left: {style: "thin", color: {rgb: "#1A0000"}}
            }
          }
        },
        {
          value: status, 
          style: {
            font: {sz: "12", bold: false, color: {rgb:text_color}},           
            border: {
              top: {style: "thin", color: {rgb: "#1A0000"}},
              right: {style: "thin", color: {rgb: "#1A0000"}},
              bottom: {style: "thin", color: {rgb: "#1A0000"}},
              left: {style: "thin", color: {rgb: "#1A0000"}}
            },
            fill: {patternType: "solid", fgColor: {rgb: status_bg}}
          }
        },
      ]);

    });
  
    setExcelData(template);
  
    const btn =document.getElementById("btn-excel");
    toggleModalDownload();
    setTimeout(() => {
      if(btn!=null){
        btn.click();
      }  

    }, 500);
  }

  async function processPDF(){
    
    const template = Templates.locationTypeTemplate("Location Types",moduleList,"");
    
  
    setPDFData(template);
    
    
    const btn =document.getElementById("btn-pdf");
    toggleModalDownload();
    setTimeout(() => {
    btn.click();
    }, 1000);
  }
//#endregion

}

export default AccessLevel