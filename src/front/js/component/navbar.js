import React, { useContext } from "react";
import { Context } from "../store/appContext";
import { Link, useNavigate } from "react-router-dom";

export const Navbar = () => {
    const { store, actions } = useContext(Context);
    let navigate = useNavigate();

    const handleLogout = () => {
        // Llamamos a la función logout de actions para eliminar el token
        actions.logout();
        // Redirigimos al home usando window.location.href
        window.location.href = "https://animated-parakeet-v6g7gr7j4rpw297-3000.app.github.dev";
    };

    return (
        <nav className="navbar navbar-light bg-light">
            <div className="container">
                <Link to="/">
                    <span className="navbar-brand mb-0 h1">React Boilerplate</span>
                </Link>
                <div className="ml-auto">
                    {store.auth ? (
                        <>
                            {/* Si está logueado, mostrar el botón Logout */}
                            <button onClick={handleLogout} className="btn btn-danger">
                                Logout
                            </button>
                        </>
                    ) : null}
                </div>
            </div>
        </nav>
    );
};
