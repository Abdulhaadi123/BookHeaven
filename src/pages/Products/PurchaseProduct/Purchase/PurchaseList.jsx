import React, { useState, useEffect, Fragment, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomTable from '../../../../components/customComponents/customTable';
import axiosInstance from '../../../../axios/axiosInstance';
import { FaTrash } from 'react-icons/fa';
import '../../SaleProduct/Sale/SaleProduct.css';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

const SellProduct = () => {
  const [purchaserName, setPurchaserName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [purchaseData, setPurchaseData] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const userID = localStorage.getItem("userID");
  
  const invoiceRef = useRef(null);

  useEffect(() => {
    // Load sales data from local storage
    const storedPurchaseData = JSON.parse(localStorage.getItem('purchaseData')) || [];
    setPurchaseData(storedPurchaseData);

    // Set customer name and phone if provided from state
    if (location.state && location.state.name && location.state.phone) {
        setPurchaserName(location.state.name);
        setPhoneNo(location.state.phone);
    }
  }, [location.state]);

  const handleDataSubmit = () => {

    navigate('/Products', {
      state: {
        purchaserName,
        phoneNo,
        existingProducts: purchaseData.map((item) => item.productId),
      },
    });
  };


  const handleDeleteProduct = async (uniqueId) => {
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
              const updatedPurchaseData = purchaseData.filter((product) => product.uniqueId !== uniqueId);
              setPurchaseData(updatedPurchaseData);
              localStorage.setItem('purchaseData', JSON.stringify(updatedPurchaseData));
  
                toast.success("Product deleted successfully");
            } catch (error) {
                toast.error("Error deleting the product");
            }
        }
    });
  };

  const handleUpdateProductQuantities = async () => {
    for (const item of purchaseData) {
        try {
            // Fetch the current quantity using productId and colorId
            const { data: location } = await axiosInstance.post('/Location/get/quantity', {
                productId: item.productId,
                colorId: item.colorId,
            });

            const currentQuantity = location?.quantity || 0; // Use 0 if location doesn't exist

            // console.log("current location:", currentQuantity );
            

            // Calculate the new quantity
            const updatedQuantity = currentQuantity + item.newQuantity;
            
            // console.log("new quantity:", item.newQuantity );
            
            // console.log("updated quantity:", updatedQuantity );

            // Update the quantity in the database
            const response = await axiosInstance.post('/Location/update', {
                productId: item.productId,
                colorId: item.color._id,
                quantity: updatedQuantity,
            });

            // console.log(response.data);
            

            // console.log(`Quantity updated successfully for ${item.productName}`);
            toast.success(`Quantity updated successfully for ${item.productName}`);
        } catch (error) {
            if (error.response?.status === 404) {
                // If location doesn't exist, create it with the new quantity
                try {
                    const response = await axiosInstance.post('/Location/update', {
                        productId: item.productId,
                        colorId: item.colorId,
                        quantity: item.newQuantity, // Add new quantity as initial quantity
                    });

                    
            // console.log("non existing response:", response.data );

                    // console.log(`Location created successfully for ${item.productName}`);
                    toast.success(`Location created successfully for ${item.productName}`);
                } catch (creationError) {
                    console.error(`Error creating location for ${item.productName}:`, creationError);
                    toast.error(`Error creating location for ${item.productName}`);
                }
            } else {
                console.error(`Error updating quantity for ${item.productName}:`, error);
                toast.error(`Error updating quantity for ${item.productName}`);
            }
        }
    }
};

  const handleUpdatePrice = async () => {
    for (const item of purchaseData) {
      try {
        const response = await axiosInstance.put(`/Product/updatePrice/${item.productId}`, { price: item.newPrice });
        console.log(response.data);
        
      } catch (error) {
        console.error(`Error updating quantity for ${item.productName}:`, error);
      }
    }
  };

