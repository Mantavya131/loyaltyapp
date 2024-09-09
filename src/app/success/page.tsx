'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';

interface MenuItem {
  ItemID: number;
  ItemName: string;
  Price: number;
}

interface OrderItem {
  ItemID: number;
  ItemName: string;
  Quantity: number;
  Price: number;
  TotalPrice: number;
}

export default function SuccessPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [emailId, setEmailId] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    fetchMenuItems();
    setCurrentDate(new Date().toISOString());
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get('/api/getMenu');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleAddItem = () => {
    if (selectedItem && quantity > 0) {
      const newOrderItem: OrderItem = {
        ItemID: selectedItem.ItemID,
        ItemName: selectedItem.ItemName,
        Quantity: quantity,
        Price: selectedItem.Price,
        TotalPrice: selectedItem.Price * quantity
      };
      setOrderItems([...orderItems, newOrderItem]);
      setSelectedItem(null);
      setQuantity(1);
    }
  };

  const handleSubmitOrder = async () => {
    if (!phoneNumber) {
      alert("Phone number is mandatory!");
      return;
    }
  
    try {
      const response = await axios.post('/api/submit-order', {
        phoneNumber,
        emailId: emailId.trim() || undefined,
        date: currentDate,
        items: orderItems,
        total: calculateTotal()
      });
  
      console.log('Order submitted successfully:', response.data);
  
      router.push(`/order-confirmation?phoneNumber=${encodeURIComponent(phoneNumber)}`);
  
    } catch (error) {
      console.error('Error submitting order:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.error === 'EmailTaken') {
          alert('This email ID is already associated with a different phone number. Please use a different email.');
        } else if (error.response?.data?.error === 'EmailRequired') {
          alert('Email is required for new customers. Please provide an email address.');
        } else {
          alert('Error submitting order. Please try again.');
        }
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    }
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.TotalPrice, 0);
  };

  return (
    <main className="p-4 flex flex-col items-center min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">
        Wish you more sales today!
      </h1>

      <div className="w-full max-w-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Customer Information</h2>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          placeholder="Phone Number"
        />
        <input
          type="email"
          value={emailId}
          onChange={(e) => setEmailId(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          placeholder="Email ID"
        />
      </div>

      <div className="w-full max-w-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">New Order</h2>
        <select
          className="w-full p-2 mb-4 border rounded"
          value={selectedItem?.ItemID || ''}
          onChange={(e) => setSelectedItem(menuItems.find(item => item.ItemID === parseInt(e.target.value)) || null)}
        >
          <option value="">Select an item</option>
          {menuItems.map(item => (
            <option key={item.ItemID} value={item.ItemID}>{item.ItemName}</option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
          className="w-full p-2 mb-4 border rounded"
          placeholder="Quantity"
        />
        <p className="mb-4">Price: ${selectedItem ? (selectedItem.Price * quantity).toFixed(2) : '0.00'}</p>
        <button
          onClick={handleAddItem}
          className="w-full bg-green-500 text-white p-2 rounded mb-4"
        >
          Add Item
        </button>
      </div>

      {orderItems.length > 0 && (
        <div className="w-full max-w-md mb-8">
          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
          <p className="mb-2">Date: {format(new Date(currentDate), 'dd/MM/yyyy')}</p>
          <p className="mb-2">Phone: {phoneNumber}</p>
          <p className="mb-4">Email: {emailId}</p>
          {orderItems.map((item, index) => (
            <div key={index} className="mb-2">
              <p>{item.ItemName} x {item.Quantity} = ${item.TotalPrice.toFixed(2)}</p>
            </div>
          ))}
          <p className="font-bold mt-4">Total: ${calculateTotal().toFixed(2)}</p>
          <button
            onClick={handleSubmitOrder}
            className="w-full bg-blue-500 text-white p-2 rounded mt-4"
          >
            Submit Order
          </button>
        </div>
      )}

      <button 
        onClick={() => router.push('/')}
        className="bg-gray-500 text-white p-2 rounded"
      >
        Back to Menu
      </button>
      <button 
        onClick={() => router.push('/reward-interface')}
        className="bg-purple-500 text-white p-2 rounded hover:bg-purple-600 transition duration-300 mt-4"
        >
        Reward Interface
      </button>
    </main>
  );
}