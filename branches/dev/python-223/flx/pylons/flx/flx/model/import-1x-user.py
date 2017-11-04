import csv
import os
import sys

from sqlalchemy.exc import IntegrityError

cmdFolder = os.path.dirname(os.path.abspath(__file__))
cmdFolder = os.path.dirname(cmdFolder)
cmdFolder = os.path.dirname(cmdFolder)
if cmdFolder not in sys.path:
    sys.path.insert(0, cmdFolder)

from flx.model import meta
from flx.model.migrate import Migrate

encoding = 'utf-8'

class Model(object):
    def __init__(self, **kw):
        self.__dict__.update(kw)

    def __unicode__(self):
        return unicode(vars(self))

    def __str__(self):
        return unicode(self).encode('utf-8')

    def __repr__(self):
        return str(self)

    def asDict(self):
        if not self.__dict__.has_key('_sa_instance_state'):
            return self.__dict__

        from copy import deepcopy

        d = deepcopy(self.__dict__)
        del d['_sa_instance_state']
        return d

class User(Model):

    def __init__(self, row):
        self.id = row[0]
        self.userName = unicode(row[1], encoding)
        self.firstName = unicode(row[2], encoding)
        self.lastName = unicode(row[3], encoding)
        self.email = unicode(row[4], encoding)
        self.password = unicode(row[5], encoding)
        self.isStaff = row[6]
        self.isActive = row[7]
        self.isSuperUser = row[8]
        self.lastLogin = row[9]
        self.dateJoined = row[10]

class Profile(Model):

    def __init__(self, row):
        self.userID = row[1]
        self.url = unicode(row[2], encoding)
        self.addresses = [
            {
                'line': [ unicode(row[3], encoding), unicode(row[4], encoding) ],
                'city': unicode(row[5], encoding),
                'province': unicode(row[6], encoding),
                'countryID': row[7],
                'postalCode': unicode(row[8], encoding),
            },
            {
                'line': [ unicode(row[11], encoding), unicode(row[12], encoding) ],
                'city': unicode(row[13], encoding),
                'province': unicode(row[14], encoding),
                'countryID': row[15],
                'postalCode': unicode(row[16], encoding),
            },
        ]
        self.phone = unicode(row[9], encoding).replace('-', '')
        self.fax = unicode(row[10], encoding).replace('-', '')
        self.prefix = unicode(row[20], encoding)
        self.suffix = unicode(row[22], encoding)
        self.institutions = unicode(row[23], encoding)

class Member(Model):
    pass

class MemberExtData(Model):
    pass

class MemberLocation(Model):
    pass

class USAddress(Model):
    pass

class WorldAddress(Model):
    pass

