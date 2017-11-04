from __future__ import print_function

import json
import sys

cmdFolder = '/opt/2.0/flx/pylons/auth'
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from auth.model import api
from auth.model import meta
from auth.model import model

import auth.lib.helpers as h

class AssociateDistrict:

    def __init__(self, url, verbose=True):
        if meta.engine is None:
            from sqlalchemy import create_engine, orm, MetaData

            meta.engine = create_engine(url)
            sm = orm.sessionmaker(autoflush=False,
                                  autocommit=True,
                                  bind=meta.engine)
            meta.meta = MetaData()
            meta.Session = orm.scoped_session(sm)
        self.session = meta.Session()
        self.config = h.load_pylons_config()
        self.verbose = verbose

    def _call(self, url, headers, params=None, method='GET'):
        """
            Cannot import auth.lib.http library to call clever api:
            when method called from celery pylons session objects conflicts with sqlalchemy session object
        """
        import requests

        r = requests.get(url, params=params, headers=headers, allow_redirects=False)
        """
        if self.verbose:
            print('call: status[%s]' % r.status_code)
            print("call: r.url[%s]" % r.url)
            print("call: r.headers[%s]" % r.headers)
            print("call: r.encoding[%s]" % r.encoding)
        """
        data = r.text
        if self.verbose:
            print("call: data[%s]" % data)
        return json.loads(data)

    def associate(self):
        self.session.begin()
        #
        #  Find schools that are not yet associated.
        #
        from sqlalchemy.sql import not_

        query = self.session.query(model.PartnerSchool).distinct()
        query = query.filter(model.PartnerSchool.schoolID  != None)
        query = query.join(model.PartnerSchoolDistrict, model.PartnerSchoolDistrict.partnerDistrictID == model.PartnerSchool.partnerDistrictID)
        query = query.filter(not_(model.PartnerSchoolDistrict.districtID.in_([1, 2, 4])))
        query = query.filter(model.PartnerSchoolDistrict.districtID != None)
        partnerSchools = query.all()
        if not partnerSchools:
            print('No school to assocate.')
            return

        partnerDistrictDict = {}
        schoolDict = {}
        for partnerSchool in partnerSchools:
            if schoolDict.get(partnerSchool.schoolID):
                if verbose:
                    print('partnerDistrict[%s] partnerSchool[%s]: Skip' % (partnerSchool.partnerDistrictID, partnerSchool.partnerSchoolID))
                continue
            #
            #  Get the district information.
            #
            partnerDistrict = partnerDistrictDict.get(partnerSchool.partnerDistrictID, None)
            if not partnerDistrict:
                query = self.session.query(model.PartnerSchoolDistrict)
                query = query.filter_by(partnerDistrictID=partnerSchool.partnerDistrictID)
                partnerDistrict = query.first()
                partnerDistrictDict[partnerDistrict.partnerDistrictID] = partnerDistrict
            if partnerDistrict.siteID != 15:
                print('Need to add support for site[%s]' % partnerDistrict.siteID)
                continue
            #
            #  Associate.
            #
            if verbose:
                print('partnerDistrict[%s] partnerSchool[%s]' % (partnerDistrict.partnerDistrictID, partnerSchool.partnerSchoolID), end='')
            if partnerDistrict.districtID:
                dhs = api._getDistrictHasSchools(self.session,
                                                 partnerDistrict.districtID,
                                                 partnerSchool.schoolID)
                if not dhs:
                    if verbose:
                        print(': Create DistrictHasSchool[%s, %s]' % (partnerDistrict.districtID, partnerSchool.schoolID), end='')
                    dhs = api._createDistrictHasSchool(self.session,
                                                       districtID=partnerDistrict.districtID,
                                                       schoolID=partnerSchool.schoolID)
                    self.session.add(dhs)
            schoolDict[partnerSchool.schoolID] = partnerSchool
            if verbose:
                print('')

        self.session.commit()

if __name__ == "__main__":
    import optparse

    url = 'mysql://dbadmin:D-coD#43@mysql.master:3306/auth?charset=utf8'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--database', dest='url', default=url,
        help='The URL for connecting to the 2.0 database. Defaults to %s' % url
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    url = options.url
    verbose = options.verbose

    if verbose:
        print('Reset artifact to its original/initial state.')

    a = AssociateDistrict(url, verbose)
    a.associate()
