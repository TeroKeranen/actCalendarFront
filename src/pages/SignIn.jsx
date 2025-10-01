import { useEffect, useState } from "react";

import { signIn } from "../lib/auth";
import { FormInput, SubmitBtn } from "../components";
import {Form, Link, redirect, useActionData, useNavigate, useNavigation} from 'react-router-dom'
import { loginUser } from "../features/user/userSlice";
import { bootstrapTenant } from "../features/tenant/tenantSlice";
import { toast } from "react-toastify";

export const action = (store) => async ({request}) => {
  
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

  try {

    
    const user = await signIn({email: data.email, password: data.password})
    store.dispatch(loginUser(user))


    try {
      // Esilataa kaikki data kalenteria varten
      await store.dispatch(
        bootstrapTenant({ tenantId: user.tenantId, token: user.token })
      ).unwrap();
      
    } catch (e) {
      console.log("BootsrapTenant skipped: ", e?.message || e)
    }


    const url = new URL(request.url);
    const redirectTo = url.searchParams.get('redirectTo') || '/app';
    return redirect(redirectTo);

  } catch (e) {
    return {ok: false, error: e?.message || "Jotain meni vikaan"}
    
  }
}

export default function Signing() {
  const nav = useNavigate();
  const actionData = useActionData();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";



  useEffect(() => {
    if (!actionData) return;

    if (actionData.ok) {
      toast.success("Kirjautuminen onnistui");

    } else if (actionData.error) {
      toast.error("Jotain meni vikaan");
    }
  })


  return (
    <div>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30">
          <div className="bg-base-100 rounded-xl shadow-xl px-6 py-4 flex items-center gap-3">
            <span className="loading loading-spinner loading-md" />
            <span>Lähetetään tietoja…</span>
          </div>
        </div>
      )}


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

    </div>
  );
}
