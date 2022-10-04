import React, { useState, useEffect, useContext } from "react";
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
} from "reactstrap";

// import global components
import ReactBSTables from "components/Tables/ReactBSTables";
import CustButton from "components/Buttons/CustButton";
import CustModal from "components/Modals/CustModal";
import ReactBSAlert from "react-bootstrap-sweetalert";
import { UserContext, _dataService } from "App";

import AddDirectory from "./AddDirectory";
import EditDirectory from "./EditDirectory";
import NoDataFound from "views/pages/error/NoDataFound";
import { processDataFilter } from "services/data.services";

function Directory() {
  const { user, setUser } = useContext(UserContext);
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [tabsListState, setTabsListState] = useState({ tabs: 1 });
  const [componentList, setcomponentList] = useState([]);
  const [openAlert, setOpenAlert] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [archiveListCounter, setArchiveListCounter] = useState([]);
  const [filterArray, setFilterArray] = useState({
    "filters":[]
  });    
  var batch_ActiveList = [];
  var batch_ArchiveList = [];

  function updateState(value,setState){
    return setState((prev) => {
      return { ...prev, ...value };
    });
  }
    //THIS METHOD IS FOR FORCING UPDATE RENDER
    const [state, _forceUpdate] = useState();
    const forceUpdate = React.useCallback(() => _forceUpdate({}), []);
    
  // const toggleTabs = (e, statesss, index) => {
  //   e.preventDefault();
  //   setTabsState({ tabs: index });
  // };

  const toggleListNavs = (e) => {
    e.preventDefault();
    var index = tabsListState.tabs == 1 ? 2 : 1;
    setTabsListState({ tabs: index });
    if (index == 2) {
      setcomponentList([])
      _getArchiveRecords(user, setcomponentList);
    } else {
      setcomponentList([])
      _getRecords(user, setcomponentList);
      _getArchiveRecords(user, setArchiveListCounter);
    }
    enable_button();
  };

  // add modal state
  const [openAddPopup, setAddOpenModal] = useState(false);
  const toggleModal = async () => {
    await setAddOpenModal(!openAddPopup);
  };

  // edit modal state
  const[openEditModal, setEditOpenModal] = useState(false);
  const toggleEditModal = async() => {
    await setEditOpenModal(!openEditModal);
  }
  // opening modal and setting id
  const setEditModal = async (row) => {
    setSelectedData(row);
    toggleEditModal();
  };

  useEffect(() => {
    if (tabsListState.tabs == 1) {
      
      _getRecords(user, setcomponentList);
      _getArchiveRecords(user, setArchiveListCounter);
    }
    return;
  }, [componentList.length, user.token != ""]);

  // Get Records
  var count_use_effect = 0;
  const _getRecords = async (user, callback) => {
    enable_button(); /** Disable delete selected on load */
    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;

    if (token && token_creation) {
      const payload = {
        auth:{
          token:token,
          _id:_user_id
        },
        payload:{is_archived:0} 
      };

      await fetch(window.base_api + `get_directory/`, {
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

  // Get Archive Records
  var count_use_effect = 0;
  async function _getArchiveRecords(user, callback) {
    enable_button(); /** Disable delete selected on load */

    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;

    if (token && token_creation) {
      const payload = {
        payload:{is_archived:1},
        auth: { token: token, _id: _user_id },
      };

      await fetch(window.base_api + `get_directory`, {
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
  }

  // Enable buttons on Page
  const enable_button = () => {
    var btnDeleteActive = document.getElementById("deleteSelectedBtn");
    var btnDeleteArchive = document.getElementById("deleteSelectedBtnArchive");
    if (typeof btnDeleteActive != "undefined" && btnDeleteActive != null) {
      var bttn = document.getElementById("deleteSelectedBtn");
      if (batch_ActiveList.length > 0) {
        bttn.disabled = false;
        bttn.classList.remove("disabled");
      } else {
        bttn.disabled = true;
        bttn.classList.add("disabled");
      }
    }
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

    // if (tabsListState.tabs == 1) {

    // } else {

    // }
  };

  // Restore Function
  const restore = async (id, name) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { ...componentList },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };

    _dataService.CRUD(
      window.base_api + `restore/directory/${id}`,
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
              Directory {name} has been restored.
            </ReactBSAlert>
          );
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

  const confirmrestoreAlert = (row) => {
    setOpenAlert(
      <ReactBSAlert
        info
        reverseButtons={false}
        style={{ display: "block", marginTop: "-100px" }}
        title=""
        onCancel={hideAlert}
        onConfirm={() => restore(row._id,row.training[0].name)}
        showCancel
        confirmBtnBsStyle="primary"
        confirmBtnText="Yes"
        cancelBtnBsStyle="secondary"
        cancelBtnText="No"
        btnSize=""
      >
        <h2>Are you sure you want to restore this provider?</h2>
        <h5 className=" text-muted">Directory: {row.training[0].name}</h5>
      </ReactBSAlert>
    );
  };

  // Permanently Delete Function
  
  const confirmPermanentDeleteAlert = (row) => {
    setOpenAlert(
      <ReactBSAlert
        warning
        reverseButtons={false}
        style={{ display: "block", marginTop: "-100px" }}
        title="Are you sure?"
        onCancel={hideAlert}
        onConfirm={() => permanentDelete(row._id, row.training[0].name)}
        showCancel
        confirmBtnBsStyle="danger"
        confirmBtnText="Yes, delete it!"
        cancelBtnBsStyle="secondary"
        cancelBtnText="Cancel"
        btnSize=""
      >
      <h2>Are you sure you want to permanently delete this directory?</h2>
      <h5 className=" text-muted">Directory: {row.training[0].name}</h5>
      <h5 className=" font-weight-bold">This process cannot be undone.</h5>
      </ReactBSAlert>
    );
  };

  const permanentDelete = async (id,name) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { ...componentList },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };

    await fetch(window.base_api + `delete_directory/${id}`, {
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
              Directory {name} category has been permanently deleted.
            </ReactBSAlert>
          );
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

  // Delete Function
  const confirmDeleteAlert = (row) => {
    setOpenAlert(
      <ReactBSAlert
        warning
        reverseButtons={false}
        style={{ display: "block", marginTop: "-100px" }}
        title="Are you sure?"
        onCancel={hideAlert}
        onConfirm={() => proceedDelete(row._id,row.training[0].name)}
        showCancel
        confirmBtnBsStyle="danger"
        confirmBtnText="Yes, delete it!"
        cancelBtnBsStyle="secondary"
        cancelBtnText="Cancel"
        btnSize=""
      >
        <h2>Are you sure you want to delete this provider?</h2>
        <h5 className=" text-muted">Directory: {row.training[0].name}</h5>
        <h5 className=" text-muted">Status: {(row.status) ? `Active` : `Inactive`}</h5>
      </ReactBSAlert>
    );
  };

  const proceedDelete = async (id,name) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { ...componentList },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };
    _dataService.CRUD(
      window.base_api + `archive/directory/${id}`,
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
              Directory {name} has been deleted.
            </ReactBSAlert>
          );

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


  // Delete Selected Function
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
        <h2>Are you sure you want to delete the selected Directory/ies?</h2>
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
    await fetch(window.base_api + `batch_archive_directory`, {
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
          _getRecords(user, setcomponentList);
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
              Selected Directory/ies has been successfully deleted.
            </ReactBSAlert>
          );
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
  

  // Batch Restore Function
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
    await fetch(window.base_api + `batch_restore_directory`, {
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
          _getArchiveRecords(user, setcomponentList);
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
              Selected Directory/ies has been successfully restored.
            </ReactBSAlert>
          );
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
        <h2>Are you sure you want to restore the selected Directory/ies?</h2>
      </ReactBSAlert>
    );
  };

  // Batch Delete Function
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
      window.base_api + `batch_delete_directory`,
      requestOptions,
      async (response) => {
        // Your response to manipulate
        const records = response;
        if (records.remarks == "success") {
          _getArchiveRecords(user, setcomponentList);
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
              Selected Directory/ies has been permanently deleted.
            </ReactBSAlert>
          );
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

  // Table Columns
  const tableColsGenerator = (index) => {
    var tmpCols = [
      {
        dataField: "name",
        text: "Training",
        sort: true,
        isDummyField: true,
        formatter: (cell, row, rowIndex) => {
          // alert(row.training[0].name)
          return (
            <>
                <ul>
                {row["training"].map((items) => {
                  return (
                    <li style={{listStyle: 'none'}}>{items.name}</li>
                  )
                })}
              </ul>
          </>
         )
        },
      },
      {
        text: "Provider",
        dataField: "d-provider",
        sort: true,
        formatter: (cell, row, rowIndex) => {
          return (
            <>
              <ul>
                {row["d-provider"].map((items) => {
                  return (
                    <li className={items.status == 0 ? 'text-danger' : 'text-success'}><span style={{color: 'black'}}>{items.name}</span></li>
                  )
                })}
              </ul>
            </>
          );
        },
      },
    ];
    if (index == 1) {
      // Active Table Actions
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
                _text="Edit"
                _id={`editBtn_${row._id}`}
                _type="button"
                _color="default"
                _icon="fas fa-pen"
                _onClick={() => setEditModal(row)}
                _size="cust-md"
              />
              <CustButton
                _text="Delete"
                _id={`deleteBtn_${row._id}`}
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
                _color="default"
                _icon="fas fa-redo"
                _onClick={() => confirmrestoreAlert(row)}
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

  // Card Body
  function _displayCardBody(componentList, index) {
    return (
      <ReactBSTables
        style={{ width: 100, zIndex: "1", position: "relative" }}
        data={filterArray.filters.length > 0 ? processDataFilter(componentList,filterArray):componentList}
        filter={true}        
        _exclude_keys={[]}
        original_data={componentList}
        _callback={FilterCallback}    
        _filterArray={filterArray}      
        columns={tableColsGenerator(index)}        
        tableKeyField="_id"
        classes="table-responsive"
        selectRow={{
          mode: "checkbox",
          headerColumnStyle: { width: "3%" },
          onSelect: (rows, IsSelect, RowIndex, E) => {
        
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
          }

        }}
      />
    );
  }

  // Alert Callbacks
  const hideAlert = () => {
    setOpenAlert(null);
  };

  const addCallback = async (status, name) => {
    console.log(status);
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
          Directory: {name ? name : ''} has been successfully added.
          </ReactBSAlert>
        );
        toggleModal();
        _getRecords(user, setcomponentList);
        break;
      case "success_edit":
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
            Directory: {name} has been successfully updated.
          </ReactBSAlert>
        );
        toggleEditModal();
        _getRecords(user, setcomponentList);
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
            Directory already exists.
          </ReactBSAlert>
        );
        break;
      default:
        toggleModal();
        break;
    }
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
      <Container className="mt--6 Scrollble" fluid>
        <Row>
          <Col xl="12">
            <Card className="bg-white">
              <CardHeader className="bg-transparent">
                <Row>
                  <Col xl="12">
                    <div className="col" style={{ textAlign: "end" }}>
                      <TabContent activeTab={"tabs" + tabsState.tabs}>
                        <TabPane tabId="tabs1">
                          <TabContent activeTab={"list" + tabsListState.tabs}>
                            <TabPane tabId="list1">
                              <CustButton
                                _text="Add"
                                _id={`AddDirectory`}
                                _type="button"
                                _onClick={setAddOpenModal}
                                _color="default"
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
                                _type="button"
                                _color="danger"
                                _onClick={confirmDeleteSelectedAlert}
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
                                _type="button"
                                _color="default"
                                _icon="fas fa-redo"
                                _onClick={ConfirmBatchRestoreAlert}
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
                                _type="button"
                                _color="danger"
                                _icon="fas fa-trash"
                                _size="cust-md"
                                _onClick={confirmPermanentDeleteBatchAlert}
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
              <CardBody>
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
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <CustModal
        _modalTitle="Add Directory"
        _modalId="Addirectory"
        _state={toggleModal}
        _size="md"
        _stateBool={openAddPopup}
      >
        <AddDirectory _state={toggleModal} _callback={addCallback} />
      </CustModal>
      <CustModal
      _modalTitle="Edit Directory"
      _modalId="EditDirectory"
      _state={toggleEditModal}
      _size="md"
      _stateBool={openEditModal}
      >
        <EditDirectory _state={toggleEditModal} _callback={addCallback} _selectedData={selectedData} />
        </CustModal>
      {openAlert}
    </>
  );
}

export default Directory;
