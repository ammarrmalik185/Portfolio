import { getPageNumbers } from "../../services/pagination";
import styles from "../../styles/Home.module.css";

export default function Pagination({ pagination, label, onPageChange, disabled = false }) {
    const { page, pageCount, total, start, end } = pagination;
    if (!total) return null;

    return (
        <nav className={styles.collectionPagination} aria-label={`${label} pagination`}>
            <p className={styles.paginationSummary} role="status">Showing {start}–{end} of {total} {label}</p>
            {pageCount > 1 && <div className={styles.paginationControls}>
                <button type="button" disabled={disabled || page === 1} onClick={() => onPageChange(page - 1)}>Previous</button>
                {getPageNumbers(page, pageCount).map((number, index) => number === "ellipsis"
                    ? <span key={`gap-${index}`} className={styles.paginationEllipsis} aria-hidden="true">…</span>
                    : <button key={number} type="button" className={page === number ? styles.paginationCurrentPage : ""} aria-label={`Go to page ${number}`} aria-current={page === number ? "page" : undefined} disabled={disabled} onClick={() => onPageChange(number)}>{number}</button>)}
                <button type="button" disabled={disabled || page === pageCount} onClick={() => onPageChange(page + 1)}>Next</button>
            </div>}
        </nav>
    );
}
