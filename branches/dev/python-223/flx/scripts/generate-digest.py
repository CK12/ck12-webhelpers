import hashlib
import urllib

def generateDigest(password, salt):
    if type(password) == unicode:
        password = password.encode('utf8')
    password = urllib.unquote(password)
    p = salt + password
    token = hashlib.sha256(p).hexdigest()
    return 'sha256:%s:%s' % (salt, token)

if __name__ == "__main__":
    import optparse

    salt = None
    seed = None
    password = None

    parser = optparse.OptionParser('%prog [options]')
    parser.add_option(
        '-s', '--salt', dest='salt', default=salt,
        help='The salt.'
    )
    parser.add_option(
        '-e', '--seed', dest='seed', default=seed,
        help='The seed.'
    )
    parser.add_option(
        '-p', '--password', dest='password', default=password,
        help='The password.'
    )
    parser.add_option(
        '-q', '--quiet', action='store_false', dest='verbose', default=True,
        help='Turn verbose mode off.'
    )
    options, args = parser.parse_args()
    if args:
        parser.error('Expected no arguments. Got %r' % args)

    password = unicode(options.password)
    seed = options.seed
    salt = options.salt
    if not salt:
        if not seed:
            import random

            seed = str(random.random())
        salt = hashlib.sha256(seed).hexdigest()[:5]
    verbose = options.verbose

    if not password:
        import sys

        print('No password.')
        sys.exit()

    if verbose:
        print('Generate token for password[%s] salt[%s]' % (password, salt))

    token = generateDigest(password, salt=salt)
    print token
