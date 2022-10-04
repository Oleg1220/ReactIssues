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
  Row,
  TabContent,
  TabPane,
} from "reactstrap";

import ReactBSTables from "components/Tables/ReactBSTables";

import CustModal from "components/Modals/CustModal";
import CustButton from "components/Buttons/CustButton";
import ReactBSAlert from "react-bootstrap-sweetalert";
import ExcelReport from "components/ExportExcel/ExcelReport";
import PDFReport from "components/ExportPDF/PDFReport";
import { UserContext,_dataService } from "App";
import DownloadOptions from "../../../../layouts/modals/DownloadOptions";
import { useNavigate, useLocation } from "react-router-dom";
//Cusom Modal
import AddDivision from './AddDivision';
//import DownloadDivision from './DownloadDivision';
import EditDivision from './EditDIvision';

//Mock Data

import { processDataFilter } from "services/data.services";
import { _toastService } from "App";
const Templates = require('components/ExportPDF/Templates/TemplateLocType');
const editAction = () => {
  alert(`Edit Modal`);
};

function Division({ _state, _callback }) {

  const navigate = useNavigate();
  const {user,setUser} = useContext(UserContext);
  const [componentList, setcomponentList] = useState([]);       
  const [filterArray, setFilterArray] = useState({
    "filters":[]
  });    
  var batch_ActiveList = [];
  var batch_ArchiveList = [];
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [archiveListCounter, setArchiveListCounter] = useState([]);  
  //Used for passing excelData, data can be set by processExcel
  //Then because of useState when btn-excel is clicked passed data will also change
  
  
  useEffect(() => {
    if(tabsState.tabs==1){
      _getRecords(user,setcomponentList,tabsState.tabs -1);      

    }
    
      return;
  }, [user.token!=""]);

  useEffect(() => {

      if(tabsState.tabs==1){
        _getRecords(user,setArchiveListCounter,1)            

      }              
      
      return;
  }, [user.token!="",componentList]);

  function updateState(value,setState){
    return setState((prev) => {
      return { ...prev, ...value };
    });
  }
    //THIS METHOD IS FOR FORCING UPDATE RENDER
    const [state, _forceUpdate] = useState();
    const forceUpdate = React.useCallback(() => _forceUpdate({}), []);

  const [Toast, setToast] = useState([]);
  
    
  //#region Toggle tabs
  const toggleListNavs = (e, statesss, index) => {
    e.preventDefault();
    setTabsState({ tabs: index });
    setcomponentList([])
    _getRecords(user,setcomponentList,index -1);       
    // this.setState({
    //   [state]: index
    // });
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

  //#region Confirmations
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
        <h2>Are you sure you want to delete this division?</h2>
        <h5 className=" text-muted">Division: {row.name}</h5>
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
        <h2>Are you sure you want to delete the selected division?</h2>
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
        <h2>Are you sure you want to permanently delete the selected division?</h2>
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
        <h2>Are you sure you want to permanently delete the selected training?</h2>
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
        <h2>Are you sure you want to restore this division?</h2>
        <h5 className=" text-muted">Division: {row.name}</h5>
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
        <h2 >Are you sure you want to restore the selected division?</h2>        
      </ReactBSAlert>
    );
  };
  //#endregion
  
