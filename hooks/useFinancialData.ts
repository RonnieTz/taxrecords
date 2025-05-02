import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getIncomes } from '@/app/actions/incomes';
import { getExpenses } from '@/app/actions/expenses';
import { FinancialRecord } from '@/app/year/[year]/page';

export function useFinancialData(year: string) {
  const { data: session } = useSession();
  const [incomes, setIncomes] = useState<FinancialRecord[]>([]);
  const [expenses, setExpenses] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate financial summaries
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

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Check if session is still loading
        if (session === undefined) {
          return; // Wait for session to be determined
        }

        if (!session?.user?.id) {
          console.log('No user session found');
          setError('User not authenticated. Please sign in to view data.');
          setLoading(false);
          return;
        }

        console.log('Fetching data for year:', year, 'user:', session.user.id);

        // Fetch incomes
        try {
          const incomeRes = await getIncomes(parseInt(year));
          console.log('Income API response:', incomeRes);

          if (incomeRes.success) {
            setIncomes(
              incomeRes.data?.map((income) => ({
                ...income,
                year: parseInt(year),
                taxDeductions: income.taxDeductions || 0,
              })) || []
            );
          } else {
            console.error('Income fetch failed:', incomeRes.message);
            setError(incomeRes.message || 'Failed to fetch income data');
          }
        } catch (incomeErr) {
          console.error('Income fetch error:', incomeErr);
          setError('Error fetching income data');
        }

        // Fetch expenses
        try {
          const expenseRes = await getExpenses(parseInt(year));
          console.log('Expense API response:', expenseRes);

          if (expenseRes.success) {
            setExpenses(
              expenseRes.data?.map((expense) => ({
                ...expense,
                year: parseInt(year),
              })) || []
            );
          } else {
            console.error('Expense fetch failed:', expenseRes.message);
            setError('Failed to fetch expense data');
          }
        } catch (expenseErr) {
          console.error('Expense fetch error:', expenseErr);
          setError('Error fetching expense data');
        }
      } catch (err) {
        console.error('General fetch error:', err);
        setError('An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [year, session]);

  const handleUpdateIncomes = (newIncome: FinancialRecord) => {
    setIncomes((prevIncomes) => [...prevIncomes, newIncome]);
  };

  const handleUpdateExpenses = (newExpense: FinancialRecord) => {
    setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
  };

  const handleErrorSet = (message: string) => {
    setError(message);
    // Clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  return {
    incomes,
    expenses,
    loading,
    error,
    totalIncome,
    totalExpenses,
    netAmount,
    totalDeductions,
    handleUpdateIncomes,
    handleUpdateExpenses,
    handleErrorSet,
  };
}
