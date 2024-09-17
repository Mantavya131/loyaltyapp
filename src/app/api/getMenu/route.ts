// /src/app/api/getMenu/route.ts


// import { NextResponse } from 'next/server';
// import pool from './../../../../db';

// export async function GET() {
//     try {
//       const connection = await pool.getConnection();
//       const [rows] = await connection.query('SELECT * FROM menu WHERE isDeleted = FALSE');
//       console.log('Menu items from database:', rows);
//       connection.release();
//       return NextResponse.json(rows);
//     } catch (error) {
//       console.error('Error fetching menu items:', error);
//       return NextResponse.json({ message: 'Error fetching menu items' }, { status: 500 });
//     }
//   }

  //-----------------------------------------------------------------------------------------------------------------

// src/app/api/getMenu/route.ts
// /src/app/api/getMenu/route.ts
import { NextResponse } from 'next/server';
import pool from './../../../../db';

export async function GET() {
    let connection;
    try {
        // Get the database connection
        connection = await pool.getConnection();

        // Fetch menu items where isDeleted = FALSE
        const [rows] = await connection.query('SELECT * FROM menu WHERE isDeleted = FALSE');
        console.log('Menu items fetched from the database:', rows);

        // Release connection back to the pool
        connection.release();

        // Ensure the response is not cached by browsers or CDNs in production mode
        const response = NextResponse.json(rows);
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        
        return response;
    } catch (error) {
        if (connection) connection.release();
        console.error('Error fetching menu items:', error);
        return NextResponse.json({ message: 'Error fetching menu items' }, { status: 500 });
    }
}
