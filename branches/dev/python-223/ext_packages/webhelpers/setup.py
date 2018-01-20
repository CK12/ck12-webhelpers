try:                                                                                                                                                                                                           
    from setuptools import setup, find_packages
except ImportError:
    from ez_setup import use_setuptools
    use_setuptools()
    from setuptools import setup, find_packages

setup(
    name = 'WebHelpers',
    version = '1.3',
    description='WebHelpers that works under Python 3.',
    packages = find_packages(exclude=['ez_setup']),
    include_package_data=True
)
