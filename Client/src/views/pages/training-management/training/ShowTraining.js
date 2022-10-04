import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import { UserContext,_dataService} from "App";
import { Button, Col, Row } from "reactstrap";
import CustButton from "components/Buttons/CustButton";
import ViewPDF from "components/ViewPDF/ViewPDF";

function ShowTraining({ _selectedId, _state, _callback }) {
  const { user, setUser } = useContext(UserContext);
  const [filePDF, setfilePDF] = useState("");
  const [filePDFTitle, setfilePDFTitle] = useState("");

  const [form, setForm] = useState({
    name: "",
    accreditation: "",
    description: "",
    validity: "",
    reference_number: "",
    syllabus: "",
  });
  const params = useParams();
  const navigate = useNavigate();
  if (_selectedId) {
    params.id = _selectedId;
  }
 // These methods will update the state properties.
 function updateForm(value) {
  return setForm((prev) => {
    return { ...prev, ...value };
  });
}


async function fetchData() {
  const id = params.id.toString();
  var token = `${user.token}`;
  var _user_id = `${user.admin_id}`;
  var _fullname = `${user.fullname}`;
  const payload = {
    payload: { ...form },
    auth: { token: token, _id: _user_id, _fullname: _fullname },
  };
  await fetch(window.base_api + `get_training/${params.id.toString()}`, {
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
      if (records.remarks == "success") {
        if (records.payload != null) {
          setForm(records.payload["result"]);
          // (resPayload);
        } else {
          //console.log("No records fetch");
          window.alert(`Record with id ${id} not found`);
        }
      } else {
        if (records.remarks == "Bad Token") {
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
}

  useEffect(() => {

    fetchData();
    return;
  }, [params.id, navigate]);
  
	const downloadEmployeeData = (filename) => {      
    _dataService.BlobFetch(window.base_api + `trainings/get-file?fileName=${filename}`,{method: "GET"}, async (blob)=>{
      let url = window.URL.createObjectURL(blob);
      let a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    });
	}
  
  
  //THIS METHOD IS FOR FORCING UPDATE RENDER
  const [state, updateState] = useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const [is_openPDF, setopenPDF] = useState(false);
//
async function openPDF(item){
  var url = window.base_api+`helper/syllabus/${item.syllabus}`;
   setfilePDF(url);
   setfilePDFTitle(`Syllabus for ${item.name}`);
   forceUpdate();
   setopenPDF(true);
}

async function onSubmit(e) {
  e.preventDefault();
  
  var token = `${user.token}`;
  var _user_id = `${user.admin_id}`;
  var _fullname = `${user.fullname}`;
  var formdata = new FormData();
  
  setForm({ ...form });
  form.syllabus = null;
  // When a post request is sent to the create url, we'll add a new record to the database.
  const _payload = {
    payload: { ...form },
    auth: { token: token, _id: _user_id, _fullname: _fullname },
  };
  formdata.append("jsonData", JSON.stringify(_payload));

  await fetch(window.base_api + "update_training/" + params.id, {
    method: "POST",
    body: formdata,
  })
    .then(async (response) => {
      const records = await response.json();
      if (records.remarks === "success") {
        fetchData();
      } else {
        switch (records.remarks) {
          case "Bad Token":
            localStorage.removeItem("userData");
            setTimeout(() => {
              window.location.reload();
            }, 2500);
            break;
          default:
            console.log("Error occured with message " + records.remarks);
            break;
        }
      }
    })
    .catch((error) => {
      console.log(
        "Something went wrong, Server cannot be reach with returned error : " +
          error
      );
    });
}

  return (
    <>
      <div className="modal-body">
        <Row>
          <Col xl="12">
            <h4 class="mb-1">Description</h4>
            <p class="text-sm mb-0 px-3" style={{'wordBreak':'break-all'}}>{form.description != '' ? form.description : '-'}</p>
          </Col>
          <Col xl="12">
            <h4 class="mb-1 mt-2">Accreditation</h4>
            <p class="text-sm mb-0 px-3" style={{'wordBreak':'break-all'}}>{form.accreditation != '' ? form.accreditation : '-'}</p>
          </Col>
          <Col xl="12">
            <h4 class="mb-1 mt-2">Validity in month(s)</h4>
            <p class="text-sm mb-0 px-3">{form.validity != '' ? form.validity : '-'}</p>
          </Col>
          <Col xl="12">
            <h4 class="mb-1 mt-2">Reference No.</h4>
            <p class="text-sm mb-0 px-3" style={{'wordBreak':'break-all'}}>{form.reference_number != '' ? form.reference_number : '-'}</p>
          </Col>
          <Col xl="12">
            <h4 class="mb-1 mt-2">Uploaded Syllabus</h4>
            <div class=" mb-0 px-3">
              <p className="mb-0 text-sm">{form.syllabus ? form.syllabus : `No Syllabus Attached`}</p>
              
              <CustButton
                _hidden={form.syllabus ? false : true}
                _text="View"
                _id={`viewJdBtn`}
                _type="button"
                _color="default"
                _icon="far fa-list-alt"
                _size="cust-md"
                _onClick={() => openPDF(form)}
              />
              <CustButton
                _hidden={form.syllabus ? false : true}
                _text="Delete"
                _id={`viewJdBtn`}
                _type="button"
                _color="danger"
                _icon="fas fa-trash"
                _size="cust-md"
                _onClick={(e) => onSubmit(e)}
                
              />
              {/* <CustButton
                _text="Download Syllabus"
                _id={`downloadSyllabusBtn`}
                _type="button"
                _color="primary"
                _icon="fas fa-download"
                _disabled={form.syllabus != '' ? false : true}
                _size="cust-md"
                _onClick={(e)=>downloadEmployeeData(form.syllabus )}
              /> */}
            </div>
          </Col>
        </Row>
      </div>

      
      {is_openPDF? (<ViewPDF  modalTitle={filePDFTitle} file={filePDF} _onclick={()=>setopenPDF(false)}   _stateBool={is_openPDF} /> ):null }
    </>
  );
}

export default ShowTraining;
