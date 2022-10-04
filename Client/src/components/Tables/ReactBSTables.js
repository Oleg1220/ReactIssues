import React, { useState, useContext, useEffect } from "react";
// react component for creating dynamic tables
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import {
  Row,
  Col,
  CardBody,
  Button,
  UncontrolledCollapse,
  Card,
  UncontrolledPopover,
  PopoverBody,
  Modal,
} from "reactstrap";

import './tab.css';

// import Select2 from "react-select2-wrapper";
import Select from "react-select";

import CustButton from "../Buttons/CustButton";
import CustModal from "../Modals/CustModal";
import Filter from "../Modals/Filter";
import NoDataFound from "views/pages/error/NoDataFound";
import { filterData,formatValue } from "services/data.services";
import FilterHeader from "components/Modals/FilterHeader";

const pagination = paginationFactory({
  page: 1,
  alwaysShowAllBtns: true,
  showTotal: true,
  withFirstAndLast: false,
  sizePerPageRenderer: ({ options, currSizePerPage, onSizePerPageChange }) => (
    <div className="dataTables_length" id="datatable-basic_length" 
    style={{position: "relative", bottom: 0, 'z-index': 9999}}>
      <label>
        Show{" "}
        {
          <select
            name="datatable-basic_length"
            aria-controls="datatable-basic"
            className="form-control form-control-sm"
            onChange={(e) => onSizePerPageChange(e.target.value)}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        }{" "}
        entries.
      </label>
    </div>
  ),
});

const { SearchBar } = Search;

function ReactBSTables(props) {

  
  const {
    data,
    original_data,
    columns,
    tableKeyField,
    selectRow,
    classes,
    _callback,
    filter,
    _filterArray,        
    _exclude_keys=[],
    title,
    addCallback,
    activeCallback,
    _currentTab,
    _filterColumn,
    _filterColumnArray,
    _exclude_column_keys

  } = props;
  var _search_event = (e) => {};
  var _headers_event = (e) => {};
  if (_callback) {
    _search_event = _callback;
  }
  if(_filterColumn){
    _headers_event = _filterColumn
  }   

  const [allowFilter,setAllowFilter] = useState(false)
  const [filterCount,setFilterCount]= useState(0)
  const [existingFilter,setExistingFilter] = useState([])

  const [currentColumn,setCurrentColumn] = useState(columns)
  const [hideCount,setHideCount] = useState(0)
  useEffect(()=>{   
    if(_filterArray){
      setExistingFilter(JSON.parse(JSON.stringify(_filterArray)))
      setFilterCount(_filterArray.filters.length)
    }
    
  },[_filterArray])

  useEffect(()=>{
    if(filter){
      if(_filterArray && _exclude_keys && _callback && original_data){        
        if(original_data.length > 0){
          setAllowFilter(true)
        }        
      }
    }
  },[original_data])

  useEffect(()=>{
    if(!_filterColumnArray){   
      setCurrentColumn(columns)
      return
     }
    var _column = (columns);
   
    
    var count =0;    
   
    _filterColumnArray.headers.forEach(filter=>{
      for (let index = 0; index < _column.length; index++) {
        const element = _column[index];        
          if(filter.includes(element.dataField.toLocaleLowerCase()) ){
            _column.splice(index, 1); 
            count++;
            break;
          }
      }      
    })
   
    
    setHideCount(count)
    setCurrentColumn(_column)
  },[ (_filterColumnArray && columns) || original_data])

 
  const [openFilterModal, setFilterModal] = useState(false);

  const [openHeaderModal, setHeaderModal] = useState(false);

  const toggleModal = async () => {
    await setFilterModal(!openFilterModal);
  };

  function processDataFilter (filters,is_clear)
  {
   
    var proccess_data=[];
    var count =  filters.filters.length;
    setFilterCount(count)
    
    if(!is_clear){
      _search_event(filters,proccess_data)
      toggleModal();
    }
    else{
      setFilterCount(0)
      _search_event({filters:[]},original_data)
      
    }
  
  }

  function processHeaderFilter (headers,is_clear)
  {          
    
    if(!is_clear){
      _headers_event(headers)
      setHeaderModal(false);
    }
    else{      
      _headers_event({headers:[]})      
    }
  
  }

  function closeFilter(prevFilter){    
    toggleModal();
  }
  

  return (
    <>
    
      <ToolkitProvider
        data={data}
        keyField={tableKeyField}
        columns={columns}
        search
      >
        {(TKprops) => (
          <div className="">
            {/* Filter Region Start */}
            <Row className="pb-2" hidden={filter === undefined ? true : false}>
              <Col>
                <p style={{ textAlign: "right" }}>
                  {/* Filter Modal Trigger Button */}
                  {
                    allowFilter? 
                    <CustButton
                      _text="Filter"
                      _id={`Filter`}
                      _type="button"
                      _color="transparent"
                      _onClick={setFilterModal}
                      _icon="fas fa-filter"
                      _size="cust-md"
                    >
                      <span class="badge ">{filterCount>0?filterCount:null} </span>
                    </CustButton>                                                                                                
                    :null
                  }
                    {
                    _filterColumn?
                    <CustButton
                      _text="Hide Columns"
                      _id={`FilterHeader`}
                      _type="button"
                      _color="transparent"
                      _onClick={setHeaderModal}
                      _icon="fas fa-eye-slash"
                      _size="cust-md"
                    >
                      <span class="badge ">{hideCount>0?hideCount:null} </span>
                    </CustButton>
                  :
                  null
                  
                    }
                  
                </p>
                {/* Filter Modal */}
                <CustModal
                  _header={false}
                  _modalId="FilterTable"
                  _state={toggleModal}
                  _size="lg"
                  _stateBool={openFilterModal}
                >
                  {
               
                    <Filter key={openFilterModal} _state={toggleModal} _data ={original_data} _filterArray={existingFilter} _filterColumnArray={_filterColumnArray} _exclude_keys={_exclude_keys} _callback={processDataFilter} _closeFilter={closeFilter}/>
                  
                  }
                 
                </CustModal>
                <CustModal
                  _header={false}
                  _modalId="FilterTable"
                  _state={()=>setHeaderModal(false)}
                  _size="lg"
                  _stateBool={openHeaderModal}
                >
                  {
                  
                    <FilterHeader key={openFilterModal} _state={openHeaderModal} _data ={original_data} _filterArray={existingFilter} _filterColumnArray={_filterColumnArray} _exclude_keys={_exclude_column_keys} _callback={processHeaderFilter} _closeFilter={()=>setHeaderModal(false)}/>
                  
                  }
                 
                </CustModal>
              </Col>
            </Row>
            {/* Filter Region End */}            
            {
              data.length>0? 
              <BootstrapTable
                {...TKprops.baseProps}
                data={data}
                columns={currentColumn}
                keyField={tableKeyField}
                bootstrap4={true}
                pagination={pagination}
                bordered={false}
                wrapperClasses={classes}
                selectRow={selectRow}
              />
              :
              <>
                <NoDataFound title={title} callback={addCallback} activeCallback={activeCallback} tabs={_currentTab} />
              </>
            
            }
            
          </div>
        )}
      </ToolkitProvider>
    </>
  );
}
export default ReactBSTables;
