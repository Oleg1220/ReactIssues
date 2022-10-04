import React from "react";
// reactstrap components
import {  Modal } from "reactstrap";

function CustModal(props) {
  const { _modalTitle, _modalId,_onCloseClick, _state,_stateBool,children,_size,_modalBg,_header } = props;
  var modalHeaderBg = _modalBg ? _modalBg : 'bg-default';
  return (
    <Modal className="modal-dialog-centered" isOpen={_stateBool} size={_size} >
      <div hidden={_header===undefined? false:true} className={`modal-header ${modalHeaderBg}` } style={{alignItems:'center'}}>
        <h5 className="modal-title  text-white text-capitalize" id={_modalId} >
          {_modalTitle}
        </h5>
        <button
          aria-label="Close"
          className="close "
          data-dismiss="modal"
          type="button"
          onClick={_onCloseClick?_onCloseClick:_state}
        >
          <span className=" text-white" aria-hidden={true}>×</span>
        </button>
      </div>
      
      {children}
      
    </Modal>
  );
}

export default CustModal;
