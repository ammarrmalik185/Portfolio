import styles from '../styles/Home.module.css'
import { useRouter } from "next/router";
import {auth, firestore} from "../services/firebaseService"
import PortfolioEditor from "../components/portfolioComponents/portfolioEditor";
import EditorPageLoading from "../components/basicComponents/EditorPageLoading";
import { addDefaultData } from "../services/defaultDocumentDataAdder";
import {useEffect, useState} from "react";
const staticData = require("../staticData.json");

export default function Editor(){
    const router = useRouter();

    const [data, setData] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            if(user == null || !staticData.adminData.adminIds.includes(user.uid)){
                router.push({
                    pathname: "/",
                }).then(console.log).catch(console.error)
            }
        })
        firestore.collection("portfolios").doc(staticData.adminData.mainPortfolioId).get().then((snapShot) => {
            if(snapShot.exists){
                setData(snapShot.data());
            }else{
                setData({ content: { blocks: [] } });
            }
        });

        return unsubscribe;
    }, [router]);

    return(
        <div className={styles.editorPage} >
            {data && <PortfolioEditor
                initialData={data}
                onSave={(portfolio) => {
                    const uploadData = addDefaultData(portfolio);
                    return firestore.collection("portfolios").doc(staticData.adminData.mainPortfolioId).set(uploadData).then(() => {
                        return router.push("/");
                    });
                }}
            />}
            {!data && <EditorPageLoading label="portfolio editor" />}
        </div>
    )
}
