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
  Modal,
} from "reactstrap";

import ReactBSTables from "components/Tables/ReactBSTables";

import CustModal from "components/Modals/CustModal";
import CustButton from "components/Buttons/CustButton";
import ReactBSAlert from "react-bootstrap-sweetalert";
import ExcelReport from "components/ExportExcel/ExcelReport";
import PDFReport from "components/ExportPDF/PDFReport";
import { UserContext,_dataService } from "App";
import DownloadOptions from "../../../../layouts/modals/DownloadOptions";

//
//Cusom Modal
import AddElement from './AddElement';
import EditElement from './EditElement';


//Mock Data
import { dataTable } from "variables/general";
import { useParams,useNavigate, useelements } from "react-router-dom";
import ViewPDF from "components/ViewPDF/ViewPDF";
import PDFViewer from "pdf-viewer-reactjs";
import { processDataFilter } from "services/data.services";

const Templates = require('components/ExportPDF/Templates/TemplateLocType');

//GLOBAL VARIABLE
//currentLoctypeAPI is for httpRequest
var currentLoctypeAPI = ""; 
var count_use_effect=0;

function Element() {
  const params = useParams();
  var _id =null;
  if(params.id){
    _id= params.id;    
  }
  else{
    _id = null;
  }

  const navigate = useNavigate();
  const {user,setUser} = useContext(UserContext);
  const [componentList, setcomponentList] = useState([]);
  const [loctypeList, setloctypeList] = useState([]);
  //USED FOR JSX PARAMETERS SUCH AS MODALS AND is_ACITVE
  const [currentLoctypeTable, setcurrentLoctypeTable] = useState([]);
  const [filePDF, setfilePDF] = useState("");
  const [is_openPDF, setopenPDF] = useState(false);

  const [filterArray, setFilterArray] = useState({
    "filters":[]
  });   

  var batch_List = [];
  var batch_ArchiveList = [];
  const [tabsState, setTabsState] = useState({ tabs: 1 });

  //Used for passing excelData, data can be set by processExcel
  //Then because of useState when btn-excel is clicked passed data will also change
  const [ExcelData, setExcelData] = useState([]);
  const [PDFData, setPDFData] = useState("");

  function updateState(value,setState){
    return setState((prev) => {
      return { ...prev, ...value };
    });
  }

   //THIS METHOD IS FOR FORCING UPDATE RENDER
   const [state, _forceUpdate] = useState();
   const forceUpdate = React.useCallback(() => _forceUpdate({}), []); 

  useEffect(() => {
    
    if(_id!=null){
      _getSpecificRecords(user,setcomponentList,tabsState.tabs-1);
    }else{
      if(tabsState.tabs==1){
        _getLocTypes(user,setloctypeList);      
      }
    }    

    return;
  }, [user.token!="",_id]);
      
  
  //#region Toggle tabs
    const toggleListNavs = (e, statesss, index) => {
      e.preventDefault();
      setTabsState({ tabs: index });
      
      if(_id!=null){
        _getSpecificRecords(user,setcomponentList,index -1);  
      }else{
        _getRecords(user,setcomponentList,index -1);
      }   
      
      // this.setState({
      //   [state]: index
      // });
    };
  
    const toggleLoctype = (e, statesss, index) => {
      e.preventDefault();    
      if(index != currentLoctypeTable){
        currentLoctypeAPI = index;   
        setcurrentLoctypeTable(index);      
        //Tabs is either 1 or 2
        //DB GETS 0 for not archived 1 for archived hence - 1
        if(_id==null){
          _getRecords(user,setcomponentList,tabsState.tabs-1);
        }
        else{
          _getSpecificRecords(user,setcomponentList,tabsState.tabs-1);
        }
        
      }else{
        currentLoctypeAPI = index; 
      }
    
    };
  //#endregion
  
  //#region Modals Events and Variables
    const [alertState, setAlertState] = useState({ alert: "" });
    const [openAddPopup, setAddOpenModal] = useState(false);
    const [openEditPopup, setEditOpenModal] = useState(false);
    const [editID, setEditID] = useState(null);
    const [openDownloadPopup, setDownloadPopup] = useState(false);  
    const [openAlert, setOpenAlert] = useState(null);

    const toggleModal = async () => {
      await setAddOpenModal(!openAddPopup);
    };
    const toggleModalDownload = async () => {
      await setDownloadPopup(!openDownloadPopup);
    };
    const toggleModaledit = (e,id) => {   
      console.log(id);   
      setEditID(id);
      setEditOpenModal(!openEditPopup);
      
    };
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
              elements: has been successfully added.
            </ReactBSAlert>
          );
          _getRecords(user,setcomponentList,0);
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
              elements already exists.
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
              window.elements.reload();
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
              elements Type: has been successfully updated.
            </ReactBSAlert>
          );
          _getRecords(user,setcomponentList,0);
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
              elements Type cannot be found
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
              elements Group failed to update
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
              window.elements.reload();
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
        payload: { ...componentList },
        auth: { token: token, _id: _user_id, _fullname: _fullname }
      };
        

      var requestOptions = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`archive/elements/${id}`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;  

        if(records.remarks=="success"){

          const newRecords = componentList.filter((el) => el._id !== id);
          setcomponentList  (newRecords);
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
              elements type has been deleted.
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
              window.locations.reload();
            }, 2500);
          }else{
            console.log("Error occured with message "+records.remarks);
          }                 
        }

      });
      
    };
    const batchDelete =async () =>{
      
      var token = user.token;
      var _user_id = user.admin_id;
      var _fullname = user.fullname;
      var to_set;
      const _payload = {  
        payload:  { list: batch_List} ,
        auth: { token: token,  _fullname: _fullname, _id:_user_id }
      };




      var requestOptions = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`elements/batch_archive`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
        if(records.remarks=="success"){
          
          _getRecords(user,setcomponentList,0);
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
              elements type has been deleted.
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
              window.elements.reload();
            }, 2500);
          }else{
            console.log("Error occured with message "+records.remarks);
          }                 
        }
      });

    }

    const permanentDelete = async (id, name) => {
      
      var token = user.token;
      var _user_id = user.admin_id;
      var _fullname = user.fullname;
      const _payload = {  
        payload: { ...componentList },
        auth: { token: token, _id: _user_id, _fullname: _fullname }
      };


      var requestOptions = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`delete_elements/${id}`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
        if(records.remarks=="success"){

          const newRecords = componentList.filter((el) => el._id !== id);
          setcomponentList  (newRecords);
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
              elements type has been deleted.
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
              window.elements.reload();
            }, 2500);
          }else{
            console.log("Error occured with message "+records.remarks);
          }                 
        }
      });
      
    }; 

    const batchPermanentDelete = async ()=>{
      var token = user.token;
      var _user_id = user.admin_id;
      var _fullname = user.fullname;
      const _payload = {  
        payload: { list:batch_ArchiveList },
        auth: { token: token, _id: _user_id, _fullname: _fullname }
      };
        

      var requestOptions = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`elements/batch_delete/`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
        if(records.remarks=="success"){
          _getRecords(user,setcomponentList,1);
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
              elements types has been "Permanently" deleted.
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
              window.elements.reload();
            }, 2500);
          }else{
            console.log("Error occured with message "+records.remarks);
          }                 
        }
      });

    }

    const restore = async (id,name)=>{
      var token = user.token;
      var _user_id = user.admin_id;
      var _fullname = user.fullname;
      const _payload = {  
        payload: { ...componentList },
        auth: { token: token, _id: _user_id, _fullname: _fullname }
      };
        
      var requestOptions = {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`restore/elements/${id}`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                

        //console.log(records);                
        if(records.remarks=="success"){

          if(tabsState.tabs==1){
            _getRecords(user,setcomponentList,0);
          }else{
            const newRecords = componentList.filter((el) => el._id !== id);
            setcomponentList  (newRecords);            
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
              elements type has been restored.
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
                window.elements.reload();
              }, 2500);
          }else{
            console.log("Error occured with message "+records.remarks);
          }                 
        }
      });

    }
    const batchRestore =async () =>{
     
      var token = user.token;
      var _user_id = user.admin_id;
      var _fullname = user.fullname;
      var to_set;
      const _payload = {  
        payload:  { list: batch_ArchiveList} ,
        auth: { token: token,  _fullname: _fullname, _id:_user_id }
      };
        
      var requestOptions = {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`elements/batch_restore`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                

        //console.log(records);                
        if(records.remarks=="success"){
        _getRecords(user,setcomponentList,1);
        setOpenAlert(
          <ReactBSAlert
            success
            style={{ display: "block", marginTop: "-100px" }}
            title="Restored!"
            onConfirm={hideAlert}
            onCancel={hideAlert}
            confirmBtnBsStyle="primary"
            confirmBtnText="Ok"
            btnSize=""
          >
            elements types has been Restored.
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
              window.elements.reload();
            }, 2500);
          }else{
            console.log("Error occured with message "+records.remarks);
          }                 
        }
      
      });
    }
  //#endregion

  //#region Get Records and disiplay card body
    async function _getLocTypes(user,callback){

      var token = user.token;
      var _user_id = user.admin_id;
      var token_creation = user.token_creation;
      count_use_effect++;
      console.log(count_use_effect);
      
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
          
        _dataService.CRUD(window.base_api+`get_active_loctypes/`,requestOptions, async (response)=>{
  
          // Your response to manipulate
          const records =response;                
          if(records.remarks=="success"){
            if(records.payload.result.length > 0 ){
              const resPayload = records.payload["result"];                
              callback(resPayload);
              currentLoctypeAPI = resPayload[0]._id;
              setcurrentLoctypeTable(resPayload[0]._id);
              if(_id==null)
              {
                _getRecords(user,setcomponentList,0); 
              }
              else{
                _getSpecificRecords(user,setcomponentList,0); 
              }                          
            }else{
              callback([]);
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
                  window.elements.reload();
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

    function _getLocTypeTabs(){

      return (
        <Nav
          className="flex-column flex-md-row"
          id="tabs-icons-text"
          pills
          role="tablist"
        >
  
        {
          loctypeList.map(function(item, i){            
            return (         
              <NavItem size="cust-md" key={"navItem-"+i} className="mt-1">                
                <NavLink key={"navLink-"+i}
                  aria-selected={currentLoctypeTable === item._id}
                  className={classnames("mb-sm-3 mb-md-0" , {
                    active: currentLoctypeTable === item._id,
                  })}
                  onClick={(e) => toggleLoctype(e, "tabs", item._id)}
                  href={"#"+item.name}
                  role="tab"
                >
                  {item.name}
                </NavLink>
              </NavItem>
            )
          })
        }        
  
        </Nav>
  
  
      )
      
    }    

    async function _getRecords(user,callback,archived){

      //## Disable delete selected on load
      //Props not removing disable on run
      //enable_button to check if multiple has items to enable the button    
      enable_button();
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
          payload:{ is_archived: (archived),loctype_id:currentLoctypeAPI} };

          
        if(currentLoctypeAPI==""){
          return;
        }

        var requestOptions = {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(_payload)
        };
          
        _dataService.CRUD(window.base_api+`get_elements/`,requestOptions, async (response)=>{
  
          // Your response to manipulate
          const records =response;                
          if(records.remarks=="success"){
            if(records.payload.result.length > 0 ){
              const resPayload = records.payload["result"];                
              callback(resPayload);
            }else{
              callback([]);
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
                  window.elements.reload();
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
              <span className={row.status === 1 ? "text-success" : "text-danger"}>
                ●
              </span>{" "}
              {row.status === 1 ? "Active" : "Inactive"}
            </>
          );
        },
      },
      {
        dataField: "level_id",
        text: "Level",
        sort: true,
        formatter: (cell, row, rowIndex) => {
          return (
            <>
            {row.level_id}
            </>
          );
        },
      },
      {
        dataField: "level_id",
        text: "Reference",
        sort: true,
        isDummyField: true,
        formatter: (cell, row, rowIndex) => {
          if(row.reference){
            return (
              <CustButton
                _text="View"
                _id={`dashBtn_${row.name}`}
                _onClick={() => openPDF(row.reference)}
                _type="button"
                _color="default"
                _icon="fas fa-list-alt"
                
                _size="cust-md"
              />
            );
            
          }else{
            return (
              <CustButton
                _id= {"VIEWBTN"+row._id}
                _text="View"
                _type="button"
                _color="default"
                _icon="fas fa-list-alt"
                
                _size="cust-md"
                _disabled="disabled"
                _tooltip="No reference uploaded"
              />
            );
            
          }

   
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
                _text="Dashboard"
                _id={`dashBtn_${row.name}`}
                _type="button"
                _color="default"
                _icon="fas fa-tachometer-alt"
                _size="cust-md"
              />
              <CustButton
                _text="Edit"
                _id={`editBtn_${row.name}`}
                _type="button"
                _onClick={(e)=>toggleModaledit(e,row._id)}
                _color="default"
                _icon="fas fa-pen"
                _size="cust-md"
              />
              <CustButton
                _text="Delete"
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

    const tableCols2 = [
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
              <span className={row.status === 1 ? "text-success" : "text-danger"}>
                ●
              </span>{" "}
              {row.status === 1 ? "Active" : "Inactive"}
            </>
          );
        },
      },
      {
        dataField: "level_id",
        text: "Level",
        sort: true,
        formatter: (cell, row, rowIndex) => {
          return (
            <>
            {row.level_id}
            </>
          );
        },
      },
      {
        dataField: "level_id",
        text: "Reference",
        sort: true,
        isDummyField: true,
        formatter: (cell, row, rowIndex) => {
          return (
            <>
              <CustButton
                _text="View"
                _id={`dashBtn_${row.name}`}
                _onClick={() => openPDF(row._id)}
                _type="button"
                _color="default"
                _icon="fas fa-list-alt"
                _size="cust-md"
              />
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
                _text="Restore"
                _id={`editBtn_${row.name}`}
                _type="button"
                _onClick={()=>restore(row._id)}
                _color="default"
                _icon="fas fa-redo"
                _size="cust-md"
              />
              <CustButton
                _text="Permanently Delete"
                _id={`deleteBtn_${row.name}`}
                _type="button"
                _color="danger"
                _icon="fas fa-trash-alt"
                _onClick={()=>confirmPermanentDeleteAlert(row._id)}
                _size="cust-md"
              />
            </>
          );
        },
      },
    ];


    async function _getSpecificRecords(user,callback,archived,c_id){

      //## Disable delete selected on load
      //Props not removing disable on run
      //enable_button to check if multiple has items to enable the button    
      enable_button();
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
          payload:{ is_archived: (archived),loctype_id:currentLoctypeAPI} 
        };      

        var requestOptions = {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(_payload)
        };
          
        _dataService.CRUD(window.base_api+`get_elements_byGroup/`+_id,requestOptions, async (response)=>{
  
          // Your response to manipulate
          const records =response;                
          //console.log(records);                
          if(records.remarks=="success"){
            if(records.payload.result.length > 0 ){
              const resPayload = records.payload["result"];                
              callback(resPayload);
            }else{
              callback([]);
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
                  window.elements.reload();
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

    const tableSpecificCols = [
      {
        dataField: "name",
        text: "Name",
        sort: true,
        headerStyle: { width: "30%" },
      },
      {
        dataField: "loctypes",
        text: "elements Types",
        sort: true,
        formatter: (cell, row, rowIndex) => {
          return (
            <>
            {row.loctypes.name}
            </>
          );
        },
      },
      {
        dataField: "elements_group",
        text: "elements Group",
        sort: true,
        formatter: (cell, row, rowIndex) => {
          return (
            <>
            {row.elements_groups.name}
            </>
          );
        },
      },
      {
        dataField: "status",
        text: "Status",
        headerStyle: { width: "20%" },
        sort: true,
        formatter: (cell, row, rowIndex) => {
          return (
            <>
              <span className={row.status === 1 ? "text-success" : "text-danger"}>
                ●
              </span>{" "}
              {row.status === 1 ? "Active" : "Inactive"}
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
                _text="Dashboard"
                _id={`dashBtn_${row.name}`}
                _type="button"
                _color="default"
                _icon="fas fa-tachometer-alt"
                _size="cust-md"
              />
              <CustButton
                _text="Edit"
                _id={`editBtn_${row.name}`}
                _type="button"
                _onClick={(e)=>toggleModaledit(e,row._id)}
                _color="default"
                _icon="fas fa-pen"
                _size="cust-md"
              />
              <CustButton
                _text="Delete"
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

    function FilterCallback(_filterArray, _filteredData){    
      //console.log(_filterArray);
      updateState({filters: _filterArray.filters},setFilterArray)        
      forceUpdate();
      
    }

    function _displayCardBody(componentList,index){
      
      var cols =[];
      if(_id!==null){
        cols= tableSpecificCols
      }else{
        cols= tabsState.tabs==1?tableCols:tableCols2
      }
      
      return(<CardBody className="Scrollble">
      <ReactBSTables
        data={filterArray.filters.length > 0 ? processDataFilter(componentList,filterArray):componentList}
        filter={true}        
        _exclude_keys={["loctype_id"]}
        original_data={componentList}
        _callback={FilterCallback}    
        _filterArray={filterArray}      
        columns={cols}                
        tableKeyField="name"
        classes="table-responsive"        
        selectRow={{
          mode: "checkbox",
          headerColumnStyle: { width: "3%" },
          onSelect: (rows, IsSelect, RowIndex, E) => {
                        
            if (IsSelect) {                               
              
              if(tabsState.tabs ==1){
                batch_List.push(rows);
              }else{
                batch_ArchiveList.push(rows);
              }                           
            } else {
              console.log(rows);
              var obj = [];  
              if(tabsState.tabs ==1){
                obj = batch_List;
              }else{
                obj = batch_ArchiveList;
              }
              var i=0;
              obj.forEach(element => {
                if(element._id == rows._id){
                  var spliced = obj.splice(i, 1);
                }
                i++;
              });

              if(tabsState.tabs ==1){
                batch_List= obj;
              }else{
                batch_ArchiveList= obj;
              }
                            
            }
            enable_button();
          },
          onSelectAll: (isSelect, rows, E) => {
            
            if (isSelect) {
              
              if(tabsState.tabs ==1){
                rows.forEach(element => {
                  batch_List.push(element);
                });                
              }else{
                rows.forEach(element => {
                  batch_ArchiveList.push(element);
                });                    
              }
              
              //setMultiplelist(obj);

              
            } else {


              if(tabsState.tabs ==1){
                var obj = Object.assign(batch_List);                
                rows.forEach(element => {
                  obj = obj.filter((el) => el._id !== element._id);
                });
                batch_List=obj;
              }else{
                var obj = Object.assign(batch_ArchiveList);                
                rows.forEach(element => {
                  obj = obj.filter((el) => el._id !== element._id);
                });                

                batch_ArchiveList = obj;
              }

              var obj = Object.assign(batch_List);              
              rows.forEach(element => {
                obj = obj.filter((el) => el._id !== element._id);
              });
              batch_List=obj;
              
            }
            enable_button();
          },
          
        }}
      />
      </CardBody>)
    }

    const enable_button =()=>{
      if(tabsState.tabs==1){
        var bttn = document.getElementById("deleteSelectedBtn");
        if(batch_List.length>0){   
          console.log(batch_List);
          bttn.disabled = false;
          bttn.classList.remove("disabled");
        }else{
          console.log(batch_List);
          bttn.disabled = true;
          bttn.classList.add("disabled");             
        }
      }else{
        
        var bttn = document.getElementById(" deleteSelectedBtnArchive");
        var bttn2 = document.getElementById("restoreSelected");
        console.log(batch_ArchiveList.length);
        if(batch_ArchiveList.length>0){   
          bttn.disabled = false;
          bttn.classList.remove("disabled");
          bttn2.disabled = false;
          bttn2.classList.remove("disabled");
        }else{
          
          bttn.disabled = true;
          bttn.classList.add("disabled");  
          bttn2.disabled = true;
          bttn2.classList.add("disabled");              
        }
      }
      

    }
  //#endregion


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
            title: "No. of elements",
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

      componentList.forEach(element => {
            
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
      
      const template = Templates.elementsTypeTemplate("elements Types",componentList,"");
      
    console.log(template);
      setPDFData(template);
      
      
      const btn =document.getElementById("btn-pdf");
      toggleModalDownload();
      setTimeout(() => {
      btn.click();
      }, 1000);
    }
  //#endregion

  async function openPDF(file_name){
    console.log(file_name);
    var requestOptions = {
      method: 'GET',
     responseType: "arraybuffer",
     responseEncoding:"binary",
     headers:{
      "Content-Type":"application/pdf"
     }
    };

    var url = window.base_api+`helper/elements_reference/${file_name}`;
     setfilePDF(url);
     forceUpdate();
     setopenPDF(true);
    // await fetch(window.base_api+`helper/elements_reference/${file_name}`, {
    //   method: 'GET',
    //   //"Content-Type":"application/pdf"
    // })
    // .then(response => response.blob())
    // .then(blob => {
    //     var file = new File([blob], "file_name");
    //     console.log(file);

    //     setfilePDF(file);
    //     setopenPDF(true);
    // });

  }
  return (
    <>
      <CardsHeader
        name={(tabsState.tabs==2?"elements | Archive": "elements")  }
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
                      {_getLocTypeTabs()}
                    </div>
                  </Col>
                  <Col xl="5">
                    <div className="col" style={{ textAlign: "end" }}>
                    <TabContent activeTab={"tabs" + tabsState.tabs}>
                      <TabPane tabId="tabs1">
                        <CustButton 
                          _text="Add" 
                          _onClick={toggleModal} 
                          _id={`addBtn`} 
                          _type="button" 
                          _color="default"
                          _icon="fas fa-plus" 
                          _hidden ={_id?true:false}/>
                        <CustButton 
                          _text="Download" 
                          _onClick={toggleModalDownload} 
                          _id={`downloadBtn`} 
                          _type="button" 
                          _color="default" 
                          _icon="fas fa-download" 
                          _disabled={componentList.length<=0} 
                          _hidden ={false}/>
                        <CustButton
                          _text="Delete Selected"
                          _onClick={batchDelete}
                          _id={`deleteSelectedBtn`}
                          _type="button"
                          _color="danger"                                           
                          _icon="fas fa-trash"                        
                          _size="cust-md"                        
                        />
                        <CustButton
                          _text="Archive"
                          _id={`archiveBtn`}
                          _type="button"
                          _color="secondary2"
                          _icon="fas fa-box"
                          _disabled={false}
                          _size="cust-md"
                          _onClick={(e)=>{toggleListNavs(e,null,2)}}
                        />
                        <ExcelReport 
                          id="btn-excel" 
                          btn_style="btn btn-primary d-none" 
                          file_name="elements Types"  
                          data={ExcelData} >
                            Download Template
                        </ExcelReport>
                        
                        <PDFReport 
                          html_data={PDFData} 
                          file_name="elements Types"  
                          id="btn-pdf" 
                          btn_style="btn btn-primary d-none"   
                        >
                        </PDFReport>  
                      </TabPane>
                      <TabPane tabId="tabs2">
                        <CustButton
                            _text="Restore Selected"
                            _id={`restoreSelected`}
                            _type="button"
                            _onClick={()=>batchRestore()}
                            _color="default"
                            _icon="fas fa-redo"
                            _size="cust-md"
                          />                   
                          <CustButton
                            _text="Delete Selected"
                            _onClick={batchPermanentDelete}
                            _id={` deleteSelectedBtnArchive`}
                            _type="button"
                            _color="danger"
                            _icon="fas fa-trash"                        
                            _size="cust-md"
                          />
                          <CustButton
                            _text="Back to List"
                            _id={`activebutton`}
                            _type="button"
                            _color="primary"
                            _icon="fas fa-box"
                            _disabled={false}
                            _size="cust-md"
                            _onClick={(e)=>toggleListNavs(e,null,1)}
                          />
                      </TabPane>
                    </TabContent>
                      
                    </div>
                  </Col>
                </Row>
              </CardHeader>
              <TabContent activeTab={"tabs" + tabsState.tabs}>
                <TabPane tabId="tabs1">
                  {_displayCardBody(componentList,2)}
                </TabPane>
                <TabPane tabId="tabs2">
                {_displayCardBody(componentList,2)}
                </TabPane>
              </TabContent>
            </Card>
          </Col>
        </Row>
      </Container>


    
      <CustModal
        _modalTitle="Add elements Group"
        _modalId="AddLoctype"
        _state={toggleModal}
        _size="md"
        _stateBool={openAddPopup}
      >
        <AddElement 
          _state={toggleModal} 
          _callback={addCallback} 
          _loctype_id={currentLoctypeTable} 
          _loctype_list ={loctypeList}
        />
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
      <CustModal 
        _modalTitle="Edit elements" 
        _modalId="editLoc" 
        _state={toggleModaledit} 
        _size="md" 
        _stateBool={openEditPopup} >
        <EditElement  _id={editID} _loctype_id={currentLoctypeTable}  _state={toggleModaledit} _callback={editCallback} />
      </CustModal>
     
        {is_openPDF? (<ViewPDF  file={filePDF} _onclick={()=>setopenPDF(false)}   _stateBool={is_openPDF} /> ):null } 
      {openAlert}
    </>
  )
}

export default Element