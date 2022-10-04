//DEFAULT NEEDED 
import React, { useEffect, useState,useContext } from "react";
import CardsHeader from "components/Headers/CardsHeader";
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";

import ReactBSTables from "components/Tables/ReactBSTables";

import { useTranslation } from "react-i18next";
import CustModal from "components/Modals/CustModal";
import CustButton from "components/Buttons/CustButton";
import ReactBSAlert from "react-bootstrap-sweetalert";
import ExcelReport from "components/ExportExcel/ExcelReport";
import PDFReport from "components/ExportPDF/PDFReport";
import { UserContext,_dataService  } from "App";
import DownloadOptions from "../../../../layouts/modals/DownloadOptions";
import { useNavigate, useLocation } from "react-router-dom";
//
//Cusom Modal
import AddLocGroup from './AddLocGroup';

import EditLocGroup from './EditLocGroup';


//Mock Data
import { dataTable } from "variables/general";

import { array } from "prop-types";
import { _toastService } from "App";
import classnames from "classnames";

const Templates = require('components/ExportPDF/Templates/TemplateLocType');
var currentLoctypeAPI = ""; 
function LocGroup() {
  const  {t} = useTranslation();
  
  const navigate = useNavigate();
  const {user,setUser} = useContext(UserContext);
  const [componentList, setcomponentList] = useState([]);    
  const [filterArray, setFilterArray] = useState({
    "filters":[]
  });   
  const [_filterColumnArray,setFilterHeader]= useState({
    "headers":[]
  });
  const [headers,setHeaders]= useState({
    "headers":[]
  });
  var batch_ActiveList = [];
  var batch_ArchiveList = [];
  
  const [loctypeList, setloctypeList] = useState([]);
  const [currentLoctypeTable, setcurrentLoctypeTable] = useState([]);
  const [archiveListCounter, setArchiveListCounter] = useState([]);  
  const [tabsState, setTabsState] = useState({ tabs: 1 });

  //Used for passing excelData, data can be set by processExcel
  //Then because of useState when btn-excel is clicked passed data will also change
  const [ExcelData, setExcelData] = useState([]);
  const [PDFData, setPDFData] = useState("");
  
  useEffect(() => {
    
    _getLocTypes(user,setloctypeList);        

    return;
  }, [user.token!=""]);
  
  useEffect(() => {

    if(tabsState.tabs==1){
      _getRecords(user,setcomponentList,0);       

    }              
    
    return;
}, [user.token!="" && currentLoctypeAPI!="" && loctypeList.length > 0]);
  
  useEffect(() => {

    if(tabsState.tabs==1){
      _getRecords(user,setArchiveListCounter,1)            

    }              
    
    return;
}, [user.token!="" && componentList && currentLoctypeAPI!="" && loctypeList]);


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
      e.preventDefault();
      setTabsState({ tabs: index });
      _getRecords(user,setcomponentList,index -1);   
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
        _getRecords(user,setcomponentList,tabsState.tabs-1);
       
        
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
  const [openAlert2, setOpenAlert2] = useState(null);


  const [Toast, setToast] = useState([]);

  const processToast = (name,_id) =>{
    var toast_object = Toast;
    // toast_object.push(
    //   <div id="liveToast" key={_id} style={{width: "200px",height: "80px"}} className="toast hide" role="alert" aria-live="assertive" aria-atomic="true" data-delay="2000">
    //     <div className="toast-header">                
    //       <strong className="mr-auto">Deleted {name}</strong>                
    //       <button type="button" className="ml-2 close" data-dismiss="toast" aria-label="Close" onClick={()=>closeToast(_id)}>
    //         <span aria-hidden="true">×</span>
    //       </button>
    //     </div>
    //     <br/>
    //     <div className="toast-body">
    //       <button className="btn btn-success btn-sm" onClick={()=>restore(_id)}>Undo</button>
    //     </div>
    //     <br/>
    //   </div>            
    // );
    setToast(
      toast_object                
    ); 
    
    setTimeout(() => {
      closeToast(_id)
    }, 2500);
  }
  
  const closeToast = (_id) =>{
    var toast_object = Toast;
    
       
    var index =0;
    for(var index=0; index < toast_object.length; index++){
      if(toast_object[index].key==_id){
        toast_object.splice(index, 1);
      }      
    }        
    setToast(toast_object);
    forceUpdate();
  }



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
  const hideAlert2 = () => {
    setOpenAlert2(null);
  };


  const confirmDeleteAlert = (e,row) => {
      
    if(e.target.disabled || e.target.disabled ===undefined){
      e.preventDefault();
      return      
    }

    setOpenAlert(
      <ReactBSAlert
        warning
        reverseButtons={true}
        style={{ display: "block", marginTop: "-100px" }}
        title=""
        onCancel={hideAlert}
        onConfirm={()=>proceedDelete(row._id)}
        showCancel
        cancelBtnBsStyle="secondary"
        cancelBtnText="Cancel"
        confirmBtnBsStyle="danger"
        confirmBtnText="Yes, delete it!"
        btnSize=""
      >
        <h2>Are you sure you want to delete this Location Group?</h2>
        <h5 className=" text-muted">Location Group: {row.name}</h5>
        <h5 className=" text-muted">Status: {(row.status) ? `Active` : `Inactive`}</h5>
      </ReactBSAlert>
    );
  };

  const confirmDeleteSelectedAlert = () => {
    setOpenAlert(
      <ReactBSAlert
        warning
        reverseButtons={true}
        style={{ display: "block", marginTop: "-100px" }}
        title=""
        onCancel={hideAlert}
        onConfirm={batchDelete}
        showCancel
        confirmBtnBsStyle="danger"
        confirmBtnText="Yes, delete it!"
        cancelBtnBsStyle="secondary"
        cancelBtnText="Cancel"
        btnSize=""
      >
        <h2>Are you sure you want to delete the selected location groups?</h2>
      </ReactBSAlert>
    );
  };

  const confirmPermanentDeleteAlert = (e,id) => {
                
    if(e.target.disabled || e.target.disabled ===undefined){
      e.preventDefault();
      return
      
    }

    setOpenAlert(
      <ReactBSAlert
        warning
        reverseButtons={true}
        style={{ display: "block", marginTop: "-100px" }}
        title=""  
        onCancel={hideAlert}
        onConfirm={()=>permanentDelete(id)}
        showCancel
        cancelBtnBsStyle="secondary"
        cancelBtnText="Cancel"
        confirmBtnBsStyle="danger"
        confirmBtnText="Yes, delete it!"          
        btnSize=""
      >
        <h2>Are you sure you want to permanently delete the selected location groups?</h2>
        <h5 className=" text-muted">This process cannot be undone.</h5>                    
      </ReactBSAlert>
    );
  };

  const confirmPermanentDeleteBatchAlert = () => {
    setOpenAlert(
      <ReactBSAlert
        warning
        reverseButtons={true}
        style={{ display: "block", marginTop: "-100px" }}
        onCancel={hideAlert}
        onConfirm={batchPermanentDelete}
        showCancel
        confirmBtnBsStyle="danger"
        confirmBtnText="Yes, delete it!"
        cancelBtnBsStyle="secondary"
        cancelBtnText="Cancel"
        btnSize=""
      >
        <h2>Are you sure you want to permanently delete the selected Location Group?</h2>
        <h5 className=" font-weight-bold">This process cannot be undone.</h5>
      </ReactBSAlert>
    );
  };

  const confirmRestoreAlert = (e,row) => {
                      
    if(e.target.disabled || e.target.disabled ===undefined){
      e.preventDefault();
      return
      
    }

    setOpenAlert(
      <ReactBSAlert
        info
        reverseButtons={true}
        style={{ display: "block", marginTop: "-100px" }}
        title=""
        onCancel={hideAlert}
        onConfirm={() => restore(row._id)}
        showCancel
        confirmBtnBsStyle="primary"
        confirmBtnText="Yes"
        cancelBtnBsStyle="secondary"
        cancelBtnText="No"
        btnSize=""
      >
        <h2>Are you sure you want to restore this location groups?</h2>
        <h5 className=" text-muted">location groups: {row.name}</h5>
      </ReactBSAlert>
    );
  };

  const confirmRestoreBatchAlert = () => {
    setOpenAlert(
      <ReactBSAlert
        info
        reverseButtons={true}
        style={{ display: "block", marginTop: "-100px" }}
        onCancel={hideAlert}
        onConfirm={batchRestore}
        showCancel
        confirmBtnBsStyle="primary"
        confirmBtnText="Yes"
        cancelBtnBsStyle="secondary"
        cancelBtnText="Cancel"
        btnSize=""
      >
        <h2 >Are you sure you want to restore the selected location groups?</h2>        
      </ReactBSAlert>
    );
  };


//#endregion


  //#region CRUD
    const addCallback = async (status,name) => {
        
      switch (status) {
        case "success":
          
          _toastService.hotToastService('Location Group',`${name ? name : ""} has been successfully added.`,'success');               
          _getRecords(user,setcomponentList,tabsState.tabs -1);   
          toggleModal();
          break;

        case "existing":          
          _toastService.hotToastService('Location Group',`${name} already exists.`,'warning');
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
    const editCallback = async (status,name) => {
      
      switch (status) {
        case "success":
          
          _toastService.hotToastService('Location Group',`${name ? name : ""} has been successfully updated.`,'success');  

          _getRecords(user,setcomponentList,tabsState.tabs -1);   
          setEditOpenModal(!openEditPopup);
          break;
        case "existing":          
          _toastService.hotToastService('Location Group',`${name ? name : ""} already exists.`,'warning');
          
          break
        case "failed-fetch":          
          _toastService.hotToastService('Location Group',`${name ? name : ""} cannot be found.`,'error'); 
          setEditOpenModal(!openEditPopup);
        break;
        case "failed":          
          _toastService.hotToastService('Location Group',`${name ? name : ""} failed to update.`,'error'); 
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
        
      _dataService.CRUD(window.base_api+`archive_location_groups/${id}`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;     
        switch (records.remarks) {
          case "success":
               
            
          const newRecords = componentList.filter((el) => el._id !== id);
            setcomponentList  (newRecords);        
            
            _toastService.hotToastService('Location Type',`${name ? name : ""} has been successfully deleted.`,'success');
            setOpenAlert('')
            //processToast(name,id);
            break;
          case"existing":            
            _toastService.hotToastService('Location Type',`${name ? name : ""} is currently being used.`,'warning');

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

        if(records.remarks=="success"){

        
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
          }
          else if(records.remarks =="failed: aggregated"){
            setOpenAlert(
            <ReactBSAlert
              danger
              style={{ display: "block", marginTop: "-100px" }}
              title="Deletion Failed"
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
              Location Group still has location(s)
            </ReactBSAlert>          
          );
          
          
          }
          else{
            <ReactBSAlert
              danger
              style={{ display: "block", marginTop: "-100px" }}
              title={records.remarks}
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
              {records.message}
            </ReactBSAlert>  
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
        payload:  { list: batch_ActiveList} ,
        auth: { token: token,  _fullname: _fullname, _id:_user_id }
      };

      var requestOptions = {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`location_groups/batch_archive`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
           
        switch (records.remarks) {
          case "success":
                          
            var additional_message ="";
            _getRecords(user,setcomponentList,tabsState.tabs -1);   
            _toastService.hotToastService('Location Groups',`Selected ${batch_ActiveList.length > 1 ? 'location groups' : 'location group' }  has been deleted.`,'success');
          
            if(records.payload["failed: aggregated"].length > 0){
              _toastService.hotToastService('Location Groups',`${records.payload["failed: aggregated"].length > 1 ? 'Some location groups' : 'Some location group' }  is currently being used.`,'warning');
            }
            
           setOpenAlert('')


            break;
          case "failed":
            
            _toastService.hotToastService('Location Groups',`${records.payload["failed: aggregated"].length > 1 ? 'Location groups' : 'Location group' }  is currently being used.`,'warning');
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

        // if(records.remarks=="success"){
          
        //   _getRecords(user,setcomponentList,tabsState.tabs -1);   
        //   var _success= records.payload.success;
        //   var _success_text= JSON.stringify(_success).slice(1, -1)

        //   setOpenAlert(
        //     <ReactBSAlert
        //       success
        //       style={{ display: "block", marginTop: "-100px" }}
        //       title="Deleted!"
        //       onConfirm={hideAlert}
        //       onCancel={hideAlert}
        //       confirmBtnBsStyle="primary"
        //       confirmBtnText="Ok"
        //       btnSize=""
        //     >
        //       Location Group: {_success_text} has been deleted.
        //     </ReactBSAlert>
        //   );

        //   if(records.payload["failed: aggregated"].length>0){
        //     var failed= records.payload["failed: aggregated"];
        //     var failed_text ="Location Group: "+ JSON.stringify(failed).slice(1, -1) +" still has locations and cannot be deleted";
        //     setOpenAlert2(
        //       <ReactBSAlert
        //         danger
        //         style={{ display: "block", marginTop: "-100px" }}
        //         title="Deletion Failed"
        //         onConfirm={() => hideAlert2()}
        //         onCancel={() => hideAlert2()}
        //         confirmBtnBsStyle="primary"
        //         confirmBtnText="Ok"
        //         btnSize=""
        //       >                
        //         {failed_text}
        //       </ReactBSAlert>          
        //     );
        //   }


        // }else{
        //   if(records.remarks =="Bad Token"){
        //     setOpenAlert(
        //     <ReactBSAlert
        //       danger
        //       style={{ display: "block", marginTop: "-100px" }}
        //       title="Warning"
        //       onConfirm={() => hideAlert()}
        //       onCancel={() => hideAlert()}
        //       confirmBtnBsStyle="primary"
        //       confirmBtnText="Ok"
        //       btnSize=""
        //     >
        //       Session Expired / Session Mismatch
        //     </ReactBSAlert>          
        //   );
          
        //   localStorage.removeItem("userData");
        //     setTimeout(() => {
        //       window.location.reload();
        //     }, 2500);
        //   }
        //   else if(records.remarks =="failed"){
        //     if(records.payload["failed: aggregated"].length>0){
        //       var failed= records.payload["failed: aggregated"];
        //       var failed_text ="Location Group: "+ JSON.stringify(failed).slice(1, -1) +" still has locations and cannot be deleted";
        //       setOpenAlert2(
        //         <ReactBSAlert
        //           danger
        //           style={{ display: "block", marginTop: "-100px" }}
        //           title="Deletion Failed"
        //           onConfirm={() => hideAlert2()}
        //           onCancel={() => hideAlert2()}
        //           confirmBtnBsStyle="primary"
        //           confirmBtnText="Ok"
        //           btnSize=""
        //         >                
        //           {failed_text}
        //         </ReactBSAlert>          
        //       );
        //     }
        //   }
          
          
        //   else{
        //     console.log("Error occured with message "+records.remarks);
        //   }                 
        // }
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
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`delete_location_groups/${id}`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
                          
        if(records.remarks=="success"){

          const newRecords = componentList.filter((el) => el._id !== id);
          setcomponentList  (newRecords);          
          _toastService.hotToastService('Location Type',`Selected ${batch_ActiveList.length > 1 ? 'location types' : 'location type' }  has been deleted.`,'success');
          setOpenAlert('')
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

    const batchPermanentDelete = async ()=>{
      var token = user.token;
      var _user_id = user.admin_id;
      var _fullname = user.fullname;
      const _payload = {  
        payload: { list:batch_ArchiveList },
        auth: { token: token, _id: _user_id, _fullname: _fullname }
      };
        
      var requestOptions = {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`location_groups/batch_delete/`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
        if(records.remarks=="success"){
                  
          _toastService.hotToastService('Location Group',`Selected ${batch_ArchiveList.length > 1 ? 'location groups' : 'location group' } has been permanently deleted.`,'success');
          setOpenAlert('')
          _getArchiveRecords(user,setcomponentList);  
          batch_ArchiveList=[]
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
      
      
      _dataService.CRUD(window.base_api+`restore/location_groups/${id}`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
        if(records.remarks=="success"){

          if(tabsState.tabs==1){
            _getRecords(user,setcomponentList,tabsState.tabs -1);   
          }else{
            const newRecords = componentList.filter((el) => el._id !== id);
            setcomponentList  (newRecords);            
          }
          enable_button();          
          _toastService.hotToastService('Location Type',`${name ? name : ""} has been restored.`,'success');
          setOpenAlert('');
          closeToast(id);

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
        
      _dataService.CRUD(window.base_api+`location_groups/batch_restore`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
        //console.log(records);                
        if(records.remarks=="success"){
          _getArchiveRecords(user,setcomponentList);
          _toastService.hotToastService('Location Type',`Selected ${batch_ArchiveList.length > 1 ? "location types" : "location type"} has been restored.`,'success');
          batch_ArchiveList =[];
          setOpenAlert('')
          
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
//#endregion

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
  //#region Get Records and disiplay card body
    var count_use_effect=0;
    async function _getRecords(user,callback,_arhived){

      //## Disable delete selected on load
      //Props not removing disable on run
      //enable_button to check if multiple has items to enable the button    
      enable_button();
      //setMultiplelist([]);
      //
      callback([])
      console.log(currentLoctypeAPI)
      var token = user.token;
      var _user_id = user.admin_id;
      var token_creation = user.token_creation;
      count_use_effect++;
      //console.log(count_use_effect);
      if(token && token_creation){
        const _payload = { 
          auth:{
            token:token,
            _id:_user_id
          },
          payload:{ is_archived:_arhived,loctype_id:currentLoctypeAPI} 
        };


        var requestOptions = {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(_payload)
        };
          
        _dataService.CRUD(window.base_api+`get_location_groups`,requestOptions, async (response)=>{
  
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

    var count_use_effect=0;
    async function _getArchiveRecords(user,callback){

      //## Disable delete selected on load
      //Props not removing disable on run
      //enable_button to check if multiple has items to enable the button    
      enable_button();
      //setMultiplelist([]);
      //
      
      var token = user.token;
      var _user_id = user.admin_id;
      var token_creation = user.token_creation;
      count_use_effect++;
      //console.log(count_use_effect);
      if(token && token_creation){
        const _payload = { 
          auth:{
            token:token,
            _id:_user_id
          },
          payload:{is_archived:1,loctype_id:currentLoctypeAPI} 
        };


        var requestOptions = {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(_payload)
        };
          
        _dataService.CRUD(window.base_api+`get_location_groups/`,requestOptions, async (response)=>{
  
          // Your response to manipulate
          const records =response;                
          //console.log(records);                
          if(records.remarks=="success"){
            if(records.payload.result.length > 0 ){
              const resPayload = records.payload["result"];                
              callback(resPayload);
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

    const tableColsGenerator = (index) => {
      console.log(index)
      var headers = {
        name:t("name"),
        n_loc:t("number_of_locations"),
        status:t("status"),
        action:t("action"),       
      }
      var tmpCols = [
        {
          dataField: "name",
          text: headers.name,
          sort: true,
        }
      ];
  
  
      if (index == 1) {
        // Active Table Actions
        tmpCols.push(
          {
            dataField: "number_of_locations",
            text: headers.n_loc,
            sort: true,
            headerStyle: { width: "30%" },
            formatter: (cell, row, rowIndex) => {
    
              if(row.number_of_locations > 0){
                return (
                  <CustButton
                  _text={row.number_of_locations}
                  _type="button"
                  _color="default"
                  _icon="fas fa-map-marker-alt"
                  _size="md"
                  _onClick={()=>_goToLocation(row._id)}
                />
                );
                
              }else{
                return (
                  <CustButton
                    _text="0"
                    _type="button"
                    _color="default"
                    _icon="fas fa-map-marker-alt"
                    _size="md"
                    _disabled="disabled"
                  />
                );
                
              }
    
              
            },
          },
          {
            dataField: "status",
            text: headers.status,
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
            text: headers.action,
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
            dataField: "number_of_locations",
            text: "No. of Locations",
            sort: true,
            headerStyle: { width: "30%" },
            formatter: (cell, row, rowIndex) => {
    
              if(row.number_of_locations > 0){
                return (
                  <CustButton
                  _text={row.number_of_locations.length}
                  _type="button"
                  _color="default"
                  _icon="fas fa-map-marker-alt"
                  _size="md"
                  onClick={()=>_goToLocation(row._id)}
                />
                );
                
              }else{
                return (
                  <CustButton
                    _text="0"
                    _type="button"
                    _color="default"
                    _icon="fas fa-map-marker-alt"
                    _size="md"
                    _disabled="disabled"
                  />
                );
                
              }
    
              
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
                    _onClick={(e)=>confirmPermanentDeleteAlert(e,row._id)}
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

    function _displayCardBody(componentList,setHeaders){
      
      
      return(<CardBody className="Scrollble">
      <ReactBSTables
        data={filterArray.filters.length > 0 ? _dataService.processDataFilter(componentList,filterArray):componentList}
        filter={true}        
        _exclude_keys={["loctype_id"]}
        original_data={componentList}
        _callback={FilterCallback}    
        _filterArray={filterArray} 
        columns={tableColsGenerator(tabsState.tabs)}
        tableKeyField="name"
        classes="table-responsive"  
        
        title="Location Group"
        addCallback={()=>setAddOpenModal(true)}
        activeCallback={(e)=>toggleListNavs(e,null,1)}
        _currentTab={tabsState.tabs}
        


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
          },
          
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


  function _goToLocation(id){

    navigate("/admin/location/"+id);
    //console.log(id);
  }
  
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
            console.log(resPayload)   
            callback(resPayload);
            currentLoctypeAPI = resPayload[0]._id;
            console.log(currentLoctypeAPI);
            setcurrentLoctypeTable(resPayload[0]._id);                             
                                    
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
    var body= JSON.stringify(
      {
        "key": "Q2FzeXNNb2RlY0FwaQ==",
        "payload":componentList,
        //"keyword":keyword
      } 
    )   
    
    _dataService.processExcel(
      `loctypes/download_excel_loctypes.php`,
      body,
      "Divisions",
      (return_data)=>{          
        toggleModalDownload();
        if(return_data.remarks!="success"){

          setOpenAlert(
            <ReactBSAlert
            warning
              style={{ display: "block", marginTop: "-100px" }}
              title=""
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
              <h2>Warning</h2>
              <h5 className=" text-muted">Failed to Download Report.</h5> 
            </ReactBSAlert>          
          );
        }          
      }
    )
    

  }

  async function processPDF(){
  // console.log(componentList)
    // return;
    var body= JSON.stringify(
      {
        "key": "Q2FzeXNNb2RlY0FwaQ==",
        "payload":componentList,
        //"keyword":keyword
      } 
    )   

    _dataService.processPDF(
      `loctypes/download_pdf_loctypes.php`,
      body,
      "Divisions",
      (return_data)=>{          
        toggleModalDownload();
        if(return_data.remarks!="success"){

          setOpenAlert(
            <ReactBSAlert
              warning
              style={{ display: "block", marginTop: "-100px" }}
              title=""
              onConfirm={() => hideAlert()}
              onCancel={() => hideAlert()}
              confirmBtnBsStyle="warning"
              confirmBtnText="Ok"
              btnSize=""
            >
              <h2>Warning</h2>
              <h5 className=" text-muted">Failed to Download Report.</h5> 
            </ReactBSAlert>          
          );
        }          
      }
    )
    
  }
//#endregion

  return (
    <>    
      <TabContent activeTab={"tabs" + tabsState.tabs}>
        <TabPane tabId="tabs1">
        <CardsHeader 
        title=""
        subtitle="" 
        name="Location Groups" 
        parentName="Dashboard" 
        parentRoute="/admin">
        
        </CardsHeader>
        <Container className="mt--6" fluid>
         
          <Row>
          {/* {JSON.stringify(loctypeList)} */}
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
                        <CustButton _text="Add" _onClick={toggleModal} _id={`addBtn`} _type="button" _color="default"_icon="fas fa-plus"/>
                        <CustButton _text="Download" _onClick={toggleModalDownload} _id={`downloadBtn`} _type="button" _color="default" _icon="fas fa-download"/>
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
                        
                      </div>
                    </Col>
                  </Row>
                 
                </CardHeader>
                  {_displayCardBody(componentList,)}
              </Card>
            </Col>
          </Row>
        </Container>
        </TabPane>
        <TabPane tabId="tabs2">
          <CardsHeader
            name="Location Groups | Archive"
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
                    <div className="col" style={{ textAlign: "end" }}>   
                      <CustButton
                        _text="Restore Selected"
                        _id={`restoreSelected`}
                        _type="button"
                        _onClick={confirmRestoreBatchAlert}
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
                    </div>
                  </CardHeader>
                    {_displayCardBody(componentList)}
                </Card>
              </Col>
            </Row>
          </Container>
        
        </TabPane>
      </TabContent>

    
      <CustModal
        _modalTitle="Add Location Group"
        _modalId="AddLoctype"
        _state={toggleModal}
        _size="md"
        _stateBool={openAddPopup}
        _onCloseClick={()=>setAddOpenModal(false)}
      >
         <AddLocGroup  
            _callback={addCallback} 
            _onCloseClick={()=>setAddOpenModal(false)} 
            _loctype_id={currentLoctypeTable}  
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
        _modalTitle="Edit Location Group" 
        _modalId="editLoc" 
        _state={toggleModaledit} 
        _size="md" 
        _stateBool={openEditPopup} >
        <EditLocGroup  
          _id={editID} 
          _state={toggleModaledit} 
          _callback={editCallback} 
          _onCloseClick={()=> setEditOpenModal(false)}
        />
      </CustModal>
      {openAlert}
      {openAlert2}
      {Toast.length>0?
       <div className={"bg-white shadow-lg p-3 mb-5 bg-white rounded position-fixed bottom-0 right-0 p-3"} style={{zIndex: "5",right: "40px",bottom: "60px",position: "fixed"}}>
             {Toast}
       </div>  :
      
      null}      
    </>
  )
}

export default LocGroup