import json
import datetime
from geopy.geocoders import GoogleV3
import types
import time

YEAR_RANGE = (2000,datetime.datetime.now().year)

def googleGeocode(loc):
  time.sleep(35)
  geolocator = GoogleV3()
  res =  geolocator.geocode(loc)
  if isinstance(res,types.NoneType):
    print "Error decoding %s" % loc
    return None, None
  (lat, lng) = res[1]
  return lat,lng

def main():
  y = YEAR_RANGE[0]
  results = []
  while y <= YEAR_RANGE[1]:
    with open('%s.html' % y) as fp:
      raw = fp.read()
      raw = raw.replace('\\r\\n','').replace('\r','').replace('\n','')
    j = json.loads(raw,encoding='ISO-8859-1') if raw else []
    for m in j:
      lat,lng = googleGeocode(m['location'])
      d = {
        'bibcode':  m['bibCode'],
        'start':    datetime.datetime.strptime(m['start'],'%Y-%m-%d'),
        'end':      datetime.datetime.strptime(m['end'],'%Y-%m-%d'),
        'lat':      lat,
        'lng':      lng,
        'name':     m['title'],
      }
      results.append(d)
    y+=1

  with open('data/results.json','w') as fp:
    fp.write(json.dumps(results))

if __name__ == '__main__':
  main()