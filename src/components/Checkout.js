import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => {
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        onChange={(e) =>
          handleNewAddress({ ...newAddress, value: e.target.value })
        }
        value={newAddress.value}
      />
      <Stack direction="row" my="1rem">
        <Button
          variant="contained"
          onClick={() => addAddress(token, newAddress)}
        >
          Add
        </Button>
        <Button
          variant="text"
          onClick={() => {
            handleNewAddress({ ...newAddress, isAddingNewAddress: false });
          }}
        >
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });

  // Fetch the entire products list
  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);

      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  // Fetch cart data
  const fetchCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  const getAddresses = async (token) => {
    if (!token) return;

    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses({ ...addresses, all: response.data });
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  const addAddress = async (token, newAddress) => {
    try {
      const url = `${config.endpoint}/user/addresses`;
      const data = {
        address: newAddress.value,
      };
      const res = await axios.post(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(res.data);

      setNewAddress({ value: "", isAddingNewAddress: false });
      setAddresses({ ...addresses, all: res.data });
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const deleteAddress = async (token, addressId) => {
    try {
      let url = `${config.endpoint}/user/addresses/${addressId}`;

      const res = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses({ ...addresses, all: res.data });
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  const validateRequest = (items, addresses) => {
    if (addresses.all.length === 0) {
      enqueueSnackbar("Please add a new address before proceeding.", {
        variant: "error",
      });
      return false;
    }
    if (addresses.selected === "") {
      enqueueSnackbar("Please select one shipping address to proceed.", {
        variant: "error",
      });
      return false;
    }
    if (localStorage.getItem("balance") < getTotalCartValue(items)) {
      enqueueSnackbar(
        "You do not have enough balance in your wallet for this purchase.",
        { variant: "error" }
      );
      return false;
    }
    if (items.length === 0) {
      enqueueSnackbar(
        "Add atleast one product to the cart before checking out!",
        { variant: "error" }
      );
      return false;
    }
    return true;
  };

  const performCheckout = async (token, items, addresses) => {
    const validated = validateRequest(items, addresses);

    try {
      if (validated) {
        const url = `${config.endpoint}/cart/checkout`;
        const data = { addressId: `${addresses.selected}` };

        const res = axios.post(url, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        history.push("/thanks");

        enqueueSnackbar("Order placed successfully!", { variant: "success" });
      }
    } catch (error) {
      enqueueSnackbar(error.response.data.message, { variant: "error" });
    }
  };

  useEffect(() => {
    const onLoadHandler = async () => {
      const productsData = await getProducts();

      const cartData = await fetchCart(token);

      if (productsData && cartData) {
        const cartDetails = await generateCartItemsFrom(cartData, productsData);
        setItems(cartDetails);
      }
      await getAddresses(token);
    };
    onLoadHandler();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Header />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            <Box>
              {addresses.all.length === 0 ? (
                <Typography my="1rem">
                  No addresses found for this account. Please add one to proceed
                </Typography>
              ) : (
                addresses.all.map((item, index) => {
                  return (
                    <div
                      key={item._id}
                      className={`address-item not-selected ${
                        addresses.selected === item._id
                          ? "selected"
                          : "not-selected"
                      }`}
                      onClick={() => {
                        setAddresses({ ...addresses, selected: item._id });
                      }}
                    >
                      <Typography>{item.address}</Typography>{" "}
                      <Button
                        variant="outlined"
                        startIcon={<Delete />}
                        onClick={() => deleteAddress(token, item._id)}
                      >
                        DELETE
                      </Button>
                    </div>
                  );
                })
              )}
            </Box>

            {newAddress.isAddingNewAddress ? (
              <AddNewAddressView
                token={token}
                newAddress={newAddress}
                handleNewAddress={setNewAddress}
                addAddress={addAddress}
              />
            ) : (
              <Button
                color="primary"
                variant="contained"
                id="add-new-btn"
                size="large"
                onClick={() => {
                  setNewAddress((currNewAddress) => ({
                    ...currNewAddress,
                    isAddingNewAddress: true,
                  }));
                }}
              >
                Add new address
              </Button>
            )}

            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(items)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              startIcon={<CreditCard />}
              variant="contained"
              onClick={() => performCheckout(token, items, addresses)}
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly={true} products={products} items={items} />
          <Box
            className="order-details"
            display="flex"
            flexDirection="column"
            rowGap="20px"
          >
            <Box>
              <h2>Order Details</h2>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <div>Products</div>
              <div>{items.length}</div>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <div>Subtotal</div>
              <div>${getTotalCartValue(items)}</div>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <div>Shipping Charges</div>
              <div>$0</div>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <h3>Total</h3>
              <h3>${getTotalCartValue(items)}</h3>
            </Box>
          </Box>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;
