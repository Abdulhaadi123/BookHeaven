import React, { useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { FaCartPlus, FaFileInvoiceDollar, FaFileAlt, FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getUserTasks } from "../../../api/taskService"; // Import the API function

const CustomSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [tasks, setTasks] = useState([]);

  // Fetch tasks on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const userId = localStorage.getItem("userID"); 
        const tasksData = await getUserTasks(userId); 
        setTasks(tasksData);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setTasks([]);
      }
    };
    fetchTasks();
  }, []);

  // Helper function to check if a task with a given name and active status exists
  const hasTask = (taskName) =>
    Array.isArray(tasks) && tasks.some((task) => task.name === taskName && task.status);

  return (
    <Sidebar
      defaultCollapsed={false}
      collapsed={collapsed}
      rootStyles={{
        backgroundColor: "#1E3A5F", // Deep navy blue for a modern look
        color: "#F0F4F8", // Soft light grayish blue for better readability
      }}
    >
      <Menu
        menuItemStyles={{
          button: ({ active }) => ({
            backgroundColor:  "#1E3A5F" , // Dark green for active items
            color: active ? "#FFFFFF" : "#A8DADC", // White for active text, aqua for others
            fontSize: "1.1vmax", // Ensure readability
            "&:hover": {
              backgroundColor: "#457B9D", // Cool blue hover effect
              color: "#FFFFFF", // Keep text white on hover
            },
          }),
        }}
      >
        {/* Toggle Button */}
        <MenuItem
          icon={<FaBars />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            backgroundColor: "#1D3557", // Navy blue for the toggle button
            color: "#FFFFFF",
            // marginBottom: "1vmin", // Add spacing
          }}
        >
          Toggle
        </MenuItem>

        {hasTask("canAddNewProduct") && (
          <SubMenu label="Add new Items" icon={<FaCartPlus />}>
            <MenuItem component={<Link to="/add-product" />}>Add Product</MenuItem>
            {hasTask("canAddCategory") && (
              <MenuItem component={<Link to="/add-category" />}>Add Category</MenuItem>
            )}
            {hasTask("canAddColors") && (
              <MenuItem component={<Link to="/add-color" />}>Add Color</MenuItem>
            )}
            {hasTask("canAddTasks") && (
              <MenuItem component={<Link to="/add-task" />}>Create Task</MenuItem>
            )}
          </SubMenu>
        )}

        {/* Conditionally Rendered Menu Items */}
        {hasTask("canSale") && (
          <SubMenu label="Products" icon={<FaCartPlus />}>
            <MenuItem component={<Link to="/admin/sell-product" />}>Sale Products</MenuItem>
            {hasTask("canPurchase") && (
              <MenuItem component={<Link to="/Purchase-List" />}>Purchase Products</MenuItem>
            )}
            <MenuItem component={<Link to="/view-products" />}>View All Products</MenuItem>
          </SubMenu>
        )}

        {hasTask("canPrintSaleInvoices") || hasTask("canPrintPurchaseInvoices") ? (
          <SubMenu label="Invoices" icon={<FaFileInvoiceDollar />}>
            {hasTask("canPrintSaleInvoices") && (
              <MenuItem component={<Link to="/admin/print-invoices" />}>Sales Invoices</MenuItem>
            )}
            {hasTask("canPrintPurchaseInvoices") && (
              <MenuItem component={<Link to="/all-purchase-invoice" />}>Purchase Invoices</MenuItem>
            )}
          </SubMenu>
        ) : null}

        {hasTask("canPrintConsolidateInvoice") && (
          <MenuItem icon={<FaFileAlt />} component={<Link to="/consolidate-invoices" />}>
            Consolidate Invoices
          </MenuItem>
        )}
      </Menu>
    </Sidebar>
  );
};

export default CustomSidebar;
