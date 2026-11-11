import basePath from "../services/basePath";
import styles from '../styles/Home.module.css'
import {useRouter} from "next/router";
import {auth, firestore} from "../services/firebaseService"
import {useState} from "react";
import {Alert} from 'react-bootstrap';

export default function Signup() {
    const Router = useRouter();
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [retypePassword, setRetypePassword] = useState("")
    const [err, setErr] = useState("")
    return (
        <form className={styles.loginForm}>
            <h1 className={styles.loginFormHeader}>Signup</h1>

            <input value={username} onChange={v => {
                setErr("");
                setUsername(v.target.value)
            }} type="text" className={styles.loginFormInput} placeholder="Display Name" required/>

            <input value={email} onChange={v => {
                setErr("");
                setEmail(v.target.value)
            }} type="email" className={styles.loginFormInput} placeholder="Email" required/>

            <input value={password} onChange={v => {
                setErr("");
                setPassword(v.target.value)
            }} type="password" className={styles.loginFormInput} placeholder="Password" required/>

            <input value={retypePassword} onChange={v => {
                setErr("");
                setRetypePassword(v.target.value)
            }} type="password" className={styles.loginFormInput} placeholder="Retype Password" required/>

            {err !== "" && <Alert variant={"warning"}>{err}</Alert>}

            <button className={styles.loginButton} onClick={v => {
                v.preventDefault();
                if (password !== retypePassword) {
                    setErr("Password do not match")
                    return;
                }
                if (username.trim() === "") {
                    setErr("Display name cannot be empty")
                    return;
                }
                auth.createUserWithEmailAndPassword(email, password).then(user => {
                    Promise.all([firestore.collection("users").doc(auth.currentUser.uid).set({
                        displayName: username
                    }),
                    auth.currentUser.updateProfile({
                        displayName: username
                    })]).then(() => {
                        if (Router.query.id) {
                            Router.push(Router.query.id).then(console.log).catch(console.error)
                        } else {
                            Router.push("/").then(console.log).catch(console.error)
                        }
                    }).catch(err => {
                        setErr(err.message)
                        console.error(err)
                    })
                }).catch(err => {
                    setErr(err.message)
                    console.error(err)
                })
            }}>Signup
            </button>
            <div className={styles.loginFormText}>Already a user? <a href={basePath + "/login"}>Login
                here</a></div>
        </form>
    )
}
