import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { addNewTask, clearTaskErrors } from '../../../../actions/taskAction';

const AddNewTask = () => {
  const dispatch = useDispatch();

  // Get Redux state
  const { loading, error, success } = useSelector((state) => state.tasks);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleChange = (e) => {
    setName(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Task name is required.');
      return;
    }

    // Dispatch action to add a new task
    dispatch(addNewTask({ name, description }));
  };

  // Handle errors and success from Redux state
  useEffect(() => {
    if (error) {
      // console.log(error);
      
      toast.error(error);
      dispatch(clearTaskErrors());
    }

    if (success) {
      toast.success('Task added successfully!');
      setName('');
      setDescription('');
    }
  }, [error, success, dispatch]);

  return (
    <div className="product-form">
      <h2 className="product-form__title">Add New Task</h2>
      <form onSubmit={handleSubmit} className="product-form__form">
        <label className="product-form__label">
          Task Name:
          <input
            type="text"
            value={name}
            onChange={handleChange}
            required
            className="product-form__input"
            placeholder="Enter task name"
          />
        </label>
        <label className="product-form__label">
          Description:
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            className="product-form__input"
            placeholder="Enter task description (optional)"
          />
        </label>
        <button type="submit" className="product-form__button" disabled={loading}>
          {loading ? 'Adding...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default AddNewTask;
