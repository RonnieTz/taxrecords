'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import styles from '../../page.module.css';
import FinancialSummary from '@/components/FinancialSummary';
import LoadingSpinner from '@/components/LoadingSpinner';

export interface FinancialRecord {
  _id?: string;
  id?: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  year: number;
  taxDeductions?: number;
}

export default function YearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = use(params);
  const [incomes, setIncomes] = useState<FinancialRecord[]>([]);
  const [expenses, setExpenses] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log(error);

  // Calculate financial summary
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const netAmount = totalIncome - totalExpenses;
  const totalDeductions = incomes.reduce(
    (sum, income) => sum + (income.taxDeductions || 0),
    0
  );

  // Fetch income and expenses on initial load
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

  return (
    <main className={styles.main}>
      <div className={styles.yearHeader}>
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
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Home
          </Link>
        </div>
        <h1>
          Tax Records for {parseInt(year) - 1}/{parseInt(year)}
        </h1>
        <Link href="/" className={styles.backButton}>
          ← Back to Years
        </Link>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
          <p>Loading financial data...</p>
        </div>
      ) : (
        <>
          <FinancialSummary
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            netAmount={netAmount}
            totalDeductions={totalDeductions}
          />

          <div className={styles.sectionCards}>
            <Link href={`/year/${year}/income`} className={styles.sectionCard}>
              <h2>Income</h2>
              <div className={styles.sectionSummary}>
                <p>
                  <strong>Total:</strong> ${totalIncome.toFixed(2)}
                </p>
                <p>
                  <strong>Records:</strong> {incomes.length}
                </p>
                <p>
                  <strong>Tax Deductions:</strong> ${totalDeductions.toFixed(2)}
                </p>
              </div>
              <div className={styles.viewButton}>View Income Section</div>
            </Link>

            <Link
              href={`/year/${year}/expenses`}
              className={styles.sectionCard}
            >
              <h2>Expenses</h2>
              <div className={styles.sectionSummary}>
                <p>
                  <strong>Total:</strong> ${totalExpenses.toFixed(2)}
                </p>
                <p>
                  <strong>Records:</strong> {expenses.length}
                </p>
              </div>
              <div className={styles.viewButton}>View Expenses Section</div>
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
