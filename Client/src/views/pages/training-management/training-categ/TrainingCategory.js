import React, { useState, useEffect, useContext } from "react";
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
import AddTrainingCategory from "./AddTrainingCategory";
import DownloadOptions from "./DownloadOptions";
import ReactBSAlert from "react-bootstrap-sweetalert";
import EditTrainingCategory from "./EditTrainingCategory";
import { UserContext } from "App";
import NoDataFound from "views/pages/error/NoDataFound";
 
function TrainingCategory() {
  const { user, setUser } = useContext(UserContext);
  const [tabsState, setTabsState] = useState({ tabs: 1 });
  const [openAddPopup, setAddOpenModal] = useState(false);
  const [openDownloadPopup, setDownloadPopup] = useState(false);
  const [openEditPopup, setEditPopup] = useState(false);
  const [trainCategList, setTrainCategList] = useState([]);
  const [openAlert, setOpenAlert] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  var batch_ActiveList = [];
  var batch_ArchiveList = [];

   
  useEffect(() => {
    setUser({
      ...user,
    });
  }, []);


  useEffect(() => {
    if (tabsState.tabs == 1) {
      _getRecords(user, setTrainCategList);
    }
    return;
  }, [trainCategList.length, user.token != ""]);

  //#region Toggle tabs
  const toggleListNavs = (e, statesss, index) => {
    e.preventDefault();
    console.log(index);
    setTabsState({ tabs: index });
    if (index == 2) {
      _getArchiveRecords(user, setTrainCategList);
    } else {
      _getRecords(user, setTrainCategList);
    }
  };
  //#endregion
  
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

      await fetch(window.base_api + `get_training_categories/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then(async (response) => {
          // Your response to manipulate
          const records = await response.json();

          //console.log(records);
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
  
  const toggleModal = async () => {
    await setAddOpenModal(!openAddPopup);
  };
  const toggleModalEdit = async () => {
    await setEditPopup(!openEditPopup);
  };
  const setModalEdit = async (id) => {
    setSelectedId(id);
    toggleModalEdit();
  };

  const toggleModalDownload = async () => {
    await setDownloadPopup(!openDownloadPopup);
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
            Training Category: has been successfully added.
          </ReactBSAlert>
        );
        toggleModal();
        _getRecords(user, setTrainCategList);
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
            Training Category: has been successfully updated.
          </ReactBSAlert>
        );
        toggleModalEdit();
        _getRecords(user, setTrainCategList);
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
            Training category already exists.
          </ReactBSAlert>
        );
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
      payload: { ...trainCategList },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };

    await fetch(window.base_api + `archive/training_categories/${id}`, {
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
          const newRecords = trainCategList.filter((el) => el._id !== id);
          setTrainCategList(newRecords);
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
              Training category has been deleted.
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
    console.log(_payload);
    await fetch(window.base_api + `batch_archive_train_categ`, {
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
          _getRecords(user, setTrainCategList);
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
              Training category has been deleted.
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

  const permanentDelete = async (id, name) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { ...trainCategList },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };

    await fetch(window.base_api + `delete_training_category/${id}`, {
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
          const newRecords = trainCategList.filter((el) => el._id !== id);
          setTrainCategList(newRecords);
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
              Training category has been deleted.
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

  const batchPermanentDelete = async () => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { list: batch_ArchiveList },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };

    await fetch(window.base_api + `batch_delete_train_categ`, {
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
          _getArchiveRecords(user, setTrainCategList);
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
              Training category has been "Permanently" deleted.
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

  const restore = async (id,name) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { ...trainCategList },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };

    await fetch(window.base_api + `restore/training_categories/${id}`, {
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
          if (tabsState.tabs == 1) {
            _getRecords(user, setTrainCategList);
          } else {
            const newRecords = trainCategList.filter((el) => el._id !== id);
            setTrainCategList(newRecords);
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
              Training category has been restored.
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

  const batchRestore =async () =>{
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    var to_set;
    const _payload = {  
      payload:  { list: batch_ArchiveList} ,
      auth: { token: token,  _fullname: _fullname, _id:_user_id }
    };
      console.log(_payload);
    await fetch(window.base_api+`batch_restore_train_categ`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(_payload)
    }).then(async response => {
      // Your response to manipulate
      const records =await response.json();

      //console.log(records);                
      if(records.remarks=="success"){
        _getArchiveRecords(user,setTrainCategList);
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
            Training category has been Restored.
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
    })
    .catch(error => {          
      var return_data = {
        message: "Something went wrong, System return "+error,
        payload: [],
        remarks: "error",
      }
      console.log("Something went wrong, Server cannot be reach with returned error : "+error);
    }); 
  }
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
        onCancel={() => proceedDelete(id)}
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
  const confirmPermanentDeleteAlert = (id) => {
    setOpenAlert(
      <ReactBSAlert
        warning
        style={{ display: "block", marginTop: "-100px" }}
        title="Are you sure?"
        onConfirm={hideAlert}
        onCancel={() => permanentDelete(id)}
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

  const tableCols = [
    {
      dataField: "name",
      text: "Name",
      sort: true,
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
              _onClick={() => confirmDeleteAlert(row._id)}
              _size="cust-md"
            />
          </>
        );
      },
    },
  ];

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

      await fetch(window.base_api + `get_archive/training_categories`, {
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
            if (records.payload.result.length > 0) {
              const resPayload = records.payload["result"];
              callback(resPayload);
            } else {
              setTrainCategList([]);
            }
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
  const tableCols2 = [
    {
      dataField: "name",
      text: "Name",
      sort: true,
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
              _type="button"
              _onClick={() => restore(row._id)}
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
              _onClick={() => confirmPermanentDeleteAlert(row._id)}
              _size="cust-md"
            />
          </>
        );
      },
    },
  ];

  function _displayCardBody(trainCategList, index) {
    return (
      <CardBody className="Scrollble">
        <ReactBSTables
          data={trainCategList}
          columns={index == 1 ? tableCols : tableCols2}
          tableKeyField="name"
          classes="table-responsive"
          selectRow={{
            mode: "checkbox",
            headerColumnStyle: { width: "3%" },
            onSelect: (rows, IsSelect, RowIndex, E) => {
              console.log(`select`);
              if (IsSelect) {
                var obj = [];

                if (tabsState.tabs == 1) {
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
                  batch_ActiveList = rows;
                } else {
                  batch_ArchiveList = rows;
                }
              } else {
                if (tabsState.tabs == 1) {
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
      </CardBody>
    );
  }
  const enable_button = () => {
    if (tabsState.tabs == 1) {
      var bttn = document.getElementById("deleteSelectedBtn");
      if (batch_ActiveList.length > 0) {
        bttn.disabled = false;
        bttn.classList.remove("disabled");
      } else {
        bttn.disabled = true;
        bttn.classList.add("disabled");
      }
    } else {
      var bttn = document.getElementById("deleteSelectedBtnArchive");
      var bttn2 = document.getElementById("restoreSelected");
      if (batch_ArchiveList.length > 0) {
        bttn.disabled = false;
        bttn.classList.remove("disabled");
        bttn2.disabled = false;
        bttn2.classList.remove("disabled");
      } else {
        bttn.disabled = true;
        bttn.classList.add("disabled");
        bttn2.disabled = true;
        bttn2.classList.add("disabled");
      }
    }
  };

  return (
    <>
      <TabContent activeTab={"tabs" + tabsState.tabs}>
        <TabPane tabId="tabs1">
          <CardsHeader
            
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
                        _onClick={toggleModal}
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
                        _id={`deleteSelectedBtn`}
                        _onClick={batchDelete}
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
                        _onClick={(e) => toggleListNavs(e, null, 2)}
                      />
                    </div>
                  </CardHeader>

                  {trainCategList.length <= 0 ? (
                    <CardBody  className=" Scrollble">
                      <NoDataFound title="Training Category" callback={toggleModal} />
                    </CardBody>
                  ) : (
                    _displayCardBody(trainCategList, 1)
                  )}
                </Card>
              </Col>
            </Row>
          </Container>
        </TabPane>
        <TabPane tabId="tabs2">
          <CardsHeader

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
                        _onClick={()=>batchRestore()}
                        _type="button"
                        _color="default"
                        _icon="fas fa-redo"
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
                        _id={`deleteSelectedBtnArchive`}
                        _type="button"
                        _color="danger"
                        _icon="fas fa-trash"
                        _size="cust-md"
                      />
                      <CustButton
                        _text="Active"
                        _id={`activeBtn`}
                        _type="button"
                        _color="secondary2"
                        _icon="fas fa-box"
                        _disabled={false}
                        _size="cust-md"
                        _onClick={(e) => toggleListNavs(e, null, 1)}
                      />
                    </div>
                  </CardHeader>
                  {trainCategList.length <= 0 ? (
                    <CardBody className=" justify-content-center row Scrollble">
                      <NoDataFound/>
                    </CardBody>
                  ) : (
                    _displayCardBody(trainCategList, 2)
                  )}
                </Card>
              </Col>
            </Row>
          </Container>
        </TabPane>
      </TabContent>
      <CustModal
        _modalTitle="Add Training Category"
        _modalId="addTrainingCategory"
        _state={toggleModal}
        _size="md"
        _stateBool={openAddPopup}
      >
        <AddTrainingCategory _state={toggleModal} _callback={addCallback} />
      </CustModal>

      <CustModal
        _modalTitle="Download Options"
        _modalId="viewDownloadOptions"
        _state={toggleModalDownload}
        _size="sm"
        _stateBool={openDownloadPopup}
      >
        <DownloadOptions _state={toggleModalDownload} />
      </CustModal>

      <CustModal
        _modalTitle="Edit Training Category"
        _modalId="EditTrainingCategory"
        _state={toggleModalEdit}
        _size="md"
        _stateBool={openEditPopup}
      >
        <EditTrainingCategory
          _selectedId={selectedId}
          _state={toggleModalEdit}
          _callback={addCallback}
        />
      </CustModal>
      {openAlert}
    </>
  );
}

export default TrainingCategory;
