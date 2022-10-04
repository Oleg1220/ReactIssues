import React, { useState, useEffect, useContext } from "react";
import CardsHeader from "components/Headers/CardsHeader";
import classnames from "classnames";
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
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,

} from "reactstrap";

import { useTranslation } from "react-i18next";
import ReactBSTables from "components/Tables/ReactBSTables";
import CustButton from "components/Buttons/CustButton";
import CustModal from "components/Modals/CustModal";
import ReactBSAlert from "react-bootstrap-sweetalert";
import { UserContext, _dataService,_toastService } from "App";
import ShowProvider from "./ShowProvider";
import EditProvider from "./EditProvider"; 

//Custom CSS
import './stl.css'
import AddProviders from "./AddProviders";
import NoDataFound from "views/pages/error/NoDataFound";
import { processDataFilter } from "services/data.services";

// import AddProvider from "./AddProvider";
// import EditProvider from "./EditProvider";

function Provider() {
  const { user, setUser } = useContext(UserContext);
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [tabsListState, setTabsListState] = useState({ tabs: 1 });
  const [componentList, setcomponentList] = useState([]);
  const [openAlert, setOpenAlert] = useState(null);
  const [openEditPopup, setEditPopup] = useState(false);
  const [openViewPopup, setViewPopup] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedViewedName, setSelectedViewedName] = useState(null);
  const [openAddModal, setAddModal] = useState(false);
  const [archiveListCounter, setArchiveListCounter] = useState([]);

  const [openAddPopup, setAddOpenModal] = useState(false);

  const  {t} = useTranslation();
  const [filterArray, setFilterArray] = useState({
    "filters":[]
  });    

  var batch_ActiveList = [];
  var batch_ArchiveList = [];

  const toggleTabs = (e, statesss, index) => {
    e.preventDefault();
    setTabsState({ tabs: index });
  };

  const toggleListNavs = (e) => {
    e.preventDefault();
    var index = tabsListState.tabs == 1 ? 2 : 1;
    setTabsListState({ tabs: index });
    if (index == 2) {
      _getArchiveRecords(user, setcomponentList);
    } else {
      _getArchiveRecords(user, setArchiveListCounter); // ? Check if there is record in archive
      _getRecords(user, setcomponentList);
    }
    enable_button();
  };

  function updateState(value,setState){
    return setState((prev) => {
      return { ...prev, ...value };
    });
  }
  //THIS METHOD IS FOR FORCING UPDATE RENDER
  const [state, _forceUpdate] = useState();
  const forceUpdate = React.useCallback(() => _forceUpdate({}), []);

  useEffect(() => {
    if (tabsListState.tabs == 1) {
      _getRecords(user, setcomponentList);
      _getArchiveRecords(user, setArchiveListCounter); // ? Check if there is record in archive
    }else{
      _getArchiveRecords(user, setcomponentList);
    }
    return;
  }, [componentList.length, user.token != ""]);

  // Get Provider Records
  var count_use_effect = 0;
  const _getRecords = async (user, callback) => {
    enable_button(); /** Disable delete selected on load */

    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;

    if (token && token_creation) {
      const payload = {
        payload: {},
        auth: { token: token, _id: _user_id },
      };

      await fetch(window.base_api + `get_providers/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(async (response) => {
          // Your response to manipulate
          const records = await response.json();
          if (records.remarks === "success") {
            if (records.payload != null) {
              const resPayload = records.payload["result"];
              callback(resPayload);
            } else {
              console.log("No records fetch");
            }
          } else {
            if (records.remarks === "Bad Token") {
              console.log("Token expired or mismatch");
              localStorage.removeItem("userData");
              setTimeout(() => {
                window.location.reload();
              }, 2500);
            } else {
              console.log("Error occured with message " + records.remarks);
            }
          }
        })
        .catch((error) => {
          console.log(
            "Something went wrong, Server cannot be reach with returned error : " +
              error
          );
        });
    } else {
      if (count_use_effect >= 2) {
        console.log("Missing credentials kindly logged in");
      }
    }
    console.log(`fetch data`);
  };

  // Get Provider Archives
  var count_use_effect = 0;
  async function _getArchiveRecords(user, callback) {
    //## Disable delete selected on load
    enable_button();

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
        payload: {},
      };

      await fetch(window.base_api + `get_archive/providers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      })
        .then(async (response) => {
          // Your response to manipulate
          const records = await response.json();

          //console.log(records);
          if (records.remarks == "success") {
            const resPayload = records.payload["result"];
            callback(resPayload);
          } else {
            if (records.remarks == "Bad Token") {
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
            } else {
              console.log("Error occured with message " + records.remarks);
            }
          }
        })
        .catch((error) => {
          var return_data = {
            message: "Something went wrong, System return " + error,
            payload: [],
            remarks: "error",
          };
          console.log(
            "Something went wrong, Server cannot be reach with returned error : " +
              error
          );
        });
    } else {
      if (count_use_effect >= 2) {
        console.log("Missing credentials kindly logged in");
      }
    }
  }

  // Enable buttons on Page
  const enable_button = () => {
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

    // if (typeof btnDeleteArchive != "undefined" && btnDeleteArchive != null) {
    //   var bttn = document.getElementById("deleteSelectedBtnArchive");
    //   var bttn2 = document.getElementById("restoreSelected");
    //   if (batch_ArchiveList.length > 0) {
    //     bttn.disabled = false;
    //     bttn.classList.remove("disabled");
    //     bttn2.disabled = false;
    //     bttn2.classList.remove("disabled");
    //   } else {
    //     bttn.disabled = true;
    //     bttn.classList.add("disabled");
    //     bttn2.disabled = true;
    //     bttn2.classList.add("disabled");
    //   }
    // }

    // if (tabsListState.tabs == 1) {

    // } else {

    // }
  };

  // Restore Function
  const confirmRestoreAlert = (row) => {
    setOpenAlert(
      <ReactBSAlert
        info
        reverseButtons={false}
        style={{ display: "block", marginTop: "-100px" }}
        title=""
        onCancel={hideAlert}
        onConfirm={() => restore(row._id,row.name)}
        showCancel
        confirmBtnBsStyle="primary"
        confirmBtnText="Yes"
        cancelBtnBsStyle="secondary"
        cancelBtnText="No"
        btnSize=""
      >
        <h2>Are you sure you want to restore this provider?</h2>
        <h5 className=" text-muted">Provider: {row.name}</h5>
      </ReactBSAlert>
    );
  };

  const restore = async (id, name) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { ...componentList },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };

    _dataService.CRUD(
      window.base_api + `restore/providers/${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      },
      async (records) => {
        if (records.remarks == "success") {
          if (tabsListState.tabs == 1) {
            _getRecords(user, setcomponentList);
          } else {
            const newRecords = componentList.filter((el) => el._id !== id);
            setcomponentList(newRecords);
          }

         
          _toastService.hotToastService('Provider',`${name} has been successfully restored.`,'success');
          setOpenAlert('');
        } else {
          if (records.remarks == "Bad Token") {
            _toastService.hotToastService('Company',`Session Expired / Session Mismatch`,'error');
            setOpenAlert('');


            localStorage.removeItem("userData");
            setInterval(() => {
              window.location.reload();
            }, 2500);
          } else {
            console.log("Error occured with message " + records.remarks);
          }
        }
      }
    );
  };

  // Delete Function
  const confirmDeleteAlert = (row) => {
    setOpenAlert(
      <ReactBSAlert
        warning
        reverseButtons={false}
        style={{ display: "block", marginTop: "-100px" }}
        title=""
        onCancel={hideAlert}
        onConfirm={() => UsageCheck(row._id,row.name)}
        showCancel
        confirmBtnBsStyle="danger"
        confirmBtnText="Yes, delete it!"
        cancelBtnBsStyle="secondary"
        cancelBtnText="Cancel"
        btnSize=""
      >
        <h2>Are you sure you want to delete this provider?</h2>
        <h5 className=" text-muted">Provider: {row.name}</h5>
        <h5 className=" text-muted">Status: {(row.status) ? `Active` : `Inactive`}</h5>
      </ReactBSAlert>
    );
  };

  const proceedDelete = async (id,name) => {
    console.log(id);
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { ...componentList,
        check_collection:["provider"],
        collection_field:"provider_id" },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };
    _dataService.CRUD(
      window.base_api + `archive/providers/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      },
      async (records) => {
        if (records.remarks == "success") {
          const newRecords = componentList.filter((el) => el._id !== id);
          setcomponentList(newRecords);
          _toastService.hotToastService('Provider',`${name} has been successfully deleted.`,'success');
          setOpenAlert('')
        } else {
          if (records.remarks == "Bad Token") {
            _toastService.hotToastService('Company',`Session Expired / Session Mismatch`,'error');
            setOpenAlert('');

            localStorage.removeItem("userData");
            setInterval(() => {
              window.location.reload();
            }, 2500);
          } else {
            console.log("Error occured with message " + records.remarks);
          }
        }
      }
    );
  };

  // Data Validator
  const UsageCheck = async(id, name)=>{
    proceedDelete(id, name)
  }

  // Permanently Delete Function
  const confirmPermanentDeleteAlert = (row) => {
    setOpenAlert(
      <ReactBSAlert
        warning
        reverseButtons={false}
        style={{ display: "block", marginTop: "-100px" }}
        title="Are you sure?"
        onCancel={hideAlert}
        onConfirm={() => permanentDelete(row._id,row.name)}
        showCancel
        confirmBtnBsStyle="danger"
        confirmBtnText="Yes, delete it!"
        cancelBtnBsStyle="secondary"
        cancelBtnText="Cancel"
        btnSize=""
      >
      <h2>Are you sure you want to permanently delete this provider?</h2>
      <h5 className=" text-muted">Provider: {row.name}</h5>
      <h5 className=" font-weight-bold">This process cannot be undone.</h5>
      </ReactBSAlert>
    );
  };
  
  const permanentDelete = async (id, name) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { ...componentList },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };

    await fetch(window.base_api + `delete_providers/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_payload),
    })
      .then(async (response) => {
        // Your response to manipulate
        const records = await response.json();

        //console.log(records);
        if (records.remarks == "success") {
          const newRecords = componentList.filter((el) => el._id !== id);
          setcomponentList(newRecords);
          _toastService.hotToastService('Provider',`${name} has been permanently deleted.`,'success');
          setOpenAlert(``);
        } else {
          if (records.remarks == "Bad Token") {
            _toastService.hotToastService('Company',`Session Expired / Session Mismatch`,'error');
            setOpenAlert(``);
            localStorage.removeItem("userData");
            setInterval(() => {
              window.location.reload();
            }, 2500);
          } else {
            console.log("Error occured with message " + records.remarks);
          }
        }
      })
      .catch((error) => {
        var return_data = {
          message: "Something went wrong, System return " + error,
          payload: [],
          remarks: "error",
        };
        console.log(
          "Something went wrong, Server cannot be reach with returned error : " +
            error
        );
      });
  };


  // Table Columns
  const tableColsGenerator = (index) => {
    var headers = {
      name:t("name"),
     status:t("status"),
     action:t("action"),       
  }
    var tmpCols = [
      {
        dataField: "name",
        text: headers.name,
        sort: true,
      },
    ];
    if(index == 1)   {
      tmpCols.push({
      dataField: "status",
      text: headers.status,
      headerStyle: { width: "25%" },
      sort: true,
      formatter: (cell, row, rowIndex) => {
        return (
          <>
            <span
              className={row.status === 1 ? "text-success" : "text-danger"}
            >
              ●
            </span>{" "}
            {row.status === 1 ? "Active" : "Inactive"}
          </>
        );
      }
    })
    }
    if (index == 1) {
      // Active Table Actions
      tmpCols.push({
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
                _text="Contact Details"
                _id={`dashBtn_${row.name}`}
                _onClick={() => setModalView(row._id, row.name)}
                _type="button"
                _color="default"
                _icon="fas fa-address-card"
                _size="cust-md"
              />
              <CustButton
                _text="Edit"
                _id={`editBtn_${row.name}`}
                _type="button"
                _onClick={() => setModalEdit(row._id)}
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
                _onClick={() => confirmDeleteAlert(row)}
                _size="cust-md"
                _name="delete_row"
              />
            </>
          );
        },
      });
    } else {
      // Archive Table Actions
      tmpCols.push({
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
                _onClick={() => confirmRestoreAlert(row)}
                _color="default"
                _icon="fas fa-redo"
                _size="cust-md"
                _name="delete_row_archive"
              />
              <CustButton
                _text="Permanently Delete"
                _id={`deleteBtn_${row.name}`}
                _type="button"
                _color="danger"
                _icon="fas fa-trash-alt"
                _onClick={() => confirmPermanentDeleteAlert(row)}
                _size="cust-md"
                _name="delete_row_archive"
              />
            </>
          );
        },
      });
    }
    return tmpCols;
  };

  // Filter Function
  function FilterCallback(_filterArray, _filteredData){    
    //console.log(_filterArray);
    updateState({filters: _filterArray.filters},setFilterArray)        
    forceUpdate();
    
  }

  // Card Body Display
  function _displayCardBody(componentList, index) {
    return (
      <ReactBSTables
      data={filterArray.filters.length > 0 ? processDataFilter(componentList,filterArray):componentList}
      filter={true}        
      _exclude_keys={[]}
      original_data={componentList}
      _callback={FilterCallback}    
      _filterArray={filterArray}      
      columns={tableColsGenerator(index)}
        tableKeyField="name"
        classes="table-responsive"
        selectRow={{
          mode: "checkbox",
          headerColumnStyle: { width: "3%" },
          onSelect: (rows, IsSelect, RowIndex, E) => {
            console.log(`select`);
            if (IsSelect) {
              var obj = [];

              if (tabsListState.tabs == 1) {
                batch_ActiveList.push(rows);
              } else {
                batch_ArchiveList.push(rows);
              }
              console.log(batch_ActiveList);
            } else {
              var obj = batch_ActiveList;
              var i = 0;
              obj.forEach((element) => {
                if (element._id == rows._id) {
                  var spliced = obj.splice(i, 1);
                }
                i++;
              });

              if (tabsListState.tabs == 1) {
                batch_ActiveList = obj;
              } else {
                batch_ArchiveList = obj;
              }
            }
            enable_button();
          },
          onSelectAll: (isSelect, rows, E) => {
            if (isSelect) {
              if (tabsListState.tabs == 1) {
                batch_ActiveList = rows;
              } else {
                batch_ArchiveList = rows;
              }
            } else {
              if (tabsListState.tabs == 1) {
                var obj = Object.assign(batch_ActiveList);
                console.log(obj);
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
              console.log(obj);
              rows.forEach((element) => {
                obj = obj.filter((el) => el._id !== element._id);
              });
              batch_ActiveList = obj;
            }
            enable_button();
          },
          
        }}
      />
    );
  }

  // Toggle Add Modal
  const toggleModal = async () => {
    await setAddOpenModal(!openAddPopup);
  };

  // Toggle Add Modal
  const toggleAddModal = async()=>{
    await setAddModal(!openAddModal);
  };

  // Toggle Edit Modal
  const toggleModalEdit = async () => {
    await setEditPopup(!openEditPopup);
  };

  // Toggle Edit Modal Data
  const setModalEdit = async (id) => {
    setSelectedId(id);
    toggleModalEdit();
  };

  // Toggle Details Modal
  const toggleModalViewProvider = async () => {
    await setViewPopup(!openViewPopup);
  };

  // Set Description Modal Data
  const setModalView = async (id, name, address, email, telno) => {
    setSelectedId(id);
    setSelectedViewedName(name);
    toggleModalViewProvider();
  };

  // Callbacks
  const hideAlert = () => {
    setOpenAlert(null);
  };

  const addCallback = async (status, name) => {
    console.log(status);
    switch (status) {
      case "success":
        _toastService.hotToastService('Provider',`${name ? name : ""} has been successfully added.`,'success');
        toggleModal();
        _getRecords(user, setcomponentList);
        break;
      case "success_edit":
        _toastService.hotToastService('Provider',`${name ? name : ""} has been successfully updated.`,'success');
        toggleModalEdit();
        _getRecords(user, setcomponentList);
        break;

      case "existing":
        _toastService.hotToastService('Provider',`Provider already exists.`,'warning');
        break;
      default:
        toggleModal();
        break;
    }
  };

  // Batch Restore Function
  const ConfirmBatchRestoreAlert = () => {
    setOpenAlert(
      <ReactBSAlert
        warning
        reverseButtons={false}
        style={{ display: "block", marginTop: "-100px" }}
        title=""
        onCancel={hideAlert}
        onConfirm={batchRestore}
        showCancel
        confirmBtnBsStyle="primary"
        confirmBtnText="Yes"
        cancelBtnBsStyle="secondary"
        cancelBtnText="Cancel"
        btnSize=""
      >
        <h2>Are you sure you want to restore the selected Provider/s?</h2>
      </ReactBSAlert>
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
    console.log(_payload);
    await fetch(window.base_api + `batch_restore_providers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_payload),
    })
      .then(async (response) => {
        // Your response to manipulate
        const records = await response.json();

        //console.log(records);
        if (records.remarks == "success") {
          _toastService.hotToastService('Provider',`Selected ${batch_ArchiveList.length > 1 ? 'providers' : 'providers' } has been restored.`,'success');
          setOpenAlert('')
          _getArchiveRecords(user, setcomponentList);
        } else {
          if (records.remarks == "Bad Token") {
            _toastService.hotToastService('Company',`Session Expired / Session Mismatch`,'error');
            setOpenAlert(``);
            localStorage.removeItem("userData");
            setInterval(() => {
              window.location.reload();
            }, 2500);
          } else {
            console.log("Error occured with message " + records.remarks);
          }
        }
      })
      .catch((error) => {
        var return_data = {
          message: "Something went wrong, System return " + error,
          payload: [],
          remarks: "error",
        };
        console.log(
          "Something went wrong, Server cannot be reach with returned error : " +
            error
        );
      });
  };

  // Batch Delete Function
  const confirmDeleteSelectedAlert = () => {
    setOpenAlert(
      <ReactBSAlert
        warning
        reverseButtons={false}
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
        <h2>Are you sure you want to delete the selected Provider/s?</h2>
      </ReactBSAlert>
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
    await fetch(window.base_api + `batch_archive_providers`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(_payload),
    })
      .then(async (response) => {
        // Your response to manipulate
        const records = await response.json();

        //console.log(records);
        if (records.remarks == "success") {
          _toastService.hotToastService('Provider',`Selected ${batch_ActiveList.length > 1 ? 'providers' : 'provider' } has been deleted.`,'success');
          _getRecords(user, setcomponentList);
          setOpenAlert(``);
        } else {
          if (records.remarks == "Bad Token") {
            _toastService.hotToastService('Company',`Session Expired / Session Mismatch`,'error');
            setOpenAlert(``);

            localStorage.removeItem("userData");
            setInterval(() => {
              window.location.reload();
            }, 2500);
          } else {
            console.log("Error occured with message " + records.remarks);
          }
        }
      })
      .catch((error) => {
        var return_data = {
          message: "Something went wrong, System return " + error,
          payload: [],
          remarks: "error",
        };
        console.log(
          "Something went wrong, Server cannot be reach with returned error : " +
            error
        );
      });
  };

  // Batch Permanent Delete Function
  const batchPermanentDelete = async () => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { training_list: batch_ArchiveList },
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
      window.base_api + `batch_delete_providers`,
      requestOptions,
      async (response) => {
        // Your response to manipulate
        const records = response;
        if (records.remarks == "success") {
          _toastService.hotToastService('Provider',`Selected ${batch_ArchiveList.length > 1 ? 'providers' : 'provider' } has permanently deleted.`,'success');
          setOpenAlert(``);
          _getArchiveRecords(user, setcomponentList);

        } else {
          if (records.remarks == "Bad Token") {
            _toastService.hotToastService('Company',`Session Expired / Session Mismatch`,'error');
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

  const confirmPermanentDeleteBatchAlert = () => {
    setOpenAlert(
      <ReactBSAlert
        warning
        reverseButtons={false}
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
      <h2>Are you sure you want to permanently delete the selected Providers?</h2>
      <h5 className=" font-weight-bold">This process cannot be undone.</h5>
      </ReactBSAlert>
    );
  };

  return (
    <>
      <CardsHeader
        name={tabsListState.tabs === 1 ? "Training" : "Training | Archive"}
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
                  <Col xl="3"></Col>
                  <Col xl="9">
                    <div className="col" style={{ textAlign: "end" }}>
                      <TabContent activeTab={"tabs" + tabsState.tabs}>
                        <TabPane tabId="tabs1">
                          <TabContent activeTab={"list" + tabsListState.tabs}>
                            <TabPane tabId="list1">
                              <CustButton
                                _text="Add"
                                _id={`AddProvider`}
                                _type="button"
                                _color="default"
                                _onClick={setAddOpenModal}
                                _icon="fas fa-plus"
                                _size="cust-md"
                              />
                              <CustButton
                                _text="Download"
                                _id={`downloadBtn`}
                                _type="button"
                                _color="default"
                                _icon="fas fa-download"
                                _size="cust-md"
                              />
                              <CustButton
                                _text="Delete Selected"
                                _id={`deleteSelectedBtn`}
                                _onClick={confirmDeleteSelectedAlert}
                                _type="button"
                                _color="danger"
                                _icon="fas fa-trash"
                                _size="cust-md"
                              />
                              {/* {console.log(archiveListCounter.length ,  ' >>>>>')} */}
                              <CustButton
                                _text={
                                  tabsListState.tabs === 2
                                    ? "Active"
                                    : "Archived"
                                }
                                _id={`archiveBtn`}
                                _type="button"
                                _color="primary"
                                _icon="fas fa-box"
                                _size="cust-md"
                                _disabled = {
                                  archiveListCounter.length == 0 ? true : false
                                }
                                _onClick={(e) => toggleListNavs(e)}
                              />
                            </TabPane>
                            <TabPane tabId="list2">
                              <CustButton
                                _text="Restore Selected"
                                _id={`restoreSelected`}
                                _onClick={() => ConfirmBatchRestoreAlert()}
                                _type="button"
                                _color="default"
                                _icon="fas fa-redo"
                                _size="cust-md"
                              />
                              <CustButton
                                _text="Download"
                                _id={`downloadBtn`}
                                _type="button"
                                _color="default"
                                _icon="fas fa-download"
                                _size="cust-md"
                              />
                              <CustButton
                                _text="Permanently Delete Selected"
                                _id={`deleteSelectedBtnArchive`}
                                _onClick={confirmPermanentDeleteBatchAlert}
                                _type="button"
                                _color="danger"
                                _icon="fas fa-trash"
                                _size="cust-md"
                              />
                              <CustButton
                                _text={
                                  tabsListState.tabs === 2
                                    ? "Active"
                                    : "Archived"
                                }
                                _id={`archiveBtn`}
                                _type="button"
                                _color="primary"
                                _icon="fas fa-box"
                                _size="cust-md"
                                _onClick={(e) => toggleListNavs(e)}
                              />
                            </TabPane>
                          </TabContent>
                        </TabPane>
                      </TabContent>
                    </div>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody className="Scrollble">
                <TabContent activeTab={"tabs" + tabsState.tabs}>
                  <TabPane tabId="tabs1">
                    <TabContent activeTab={"list" + tabsListState.tabs}>
                      <TabPane tabId="list1">
                        {componentList.length <= 0 ? (
                          <CardBody className=" justify-content-center row">
                            <NoDataFound/>
                          </CardBody>
                        ) : (
                          _displayCardBody(componentList, 1)
                        )}
                      </TabPane>
                      <TabPane tabId="list2">
                        {componentList.length <= 0 ? (
                          <CardBody className=" justify-content-center row">
                            <NoDataFound/>
                          </CardBody>
                        ) : (
                          _displayCardBody(componentList, 2)
                        )}
                      </TabPane>
                    </TabContent>
                  </TabPane>
                  <TabPane tabId="tabs2">
                    <h4>matrix</h4>
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <CustModal
        _modalTitle={"Provider Details: " + selectedViewedName}
        _modalId="View"
        _state={toggleModalViewProvider}
        _size="md"
        _stateBool={openViewPopup}
      >
        <ShowProvider
          _selectedId={selectedId}
          _state={toggleModalViewProvider}
        />
      </CustModal>
      <CustModal
        _modalTitle={"Edit Provider"}
        _modalId="View"
        _state={toggleModalEdit}
        _size="md"
        _stateBool={openEditPopup}
      >
     <EditProvider
     _selectedId={selectedId}
     _state={toggleModalEdit}
     _callback={addCallback}
     />
      </CustModal>
      <CustModal
        _modalTitle="Add Provider"
        _modalId="AddProviders"
        _state={toggleModal}
        _size="md"
        _stateBool={openAddPopup}
      >
         <AddProviders _state={toggleModal} _callback={addCallback}/>
      </CustModal>
      {openAlert}
    </>
  );
}

export default Provider;
