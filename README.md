# JWT Tutorial

### `npm run clean`

Deletes `.cert`. This will erase keys used for JWT encryption and signing.

### `npm run setup`

Create keystore with `enc` and `sig` keys, save it to `.cert` directory.

### `npm run start:server`

Starts a test api server at `http://localhost:9001`.

### `npm run start:proxy`

Starts a proxy server at `http://localhost:9002`. The proxy is for the server running at `http://localhost:9001`.

### `npm run start:client`

Runs a script which retrieves a token, and uses it to access a secured endpoint via the http jwt proxy.

#### Reading

- https://jwt.io/
- https://connect2id.com/products/nimbus-jose-jwt/examples/signed-and-encrypted-jwt
