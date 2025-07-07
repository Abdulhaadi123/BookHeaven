import React, {useState} from 'react'
import toast from 'react-hot-toast';
import axiosInstance from '../../../../axios/axiosInstance';

const AddNewCategory = () => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e) => {
      setName(e.target.value);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (!name) {
        setError('Name is required.');
        return;
      }
  
      try {
        // Add new product
        const response = await axiosInstance.post('/ProductCategory/new', { name });
      //   console.log(response);
        if(response.data.success){
        toast.success('Category added successfully!');
        setName('');
        setError('');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'An error occurred. Please try again.');
        setError(err.response?.data?.message || 'An error occurred. Please try again.');
      }
    };
  
    return (
      <div className="product-form">
        <h2 className="product-form__title">Add New Category</h2>
        {error && <p className="product-form__error">{error}</p>}
        <form onSubmit={handleSubmit} className="product-form__form">
          <label className="product-form__label">
            Category Name:
            <input
              type="text"
              name="colorName"
              value={name}
              onChange={handleChange}
              required
              className="product-form__input"
            />
          </label>
          <button type="submit" className="product-form__button">
            Submit
          </button>
        </form>
      </div>
    );
  };

export default AddNewCategory