import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import axiosInstance from '../../../../axios/axiosInstance';
import toast from 'react-hot-toast';
// import '../styles/saleConsolidateInvoice.css'; // Custom styling
import CustomTable from '../../../../components/customComponents/customTable';

const SaleConsolidateInvoice = () => {
  const [totalSales, setTotalSales] = useState(null); // Consolidated total
  const [salesData, setSalesData] = useState([]); // All sales records
  const printRef = useRef(); // Ref for printable content

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        // Fetch consolidated total
        const consolidatedResponse = await axiosInstance.get('/Sale/consolidated-invoice');
        setTotalSales(consolidatedResponse.data?.consolidatedTotal || 0);

        // Fetch all sales records
        const salesResponse = await axiosInstance.get('/Sale/get');
        setSalesData(salesResponse.data);
      } catch (error) {
        toast.error('Failed to load sales data');
      }
    };

    fetchSalesData();
  }, []);

  // Print functionality
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    contentRef: printRef,
    documentTitle: 'Consolidated_Sales_Invoice',
    onBeforeGetContent: () => {
      if (!printRef.current) {
        toast.error('Invoice content is not available.');
        return null;
      }
    },
  });

  if (totalSales === null || salesData.length === 0) {
    return <div>Loading sales data...</div>;
  }

  // Table columns definition
  const columns = [
    { accessorKey: 'customerName', header: 'Customer Name' },
    { accessorKey: 'phoneNo', header: 'Phone Number' },
    { accessorKey: 'grandTotal', header: 'Total Amount',
      cell: ({ getValue }) => `PKR ${getValue()}` },
    { accessorKey: 'createdAt', header: 'Date',
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString() },
      {
        accessorKey: 'products',
        header: 'Products (xQuantity)_Price',
        cell: ({ getValue }) => {
          const products = getValue();
          return products.map((product, index) => (
            <div key={index}>
              {product.productName} (x{product.quantity}) - PKR {product.total}
            </div>
          ));
        }
      }
  ];

  return (
    <div className="consolidate-invoice-container">
      {/* Printable content */}
      <div ref={printRef} className="invoice-template">
        <h2>Consolidated Sales Invoice</h2>
        <p>Date: {new Date().toLocaleDateString()}</p>
        <h3>Total Sales Amount: PKR {totalSales}</h3>
      </div>

      {/* Print button */}
      <button className="add-product-button" onClick={handlePrint}>
        Print Consolidated Invoice
      </button>

      {/* Sales data table */}
      <div className="sales-table-container">
        <h3>All Sales Records</h3>
        <CustomTable columns={columns} data={salesData} />
      </div>

    </div>
  );
};

export default SaleConsolidateInvoice;
