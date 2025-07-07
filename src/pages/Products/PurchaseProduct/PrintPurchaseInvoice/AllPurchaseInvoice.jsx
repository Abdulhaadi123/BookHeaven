import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../../../../components/customComponents/customTable';
import axiosInstance from '../../../../axios/axiosInstance';
import toast from 'react-hot-toast';
import { FaEye } from 'react-icons/fa';

const AllPurchaseInvoices = () => {
  const [purchase, setPurchase] = useState([]);
  const navigate = useNavigate();

  // Fetch all sales data on component mount
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axiosInstance.get('/ProductPurchase/get');
        setPurchase(response.data);
      } catch (error) {
        toast.error('Failed to load sales data');
      }
    };

    fetchSales();
  }, []);

  // Columns for CustomTable
  const columns = [
    { header: 'Purchaser Name', accessorKey: 'purchaserName' },
    { header: 'Phone No', accessorKey: 'phoneNo' },
    // {
    //     header: 'Product Details',
    //     cell: ({ row }) => {
    //       const products = row.original.products;
    //       if (products.length === 0) return 'N/A';
      
    //       // Join each product's details into a formatted string
    //       return products
    //         .map(
    //           (product) =>
    //             `${product.productName} (New Quantity: ${product.newQuantity}, Price: ${product.newPrice})`
    //         )
    //         .join(', ');
    //     },
    //   },
    {
      header: 'Date',
      accessorKey: 'createdAt',
      cell: ({ getValue }) => {
        const date = new Date(getValue());
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <FaEye
          className="preview-icon"
          style={{ cursor: 'pointer', color: '#007BFF' }}
          onClick={() => navigate(`/preview-purchase-invoice/${row.original._id}`)} // Navigate with the invoice ID
        />
      ),
    },
  ];

  return (
    <div className="print-invoices-container">
      <h2>Purchase's Invoices</h2>
      <CustomTable columns={columns} data={purchase} />
    </div>
  );
};

export default AllPurchaseInvoices;
