# 0001-supabase-schema

CarryGo adopts a unified relation schema in Supabase where:
1. **Trade** acts as the single transaction entity merging both `Proposal` and `Application` requests.
2. **Suitcase** is modeled solely as a visual view of a `Post` of type `provide` and its associated active `Trades`, rather than a separate table.
3. **Conversations** are uniquely scoped to a specific `Post` and two `Users` to keep discussions context-specific.
4. **Trust evaluations** are modeled as individual `Votes` for tags to avoid traditional numeric rating inflation and satisfy the "visible only if voted by >= 3 unique users" rule.
5. **Post Visibility** uses an `is_active` toggle to allow carriers to manually stop accepting new trades, hiding the Provide Post from the home page. Seek Posts are hidden automatically once a Trade is confirmed.
