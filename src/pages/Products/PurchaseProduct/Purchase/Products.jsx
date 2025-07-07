import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomTable from '../../../../components/customComponents/customTable';
import axiosInstance from '../../../../axios/axiosInstance';
import { FaFileInvoice } from 'react-icons/fa';
import '../../SaleProduct/Sale/SaleProduct.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { purchaserName, phoneNo, existingProducts = [] } = location.state || {};

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await axiosInstance.get('/Product/get');
        const productsWithQuantity = await Promise.all(
          response.data.map(async (product) => {
            const quantity = await fetchProductQuantity(product._id);
            // console.log(quantity);
            
            return { ...product, quantity: quantity || 'N/A' };
          })
        );
        setProducts(productsWithQuantity);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const fetchProductQuantity = async (productId) => {
    try {
      const response = await axiosInstance.get(`/Location/get/${productId}`);
      setQuantity(response.data[0]?.quantity);
      
      return response.data[0]?.quantity || 'Not Found';
    } catch (error) {
      console.error(`Error fetching quantity for product ID ${productId}:`, error);
      return 'Error';
    }
  };

  const handleSelectProduct = (product) => {
    navigate('/finalize-purchase', { state: { products: [product], purchaserName, phoneNo } });
  };

  const columns = [
    { header: 'Product Name', accessorKey: 'productName' },
    { header: 'Product Code', accessorKey: 'productCode' },
    { header: 'Price', accessorKey: 'price', cell: (info) => `${info.getValue().toFixed(2)}` },
    {
      header: 'Invoice',
      accessorKey: 'invoice',
      cell: ({ row }) => (
        <FaFileInvoice
          className="invoice-icon"
          style={{ cursor: 'pointer', color: '#007bff' }}
          // disabled={existingProducts.includes(row.original._id)}
          onClick={() => {
            // if (!existingProducts.includes(row.original._id)) {
              handleSelectProduct(row.original);
            // }
          }}
          title="Generate Invoice"
        />
      ),
    },
  ];

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="products-container">
      <h1>All Products</h1>
      <CustomTable columns={columns} data={products} />
    </div>
  );
};

export default Products;