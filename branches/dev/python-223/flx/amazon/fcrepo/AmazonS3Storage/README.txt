
                   Amazon S3 Storage Module (for Fedora) v0.1
                   ------------------------------------------

This code provides a replacement module for the lowlevel storage module of Fedora.
Rather than storing object and datastream files on the local file system this module
allows you to store them on Amazon's Simple Storage System (S3).

In order to use this module with Fedora:
1. Install a new Fedora instance. Do not start the server.
2. Unpack the Fedora war in the server. If you are using the included Tomcat, this
   means going to $FEDORA_HOME/tomcat/webapps and unzipping the fedora.war into
   a directory called fedora. This is normally done for you by Tomcat on startup,
   but you need access to the Fedora webapp prior to startup (because you want
   the startup process to store the default objects in your S3 storage directly.)
3. Add the amazons3llstore.jar to the WEB-INF/lib directory under your newly unpacked
   Fedora war.
4. Replace the truststore under $FEDORA_HOME/server with the truststore included with
   this module.
5. Update the Fedora configuration file (fedora.fcfg) by replacing the ILowlevelStorage
   module with a completed version of the configuration included below:

 <module role="fedora.server.storage.lowlevel.ILowlevelStorage"
         class="fedora.server.storage.lowlevel.AmazonS3LowlevelStorage">
   <param name="aws_access_key_id" value="{Your AWS Access Key}">
     <comment>The Amazon S3 Access Key ID</comment>
   </param>
   <param name="aws_secret_access_key" value="{Your AWS Secret Access Key}">
     <comment>The Amazon S3 Secret Access Key</comment>
   </param>
   <param name="bucket_name" value="{Your bucket name}">
     <comment>The name of the bucket in which to store and access files
              on Amazon S3. Note that this name must be unique across all of
              Amazon S3.</comment>
   </param>
   <param name="read_permissions" value="private">
     <comment>Read permissions for files stored in Amazon S3.
              Value should be either "public" or "private".</comment>
   </param>
   <param name="secure_connection" value="true">
     <comment>Determines if SSL should be used on the connection to Amazon S3.
              Value should be either "true" or "false".</comment>
   </param>
 </module>
 
Building the JAR:
If you make changes to the code you will need to repack the class files into the
amazons3llstore.jar file. There are several ways to do this, but it is important
to note that classes from the Fedora server codebase are necessary to compile the
classes included in this module. One way to create the jar is to import the 
AmazonS3Storage project into Eclipse. You will also need to have an Eclipse 
project which includes the Fedora server source. If your Fedora source is in a
project named something other than trunk you'll need to update the build path
of the AmazonS3Storage project to point to the correct project and to point to
the log4j.jar in that project. After this is done you can simply export as a jar.

Encrypting the Access Keys:
The code has been changed to use encrypted aws access key id and aws secret key. 
Un-encrypted keys no longer work. To encrypt a key and encoded it with base 64
encoding, run the following ant task:

  ant encrypt -Dinput="<your-key>"

Copy the encrypted value that appears on the line "Encrypted: [...]" and paste
it in the fedora configuration file. Do not include the square brackets.

