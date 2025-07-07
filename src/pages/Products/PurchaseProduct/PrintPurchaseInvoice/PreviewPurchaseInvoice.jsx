import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import axiosInstance from '../../../../axios/axiosInstance';
import toast from 'react-hot-toast';

const PreviewPurchaseInvoice = () => {
  const { id } = useParams(); 
  const [purchase, setPurchase] = useState(null);
  const printRef = useRef(); // Ref for the printable content

  // Fetch the specific invoice details
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axiosInstance.get(`/ProductPurchase/get/${id}`);
        if (response.data.length > 0) {
          setPurchase(response.data[0]); // Assuming response.data is an array
        } else {
          toast.error('Invoice not found');
        }
      } catch (error) {
        toast.error('Failed to load invoice details');
      }
    };

    fetchInvoice();
  }, [id]);

// Print Invoice Functionality
const handlePrint = useReactToPrint({
    content: () => printRef.current, // Pass the ref here
    contentRef: printRef, // Add contentRef here
    documentTitle: `Invoice_${purchase?.purchaserName || 'Purchaser'}`,
    onBeforeGetContent: () => {
      if (!printRef.current) {
        toast.error("Invoice content is not available.");
        return null;
      }
    },
  });

  if (!purchase) {
    return <div>Loading...</div>;
  }

  return (
    <div className="preview-invoice-container">
      {/* Printable invoice template */}
      <div ref={printRef} className="invoice-template">
        <h3>{`${purchase?.purchaserName || 'Purchaser'}`}'s Purchase Invoice</h3>
        <p>Purchaser Name: {purchase.purchaserName}</p>
        <p>Phone Number: {purchase.phoneNo}</p>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>New Quantity</th>
              <th>New Price</th>
            </tr>
          </thead>
          <tbody>
            {purchase.products?.map((product, index) => (
              <tr key={index}>
                <td>{product.productName}</td>
                <td>{product.newQuantity}</td>
                <td>{product.newPrice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Print button */}
      <button className="print-button" onClick={handlePrint}>
        Print Invoice
      </button>
    </div>
  );
};

export default PreviewPurchaseInvoice;
