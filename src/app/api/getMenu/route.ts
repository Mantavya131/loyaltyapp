import { NextResponse } from 'next/server';
import pool from './../../../../db';

export async function GET() {
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.query('SELECT * FROM menu WHERE isDeleted = FALSE');
      console.log('Menu items from database:', rows);
      connection.release();
      return NextResponse.json(rows);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      return NextResponse.json({ message: 'Error fetching menu items' }, { status: 500 });
    }
  }