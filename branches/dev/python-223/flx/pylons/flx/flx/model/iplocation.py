import logging
import IP2Location

from pylons import config
from flx.lib import helpers as h

log = logging.getLogger(__name__)


class IPLocation(object):
    """
        Class to fetch location information from IP address.
    """
    def __init__(self, db):
        """
            Initialise attributes.
        """
        # Initialise database.
        self.db = db
        self.ip2location_db = self.db["IP2Location"]
        # Get IP2location object.
        self.ip2location = IP2Location.IP2Location()
        ip_to_location_path = config.get('ip2location_db_file')
        self.ip2location.open(ip_to_location_path)

    def get_location(self, ip_address):
        """Fetch location information for client_ip.
           First check if information already stored in mongodb else get it from IP2Location.
        """
        log.info("Processing IP: [%s]" %(ip_address))
        # Get information from mongodb.
        ip_info = self.ip2location_db.find_one({'ip_address': ip_address})
        if ip_info:
            log.info("Record exists in mongodb for IP: [%s], Location: [%s]" % (ip_address, ip_info))
            return ip_info

        log.info("Record does not exists in mongodb for IP: [%s]" %(ip_address))
        # Information does not exist in mongodb so get it from IP2Location
        ip_info = {}
        try:
            ip_info_obj = self.ip2location.get_all(ip_address)
        except Exception as e:
            log.info(str(e))
            log.info("Record does not exists in IP2Location for IP: [%s]" %(ip_address))
            return {}

        # Get the required location details.
        ip_info['country_short'] = ip_info_obj.country_short.lower()
        ip_info['country_long'] = ip_info_obj.country_long.lower()
        ip_info['region'] = ip_info_obj.region.lower()
        ip_info['city'] = ip_info_obj.city.lower()
        ip_info['isp'] = ip_info_obj.isp.lower()
        ip_info['latitude'] = ip_info_obj.latitude
        ip_info['longitude'] = ip_info_obj.longitude
        ip_info['domain'] = ip_info_obj.domain
        ip_info['zipcode'] = ip_info_obj.zipcode
        ip_info['timezone'] = ip_info_obj.timezone
        ip_info['netspeed'] = ip_info_obj.netspeed
        ip_info['idd_code'] = ip_info_obj.idd_code
        ip_info['area_code'] = ip_info_obj.area_code
        ip_info['weather_code'] = ip_info_obj.weather_code
        ip_info['weather_name'] = ip_info_obj.weather_name
        ip_info['mcc'] = ip_info_obj.mcc
        ip_info['mnc'] = ip_info_obj.mnc
        ip_info['mobile_brand'] = ip_info_obj.mobile_brand
        ip_info['elevation'] = ip_info_obj.elevation
        ip_info['usage_type'] = ip_info_obj.usage_type

        ip_info['ip_address'] = ip_address
        for key in ip_info.keys():
            if ip_info[key] == '-':
                ip_info[key] = ''
        log.info("Record exists in IP2Location for IP: [%s], Location: [%s]" % (ip_address, ip_info))
        id = self.ip2location_db.insert(ip_info)
        log.info("Saved record in mongodb for IP: [%s], _id: [%s]" % (ip_address, id))

        return ip_info
