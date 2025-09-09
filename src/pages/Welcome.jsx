import { useEffect, useState } from "react";
import { useNavigate, Link, Form } from "react-router-dom";
import { getUser, clearUser, ensureTenantInAuth } from "../lib/auth";
import { linkActAll, pingTenant } from "../lib/api";
import { FormInput, SubmitBtn } from "../components";
import { toast } from "react-toastify";

export const action = async ({request}) => {

  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  

  const actCustomerId = data.actCustomerId;
  const username = data.username;
  const password = data.password;



  const auth = getUser();

  
  if (!auth.tenantId || !auth?.token) {
    toast.error("Ei kirjautunutta tenanttia");
    return JSON({ok: false, error: "No tenant"}, {status: 401})

  }
  
  if (!actCustomerId || !username || !password) {
    return JSON({ok: false, error: "täytä kaikki kentätä"}, {status: 400})
  }

  const response = await linkActAll(auth.tenantId, { actCustomerId, username, password }, auth.token);

  console.log("Response welcome", response);
}

export default function Welcome() {
  const [auth, setAuth] = useState(() => getUser()); // { token, role, email, tenantId }
  const [ready, setReady] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      if (!auth) {
        nav("/signin");
        return;
      }
      // paikkaa tenantId:n JWT:stä tai /me:stä
      const fixed = await ensureTenantInAuth();
      setAuth(fixed || auth);
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [actCustomerId, setActCustomerId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!ready) return null;

  if (!auth?.tenantId) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Tervetuloa {auth?.email}</h2>
        <p>
          Ei kirjautunutta tenanttia. Jos tämä on virhe, kirjaudu ulos ja sisään uudelleen — tai luo tili asiakkaana.
        </p>
        <button onClick={() => { clearUser(); nav("/signing"); }}>Kirjaudu ulos</button>
      </div>
    );
  }

  // const doLinkAll = async () => {
  //   setMsg("");
  //   setLoading(true);
  //   try {
  //     if (!actCustomerId || !username || !password) {
  //       throw new Error("Täytä ACT Customer ID, käyttäjätunnus ja salasana.");
  //     }
  //     const r = await linkActAll(auth.tenantId, { actCustomerId, username, password }, auth.token);
  //     setMsg(`OK: linkitetty customer=${r.actCustomerId}. Testataan ping...`);
  //     const p = await pingTenant(auth.tenantId, auth.token);
  //     setMsg(`PING OK: ${p.userName}, customer=${p.actCustomerId}, token=${p.token_type}, exp=${p.expires_in}s`);
  //   } catch (e) {
  //     setMsg(String(e.message || e));
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div style={{ padding: 24 }}>
      <h2>Tervetuloa {auth.email}</h2>
      <p>Rooli: {auth.role}</p>
      

      <section className="h-screen grid place-items-center ">
        <Form method="post" className="card w-96 p-8 bg-base-100 shadow-xl/20 flex flex-col gap-y-4">

          <h4 className="text-center text-3xl font-bold">Linkitä act365 asiakas</h4>

          <FormInput type="text" label="Act customer id" name="actCustomerId"/>

          <FormInput type="text" label="Käyttäjätunnus" name="username"/>

          <FormInput type="password" label="password" name="password"/>


          <div className="mt-4">
            <SubmitBtn text="Lähetä tiedot" />
          </div>

        </Form>

      </section>





      <p style={{ marginTop: 12 }}>
        <Link to="/act/cardholders/new">Luo cardholder »</Link>
      </p>

      <p style={{ marginTop: 12 }}>
        <a href="/calendar/setup">Avaa ovikalenteri »</a>
      </p>

      <p style={{ marginTop: 12 }}>
        <Link to="/calendar/new">Luo cardholder2 »</Link>
      </p>
    </div>
  );
}
