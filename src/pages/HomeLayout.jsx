
import { Outlet, redirect, Navigate} from "react-router-dom";
import {Header, NavBar} from '../components';
import { getUser } from "../lib/auth";


const HomeLayout = () => {


    const auth = getUser() ?? {};
    const loggedIn = Boolean(auth?.tenantId && auth?.token);
  
    if (!loggedIn) return <Navigate to="/signin" replace />;


    return <>
    
    {/* <Header /> */}
    <section className="">

        <NavBar />
    </section>

    <section className="align-element py-0">
        <Outlet />
    </section>
    </>
}

export default HomeLayout;