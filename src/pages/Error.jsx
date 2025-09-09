import { useRouteError, Link } from "react-router-dom";

const Error = () => {
    const error = useRouteError();
    console.log("errorrrr", error);

    if (error.status === 404) {
        return (
            <main className="grid min-h-[100vh] place-items-center px-8">
                <div className="text-center">
                    <p className="text-9xl font-semibold text-primary">404</p>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">Sivua ei ole</h1>

                    <div className="mt-10">
                        <Link to='/' className="btn btn-secondary">
                            takaisin kotisivulle
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="grid min-h-[100vh] place-items-center px-8">
            <h2>Jotai meni vikaan...</h2>
        </main>
    )
}

export default Error;