const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			message: null,
			auth: false, // Estado de autenticación
			demo: [
				{
					title: "FIRST",
					background: "white",
					initial: "white"
				},
				{
					title: "SECOND",
					background: "white",
					initial: "white"
				}
			],
			errorMessage: '' // Estado para el mensaje de error
		},
		actions: {
			// Función de login
			login: async (email, password) => {
				const myHeaders = new Headers();
				myHeaders.append("Content-Type", "application/json");

				const raw = JSON.stringify({
					"email": email,
					"password": password
				});

				const requestOptions = {
					method: "POST",
					headers: myHeaders,
					body: raw,
					redirect: "follow"
				};

				try {
					const response = await fetch("https://animated-parakeet-v6g7gr7j4rpw297-3001.app.github.dev/api/login", requestOptions);
					const result = await response.json();

					if (response.status === 200) {
						// Si el login es exitoso, guardamos el token y cambiamos el estado de autenticación
						localStorage.setItem("token", result.access_token);
						setStore({ auth: true, errorMessage: '' }); // Actualizamos el estado de autenticación y limpiamos el error
						return true;  // El login fue exitoso
					} else {
						// Si la respuesta no es 200, mostramos el mensaje de error en el estado
						setStore({ errorMessage: result.msg || "Error en el login" });
						return false;  // El login falló
					}
				} catch (error) {
					console.error(error);
					setStore({ errorMessage: "Ocurrió un error inesperado. Intenta nuevamente." });
					return false;
				}
			},

			// Función para obtener el perfil
			getProfile: async () => {
				let token = localStorage.getItem("token");
				if (!token) {
					console.log("No token found");
					return;
				}
				try {
					const response = await fetch("https://animated-parakeet-v6g7gr7j4rpw297-3001.app.github.dev/api/profile", {
						method: "GET",
						headers: {
							"Authorization": `Bearer ${token}`
						},
					});
					const result = await response.json();
					console.log(result);
				} catch (error) {
					console.error(error);
				};
			},
			
			// Función para verificar el token
			tokenVerify: async () => {
				let token = localStorage.getItem("token");
				if (!token) {
					setStore({ auth: false }); // Si no hay token, no estás autenticado
					return;
				}

				try {
					const response = await fetch("https://animated-parakeet-v6g7gr7j4rpw297-3001.app.github.dev/api/profile", {
						method: "GET",
						headers: {
							"Authorization": `Bearer ${token}`
						},
					});

					if (response.status === 200) {
						setStore({ auth: true }); // Si la respuesta es 200, el token es válido
					} else {
						setStore({ auth: false }); // Si no es 200, el token es inválido
					}
				} catch (error) {
					console.error("Error al verificar el token", error);
					setStore({ auth: false });
				}
			},

			// Función para cerrar sesión
			logout: () => {
				localStorage.removeItem("token"); // Elimina el token
				setStore({ auth: false }); // Actualiza el estado de autenticación
			},

			// Función para obtener un mensaje
			getMessage: async () => {
				try {
					const resp = await fetch(process.env.BACKEND_URL + "api/hello");
					const data = await resp.json();
					setStore({ message: data.message });
					return data;
				} catch (error) {
					console.log("Error loading message from backend", error);
				}
			},

			// Función para cambiar color (demo)
			changeColor: (index, color) => {
				const store = getStore();
				const demo = store.demo.map((elm, i) => {
					if (i === index) elm.background = color;
					return elm;
				});
				setStore({ demo: demo });
			}
		}
	};
};

export default getState;
