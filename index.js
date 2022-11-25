const axios = require("axios").default;
const axiosRetry = require('axios-retry');
const express = require("express");
const app = express();

//Function to retry in axios if status is error 
axiosRetry(axios, {
    retries: 10, // number of retries
    shouldResetTimeout: true,
    retryCondition: (_error) => true // retry no matter what
});


//Function to get data from different endpoints
const getData = async () => {
    let dataResponse = [];
    await axios.get("https://3gxdus4fe2.execute-api.eu-west-3.amazonaws.com/v1")
        .then((res) => dataResponse.push(...res.data));
    await axios.get("https://3gxdus4fe2.execute-api.eu-west-3.amazonaws.com/v2")
        .then((res) => dataResponse.push(...res.data));
    await axios.get("https://3gxdus4fe2.execute-api.eu-west-3.amazonaws.com/v3")
        .then((res) => dataResponse.push(...res.data));
    const normalizedData = dataResponse.map((item) => {
        if ("tag" in item) {
            const dataObj = restructureData(item);
            delete Object.assign(dataObj, { family: dataObj.tag })['tag'];
            return dataObj;
        }
        else if ("category" in item) {
            const dataObj = restructureData(item);
            delete Object.assign(dataObj, { family: dataObj.category })['category'];
            return dataObj;
        }
        else {
            return item;
        }
    });
    return normalizedData;
};

//Function to normalize and change data to last version
const restructureData = (item) => {
    if (typeof item.weight === "string") {
        item.weight = Number(item.weight);
    }
    delete Object.assign(item, { mass: item.weight })['weight'];
    delete Object.assign(item, { mass_unit: item.weight_unit })['weight_unit'];
    item.user = "anonymous";
    return item;
}

//New endpoint to get all the calls in the correct format
app.get("/v4", async (req, res) => {
    try {
        const data = await getData();
        res.status(200).send(data);
    } catch (error) {
        res.status(400).send("Something went wrong: " + error);
    }
});


app.listen(3000, () => {
    console.log("App listen on port: " + 3000);
});



