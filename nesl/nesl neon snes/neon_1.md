# neon: no escape obvious notation

   └── _helpers/            # Optional. Test utilities.
├── test-intn/
│   └── {dependency-path}/   # Full path with slashes → hyphens
│       └── {scenario}.test.ts
├── comp/              # Optional. Nested components
│   └── {nested-component}/  # Same structure as parent component
└── src/
    └── {path}.ts            # Implementation files
```


o┌ system = {
o│     a┌ components = [
o│     a│     o┌ {
o│     a│     o│        name =:   frontend   
o│     a│     o│     o┌ config = {
o│     a│     o│     o│     routes = [
o│     a│     o│     o│         R"""pv(/api/v1/*)pv"""
o│     a│     o│     o│         R"""pv(/static/**  )pv"""
o│     a│     o│     o│         R"""pv(   /health)pv"""
o│     a│     o│     o│     ]
o│     a│     o│     o│     headers = (
o│     a│     o│     o│         R"""pv(Content-Type: application/json)pv"""
o│     a│     o│     o│         R"""pv(   X-Custom-Header: "value"   )pv"""
o│     a│     o│     o│         R"""pv()pv"""
o│     a│     o│     o│         R"""pv(Authorization: Bearer {token})pv"""
o│     a│     o│     o│     )
o│     a│     o│     o└ }
o│     a│     o└ }
o│     a│     o┌ {
o│     a│     o│        name =R"""pv(  backend service  )pv"""
o│     a│     o│        config = {
o│     a│     o│            endpoints = {
o│     a│     o│                api = {
o│     a│     o│                    versions = [:v1, :v2, :v3-beta]
o│     a│     o│                    deprecated = [
o│     a│     o│                        R"""pv(v0)pv"""
o│     a│     o│                    ]
o│     a│     o│                }
o│     a│     o│            }
o│     a│     o│        }
o│     a│     o└ }
o│     a└ ]
o└ }│ 



// Kitchen sink example with weird whitespace
system = {
    components = [
        {
            name =:   frontend   
            config = {
                routes = [
                    R"""pv(/api/v1/*)pv"""
                    R"""pv(/static/**  )pv"""
                    R"""pv(   /health)pv"""
                ]
                headers = (
                    R"""pv(Content-Type: application/json)pv"""
                    R"""pv(   X-Custom-Header: "value"   )pv"""
                    R"""pv()pv"""
                    R"""pv(Authorization: Bearer {token})pv"""
                )
            }
        }
        {
            name =R"""pv(  backend service  )pv"""
            config = {
                endpoints = {
                    api = {
                        versions = [:v1, :v2, :v3-beta]
                        deprecated = [
                            R"""pv(v0)pv"""
                        ]
                    }
                }
            }
        }
    ]
}