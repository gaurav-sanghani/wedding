import csv
import logging
import sqlalchemy
import sys

import server.config as config

if len(sys.argv) == 1:
  raise Exception('Need the name of a TSV file to process')

logger = logging.getLogger(__name__)

engine = sqlalchemy.create_engine('postgres://{username}:{pw}@{host}:{port}/{dbname}'.format(**config.db_connection),convert_unicode=True)

with open(sys.argv[1], 'r') as f:
  reader = csv.DictReader(f, dialect='excel-tab')
  for i, row in enumerate(reader):
    bool_keys = [
      'invited_to_mehndi',
      'invited_to_sangeet',
      'invited_to_wedding',
      'invited_to_reception'
    ]
    numeric_keys = [
      'max_num_children',
      'max_num_adults',
    ]

    insert = {
      'display_name': row['display_name'].strip(),
    }

    if not insert['display_name']:
      insert['display_name'] = '{} {}'.format(row['first_name'].strip(), row['last_name'].strip())

    for key in numeric_keys:
      try:
        insert[key] = int(row[key].strip())
      except:
        insert[key] = 0

    for key in bool_keys:
      insert[key] = row[key].strip() not in ('0', 0)

    try:
      guest_id = engine.execute(
        sqlalchemy.sql.expression.text('''
          INSERT INTO guest (
            hash, display_name, max_num_adults, max_num_children, invited_to_mehndi,
            invited_to_sangeet, invited_to_wedding, invited_to_reception
          ) VALUES (
            encode(digest(concat(cast(current_timestamp as text), random()::text), 'sha512'), 'base64'),
            :display_name, :max_num_adults, :max_num_children, :invited_to_mehndi, :invited_to_sangeet,
            :invited_to_wedding, :invited_to_reception
          ) RETURNING id;
        '''),
        **insert
      ).fetchone()

      last_name = row['last_name'].strip()
      for raw_first_name in row['first_name'].split(','):
        names = (name.strip() for name in raw_first_name.split('&') if name.strip())
        for n in names:
          engine.execute(sqlalchemy.sql.expression.text('''
            INSERT INTO name (guest_id, first_name, last_name)
            VALUES (:guest_id, :first_name, :last_name);
            '''),
            guest_id=guest_id[0],
            first_name=n.lower(),
            last_name=last_name.lower()
          )
    except Exception as e:
      logger.error(e)
