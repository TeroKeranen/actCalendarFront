import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom"
import { logoutUser } from "../features/user/userSlice";



const Header = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.userState.user);
    console.log("header", user);

    const handleLogout = () => {
        navigate('/');
        dispatch(logoutUser());
    }

    return (
        <header className="bg-neutral py-2 text-neutral-content">
            <div className="align-element flex justfy-center sm:justify-end">
                

                {user ? (<div className="flex gap-x-2 sm:gap-x-8 items-center">
                    <p className="text-xs sm:text-sm"> hello {user.email}</p>
                    <button className="btn btn-xs btn-outline btn-primary" onClick={handleLogout}>logout</button>
                </div>) : (
                <div className="flex gap-x-6 justify-center items-center">
                    <Link to='/signin' className="link link-hover text-xs sm:text-sm">
                        Sign in
                    </Link>
                    <Link to='/signup' className="link link-hover text-xs sm:text-sm">
                        create account
                    </Link>
                </div>
                )}



            </div>
        </header>
    )
}

export default Header;