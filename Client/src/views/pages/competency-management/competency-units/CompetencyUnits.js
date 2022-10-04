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
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";

// import global components
import ReactBSTables from "components/Tables/ReactBSTables";
import CustButton from "components/Buttons/CustButton";
import CustModal from "components/Modals/CustModal";
import ReactBSAlert from "react-bootstrap-sweetalert";
import { UserContext, _dataService } from "App";

// import components
import AddCompUnits from "./AddCompUnits";
import EditCompUnits from "./EditCompUnits";
import NoDataFound from "views/pages/error/NoDataFound";
import { processDataFilter } from "services/data.services";
function CompetencyUnits() {
  const { user, setUser } = useContext(UserContext);
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [tabsListState, setTabsListState] = useState({ tabs: 1 });
  const [componentList, setcomponentList] = useState([]);
  const [openAlert, setOpenAlert] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const [AddModal, setAddModal] = useState(false);
  const [EditModal, setEditModal] = useState(false);
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

  useEffect(() => {
    if (tabsListState.tabs == 1) {
      _getRecords(user, setcomponentList);
    }
    return;
  }, [componentList.length, user.token != ""]);

  // For modals
  const toggleAddModal = async () => {
    await setAddModal(!AddModal);
  };

  const toggleEditModal = async () => {
    await setEditModal(!EditModal);
  };

  
  const setModalEdit = async (id) => {
    setSelectedId(id);
    toggleEditModal();
  };

  const hideAlert = () => {
    setOpenAlert(null);
  };

  const addCallback = async (status) => {
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
            Provider: has been successfully added.
          </ReactBSAlert>
        );
        toggleAddModal();
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
            Directory: has been successfully updated.
          </ReactBSAlert>
        );
        // _getRecords(user, setcomponentList);
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
        toggleAddModal();
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
            Competency Management: has been successfully updated.
          </ReactBSAlert>
        );
        _getRecords(user, setcomponentList);    
        setEditModal(!EditModal);
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
            Competency Management cannot be found
            </ReactBSAlert>
          );
          setEditModal(!EditModal);
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
            Competency Management failed to update
            </ReactBSAlert>              
          );
          setEditModal(!EditModal);
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
          }, 5000);
        break;
        default:
          setEditModal(!EditModal);
        break;
    }
  };

  // Navs toggle list
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
      // archive records
    } else {
      _getRecords(user, setcomponentList);
      // records
    }
    enable_button();
  };

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

  var count_use_effect = 0;
  const _getRecords = async (user, callback) => {
    enable_button(); /** Disable delete selected on load */

    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;

    if (token && token_creation) {
      const payload = {
        payload: { is_archived: 0 },
        auth: { token: token, _id: _user_id },
      };

      await fetch(window.base_api + `_get_compUnits/`, {
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
              }, 5000);
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

  var count_use_effect = 0;
  async function _getArchiveRecords(user, callback) {
    enable_button(); /** Disable delete selected on load */

    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;

    if (token && token_creation) {
      const payload = {
        payload: { is_archived: 1 },
        auth: { token: token, _id: _user_id },
      };

      await fetch(window.base_api + `_get_compUnits/`, {
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
              }, 5000);
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

  function FilterCallback(_filterArray, _filteredData){    
    //console.log(_filterArray);
    updateState({filters: _filterArray.filters},setFilterArray)        
    forceUpdate();
    
  }

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
        tableKeyField="name"
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
          }
        }}
      />
    );
  }

  // table functions
  const restore = async (id,name) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { ...componentList },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };

    _dataService.CRUD(
      window.base_api + `restore/comp_units/${id}`,
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
              Provider has been restored.
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
            }, 5000);
          } else {
            console.log("Error occured with message " + records.remarks);
          }
        }
      }
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
      window.base_api + `archive/comp_units/${id}`,
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
              Provider has been deleted.
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
            }, 5000);
          } else {
            console.log("Error occured with message " + records.remarks);
          }
        }
      }
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

    await fetch(window.base_api + `delete_compUnits/${id}`, {
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
              Provider category has been deleted.
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
            }, 5000);
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

  const confirmDeleteAlert = (id) => {
    setOpenAlert(
      <ReactBSAlert
        warning
        reverseButtons={false}
        style={{ display: "block", marginTop: "-100px" }}
        title="Are you sure?"
        onCancel={hideAlert}
        onConfirm={() => proceedDelete(id)}
        showCancel
        confirmBtnBsStyle="danger"
        confirmBtnText="Yes, delete it!"
        cancelBtnBsStyle="secondary"
        cancelBtnText="Cancel"
        btnSize=""
      >
        You won't be able to revert this!
      </ReactBSAlert>
    );
  };

  const confirmPermanentDeleteAlert = (id) => {
    setOpenAlert(
      <ReactBSAlert
        warning
        reverseButtons={false}
        style={{ display: "block", marginTop: "-100px" }}
        title="Are you sure?"
        onCancel={hideAlert}
        onConfirm={() => permanentDelete(id)}
        showCancel
        confirmBtnBsStyle="danger"
        confirmBtnText="Yes, delete it!"
        cancelBtnBsStyle="secondary"
        cancelBtnText="Cancel"
        btnSize=""
      >
        You won't be able to revert this!
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
    await fetch(window.base_api + `batch_restore_compUnits`, {
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
              Functions category has been Restored.
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
            }, 5000);
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

  const batchDelete = async () => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    var to_set;
    const _payload = {
      payload: { list: batch_ActiveList },
      auth: { token: token, _fullname: _fullname, _id: _user_id },
    };
    await fetch(window.base_api + `batch_archive_compUnits`, {
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
              Functions has been deleted.
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
            }, 5000);
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


  // tabl columns generator
  const tableColsGenerator = (index) => {
    var tmpCols = [
      {
        dataField: "name",
        text: "Name",
        sort: true,
      },
      {
        dataField: "expiration",
        text: "Expiration",
        sort: true,
      },
      {
        dataField: "type",
        text: "Type",
        sort: true,
      },
      {
        dataField: "level",
        text: "Level",
        sort: true,
      },
      {
        dataField: "doc_no",
        text: "Document No.",
        sort: true,
      },      {
        dataField: "status",
        text: "Status",
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
        },
      },
      {
        dataField: "_id",
        text: "Reference",
        sort: true,
        headerStyle: { width: "5%" },
        formatter: (cell, row, rowIndex) => {
          return (
            <>
              <CustButton
                _text="View"
                _id={`dashBtn_${row.name}`}
                _type="button"
                _color="default"
                _icon="fas fa-eye"
                _size="cust-md"
              />
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
                _onClick={() => setModalEdit(row._id)}
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
                _onClick={() => confirmDeleteAlert(row._id)}
                _size="cust-md"
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
                _name="delete_row_archive"
                _type="button"
                _onClick={() => restore(row._id)}
                _color="default"
                _icon="fas fa-redo"
                _size="cust-md"
              />
              <CustButton
                _text="Permanently Delete"
                _name="delete_row_archive"
                _id={`deleteBtn_${row.name}`}
                _type="button"
                _color="danger"
                _icon="fas fa-trash-alt"
                _onClick={() => confirmPermanentDeleteAlert(row._id)}
                _size="cust-md"
              />
            </>
          );
        },
      });
    }
    return tmpCols;
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
                  <Col xl="3">
                    <div>
                      <Nav
                        className="nav-fill flex-column flex-md-row"
                        id="tabs-icons-text"
                        pills
                        role="tablist"
                      >
                        <NavItem size="cust-md">
                          {console.log(tabsState.tabs)}
                          <NavLink
                            aria-selected={tabsState.tabs === 1}
                            className={classnames("mb-sm-3 mb-md-0", {
                              active: tabsState.tabs === 1,
                            })}
                            onClick={(e) => toggleTabs(e, "tabs", 1)}
                            href="#pablo"
                            role="tab"
                          >
                            Offshore
                          </NavLink>
                        </NavItem>
                        <NavItem>
                          <NavLink
                            aria-selected={tabsState.tabs === 2}
                            className={classnames("mb-sm-3 mb-md-0", {
                              active: tabsState.tabs === 2,
                            })}
                            onClick={(e) => toggleTabs(e, "tabs", 2)}
                            href="#pablo"
                            role="tab"
                          >
                            Onshore
                          </NavLink>
                        </NavItem>
                      </Nav>
                    </div>
                  </Col>
                  <Col xl="9">
                    <div className="col" style={{ textAlign: "end" }}>
                      <TabContent activeTab={"tabs" + tabsState.tabs}>
                        <TabPane tabId="tabs1">
                          <TabContent activeTab={"list" + tabsListState.tabs}>
                            <TabPane tabId="list1">
                              <CustButton
                                _text="Add"
                                _id={`addBtn`}
                                _type="button"
                                _color="default"
                                _onClick={toggleAddModal}
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
                                _onClick={batchDelete}
                                _type="button"
                                _color="danger"
                                _icon="fas fa-trash"
                                _size="cust-md"
                              />
                              <CustButton
                                _text={
                                  tabsListState.tabs === 2
                                    ? "Back to List"
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
                            <TabPane tabId="list2">
                              <CustButton
                                _text="Restore Selected"
                                _id={`restoreSelected`}
                                _onClick={() => batchRestore()}
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
                                _type="button"
                                _color="danger"
                                _icon="fas fa-trash"
                                _size="cust-md"
                                // _onClick={() => batchPermanentlyDelete()}
                              />
                              <CustButton
                                _text={
                                  tabsListState.tabs === 2
                                    ? "Back to List"
                                    : "Archive"
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

                        <TabPane tabId="tabs2">
                          <p>Matrix Buttons</p>
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
        _modalTitle="Add Competency Management"
        _modalId="addCompManagement"
        _state={toggleAddModal}
        _size="md"
        _stateBool={AddModal}
      >
        <AddCompUnits _state={toggleAddModal} _callback={addCallback} />
      </CustModal>

      <CustModal
        _modalTitle={"Edit Competency Management"}
        _modalId="EditModal"
        _state={toggleEditModal}
        _size="md"
        _stateBool={EditModal}
      >
     <EditCompUnits
     _selectedId={selectedId}
     _state={toggleEditModal}
     _callback={editCallback}
     />
      </CustModal>

      
      {openAlert}
    </>
  );
}

export default CompetencyUnits;
