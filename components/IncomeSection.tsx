'use client';
import { FinancialRecord } from '@/app/year/[year]/page';
import FinancialGrid from './FinancialGrid';
import FinancialForm from './FinancialForm';
import styles from '../app/page.module.css';
import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

// Extending the imported type locally if necessary
interface ExtendedFinancialRecord extends FinancialRecord {
  _id?: string;
}

interface IncomeSectionProps {
  incomes: FinancialRecord[];
  year: string;
  onAddIncome: (newIncome: FinancialRecord) => void;
  setError: (message: string) => void;
}

export default function IncomeSection({
  incomes: initialIncomes,
  year,
  onAddIncome,
  setError,
}: IncomeSectionProps) {
  const [incomes, setIncomes] = useState<ExtendedFinancialRecord[]>(
    initialIncomes as ExtendedFinancialRecord[]
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);

  // Handle adding income
  const handleIncomeSubmit = async (formData: any) => {
    try {
      const response = await fetch('/api/income', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          year: parseInt(year),
        }),
      });

      const result = await response.json();

      if (result.success) {
        const newIncome = result.data;
        setIncomes((prev) => [...prev, newIncome]);
        onAddIncome(newIncome);
      } else {
        setError('Failed to add income');
      }
    } catch (err) {
      setError('An error occurred while adding income');
    }
  };

  // Handle deleting income
  const handleDeleteIncome = async (id: string) => {
    setIsDeleting(true);
    setCurrentOperation(`Deleting income record ${id}`);

    console.log(`Attempting to delete income with ID: ${id}`);

    try {
      // First determine if we're dealing with an ObjectID from MongoDB or a string ID
      const mongoIdPattern = /^[0-9a-fA-F]{24}$/;
      const isMongoId = mongoIdPattern.test(id);

      // Find the actual record for better error handling
      const recordToDelete = incomes.find((income) =>
        isMongoId ? income._id === id : (income as any).id === id
      );

      if (!recordToDelete) {
        console.error(`Could not find income record with ID: ${id}`);
        setError(`Could not find income record to delete (ID: ${id})`);
        setIsDeleting(false);
        return;
      }

      // Determine the correct ID to use (_id for MongoDB, id for other storage)
      const apiId = recordToDelete._id || (recordToDelete as any).id;
      console.log(`Using API ID for deletion: ${apiId}`);

      const response = await fetch(`/api/income?id=${apiId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Server responded with ${response.status}: ${errorText}`
        );
      }

      const result = await response.json();
      console.log('Delete API response:', result);

      if (result.success) {
        console.log(`Successfully deleted income with ID: ${id}`);
        // Update local state to remove the deleted item
        setIncomes((prev) =>
          prev.filter((income) =>
            isMongoId ? income._id !== id : (income as any).id !== id
          )
        );
      } else {
        console.error('Delete API returned success: false', result);
        setError(
          `Failed to delete income: ${result.message || 'Unknown error'}`
        );
      }
    } catch (err) {
      console.error('Error during income deletion:', err);
      setError(
        `An error occurred while deleting income: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsDeleting(false);
      setCurrentOperation(null);
    }
  };

  return (
    <div className={styles.tableSection}>
      <h2>Income</h2>
      {isDeleting && (
        <div className={styles.loadingOverlay}>
          <LoadingSpinner />
          <p>{currentOperation}</p>
        </div>
      )}
      <FinancialGrid
        data={incomes}
        title="Income"
        onDelete={handleDeleteIncome}
      />
      <FinancialForm
        type="income"
        onSubmit={handleIncomeSubmit}
        idPrefix="inc_"
        year={parseInt(year)}
      />
    </div>
  );
}
