import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import { UserContext,_dataService} from "App";
import { Button, Col, Row } from "reactstrap";
import CustButton from "components/Buttons/CustButton";


function ShowProvider({ _selectedId, _state ,_callback }) {
  const { user, setUser } = useContext(UserContext);
  const [form, setForm] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
  });
  const params = useParams();
  const navigate = useNavigate();
  if (_selectedId) {
    params.id = _selectedId;
  }
  useEffect(() => {
    async function fetchData() {
      const id = params.id.toString();
      var token = `${user.token}`;
      var _user_id = `${user.admin_id}`;
      var _fullname = `${user.fullname}`;
      const payload = {
        payload: { ...form },
        auth: { token: token, _id: _user_id, _fullname: _fullname },
      };
      await fetch(window.base_api + `get_providers/${params.id.toString()}`, {
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
              const resPayload = records.payload["result"];
              setForm(resPayload);
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

    fetchData();
    return;
  }, [params.id, navigate]);

  return (
    <>
      <div className="modal-body">
        {/* <p className="H1" style={{margin:"0", marginTop:"10px", fontWeight:"bold"}}>Name:</p>
        <p className="H1" style={{margin:"0", marginLeft:"20px"}}>{form.name != '' ? form.name : '-'}</p> */}

        <p className="H1" style={{fontWeight:"bold"}}>Contact Details</p>
        <div style={{marginLeft:"10px"}}>
        <p className="H1" style={{margin:"0", marginTop:"10px", fontWeight:"bold"}}>E-mail Address</p>
        <p className="H1" style={{margin:"0", marginLeft:"20px"}}>{form.email != '' ? form.email : '-'}</p>
        
        <p className="H1" style={{margin:"0", marginTop:"10px", fontWeight:"bold"}}>Address</p>
        <p className="H1" style={{margin:"0", marginLeft:"20px"}}>{form.address != '' ? form.address : '-'}</p>
        
        <p className="H1" style={{margin:"0", marginTop:"10px", fontWeight:"bold"}}>Telephone No.</p>
        <p className="H1" style={{margin:"0", marginLeft:"20px"}}>+{form.phone != '' ? form.phone : '-'}</p>
        </div>
      </div>

    </>
  );
}

export default ShowProvider;
