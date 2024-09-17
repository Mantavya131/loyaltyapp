// /src/app/api/submit-menu/route.ts


// import { NextResponse } from 'next/server';
// import pool from './../../../../db';

// interface MenuItem {
//     ItemName: string;
//     Price: number;
// }

// export async function POST(request: Request) {
//     try {
//         const items: MenuItem[] = await request.json();
//         const connection = await pool.getConnection();
//         const duplicates: string[] = [];
//         const addedItems: string[] = [];

//         for (const item of items) {
//             try {
//                 await connection.query(
//                     'INSERT INTO menu (ItemName, Price) VALUES (?, ?)',
//                     [item.ItemName, item.Price]
//                 );
//                 addedItems.push(item.ItemName);
//             } catch (error: any) {
//                 if (error.code === 'ER_DUP_ENTRY') {
//                     duplicates.push(item.ItemName);
//                 } else {
//                     throw error;
//                 }
//             }
//         }

//         connection.release();

//         return NextResponse.json({ 
//             message: 'Menu items processed', 
//             duplicates,
//             addedItems
//         }, { status: 200 });
//     } catch (error) {
//         console.error('Error processing menu items:', error);
//         return NextResponse.json({ message: 'Error processing menu items', error: (error as Error).message }, { status: 500 });
//     }
// }

//------------------------------------------------------------------------------------------------------------------------------------
// src/app/api/submit-menu/route.ts

import { NextResponse } from 'next/server';
import pool from './../../../../db';

interface MenuItem {
    ItemName: string;
    Price: number;
}

export async function POST(request: Request) {
    try {
      const items: MenuItem[] = await request.json();
      const connection = await pool.getConnection();
      const duplicates: string[] = [];
      const addedItems: string[] = [];
  
      for (const item of items) {
        try {
          await connection.query(
            'INSERT INTO menu (ItemName, Price) VALUES (?, ?)',
            [item.ItemName, item.Price]
          );
          addedItems.push(item.ItemName);
        } catch (error: any) {
          if (error.code === 'ER_DUP_ENTRY') {
            duplicates.push(item.ItemName);
          } else {
            throw error;
          }
        }
      }
  
      connection.release();
  
      // Optional: Add no-cache headers
      const response = NextResponse.json({ 
        message: 'Menu items processed',
        duplicates,
        addedItems,
      });
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response;
    } catch (error) {
      console.error('Error processing menu items:', error);
      return NextResponse.json({ message: 'Error processing menu items', error: (error as Error).message }, { status: 500 });
    }
  }
  