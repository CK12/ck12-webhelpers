/* The contents of this file are subject to the license and copyright terms
 * detailed in the license directory at the root of the source tree (also
 * available online at http://www.fedora.info/license/).
 */

package org.fcrepo.server.storage.lowlevel;

import com.amazon.s3.AWSAuthConnection;
import com.amazon.s3.ListBucketResponse;
import com.amazon.s3.ListEntry;
import com.amazon.s3.Response;

import java.io.InputStream;
import java.io.IOException;

import java.text.DateFormat;
import java.text.SimpleDateFormat;

import java.util.Arrays;
import java.util.Calendar;
import java.util.GregorianCalendar;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.util.TreeMap;

import org.apache.log4j.Logger;

import org.fcrepo.server.errors.LowlevelStorageException;
import org.fcrepo.server.errors.ModuleInitializationException;
import org.fcrepo.server.errors.ObjectNotInLowlevelStorageException;
import org.fcrepo.server.Module;
import org.fcrepo.server.Server;

/**
 * Allows Fedora to store content on Amazon S3. To use this module the default
 * low level storage module needs to be replaced with something similar to:
 *
 * <module role="org.fcrepo.server.storage.lowlevel.ILowlevelStorage"
 *         class="org.fcrepo.server.storage.lowlevel.amazons3.AmazonS3LowlevelStorage">
 *   <param name="aws_access_key_id" value="{Your AWS Access Key}">
 *     <comment>The Amazon S3 Access Key ID</comment>
 *   </param>
 *   <param name="aws_secret_access_key" value="{Your AWS Secret Access Key}">
 *     <comment>The Amazon S3 Secret Access Key</comment>
 *   </param>
 *   <param name="download_bucket_name" value="{Your download bucket name}">
 *     <comment>The name of the bucket in which to store and access files
 *              on Amazon S3. Note that this name must be unique across all of
 *              Amazon S3.</comment>
 *   </param>
 *   <param name="streaming_bucket_name" value="{Your streaming bucket name}">
 *     <comment>The name of the bucket in which to store and access files
 *              on Amazon S3. Note that this name must be unique across all of
 *              Amazon S3.</comment>
 *   </param>
 *   <param name="read_permissions" value="private">
 *     <comment>Read permissions for files stored in Amazon S3.
 *              Value should be either "public" or "private".</comment>
 *   </param>
 *   <param name="secure_connection" value="true">
 *     <comment>Determines if SSL should be used on the connection to Amazon S3.
 *              Value should be either "true" or "false".</comment>
 *   </param>
 *   <param name="streaming_pid_prefix" value="flx2-s">
 *     <comment>PID prefix for streaming objects - used to decide which bucket
 *              the object belongs to.</comment>
 *   </param>
 *   <param name="download_pid_prefix" value="flx2-d">
 *     <comment>PID prefix for downloadable objects - used to decide which bucket
 *              the object belongs to.</comment>
 *   </param>
 * </module>
 *
 * @author Bill Branan
 */
