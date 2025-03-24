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

interface ExpenseSectionProps {
  expenses: FinancialRecord[];
  year: string;
  onAddExpense: (newExpense: FinancialRecord) => void;
  setError: (message: string) => void;
}

export default function ExpenseSection({
  expenses: initialExpenses,
  year,
  onAddExpense,
  setError,
}: ExpenseSectionProps) {
  const [expenses, setExpenses] = useState<ExtendedFinancialRecord[]>(
    initialExpenses as ExtendedFinancialRecord[]
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);

  // Handle adding expense
  const handleExpenseSubmit = async (formData: any) => {
    try {
      const response = await fetch('/api/expenses', {
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
        const newExpense = result.data;
        setExpenses((prev) => [...prev, newExpense]);
        onAddExpense(newExpense);
      } else {
        setError('Failed to add expense');
      }
    } catch (err) {
      setError('An error occurred while adding expense');
    }
  };

  // Handle deleting expense
  const handleDeleteExpense = async (id: string) => {
    setIsDeleting(true);
    setCurrentOperation(`Deleting expense record ${id}`);

    console.log(`Attempting to delete expense with ID: ${id}`);

    try {
      // First determine if we're dealing with an ObjectID from MongoDB or a string ID
      const mongoIdPattern = /^[0-9a-fA-F]{24}$/;
      const isMongoId = mongoIdPattern.test(id);

      // Find the actual record for better error handling
      const recordToDelete = expenses.find((expense) =>
        isMongoId ? expense._id === id : (expense as any).id === id
      );

      if (!recordToDelete) {
        console.error(`Could not find expense record with ID: ${id}`);
        setError(`Could not find expense record to delete (ID: ${id})`);
        setIsDeleting(false);
        return;
      }

      // Determine the correct ID to use (_id for MongoDB, id for other storage)
      const apiId = recordToDelete._id || (recordToDelete as any).id;
      console.log(`Using API ID for deletion: ${apiId}`);

      const response = await fetch(`/api/expenses?id=${apiId}`, {
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
        console.log(`Successfully deleted expense with ID: ${id}`);
        // Update local state to remove the deleted item
        setExpenses((prev) =>
          prev.filter((expense) =>
            isMongoId ? expense._id !== id : (expense as any).id !== id
          )
        );
      } else {
        console.error('Delete API returned success: false', result);
        setError(
          `Failed to delete expense: ${result.message || 'Unknown error'}`
        );
      }
    } catch (err) {
      console.error('Error during expense deletion:', err);
      setError(
        `An error occurred while deleting expense: ${
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
      <h2>Expenses</h2>
      {isDeleting && (
        <div className={styles.loadingOverlay}>
          <LoadingSpinner />
          <p>{currentOperation}</p>
        </div>
      )}
      <FinancialGrid
        data={expenses}
        title="Expenses"
        onDelete={handleDeleteExpense}
      />
      <FinancialForm
        type="expense"
        onSubmit={handleExpenseSubmit}
        idPrefix="exp_"
        year={parseInt(year)}
      />
    </div>
  );
}