// Print Invoice Functionality
const handlePrint = useReactToPrint({
  content: () => invoiceRef.current, // Pass the ref here
  contentRef: invoiceRef, // Add contentRef here
  documentTitle: 'Invoice',
  onBeforeGetContent: () => {
    if (!invoiceRef.current) {
      toast.error("Invoice content is not available.");
      return null;
    }
  },
});

  // Generate Invoice and Save Sale to Backend
  const handleGenerateInvoice = async () => {
    if (!purchaserName || !phoneNo || purchaseData.length === 0) {
      toast.error('Please fill in Purchaser details and add products.');
      return;
    }

    const purchasePayload = {
      purchaserName,
      phoneNo,
      generatedBy: userID,
      products: purchaseData.map((item) => ({
        productName: item.productName,
        newQuantity: item.newQuantity,
        newPrice: item.newPrice,
      })),
    };
    

    try {
      // handleUpdatePrice();
      handleUpdateProductQuantities();
      handleUpdatePrice();
      
      const response = await axiosInstance.post('/ProductPurchase/new', purchasePayload);
      // console.log(response);
      
      if (response.statusText === 'OK') {
        
        toast.success('Purchase saved successfully!');
        localStorage.removeItem('purchaseData');
        setPurchaseData([]);
        setPurchaserName('');
        setPhoneNo('');
        handlePrint();
      } else {
        toast.error('Failed to save Purchase');
      }
    } catch (error) {
      console.error('Error saving Purchase:', error);
      toast.error('An error occurred while saving the purchase.');
    }
  };

  const columns = [
    { header: 'Purchaser Name', accessorKey: 'purchaserName' },
    { header: 'Phone No', accessorKey: 'phoneNo' },
    { header: 'Product Name', accessorKey: 'productName' },
    { header: 'New Quantity', accessorKey: 'newQuantity' },
    { header: 'Color', accessorKey: 'color.name' },
    { header: 'New Price', accessorKey: 'newPrice' },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <button
          className="delete-icon-button"
          onClick={() => handleDeleteProduct(row.original.uniqueId)}
        >
          <FaTrash />
        </button>
      ),
    },
  ];

  return (
    <Fragment>
      <div className="sell-product-container">
        <h2 className="sell-product-title">Purchase Product</h2>
        <form className="sell-product-form">
          <label className="sell-product-label">
            Purchaser Name:
            <input
              className="sell-product-input"
              type="text"
              value={purchaserName}
              onChange={(e) => setPurchaserName(e.target.value)}
              placeholder="Enter Purchaser's name"
              required
            />
          </label>
          <label className="sell-product-label">
            Phone Number:
            <input
              className="sell-product-input"
              type="tel"
              value={phoneNo}
              onChange={(e) => setPhoneNo(e.target.value)}
              placeholder="Enter phone number"
              required
            />
          </label>
        </form>
        <div className="sell-buttons">
          <button className="sell-product-button" onClick={handleDataSubmit}>
            Select Products
          </button>
          {purchaseData.length > 0 && (
            <>
              <button className="sell-product-button" onClick={handleGenerateInvoice}>
                Generate Invoice
              </button>
              
            </>
          )}
        </div>
      </div>

      {purchaseData.length > 0 && (
        <>
          <h2>Purchase Record</h2>
          <CustomTable columns={columns} data={purchaseData} />
        </>
      )}

      {/* Invoice Template for Printing */}
      { purchaseData.length > 0 &&
      <div ref={invoiceRef} className="invoice-container">
        <h3>Invoice</h3>
        <p>Purchaser Name: {purchaserName}</p>
        <p>Phone Number: {phoneNo}</p>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>New Quantity</th>
              <th>New Price</th>
            </tr>
          </thead>
          <tbody>
            {purchaseData.map((item, index) => (
              <tr key={index}>
                <td>{item.productName}</td>
                <td>{item.newQuantity}</td>
                <td>{item.newPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
}
    </Fragment>
  );
};

export default SellProduct;
