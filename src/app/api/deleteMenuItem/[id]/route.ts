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

import { NextResponse } from 'next/server';
import pool from '../../../../../db';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    console.log(`Attempting to delete menu item with ID: ${id}`);
    if (!id) {
      return NextResponse.json({ message: 'Item ID is required' }, { status: 400 });
    }
    const connection = await pool.getConnection();
    
    const [result] = await connection.query('UPDATE menu SET isDeleted = TRUE WHERE ItemID = ?', [id]);
    console.log('Delete operation result:', result);
    
    connection.release();

    if ((result as any).affectedRows === 0) {
      console.log(`No item found with ID: ${id}`);
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }

    console.log(`Successfully marked item with ID ${id} as deleted`);
    return NextResponse.json({ message: 'Menu item marked as deleted successfully' });
  } catch (error) {
    console.error('Error marking menu item as deleted:', error);
    return NextResponse.json(
      { message: 'Error marking menu item as deleted', error: String(error) },
      { status: 500 }
    );
  }
}