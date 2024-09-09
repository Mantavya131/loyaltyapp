import { NextResponse } from 'next/server';
import pool from './../../../../db';
import { RowDataPacket } from 'mysql2';
import { differenceInDays } from 'date-fns';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phoneNumber');

    if (!phoneNumber) {
        return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
        // Get visit count and last visit date (excluding the current visit)
        const [visitResult] = await connection.query<RowDataPacket[]>(
            `SELECT 
                COUNT(*) as visitCount, 
                (SELECT TransactionDate 
                 FROM transaction 
                 WHERE CustomerPhoneNumber = ? 
                 ORDER BY TransactionDate DESC 
                 LIMIT 1 OFFSET 1) as lastVisitDate
            FROM transaction 
            WHERE CustomerPhoneNumber = ?`,
            [phoneNumber, phoneNumber]
        );
        const visitCount = visitResult[0].visitCount;
        const lastVisitDate = visitResult[0].lastVisitDate;

        // Get total spent
        const [totalSpentResult] = await connection.query<RowDataPacket[]>(
            'SELECT SUM(TotalAmount) as totalSpent FROM transaction WHERE CustomerPhoneNumber = ?',
            [phoneNumber]
        );
        const totalSpent = totalSpentResult[0].totalSpent || 0;

        // Calculate days since last visit
        const daysSinceLastVisit = lastVisitDate ? differenceInDays(new Date(), new Date(lastVisitDate)) : null;

        connection.release();

        return NextResponse.json({
            isRepeating: visitCount > 1,
            visitCount: visitCount,
            totalSpent: totalSpent,
            lastVisitDate: lastVisitDate,
            daysSinceLastVisit: daysSinceLastVisit
        });
    } catch (error) {
        connection.release();
        console.error('Error fetching customer info:', error);
        return NextResponse.json({ error: 'Error fetching customer info' }, { status: 500 });
    }
}