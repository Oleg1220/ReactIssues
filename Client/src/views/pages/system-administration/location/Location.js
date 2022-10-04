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
} from "reactstrap";

import ReactBSTables from "components/Tables/ReactBSTables";

import CustModal from "components/Modals/CustModal";
import CustButton from "components/Buttons/CustButton";
import ReactBSAlert from "react-bootstrap-sweetalert";
import ExcelReport from "components/ExportExcel/ExcelReport";
import PDFReport from "components/ExportPDF/PDFReport";
import { UserContext,_dataService } from "App";
import { processDataFilter } from "services/data.services";
import DownloadOptions from "../../../../layouts/modals/DownloadOptions";

//
//Cusom Modal
import AddLocation from './AddLocation';
import EditLocation from './EditLocation';


//Mock Data
import { dataTable } from "variables/general";
import { useParams,useNavigate, useLocation } from "react-router-dom";
import NoDataFound from "views/pages/error/NoDataFound";
import { _toastService } from "App";
import CustAlert from "components/Alerts/CustAlert";


const Templates = require('components/ExportPDF/Templates/TemplateLocType');

//GLOBAL VARIABLE
//currentLoctypeAPI is for httpRequest
var currentLoctypeAPI = ""; 
var count_use_effect=0;

function Location() {
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
  const [filterArray, setFilterArray] = useState({
    "filters":[]
  });    
  //_exclude_keys will hide keys on dropdown and reports

  var _exclude_keys=["_id","archive","locations","loctype_id","location_groups_id"];
  var _exclude_column_keys= ["name","locations","loctype_id","location_groups_id"]; 

  const [_filterColumnArray,setFilterHeader]= useState({
    "headers":[]
  });
  
  const [loctypeList, setloctypeList] = useState([]);
  //USED FOR JSX PARAMETERS SUCH AS MODALS AND is_ACITVE
  const [currentLoctypeTable, setcurrentLoctypeTable] = useState([]);
  const [archiveListCounter, setArchiveListCounter] = useState([]);  
  var batch_ActiveList = [];
  var batch_ArchiveList = [];
  const [tabsState, setTabsState] = useState({ tabs: 1 });

  //Used for passing excelData, data can be set by processExcel
  //Then because of useState when btn-excel is clicked passed data will also change
  const [ExcelData, setExcelData] = useState([]);
  const [PDFData, setPDFData] = useState("");

  useEffect(() => {
    
    if(_id!=null){
      _getSpecificRecords(user,setcomponentList,tabsState.tabs-1);
    }else{
      if(tabsState.tabs==1){
        _getLocTypes(user,setloctypeList);      
      }
    }    

    return;
  }, [user.token!="" && _id]);
    
  
  useEffect(() => {

    if(_id!=null){
      _getSpecificRecords(user,setArchiveListCounter,1);
    }else{
      if(tabsState.tabs==1){
        _getRecords(user,setArchiveListCounter,1)     
      }
    }  

                    
    
    return;
}, [user.token!="" && componentList]);

function updateState(value,setState){
  return setState((prev) => {
    return { ...prev, ...value };
  });
}
  //THIS METHOD IS FOR FORCING UPDATE RENDER
  const [state, _forceUpdate] = useState();
  const forceUpdate = React.useCallback(() => _forceUpdate({}), []);
  
  //#region Toggle tabs
    const toggleListNavs = (e, statesss, index) => {
      batch_ActiveList = [];
      batch_ArchiveList = [];
      e.preventDefault();
      setcomponentList([])
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
      
      setEditID(id);
      setEditOpenModal(!openEditPopup);
      
    };
    const hideAlert = () => {
      setOpenAlert(null);
    };

    const confirmDeleteAlert = (e,row) => {
      
      if(e.target.disabled || e.target.disabled ===undefined){
        e.preventDefault();
        return
        
      }
      setOpenAlert(
        <CustAlert
          type="delete"
          values={{ title: "Location Type",subTitle:row.name,subContent:`Status: ${row.status ? `Active` : `Inactive`}`}}
          cancelCallback={hideAlert}
          confirmCallback={()=>proceedDelete(row._id,row.name)}
        />
      );

    };

    const confirmPermanentDeleteAlert = (e,row) => {
      setOpenAlert(
        <CustAlert
          type="deleteArchive"
          values={{ title: "Location Type",subTitle:row.name,subContent:`This process cannot be undone.`}}
          cancelCallback={hideAlert}
          confirmCallback={()=>permanentDelete(row._id,row.name)}
        />
      );
    };
  
    const confirmRestoreAlert = (e,row) => {
      setOpenAlert(
        <CustAlert
          type="restore"
          values={{ title: "Location Type",subTitle:row.name}}
          cancelCallback={hideAlert}
          confirmCallback={()=>restore(row._id,row.name)}
        />
      );
    };
  
    const confirmDeleteSelectedAlert = () => {
      setOpenAlert(
        <CustAlert
          type="deleteSelected"
          values={{ title: "Location Type" ,data:batch_ActiveList.length}}
          cancelCallback={hideAlert}
          confirmCallback={batchDelete}
        />
      );
    };
  
    const confirmPermanentDeleteBatchAlert = () => {
      setOpenAlert(
        <CustAlert
          type="deleteSelectedArchive"
          values={{ title: "Location Type" ,data:batch_ArchiveList.length,subContent:`This process cannot be undone.`}}
          cancelCallback={hideAlert}
          confirmCallback={batchPermanentDelete}
        />
      );
    };
    
    const confirmRestoreBatchAlert = () => {
      setOpenAlert(
        <CustAlert
          type="restoreSelected"
          values={{ title: "Location Type" ,data:batch_ArchiveList.length}}
          cancelCallback={hideAlert}
          confirmCallback={batchRestore}
        />
      );
    };

  //#endregion

  //#region CRUD
    const addCallback = async (status,name) => {
        
      switch (status) {
        case "success":          
          _toastService.hotToastService('Location',`${name ? name : ""} has been successfully added.`,'success');
          _getRecords(user,setcomponentList,tabsState.tabs -1);    
          toggleModal();      
          break;

        case "existing":
          _toastService.hotToastService('Location',`${name} already exists.`,'warning');
          break;
        
        case "download-fail":

          _toastService.hotToastService('Error',`Downloading Template Failed.`,'error');         
          break;
        case "no-record":
          _toastService.hotToastService('Error',`No valid entries were found in the uploaded spreadsheet.`,'error');            
            break;
            
        case "Bad Token":
          setOpenAlert(
            <ReactBSAlert
              danger
              style={{ display: "block", marginTop: "-100px" }}
              title=""
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
                <h2>Warning</h2>
                <h5 className=" text-muted">Session Expired / Session Mismatch.</h5> 
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
    
    const editCallback = async (status,name) => {
      
      switch (status) {
        case "success":

          _toastService.hotToastService('Location',`${name ? name : ""} has been successfully updated.`,'success');       
          _getRecords(user,setcomponentList,0);
          setEditOpenModal(!openEditPopup);
          break;

        case "failed-fetch":            
          _toastService.hotToastService('Error',`Location: ${name} cannot be found.`,'error');    
          setEditOpenModal(!openEditPopup);
          break;
        case "failed":
          _toastService.hotToastService('Error',`Location: ${name} failed to update.`,'error');         
          setEditOpenModal(!openEditPopup);
        break;
        case "existing":
          _toastService.hotToastService('Location',` ${name} already exists.`,'warning');

          break;
        
        case "Bad Token":
          setOpenAlert(
            <ReactBSAlert
              danger
              style={{ display: "block", marginTop: "-100px" }}
              title=""
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
              <h2>Warning</h2>
              <h5 className=" text-muted">Session Expired / Session Mismatch.</h5> 
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
        payload: {
          check_collection:["crews"],
          collection_field:"location_id"
         },
        auth: { token: token, _id: _user_id, _fullname: _fullname }
      };
        

      var requestOptions = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`archive/locations/${id}`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;  

        
        switch (records.remarks) {
          case "success":
               
            if(_id!=null){
              _getSpecificRecords(user,setcomponentList,tabsState.tabs-1);  
            }else{
              _getRecords(user,setcomponentList,tabsState.tabs-1);
            }   
            _toastService.hotToastService('Location',`Location: ${name }  has been successfully deleted.`,'success');
            setOpenAlert('')    
            break;
          case"existing":

          
          _toastService.hotToastService('Location',`Location: ${name } is currently being used.`,'warning');
         setOpenAlert('')           
            break;
          case"Bad Token":
            setOpenAlert(
              <ReactBSAlert
                danger
                style={{ display: "block", marginTop: "-100px" }}
                title=""
                onConfirm={() => hideAlert()}
                onCancel={() => hideAlert()}
                confirmBtnBsStyle="warning"
                confirmBtnText="Ok"
                btnSize=""
              >
                <h2>Warning</h2>
                <h5 className=" text-muted">   Session Expired / Session Mismatch</h5>        
              
              </ReactBSAlert>          
            );
            break;
          default:
            console.log("Error occured with message "+records.remarks);
            break;
        }    

      });
      
    };
    const batchDelete =async () =>{
      
      var token = user.token;
      var _user_id = user.admin_id;
      var _fullname = user.fullname;
      var to_set;
     
      const _payload = {  
        payload:  { 
          list: batch_ActiveList,
          check_collection:["crews"],
          collection_field:"location_id"
        } ,
        auth: { token: token,  _fullname: _fullname, _id:_user_id }
      };

      var requestOptions = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`locations/batch_archive`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;  
        switch (records.remarks) {
          case "success":         
            var additional_message ="";
            if(records.payload.failed_archive.length > 0 ){
              additional_message=
              <>
                <br/>
                Some Location Type/s are not deleted since they are being use.
              </>
            }                       
    
            if(_id!=null){
              _getSpecificRecords(user,setcomponentList,0);
            }else{
              if(tabsState.tabs==1){
                _getRecords(user,setcomponentList,0);
              }
            }    

            _toastService.hotToastService('Location',`Selected ${batch_ActiveList > 1 ? 'locations' : 'location' }  has been deleted.`,'success');
          

            if(records.payload.failed_archive.length > 0){
              _toastService.hotToastService('Location',`${records.payload.failed_archive.length > 1 ? 'Some locations' : 'Some location' }  is currently being used.`,'warning');
            }
           
           setOpenAlert('')
           batch_ActiveList =[];

            break;
          case"failed":
          if(_id!=null){
            _getSpecificRecords(user,setcomponentList,0);
          }else{
            if(tabsState.tabs==1){
              _getRecords(user,setcomponentList,0);
            }
          }    
         
          _toastService.hotToastService('Location',`Location: ${records.payload.failed_archive.length > 1 ? 'locations' : 'location' }  is currently used by a location.`,'warning');
          setOpenAlert('')

            break;
          case"Bad Token":
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
              <h2>Warning</h2>
              <h5 className=" text-muted">Session Expired / Session Mismatch.</h5> 
            </ReactBSAlert>          
          );
          
          localStorage.removeItem("userData");
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          default:
            console.log("Error occured with message "+records.remarks);
            break;
        }  
                      

      });

    }

    const permanentDelete = async (id, name) => {
      
      var token = user.token;
      var _user_id = user.admin_id;
      var _fullname = user.fullname;
      console.log(id)
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
        
      _dataService.CRUD(window.base_api+`delete_location/${id}`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
        if(records.remarks=="success"){

          if(_id!=null){
            _getSpecificRecords(user,setcomponentList,tabsState.tabs-1);  
          }else{
            _getRecords(user,setcomponentList,tabsState.tabs-1);
          }   

          _toastService.hotToastService('Location',`Location: ${name} has been "Permanently" deleted.`,'success');
          setOpenAlert('')

        }else{
          if(records.remarks =="Bad Token"){
            setOpenAlert(
            <ReactBSAlert
              danger
              style={{ display: "block", marginTop: "-100px" }}
              title=""
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
              <h2>Warning</h2>
              <h5 className=" text-muted">Session Expired / Session Mismatch.</h5> 
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
        
      _dataService.CRUD(window.base_api+`locations/batch_delete/`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
        if(records.remarks=="success"){
          _getRecords(user,setcomponentList,1);
          
          _toastService.hotToastService('Location',`Selected ${batch_ArchiveList.length > 1 ? 'locations' : 'location' } has been "Permanently" deleted.`,'success');
          setOpenAlert('')
          batch_ArchiveList = [];
          enable_button()
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
              <h2>Warning</h2>
              <h5 className=" text-muted">Session Expired / Session Mismatch.</h5> 
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
        
      
      
      _dataService.CRUD(window.base_api+`restore/locations/${id}`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                

        //console.log(records);                
        if(records.remarks=="success"){

          if(tabsState.tabs==1){
            _getRecords(user,setcomponentList,0);
          }else{
            _getRecords(user,setcomponentList,1);   
          }
        
          _toastService.hotToastService('Location',`${name ? name : ""} has been restored.`,'success');
            setOpenAlert('')         
        }else{
          if(records.remarks =="Bad Token"){
            setOpenAlert(
              <ReactBSAlert
                danger
                style={{ display: "block", marginTop: "-100px" }}
                title=""
                onConfirm={() => hideAlert()}
                onCancel={() => hideAlert()}
                confirmBtnBsStyle="warning"
                confirmBtnText="Ok"
                btnSize=""
              >
                <h2>Warning</h2>
                <h5 className=" text-muted">Session Expired / Session Mismatch.</h5> 
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
        
      _dataService.CRUD(window.base_api+`locations/batch_restore`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
        switch (records.remarks) {
          case "success":
            _getRecords(user,setcomponentList,1);
            _toastService.hotToastService('Location ',`Selected ${batch_ArchiveList.length > 1 ? 'locations' : 'location' } has been restored.`,'success');
            setOpenAlert('')
            batch_ArchiveList = [];
          enable_button()
            break;
          case"Bad Token":
            setOpenAlert(
              <ReactBSAlert
                danger
                style={{ display: "block", marginTop: "-100px" }}
                title=""
                onConfirm={() => hideAlert()}
                onCancel={() => hideAlert()}
                confirmBtnBsStyle="warning"
                confirmBtnText="Ok"
                btnSize=""
              >
                <h2>Warning</h2>
                <h5 className=" text-muted">   Session Expired / Session Mismatch</h5>        
              
              </ReactBSAlert>          
            );
            break;
          default:
            console.log("Error occured with message "+records.remarks);
            break;
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
                  title=""
                  onConfirm={() => hideAlert()}
                  onCancel={() => hideAlert()}
                  confirmBtnBsStyle="warning"
                  confirmBtnText="Ok"
                  btnSize=""
                >
                  <h2>Warning</h2>
                  <h5 className=" text-muted"> Expired / Session Mismatch.</h5> 
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
          
        _dataService.CRUD(window.base_api+`get_location/`,requestOptions, async (response)=>{
  
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
                  <h2>Warning</h2>
                  <h5 className=" text-muted"> Expired / Session Mismatch.</h5> 
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
          
        _dataService.CRUD(window.base_api+`get_location_byGroup/`+_id,requestOptions, async (response)=>{
  
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
                  title=""
                  onConfirm={() => hideAlert()}
                  onCancel={() => hideAlert()}
                  confirmBtnBsStyle="warning"
                  confirmBtnText="Ok"
                  btnSize=""
                >
                  <h2>Warning</h2>
                  <h5 className=" text-muted"> Expired / Session Mismatch.</h5> 
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


 
    const tableColsGenerator = (index) => {
      var tmpCols = [
        {
          dataField: "name",
          text: "Name",
          sort: true,
        }
      ];


      if (index == 1) {
        // Active Table Actions
        tmpCols.push(
          {
            dataField: "-location_groups",
            text: "Location Group",
            sort: true,
            formatter: (cell, row, rowIndex) => {
              return (
                <>
                {row["-location_groups"].name}
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
                    _name="delete_row"
                    _type="button"
                    _color="danger"
                    _icon="fas fa-trash-alt"
                    _onClick={(e)=>confirmDeleteAlert(e,row)}
                    _size="cust-md"
                  />
                </>
              );
            },
          }
        );
      } else {
        // Archive Table Actions
        tmpCols.push(  
          {
            dataField: "location_group",
            text: "Location Group",
            sort: true,
            formatter: (cell, row, rowIndex) => {
              return (
                <>
                {row["-location_groups"].name}
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
                    _name="delete_row_archive"
                    _type="button"
                    _onClick={(e)=>confirmRestoreAlert(e,row)}
                    _color="default"
                    _icon="fas fa-redo"
                    _size="cust-md"
                  />
                  <CustButton
                    _text="Permanently Delete"
                    _id={`deleteBtn_${row.name}`}
                    _name="delete_row_archive"
                    _type="button"
                    _color="danger"
                    _icon="fas fa-trash-alt"
                    _onClick={(e)=>confirmPermanentDeleteAlert(e,row)}
                    _size="cust-md"
                  />
                </>
              );
            },
          }
        );
      }
      return tmpCols;
    };

    const tableSpecificColsGenerator = (index) => {
      var tmpCols = [
        {
          dataField: "name",
          text: "Name",
          sort: true,
        }
      ];


      if (index == 1) {
        // Active Table Actions
        tmpCols.push(
          {
            dataField: "-loctypes",
            text: "Location Types",
            sort: true,
            formatter: (cell, row, rowIndex) => {
              return (
                <>
                {row["-loctypes"].name}
                </>
              );
            },
          },
          {
            dataField: "location_group",
            text: "Location Group",
            sort: true,
            formatter: (cell, row, rowIndex) => {
              return (
                <>
                {row["-location_groups"].name}
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
                    _name="delete_row"
                    _type="button"
                    _color="danger"
                    _icon="fas fa-trash-alt"
                    _onClick={(e)=>confirmDeleteAlert(e,row)}
                    _size="cust-md"
                  />
                </>
              );
            },
          },
        );
      } else {
        // Archive Table Actions
        tmpCols.push(  
          {
            dataField: "loctypes",
            text: "Location Types",
            sort: true,
            formatter: (cell, row, rowIndex) => {
              return (
                <>
                {row["-loctypes"].name}
                </>
              );
            },
          },
          {
            dataField: "location_group",
            text: "Location Group",
            sort: true,
            formatter: (cell, row, rowIndex) => {
              return (
                <>
                {row["-location_groups"].name}
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
                    _onClick={(e)=>confirmDeleteAlert(e,row)}
                    _size="cust-md"
                  />
                </>
              );
            },
          },
        );
      }
      return tmpCols;
    };


    function FilterCallback(_filterArray, _filteredData){    
      //console.log(_filterArray);
      updateState({filters: _filterArray.filters},setFilterArray)        
      forceUpdate();
      
    }
    function FilterColumnCallback(_headers){      
      if(_headers.headers[0] !="" ){
        updateState({headers: _headers.headers},setFilterHeader)               
        forceUpdate();
      }
      else{
        updateState({headers: []},setFilterHeader)         
      }        
    }




    function _displayCardBody(componentList,proxyValue,index){
      
      var cols =[];
      if(_id!==null){
        cols= tableSpecificColsGenerator(tabsState.tabs)
      }else{
        cols= tableColsGenerator(tabsState.tabs)
      }
      
      return(<CardBody className="Scrollble">
      <ReactBSTables
        data={filterArray.filters.length > 0 ? processDataFilter(componentList,filterArray):componentList}
        filter={true}        
        //Data Flter Variables
        _exclude_keys={_exclude_keys}
        original_data={componentList}
        _callback={FilterCallback}    
        _filterArray={filterArray} 
        //Column Variables
        _filterColumn={FilterColumnCallback}
        _exclude_column_keys={_exclude_column_keys}
        _filterColumnArray={_filterColumnArray}
        columns={cols}


        title="Location"
        addCallback={()=>toggleModal()}        
        activeCallback={(e)=>toggleListNavs(e,null,1)}
        _currentTab={tabsState.tabs}


        tableKeyField="name"
        classes="table-responsive"            
        selectRow={{
          mode: "checkbox",
          headerColumnStyle: { width: "3%" },
          onSelect: (rows, IsSelect, RowIndex, E) => {
                        
            if (IsSelect) {                               
              
              if(tabsState.tabs ==1){
                batch_ActiveList.push(rows);
              }else{
                batch_ArchiveList.push(rows);
              }                           
            } else {
              console.log(rows);
              var obj = [];  
              if(tabsState.tabs ==1){
                obj = batch_ActiveList;
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
                batch_ActiveList= obj;
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
                  batch_ActiveList.push(element);
                });                
              }else{
                rows.forEach(element => {
                  batch_ArchiveList.push(element);
                });                    
              }
              
              //setMultiplelist(obj);

              
            } else {


              if(tabsState.tabs ==1){
                var obj = Object.assign(batch_ActiveList);                
                rows.forEach(element => {
                  obj = obj.filter((el) => el._id !== element._id);
                });
                batch_ActiveList=obj;
              }else{
                var obj = Object.assign(batch_ArchiveList);                
                rows.forEach(element => {
                  obj = obj.filter((el) => el._id !== element._id);
                });                

                batch_ArchiveList = obj;
              }

              var obj = Object.assign(batch_ActiveList);              
              rows.forEach(element => {
                obj = obj.filter((el) => el._id !== element._id);
              });
              batch_ActiveList=obj;
              
            }
            enable_button();
          }
        }}
      />
      </CardBody>)
    }
    const enable_button =()=>{

      var btnDeleteActive = document.getElementById("deleteSelectedBtn");
      var btnDeleteArchive = document.getElementById("deleteSelectedBtnArchive");
  
      // ! Active
      if (typeof btnDeleteActive != "undefined" && btnDeleteActive != null) {
        var bttn = document.getElementById("deleteSelectedBtn");
        if (batch_ActiveList.length > 0) {
          bttn.disabled = false;
  
          const elements = document.getElementsByName("delete_row");
          elements.forEach((el) => {
            el.disabled = true;
          });
        } else {
          bttn.disabled = true;
  
          const elements = document.getElementsByName("delete_row");
          elements.forEach((el) => {
            el.disabled = false;
          });
        }
      }
  
      // ! Archived
      if (typeof btnDeleteArchive != "undefined" && btnDeleteArchive != null) {
        var bttn = document.getElementById("deleteSelectedBtnArchive");
        var bttn2 = document.getElementById("restoreSelected");
        if (batch_ArchiveList.length > 0) {
          bttn.disabled = false;
          bttn2.disabled = false;
  
          const elements = document.getElementsByName("delete_row_archive");
          elements.forEach((el) => {
            el.disabled = true;
          });
        } else {
          bttn.disabled = true;
          bttn2.disabled = true;
  
          const elements = document.getElementsByName("delete_row_archive");
          elements.forEach((el) => {
            el.disabled = false;
          });
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
     
    }

    async function processPDF(){
      
      const template = Templates.locationTypeTemplate("Location Types",componentList,"");
      
    console.log(template);
      setPDFData(template);
      
      
      const btn =document.getElementById("btn-pdf");
      toggleModalDownload();
      setTimeout(() => {
      btn.click();
      }, 1000);
    }
  //#endregion


  return (
    <>
      <CardsHeader
        name={(tabsState.tabs==2?"Location | Archived": "Location")  }
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
                          _onClick={confirmDeleteSelectedAlert}
                          _id={`deleteSelectedBtn`}
                          _type="button"
                          _color="danger"                                           
                          _icon="fas fa-trash"                        
                          _size="cust-md"                        
                        />
                        <CustButton
                          _text="Archived"
                          _id={`archiveBtn`}
                          _type="button"
                          _color="primary"
                          _icon="fas fa-box"
                          _disabled = {
                            archiveListCounter == 0 ? true : false
                          }
                          _size="cust-md"
                          _onClick={(e)=>{toggleListNavs(e,null,2)}}
                        />
               
                      </TabPane>
                      <TabPane tabId="tabs2">
                        <CustButton
                            _text="Restore Selected"
                            _id={`restoreSelected`}
                            _type="button"
                            _onClick={(e)=>confirmRestoreBatchAlert(e)}
                            _color="default"
                            _icon="fas fa-redo"
                            _size="cust-md"
                          />                   
                          <CustButton
                            _text="Permanently Delete Selected"
                            _onClick={confirmPermanentDeleteBatchAlert}
                            _id={`deleteSelectedBtnArchive`}
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
                  {_displayCardBody(componentList,_filterColumnArray,2)}
                </TabPane>
                <TabPane tabId="tabs2">
                {_displayCardBody(componentList,_filterColumnArray,2)}
                </TabPane>
              </TabContent>
            </Card>
          </Col>
        </Row>
      </Container>


    
      <CustModal
        _modalTitle="Add Location"
        _modalId="AddLoctype"
        _state={toggleModal}
        _size="md"
        _stateBool={openAddPopup}
        _onCloseClick={()=>setAddOpenModal(false)}
      >
        <AddLocation 
          _onCloseClick={()=>setAddOpenModal(false)}
          _callback={addCallback} 
          _loctype_id={currentLoctypeTable} 
          _loctype_list ={loctypeList}
        />
      </CustModal>

      <CustModal 
        _modalTitle="Edit Location" 
        _modalId="editLoc" 
        _state={toggleModaledit} 
        _size="md" 
        _stateBool={openEditPopup} 
        _onCloseClick={()=>setEditOpenModal(false)}
        >
        <EditLocation  _id={editID}  _onCloseClick={()=>setEditOpenModal(false)} _callback={editCallback} />
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
}

export default Location