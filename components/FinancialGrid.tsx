'use client';
import { useRef, useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ColDef,
  ICellRendererParams,
  GridApi,
  GridReadyEvent,
} from 'ag-grid-community';
import { FinancialRecord } from '../app/year/[year]/page';
import styles from '../app/page.module.css';

import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

interface FinancialGridProps {
  data: FinancialRecord[];
  title: string;
  onDelete?: (id: string) => void;
}

// Extended interface to handle MongoDB or other data sources
interface GridRecord extends FinancialRecord {
  _id?: string;
  id?: string;
}

// Action Cell Renderer Component
const ActionCellRenderer = (
  props: ICellRendererParams & { onDelete: (id: string) => void }
) => {
  const [showConfirmButtons, setShowConfirmButtons] = useState(false);

  const recordId =
    (props.data as GridRecord)._id || (props.data as GridRecord).id;

  const handleDeleteClick = () => {
    setShowConfirmButtons(true);
  };

  const handleConfirmDelete = () => {
    if (props.onDelete && recordId) {
      props.onDelete(recordId);
    }
    setShowConfirmButtons(false);
  };

  const handleCancelDelete = () => {
    setShowConfirmButtons(false);
  };

  return (
    <div className={styles.actionButtons}>
      {!showConfirmButtons ? (
        <button
          onClick={handleDeleteClick}
          className={styles.deleteButton}
          title={`Delete record (ID: ${recordId})`}
        >
          Delete
        </button>
      ) : (
        <>
          <button
            onClick={handleConfirmDelete}
            className={styles.confirmButton}
          >
            Confirm
          </button>
          <button onClick={handleCancelDelete} className={styles.cancelButton}>
            Cancel
          </button>
        </>
      )}
    </div>
  );
};

export default function FinancialGrid({
  data,

  onDelete,
}: FinancialGridProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  // Set up the grid API when it's ready
  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
  };

  // Update the grid when data changes
  useEffect(() => {
    if (gridApi) {
      gridApi.setGridOption('rowData', data);
    }
  }, [data, gridApi]);

  const columns: ColDef<FinancialRecord>[] = [
    {
      headerName: 'ID',
      sortable: true,
      filter: true,
      hide: process.env.NODE_ENV === 'production', // Only show in development
      valueGetter: (params) => {
        return (
          (params.data as GridRecord)._id ||
          (params.data as GridRecord).id ||
          'No ID'
        );
      },
    },
    {
      field: 'date' as keyof FinancialRecord,
      headerName: 'Date',
      sortable: true,
      filter: true,
      valueFormatter: (params: { value: string | number | Date }) =>
        new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'description' as keyof FinancialRecord,
      headerName: 'Description',
      sortable: true,
      filter: true,
    },
    {
      field: 'category' as keyof FinancialRecord,
      headerName: 'Category',
      sortable: true,
      filter: true,
    },
    {
      field: 'amount' as keyof FinancialRecord,
      headerName: 'Amount ($)',
      sortable: true,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params: { value: number }) => params.value.toFixed(2),
    },
    {
      field: 'taxDeductions' as keyof FinancialRecord,
      headerName: 'Tax Deductions ($)',
      sortable: true,
      filter: 'agNumberColumnFilter',
      valueFormatter: (params: { value: number }) =>
        params.value ? params.value.toFixed(2) : '0.00',
    },
    // Add action column with delete button
    {
      headerName: 'Actions',
      width: 120,
      cellRenderer: (params: ICellRendererParams) =>
        ActionCellRenderer({ ...params, onDelete: onDelete || (() => {}) }),
      sortable: false,
      filter: false,
    },
  ];

  return (
    <div
      className={`${styles.grid} ag-theme-quartz`}
      style={{ height: '400px', width: '100%' }}
    >
      <AgGridReact
        ref={gridRef}
        rowData={data}
        columnDefs={columns}
        defaultColDef={{
          flex: 1,
          minWidth: 100,
          resizable: true,
        }}
        animateRows={true}
        pagination={true}
        paginationPageSize={10}
        onGridReady={onGridReady}
      />
    </div>
  );
}
