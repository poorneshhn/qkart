import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";


const ProductCard = ({ product, handleAddToCart }) => {
  
  return (
    <Card className="card">
      <CardMedia
        component="img"
        height="140"
        image={product.image}
        alt="Video"
      />
      <CardContent>
        <Typography gutterBottom variant="h5">
          {product.name}
        </Typography>
        <Typography gutterBottom variant="h5" fontWeight="700">${product.cost}</Typography>
        <Rating value={product.rating} readOnly/>
        <CardActions>

        <Button 
         className="button"
         variant="contained"
         fullWidth
         name="add to cart"
         onClick={ handleAddToCart }
         >
          <AddShoppingCartOutlined/>{" "} ADD TO CART
        </Button>
         </CardActions>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
