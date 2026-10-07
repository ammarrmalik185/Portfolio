import styles from "../../styles/Home.module.css";

export default function CollectionLoading({ label, variant = "grid" }) {
    const isTimeline = variant === "timeline";

    return (
        <section className={`${styles.collectionLoading} ${isTimeline ? styles.collectionLoadingTimelineShell : ""}`} role="status" aria-live="polite">
            <div className={styles.collectionLoadingLabel}>
                <span className={styles.loadingSpinner} aria-hidden="true" />
                <span>Loading {label}...</span>
            </div>
            <div className={isTimeline ? styles.collectionLoadingTimeline : styles.collectionLoadingGrid}>
                {Array.from({ length: 3 }, (_, index) => (
                    <div key={index} className={isTimeline ? styles.collectionLoadingTimelineCard : styles.collectionLoadingCard}>
                        {!isTimeline && <div className={styles.collectionLoadingImage} />}
                        <div className={styles.collectionLoadingContent}>
                            <span className={styles.collectionLoadingKicker} />
                            <span className={styles.collectionLoadingHeading} />
                            <span className={styles.collectionLoadingText} />
                            <span className={styles.collectionLoadingTextShort} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
