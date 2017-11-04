import logging
from datetime import datetime
import IP2Location

from flx.lib import helpers as h
from flx.model import model
from flx.model.mongo.validationwrapper import ValidationWrapper

log = logging.getLogger(__name__)

class IPLocation(ValidationWrapper):

    def __init__(self, db, dc=False):
        self.db = db
        # Dependency check flag
        self.dc = dc
        config = h.load_pylons_config()
        ip2location_db_file = config.get('ip2location_db_file', '')        
        self.ip2location = IP2Location.IP2Location()
        self.ip2location.open(ip2location_db_file)

    def getIPLocation(self, client_ip):
        """Get the location information from ip.
        """        
        # Check if location available in mongodb
        location_info = self._getIPLocationFromDB(client_ip)

        # Get the location from IP2Location.
        if not location_info:
            location_info = self._getLocationFromIP2Location(client_ip)
            if location_info:
                location_info['client_ip'] = client_ip
                id = self.db.IPLocations.insert(location_info)
                log.info("Stored location information for ip :%s, ID:%s" % (client_ip, id))
        
        if location_info.has_key('_id'):
            del location_info['_id']
        return location_info

    def _getIPLocationFromDB(self, client_ip):
        """Get the location from mongodb.
        """
        ip_info = self.db.IPLocations.find_one({'client_ip':client_ip})
        return ip_info

    def _getLocationFromIP2Location(self, client_ip):
        """Get the location from IP Database.
        """
        location_info = dict()
        try:
            ip2_info = self.ip2location.get_all(client_ip)
            location_info['country_short'] = ip2_info.country_short.lower()
            location_info['country_long'] = ip2_info.country_long.lower()
            location_info['region'] = ip2_info.region.lower()
            location_info['city'] = ip2_info.city.lower()
            location_info['isp'] = ip2_info.isp.lower()
            location_info['latitude'] = ip2_info.latitude
            location_info['longitude'] = ip2_info.longitude
            location_info['domain'] = ip2_info.domain
            location_info['zipcode'] = ip2_info.zipcode
            location_info['timezone'] = ip2_info.timezone
            location_info['netspeed'] = ip2_info.netspeed
            location_info['idd_code'] = ip2_info.idd_code
            location_info['area_code'] = ip2_info.area_code
            location_info['weather_code'] = ip2_info.weather_code
            location_info['weather_name'] = ip2_info.weather_name
            location_info['mcc'] = ip2_info.mcc
            location_info['mnc'] = ip2_info.mnc
            location_info['mobile_brand'] = ip2_info.mobile_brand
            location_info['elevation'] = ip2_info.elevation
            location_info['usage_type'] = ip2_info.usage_type
        except Exception as e:
            log.info("Unable to fetch location from IP Address, Exception: %s" % str(e))

        return location_info
