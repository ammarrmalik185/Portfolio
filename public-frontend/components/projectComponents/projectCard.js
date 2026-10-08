import {RiFlag2Line} from "react-icons/ri";
import {useRouter} from "next/router";
import styles from '../../styles/Home.module.css'
import {useEffect, useState} from "react";
import {firestore} from "../../services/firebaseService";
import FallbackImage from "../basicComponents/FallbackImage";

function ProjectCard ({ title, author, image, id }) {
    const Router = useRouter();
    const [authorName, setAuthorName] = useState("");
    const [init, setInit] = useState(false);
    useEffect(() => {
        if(init) return;

        firestore.collection("users").doc(author).get().then(snapshot => {
            if(snapshot.exists) {
                setAuthorName(snapshot.data().displayName)
            }
        })

        setInit(true);
    })
    return (
        <div className={styles.projectCard}>
            <div className="rounded-lg px-6 pt-4" >
                <FallbackImage className={styles.projectCardImage} src={image} kind="project" alt={`${title || "Project"} preview`} /></div>
            <div className={styles.projectCardContent}>
                <div>
                    <text className={styles.authorHeader}>
                        {title}
                    </text>
                </div>
                <p className={styles.cardSubText}>
                    {"By: " + authorName}
                </p>
            </div>

            <div className={styles.projectCardButton}>
                <div className="rounded-md flex-grow">
                    <div className={styles.cardButton} onClick={() => Router.push({
                        pathname: "/projects/post",
                        query:{id: id}
                    })}>
                        <span> Keep Reading </span>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ProjectCard;
