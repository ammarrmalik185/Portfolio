import styles from "../../styles/Home.module.css";

export default function EditorPageLoading({ label = "editor" }) {
    return (
        <section className={styles.editorPageLoading} role="status" aria-live="polite">
            <div className={styles.editorLoadingLabel}>
                <span className={styles.loadingSpinner} aria-hidden="true" />
                <span>Loading {label}...</span>
            </div>
            <div className={styles.editorLoadingIntro} />
            <div className={styles.editorLoadingFields}>
                {Array.from({ length: 4 }, (_, index) => <span key={index} />)}
            </div>
            <div className={styles.editorLoadingContent} />
        </section>
    );
}
