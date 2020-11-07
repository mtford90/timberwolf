SELECT *
FROM words
WHERE text LIKE @query
  AND source_id = @sourceId
ORDER BY num DESC, length(text)
LIMIT @limit OFFSET @offset;
