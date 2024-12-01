import { Pool } from 'pg';
import { formatCurrency } from './utils';
import { unstable_noStore as noStore } from 'next/cache';

// Database connection pool for NeonDB
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false, // Allow self-signed certificates
  },
});

// Query database with connection pooling
async function queryDatabase(query, params = []) {
  let client;
  try {
    client = await pool.connect(); // Connect to the pool
    const result = await client.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to execute query.');
  } finally {
    if (client) client.release(); // Release the client back to the pool
  }
}

// Fetch revenue data with noStore and simulated delay
export async function fetchRevenue() {
  noStore(); // Prevent caching
  try {
    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate delay
    const data = await queryDatabase('SELECT * FROM revenue');
    console.log('Data fetch completed after 3 seconds.');
    return data;
  } catch (error) {
    console.error('Failed to fetch revenue data:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

// Fetch latest invoices
export async function fetchLatestInvoices() {
  noStore(); // Prevent caching
  try {
    const data = await queryDatabase(`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5
    `);
    return data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
  } catch (error) {
    console.error('Failed to fetch the latest invoices:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

// Fetch card data
export async function fetchCardData() {
  noStore(); // Prevent caching
  try {
    const invoiceCountPromise = queryDatabase('SELECT COUNT(*) FROM invoices');
    const customerCountPromise = queryDatabase('SELECT COUNT(*) FROM customers');
    const invoiceStatusPromise = queryDatabase(`
      SELECT
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
      FROM invoices
    `);

    const [invoiceCount, customerCount, invoiceStatus] = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    return {
      numberOfInvoices: Number(invoiceCount[0]?.count ?? '0'),
      numberOfCustomers: Number(customerCount[0]?.count ?? '0'),
      totalPaidInvoices: formatCurrency(invoiceStatus[0]?.paid ?? '0'),
      totalPendingInvoices: formatCurrency(invoiceStatus[0]?.pending ?? '0'),
    };
  } catch (error) {
    console.error('Failed to fetch card data:', error);
    throw new Error('Failed to fetch card data.');
  }
}

// Other fetch functions with noStore
export async function fetchFilteredInvoices(query, currentPage) {
  noStore();
  const ITEMS_PER_PAGE = 6;
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const data = await queryDatabase(
      `
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE $1 OR
        customers.email ILIKE $1 OR
        invoices.amount::text ILIKE $1 OR
        invoices.date::text ILIKE $1 OR
        invoices.status ILIKE $1
      ORDER BY invoices.date DESC
      LIMIT $2 OFFSET $3
    `,
      [`%${query}%`, ITEMS_PER_PAGE, offset]
    );
    return data;
  } catch (error) {
    console.error('Failed to fetch filtered invoices:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query) {
  noStore();
  try {
    const data = await queryDatabase(
      `
      SELECT COUNT(*)
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE $1 OR
        customers.email ILIKE $1 OR
        invoices.amount::text ILIKE $1 OR
        invoices.date::text ILIKE $1 OR
        invoices.status ILIKE $1
    `,
      [`%${query}%`]
    );
    const ITEMS_PER_PAGE = 6;
    return Math.ceil(Number(data[0]?.count ?? '0') / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Failed to fetch total number of invoices:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchFilteredCustomers(query) {
  noStore();
  try {
    const data = await queryDatabase(
      `
      SELECT
        customers.id,
        customers.name,
        customers.email,
        customers.image_url,
        COUNT(invoices.id) AS total_invoices,
        SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
        SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
      FROM customers
      LEFT JOIN invoices ON customers.id = invoices.customer_id
      WHERE
        customers.name ILIKE $1 OR
        customers.email ILIKE $1
      GROUP BY customers.id, customers.name, customers.email, customers.image_url
      ORDER BY customers.name ASC
    `,
      [`%${query}%`]
    );

    return data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));
  } catch (error) {
    console.error('Failed to fetch filtered customers:', error);
    throw new Error('Failed to fetch customers.');
  }
}

export async function getUser(email) {
  noStore();
  try {
    const data = await queryDatabase('SELECT * FROM users WHERE email = $1', [email]);
    return data[0] || null;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
