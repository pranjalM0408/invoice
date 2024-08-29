import PDFDocument from 'pdfkit';
import fs from 'fs';
import { OrdersModel } from '../models/orders.model';


const generateInvoice = (order) => {
    return new Promise((resolve, reject) => {
        try{
            const doc = new PDFDocument();
            const fileName = `invoice_${order.orderDetails[0].orderID}.pdf`;
            const filePath = `./invoices/${fileName}`;

            doc.pipe(fs.createWriteStream(filePath));

            doc.fontSize(20).text('Invoice', { align: 'center '});
            doc.moveDown();

            doc.fontSize(12).text(`Order ID: ${order.orderDetails[0].orderID}`);
            doc.text(`User ID: ${order.userID}`);
            doc.text(`Customer ID: ${order.customerId}`);
            doc.text(`Order Date: ${order.orderDetails[0].orderDate ? order.orderDetails[0].orderDate.toDateString() : 'N/A'}`);
            doc.text(`Order Placed Date: ${order.orderDetails[0].orderPlacedDate ? order.orderDetails[0].orderPlacedDate.toDateString() : 'N/A'}`);
            doc.text(`Payment status: ${order.orderDetails[0].paymentStatus}`);
            doc.moveDown();

            if(order.orderDetails[0].addressId) {
                doc.text(`Shipping Address: ${order.orderDetails[0].addressId}`);
            }

            doc.moveDown().fontSize(14).text('Products: ');
            order.orderDetails[0].products.forEach((product, index) => {
                doc.fontSize(12).text(`${index + 1}. ${JSON.stringify(product)}`);
            });

            doc.moveDown();
            doc.fontSize(12).text(`Total Amount: ₹${order.orderDetails[0].amount.toFixed(2)}`);

            doc.moveDown();
            doc.fontSize(10).text('Thank you for your purchase!', { align: 'center' });

            doc.end();

        doc.on('finish', () => {
            console.log(`Invoice generated: ${filePath}`);
            resolve(filePath);
        });
        } catch (error) {
            console.error('Error generating invoice:', error.message);
            reject(error);
        }
    });
};

const placeOrder = async (req, res) => {
    try {
        const orderData = req.body;

        const newOrder = await OrdersModel.create(orderData);

        const invoicePath = await generateInvoice(newOrder);

        res.status(201).JSON ({
            message: 'Order placed successfully!',
            order: newOrder,
            invoicePath: invoicePath,
        });
    } catch (error) {
        console.error('Error placing order:', error.message);
        res.status(500).json({ message: 'Error placing order', error: error.message });
    }
};

import express from 'express';
const rounter = express.Router();

Router.post('/place-order', placeOrder);


export default Router;
