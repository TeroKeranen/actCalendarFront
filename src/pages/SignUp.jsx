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
    // <div style={{ maxWidth: 420, margin: "40px auto" }}>
    //   <h2>Sign up</h2>
    //   <form onSubmit={submit}>
    //     <input
    //       type="email"
    //       placeholder="Sähköposti"
    //       value={form.email}
    //       onChange={(e) => setForm({ ...form, email: e.target.value })}
    //       required
    //       style={{ width: "100%", padding: 8, marginBottom: 10 }}
    //     />

    //     <input
    //       type="password"
    //       placeholder="Salasana (min 6 merkkiä)"
    //       value={form.password}
    //       onChange={(e) => setForm({ ...form, password: e.target.value })}
    //       required
    //       minLength={6}
    //       style={{ width: "100%", padding: 8, marginBottom: 10 }}
    //     />

    //     <fieldset style={{ marginBottom: 12 }}>
    //       <legend>Rooli</legend>
    //       <label style={{ marginRight: 12 }}>
    //         <input
    //           type="radio"
    //           name="role"
    //           value="asiakas"
    //           checked={form.role === "asiakas"}
    //           onChange={(e) => setForm({ ...form, role: e.target.value })}
    //         />{" "}
    //         Asiakas
    //       </label>
    //       <label>
    //         <input
    //           type="radio"
    //           name="role"
    //           value="asentaja"
    //           checked={form.role === "asentaja"}
    //           onChange={(e) => setForm({ ...form, role: e.target.value })}
    //         />{" "}
    //         Asentaja
    //       </label>
    //     </fieldset>

    //     {form.role === "asiakas" && (
    //       <div style={{ marginBottom: 12 }}>
    //         <input
    //           type="text"
    //           placeholder="Yrityksen nimi (Tenant name)"
    //           value={form.tenantName}
    //           onChange={(e) => setForm({ ...form, tenantName: e.target.value })}
    //           required
    //           style={{ width: "100%", padding: 8, marginBottom: 8 }}
    //         />

    //       </div>
    //     )}

    //     <button type="submit" disabled={loading} style={{ padding: "8px 14px" }}>
    //       {loading ? "Luodaan..." : "Luo tili"}
    //     </button>
    //   </form>

    //   {err && <p style={{ color: "crimson", marginTop: 10 }}>{err}</p>}

    //   <p style={{ marginTop: 12 }}>
    //     Onko jo tili? <Link to="/signing">Kirjaudu</Link>
    //   </p>
    // </div>
  );
}
