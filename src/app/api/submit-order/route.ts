// import { NextResponse } from 'next/server';
// import pool from './../../../../db';
// import { ResultSetHeader, RowDataPacket } from 'mysql2';
// import { format, parseISO } from 'date-fns';
// import nodemailer from 'nodemailer';
// import crypto from 'crypto';

// // Create a transporter using SMTP
// const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false, // Use TLS
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS
//     },
//   });
  
//   async function sendOrderConfirmationEmail(email: string, orderDetails: any) {
//     const itemsList = orderDetails.items.map((item: any) => 
//       `<li>${item.ItemName} x ${item.Quantity} = $${item.TotalPrice.toFixed(2)}</li>`
//     ).join('');
  
//     const emailBody = `
//       <html>
//         <body>
//           <h1>Order Confirmation</h1>
//           <p>Thank you for your order!</p>
//           <p>Order Details:</p>
//           <p>Date: ${format(parseISO(orderDetails.date), 'dd/MM/yyyy')}</p>
//           <p>Phone: ${orderDetails.phoneNumber}</p>
//           <ul>
//             ${itemsList}
//           </ul>
//           <p><strong>Total: $${orderDetails.total.toFixed(2)}</strong></p>
//         </body>
//       </html>
//     `;
  
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Order Confirmation',
//       html: emailBody,
//     });
//   }

// export async function POST(request: Request) {
//     try {
//         let { phoneNumber, emailId = '', date, items, total } = await request.json();
//         const formattedDate = format(parseISO(date), 'yyyy-MM-dd');
//         const connection = await pool.getConnection();

//         await connection.beginTransaction();

//         try {
//             // Check if customer exists
//             const [customers] = await connection.query<RowDataPacket[]>(
//                 'SELECT * FROM Customer WHERE PhoneNumber = ?',
//                 [phoneNumber]
//             );

//             if (customers.length === 0) {
//                 // New customer
//                 if (!emailId.trim()) {
//                     await connection.rollback();
//                     connection.release();
//                     return NextResponse.json({ error: 'EmailRequired' }, { status: 400 });
//                 }

//                 // Check if email exists
//                 const [existingEmails] = await connection.query<RowDataPacket[]>(
//                     'SELECT PhoneNumber FROM Customer WHERE EmailID = ?',
//                     [emailId]
//                 );

//                 if (existingEmails.length > 0) {
//                     await connection.rollback();
//                     connection.release();
//                     return NextResponse.json({ error: 'EmailTaken' }, { status: 400 });
//                 }

//                 // Insert new customer
//                 await connection.query<ResultSetHeader>(
//                     'INSERT INTO Customer (PhoneNumber, EmailID) VALUES (?, ?)',
//                     [phoneNumber, emailId]
//                 );
//             } else {
//                 // Existing customer
//                 const storedEmail = customers[0].EmailID;
//                 if (emailId.trim() && emailId !== storedEmail) {
//                     // Check if new email exists
//                     const [existingEmails] = await connection.query<RowDataPacket[]>(
//                         'SELECT PhoneNumber FROM Customer WHERE EmailID = ? AND PhoneNumber != ?',
//                         [emailId, phoneNumber]
//                     );

//                     if (existingEmails.length > 0) {
//                         await connection.rollback();
//                         connection.release();
//                         return NextResponse.json({ error: 'EmailTaken' }, { status: 400 });
//                     }

//                     // Update email
//                     await connection.query(
//                         'UPDATE Customer SET EmailID = ? WHERE PhoneNumber = ?',
//                         [emailId, phoneNumber]
//                     );
//                 } else {
//                     emailId = storedEmail;
//                 }
//             }

//             // Insert transaction
//             const [result] = await connection.query<ResultSetHeader>(
//                 'INSERT INTO Transaction (TransactionDate, CustomerPhoneNumber, TotalAmount) VALUES (?, ?, ?)',
//                 [formattedDate, phoneNumber, total]
//             );
//             const transactionId = result.insertId;

//             // Insert order details
//             for (const item of items) {
//                 await connection.query(
//                     'INSERT INTO OrderDetails (ItemID, TransactionID, Quantity, Price) VALUES (?, ?, ?, ?)',
//                     [item.ItemID, transactionId, item.Quantity, item.Price]
//                 );
//             }

//             // After successful order submission
//             await sendOrderConfirmationEmail(emailId, { phoneNumber, date, items, total });

//             await connection.commit();
//             connection.release();

//             return NextResponse.json({ 
//                 message: customers.length === 0 ? 'New customer order submitted successfully' : 'Repeated customer order submitted successfully',
//                 success: true 
//             });
//         } catch (error) {
//             await connection.rollback();
//             connection.release();
//             throw error;
//         }
//     } catch (error) {
//         console.error('Error submitting order:', error);
//         return NextResponse.json({ message: 'Error submitting order', error: (error as Error).message }, { status: 500 });
//     }
// }