//#endregion


  //#region CRUD
  const addCallback = async (status,name) => {
      
    switch (status) {
      case "success":        

        _toastService.hotToastService('Division',`${name ? name : ""} has been successfully added.`,'success');          

        _getRecords(user,setcomponentList,tabsState.tabs -1);    
        toggleModal();
        break;

      case "existing":
        
        _toastService.hotToastService('Division',`${name} already exists.`,'warning');        

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
          <h5 className=" text-muted">     Session Expired / Session Mismatch.</h5>   
      
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
        _toastService.hotToastService('Divisions',`${name ? name : ""} has been successfully updated.`,'success');  
        _getRecords(user,setcomponentList,tabsState.tabs -1);    
        setEditOpenModal(!openEditPopup);
        break;

      case "failed-fetch":
        _toastService.hotToastService('Error',`Divisions ${name ? name : ""} cannot be found.`,'error');          
        setEditOpenModal(!openEditPopup);
        break;
        

        case "failed":
          _toastService.hotToastService('Error',`Divisions ${name ? name : ""} failed to update.`,'error');              
          setEditOpenModal(!openEditPopup);
        break;
        case "existing":
          _toastService.hotToastService('Divisions',`${name ? name : ""} already exist.`,'warning');  
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
            <h5 className=" text-muted">   Session Expired / Session Mismatch</h5>
          
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

  const proceedDelete = async (id,name) => {
    
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {  
      payload: {
        check_collection:["departments"],
        collection_field:"divisions_id"
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
      
    _dataService.CRUD(window.base_api+`archive/divisions/${id}`,requestOptions, async (response)=>{

      // Your response to manipulate
      const records =response;                
      
      switch (records.remarks) {
        case "success":
              
          _getRecords(user,setcomponentList,tabsState.tabs -1);              
          _toastService.hotToastService('Division',`${name ? name : ""} has been successfully deleted.`,'success');
          setOpenAlert('')
          processToast(name,id);
          break;
        case "existing":          
          _toastService.hotToastService('Division',`${name ? name : ""} is currently being used.`,'warning');
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
    setcomponentList([])
    const _payload = {  
      payload:  { 
        list: batch_ActiveList,
        check_collection:["departments"],
        collection_field:"divisions_id"
      } ,
      auth: { token: token,  _fullname: _fullname, _id:_user_id }
    };

    var requestOptions = {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_payload)
    };
      
    _dataService.CRUD(window.base_api+`divisions/batch_archive`,requestOptions, async (response)=>{

      // Your response to manipulate
      const records =response;                
                  
     
      switch (records.remarks) {
        case "success":
          batch_ActiveList=[]
          enable_button();         
            _toastService.hotToastService('Divisions',`Selected ${batch_ActiveList.length > 1 ? 'divisions' : 'division' }  has been deleted.`,'success');
          
            if(records.payload.failed_archive.length > 0){
              _toastService.hotToastService('Divisions',`${records.payload.failed_archive.length > 1 ? 'Some divisions' : 'Some division' }  is currently being used.`,'warning');
            }
            
           setOpenAlert('')

          break;
        case "failed":
        
          _toastService.hotToastService('Divisions',`${records.payload.failed_archive.length > 1 ? 'Divisions' : 'Division' }  is failed to delete.`,'error');            
 
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
      _getRecords(user,setcomponentList,tabsState.tabs -1);  
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
      
    _dataService.CRUD(window.base_api+`delete_divisions/${id}`,requestOptions, async (response)=>{

      // Your response to manipulate
      const records =response;                
                        
      if(records.remarks=="success"){

        
        
        _getRecords(user,setcomponentList,tabsState.tabs -1);    
        
        _toastService.hotToastService('Division',`${name ? name : ""} has been permanently deleted.`,'success');
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
        
      _dataService.CRUD(window.base_api+`divisions/batch_delete/`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;               
        switch (records.remarks) {
          case "success":
          
            
            setOpenAlert('')
                     
            _toastService.hotToastService('Divisions',`Selected ${batch_ArchiveList.length > 1 ? 'divisions' : 'division' } has been permanently deleted.`,'success');
            batch_ArchiveList =[];
            enable_button();
            _getRecords(user,setcomponentList,tabsState.tabs -1);   
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
      
            _dataService.CRUD(window.base_api+`restore/divisions/${id}`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
        if(records.remarks=="success"){

          if(tabsState.tabs==1){
            _getRecords(user,setcomponentList,tabsState.tabs -1);   
          }else{
            const newRecords = componentList.filter((el) => el._id !== id);
            setcomponentList  (newRecords);            
          }
        
         
          _toastService.hotToastService('Division',`${name ? name : ""} has been restored.`,'success');
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
        
      _dataService.CRUD(window.base_api+`divisions/batch_restore`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
        //console.log(records);     
        switch (records.remarks) {
          case "success":
            batch_ArchiveList =[];
            enable_button();
            _getRecords(user,setcomponentList,tabsState.tabs -1); 
            
            _toastService.hotToastService('Division',`Selected ${batch_ArchiveList.length > 1 ? "divisions" : "division"} has been restored.`,'success');
            batch_ArchiveList =[];
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

    }
//#endregion
    
  //#region Get Records and disiplay card body
  var count_use_effect=0;
  async function _getRecords(user,callback,archived){

    //## Disable delete selected on load
    //Props not removing disable on run
    //enable_button to check if multiple has items to enable the button    
    enable_button();
    callback([])
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
        payload:{ is_archived:archived} 
      };


      var requestOptions = {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`get_divisions`,requestOptions, async (response)=>{

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
          dataField: "Number_of_departments",
          text: "No. of Departments",
          sort: true,
          headerStyle: { width: "30%" },
          formatter: (cell, row, rowIndex) => {
    
            if(row.Number_of_departments > 0){
              return (
                <CustButton
                _text={row.Number_of_departments}
                _type="button"
                _color="default"
                _icon="fas fa-building"
                _size="md"
                _onClick={()=>_goToDepartment(row._id)}
              />
              );
              
            }else{
              return (
                <CustButton
                  _text="0"
                  _type="button"
                  _color="default"
                  _icon="fas fa-building"
                  _size="md"
                  _disabled={true}
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
          dataField: "team",
          text: "No. of Locations",
          sort: true,
          headerStyle: { width: "30%" },
          formatter: (cell, row, rowIndex) => {
    
            if(row.team > 0){
              return (
                <CustButton
                _text={row.team.length}
                _type="button"
                _color="default"
                _icon="fas fa-building"
                _size="md"
                onClick={()=>_goToDepartment(row._id)}
              />
              );
              
            }else{
              return (
                <CustButton
                  _text="0"
                  _type="button"
                  _color="default"
                  _icon="fas fa-building"
                  _size="md"
                  _disabled={true}
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
                  _id={`restoreBtn_${row._id}`}
                  _name="delete_row_archive"
                  _type="button"
                  _onClick={(e)=>confirmRestoreAlert(e,row)}
                  _color="default"
                  _icon="fas fa-redo"
                  _size="cust-md"
                />
                <CustButton
                _text="Permanently Delete"
                  _id={`deleteBtn_${row._id}`}
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
 

  function _displayCardBody(componentList){
    
    
    return(<CardBody className="Scrollble">
    <ReactBSTables
      data={filterArray.filters.length > 0 ? processDataFilter(componentList,filterArray):componentList}
      filter={true}        
      _exclude_keys={[]}
      original_data={componentList}
      _callback={FilterCallback}    
      _filterArray={filterArray}      
      columns={tableColsGenerator(tabsState.tabs)}
      tableKeyField="name"
      classes="table-responsive"     
      title="Division"
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


function _goToDepartment(id){

  navigate("/admin/departments/"+id);
  //console.log(id);
}

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
        <CardsHeader name="Divisions"
        title=""
        subtitle=""
        parentName="Dashboard" 
        parentRoute="/admin">
        
        </CardsHeader>
        <Container className="mt--6" fluid>        
          <Row>
            <Col xl="12">
            <Card className="bg-white">
              <CardHeader className="bg-transparent">
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
              </CardHeader>
             
                {
                  _displayCardBody(componentList)
                }
            </Card>
          </Col>
        </Row>
        </Container>
        </TabPane>
        <TabPane tabId="tabs2">
          <CardsHeader
            name="Division | Archive"
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
                        _id="restoreSelected"
                        _name="restoreSelected"
                        _type="button"
                        _onClick={()=>confirmRestoreBatchAlert()}
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
                  {
                  //console.log(filterArray,"Division")
                  }
                  {
                    _displayCardBody(componentList)
                  }

                   
                </Card>
              </Col>
            </Row>
          </Container>
        
        </TabPane>
      </TabContent>

    
      <CustModal
        _modalTitle="Add Division"
        _modalId="AddLoctype"
        _state={toggleModal}
        _size="md"
        _stateBool={openAddPopup}
      >
         <AddDivision _state={toggleModal} _callback={addCallback} _onCloseClick={()=>setAddOpenModal(false)} />
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
        _modalTitle="Edit Division" 
        _modalId="editLoc" 
        _state={openEditPopup} 
        _size="md" 
        _stateBool={openEditPopup} >
        <EditDivision  _id={editID} _state={openEditPopup} _callback={editCallback} _onCloseClick={()=>setEditOpenModal(false)} />
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

export default Division