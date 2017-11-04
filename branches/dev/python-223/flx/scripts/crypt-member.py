from __future__ import print_function

class DecryptMember:

    def __init__(self):
        import sys
        cmdFolder = '/opt/2.0/flx/pylons/auth'
        if cmdFolder not in sys.path:
            sys.path.insert(0, cmdFolder)

    def decrypt(self, action, value, verbose=True):
        from auth.model import meta
        from auth.lib import aes

        if action == '1':
            value = aes.encrypt(value, meta.key)
        elif action == '2':
            value = aes.decrypt(value, meta.key)
        print('value = %s' % value)

if __name__ == "__main__":
    import optparse

    action = '1'
    value = None

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-a', '--action', dest='action', default=action,
        help='The action.',
    )
    parser.add_option(
        '-v', '--value', dest='value', default=value,
        help='The value.',
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    action = options.action
    value = options.value
    verbose = options.verbose

    a = DecryptMember()
    a.decrypt(action, value, verbose)
