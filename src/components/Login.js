import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";

const Login = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loader, setLoader] = useState(false);
  const history = useHistory();

  const data = {
    username,
    password,
  };

  const login = async (formData) => {
    try {
      const validInput = validateInput(formData);

      if (validInput) {
        setLoader(true);

        const res = await axios.post(`${config.endpoint}/auth/login`, formData);

        enqueueSnackbar("Logged in successfully", {
          variant: "success",
        });

        persistLogin(res.data.token, res.data.username, res.data.balance);

        setLoader(false);
        history.push("/");
      }
    } catch (error) {
      setLoader(false);

      if (error?.response?.status === 400) {
        enqueueSnackbar(error.response.data.message, {
          variant: "error",
        });
      } else {
        enqueueSnackbar("Something went wrong", {
          variant: "error",
        });
      }
    }
  };

  const validateInput = (data) => {
    if (data.username.length < 1) {
      enqueueSnackbar("Username is a required field", {
        variant: "warning",
      });

      return false;
    } else if (data.password.length < 1) {
      enqueueSnackbar("Password is a required field", {
        variant: "warning",
      });
      return false;
    }

    return true;
  };

  const persistLogin = (token, username, balance) => {
    localStorage.setItem("username", username);
    localStorage.setItem("balance", balance);
    localStorage.setItem("token", token);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Login</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            placeholder="Enter Password"
          />

          {loader ? (
            <div className="loader">
              <CircularProgress />
            </div>
          ) : (
            <Button
              className="button"
              variant="contained"
              onClick={() => login(data)}
            >
              LOGIN TO QKART
            </Button>
          )}
          <p className="secondary-action">
            Don't have an account?{" "}
            <Link className="link" to="/register">
              Register Now
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
