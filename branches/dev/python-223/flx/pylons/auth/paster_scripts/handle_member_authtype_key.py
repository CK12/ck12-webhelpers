from auth.model import meta
from sqlalchemy.orm import aliased, exc
from sqlalchemy.sql import func
from sqlalchemy.exc import SQLAlchemyError
from Crypto.PublicKey import RSA
from Crypto.Signature import PKCS1_v1_5
from base64 import b64decode

def run(partnerName, action, partnerPublicKeyPEMFile=None, partnerPrivateKeyPEMFile=None, partnerPassPhrase=None):
    if action not in ('GET_KEY', 'UPDATE_KEY', 'DELETE_KEY', 'INSERT_KEY', 'UPSERT_KEY'):
        return u"Invalid action : [{action}] received. It should be one of GET_KEY | INSERT_KEY | UPDATE_KEY | DELETE_KEY | UPSERT_KEY.".format(action=action).encode('utf-8')

    session = meta.Session
    try:
        session.begin()
        try:
            (partnerID, )= session.query(meta.MemberAuthTypes.c.id).filter(meta.MemberAuthTypes.c.name == partnerName).one()
        except exc.NoResultFound:
            return u"Partner with the given partnerName : [{partnerName}] could not be found in the dataBase.".format(partnerName=partnerName).encode('utf-8')
        except exc.MultipleResultsFound:
            return u"Multiple partners with the given partnerName : [{partnerName}] are found in the dataBase. Internal System data error.".format(partnerName=partnerName).encode('utf-8')

        if action == 'GET_KEY':
            memberAuthTypeKeyInfoTuples = session.query(meta.MemberAuthTypeKey.c.publicKey, meta.MemberAuthTypeKey.c.privateKey, meta.MemberAuthTypeKey.c.passPhrase).filter(meta.MemberAuthTypeKey.c.memberAuthTypeID==partnerID).all()
            if len(memberAuthTypeKeyInfoTuples) == 0:
                return u"Partner with the given partnerName : [{partnerName}] currently doesn't have any key-pair associated with him in the dataBase.".format(partnerName=partnerName).encode('utf-8')
            elif len(memberAuthTypeKeyInfoTuples) == 1:
                memberAuthTypeKeyInfoTuple = memberAuthTypeKeyInfoTuples[0]
                partnerPublicKey = memberAuthTypeKeyInfoTuple[0]
                partnerPrivateKey = memberAuthTypeKeyInfoTuple[1]
                partnerPassPhrase = memberAuthTypeKeyInfoTuple[2]
                return u"partnerName : [{partnerName}] has partnerPublicKey : [{partnerPublicKey}] and partnerPrivateKey : [{partnerPrivateKey}] with partnerPassPhrase : [{partnerPassPhrase}].".format(partnerName=partnerName, partnerPublicKey=partnerPublicKey, partnerPrivateKey=partnerPrivateKey, partnerPassPhrase=partnerPassPhrase).encode('utf-8')
            else:
                return u"Multiple key pairs are found for the partner with the given partnerName : [{partnerName}]. Internal system data error.".format(partnerName=partnerName).encode('utf-8')
        
        elif action == 'INSERT_KEY':
            memberAuthTypeKeyInfoTuples = session.query(meta.MemberAuthTypeKey.c.publicKey, meta.MemberAuthTypeKey.c.privateKey, meta.MemberAuthTypeKey.c.passPhrase).filter(meta.MemberAuthTypeKey.c.memberAuthTypeID==partnerID).all()
            if len(memberAuthTypeKeyInfoTuples) == 0:
                if not partnerPublicKeyPEMFile:
                    return "Key pair of the partner with the given partnerName : [{partnerName}] could not be inserted as partnerPublicKeyPEMFile is not provided.".format(partnerName=partnerName).encode('utf-8')

                partnerPublicKey = None
                try:
                    partnerPublicKey = open(partnerPublicKeyPEMFile).read()
                    partnerPublicKey = partnerPublicKey.replace('\\n', '\n')
                except Exception, e:
                    return "Key pair of the partner with the given partnerName : [{partnerName}] could not be inserted as an error with errorMessage : [{errorMessage}] occured while trying to process the given partnerPublicKeyPEMFile. Please provide path of a valid PEM file containing a proper 1024 bit RSA public key".format(partnerName=partnerName, errorMessage=str(e)).encode('utf-8') 

                if not partnerPublicKey:
                    return "Key pair of the partner with the given partnerName : [{partnerName}] could not be inserted as given partnerPublicKey is null.".format(partnerName=partnerName).encode('utf-8')
                else:
                    try:
                        key = RSA.importKey(partnerPublicKey, passphrase=partnerPassPhrase)
                        signatureVerifier = PKCS1_v1_5.new(key)
                        if key.size() > 1024:
                            return "Key pair of the partner with the given partnerName : [{partnerName}] could not be inserted as given partnerPublicKey's size : [{size}] is greater than 1024. Please try to use a proper 1024 bit RSA public key".format(partnerName=partnerName, size=key.size()).encode('utf-8') 
                    except Exception, e:
                        return "Key pair of the partner with the given partnerName : [{partnerName}] could not be inserted as given partnerPublicKey is invalid and An error with errorMessage : [{errorMessage}] occured while trying to process it. Please try to use a proper 1024 bit RSA public key".format(partnerName=partnerName, errorMessage=str(e)).encode('utf-8') 
                    
                    if partnerPrivateKeyPEMFile is not None:
                        partnerPrivateKey = None
                        try:
                           partnerPrivateKey = open(partnerPrivateKeyPEMFile).read()
                           partnerPrivateKey = partnerPrivateKey.replace('\\n', '\n')
                        except Exception, e:
                            return "Key pair of the partner with the given partnerName : [{partnerName}] could not be inserted as an error with errorMessage : [{errorMessage}] occured while trying to process the given partnerPrivateKeyPEMFile. Please provide path of a valid PEM file containing a proper 1024 bit RSA private key".format(partnerName=partnerName, errorMessage=str(e)).encode('utf-8') 
                        if partnerPrivateKey is not None:
                            try:
                                key = RSA.importKey(partnerPrivateKey, passphrase=partnerPassPhrase)
                                signatureVerifier = PKCS1_v1_5.new(key)
                                if key.size() > 1024:
                                    return "Key pair of the partner with the given partnerName : [{partnerName}] could not be inserted as given partnerPrivateKey's size : [{size}] is greater than 1024. Please try to use a proper 1024 bit RSA private key".format(partnerName=partnerName, size=key.size()).encode('utf-8')                       
                            except Exception, e:
                                return "Key pair of the partner with the given partnerName : [{partnerName}] could not be inserted as given partnerPrivateKey is invalid and An error with errorMessage : [{errorMessage}] occured while trying to process it. Please try to use a proper 1024 bit RSA private key".format(partnerName=partnerName, errorMessage=str(e)).encode('utf-8') 
                    else:
                        partnerPrivateKey = None      
                    session.execute(meta.MemberAuthTypeKey.insert(), [{'memberAuthTypeID':partnerID, 'publicKey':partnerPublicKey, 'privateKey':partnerPrivateKey, 'passPhrase':partnerPassPhrase}])
                    session.commit()
                    return u"Partner with the given partnerName : [{partnerName}]'s key pair of partnerPublicKey: [{partnerPublicKey}] and partnerPrivateKey: [{partnerPrivateKey}] with partnerPassPhrase : [{partnerPassPhrase}] is inserted in to dataBase.".format(partnerName=partnerName, partnerPublicKey=partnerPublicKey, partnerPrivateKey=partnerPrivateKey, partnerPassPhrase=partnerPassPhrase).encode('utf-8')           
            elif len(memberAuthTypeKeyInfoTuples) == 1:
                memberAuthTypeKeyInfoTuple = memberAuthTypeKeyInfoTuples[0]
                partnerPublicKey = memberAuthTypeKeyInfoTuple[0]
                partnerPrivateKey = memberAuthTypeKeyInfoTuple[1]
                partnerPassPhrase = memberAuthTypeKeyInfoTuple[2]
                return u"partnerName : [{partnerName}]has partnerPublicKey : [{partnerPublicKey}] and partnerPrivateKey : [{partnerPrivateKey}] with partnerPassPhrase : [{partnerPassPhrase}] is already found in the dataBase. Hence could not insert the new key-pair. Please use 'UPDATE_KEY | UPSERT_KEY' action instead.".format(partnerName=partnerName, partnerPublicKey=partnerPublicKey, partnerPrivateKey=partnerPrivateKey, partnerPassPhrase=partnerPassPhrase).encode('utf-8')
            else:
                return u"Multiple key pairs are already found for the partner with the given partnerName : [{partnerName}]. Internal system data error. Hence could not insert the new key pair".format(partnerName=partnerName).encode('utf-8')
            
        elif action == 'UPDATE_KEY':
            memberAuthTypeKeyInfoTuples = session.query(meta.MemberAuthTypeKey.c.publicKey, meta.MemberAuthTypeKey.c.privateKey, meta.MemberAuthTypeKey.c.passPhrase).filter(meta.MemberAuthTypeKey.c.memberAuthTypeID==partnerID).all()
            if len(memberAuthTypeKeyInfoTuples) == 0:
                return u"Partner with the given partnerName : [{partnerName}] currently doesn't have any key-pair associated with him in the dataBase.".format(partnerName=partnerName).encode('utf-8')
            elif len(memberAuthTypeKeyInfoTuples) == 1:
                if not partnerPublicKeyPEMFile:
                    return "Key pair of the partner with the given partnerName : [{partnerName}] could not be updated as partnerPublicKeyPEMFile is not provided.".format(partnerName=partnerName).encode('utf-8')

                partnerPublicKey = None
                try:
                    partnerPublicKey = open(partnerPublicKeyPEMFile).read()
                    partnerPublicKey = partnerPublicKey.replace('\\n', '\n')
                except Exception, e:
                    return "Key pair of the partner with the given partnerName : [{partnerName}] could not be updated as an error with errorMessage : [{errorMessage}] occured while trying to process the given partnerPublicKeyPEMFile. Please provide path of a valid PEM file containing a proper 1024 bit RSA public key".format(partnerName=partnerName, errorMessage=str(e)).encode('utf-8') 

                if not partnerPublicKey:
                    return "Key pair of the partner with the given partnerName : [{partnerName}] could not be updated as given partnerPublicKey is null.".format(partnerName=partnerName).encode('utf-8')
                else:
                    try:
                        key = RSA.importKey(partnerPublicKey, passphrase=partnerPassPhrase)
                        signatureVerifier = PKCS1_v1_5.new(key)
                        if key.size() > 1024:
                            return "Key pair of the partner with the given partnerName : [{partnerName}] could not be updated as given partnerPublicKey's size : [{size}] is greater than 1024. Please try to use a proper 1024 bit RSA public key".format(partnerName=partnerName, size=key.size()).encode('utf-8') 
                    except Exception, e:
                        return "Key pair of the partner with the given partnerName : [{partnerName}] could not be updated as given partnerPublicKey is invalid and An error with errorMessage : [{errorMessage}] occured while trying to process it. Please try to use a proper 1024 bit RSA public key".format(partnerName=partnerName, errorMessage=str(e)).encode('utf-8') 
                    
                    if partnerPrivateKeyPEMFile is not None:
                        partnerPrivateKey = None
                        try:
                            partnerPrivateKey = open(partnerPrivateKeyPEMFile).read()
                            partnerPrivateKey = partnerPrivateKey.replace('\\n', '\n')
                        except Exception, e:
                            return "Key pair of the partner with the given partnerName : [{partnerName}] could not be updated as an error with errorMessage : [{errorMessage}] occured while trying to process the given partnerPrivateKeyPEMFile. Please provide path of a valid PEM file containing a proper 1024 bit RSA private key".format(partnerName=partnerName, errorMessage=str(e)).encode('utf-8') 
                        if partnerPrivateKey is not None:
                            try:
                                key = RSA.importKey(partnerPrivateKey, passphrase=partnerPassPhrase)
                                signatureVerifier = PKCS1_v1_5.new(key)
                                if key.size() > 1024:
                                    return "Key pair of the partner with the given partnerName : [{partnerName}] could not be updated as given partnerPrivateKey's size : [{size}] is greater than 1024. Please try to use a proper 1024 bit RSA private key".format(partnerName=partnerName, size=key.size()).encode('utf-8')                       
                            except Exception, e:
                                return "Key pair of the partner with the given partnerName : [{partnerName}] could not be updated as given partnerPrivateKey is invalid and An error with errorMessage : [{errorMessage}] occured while trying to process it. Please try to use a proper 1024 bit RSA private key".format(partnerName=partnerName, errorMessage=str(e)).encode('utf-8') 
                    else:
                        partnerPrivateKey = None    
                    session.execute(meta.MemberAuthTypeKey.update().values(publicKey=partnerPublicKey, privateKey=partnerPrivateKey, passPhrase=partnerPassPhrase).where(meta.MemberAuthTypeKey.c.memberAuthTypeID==partnerID))
                    session.commit()
                    return u"Partner with the given partnerName : [{partnerName}]'s key pair of partnerPublicKey: [{partnerPublicKey}] and partnerPrivateKey: [{partnerPrivateKey}] with partnerPassPhrase : [{partnerPassPhrase}] are updated in to dataBase.".format(partnerName=partnerName, partnerPublicKey=partnerPublicKey, partnerPrivateKey=partnerPrivateKey, partnerPassPhrase=partnerPassPhrase).encode('utf-8')
            else:
                return u"Multiple key pairs are found for the partner with the given partnerName : [{partnerName}]. Internal system data error.".format(partnerName=partnerName).encode('utf-8')
       
        elif action == 'DELETE_KEY':
            memberAuthTypeKeyInfoTuples = session.query(meta.MemberAuthTypeKey.c.publicKey, meta.MemberAuthTypeKey.c.privateKey, meta.MemberAuthTypeKey.c.passPhrase).filter(meta.MemberAuthTypeKey.c.memberAuthTypeID==partnerID).all()
            if len(memberAuthTypeKeyInfoTuples) == 0:
                return u"Partner with the given partnerName : [{partnerName}] currently doesn't have any key-pair associated with him in the dataBase.".format(partnerName=partnerName).encode('utf-8')
            elif len(memberAuthTypeKeyInfoTuples) == 1:
                session.execute(meta.MemberAuthTypeKey.delete().where(meta.MemberAuthTypeKey.c.memberAuthTypeID==partnerID))              
                session.commit()
                return u"partnerName : [{partnerName}]'s key-pair is now deleted from dataBase.".format(partnerName=partnerName).encode('utf-8')
            else:
                return u"Multiple key pairs are found for the partner with the given partnerName : [{partnerName}]. Internal system data error.".format(partnerName=partnerName).encode('utf-8')
        
        elif action == 'UPSERT_KEY':
            memberAuthTypeKeyInfoTuples = session.query(meta.MemberAuthTypeKey.c.publicKey, meta.MemberAuthTypeKey.c.privateKey, meta.MemberAuthTypeKey.c.passPhrase).filter(meta.MemberAuthTypeKey.c.memberAuthTypeID==partnerID).all()
            if len(memberAuthTypeKeyInfoTuples) == 0:
                if not partnerPublicKeyPEMFile:
                    return "Key pair of the partner with the given partnerName : [{partnerName}] could not be upserted as partnerPublicKeyPEMFile is not provided.".format(partnerName=partnerName).encode('utf-8')

                partnerPublicKey = None
                try:
                    partnerPublicKey = open(partnerPublicKeyPEMFile).read()
                    partnerPublicKey = partnerPublicKey.replace('\\n', '\n')
                except Exception, e:
                    return "Key pair of the partner with the given partnerName : [{partnerName}] could not be upserted as an error with errorMessage : [{errorMessage}] occured while trying to process the given partnerPublicKeyPEMFile. Please provide path of a valid PEM file containing a proper 1024 bit RSA public key".format(partnerName=partnerName, errorMessage=str(e)).encode('utf-8') 

                if not partnerPublicKey:
                    return "Key pair of the partner with the given partnerName : [{partnerName}] could not be upserted as given partnerPublicKey is null.".format(partnerName=partnerName).encode('utf-8')
                else:
                    try:
                        key = RSA.importKey(partnerPublicKey, passphrase=partnerPassPhrase)
                        signatureVerifier = PKCS1_v1_5.new(key)
                        if key.size() > 1024:
                            return "Key pair of the partner with the given partnerName : [{partnerName}] could not be upserted as given partnerPublicKey's size : [{size}] is greater than 1024. Please try to use a proper 1024 bit RSA public key".format(partnerName=partnerName, size=key.size()).encode('utf-8') 
                    except Exception, e:
                        return "Key pair of the partner with the given partnerName : [{partnerName}] could not be upserted as given partnerPublicKey is invalid and An error with errorMessage : [{errorMessage}] occured while trying to process it. Please try to use a proper 1024 bit RSA public key".format(partnerName=partnerName, errorMessage=str(e)).encode('utf-8') 
                    
                    if partnerPrivateKeyPEMFile is not None:
                        partnerPrivateKey = None
                        try:
                           partnerPrivateKey = open(partnerPrivateKeyPEMFile).read()
                           partnerPrivateKey = partnerPrivateKey.replace('\\n', '\n')
                        except Exception, e:
                            return "Key pair of the partner with the given partnerName : [{partnerName}] could not be upserted as an error with errorMessage : [{errorMessage}] occured while trying to process the given partnerPrivateKeyPEMFile. Please provide path of a valid PEM file containing a proper 1024 bit RSA private key".format(partnerName=partnerName, errorMessage=str(e)).encode('utf-8') 
                        if partnerPrivateKey is not None:
                            try:
                                key = RSA.importKey(partnerPrivateKey, passphrase=partnerPassPhrase)
                                signatureVerifier = PKCS1_v1_5.new(key)
                                if key.size() > 1024:
                                    return "Key pair of the partner with the given partnerName : [{partnerName}] could not be upserted as given partnerPrivatedKey's size : [{size}] is greater than 1024. Please try to use a proper 1024 bit RSA private key".format(partnerName=partnerName, size=key.size()).encode('utf-8')                   
                            except Exception, e:
                                return "Key pair of the partner with the given partnerName : [{partnerName}] could not be upserted as given partnerPrivateKey is invalid and An error with errorMessage : [{errorMessage}] occured while trying to process it. Please try to use a proper 1024 bit RSA private key".format(partnerName=partnerName, errorMessage=str(e)).encode('utf-8') 
                    else:
                        partnerPrivateKey = None                              
                    session.execute(meta.MemberAuthTypeKey.insert(), [{'memberAuthTypeID':partnerID, 'publicKey':partnerPublicKey, 'privateKey':partnerPrivateKey, 'passPhrase':partnerPassPhrase}])
                    session.commit()
                    return u"Partner with the given partnerName : [{partnerName}]'s key pair of partnerPublicKey: [{partnerPublicKey}] and partnerPrivateKey: [{partnerPrivateKey}] with partnerPassPhrase : [{partnerPassPhrase}] is upserted in to dataBase.".format(partnerName=partnerName, partnerPublicKey=partnerPublicKey, partnerPrivateKey=partnerPrivateKey, partnerPassPhrase=partnerPassPhrase).encode('utf-8')
            elif len(memberAuthTypeKeyInfoTuples) == 1:
                if not partnerPublicKeyPEMFile:
                    return "Key pair of the partner with the given partnerName : [{partnerName}] could not be upserted as partnerPublicKeyPEMFile is not provided.".format(partnerName=partnerName).encode('utf-8')

                partnerPublicKey = None
                try:
                    partnerPublicKey = open(partnerPublicKeyPEMFile).read()
                    partnerPublicKey = partnerPublicKey.replace('\\n', '\n')
                except Exception, e:
                    return "Key pair of the partner with the given partnerName : [{partnerName}] could not be upserted as an error with errorMessage : [{errorMessage}] occured while trying to process the given partnerPublicKeyPEMFile. Please provide path of a valid PEM file containing a proper 1024 bit RSA public key".format(partnerName=partnerName, errorMessage=str(e)).encode('utf-8') 

                if not partnerPublicKey:
                    return "Key pair of the partner with the given partnerName : [{partnerName}] could not be upserted as given partnerPublicKey is null.".format(partnerName=partnerName).encode('utf-8')
                else:
                    try:
                        key = RSA.importKey(partnerPublicKey, passphrase=partnerPassPhrase)
                        signatureVerifier = PKCS1_v1_5.new(key)
                        if key.size() > 1024:
                            return "Key pair of the partner with the given partnerName : [{partnerName}] could not be upserted as given partnerPublicKey's size : [{size}] is greater than 1024. Please try to use a proper 1024 bit RSA public key".format(partnerName=partnerName, size=key.size()).encode('utf-8') 
                    except Exception, e:
                        return "Key pair of the partner with the given partnerName : [{partnerName}] could not be upserted as given partnerPublicKey is invalid and An error with errorMessage : [{errorMessage}] occured while trying to process it. Please try to use a proper 1024 bit RSA public key".format(partnerName=partnerName, errorMessage=str(e)).encode('utf-8') 
                    
                    if partnerPrivateKeyPEMFile is not None:
                        partnerPrivateKey = None
                        try:
                           partnerPrivateKey = open(partnerPrivateKeyPEMFile).read()
                           partnerPrivateKey = partnerPrivateKey.replace('\\n', '\n')
                        except Exception, e:
                            return "Key pair of the partner with the given partnerName : [{partnerName}] could not be upserted as an error with errorMessage : [{errorMessage}] occured while trying to process the given partnerPrivateKeyPEMFile. Please provide path of a valid PEM file containing a proper 1024 bit RSA private key".format(partnerName=partnerName, errorMessage=str(e)).encode('utf-8') 
                        if partnerPrivateKey is not None:
                            try:
                                key = RSA.importKey(partnerPrivateKey, passphrase=partnerPassPhrase)
                                signatureVerifier = PKCS1_v1_5.new(key)
                                if key.size() > 1024:
                                    return "Key pair of the partner with the given partnerName : [{partnerName}] could not be upserted as given partnerPrivateKey's size : [{size}] is greater than 1024. Please try to use a proper 1024 bit RSA public key".format(partnerName=partnerName, size=key.size()).encode('utf-8') 
                            except Exception, e:
                                return "Key pair of the partner with the given partnerName : [{partnerName}] could not be upserted as given partnerPrivateKey is invalid and An error with errorMessage : [{errorMessage}] occured while trying to process it. Please try to use a proper 1024 bit RSA private key".format(partnerName=partnerName, errorMessage=str(e)).encode('utf-8') 
                    else:
                        partnerPrivateKey = None                    
                    session.execute(meta.MemberAuthTypeKey.update().values(publicKey=partnerPublicKey, privateKey=partnerPrivateKey, passPhrase=partnerPassPhrase).where(meta.MemberAuthTypeKey.c.memberAuthTypeID==partnerID))
                    session.commit()
                    return u"Partner with the given partnerName : [{partnerName}]'s key pair of partnerPublicKey: [{partnerPublicKey}] and partnerPrivateKey: [{partnerPrivateKey}] with partnerPassPhrase : [{partnerPassPhrase}] are updated in to dataBase.".format(partnerName=partnerName, partnerPublicKey=partnerPublicKey, partnerPrivateKey=partnerPrivateKey, partnerPassPhrase=partnerPassPhrase).encode('utf-8')
            else:
                return u"Multiple key pairs are already found for the partner with the given partnerName : [{partnerName}]. Internal system data error. Hence could not insert the new key pair".format(partnerName=partnerName).encode('utf-8')
            
    except SQLAlchemyError, sqlae:
        session.rollback()
        return unicode(sqlae).encode('utf-8')
    except Exception, e:
        session.rollback()
        return unicode(e)
    finally:
        session.expire_all()
        session.close()
        session.remove()