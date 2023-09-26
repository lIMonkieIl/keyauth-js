# KeyAuthJS/Core

### Response storing

The response from the api is on you to store how you see fit so this also means on most if not all functions sessionID is required the reason i did this is because this code could be run on the server side or client side

### Errors

When there are errors the proccess will not `proccess.exit()`, its on you to check for the errors and deal with them accordingly, please take a lot at [dealing with errors](#errors).

## Table of Contents

-   [Installation](#installation)
-   [Usage](#usage)
    -   [Client Initialization](#client-initialization)
    -   [Init](#init)
-   [License](#license)
-   [Support](#support)
-   [Acknowledgments](#acknowledgments)
-   [Disclaimer](#disclaimer)

## Installation

You can install this package via npm:

```bash
npm install @keyauthjs/core
```

# Usage

## Client Initialization

Before you can use the KeyAuth API, you need to initialize the package with your API credentials.

```typescript
// Usage Example 1

import { ClientApi } from "@keyauthjs/core";

const clientApi = new ClientApi({
    app: {
        // Your application details
        name: "exampleName", // Application Name
        ownerid: "exampleOwnerID", // Application OwnerID
        ver: "1.0", // Application Version
    },
    options: {
        // These are extra optional options
        logger: {
            // Logger options
            active: false, // [Default: false] If the logger is active or not
            level: "error", // [Default: error] The logger level. most of the time this should be set to error
        },
        baseUrl: "", // [Default: "https://keyauth.win/api/1.2/"] Set the base url used
        convertTimes: false, // [Default: false] This will convert all times on a user subscriptions to local time string,
    },
});
```

```typescript
// Usage Example 2

import { ClientApi, ClientApiOptions } from "@keyauthjs/core";
const clientOptions: ClientApiOptions = {
    app: {
        // Your application details
        name: "npm", // Application Name
        ownerid: "EdmsTKiuld", // Application OwnerID
        ver: "1.0", // Application Version
    },
    options: {
        // These are extra optional options
        logger: {
            // Logger options
            active: false, // [Default: false] If the logger is active or not
            level: "error", // [Default: error] The logger level. most of the time this should be set to error
        },
        baseUrl: "", // [Default: "https://keyauth.win/api/1.2/"] Set the base url used
        convertTimes: false, // [Default: false] This will convert all times on a user subscriptions to local time string,
    },
};
const clientApi = new ClientApi(clientOptions);
```

## Init

Before you can call the KeyAuth API, you need to initialize the session.

```typescript
// Usage Example 1

import { ClientApi } from "@keyauthjs/core";

let sessionsID: string;
const clientApi = new ClientApi({
    app: {
        name: "npm", // Application Name
        ownerid: "EdmsTKiuld", // Application OwnerID
        ver: "1.0", // Application Version
    },
});
const init = await clientApi.init();
if (init.success) {
    sessionsID = init.sessionid!;
    console.log("Init successfull: ", init);
}
// Then we can make more calls after with the sessionID stored
```

```typescript
// Usage Example 2

let sessionsID: string;
const clientApi = new ClientApi({
    app: {
        name: "npm", // Application Name
        ownerid: "EdmsTKiuld", // Application OwnerID
        ver: "1.0", // Application Version
    },
});

clientApi.on(
    "init",
    ({ message, success, time, newSession, nonce, sessionid }) => {
        console.log("Init successfull");
        sessionsID = sessionid!;
    },
);

await clientApi.init();
// Then we can make more calls after with the sessionID stored
```

# License

Elastic License 2.0 [HERE](https://github.com/lIMonkieIl/keyauth-npm/blob/dev/LICENSE)

# Support

If you need assistance or have any questions, feel free to contact on discord or telegram.

• Discord: monkie.dev

• Telegram: [HERE](https://t.me/lIMonkieIl)

# Acknowledgments

Special thanks to the KeyAuth team for providing an excellent API for developers.

# Disclaimer

This package is not officially affiliated with KeyAuth. It is a community-contributed wrapper for their API.
