import sqlalchemy
import config

engine = sqlalchemy.create_engine(
    'postgres://{username}:{pw}@{host}:{port}/{dbname}'.format(**config.db_connection),
    convert_unicode=True
)

def execute_query(query, *args, **kwargs):
    return engine.execute(sqlalchemy.sql.expression.text(query), *args, **kwargs)

INSERT_RSVP = """
INSERT INTO rsvp (name, num_guests, email, is_attending, mehndi, sangeet, wedding, reception, message, is_valid)
VALUES (:name, :num_guests, :email, :is_attending, :mehndi, :sangeet, :wedding, :reception, :message, :is_valid)
RETURNING id;
"""

def save(name, num_guests, email, is_attending, events, message):
    err_msgs = {}
    if not name:
        err_msgs['name'] = 'Missing name'

    if is_attending:
        if not num_guests:
            err_msgs['num_guests'] = 'Missing number of guests'
        if not events:
            err_msgs['events'] = 'No events have been selected'
    elif events or is_attending is None:
        err_msgs['events'] = "You must choose to either decline or attend"


    success = 0
    try:
        row_id = execute_query(
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
            is_valid=not err_msgs
        ).fetchone()
        if row_id:
            success = row_id[0]
    except:
        pass

    return success, err_msgs
    
