const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fs = require('fs');

const puppeteer = require('puppeteer');

const FULLNAME = 'Bhavesh Dodhia';
const MOBILE = '9099922002';
const ADDRESS = '206, Punit Chambers, 2nd Floor, Udhna Darwaja, Ring Road, Surat';

let browser;
let page;

async function saveOrder(data) {
    let order = await prisma.orders.create({
        data: {
            buyerName: data.buyerName,
            buyerAddress: data.buyerAddress,
            gstin: data.gstin,
            sellerName: data.sellerName,
            sellerAddress: data.sellerAddress,
            quality: data.quality,
            quantity: data.quantity,
            rate: data.rate,
            deliverySchedule: data.deliverySchedule,
            paymentTerms: data.paymentTerms,
            brokerage: data.brokerage
        }
    });

    return order;
}

function populateTemplate(file, order) {
    let date = new Date(order.orderDate);
    const dateString = getDateString(date);

    return file
        .replace('{FULLNAME}', FULLNAME)
        .replaceAll('{MOBILE}', MOBILE)
        .replace('{ADDRESS}', ADDRESS)
        .replace('{SNO}', order.id)
        .replace('{DATE}', dateString)
        .replace('{BUYER-NAME}', order.buyerName)
        .replace('{BUYER-ADDRESS}', order.buyerAddress)
        .replace('{GSTIN}', order.gstin)
        .replace('{SELLER-NAME}', order.sellerName)
        .replace('{SELLER-ADDRESS}', order.sellerAddress)
        .replace('{QUALITY}', order.quality)
        .replace('{QUANTITY}', order.quantity)
        .replace('{RATE}', order.rate)
        .replace('{DELIVERY}', order.deliverySchedule)
        .replace('{TERMS}', order.paymentTerms)
        .replace('{DALALI}', order.brokerage);
}

function getDateString(date) {
    const DD = date.getDate().toString().padStart(2, '0');
    const MM = (date.getMonth() + 1).toString().padStart(2, '0');
    const YYYY = date.getFullYear().toString();

    return DD + '-' + MM + '-' + YYYY;
}

async function generateOrderForm(data) {
    // Save order in the database
    let order = await saveOrder(data);

    // Fetch the template
    let template = fs.readFileSync('template.html', 'utf-8');

    // Replace placeholders with the concerned values
    orderFile = populateTemplate(template, order);

    // Write the file to a directory
    generateFile(orderFile, order.id, order.quality.replaceAll(' ', '-'), order.buyerName.replaceAll(' ', '-'), order.sellerName.replaceAll(' ', '-'));
}

async function generateFile(orderFile, orderId, quality, buyerName, sellerName) {
    await page.setContent(orderFile, { waitUntil: 'domcontentloaded' });

    await page.emulateMediaType('screen');

    const pdf = await page.pdf({
        path: `storage/${orderId}_${quality}_${buyerName}_${sellerName}.pdf`,
        margin: { top: '25px', right: '150px', bottom: '25px', left: '150px' },
        printBackground: true,
        format: 'A4',
    });

    await browser.close();
}

async function main() {
    // Creating a browser instance
    browser = await puppeteer.launch();

    // Creating a new page
    page = await browser.newPage();

    const order = {
        buyerName: 'Vedanta Fabrics',
        buyerAddress: 'Sachin',
        gstin: '24AARFV9852G1ZI',
        sellerName: 'Chandravadan Weaving Work',
        sellerAddress: 'Udhna',
        quality: 'Grey Chinon Chiffon',
        quantity: 'Pcs: 24/- Takas',
        rate: 40.0,
        deliverySchedule: 'Regular',
        paymentTerms: 'No less: Super net payment 35 days sharp',
        brokerage: 1.0,
    };

    generateOrderForm(order);
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
    });