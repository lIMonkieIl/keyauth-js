import { SellerApi, EXPIRY, CHARACTER, EVENT_TYPE } from "@keyauthjs/seller";
async function main() {
    const sellerAPi = new SellerApi(
        {
           ,
        },
        { logger: { active: true, level: "debug" } },
    );

    sellerAPi.on(EVENT_TYPE.GET_USER_VAR, (data) => {
        console.log(data);
    });
    sellerAPi.on(EVENT_TYPE.ERROR, (data) => {
        console.log("ERROR: ", data);
    });
    await sellerAPi.user.var.get({ username: "chels", varName: "metaData" });
}

main();
