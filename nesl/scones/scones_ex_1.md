# SCONES Examples - with Equivalent JSON

## Example 1: Simple key-value pairs

**SCONES:**
```
__o__ config = {
__o.v__ hostname = R"""pv(localhost)pv"""
__o.v__ port = R"""pv(8080)pv"""
__o.v__ debug = R"""pv(true)pv"""
__o__ }
```

**JSON:**
```json
{
  "config": {
    "hostname": "localhost",
    "port": "8080",
    "debug": "true"
  }
}
```

## Example 2: Array with various whitespace

**SCONES:**
```
__o__ data = {
__o.a__ items = [
__o.a.i__ R"""pv(first)pv"""
__o.a.i__ R"""pv()pv"""
__o.a.i__ R"""pv(   spaced   )pv"""
__o.a.i__ R"""pv( leading space)pv"""
__o.a.i__ R"""pv(trailing space )pv"""
__o.a__ ]
__o__ }
```

**JSON:**
```json
{
  "data": {
    "items": ["first", "", "   spaced   ", " leading space", "trailing space "]
  }
}
```

## Example 3: Multiline string with various formatting

**SCONES:**
```
__o__ document = {
__o.m__ content = (
__o.m.i__ R"""pv(First line of text)pv"""
__o.m.i__ R"""pv(   Indented second line)pv"""
__o.m.i__ R"""pv()pv"""
__o.m.i__ R"""pv(Fourth line after blank)pv"""
__o.m.i__ R"""pv(     Extra indented    )pv"""
__o.m__ )
__o__ }
```

**JSON:**
```json
{
  "document": {
    "content": "First line of text\n   Indented second line\n\nFourth line after blank\n     Extra indented    "
  }
}
```

## Example 4: Nested objects with arrays

**SCONES:**
```
__o__ system = {
__o.a__ servers = [
__o.a.o__ {
__o.a.o.v__ name = R"""pv(web-01)pv"""
__o.a.o.v__ ip = R"""pv(192.168.1.10)pv"""
__o.a.o.a__ roles = [
__o.a.o.a.i__ R"""pv(frontend)pv"""
__o.a.o.a.i__ R"""pv(cache)pv"""
__o.a.o.a__ ]
__o.a.o__ }
__o.a.o__ {
__o.a.o.v__ name = R"""pv(db-01)pv"""
__o.a.o.v__ ip = R"""pv(192.168.1.20)pv"""
__o.a.o.a__ roles = [
__o.a.o.a.i__ R"""pv(database)pv"""
__o.a.o.a.i__ R"""pv(backup)pv"""
__o.a.o.a__ ]
__o.a.o__ }
__o.a__ ]
__o__ }
```

**JSON:**
```json
{
  "system": {
    "servers": [
      {
        "name": "web-01",
        "ip": "192.168.1.10",
        "roles": ["frontend", "cache"]
      },
      {
        "name": "db-01",
        "ip": "192.168.1.20",
        "roles": ["database", "backup"]
      }
    ]
  }
}
```

## Example 5: Special characters and quotes

**SCONES:**
```
__o__ test = {
__o.v__ quotes = R"""pv("Hello" and 'World')pv"""
__o.v__ path = R"""pv(C:\Users\John\Documents\file.txt)pv"""
__o.v__ regex = R"""pv(^[a-zA-Z0-9_]*$)pv"""
__o.v__ json = R"""pv({"key": "value", "num": 123})pv"""
__o.v__ unicode = R"""pv(Hello 世界 🌍)pv"""
__o.v__ tabs = R"""pv(	tab	separated	values	)pv"""
__o__ }
```

**JSON:**
```json
{
  "test": {
    "quotes": "\"Hello\" and 'World'",
    "path": "C:\\Users\\John\\Documents\\file.txt",
    "regex": "^[a-zA-Z0-9_]*$",
    "json": "{\"key\": \"value\", \"num\": 123}",
    "unicode": "Hello 世界 🌍",
    "tabs": "\ttab\tseparated\tvalues\t"
  }
}
```

## Example 6: Deep nesting with mixed types

**SCONES:**
```
__o__ api = {
__o.o__ v1 = {
__o.o.a__ endpoints = [
__o.o.a.o__ {
__o.o.a.o.v__ path = R"""pv(/users/{id})pv"""
__o.o.a.o.v__ method = R"""pv(GET)pv"""
__o.o.a.o.o__ params = {
__o.o.a.o.o.v__ id = R"""pv(integer)pv"""
__o.o.a.o.o.v__ required = R"""pv(true)pv"""
__o.o.a.o.o__ }
__o.o.a.o.m__ description = (
__o.o.a.o.m.i__ R"""pv(Retrieve a user by ID.)pv"""
__o.o.a.o.m.i__ R"""pv()pv"""
__o.o.a.o.m.i__ R"""pv(Returns 404 if not found.)pv"""
__o.o.a.o.m__ )
__o.o.a.o__ }
__o.o.a__ ]
__o.o__ }
__o__ }
```

