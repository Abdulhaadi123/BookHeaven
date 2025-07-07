import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCategories, fetchColors, postLocation, postProduct } from '../../../../actions/productAction';
import toast from 'react-hot-toast';
import '../ViewProducts/AllProduct.css';

const ProductForm = () => {
  const dispatch = useDispatch();
  const { categories } = useSelector((state) => state.productData);

  const [formData, setFormData] = useState({
    productName: '',
    productCode: '',
    categoryId: '',
    price: '',
    quantity: '',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { productName, productCode, categoryId, price} = formData;

    if (!productName || !productCode || !categoryId || !price ) {
      setError('All fields are required.');
      return;
    }

    try {
      const product = await dispatch(postProduct({ productName, productCode, categoryId, price }));
      toast.success('Product added successfully!');
      setFormData({ productName: '', productCode: '', categoryId: '', price: ''});
    } catch (err) { 
      // Display the error message from the server, if available
      const errorMessage = err.response?.data?.message || 'An error occurred. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="product-form">
      <h2 className="product-form__title">Add New Product</h2>
      {error && <p className="product-form__error">{error}</p>}
      <form onSubmit={handleSubmit} className="product-form__form">
      <label className="product-form__label">
        Product Name:
         <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            required
            className="product-form__input"
          />
        </label>
        <label className="product-form__label">
          Product Code:
          <input
            type="text"
            name="productCode"
            value={formData.productCode}
            onChange={handleChange}
            required
            className="product-form__input"
          />
        </label>
        {/* <label className="product-form__label">
          Color:
          <select
            name="colorId"
            value={formData.colorId}
            onChange={handleChange}
            required
            className="product-form__input"
          >
            <option value="">Select Color</option>
            {colors?.map((color) => (
              <option key={color._id} value={color._id}>
                {color.name}
              </option>
            ))}
          </select>
        </label> */}
        <label className="product-form__label">
          Category:
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            className="product-form__input"
          >
            <option value="">Select Category</option>
            {categories?.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="product-form__label">
          Price:
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            className="product-form__input"
          />
        </label>
        {/* <label className="product-form__label">
          Quantity:
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            className="product-form__input"
          />
        </label> */}
        <button type="submit" className="product-form__button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default ProductForm;