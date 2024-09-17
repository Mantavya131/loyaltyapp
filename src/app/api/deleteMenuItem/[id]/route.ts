// /src/app/api/deleteMenuItem/[id]/route.ts

// import { NextResponse } from 'next/server';
// import pool from '../../../../../db';

// export async function DELETE(request: Request, { params }: { params: { id: string } }) {
//   try {
//     const { id } = params;
//     if (!id) {
//       return NextResponse.json({ message: 'Item ID is required' }, { status: 400 });
//     }
//     const connection = await pool.getConnection();
    
//     // Instead of deleting, update the isDeleted flag
//     await connection.query('UPDATE menu SET isDeleted = TRUE WHERE ItemID = ?', [id]);
    
//     connection.release();
//     return NextResponse.json({ message: 'Menu item marked as deleted successfully' });
//   } catch (error) {
//     console.error('Error marking menu item as deleted:', error);
//     return NextResponse.json(
//       { message: 'Error marking menu item as deleted' },
//       { status: 500 }
//     );
//   }
// }

//-----------------------------------------------------------------------------------------------------------------------------

// src/app/api/deleteMenuItem/[id]/route.ts

// src/app/api/deleteMenuItem/[id]/route.ts

import { NextResponse } from 'next/server';
import pool from '../../../../../db';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: 'Item ID is required' }, { status: 400 });
    }
    const connection = await pool.getConnection();

    // Instead of deleting, update the isDeleted flag
    await connection.query('UPDATE menu SET isDeleted = TRUE WHERE ItemID = ?', [id]);

    connection.release();

    // Optionally add no-cache headers to ensure freshness
    const response = NextResponse.json({ message: 'Menu item marked as deleted successfully' });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('Error marking menu item as deleted:', error);
    return NextResponse.json(
      { message: 'Error marking menu item as deleted' },
      { status: 500 }
    );
  }
}
