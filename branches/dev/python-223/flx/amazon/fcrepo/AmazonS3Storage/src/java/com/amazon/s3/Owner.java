//  This software code is made available "AS IS" without warranties of any
//  kind.  You may copy, display, modify and redistribute the software
//  code either by itself or as incorporated into your code; provided that
//  you do not remove any proprietary notices.  Your use of this software
//  code is at your own risk and you waive any claim against Amazon
//  Digital Services, Inc. or its affiliates with respect to your use of
//  this software code. (c) 2006 Amazon Digital Services, Inc. or its
//  affiliates.

package com.amazon.s3;

/**
 * A structure representing the owner of an object, used as a part of ListEntry.
 *
 * This code was originally provided by Amazon Web Services and
 * has been updated for use by Fedora Commons.
 *
 * @author Eric Wagner - EricW@AWS
 * @author Bill Branan
 */
public class Owner {

    public String id;

    public String displayName;
}
