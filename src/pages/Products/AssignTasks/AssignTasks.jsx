// src/components/AssignTasks.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import CustomTable from '../../../components/customComponents/customTable';
import { fetchAssignedTasks, updateTaskStatus } from '../../../actions/taskAction';

const AssignTasks = () => {
  const dispatch = useDispatch();

  const { tasks, loading, error } = useSelector((state) => state.tasks);

  useEffect(() => {
    dispatch(fetchAssignedTasks());
  }, [dispatch]);

  // Define table columns
  const columns = [
    {
      header: 'Role Name',
      accessorKey: 'roleId.name',
    },
    {
      header: 'Task Name',
      accessorFn: (row) => row.tasks.map((task) => task.taskId.name).join(', '),
      cell: ({ row }) =>
        row.original.tasks.map((task) => (
          <div key={task.taskId._id} style={ {display: "flex", alignItems: "center"} } >
            <label>{task.taskId.name}</label>
            <input
              type="checkbox"
              checked={task.status}
              onChange={() =>
                dispatch(updateTaskStatus(row.original.roleId._id, task.taskId._id, !task.status))
              }
            />
          </div>
        )),
    },
  ];

  return (
    <div>
      <h1 style={{textAlign: "center"}}>Assign Tasks to Roles</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <CustomTable columns={columns} data={tasks} />
      )}
    </div>
  );
};

export default AssignTasks;
