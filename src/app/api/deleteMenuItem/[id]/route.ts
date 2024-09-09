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
    return NextResponse.json({ message: 'Menu item marked as deleted successfully' });
  } catch (error) {
    console.error('Error marking menu item as deleted:', error);
    return NextResponse.json(
      { message: 'Error marking menu item as deleted' },
      { status: 500 }
    );
  }
}
