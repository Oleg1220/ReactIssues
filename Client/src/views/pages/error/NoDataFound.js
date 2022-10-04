import CustButton from "components/Buttons/CustButton";
import pluralize from "pluralize";
import React from "react";

function NoDataFound(props) {
  const { title, callback, activeCallback, tabs } = props;
  return (
    <div className="text-center">
      <div className="mt-2">
        {
          title == 'Activity' ?
            <img alt="..." style={{width:'5em'}} src={require("assets/img/icons/common/no-activity.svg").default} /> 
          :
            <img alt="..." style={{width:'5em'}} src={require("assets/img/icons/common/no-data.svg").default} />
        }
        
      </div>
      <h2 class="mt-1 mb-0">No Records Found</h2>
      {title && callback ? (
        <>
          <p>There was no { tabs==1?"":"archived"} record for {pluralize(title)} at the moment.</p>          
          {
            tabs==1?
              <CustButton
                _text={"Add "+ title}
                _type="button"
                _color="default"
                _icon="fas fa-plus"
                _size="cust-md"
                _onClick = {callback}
              />
              :
              <CustButton
                _text="Back to list"
                _type="button"
                _color="default"
                _icon="fas fa-arrow-left"
                _size="cust-md"
                _onClick = {activeCallback}
              />

          }
          
        </>
      ) : null}
    </div>
  );
}

export default NoDataFound;
