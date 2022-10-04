import { UserContext, _dataService } from "App";
import CustButton from "components/Buttons/CustButton";
import Dropzones from "components/Dropzone/Dropzone";
import React, { useState, useEffect, useContext } from "react";
import Moment from "react-moment";
import "./Position.css";
// reactstrap components
import {
  Table,
  Row,
  Col,
  Alert,
  Button,
} from "reactstrap";
import CustModal from "components/Modals/CustModal";
import ViewPDF from "components/ViewPDF/ViewPDF";
function ViewJob({ _id, _state, _callback }) {
  var [fileForUpdate, setFileForUpdate] = useState(false);
  const [alertState, setAlertState] = useState(null);
  var [fileAdd, setFileAdd] = useState(null);
  const [file_nameAdd, setFilenameAdd] = useState(null);
  const [openAlert, setOpenAlert] = useState(null);
  const [jobDescPopup, setJobDescOpenModal] = useState(false);
  const [jobUploadPopup, setJobUploadOpenModal] = useState(false);
  const [is_openPDF, setopenPDF] = useState(false);
  const [filePDF, setfilePDF] = useState("");
  const [filePDFTitle, setfilePDFTitle] = useState("");
  const renameFile = (originalFile, newName) => {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  };
  const { user, setUser } = useContext(UserContext);
  
  const [form, setForm] = useState([
    {
      department_id: "",
      division_id: "",
      location_id: "",
      name: "",
      hierarchy: "",
      job_description: "",
    },
  ]);
  useEffect(() => {
    _getRecords(user, setForm);
    return;
  }, [user.token != ""]);
  const toggleUpdateFile = () => {
    setFileForUpdate(!fileForUpdate);
  };

  var count_use_effect = 0;
  async function _getRecords(user, callback) {
    var token = user.token;
    var _user_id = user.admin_id;
    var token_creation = user.token_creation;
    count_use_effect++;
    //console.log(count_use_effect);
    if (token && token_creation) {
      const _payload = {
        auth: {
          token: token,
          _id: _user_id,
        },
        payload: {},
      };

      var requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(_payload),
      };
      _dataService.CRUD(
        window.base_api + `get_positions/${_id}`,
        requestOptions,
        async (response) => {
          // Your response to manipulate
          const records = response;
          if (records.remarks == "success") {
            if (records.payload.result) {
              const resPayload = records.payload["result"];
              console.log(resPayload);
              callback([resPayload]);
            } else {
              _callback("failed");
            }
          } else {
            if (records.remarks == "Bad Token") {
              _callback(records.remarks);
            } else {
              _callback(records.remarks);
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

  async function onSubmit(e) {
    e.preventDefault();
    setAlertState(null);

    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;

    // * Prep Form Data
    var formdata = new FormData();
    var newFileName = null;
    if (fileAdd != null) {
      var uniqidn = `JD_${Math.floor(1000 + Math.random() * 9000)}_${Math.floor(
        1000 + Math.random() * 9000
      )}`;
      newFileName = uniqidn + "." + fileAdd[0].name.split(".").pop();
      fileAdd = renameFile(fileAdd[0], newFileName);
      formdata.append("file", fileAdd);
      formdata.append("newFileName", newFileName);
    } else {
      setAlertState(
        <Alert color="danger">
          <span className="alert-inner--icon">
            <i class="fas fa-exclamation-triangle"></i>
          </span>{" "}
          <span className="alert-inner--text">
            <strong>Warning:</strong> Uploading a PDF file are required.
          </span>
        </Alert>
      );
      toggleModalJobUpload();
      return;
    }

    // When a post request is sent to the create url, we'll add a new record to the database.
    const _payload = {
      payload: {},
      auth: { token: token, _id: _user_id, _fullname: _fullname },
    };
    formdata.append("jsonData", JSON.stringify(_payload));
    
    console.log(formdata);
    var requestOptions = {
      method: "POST",
      body: formdata,
    };
    _dataService.CRUD(
      window.base_api + `update_uploaded_position_file/${_id}`,
      requestOptions,
      async (response) => {
        // Your response to manipulate
        const records = response;
        if (records.remarks === "success") {
          _getRecords(user, setForm);
          _callback("success_file_update");
          toggleModalJobUpload();
          toggleUpdateFile();
          setFileAdd(null);
        } else {
          switch (records.remarks) {
            case "Bad Token":
              _callback(records.remarks);
              break;

            case "existing":
              _callback(records.remarks);
              break;
            default:
              _callback(records.remarks);
              break;
          }
        }
      }
    );
  }

  async function confirmOnSubmit(e){
    e.preventDefault();
    setAlertState(null);
    toggleModalJobUpload();
  }

  async function onSubmitDelete(id) {
    setAlertState(null); 
    var token = user.token;
    var _user_id = user.admin_id;
    var _fullname = user.fullname;

    // When a post request is sent to the create url, we'll add a new record to the database.
    const _payload = {
      payload: {deletefile:1},
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
      window.base_api + `remove_uploaded_file/${_id}`,
      requestOptions,
      async (response) => {
        // Your response to manipulate
        const records = response;
        if (records.remarks === "success") {
          _getRecords(user, setForm);
          _callback("success_remove_file_update");
          toggleModalJobDesc();
          // toggleUpdateFile();
          setFileAdd(null);
        } else {
          console.log(`error`)
          return;
          switch (records.remarks) {
            case "Bad Token":
              _callback(records.remarks);
              break;

            case "existing":
              _callback(records.remarks);
              break;
            default:
              _callback(records.remarks);
              break;
          }
        }
      }
    );
  }

  const toggleModalJobDesc = (e, id) => {
    setJobDescOpenModal(!jobDescPopup);
  };
  
  const toggleModalJobUpload = (e, id) => {
    setJobUploadOpenModal(!jobUploadPopup);
  };

  
  //THIS METHOD IS FOR FORCING UPDATE RENDER
    const [state, updateState] = useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);
  //

  async function openPDF(item){
    var url = window.base_api+`helper/job_description/${item.job_description}`;
     setfilePDF(url);
     setfilePDFTitle(`Job Description: ${item.name}`);
     forceUpdate();
     setopenPDF(true);
  }

  return (
    <>
      <div className="modal-body pb-1">
        <div className=" text-right mb-3">
          <CustButton
            _text="Activity"
            _id={`activityBtn`}
            _type="button"
            _color="default"
            _icon="fas fa-wave-square"
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
        </div>
        {openAlert}
        {alertState}
        <Table className="align-items-center" responsive>
          <thead className="thead-light">
            <tr>
              <th scope="col" style={{ width: "50%" }}>
                File Name
              </th>
              <th scope="col">Date Uploaded</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {form.map((items) => {
              if (items.job_description) {
                return (
                  <tr>
                    <th scope="row">{items.job_description}</th>
                    <td>
                      <h4 class="mt-3 mb-1">
                        <Moment format="DD MMM YYYY">
                          {items.date_modified}
                        </Moment>
                      </h4>
                      <p class="text-sm mb-0">
                        <Moment format="HH:mm:ss">{items.date_modified}</Moment>
                      </p>
                    </td>
                    <td className="text-right">
                      <CustButton
                        _text="View"
                        _id={`viewJdBtn`}
                        _type="button"
                        _color="default"
                        _icon="fas fa-eye"
                        _size="cust-md"
                        // _onClick={(e) =>
                        //   downloadEmployeeData(items.job_description)
                        // }
                        _onClick={() => openPDF(items)}
                      />
                      <CustButton
                        _text="Update"
                        _id={`updateJdBtn`}
                        _type="button"
                        _onClick={toggleUpdateFile}
                        _color="default"
                        _icon="fas fa-sync"
                        _size="cust-md"
                      />
                      <CustButton
                        _text="Delete"
                        _id={`deleteJdBtn`}
                        _type="button"
                        _color="danger"
                        _icon="fas fa-trash"
                        _size="cust-md"
                        _onClick={(e) => toggleModalJobDesc(e, 1)}
                      />
                    </td>
                  </tr>
                );
              } else {
                return (
                  <tr>
                    <td colSpan={3} className="text-center">
                      <div className="mt-2">
                        <i class="far fa-folder-open fa-3x"></i>
                      </div>
                      <h4 class="mt-1 mb-3">No file found</h4>
                      <CustButton
                        _text="Upload a file"
                        _id={`updateJdBtn`}
                        _type="button"
                        _onClick={toggleUpdateFile}
                        _color="default"
                        _icon="fas fa-upload"
                        _size="cust-md"
                      />
                    </td>
                  </tr>
                );
              }
            })}
          </tbody>
        </Table>
        {fileForUpdate ? (
          <Row className="mb-4">
            <Col xl="12">
              <div className="">
              <label className="form-control-label">
                Upload Job Description
              </label>
              <Dropzones
                _style={{ padding: "0px" }}
                _maxfiles="1"
                _file_type={{ "application/pdf": [".pdf"] }}
                _pholder="Only PDF file type is supported"
                _response="Success"
                _fileCallback={setFileAdd}
                _file_nameCallBack={setFilenameAdd}
              />
              </div>
            </Col>
          </Row>
        ) : (
          ""
        )}
      </div>
      
      <div className="modal-footer pt-0">
        {fileForUpdate ? (
          <CustButton
            _classes="text-align-middle"
            _text="Upload"
            _id={`updateJdBtn`}
            _type="button"
            _color="primary"
            _icon="fas fa-upload"
            _size="cust-md"
            _onClick={(e) => {
              confirmOnSubmit(e);
            }}
          />
        ) : (
          ""
        )}
        <Button
          color="secondary"
          type="button"
          onClick={_state}
        >
          <i className="fas fa-ban"> </i><span>Cancel</span>
        </Button>
      </div>

      <CustModal
        _modalId="confirmDeleteFile"
        _state={toggleModalJobDesc}
        _size="md"
        _stateBool={jobDescPopup}
        _modalBg="bg-warning"
        _header={false}
      >
        <div className="modal-body">
          <div className="text-center">
            <div className="py-3"><i class="fas fa-trash fa-5x text-danger"></i></div>
            <h2>Are you sure you want to delete the uploaded Job Description?</h2>
            <h5 className=" text-muted m-0">This process cannot be undone.</h5>
          </div>
        </div>
        <div className="modal-footer justify-content-center">
          <Button color="danger" type="button" onClick={(e) => onSubmitDelete(e)}>
            <i className="fas fa-trash"> </i><span>Yes</span>
          </Button>
          <Button
            color="secondary"
            data-dismiss="modal"
            type="button"
            onClick={toggleModalJobDesc}
          >
            <i className="fas fa-ban"> </i><span>No</span>
          </Button>
        </div>
      </CustModal>
      
      <CustModal
        _modalId="confirmUpdateFile"
        _state={setJobUploadOpenModal}
        _size="md"
        _stateBool={jobUploadPopup}
        _header={false}
      >
        <div className="modal-body">
          <div className="text-center">
            <div className="py-3"><i class="fas fa-exclamation-circle fa-5x text-warning"></i></div>
            <h2>Are you sure you want to update the uploaded <br /> Job Description?</h2>  
            <h5 className=" text-muted m-0">This process cannot be undone.</h5>
          </div>
        </div>
        <div className="modal-footer justify-content-center">
          <Button color="warning" type="button" onClick={(e) => onSubmit(e)}>
            <i className="fas fa-trash"> </i><span>Yes</span>
          </Button>
          <Button
            color="secondary"
            data-dismiss="modal"
            type="button"
            onClick={toggleModalJobUpload}
          >
            <i className="fas fa-ban"> </i><span>No</span>
          </Button>
        </div>
      </CustModal>
      
      {is_openPDF? (<ViewPDF  modalTitle={filePDFTitle} file={filePDF} _onclick={()=>setopenPDF(false)}   _stateBool={is_openPDF} /> ):null } 
    </>
  );
}

export default ViewJob;