public class AmazonS3LowlevelStorage
        extends Module
        implements ILowlevelStorage, IListable {

    private static Logger LOG =
            Logger.getLogger(AmazonS3LowlevelStorage.class.getName());

    public static final String OBJECT_STORE = "objects/";

    public static final String DATASTREAM_STORE = "datastreams/";

    private static Map<String, List<String>> awsReadHeaders = null;

    private String bucketName = null;

    private static String downloadBucketName = null;

    private static String streamingBucketName = null;

    private static String downloadPIDPrefix = null;

    private static String streamingPIDPrefix = null;

    private static String awsAccessKeyId = null;

    private static String awsSecretAccessKey = null;

    private static boolean secureConnection = false;
    
    private static Map<String, String> fileTypes = new HashMap<String, String>();

    public AmazonS3LowlevelStorage(Map<String, String> moduleParameters,
                                   Server server,
                                   String role)
            throws ModuleInitializationException {
        super(moduleParameters, server, role);
    }

    @Override
    public void initModule() throws ModuleInitializationException {
        Crypto crypto = new Crypto();
        Map<String, String> moduleParameters = getParameters();
        String readPermissions = moduleParameters.get("read_permissions");
        // awsAccessKeyId = moduleParameters.get("aws_access_key_id");
        // awsSecretAccessKey = moduleParameters.get("aws_secret_access_key");
        awsAccessKeyId = crypto.decrypt(moduleParameters.get("aws_access_key_id"));
        crypto = new Crypto();
        awsSecretAccessKey = crypto.decrypt(moduleParameters.get("aws_secret_access_key"));
        downloadBucketName = moduleParameters.get("download_bucket_name");
        streamingBucketName = moduleParameters.get("streaming_bucket_name");

        downloadPIDPrefix = moduleParameters.get("download_pid_prefix");
        streamingPIDPrefix = moduleParameters.get("streaming_pid_prefix");
        // 5 years default
        int expiresIn = 5*12*30*24*60*60;
        try {
            expiresIn = Integer.parseInt(moduleParameters.get("expires_in_seconds"));
        } catch (NumberFormatException nfe) {
            // ignore 
        }

        String secure = moduleParameters.get("secure_connection");
        if(secure.equalsIgnoreCase("true") || secure.equalsIgnoreCase("on")) {
            secureConnection = true;
        }

        AWSAuthConnection awsConnection = getConnection();

        DateFormat httpDateFormat = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.US);
        httpDateFormat.setTimeZone(TimeZone.getTimeZone("GMT"));
        Calendar cal = new GregorianCalendar();
        cal.add(Calendar.SECOND, expiresIn);

        awsReadHeaders = new TreeMap<String, List<String>>();
        awsReadHeaders.put("Cache-Control", Arrays.asList(new String[] {"PUBLIC, max-age=" + expiresIn + ", must-revalidate"}));
        awsReadHeaders.put("Expires", Arrays.asList(new String[] {httpDateFormat.format(cal.getTime())}));
        if (readPermissions.equals("public")) {
            awsReadHeaders.put("x-amz-acl",
                               Arrays.asList(new String[] {"public-read"}));
        }

        fileTypes.put("+PDF+", ".pdf");
        fileTypes.put("+MOBI+", ".mobi");
        fileTypes.put("+EPUB+", ".epub");
        fileTypes.put("+STUDYGUIDE+", "_studyguide.pdf");
        fileTypes.put("+LESSONPLAN+", "_lessonplan.doc");

        String[] buckets = { downloadBucketName, streamingBucketName };
        for (String bucketName : buckets) {
            boolean bucketExists = false;
            try {
                bucketExists = awsConnection.checkBucketExists(bucketName);
            } catch (Exception e) {
                throw new ModuleInitializationException("Could not initialize "
                        + "Amazon S3 Storage Module due to exception: "
                        + e.getMessage(), getRole(), e);
            }
            if (!bucketExists) {
                LOG.info("Attempting to create AWS Bucket named " + bucketName);
                try {
                    Response createBucketResponse =
                        awsConnection.createBucket(bucketName,
                                                   AWSAuthConnection.LOCATION_DEFAULT,
                                                   awsReadHeaders);
                    String responseMessage =
                        createBucketResponse.connection.getResponseMessage();
                    LOG.info("Result of create bucket attempt: " + responseMessage);
                } catch (Exception e) {
                    throw new ModuleInitializationException("Could not create Amazon S3 " +
                                                            "bucket due to exception: " +
                                                            e.getMessage(), getRole(), e);
                }
            }
        }
    }

    private AWSAuthConnection getConnection() {
        return new AWSAuthConnection(awsAccessKeyId,
                                     awsSecretAccessKey,
                                     secureConnection);
    }

    public long addDatastream(String pid, InputStream content)
            throws LowlevelStorageException {
        return addUpdateContent(DATASTREAM_STORE + pid, content);
    }

    public void addObject(String pid, InputStream content)
            throws LowlevelStorageException {
        addUpdateContent(OBJECT_STORE + pid, content);
    }

    public void auditDatastream() throws LowlevelStorageException {
        LOG.error("The method auditDatastream has not been " +
                  "implemented in the Amazon S3 LLStore");

    }

    public void auditObject() throws LowlevelStorageException {
        /*
        LOG.error("The method auditObject has not been " +
                  "implemented in the Amazon S3 LLStore");
        */
    }

    public void rebuildDatastream() throws LowlevelStorageException {
        /*
        LOG.error("The method rebuildDatastream has not been " +
                  "implemented in the Amazon S3 LLStore");
        */
    }

    public void rebuildObject() throws LowlevelStorageException {
        /*
        LOG.error("The method rebuildObject has not been " +
                  "implemented in the Amazon S3 LLStore");
        */
    }

    public void removeDatastream(String pid) throws LowlevelStorageException {
        deleteContent(DATASTREAM_STORE + pid);
    }

    public void removeObject(String pid) throws LowlevelStorageException {
        deleteContent(OBJECT_STORE + pid);
    }

    public long replaceDatastream(String pid, InputStream content)
            throws LowlevelStorageException {
        return addUpdateContent(DATASTREAM_STORE + pid, content);
    }

    public void replaceObject(String pid, InputStream content)
            throws LowlevelStorageException {
        addUpdateContent(OBJECT_STORE + pid, content);
    }

    public InputStream retrieveDatastream(String pid)
            throws LowlevelStorageException {
        return getContent(DATASTREAM_STORE + pid);
    }

    public InputStream retrieveObject(String pid)
            throws LowlevelStorageException {
        return getContent(OBJECT_STORE + pid);
    }

    private String getBucketNameFromPID(String pid) {
        if (pid.contains(streamingPIDPrefix)) {
            return streamingBucketName;
        } 
        return downloadBucketName;
    }

    private long addUpdateContent(String pid, InputStream content)
            throws LowlevelStorageException {
        try {
            String pidUC = pid.toUpperCase();
            for (String subst : fileTypes.keySet()) {
                if (pidUC.indexOf(subst) != -1) {
                    awsReadHeaders.put("Content-Disposition", Arrays.asList(new String[] {"attachment; filename=\"content" + fileTypes.get(subst) + "\""}));
                    break;
                } else if (awsReadHeaders.containsKey("Content-Disposition")) {
                    awsReadHeaders.remove("Content-Disposition");
                }
            }
            String bucketName = getBucketNameFromPID(pid);
            AWSAuthConnection awsConnection = getConnection();
            return awsConnection.putContent(bucketName, pid, content, awsReadHeaders);
        } catch (Exception e) {
            throw new LowlevelStorageException(false,
                                               "Unable to store content in " +
                                               "Amazon S3 due to exception: " +
                                               e.getMessage(), e);
        }
    }

    private InputStream getContent(String pid) throws LowlevelStorageException {
        String bucketName = getBucketNameFromPID(pid);
        try {
            AWSAuthConnection awsConnection = getConnection();
            return awsConnection.getContent(bucketName, pid, awsReadHeaders);
        } catch (Exception e) {
            if (e instanceof IOException && e.getMessage().contains("404")) {
                // The object does not exist. The mechanism to communicate this is
                // to throw the ObjectNotInLowlevelStorageException.
                throw new ObjectNotInLowlevelStorageException(
                    "Object with pid '" + pid +
                    "' does not exist in Amazon S3 bucket " + bucketName);
            }
            throw new LowlevelStorageException(false,
                                               "Unable to retrieve content from " +
                                               "Amazon S3 due to exception: " +
                                               e.getMessage(), e);
        }
    }

    private void deleteContent(String pid) throws LowlevelStorageException {
        String bucketName = getBucketNameFromPID(pid);
        try {
            AWSAuthConnection awsConnection = getConnection();
            awsConnection.deleteContent(bucketName, pid, null);
        } catch (Exception e) {
            if (e instanceof IOException && e.getMessage().contains("404")) {
                // The object does not exist. The mechanism to communicate this is
                // to throw the ObjectNotInLowlevelStorageException.
                throw new ObjectNotInLowlevelStorageException(
                    "Object with pid '" + pid +
                    "' does not exist in Amazon S3 bucket " + bucketName);
            }
            throw new LowlevelStorageException(false,
                                               "Unable to delete content from " +
                                               "Amazon S3 due to exception: " +
                                               e.getMessage(), e);
        }
    }


    // IListable implementations

    /**
     * Lists all stored objects in no particular order.
     *
     * @return an iterator of all stored object pids.
     */
    public Iterator<String> listObjects() {
        List<String> pids = new LinkedList<String>();
        String[] buckets = new String[] { downloadBucketName, streamingBucketName };
        Set<String> uniques = new HashSet<String>();
        try {
            AWSAuthConnection awsConnection = getConnection();
            for (String bucket : buckets) {
                // Send object store as the prefix
                ListBucketResponse resp = null;
                String marker = null;
                do {
                    // Get 1000 keys at a time and use a marker to get the next batch
                    resp = awsConnection.listBucket(bucket, OBJECT_STORE, marker, 1000, null);
                    if (resp.entries != null) {
                        for (ListEntry e : resp.entries) {
                            if (e.key.startsWith(OBJECT_STORE)) {
                                String pid = e.key.replace(OBJECT_STORE, "");
                                if (!uniques.contains(pid)) {
                                    pids.add(pid);
                                    uniques.add(pid);
                                }
                                // System.out.println("Object PID: " + pid);
                            }
                        }
                    }
                    marker = resp.nextMarker;
                    if (marker == null) {
                        marker = OBJECT_STORE + pids.get(pids.size() - 1);
                    }
                    // System.out.println("next marker: " + marker);
                } while(resp.isTruncated);
            }
            System.out.println("Total: " + pids.size());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return pids.listIterator();
    }

    /**
     * Lists all stored datastreams in no particular order.
     *
     * @return an iterator of all stored datastream keys, each in the
     *         following format: $pid "+" $dsId "+" $dsVersionId
     */
    public Iterator<String> listDatastreams() {
        List<String> pids = new LinkedList<String>();
        String[] buckets = new String[] { downloadBucketName, streamingBucketName };
        try {
            AWSAuthConnection awsConnection = getConnection();
            for (String bucket : buckets) {
                ListBucketResponse resp = awsConnection.listBucket(bucket, null, null, null, null);
                if (resp.entries != null) {
                    for (ListEntry e : resp.entries) {
                        if (e.key.startsWith(DATASTREAM_STORE)) {
                            pids.add(e.key.replace(DATASTREAM_STORE, ""));
                        }
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return pids.listIterator();
    }
}
