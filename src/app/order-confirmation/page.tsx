'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';

interface CustomerInfo {
  isRepeating: boolean;
  visitCount: number;
  totalSpent: number;
  lastVisitDate: string | null;
  daysSinceLastVisit: number | null;
}

export default function OrderConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  

  useEffect(() => {
    const phoneNumber = searchParams.get('phoneNumber');
    if (phoneNumber) {
      fetchCustomerInfo(phoneNumber);
    }
  }, [searchParams]);

  const fetchCustomerInfo = async (phoneNumber: string) => {
    try {
      const response = await axios.get(`/api/customer-info?phoneNumber=${phoneNumber}`);
      setCustomerInfo(response.data);
    } catch (error) {
      console.error('Error fetching customer info:', error);
    }
  };

  return (
    <main className="p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">Order Confirmation</h1>
      {customerInfo ? (
        <div className="text-center mb-8">
          {/* <p className="text-xl font-bold mb-4">
            {customerInfo.isRepeating 
              ? `Welcome back! This is your ${customerInfo.visitCount}${getOrdinal(customerInfo.visitCount)} visit.`
              : "Welcome! This is your first visit."}
          </p> */}
          <p className="text-xl font-bold mb-4">
            {customerInfo.isRepeating 
              ? (
                <>
                  Welcome back! This is your {customerInfo.visitCount}
                  {getOrdinal(customerInfo.visitCount)} visit.
                </>
              ) : "Welcome! This is your first visit."}
          </p>
          <p className="text-xl font-bold mb-4">
            Total spent so far: ${Number(customerInfo.totalSpent).toFixed(2)}
          </p>
          {customerInfo.isRepeating && customerInfo.lastVisitDate && (
            <>
              <p className="text-lg mb-2">
                Your last visit was on: {format(new Date(customerInfo.lastVisitDate), 'MMMM d, yyyy')}
              </p>
              <p className="text-lg mb-4">
                It has been {customerInfo.daysSinceLastVisit} days since your last visit.
              </p>
            </>
          )}
        </div>
      ) : (
        <p>Loading customer information...</p>
      )}
      <button 
        onClick={() => router.push('/success')}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300"
      >
        Back to Order Page
      </button>
    </main>
  );
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return (s[(v - 20) % 10] || s[v] || s[0]);
}
//--------------------------------------------------------------------------------------------------------
// 'use client'

// import React, { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import axios from 'axios';
// import { format } from 'date-fns';

// interface CustomerInfo {
//   isRepeating: boolean;
//   visitCount: number;
//   totalSpent: number;
//   lastVisitDate: string | null;
//   daysSinceLastVisit: number | null;
// }

// export default function OrderConfirmation() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

//   useEffect(() => {
//     const phoneNumber = searchParams.get('phoneNumber');
//     if (phoneNumber) {
//       fetchCustomerInfo(phoneNumber);
//     }
//   }, [searchParams]);

//   const fetchCustomerInfo = async (phoneNumber: string) => {
//     try {
//       const response = await axios.get(`/api/customer-info?phoneNumber=${phoneNumber}`);
//       setCustomerInfo(response.data);
//     } catch (error) {
//       console.error('Error fetching customer info:', error);
//     }
//   };

//   const renderCustomerInfo = () => {
//     if (!customerInfo) return <p>Loading customer information...</p>;

//     return (
//       <div className="text-center mb-8">
//         <p className="text-xl font-bold mb-4">
//           {customerInfo.isRepeating ? (
//             <>Welcome back! This is your {customerInfo.visitCount}{getOrdinal(customerInfo.visitCount)} visit.</>
//           ) : (
//             <>Welcome! This is your first visit.</>
//           )}
//         </p>
//         <p className="text-xl font-bold mb-4">
//           Total spent so far: ${Number(customerInfo.totalSpent).toFixed(2)}
//         </p>
//         {customerInfo.isRepeating && customerInfo.lastVisitDate && (
//           <>
//             <p className="text-lg mb-2">
//               Your last visit was on: {format(new Date(customerInfo.lastVisitDate), 'MMMM d, yyyy')}
//             </p>
//             <p className="text-lg mb-4">
//               It has been {customerInfo.daysSinceLastVisit} days since your last visit.
//             </p>
//           </>
//         )}
//       </div>
//     );
//   };

//   return (
//     <main className="p-4 flex flex-col items-center">
//       <h1 className="text-3xl font-bold mb-8">Order Confirmation</h1>
//       {renderCustomerInfo()}
//       <button
//         onClick={() => router.push('/success')}
//         className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300"
//       >
//         Back to Order Page
//       </button>
//     </main>
//   );
// }

// function getOrdinal(n: number): string {
//   const s = ['th', 'st', 'nd', 'rd'];
//   const v = n % 100;
//   return (s[(v - 20) % 10] || s[v] || s[0]);
// }