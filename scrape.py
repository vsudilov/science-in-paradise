import urllib2
import datetime

URL = 'http://www1.cadc-ccda.hia-iha.nrc-cnrc.gc.ca/meetingsvc/meetings?year='
YEAR_RANGE = (2000,datetime.datetime.now().year)

y = YEAR_RANGE[0]
while y <= YEAR_RANGE[1]:
  with open('%s.html' % y,'w') as fp:
    u = '%s%s' % (URL,y)
    print u
    res = urllib2.urlopen(u)
    fp.write(res.read())
  y+=1