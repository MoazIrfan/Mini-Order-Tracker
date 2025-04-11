"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { Funnel } from "lucide-react"; 
import { flexRender, useReactTable, createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import { debounce } from "lodash";
import { api } from "~/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"


type OrderType = {
  customer: {
    name: string;
    address: string;
  };
  fulfillmentStatus: string;
  orderLineItems: { product: { name: string } }[];
};

const statusColor = {
  PENDING: "bg-yellow-500",
  FULFILLED: "bg-green-500",
  CANCELLED: "bg-red-500",
  SHIPPED: "bg-blue-500",
  RETURNED: "bg-purple-500",
} as const;

const columnHelper = createColumnHelper<OrderType>();

const columns = [
  columnHelper.accessor('customer.name', {
    header: 'Customer Name',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('customer.address', {
    header: 'Address',
    cell: info => info.getValue(),
  }),
  columnHelper.accessor('fulfillmentStatus', {
    header: 'Status',
    cell: info => {
      const status = info.getValue() as string;

      // Convert to Pascal Case
      const displayStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

      return (
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full shrink-0 ${statusColor[status as keyof typeof statusColor] || "bg-gray-400"}`} />
          <span>{displayStatus}</span>
        </div>
      );
    },
  }),
  columnHelper.accessor('orderLineItems', {
    header: 'Products Ordered',
    cell: (info) => info.getValue().map(item => item.product.name).join(', '),
  }),
];


export function OrdersTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); 
  const [filterStatus, setFilterStatus] = useState<"PENDING" | "FULFILLED" | "CANCELLED" | "SHIPPED" | "RETURNED" | undefined>(undefined);

  const limit = 10;
  const inputRef = useRef<HTMLInputElement | null>(null);

  // debounce search input
  const debouncedSetSearch = useMemo(() => debounce((val: string) => {
    setDebouncedSearch(val);
    setPage(1);
  }, 2000), []);

  useEffect(() => {
    debouncedSetSearch(search);

    return () => {
      debouncedSetSearch.cancel();
    };
  }, [search]);

  const { data, isLoading } = api.orders.list.useQuery({
    page,
    limit,
    status: filterStatus,
    search: debouncedSearch,
  });

  // Autofocus logic on page load
  useEffect(() => {
    // Focus if there’s a value in the search field
    if (inputRef.current && search) {
      inputRef.current.focus(); 
    }
  }, [data]);
  
  const table = useReactTable({
    data: data?.orders || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <p>Loading...</p>;
  
  return (
    <div className="space-y-4 table-wrapper">
      <h1 className="text-2xl font-bold mb-4">Orders List</h1>

      <div className="flex items-center justify-between">
        {/* Search Field */}
        <Input
          className="custom-input"
          type="text"
          placeholder="Search customer"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          ref={inputRef}
        />
        
        
        {/* Filter */}
        <Select
          value={filterStatus}
          onValueChange={(value) => {
            setFilterStatus(value === "all" ? undefined : value as "PENDING" | "FULFILLED" | "CANCELLED" | "SHIPPED" | "RETURNED");
            setPage(1); // reset to first page when filter changes
          }}
        >
          <SelectTrigger className="custom-select">
            <Funnel className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="SHIPPED">Shipped</SelectItem>
            <SelectItem value="FULFILLED">Fulfilled</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="RETURNED">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Table className="custom-table">
        {/* Table Header */}
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} >
              {headerGroup.headers.map(header => (
                <TableHead  key={header.id} >
                  {typeof header.column.columnDef.header === 'function'
                    ? header.column.columnDef.header(header.getContext())
                    : header.column.columnDef.header}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        {/* Table Body */}
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id} >
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <Button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-4 py-2  rounded disabled:opacity-50"
        >
          Previous
        </Button>

        <span className="text-sm text-cyber">
          Page {page} of {data?.totalPages}
        </span>

        <Button
          disabled={page === data?.totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2  rounded disabled:opacity-50"
        >
          Next
        </Button>
      </div>
  
    </div>
  );
}
