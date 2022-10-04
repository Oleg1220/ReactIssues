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
import CustButton from "components/Buttons/CustButton";
import CustModal from "components/Modals/CustModal";
import ReactBSAlert from "react-bootstrap-sweetalert";
import ExcelReport from "components/ExportExcel/ExcelReport";
import PDFReport from "components/ExportPDF/PDFReport";
import { UserContext,_dataService } from "App";
import { processDataFilter } from "services/data.services";
import DownloadOptions from "../../../../layouts/modals/DownloadOptions";
//

import AddLoctype from "./AddLoctype";
import EditLoctype from "./EditLoctype";
import { _helper } from "App";
import NoDataFound from "views/pages/error/NoDataFound";
import { _toastService } from "App";
import { removeColumn } from "services/data.services";
import { filterTextsReport } from "services/data.services";
import { t } from "i18next";
import CustAlert from "components/Alerts/CustAlert";


const Templates = require('components/ExportPDF/Templates/TemplateLocType');


function LocType(props) {

  const {user,setUser} = useContext(UserContext);
  const [componentList, setcomponentList] = useState([]);    
  const [filterArray, setFilterArray] = useState({
    "filters":[]
  });    

  //_exclude_keys will hide keys on dropdown and reports
  var _exclude_keys=["_id","archive","locations"];
  var _exclude_column_keys= ["name","locations"]; 
  const [_filterColumnArray,setFilterHeader]= useState({
    "headers":[]
  });
  var batch_ActiveList = [];
  var batch_ArchiveList = [];
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [keyword,setKeyword] = useState("");
  //Used for passing excelData, data can be set by processExcel
  
  const [archiveListCounter, setArchiveListCounter] = useState([]);  
 

  const {show_button} = props
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


  const [Toast, setToast] = useState([]);
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
    enable_button();    
    setTabsState({ tabs: index });    
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


    const processToast = (name,_id) =>{
      // var toast_object = Toast;
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
      //       <button className="btn btn-success btn-sm" onClick={(e)=>restore(e,_id)}>Undo</button>
      //     </div>
      //     <br/>
      //   </div>            
      // );
      // setToast(
      //   toast_object                
      // ); 
      
      // setTimeout(() => {
      //   closeToast(_id)
      // }, 2500);
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
          confirmCallback={()=>restore(e,row._id,row.name)}
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
    const addCallback = async (status,name  ) => {
      
      switch (status) {
        case "success":

          _toastService.hotToastService('Location Type',`${name ? name : ""} has been successfully added.`,'success');
          _getRecords(user,setcomponentList,tabsState.tabs -1);    
          toggleModal();


          break;

        case "existing":
          _toastService.hotToastService('Location Type',`${name} already exists.`,'warning');
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
          
          _toastService.hotToastService('Location Type',`${name ? name : ""} has been successfully updated.`,'success');  
          _getRecords(user,setcomponentList,tabsState.tabs -1);    
          setEditOpenModal(!openEditPopup);
          break;

        case "failed-fetch":
          _toastService.hotToastService('Error',`Location Type ${name ? name : ""} cannot be found.`,'error');  
          setEditOpenModal(!openEditPopup);
          break;
          

          case "failed":
            _toastService.hotToastService('Error',`Location Type ${name ? name : ""} failed to update.`,'error');  
            
            setEditOpenModal(!openEditPopup);
          break;
          case "existing":            
            _toastService.hotToastService('Location Type',`${name ? name : ""} already exist.`,'warning');  
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
          check_collection:["locations"],
          collection_field:"loctype_id"
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

      _dataService.CRUD(window.base_api+`archive/loctypes/${id}`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
      
        switch (records.remarks) {
          case "success":
               
            _getRecords(user,setcomponentList,tabsState.tabs -1);           

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
          check_collection:["locations"],
          collection_field:"loctype_id"
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
      setOpenAlert('')
      _dataService.CRUD(window.base_api+`loctypes/batch_archive`,requestOptions, async (response)=>{

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
            _toastService.hotToastService('Location Type',`Selected ${batch_ActiveList.length > 1 ? 'location types' : 'location type' }  has been deleted.`,'success');
          
            if(records.payload.failed_archive.length > 0){
              _toastService.hotToastService('Location Type',`${records.payload.failed_archive.length > 1 ? 'Some location types' : 'Some location type' }  is currently being used.`,'warning');
            }
            
           


            break;
          case "failed":
            
            _toastService.hotToastService('Location Type',`${records.payload.failed_archive.length > 1 ? 'Location types' : 'Location type' }  is currently being used.`,'warning');            
 

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
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
      
      //       
      _dataService.CRUD(window.base_api+`delete_loctype/${id}`,requestOptions, async (response)=>{
   
        // Your response to manipulate
        const records =response;                

        if(records.remarks=="success"){

          const newRecords = componentList.filter((el) => el._id !== id);
          setcomponentList  (newRecords);
         
          _toastService.hotToastService('Location Type',`${name ? name : ""} has been permanently deleted.`,'success');
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
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload)
      };
        
      _dataService.CRUD(window.base_api+`loctype/batch_delete/`,requestOptions, async (response)=>{

        // Your response to manipulate
        const records =response;                
        switch (records.remarks) {
          case "success":
            batch_ArchiveList =[];
            enable_button();

            _getRecords(user,setcomponentList,tabsState.tabs -1);    
            
            _toastService.hotToastService('Location Type',`Selected ${batch_ArchiveList.length > 1 ? 'location types' : 'location type' } has been permanently deleted.`,'success');
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

    const restore = async (e,id,name)=>{

      if(e.target.disabled || e.target.disabled ===undefined){
        e.preventDefault();
        return
        
      }
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

      _dataService.CRUD(window.base_api+`restore/loctypes/${id}`,requestOptions, async (response)=>{
  
        // Your response to manipulate
        const records =response;        

        //console.log(records);                
        if(records.remarks=="success"){

          if(tabsState.tabs==1){
            _getRecords(user,setcomponentList,tabsState.tabs -1);  
          }else{
            const newRecords = componentList.filter((el) => el._id !== id);
            setcomponentList  (newRecords);            
          }
                  
          _toastService.hotToastService('Location Type',`${name ? name : ""} has been restored.`,'success');
          setOpenAlert('');
          closeToast(id);


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
        
      _dataService.CRUD(window.base_api+`loctype/batch_restore`,requestOptions, async (response)=>{        
        // Your response to manipulate
        const records =response;                
        switch (records.remarks) {
          case "success":
            
            enable_button();
            _getRecords(user,setcomponentList,tabsState.tabs -1);    
                      
            _toastService.hotToastService('Location Type',`Selected ${batch_ArchiveList.length > 1 ? "location types" : "location type"} has been restored.`,'success');
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
        //console.log(records);                
      });

    }

  //#endregion
  
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
          payload:{ is_archived:_arhived} 
        };

          var requestOptions = {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(_payload)
          };

          _dataService.CRUD(window.base_api+`get_loctypes/`,requestOptions, async (response)=>{            
            // Your response to manipulate
            const records =response;

            //console.log(records);                
            if(records.remarks=="success"){
              if(records.payload.result.length > 0 ){
                const resPayload = records.payload["result"];                
                callback(resPayload);



              }else{
                callback([]);
                //console.log("No records fetch");
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
                    <h5 className=" text-muted">Session Expired / Session Mismatch.</h5> 
                  </ReactBSAlert>          
                );
                
                localStorage.removeItem("userData");
                  setTimeout(() => {
                    window.location.reload();
                  }, 2500);
              }else{
                console.log("Error occured with message "+records.message);
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
        tmpCols.push(  {
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
                  _onClick={(e)=>confirmPermanentDeleteAlert(e,row)}
                  _size="cust-md"
                />
              </>
            );
          },
        },);
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
        columns={tableColsGenerator(tabsState.tabs)}
        
        tableKeyField="name"
        classes="table-responsive"
              
        title="Locations Type"
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

    function processDataToSend(){
       // JSON.parse(JSON.stringify Refreain from using the useState of componentList
       var orig_data = JSON.parse(JSON.stringify(componentList))
       var processData = processDataFilter(orig_data,filterArray);
 
 
       var remove_headers = _exclude_keys;
       _filterColumnArray.headers.map((column)=>{
         remove_headers.push(column)
       })      
       var processData = removeColumn(processData,_exclude_keys);
 
       var count =-1;
 
       var filters_text = filterArray.filters.map((filter)=>{        
         count++;
         if(count ==0){
           return t(filter.filter_key) + " " + t(filter.filter_type) + " " + filter.filter_value 
         }
         return  t(filter.filter_condition)+ " "+ t(filter.filter_key) + " " + t(filter.filter_type) + " " + filter.filter_value 
      
        
       })    
       var data_to_send=[]
      
       processData.forEach(element => {
        var curr_element = [];
        for (const [key, value] of Object.entries(element)) {
          curr_element=({...curr_element,[t(key)]:value})   
        }
        data_to_send.push(curr_element)
       });
    

       return {data_to_send:data_to_send,processData: processData,filters_text:filters_text }

    }
    async function processExcel(){

      const data = processDataToSend();
    
      var body= JSON.stringify(
        {
          "key": "Q2FzeXNNb2RlY0FwaQ==",
          "data_translated": data.data_to_send,
          "filter_text": data.filters_text,
          "payload": data.processData,
          "title":"Location Type Report",
          "subtitle":"",

        } 
      );

      _dataService.processExcel(
        `basic/download_excel_base.php`,
        body,
        "Location Types",
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
      
      const data = processDataToSend();
    
      var body= JSON.stringify(
        {
          "key": "Q2FzeXNNb2RlY0FwaQ==",
          "data_translated": data.data_to_send,
          "filter_text": data.filters_text,
          "payload": data.processData,
          "title":"Location Type Report",
          "subtitle":"",

        } 
      )   

      _dataService.processPDF(
        `basic/download_pdf_base.php`,
        body,
        "Location Types",
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
    
    {_helper.isDevView(user.dev_view,
      
      <div>{JSON.stringify(componentList)}</div>

    )}
      <TabContent activeTab={"tabs" + tabsState.tabs}>
        <TabPane tabId="tabs1">
          <CardsHeader
            name="Location Type"
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
                        _text="Add"
                        _id={`addBtn`}
                        _type="button"
                        _color="default"
                        _icon="fas fa-plus"
                        _onClick={()=>setAddOpenModal(true)}
                        _size="cust-md"
                      />                     

                      <CustButton
                        _text="Download"
                        _onClick={toggleModalDownload}
                        _id={`downloadBtn`}
                        _type="button"
                        _color="default"
                        _icon="fas fa-download"
                        _size="cust-md"
                      />
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
                   {_displayCardBody(componentList,_filterColumnArray,1)}
                </Card>
              </Col>
            </Row>
          </Container>
        </TabPane>
        <TabPane tabId="tabs2">
          <CardsHeader
            name="Location Type | Archived"
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
                        _text="Back to list"
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
                    {_displayCardBody(componentList,_filterColumnArray,2)}
                </Card>
              </Col>
            </Row>
          </Container>
        
        </TabPane>
      </TabContent>
    
    
    
    
    
    
    <CustModal
      _modalTitle="Add Location Types"
      _modalId="AddLoctype"
      _state={toggleModal}
      _size="md"
      _onCloseClick={()=>setAddOpenModal(false)}
      _stateBool={openAddPopup}
    >
      <AddLoctype  _onCloseClick={()=>setAddOpenModal(false)} _callback={addCallback} />
    </CustModal>
    <CustModal
      _modalTitle="Edit Location Types"
      _modalId="AddLoctype"
      _state={toggleModaledit}
      _onCloseClick={()=>setEditOpenModal(false)}
      _size="md"
      _stateBool={openEditPopup}
    >
      <EditLoctype _id={editID} _onCloseClick={()=>setEditOpenModal(false)} _callback={editCallback}/>      
    </CustModal>

    <CustModal
      _modalTitle="Download Options"
      _modalId="viewDownloadOptions"
      _state={toggleModalDownload}
      _size="sm"
      _onCloseClick={()=>setDownloadPopup(false)}
      _stateBool={openDownloadPopup}
    >
      <DownloadOptions _state={downloadReport} />      
    </CustModal>
    {openAlert}
    {Toast.length>0?
       <div className={"bg-white shadow-lg p-3 mb-5 bg-white rounded position-fixed bottom-0 right-0 p-3"} style={{zIndex: "5",right: "40px",bottom: "60px",position: "fixed"}}>
             {Toast}
       </div>  :
      
      null}     
  </>
  )
}

export default LocType