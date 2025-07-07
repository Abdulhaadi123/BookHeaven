import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import axiosInstance from '../../../../axios/axiosInstance';
import toast from 'react-hot-toast';

const PreviewInvoice = () => {
  const { id } = useParams(); 
  const [sale, setSale] = useState(null);
  const printRef = useRef(); // Ref for the printable content

  // Fetch the specific invoice details
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axiosInstance.get(`/Sale/get/${id}`);
        if (response.data.length > 0) {
          setSale(response.data[0]); // Assuming response.data is an array
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
    documentTitle: `Invoice_${sale?.customerName || 'Customer'}`,
    onBeforeGetContent: () => {
      if (!printRef.current) {
        toast.error("Invoice content is not available.");
        return null;
      }
    },
  });

  if (!sale) {
    return <div>Loading...</div>;
  }

  return (
    <div className="preview-invoice-container">
      {/* Printable invoice template */}
      <div ref={printRef} className="invoice-template">
        <h3>{`${sale?.customerName || 'Customer'}`}'s Invoice</h3>
        <p>Customer Name: {sale.customerName}</p>
        <p>Date of Sale: {new Date(sale.createdAt).toLocaleDateString('en-US')}</p>
        <p>Phone Number: {sale.phoneNo}</p>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.products?.map((product, index) => (
              <tr key={index}>
                <td>{product.productName}</td>
                <td>{product.quantity}</td>
                <td>{product.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h4>Grand Total: {sale.grandTotal}</h4>
      </div>

      {/* Print button */}
      <button className="print-button" onClick={handlePrint}>
        Print Invoice
      </button>
    </div>
  );
};

export default PreviewInvoice;
