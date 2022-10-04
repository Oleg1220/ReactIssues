import React, { useState, useEffect, useContext } from "react";
import { Card, CardBody, CardHeader, Col, Collapse, Row } from "reactstrap";

function JcpOverview() {
    const [openedCollapses, setOpenedCollapses] = useState([]);
    const collapsesToggle = (collapse) => {
      let tmpOpenedCollapses = openedCollapses;
      if (tmpOpenedCollapses.includes(collapse)) {
        setOpenedCollapses([]);
      } else {
        setOpenedCollapses([collapse]);
      }
    };
  return (
    <>
      <Row className="mb-4">
        <Col xl="9">
          <h4>Overall Progress</h4>
        </Col>
        <Col xl="3">
          <h4>CHARTS HERE!!</h4>
        </Col>
      </Row>
      <Row>
        <Col xl="12">
          <div className="accordion">
            <Card className="card-plain mb-2">
              <CardHeader
                role="tab"
                onClick={() => collapsesToggle("collapseOne")}
                aria-expanded={openedCollapses.includes("collapseOne")}
              >
                <h5 className="mb-0">Collapsible Group Item #1</h5>
              </CardHeader>
              <Collapse
                role="tabpanel"
                isOpen={openedCollapses.includes("collapseOne")}
              >
                <CardBody>
                  Anim pariatur cliche reprehenderit, enim eiusmod high life
                  accusamus terry richardson ad squid. 3 wolf moon officia aute,
                  non cupidatat skateboard dolor brunch. Food truck quinoa
                  nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt
                  aliqua put a bird on it squid single-origin coffee nulla
                  assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft
                  beer labore wes anderson cred nesciunt sapiente ea proident.
                  Ad vegan excepteur butcher vice lomo. Leggings occaecat craft
                  beer farm-to-table, raw denim aesthetic synth nesciunt you
                  probably haven't heard of them accusamus labore sustainable
                  VHS.
                </CardBody>
              </Collapse>
            </Card>
            <Card className="card-plain mb-2">
              <CardHeader
                role="tab"
                onClick={() => collapsesToggle("collapseTwo")}
                aria-expanded={openedCollapses.includes("collapseTwo")}
              >
                <h5 className="mb-0">Collapsible Group Item #2</h5>
              </CardHeader>
              <Collapse
                role="tabpanel"
                isOpen={openedCollapses.includes("collapseTwo")}
              >
                <CardBody>
                  Anim pariatur cliche reprehenderit, enim eiusmod high life
                  accusamus terry richardson ad squid. 3 wolf moon officia aute,
                  non cupidatat skateboard dolor brunch. Food truck quinoa
                  nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt
                  aliqua put a bird on it squid single-origin coffee nulla
                  assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft
                  beer labore wes anderson cred nesciunt sapiente ea proident.
                  Ad vegan excepteur butcher vice lomo. Leggings occaecat craft
                  beer farm-to-table, raw denim aesthetic synth nesciunt you
                  probably haven't heard of them accusamus labore sustainable
                  VHS.
                </CardBody>
              </Collapse>
            </Card>
            <Card className="card-plain mb-2">
              <CardHeader
                role="tab"
                onClick={() => collapsesToggle("collapseThree")}
                aria-expanded={openedCollapses.includes("collapseThree")}
              >
                <h5 className="mb-0">Collapsible Group Item #3</h5>
              </CardHeader>
              <Collapse
                role="tabpanel"
                isOpen={openedCollapses.includes("collapseThree")}
              >
                <CardBody>
                  Anim pariatur cliche reprehenderit, enim eiusmod high life
                  accusamus terry richardson ad squid. 3 wolf moon officia aute,
                  non cupidatat skateboard dolor brunch. Food truck quinoa
                  nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt
                  aliqua put a bird on it squid single-origin coffee nulla
                  assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft
                  beer labore wes anderson cred nesciunt sapiente ea proident.
                  Ad vegan excepteur butcher vice lomo. Leggings occaecat craft
                  beer farm-to-table, raw denim aesthetic synth nesciunt you
                  probably haven't heard of them accusamus labore sustainable
                  VHS.
                </CardBody>
              </Collapse>
            </Card>
          </div>
        </Col>
      </Row>
    </>
  );
}

export default JcpOverview;
