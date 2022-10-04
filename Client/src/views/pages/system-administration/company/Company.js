import React, { useState, useEffect, useContext } from "react";
import CardsHeader from "components/Headers/CardsHeader";
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
import ReactBSTables from "components/Tables/ReactBSTables";
import CustButton from "components/Buttons/CustButton";
import CustModal from "components/Modals/CustModal";
import { UserContext, _dataService,_toastService } from "App";

import AddCompany from "./AddCompany";
import EditCompany from "./EditCompany";
import NoDataFound from "views/pages/error/NoDataFound";
import DownloadOptions from "layouts/modals/DownloadOptions";
import CustAlert from "components/Alerts/CustAlert";
import { processDataFilter } from "services/data.services";

function Company() {
  const { user, setUser } = useContext(UserContext);
  const [tabsListState, setTabsListState] = useState({ tabs: 1 });
  const [trainingList, setTrainingList] = useState([]);
  const [openAlert, setOpenAlert] = useState(null);
  const [openEditPopup, setEditPopup] = useState(false);
  const [openViewPopup, setViewPopup] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [archiveListCounter, setArchiveListCounter] = useState([]);
  const [openDownloadPopup, setDownloadPopup] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [openAddPopup, setAddOpenModal] = useState(false);

  const [filterArray, setFilterArray] = useState({
    "filters":[]
  });    

  var batch_ActiveList = [];
  var batch_ArchiveList = [];

  const toggleListNavs = (e) => {
    e.preventDefault();
    var index = tabsListState.tabs == 1 ? 2 : 1;
    setTabsListState({ tabs: index });
    setTrainingList([]);
    if (index == 2) {
      _getArchiveRecords(user, setTrainingList);
    } else {
      _getRecords(user, setTrainingList);
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
      _getRecords(user, setTrainingList);
    } else {
      _getArchiveRecords(user, setTrainingList);
    }
    return;
  }, [user.token != ""]);
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

      await fetch(window.base_api + `get_companies/`, {
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
            _getArchiveRecords(user, setArchiveListCounter); // ? Check if there is record in archive
          } else {
            if (records.remarks === "Bad Token") {
              console.log("Token expired or mismatch");
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

      await fetch(window.base_api + `get_archive/companies`, {
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
              _toastService.hotToastService('Company',`Session Expired / Session Mismatch`,'error');
              setOpenAlert();
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
    } else {
      if (count_use_effect >= 2) {
        console.log("Missing credentials kindly logged in");
      }
    }
  }

  const enable_button = () => {
    var btnDeleteActive = document.getElementById("deleteSelectedBtn");
    var btnDeleteArchive = document.getElementById("deleteSelectedBtnArchive");
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
  };

  const confirmDeleteAlert = (row) => {
    setOpenAlert(
      <CustAlert
        type="delete"
        values={{ title: "company",subTitle:row.name,subContent:`Status: ${row.status ? `Active` : `Inactive`}`}}
        cancelCallback={hideAlert}
        confirmCallback={()=>proceedDelete(row._id,row.name)}
      />
    );
  };

  const confirmPermanentDeleteAlert = (row) => {
    setOpenAlert(
      <CustAlert
        type="deleteArchive"
        values={{ title: "company",subTitle:row.name,subContent:`This process cannot be undone.`}}
        cancelCallback={hideAlert}
        confirmCallback={()=>permanentDelete(row._id,row.name)}
      />
    );
  };

  const confirmRestoreAlert = (row) => {
    setOpenAlert(
      <CustAlert
        type="restore"
        values={{ title: "company",subTitle:row.name}}
        cancelCallback={hideAlert}
        confirmCallback={()=>restore(row._id,row.name)}
      />
    );
  };

  const confirmDeleteSelectedAlert = () => {
    setOpenAlert(
      <CustAlert
        type="deleteSelected"
        values={{ title: "company" ,data:batch_ActiveList.length}}
        cancelCallback={hideAlert}
        confirmCallback={batchDelete}
      />
    );
  };

  const confirmPermanentDeleteBatchAlert = () => {
    setOpenAlert(
      <CustAlert
        type="deleteSelectedArchive"
        values={{ title: "company" ,data:batch_ArchiveList.length,subContent:`This process cannot be undone.`}}
        cancelCallback={hideAlert}
        confirmCallback={batchPermanentDelete}
      />
    );
  };
  
  const confirmRestoreBatchAlert = () => {
    setOpenAlert(
      <CustAlert
        type="restoreSelected"
        values={{ title: "company" ,data:batch_ArchiveList.length}}
        cancelCallback={hideAlert}
        confirmCallback={batchRestore}
      />
    );
  };

  const restore = async (id, name) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { ...trainingList },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };

    _dataService.CRUD(
      window.base_api + `restore/companies/${id}`,
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
            _getRecords(user, setTrainingList);
          } else {
            const newRecords = trainingList.filter((el) => el._id !== id);
            setTrainingList(newRecords);
          }

          _toastService.hotToastService('Company',`${name} has been successfully restored.`,'success');
          setOpenAlert('');
        } else {
          if (records.remarks == "Bad Token") {
            _toastService.hotToastService('Company',`Session Expired / Session Mismatch`,'error');
            setOpenAlert();

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

  const batchRestore = async () => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    var to_set;
    const _payload = {
      payload: { company_list: batch_ArchiveList },
      auth: { token: token, _fullname: _fullname, _id: _user_id },
    };
    console.log(_payload);
    await fetch(window.base_api + `batch_restore_companies`, {
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
          _toastService.hotToastService('Company',`Selected ${batch_ArchiveList.length > 1 ? 'companies' : 'company' } has been restored.`,'success');
          setOpenAlert('')
          _getArchiveRecords(user, setTrainingList);
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

  const proceedDelete = async (id,name) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { 
        ...trainingList,
        check_collection:["crews"],
        collection_field:"company_id"
       },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };
    _dataService.CRUD(
      window.base_api + `archive/companies/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      },
      async (records) => {
        if (records.remarks == "success") {
          const newRecords = trainingList.filter((el) => el._id !== id);
          setTrainingList(newRecords);
          _getArchiveRecords(user, setArchiveListCounter); // ? Check if there is record in archive
          _toastService.hotToastService('Company',`${name} has been successfully deleted.`,'success');
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

  const batchDelete = async () => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    var to_set;
    const _payload = {
      payload: { company_list: batch_ActiveList },
      auth: { token: token, _fullname: _fullname, _id: _user_id },
    };
    await fetch(window.base_api + `batch_archive_companies`, {
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
          _toastService.hotToastService('Company',`Selected ${batch_ActiveList.length > 1 ? 'companies' : 'company' } has been deleted.`,'success');
          _getRecords(user, setTrainingList);
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

  const permanentDelete = async (id, name) => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { ...trainingList },
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };

    await fetch(window.base_api + `delete_company/${id}`, {
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
          const newRecords = trainingList.filter((el) => el._id !== id);
          setTrainingList(newRecords);
          _toastService.hotToastService('Company',`${name} has been permanently deleted.`,'success');
          setOpenAlert(``);
        } else {
          if (records.remarks == "Bad Token") {
            _toastService.hotToastService('Company',`Session Expired / Session Mismatch`,'error');
            setOpenAlert();

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
  
  const batchPermanentDelete = async () => {
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;
    const _payload = {
      payload: { company_list: batch_ArchiveList },
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
      window.base_api + `batch_delete_companies`,
      requestOptions,
      async (response) => {
        // Your response to manipulate
        const records = response;
        if (records.remarks == "success") {
          _toastService.hotToastService('Company',`Selected ${batch_ArchiveList.length > 1 ? 'companies' : 'company' } has permanently deleted.`,'success');
          _getArchiveRecords(user, setTrainingList);
          setOpenAlert(``);
        } else {
          if (records.remarks == "Bad Token") {
            _toastService.hotToastService('Company',`Session Expired / Session Mismatch`,'error');
            setOpenAlert();
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

  const tableColsGenerator = (index) => {
    var tmpCols = [
      {
        dataField: "name",
        text: "Name",
        sort: true,
      },
      {
        dataField: "status",
        text: "Status",
        headerStyle: { width: "10%" },
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
                _type="button"
                _color="danger"
                _icon="fas fa-trash-alt"
                _name="delete_row"
                _onClick={() => confirmDeleteAlert(row)}
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
                _type="button"
                _onClick={() => confirmRestoreAlert(row)}
                _name="delete_row_archive"
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
                _onClick={() => confirmPermanentDeleteAlert(row)}
                _size="cust-md"
              />
            </>
          );
        },
      });
    }
    return tmpCols;
  };  

  function FilterCallback(_filterArray, _filteredData){    
    updateState({filters: _filterArray.filters},setFilterArray)        
    forceUpdate();
    
  }

  function _displayCardBody(trainingList, index) {
    return (
      <ReactBSTables
        data={filterArray.filters.length > 0 ? processDataFilter(trainingList,filterArray):trainingList}        
        columns={tableColsGenerator(index)}
        filter={true}        
        _exclude_keys={[]}
        original_data={trainingList}
        _callback={FilterCallback}    
        _filterArray={filterArray}      
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
                batch_ActiveList.push(...rows);
              } else {
                batch_ArchiveList.push(...rows);
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

  const hideAlert = () => {
    setOpenAlert(null);
  };

  const addCallback = async (status, name) => {
    console.log(status);
    switch (status) {
      case "success":
        _toastService.hotToastService('Company',`${name ? name : ""} has been successfully added.`,'success');
        toggleModal();
        _getRecords(user, setTrainingList);
        break;
      case "success_edit":
        _toastService.hotToastService('Company',`${name ? name : ""} has been successfully updated.`,'success');
        toggleModalEdit();
        _getRecords(user, setTrainingList);
        break;

      case "existing":
        _toastService.hotToastService('Company',`Company already exists.`,'warning');
        break;
      default:
        toggleModal();
        break;
    }
  }; 

  const toggleModalDownload = async () => {
    await setDownloadPopup(!openDownloadPopup);
  };

 

  function downloadReport() {
    var radio_btn = document.querySelector(
      'input[name = "customRadio"]:checked'
    );
    if (radio_btn != null) {
      if (radio_btn.id == "pdf_radio") {
        processPDF();
      } else if (radio_btn.id == "excel_radio") {
        processExcel();
      }
    }
  }

  async function processExcel() {
    var body = JSON.stringify({
      key: "Q2FzeXNNb2RlY0FwaQ==",
      payload: trainingList,
      keyword: keyword,
    });

    _dataService.processExcel(
      `companies/download_excel_companies.php`,
      body,
      "Companies",
      (return_data) => {
        toggleModalDownload();
        if (return_data.remarks != "success") {
          _toastService.hotToastService('Company',`Failed to Download Report`,'error');
          setOpenAlert();
        }
      }
    );
  }

  async function processPDF() {
    var body = JSON.stringify({
      key: "Q2FzeXNNb2RlY0FwaQ==",
      payload: trainingList,
      keyword: keyword,
    });
    _dataService.processPDF(
      `companies/download_pdf_companies.php`,
      body,
      "Companies",
      (return_data) => {
        toggleModalDownload();
        if (return_data.remarks != "success") {
          _toastService.hotToastService('Company',`Failed to Download Report`,'error');
          setOpenAlert();
        }
      }
    );
  }
  return (
    <>
      <CardsHeader
        name={tabsListState.tabs === 1 ? "Company" : "Company | Archived"}
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
                      <TabContent activeTab={"list" + tabsListState.tabs}>
                        <TabPane tabId="list1">
                          <CustButton
                            _text="Add"
                            _id={`addBtn`}
                            _type="button"
                            _color="default"
                            _onClick={toggleModal}
                            _icon="fas fa-plus"
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
                            _onClick={confirmDeleteSelectedAlert}
                            _type="button"
                            _color="danger"
                            _icon="fas fa-trash"
                            _size="cust-md"
                          />
                          <CustButton
                            _text={
                              tabsListState.tabs === 2 ? "Active" : "Archived"
                            }
                            _disabled={
                              archiveListCounter.length == 0 ? true : false
                            }
                            _id={`archiveBtn`}
                            _type="button"
                            _color="default"
                            _icon="fas fa-box"
                            _size="cust-md"
                            _onClick={(e) => toggleListNavs(e)}
                          />
                        </TabPane>
                        <TabPane tabId="list2">
                          <CustButton
                            _text="Restore Selected"
                            _id={`restoreSelected`}
                            _onClick={() => confirmRestoreBatchAlert()}
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
                            _text="Permanently Delete Selected"
                            _onClick={confirmPermanentDeleteBatchAlert}
                            _id={`deleteSelectedBtnArchive`}
                            _type="button"
                            _color="danger"
                            _icon="fas fa-trash"
                            _size="cust-md"
                          />
                          <CustButton
                            _text={
                              tabsListState.tabs === 2 ? "Active" : "Archived"
                            }
                            _id={`archiveBtn`}
                            _type="button"
                            _color="default"
                            _icon="fas fa-box-open"
                            _size="cust-md"
                            _onClick={(e) => toggleListNavs(e)}
                          />
                        </TabPane>
                      </TabContent>
                    </div>
                  </Col>
                </Row>
              </CardHeader>
              <CardBody className="Scrollble">
                <TabContent activeTab={"list" + tabsListState.tabs}>
                  <TabPane tabId="list1">
                    {trainingList.length <= 0 ? (
                      <CardBody className=" justify-content-center row">
                        <NoDataFound />
                      </CardBody>
                    ) : (
                      _displayCardBody(trainingList, 1)
                    )}
                  </TabPane>
                  <TabPane tabId="list2">
                    {trainingList.length <= 0 ? (
                      <CardBody className=" justify-content-center row">
                        <NoDataFound />
                      </CardBody>
                    ) : (
                      _displayCardBody(trainingList, 2)
                    )}
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <CustModal
        _modalTitle="Add Company"
        _modalId="addTrainings"
        _state={toggleModal}
        _size="md"
        _stateBool={openAddPopup}
      >
        <AddCompany _state={toggleModal} _callback={addCallback} />
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
        _modalTitle="Edit Company"
        _modalId="EditTraining"
        _state={toggleModalEdit}
        _size="md"
        _stateBool={openEditPopup}
      >
        <EditCompany
          _selectedId={selectedId}
          _state={toggleModalEdit}
          _callback={addCallback}
        />
      </CustModal>

      {openAlert}
    </>
  );
}

export default Company;
