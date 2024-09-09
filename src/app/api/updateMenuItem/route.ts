import { NextResponse } from 'next/server';
import pool from './../../../../db';

export async function PUT(request: Request) {
  try {
    const { id, name, price } = await request.json();
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE menu SET name = ?, price = ? WHERE id = ?',
      [name, price, id]
    );
    connection.release();
    return NextResponse.json({ message: 'Menu item updated successfully' });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json(
      { message: 'Error updating menu item' },
      { status: 500 }
    );
  }
}
