INSERT INTO words(source_id, text, num)
VALUES (@sourceId, @text, 1)
ON CONFLICT(source_id,text) DO UPDATE SET num=num + 1
