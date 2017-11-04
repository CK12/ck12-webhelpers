BEGIN;
update MathImage set resourceUrl = replace(resourceUrl, 'http://math-dev.ck12.org:8080/fedora', 'https://math-dev.ck12.org/fedora') where resourceUrl like 'http://math-dev.ck12.org:8080%';
COMMIT;
