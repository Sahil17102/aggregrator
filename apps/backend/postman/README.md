# iThink Logistics Postman checks

Import `iThink-Logistics-v3.postman_collection.json` into Postman, then set:

- `baseUrl` to the ShipAggregator backend URL.
- `adminToken` to a valid admin bearer token.
- `ithinkApiBase` to staging or production.
- `ithinkAccessToken` and `ithinkSecretKey` to credentials issued by iThink Logistics.

Run **Save credentials** first, followed by **Test credentials**. Replace the collection's AWB/order variables and example payload values before running state-changing order, warehouse, cancellation, payment, or NDR calls. The collection tests HTTP status, JSON format, and the backend success envelope for every request.
