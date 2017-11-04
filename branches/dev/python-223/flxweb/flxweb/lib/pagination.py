#
# Copyright 2007-2011 CK-12 Foundation
#
# All rights reserved
#      
#
# Unless required by applicable law or agreed to in writing, software
# distributed under this License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.  See the License for the specific language governing
# permissions and limitations.
#
# This file originally written by Ravi Gidwani
#
# $Id$

"""
Set of classes to support pagination functionality.
"""

from pylons import config
from functools import partial
import logging
import math

LOG = logging.getLogger(__name__)

class Pageable(object):
    """
    Pageable class should be inherited by the classes that need pagination
    support
    """
    def fetch(self, page_number, page_size):
        """
        Returns  the objects based on page_number and page_size parameters 
        Child classes to override.
        """
        pass
    def get_total_count(self):
        """
        Return the total count of items.
        Child classes to override.
        """
        pass


class PageableWrapper(Pageable):
    '''
    Wrapper to be used for making a function pageable i.e it can be used with
    the CK-12 Paginator class to paginate lists.
    '''
    def __init__(self, func):
        '''
        Constructs a PageableWrapper that can be passed to the Paginator class.
        The "func" parameter needs to be of type functools.partial. 
        Example use:
        pageable = PageableWrapper(partial(ArtifactManager.get_my_artifacts,\
                                    artifact_types=artifact_type))
        '''
        if not type(func) == partial:
            raise Exception('PageableWrapper constructor expects "func" parameter to be passed as a functools.partial function')

        self.partial_func = func
        self.total_count = 0

    def fetch(self, page_number, page_size):
        """
        Returns  the artifact objects based on page_number and page_size parameters 
        Child classes to override.
        """
        object_list = []
        try:
            # make the wrapper method call, it should return 
            # the raw API response and the list of objects           
            try:
                count,object_list = self.partial_func(page_num=page_number,page_size=page_size)
            except ValueError,e:
                LOG.exception('%s should return API response and list of objects' % self.partial_func.func)
                raise e

            if count:
                self.total_count = count 
            else:
                self.total_count = 0

        except Exception, exp:
            LOG.exception(exp)
        return object_list

    def get_total_count(self):
        """
        Return the total count of items.
        Child classes to override.
        """
        return self.total_count

class Page(object):
    """
    A class representing a "page" object which includes items included in that page.
    """

    def __init__(self, pageable, current_page_no=1, items_per_page=10):
        self.pageable = pageable
        self.current_page_no = current_page_no
        self.items_per_page = items_per_page
        self.data = None
        # initialize the data
        self.items()

    def items(self):
        """
        Returns the items (objects) that belong to this page instance.
        Normally these will be displayed by iterating 
        """
        if not self.data:
            self.data = self.pageable.fetch(self.current_page_no , self.items_per_page)
        return self.data

class Paginator(object):
    """
    Class to help implement pagination. It paginates a "pageable" object
    and takes extra parameters like items_per_page
    """

    def __init__(self, pageable, current_page_no=1, items_per_page=10):
        self.pageable = pageable
        self.current_page = Page(pageable, current_page_no, items_per_page)
        self.current_page_no = int(current_page_no)
        self.items_per_page = int(items_per_page)
        self.total_pages = int(math.ceil(float(self.pageable.get_total_count()) / float(items_per_page)))

    def get_total_count(self): 
        """
        Returns the total number of items i.e. count of all items in all pages 
        """
        return self.pageable.total_count

    def is_first_page(self):
        """
        Returns True if the current page is the first page
        """
        return self.current_page_no == 1 or self.total_pages == 0

    def is_last_page(self):
        """
        Returns True if the current page is the last page
        """
        return self.current_page_no == self.total_pages or self.total_pages == 0

    def is_current_page(self, page):
        """
        Returns True if the current page number matches the passed
        page number
        """
        return self.current_page_no == page
    
    def first_itemnumber(self):
        """
        Returns first item number on the current page
        """
        if self.get_total_count() > 0:
            return ((self.current_page_no - 1) * self.items_per_page) + 1
        else:
            return 0

    def last_itemnumber(self):
        """
        Returns last item number on the current page
        """
        if self.get_total_count() > 0:
            if self.is_last_page():
                return self.get_total_count()
            else:
                return ((self.current_page_no - 1) * self.items_per_page) + self.items_per_page
        else:
            return 0

    def pages_to_show(self):
        """
        Returns the page numbers to display in the pagination widget. 
        e.g to display something like : 1 2 3 4 5 ... 10
        """
        # total number of pages to show e.g set it to 5 to show a display like: 1 2 3 4 5 ... 10
        number_of_pages_to_show = int(config['pagination_number_of_pages_show'])
        pages = []
        # Note: add 1 to account for the last page e.g '10' in the above example
        if self.total_pages > number_of_pages_to_show + 1:
            if self.current_page_no < number_of_pages_to_show:
                pages = [p for p in range(1, number_of_pages_to_show + 1)]
            elif self.current_page_no + int(number_of_pages_to_show / 2) > self.total_pages:
                pages = [p for p in range(self.current_page_no - int(number_of_pages_to_show / 2), self.total_pages + 1)]
            else:
                pages = [p for p in range(self.current_page_no - int(number_of_pages_to_show / 2), self.current_page_no + int(number_of_pages_to_show / 2) + 1)]
        else:
            pages = [p for p in range(1, self.total_pages + 1)]
        return pages

    def prev_page_no(self):
        """
        Returns the previous page number
        """
        if self.current_page_no > 1:
            return self.current_page_no - 1
        else:
            return self.current_page_no

    def next_page_no(self):
        """
        Returns the next page number
        """
        if self.current_page_no < self.total_pages:
            return self.current_page_no + 1
        else:
            return self.total_pages

    def show_first_page(self):
        """
        Returns true if the first page number should be shown.
        e.g when displaying something like 1 2 <3=current page> 4 5 ... 10,
        if the first page is not within the range of pages to be shown,
        then this method is used to determine if we need to display the
        "<first page number>..." part.
        """
        if 1 not in self.pages_to_show():
            return True
        else:
            return False


    def show_last_page(self):
        """
        Returns true if the last page number should be shown.
        e.g when displaying something like 1 2 <3=current page> 4 5 ... 10,
        if the last page is not within the range of pages to be shown,
        then this method is used to determine if we need to display the
        "...<last page number>" part.
        """
        if self.total_pages not in self.pages_to_show():
            return True
        else:
            return False
