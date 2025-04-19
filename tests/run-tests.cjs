
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:5000"; // your API base

const testCases = JSON.parse(fs.readFileSync("test-cases.json", "utf-8"));

async function runTest(test) {
  const url = `${BASE_URL}${test.endpoint}`;
  let response;
  try {
    if (test.file) {
      const form = new FormData();
      for (const key in test.payload) {
        form.append(key, test.payload[key]);
      }
      const filePath = path.join(__dirname, test.file);
      form.append("file", fs.createReadStream(filePath));

      response = await axios.post(url, form, {
        headers: form.getHeaders()
      });
    } else {
      response = await axios({
        method: test.method.toLowerCase(),
        url,
        data: test.payload
      });
    }

    if (response.status === test.expectedStatus) {
      console.log(`✅ ${test.description}`);
    } else {
      console.error(`❌ ${test.description}: Expected ${test.expectedStatus}, got ${response.status}`);
    }
  } catch (err) {
    if (err.response && err.response.status === test.expectedStatus) {
      console.log(`✅ ${test.description}`);
    } else {
      console.error(`❌ ${test.description}: ${err.message}`);
      if (err.response) {
        console.error(`   Expected ${test.expectedStatus}, got ${err.response.status}`);
      }
    }
  }
}

async function runAllTests() {
  for (const test of testCases) {
    await runTest(test);
  }
}

runAllTests();
