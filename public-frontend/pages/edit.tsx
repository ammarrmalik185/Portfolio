import styles from '../styles/Home.module.css'
import { useRouter } from "next/router";
import {auth, firestore} from "../services/firebaseService"
import ContentEditor from "../components/contentTemplate/contentEditor";
import { addDefaultData } from "../services/defaultDocumentDataAdder";
import {useEffect, useState} from "react";
const staticData = require("../staticData.json");

export default function Editor(){
    const router = useRouter();
    const [init, setInit] = useState(false)
    const [data, setData] = useState({blocks: null});

    useEffect(() => {
        if(init) return;
        auth.onAuthStateChanged(user => {
            if(user == null || !staticData.adminData.adminIds.includes(user.uid)){
                router.push({
                    pathname: "/",
                }).then(console.log).catch(console.error)
            }
        })
        firestore.collection("portfolios").doc(staticData.adminData.mainPortfolioId).get().then((snapShot) => {
            if(snapShot.exists){
                setData(snapShot.data().content);
            }else{
                setData({blocks: []});
            }
        })
        setInit(true);
    })

    return(
        <div className={styles.editorPage} >
            <h1 className={styles.title}>Edit Your Portfolio</h1>
            <ContentEditor
                isUpdate = {false}
                updateData = {data}
                prompts={
                    {title: "Portfolio", saveButton: "Save"}
                }
                onSave={(uploadData) => {
                    uploadData = addDefaultData(uploadData);
                    firestore.collection("portfolios").doc(staticData.adminData.mainPortfolioId).set(uploadData).then(() => {
                        router.push(staticData.pathingData.baseUrl).then(console.log).catch(console.error)
                    })
            }}/>
        </div>
    )
}
