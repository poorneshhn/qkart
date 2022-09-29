import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import Cart from "./Cart";
import { generateCartItemsFrom } from "./Cart";
import "./Products.css";

const Products = () => {
  const [productList, setProductList] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(0);
  const [loader, setLoader] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [formatedCartItem, setFormatedCartItem] = useState([]);

  const [cartItems, setCartItems] = useState([]);

  const isLoggedIn = () => {
    const username = localStorage.getItem("username");
    if (username) {
      return username;
    }

    return null;
  };

  const performAPICall = async () => {
    try {
      setLoader(true);
      let url = `${config.endpoint}/products`;
      const res = await axios.get(url);
      setProductList(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoader(false);
    }
  };

  const performSearch = async (text) => {
    try {
      let url = `${config.endpoint}/products/search?value=${text}`;
      setLoader(true);

      const res = await axios.get(url);

      setProductList(res.data);
    } catch (error) {
      setProductList([]);
      console.log(error);
    } finally {
      setLoader(false);
    }
  };

  useEffect(() => {
    if (searchKey === "") {
      performAPICall();
    } else {
      debounceSearch(searchKey, debounceTimeout);
    }
  }, [searchKey]);

  const debounceSearch = (event, debounceTimeout) => {
    if (debounceTimeout !== 0) {
      clearTimeout(debounceTimeout);
    }
    let timer = setTimeout(() => performSearch(event), 500);
    setDebounceTimeout(timer);
  };

  const fetchCart = async (token) => {
    if (!token) return;

    try {
      const res = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCartItems(res.data);
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  useEffect(() => {
    if (isLoggedIn()) {
      const token = localStorage.getItem("token");
      fetchCart(token);
    }
  }, []);

  const isItemInCart = (items, productId) => {
    return items.find((item) => item._id === productId);
  };

  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    try {
      if (!token) {
        enqueueSnackbar("Login to add an item to the Cart", {
          variant: "warning",
        });
        return;
      }

      let data = {
        productId,
        qty: 1,
      };

      let toAdd = [];

      if (isItemInCart(items, productId)) {
        if (options.preventDuplicate) {
          enqueueSnackbar(
            "Item already in cart. Use the cart sidebar to update quantity or remove item.",
            { variant: "warning" }
          );
          return;
        } else {
          toAdd = items.filter((item) => item._id === productId);
        }
      }
      if (toAdd.length !== 0) {
        let value = 1;
        if (options.operation === "delete") {
          value = -1;
        }

        data = {
          productId,
          qty: toAdd[0].qty + value,
        };
      }

      const res = await axios.post(`${config.endpoint}/cart`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // let cart = generateCartItemsFrom(res.data, productList)
      setCartItems(res.data);
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error.response.data.message, { variant: "error" });
    }
  };

  useEffect(() => {
    let item = generateCartItemsFrom(cartItems, productList);
    setFormatedCartItem(item);
  }, [cartItems]);

  return (
    <div className="container">
      <Header hasHiddenAuthButtons={isLoggedIn()}>
        <TextField
          className="search-desktop"
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange={(e) => setSearchKey(e.target.value)}
        />
      </Header>

      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => setSearchKey(e.target.value)}
      />

      <div className="grid-container">
        <div
          className={`grid-container ${
            isLoggedIn() ? "loggedIn" : "loggedOut"
          }`}
        >
          <Grid
            container
            rowSpacing={3}
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            direction="row"
          >
            <Grid item className="product-grid" md={12}>
              <Box className="hero">
                <p className="hero-heading">
                  India’s{" "}
                  <span className="hero-highlight">FASTEST DELIVERY</span> to
                  your door step
                </p>
              </Box>
            </Grid>

            {loader ? (
              <div className="loading">
                <CircularProgress />
                <div>Loading Products</div>
              </div>
            ) : productList.length === 0 ? (
              <div className="loading">
                <SentimentDissatisfied />
                <div>No products found</div>
              </div>
            ) : (
              productList.map((item) => {
                return (
                  <Grid
                    key={item._id}
                    item
                    md={3}
                    xs={6}
                    className="product-grid"
                  >
                    <ProductCard
                      product={item}
                      handleAddToCart={() =>
                        addToCart(
                          localStorage.getItem("token"),
                          formatedCartItem,
                          productList,
                          item._id,
                          1,
                          { preventDuplicate: true }
                        )
                      }
                    />
                  </Grid>
                );
              })
            )}
          </Grid>
        </div>

        <div className="cart-container">
          <Grid
            container
            rowSpacing={3}
            columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            direction="row"
          >
            {isLoggedIn() && (
              <Grid item md={12} sm={12} className="product-grid">
                <Cart
                  products={productList}
                  items={formatedCartItem}
                  handleQuantity={addToCart}
                />
              </Grid>
            )}
          </Grid>
        </div>
      </div>
      <Footer className="products-footer" />
    </div>
  );
};

export default Products;
