import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../../../axios/axiosInstance';
import CustomTable from '../../../../components/customComponents/customTable';
import { FaFileInvoice } from 'react-icons/fa';
import './SaleProduct.css';

const Products = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { customerName, phoneNo, existingProducts = [] } = location.state || {};
  

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await axiosInstance.get('/Location/get');

        // Fetch categories for all products
        const locationsWithCategory = await Promise.all(
          response.data.map(async (location) => {
            const categoryResponse = await axiosInstance.get(
              `/ProductCategory/get/${location.productId.categoryId}`
            );

            return {
              ...location,
              category: categoryResponse.data.name,
            };
          })
        );

        setLocations(locationsWithCategory);
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  const handleSelectProduct = (productLocation) => {
    navigate('/admin/generate-sale', {
      state: {
        products: [productLocation],
        customerName,
        phoneNo
      },
    });
  };

  const columns = [
    { header: 'Product Name', accessorKey: 'productId.productName' },
    { header: 'Product Code', accessorKey: 'productId.productCode' },
    { header: 'Color', accessorKey: 'colorId.name' },
    { header: 'Category', accessorKey: 'category' },
    { header: 'Price', accessorKey: 'productId.price', cell: (info) => `${info.getValue().toFixed(2)}` },
    { header: 'Quantity', accessorKey: 'quantity' },
    {
      header: 'Invoice',
      accessorKey: 'invoice',
      cell: ({ row }) => (
        <FaFileInvoice
          className="invoice-icon"
          style={{ cursor: 'pointer', color: '#007bff' }}
          onClick={() => handleSelectProduct(row.original)}
          title="Generate Invoice"
        />
      ),
    },
  ];

  if (loading) return <p>Loading locations...</p>;

  return (
    <div className="products-container">
      <h1>All Product Locations</h1>
      <CustomTable columns={columns} data={locations} />
    </div>
  );
};

export default Products;
