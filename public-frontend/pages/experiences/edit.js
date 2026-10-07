import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../../styles/Home.module.css";
import EntryEditor from "../../components/contentTemplate/entryEditor";
import EditorPageLoading from "../../components/basicComponents/EditorPageLoading";
import { auth, firestore } from "../../services/firebaseService";
import { addDefaultData } from "../../services/defaultDocumentDataAdder";
import staticData from "../../staticData.json";

export default function ExperienceEditor() {
    const router = useRouter();
    const [initialData, setInitialData] = useState(null);
    const entryId = router.query.id;

    useEffect(() => {
        if (!router.isReady) return;
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (!user) {
                router.push("/experiences");
                return;
            }

            if (!entryId) {
                setInitialData({ content: { blocks: [] } });
                return;
            }

            firestore.collection("experiences").doc(entryId).get().then(snapshot => {
                if (!snapshot.exists) {
                    router.replace("/experiences");
                    return;
                }

                const experience = snapshot.data();
                const isAdmin = staticData.adminData.adminIds.includes(user.uid);
                if (experience.user !== user.uid && !isAdmin) {
                    router.replace("/experiences");
                    return;
                }

                setInitialData(experience);
            });
        });

        return unsubscribe;
    }, [router, router.isReady, entryId]);

    return (
        <div className={styles.editorPage}>
            {initialData && <EntryEditor
                initialData={initialData}
                metadataKey="experience"
                heading={entryId ? "Refine an experience" : "Add an experience"}
                description="Make the timeline clear, then use Editor.js to explain your responsibilities and results."
                saveLabel={entryId ? "Save experience" : "Publish experience"}
                fields={[
                    { key: "title", label: "Role", placeholder: "Senior software engineer", wide: true },
                    { key: "company", label: "Company", placeholder: "Acme" },
                    { key: "employmentType", label: "Employment type", placeholder: "Full-time" },
                    { key: "location", label: "Location", placeholder: "Remote or city" },
                    { key: "startDate", label: "Start date", type: "month" },
                    { key: "endDate", label: "End date", type: "month", placeholder: "Leave empty for current" },
                    { key: "summary", label: "Short summary", placeholder: "The scope, contribution, and outcome.", wide: true, multiline: true },
                    { key: "skills", label: "Skills and tools", placeholder: "React, Firebase, Leadership", wide: true, isList: true }
                ]}
                makeTags={(values, metadata) => [metadata.company, values.startDate, values.endDate || "Present", ...metadata.skills].filter(Boolean).join(", ")}
                onSave={entry => {
                    const experience = entryId
                        ? { ...initialData, ...entry, updatedAt: Date.now() }
                        : addDefaultData(entry);
                    const save = entryId
                        ? firestore.collection("experiences").doc(entryId).set(experience)
                        : firestore.collection("experiences").add(experience);

                    return save.then(savedData => {
                        const id = entryId || savedData.id;
                        return router.push({ pathname: "/experiences/post", query: { id } });
                    });
                }}
            />}
            {!initialData && <EditorPageLoading label="experience editor" />}
        </div>
    );
}
