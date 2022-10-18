import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import axios from 'axios';
export default function Home() {

  function handleLogin(event) {
    event.preventDefault();
    axios({
      method: 'post',
      url: 'https://nextjsappdeploy.herokuapp.com/auth/login',
      data: {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      }, withCredentials: true
    }).then((response) => {
      console.log("response.data: ", response.data);
    }).catch((error) => {
      console.log(error);
    })
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <form className="text-center border border-light p-5" onSubmit={handleLogin}>

        <p className="h4 mb-4">Log In</p>

        <input type="email" id="email" className="form-control mb-4" placeholder="Your Email" required />
        <input type="password" id="password" className="form-control mb-4" placeholder="Password" required />


        <button type="submit">Log In</button>

      </form>


    </div>
  )
}
