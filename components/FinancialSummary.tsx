import styles from '../styles/FinancialSummary.module.css';

interface FinancialSummaryProps {
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
}

export default function FinancialSummary({
  totalIncome,
  totalExpenses,
  netAmount,
}: FinancialSummaryProps) {
  return (
    <div className={styles.summary}>
      <div className={styles.summaryItem}>
        <span className={styles.summaryLabel}>Total Income</span>
        <span className={`${styles.summaryValue} ${styles.income}`}>
          ${totalIncome.toFixed(2)}
        </span>
      </div>
      <div className={styles.summaryItem}>
        <span className={styles.summaryLabel}>Total Expenses</span>
        <span className={`${styles.summaryValue} ${styles.expense}`}>
          ${totalExpenses.toFixed(2)}
        </span>
      </div>
      <div className={styles.summaryItem}>
        <span className={styles.summaryLabel}>Net Amount</span>
        <span
          className={`${styles.summaryValue} ${
            netAmount >= 0 ? styles.income : styles.expense
          }`}
        >
          ${netAmount.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
