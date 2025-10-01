import { useEffect, useState } from "react";
import { useNavigate, Link, Form, useActionData, useNavigation } from "react-router-dom";
import { getUser, clearUser, ensureTenantInAuth } from "../lib/auth";
import { linkActAll, pingTenant } from "../lib/api";
import { FormInput, SubmitBtn } from "../components";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { bootstrapTenant } from "../features/tenant/tenantSlice";

export const action = async ({request}) => {

  const auth = getUser();

  
  if (!auth.tenantId || !auth?.token) {
    toast.error("Ei kirjautunutta tenanttia");
    return JSON({ok: false, error: "No tenant"}, {status: 401})

  }
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  

  const actCustomerId = data.actCustomerId;
  const username = data.username;
  const password = data.password;



  
  if (!actCustomerId || !username || !password) {
    return { ok: false, error: "Täytä kaikki kentät" };
  }

  try {
    const resp = await linkActAll(
      auth.tenantId,
      { actCustomerId, username, password },
      auth.token
    );
    // Jos haluat logata, loggaa resp eikä "response"
    // console.log("linkActAll resp", resp);
    return { ok: true, message: "Linkitys onnistui", payload: resp };
  } catch (err) {
    return { ok: false, error: err?.message || "Linkitys epäonnistui" };
  }
}

export default function Welcome() {
  const actionData = useActionData();
  const nav = useNavigate();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const isSubmitting = navigation.state === "submitting";

  const [auth, setAuth] = useState(() => getUser()); // { token, role, email, tenantId }
  const [ready, setReady] = useState(false);
  const [formKey, setFormKey] = useState(0);
  


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

  useEffect(() => {
    if (!actionData) return;
    if (actionData.ok) {
      toast.success(actionData.message || "Linkitys onnistui");
      dispatch(
        bootstrapTenant({tenantId: auth.tenantId, token:auth.token})
      ).unwrap().then(() => {
        toast.success("Act-tiedot haettu")
      }).catch((e) => {
        toast.error("Act tietojen haku epäonnistui")
      })
      setFormKey((k) => k + 1);
    } else if (actionData.error) {
      toast.error("Linkitys epäonnistui");
    }
  }, [actionData, dispatch])


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



  return (
    <div style={{ padding: 24 }}>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30">
          <div className="bg-base-100 rounded-xl shadow-xl px-6 py-4 flex items-center gap-3">
            <span className="loading loading-spinner loading-md" />
            <span>Lähetetään tietoja…</span>
          </div>
        </div>
      )}
     
      

      <section className=" grid place-items-center ">
        <Form method="post"  key={formKey} className="card w-96 p-8 bg-base-100 shadow-xl/20 flex flex-col gap-y-4">

          <h4 className="text-center text-3xl font-bold">Linkitä act365 asiakas</h4>

          <FormInput type="text" label="Act customer id" name="actCustomerId"/>

          <FormInput type="text" label="Käyttäjätunnus" name="username"/>

          <FormInput type="password" label="password" name="password"/>


          <div className="mt-4">
            <SubmitBtn text="Lähetä tiedot" />
          </div>

        </Form>

      </section>
    </div>
  );
}
