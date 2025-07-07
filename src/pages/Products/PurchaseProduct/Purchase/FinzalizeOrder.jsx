import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../../../axios/axiosInstance";

const GenerateInvoice = () => {
  const userId = localStorage.getItem("userID");
  const navigate = useNavigate();
  const location = useLocation();
  const { products, purchaserName, phoneNo } = location.state || {};
  const product = products[0];

  const [newQuantity, setNewQuantity] = useState(1);
  const [colors, setColors] = useState(null);
  const [price, setPrice] = useState(product.price);
  const [newPrice, setNewPrice] = useState(product.price);
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    setPrice(product.price);
    fetchColors();
  }, [product]);

  const fetchColors = async () => {
    try {
      const response = await axiosInstance.get("/Color/get");
      setColors(response.data.data);
    } catch (error) {
      console.error("Error fetching colors:", error);
    }
  };

  const handleQuantityChange = (selectedQuantity) => {
    setNewQuantity(selectedQuantity);
  };
  const handlePriceChange = (newPrice) => {
    setNewPrice(newPrice);
  };

  const handleColorChange = (event) => {
    const selectedColorId = event.target.value;
    const colorObj = colors.find((color) => color._id === selectedColorId);
    setSelectedColor(colorObj);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedColor) {
      toast.error("Please select a color.");
      return;
    }

    // Fetch existing purchase data from localStorage
    const currentPurchaseData =
      JSON.parse(localStorage.getItem("purchaseData")) || [];

    // Check if the product with the same color has already been added
    const isDuplicate = currentPurchaseData.some(
      (item) =>
        item.productId === product._id && item.color._id === selectedColor._id
    );

    if (isDuplicate) {
      toast.error(
        "This product with the selected color has already been added to the list."
      );
      return;
    }

    const purchaseProduct = {
      purchaserName,
      phoneNo,
      productName: product.productName,
      productId: product._id,
      price,
      newPrice,
      newQuantity,
      color: selectedColor,
      uniqueId: `${product._id}-${selectedColor._id}-${newQuantity}`,
    };

    try {
      // Add the new product to the purchase list
      const updatedPurchaseData = [...currentPurchaseData, purchaseProduct];
      localStorage.setItem("purchaseData", JSON.stringify(updatedPurchaseData));

      toast.success("Product added to list!");
      navigate("/Purchase-List", {
        state: { name: purchaserName, phone: phoneNo },
      });
    } catch (error) {
      console.error("Error generating sale:", error);
      toast.error("Failed to add product to the list.");
    }
  };

  return (
    <div className="generate-invoice-container">
      <h2>Add Purchase to List</h2>
      <form onSubmit={handleSubmit} className="invoice-form">
        <div className="product-info">
          <div className="form-group">
            <label>Product Name:</label>
            <input type="text" defaultValue={product.productName} disabled />
          </div>
          <div className="form-group">
            <label>Current Price:</label>
            <input type="number" defaultValue={price} disabled />
          </div>
          <div className="form-group">
            <label>Quantity:</label>
            <input
              type="number"
              value={newQuantity}
              min="1"
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>New Price:</label>
            <input
              type="number"
              value={newPrice}
              min="1"
              onChange={(e) => handlePriceChange(Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>Color:</label>
            <select
              value={selectedColor?._id || ""}
              onChange={handleColorChange}
            >
              <option value="">Select a color</option>
              {colors?.map((color) => (
                <option key={color._id} value={color._id}>
                  {color.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button type="submit" className="generate-invoice-submit">
          Add Purchase to List
        </button>
      </form>
    </div>
  );
};

export default GenerateInvoice;
