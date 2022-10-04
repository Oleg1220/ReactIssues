import React, { useCallback, useEffect, useState,useContext } from "react";
import "./Dropzone.css";
import {useDropzone} from 'react-dropzone';
function Dropzones(props) {

  var default_file_type = 
  {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':['.xlsx'],
    'application/vnd.ms-excel': ['.xls']      
  }

  //INIT 
  const [dropState, setDropState] = useState(false);
  const {_style, _pholder, _response, _file_type,_maxfiles,_fileCallback,_file_nameCallBack,_downloadCallback} = props;

  if(_file_type){
    default_file_type=_file_type;
  }
  //#region EVENTS SUCH AS DROP AND X CLICK 
    const onDrop = useCallback((acceptedFiles, rejectFiles) => {

       //WHEN ACCEPTED FILE IS NOT NULL SET DROP STATE TO TRUE
       if(acceptedFiles.length > 0){
        //SET FILE FROM USESTATE OF PARENT USING CALLBACK
       _fileCallback(acceptedFiles);
       _file_nameCallBack(acceptedFiles[0].path);
       setDropState(true);
     }else{
        //SET FILE FROM USESTATE OF PARENT USING CALLBACK
       _fileCallback(null);
       _file_nameCallBack("");
       setDropState(false);
       
     }
          
      // console.log("accepted files", acceptedFiles)
      // console.log("rejected files", rejectFiles)
    }, [])
 

    const toggleDropzone = async (path) => {
      //WHEN X ICON IS CLICKED REMOVED ACCEPTED FILE AND REMOVE FILE ON PARENT USESTATE
     _fileCallback(null);
     await setDropState(false);
     // console.log(path.nativeEvent.target)
   };

  //#endregion
  const {getRootProps, getInputProps, isDragActive, acceptedFiles} = useDropzone(
    {
      onDrop,      
      accept: default_file_type,      
      noKeyboard: true,
      maxFiles: _maxfiles,      
    }
  )
  //DISPLAY FILES
  const files = acceptedFiles.map(file => (
    <li key={file.path}>
      {file.path}  <i className="fas fa-times delbtn" onClick={toggleDropzone}/>
    </li>
  ));

  // Download Template
  const downloadTemplate = ()=>{
    if(_downloadCallback){
      return(
        <div style={{margin: 5,marginTop:20, textAlign:'center'}}>
          <p style={{"font-size":'0.85rem', margin: 5,color:'black',fontWeight:400}}>Always download the template to ensure that the reference is up to date.</p>
          <a style={{"font-size":'0.85rem', color: '#174278', cursor:"pointer"}} onClick={_downloadCallback}>Click here to download the template.</a>
        </div>
      )
    }
  }

  return (
    <>
      <div className="Custdropzone dropHover">
        <div className="Dropzone" style={_style} {...getRootProps()}>
        <span className="droptext">{files.length > 0 && dropState? "": "Choose files to upload."}</span>
        <p style={{"list-style-type":"none"}} className="mb-0 droptext">{files.length > 0 && dropState? files : _pholder}</p>
          <input{...getInputProps()} />
        </div>
      </div>
      {downloadTemplate()}
    </>
  )
}

export default Dropzones;