'use client';
import { FinancialRecord } from '@/app/year/[year]/page';
import FinancialGrid from './FinancialGrid';
import FinancialForm from './FinancialForm';
import styles from '../app/page.module.css';
import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import type { FormData } from '@/components/FinancialForm';
import { useSession } from 'next-auth/react';
import { addExpense, deleteExpense } from '@/app/actions/expenses';

// Extending the imported type locally if necessary
interface ExtendedFinancialRecord extends FinancialRecord {
  _id?: string;
  id?: string;
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
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<ExtendedFinancialRecord[]>(
    initialExpenses as ExtendedFinancialRecord[]
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);

  // Handle adding expense
  const handleExpenseSubmit = async (formData: FormData) => {
    try {
      const amount =
        typeof formData.amount === 'string'
          ? parseFloat(formData.amount)
          : formData.amount || 0;

      const yearNumber = parseInt(year);

      if (!session?.user?.id) {
        setError('You must be logged in to add expense records');
        return;
      }

      // Use addExpense server action instead of fetch
      const result = await addExpense(
        formData.description as string,
        amount,
        new Date(formData.date as string),
        formData.category as string,
        yearNumber // Add the year parameter here
      );

      if (result.success) {
        const newExpense = {
          ...result.data,
          year: yearNumber,
        };
        setExpenses((prev) => [...prev, newExpense]);
        onAddExpense(newExpense);
      } else {
        setError('Failed to add expense');
      }
    } catch (err) {
      console.error('Error adding expense:', err);
      setError('An error occurred while adding expense');
    }
  };

  // Handle deleting expense
  const handleDeleteExpense = async (id: string) => {
    setIsDeleting(true);
    setCurrentOperation(`Deleting expense record ${id}`);

    console.log(`Attempting to delete expense with ID: ${id}`);

    try {
      if (!session?.user?.id) {
        setError('You must be logged in to delete expense records');
        setIsDeleting(false);
        return;
      }

      // First determine if we're dealing with an ObjectID from MongoDB or a string ID
      const mongoIdPattern = /^[0-9a-fA-F]{24}$/;
      const isMongoId = mongoIdPattern.test(id);

      // Find the actual record for better error handling
      const recordToDelete = expenses.find((expense) =>
        isMongoId ? expense._id === id : expense.id === id
      );

      if (!recordToDelete) {
        console.error(`Could not find expense record with ID: ${id}`);
        setError(`Could not find expense record to delete (ID: ${id})`);
        setIsDeleting(false);
        return;
      }

      // Determine the correct ID to use (_id for MongoDB, id for other storage)
      const apiId = recordToDelete._id || recordToDelete.id;
      console.log(`Using API ID for deletion: ${apiId}`);

      // Use deleteExpense server action instead of fetch
      const result = await deleteExpense(apiId as string);
      console.log('Delete API response:', result);

      if (result.success) {
        console.log(`Successfully deleted expense with ID: ${id}`);
        // Update local state to remove the deleted item
        setExpenses((prev) =>
          prev.filter((expense) =>
            isMongoId ? expense._id !== id : expense.id !== id
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
