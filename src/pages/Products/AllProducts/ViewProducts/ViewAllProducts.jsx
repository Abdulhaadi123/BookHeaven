import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './AllProduct.css';
import CustomTable from '../../../../components/customComponents/customTable';
import { fetchProducts } from '../../../../actions/productAction';

const ViewAllProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, products, error } = useSelector((state) => state.productData);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // const handleAddProduct = () => {
  //   navigate('/Add-Product');
  // };

  const columns = [
    { header: 'Product Name', accessorKey: 'productId.productName' },
    { header: 'Product Code', accessorKey: 'productId.productCode' },
    { 
      header: 'Color',
      cell: ({ row }) => row.original.colorId?.name || 'N/A',
    },
    { 
      header: 'Category',
      accessorKey: 'category',
    },
    { 
      header: 'Price',
      accessorKey: 'productId.price',
      cell: ({ row }) => `${row.original.productId.price?.toFixed(2)}` || 'N/A',
    },
    { 
      header: 'Quantity',
      accessorKey: 'quantity',
    },
  ];

  return (
    <div className="view-all-products-container">
      <h2 className="view-all-products-title">All Products</h2>
      {/* <button className="add-product-button" onClick={handleAddProduct}>
        Add New Product
      </button> */}
      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <p>Error fetching products: {error}</p>
      ) : (
        <CustomTable columns={columns} data={products} />
      )}
    </div>
  );
};

export default ViewAllProducts;