import { NextResponse } from 'next/server';
import pool from './../../../../db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { format, parseISO } from 'date-fns';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
  });
  
  async function sendOrderConfirmationEmail(email: string, orderDetails: any) {
    const itemsList = orderDetails.items.map((item: any) => 
      `<li>${item.ItemName} x ${item.Quantity} = $${item.TotalPrice.toFixed(2)}</li>`
    ).join('');
  
    const emailBody = `
      <html>
        <body>
          <h1>Order Confirmation</h1>
          <p>Thank you for your order!</p>
          <p>Order Details:</p>
          <p>Date: ${format(parseISO(orderDetails.date), 'dd/MM/yyyy')}</p>
          <p>Phone: ${orderDetails.phoneNumber}</p>
          <ul>
            ${itemsList}
          </ul>
          <p><strong>Total: $${orderDetails.total.toFixed(2)}</strong></p>
        </body>
      </html>
    `;
  
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Order Confirmation',
      html: emailBody,
    });
  }

  async function sendRewardEmail(email: string, itemName: string, rewardCode: string) {
    const emailBody = `
      <html>
        <body>
          <h1>Congratulations!</h1>
          <p>You have earned a free ${itemName}. Thanks for being our loyal customer. We wish this beautiful relationship lasts forever.</p>
          <p>Your reward code: <strong>${rewardCode}</strong></p>
          <p>Please give the above code to the shop and claim your reward.</p>
        </body>
      </html>
    `;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'You\'ve Earned a Reward!',
        html: emailBody,
      });
    }

    async function processReward(phoneNumber: string, connection: any) {
        const [favoriteItem] = await connection.query(`
            
            SELECT m.ItemName 
            FROM orderdetails od
            JOIN transaction t ON od.TransactionID = t.TransactionID
            JOIN menu m ON od.ItemID = m.ItemID
            WHERE t.CustomerPhoneNumber = ?
            GROUP BY m.ItemName
            ORDER BY COUNT(*) DESC, MAX(t.TransactionDate) DESC
            LIMIT 1
          `, [phoneNumber]) as RowDataPacket[];


          
          

          const rewardCode = crypto.randomBytes(10).toString('hex');
          const result = await connection.query(
            'INSERT INTO rewards (Reward_id, Rewarded_Customer_Ph_Number) VALUES (?, ?)',
            [rewardCode, phoneNumber]
          ) as ResultSetHeader;

          const [customerEmail] = await connection.query(
            'SELECT EmailID FROM customer WHERE PhoneNumber = ?',
            [phoneNumber]
          ) as [RowDataPacket[]];

          await sendRewardEmail(customerEmail[0].EmailID, favoriteItem[0].ItemName, rewardCode);
}
          


          
      






export async function POST(request: Request) {
    try {
        let { phoneNumber, emailId = '', date, items, total } = await request.json();
        const formattedDate = format(parseISO(date), 'yyyy-MM-dd');
        const connection = await pool.getConnection();

        await connection.beginTransaction();

        try {
            // Check if customer exists
            const [customers] = await connection.query<RowDataPacket[]>(
                'SELECT * FROM customer WHERE PhoneNumber = ?',
                [phoneNumber]
            );

            if (customers.length === 0) {
                // New customer
                if (!emailId.trim()) {
                    await connection.rollback();
                    connection.release();
                    return NextResponse.json({ error: 'EmailRequired' }, { status: 400 });
                }

                // Check if email exists
                const [existingEmails] = await connection.query<RowDataPacket[]>(
                    'SELECT PhoneNumber FROM customer WHERE EmailID = ?',
                    [emailId]
                );

                if (existingEmails.length > 0) {
                    await connection.rollback();
                    connection.release();
                    return NextResponse.json({ error: 'EmailTaken' }, { status: 400 });
                }

                // Insert new customer
                await connection.query<ResultSetHeader>(
                    'INSERT INTO customer (PhoneNumber, EmailID) VALUES (?, ?)',
                    [phoneNumber, emailId]
                );
            } else {
                // Existing customer
                const storedEmail = customers[0].EmailID;
                if (emailId.trim() && emailId !== storedEmail) {
                    // Check if new email exists
                    const [existingEmails] = await connection.query<RowDataPacket[]>(
                        'SELECT PhoneNumber FROM customer WHERE EmailID = ? AND PhoneNumber != ?',
                        [emailId, phoneNumber]
                    );

                    if (existingEmails.length > 0) {
                        await connection.rollback();
                        connection.release();
                        return NextResponse.json({ error: 'EmailTaken' }, { status: 400 });
                    }

                    // Update email
                    await connection.query(
                        'UPDATE customer SET EmailID = ? WHERE PhoneNumber = ?',
                        [emailId, phoneNumber]
                    );
                } else {
                    emailId = storedEmail;
                }
            }

            // Insert transaction
            const [result] = await connection.query<ResultSetHeader>(
                'INSERT INTO transaction (TransactionDate, CustomerPhoneNumber, TotalAmount) VALUES (?, ?, ?)',
                [formattedDate, phoneNumber, total]
            );
            const transactionId = result.insertId;

            // Insert order details
            for (const item of items) {
                await connection.query(
                    'INSERT INTO orderdetails (ItemID, TransactionID, Quantity, Price) VALUES (?, ?, ?, ?)',
                    [item.ItemID, transactionId, item.Quantity, item.Price]
                );
            }

            // Update TotalSpent and check for reward
            const [updateResult] = await connection.query<ResultSetHeader>(
                'UPDATE customer SET TotalSpent = TotalSpent + ? WHERE PhoneNumber = ?',
                [total, phoneNumber]
            );

            const [customerData] = await connection.query<RowDataPacket[]>(
                'SELECT TotalSpent FROM customer WHERE PhoneNumber = ?',
                [phoneNumber]
            );
            const totalSpent = customerData[0].TotalSpent;

            if (Math.floor(totalSpent / 550) > Math.floor((totalSpent - total) / 550)) {
                await processReward(phoneNumber, connection);
            }

            // After successful order submission
            await sendOrderConfirmationEmail(emailId, { phoneNumber, date, items, total });

            await connection.commit();
            connection.release();

            return NextResponse.json({ 
                message: customers.length === 0 ? 'New customer order submitted successfully' : 'Repeated customer order submitted successfully',
                success: true 
            });
        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }
    } catch (error) {
        console.error('Error submitting order:', error);
        return NextResponse.json({ message: 'Error submitting order', error: (error as Error).message }, { status: 500 });
    }
}


