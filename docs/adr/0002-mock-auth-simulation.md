# 0002-mock-auth-simulation

To strictly adhere to the original prototype flows and avoid introducing unapproved routes or screens, CarryGo bypasses standard Supabase Auth login UI:
1. A default user representing "张明" (zhangming) is seeded directly in the database.
2. The frontend application automatically injects and uses this seeded User's ID for all queries and transactions.
3. This architecture maintains scalability, allowing standard Supabase auth screens to be layered on top later without modifications to the underlying database schemas.
