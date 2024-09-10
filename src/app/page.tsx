// /src/app/pages.tsx

'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface MenuItem {
  ItemID: number;
  ItemName: string;
  Price: number;
}

export default function Home() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<MenuItem[]>([]);
  const router = useRouter();

  const addItem = () => {
    if (itemName && itemPrice) {
      const newItem: MenuItem = {
        ItemID: Date.now(), // Temporary ID, will be replaced by database
        ItemName: itemName,
        Price: parseFloat(itemPrice)
      };
      setItems([...items, newItem]);
      setItemName('');
      setItemPrice('');
    }
  };

  const submitMenu = async () => {
    try {
      const response = await axios.post('/api/submit-menu', items);
      if (response.data.duplicates && response.data.duplicates.length > 0) {
        alert(`The following items already exist and were not added: ${response.data.duplicates.join(', ')}`);
        // Remove duplicate items from the local state
        setItems(items.filter(item => !response.data.duplicates.includes(item.ItemName)));
      }
      if (response.data.addedItems && response.data.addedItems.length > 0) {
        console.log(response.data.message);
        alert(`Successfully added ${response.data.addedItems.length} item(s) to the menu.`);
        setItems([]);  // Clear all items after successful submission
        fetchMenu(); // Refresh the current menu after submission
        
        router.push('/success');      // Navigate to the success page
      }
    } catch (error) {
      console.error('Error submitting menu:', error);
      alert('Error submitting menu. Please try again.');
    }
  };

  const fetchMenu = async () => {
    try {
      console.log('Fetching menu...');
      const response = await axios.get('/api/getMenu');
      console.log('API response:', response.data);
      setCurrentMenu(response.data);
      console.log('Set current menu to:', response.data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  useEffect(() => {
    console.log('Current menu state updated:', currentMenu);
  }, [currentMenu]);

  const deleteMenuItem = async (id: number) => {
    try {
      await axios.delete(`/api/deleteMenuItem/${id}`);
      fetchMenu();
    } catch (error) {
      console.error('Error deleting menu item:', error);
    }
  };

  // const updateMenuItem = async (id: number, name: string, price: string) => {
  //   try {
  //     await axios.put(`/api/updateMenuItem/${id}`, { ItemName: name, Price: price });
  //     fetchMenu();
  //   } catch (error) {
  //     console.error('Error updating menu item:', error);
  //   }
  // };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Menu Input</h1>
      <div className="mb-4">
        <input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Item Name"
          className="border p-2 mr-2"
        />
        <input
          type="number"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
          placeholder="Price"
          className="border p-2 mr-2"
        />
        <button onClick={addItem} className="bg-blue-500 text-white p-2">
          Add Item
        </button>
      </div>
      <table className="w-full mb-4">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.ItemID}>
              <td>{item.ItemName}</td>
              <td>{item.Price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={submitMenu} className="bg-green-500 text-white p-2 mr-2">
        Submit Menu
      </button>
      <button 
        onClick={() => {
          setEditMode(true);
          fetchMenu();
        }} 
        className="bg-yellow-500 text-white p-2">
        Manage Menu
      </button>

      {editMode && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Current Menu</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentMenu.map((item) => (
                <tr key={item.ItemID}>
                  <td>{item.ItemName}</td>
                  <td>{item.Price}</td>
                  <td>
                    <button 
                      onClick={() => deleteMenuItem(item.ItemID)}
                      className="bg-red-500 text-white p-1 mr-1"
                    >
                      Delete
                    </button>
                    {/* <button 
                      onClick={() => updateMenuItem(item.ItemID, item.ItemName, item.Price.toString())}
                      className="bg-blue-500 text-white p-1"
                    >
                      Edit
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add this new button at the bottom */}
      <div className="mt-8">
        <button 
          onClick={() => router.push('/success')}
          className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600 transition duration-300"
        >
          Go to Order Page
        </button>
      </div>
    </main>
  );
}