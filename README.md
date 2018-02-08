# JWT Tutorial

_This is a proof of concept, unaudited, not be trusted... use at your own risk._

Users generate and sign a jwt with an ethereum private key, and use this first jwt to request a second jwt from the auth service. The second jwt is then used to access resources that are protected by an http proxy, such as IPFS.

- auth - http://localhost:9000
- proxy - http://localhost:9001
- server - http://localhost:9002

```
npm install -g ganache-cli
git clone https://github.com/OR13/express-eth-jwt.git
npm install
```

### `ganache-cli`

Starts a test ethereum interface that is used for development.

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

- client generates a new ethereum address and privateKey, creates claims and signs them creating jwt1.
- jwt1 is used to request jwt2 from `auth`. 
- jwt2 is used to restrict access to `proxy`.
- `proxy` restricts access to `server` to only token bearers.

#### Reading

* https://jwt.io/
* https://connect2id.com/products/nimbus-jose-jwt/examples/signed-and-encrypted-jwt