**JSON:**
```json
{
  "api": {
    "v1": {
      "endpoints": [
        {
          "path": "/users/{id}",
          "method": "GET",
          "params": {
            "id": "integer",
            "required": "true"
          },
          "description": "Retrieve a user by ID.\n\nReturns 404 if not found."
        }
      ]
    }
  }
}
```

## Example 7: Empty values and structures

**SCONES:**
```
__o__ empty_test = {
__o.v__ empty_string = R"""pv()pv"""
__o.v__ spaces_only = R"""pv(   )pv"""
__o.a__ empty_array = [
__o.a__ ]
__o.o__ empty_object = {
__o.o__ }
__o.m__ empty_multiline = (
__o.m.i__ R"""pv()pv"""
__o.m.i__ R"""pv()pv"""
__o.m__ )
__o__ }
```

**JSON:**
```json
{
  "empty_test": {
    "empty_string": "",
    "spaces_only": "   ",
    "empty_array": [],
    "empty_object": {},
    "empty_multiline": "\n"
  }
}
```

## Example 8: Complex multiline with special formatting

**SCONES:**
```
__o__ story = {
__o.m__ text = (
__o.m.i__ R"""pv(   "hi" (i said to "her)pv. "we can't go there", she replied )pv"""
__o.m.i__ R"""pv("oh its you". )pv"""
__o.m.i__ R"""pv(welll...)pv"""
__o.m.i__ R"""pv(      summer was over.)pv"""
__o.m.i__ R"""pv("hey well lets go swimming".  """WHAT???!!!""")pv"""
__o.m__ )
__o__ }
```

**JSON:**
```json
{
  "story": {
    "text": "   \"hi\" (i said to \"her)pv. \"we can't go there\", she replied \n\"oh its you\". \nwelll...\n      summer was over.\n\"hey well lets go swimming\".  \"\"\"WHAT???!!!\"\"\""
  }
}
```

## Example 9: Configuration with comments

**SCONES:**
```
// Database configuration
__o__ database = {
// Connection settings
__o.v__ host = R"""pv(db.example.com)pv"""
__o.v__ port = R"""pv(5432)pv"""
__o.v__ name = R"""pv(myapp_production)pv"""

// Connection pool settings
__o.o__ pool = {
__o.o.v__ min = R"""pv(5)pv"""
__o.o.v__ max = R"""pv(20)pv"""
__o.o.v__ idle_timeout = R"""pv(30000)pv"""
__o.o__ }

// Backup schedule (cron format)
__o.a__ backup_times = [
__o.a.i__ R"""pv(0 2 * * *)pv"""
__o.a.i__ R"""pv(0 14 * * *)pv"""
__o.a__ ]
__o__ }
```

**JSON:**
```json
{
  "database": {
    "host": "db.example.com",
    "port": "5432",
    "name": "myapp_production",
    "pool": {
      "min": "5",
      "max": "20",
      "idle_timeout": "30000"
    },
    "backup_times": ["0 2 * * *", "0 14 * * *"]
  }
}
```

## Example 10: Maximum nesting depth example

**SCONES:**
```
__o__ a = {
__o.o__ b = {
__o.o.o__ c = {
__o.o.o.a__ d = [
__o.o.o.a.o__ {
__o.o.o.a.o.o__ e = {
__o.o.o.a.o.o.a__ f = [
__o.o.o.a.o.o.a.m__ (
__o.o.o.a.o.o.a.m.i__ R"""pv(Deep nesting!)pv"""
__o.o.o.a.o.o.a.m.i__ R"""pv(   Still readable with path prefixes)pv"""
__o.o.o.a.o.o.a.m__ )
__o.o.o.a.o.o.a__ ]
__o.o.o.a.o.o__ }
__o.o.o.a.o__ }
__o.o.o.a__ ]
__o.o.o__ }
__o.o__ }
__o__ }
```

**JSON:**
```json
{
  "a": {
    "b": {
      "c": {
        "d": [
          {
            "e": {
              "f": ["Deep nesting!\n   Still readable with path prefixes"]
            }
          }
        ]
      }
    }
  }
}
```