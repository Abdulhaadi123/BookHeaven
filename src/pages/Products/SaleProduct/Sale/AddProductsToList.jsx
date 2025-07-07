import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SaleProduct.css';
import toast from 'react-hot-toast';

const AddProductToList = () => {
    const userId = localStorage.getItem("userID");
    const navigate = useNavigate();
    const location = useLocation();
    const { products, customerName, phoneNo } = location.state || {};
    const product = products[0];

    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(product.productId.price);
    const [total, setTotal] = useState(product.productId.price);
    const [discount, setDiscount] = useState(0);
    const [grandTotal, setGrandTotal] = useState(product.price);
    const [color, setColor] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [availableQuantity, setAvailableQuantity] = useState();

    // Fetch all colors and quantities for the product
    useEffect(() => {
        setAvailableQuantity(product.quantity);
        setSelectedColor(product.colorId.name);
        setColor(product.colorId)
        setPrice(product.productId.price);
    }, [product]);

    const handleQuantityChange = (selectedQuantity) => {
        const totalAmount = selectedQuantity * product.productId.price;
        setQuantity(selectedQuantity);
        setTotal(totalAmount);
        setGrandTotal(discount ? totalAmount - discount : totalAmount);
    };

    const handleDiscountChange = (discountValue) => {
        setDiscount(discountValue);
        setGrandTotal(total - discountValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const saleProduct = {
            customerName,
            phoneNo,
            productName: product.productId.productName,
            productId: product.productId._id,
            grandTotal,
            productCode: product.productId.productCode,
            color,
            category: product.category,
            availableQuantity,
            discount,
            quantity,
            total,
        };

        try {
            const sale = {
                generatedBy: userId,
                grandTotal,
                products: [saleProduct],
            };

            const currentSalesData = JSON.parse(localStorage.getItem('salesData')) || [];
            const updatedSalesData = [...currentSalesData];
            const existingProductIndex = updatedSalesData.findIndex(p => p.productId === saleProduct.productId && p.color === saleProduct.color);

            if (existingProductIndex >= 0) {
                // Update quantity if the product already exists with the same color
                updatedSalesData[existingProductIndex].quantity += saleProduct.quantity;
                updatedSalesData[existingProductIndex].total += saleProduct.total;
            } else {
                // Otherwise, add the new product
                updatedSalesData.push(saleProduct);
            }

            // Save updated sales data to local storage
            localStorage.setItem('salesData', JSON.stringify(updatedSalesData));

            toast.success('Product added to list!');
            navigate('/admin/sell-product', { state: { name: customerName, phone: phoneNo, availableQuantity } });
        } catch (error) {
            console.error('Error generating sale:', error);
        }
    };

    return (
        <div className="generate-invoice-container">
            <h2>Generate Invoice</h2>
            <form onSubmit={handleSubmit} className="invoice-form">
                <div className="form-group">
                    <label>Customer Name:</label>
                    <input type="text" defaultValue={customerName} disabled />
                </div>
                <div className="form-group">
                    <label>Phone Number:</label>
                    <input type="text" defaultValue={phoneNo} disabled />
                </div>
                <div className="product-info">
                    <h3>Product Details</h3>
                    <div className="form-group">
                        <label>Product Name:</label>
                        <input type="text" defaultValue={product.productId.productName} disabled />
                    </div>
                    <div className="form-group">
                        <label>Selected Color:</label>
                        <input type="text" defaultValue={product.colorId.name} disabled />
                    </div>
                    <div className="form-group">
                        <label>Available Quantity:</label>
                        <input type="number" value={availableQuantity || 0} disabled />
                    </div>
                    <div className="form-group">
                        <label>Price:</label>
                        <input type="number" defaultValue={price} disabled />
                    </div>
                    <div className="form-group">
                        <label>Quantity:</label>
                        <input
                            type="number"
                            value={quantity}
                            min="1"
                            max={availableQuantity || 0}
                            onChange={(e) => handleQuantityChange(Number(e.target.value))}
                        />
                    </div>
                    <div className="form-group">
                        <label>Total:</label>
                        <input type="text" value={total} disabled />
                    </div>
                </div>
                <div className="form-group">
                    <label>Discount Amount:</label>
                    <input
                        type="number"
                        placeholder="Enter discount amount"
                        value={discount}
                        onChange={(e) => handleDiscountChange(Number(e.target.value))}
                    />
                </div>
                <div className="form-group">
                    <label>Grand Total:</label>
                    <input type="number" value={grandTotal} disabled />
                </div>
                <button type="submit" className="generate-invoice-submit">Add Product to List</button>
            </form>
        </div>
    );
};

export default AddProductToList;
