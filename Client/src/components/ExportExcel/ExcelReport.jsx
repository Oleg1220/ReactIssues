import React from 'react'
import ReactExport from 'react-data-export';

const multiDataSet = [
    {
        columns: [
            {title: "Something went wrong", width: {wpx: 150}},//pixels width 
            {title: "Could not get exported data", width: {wch: 40}},//char width             
        ],
        data: [
            [
                {value: "", style: {font: {sz: "24", bold: true}}},
                {value: "", style: {font: {bold: true}}},
                {value: ""},
            ]
        ]
    }
];
const default_data = [
    {
        columns: [
            {title: "", width: {wpx: 150}},//pixels width 
            {title: "", width: {wch: 40}},//char width             
        ],
        data: [
            [
                {value: "", style: {font: {sz: "24", bold: true}}},
                {value: "", style: {font: {bold: true}}},
                {value: ""},
            ]
        ]
    }
];
const testDataSet=[  {
    columns: [
        {title: "Headings", width: {wpx: 80}},//pixels width 
        {title: "Text Style", width: {wch: 40}},//char width 
        {title: "Colors", width: {wpx: 90}},
    ],
    data: [
        [
            {value: "H1", style: {font: {sz: "24", bold: true}}},
            {value: "Bold", style: {font: {bold: true}}},
            {value: "Red", style: {fill: {patternType: "solid", fgColor: {rgb: "FFFF0000"}}}},
        ],
        [
            {value: "H2", style: {font: {sz: "18", bold: true}}},
            {value: "underline", style: {font: {underline: true}}},
            {value: "Blue", style: {fill: {patternType: "solid", fgColor: {rgb: "FF0000FF"}}}},
        ],
        [
            {value: "H3", style: {font: {sz: "14", bold: true}}},
            {value: "italic", style: {font: {italic: true}}},
            {value: "Green", style: {fill: {patternType: "solid", fgColor: {rgb: "FF00FF00"}}}},
        ],
        [
            {value: "H4", style: {font: {sz: "12", bold: true}}},
            {value: "strike", style: {font: {strike: true}}},
            {value: "Orange", style: {fill: {patternType: "solid", fgColor: {rgb: "FFF86B00"}}}},
        ],
        [
            {value: "H5", style: {font: {sz: "10.5", bold: true}}},
            {value: "outline", style: {font: {outline: true}}},
            {value: "Yellow", style: {fill: {patternType: "solid", fgColor: {rgb: "FFFFFF00"}}}},
        ],
        [
            {value: "H6", style: {font: {sz: "7.5", bold: true}}},
            {value: "shadow", style: {font: {shadow: true}}},
            {value: "Light Blue", style: {fill: {patternType: "solid", fgColor: {rgb: "FFCCEEFF"}}}}
        ]
    ]
}];


const ExcelReport = (props) => {
    const { btn_style,data,file_name,sheet_name,hideElement,id,guide } = props;
    
    var display_data ;
    if(data.length <=0){
        display_data = multiDataSet;
    }else{
        display_data = data;
    }

    const ExcelFile = ReactExport.ExcelFile;
    const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    
  return (
    <ExcelFile hideElement={hideElement} filename={file_name} element={<button className={btn_style} id={id} >{props.children}</button>}>
        <ExcelSheet dataSet={display_data} name={sheet_name}/>
        {guide?<ExcelSheet dataSet={guide} name="_Guide"/>:<ExcelSheet dataSet={default_data} name="_blank"/>}
    </ExcelFile>
  )
}

export default ExcelReport