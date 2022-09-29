import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import { Button, IconButton, Stack } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css";

export const generateCartItemsFrom = (cartData, productsData) => {

  let newCartProducts = [];

  productsData.map((item) => {
     cartData.map(cartItem => {
      if (cartItem.productId === item._id) {
        newCartProducts.push({...item, qty: cartItem.qty});
      }
    })
  });

 
  
  return newCartProducts;
};

export const getTotalCartValue = (items = []) => {

  const totalValue = items.reduce(
    (total, item) => total + item.cost * item.qty,
    0
  );

  return totalValue;
};

const ItemQuantity = ({ value, handleAdd, handleDelete }) => {
  return (
    <Stack direction="row" alignItems="center">
      <IconButton size="small" color="primary" onClick={handleDelete}>
        <RemoveOutlined />
      </IconButton>
      <Box padding="0.5rem" data-testid="item-qty">
        {value}
      </Box>
      <IconButton size="small" color="primary" onClick={handleAdd}>
        <AddOutlined />
      </IconButton>
    </Stack>
  );
};

const Cart = ({
  products,
  items = [],
  handleQuantity,
  isReadOnly
}) => {
  const history = useHistory();

  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box className="cart">
        <Box
          padding="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexDirection="column"
        >
          {items.map((item) => {
            return (
              <Box display="flex" alignItems="flex-start" padding="1rem" key={item._id} style={{width: "100%"}}>
                <Box className="image-container">
                  <img
                    src={item.image}
                    alt=""
                    width="100%"
                    height="100%"
                  />
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  justifyContent="space-between"
                  height="6rem"
                  paddingX="1rem"
                >
                  <div>{item.name}</div>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    {
                      isReadOnly ? (`Qty: ${item.qty}`):
                    <ItemQuantity
                      value={item.qty}
                      handleAdd={() => handleQuantity( localStorage.getItem("token"), items, products, item._id, 1, { preventDuplicate: false, operation: "add" } )}
                      handleDelete={() => handleQuantity (localStorage.getItem("token"), items, products, item._id, 1, { preventDuplicate: false, operation: "delete" } )}
                    />
                  }

                    <Box padding="0.5rem" fontWeight="700">
                      ${item.cost}
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })}

          <Box
          style={{width: "100%"}}
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
          >
            <Box color="#3C3C3C" alignSelf="center">
              Order total
            </Box>
            <Box
              color="#3C3C3C"
              fontWeight="700"
              fontSize="1.5rem"
              alignSelf="center"
              data-testid="cart-total"
            >
              ${getTotalCartValue(items)}
            </Box>
          </Box>
        </Box>

{
  !isReadOnly && <Box display="flex" justifyContent="flex-end" className="cart-footer">
          <Button
            color="primary"
            variant="contained"
            startIcon={<ShoppingCart />}
            className="checkout-btn"
            onClick={() => history.push("/checkout")}
          >
            Checkout
          </Button>
        </Box>
}
      </Box>
    </>
  );
};

export default Cart;
