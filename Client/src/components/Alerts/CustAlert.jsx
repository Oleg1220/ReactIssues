import pluralize from 'pluralize';
import React, { useState } from 'react'
import ReactBSAlert from "react-bootstrap-sweetalert";
import toast from 'react-hot-toast';
//pluralize title...
function CustAlert(props) {
    const { type,values,cancelCallback,confirmCallback } = props;
    const alertContent = {
        'deleteSelected' : {
            title: `Are you sure you want to delete the selected ${pluralize(values.title,values.data)}?`,
            subTitle: ``,
            subContent: ``,
            reverseButtons:true,
            confirmBtnBsStyle:"danger",
            confirmBtnText:<div><i className="fas fa-trash"> </i><span>Yes</span></div>,
            cancelBtnBsStyle:"secondary",
            cancelBtnText:<div><i className="fas fa-ban"> </i><span>No</span></div> ,
            alertIcon:<div className="py-3"><i class="fas fa-trash fa-5x text-danger"></i></div> ,

        },
        'delete' : {
            title: `Are you sure you want to delete this ${pluralize(values.title,1)}?`,
            subTitle: values.subTitle ? `${pluralize(values.title,1)} : ${values.subTitle}` : ``,
            subContent: values.subContent,
            reverseButtons:true,
            confirmBtnBsStyle:"danger",
            confirmBtnText:<div><i className="fas fa-trash"> </i><span>Yes</span></div>,
            cancelBtnBsStyle:"secondary",
            cancelBtnText:<div><i className="fas fa-ban"> </i><span>No</span></div> ,
            alertIcon:<div className="py-3"><i class="fas fa-trash fa-5x text-danger"></i></div> ,

        },
        'deleteArchive' : {
            title: `Are you sure you want to permanently delete this ${pluralize(values.title,1)}?`,
            subTitle: values.subTitle ? `${pluralize(values.title,1)} : ${values.subTitle}` : ``,
            subContent: values.subContent,
            reverseButtons:true,
            confirmBtnBsStyle:"danger",
            confirmBtnText:<div><i className="fas fa-trash"> </i><span>Yes</span></div>,
            cancelBtnBsStyle:"secondary",
            cancelBtnText:<div><i className="fas fa-ban"> </i><span>No</span></div> ,
            alertIcon:<div className="py-3"><i class="fas fa-trash fa-5x text-danger"></i></div> ,

        },
        'deleteSelectedArchive' : {
            title: `Are you sure you want to permanently delete the selected ${pluralize(values.title,values.data)}?`,
            subTitle: values.subTitle ? `${pluralize(values.title,1)} : ${values.subTitle}` : ``,
            subContent: values.subContent,
            reverseButtons:true,
            confirmBtnBsStyle:"danger",
            confirmBtnText:<div><i className="fas fa-trash"> </i><span>Yes, Permanently Delete</span></div>,
            cancelBtnBsStyle:"secondary",
            cancelBtnText:<div><i className="fas fa-ban"> </i><span>No</span></div> ,
            alertIcon:<div className="py-3"><i class="fas fa-trash fa-5x text-danger"></i></div> ,

        },
        'restore' : {
            title: `Are you sure you want to restore this ${pluralize(values.title,1)}?`,
            subTitle: values.subTitle ? `${pluralize(values.title,1)} : ${values.subTitle}` : ``,
            subContent: values.subContent,
            reverseButtons:true,
            confirmBtnBsStyle:"default",
            confirmBtnText:<div><i className="fas fa-redo"> </i><span>Yes</span></div>,
            cancelBtnBsStyle:"secondary",
            cancelBtnText:<div><i className="fas fa-ban"> </i><span>No</span></div> ,
            alertIcon:<div className="py-3"><i class="fas fa-redo fa-5x text-default"></i></div> ,

        },
        'restoreSelected' : {
            title: `Are you sure you want to restore the selected ${pluralize(values.title,values.data)}?`,
            subTitle: ``,
            subContent: ``,
            reverseButtons:true,
            confirmBtnBsStyle:"default",
            confirmBtnText:<div><i className="fas fa-redo"> </i><span>Yes</span></div>,
            cancelBtnBsStyle:"secondary",
            cancelBtnText:<div><i className="fas fa-ban"> </i><span>No</span></div> ,
            alertIcon:<div className="py-3"><i class="fas fa-redo fa-5x text-default"></i></div> ,

        },
    }
    
    const trigConfirm = () =>{
        confirmCallback();
    }
    
    return (
        <ReactBSAlert
            title=''
            reverseButtons={alertContent[type].reverseButtons}
            style={{ display: "block", marginTop: "-100px" }}
            onCancel={cancelCallback}
            onConfirm={trigConfirm}
            showCancel
            confirmBtnBsStyle={alertContent[type].confirmBtnBsStyle}
            confirmBtnText={alertContent[type].confirmBtnText}
            cancelBtnBsStyle={alertContent[type].cancelBtnBsStyle}
            cancelBtnText={alertContent[type].cancelBtnText}
            btnSize=""
        >
            {alertContent[type].alertIcon}
            <h2>{alertContent[type].title}</h2>
            <h5 className="text-capitalize text-muted m-0">{alertContent[type].subTitle}</h5>
            <h5 className="text-muted m-0">{alertContent[type].subContent}</h5>
        </ReactBSAlert>
    )
}

export default CustAlert