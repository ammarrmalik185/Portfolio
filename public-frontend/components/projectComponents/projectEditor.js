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

function initialProject(data) {
    const metadata = data.project || {};

    return {
        title: data.title || "",
        summary: metadata.summary || "",
        image: metadata.image || data.image || "",
        liveUrl: metadata.liveUrl || "",
        repositoryUrl: metadata.repositoryUrl || "",
        skills: Array.isArray(metadata.skills) ? metadata.skills.join(", ") : data.tags || "",
        showDetails: metadata.showDetails === true
    };
}

const projectJsonPrompt = `Analyze the project files and description I provide. Return only one valid JSON object, with no Markdown fences or explanation. Follow this exact schema:
{
  "format": "portfolio-project",
  "version": 1,
  "title": "Concise project name",
  "project": {
    "summary": "One or two sentence outcome-focused summary",
    "image": "Optional image URL or empty string",
    "liveUrl": "Optional live URL or empty string",
    "repositoryUrl": "Optional repository URL or empty string",
    "skills": ["Skill or technology"],
    "showDetails": false
  },
  "content": {
    "blocks": [
      { "type": "header", "data": { "text": "Overview", "level": 2 } },
      { "type": "paragraph", "data": { "text": "Explain the project, decisions, and outcome.", "alignment": "left" } }
    ]
  }
}
Use only supported Editor.js block types: header, paragraph, list, image, quote, code, table, delimiter, and raw. Keep content.blocks as an array. Omit any information you cannot infer instead of inventing it.`;

