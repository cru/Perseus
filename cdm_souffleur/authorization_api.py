from flask import request, jsonify, Blueprint, flash, url_for
from werkzeug.utils import redirect
from cdm_souffleur.services.authorization_service import *
from urllib.parse import urlparse
from cdm_souffleur.utils.utils import getServerHostPort

authorization_api = Blueprint('authorization_api', __name__)


@authorization_api.route('/api/register', methods=['POST'])
def register_user():
    try:
        host = getServerHostPort(urlparse(request.base_url).hostname)
        password = request.json['password']
        first_name = request.json['firstName']
        last_name = request.json['lastName']
        email = request.json['email']
        register_user_in_db(password, first_name, last_name, email, host)
    except InvalidUsage as error:
        raise error
    except Exception as error:
        raise InvalidUsage(error.__str__(), 500)
    return jsonify(True)


@authorization_api.route('/api/confirm_registration', methods=['GET'])
def confirm_registration():
    try:
        host = getServerHostPort(urlparse(request.base_url).hostname)
        encrypted_email = request.args['token']
        redirect_to_page = activate_user_in_db(encrypted_email, host)
    except InvalidUsage as error:
        raise error
    except Exception as error:
        raise InvalidUsage(error.__str__(), 500)

    return redirect_to_page


@authorization_api.route('/api/login', methods=['POST'])
def login():
    try:
        email = request.json['email']
        password = request.json['password']
        auth_token = user_login(email, password)
    except InvalidUsage as error:
        raise error
    except AuthorizationError as error:
        raise error
    except Exception as error:
        raise InvalidUsage(error.__str__(), 500)
    return jsonify(auth_token)


@authorization_api.route('/api/logout', methods=['GET'])
@token_required
def logout(current_user):
    try:
        user_logout(current_user, request.headers['Authorization'])
    except Exception as error:
        raise InvalidUsage(error.__str__(), 500)
    return jsonify()


@authorization_api.route('/api/recover-password', methods=['POST'])
def reset_password_request():
    try:
        host = getServerHostPort(urlparse(request.base_url).hostname)
        email = request.json['email']
        send_reset_password_email(email, host)
    except Exception as error:
        raise InvalidUsage(error.__str__(), 500)
    return jsonify(True)


@authorization_api.route('/api/check_password_link', methods=['GET'])
def check_reset_password_link():
    try:
        host = getServerHostPort(urlparse(request.base_url).hostname)
        encrypted_email = request.args['token']
        if password_link_active(encrypted_email):
            return redirect(f"{host}/reset-password?token={encrypted_email}", code=302)
    except Exception as error:
        raise InvalidUsage(error.__str__(), 500)
    return redirect(f"{host}/link-expired?linkType=password&email={decrypt_email(encrypted_email)}", code=302)


@authorization_api.route('/api/reset-password', methods=['POST'])
def reset_password():
    try:
        new_pwd = request.json['password']
        encrypted_email = request.json['token']
        reset_password_for_user(new_pwd, encrypted_email)
    except Exception as error:
        raise InvalidUsage(error.__str__(), 500)
    return jsonify(True)


@authorization_api.route('/api/resend_activation_link', methods=['POST'])
def resend_activation_link():
    try:
        host = getServerHostPort(urlparse(request.base_url).hostname)
        email = request.json['email']
        linkType = request.json['linkType']
        send_link_to_user_repeatedly(email, linkType, host)
    except Exception as error:
        raise InvalidUsage(error.__str__(), 500)
    return jsonify(True)


@authorization_api.route('/api/register_unauthorized_reset_pwd_request', methods=['GET'])
def register_unauthorized_reset_pwd():
    try:
        host = getServerHostPort(urlparse(request.base_url).hostname)
        user_key = request.args['token']
        register_unauthorized_reset_pwd_in_db(user_key)
    except Exception as error:
        raise InvalidUsage(error.__str__(), 500)
    return redirect(f"{host}", code=302)


@authorization_api.route('/api/update_refresh_access_token', methods=['POST'])
def refresh_access_token():
    try:
        token = request.json['token']
        email = request.json['email']
        tokens = get_refresh_access_token_pair(email, token)
    except InvalidUsage as error:
        raise error
    except Exception as error:
        raise InvalidUsage(error.__str__(), 500)
    return jsonify(tokens)


@authorization_api.route('/api/is_token_valid', methods=['GET'])
def is_token_valid_call():
    try:
        is_token_valid(request)
    except InvalidUsage as error:
        return jsonify(False)
    except Exception as error:
        raise InvalidUsage(error.__str__(), 500)
    return jsonify(True)