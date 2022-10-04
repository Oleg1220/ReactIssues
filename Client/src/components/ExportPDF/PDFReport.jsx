import React from 'react'

import jsPDF from "jspdf";
import "jspdf-autotable";

  const exportPDF =(htdata,f)=>{
      const doc = new jsPDF('p', 'pt', 'letter');     
      console.log(htdata);
      doc.html(htdata,{
        callback: function(doc){
          doc.save(f+".pdf");
        },
        margin: [10, 10, 10, 10]
      });
            
  }

function PDFReport(props) {

  const {html_data,file_name,id , btn_style} = props

  return (
    <div>
        <button id={id} className={btn_style} onClick={() => exportPDF(html_data,file_name)}>Generate Report</button>
    </div>
  )
}

export default PDFReport