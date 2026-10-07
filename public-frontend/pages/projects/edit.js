import styles from '../../styles/Home.module.css'
import { useRouter } from "next/router";
import { auth, firestore } from "../../services/firebaseService";
import ProjectEditor from "../../components/projectComponents/projectEditor";
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
                router.push("/projects");
                return;
            }

            if (!entryId) {
                setInitialData({ content: { blocks: [] } });
                return;
            }

            firestore.collection("projects").doc(entryId).get().then(snapshot => {
                if (!snapshot.exists) {
                    router.replace("/projects");
                    return;
                }

                const project = snapshot.data();
                const isAdmin = staticData.adminData.adminIds.includes(user.uid);
                if (project.user !== user.uid && !isAdmin) {
                    router.replace("/projects");
                    return;
                }

                setInitialData(project);
            });
        });

        return unsubscribe;
    }, [router, router.isReady, entryId]);
    return(
        <div className={styles.editorPage} >
            {initialData && <ProjectEditor
                initialData={initialData}
                saveLabel={entryId ? "Save project" : "Publish project"}
                onSave={entry => {
                    const project = entryId
                        ? { ...initialData, ...entry, updatedAt: Date.now() }
                        : addDefaultData(entry);
                    const save = entryId
                        ? firestore.collection("projects").doc(entryId).set(project)
                        : firestore.collection("projects").add(project);

                    return save.then(savedData => {
                        const id = entryId || savedData.id;
                        return router.push({ pathname: "/projects/post", query: { id } });
                    });
                }}
            />}
            {!initialData && <EditorPageLoading label="project editor" />}
        </div>
    )
}
