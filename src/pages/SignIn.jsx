import { useState } from "react";

import { signIn } from "../lib/auth";
import { FormInput, SubmitBtn } from "../components";
import {Form, Link, redirect, useNavigate} from 'react-router-dom'
import { loginUser } from "../features/user/userSlice";
import { bootstrapTenant } from "../features/tenant/tenantSlice";

export const action = (store) => async ({request}) => {
  
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
  try {
    // console.log("formdata", formData)

    // const email = formData.get("email");
    // const password = formData.get("password");
    
    const user = await signIn({email: data.email, password: data.password})
    store.dispatch(loginUser(user))

    // Esilataa kaikki data kalenteria varten
    await store.dispatch(
      bootstrapTenant({ tenantId: user.tenantId, token: user.token })
    ).unwrap();

    const url = new URL(request.url);
    const redirectTo = url.searchParams.get('redirectTo') || '/app';
    return redirect(redirectTo);

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
      <FormInput type="email" label="email" name="email" defaultValue=''/>
      <FormInput type="password" label="password" name="password" defaultValue=''/>
      <div className="mt-4">
        <SubmitBtn text="login" />
        
      </div>
      <button type="button" className="btn btn-secondary btn-block">
          quest user
        </button>
        <p className="text-center">Not a menber yet <Link to='/signup' className="ml-2 link link-hover link-primary capitalize">Register</Link></p>

      </Form>
    </section>

  );
}
