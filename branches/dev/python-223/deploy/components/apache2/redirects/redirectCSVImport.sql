DROP TABLE IF EXISTS redirects;
CREATE TABLE redirects(
    source TEXT NOT NULL,
    destination TEXT NOT NULL
);
.mode "csv"
.import "./redirects.csv" redirects
