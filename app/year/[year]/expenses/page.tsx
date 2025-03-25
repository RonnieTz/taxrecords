'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import styles from '../../../page.module.css';
import ExpenseSection from '@/components/ExpenseSection';
import FinancialSummary from '@/components/FinancialSummary';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FinancialRecord } from '../page';

export default function ExpensesPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = use(params);
  const [expenses, setExpenses] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log(error);

  // Calculate expense summary
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  // Fetch expense data on initial load
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch expenses
        const expenseRes = await fetch(`/api/expenses?year=${year}`);
        const expenseData = await expenseRes.json();

        if (expenseData.success) {
          setExpenses(expenseData.data);
        } else {
          setError('Failed to fetch expense data');
        }
      } catch (err) {
        setError('An error occurred while fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [year]);

  const handleAddExpense = (newExpense: FinancialRecord) => {
    setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
  };

  const handleErrorSet = (message: string) => {
    setError(message);
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  return (
    <main className={styles.main}>
      <div className={styles.yearHeader}>
        <h1>
          Expenses for {parseInt(year) - 1}/{parseInt(year)}
        </h1>
        <div className={styles.navigation}>
          <Link href="/" className={styles.homeButton}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.homeIcon}
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Home
          </Link>
          <Link href={`/year/${year}`} className={styles.backButton}>
            ← Back to Year Summary
          </Link>
          <Link href={`/year/${year}/income`} className={styles.navButton}>
            View Income →
          </Link>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
          <p>Loading expense data...</p>
        </div>
      ) : (
        <>
          <FinancialSummary
            totalIncome={0}
            totalExpenses={totalExpenses}
            netAmount={-totalExpenses}
            totalDeductions={0}
          />

          <div className={styles.singleSection}>
            <ExpenseSection
              expenses={expenses}
              year={year}
              onAddExpense={handleAddExpense}
              setError={handleErrorSet}
            />
          </div>
        </>
      )}
    </main>
  );
}
