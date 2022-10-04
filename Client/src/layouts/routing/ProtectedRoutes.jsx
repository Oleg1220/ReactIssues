import React, { useContext,useState} from "react";
import { Outlet, useLocation,Navigate } from "react-router-dom";
import {UserContext} from '../../App'

import routes from "routes.js";
function diff_hours(dt2, dt1) 
 {

  var diff =(dt2 - dt1) / 1000;
  diff /= (60 * 60);
  return Math.abs(Math.round(diff));
  
 }
 

const useAuth = () =>{
    const {user,setUser} = useContext(UserContext);
   
    const session = localStorage.getItem('userData');    
    // await verifyToken(session,function(is_verify){
    //     if(!is_verify){
    //         console.log("Not Verify");
    //         localStorage.removeItem('userData');
    //         setUser(
    //             {
    //               loggedIn:false,
    //               fullname: "",
    //               admin_id: "",
    //               email :  "",
    //               rank: "",
    //               tl_id: "",
    //               token:"",
    //               token_creation:""
    //             }
    //           );  
    //         window.location.reload();
    //         return false;
    //     }else{
    //         console.log("Verify");
    //     }
    
    // });

   
    if(session){
        const session_data = JSON.parse (atob (session) ) ;
       
        const current_time= new Date().getTime();
        const token_time = new Date(session_data.token_creation).getTime();
       
        const hours_passed= diff_hours(current_time,token_time);
        //console.log(hours_passed);  
        if(hours_passed >= 3){
            localStorage.removeItem('userData');
            setUser(
                {
                  loggedIn:false,
                  fullname: "",
                  admin_id: "",
                  email :  "",
                  rank: "",
                  tl_id: "",
                  token:"",
                  token_creation:""
                }
              );  
            return false;
        }
        if(session_data.loggedIn && !user.loggedIn){
            
          var current_title = "";
          var current_subtitle = "";
          routes.map((prop, key) => {
            if (prop.redirect) {
            
            }
            if (prop.collapse) {
              
              prop.views.map((prop2,key2)=>{
                if(window.location.pathname.indexOf(prop2.layout + prop2.path) > -1){
                  current_title = prop2.navTitle
                  current_subtitle = prop2.navSubTitle                  
                }
              })
            }
            else{              
              if(window.location.pathname.indexOf(prop.layout + prop.path) > -1){
                current_title = prop.navTitle
                current_subtitle = prop.navSubTitle
              }
            }
           
            
          });

            setUser({...session_data,navTtl:current_title,navSubttl:current_subtitle});
            return session_data.loggedIn;
        }

        else if(!session_data.loggedIn && user.loggedIn ){
          
            localStorage.setItem('userData', btoa( JSON.stringify(user)));
            return user.loggedIn;
        }
        

        // setUser();
    }else{
        localStorage.setItem('userData', btoa( JSON.stringify(user)));
    }
   
    return user.loggedIn;
}

 const verifyToken= async (session,callback)=>{
    if(!session){
        return false;
    }
    const session_data = JSON.parse (atob (session) ) ;
    const payload = { token:session_data.token,_id:session_data.admin_id };


      await fetch(window.base_api+`verify-token/`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
      }).then(async response => {
        // Your response to manipulate
        const records =await response.json();

        //console.log(records);                
        if(records.remarks=="success"){
            callback(true);
        }else{
            callback(false);             
        }
      })
      .catch(error => {          
        callback(false);
      }); 
}
function  ProtectedRoutes(){

    const location = useLocation();
    const isAuth =  useAuth();
    
    //IF not logged in redirect to login page
    return isAuth ?     <Outlet/> : <Navigate to="/login" replace state = {{from:location}}/>

}


export default ProtectedRoutes