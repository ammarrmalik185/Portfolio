import { useRef, useState } from "react";
import styles from "../../styles/Home.module.css";

const maxUploadSize = 500 * 1024;

function readImageAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function ImageUploadField({ label, value, onChange, placeholder = "https://..." }) {
    const inputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState("");

    const uploadImage = async event => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Choose an image file.");
            event.target.value = "";
            return;
        }

        if (file.size > maxUploadSize) {
            setError("Images stored in Firestore must be 500 KB or smaller.");
            event.target.value = "";
            return;
        }

        setError("");
        setIsUploading(true);
        try {
            onChange(await readImageAsDataUrl(file));
        } catch (uploadError) {
            setError("Could not read the image. Please try again.");
        } finally {
            setIsUploading(false);
            event.target.value = "";
        }
    };

    return (
        <label className={styles.imageUploadField}>
            {label}
            <div className={styles.imageUploadControls}>
                <input type="url" value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} />
                <input ref={inputRef} className={styles.imageFileInput} type="file" accept="image/*" onChange={uploadImage} />
                <button type="button" className={styles.imageUploadButton} disabled={isUploading} onClick={() => inputRef.current?.click()}>
                    {isUploading ? "Preparing..." : "Choose image"}
                </button>
            </div>
            <span className={styles.imageUploadHint}>Paste a URL or choose an image up to 500 KB to save directly in Firestore.</span>
            {error && <span className={styles.imageUploadError} role="alert">{error}</span>}
            {value && <>
                {/* Author-selected URLs may come from Firebase Storage or another image host. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={styles.imageUploadPreview} src={value} alt="Selected image preview" />
            </>}
        </label>
    );
}
