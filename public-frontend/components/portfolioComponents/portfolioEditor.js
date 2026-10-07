import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import styles from "../../styles/Home.module.css";
import { BlueButton, GreenButton } from "../basicComponents/CustomButtons";
import { normaliseEditorBlocks } from "../../services/editorContent";
import ImageUploadField from "../basicComponents/ImageUploadField";

const CustomHtmlEditor = dynamic(
    () => import("../customHtmlTemplate/customHtmlEditor"),
    { ssr: false }
);

function toFieldProfile(portfolio) {
    const profile = portfolio.profile || {};
    const skills = Array.isArray(profile.skills) ? profile.skills.join(", ") : profile.skills || "";

    return {
        name: profile.name || portfolio.title || "",
        headline: profile.headline || "",
        summary: profile.summary || "",
        image: profile.image || "",
        location: profile.location || "",
        availability: profile.availability || "",
        skills,
        primaryActionLabel: profile.primaryActionLabel || "",
        primaryActionUrl: profile.primaryActionUrl || "",
        secondaryActionLabel: profile.secondaryActionLabel || "",
        secondaryActionUrl: profile.secondaryActionUrl || "",
        linkedinUrl: profile.linkedinUrl || "",
        showDetails: profile.showDetails === true
    };
}

export default function PortfolioEditor({ initialData, onSave }) {
    const [profile, setProfile] = useState(() => toFieldProfile(initialData));
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const editorRef = useRef(null);
    const content = initialData.content || { blocks: [] };

    const updateProfile = (field, value) => {
        setProfile(currentProfile => ({ ...currentProfile, [field]: value }));
    };

    const savePortfolio = async () => {
        if (isSaving) return;
        if (profile.showDetails && !editorRef.current) {
            setSaveError("The editor is still loading. Please try again in a moment.");
            return;
        }

        setIsSaving(true);
        setSaveError("");
        try {
            const editorData = profile.showDetails
                ? await editorRef.current.save()
                : content;
            const skills = profile.skills
                .split(",")
                .map(skill => skill.trim())
                .filter(Boolean);

            await onSave({
                title: profile.name,
                profile: { ...profile, skills },
                content: { ...editorData, blocks: normaliseEditorBlocks(editorData.blocks || []) }
            });
        } catch (error) {
            console.error("Unable to save portfolio", error);
            setSaveError("We could not save your portfolio. Please check your connection and try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.portfolioEditor}>
            <section className={styles.portfolioEditorIntro}>
                <p className={styles.portfolioEyebrow}>Portfolio profile</p>
                <h1>Build the first impression before the story.</h1>
                <p>These fields power the hero area. Use Editor.js below for the detailed sections of your portfolio.</p>
            </section>

            <section className={styles.portfolioFields}>
                <label>
                    Name
                    <input value={profile.name} onChange={event => updateProfile("name", event.target.value)} placeholder="Your name" />
                </label>
                <label>
                    Professional headline
                    <input value={profile.headline} onChange={event => updateProfile("headline", event.target.value)} placeholder="Software engineer and product builder" />
                </label>
                <label className={styles.portfolioFieldWide}>
                    Short introduction
                    <textarea value={profile.summary} onChange={event => updateProfile("summary", event.target.value)} placeholder="A concise introduction about the work you do and the problems you solve." rows="4" />
                </label>
                <ImageUploadField
                    label="Profile image"
                    value={profile.image}
                    onChange={value => updateProfile("image", value)}
                />
                <label>
                    Location
                    <input value={profile.location} onChange={event => updateProfile("location", event.target.value)} placeholder="Lahore, Pakistan" />
                </label>
                <label>
                    Availability
                    <input value={profile.availability} onChange={event => updateProfile("availability", event.target.value)} placeholder="Open to opportunities" />
                </label>
                <label className={styles.portfolioFieldWide}>
                    Skills
                    <input value={profile.skills} onChange={event => updateProfile("skills", event.target.value)} placeholder="React, Firebase, UI/UX" />
                </label>
                <label>
                    Primary button label
                    <input value={profile.primaryActionLabel} onChange={event => updateProfile("primaryActionLabel", event.target.value)} placeholder="Let's talk" />
                </label>
                <label>
                    Primary button URL
                    <input value={profile.primaryActionUrl} onChange={event => updateProfile("primaryActionUrl", event.target.value)} placeholder="mailto:you@example.com" />
                </label>
                <label>
                    Secondary button label
                    <input value={profile.secondaryActionLabel} onChange={event => updateProfile("secondaryActionLabel", event.target.value)} placeholder="View GitHub" />
                </label>
                <label>
                    Secondary button URL
                    <input value={profile.secondaryActionUrl} onChange={event => updateProfile("secondaryActionUrl", event.target.value)} placeholder="https://github.com/..." />
                </label>
                <label className={styles.portfolioFieldWide}>
                    LinkedIn URL (optional)
                    <input value={profile.linkedinUrl} onChange={event => updateProfile("linkedinUrl", event.target.value)} placeholder="https://linkedin.com/in/..." />
                </label>
            </section>

            <section className={styles.portfolioEditorContent}>
                <div>
                    <p className={styles.portfolioEyebrow}>Portfolio details</p>
                    <h2>Tell the longer story</h2>
                    <label className={styles.detailsToggle}>
                        <input type="checkbox" checked={profile.showDetails} onChange={event => updateProfile("showDetails", event.target.checked)} />
                        <span><strong>Show portfolio details on the public page</strong><small>Turning this off keeps the existing content but hides this section from visitors.</small></span>
                    </label>
                </div>
                {profile.showDetails && <CustomHtmlEditor
                    isUpdate={true}
                    data={content}
                    onEditor={editor => {
                        editorRef.current = editor;
                    }}
                />}
            </section>

            <div className={styles.portfolioEditorActions}>
                <BlueButton title="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
                {saveError && <p className={styles.editorSaveError} role="alert">{saveError}</p>}
                <GreenButton title={isSaving ? "Saving..." : "Save portfolio"} onClick={savePortfolio} disabled={isSaving} />
            </div>
        </div>
    );
}
