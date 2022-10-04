import React from "react";
import { Button } from "reactstrap";

function DownloadOptions({ _state }) {
  return (
    <>
      <div className="modal-body">
        <div className="custom-control custom-radio mb-3">
          <input
            checked
            className="custom-control-input"
            id="pdf_radio"
            name="customRadio"
            type="radio"
          />
          <label className="custom-control-label" htmlFor="pdf_radio">
            Portable Document Format (PDF)
          </label>
        </div>
        <div className="custom-control custom-radio">
          <input
            className="custom-control-input"
            id="excel_radio"
            name="customRadio"
            type="radio"
          />
          <label className="custom-control-label" htmlFor="excel_radio">
            Spreadsheet Format (.xlsx)
          </label>
        </div>
      </div>
      <div className="modal-footer">
        <Button onClick={_state} color="primary" type="button">
          <i class="fas fa-download"></i> Download
        </Button>
      </div>
    </>
  );
}

export default DownloadOptions;
