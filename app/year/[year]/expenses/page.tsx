'use client';
import { use } from 'react';
import Link from 'next/link';
import styles from '../../../page.module.css';
import ExpenseSection from '@/components/ExpenseSection';
import FinancialSummary from '@/components/FinancialSummary';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useFinancialData } from '@/hooks/useFinancialData';

export default function ExpensesPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = use(params);
  const {
    expenses,
    loading,
    totalIncome,
    totalExpenses,
    netAmount,
    totalDeductions,
    handleUpdateExpenses,
    handleErrorSet,
  } = useFinancialData(year);

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
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            netAmount={netAmount}
            totalDeductions={totalDeductions}
          />

          <div className={styles.singleSection}>
            <ExpenseSection
              expenses={expenses}
              year={year}
              onAddExpense={handleUpdateExpenses}
              setError={handleErrorSet}
            />
          </div>
        </>
      )}
    </main>
  );
}
