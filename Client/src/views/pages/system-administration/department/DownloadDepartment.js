import React from "react";
import { Button } from "reactstrap";

function DownloadDepartment({ _state }) {
  return (
    <>
      <div className="modal-body">
        <div className="custom-control custom-radio mb-3">
          <input
            checked
            className="custom-control-input"
            id="customRadio1"
            name="customRadio"
            type="radio"
          />
          <label className="custom-control-label" htmlFor="customRadio1">
            Portable Document Format (PDF)
          </label>
        </div>
        <div className="custom-control custom-radio">
          <input
            className="custom-control-input"
            id="customRadio2"
            name="customRadio"
            type="radio"
          />
          <label className="custom-control-label" htmlFor="customRadio2">
            Spreadsheet Format (.xlsx)
          </label>
        </div>
      </div>
      <div className="modal-footer">
        <Button onClick={_state} color="primary" type="button">
          Download
        </Button>
        
      </div>
    </>
  );
}

export default DownloadDepartment;
