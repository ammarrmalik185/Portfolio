import styles from '../../styles/Home.module.css'
import { useRouter } from "next/router";
import {auth, firestore} from "../../services/firebaseService";
import EntryEditor from "../../components/contentTemplate/entryEditor";
import EditorPageLoading from "../../components/basicComponents/EditorPageLoading";
import {addDefaultData} from "../../services/defaultDocumentDataAdder";
import {useEffect, useState} from "react";
import staticData from "../../staticData.json";

export default function Editor(){
    const router = useRouter();
    const [initialData, setInitialData] = useState(null);
    const entryId = router.query.id;

    useEffect(() => {
        if (!router.isReady) return;
        const unsubscribe = auth.onAuthStateChanged(user => {
            if (!user) {
                router.push("/blogs");
                return;
            }

            if (!entryId) {
                setInitialData({ content: { blocks: [] } });
                return;
            }

            firestore.collection("blogs").doc(entryId).get().then(snapshot => {
                if (!snapshot.exists) {
                    router.replace("/blogs");
                    return;
                }

                const blog = snapshot.data();
                const isAdmin = staticData.adminData.adminIds.includes(user.uid);
                if (blog.user !== user.uid && !isAdmin) {
                    router.replace("/blogs");
                    return;
                }

                setInitialData(blog);
            });
        });

        return unsubscribe;
    }, [router, router.isReady, entryId]);
     return(
        <div className={styles.editorPage} >
            {initialData && <EntryEditor
                initialData={initialData}
                className={styles.blogEditor}
                metadataKey="blog"
                heading={entryId ? "Refine a blog post" : "Write a blog post"}
                description="Create a clear article preview, then shape the full story with Editor.js."
                saveLabel={entryId ? "Save blog post" : "Publish blog post"}
                contentEyebrow="Article body"
                contentHeading="Make the article enjoyable to read"
                fields={[
                    { key: "title", label: "Title", placeholder: "A useful, specific title", wide: true },
                    { key: "category", label: "Category", placeholder: "Engineering, Design, Career" },
                    { key: "readingTime", label: "Reading time", placeholder: "5 min read" },
                    { key: "image", label: "Cover image", placeholder: "https://...", wide: true, isImage: true },
                    { key: "summary", label: "Article summary", placeholder: "What readers will learn and why it matters.", wide: true, multiline: true },
                    { key: "tags", label: "Tags", placeholder: "React, Firebase, UX", wide: true, isList: true }
                ]}
                makeTags={(values, metadata) => metadata.tags.join(", ")}
                onSave={entry => {
                    const blog = entryId
                        ? { ...initialData, ...entry, updatedAt: Date.now() }
                        : addDefaultData(entry);
                    const save = entryId
                        ? firestore.collection("blogs").doc(entryId).set(blog)
                        : firestore.collection("blogs").add(blog);

                    return save.then(savedData => {
                        const id = entryId || savedData.id;
                        return router.push({ pathname: "/blogs/post", query: { id } });
                    });
                }}
            />}
            {!initialData && <EditorPageLoading label="blog editor" />}
        </div>
    )
}
