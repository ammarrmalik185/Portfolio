import ModernBlogPost from "../../components/blogComponents/ModernBlogPost";
import { useAuthState } from "react-firebase-hooks/auth";
import {auth, firestore} from "../../services/firebaseService";
import {useRouter} from "next/router";
import styles from '../../styles/Home.module.css'
import {useEffect, useState} from "react";
import CustomHtmlViewer from "../../components/customHtmlTemplate/customHtmlViewer";
import AuthorDetails from "../../components/globalComponents/AuthorDetails";
import PopularTags from "../../components/globalComponents/PopularTags";
import {LatestBlogs} from "../../components/blogComponents/latestBlogs";
import staticData from "../../staticData.json";
import EntryManagementActions from "../../components/basicComponents/EntryManagementActions";

export function LegacyBlogpost() {
    const [title, setTitle] = useState("");
    const [author, setAuthor] = useState("");
    const [content, setContent] = useState([])
    const [tags, setTags] = useState([])
    const [isInit, setIsInit] = useState(false);
    const [metadata, setMetadata] = useState({});
    const [documentId, setDocumentId] = useState("");
    const [currentUser] = useAuthState(auth);
    const Router = useRouter();
    useEffect(() => {
        if(!isInit){
            if (Router.query.id) {
                if(isInit) return;
                firestore.collection("blogs").doc(Router.query.id).get().then(snapshot => {
                    if (snapshot.exists) {
                        let data = snapshot.data();
                        setTitle(data.title);
                        setAuthor(data.user);
                        setContent(data.content.blocks);
                        setTags(data.tags.split(" ").filter(v => v.trim() !== ""));
                        setMetadata(data.blog || {});
                        setDocumentId(snapshot.id);
                    } else {
                        Router.push("/blogs").then(console.log).catch(console.error);
                    }
                })
                setIsInit(true);
            } else {
                Router.push("/blogs").then(console.log).catch(console.error);
            }
        }
    })

    const canManage = currentUser && (currentUser.uid === author || staticData.adminData.adminIds.includes(currentUser.uid));
    const metadataTags = Array.isArray(metadata.tags) ? metadata.tags : [];

    return (
        <div className={styles.container}>
            <main>
                <section>
                    <h1 className={styles.title}>
                        {title}
                    </h1>
                    {metadata.category && <p className={styles.articleMeta}>{metadata.category}{metadata.readingTime && ` · ${metadata.readingTime}`}</p>}
                    {metadata.summary && <p className={styles.articleSummary}>{metadata.summary}</p>}
                    {metadataTags.length > 0 && <div className={styles.showcaseTags}>{metadataTags.map(tag => <span key={tag}>{tag}</span>)}</div>}
                    {canManage && <EntryManagementActions
                        editHref={{ pathname: "/blogs/edit", query: { id: documentId } }}
                        editLabel="Edit blog post"
                        deleteLabel="blog post"
                        onDelete={() => firestore.collection("blogs").doc(documentId).delete().then(() => Router.replace("/blogs"))}
                    />}
                </section>
                <section className='flex mt-3 w-full space-x-4'>

                    <div className='w-full lg:w-2/3 px-4 py-4 leading-6 '>
                        <CustomHtmlViewer
                            contentBlocks={content}
                        />

                        <LatestBlogs/>

                    </div>


                    <div className='w-1/3 px-4 py-4 space-y-12'>

                        {author && <AuthorDetails userId={author}/>}

                        {tags.length > 0 && <PopularTags tags={tags}/>}

                    </div>
                </section>
            </main>
        </div>
    )
}

export default ModernBlogPost;
