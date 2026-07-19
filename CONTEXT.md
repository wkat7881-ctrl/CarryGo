# CarryGo

CarryGo connects international travelers with people who need items shipped between cities.

## Language

**Post**:
A public listing created by a User indicating travel plans with available luggage capacity (Provide) or an item that needs to be carried (Seek).
_Avoid_: Ad, Listing, Article

**Suitcase**:
A visual viewport showing a User's active Provide Post, its remaining capacity, and its bound Trades. It does not exist as an independent database entity.
_Avoid_: Luggage, Bag, Suitcase Table

**Trade**:
An agreement between a Carrier and a Shipper where the Carrier agrees to transport an Item for the Shipper. It is marked completed only when both the Carrier (completed delivery) and Shipper (completed receipt) have confirmed.
_Avoid_: Order, Transaction, Deal, Contract

**Conversation**:
A private chat session between two Users that is scoped to a specific Post.
_Avoid_: Chat, Chatroom, Room

**Message**:
An individual text or system entry within a Conversation.
_Avoid_: ChatMessage, Msg, Text

**TrustTag**:
A social label indicating a positive trait of a User (e.g. "On Time", "Easy Communication") earned via counterparties' feedback.
_Avoid_: Rating, Star, Review, Badge

**Vote**:
The action of a User assigning a TrustTag to another User after a completed Trade. A User can Vote immediately after confirming their own completion of the Trade.
_Avoid_: Review Submission, Rating Vote

**User**:
Any registered person on the platform. A User can act as a Carrier or a Shipper in different Trades.
_Avoid_: Account, Profile, Member

**Carrier**:
The role of a User who transports items using their luggage capacity.
_Avoid_: Traveler, Transporter, Helper

**Shipper**:
The role of a User who requests items to be transported.
_Avoid_: Owner, Sender, Requester, Customer

**Item**:
The specific physical object that is requested to be transported in a Trade.
_Avoid_: Package, Luggage, Good, Cargo
