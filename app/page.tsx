'use client';
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import styles from './page.module.css';
import Link from 'next/link';

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
      try {
        const response = await fetch('/api/years');
        const result = await response.json();

        if (result.success) {
          setYears(result.data);
        } else {
          setError('Failed to fetch years');
        }
      } catch (e) {
        console.log(e);

        setError('An error occurred while fetching years');
      } finally {
        setIsLoading(false);
      }
    };

    fetchYears();
  }, []);

  const handleAddYear = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newYear || isNaN(Number(newYear))) {
      setError('Please enter a valid year');
      return;
    }

    try {
      const response = await fetch('/api/years', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ year: Number(newYear) }),
      });

      const result = await response.json();

      if (result.success) {
        setYears([result.data, ...years]);
        setNewYear('');
        setError('');
      } else {
        setError('Failed to add year');
      }
    } catch (error) {
      console.error(error);
      setError('An error occurred while adding year');
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

        {isLoading ? (
          <p>Loading years...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : years.length === 0 ? (
          <p>No years found. Add a new year below.</p>
        ) : (
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
      </div>
    </div>
  );
}
