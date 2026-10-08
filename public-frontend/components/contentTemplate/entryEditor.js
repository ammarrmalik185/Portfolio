import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import styles from "../../styles/Home.module.css";
import { GreenButton } from "../basicComponents/CustomButtons";
import { normaliseEditorBlocks } from "../../services/editorContent";
import ImageUploadField from "../basicComponents/ImageUploadField";

const CustomHtmlEditor = dynamic(
    () => import("../customHtmlTemplate/customHtmlEditor"),
    { ssr: false }
);

function initialValues(data, metadataKey, fields) {
    const metadata = data[metadataKey] || {};

    return fields.reduce((values, field) => {
        const fallbackValue = field.key === "tags" || field.key === "image" ? data[field.key] : undefined;
        const value = field.key === "title" ? data.title : metadata[field.key] || fallbackValue;
        values[field.key] = Array.isArray(value) ? value.join(", ") : value || field.defaultValue || "";
        return values;
    }, {});
}

export default function EntryEditor({ initialData, metadataKey, fields, heading, description, saveLabel, makeTags, onSave, className = "", contentEyebrow = "Long-form content", contentHeading = "Write the details with Editor.js" }) {
    const [values, setValues] = useState(() => initialValues(initialData, metadataKey, fields));
    const [showDetails, setShowDetails] = useState(() => initialData[metadataKey]?.showDetails === true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const editorRef = useRef(null);
    const visibleFields = fields.filter(field => !field.visibleWhen || field.visibleWhen(values));
    const fieldValue = value => typeof value === "function" ? value(values) : value;

    const updateValue = (key, value) => {
        setValues(currentValues => ({ ...currentValues, [key]: value }));
    };

    const saveEntry = async () => {
        if (isSaving) return;
        if (!values.title.trim()) {
            setSaveError("Add a title before saving.");
            return;
        }
        if (showDetails && !editorRef.current) {
            setSaveError("The editor is still loading. Please try again in a moment.");
            return;
        }

        setIsSaving(true);
        setSaveError("");
        try {
            const editorData = showDetails
                ? await editorRef.current.save()
                : initialData.content || { blocks: [] };
            const metadata = visibleFields.reduce((result, field) => {
                if (field.key === "title") return result;
                result[field.key] = field.isList
                    ? values[field.key].split(",").map(value => value.trim()).filter(Boolean)
                    : values[field.key].trim();
                return result;
            }, {});
            metadata.showDetails = showDetails;

            await onSave({
                title: values.title.trim(),
                tags: makeTags(values, metadata),
                [metadataKey]: metadata,
                content: { ...editorData, blocks: normaliseEditorBlocks(editorData.blocks || []) }
            });
        } catch (error) {
            console.error("Unable to save entry", error);
            setSaveError("We could not save this entry. Please check your connection and try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={`${styles.portfolioEditor} ${className}`}>
            <section className={styles.portfolioEditorIntro}>
                <p className={styles.portfolioEyebrow}>{metadataKey}</p>
                <h1>{heading}</h1>
                <p>{description}</p>
            </section>
            <section className={styles.portfolioFields}>
                {visibleFields.map(field => field.isImage
                    ? <ImageUploadField key={field.key} label={fieldValue(field.label)} value={values[field.key]} onChange={value => updateValue(field.key, value)} placeholder={fieldValue(field.placeholder)} />
                    : <label key={field.key} className={field.wide ? styles.portfolioFieldWide : ""}>
                        {fieldValue(field.label)}
                        {field.options
                            ? <select value={values[field.key]} onChange={event => updateValue(field.key, event.target.value)}>
                                {field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                            : field.multiline
                                ? <textarea value={values[field.key]} onChange={event => updateValue(field.key, event.target.value)} placeholder={fieldValue(field.placeholder)} rows={field.rows || 4} />
                                : <input type={field.type || "text"} value={values[field.key]} onChange={event => updateValue(field.key, event.target.value)} placeholder={fieldValue(field.placeholder)} />}
                    </label>)}
            </section>
            <section className={styles.portfolioEditorContent}>
                <div>
                    <p className={styles.portfolioEyebrow}>{contentEyebrow}</p>
                    <h2>{contentHeading}</h2>
                    <label className={styles.detailsToggle}>
                        <input type="checkbox" checked={showDetails} onChange={event => setShowDetails(event.target.checked)} />
                        <span><strong>Show detailed content on the public page</strong><small>Turning this off keeps the existing content but hides it from visitors.</small></span>
                    </label>
                </div>
                {showDetails && <CustomHtmlEditor
                    isUpdate={true}
                    data={initialData.content || { blocks: [] }}
                    onEditor={editor => {
                        editorRef.current = editor;
                    }}
                />}
            </section>
            <div className={styles.portfolioEditorActions}>
                {saveError && <p className={styles.editorSaveError} role="alert">{saveError}</p>}
                <GreenButton title={isSaving ? "Saving..." : saveLabel} onClick={saveEntry} disabled={isSaving} />
            </div>
        </div>
    );
}
