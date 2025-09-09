import { useState } from "react";

import { signIn } from "../lib/auth";
import { FormInput, SubmitBtn } from "../components";
import {Form, Link, redirect, useNavigate} from 'react-router-dom'
import { loginUser } from "../features/user/userSlice";

export const action = (store) => async ({request}) => {
  
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
  try {
    // console.log("formdata", formData)

    // const email = formData.get("email");
    // const password = formData.get("password");
    
   

    const user = await signIn({email: data.email, password: data.password})
    console.log("usseeer",user);
    store.dispatch(loginUser(user))
    return redirect('/welcome');
  } catch (error) {
    return JSON(
      {error: error.message || "Kirjautuminen epäonnistui"},
      {status: 400}
    )
    
  }
}

export default function Signing() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await signIn(form);
      nav("/welcome");
    } catch (e) {
      setErr(e?.message || "Kirjautuminen epäonnistui");
    } finally {
      setLoading(false);
    }
  };
  return (

    <section className="h-screen grid place-items-center">
      <Form method='post' className="card w-96 p-8 bg-base-100 shadow-lg flex flex-col gap-y-4">
        <h4 className="text-center text-3xl font-bold">Login</h4>
      <FormInput type="email" label="email" name="email" defaultValue='test@test.fi'/>
      <FormInput type="password" label="password" name="password" defaultValue='secret'/>
      <div className="mt-4">
        <SubmitBtn text="login" />
        
      </div>
      <button type="button" className="btn btn-secondary btn-block">
          quest user
        </button>
        <p className="text-center">Not a menber yet <Link to='/signup' className="ml-2 link link-hover link-primary capitalize">Register</Link></p>

      </Form>
    </section>
    // <div style={{ maxWidth: 420, margin: "40px auto" }}>
    //   <h2>Sign in</h2>
    //   <form onSubmit={submit}>
    //     <input
    //       type="email"
    //       placeholder="Sähköposti"
    //       value={form.email}
    //       onChange={(e) => setForm({ ...form, email: e.target.value })}
    //       required
    //     />
    //     <br />
    //     <input
    //       type="password"
    //       placeholder="Salasana"
    //       value={form.password}
    //       onChange={(e) => setForm({ ...form, password: e.target.value })}
    //       required
    //     />
    //     <br />
    //     <button type="submit" disabled={loading}>{loading ? "Kirjaudutaan..." : "Kirjaudu"}</button>
    //   </form>
    //   {err && <p style={{ color: "red" }}>{err}</p>}
    //   <p>
    //     Ei vielä tiliä? <Link to="/signup">Sign up</Link>
    //   </p>
    // </div>
  );
}
