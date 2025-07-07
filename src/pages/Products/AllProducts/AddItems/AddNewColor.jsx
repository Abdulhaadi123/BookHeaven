import React, {useState} from 'react';
import axiosInstance from '../../../../axios/axiosInstance';
import toast from 'react-hot-toast';

const AddNewColor = () => {
    const [colorName, setColorName] = useState('');
      const [error, setError] = useState('');


      const handleChange = (e) => {
        setColorName(e.target.value);
      };
    
      const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!colorName) {
          setError('Name is required.');
          return;
        }
    
        try {
          // Add new product
          const response = await axiosInstance.post('/Color/new', { name :colorName });
        //   console.log(response);
          if(response.data.success){
          toast.success('Color added successfully!');
          setColorName('');
          setError('');
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'An error occurred. Please try again.');
          setError(err.response?.data?.message || 'An error occurred. Please try again.');
        }
      };
    
      return (
        <div className="product-form">
          <h2 className="product-form__title">Add New Color</h2>
          {error && <p className="product-form__error">{error}</p>}
          <form onSubmit={handleSubmit} className="product-form__form">
            <label className="product-form__label">
              Color Name:
              <input
                type="text"
                name="colorName"
                value={colorName}
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

export default AddNewColor