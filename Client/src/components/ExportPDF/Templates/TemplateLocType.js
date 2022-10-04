export function locationTypeTemplate(title,data,body){
  var pdfdata = JSON.stringify(data);
  // var myList=pdfdata[];
  var image = require("assets/img/brand/logo.png").default;
  var body_fs = "1rem"
  var header_fs = "1.5rem";
  // new Date();
  // new Date(value);
  // new Date(dateString);

  var html =` 
  <head>
  <title></title>
  </head>
  <body>
    <div style="width: 100%">
      <table style="width: 590px;">
        <thead>
          <tr>
            <td style="width: 20% !important;"><img style="height: 50px; width: 100px;" src="${image}" /></td>
            <td style="width: 60% !important; text-align: center; font-size: 30px; color: #174278; font-weight: bold;">${title}</td>
            <td style="width: 20% !important; font-size: 12px; color: #174278; font-weight: bold;"></td>
          </tr>
        </thead>
      </table>
    </div>
    <div style="width: 590px; margin-top: 5px;">
      <table style="width: 100%;">
        <thead>
          <tr>
            <td colspan="2" style="width: 60% !important; text-align: center; font-size: 30px; color: #174278; font-weight: bold;">${title}</td>
          </tr>
          <tr>
            <td style="margin: 0;font-size: ${header_fs}; border-bottom: 1px solid #76787A; font-weight: bold; text-align: center;">Name</th>
            <td style="margin: 0;font-size: ${header_fs}; border-bottom: 1px solid #76787A; font-weight: bold; text-align: center;">Status</th>
          </tr> 
        </thead>
        <tbody>`;
        data.map(element => {
          html += `
          <tr>
            <td style="border-bottom: 1px solid #76787A;"><p style="font-size: ${body_fs};margin-top: 0px; margin-bottom: 0px;">${element.name}</p?</td>
            <td style="border-bottom: 1px solid #76787A;"><p style="font-size: ${body_fs};margin-top: 0px; margin-bottom: 0px;">${element.status==1? "Inactive" : "Active" }</p></td>
          </tr>`
        });
        html += `</tbody>
      </table>    
    </div>
  </body>
  <footer>
  </footer>
      
  </html> 
  `;
  return html;
}