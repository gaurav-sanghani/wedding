import sqlalchemy
import server.config as config

engine = sqlalchemy.create_engine(
    'postgres://{username}:{pw}@{host}:{port}/{dbname}'.format(**config.db_connection),
    convert_unicode=True
)

def execute_query(query, *args, **kwargs):
    return engine.execute(sqlalchemy.sql.expression.text(query), *args, **kwargs)

INSERT_RSVP = """
INSERT INTO rsvp (name, hash, num_guests, email, is_attending, is_veg, mehndi, sangeet, wedding, reception, message, is_valid)
VALUES (:name, encode(digest(concat(cast(current_timestamp as text), random()::text), 'sha512'), 'base64'), :num_guests, :email, :is_attending, :is_veg, :mehndi, :sangeet, :wedding, :reception, :message, :is_valid)
RETURNING hash;
"""

def _validate(name, num_guests, email, is_attending, is_veg, events, message):
    err_msgs = {}
    if not name:
        err_msgs['name'] = 'Missing name'

    if is_attending:
        if not num_guests:
            err_msgs['num_guests'] = 'Missing number of guests'
        if not events:
            err_msgs['events'] = 'No events have been selected'
        if is_veg is None:
            err_msgs['food'] = 'Please select a food option'
    elif events or is_attending is None:
        err_msgs['events'] = "You must choose to either decline or attend"

    return err_msgs

def save(name, num_guests, email, is_attending, is_veg, events, message):
    err_msgs = _validate(name, num_guests, email, is_attending, is_veg, events, message)

    success = 0
    try:
        row_hash = execute_query(
            INSERT_RSVP,
            name=name,
            num_guests=num_guests or 0,
            email=email or None,
            is_attending=is_attending,
            mehndi='mehndi' in events,
            sangeet='sangeet' in events,
            wedding='wedding' in events,
            reception='reception' in events,
            message=message or None,
            is_valid=not err_msgs,
            is_veg=is_veg,
        ).fetchone()
        if row_hash:
            success = row_hash[0]
    except Exception as e:
        print(e)

    return success, err_msgs

UPDATE_RSVP = """
UPDATE rsvp
SET
    name=:name,
    num_guests=:num_guests,
    email=:email,
    is_attending=:is_attending,
    is_veg=:is_veg,
    mehndi=:mehndi,
    sangeet=:sangeet,
    wedding=:wedding,
    reception=:reception,
    message=:message,
    is_valid=:is_valid
WHERE
    hash=:hash
"""
    
def update(name, num_guests, email, is_attending, is_veg, events, message, rsvpHash):
    err_msgs = _validate(name, num_guests, email, is_attending, is_veg, events, message)

    success = 0
    try:
        execute_query(
            UPDATE_RSVP,
            name=name,
            num_guests=num_guests,
            email=email,
            is_attending=is_attending,
            is_veg=is_veg,
            events=events,
            message=message,
            hash=rsvpHash
        )
        success = rsvpHash
    except Exception as e:
        print(e)

    return success, err_msgs
