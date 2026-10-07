import styles from '../styles/Home.module.css'
import {useRouter} from "next/router";
import {auth} from "../services/firebaseService"
import {useState} from "react";
import {Alert} from 'react-bootstrap';

export default function LoginPage() {
    const Router = useRouter();
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [err, setErr] = useState("")
    return (
        <form className={styles.loginForm}>
            <h1 className={styles.loginFormHeader}>Login</h1>

            <input value={email} onChange={v => {
                setErr("");
                setEmail(v.target.value)
            }} type="email" className={styles.loginFormInput} placeholder="Email" required/>

            <input value={password} onChange={v => {
                setErr("");
                setPassword(v.target.value)
            }} type="password" className={styles.loginFormInput} placeholder="Password" required/>

            {err !== "" && <Alert variant={"warning"}>{err.message}</Alert>}

            <button className={styles.loginButton} onClick={v => {
                v.preventDefault();
                auth.signInWithEmailAndPassword(email, password).then(user => {
                    if (Router.query.id) {
                        Router.push(Router.query.id).then(console.log).catch(console.error)
                    } else {
                        Router.push("/").then(console.log).catch(console.error)
                    }
                }).catch(err => {
                    setErr(err)
                    console.error(err)
                })
            }}>Login
            </button>
        </form>
    )
}
