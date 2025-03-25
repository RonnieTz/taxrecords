'use client';
import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import styles from '../../page.module.css';
import IncomeSection from '@/components/IncomeSection';
import ExpenseSection from '@/components/ExpenseSection';
import FinancialSummary from '@/components/FinancialSummary';
import LoadingSpinner from '@/components/LoadingSpinner';
// import Alert from '@/components/Alert';

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
  if (error) {
    console.log(error);
  }
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

  const handleAddIncome = (newIncome: FinancialRecord) => {
    setIncomes((prevIncomes) => [...prevIncomes, newIncome]);
  };

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
          Tax Records for {year}/{parseInt(year) + 1}
        </h1>
        <Link href="/" className={styles.backButton}>
          ← Back to Years
        </Link>
      </div>

      {/* {error && <Alert message={error} type="error" />} */}

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

          <div className={styles.grid}>
            <IncomeSection
              incomes={incomes}
              year={year}
              onAddIncome={handleAddIncome}
              setError={handleErrorSet}
            />
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
