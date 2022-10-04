import React, { useContext,useState} from "react";
import { Outlet, useLocation,Navigate ,useNavigate} from "react-router-dom";
import {UserContext} from '../../App'



function diff_hours(dt2, dt1) 
 {

  var diff =(dt2 - dt1) / 1000;
  diff /= (60 * 60);
  return Math.abs(Math.round(diff));
  
 }
 
const useAuth = () =>{
    
    const {user,setUser} = useContext(UserContext);
    const session = localStorage.getItem('userData');
   
    if(session){
        const session_data = JSON.parse (atob (session) ) ;

        const current_time= new Date().getTime();
        const token_time = new Date(session_data.token_creation).getTime();
       
        const hours_passed= diff_hours(current_time,token_time);
        //console.log(hours_passed);  
        if(hours_passed > 3){
            localStorage.removeItem('userData');
            return user.loggedIn;
        }

        if(session_data.loggedIn && !user.loggedIn){
            setUser(session_data);
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

const verifyToken= async (session)=>{
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
            return true;
        }else{
            return false;                 
        }
      })
      .catch(error => {          
        return false;
      }); 
}
const ProtectedLogIn = () => {


    const isAuth = useAuth();

    ////IF logged in redirect to dashboard
    return isAuth ?    <Navigate to="/admin/dashboard"/> :  <Outlet/>
}

export default ProtectedLogIn