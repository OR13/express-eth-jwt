# JWT Tutorial

auth - http://localhost:9000
proxy - http://localhost:9001
server - http://localhost:9002

### `npm run clean`

Deletes `.cert`. This will erase keys used for JWT encryption and signing.

### `npm run setup`

Create keystore with `enc` and `sig` keys, save it to `.cert` directory.

### `npm run start:auth`

Starts an auth server at `http://localhost:9000`.

### `npm run start:proxy`

Starts a proxy server at `http://localhost:9001`. The proxy is for the server running at `http://localhost:9002`.

### `npm run start:server`

Starts a test api server at `http://localhost:9002`.

### `npm run start:client`

Client generates a new ethereum address and privateKey, creates a jwt1.
jwt1 is used to request jwt2 from `auth`.
jwt2 is used it access `proxy`.
`proxy` restricts access to `server` to only token bearers.

#### Reading

* https://jwt.io/
* https://connect2id.com/products/nimbus-jose-jwt/examples/signed-and-encrypted-jwt
