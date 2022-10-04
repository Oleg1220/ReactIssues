import React from "react";
// react component for creating dynamic tables
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import CustButton from "components/Buttons/CustButton";

import {
  Row,
  Col
} from "reactstrap";

const pagination = paginationFactory({
  page: 1,
  alwaysShowAllBtns: true,
  showTotal: true,
  withFirstAndLast: false,
  sizePerPageRenderer: ({ options, currSizePerPage, onSizePerPageChange }) => (
    <div className="dataTables_length" id="datatable-basic_length">
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

function ReactBSTablesPlain(props) {
  const { data, columns, tableKeyField,selectRow,classes } = props;
  
  return (
    <>
      <ToolkitProvider
        data={data}
        keyField={tableKeyField}
        columns={columns}
        search
      >
        {(TKprops) => (
          <div className="py-4">
            <div
              id="datatable-basic_filter"
              className="dataTables_filter px-4 pb-1"
            >
              <Row>
                <Col xl="6">
                  <div className="col" style={{ textAlign: "end" }}>
                    <label>
                      Search:
                      <SearchBar
                        className="form-control-sm"
                        placeholder=""
                        {...TKprops.searchProps}
                      />
                    </label>
                  </div>
                </Col>
                <Col xl="5">
                </Col>
              </Row>
            </div>
            
            <BootstrapTable
            {...TKprops.baseProps}
              data={data}
              columns={columns}
              keyField={tableKeyField}
              bootstrap4={true}
              pagination={pagination}
              bordered={false}
              wrapperClasses={classes}                       
            />
          </div>
        )}
      </ToolkitProvider>
    </>
  );
} 
export default ReactBSTablesPlain;
