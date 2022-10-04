import React , { useState,useMemo }from 'react'
import PDFViewer from 'pdf-viewer-reactjs'
import CustModal from "components/Modals/CustModal";
import CustButton from "components/Buttons/CustButton";
import {
  Col,
  Container,
  Row,

} from "reactstrap";
var  totalPage=1
const ViewPDF = (props) => {
  const {_stateBool, _onclick, file,modalTitle} =props;
  const [page,setPage]= useState(1);
  const [scale,setScale]= useState(1);
  const pdfUrl = useMemo(() => ({ url:  file }));
  if(!modalTitle){
    modalTitle = "View PDF"
  }
  function prevPage(curr_page){
    if(curr_page > 1){
      setPage(curr_page-1);
      checkButtons(curr_page-1)
    }else{
      checkButtons(curr_page)
    }
  
  }
  function nextPage(curr_page){
    if(curr_page<totalPage ){
      setPage(curr_page+1);
      checkButtons(curr_page+1)
    }
    else{
      checkButtons(curr_page)
    }
  
  }
  function checkButtons(curr_page){
    var div = document.getElementById("prevPDF");
    var div2 = document.getElementById("nextPDF");
    console.log(curr_page);
    if(curr_page <=1 ){
     
      div.classList.add("disabled");

    }
    else{
      div.classList.remove("disabled");
    }
    if(curr_page >= totalPage ){
     
      div2.classList.add("disabled");

    }
    else{
      div2.classList.remove("disabled");
    }



  }
  function getMaxCount(e){
   var div =  document.getElementById("totalPage");
   div.innerHTML = e;
   totalPage =e;
   checkButtons(page)
   //Resizing pdf viewer to remove white space
   var div =  document.getElementsByClassName("container text-center");
   div[0].children[1].children[0].children[1].children[0].children[0].style.height="800px"
    
  }
  function zoomIn(new_scale){
    if(new_scale < 3){
      setScale(new_scale+1)
    }
    checkZoomButtons(new_scale+1)
  }
  function zoomOut(new_scale){
   if(new_scale>1){
    setScale(new_scale-1)
   }
   checkZoomButtons(new_scale-1)
  }
  function checkZoomButtons(new_scale){
    var div = document.getElementById("zoomOutPDF");
    var div2 = document.getElementById("zoomInPDF");
    if(new_scale <=1 ){
     
      div.classList.add("disabled");

    }
    else{
      div.classList.remove("disabled");
    }
    if(new_scale >= 3 ){
     
      div2.classList.add("disabled");

    }
    else{
      div2.classList.remove("disabled");
    }



  }
  return (
    <CustModal  
      _modalTitle={modalTitle} 
      _modalId="editLoc" 
      _state={_onclick} 
      _size="lg" 
      _stateBool={_stateBool}
    >
      <Row>
        <Col sm="3">
         
        </Col>
      <Col sm="7">
        <Row>
          <Col sm="4">
            <CustButton
              _text="<"
              _classes="disabled"
              _id={`prevPDF`}
              _type="button"
              _color="primary"
              _disabled={false}
              _size="cust-md"
              _onClick={(e)=>prevPage(page)}
            />
          </Col>
          <Col sm="4">
            <span id="pageNumber">
              {page}/  
              <span id="totalPage">1
              </span>              
            </span>
          </Col>
          <Col sm="4">
            <CustButton
              _text=">"
              _classes={totalPage>1?null:"disabled"}
              _id={`nextPDF`}
              _type="button"
              _color="primary"
              _disabled={false}
              _size="cust-md"
              _onClick={(e)=>nextPage(page)}
            />
          </Col>
        </Row>
      </Col>
      <Col sm="2">
      <Row>
          <Col sm="4">
            <CustButton
              _text=""
              _classes="disabled"
              _id={`zoomOutPDF`}
              _type="button"
              _icon="fas fa-search-minus"
              _color="primary"
              _disabled={false}
              _size="cust-md"
              _onClick={(e)=>zoomOut(scale)}
            />
          </Col>
          <Col sm="4">
            <CustButton
            
                _text=""
                _id={`zoomInPDF`}
                _type="button"
                _color="primary"
                _icon="fas fa-search-plus"
                _disabled={false}
                _size="cust-md"
                _onClick={(e)=>zoomIn(scale)}
              />
          </Col>
          </Row>
      </Col>
      </Row>
      <PDFViewer
        document={{
          url:pdfUrl.url,
         
      }} 

      navbarOnTop={true}
      hideNavbar={true}
      hideZoom={true}
      hideRotation={true}
      page={page}
      scale={scale}
      externalInput={true}
        getMaxPageCount={(e)=>getMaxCount(e)}
      >
   
      </PDFViewer>

    
    </CustModal> 

)
   

}

export default ViewPDF