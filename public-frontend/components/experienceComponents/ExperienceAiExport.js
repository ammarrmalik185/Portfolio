import { useState } from "react";
import styles from "../../styles/Home.module.css";
import { createAiPortfolioExport } from "../../services/experienceExport";

async function copyText(text) {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    textarea.remove();

    if (!copied) throw new Error("Copy command was unavailable.");
}

export default function ExperienceAiExport({ experiences, projects }) {
    const [status, setStatus] = useState("");

    const copyExperience = async () => {
        try {
            await copyText(createAiPortfolioExport(experiences, projects));
            setStatus("Copied. Paste it into an AI, then replace the job-description placeholder.");
        } catch (error) {
            console.error("Unable to copy experience export", error);
            setStatus("We could not copy the export. Please try again.");
        }
    };

    return (
        <div className={styles.experienceAiExport}>
            <div>
                <p className={styles.portfolioEyebrow}>AI-ready portfolio</p>
                <h2>Turn your experience and projects into a tailored email.</h2>
                <p>Copy every role, project, skill, summary, and detail in one prompt, then add the job description for the role you want.</p>
            </div>
            <button type="button" className={styles.experienceExportButton} onClick={copyExperience}>
                Copy experience and projects
            </button>
            {status && <p className={styles.experienceExportStatus} role="status">{status}</p>}
        </div>
    );
}
