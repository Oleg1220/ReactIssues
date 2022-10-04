import React from "react";
import { useTranslation } from "react-i18next";
import { Button,UncontrolledTooltip } from "reactstrap";

function CustButton(props) {
  const  {t} = useTranslation();
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
    _disabled,
    _size,
    _hidden,
    _tooltip,
    _iconColor,
    children
  } = props;
  var can_click=_onClick;
  var is_disabled="";
  if(_disabled){
    can_click = null;
    is_disabled ="disabled";
  }
  var dfault_text=""
  if(_text){
    dfault_text=_text;
  }
  return (
    _hidden? null:
      <>
        <Button color={_color} disabled={_disabled} type={_type} id={_id} key={_key} name={_name} className={_classes +" "+ is_disabled } style={_style} onClick={can_click} size={_size} value={_value}>
          {_icon ? <i className={_icon +' mr-1'} /> : ''} {t('buttons.'+dfault_text, { defaultValue: dfault_text })}
          {children}
        </Button>

        {_tooltip?
        <UncontrolledTooltip
          delay={0}
          placement="top"
          target={_id}
        >
          {_tooltip}
        </UncontrolledTooltip>  :null}
      </>
  );
}

export default CustButton;
