// Most intuitive for LLMs - similar to shell heredocs
await fs.writeText('script.py', {
  content: <<<EOF
def hello():
    print("Hello World")
    return 'No escaping needed!'
    
# Even """ triple quotes """ work fine
data = {"key": "value"}
EOF
});

// Or with a simpler syntax:
await fs.write('data.sql', <<<SQL
SELECT * FROM users
WHERE name = 'John O''Brien'
AND status = "active"
AND data @> '{"type": "admin"}'::jsonb;
SQL);