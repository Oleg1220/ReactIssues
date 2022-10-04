import React, { useState, useEffect, useContext } from "react";
import classnames from "classnames";
import {
  CardBody,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Breadcrumb,
  Card,
} from "reactstrap";
import Gauge from "components/Charts/Gauge";
import JcpOverview from "./competence-assurance-cont/JcpOverview";
import CdaAssessment from "./competence-assurance-cont/CdaAssessment";
function CompetenceAssurance() {
  const [caTabsState, setCaTabsState] = useState({ tabs: 1 });

  const toggleCaNavs = (e, statesss, index) => {
    e.preventDefault();
    setCaTabsState({ tabs: index });
  };
  return (
    <>
      <Nav
        className=" flex-column flex-md-row"
        id="tabs-icons-text"
        pills
        role="tablist"
      >
        <NavItem size="cust-md" className="nav-item-custom">
          <NavLink
            aria-selected={caTabsState.tabs === 1}
            className={classnames("mb-sm-3 mb-md-0", {
              active: caTabsState.tabs === 1,
            })}
            style={{borderRadius:'0.8rem 0.8rem 0rem 0rem'}}
            onClick={(e) => toggleCaNavs(e, "tabs", 1)}
            href="#pablo"
            role="tab"
          >
            JCP Overview
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            aria-selected={caTabsState.tabs === 2}
            className={classnames("mb-sm-3 mb-md-0", {
              active: caTabsState.tabs === 2,
            })}
            style={{borderRadius:'0.8rem 0.8rem 0rem 0rem'}}
            onClick={(e) => toggleCaNavs(e, "tabs", 2)}
            href="#pablo"
            role="tab"
          >
            CDA Assessment
          </NavLink>
        </NavItem>
      </Nav>
      <Card>
        <TabContent className="" activeTab={"catabs" + caTabsState.tabs}>
          <TabPane tabId={"catabs1"}>
            <CardBody>
              <JcpOverview />
            </CardBody>
          </TabPane>
          <TabPane tabId={"catabs2"}>
    <Breadcrumb>
    <h4>Safety Critical | Functional</h4>
    </Breadcrumb>
            <CardBody>
              <CdaAssessment />
            </CardBody>
          </TabPane>
        </TabContent>
      </Card>
    </>
  );
}

export default CompetenceAssurance;
