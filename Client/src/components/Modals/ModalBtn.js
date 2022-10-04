import React from "react";
import { Button } from "reactstrap";
import { Modal } from 'components/Modals/Modals';

function ModalBtn(props) {
  const {
    _color,
    _icon,
    _text,
    _name,
    _id,
    _classes,
    _style,
    _onClick,
    _value,
    _type,
    _key,
    _modalid,
    _iconColor
  } = props;
  return (
    // <Button color={_color} type={_type} id={_id} key={_key} name={_name} className={_classes} style={_style} onClick={_onClick} value={_value}>
    //   {_icon ? <i className={_icon} /> : ''} {_text}
    // </Button>
       <Button color={_color} type={_type} id={_id} key={_key} name={_name} className={_classes} style={_style} onClick={_onClick} value={_value} toggle={() => this.toggleModal(_modalid)}>
         {_icon ? <i className={_icon} color={_iconColor} /> : ''} {_text}
       </Button>
  );
}

export default ModalBtn;
