# neon: no escape obvious notation




~-.o__ system = {
~-.o.a__ components = [
~-.o.a.o__ {
~-.o.a.o.v__ name =:   frontend   
~-.o.a.o.o__ config = {
~-.o.a.o.o.a__ routes = [
~-.o.a.o.o.a__     R"""pv(/api/v1/*)pv"""
~-.o.a.o.o.a__     R"""pv(/static/**  )pv"""
~-.o.a.o.o.a__ ]
~-.o.a.o.o.m__ headers = (
~-.o.a.o.o.m__     R"""pv(Content-Type: application/json)pv"""
~-.o.a.o.o.m__     R"""pv(   X-Custom-Header: "value"   )pv"""
~-.o.a.o.o.m__ )
~-.o.a.o.o__ }
~-.o.a.o__ }
~-.o.a__ ]
~-.o__ }