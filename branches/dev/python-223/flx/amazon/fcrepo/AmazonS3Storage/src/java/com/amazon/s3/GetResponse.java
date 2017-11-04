//  This software code is made available "AS IS" without warranties of any
//  kind.  You may copy, display, modify and redistribute the software
//  code either by itself or as incorporated into your code; provided that
//  you do not remove any proprietary notices.  Your use of this software
//  code is at your own risk and you waive any claim against Amazon
//  Digital Services, Inc. or its affiliates with respect to your use of
//  this software code. (c) 2006 Amazon Digital Services, Inc. or its
//  affiliates.

package com.amazon.s3;

import java.io.IOException;
import java.io.InputStream;

import java.net.HttpURLConnection;

import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * A Response object returned from AWSAuthConnection.get(). Exposes the
 * attribute object, which represents the retrieved object.
 *
 * This code was originally provided by Amazon Web Services and
 * has been updated for use by Fedora Commons.
 *
 * @author Eric Wagner - EricW@AWS
 * @author Bill Branan
 */
public class GetResponse
        extends Response {

    public InputStream content;

    public Map<String, List<String>> metadata;

    /**
     * Pulls content stream and metadata out of the HttpURLConnection response.
     */
    public GetResponse(HttpURLConnection connection)
            throws IOException {
        super(connection);
        if (connection.getResponseCode() < 400) {
            metadata = extractMetadata(connection);
            content = connection.getInputStream();
        }
    }

    /**
     * Examines the response's header fields and returns a Map from String to
     * List of Strings representing the object's metadata.
     */
    private Map<String, List<String>> extractMetadata(HttpURLConnection connection) {
        TreeMap<String, List<String>> metadata =
                new TreeMap<String, List<String>>();
        Map<String, List<String>> headers = connection.getHeaderFields();
        for (Iterator<String> i = headers.keySet().iterator(); i.hasNext();) {
            String key = i.next();
            if (key == null) {
                continue;
            }
            if (key.startsWith(Utils.METADATA_PREFIX)) {
                metadata.put(key.substring(Utils.METADATA_PREFIX.length()),
                             headers.get(key));
            }
        }

        return metadata;
    }
}
