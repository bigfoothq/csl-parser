# neon: no escape obvious notation




__.ob__ system = {
__.ob.ar__ components = [
__.ob.ar.ob__ {
__.ob.ar.ob.va__ name =:   frontend   
__.ob.ar.ob.ob__ config = {
__.ob.ar.ob.ob.ar__ routes = [
__.ob.ar.ob.ob.ar__     R"""pv(/api/v1/*)pv"""
__.ob.ar.ob.ob.ar__     R"""pv(/static/**  )pv"""
__.ob.ar.ob.ob.ar__ ]
__.ob.ar.ob.ob.mu__ headers = (
__.ob.ar.ob.ob.mu__     R"""pv(Content-Type: application/json)pv"""
__.ob.ar.ob.ob.mu__     R"""pv(   X-Custom-Header: "value"   )pv"""
__.ob.ar.ob.ob.mu__ )
__.ob.ar.ob.ob__ }
__.ob.ar.ob__ }
__.ob.ar__ ]
__.ob__ }