class Import(Migrate):
    memberRoleDict = {}
    memberStateDict = {}
    memberAuthTypeDict = {}

    def __init__(self, url):
        super(Import, self).__init__(url)

        from sqlalchemy import orm

        self.session = meta.Session()

        orm.mapper(Member, meta.Members)     
        orm.mapper(MemberExtData, meta.MemberExtData)     
        orm.mapper(MemberLocation, meta.MemberLocations)     
        orm.mapper(USAddress, meta.USAddresses)     
        orm.mapper(WorldAddress, meta.WorldAddresses)     

    def _cache(self, table, dict):
        """
            Cache the MemberRoles table.
        """
        if verbose:
            print 'Caching table[%s]' % table.fullname
        rows = self.getTable(table)
        for row in rows:
            dict[row['name']] = row

    def _exec(self, insertFunc, relations, isRow=False):
        try:
            self.connection.execute(insertFunc, relations)
            return 0
        except IntegrityError:
            if isRow:
                if verbose:
                    print 'Existing member[%s]' % relations
                return 1

            status = 0
            for relation in relations:
                try:
                    self.connection.execute(insertFunc, relation)
                except IntegrityError:
                    status = 1
                except Exception, ex:
                    print '_exec Exception row[%s]' % relation
                    raise ex
            return status

    def _create(self, what, **kwargs):
        instance = what(**kwargs)
        self.session.add(instance)
        return instance

    def _select(self, table, predicate):
        statement = table.select(predicate)
        return statement.execute()

    def _genURLSafeBase64Encode(self, string, strip=True, usePrefix=True):
        """ Returns a URL-safe Base64 encode of the string with '=' replaced with
        '_' after the encode. """
        if not string:
            return string
        from base64 import urlsafe_b64encode
        if strip:
            string = string.strip()
        if not isinstance(string, str):
            string = string.encode('utf-8')
        string = urlsafe_b64encode(string).replace('=', '.')
        if usePrefix:
            string = 'x-ck12-%s' % string
        return string

    def _addAddresses(self, memberID, addrList):
        for addrDict in addrList:
            countryID = addrDict.get('countryID')
            if not countryID:
                continue
            del addrDict['countryID']
            try:
                if countryID == '1':
                    #
                    #  US address.
                    #
                    address = self._create(USAddress, **addrDict)
                else:
                    #
                    #  World address.
                    #
                    address = self._create(WorldAddress, **addrDict)
                self.session.add(address)
                self.session.flush()
                locationDict = {
                    'memberID': memberID,
                    'countryID': countryID,
                    'addressID': address.id,
                }
                location = self._create(MemberLocation, **locationDict)
                self.session.add(location)
                self.session.flush()
                if verbose:
                    print '\tAdded/Replaced address[%s] location[%s] for member[%s]' % (address, location, memberID)
            except IntegrityError:
                pass

    def process(self, csvUsrFile, csvPrfFile):
        self._cache(meta.MemberRoles, self.memberRoleDict)
        self._cache(meta.MemberStates, self.memberStateDict)
        self._cache(meta.MemberAuthTypes, self.memberAuthTypeDict)
        ck12AuthID = self.memberAuthTypeDict['ck-12']['id']
        profileMap = {}
        #
        #  Process profile.
        #
        f = open(csvPrfFile, 'r')
        reader = csv.reader(f, delimiter=',', quotechar='"')
        for row in reader:
            for n in range(0, len(row)):
                row[n] = row[n].replace('\\N', '')
            profile = Profile(row)
            profileDict = profile.asDict()
            id = profileDict['userID']
            profileMap[str(id)] = profileDict
        #print 'profileMap[%s]' % profileMap

        f = open(csvUsrFile, 'r')
        reader = csv.reader(f, delimiter=',', quotechar='"')
        for row in reader:
            user = User(row)
            userDict = user.asDict()
            #print userDict
            email = userDict.get('email')
            if not email:
                continue

            profileDict = profileMap.get(userDict['id'])
            if userDict['isActive'] == '1':
                stateID = self.memberStateDict['activated']['id']
            else:
                stateID = self.memberStateDict['deactivated']['id']

            memberDict = {
                'stateID': stateID,
                'email': email,
                'login': userDict['userName'],
                'defaultLogin': self._genURLSafeBase64Encode(email, usePrefix=False),
                'givenName' : userDict['firstName'],
                'surname': userDict['lastName'],
                'loginTime': userDict['lastLogin'],
                'creationTime': userDict['dateJoined'],
                'emailVerified': userDict['isActive'],
            }
            if userDict['userName'].lower() == email.lower():
                memberDict['login'] = memberDict['defaultLogin']
            addrList = []
            if profileDict:
                memberDict.update({
                    'website': profileDict['url'],
                    'title': profileDict['prefix'],
                    'suffix': profileDict['suffix'],
                    'phone': profileDict['phone'],
                    'fax': profileDict['fax'],
                })
                addresses = profileDict['addresses']
                for address in addresses:
                    addrDict = {}
                    addrList.append(addrDict)
                    countryID = address['countryID']
                    if not countryID:
                        continue
                    addrDict['countryID'] = countryID
                    streetInfo = address['line'][0]
                    l = streetInfo.split(' ')
                    try:
                        num = int(l[0])
                    except ValueError:
                        num = None
                    if num:
                        addrDict.update({
                            'streetNumber' : num,
                            'street1': ' '.join(l[1:]),
                            'street2': address['line'][1],
                        })
                    addrDict.update({
                        'city': address['city'],
                    })
                    if countryID == '1':
                        zip = address['postalCode']
                        if zip:
                            zip = zip.zfill(5)
                        addrDict.update({
                            'state': address['province'],
                            'zip': zip,
                        })
                    else:
                        addrDict.update({
                            'province': address['province'],
                            'postalCode': address['postalCode'],
                        })
            status = -1
            try:
                status = self._exec(meta.Members.insert(), [ memberDict ], isRow=True)
                if verbose and status is 0:
                    print 'Created member[%s]' % memberDict
            except Exception, e:
                print 'row[%s] exception' % row
                print 'exception[%s]' % e

            try:
                rows = self.getTable(meta.Members, meta.Members.c.email == email)
                if len(rows) > 0:
                    member = rows[0]
                    id = member['id']

                    if status is 1:
                        #
                        #  Update instead of create.
                        #
                        update = meta.Members.update()
                        update = update.where(meta.Members.c.id == id)
                        dirty = False
                        if not member['login'] and userDict['userName']:
                            if userDict['userName'].lower() != email.lower():
                                update = update.values(login = userDict['userName'])
                                dirty = True
                        if not member['givenName'] and userDict['firstName']:
                            update = update.values(givenName = userDict['firstName'])
                            dirty = True
                        if not member['surname'] and userDict['lastName']:
                            update = update.values(surname = userDict['lastName'])
                            dirty = True
                        if not member['loginTime'] and userDict['lastLogin']:
                            update = update.values(loginTime = userDict['lastLogin'])
                            dirty = True
                        if userDict['dateJoined']:
                            update = update.values(creationTime = userDict['dateJoined'])
                            dirty = True
                        if profileDict:
                            if not member['website'] and profileDict['url']:
                                update = update.values(website = profileDict['url'])
                                dirty = True
                            if not member['title'] and profileDict['prefix']:
                                update = update.values(title = profileDict['prefix'])
                                dirty = True
                            if not member['suffix'] and profileDict['suffix']:
                                update = update.values(suffix = profileDict['suffix'])
                                dirty = True
                            if not member['phone'] and profileDict['phone']:
                                update = update.values(phone = profileDict['phone'])
                                dirty = True
                            if not member['fax'] and profileDict['fax']:
                                update = update.values(fax = profileDict['fax'])
                                dirty = True
                        if dirty:
                            self.connection.execute(update)
                            if verbose:
                                print 'Updated member[%s]' % memberDict

                    from sqlalchemy.sql import and_

                    ext = self.getTable(meta.MemberExtData, and_(meta.MemberExtData.c.memberID == id, meta.MemberExtData.c.authTypeID == 1))
                    if len(ext) == 0:
                        memberExtDataDict = {
                            'memberID': id,
                            'authTypeID': ck12AuthID,
                            'token': userDict['password'],
                            'verified': userDict['isActive'],
                        }
                        self._exec(meta.MemberExtData.insert(), [ memberExtDataDict ])
                        if verbose:
                            print '\tCreated extData[%s]' % memberExtDataDict
            except Exception, e:
                print 'row[%s] exception' % row
                print 'profileDict[%s] exception' % profileDict
                print 'memberDict[%s] exception' % memberDict
                print 'exception[%s]' % e
                raise e
            #
            #  Added addresses.
            #
            self._addAddresses(id, addrList)

            if status is 0:
                try:
                    roles = []
                    
                    #EZ:01/12/12 
                    #We decided that all user will have one role in the default group 1
                    #For this script, either the user is admin, or the user is a regular member
                    if userDict['isSuperUser'] == '1':
                        roleID = self.memberRoleDict['admin']['id']
                        roles.append({
                            'groupID' : 1,
                            'memberID':id,
                            'roleID': roleID,
                        })
                    else :
                        roleID = self.memberRoleDict['member']['id']
                        roles.append({
                            'groupID' : 1,
                            'memberID':id,
                            'roleID': roleID,
                        })                        
                    #if userDict['isStaff'] == '1':
                    #    roleID = self.memberRoleDict['staff']['id']
                    #    roles.append({
                    #        'groupID' : 1,
                    #        'memberID':id,
                    #        'roleID': roleID,
                    #    })
                    if len(roles) > 0:
                        self._exec(meta.GroupHasMembers.insert(), roles)
                        if verbose:
                            print '\tCreated roles%s' % roles
                except IntegrityError:
                    pass
                except Exception, e:
                    print 'row[%s] exception' % row
                    print 'exception[%s]' % e
                    raise e


if __name__ == "__main__":
    import optparse

    sourceFile = '/tmp/auth_user.txt'
    profileFile = '/tmp/flexbook_userprofile.txt'
    url = 'mysql://dbadmin:D-coD#43@localhost:3306/flx2?charset=utf8'

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-d', '--dest', dest='url', default=url,
        help='The URL for connecting to the database. Defaults to %s' % url
    )
    parser.add_option(
        '-f', '--source-file', dest='sourceFile', default=sourceFile,
        help='Location of the user file to be imported. Defaults to %s' % sourceFile
    )
    parser.add_option(
        '-p', '--profile-file', dest='profileFile', default=profileFile,
        help='Location of the profile file to be imported. Defaults to %s' % profileFile
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    sourceFile = options.sourceFile
    url = options.url
    verbose = options.verbose

    if verbose:
        print 'Importing database tables from %s to %s' % (sourceFile, url)
    Import(url).process(sourceFile, profileFile)
