import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../../../../components/customComponents/customTable';
import axiosInstance from '../../../../axios/axiosInstance';
import toast from 'react-hot-toast';
import { FaEye } from 'react-icons/fa'; // Import a preview icon

const AllInvoices = () => {
  const [sales, setSales] = useState([]);
  const navigate = useNavigate();

  // Fetch all sales data on component mount
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axiosInstance.get('/Sale/get');
        setSales(response.data);
      } catch (error) {
        toast.error('Failed to load sales data');
      }
    };

    fetchSales();
  }, []);

  // Columns for CustomTable
  const columns = [
    { header: 'Customer Name', accessorKey: 'customerName' },
    { header: 'Phone No', accessorKey: 'phoneNo' },
    { header: 'Total', accessorKey: 'grandTotal' },
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
          onClick={() => navigate(`/preview-invoice/${row.original._id}`)} // Navigate with the invoice ID
        />
      ),
    },
  ];

  return (
    <div className="print-invoices-container">
      <h2>Sale's Invoices</h2>
      <CustomTable columns={columns} data={sales} />
    </div>
  );
};

export default AllInvoices;
