import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import { useHistory } from "react-router-dom"
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();
  
  const logout = () => {
    // localStorage.removeItem("userdetails");
    localStorage.clear();
    window.location.reload();
  } 

  const HeaderLoggedIn = () => {
    return (     
      <React.Fragment>
          <Avatar src="/public/avatar.png" alt={hasHiddenAuthButtons}/>
        <p style={{display: "flex", alignSelf: "center"}}>{hasHiddenAuthButtons}</p>

        
        <Button
          className="explore-button"
          variant="text"
          onClick={logout}
          >
            LOGOUT
          </Button>
        </React.Fragment>     
    )
  }

  const HeaderLoggedOut = () => {
    return (
      <React.Fragment>
        <Button
          className="explore-button"
          variant="text"
          onClick={() => history.push("/login")}
          >
          LOGIN
        </Button>

          <Button
          className="button"
          variant="contained"
          onClick={() => history.push("/register")}
          >
          REGISTER
          </Button>

      </React.Fragment>
    )
  }

  const PlainHeader = () => {
    return (
        <Button
          className="explore-button"
          startIcon={<ArrowBackIcon />}
          variant="text"
          onClick={() => history.push("/")}
          >
          Back to explore
        </Button>
       
      
    )
  }

  
    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"/>
        </Box>
        {children}
        <Stack direction="row" spacing={2}>
      {
        typeof children === "undefined" ?  <PlainHeader/> : hasHiddenAuthButtons ? <HeaderLoggedIn/> : <HeaderLoggedOut/>
      }
      </Stack>
      </Box>
    )
}

export default Header;
