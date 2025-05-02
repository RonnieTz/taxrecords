'use client';
import { FinancialRecord } from '@/app/year/[year]/page';
import FinancialGrid from './FinancialGrid';
import FinancialForm, { FormData as FinancialFormData } from './FinancialForm';
import styles from '../app/page.module.css';
import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { addIncome, deleteIncome } from '@/app/actions/incomes';
import { useSession } from 'next-auth/react';

// Extending the imported type locally if necessary
interface ExtendedFinancialRecord extends FinancialRecord {
  _id?: string;
  id?: string;
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
  const { data: session } = useSession();
  const [incomes, setIncomes] = useState<ExtendedFinancialRecord[]>(
    initialIncomes as ExtendedFinancialRecord[]
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [currentOperation, setCurrentOperation] = useState<string | null>(null);

  // Handle adding income
  const handleIncomeSubmit = async (formData: FinancialFormData) => {
    try {
      const amount =
        typeof formData.amount === 'string'
          ? parseFloat(formData.amount)
          : formData.amount || 0;

      const taxDeductions =
        typeof formData.taxDeductions === 'string'
          ? parseFloat(formData.taxDeductions)
          : formData.taxDeductions || 0;

      const yearNumber = parseInt(year);

      if (!session?.user?.id) {
        setError('You must be logged in to add income records');
        return;
      }

      // Use addIncome server action with year parameter
      const result = await addIncome(
        formData.description,
        amount,
        new Date(formData.date),
        formData.category,
        yearNumber, // Pass the year parameter
        taxDeductions
      );

      if (result.success) {
        const newIncome = {
          ...result.data,
          year: yearNumber,
        };
        setIncomes((prev) => [...prev, newIncome]);
        onAddIncome(newIncome);
      } else {
        setError('Failed to add income');
      }
    } catch (err) {
      console.error('Error adding income:', err);
      setError('An error occurred while adding income');
    }
  };

  // Handle deleting income
  const handleDeleteIncome = async (id: string) => {
    setIsDeleting(true);
    setCurrentOperation(`Deleting income record ${id}`);

    console.log(`Attempting to delete income with ID: ${id}`);

    try {
      if (!session?.user?.id) {
        setError('You must be logged in to delete income records');
        setIsDeleting(false);
        return;
      }

      // First determine if we're dealing with an ObjectID from MongoDB or a string ID
      const mongoIdPattern = /^[0-9a-fA-F]{24}$/;
      const isMongoId = mongoIdPattern.test(id);

      // Find the actual record for better error handling
      const recordToDelete = incomes.find((income) =>
        isMongoId ? income._id === id : income.id === id
      );

      if (!recordToDelete) {
        console.error(`Could not find income record with ID: ${id}`);
        setError(`Could not find income record to delete (ID: ${id})`);
        setIsDeleting(false);
        return;
      }

      // Determine the correct ID to use (_id for MongoDB, id for other storage)
      const apiId = recordToDelete._id || recordToDelete.id;
      console.log(`Using API ID for deletion: ${apiId}`);

      // Use deleteIncome server action instead of fetch
      const result = await deleteIncome(apiId as string);
      console.log('Delete API response:', result);

      if (result.success) {
        console.log(`Successfully deleted income with ID: ${id}`);
        // Update local state to remove the deleted item
        setIncomes((prev) =>
          prev.filter((income) =>
            isMongoId ? income._id !== id : income.id !== id
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
