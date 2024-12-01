import { Card } from '@/app/ui/dashboard/cards';
import RevenueChart from '@/app/ui/dashboard/revenue-chart';
import LatestInvoices from '@/app/ui/dashboard/latest-invoices';
import { lusitana } from '@/app/ui/fonts';
import { fetchRevenue, fetchLatestInvoices, fetchCardData } from '@/app/lib/data';

export default async function Page() {
  try {
    // Fetch data for cards, revenue chart, and latest invoices
    const { totalPaidInvoices, totalPendingInvoices, numberOfInvoices, numberOfCustomers } = await fetchCardData();
    const revenue = await fetchRevenue();
    const latestInvoices = await fetchLatestInvoices();

    return (
      <main>
        <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          Dashboard
        </h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Pass data to Card components */}
          <Card title="Collected" value={totalPaidInvoices} type="collected" />
          <Card title="Pending" value={totalPendingInvoices} type="pending" />
          <Card title="Total Invoices" value={numberOfInvoices} type="invoices" />
          <Card title="Total Customers" value={numberOfCustomers} type="customers" />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
          {revenue && revenue.length > 0 ? (
            <RevenueChart revenue={revenue} /> // Pass revenue data to the chart
          ) : (
            <p className="col-span-full text-gray-500">No revenue data available.</p>
          )}
          {latestInvoices && latestInvoices.length > 0 ? (
            <LatestInvoices latestInvoices={latestInvoices} />
          ) : (
            <p className="col-span-full text-gray-500">No invoice data available.</p>
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error fetching data:', error);
    return (
      <main>
        <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
          Dashboard
        </h1>
        <p className="text-red-500">Failed to load data. Please try again later.</p>
      </main>
    );
  }
}
