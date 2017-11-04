#!/usr/bin/env chicken-scheme

;; [[file:~/prg/scm/api/TODO.org::*Flask-restless][Flask-restless:4]]

(use call-with-query
     debug
     define-record-and-printer
     fmt
     irregex
     matchable
     mysql-client
     posix)

(define (fetch-all fetch)
  (do ((results (list (fetch)) (cons (fetch) results)))
      ((not (car results)) (cdr results))))

(define-record-and-printer application
  name
  email
  paths)

(call-with-dynamic-fastcgi-query
(lambda (query)
(let ((key->mask (make-hash-table))
      (key (or (query-client-any query 'key)
               (query-server-any query 'http-x-ck12-meta-appid)))
      (partner (query-server-any query 'http-x-ck12-meta-partner-name))
      (log?
       (let ((unauthorized (get-environment-variable "CK12_API_UNAUTHORIZED")))
	 (and unauthorized (string=? unauthorized "log")))))
  (((make-mysql-connection
     (get-environment-variable "CK12_HOST")
     (get-environment-variable "CK12_USER")
     (get-environment-variable "CK12_PASSWORD")
     (get-environment-variable "CK12_API_DB"))
    (format "SELECT app.hash, path.mask FROM application app JOIN application_path app_path on app.id = app_path.application_id JOIN path path on path.id=app_path.path_id WHERE app.hash='~a' AND app.name='~a';" key partner))
   (match-lambda
       ((key mask)
        (hash-table-set! key->mask key mask))))
  (define (maybe-log-access key uri)
    (if log?
        (begin
	  (format (current-error-port)
                "Unauthorized API access (key: ~a, uri: ~a)"
                (if key key "N/A")
                uri)
	  (display-status-&c.))
        (display-status-&c. status-unauthorized)))
     (let ((key (or (query-client-any query 'key)
                    (query-server-any query 'http-x-ck12-meta-appid)))
           (partner (query-server-any query 'http-x-ck12-meta-partner-name))
           (uri (query-server-any query 'request-uri)))
       (if (and key partner)
           (let ((mask (hash-table-ref/default key->mask key #f)))
             (if mask
                 (if (irregex-match mask uri)
                     (display-status-&c. status-ok)
                     (display-status-&c. status-forbidden))
                 ;; Because of the semantics of FastCGIAccessCheckers,
                 ;; what should be a 401 will nevertheless return a
                 ;; 403.
                 (maybe-log-access key uri)))
           (maybe-log-access key uri))))))

;; Flask-restless:4 ends here
