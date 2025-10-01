import { useState } from "react";
import { useNavigate, Link, Form, redirect } from "react-router-dom";
import { signUp } from "../lib/auth";
import { FormInput, SubmitBtn } from "../components";
import { toast } from "react-toastify";

export const action = async ({request}) => {

  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  
  try {
    
    const response = await signUp({
      email: data.email,
      password: data.password,
      role: data.role,
      tenantName: data.role === "asiakas" ? data.tenantName : undefined,
      tenantSlug: data.role === "asiakas" ? data.tenantSlug : undefined,
    })

    toast.success("Tunnus luotu onnistuneesti");
    return redirect("/signin");
  } catch (error) {
    console.log("SIGHNUP", error);
    const errorMessage = error?.response?.data?.error?.message || 'Please double check your credentials'
    toast.error(errorMessage);
    return null;
  }
}

export default function Signup() {

  const [role, setRole] = useState("asentaja"); // oletuksena asentaja


  return (
    <section className="h-screen grid place-items-center">
      <Form method='post' className="card w-96 p-8 bg-base-100 shadow-lg flex flex-col gap-y-4">
        <h4 className="text-center text-3xl font-bold">
          Register
        </h4>
        <FormInput type="email" label="email" name="email" />
        <FormInput type="password" label="password" name="password" />
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Rooli</legend>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              className="radio"
              value="asentaja"
              defaultChecked
              onChange={(e) => setRole(e.target.value)}
            />
            asentaja
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="role"
              className="radio"
              value="asiakas"
              onChange={(e) => setRole(e.target.value)}
            />
            asiakas
          </label>
        </fieldset>
        
        {/* Näytä nämä vain asiakas-roolissa */}
        {role === "asiakas" && (
          <>
            <FormInput type="text" label="Yrityksen nimi (tenantName)" name="tenantName" required />
            {/* tenantSlug on valinnainen; jätä halutessasi pois */}
            {/* <FormInput type="text" label="Tenant slug (valinnainen)" name="tenantSlug" /> */}
          </>
        )}

        <div className="mt-4">
          <SubmitBtn text="Register" />
        </div>
        <p className="text-center">already a member? <Link to='/signin' className="ml-2 link link-hover link-primary capitalize">login</Link></p>
      </Form>
    </section>

  );
}
