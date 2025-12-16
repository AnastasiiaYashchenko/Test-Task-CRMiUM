ZOHO.embeddedApp.on("PageLoad", function (data) {
    const dealId = data.EntityId[0];
    console.log("Deal ID:", dealId);
});