'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import styles from '../../page.module.css';
import FinancialSummary from '@/components/FinancialSummary';
import { IncomeSection } from '@/components';
import ExpenseSection from '@/components/ExpenseSection';

export interface FinancialRecord {
  date: string;
  description: string;
  category: string;
  amount: number;
}

export default function YearPage() {
  const params = useParams();
  const year = params?.year as string;
  const [incomes, setIncomes] = useState<FinancialRecord[]>([]);
  const [expenses, setExpenses] = useState<FinancialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Calculate totals
  const totalIncome = incomes.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netAmount = totalIncome - totalExpenses;

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');

      try {
        // Fetch incomes
        const incomeRes = await fetch(`/api/income?year=${year}`);
        const incomeData = await incomeRes.json();

        // Fetch expenses
        const expenseRes = await fetch(`/api/expenses?year=${year}`);
        const expenseData = await expenseRes.json();

        if (incomeData.success && expenseData.success) {
          setIncomes(incomeData.data);
          setExpenses(expenseData.data);
        } else {
          setError('Failed to fetch data');
        }
      } catch (err) {
        console.log(err);

        setError('An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [year]);

  // Handle adding a new income record
  const handleAddIncome = (newIncome: FinancialRecord) => {
    setIncomes([...incomes, newIncome]);
  };

  // Handle adding a new expense record
  const handleAddExpense = (newExpense: FinancialRecord) => {
    setExpenses([...expenses, newExpense]);
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading data...</div>;
  }

  return (
    <div className={styles.yearPage}>
      <div className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← Back to Years
        </Link>
        <h1>Tax Records for {year}</h1>
        <FinancialSummary
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          netAmount={netAmount}
        />
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.tablesContainer}>
        <IncomeSection
          incomes={incomes}
          year={year as string}
          onAddIncome={handleAddIncome}
          setError={setError}
        />

        <ExpenseSection
          expenses={expenses}
          year={year as string}
          onAddExpense={handleAddExpense}
          setError={setError}
        />
      </div>
    </div>
  );
}
