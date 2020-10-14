CREATE TABLE IF NOT EXISTS sources
(
    id                   text NOT NULL,
    name                 text,
    override_name        text,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS logs
(
    source_id text    NOT NULL,
    timestamp integer NOT NULL,
    text      text    NOT NULL,
    FOREIGN KEY (source_id) REFERENCES sources (id)
        ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS idx_timestamp
    ON logs (timestamp);

CREATE TABLE IF NOT EXISTS words
(
    source_id text    NOT NULL,
    text      text    NOT NULL,
    num       integer NOT NULL,
    UNIQUE (source_id, text),
    FOREIGN KEY (source_id) REFERENCES sources (id)
        ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS idx_words_source
    ON words (source_id);

CREATE INDEX IF NOT EXISTS idx_words_text
    ON words (text);

CREATE INDEX IF NOT EXISTS idx_words_num
    ON words (num);