export default function ProjectEditor({ initialData, onSave, saveLabel = "Publish project" }) {
    const [project, setProject] = useState(() => initialProject(initialData));
    const [storedContent, setStoredContent] = useState(() => initialData.content || { blocks: [] });
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isPromptCopied, setIsPromptCopied] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [jsonStatus, setJsonStatus] = useState("");
    const [jsonText, setJsonText] = useState("");
    const editorRef = useRef(null);
    const importInputRef = useRef(null);
    const pendingContentRef = useRef(null);

    const updateProject = (field, value) => {
        setProject(currentProject => ({ ...currentProject, [field]: value }));
    };

    const applyContentToEditor = async (content) => {
        if (!editorRef.current) {
            pendingContentRef.current = content;
            return;
        }
        await editorRef.current.isReady;
        await editorRef.current.render(content);
    };

    const handleEditorReady = editor => {
        editorRef.current = editor;
        if (pendingContentRef.current) {
            const content = pendingContentRef.current;
            pendingContentRef.current = null;
            applyContentToEditor(content).catch(error => {
                console.error("Unable to render imported project content", error);
                setJsonStatus("The project fields were imported, but the Editor.js content could not be rendered.");
            });
        }
    };

    const importProjectJson = async json => {
        setJsonStatus("");
        try {
            const imported = JSON.parse(json);
            if (!imported || typeof imported !== "object" || Array.isArray(imported)) {
                throw new Error("Project JSON needs to be an object with a title.");
            }
            const metadata = imported.project || imported;
            const title = imported.title || metadata.title;
            if (!title || typeof title !== "string") {
                throw new Error("Project JSON needs a title.");
            }

            const content = imported.content && Array.isArray(imported.content.blocks)
                ? imported.content
                : { blocks: [] };
            const skills = Array.isArray(metadata.skills)
                ? metadata.skills.join(", ")
                : metadata.skills || imported.tags || "";

            setProject(currentProject => ({
                ...currentProject,
                title,
                summary: metadata.summary || "",
                image: metadata.image || imported.image || "",
                liveUrl: metadata.liveUrl || "",
                repositoryUrl: metadata.repositoryUrl || "",
                skills,
                showDetails: metadata.showDetails === true || content.blocks.length > 0
            }));
            setStoredContent(content);
            await applyContentToEditor(content);
            setJsonStatus("Project JSON imported. Review it, then publish when ready.");
        } catch (error) {
            console.error("Unable to import project JSON", error);
            setJsonStatus(error.message || "We could not read that JSON.");
        }
    };

    const importProjectJsonFile = async event => {
        const input = event.target;
        const file = input.files?.[0];
        if (!file) return;

        try {
            await importProjectJson(await file.text());
        } catch (error) {
            console.error("Unable to read project JSON file", error);
            setJsonStatus("We could not read that JSON file.");
        } finally {
            input.value = "";
        }
    };

    const exportProjectJson = async () => {
        if (isExporting) return;
        setIsExporting(true);
        setJsonStatus("");
        try {
            const content = project.showDetails && editorRef.current
                ? await editorRef.current.save()
                : storedContent;
            const skills = project.skills.split(",").map(skill => skill.trim()).filter(Boolean);
            const exportData = {
                format: "portfolio-project",
                version: 1,
                title: project.title.trim(),
                project: { ...project, skills },
                content: { ...content, blocks: normaliseEditorBlocks(content.blocks || []) }
            };
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${project.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project"}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            setJsonStatus("Project JSON downloaded.");
        } catch (error) {
            console.error("Unable to export project JSON", error);
            setJsonStatus("We could not export this project. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    const copyAiPrompt = async () => {
        try {
            await navigator.clipboard.writeText(projectJsonPrompt);
            setIsPromptCopied(true);
        } catch (error) {
            console.error("Unable to copy project JSON prompt", error);
            setJsonStatus("Copy the prompt manually from the box below.");
        }
    };

    const saveProject = async () => {
        if (isSaving) return;
        if (!project.title.trim()) {
            setSaveError("Add a project name before saving.");
            return;
        }
        if (project.showDetails && !editorRef.current) {
            setSaveError("The editor is still loading. Please try again in a moment.");
            return;
        }

        setIsSaving(true);
        setSaveError("");
        try {
            const content = project.showDetails
                ? await editorRef.current.save()
                : storedContent;
            const skills = project.skills.split(",").map(skill => skill.trim()).filter(Boolean);

            await onSave({
                title: project.title.trim(),
                tags: skills.join(", "),
                project: { ...project, skills },
                content: { ...content, blocks: normaliseEditorBlocks(content.blocks || []) }
            });
        } catch (error) {
            console.error("Unable to save project", error);
            setSaveError("We could not save this project. Please check your connection and try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.portfolioEditor}>
            <section className={styles.portfolioEditorIntro}>
                <p className={styles.portfolioEyebrow}>Project overview</p>
                <h1>Give each project a polished introduction.</h1>
                <p>The structured information creates a concise card and detail header. Use Editor.js for the full case study below.</p>
            </section>

            <details className={styles.projectJsonDisclosure}>
                <summary className={styles.projectJsonToggle}>Import / export JSON</summary>
                <section className={styles.projectJsonTools}>
                    <div>
                        <p className={styles.portfolioEyebrow}>AI-ready project JSON</p>
                        <h2>Export a project for AI, or import a generated project.</h2>
                        <p>Upload a JSON file or paste JSON below, including title, project fields, and Editor.js blocks. Imported content automatically enables project details.</p>
                    </div>
                    <input ref={importInputRef} className={styles.jsonFileInput} type="file" accept="application/json,.json" onChange={importProjectJsonFile} />
                    <div className={styles.projectJsonActions}>
                        <BlueButton title="Import JSON file" onClick={() => importInputRef.current?.click()} disabled={isSaving} />
                        <BlueButton title={isExporting ? "Exporting..." : "Export JSON"} onClick={exportProjectJson} disabled={isSaving || isExporting} />
                    </div>
                    <div className={styles.projectJsonPaste}>
                        <label htmlFor="project-json-text">Paste project JSON</label>
                        <textarea
                            id="project-json-text"
                            value={jsonText}
                            onChange={event => setJsonText(event.target.value)}
                            placeholder="Paste your project JSON here"
                            rows={8}
                            spellCheck={false}
                            disabled={isSaving}
                        />
                        <BlueButton title="Import pasted JSON" onClick={() => importProjectJson(jsonText)} disabled={isSaving || !jsonText.trim()} />
                    </div>
                    <div className={styles.projectJsonPrompt}>
                        <div>
                            <strong>Prompt for your AI</strong>
                            <p>Give the AI this prompt together with your project files or project description.</p>
                        </div>
                        <textarea readOnly value={projectJsonPrompt} aria-label="AI prompt for project JSON" />
                        <BlueButton title={isPromptCopied ? "Copied" : "Copy prompt"} onClick={copyAiPrompt} />
                    </div>
                    {jsonStatus && <p className={styles.projectJsonStatus} role="status">{jsonStatus}</p>}
                </section>
            </details>

            <section className={styles.portfolioFields}>
                <label className={styles.portfolioFieldWide}>
                    Project name
                    <input value={project.title} onChange={event => updateProject("title", event.target.value)} placeholder="Project name" />
                </label>
                <label className={styles.portfolioFieldWide}>
                    Short summary
                    <textarea value={project.summary} onChange={event => updateProject("summary", event.target.value)} placeholder="What it is, who it helps, and the impact it delivers." rows="4" />
                </label>
                <ImageUploadField
                    label="Cover image"
                    value={project.image}
                    onChange={value => updateProject("image", value)}
                />
                <label>
                    Live project URL
                    <input value={project.liveUrl} onChange={event => updateProject("liveUrl", event.target.value)} placeholder="https://..." />
                </label>
                <label>
                    Repository URL
                    <input value={project.repositoryUrl} onChange={event => updateProject("repositoryUrl", event.target.value)} placeholder="https://github.com/..." />
                </label>
                <label className={styles.portfolioFieldWide}>
                    Skills and tools
                    <input value={project.skills} onChange={event => updateProject("skills", event.target.value)} placeholder="Next.js, Firebase, Figma" />
                </label>
            </section>

            <section className={styles.portfolioEditorContent}>
                <div>
                    <p className={styles.portfolioEyebrow}>Project story</p>
                    <h2>Explain the decisions and outcomes</h2>
                    <label className={styles.detailsToggle}>
                        <input type="checkbox" checked={project.showDetails} onChange={event => updateProject("showDetails", event.target.checked)} />
                        <span><strong>Show project details on the public page</strong><small>Turning this off keeps the case study but hides it from visitors.</small></span>
                    </label>
                </div>
                {project.showDetails && <CustomHtmlEditor
                    isUpdate={true}
                    data={storedContent}
                    onEditor={handleEditorReady}
                />}
            </section>

            <div className={styles.portfolioEditorActions}>
                {saveError && <p className={styles.editorSaveError} role="alert">{saveError}</p>}
                <GreenButton title={isSaving ? "Saving..." : saveLabel} onClick={saveProject} disabled={isSaving} />
            </div>
        </div>
    );
}
