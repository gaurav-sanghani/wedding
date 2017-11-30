import server.config as config

import logging
import re
import sqlalchemy

LOG = logging.getLogger(__name__)
handler = logging.StreamHandler()
formatter = logging.Formatter('[%(levelname)s] [%(asctime)s] [%(name)s] %(message)s')
handler.setFormatter(formatter)

LOG.addHandler(handler)

engine = sqlalchemy.create_engine(
    'postgres://{username}:{pw}@{host}:{port}/{dbname}'.format(**config.db_connection),
    convert_unicode=True
)

def execute_query(query, *args, **kwargs):
    return engine.execute(sqlalchemy.sql.expression.text(query), *args, **kwargs)

INSERT_RSVP = """
INSERT INTO rsvp (
    hash, name, num_adults, num_children, email, is_attending, is_veg, mehndi,
    sangeet, wedding, reception, message, is_valid, guest_id
) VALUES (
    encode(digest(concat(cast(current_timestamp as text), random()::text), 'sha512'), 'base64'),
    :name, :num_adults, :num_children, :email, :is_attending, :is_veg, :mehndi, :sangeet,
    :wedding, :reception, :message, :is_valid, :guest_id
)
RETURNING hash;
"""

LOOKUP_GUEST = """
SELECT *
FROM guest
WHERE hash = :hash
"""

def _validate(guest, name, num_adults, num_children, email, is_attending, is_veg, events, message):
    errors = []
    if not name:
      errors.append('Missing name')
    elif len(name) < 2:
      errors.append('Name does not look valid. Please submit your full name')

    if is_attending:
        if not num_adults:
            errors.append('Please RSVP with the number of guests')
        elif num_adults > guest['max_num_adults']:
            errors.append('Please limit your RSVP to {} adults'.format(guest['max_num_adults']))

        if num_children > guest['max_num_children']:
            errors.append('Please limit your RSVP to {} children'.format(guest['max_num_children']))

        if not events:
            errors.append('No events have been selected')

        if is_veg is None:
            errors.append('Please select whether you are Vegetarian or not')
    elif events or is_attending is None:
        errors.append("You must choose to either decline or attend")

    real_events = [event for event in events if 'invited_to_{}'.format(event) in guest]
    if len(real_events) != len(events):
        events.clear()
        events.extend(real_events)

    return errors

def save(guest_hash, name, num_adults, num_children, email, is_attending, is_veg, events, message):
    guest = None
    guest_id = None
    if guest_hash:
        try:
            guest = execute_query(LOOKUP_GUEST, hash=guest_hash).fetchone()
            guest_id = guest['id']
        except Exception as e:
            LOG.error(e)

    err_msgs = _validate(guest, name, num_adults, num_children, email, is_attending, is_veg, events, message)

    success = 0
    try:
        row_hash = execute_query(
            INSERT_RSVP,
            name=name,
            num_adults=num_adults or 0,
            num_children=num_children or 0,
            email=email or None,
            is_attending=is_attending,
            mehndi=False,
            sangeet='sangeet' in events,
            wedding='wedding' in events,
            reception='reception' in events,
            message=message.strip() or None,
            is_valid=not err_msgs,
            is_veg=is_veg,
            guest_id=guest_id,
        ).fetchone()
        if row_hash:
            success = row_hash[0]
    except Exception as e:
        LOG.error(e, exc_info=e)

    return success, err_msgs

STOP_WORDS = set(['and', 'the', 'but', 'yet', 'for', 'nor'])
def search(names):
    try:
        # User may provide multiple names/first name + last name
        regex = '|'.join([re.escape(name.lower()) for name in names if len(name) > 2 and name.lower() not in STOP_WORDS])
        rows = execute_query('''
            WITH guest_ids AS (
                SELECT DISTINCT guest.id
                FROM guest
                INNER JOIN name ON
                    guest.id = name.guest_id
                WHERE
                    (name.first_name ~ :name OR name.last_name ~:name)
                    AND (guest.invited_to_sangeet OR guest.invited_to_reception OR guest.invited_to_wedding)
            )
            SELECT display_name, hash, invited_to_sangeet, invited_to_reception, invited_to_wedding, max_num_adults, max_num_children
            FROM guest
            INNER JOIN guest_ids USING (id)
            ORDER BY display_name ASC
        ''',
        name=regex).fetchall()
        return [dict(r) for r in rows]
    except Exception as e:
        LOG.error(e)

    return []
