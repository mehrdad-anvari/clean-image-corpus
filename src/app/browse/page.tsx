'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { fetchRecordsFromDatabase, countImages } from '@/lib/database';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    flexRender,
    SortingState,
} from '@tanstack/react-table';
import { useProject } from "@/context/projectContext";  // <--- import your context hook
import { ImageRecord } from '@/interfaces';


const PAGE_SIZE = 10;

export default function BrowsePage() {
    const { db, imagesDirHandle } = useProject();  // <--- get from context
    const [data, setData] = useState<ImageRecord[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [pageIndex, setPageIndex] = useState(0);
    const [sorting, setSorting] = useState<SortingState>([]);


    // Fetch total image count on mount or when db/imagesDirHandle change
    useEffect(() => {
        async function getTotal() {
            if (!db || !imagesDirHandle) return;
            const count = await countImages(db);
            setTotalCount(count ?? 0);
        }
        getTotal();
    }, [db, imagesDirHandle]);

    // Load paginated records
    useEffect(() => {
        async function loadPage() {
            if (!db || !imagesDirHandle) return;
            const records = await fetchRecordsFromDatabase(
                db,
                pageIndex * PAGE_SIZE,
                PAGE_SIZE
            );
            setData(records ?? []);
        }
        loadPage();
    }, [db, imagesDirHandle, pageIndex]);

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'File Name',
            },
            {
                accessorKey: 'width',
                header: 'Width',
            },
            {
                accessorKey: 'height',
                header: 'Height',
            },
            {
                accessorKey: 'format',
                header: 'Format',
            },
            {
                accessorKey: 'createdAt',
                header: 'Created At',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                cell: (info: any) =>
                    new Date(info.getValue()).toLocaleString(),
            },
            {
                accessorKey: 'updatedAt',
                header: 'Updated At',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                cell: (info: any) =>
                    new Date(info.getValue()).toLocaleString(),
            },
            {
                accessorKey: 'perceptualHash',
                header: 'Hash',
            },
        ],
        []
    );

    const table = useReactTable({
        data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    if (!db || !imagesDirHandle) {
        return (
            <div className="min-h-screen bg-neutral-900 text-white px-8 py-12">
                <h1 className="text-3xl font-semibold mb-8">📁 Browse Dataset</h1>
                <p className="text-neutral-400">Please open or create a project first.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white px-8 py-12">
            <h1 className="text-3xl font-semibold mb-8">📁 Browse Dataset</h1>

            <div className="overflow-auto rounded-lg border border-neutral-700">
                <table className="min-w-full table-auto text-left text-sm">
                    <thead className="bg-neutral-800 text-neutral-300">
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="px-4 py-3 cursor-pointer select-none"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {{
                                            asc: ' 🔼',
                                            desc: ' 🔽',
                                        }[header.column.getIsSorted() as string] ?? null}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id} className="border-t border-neutral-800 hover:bg-neutral-800">
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-4 py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="text-center py-4 text-neutral-500">
                                    No images found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="mt-4 flex justify-center space-x-4">
                <button
                    className="px-4 py-2 bg-neutral-700 rounded disabled:opacity-50"
                    disabled={pageIndex === 0}
                    onClick={() => setPageIndex(i => Math.max(i - 1, 0))}
                >
                    Previous
                </button>
                <span className="px-4 py-2">
                    Page {pageIndex + 1} of {totalPages || 1}
                </span>
                <button
                    className="px-4 py-2 bg-neutral-700 rounded disabled:opacity-50"
                    disabled={pageIndex + 1 >= totalPages}
                    onClick={() => setPageIndex(i => i + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}
