import os
import json
import datetime
from geopy.geocoders import GoogleV3
import types
import time
import random
import sqlite3

YEAR_RANGE = (2000,datetime.datetime.now().year)
SQL_CREATE = '''
CREATE TABLE conferences (id INTEGER PRIMARY KEY AUTOINCREMENT, bibcode, name, start, duration, keywords);
CREATE TABLE geocode (id INTEGER PRIMARY KEY AUTOINCREMENT, bibcode, name, lat, lng);
'''
SQL_SELECT = '''
SELECT lat,lng FROM geocode WHERE bibcode="%s" AND name="%s";
'''
SQL_INSERT = '''
INSERT INTO conferences (bibcode, name, start, duration, keywords) VALUES ("%s","%s","%s","%s","%s");
INSERT INTO geocode (bibcode, name, lat, lng) VALUES ("%s","%s","%s","%s");
'''
DB_NAME = "conferences.sqlite3"
SLEEP_GAUSSIAN_PARAMS = {
  'mean': 6,
  'std': 2,
}


def googleGeocode(loc):
  time.sleep(abs(random.Random().gauss(SLEEP_GAUSSIAN_PARAMS['mean'],SLEEP_GAUSSIAN_PARAMS['std'])))
  geolocator = GoogleV3()
  try:
    res =  geolocator.geocode(loc)
  except:
    return "GeocodeException", "GeocodeException"
  if res:  
    lat = res[0]
    lng = res[1]
  else:
    lat,lng = None,None
  return lat,lng

def init_db(name):
  if not os.path.isfile(name):
    db = sqlite3.connect(name,detect_types=sqlite3.PARSE_DECLTYPES|sqlite3.PARSE_COLNAMES)
    SQL = SQL_CREATE.strip().replace('\n','')
    db.executescript(SQL)
    db.commit()
    return db
  db = sqlite3.connect(name)
  return db

def main():
  s = time.time()
  y = YEAR_RANGE[0]
  db = init_db(DB_NAME)
  results = []
  while y <= YEAR_RANGE[1]:
    with open('%s.html' % y) as fp:
      raw = fp.read()
      raw = raw.replace('\\r\\n','').replace('\r','').replace('\n','')
      j = json.loads(raw,encoding='ISO-8859-1') if raw else []
      for m in j:
        print "Parsing and Geocoding %s (dt=%0.2f hours)" % (m['title'],(time.time()-s)/60/60)
        res = db.execute(SQL_SELECT % (m['bibCode'],m['title'].replace('"',''))).fetchall()
        L = m['location'] if m['location'] else m['address']
        if res:
          lat = res[0][0]
          lng = res[0][1]
          try:
            lat = float(lat)
            lng = float(lng)
          except:
            pass
          if isinstance(lat,float) and isinstance(lng,float):
            print "...Skipping since we already seem to have a valid lat/lng"
            continue
          else:
            print "Re-running geocoding of %s" % (m['location'])
        lat,lng = googleGeocode(L)
        print "Google geocode returned lat,lng [%s,%s] for [%s]" % (lat,lng,L)
        bibcode = m['bibCode']
        start = datetime.datetime.strptime(m['start'],'%Y-%m-%d').isoformat()
        duration = (datetime.datetime.strptime(m['end'],'%Y-%m-%d')-datetime.datetime.strptime(m['start'],'%Y-%m-%d')).days
        name = m['title'].replace('"','')
        keywords = m['keywords']
        SQL = SQL_INSERT.strip().replace('\n','')
        db.executescript(SQL % (bibcode,name,start,duration,keywords,bibcode,name,lat,lng))
        db.commit()
    y+=1


if __name__ == '__main__':
  main()
