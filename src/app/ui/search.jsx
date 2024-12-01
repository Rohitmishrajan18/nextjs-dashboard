'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function Search({ placeholder }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  function handleSearch(term) {
    const params = new URLSearchParams(searchParams); // Create a new URLSearchParams instance
    if (term) {
      params.set('query', term); // Set the 'query' parameter with the user's input
    } else {
      params.delete('query'); // Remove 'query' parameter if input is empty
    }
    router.replace(`${pathname}?${params.toString()}`); // Update the URL dynamically
  }

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        id="search"
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        onChange={(e) => {
          handleSearch(e.target.value); // Handle search input changes
        }}
        defaultValue={searchParams.get('query')?.toString()} // Populate input with the 'query' parameter if it exists
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
