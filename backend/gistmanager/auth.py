import jwt
import requests
from datetime import datetime, timedelta
from calendar import timegm
from django.contrib.auth.models import User
from django.core.cache import cache

from rest_framework import authentication
from rest_framework import exceptions

from django.conf import settings

def fetch_jwk(header, payload):
    if 'kid' in header:
        kid = header['kid']
    else:
        return None
    
    # Cache this instead of calling each time
    jwk = cache.get(kid)
    if jwk:
        return jwk

    url = fetch_metadata(payload)['jwks_uri']
    if url is None:
        return None
    
    try:
        jwks_response = requests.get(url)

        # Consider any status other than 2xx an error
        if not jwks_response.status_code // 100 == 2:
            #raise Exception(jwks_response.text, jwks_response.status_code)
            return None
    except requests.exceptions.RequestException as e:
        # A serious problem happened, like an SSLError or InvalidURL
        #raise Exception("Error: {}".format(str(e)))
        return None

    jwks = list(filter(lambda x: x['kid'] == kid, jwks_response.json()['keys']))
    if not len(jwks):
        #raise Exception("Error: Could not find jwk for kid: {}".format(kid))
        return None
    jwk = jwks[0]

    cache.set(kid, jwk, 86400)
    return jwk


def fetch_metadata(payload):
    client_id = payload['cid']
    issuer    = payload['iss']
    url = "{}/.well-known/oauth-authorization-server?client_id={}".format(issuer, client_id)
    try:
        metadata_response = requests.get(url)

        # Consider any status other than 2xx an error
        if not metadata_response.status_code // 100 == 2:
            #raise Exception(metadata_response.text, metadata_response.status_code)
            return None

        json_obj = metadata_response.json()
        return json_obj

    except requests.exceptions.RequestException as e:
        # A serious problem happened, like an SSLError or InvalidURL
        #raise Exception("Error: {}".format(str(e)))
        return None


def validate_token(access_token, issuer, aud, client_id):
    # Make sure nothing is empty
    if access_token is None:
        return None
    if issuer is None:
        return None
    else:
        # Add oauth part to end
        issuer_oauth = issuer + '/oauth2/default'
    if aud is None:
        return None
    if client_id is None:
        return None
    
    # Remove Bearer from token
    access_token = access_token.replace("Bearer ","")

    # decode payload
    try:
        payload = jwt.decode(access_token, options={"verify_signature": False})
    except jwt.exceptions.DecodeError:
        return None

    # Verify claims
    if issuer_oauth != payload['iss']:
        return None
    if client_id != payload['cid']:
        return None
    if aud != payload['aud']:
        return None
    
    # Verify expiration
    try:
        exp = int(payload['exp'])
    except ValueError:
        return None
    now = timegm(datetime.utcnow().utctimetuple())
    buffer = 0
    if int(payload['exp']) < (now - buffer):
        return None
    
    # Verify issue at time
    buffer = 300
    acceptable_time = datetime.utcnow() + timedelta(seconds=buffer)
    acceptable_iat = timegm((acceptable_time).timetuple())
    if 'iat' in payload and payload['iat'] > acceptable_iat:
        return None
    
    # Finally verify the signature
    header = jwt.get_unverified_header(access_token)
    jwks_key = fetch_jwk(header, payload)
    if jwks_key is None:
        return None
    key = jwt.algorithms.RSAAlgorithm.from_jwk(jwks_key)

    try:
        payload = jwt.decode(access_token, key=key, algorithms=['RS256'], audience=aud)
    except jwt.exceptions.InvalidSignatureError:
        # Signature validation failed
        return None
    
    return payload



class TokenAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        access_token = request.META.get('HTTP_AUTHORIZATION')
        if not access_token:
            return None
    
        payload = validate_token(access_token, settings.API_AUTH['issuer'], settings.API_AUTH['aud'], settings.API_AUTH['client_id'])

        if payload is None:
            return None
        
        try:
            # Get user if it exists
            user = User.objects.get(username = payload['sub'])
        except User.DoesNotExist:
            # Create the user
            user = User.objects.create(username = payload['sub'])

        return (user, None)