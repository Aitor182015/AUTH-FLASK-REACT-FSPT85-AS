from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
import os

api = Blueprint('api', __name__)

# Permitir CORS para las rutas
CORS(api)

# Ruta para obtener un saludo
@api.route('/user', methods=['GET'])
def handle_hello():
    response_body = {
        "msg": "Hello, this is your GET /user response "
    }
    return jsonify(response_body), 200

# Ruta para el sitemap
@api.route('/', methods=['GET'])
def sitemap():
    response_body = generate_sitemap()  # Asumiendo que generate_sitemap está implementado correctamente
    return jsonify(response_body), 200

# Ruta para servir archivos estáticos
@api.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    static_file_dir = '/path/to/static/files'  # Cambia esto con la ruta real de tus archivos estáticos
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'  # Si el archivo no existe, sirve el index.html
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0  # Evitar que se cachee
    return response

# Ruta para registrarse (signup)
@api.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Validación de campos vacíos
    if not email or not password:
        return jsonify({'message': 'El correo electrónico y la contraseña son requeridos'}), 400

    # Verificar si el usuario ya existe
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'El usuario ya existe'}), 400
    
    # Crear el nuevo usuario (sin hashing de la contraseña)
    new_user = User(email=email, password=password, is_active=True)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Usuario registrado exitosamente'}), 201

# Ruta para hacer login (login)
@api.route("/login", methods=["POST"])
def login():
    username = request.json.get("email", None)
    password = request.json.get("password", None)

    # Validación de campos vacíos
    if not username or not password:
        return jsonify({"msg": "El correo electrónico y la contraseña son requeridos"}), 400

    # Verificar si el usuario existe
    user = User.query.filter_by(email=username).first()
    if not user:
        return jsonify({"msg": "Usuario no encontrado o contraseña incorrecta"}), 404

    # Verificar la contraseña 
    if user.password != password:
        return jsonify({"msg": "Usuario o no encontrado o contraseña incorrecta"}), 401

    # Crear el token de acceso si el login es exitoso
    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token)

# Ruta protegida con JWT (profile)
@api.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    # Acceder a la identidad del usuario actual
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

# Manejo de errores global para la API
@api.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# Manejo de errores para el código 400 (Bad Request)
@api.errorhandler(400)
def handle_bad_request(error):
    return jsonify({"msg": "Bad Request", "detail": str(error)}), 400

# Manejo de errores para el código 401 (Unauthorized)
@api.errorhandler(401)
def handle_unauthorized(error):
    return jsonify({"msg": "Unauthorized", "detail": str(error)}), 401

# Manejo de errores para el código 404 (Not Found)
@api.errorhandler(404)
def handle_not_found(error):
    return jsonify({"msg": "Not Found", "detail": str(error)}), 404

# Manejo de errores para el código 500 (Internal Server Error)
@api.errorhandler(500)
def handle_internal_server_error(error):
    return jsonify({"msg": "Internal Server Error", "detail": str(error)}), 500
