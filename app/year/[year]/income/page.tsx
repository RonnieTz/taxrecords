'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import styles from '../../../page.module.css';
import IncomeSection from '@/components/IncomeSection';
import FinancialSummary from '@/components/FinancialSummary';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FinancialRecord } from '../page';

export default function IncomePage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = use(params);
  const [incomes, setIncomes] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log(error);

  // Calculate income summary
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalDeductions = incomes.reduce(
    (sum, income) => sum + (income.taxDeductions || 0),
    0
  );

  // Fetch income data on initial load
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch income
        const incomeRes = await fetch(`/api/income?year=${year}`);
        const incomeData = await incomeRes.json();

        if (incomeData.success) {
          setIncomes(incomeData.data);
        } else {
          setError('Failed to fetch income data');
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

  const handleAddIncome = (newIncome: FinancialRecord) => {
    setIncomes((prevIncomes) => [...prevIncomes, newIncome]);
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
          Income for {parseInt(year) - 1}/{parseInt(year)}
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
          <Link href={`/year/${year}/expenses`} className={styles.navButton}>
            View Expenses →
          </Link>
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
          <p>Loading income data...</p>
        </div>
      ) : (
        <>
          <FinancialSummary
            totalIncome={totalIncome}
            totalExpenses={0}
            netAmount={totalIncome}
            totalDeductions={totalDeductions}
          />

          <div className={styles.singleSection}>
            <IncomeSection
              incomes={incomes}
              year={year}
              onAddIncome={handleAddIncome}
              setError={handleErrorSet}
            />
          </div>
        </>
      )}
    </main>
  );
}
