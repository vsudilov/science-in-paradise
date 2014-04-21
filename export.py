import sqlite3
import random
import json
import datetime

TARGET = 'data/data.json'
SQL_SELECT = '''
SELECT * FROM conferences c, geocode g WHERE c.name=g.name;
'''.strip()
DB = 'conferences.sqlite3'

    # name: "munich",
    # lat: 48.1374300 ,
    # lng: 11.5754900,
    # category: "agn",
    # date: 2000,
    # duration: 5,


def main():
  db = sqlite3.connect(DB)

  res = []
  failures = 0
  for line in db.execute(SQL_SELECT): 
    d = {}
    d['bibcode'] = line[1]
    d['name'] = line[2]
    d['date'] = datetime.datetime.strptime(line[3],'%Y-%m-%dT%H:%M:%S').year
    duration = abs(int(line[4]))
    duration = duration if duration < 30 else 30;
    d['duration'] = duration
    #d['keywords'] = line[5]
    d['category'] = random.Random().choice(['grbs','cosmology','supernovae','dark matter','exoplanets'])
    #line[6] #id
    #line[7] #bibcode
    #line[8] #name
    d['lat'] = line[9]
    d['lng'] = line[10]

    try:
      float(d['lat'])
      float(d['lng'])
      res.append(d)
    except:
      failures+=1

  print "Writing %s records (%s did not have a valid geocoding)" % (len(res),failures)
  with open(TARGET,'w') as fp:
    fp.write('data=')
    fp.write(json.dumps(res))

if __name__ == '__main__':
  main()