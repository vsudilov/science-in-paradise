import json
import datetime
from geopy.geocoders import GoogleV3
import types
import time
import random

YEAR_RANGE = (2000,datetime.datetime.now().year)

def googleGeocode(loc):
  time.sleep(random.Random().random()*5)
  geolocator = GoogleV3()
  try:
    res =  geolocator.geocode(loc)
    (lat, lng) = res[1]
  except:
    lat,lng = "exception", "exception"
  return lat,lng

def main():
  s = time.time()
  y = YEAR_RANGE[0]
  results = []
  with open('data/results.json','a') as fp_res:
    while y <= YEAR_RANGE[1]:
      with open('%s.html' % y) as fp:
        print "reading html"
        raw = fp.read()
        raw = raw.replace('\\r\\n','').replace('\r','').replace('\n','')
        j = json.loads(raw,encoding='ISO-8859-1') if raw else []
        for m in j:
          print "Working on (dt=%0.2f hours)" % ((time.time()-s)/60/60)
          print m
          L = m['location'] if m['location'] else m['address']
          lat,lng = googleGeocode(L)
          print lat,lng
          print "-----------"
          d = {
            'bibcode':  m['bibCode'],
            'start':    datetime.datetime.strptime(m['start'],'%Y-%m-%d').isoformat(),
            'end':      datetime.datetime.strptime(m['end'],'%Y-%m-%d').isoformat(),
            'lat':      lat,
            'lng':      lng,
            'name':     m['title'],
          }
          fp_res.write(json.dumps(d))
      y+=1


if __name__ == '__main__':
  main()
