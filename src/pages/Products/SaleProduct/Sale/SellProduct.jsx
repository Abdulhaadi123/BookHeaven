import React, { useState, useEffect, Fragment, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CustomTable from "../../../../components/customComponents/customTable";
import { FaTrash } from "react-icons/fa";
import "./SaleProduct.css";
import axiosInstance from "../../../../axios/axiosInstance";
import { useReactToPrint } from "react-to-print";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const SellProduct = () => {
  const [customerName, setCustomerName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [salesData, setSalesData] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");

  const invoiceRef = useRef(null);

  useEffect(() => {
    // Load sales data from local storage
    const storedSalesData = JSON.parse(localStorage.getItem("salesData")) || [];
    setSalesData(storedSalesData);

    // Set customer name and phone if provided from state
    if (location.state && location.state.name && location.state.phone) {
      setCustomerName(location.state.name);
      setPhoneNo(location.state.phone);
    }
  }, [location.state]);
  
  const handlePhoneChange = (e) => {
    const value = e.target.value;
  
    // Allow typing partial input but only keep numeric characters
    if (/^[0-9]*$/.test(value)) {
      setPhoneNo(value);
  
      // Show error for invalid numbers only after full input
      if (value.length === 11 && !/^0[3-9]\d{8}$/.test(value)) {
        toast.error("Please enter a valid Pakistani phone number (e.g., 03001234567).");
      }
    } else {
      toast.error("Only numeric values are allowed.");
    }
  };
  

  const handleDataSubmit = () => {
    navigate("/admin/all-products", {
      state: {
        customerName,
        phoneNo,
        existingProducts: salesData.map((item) => item.productId),
      },
    });
  };

  const handleDeleteProduct = async (productId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Update local state and localStorage after successful delete
          const updatedSalesData = salesData.filter(
            (product) => product.productId !== productId
          );
          setSalesData(updatedSalesData);
          localStorage.setItem("salesData", JSON.stringify(updatedSalesData));

          toast.success("Product deleted successfully");
        } catch (error) {
          toast.error("Error deleting the product");
        }
      }
    });
  };

  const handleUpdateProductQuantities = async () => {
    for (const item of salesData) {
      try {

        const newQuantity = item.availableQuantity - item.quantity;
        await axiosInstance.post("/Location/update", {
          productId: item.productId,
          colorId: item.color._id,
          quantity: newQuantity,
        });
      } catch (error) {
        console.error(
          `Error updating quantity for ${item.productName}:`,
          error
        );
      }
    }
  };

  // Print Invoice Functionality
  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current, // Pass the ref here
    contentRef: invoiceRef, // Add contentRef here
    documentTitle: "Invoice",
    onBeforeGetContent: () => {
      if (!invoiceRef.current) {
        toast.error("Invoice content is not available.");
        return null;
      }
    },
  });

  // Generate Invoice and Save Sale to Backend
  const handleGenerateInvoice = async () => {
    if (!customerName || !phoneNo || salesData.length === 0) {
      toast.error("Please fill in customer details and add products.");
      return;
    }

    const salePayload = {
      customerName,
      phoneNo,
      generatedBy: userID,
      grandTotal: salesData.reduce((acc, item) => acc + item.grandTotal, 0),
      products: salesData.map((item) => ({
        productName: item.productName,
        productCode: item.productCode || "",
        color: item.color.name || "",
        quantity: item.quantity,
        discount: item.discount,
        total: item.grandTotal,
      })),
    };

    try {
      const response = await axiosInstance.post("/Sale/new", salePayload);
      if (response.statusText === "OK") {
        toast.success("Sale saved successfully!");
        localStorage.removeItem("salesData");
        setSalesData([]);
        setCustomerName("");
        setPhoneNo("");
        handleUpdateProductQuantities();
        handlePrint();
      } else {
        toast.error("Failed to save sale");
      }
    } catch (error) {
      console.error("Error saving sale:", error);
      toast.error("An error occurred while saving the sale.");
    }
  };

  const columns = [
    { header: "Customer Name", accessorKey: "customerName" },
    { header: "Phone No", accessorKey: "phoneNo" },
    { header: "Product Name", accessorKey: "productName" },
    { header: "Quantity", accessorKey: "quantity" },
    { header: "Color", accessorKey: "color.name" },
    { header: "Category", accessorKey: "category" },
    { header: "Total Price", accessorKey: "total" },
    { header: "Discount", accessorKey: "discount" },
    { header: "Discounted Price", accessorKey: "grandTotal" },
    {
      header: "Actions",
      cell: ({ row }) => (
        <button
          className="delete-icon-button"
          onClick={() => handleDeleteProduct(row.original.productId)}
        >
          <FaTrash />
        </button>
      ),
    },
  ];

  return (
    <Fragment>
      <div className="sell-product-container">
        <h2 className="sell-product-title">Sell Product</h2>
        <form className="sell-product-form">
          <label className="sell-product-label">
            Customer Name:
            <input
              className="sell-product-input"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer's name"
              required
            />
          </label>
          <label className="sell-product-label">
            Phone Number:
            <input
              className="sell-product-input"
              type="tel"
              value={phoneNo}
              onChange={handlePhoneChange}
              placeholder="e.g., 03001234567"
              maxLength={11} // Restrict maximum length
              required
            />
          </label>
        </form>
        <div className="sell-buttons">
          <button className="sell-product-button" onClick={handleDataSubmit}>
            Select Products
          </button>
          {salesData.length > 0 && (
            <>
              <button
                className="sell-product-button"
                onClick={handleGenerateInvoice}
              >
                Generate Invoice
              </button>
            </>
          )}
        </div>
      </div>

      {salesData.length > 0 && (
        <>
          <h2>Sales Record</h2>
          <CustomTable columns={columns} data={salesData} />
        </>
      )}

      {/* Invoice Template for Printing */}
      {salesData.length > 0 && (
        <div ref={invoiceRef} className="invoice-container">
          <h3>Invoice</h3>
          <p>Customer Name: {customerName}</p>
          <p>Phone Number: {phoneNo}</p>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((item, index) => (
                <tr key={index}>
                  <td>{item.productName}</td>
                  <td>{item.quantity}</td>
                  <td>{item.grandTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h4>
            Grand Total:{" "}
            {salesData.reduce((acc, item) => acc + item.grandTotal, 0)}
          </h4>
        </div>
      )}
    </Fragment>
  );
};

export default SellProduct;
