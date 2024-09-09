import { NextResponse } from 'next/server';
import pool from './../../../../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function POST(request: Request) {
  const { rewardCode } = await request.json();
  const connection = await pool.getConnection();

  try {
    const [reward] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM Rewards WHERE Reward_id = ?',
      [rewardCode]
    );

    if (reward.length === 0) {
      return NextResponse.json({ message: 'Invalid reward code' }, { status: 400 });
    }

    if (reward[0].Flag) {
      return NextResponse.json({ message: 'This code has already been used' }, { status: 400 });
    }

    await connection.query<ResultSetHeader>(
      'UPDATE Rewards SET Flag = TRUE WHERE Reward_id = ?',
      [rewardCode]
    );

    const [favoriteItem] = await connection.query<RowDataPacket[]>(`
    
         SELECT m.ItemName
         FROM OrderDetails od
         JOIN Transaction t ON od.TransactionID = t.TransactionID
         JOIN menu m ON od.ItemID = m.ItemID
         WHERE t.CustomerPhoneNumber = ?
         GROUP BY m.ItemName
         ORDER BY COUNT(*) DESC, MAX(t.TransactionDate) DESC
         LIMIT 1

    `, [reward[0].Rewarded_Customer_Ph_Number]);

    return NextResponse.json({ message: `This customer has earned ${favoriteItem[0].ItemName} for free` });
  } catch (error) {
    console.error('Error verifying reward:', error);
    return NextResponse.json({ message: 'Error verifying reward' }, { status: 500 });
  } finally {
    connection.release();
  }
}