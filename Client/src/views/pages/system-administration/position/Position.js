//DEFAULT NEEDED
import React, { useEffect, useState, useContext } from "react";
import CardsHeader from "components/Headers/CardsHeader";
import classnames from "classnames";
import {
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
import ExcelReport from "components/ExportExcel/ExcelReport";
import PDFReport from "components/ExportPDF/PDFReport";
import { UserContext, _dataService,_toastService } from "App";
import DownloadOptions from "../../../../layouts/modals/DownloadOptions";

//
//Cusom Modal
import AddPosition from "./AddPosition";
import EditPosition from "./EditPosition";

//Mock Data
import { useParams, useNavigate } from "react-router-dom";
import ViewJob from "./ViewJob";

import { processDataFilter } from "services/data.services";
import { useTranslation } from 'react-i18next';
import CustAlert from "components/Alerts/CustAlert";

//GLOBAL VARIABLE
//currentLoctypeAPI is for httpRequest
var currentLoctypeAPI = "";
var count_use_effect = 0;

function Position() {
  const params = useParams();
  var _id = null;
  if (params.id) {
    _id = params.id;
  } else {
    _id = null;
  }
  
  var _exclude_keys=["_id","job_description"];
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [componentList, setcomponentList] = useState([]);
  const [filterArray, setFilterArray] = useState({
    "filters":[]
  });     

  const [keyword,setKeyword] = useState("");
  const [loctypeList, setloctypeList] = useState([]);
  //USED FOR JSX PARAMETERS SUCH AS MODALS AND is_ACITVE
  const [currentLoctypeTable, setcurrentLoctypeTable] = useState([]);
  
  const { t, i18n } = useTranslation();
  var batch_ActiveList = [];
  var batch_ArchiveList = [];
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [archiveListCounter, setArchiveListCounter] = useState([]); 
  //Used for passing excelData, data can be set by processExcel
  //Then because of useState when btn-excel is clicked passed data will also change
  const [ExcelData, setExcelData] = useState([]);
  const [PDFData, setPDFData] = useState("");

  useEffect(() => {
    if (_id != null) {
      _getSpecificRecords(user, setcomponentList, tabsState.tabs - 1);
    } else {
      if (tabsState.tabs == 1) {
        _getLocTypes(user, setloctypeList);
      }
    }

    return;
  }, [user.token != "", _id]);

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

  //#region Toggle tabs
  const toggleListNavs = (e, statesss, index) => {
    e.preventDefault();
    setTabsState({ tabs: index });

    if (_id != null) {
      _getSpecificRecords(user, setcomponentList, index - 1);
    } else {
      _getRecords(user, setcomponentList, index - 1);
    }
    enable_button();

    // this.setState({
    //   [state]: index
    // });
  };

  const toggleLoctype = (e, statesss, index) => {
    e.preventDefault();
    if (index != currentLoctypeTable) {
      currentLoctypeAPI = index;
      setcurrentLoctypeTable(index);
      //Tabs is either 1 or 2
      //DB GETS 0 for not archived 1 for archived hence - 1
      if (_id == null) {
        _getRecords(user, setcomponentList, tabsState.tabs - 1);
      } else {
        _getSpecificRecords(user, setcomponentList, tabsState.tabs - 1);
      }
    } else {
      currentLoctypeAPI = index;
    }
  };
  //#endregion

  //#region Modals Events and Variables
  const [alertState, setAlertState] = useState({ alert: "" });
  const [openAddPopup, setAddOpenModal] = useState(false);
  const [openEditPopup, setEditOpenModal] = useState(false);
  const [jobDescPopup, setJobDescOpenModal] = useState(false);
  const [editID, setEditID] = useState(null);
  const [openDownloadPopup, setDownloadPopup] = useState(false);
  const [openAlert, setOpenAlert] = useState(null);

  const toggleModal = async () => {
    await setAddOpenModal(!openAddPopup);
  };
  const toggleModalDownload = async () => {
    await setDownloadPopup(!openDownloadPopup);
  };
  const toggleModaledit = (e, id) => {
    setEditID(id);
    setEditOpenModal(!openEditPopup);
  };
  const toggleModalJobDesc = (e, id) => {
    console.log(id);
    setEditID(id);
    setJobDescOpenModal(!jobDescPopup);
  };

  const hideAlert = () => {
    setOpenAlert(null);
  };
  
  //#region Confirmations
    const confirmDeleteAlert = (e,row) => {
        
      if(e.target.disabled || e.target.disabled ===undefined){
        e.preventDefault();
        return
      }

      setOpenAlert(
        <CustAlert
          type="delete"
          values={{ title: "position",subTitle:row.name,subContent:`Status: ${row.status ? `Active` : `Inactive`}`}}
          cancelCallback={hideAlert}
          confirmCallback={()=>proceedDelete(row)}
        /> 
      );
    };

    const confirmPermanentDeleteAlert = (e,row) => {
                  
      if(e.target.disabled || e.target.disabled ===undefined){
        e.preventDefault();
        return
        
      }

      setOpenAlert(
        <CustAlert
          type="deleteArchive"
          values={{ title: "position",subTitle:row.name,subContent:`This process cannot be undone.`}}
          cancelCallback={hideAlert}
          confirmCallback={()=>permanentDelete(row)}
        />
      );
    };

    const confirmPermanentDeleteBatchAlert = () => {
      setOpenAlert(
        <CustAlert
          type="deleteSelectedArchive"
          values={{ title: "position" ,data:batch_ArchiveList.length,subContent:`This process cannot be undone.`}}
          cancelCallback={hideAlert}
          confirmCallback={batchPermanentDelete}
        />
      );
    };

    const confirmRestoreAlert = (e,row) => {
                        
      if(e.target.disabled || e.target.disabled ===undefined){
        e.preventDefault();
        return
        
      }

      setOpenAlert(
        <CustAlert
          type="restore"
          values={{ title: "position",subTitle:row.name}}
          cancelCallback={hideAlert}
          confirmCallback={()=>restore(row)}
        />
      );
    };

    const confirmRestoreBatchAlert = () => {
      setOpenAlert(
        <CustAlert
          type="restoreSelected"
          values={{ title: "position" ,data:batch_ArchiveList.length}}
          cancelCallback={hideAlert}
          confirmCallback={batchRestore}
        />
      );
    };
  //#endregion
  
  //#endregion

  //#region CRUD
  const addCallback = async (status,name) => {
    switch (status) {
      case "success":
        _toastService.hotToastService('Position',`${name ? name : ""} has been successfully added.`,'success');
        setOpenAlert(``);
        _getRecords(user, setcomponentList, 0);
        toggleModal();
        break;

      case "existing":
        _toastService.hotToastService('Position',`Position already exists.`,'warning');
        setOpenAlert(``);
        break;

      case "uploading":
        _toastService.hotToastService('Position',`Uploading job description.`,'info');
        setOpenAlert(``);
        break;
      case "Bad Token":
        _toastService.hotToastService('Position',`Session Expired / Session Mismatch`,'error');
        setOpenAlert(``);
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
        _toastService.hotToastService('Position',`${name ? name : ""} has been successfully updated.`,'success');
        setEditOpenModal(!openEditPopup);
        setOpenAlert(``);
        _getRecords(user, setcomponentList, 0);
        break;

      case "success_file_update":
        _toastService.hotToastService('Position',`Job Description File has been successfully updated.`,'success');
        setOpenAlert(``);
        break;
      case "success_remove_file_update":
        _toastService.hotToastService('Position',`Job Description File has been successfully removed.`,'error');
        setOpenAlert(``);
        break;
      case "failed-fetch":
        _toastService.hotToastService('Position',`Position cannot be found.`,'error');
        setOpenAlert(``);
        setEditOpenModal(!openEditPopup);
        break;
      case "failed":
        _toastService.hotToastService('Position',`Position Group failed to update`,'error');
        setOpenAlert(``);
        setEditOpenModal(!openEditPopup);
        break;
      case "Bad Token":
        _toastService.hotToastService('Position',`Session Expired / Session Mismatch`,'error');
        setOpenAlert(``);
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
  const proceedDelete = async (row) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { ...componentList },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };

    var requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_payload),
    };

    _dataService.CRUD(
      window.base_api + `archive/positions/${row._id}`,
      requestOptions,
      async (response) => {
        // Your response to manipulate
        const records = response;

        if (records.remarks == "success") {
          const newRecords = componentList.filter((el) => el._id !== row._id);
          setcomponentList(newRecords);
          _toastService.hotToastService('Company',`${row.name} has been successfully deleted.`,'success');
          setOpenAlert('')

        } else {
          if (records.remarks == "Bad Token") {
            _toastService.hotToastService('Position',`Session Expired / Session Mismatch`,'error');
            setOpenAlert(``);

            localStorage.removeItem("userData");
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          } else {
            console.log("Error occured with message " + records.remarks);
          }
        }
      }
    );
  };

  const confirmDeleteSelectedAlert = () => {
    setOpenAlert(
      <CustAlert
        type="deleteSelected"
        values={{ title: "position" ,data:batch_ActiveList.length}}
        cancelCallback={hideAlert}
        confirmCallback={batchDelete}
      />
    );
  };

  const batchDelete = async () => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    var to_set;
    const _payload = {
      payload: { list: batch_ActiveList },
      auth: { token: token, _fullname: _fullname, _id: _user_id },
    };

    var requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_payload),
    };

    _dataService.CRUD(
      window.base_api + `positions/batch_archive`,
      requestOptions,
      async (response) => {
        // Your response to manipulate
        const records = response;
        if (records.remarks == "success") {
          _toastService.hotToastService('Position',`Selected ${batch_ActiveList.length > 1 ? 'positions' : 'position' } has been deleted.`,'success');
          _getRecords(user, setcomponentList, 0);
          setOpenAlert();
        } else {
          if (records.remarks == "Bad Token") {
            _toastService.hotToastService('Position',`Session Expired / Session Mismatch`,'error');
            setOpenAlert(``);

            localStorage.removeItem("userData");
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          } else {
            console.log("Error occured with message " + records.remarks);
          }
        }
      }
    );
  };

  const permanentDelete = async (row) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { ...componentList },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };

    var requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_payload),
    };

    _dataService.CRUD(
      window.base_api + `delete_position/${row._id}`,
      requestOptions,
      async (response) => {
        // Your response to manipulate
        const records = response;
        if (records.remarks == "success") {
          const newRecords = componentList.filter((el) => el._id !== row._id);
          setcomponentList(newRecords);
          _toastService.hotToastService('Position',`${row.name} has been permanently deleted.`,'success');
          setOpenAlert(``);
        } else {
          if (records.remarks == "Bad Token") {
            _toastService.hotToastService('Position',`Session Expired / Session Mismatch`,'error');
            setOpenAlert(``);

            localStorage.removeItem("userData");
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          } else {
            console.log("Error occured with message " + records.remarks);
          }
        }
      }
    );
  };

  const batchPermanentDelete = async () => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { list: batch_ArchiveList },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };

    var requestOptions = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_payload),
    };

    _dataService.CRUD(
      window.base_api + `locations/batch_delete/`,
      requestOptions,
      async (response) => {
        // Your response to manipulate
        const records = response;
        if (records.remarks == "success") {
          _toastService.hotToastService('Position',`Selected ${batch_ArchiveList.length > 1 ? 'positions' : 'position' } has permanently deleted.`,'success');
          _getRecords(user, setcomponentList, 1);
          setOpenAlert();
        } else {
          if (records.remarks == "Bad Token") {
            _toastService.hotToastService('Position',`Session Expired / Session Mismatch`,'error');
            setOpenAlert(``);
            localStorage.removeItem("userData");
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          } else {
            console.log("Error occured with message " + records.remarks);
          }
        }
      }
    );
  };

  const restore = async (row) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { ...componentList },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };

    var requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_payload),
    };

    _dataService.CRUD(
      window.base_api + `restore/positions/${row._id}`,
      requestOptions,
      async (response) => {
        // Your response to manipulate
        const records = response;

        //console.log(records);
        if (records.remarks == "success") {
          if (tabsState.tabs == 1) {
            _getRecords(user, setcomponentList, 0);
          } else {
            const newRecords = componentList.filter((el) => el._id !== row._id);
            setcomponentList(newRecords);
          }

          _toastService.hotToastService('Position',`${row.name} has been successfully restored.`,'success');
          setOpenAlert('');
        } else {
          if (records.remarks == "Bad Token") {
            _toastService.hotToastService('Position',`Session Expired / Session Mismatch`,'error');
            setOpenAlert(``);

            localStorage.removeItem("userData");
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          } else {
            console.log("Error occured with message " + records.remarks);
          }
        }
      }
    );
  };
  const batchRestore = async () => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    var to_set;
    const _payload = {
      payload: { list: batch_ArchiveList },
      auth: { token: token, _fullname: _fullname, _id: _user_id },
    };

    var requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_payload),
    };

    _dataService.CRUD(
      window.base_api + `positions/batch_restore`,
      requestOptions,
      async (response) => {
        // Your response to manipulate
        const records = response;
        if (records.remarks == "success") {
          _getRecords(user, setcomponentList, 1);
          _toastService.hotToastService('Position',`Selected ${batch_ArchiveList.length > 1 ? 'positions' : 'position' } has been restored.`,'success');
          setOpenAlert('')
        } else {
          if (records.remarks == "Bad Token") {
            _toastService.hotToastService('Position',`Session Expired / Session Mismatch`,'error');
            setOpenAlert(``);

            localStorage.removeItem("userData");
            setTimeout(() => {
              window.location.reload();
            }, 2500);
          } else {
            _toastService.hotToastService('Position',"Error: " + records.message,'error');
          }
        }
      }
    );
  };
  //#endregion

  //#region Get Records and disiplay card body
  async function _getLocTypes(user, callback) {
    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;

    if (token && token_creation) {
      const _payload = {
        auth: {
          token: token,
          _id: _user_id,
        },
        payload: { is_archived: 0 },
      };

      var requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      };

      _dataService.CRUD(
        window.base_api + `get_active_loctypes/`,
        requestOptions,
        async (response) => {
          // Your response to manipulate
          const records = response;
          if (records.remarks == "success") {
            if (records.payload.result.length > 0) {
              const resPayload = records.payload["result"];
              callback(resPayload);
              currentLoctypeAPI = resPayload[0]._id;
              setcurrentLoctypeTable(resPayload[0]._id);
              if (_id == null) {
                _getRecords(user, setcomponentList, 0);
              }
            } else {
              callback([]);
              console.log("No records fetch");
            }
          } else {
            if (records.remarks == "Bad Token") {
              _toastService.hotToastService('Position',`Session Expired / Session Mismatch`,'error');
              setOpenAlert(``);

              localStorage.removeItem("userData");
              setTimeout(() => {
                window.location.reload();
              }, 2500);
            } else {
              console.log("Error occured with message " + records.remarks);
            }
          }
        }
      );
    } else {
      if (count_use_effect >= 2) {
        console.log("Missing credentials kindly logged in");
      }
    }
  }

  function _getLocTypeTabs() {
    return (
      <Nav
        className="flex-column flex-md-row"
        id="tabs-icons-text"
        pills
        role="tablist"
      >
        {loctypeList.map(function (item, i) {
          return (
            <NavItem size="cust-md" key={"navItem-" + i} className="mt-1">
              <NavLink
                key={"navLink-" + i}
                aria-selected={currentLoctypeTable === item._id}
                className={classnames("mb-sm-3 mb-md-0", {
                  active: currentLoctypeTable === item._id,
                })}
                onClick={(e) => toggleLoctype(e, "tabs", item._id)}
                href={"#" + item.name}
                role="tab"
              >
                {item.name}
              </NavLink>
            </NavItem>
          );
        })}
      </Nav>
    );
  }

  async function _getRecords(user, callback, archived) {
    //## Disable delete selected on load
    //Props not removing disable on run
    //enable_button to check if multiple has items to enable the button
    enable_button();
    callback([]);
    //setMultiplelist([]);
    //

    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;

    if (token && token_creation) {
      const _payload = {
        auth: {
          token: token,
          _id: _user_id,
        },
        payload: { is_archived: archived, loctype_id: currentLoctypeAPI },
      };

      if (currentLoctypeAPI == "") {
        return;
      }

      var requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      };

      _dataService.CRUD(
        window.base_api + `get_positions/`,
        requestOptions,
        async (response) => {
          // Your response to manipulate
          const records = response;
          if (records.remarks == "success") {
            if (records.payload.result.length > 0) {
              const resPayload = records.payload["result"];
              callback(resPayload);
            } else {
              callback([]);
              console.log("No records fetch");
            }
          } else {
            if (records.remarks == "Bad Token") {
              _toastService.hotToastService('Position',`Session Expired / Session Mismatch`,'error');
              setOpenAlert(``);

              localStorage.removeItem("userData");
              setTimeout(() => {
                window.location.reload();
              }, 2500);
            } else {
              console.log("Error occured with message " + records.remarks);
            }
          }
        }
      );
    } else {
      if (count_use_effect >= 2) {
        console.log("Missing credentials kindly logged in");
      }
    }
  }



  async function _getSpecificRecords(user, callback, archived, c_id) {
    //## Disable delete selected on load
    //Props not removing disable on run
    //enable_button to check if multiple has items to enable the button
    enable_button();
    //setMultiplelist([]);
    //

    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;

    if (token && token_creation) {
      const _payload = {
        auth: {
          token: token,
          _id: _user_id,
        },
        payload: { is_archived: archived, loctype_id: currentLoctypeAPI },
      };

      var requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      };

      _dataService.CRUD(
        window.base_api + `get_location_byGroup/` + _id,
        requestOptions,
        async (response) => {
          // Your response to manipulate
          const records = response;
          //console.log(records);
          if (records.remarks == "success") {
            if (records.payload.result.length > 0) {
              const resPayload = records.payload["result"];
              callback(resPayload);
            } else {
              callback([]);
              console.log("No records fetch");
            }
          } else {
            if (records.remarks == "Bad Token") {
              _toastService.hotToastService('Position',`Session Expired / Session Mismatch`,'error');
              setOpenAlert(``);

              localStorage.removeItem("userData");
              setTimeout(() => {
                window.location.reload();
              }, 2500);
            } else {
              console.log("Error occured with message " + records.remarks);
            }
          }
        }
      );
    } else {
      if (count_use_effect >= 2) {
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
      dataField: "-loctypes",
      text: "Positions",
      sort: true,
      formatter: (cell, row, rowIndex) => {
        return <>{row["-departments"].name}</>;
      },
    },
    {
      dataField: "location_group",
      text: "Position Group",
      sort: true,
      formatter: (cell, row, rowIndex) => {
        return <>{row["-location_group"].name}</>;
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
              _onClick={(e) => toggleModaledit(e, row._id)}
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
              _name="delete_row"
              _onClick={(e) => confirmDeleteAlert(e,row)}
              _size="cust-md"
            />
          </>
        );
      },
    },
  ];


  const tableColsGenerator = (index) => {
    var name = t("Name");
    var tmpCols = [
      {
        dataField: "name",
        text: name,
        sort: true,
      }
    ];


    if (index == 1) {
      // Active Table Actions
      tmpCols.push(
        {
          dataField: "-locations",
          text: "Location",
          sort: true,
          formatter: (cell, row, rowIndex) => {
            return <>{row["-locations"].name}</>;
          },
        },
        {
          dataField: "-divisions",
          text: "Division",
          sort: true,
          formatter: (cell, row, rowIndex) => {
            return <>{row["-divisions"].name}</>;
          },
        },
        {
          dataField: "-departments",
          text: "Department",
          sort: true,
          formatter: (cell, row, rowIndex) => {
            return <>{row["-departments"].name}</>;
          },
        },
        {
          dataField: "status",
          text: "Status",
          headerStyle: { width: "8%" },
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
          dataField: "hierarchy",
          text: "Hierarchy",
          headerStyle: { width: "8%" },
          sort: true,
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
                  _text="Job Description"
                  _id={`jdBtn_${row.name}`}
                  _type="button"
                  _color="default"
                  _onClick={(e) => toggleModalJobDesc(e, row._id)}
                  _icon="fas fa-file"
                  _size="cust-md"
                />
                <CustButton
                  _text="Edit"
                  _id={`editBtn_${row.name}`}
                  _type="button"
                  _onClick={(e) => toggleModaledit(e, row._id)}
                  _color="default"
                  _icon="fas fa-pen"
                  _size="cust-md"
                />
                <CustButton
                  _text="Delete"
                  _id={`deleteBtn_${row.name}`}
                  _type="button"
                  _color="danger"
                  _name="delete_row"
                  _icon="fas fa-trash-alt"
                  _onClick={(e) => confirmDeleteAlert(e,row)}
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
          dataField: "-locations",
          text: "Location",
          sort: true,
          formatter: (cell, row, rowIndex) => {
            return <>{row["-locations"].name}</>;
          },
        },
        {
          dataField: "-divisions",
          text: "Division",
          sort: true,
          formatter: (cell, row, rowIndex) => {
            return <>{row["-divisions"].name}</>;
          },
        },
        {
          dataField: "-departments",
          text: "Department",
          sort: true,
          formatter: (cell, row, rowIndex) => {
            return <>{row["-departments"].name}</>;
          },
        },
        {
          dataField: "status",
          text: "Status",
          headerStyle: { width: "8%" },
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
          dataField: "hierarchy",
          text: "Hierarchy",
          headerStyle: { width: "8%" },
          sort: true,
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
                  _onClick={(e) => confirmRestoreAlert(e,row)}
                  _color="default"
                  _icon="fas fa-redo"
                  _name="delete_row_archive"
                  _size="cust-md"
                />
                <CustButton
                  _text="Permanently Delete"
                  _id={`deleteBtn_${row.name}`}
                  _type="button"
                  _color="danger"
                  _icon="fas fa-trash-alt"
                  _name="delete_row_archive"
                  _onClick={(e) => confirmPermanentDeleteAlert(e,row)}
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
    console.log(_filterArray);
    updateState({filters: _filterArray.filters},setFilterArray)        
    forceUpdate();
    
  }

  function _displayCardBody(componentList, index) {
    var cols = [];
    if (_id !== null) {
      cols = tableSpecificCols;
    } else {
      cols = tableColsGenerator(tabsState.tabs);
    }

    return (
      <CardBody className="Scrollble">
        <ReactBSTables
          data={filterArray.filters.length > 0 ? processDataFilter(componentList,filterArray):componentList}
          filter={true}        
          _exclude_keys={_exclude_keys}
          original_data={componentList}
          _callback={FilterCallback}    
          _filterArray={filterArray} 
          columns={cols}
          tableKeyField="_id"
          classes="table-responsive"        
          selectRow={{
            mode: "checkbox",
            headerColumnStyle: { width: "3%" },
            onSelect: (rows, IsSelect, RowIndex, E) => {
              if (IsSelect) {
                if (tabsState.tabs == 1) {
                  batch_ActiveList.push(rows);
                } else {
                  batch_ArchiveList.push(rows);
                }
              } else {
                console.log(rows);
                var obj = [];
                if (tabsState.tabs == 1) {
                  obj = batch_ActiveList;
                } else {
                  obj = batch_ArchiveList;
                }
                var i = 0;
                obj.forEach((element) => {
                  if (element._id == rows._id) {
                    var spliced = obj.splice(i, 1);
                  }
                  i++;
                });

                if (tabsState.tabs == 1) {
                  batch_ActiveList = obj;
                } else {
                  batch_ArchiveList = obj;
                }
              }
              enable_button();
            },
            onSelectAll: (isSelect, rows, E) => {
              if (isSelect) {
                if (tabsState.tabs == 1) {
                  rows.forEach((element) => {
                    batch_ActiveList.push(element);
                  });
                } else {
                  rows.forEach((element) => {
                    batch_ArchiveList.push(element);
                  });
                }

                //setMultiplelist(obj);
              } else {
                if (tabsState.tabs == 1) {
                  var obj = Object.assign(batch_ActiveList);
                  rows.forEach((element) => {
                    obj = obj.filter((el) => el._id !== element._id);
                  });
                  batch_ActiveList = obj;
                } else {
                  var obj = Object.assign(batch_ArchiveList);
                  rows.forEach((element) => {
                    obj = obj.filter((el) => el._id !== element._id);
                  });

                  batch_ArchiveList = obj;
                }

                var obj = Object.assign(batch_ActiveList);
                rows.forEach((element) => {
                  obj = obj.filter((el) => el._id !== element._id);
                });
                batch_ActiveList = obj;
              }
              enable_button();
            }
          }}
        />
      </CardBody>
    );
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
        console.log(1)
        bttn.disabled = true;
        bttn2.disabled = true;

        const elements = document.getElementsByName("delete_row_archive");
     
        elements.forEach((el) => {
          el.disabled = false;
        });
      }
    }else{
      console.log(`archive elese 1111`)
    }

  }
  //#endregion

  //#region (EXPORT REPORT XLS PDF)
 
  function downloadReport(){
    var radio_btn = document.querySelector('input[name = "customRadio"]:checked');
    if(radio_btn != null){
      if(radio_btn.id == "pdf_radio"){
        processPDF();
      }
      else if(radio_btn.id == "excel_radio"){
        processExcel();
      }
    }
  }

  async function processExcel(){
    var requestOptions = {
      method: 'POST',
      body:JSON.stringify(
        {
          "key": "Q2FzeXNNb2RlY0FwaQ==",
          "payload":componentList,
          "keyword":keyword
        } 
      )
    
    };
    
    _dataService.BlobFetch(window.download_api+`positions/download_excel_positions.php`,requestOptions, async (response,status)=>{        
      if ( response.size <=51) {
        toggleModalDownload();
        _toastService.hotToastService('Company',`Failed to Download Report`,'error');
        setOpenAlert();
        return
      }

      toggleModalDownload();
      var a = document.createElement("a");
      a.href = window.URL.createObjectURL(response);
      a.download = "Positions.xlsx";
      a.click();
    });
  }

  
  async function processPDF(){
     var requestOptions = {
       method: 'POST',
       body:JSON.stringify(
         {
           "key": "Q2FzeXNNb2RlY0FwaQ==",
           "payload":componentList,
           "keyword":keyword
         } 
       )
     };
     
     _dataService.BlobFetch(window.download_api+`positions/download_pdf_positions.php`,requestOptions, async (response,status)=>{        
       if ( response.size <=51) {
         toggleModalDownload();
         _toastService.hotToastService('Company',`Failed to Download Report`,'error');
         setOpenAlert();
         return
       }
       toggleModalDownload();
       var binaryData = [];
       binaryData.push(response);
       var a = document.createElement("a");
       a.href = window.URL.createObjectURL(new Blob(binaryData, {type: "application/pdf"}))
       a.download = "Positions.pdf";
       a.click();
     });
   }
  //#endregion

  return (
    <>
      <CardsHeader
        name={tabsState.tabs == 2 ? "Position | Archive" : "Position"}
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
                    <div>{_getLocTypeTabs()}</div>
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
                            _hidden={_id ? true : false}
                          />
                          <CustButton
                            _text="Download"
                            _onClick={toggleModalDownload}
                            _id={`downloadBtn`}
                            _type="button"
                            _color="default"
                            _icon="fas fa-download"
                            _disabled={componentList.length <= 0}
                            _hidden={false}
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
                            _onClick={(e) => {
                              toggleListNavs(e, null, 2);
                            }}
                          />
                          <ExcelReport
                            id="btn-excel"
                            btn_style="btn btn-primary d-none"
                            file_name="Positions"
                            data={ExcelData}
                          >
                            Download Template
                          </ExcelReport>

                          <PDFReport
                            html_data={PDFData}
                            file_name="Positions"
                            id="btn-pdf"
                            btn_style="btn btn-primary d-none"
                          ></PDFReport>
                        </TabPane>
                        <TabPane tabId="tabs2">
                          <CustButton
                            _text="Restore Selected"
                            _id={`restoreSelected`}
                            _type="button"
                            _onClick={() => confirmRestoreBatchAlert()}
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
                            _icon="fas fa-box-open"
                            _disabled={false}
                            _size="cust-md"
                            _onClick={(e) => toggleListNavs(e, null, 1)}
                          />
                        </TabPane>
                      </TabContent>
                    </div>
                  </Col>
                </Row>
              </CardHeader>
              <TabContent activeTab={"tabs" + tabsState.tabs}>
                <TabPane tabId="tabs1">
                {  _displayCardBody(componentList, 2)}
                </TabPane>
                <TabPane tabId="tabs2">
                  {  _displayCardBody(componentList, 2)}
                </TabPane>
              </TabContent>
            </Card>
          </Col>
        </Row>
      </Container>

      <CustModal
        _modalTitle="Add Position"
        _modalId="AddPosition"
        _state={toggleModal}
        _size="md"
        _stateBool={openAddPopup}
      >
        <AddPosition
          _state={toggleModal}
          _callback={addCallback}
          _loctype_id={currentLoctypeTable}
          _loctype_list={loctypeList}
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
        _modalTitle="Edit Position"
        _modalId="editLoc"
        _state={toggleModaledit}
        _size="md"
        _stateBool={openEditPopup}
      >
        <EditPosition
          _id={editID}
          _state={toggleModaledit}
          _callback={editCallback}
        />
      </CustModal>
      <CustModal
        _modalTitle="Job Description"
        _modalId="viewJobDesc"
        _state={toggleModalJobDesc}
        _size="lg"
        _stateBool={jobDescPopup}
      >
        <ViewJob
          _id={editID}
          _state={toggleModalJobDesc}
          _callback={editCallback}
        />
      </CustModal>
      {openAlert}
    </>
  );
}

export default Position;
