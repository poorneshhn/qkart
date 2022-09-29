import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";
import { useHistory, Link } from "react-router-dom";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loader, setLoader] = useState(false);
  const history = useHistory();

  let data = {
    username,
    password,
    confirmPassword,
  };

  const register = async (formData) => {
    try {
      const result = validateInput(formData);

      if (result) {
        setLoader(true);

        let newData = {
          username: data.username,
          password: data.password,
        };
        const res = await axios.post(
          `${config.endpoint}/auth/register`,
          newData
        );

        enqueueSnackbar("Registered Successfully", {
          variant: "success",
        });

        setLoader(false);
        history.push("/login");
      }
    } catch (error) {
      setLoader(false);

      if (error.message.toLowerCase() === "network error") {
        enqueueSnackbar("Network Error", {
          variant: "error",
        });
      } else {
        enqueueSnackbar("Username is already taken!", {
          variant: "error",
        });
      }
    }
  };

  const validateInput = ({ username, password, confirmPassword }) => {
    if (username.length < 6) {
      enqueueSnackbar(
        "Username is a required field and should have atleast 6 characters!",
        {
          variant: "warning",
        }
      );
      return false;
    } else if (password.length < 6) {
      enqueueSnackbar(
        "Password is a required field and should have atleast 6 characters!",
        {
          variant: "warning",
        }
      );
      return false;
    } else if (password !== confirmPassword) {
      enqueueSnackbar("Passwords do not match!", { variant: "warning" });
      return false;
    } else return true;
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
          <h2 className="title">Register</h2>
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
            helperText="Password must be atleast 6 characters length"
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
          />

          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
          />

          {loader ? (
            <div className="loader">
              <CircularProgress />
            </div>
          ) : (
            <Button
              className="button"
              variant="contained"
              onClick={() => register(data)}
            >
              Register Now
            </Button>
          )}
          <p className="secondary-action">
            Already have an account?{" "}
            <Link className="link" to="/login">
              Login here
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
