import { NextResponse } from 'next/server';
import pool from './../../../../db';


export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT 1 as test');
    connection.release();
    return NextResponse.json({ message: 'Database connection successful', test: rows }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Database connection failed', error: (error as Error).message }, { status: 500 });
  }
}
