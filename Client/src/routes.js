/*!

=========================================================
* Argon Dashboard PRO React - v1.2.1
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-pro-react
* Copyright 2021 Creative Tim (https://www.creative-tim.com)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/ 
import Dashboard from "views/pages/dashboard/Dashboard.js";
 


import CompAssess from "views/pages/comp-assess/CompAssess";

// training_management.title
import TrainingCategory from "views/pages/training-management/training-categ/TrainingCategory";
import CompSpecific from "views/pages/training-management/comp-specific/CompSpecific";
import Directory from "views/pages/training-management/directory/Directory";
import Providers from "views/pages/training-management/provider/Providers";
import Training from "views/pages/training-management/training/Training";
import TrainingBudget from "views/pages/training-management/training-budget/TrainingBudget";
import TrainingSched from "views/pages/training-management/training-sched/TrainingSched";
//

// competency_management.title
import Function from "views/pages/competency-management/function/Function";
import AssessCriteria from "views/pages/competency-management/assess-criteria/AssessCriteria";
import CompetencyUnits from "views/pages/competency-management/competency-units/CompetencyUnits";
import Element from "views/pages/competency-management/element/Element";
import Matrix from "views/pages/competency-management/matrix/Matrix";

//

//system_administration.title
import Company from "views/pages/system-administration/company/Company";
import AccessLevel from "views/pages/system-administration/acc-level/AccessLevel";
import Department from "views/pages/system-administration/department/Department";
import Division from "views/pages/system-administration/division/Division";
import LocGroup from "views/pages/system-administration/loc-group/LocGroup";
import LocType from "views/pages/system-administration/loc-type/LocType";
import Location from "views/pages/system-administration/location/Location";
import Position from "views/pages/system-administration/position/Position";
import Profile from "views/pages/crew/Profile";
import Crew from "views/pages/system-administration/crews/Crew";
//


const routes = [
  {
    path: "/dashboard",
    name: "Dashboard",
    icon: "fas fa-chart-line SidebarIcon",
    component: Dashboard,
    layout: "/admin",
    navTitle:"",
    navSubTitle:""
  },
  {
    path: "/comp-assess",
    name: "competency_assessment.title",
    icon: "fas fa-book-reader SidebarIcon",
    component: CompAssess,
    layout: "/admin",
    navTitle:"",
    navSubTitle:""
  },
  {
    collapse: true,
    name: "training_management.title",
    icon: "fas fa-chalkboard-teacher SidebarIcon",
    state: "examplesCollapse",
    views: [
      {
        path: "/training-category",
        name: "Training Category",
        miniName: "TC",
        component: TrainingCategory,
        layout: "/admin",
        navTitle:"training_management.title",
        navSubTitle:"Management of base informaton related to training."
      },
      {
        path: "/trainings",
        name: "Training",
        miniName: "T",
        component: Training,
        layout: "/admin",
        navTitle:"training_management.title",
        navSubTitle:"Management of base informaton related to training."
      },
      {
        path: "/provider",
        name: "Providers",
        miniName: "R",
        component: Providers,
        layout: "/admin",
        navTitle:"training_management.title",
        navSubTitle:"Management of base informaton related to training."
      },
      {
        path: "/directory",
        name: "Directory",
        miniName: "L",
        component: Directory,
        layout: "/admin",
        navTitle:"training_management.title",
        navSubTitle:"Management of base informaton related to training."
      },
      {
        path: "/elearning",
        name: "eLearning",
        miniName: "T",
        component: Profile,
        layout: "/admin",
        navTitle:"Job Competency Profile",
        navSubTitle:"system_administration.subtitle related to Competency"
      },
      {
        path: "/itest",
        name: "iTEST",
        miniName: "P",
        component: Profile,
        layout: "/admin",
        navTitle:"",
        navSubTitle:""
      },
      {
        path: "/comp-specific",
        name: "Company-Specific Content",
        miniName: "RS",
        component: CompSpecific,
        layout: "/admin",
        navTitle:"",
        navSubTitle:""
      },
      {
        path: "/training-sched",
        name: "Training Schedule",
        miniName: "RS",
        component: TrainingSched,
        layout: "/admin",
        navTitle:"",
        navSubTitle:""
      },
      {
        path: "/training-budget",
        name: "Training Budget",
        miniName: "RS",
        component: TrainingBudget,
        layout: "/admin",
        navTitle:"",
        navSubTitle:""
      },
    ],
  },
  {
    path: "/reports",
    name: "reports.title",
    icon: "fas fa-file-invoice SidebarIcon",
    component: CompAssess,
    layout: "/admin",
    navTitle:"",
    navSubTitle:""
  },
  {
    collapse: true,
    name: "competency_management.title",
    icon: "fas fa-file-signature SidebarIcon",
    state: "componentsCollapse",
    views: [
      {
        path: "/functions",
        name: "Functions",
        miniName: "B",
        component: Function,
        layout: "/admin",
        navTitle:"competency_management.title",
        navSubTitle:"Management of competency base information"
      },
      {
        path: "/competency-units",
        name: "Competency Units",
        miniName: "C",
        component: CompetencyUnits,
        layout: "/admin",
        navTitle:"competency_management.title",
        navSubTitle:"system_administration.subtitle related to Competency"
      },
      {
        path: "/elements",
        name: "Elements",
        miniName: "G",
        component: Element,
        layout: "/admin",
        navTitle:"competency_management.title",
        navSubTitle:"system_administration.subtitle related to Elements"
      },
      {
        path: "/assessment-criteria",
        name: "Assessment Criteria",
        miniName: "N",
        component: AssessCriteria,
        layout: "/admin",
        navTitle:"",
        navSubTitle:""
      },
      {
        path: "/icons",
        name: "Matrix",
        miniName: "I",
        component: Matrix,
        layout: "/admin",
        navTitle:"",
        navSubTitle:""
      },
    ],
  },
  {
    collapse: true,
    name: "system_administration.title",
    icon: "fas fa-cogs SidebarIcon",
    state: "formsCollapse",
    views: [
      {
        path: "/crews",
        name: "Crews",
        miniName: "C",
        component: Crew,
        layout: "/admin",
        navTitle:"system_administration.title",
        navSubTitle:"system_administration.subtitle"
      },
      {
        path: "/loc-type",
        name: "Location Types",
        miniName: "E",
        component: LocType,
        layout: "/admin",
        navTitle:"system_administration.title",
        navSubTitle:"system_administration.subtitle"
      },
      {
        path: "/location",
        name: "Locations",
        miniName: "C",
        component: Location,
        layout: "/admin",
        navTitle:"system_administration.title",
        navSubTitle:"system_administration.subtitle"
      },
      {
        path: "/loc-group",
        name: "Location Groups",
        miniName: "",
        component: LocGroup,
        layout: "/admin",
        navTitle:"system_administration.title",
        navSubTitle:"system_administration.subtitle"
      },
      {
        path: "/division",
        name: "Divisions",
        miniName: "D",
        component: Division,
        layout: "/admin",
        navTitle:"system_administration.title",
        navSubTitle:"system_administration.subtitle"
      },
      {
        path: "/department",
        name: "Departments",
        miniName: "",
        component: Department,
        layout: "/admin",
        navTitle:"system_administration.title",
        navSubTitle:"system_administration.subtitle"
      },
      {
        path: "/position",
        name: "Positions",
        miniName: "",
        component: Position,
        layout: "/admin",
        navTitle:"system_administration.title",
        navSubTitle:"system_administration.subtitle"
      },
      {
        path: "/company",
        name: "Company",
        miniName: "",
        component: Company,
        layout: "/admin",
        navTitle:"system_administration.title",
        navSubTitle:"system_administration.subtitle"
      },
      {
        path: "/access-level",
        name: "Access Levels",
        miniName: "",
        component: AccessLevel,
        layout: "/admin",
        navTitle:"system_administration.title",
        navSubTitle:"system_administration.subtitle"
      },
    ],
  },
];

export default routes;
