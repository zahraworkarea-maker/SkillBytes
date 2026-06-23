const axios = require('axios');

async function test() {
  try {
    const res = await axios.get('http://localhost:8000/api/assessments/assesmen-oop', {
      headers: {
        // Need to provide auth token if we want to simulate logged in user
      }
    });
    console.log(JSON.stringify(res.data.data.questions[0].options, null, 2));
  } catch (e) {
    console.error(e.message);
  }
}
test();
