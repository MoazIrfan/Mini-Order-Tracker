"use client";
import { Funnel, Circle } from "lucide-react"; 
import { useState, useMemo } from "react";
import { api } from "~/trpc/react";
import { flexRender, useReactTable, createColumnHelper, getCoreRowModel } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

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
          {/* <Circle className={`h-3 w-3 ${statusColor[status as keyof typeof statusColor]}`} /> */}
          <div
        className={`h-3 w-3 rounded-full shrink-0 ${statusColor[status as keyof typeof statusColor] || "bg-gray-400"}`}
      />
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

  const limit = 10;
  const { data, isLoading } = api.orders.list.useQuery({
    page,
    limit,
  });

  const table = useReactTable({
    data: data?.orders || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <p>Loading...</p>;
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">Fulfillment Orders</h1>

      {/* Table */}
      <Table>
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

    </div>
  );
}
