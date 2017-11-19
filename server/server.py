import models.rsvp as rsvp
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
    return None

@app.route('/api/rsvp', methods=['POST'])
def saveRsvp():
  request_data = flask.request.get_json(silent=True)
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
    'guestCount': strToNum,
    'email': cleanStr,
    'decline': strToBool,
    'message': cleanStr,
    **event_fields,
  }

  data = {key: fields[key](val) for key, val in request_data.items() if key in fields}
  events = set([f for f in event_fields if data.get(f)])

  success, err_msg = rsvp.save(
    data.get('name'),
    data.get('guestCount'),
    data.get('email'),
    not data.get('decline'),
    events,
    data.get('message')
  )

  response = flask.jsonify(err_msg=err_msg, rsvpId=success)
  if err_msg:
    response.status_code = 400
  elif success:
    response.status_code = 200
  else:
    response.status_code = 500
  return response


if __name__ == '__main__':
  app.secret_key = 'abcd'
  app.run(debug=True)
