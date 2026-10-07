import { useState } from "react";
import Link from "next/link";
import styles from "../../styles/Home.module.css";

export default function EntryManagementActions({ editHref, editLabel, deleteLabel, onDelete }) {
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteEntry = async () => {
        setIsDeleting(true);
        try {
            await onDelete();
        } finally {
            setIsDeleting(false);
        }
    };

    if (confirmingDelete) {
        return (
            <div className={styles.entryDeleteConfirmation} role="alert">
                <span>Delete this {deleteLabel} permanently?</span>
                <button type="button" onClick={() => setConfirmingDelete(false)} disabled={isDeleting}>Cancel</button>
                <button type="button" className={styles.entryDeleteButton} onClick={deleteEntry} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete permanently"}
                </button>
            </div>
        );
    }

    return (
        <div className={styles.entryManagementActions}>
            <Link href={editHref}><a className={styles.entryEditLink}>{editLabel}</a></Link>
            <button type="button" className={styles.entryDeleteButton} onClick={() => setConfirmingDelete(true)}>
                Delete {deleteLabel}
            </button>
        </div>
    );
}
