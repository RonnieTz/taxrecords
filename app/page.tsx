'use client';
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import styles from './page.module.css';
import Link from 'next/link';
import { getYears, addYear } from './actions/years';

interface YearData {
  _id: string;
  year: number;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [years, setYears] = useState<YearData[]>([]);
  const [newYear, setNewYear] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchYears = async () => {
      setIsLoading(true);
      setError('');
      try {
        if (!session?.user?.id) {
          setError('User not found');
          return;
        }
        const result = await getYears();
        if (result.success && Array.isArray(result.data)) {
          setYears(result.data);
        } else {
          setError('Failed to fetch years');
        }
      } catch (e) {
        console.error(e);
        setError('An error occurred while fetching years');
      } finally {
        setIsLoading(false);
      }
    };

    fetchYears();
  }, [session]);

  const handleAddYear = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newYear || isNaN(Number(newYear))) {
      setError('Please enter a valid year');
      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!session?.user?.id) {
      setError('User not found');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setIsLoading(true);
    try {
      const result = await addYear(Number(newYear));
      if (result.success && result.data) {
        setYears([result.data as YearData, ...years]);
        setNewYear('');
      } else {
        setError(result.message || 'Failed to add year');
        // Clear error message after 3 seconds
        setTimeout(() => setError(''), 3000);
      }
    } catch (e) {
      console.error(e);
      setError('An error occurred while adding year');
      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return (
      <div className={styles.page}>
        <h1>Tax Records Management</h1>
        <div className={styles.auth}>
          <p>Please sign in to access your tax records</p>
          <button onClick={() => signIn()}>Sign In</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Tax Records Management</h1>
        <div className={styles.profile}>
          <span>Welcome, {session.user?.name}</span>
          <button onClick={() => signOut()}>Sign Out</button>
        </div>
      </div>

      <div className={styles.yearSelector}>
        <h2>Select a Year to View Records</h2>

        {isLoading && <p>Loading years...</p>}

        {!isLoading && years.length === 0 && !error && (
          <p>No years found. Add a new year below.</p>
        )}

        {years.length > 0 && (
          <div className={styles.yearGrid}>
            {years.map((yearData) => (
              <Link
                key={yearData._id}
                href={`/year/${yearData.year}`}
                className={styles.yearCard}
              >
                <h3>{yearData.year}</h3>
                <p>View Records</p>
              </Link>
            ))}
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        {!isLoading && (
          <div className={styles.addYearForm}>
            <h3>Add a New Year</h3>
            <form onSubmit={handleAddYear}>
              <input
                type="number"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                placeholder="Enter year (e.g., 2023)"
                min="1900"
                max="2100"
                required
              />
              <button type="submit">Add Year</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
