'use client'

import React, { useState } from 'react';
import axios from 'axios';

export default function RewardInterface() {
  const [rewardCode, setRewardCode] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/verify-reward', { rewardCode });
      setMessage(response.data.message);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage('An error occurred. Please try again.');
      }
    }
  };

  return (
    <main className="p-4 flex flex-col items-center min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Reward Verification</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <input
          type="text"
          value={rewardCode}
          onChange={(e) => setRewardCode(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          placeholder="Enter Reward Code"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Verify Reward
        </button>
      </form>
      {message && (
        <p className="mt-4 text-lg font-semibold text-center">{message}</p>
      )}
    </main>
  );
}