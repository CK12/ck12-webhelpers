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

class AssociateSchool:

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

    def associateSchool(self, partnerSchool, school):
        partnerSchool.schoolID = school.id
        self.session.add(partnerSchool)
        if self.verbose:
            print('Associated [%s, %s] to %s.' % (school.id, school.name, partnerSchool.partnerSchoolID))
        return

    def matchSchool(self, partnerSchool, name, address, zip):
        query = self.session.query(model.USSchoolsMaster)
        if zip:
            query = query.filter_by(zipcode=zip)
        elif name:
            query = query.filter(model.USSchoolsMaster.name.like('%%%s%%' % name.split(' ')[0]))
        elif address:
            query = query.filter(model.USSchoolsMaster.address.like('%%%s%%' % address))
        else:
            #
            #  No search criteria.
            #
            return False

        schools = query.all()
        size = len(schools)
        for school in schools:
            from fuzzywuzzy import fuzz

            sName = school.name.lower()
            sName = sName.replace('.', '')
            nameRatio = fuzz.partial_ratio(name, sName)
            if verbose:
                print('name[%s] sName[%s] ratio[%s]' % (name, sName, nameRatio))

            if not address:
                addressRatio = 0
            else:
                sAddress = school.address
                if sAddress:
                    sAddress = sAddress.lower()
                else:
                    sAddress = 'xxxx-NO-MATCH-xxxx'
                addressRatio = fuzz.partial_ratio(address, sAddress)
                if verbose:
                    print('address[%s] sAddress[%s] ratio[%s]' % (address, sAddress, addressRatio))

            if nameRatio == 100 or addressRatio == 100:
                self.associateSchool(partnerSchool, school)
                return True

            if nameRatio >= 90 and ( size == 1 or addressRatio >= 80 ):
                self.associateSchool(partnerSchool, school)
                return True

        return False

    def associateDistrict(self, partnerDistrict, partnerSchool):
        if partnerDistrict.districtID and partnerSchool.schoolID:
            #
            #  Associate district and school.
            #
            self.session.flush()
            dhs = api._getDistrictHasSchools(self.session,
                                             partnerDistrict.districtID,
                                             partnerSchool.schoolID)
            if not dhs:
                if verbose:
                    print('Create DistrictHasSchool[%s, %s]' % (partnerDistrict.districtID, partnerSchool.schoolID))
                dhs = api._createDistrictHasSchool(self.session,
                                                   districtID=partnerDistrict.districtID,
                                                   schoolID=partnerSchool.schoolID)
                self.session.add(dhs)

    def associate(self):
        self.session.begin()
        #
        #  Find schools that are not yet associated.
        #
        from sqlalchemy.sql import not_

        query = self.session.query(model.PartnerSchool)
        query = query.filter(model.PartnerSchool.schoolID == None)
        query = query.join(model.PartnerSchoolDistrict, model.PartnerSchoolDistrict.partnerDistrictID == model.PartnerSchool.partnerDistrictID)
        query = query.filter(not_(model.PartnerSchoolDistrict.districtID.in_([1, 2, 4])))
        partnerSchools = query.all()
        if not partnerSchools:
            print('No school to assocate.')
            return

        partnerDistrictDict = {}
        for partnerSchool in partnerSchools:
            #
            #  Get the district token for API calling.
            #
            partnerDistrict = partnerDistrictDict.get(partnerSchool.partnerDistrictID, None)
            if not partnerDistrict:
                query = self.session.query(model.PartnerSchoolDistrict)
                query = query.filter_by(partnerDistrictID=partnerSchool.partnerDistrictID)
                partnerDistrict = query.one()
                partnerDistrictDict[partnerDistrict.partnerDistrictID] = partnerDistrict
            if partnerDistrict.siteID != 15:
                print('Need to add support for site[%s]' % partnerDistrict.siteID)
                continue
            #
            #  Call partner for the school information.
            #
            authorization = 'Bearer %s ' % partnerDistrict.tokenID
            headers = { 'Authorization': authorization }
            partnerSchoolsUrl = "%s/v1.1/schools/%s" % (self.config.get('clever_get_url'), partnerSchool.partnerSchoolID)
            data = self._call(partnerSchoolsUrl, headers, method='GET')
            if not data:
                print('No school data for %s.' % partnerSchool.partnerSchoolID)
                continue
            data = data.get('data')
            if not data:
                print('No data for %s.' % partnerSchool.partnerSchoolID)
                continue
            #
            #  Matching NCES ID.
            #
            ncesID = data.get('nces_id')
            if ncesID:
                query = self.session.query(model.USSchoolsMaster)
                query = query.filter_by(nces_id=ncesID)
                school = query.first()
                if school:
                    self.associateSchool(partnerSchool, school)
                    self.associateDistrict(partnerDistrict, partnerSchool)
                    continue
            #
            #  Matching school name and address.
            #
            name = data.get('name')
            if name:
                name = name.lower()
                name = name.replace('.', '')
            location = data.get('location')
            zip = None
            address = None
            if location:
                zip = location.get('zip')
                try:
                    zip = int(zip)
                except Exception:
                    try:
                        i = zip.index('-')
                        zip = zip[0:i]
                        zip = int(zip)
                    except Exception:
                        zip = 0

                address = location.get('address')
                if address:
                    address = address.lower()

            matched = self.matchSchool(partnerSchool, name, address, zip)
            if not matched and zip:
                #
                #  The zip code could be off by 1.
                #
                zipCode = zip + 1
                matched = self.matchSchool(partnerSchool, name, address, zipCode)
                if not matched:
                    zipCode = zip - 1
                self.matchSchool(partnerSchool, name, address, zipCode)

        self.associateDistrict(partnerDistrict, partnerSchool)
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

    a = AssociateSchool(url, verbose)
    a.associate()
