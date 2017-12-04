import server.models.rsvp as rsvp
import flask

app = flask.Flask(__name__)

def strToBool(data):
  return cleanStr(data) == '1'

def cleanStr(data):
  return data.strip()

def strToNum(data):
  try:
    return int(cleanStr(data))
  except:
    return 0

@app.route('/api/rsvp', methods=['POST'])
def saveRsvp():
  request_data = flask.request.form
  if not request_data:
    return '', 400, None

  event_fields = {
    'mehndi': strToBool,
    'sangeet': strToBool,
    'wedding': strToBool,
    'reception': strToBool
  }
  fields = {
    'name': cleanStr,
    'adultCount': strToNum,
    'childCount': strToNum,
    'email': cleanStr,
    'decline': strToBool,
    'message': cleanStr,
    'num_veg': strToNum,
    'num_non_veg': strToNum,
    'guestHash': cleanStr,
    **event_fields,
  }

  data = {key: fields[key](val) for key, val in request_data.items() if key in fields}
  events = set([f for f in event_fields if data.get(f)])
  is_attending = not data.get('decline')

  params = (
    data.get('guestHash'),
    data.get('name'),
    data.get('adultCount'),
    data.get('childCount'),
    data.get('email'),
    is_attending,
    data.get('num_veg'),
    data.get('num_non_veg'),
    events,
    data.get('message')
  )

  success, err_msg = rsvp.save(*params)
  response = flask.jsonify(err_msg=err_msg, rsvpHash=success)
  if err_msg:
    response.status_code = 400
  elif success:
    response.status_code = 200
  else:
    response.status_code = 500
  return response

@app.route('/api/rsvp', methods=['GET'])
def searchRsvps():
  name = flask.request.args.get('name', '').strip()
  if not name:
    return '', 400, None
  if len(name) < 2:
    response = flask.jsonify(err_msg=['Must enter at least 3 letters'])
    response.status_code = 400
    return response

  results = rsvp.search(n.strip() for n in name.split(' '))
  if results:
   return flask.jsonify(results=results)
  else:
    return '', 400, None


if __name__ == '__main__':
  app.secret_key = 'abcd'
  app.run(debug=True)
