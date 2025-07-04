

## Test 1: JSON → SCONES
Convert this JSON to SCONES:
```json
{
  "database": {
    "host": "localhost",
    "port": "5432",
    "credentials": {
      "username": "admin",
      "password": "p@ssw0rd!"
    }
  }
}
```

## Test 2: SCONES → JSON
Convert this SCONES to JSON:
```
__o__ app = {
__o.v__ name = R"""pv(My App)pv"""
__o.a__ features = [
__o.a.i__ R"""pv(authentication)pv"""
__o.a.i__ R"""pv(   real-time updates   )pv"""
__o.a.i__ R"""pv()pv"""
__o.a.i__ R"""pv(analytics)pv"""
__o.a__ ]
__o__ }
```

## Test 3: JSON → SCONES
Convert this JSON to SCONES:
```json
{
  "messages": [
    {
      "id": "msg-001",
      "text": "Hello \"world\"! How's it going?",
      "metadata": {
        "timestamp": "2024-01-15T10:30:00Z",
        "read": "false"
      }
    },
    {
      "id": "msg-002", 
      "text": "Path: C:\\Users\\Admin\\Documents",
      "metadata": {
        "timestamp": "2024-01-15T10:31:00Z",
        "read": "true"
      }
    }
  ]
}
```

## Test 4: SCONES → JSON
Convert this SCONES to JSON:
```
__o__ config = {
__o.m__ banner = (
__o.m.i__ R"""pv(==================================)pv"""
__o.m.i__ R"""pv(   Welcome to the System)pv"""
__o.m.i__ R"""pv()pv"""
__o.m.i__ R"""pv(   Version: 2.0.1)pv"""
__o.m.i__ R"""pv(==================================)pv"""
__o.m__ )
__o.v__ debug = R"""pv(true)pv"""
__o__ }
```

## Test 5: JSON → SCONES
Convert this JSON to SCONES:
```json
{
  "test_cases": {
    "empty_values": {
      "empty_string": "",
      "spaces_only": "   ",
      "empty_array": [],
      "empty_object": {}
    }
  }
}
```

## Test 6: SCONES → JSON
Convert this SCONES to JSON:
```
__o__ api = {
__o.o__ endpoints = {
__o.o.o__ users = {
__o.o.o.a__ operations = [
__o.o.o.a.o__ {
__o.o.o.a.o.v__ method = R"""pv(GET)pv"""
__o.o.o.a.o.v__ path = R"""pv(/api/v1/users/{id})pv"""
__o.o.o.a.o.m__ description = (
__o.o.o.a.o.m.i__ R"""pv(Retrieves a user by their ID.)pv"""
__o.o.o.a.o.m.i__ R"""pv()pv"""
__o.o.o.a.o.m.i__ R"""pv(Returns: {"name": "...", "email": "..."})pv"""
__o.o.o.a.o.m__ )
__o.o.o.a.o__ }
__o.o.o.a__ ]
__o.o.o__ }
__o.o__ }
__o__ }
```

## Test 7: JSON → SCONES
Convert this JSON to SCONES:
```json
{
  "special_chars": {
    "regex": "^[a-zA-Z0-9_]*$",
    "quotes_mix": "She said \"Don't forget\" and I said 'I won't'",
    "unicode": "Hello 世界 🌍 τ = 2π",
    "tabs": "\tcolumn1\tcolumn2\t",
    "newline_literal": "Line with \\n in the middle"
  }
}
```

## Test 8: SCONES → JSON
Convert this SCONES to JSON:
```
__o__ data = {
__o.a__ rows = [
__o.a.o__ {
__o.a.o.v__ id = R"""pv(1)pv"""
__o.a.o.a__ tags = [
__o.a.o.a.i__ R"""pv(important)pv"""
__o.a.o.a.i__ R"""pv(   urgent   )pv"""
__o.a.o.a__ ]
__o.a.o__ }
__o.a.o__ {
__o.a.o.v__ id = R"""pv(2)pv"""
__o.a.o.a__ tags = [
__o.a.o.a__ ]
__o.a.o__ }
__o.a__ ]
__o__ }
```

## Test 9: JSON → SCONES
Convert this JSON to SCONES:
```json
{
  "document": {
    "content": "First paragraph here.\n   Indented second paragraph.\n\nFourth paragraph after blank line.\n     With extra indentation.",
    "metadata": {
      "created": "2024-01-15",
      "author": "John Doe"
    }
  }
}
```

## Test 10: SCONES → JSON (Edge case with special text)
Convert this SCONES to JSON:
```
__o__ edge_cases = {
__o.v__ tricky1 = R"""pv(Text with )pv""" in middle)pv"""
__o.v__ tricky2 = R"""pv(Start R"""pv( and end with )pv""")pv"""
__o.m__ story = (
__o.m.i__ R"""pv(He said: "The path is C:\temp\file.txt")pv"""
__o.m.i__ R"""pv(She replied: 'No, use /usr/local/bin')pv"""
__o.m.i__ R"""pv(   "But what about spaces?" he asked.   )pv"""
__o.m__ )
__o__ }
```

## Bonus Test: Complex Nested Structure
Convert this JSON to SCONES:
```json
{
  "company": {
    "name": "TechCorp",
    "departments": [
      {
        "name": "Engineering",
        "teams": [
          {
            "name": "Backend",
            "members": ["Alice", "Bob"],
            "projects": {
              "active": ["API v2", "Database Migration"],
              "completed": []
            }
          }
        ]
      }
    ],
    "motto": "Innovation\n   Excellence\n      Growth"
  }
}
```
