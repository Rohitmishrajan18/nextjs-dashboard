'use client';  // Ensure this is included to make the component client-side

import { usePathname } from 'next/navigation';  // Import usePathname to get the current path
import { UserGroupIcon, HomeIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';  // Import icons
import Link from 'next/link';
import clsx from 'clsx';  // Import clsx to conditionally apply class names

// Updated map of links to display in the side navigation
const links = [
  { name: 'Home', href: '/ui/dashboard', icon: HomeIcon },
  {
    name: 'Invoices',
    href: '/ui/invoices',
    icon: DocumentDuplicateIcon,
  },
  { name: 'Customers', href: '/ui/customers', icon: UserGroupIcon },
];

export default function NavLinks() {
  const pathname = usePathname();  // Get the current pathname

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        // Use clsx to conditionally apply class names based on the current pathname
        const linkClasses = clsx(
          'flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium',
          {
            'bg-sky-100 text-blue-600': pathname === link.href,  // Active link styles
            'bg-gray-50 text-gray-600': pathname !== link.href,  // Default styles for non-active links
            'hover:bg-sky-100 hover:text-blue-600': pathname !== link.href,  // Hover effect for non-active links
            'md:flex-none md:justify-start md:p-2 md:px-3': true,  // Styles for medium and larger screens
          }
        );

        return (
          <Link key={link.name} href={link.href} className={linkClasses}>
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
