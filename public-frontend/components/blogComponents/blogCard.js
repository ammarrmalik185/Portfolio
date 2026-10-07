import Image from "next/image";
import {RiFlag2Line} from "react-icons/ri";
import {useRouter} from "next/router";
import styles from '../../styles/Home.module.css'
import {useEffect, useState} from "react";
import {firestore} from "../../services/firebaseService";
import staticData from "../../staticData.json";

function BlogCard ({ title, author, image, id, blog = {} }) {
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
        <div className={styles.authorContainer}>
            <div className="rounded-lg px-6 pt-4" >
                <img className="rounded-lg" src={blog.image || image || staticData.defaults.blogPicture} alt="Blog cover"  height="150" width="300"/></div>
            <div className="px-6 pt-2">
                <div>
                    <text className={styles.authorHeader}>
                        {title}
                    </text>
                </div>
                <p className={styles.cardSubText}>
                    {"By: " + authorName}
                </p>
                {blog.category && <p className={styles.articleMeta}>{blog.category}{blog.readingTime && ` · ${blog.readingTime}`}</p>}
                {blog.summary && <p className={styles.showcaseSummary}>{blog.summary}</p>}
            </div>

            <div className="px-6 pt-4 pb-2 flex space-between">
            <div className="rounded-md flex-grow">
            <div className={styles.cardButton} onClick={() => Router.push({
                    pathname: "/blogs/post",
                    query:{id: id}
                })}>
                <span> Keep Reading </span>
            </div>

            </div>
            <div className="items-center">
                <RiFlag2Line className="text-gray-700 text-lg" />
            </div>

            </div>
        </div>
    )
}

export default BlogCard;
