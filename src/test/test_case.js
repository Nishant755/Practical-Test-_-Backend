const http = require('http');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });
        req.on('error', reject);
        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log("--- Testing Habit Tracker API ---\n");

    const timestamp = Date.now();
    const testUser = {
        email: `test${timestamp}@example.com`,
        password: 'password123',
        name: 'Test User'
    };

    // 1. Signup
    console.log("1. Signup User");
    const signupRes = await request({
        hostname: 'localhost', port: 3000, path: '/auth/signup', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, testUser);
    console.log(`Status: ${signupRes.status}, Body:`, signupRes.body);

    let token = signupRes.body.token;

    // 2. Login (if signup failed or just to test login)
    if (!token) {
        console.log("\n2. Login User");
        const loginRes = await request({
            hostname: 'localhost', port: 3000, path: '/auth/login', method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, { email: testUser.email, password: testUser.password });
        console.log(`Status: ${loginRes.status}, Body:`, loginRes.body);
        token = loginRes.body.token;
    }

    if (!token) {
        console.error("Failed to get token. Aborting tests.");
        return;
    }

    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 3. Create Habit
    console.log("\n3. Create Habit 'Drink Water'");
    const createRes = await request({
        hostname: 'localhost', port: 3000, path: '/habits', method: 'POST',
        headers: authHeaders
    }, { name: 'Drink Water' });
    console.log(`Status: ${createRes.status}, Body:`, createRes.body);

    if (!createRes.body.habit) {
        console.error("Failed to create habit.");
        return;
    }
    const habitId = createRes.body.habit.id;

    // 4. List Habits
    console.log("\n4. List Habits");
    const listRes = await request({
        hostname: 'localhost', port: 3000, path: '/habits', method: 'GET',
        headers: authHeaders
    });
    console.log(`Status: ${listRes.status}, Body:`, JSON.stringify(listRes.body, null, 2));

    // 5. Check Status (Before Complete)
    const today = new Date().toISOString().split('T')[0];
    console.log(`\n5. Check Status for ${today} (Before Complete)`);
    const statusBeforeRes = await request({
        hostname: 'localhost', port: 3000, path: `/habits/${habitId}/status?date=${today}`, method: 'GET',
        headers: authHeaders
    });
    console.log(`Status: ${statusBeforeRes.status}, Body:`, statusBeforeRes.body);

    // 6. Complete Habit
    console.log("\n6. Complete Habit");
    const completeRes = await request({
        hostname: 'localhost', port: 3000, path: `/habits/${habitId}/complete`, method: 'POST',
        headers: authHeaders
    });
    console.log(`Status: ${completeRes.status}, Body:`, completeRes.body);

    // 7. Check Status (After Complete)
    console.log(`\n7. Check Status for ${today} (After Complete)`);
    const statusAfterRes = await request({
        hostname: 'localhost', port: 3000, path: `/habits/${habitId}/status?date=${today}`, method: 'GET',
        headers: authHeaders
    });
    console.log(`Status: ${statusAfterRes.status}, Body:`, statusAfterRes.body);
}

runTests().catch(console.error);
