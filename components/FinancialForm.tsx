'use client';
import { useState, useMemo } from 'react';
import styles from './FinancialForm.module.css';

export interface FormData {
  date: string;
  description: string;
  category: string;
  amount: string | number;
  taxDeductions?: string | number;
}

interface FinancialFormProps {
  type: 'income' | 'expense';
  onSubmit: (formData: FormData) => Promise<void>;
  idPrefix?: string;
  year: number; // Add year prop
}

export default function FinancialForm({
  type,
  onSubmit,
  idPrefix = '',
  year,
}: FinancialFormProps) {
  // Calculate min and max dates for the tax year
  const { minDate, maxDate, defaultDate } = useMemo(() => {
    const minDate = `${year - 1}-04-06`; // April 6th of previous year
    const maxDate = `${year}-04-05`; // April 5th of current year

    // Get today's date for future date restriction
    const today = new Date().toISOString().split('T')[0];

    // Use the earlier of today or maxDate as the actual max
    const effectiveMaxDate = today < maxDate ? today : maxDate;

    // Set default date to today if it's within the valid range, otherwise use the effectiveMaxDate
    const defaultDate =
      today >= minDate && today <= effectiveMaxDate ? today : effectiveMaxDate;

    return { minDate, maxDate: effectiveMaxDate, defaultDate };
  }, [year]);

  const [formData, setFormData] = useState({
    date: defaultDate,
    description: '',
    category: type === 'income' ? 'Salary' : '', // Set default category to 'Salary' for income
    amount: '',
    taxDeductions: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);

    // Reset form
    setFormData({
      date: defaultDate,
      description: '',
      category: type === 'income' ? 'Salary' : '', // Keep 'Salary' as default for income after reset
      amount: '',
      taxDeductions: '',
    });
  };

  // Suggested categories based on type
  const suggestedCategories =
    type === 'income'
      ? ['Salary', 'Freelance', 'Investment', 'Rental', 'Gift', 'Other']
      : [
          'Housing',
          'Transportation',
          'Food',
          'Utilities',
          'Insurance',
          'Healthcare',
          'Entertainment',
          'Education',
          'Other',
        ];

  return (
    <div className={styles.formContainer}>
      <h3>Add New {type === 'income' ? 'Income' : 'Expense'}</h3>
      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor={`${idPrefix}date`}>
              Date (Tax Year {year - 1}/{year})
            </label>
            <input
              type="date"
              id={`${idPrefix}date`}
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={styles.formInput}
              min={minDate}
              max={maxDate}
              required
            />
            <small className={styles.dateHelper}>
              Select a date between Apr 6, {year - 1} and{' '}
              {new Date(maxDate).toLocaleDateString()}
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor={`${idPrefix}category`}>Category</label>
            <select
              id={`${idPrefix}category`}
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={styles.formSelect}
              required
            >
              <option value="">Select a category</option>
              {suggestedCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor={`${idPrefix}description`}>Description</label>
            <input
              type="text"
              id={`${idPrefix}description`}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description"
              className={styles.formInput}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor={`${idPrefix}amount`}>Amount ($)</label>
            <input
              type="number"
              id={`${idPrefix}amount`}
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={styles.formInput}
              required
            />
          </div>

          {type === 'income' && (
            <div className={styles.formGroup}>
              <label htmlFor={`${idPrefix}taxDeductions`}>
                Tax Deductions ($)
              </label>
              <input
                type="number"
                id={`${idPrefix}taxDeductions`}
                name="taxDeductions"
                value={formData.taxDeductions}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={styles.formInput}
              />
            </div>
          )}
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Adding...'
              : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
          </button>
        </div>
      </form>
    </div>
  );
}
