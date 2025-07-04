# neon: no escape obvious notation



__o__ system = {
__o.a__ components = [
__o.a.o__ {
__o.a.o.v__ name =:   frontend   
__o.a.o.v__ asdf = [:one, :two, :8]
__o.a.o.v__ dfgd = R"""pv(/api/v1/*)pv"""
__o.a.o.o__ config = {
__o.a.o.o.a__ routes = [
__o.a.o.o.a.i__ R"""pv(/api/v1/*)pv"""
__o.a.o.o.a.i__ R"""pv(/static/**  )pv"""
__o.a.o.o.a__ ]
__o.a.o.o.m__ headers = (
__o.a.o.o.m.i__ R"""pv(Content-Type: application/json)pv"""
__o.a.o.o.m.i__ R"""pv(   X-Custom-Header: "value"   )pv"""
__o.a.o.o.m__ )
__o.a.o.o__ }
__o.a.o__ }
__o.a__ ]
__o__ }